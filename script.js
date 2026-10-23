// --- 1. PROCEDURAL WEIRDCORE BACKGROUND & CRYSTAL ENGINE ---
const canvas = document.getElementById('weirdcoreCanvas');
const ctx = canvas.getContext('2d');

const V_WIDTH = 256;
const V_HEIGHT = 144;
canvas.width = V_WIDTH;
canvas.height = V_HEIGHT;

const imgData = ctx.createImageData(V_WIDTH, V_HEIGHT);
const data = imgData.data;

// Offscreen buffers for crystal silhouette, facets, and top eye layer
const crystalBackingCanvas = document.createElement('canvas');
crystalBackingCanvas.width = V_WIDTH;
crystalBackingCanvas.height = V_HEIGHT;
const crystalBackingCtx = crystalBackingCanvas.getContext('2d');

const crystalFillCanvas = document.createElement('canvas');
crystalFillCanvas.width = V_WIDTH;
crystalFillCanvas.height = V_HEIGHT;
const crystalFillCtx = crystalFillCanvas.getContext('2d');

const eyeCanvas = document.createElement('canvas');
eyeCanvas.width = V_WIDTH;
eyeCanvas.height = V_HEIGHT;
const eyeCtx = eyeCanvas.getContext('2d');

// Palette Buffer [R, G, B]
const cBuffer = [
    18, 10, 28, // 0, 1,  2: Deep Obsidian/Violet Void
    45, 25, 55, // 3, 4,  5: Muted Twilight Purple
    75, 45, 60, // 6, 7,  8: Dusky Bronze/Brown Gradient Core

    // Curve Primary Colors
    255, 95, 150, // 9, 10, 11: Vibrant Neon Pink/Magenta
    80, 200, 255, // 12,13, 14: Electric Cyan
    255, 200, 80, // 15,16, 17: Golden Amber
    160, 90, 255, // 18,19, 20: Surreal Purple-Indigo

    // Grid Line Color
    55, 35, 75 // 21,22, 23: Subtle Diagonal Grid Tone
];

let time = 0;
let crystalFloatY = 0;
let targetFloatY = 0;

// Glitch state management (isolated strictly to crystal & eye)
let glitchTimer = 0;
let isGlitching = false;
let glitchShiftX = 0;

// 60 FPS Accumulator Timestep Loop
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
let lastTime = performance.now();
let accumulator = 0;

function updateSimulation() {
    time += 0.02;

    // Smooth floating LERP easing for bobbing float height
    targetFloatY = Math.sin(time * 1.5) * 6;
    crystalFloatY += (targetFloatY - crystalFloatY) * 0.1;

    // Isolated glitch trigger
    if (!isGlitching && Math.random() < 0.015) {
        isGlitching = true;
        glitchTimer = Math.floor(2 + Math.random() * 3);
        glitchShiftX = Math.floor((Math.random() - 0.5) * 8);
    }

    if (isGlitching) {
        glitchTimer--;
        if (glitchTimer <= 0) {
            isGlitching = false;
        }
    }
}

