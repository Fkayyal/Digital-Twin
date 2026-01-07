export function areaFromDegreesArrayMeters(degreesArray, ellipsoid = Cesium.Ellipsoid.WGS84) {
    if (!degreesArray || degreesArray.length < 6) return 0;

    const cartographics = [];
    for (let i = 0; i < degreesArray.length; i += 2) {
        const lonRad = Cesium.Math.toRadians(degreesArray[i]);
        const latRad = Cesium.Math.toRadians(degreesArray[i + 1]);
        cartographics.push(new Cesium.Cartographic(lonRad, latRad, 0.0));
    }

    let lonSum = 0;
    let latSum = 0;
    cartographics.forEach(c => {
        lonSum += c.longitude;
        latSum += c.latitude;
    });
    const center = new Cesium.Cartographic(
        lonSum / cartographics.length,
        latSum / cartographics.length,
        0.0
    );
    const centerCartesian = ellipsoid.cartographicToCartesian(center);

    const enuToFixed = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian);
    const fixedToEnu = Cesium.Matrix4.inverse(enuToFixed, new Cesium.Matrix4());

    const xyPoints = cartographics.map(c => {
        const p = ellipsoid.cartographicToCartesian(c);
        const local = Cesium.Matrix4.multiplyByPoint(fixedToEnu, p, new Cesium.Cartesian3());
        return {x: local.x, y: local.y};
    });

    let sum = 0;
    for (let i = 0; i < xyPoints.length; i++) {
        const j = (i + 1) % xyPoints.length;
        sum += xyPoints[i].x * xyPoints[j].y - xyPoints[j].x * xyPoints[i].y;
    }
    return Math.abs(sum) * 0.5;
}

export function areaFromCartesian3ArrayMeters(positions, ellipsoid = Cesium.Ellipsoid.WGS84) {
    if (!positions || positions.length < 3) return 0;

    const center = Cesium.Cartesian3.fromElements(
        positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
        positions.reduce((sum, p) => sum + p.y, 0) / positions.length,
        positions.reduce((sum, p) => sum + p.z, 0) / positions.length
    );

    const tangentPlane = new Cesium.EllipsoidTangentPlane(center, ellipsoid);
    const xyPoints = tangentPlane.projectPointsOntoPlane(positions);

    let sum = 0;
    for (let i = 0; i < xyPoints.length; i++) {
        const j = (i + 1) % xyPoints.length;
        sum += xyPoints[i].x * xyPoints[j].y - xyPoints[j].x * xyPoints[i].y;
    }
    return Math.abs(sum) * 0.5;
}

