import {areaFromCartesian3ArrayMeters} from "./AreaCalculator.js";
import {showMessage} from "./ui.js"

const coords = [
    5.787759928698073, 53.197831145908000,
    5.789123554275904, 53.197639959578440,
    5.788934967759822, 53.196023531984740,
    5.776937964005922, 53.194528716741345,
    5.774587885853288, 53.196901277127026,
    5.774703939093954, 53.197622578976200,
    5.786410809746187, 53.197040324210970,
];

const allowedAreaLonLat = [];
for (let i = 0; i < coords.length; i += 2) {
    allowedAreaLonLat.push({x: coords[i], y: coords[i + 1]});
}

function isInsideAllowedArea(cartesian) {
    if (!Cesium.defined(cartesian)) return false;

    const carto = Cesium.Cartographic.fromCartesian(cartesian); // [web:240][web:253]
    const x = Cesium.Math.toDegrees(carto.longitude);
    const y = Cesium.Math.toDegrees(carto.latitude);

    let inside = false;
    for (let i = 0, j = allowedAreaLonLat.length - 1; i < allowedAreaLonLat.length; j = i++) {
        const xi = allowedAreaLonLat[i].x, yi = allowedAreaLonLat[i].y;
        const xj = allowedAreaLonLat[j].x, yj = allowedAreaLonLat[j].y;

        const intersect =
            (yi > y) !== (yj > y) &&
            x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }
    return inside;
}


export class PolygonDrawer {
    constructor(viewer) {
        this.viewer = viewer;
        this.drawingMode = "polygon";
        this.selectedSoortCode = null;     // welke soort is gekozen
        this.selectedColorCss = '#2f3f36'; // default kleur (tijdelijk)
        this.selectedSoortId = null;
        this.activeShapePoints = [];
        this.activeShape = undefined;
        this.floatingPoint = undefined;
        this.gridSize = 1.1;
        this.pointEntities = [];
        this.setupInputActions();
    }

    // Hier wordt de kleur op basis van een stabiele soort-code gekozen (verandert niet als DB-naam wijzigt)
    setSoortCode(soortCode) {
        this.selectedSoortCode = soortCode; // Kan wel weg, maar is handig voor debug

        // Map van stabiele codes -> kleur (CSS hex)
        const kleurMapCode = {
            VRIJSTAANDE_WONING: '#005C97',
            APPARTEMENT: '#e53935',
            RIJTJESWONING: '#ffb347',
            BEDRIJFSGEBOUW: '#205961',
            PARK_GROEN: '#00906b',
            WEGEN: '#6c757d',
            PARKEERPLAATSEN: '#adb5bd',
            OVERDEKTE_PARKEERPLAATSEN: '#343a40'
        };

        // Fallback kleur als code onbekend is
        this.selectedColorCss = kleurMapCode[soortCode] ?? '#2f3f36';
    }

    setSoortId(id) {
        this.selectedSoortId = id;
    }


    createPoint(worldPosition) {
        const point = this.viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.BLACK,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
        // point wordt toegevoegd aan array
        this.pointEntities.push(point)
        return point;
    }

