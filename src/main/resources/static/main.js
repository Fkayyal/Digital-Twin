import { initializeCesiumViewer } from './cesiumSettings.js';
import { PolygonDrawer } from './createPolygon.js';

window.onload = setup;

let viewer;
let polygonDrawer;

function setup() {
    viewer = initializeCesiumViewer("cesiumContainer");
    polygonDrawer = new PolygonDrawer(viewer);

    const redPolygon = viewer.entities.add({
        name: "Spoordok",
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                5.787759928698073, 53.197831145908,
                5.789123554275904, 53.19763995957844,
                5.788934967759822, 53.19602353198474,
                5.776937964005922, 53.194528716741345,
                5.774587885853288, 53.196901277127026,
                5.774703939093954, 53.1976225789762,
                5.786410809746187, 53.19704032421097,
            ]),
            material: Cesium.Color.LIGHTGRAY,
        },
    });
}