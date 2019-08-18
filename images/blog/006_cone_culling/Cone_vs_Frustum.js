let spotlightAngle, debugViewCheckbox;
let lightPos_s, isStationary;

function setup() {
  canvasWidth = 800;
  canvasHeight = 450;

  spotlightAngle = 0;
  canvas = createCanvas(canvasWidth, canvasHeight);
  debugViewCheckbox = createCheckbox('Debug View', false);
  spotlightAngleSlider = createSlider(0, 160, 60);
  spotlightRangeSlider = createSlider(10, 300, 120);
  zClustersSlider = createSlider(2, 30, 12);

  freeLightButton = createButton('Free light');
  freeLightButton.mousePressed(freeLight);

  gridOrigin = createVector(canvasWidth / 3, canvasHeight / 2);
  lightPos_s = createVector(gridOrigin.x + 220, gridOrigin.y);

  isLightFree = false;
}

function PointBehindPlane(plane, planeOffset, point) {
  return plane.dot(point) - planeOffset < 0;
}

function ConeBehindPlane(plane, planeOffset, coneOrigin, coneRange, coneAngle, coneRotation) {
  let a = PointBehindPlane(plane, planeOffset, coneOrigin);

  let yTemp = coneRange * tan(coneAngle);
  let p1 = createVector(coneRange, yTemp);
  p1.rotate(coneRotation);
  let p2 = createVector(coneRange, -yTemp);
  p2.rotate(coneRotation);

  let newPoint = createVector(coneOrigin.x + p2.x, coneOrigin.y + p2.y);
  let b = PointBehindPlane(plane, planeOffset, newPoint);
  newPoint = createVector(coneOrigin.x + p1.x, coneOrigin.y + p1.y);
  let c = PointBehindPlane(plane, planeOffset, newPoint);
  return a && b && c;
}

