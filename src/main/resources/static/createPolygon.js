import { areaFromCartesian3ArrayMeters } from "./AreaCalculator.js";
import { showMessage } from "./ui.js";
import { colorForSoortCode } from "./soorten.js";

// =====================================================
// Spoordok boundary (lon/lat) → hiermee blokkeren we tekenen buiten het gebied
// =====================================================

const coords = [
    5.787759928698073, 53.197831145908000,
    5.789123554275904, 53.197639959578440,
    5.788934967759822, 53.196023531984740,
    5.776937964005922, 53.194528716741345,
    5.774587885853288, 53.196901277127026,
    5.774703939093954, 53.197622578976200,
    5.786410809746187, 53.197040324210970,
];

// Voorberekenen: array van {x: lon, y: lat} zodat we snel kunnen testen of een punt binnen ligt
const allowedAreaLonLat = [];
for (let i = 0; i < coords.length; i += 2) {
    allowedAreaLonLat.push({ x: coords[i], y: coords[i + 1] });
}

// Point-in-polygon check (ray casting) op lon/lat
function isInsideAllowedArea(cartesian) {
    if (!Cesium.defined(cartesian)) return false;

    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const x = Cesium.Math.toDegrees(carto.longitude);
    const y = Cesium.Math.toDegrees(carto.latitude);

    let inside = false;
    for (let i = 0, j = allowedAreaLonLat.length - 1; i < allowedAreaLonLat.length; j = i++) {
        const xi = allowedAreaLonLat[i].x, yi = allowedAreaLonLat[i].y;
        const xj = allowedAreaLonLat[j].x, yj = allowedAreaLonLat[j].y;

        const intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

// =====================================================
// PolygonDrawer: tekenen + bewerken van polygonen in Cesium
// =====================================================

export class PolygonDrawer {
    constructor(viewer) {
        this.viewer = viewer;

        // Tekenen: nu gebruiken we "polygon", maar het is flexibel gehouden
        this.drawingMode = "polygon";

        // Geselecteerde soort (komt uit main.js via knop-click)
        this.selectedSoortCode = null;     // voor kleur
        this.selectedSoortId = null;       // FK-id voor opslaan
        this.selectedColorCss = "#2f3f36"; // fallback/default kleur

        // Actieve teken-state (zolang gebruiker één polygon aan het tekenen is)
        this.activeShapePoints = [];
        this.activeShape = undefined;     // polygon/polyline entity tijdens tekenen
        this.floatingPoint = undefined;   // punt dat meebeweegt met de muis
        this.pointEntities = [];// vertex puntjes die we tekenen

        // wordt gebruikt voor drag-state
        this.dragEntity = null;
        this.dragStartWorld = null;
        this.dragOriginalPositions = null;

        this.setupInputActions(); // Input handlers (muis/keyboard)


    }

    // -----------------------------
    // Setters (aangeroepen vanuit main.js)
    // -----------------------------

    // Kleur kiezen op basis van stabiele soort-code (naam kan veranderen, code niet)
    setSoortCode(soortCode) {
        this.selectedSoortCode = soortCode; // handig voor debug
        this.selectedColorCss = colorForSoortCode(soortCode); // helper heeft fallback
    }

    setSoortId(id) {
        this.selectedSoortId = id;
    }

    // -----------------------------
    // Helpers voor entities
    // -----------------------------

    createPoint(worldPosition) {
        const point = this.viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.BLACK,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });

        // Bewaren zodat we ze later kunnen opruimen
        this.pointEntities.push(point);
        return point;
    }

    drawShape(positionData) {
        let shape;

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

    // -----------------------------
    // Input actions (tekenen/opslaan/hoogte/verwijderen)
    // -----------------------------

    setupInputActions() {
        const that = this;

        // Default Cesium dubbelklik zoom uitzetten (anders stoort het bij tekenen)
        that.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );

        // Eigen event handler op de canvas (Cesium manier van muis-events) [web:642]
        const handler = new Cesium.ScreenSpaceEventHandler(that.viewer.canvas); // [web:642]

        // LEFT_CLICK: nieuw punt toevoegen / polygon starten
        handler.setInputAction(function (event) {
            // 0) Als we op een bestaande polygon klikken: NIET tekenen
            const picked = that.viewer.scene.pick(event.position);
            if (Cesium.defined(picked)) {
                const ent = picked.id; // <-- direct de entity gebruiken
                if (ent && ent.polygon && ent.name !== "Spoordok") {
                    // Hier kun je eventueel selecteren/highlighten
                    return; // stop hier, dus geen nieuw punt
                }
            }

            // 1) ALT/CTRL/SHIFT? dan zijn andere handlers aan de beurt
            if (event.ctrlKey || event.altKey || event.shiftKey) {
                return;
            }
            const ray = that.viewer.camera.getPickRay(event.position);
            const earthPosition = that.viewer.scene.globe.pick(ray, that.viewer.scene);

            if (!Cesium.defined(earthPosition)) return;

            // 1) Niet buiten Spoordok tekenen
            if (!isInsideAllowedArea(earthPosition)) {
                console.log("Klik buiten Spoordok, punt genegeerd");
                showMessage("Je kunt alleen binnen Spoordok tekenen");
                return;
            }

            // 2) Alleen blokkeren bij het begin van een nieuwe polygon
            if (that.activeShapePoints.length === 0 && !that.selectedSoortId) {
                showMessage("Kies eerst een soort (klik op een icoontje).");
                return;
            }

            // 3) Start tekenen: maak een “floating” punt + een dynamische polygon die meegroeit
            if (that.activeShapePoints.length === 0) {
                that.floatingPoint = that.createPoint(earthPosition);
                that.activeShapePoints.push(earthPosition);

                const dynamicPositions = new Cesium.CallbackProperty(function () {
                    if (that.drawingMode === "polygon") {
                        return new Cesium.PolygonHierarchy(that.activeShapePoints);
                    }
                    return that.activeShapePoints;
                }, false);

                that.activeShape = that.drawShape(dynamicPositions);
            }

            // 4) Voeg nieuw vertex toe
            that.activeShapePoints.push(earthPosition);
            that.createPoint(earthPosition);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // CTRL + LEFT_CLICK: hoogte verhogen (skip Spoordok)
        handler.setInputAction(function (event) {
            const pickedObject = that.viewer.scene.pick(event.position);
            if (!Cesium.defined(pickedObject)) return;

            const entity = that.viewer.entities.getById(pickedObject.id.id);
            if (!entity) return;

            if (entity.name === "Spoordok") {
                console.log("Kan 'Spoordok' niet verhogen");
                return;
            }

            that.create3DObject(entity, 10);

            // Hoogte opslaan als dit een entity is die al een polygonId (DB id) heeft
            const nieuweHoogte = Math.round(entity.polygon.extrudedHeight.getValue());
            if (entity.polygonId) {
                fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hoogte: nieuweHoogte })
                });
            }
            console.log("Hoogte opgeslagen:", nieuweHoogte);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);

        // CTRL + RIGHT_CLICK: hoogte verlagen (skip Spoordok)
        handler.setInputAction(function (event) {
            const pickedObject = that.viewer.scene.pick(event.position);
            if (!Cesium.defined(pickedObject)) return;

            const entity = that.viewer.entities.getById(pickedObject.id.id);
            if (!entity) return;

            if (entity.name === "Spoordok") {
                console.log("Kan 'Spoordok' niet verlagen");
                return;
            }

            that.create3DObject(entity, -10);

            // Hoogte opslaan als dit een entity is die al een polygonId (DB id) heeft
            const nieuweHoogte = Math.max(
                0,
                Math.round(entity.polygon.extrudedHeight.getValue(that.viewer.clock.currentTime))
            );
            if (entity.polygonId) {
                fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hoogte: nieuweHoogte })
                });
            }
            console.log("Hoogte opgeslagen:", nieuweHoogte);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK, Cesium.KeyboardEventModifier.CTRL);

        // MOUSE_MOVE: update het “floating” punt zolang er getekend wordt
        handler.setInputAction(function (event) {
            // A) SLEPEN VAN BESTAANDE POLYGON (ALT + drag)
            if (that.dragEntity && that.dragStartWorld && that.dragOriginalPositions) {
                const ray2 = that.viewer.camera.getPickRay(event.endPosition);
                const currentWorld = that.viewer.scene.globe.pick(ray2, that.viewer.scene);
                if (Cesium.defined(currentWorld)) {
                    const delta = Cesium.Cartesian3.subtract(
                        currentWorld,
                        that.dragStartWorld,
                        new Cesium.Cartesian3()
                    );

                    const moved = that.dragOriginalPositions.map(p =>
                        Cesium.Cartesian3.add(p, delta, new Cesium.Cartesian3())
                    );

                    that.dragEntity.polygon.hierarchy = new Cesium.PolygonHierarchy(moved);
                }
            }

            // B) FLOATING PUNT TIJDENS TEKENEN
            if (!Cesium.defined(that.floatingPoint)) return;

            const ray = that.viewer.camera.getPickRay(event.endPosition);
            const newPosition = that.viewer.scene.globe.pick(ray, that.viewer.scene);
            if (!Cesium.defined(newPosition)) return;

            that.floatingPoint.position.setValue(newPosition);
            that.activeShapePoints.pop();
            that.activeShapePoints.push(newPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // RIGHT_CLICK: polygon afronden + opslaan
        handler.setInputAction(function () {
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
            that.activeShapePoints.pop(); // moving point verwijderen
            const finalPolygonEntity = that.drawShape(that.activeShapePoints);

            sendPolygonToBackend(that.activeShapePoints, finalPolygonEntity, that.selectedSoortId);

            // Opruimen van de tijdelijke entiteiten die alleen voor het tekenen waren
            that.viewer.entities.remove(that.floatingPoint);
            that.viewer.entities.remove(that.activeShape);
            that.floatingPoint = undefined;
            that.activeShape = undefined;
            that.activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ALT + LEFT_CLICK: polygon verwijderen (skip Spoordok)
        handler.setInputAction(function (event) {
            const pickedObject = that.viewer.scene.pick(event.position);
            if (!Cesium.defined(pickedObject)) return;

            const entity = that.viewer.entities.getById(pickedObject.id.id);
            if (!entity) return;

            if (entity.name === "Spoordok") {
                console.log("Kan 'Spoordok' niet verwijderen");
                return;
            }

            that.viewer.entities.remove(entity);
            console.log("Entity removed:", entity);

            // Bijbehorende puntjes verwijderen (huidige implementatie verwijdert alle pointEntities)
            if (that.pointEntities && that.pointEntities.length > 0) {
                that.pointEntities.forEach(p => that.viewer.entities.remove(p));
                that.pointEntities = [];
            }

            // Als het een opgeslagen polygon is: verwijder ook uit de database
            if (entity.polygonId) {
                fetch(`http://localhost:8080/polygons/${entity.polygonId}`, { method: "DELETE" });
            }

            that.activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.ALT);

        // Bestaande polygon slepen
        handler.setInputAction(function (event) {
            const picked = that.viewer.scene.pick(event.position);
            if (!Cesium.defined(picked)) return;

            const entity = picked.id;
            if (!entity || !entity.polygon) return;
            if (entity.name === "Spoordok") return;

            // Nog een keer ALT+RIGHT_CLICK op dezelfde entity = drag uit + opslaan
            if (that.dragEntity === entity) {
                // 1) huidige posities ophalen
                const hierarchy = entity.polygon.hierarchy.getValue();
                const positions = hierarchy.positions || hierarchy;

                const simplePoints = positions.map(p => ({ x: p.x, y: p.y, z: p.z }));
                const body = {
                    pointsJson: JSON.stringify(simplePoints)
                };

                // 2) naar backend sturen (pas endpoint aan jouw API aan)
                if (entity.polygonId) {
                    fetch(`http://localhost:8080/polygons/${entity.polygonId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    });
                }

                // 3) drag-state leegmaken
                that.dragEntity = null;
                that.dragStartWorld = null;
                that.dragOriginalPositions = null;
                return;
            }

            // Nieuwe drag starten
            const ray = that.viewer.camera.getPickRay(event.position);
            const startWorld = that.viewer.scene.globe.pick(ray, that.viewer.scene);
            if (!Cesium.defined(startWorld)) return;

            that.dragEntity = entity;
            that.dragStartWorld = startWorld;

            const hierarchy = entity.polygon.hierarchy.getValue();
            const positions = hierarchy.positions || hierarchy;
            that.dragOriginalPositions = positions.map(
                p => new Cesium.Cartesian3(p.x, p.y, p.z)
            );
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK, Cesium.KeyboardEventModifier.ALT);
    }

    // -----------------------------
    // Helper: hoogte aanpassen (met clamp)
    // -----------------------------

    create3DObject(basePolygon, delta) {
        const current = Number(basePolygon.polygon.extrudedHeight?.getValue(this.viewer.clock.currentTime)) || 0;
        const next = Math.min(300, Math.max(0, current + delta)); // 0..300 clamp
        basePolygon.polygon.extrudedHeight = new Cesium.ConstantProperty(next);
    }
}

// =====================================================
// Backend helper: polygon opslaan
// =====================================================

function sendPolygonToBackend(points, cesiumEntity, soortId) {
    // Cesium Cartesian3 → simpel object {x, y, z} (makkelijk te serializen naar JSON)
    const simplePoints = points.map(p => ({ x: p.x, y: p.y, z: p.z }));
    const pointsJsonString = JSON.stringify(simplePoints);

    // Oppervlakte berekenen
    let areaM2 = 0;
    if (points && points.length >= 3) {
        areaM2 = areaFromCartesian3ArrayMeters(points);
    }

    // Oppervlakte direct op de entity zetten zodat UI dit meteen kan tonen
    const roundedArea = Math.round(areaM2);
    cesiumEntity.properties = cesiumEntity.properties || new Cesium.PropertyBag();
    cesiumEntity.properties.oppervlakte = new Cesium.ConstantProperty(roundedArea);

    // Hoogte uit de entity lezen (als er geen extrudedHeight is, dan 0)
    const hoogte = cesiumEntity.polygon.extrudedHeight
        ? cesiumEntity.polygon.extrudedHeight.getValue()
        : 0;

    // Opslaan via backend (DTO verwacht pointsJson + oppervlakte + hoogte + soortId)
    fetch("http://localhost:8080/polygons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pointsJson: pointsJsonString,
            oppervlakte: `${areaM2.toFixed(0)} m²`,
            hoogte,
            soortId
        })
    })
        .then(response => response.json())
        .then(savedPolygon => {
            // DB id op entity zetten zodat delete/hoogte-updates later naar juiste record gaan
            cesiumEntity.polygonId = savedPolygon.id;
        });
}
