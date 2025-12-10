export function initializeCesiumViewer(containerId) {
    const west = 5.798212900532118;
    const south = 53.19304584690279;
    const east = 5.798212900532118;
    const north = 53.19304584690279;

    var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.0005;
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;

    const osm = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
    });

    const viewer = new Cesium.Viewer(containerId, {
        baseLayerPicker: false,
        imageryProvider: false,  // zal handmatig OSM-layer added worden
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,
    });

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(osm);

    viewer.scene.globe.maximumScreenSpaceError = 1;

    return viewer;
}