function TestConeFrustum(leftPlane, rightPlane, minZ, maxZ, coneOrigin, coneDirection, coneAngle, coneRange, coneRotation) {
  let leftPlaneNormal = createVector(-leftPlane.y, leftPlane.x);
  let rightPlaneNormal = createVector(rightPlane.y, -rightPlane.x);

  let r = !(ConeBehindPlane(createVector(1, 0), minZ, coneOrigin, coneRange, coneAngle, coneRotation) || ConeBehindPlane(createVector(-1, 0), -maxZ, coneOrigin, coneRange, coneAngle, coneRotation) || ConeBehindPlane(leftPlaneNormal, 0, coneOrigin, coneRange, coneAngle, coneRotation) || ConeBehindPlane(rightPlaneNormal, 0, coneOrigin, coneRange, coneAngle, coneRotation));

  return r;
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
  let fov = 50 * Math.PI / 180 / 2;
  let angle = spotlightAngleSlider.value() * Math.PI / 180 / 2;
  let range = spotlightRangeSlider.value();

  let spotLightDirection = createVector(cos(spotlightAngle), sin(spotlightAngle));

  let clustersZ = zClustersSlider.value();
  let clustersY = 10;
  let nearPlane = 60;
  let farPlane = 450;

  background(250, 250, 250);

  //Grid
  stroke(240);
  strokeWeight(1);
  let gridSize = 4;
  for (let x = 0; x < canvasWidth / gridSize; x += gridSize) {
    for (let y = 0; y < canvasHeight / gridSize; y += gridSize) {
      line(x * gridSize, 0, x * gridSize, canvasHeight);
      line(0, y * gridSize, canvasWidth, y * gridSize);
    }
  }

  //Origin
  if (isLightFree) {
    lightPos_s = createVector(mouseX, mouseY);
  }
  let lightPos = p5.Vector.sub(lightPos_s, gridOrigin);

  noFill(0);
  stroke(0);
  strokeWeight(1);

  //Draw cluster grid
  for (let c = 0; c <= clustersZ; ++c) {
    let x = nearPlane * Math.pow(farPlane / nearPlane, c / clustersZ);
    let y = x * tan(fov);
    line(gridOrigin.x + x, gridOrigin.y - y, gridOrigin.x + x, gridOrigin.y + y);
  }
  for (let a = 0; a <= clustersY; ++a) {
    let t = a / clustersY;
    let an = -fov / 2 + t * fov;
    let y = farPlane * tan(2 * an);
    line(gridOrigin.x, gridOrigin.y, gridOrigin.x + farPlane, gridOrigin.y + y);
  }

  //Get cluster points to generate AABBs and do intersection tests
  if (!(mouseX < gridOrigin.x && mouseY < 300) || !isLightFree) {
    fill(200, 200, 0, 80);
    rectMode(CENTER);
    stroke(0);
    strokeWeight(1);

    for (let z = 0; z < clustersZ; ++z) {
      let minZ = nearPlane * Math.pow(farPlane / nearPlane, z / clustersZ);
      let maxZ = nearPlane * Math.pow(farPlane / nearPlane, (z + 1) / clustersZ);

      for (let y = 0; y < clustersY; ++y) {
        let yPos = minZ * tan(2 * (-fov / 2 + (y / clustersY) * fov));
        let yPosNext = minZ * tan(2 * (-fov / 2 + ((y + 1) / clustersY) * fov));
        let yPosNextZ = maxZ * tan(2 * (-fov / 2 + (y / clustersY) * fov));
        let yPosNextZNext = maxZ * tan(2 * (-fov / 2 + ((y + 1) / clustersY) * fov));
        let minY = yPos < yPosNextZ ? yPos : yPosNextZ;
        let maxY = yPosNext > yPosNextZNext ? yPosNext : yPosNextZNext;

        let center = createVector((minZ + maxZ) / 2, (minY + maxY) / 2);
        let extents = createVector(maxZ - center.x, maxY - center.y);

        let leftPlane = createVector(minZ, yPos).normalize();
        let rightPlane = createVector(minZ, yPosNext).normalize();

        let isCulled = TestConeFrustum(leftPlane, rightPlane, minZ, maxZ, createVector(lightPos.x, lightPos.y), spotLightDirection, angle, range, spotlightAngle);

        if (isCulled && debugViewCheckbox.checked() == true) {
          stroke(255, 0, 0, 255);
        }

        //Fill cluster if culled
        if (isCulled) {
          fill(0, 0, 0, 100);
          beginShape();
          vertex(gridOrigin.x + minZ, gridOrigin.y + yPos);
          vertex(gridOrigin.x + minZ, gridOrigin.y + yPosNext);
          vertex(gridOrigin.x + maxZ, gridOrigin.y + yPosNextZNext);
          vertex(gridOrigin.x + maxZ, gridOrigin.y + yPosNextZ);
          endShape(CLOSE);
          noFill(0);
        }
      }
    }

    //Draw spotlight
    let yTemp = range * tan(angle);
    let p1 = createVector(range, yTemp);
    p1.rotate(spotlightAngle);
    let p2 = createVector(range, -yTemp);
    p2.rotate(spotlightAngle);

    fill(255, 255, 0, 100);
    stroke(200, 200, 0, 100);
    strokeWeight(3);
    line(lightPos_s.x, lightPos_s.y, lightPos_s.x + p1.x, lightPos_s.y + p1.y);
    line(lightPos_s.x, lightPos_s.y, lightPos_s.x + p2.x, lightPos_s.y + p2.y);
    line(lightPos_s.x + p1.x, lightPos_s.y + p1.y, lightPos_s.x + p2.x, lightPos_s.y + p2.y);

    beginShape();
    vertex(lightPos_s.x, lightPos_s.y);
    vertex(lightPos_s.x + p1.x, lightPos_s.y + p1.y);
    vertex(lightPos_s.x + p2.x, lightPos_s.y + p2.y);
    endShape(CLOSE);
  }

  //Draw text and controls
  noStroke();
  fill(0);
  textSize(18);
  text('Method: Cone vs Frustum', spotlightRangeSlider.x, 30);
  textSize(16);

  spotlightAngleSlider.position(20, 50);
  text('Spotlight Angle: ' + spotlightAngleSlider.value(), spotlightAngleSlider.x * 2 + spotlightAngleSlider.width, 65);
  spotlightRangeSlider.position(20, 80);
  text('Spotlight Range: ' + zClustersSlider.value(), zClustersSlider.x * 2 + zClustersSlider.width, 95);
  zClustersSlider.position(20, 110);
  text('Cluster Slices: ' + spotlightRangeSlider.value(), spotlightRangeSlider.x * 2 + spotlightRangeSlider.width, 125);
  if (isLightFree) {
    freeLightButton.hide();
    text('Click anywhere to lock light in place', 20, 160);
  } else {
    freeLightButton.show();
  }
  freeLightButton.position(20, 150);
  debugViewCheckbox.position(20, 180);
  text('Mouse wheel to rotate light', 20, 230);
}

function mouseWheel(event) {
  spotlightAngle += event.delta;
  //uncomment to block page scrolling
  return false;
}

function mouseClicked() {
  if (!(mouseX < 250 && mouseY < 300)) {
    isLightFree = false;
  }
}

function freeLight() {
  isLightFree = true;
}