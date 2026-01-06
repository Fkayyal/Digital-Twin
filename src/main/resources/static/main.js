import { initializeCesiumViewer } from './cesiumSettings.js';
import { PolygonDrawer } from './createPolygon.js';
import { areaFromDegreesArrayMeters } from './AreaCalculator.js';
import { setupPolygonInfoHandler } from './inspectPolygon.js';
import { populateConfigs, initModalEdit, populateDoelen, initDoelenModal } from './configuration.js';

window.onload = setup;

let viewer;
let polygonDrawer;

async function setup() {

    //Configuration page
    populateConfigs();
    initModalEdit();

    populateDoelen();
    initDoelenModal();


    viewer = initializeCesiumViewer("cesiumContainer");
    polygonDrawer = new PolygonDrawer(viewer);
    setupPolygonInfoHandler(viewer);

    fetch('http://localhost:8080/polygons')
        .then(r => r.json())
        .then(polygons => {
            polygons.forEach(p => {
                const points = JSON.parse(p.pointsJson);
                const positions = points.map(pt =>
                    new Cesium.Cartesian3(pt.x, pt.y, pt.z)
                );
                const oppNumber = parseFloat(p.oppervlakte);
                const entity = viewer.entities.add({
                    polygon: {
                        hierarchy: positions,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.fromCssColorString('#2f3f36')
                        ),
                        extrudedHeight: new Cesium.ConstantProperty(parseFloat(p.hoogte) || 0)
                    },
                    properties: {
                        id: p.id,
                        oppervlakte: new Cesium.ConstantProperty(oppNumber || 0)
                    }
                });
                entity.polygonId = p.id;
            });
        });

    const coords = [
        5.787759928698073, 53.197831145908000,
        5.789123554275904, 53.197639959578440,
        5.788934967759822, 53.196023531984740,
        5.776937964005922, 53.194528716741345,
        5.774587885853288, 53.196901277127026,
        5.774703939093954, 53.197622578976200,
        5.786410809746187, 53.197040324210970,
    ];

    const SpoordokPolygon = viewer.entities.add({
        name: "Spoordok",
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coords),
            material: Cesium.Color.fromCssColorString('#80bd9c')
        },
    });

    const areaM2 = areaFromDegreesArrayMeters(coords);
    const areaInfoEl = document.getElementById("areaInfo");
    if (areaInfoEl) {
        areaInfoEl.textContent = `Oppervlakte Spoordok: ${areaM2.toFixed(0)} m²`;
    }

    const btn = document.getElementById("helpToggle");
    const panel = document.getElementById("helpPanel");
    btn.addEventListener("click", () => {
        panel.classList.toggle("hidden");
    });
}