    drawShape(positionData) {
        var shape;
        if (this.drawingMode === "line") {
            shape = this.viewer.entities.add({
                polyline: {
                    positions: positionData,
                    clampToGround: true,
                    width: 3,
                },
            });
        } else if (this.drawingMode === "polygon") {
            shape = this.viewer.entities.add({
                polygon: {
                    hierarchy: positionData,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString(this.selectedColorCss)
                    ),
                },
            });
        }
        return shape;
    }

    snapToGrid(position) {
        var snappedX = Math.round(position.x / this.gridSize) * this.gridSize;
        var snappedZ = Math.round(position.z / this.gridSize) * this.gridSize;
        return new Cesium.Cartesian3(snappedX, position.y, snappedZ);
    }

    handleMouseClick(event) {
        var mousePosition = new Cesium.Cartesian2(event.clientX, event.clientY);
        var hitPosition = this.viewer.scene.pickPosition(mousePosition);

        if (hitPosition) {
            var snappedPosition = this.snapToGrid(hitPosition);

            this.createBoxXYZ(snappedPosition, 1, 1, 1, 0, Cesium.Color.RED);
        }
    }

    createBoxXYZ(position, width, depth, height, rotation, color) {
        return this.viewer.entities.add({
            name: "Box_grid",
            position: position,
            box: {
                dimensions: new Cesium.Cartesian3(width, depth, height),
                material: color,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
    }

    setupInputActions() {
        var that = this;

        that.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
        );

        var handler = new Cesium.ScreenSpaceEventHandler(that.viewer.canvas);

        handler.setInputAction(function (event) {
            var ray = that.viewer.camera.getPickRay(event.position);
            var earthPosition = that.viewer.scene.globe.pick(ray, that.viewer.scene);
            if (Cesium.defined(earthPosition)) {
                if (!isInsideAllowedArea(earthPosition)) {
                    console.log("Klik buiten Spoordok, punt genegeerd");
                    showMessage("Je kunt alleen binnen Spoordok tekenen");
                    return;
                }

                // Alleen blokkeren bij het beginnen van een nieuwe polygon
                if (that.activeShapePoints.length === 0 && !that.selectedSoortId) {
                    showMessage("Kies eerst een soort (klik op een icoontje).");
                    return;
                }

                if (that.activeShapePoints.length === 0) {
                    that.floatingPoint = that.createPoint(earthPosition);
                    that.activeShapePoints.push(earthPosition);
                    var dynamicPositions = new Cesium.CallbackProperty(function () {
                        if (that.drawingMode === "polygon") {
                            return new Cesium.PolygonHierarchy(that.activeShapePoints);
                        }
                        return that.activeShapePoints;
                    }, false);
                    that.activeShape = that.drawShape(dynamicPositions);
                }
                that.activeShapePoints.push(earthPosition);
                that.createPoint(earthPosition);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // CTRL + LEFT_CLICK → Polygon extrude-hoogte functie, skip "Spoordok"
        handler.setInputAction(function (event) {
            var pickedObject = that.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = that.viewer.entities.getById(pickedObject.id.id);
                // Skip als het de "Spoordok" polygon is
                if (entity && entity.name !== "Spoordok") {
                    that.create3DObject(entity, 10);

                    // HOOGTE OPSLAAN
                    const nieuweHoogte =
                        Math.round(entity.polygon.extrudedHeight.getValue());
                    if (entity.polygonId) {
                        fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({hoogte: nieuweHoogte})
                        });
                    }
                    console.log("Hoogte opgeslagen:", nieuweHoogte);
                } else if (entity && entity.name === "Spoordok") {
                    console.log("Kan 'Spoordok' niet verhogen");
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);

        // CTRL + Right _CLICK → Polygon extrude-hoogte functie, skip "Spoordok"
        handler.setInputAction(function (event) {
            var pickedObject = that.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = that.viewer.entities.getById(pickedObject.id.id);
                // Skip als het de "Spoordok" polygon is
                if (entity && entity.name !== "Spoordok") {
                    that.create3DObject(entity, -10);

                    // HOOGTE OPSLAAN
                    const nieuweHoogte = Math.max(
                        0,
                        Math.round(entity.polygon.extrudedHeight.getValue(that.viewer.clock.currentTime))
                    );
                    if (entity.polygonId) {
                        fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({hoogte: nieuweHoogte})
                        });
                    }
                    console.log("Hoogte opgeslagen:", nieuweHoogte);
                } else if (entity && entity.name === "Spoordok") {
                    console.log("Kan 'Spoordok' niet verlagen");
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK, Cesium.KeyboardEventModifier.CTRL);

        handler.setInputAction(function (event) {
            if (Cesium.defined(that.floatingPoint)) {
                var ray = that.viewer.camera.getPickRay(event.endPosition);
                var newPosition = that.viewer.scene.globe.pick(ray, that.viewer.scene);
                if (Cesium.defined(newPosition)) {
                    that.floatingPoint.position.setValue(newPosition);
                    that.activeShapePoints.pop();
                    that.activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(function (event) {
            // 1) Eerst: genoeg punten?
            if (that.activeShapePoints.length < 3) {
                showMessage("Teken minimaal 3 punten voor een polygon.");
                return;
            }

            // 2) Daarna: soort gekozen?
            if (!that.selectedSoortId) {
                showMessage("Kies eerst een soort voordat je opslaat.");
                return;
            }

            // 3) Daarna pas afronden + opslaan
            that.activeShapePoints.pop();
            const finalPolygonEntity = that.drawShape(that.activeShapePoints)
            sendPolygonToBackend(that.activeShapePoints, finalPolygonEntity, that.selectedSoortId);
            that.viewer.entities.remove(that.floatingPoint);
            that.viewer.entities.remove(that.activeShape);
            that.floatingPoint = undefined;
            that.activeShape = undefined;
            that.activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ALT + LEFT_CLICK → Polygon delete function, skip "Spoordok"
        handler.setInputAction(function (event) {
            var pickedObject = that.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = that.viewer.entities.getById(pickedObject.id.id);
                if (entity) {
                    // Skip als het de "Spoordok" polygon is
                    if (entity.name !== "Spoordok") {
                        that.viewer.entities.remove(entity);
                        console.log("Entity removed:", entity);
                        // bijbehorende polygoonpunten werwijderen
                        if (that.pointEntities && that.pointEntities.length > 0) {
                            that.pointEntities.forEach(p => that.viewer.entities.remove(p));
                            that.pointEntities = [];
                        }
                        if (entity.polygonId) {
                            fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                                method: 'DELETE'
                            });
                        }
                        that.activeShapePoints = [];
                    } else {
                        console.log("Kan 'Spoordok' niet verwijderen");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.ALT);

    }

    create3DObject(basePolygon, delta) {
        const current = Number(basePolygon.polygon.extrudedHeight?.getValue(this.viewer.clock.currentTime)) || 0;
        const next = Math.min(300, Math.max(0, current + delta)); // 0..300 clamp
        basePolygon.polygon.extrudedHeight = new Cesium.ConstantProperty(next);
    }


    deleteLastPolygon() {
        if (this.activeShape) {
            this.viewer.entities.remove(this.activeShape);
            this.activeShape = undefined;
        }
        if (this.floatingPoint) {
            this.viewer.entities.remove(this.floatingPoint);
            this.floatingPoint = undefined;
        }
        this.activeShapePoints = [];
    }
}

function sendPolygonToBackend(points, cesiumEntity, soortId) {
    // Cesium Cartesian3 → simpel object {x, y, z}.
    // map: een array methode die elke element in de array langs gaat
    // en daarvan een nieuwe object maakt, dit hij opslaat in een nieuwe array.
    const simplePoints = points.map(p => ({x: p.x, y: p.y, z: p.z}));
    // Maakt JSON-string van de objecten in de nieuwe array
    const pointsJsonString = JSON.stringify(simplePoints);

    let areaM2 = 0;
    if (points && points.length >= 3) {
        areaM2 = areaFromCartesian3ArrayMeters(points);
    }

    const hoogte = cesiumEntity.polygon.extrudedHeight
        ? cesiumEntity.polygon.extrudedHeight.getValue()
        : 0;

    fetch('http://localhost:8080/polygons', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        // Hier wordt zo’n JSON‑object gemaakt, dat door DTO wordt verwacht { "pointsJson": "..." }.
        body: JSON.stringify({
            pointsJson: pointsJsonString,
            oppervlakte: `${areaM2.toFixed(0)} m²`,
            hoogte: hoogte,
            soortId: soortId
        })
    })
        .then(response => response.json())
        .then(savedPolygon => {
            cesiumEntity.polygonId = savedPolygon.id;
        });
}