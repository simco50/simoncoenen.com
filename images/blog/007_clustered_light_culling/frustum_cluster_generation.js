function setup() {
    // create canvas
    canvasWidth = 800;
    canvasHeight = 450;

    canvas = createCanvas(canvasWidth, canvasHeight);
    textSize(15);
    noStroke();

    // create sliders
    widthOptions = [128, 360, 480, 720, 1240, 1280, 1366, 1440, 1536, 1600, 1920, 2560, 3860];
    heightOptions = [128, 360, 480, 720, 864, 900, 1024, 1080, 1440, 2160];

    resolutionXSlider = createSlider(0, widthOptions.length - 1, 10);
    resolutionYSlider = createSlider(0, heightOptions.length - 1, 7);
    nearPlaneSlider = createSlider(1, 100, 34);
    farPlaneSlider = createSlider(100, 460, 320);
    fovSlider = createSlider(1, 15, 10);
    clusterSizeSlider = createSlider(1, 10, 6);
    clustersZSlider = createSlider(1, 128, 32);

    methodRadio = createRadio();
    methodRadio.option('Ola Olsson');
    methodRadio.option('Tiago Sousa');
    methodRadio.style('width', '100px');
    methodRadio.position(20, 280);
    methodRadio._getInputChildrenArray()[0].checked = true;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function bytes_to_string(bytes) {
    if (Math.abs(bytes) > 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
    }
    if (Math.abs(bytes) > 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }
    if (Math.abs(bytes) > 1024) {
        return (bytes / 1024).toFixed(2) + " kB";
    }
    return bytes.toFixed(2) + " B";
}

function skipDraw() {
    if (window.parent.innerWidth <= 960)
        return true;
    return false;
}

function draw() {
    if (skipDraw()) {
        return;
    }
    let farPlane = farPlaneSlider.value();
    let nearPlane = nearPlaneSlider.value();
    let fov = fovSlider.value() * Math.PI / 60;
    let clusterSize = Math.pow(2, clusterSizeSlider.value());
    let xResolution = widthOptions[resolutionXSlider.value()];
    let yResolution = heightOptions[resolutionYSlider.value()];
    let method = methodRadio.value();
    let clustersZ = clustersZSlider.value();

    let clustersX = Math.ceil(xResolution / clusterSize);
    let clustersY = Math.ceil(yResolution / clusterSize);

    background(250, 250, 250);

    //Grid
    stroke(240);
    strokeWeight(1);
    for (let x = 0; x < canvasWidth; x += canvasWidth / 50) {
        for (let y = 0; y < canvasHeight; y += canvasHeight / 30) {
            line(x, 0, x, canvasHeight);
            line(0, y, canvasWidth, y);
        }
    }

    //Origin
    startPos = createVector(350, 250);

    noFill(0);
    stroke(0);

    strokeWeight(8);
    line(startPos.x, startPos.y, startPos.x, startPos.y);

    wide = farPlane + 20 * tan(fov);
    wideFar = farPlane * tan(fov);
    wideNear = nearPlane * tan(fov);

    strokeWeight(1);
    line(startPos.x, startPos.y, startPos.x + farPlane, startPos.y + wideFar);
    line(startPos.x, startPos.y, startPos.x + farPlane, startPos.y - wideFar);

    strokeWeight(3);
    line(startPos.x + nearPlane, startPos.y + wideNear * 1.5, startPos.x + nearPlane, startPos.y - wideNear * 1.5);
    line(startPos.x + farPlane, startPos.y + wideFar * 1.2, startPos.x + farPlane, startPos.y - wideFar * 1.2);

    strokeWeight(1);

    let clusterCountZ = 0;

    //Lattitude Lines
    if (method == 'Tiago Sousa') {
        clusterCountZ = clustersZ;
        for (let c = 0; c < clusterCountZ; ++c) {
            let x = nearPlane * Math.pow(farPlane / nearPlane, c / clustersZ);
            let y = x * tan(fov);
            line(startPos.x + x, startPos.y - y, startPos.x + x, startPos.y + y);
        }
    } else {
        let sD = 2.0 * Math.tan(fov) / clustersY;
        let nearK = 1.0 + sD;
        let logDepth = Math.log(farPlane / nearPlane);
        clusterCountZ = Math.floor(logDepth / Math.log(1.0 + sD));
        for (let c = 0; c < clusterCountZ; ++c) {
            let x = nearPlane * Math.pow(Math.abs(nearK), c);
            let y = x * tan(fov);
            line(startPos.x + x, startPos.y - y, startPos.x + x, startPos.y + y);
        }
    }

    //Longitude Lines
    for (let a = 0; a < clustersY; ++a) {
        let t = a / clustersY;
        let an = -fov / 2 + t * fov;
        let y = farPlane * tan(2 * an);
        line(startPos.x, startPos.y, startPos.x + farPlane, startPos.y + y);
    }

    //Grid
    let axisPos = createVector(startPos.x, startPos.y - 150);

    noFill();
    stroke(0, 0, 255)
    line(axisPos.x, axisPos.y + 50, axisPos.x + 50, axisPos.y + 50);
    stroke(0, 255, 0)
    line(axisPos.x, axisPos.y, axisPos.x, axisPos.y + 50);
    noStroke();
    fill(0, 255, 0);
    text('y', axisPos.x - 10, axisPos.y);
    fill(0, 0, 255);
    text('z', axisPos.x + 50, axisPos.y + 40);

    //Controls
    textSize(16);
    noStroke();
    fill(0);

    text('Near', startPos.x + nearPlane - 20, startPos.y - wideNear * 1.4 - 20);
    text('Far', startPos.x + farPlane - 20, startPos.y - wideFar * 1.2 - 10);

    let y = 65;
    text('Resolution X: ' + xResolution, resolutionXSlider.x * 2 + resolutionXSlider.width, y);
    resolutionXSlider.position(20, y - 15);
    y += 30;
    text('Resolution Y: ' + yResolution, resolutionYSlider.x * 2 + resolutionYSlider.width, y);
    resolutionYSlider.position(20, y - 15);
    y += 30;
    text('Near Plane: ' + nearPlane, nearPlaneSlider.x * 2 + nearPlaneSlider.width, y);
    nearPlaneSlider.position(20, y - 15);
    y += 30;
    text('Far Plane: ' + farPlane, farPlaneSlider.x * 2 + farPlaneSlider.width, y);
    farPlaneSlider.position(20, y - 15);
    y += 30;
    text('FoV: ' + (fov * 2 * 57.2958).toFixed(2), fovSlider.x * 2 + fovSlider.width, y);
    fovSlider.position(20, y - 15);
    y += 30;

    text('Cluster Size: ' + clusterSize, clusterSizeSlider.x * 2 + clusterSizeSlider.width, y);
    clusterSizeSlider.position(20, y - 15);
    y += 30;
    text('Clusters Z: ' + clusterCountZ, clustersZSlider.x * 2 + clustersZSlider.width, y);
    clustersZSlider.position(20, y - 15);
    if (method == 'Tiago Sousa') {
        clustersZSlider.show();
    } else {
        clustersZSlider.hide();
    }
    y += 30;
    text('Method', 20, y);

    //Statistics
    let textPosition = createVector(20, 345);
    let textDistance = 230;
    text('Cluster Count: ', textPosition.x, textPosition.y);
    text(clustersX + "x" + clustersY + "x" + clusterCountZ + " (" + formatNumber(clustersX * clustersY * clusterCountZ) + ")", textPosition.x + textDistance, textPosition.y);
}