// Render Crystal with Solid Black Backing Outline
function drawCrystal(fCtx, bCtx, cx, cy, spinAngle) {
    fCtx.clearRect(0, 0, V_WIDTH, V_HEIGHT);
    bCtx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    const halfWidth = 14;
    const topY = cy - 34;
    const bottomY = cy + 34;
    const midY = cy;

    const top = { x: cx, y: topY };
    const bottom = { x: cx, y: bottomY };
    const outerLeft = { x: cx - halfWidth, y: midY };
    const outerRight = { x: cx + halfWidth, y: midY };

    // 1. Expanded Solid Black Outline Backing Layer
    bCtx.fillStyle = '#000000';
    bCtx.beginPath();
    bCtx.moveTo(top.x, top.y - 1);
    bCtx.lineTo(outerRight.x + 1, outerRight.y);
    bCtx.lineTo(bottom.x, bottom.y + 1);
    bCtx.lineTo(outerLeft.x - 1, outerLeft.y);
    bCtx.closePath();
    bCtx.fill();

    // 2. Clean Pirouette Spinning Facets
    fCtx.save();
    fCtx.beginPath();
    fCtx.moveTo(top.x, top.y);
    fCtx.lineTo(outerRight.x, outerRight.y);
    fCtx.lineTo(bottom.x, bottom.y);
    fCtx.lineTo(outerLeft.x, outerLeft.y);
    fCtx.closePath();
    fCtx.clip();

    const cosA = Math.cos(spinAngle);
    const sinA = Math.sin(spinAngle);

    const ridgeX = cx + sinA * (halfWidth * 0.75);
    const lightL = (cosA + 1) * 0.5;
    const lightR = (-cosA + 1) * 0.5;

    // Left Facet Pair
    const gradLeft = fCtx.createLinearGradient(outerLeft.x, midY, ridgeX, midY);
    gradLeft.addColorStop(0, `rgb(${Math.floor(40 + lightL*50)}, ${Math.floor(20 + lightL*30)}, ${Math.floor(100 + lightL*80)})`);
    gradLeft.addColorStop(1, `rgb(${Math.floor(80 + lightR*90)}, ${Math.floor(180 + lightR*50)}, 255)`);

    fCtx.fillStyle = gradLeft;
    fCtx.beginPath();
    fCtx.moveTo(top.x, top.y);
    fCtx.lineTo(outerLeft.x, outerLeft.y);
    fCtx.lineTo(ridgeX, midY);
    fCtx.closePath();
    fCtx.fill();

    const gradBotLeft = fCtx.createLinearGradient(outerLeft.x, midY, ridgeX, midY);
    gradBotLeft.addColorStop(0, `rgb(${Math.floor(120 + lightL*70)}, ${Math.floor(30 + lightL*20)}, ${Math.floor(150 + lightL*40)})`);
    gradBotLeft.addColorStop(1, `rgb(${Math.floor(30 + lightR*40)}, ${Math.floor(10 + lightR*10)}, ${Math.floor(80 + lightR*30)})`);

    fCtx.fillStyle = gradBotLeft;
    fCtx.beginPath();
    fCtx.moveTo(outerLeft.x, outerLeft.y);
    fCtx.lineTo(bottom.x, bottom.y);
    fCtx.lineTo(ridgeX, midY);
    fCtx.closePath();
    fCtx.fill();

    // Right Facet Pair
    const gradRight = fCtx.createLinearGradient(ridgeX, midY, outerRight.x, midY);
    gradRight.addColorStop(0, `rgb(${Math.floor(160 + lightR*90)}, ${Math.floor(70 + lightR*70)}, 220)`);
    gradRight.addColorStop(1, `rgb(${Math.floor(50 + lightL*40)}, ${Math.floor(150 + lightL*60)}, 200)`);

    fCtx.fillStyle = gradRight;
    fCtx.beginPath();
    fCtx.moveTo(top.x, top.y);
    fCtx.lineTo(outerRight.x, outerRight.y);
    fCtx.lineTo(ridgeX, midY);
    fCtx.closePath();
    fCtx.fill();

    const gradBotRight = fCtx.createLinearGradient(ridgeX, midY, outerRight.x, midY);
    gradBotRight.addColorStop(0, `rgb(${Math.floor(180 + lightR*65)}, ${Math.floor(30 + lightR*30)}, 140)`);
    gradBotRight.addColorStop(1, `rgb(${Math.floor(90 + lightL*50)}, ${Math.floor(20 + lightL*20)}, 110)`);

    fCtx.fillStyle = gradBotRight;
    fCtx.beginPath();
    fCtx.moveTo(outerRight.x, outerRight.y);
    fCtx.lineTo(bottom.x, bottom.y);
    fCtx.lineTo(ridgeX, midY);
    fCtx.closePath();
    fCtx.fill();

    // Center vertical ridge line
    fCtx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    fCtx.lineWidth = 1;
    fCtx.beginPath();
    fCtx.moveTo(top.x, top.y);
    fCtx.lineTo(ridgeX, midY);
    fCtx.lineTo(bottom.x, bottom.y);
    fCtx.stroke();

    fCtx.restore();
}

