import { initializeCesiumViewer } from './cesiumSettings.js';
import { PolygonDrawer } from './createPolygon.js';
import { areaFromDegreesArrayMeters } from './AreaCalculator.js';
import { setupPolygonInfoHandler } from './inspectPolygon.js';

window.onload = setup;

let viewer;
let polygonDrawer;

function setup() {
    viewer = initializeCesiumViewer("cesiumContainer");
    polygonDrawer = new PolygonDrawer(viewer);
    setupPolygonInfoHandler(viewer);

    fetch('http://localhost:8080/polygons')
        .then(r => r.json())
        .then(polygons => {
            polygons.forEach(p => {
                // 1. pointsJson (String) -> array van {x,y,z}
                const points = JSON.parse(p.pointsJson);

                // 2. array -> Cesium.Cartesian3[]
                const positions = points.map(pt =>
                    new Cesium.Cartesian3(pt.x, pt.y, pt.z)
                );

                // 3. polygon tekenen in Cesium
                const entity = viewer.entities.add({
                    polygon: {
                        hierarchy: positions,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.fromCssColorString('#2f3f36')
                        ),
                        extrudedHeight: new Cesium.ConstantProperty(parseFloat(p.hoogte) || 0),
                        properties: {
                            id: p.id,
                            oppervlakte: new Cesium.ConstantProperty(p.oppervlakte)
                        }
                    }
                });

                // 4. database-id bewaren voor later verwijderen
                entity.polygonId = p.id;
            });
        });

    //Spoordok polygon coordinates
    const coords = [
        5.787759928698073, 53.197831145908000,
        5.789123554275904, 53.197639959578440,
        5.788934967759822, 53.196023531984740,
        5.776937964005922, 53.194528716741345,
        5.774587885853288, 53.196901277127026,
        5.774703939093954, 53.197622578976200,
        5.786410809746187, 53.197040324210970,
    ];

    //Spoordok polygon entity
    const SpoordokPolygon = viewer.entities.add({
        name: "Spoordok",
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coords),
            material: Cesium.Color.fromCssColorString('#80bd9c')
        },
    });

    //Calculate area of polygon
    const areaM2 = areaFromDegreesArrayMeters(coords);

    //Display area of polygon in the browser
    const areaInfoEl = document.getElementById("areaInfo");
    if (areaInfoEl) {
        areaInfoEl.textContent = `Oppervlakte Spoordok: ${areaM2.toFixed(0)} m²`;
    }

    // Dit stuk code maakt de handleiding inklapbaar:
    // bij het klikken op de "?"-knop wordt het help-paneel getoond of verborgen.
    const btn = document.getElementById("helpToggle");
    const panel = document.getElementById("helpPanel");

    btn.addEventListener("click", () => {
        panel.classList.toggle("hidden");
    });

}
