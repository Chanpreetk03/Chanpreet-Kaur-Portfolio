const WIDTH = 1440;
const HEIGHT = 900;

function randomSequence(seed) {
    let state = seed;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function gradient(ctx, x1, y1, x2, y2, stops) {
    const fill = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([offset, color]) => fill.addColorStop(offset, color));
    return fill;
}

function ellipse(ctx, x, y, rx, ry, color, rotation = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function hill(ctx, points, color) {
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT);
    ctx.lineTo(0, points[0][1]);
    points.forEach(([x, y, cx, cy]) => {
        if (cx === undefined) ctx.lineTo(x, y);
        else ctx.quadraticCurveTo(cx, cy, x, y);
    });
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function leaf(ctx, x, y, length, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.5, -length * 0.45, length, 0);
    ctx.quadraticCurveTo(length * 0.5, length * 0.3, 0, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

const noonCanopyLeaves = (() => {
    const random = randomSequence(1401);
    const leaves = [];
    for (let index = 0; index < 54; index += 1) {
        const secondBranch = index >= 36;
        const count = secondBranch ? 18 : 36;
        const t = 0.07 + ((secondBranch ? index - 36 : index) + 0.5) / count * 0.86;
        const inverse = 1 - t;
        const branchX = secondBranch
            ? inverse * inverse * 1240 + 2 * inverse * t * 1220 + t * t * 1400
            : inverse ** 3 * 850 + 3 * inverse ** 2 * t * 1010 + 3 * inverse * t ** 2 * 1195 + t ** 3 * 1450;
        const branchY = secondBranch
            ? inverse * inverse * 90 + 2 * inverse * t * 230 + t * t * 340
            : inverse ** 3 * -25 + 3 * inverse ** 2 * t * 115 + 3 * inverse * t ** 2 * 65 + t ** 3 * 215;
        const direction = index % 2 ? 1 : -1;
        const stemAngle = direction * (0.55 + random() * 0.8);
        const stemLength = 17 + random() * 32;
        leaves.push({
            branchX,
            branchY,
            x: branchX + Math.cos(stemAngle) * stemLength,
            y: branchY + Math.sin(stemAngle) * stemLength,
            length: 23 + random() * 35,
            angle: stemAngle + (random() - 0.5) * 0.6,
            phase: random() * Math.PI * 2,
            color: ["#668a4c", "#85a45d", "#4f7545", "#a3b866", "#739947"][index % 5],
        });
    }
    for (let index = 0; index < 38; index += 1) {
        const t = 0.08 + (index + 0.5) / 38 * 0.84;
        const inverse = 1 - t;
        const branchX = inverse ** 3 * 710 + 3 * inverse ** 2 * t * 870 + 3 * inverse * t ** 2 * 1070 + t ** 3 * 1340;
        const branchY = inverse ** 3 * 90 + 3 * inverse ** 2 * t * 195 + 3 * inverse * t ** 2 * 70 + t ** 3 * 160;
        const direction = index % 2 ? 1 : -1;
        const stemAngle = direction * (0.65 + random() * 0.75);
        const stemLength = 20 + random() * 28;
        leaves.push({
            branchX,
            branchY,
            x: branchX + Math.cos(stemAngle) * stemLength,
            y: branchY + Math.sin(stemAngle) * stemLength,
            length: 28 + random() * 32,
            angle: stemAngle + (random() - 0.5) * 0.55,
            phase: random() * Math.PI * 2,
            color: ["#668a4c", "#85a45d", "#4f7545", "#a3b866", "#739947"][index % 5],
        });
    }
    return leaves;
})();

function drawDaisy(ctx, x, y, radius) {
    ctx.strokeStyle = "#61783a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.quadraticCurveTo(x + 8, y + radius * 3, x - 4, HEIGHT);
    ctx.stroke();
    leaf(ctx, x + 3, y + radius * 2, radius * 1.7, -0.6, "#668044");
    leaf(ctx, x - 2, y + radius * 2.3, radius * 1.5, Math.PI + 0.45, "#7c9954");
    for (let petal = 0; petal < 10; petal += 1) {
        const angle = (petal / 10) * Math.PI * 2;
        ellipse(
            ctx,
            x + Math.cos(angle) * radius * 0.78,
            y + Math.sin(angle) * radius * 0.78,
            radius * 0.68,
            radius * 0.25,
            petal % 3 === 0 ? "#fff4d9" : "#fffdf0",
            angle,
        );
    }
    ellipse(ctx, x, y, radius * 0.4, radius * 0.4, "#e6a84b");
    ellipse(ctx, x - radius * 0.1, y - radius * 0.1, radius * 0.17, radius * 0.17, "#ffe5a2");
}

function drawNoon(ctx) {
    const random = randomSequence(401);
    ctx.fillStyle = gradient(ctx, 0, 0, WIDTH, HEIGHT, [
        [0, "#f4e5c9"],
        [0.6, "#fff6df"],
        [1, "#edd0a4"],
    ]);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.rect(725, 0, 715, HEIGHT);
    ctx.clip();
    ctx.fillStyle = gradient(ctx, 0, 0, 0, HEIGHT, [
        [0, "#65b8df"],
        [0.58, "#b1e5ed"],
        [1, "#e8f4d4"],
    ]);
    ctx.fillRect(725, 0, 715, HEIGHT);

    const sunshine = ctx.createRadialGradient(1110, 246, 10, 1110, 246, 370);
    sunshine.addColorStop(0, "rgba(255,255,235,0.98)");
    sunshine.addColorStop(0.08, "rgba(255,247,185,0.72)");
    sunshine.addColorStop(0.5, "rgba(255,250,207,0.22)");
    sunshine.addColorStop(1, "rgba(255,250,207,0)");
    ctx.fillStyle = sunshine;
    ctx.fillRect(725, 0, 715, 800);
    for (let ray = 0; ray < 12; ray += 1) {
        const angle = (ray / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(1110 + Math.cos(angle) * 32, 246 + Math.sin(angle) * 32);
        ctx.lineTo(1110 + Math.cos(angle) * 240, 246 + Math.sin(angle) * 240);
        ctx.strokeStyle = "rgba(255,250,213,0.17)";
        ctx.lineWidth = ray % 3 === 0 ? 7 : 3;
        ctx.stroke();
    }

    hill(ctx, [[200, 680, 80, 630], [570, 640, 390, 715], [900, 635, 750, 585], [1180, 590, 1020, 665], [WIDTH, 650, 1310, 600]], "#aec9b8");
    hill(ctx, [[290, 746, 180, 704], [700, 712, 510, 766], [1100, 686, 910, 720], [WIDTH, 744, 1300, 685]], "#709ca2");
    hill(ctx, [[400, 816, 200, 780], [840, 760, 640, 820], [1200, 749, 1080, 778], [WIDTH, 785, 1340, 745]], "#648862");

    ctx.strokeStyle = "#546c35";
    ctx.lineWidth = 11;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(850, -25);
    ctx.bezierCurveTo(1010, 115, 1195, 65, 1450, 215);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1240, 90);
    ctx.quadraticCurveTo(1220, 230, 1400, 340);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(710, 90);
    ctx.bezierCurveTo(870, 195, 1070, 70, 1340, 160);
    ctx.stroke();
    ctx.strokeStyle = "#587a42";
    ctx.lineWidth = 2.5;
    noonCanopyLeaves.forEach(({ branchX, branchY, x, y }) => {
        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        ctx.quadraticCurveTo((branchX + x) / 2 + 4, (branchY + y) / 2, x, y);
        ctx.stroke();
    });
    [[920, 795, 15], [1010, 735, 18], [1118, 820, 21], [1215, 752, 18], [1315, 838, 24], [1400, 722, 17], [1082, 875, 14], [1360, 655, 13]].forEach(([x, y, r]) => drawDaisy(ctx, x, y, r));
    ctx.restore();

    ctx.fillStyle = gradient(ctx, 690, 0, 750, 0, [[0, "#a97b4d"], [0.35, "#e0b77c"], [0.7, "#f4dab0"], [1, "#ac8057"]]);
    ctx.fillRect(695, 0, 48, HEIGHT);
    ctx.fillStyle = "rgba(109,76,48,0.26)";
    ctx.fillRect(733, 0, 7, HEIGHT);
    ctx.fillStyle = gradient(ctx, 0, 0, 0, 43, [[0, "#b78a55"], [0.55, "#edd2a2"], [1, "#aa7d4e"]]);
    ctx.fillRect(690, 0, 750, 42);
    ctx.fillStyle = "#c59b66";
    ctx.fillRect(1370, 0, 30, HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = "#fffdf0";
    ctx.beginPath();
    ctx.moveTo(630, 0);
    ctx.lineTo(830, 0);
    ctx.bezierCurveTo(790, 265, 855, 485, 766, 710);
    ctx.quadraticCurveTo(741, 793, 808, 900);
    ctx.lineTo(608, 900);
    ctx.bezierCurveTo(713, 614, 608, 333, 630, 0);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.filter = "blur(17px)";
    for (let index = 0; index < 38; index += 1) {
        const x = random() * 705;
        const y = random() * HEIGHT;
        leaf(ctx, x, y, 32 + random() * 72, random() * Math.PI * 2, "rgba(90,112,67,0.095)");
    }
    ctx.restore();
}

function drawCloud(ctx, x, y, width, height, color) {
    ctx.save();
    ctx.filter = "blur(18px)";
    for (let index = 0; index < 6; index += 1) {
        const dx = (index - 2.5) * width * 0.16;
        const dy = Math.sin(index * 1.8) * height * 0.2;
        ellipse(ctx, x + dx, y + dy, width * (0.19 + index * 0.014), height * (0.42 + (index % 2) * 0.08), color);
    }
    ctx.restore();
}

function drawEvening(ctx) {
    const random = randomSequence(1830);
    ctx.fillStyle = gradient(ctx, 0, 0, 0, HEIGHT, [
        [0, "#342d58"],
        [0.3, "#755170"],
        [0.54, "#cf6571"],
        [0.7, "#ffb657"],
        [0.81, "#bb775e"],
        [1, "#22332c"],
    ]);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const glow = ctx.createRadialGradient(760, 638, 20, 760, 638, 690);
    glow.addColorStop(0, "rgba(255,231,138,0.8)");
    glow.addColorStop(0.3, "rgba(255,151,91,0.3)");
    glow.addColorStop(1, "rgba(255,151,91,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 100, WIDTH, 720);

    [
        [220, 130, 470, 95, "rgba(73,49,92,0.52)"],
        [820, 105, 630, 105, "rgba(79,48,94,0.56)"],
        [1290, 255, 430, 90, "rgba(100,53,91,0.54)"],
        [380, 295, 520, 100, "rgba(143,68,100,0.5)"],
        [920, 335, 560, 90, "rgba(103,53,93,0.53)"],
        [680, 475, 830, 58, "rgba(193,75,83,0.38)"],
        [1130, 545, 520, 51, "rgba(157,65,79,0.48)"],
    ].forEach(([x, y, w, h, color]) => drawCloud(ctx, x, y, w, h, color));
    for (let band = 0; band < 20; band += 1) {
        const y = 500 + band * 9 + random() * 7;
        ctx.beginPath();
        ctx.moveTo(random() * 180, y);
        ctx.bezierCurveTo(380, y - 15, 930, y + 10, WIDTH, y - 7);
        ctx.strokeStyle = band % 3 === 0 ? "rgba(255,213,135,0.13)" : "rgba(104,45,73,0.12)";
        ctx.lineWidth = 2 + random() * 6;
        ctx.stroke();
    }
    hill(ctx, [[240, 716, 120, 690], [580, 685, 430, 742], [900, 693, 770, 656], [WIDTH, 705, 1190, 680]], "#44374b");
    hill(ctx, [[260, 760, 110, 735], [650, 736, 500, 780], [1050, 754, 850, 715], [WIDTH, 739, 1270, 760]], "#2d3541");
    ctx.fillStyle = gradient(ctx, 0, 750, 0, HEIGHT, [[0, "#25372d"], [1, "#111f20"]]);
    ctx.fillRect(0, 776, WIDTH, 124);
    for (let tree = 0; tree < 105; tree += 1) {
        const x = random() * WIDTH;
        const y = 740 + random() * 45;
        const height = 5 + random() * 29;
        ctx.fillStyle = tree % 4 === 0 ? "#202b32" : "#243436";
        ctx.beginPath();
        ctx.moveTo(x - height * 0.27, y + 5);
        ctx.lineTo(x, y - height);
        ctx.lineTo(x + height * 0.27, y + 5);
        ctx.fill();
    }
    for (let blade = 0; blade < 210; blade += 1) {
        const x = random() * WIDTH;
        const y = 792 + random() * 108;
        ctx.beginPath();
        ctx.moveTo(x, y + 22);
        ctx.quadraticCurveTo(x + random() * 14 - 7, y - 8, x + random() * 20 - 10, y - 16 - random() * 26);
        ctx.strokeStyle = blade % 7 === 0 ? "rgba(209,136,86,0.4)" : "rgba(75,89,54,0.45)";
        ctx.lineWidth = 1 + random();
        ctx.stroke();
    }
    ctx.strokeStyle = "#182425";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(-20, 460);
    ctx.bezierCurveTo(95, 330, 110, 250, 190, -30);
    ctx.moveTo(WIDTH + 20, 490);
    ctx.bezierCurveTo(1350, 340, 1365, 180, 1280, -20);
    ctx.stroke();
    for (let index = 0; index < 48; index += 1) {
        const side = index % 2 === 0;
        const x = side ? random() * 145 : 1295 + random() * 145;
        const y = random() * 470;
        leaf(ctx, x, y, 15 + random() * 35, random() * Math.PI * 2, index % 3 ? "#1b292c" : "#2e3332");
    }
}

function drawNight(ctx) {
    const random = randomSequence(2100);
    ctx.fillStyle = gradient(ctx, 0, 0, 0, HEIGHT, [
        [0, "#07142c"],
        [0.54, "#172b49"],
        [0.76, "#3d4058"],
        [1, "#0b1b2d"],
    ]);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const haze = ctx.createRadialGradient(1120, 200, 15, 1120, 200, 590);
    haze.addColorStop(0, "rgba(180,185,206,0.17)");
    haze.addColorStop(1, "rgba(180,185,206,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(550, 0, 890, 730);
    for (let index = 0; index < 170; index += 1) {
        const x = random() * WIDTH;
        const y = random() * 600;
        const radius = index % 20 === 0 ? 1.8 : 0.4 + random() * 0.9;
        ellipse(ctx, x, y, radius, radius, index % 5 === 0 ? "rgba(255,229,175,0.55)" : "rgba(224,236,255,0.49)");
    }

    const mobile = window.matchMedia("(max-width: 620px)").matches;
    const moonX = mobile ? 1190 : 1150;
    const moonY = mobile ? 160 : 200;
    const moonRadius = mobile ? 31 : 42;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, mobile ? 120 : 160);
    moonGlow.addColorStop(0, "rgba(255,241,196,0.25)");
    moonGlow.addColorStop(1, "rgba(255,241,196,0)");
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - 200, Math.max(0, moonY - 190), 400, 380);
    const moonSize = Math.ceil(moonRadius * 4);
    const moonCanvas = document.createElement("canvas");
    moonCanvas.width = moonSize;
    moonCanvas.height = moonSize;
    const moonContext = moonCanvas.getContext("2d");
    const center = moonSize / 2;
    moonContext.fillStyle = "#f6e8ba";
    moonContext.beginPath();
    moonContext.arc(center, center, moonRadius, 0, Math.PI * 2);
    moonContext.fill();
    moonContext.globalCompositeOperation = "destination-out";
    moonContext.beginPath();
    moonContext.arc(center + moonRadius * 0.35, center - moonRadius * 0.26, moonRadius, 0, Math.PI * 2);
    moonContext.fill();
    ctx.save();
    ctx.shadowColor = "rgba(255,234,184,0.75)";
    ctx.shadowBlur = 18;
    ctx.drawImage(moonCanvas, moonX - center, moonY - center);
    ctx.restore();

    drawCloud(ctx, 440, 500, 510, 46, "rgba(113,119,148,0.11)");
    drawCloud(ctx, 1070, 455, 540, 65, "rgba(124,122,148,0.15)");
    hill(ctx, [[280, 675, 90, 645], [630, 633, 470, 683], [1010, 648, 820, 613], [WIDTH, 669, 1240, 630]], "#182941");
    hill(ctx, [[340, 735, 160, 709], [740, 700, 560, 746], [1080, 716, 930, 682], [WIDTH, 742, 1300, 699]], "#0f2239");

    ctx.fillStyle = gradient(ctx, 0, 700, 0, HEIGHT, [[0, "#1d3049"], [1, "#07192a"]]);
    ctx.fillRect(0, 736, WIDTH, 164);
    for (let index = 0; index < 33; index += 1) {
        const y = 740 + index * 4.8;
        const halfWidth = 10 + index * 3 + random() * 17;
        ctx.fillStyle = index % 3 === 0 ? "rgba(245,207,129,0.22)" : "rgba(219,190,130,0.09)";
        ctx.fillRect(1175 - halfWidth + random() * 14, y, halfWidth * 2, 1 + random() * 2);
    }

    hill(ctx, [[570, 825, 280, 792], [960, 776, 750, 816], [WIDTH, 741, 1280, 719]], "#0a1a2c");
    for (let building = 0; building < 20; building += 1) {
        const x = 880 + building * 30 + random() * 12;
        const roofY = 755 + random() * 112 - (x - 880) * 0.12;
        const width = 27 + random() * 38;
        const height = 35 + random() * 66;
        ctx.fillStyle = building % 3 === 0 ? "#101c2b" : "#192538";
        ctx.fillRect(x, roofY, width, height);
        ctx.beginPath();
        ctx.moveTo(x - 5, roofY);
        ctx.lineTo(x + width / 2, roofY - 17 - random() * 14);
        ctx.lineTo(x + width + 5, roofY);
        ctx.closePath();
        ctx.fill();
        for (let windowIndex = 0; windowIndex < 3; windowIndex += 1) {
            if (random() > 0.35) {
                ctx.fillStyle = windowIndex % 2 ? "#dba96c" : "#f4c988";
                ctx.fillRect(x + 7 + windowIndex * 10, roofY + 12 + random() * 24, 3, 6);
            }
        }
    }
    ctx.fillStyle = "#152033";
    ctx.fillRect(1300, 615, 39, 183);
    ctx.beginPath();
    ctx.moveTo(1293, 615);
    ctx.lineTo(1319, 564);
    ctx.lineTo(1346, 615);
    ctx.fill();
    ctx.fillStyle = "#e3b77b";
    ctx.fillRect(1313, 636, 11, 18);
    ctx.fillRect(1313, 679, 11, 17);
    for (let index = 0; index < 30; index += 1) {
        const x = random() * 220;
        const y = 665 + random() * 235;
        leaf(ctx, x, y, 16 + random() * 29, random() * Math.PI * 2, index % 2 ? "#101c2b" : "#17263a");
    }
}

function drawNoonMotion(ctx, time) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(745, 42, 625, HEIGHT - 42);
    ctx.clip();
    noonCanopyLeaves.forEach(({ x, y, length, angle, phase, color }, index) => {
        const sway = Math.sin(time * (0.75 + index % 4 * 0.11) + phase);
        leaf(ctx, x, y, length, angle + sway * 0.17, color);
    });
    ctx.restore();
}

function drawEveningMotion(ctx, time) {
    const random = randomSequence(1831);
    for (let blade = 0; blade < 165; blade += 1) {
        const x = random() * WIDTH;
        const y = 780 + random() * 112;
        const length = 22 + random() * 40;
        const lean = random() * 18 - 9;
        const phase = random() * Math.PI * 2;
        const sway = Math.sin(time * (0.85 + blade % 5 * 0.12) + phase + x * 0.004) * (5 + length * 0.12);
        const tipX = x + lean + sway;
        ctx.beginPath();
        ctx.moveTo(x, y + 12);
        ctx.quadraticCurveTo(x + (lean + sway) * 0.25, y - length * 0.38, tipX, y - length);
        ctx.strokeStyle = blade % 6 === 0 ? "rgba(225,158,104,0.58)" : "rgba(101,118,70,0.66)";
        ctx.lineWidth = 1.1 + random() * 1.1;
        ctx.stroke();
        if (blade % 11 === 0) ellipse(ctx, tipX, y - length, 1.8, 3.5, "rgba(222,165,112,0.65)", -0.3);
    }
}

function drawNightMotion(ctx, time) {
    const random = randomSequence(2101);
    ctx.shadowColor = "rgba(255,235,190,0.7)";
    ctx.shadowBlur = 8;
    for (let index = 0; index < 54; index += 1) {
        const x = random() * WIDTH;
        const y = 25 + random() * 560;
        const radius = 0.7 + random() * 1.5;
        const phase = random() * Math.PI * 2;
        const speed = 0.7 + random() * 1.1;
        const brightness = 0.14 + Math.pow((Math.sin(time * speed + phase) + 1) * 0.5, 3) * 0.82;
        ellipse(ctx, x, y, radius, radius, `rgba(255,245,214,${brightness})`);
        if (index % 9 === 0) {
            ctx.strokeStyle = `rgba(255,245,214,${brightness * 0.57})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(x - radius * 4, y);
            ctx.lineTo(x + radius * 4, y);
            ctx.moveTo(x, y - radius * 4);
            ctx.lineTo(x, y + radius * 4);
            ctx.stroke();
        }
    }
    ctx.shadowBlur = 0;
}

const sceneDrawers = {
    noon: drawNoon,
    evening: drawEvening,
    night: drawNight,
};

const motionDrawers = {
    noon: drawNoonMotion,
    evening: drawEveningMotion,
    night: drawNightMotion,
};

function initMotionScenes() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.querySelectorAll(".scene-motion-canvas[data-motion]").forEach((canvas) => {
        const ctx = canvas.getContext("2d");
        const draw = motionDrawers[canvas.dataset.motion];
        if (!ctx || !draw) return;

        let density = 1;
        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        let visible = false;
        let frameId = 0;
        let lastDraw = 0;

        const render = (time) => {
            if (!canvas.width || !canvas.height) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(density, 0, 0, density, 0, 0);
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);
            draw(ctx, time);
        };

        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            density = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(bounds.width * density);
            canvas.height = Math.round(bounds.height * density);
            scale = Math.max(bounds.width / WIDTH, bounds.height / HEIGHT);
            const mobile = window.matchMedia("(max-width: 620px)").matches;
            const focal = mobile ? { noon: 0.7, evening: 0.5, night: 0.82 }[canvas.dataset.motion] : 0.5;
            offsetX = (bounds.width - WIDTH * scale) * focal;
            offsetY = (bounds.height - HEIGHT * scale) * 0.5;
            render(reducedMotion.matches ? 0 : performance.now() / 1000);
        };

        const frame = (now) => {
            if (now - lastDraw >= 40) {
                render(now / 1000);
                lastDraw = now;
            }
            frameId = requestAnimationFrame(frame);
        };

        const sync = () => {
            if (visible && !reducedMotion.matches && !document.hidden) {
                if (!frameId) frameId = requestAnimationFrame(frame);
            } else {
                if (frameId) cancelAnimationFrame(frameId);
                frameId = 0;
                render(0);
            }
        };

        new ResizeObserver(resize).observe(canvas);
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        }, { rootMargin: "80px 0px" }).observe(canvas.closest(".day-scene"));
        reducedMotion.addEventListener("change", sync);
        document.addEventListener("visibilitychange", sync);
        resize();
    });
}

export function initChapterScenes() {
    document.querySelectorAll(".scene-canvas[data-scene]").forEach((canvas) => {
        const ctx = canvas.getContext("2d", { alpha: false });
        const draw = sceneDrawers[canvas.dataset.scene];
        if (!ctx || !draw) return;

        const render = () => {
            const bounds = canvas.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;
            const density = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(bounds.width * density);
            canvas.height = Math.round(bounds.height * density);
            ctx.setTransform(density, 0, 0, density, 0, 0);
            const scale = Math.max(bounds.width / WIDTH, bounds.height / HEIGHT);
            const mobile = window.matchMedia("(max-width: 620px)").matches;
            const focal = mobile ? { noon: 0.7, evening: 0.5, night: 0.82 }[canvas.dataset.scene] : 0.5;
            ctx.translate((bounds.width - WIDTH * scale) * focal, (bounds.height - HEIGHT * scale) * 0.5);
            ctx.scale(scale, scale);
            draw(ctx);
        };

        new ResizeObserver(render).observe(canvas);
        render();
    });
    initMotionScenes();
}