// Render Eye Element on Top Layer with Animated RYB Iris Gradient
function drawEye(eCtx, cx, cy) {
    eCtx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    const eyeW = 12;
    const eyeH = 7;
    const irisR = 4.5;
    const pupilR = 2.0;

    // 1. Eye Sclera (White/Off-White Background Clip Area)
    eCtx.save();
    eCtx.beginPath();
    eCtx.moveTo(cx - eyeW, cy);
    eCtx.quadraticCurveTo(cx, cy - eyeH - 1, cx + eyeW, cy);
    eCtx.quadraticCurveTo(cx, cy + eyeH + 1, cx - eyeW, cy);
    eCtx.closePath();

    eCtx.fillStyle = '#e2e8f0';
    eCtx.fill();
    eCtx.clip();

    // 2. Animated RYB Gradient Scroll Iris
    const gradAngle = time * 1.2;
    const gx1 = cx + Math.cos(gradAngle) * irisR;
    const gy1 = cy + Math.sin(gradAngle) * irisR;
    const gx2 = cx - Math.cos(gradAngle) * irisR;
    const gy2 = cy - Math.sin(gradAngle) * irisR;

    const rybGrad = eCtx.createLinearGradient(gx1, gy1, gx2, gy2);
    rybGrad.addColorStop(0.0, '#ff2a5f');
    rybGrad.addColorStop(0.33, '#ffd000');
    rybGrad.addColorStop(0.66, '#00aaff');
    rybGrad.addColorStop(1.0, '#ff2a5f');

    eCtx.fillStyle = rybGrad;
    eCtx.beginPath();
    eCtx.arc(cx, cy, irisR, 0, Math.PI * 2);
    eCtx.fill();

    // 3. Solid Black Pupil
    eCtx.fillStyle = '#111116';
    eCtx.beginPath();
    eCtx.arc(cx, cy, pupilR, 0, Math.PI * 2);
    eCtx.fill();

    // 4. Glossy Catchlight Highlight Dot
    eCtx.fillStyle = '#fce4ec';
    eCtx.beginPath();
    eCtx.arc(cx + 1.8, cy - 0.8, 1.1, 0, Math.PI * 2);
    eCtx.fill();

    eCtx.restore();

    // 5. Eyelid Outline Borders
    eCtx.lineWidth = 1.5;
    eCtx.strokeStyle = '#383b42';

    eCtx.beginPath();
    eCtx.moveTo(cx - eyeW - 0.5, cy);
    eCtx.quadraticCurveTo(cx, cy - eyeH - 1, cx + eyeW + 0.5, cy);
    eCtx.stroke();

    eCtx.lineWidth = 1.0;
    eCtx.strokeStyle = '#718096';
    eCtx.beginPath();
    eCtx.moveTo(cx - eyeW - 0.5, cy);
    eCtx.quadraticCurveTo(cx, cy + eyeH + 1, cx + eyeW + 0.5, cy);
    eCtx.stroke();
}

