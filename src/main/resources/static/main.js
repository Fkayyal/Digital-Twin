import {initializeCesiumViewer} from './cesiumSettings.js';
import {PolygonDrawer} from './createPolygon.js';
import {areaFromDegreesArrayMeters} from './AreaCalculator.js';
import {setupPolygonInfoHandler} from './inspectPolygon.js';
import {initDoelenModal, initModalEdit, populateConfigs, populateDoelen} from './configuration.js';
import { setupLLMAnalyzer } from './LLM.js'


window.onload = setup;

let viewer;
let polygonDrawer;

let soortenByCode = {};
let selectedSoortId = null; // de gekozen FK-id
let selectedSoortCode = null;

async function setup() {

    //Configuration page
    populateConfigs();
    initModalEdit();

    populateDoelen();
    initDoelenModal();

    function setupSoortButtons() {
        document.querySelectorAll(".soort-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const soortCode = btn.dataset.soortCode; // 1) Lees de stabiele code uit de HTML (moet exact matchen met data.sql codes)
                const soortId = soortenByCode[soortCode]; // 2) Vertaal code -> soortId (soortId komt uit de database via GET /soorten)

                // 3) Veiligheidscheck: als dit faalt, klopt je HTML code niet of /soorten is niet goed geladen
                if (soortId == null) {
                    console.warn("Onbekende soortCode of soortId ontbreekt:", soortCode, soortenByCode);
                    return;
                }

                // 4) Opslaan (FK) + kleur zetten (beiden op basis van stabiele code)
                selectedSoortId = soortId;
                polygonDrawer.setSoortId(soortId);
                polygonDrawer.setSoortCode(soortCode);
            });
        });
    }

    async function loadSoorten() {
        const res = await fetch("http://localhost:8080/soorten");
        const soorten = await res.json(); // JSON -> JS object
        soortenByCode = Object.fromEntries(soorten.map(s => [s.code, s.soortId])); // array -> object map
    }

    viewer = initializeCesiumViewer("cesiumContainer");
    window.viewer = viewer;


    polygonDrawer = new PolygonDrawer(viewer);
    setupPolygonInfoHandler(viewer);

    await loadSoorten();
    setupSoortButtons();

    //LLM Analyzer
    setupLLMAnalyzer(1);

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
}
