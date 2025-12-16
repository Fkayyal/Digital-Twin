

export class PolygonDrawer {
    constructor(viewer) {
        this.viewer = viewer;
        this.drawingMode = "polygon";
        this.activeShapePoints = [];
        this.activeShape = undefined;
        this.floatingPoint = undefined;
        this.gridSize = 1.1;
        this.pointEntities = [];
        this.setupInputActions();
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
                        Cesium.Color.fromCssColorString('#2f3f36')
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
                    console.log("Hoogte aangepast:", entity.name);
                } else if (entity && entity.name === "Spoordok") {
                    console.log("Kan 'Spoordok' niet verhogen");
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);


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
            that.activeShapePoints.pop();
            const finalPolygonEntity = that.drawShape(that.activeShapePoints)
            sendPolygonToBackend(that.activeShapePoints, finalPolygonEntity);
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
                        if(that.pointEntities && that.pointEntities.length > 0){
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

    create3DObject(basePolygon, height) {
        if (basePolygon.polygon.extrudedHeight == undefined) {
            basePolygon.polygon.extrudedHeight = height;
        }
        basePolygon.polygon.extrudedHeight *= 1.5;
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

function sendPolygonToBackend(points, cesiumEntity) {
    // Cesium Cartesian3 → simpel object {x, y, z}.
    // map: een array methode die elke element in de array langs gaat
    // en daarvan een nieuwe object maakt, dit hij opslaat in een nieuwe array.
    const simplePoints = points.map(p => ({ x: p.x, y: p.y, z: p.z }));
    // Maakt JSON-string van de objecten in de nieuwe array
    const pointsJsonString = JSON.stringify(simplePoints);

    fetch('http://localhost:8080/polygons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Hier wordt zo’n JSON‑object gemaakt, dat door DTO wordt verwacht { "pointsJson": "..." }.
        body: JSON.stringify({
            pointsJson: pointsJsonString
        })
    })
        .then(response => response.json())
        .then(savedPolygon => {
            cesiumEntity.polygonId = savedPolygon.id;
        });
}