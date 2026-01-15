import { initializeCesiumViewer } from './cesiumSettings.js';
import { PolygonDrawer } from './createPolygon.js';
import { areaFromDegreesArrayMeters } from './AreaCalculator.js';
import { setupPolygonInfoHandler } from './inspectPolygon.js';
import { colorForSoortCode } from './soorten.js';
import {
    initDoelenModal,
    initModalEdit,
    populateConfigs,
    populateDoelen
} from './configuration.js';
import { setupLLMAnalyzer } from './LLM.js';

window.onload = setup;

// Globale state (wordt gezet tijdens setup)
let viewer;
let polygonDrawer;

// code -> soortId map (komt uit GET /soorten)
let soortenByCode = {};

// Geselecteerde soort (wordt gezet door klikken op een icoontje)
let selectedSoortId = null;   // FK-id die naar de backend gestuurd wordt
let selectedSoortCode = null; // stabiele code (handig voor debug / uitbreidingen)

export async function loadSpoordokStats() {
    console.log("loadSpoordokStats() gestart");
    try {
        const res = await fetch("http://localhost:8080/polygons/stats");
        console.log("GET /polygons/stats status:", res.status);
        if (!res.ok) {
            console.error("Stats endpoint faalt:", res.status);
            return;
        }
        const stats = await res.json();
        console.log("stats data:", stats);

        const statsTextEl = document.getElementById("stats-text");
        const areaInfoEl = document.getElementById("areaInfo");

        if (areaInfoEl && typeof stats.oppervlakteSpoordok !== "undefined") {
            areaInfoEl.innerText = `Oppervlakte: ${stats.oppervlakteSpoordok} m²`;
        }

        if (statsTextEl) {
            const correctAantalMensen = (stats.aantalMensen ?? 0) / 1000;

            statsTextEl.innerHTML = `
                Totale kosten: € ${stats.totaleKosten.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}<br>
                Totale opbrengst: € ${stats.totaleOpbrengst.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}<br>
                Verwacht aantal bewoners/medewerkers: ${correctAantalMensen.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}<br>
                Leefbaarheid (gemiddeld 1-10): ${stats.leefbaarheidPunten.toLocaleString('nl-NL', { maximumFractionDigits: 2 })}
            `;
        }
    } catch (e) {
        console.error("Error bij laden Spoordok stats", e);
    }
}

async function setup() {
    // -----------------------------
    // 1) UI: configuratie pagina
    // -----------------------------
    populateConfigs();
    initModalEdit();
    populateDoelen();
    initDoelenModal();

    // -----------------------------
    // 2) Helpers: soorten laden + buttons koppelen
    // -----------------------------
    async function loadSoorten() {
        // Haal soorten op uit de backend. Deze endpoint komt uit SoortController: @RequestMapping("/soorten") + @GetMapping
        const res = await fetch("http://localhost:8080/soorten");
        const soorten = await res.json(); // JSON -> JS object
        // Maak een snelle lookup table: { "APPARTEMENT": 3, "WEGEN": 6, ... }
        soortenByCode = Object.fromEntries(soorten.map(s => [s.code, s.soortId]));
    }

    function setupSoortButtons() {
        // Koppel click-events aan alle icoontjes met class ".soort-btn"
        document.querySelectorAll(".soort-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                // 1) Lees de stabiele code uit de HTML (data-soort-code="APPARTEMENT" etc.)
                const soortCode = btn.dataset.soortCode;

                // 2) Vertaal code -> soortId (soortId komt uit database via loadSoorten())
                const soortId = soortenByCode[soortCode];

                // 3) Als dit faalt: HTML code mismatch of /soorten nog niet goed geladen
                if (soortId == null) {
                    console.warn("Onbekende soortCode of soortId ontbreekt:", soortCode, soortenByCode);
                    return;
                }

                // 4) Bewaar de keuze + geef door aan PolygonDrawer
                selectedSoortCode = soortCode;
                selectedSoortId = soortId;

                polygonDrawer.setSoortId(soortId);     // voor opslaan (FK)
                polygonDrawer.setSoortCode(soortCode); // voor kleur
            });
        });
    }

    // -----------------------------
    // 3) Cesium init + PolygonDrawer
    // -----------------------------
    viewer = initializeCesiumViewer("cesiumContainer");
    window.viewer = viewer; // handig om te debuggen in devtools

    polygonDrawer = new PolygonDrawer(viewer);
    setupPolygonInfoHandler(viewer);

    // Belangrijk: eerst soorten laden (map vullen), daarna pas buttons gebruiken
    await loadSoorten();
    setupSoortButtons();

    // -----------------------------
    // 4) Extra tools
    // -----------------------------
    setupLLMAnalyzer(1);

    // -----------------------------
    // 5) Bestaande polygons inladen en tekenen
    // -----------------------------
    fetch('http://localhost:8080/polygons')
        .then(r => r.json())
        .then(polygons => {
            polygons.forEach(p => {
                const points = JSON.parse(p.pointsJson);
                const positions = points.map(pt => new Cesium.Cartesian3(pt.x, pt.y, pt.z));

                const oppNumber = parseFloat(p.oppervlakte);

                const soortCode = p.soort?.code;
                const hex = colorForSoortCode(soortCode);

                const entity = viewer.entities.add({
                    polygon: {
                        hierarchy: positions,
                        // Default kleur bij laden
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.fromCssColorString(hex)
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

    // -----------------------------
    // 6) Spoordok boundary polygon + oppervlakte tonen
    // -----------------------------
    const coords = [
        5.787759928698073, 53.197831145908000,
        5.789123554275904, 53.197639959578440,
        5.788934967759822, 53.196023531984740,
        5.776937964005922, 53.194528716741345,
        5.774587885853288, 53.196901277127026,
        5.774703939093954, 53.197622578976200,
        5.786410809746187, 53.197040324210970,
    ];

    viewer.entities.add({
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

    // -----------------------------
    // 7) Statistieken Spoordok (alle polygonen)
    // -----------------------------
    await loadSpoordokStats();
}