function renderFrame() {
    // 1. Render Background Field
    for (let y = 0; y < V_HEIGHT; y++) {
        let pctY = y / V_HEIGHT;

        for (let x = 0; x < V_WIDTH; x++) {
            const idx = (y * V_WIDTH + x) * 4;

            let r = cBuffer[0] * (1 - pctY) + cBuffer[3] * pctY;
            let g = cBuffer[1] * (1 - pctY) + cBuffer[4] * pctY;
            let b = cBuffer[2] * (1 - pctY) + cBuffer[5] * pctY;

            let dx = x - V_WIDTH * 0.7;
            let dy = y - V_HEIGHT * 0.8;
            let distToCore = Math.sqrt(dx * dx + dy * dy);
            let coreGlow = Math.max(0, 1 - distToCore / 120);
            r += coreGlow * 35;
            g += coreGlow * 20;
            b += coreGlow * 10;

            let gridX = (x + Math.floor(time * 3)) % 16;
            let gridY = (y + Math.floor(time * 3)) % 16;
            if (gridX === 0 || gridY === 0) {
                r = r * 0.6 + cBuffer[21] * 0.4;
                g = g * 0.6 + cBuffer[22] * 0.4;
                b = b * 0.6 + cBuffer[23] * 0.4;
            }

            for (let i = 0; i < 4; i++) {
                let orbitSpeed = 0.5 + i * 0.3;
                let waveDistort = Math.sin(x * 0.03 + time * orbitSpeed + i) * Math.cos(y * 0.04 - time * 0.4) * 12;
                let targetY = 72 + Math.sin((x + waveDistort) * 0.02 + time * 0.2 + i * 1.5) * 35 + (i * 12 - 18);

                let echoWarp = Math.sin(x * 0.045 - time * (orbitSpeed * 0.7) + i * 2.3) * 16;
                let echoTargetY = 72 + Math.sin((x + echoWarp) * 0.018 + time * 0.15 + i * 1.8) * 38 + (i * 14 - 22);

                let lineDist = Math.abs(y - targetY);
                let echoDist = Math.abs(y - echoTargetY);
                let cIndex = 9 + (i * 3);

                if (echoDist < 1.2) {
                    let echoAlpha = (1 - (echoDist / 1.2)) * 0.18;
                    r = r * (1 - echoAlpha) + cBuffer[cIndex] * echoAlpha;
                    g = g * (1 - echoAlpha) + cBuffer[cIndex + 1] * echoAlpha;
                    b = b * (1 - echoAlpha) + cBuffer[cIndex + 2] * echoAlpha;
                }

                if (lineDist < 1.6) {
                    let intensity = 1 - (lineDist / 1.6);
                    r = r * (1 - intensity) + cBuffer[cIndex] * intensity;
                    g = g * (1 - intensity) + cBuffer[cIndex + 1] * intensity;
                    b = b * (1 - intensity) + cBuffer[cIndex + 2] * intensity;
                } else if (lineDist < 3.2 && lineDist >= 1.6) {
                    let glowIntensity = (1 - ((lineDist - 1.6) / 1.6)) * 0.35;
                    r += cBuffer[cIndex] * glowIntensity * 0.5;
                    g += cBuffer[cIndex + 1] * glowIntensity * 0.5;
                    b += cBuffer[cIndex + 2] * glowIntensity * 0.5;
                }
            }

            const isDitherTile = (x + y) % 2 === 0;
            const ditherOffset = isDitherTile ? 7 : -7;

            let finalR = Math.min(255, Math.max(0, r + ditherOffset));
            let finalG = Math.min(255, Math.max(0, g + ditherOffset));
            let finalB = Math.min(255, Math.max(0, b + ditherOffset));

            data[idx] = Math.round(finalR / 16) * 16;
            data[idx + 1] = Math.round(finalG / 16) * 16;
            data[idx + 2] = Math.round(finalB / 16) * 16;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);

    // 2. Render Crystal & Eye Layers
    const crystalX = V_WIDTH * 0.5;
    const crystalY = V_HEIGHT * 0.5 + crystalFloatY;
    const spinAngle = time * 1.8;

    drawCrystal(crystalFillCtx, crystalBackingCtx, crystalX, crystalY, spinAngle);
    drawEye(eyeCtx, crystalX, crystalY);

    // 3. Composite Front Layers strictly in order: Outline -> Crystal Fill -> Top Eye Layer
    const renderShiftX = isGlitching ? glitchShiftX : 0;
    ctx.drawImage(crystalBackingCanvas, renderShiftX, 0);
    ctx.drawImage(crystalFillCanvas, renderShiftX, 0);
    ctx.drawImage(eyeCanvas, renderShiftX, 0);
}

function gameLoop(now) {
    let delta = now - lastTime;
    lastTime = now;
    if (delta > 250) delta = 250;

    accumulator += delta;
    let updated = false;
    while (accumulator >= FRAME_TIME) {
        updateSimulation();
        accumulator -= FRAME_TIME;
        updated = true;
    }

    if (updated) {
        renderFrame();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame((now) => {
    lastTime = now;
    requestAnimationFrame(gameLoop);
});

// --- 2. INTERACTIVE CLICK-TO-HIDE FOCUS CONTROLS ---
const overlay = document.getElementById('overlay');
const hint = document.getElementById('hint');

function toggleFocus() {
    overlay.classList.toggle('hidden');
    hint.classList.toggle('hidden');
}

canvas.addEventListener('click', toggleFocus);

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        toggleFocus();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Escape' || e.code === 'KeyH') {
        toggleFocus();
    }
});

// Automatically update copyright year
document.getElementById('current-year').innerText = new Date().getFullYear();