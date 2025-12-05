// createPolygon.js

export class PolygonDrawer {
    constructor(viewer) {
        this.viewer = viewer;
        this.drawingMode = "polygon";
        this.activeShapePoints = [];
        this.activeShape = undefined;
        this.floatingPoint = undefined;
        this.gridSize = 1.1;
        this.setupInputActions();
    }

    createPoint(worldPosition) {
        const point = this.viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.BLUE,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
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
                        Cesium.Color.RED.withAlpha(0.7),
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

        //  CTRL + LEFT_CLICK → Polygon extrude-hoogte functie
        handler.setInputAction(function (event) {
            var pickedObject = that.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = that.viewer.entities.getById(pickedObject.id.id);
                // entity.polygon.material.color = Cesium.Color.YELLOW;
                that.create3DObject(entity, 10);
                console.log(entity);
                // Optionally, highlight the polygon or show any other UI feedback
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
            that.drawShape(that.activeShapePoints);
            sendPolygonToBackend(that.activeShapePoints, 10);
            that.viewer.entities.remove(that.floatingPoint);
            that.viewer.entities.remove(that.activeShape);
            that.floatingPoint = undefined;
            that.activeShape = undefined;
            that.activeShapePoints = [];
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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

function sendPolygonToBackend(points, height) {
    // points = array van Cartesian3 → omzetten naar simpele x,y,z
    const simplePoints = points.map(p => {
        return { x: p.x, y: p.y, z: p.z };
    });

    const pointsJsonString = JSON.stringify(simplePoints);

    fetch('http://localhost:8080/api/polygons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            height: height,
            pointsJson: pointsJsonString
        })
    });
}
