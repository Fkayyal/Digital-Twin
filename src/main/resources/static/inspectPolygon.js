export function setupPolygonInfoHandler(viewer) {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(function (event) {
        const pickedObject = viewer.scene.pick(event.position);
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

                fetch(`http://localhost:8080/polygons/${entity.polygonId}/stats`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error("Stats per polygon failed: " + res.status);
                        }
                        return res.json();
                    })
                    .then(stats => {
                        const statsEl = document.getElementById('infoStats');
                        if (!statsEl) return;

                        const correctAantalMensen = (stats.aantalMensen ?? 0) / 1000;

                        statsEl.innerHTML =
                            `Kosten: €${stats.totaleKosten.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}<br>` +
                            `Opbrengst: €${stats.totaleOpbrengst.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}<br>` +
                            `Bewoners/medewerkers: ${correctAantalMensen.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`
                    })
                    .catch(err => console.error("Fout bij polygon stats:", err));
            }
        } else {
            document.getElementById('polygonInfo').style.display = 'none';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.SHIFT);
}
