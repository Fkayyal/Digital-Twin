export function setupPolygonInfoHandler(viewer) {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(function (event) {
        var pickedObject = viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject)) {
            const entity = pickedObject.id;
            if (entity && entity.polygonId) {
                document.getElementById('infoId').textContent = entity.polygonId;

                let oppervlakte = 'Onbekend';
                if (entity.properties && entity.properties.oppervlakte) {
                    const prop = entity.properties.oppervlakte;
                    const value = prop.isConstant ? prop.getValue() : prop.getValue(viewer.clock.currentTime);
                    oppervlakte = value;
                }

                let hoogte = 0;
                if (entity.polygon && entity.polygon.extrudedHeight) {
                    const heightProp = entity.polygon.extrudedHeight;
                    hoogte = heightProp.isConstant ? heightProp.getValue() : heightProp.getValue(viewer.clock.currentTime);
                }

                document.getElementById('infoOppervlakte').textContent = `${oppervlakte || "Onbekend"} m²`;
                document.getElementById('infoHoogte').textContent = `${Math.round(hoogte || 0)} m`;
                document.getElementById('polygonInfo').style.display = 'block';
            }
        } else {
            document.getElementById('polygonInfo').style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.SHIFT);
}
