import { initializeCesiumViewer } from './cesiumSettings.js';
import { PolygonDrawer } from './createPolygon.js';
import { areaFromDegreesArrayMeters } from './AreaCalculator.js';

window.onload = setup;

let viewer;
let polygonDrawer;

function setup() {
    viewer = initializeCesiumViewer("cesiumContainer");
    polygonDrawer = new PolygonDrawer(viewer);

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
}
