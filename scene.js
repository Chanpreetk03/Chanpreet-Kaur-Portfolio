import * as THREE from "three";

const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
);

function createSky() {
    const geometry = new THREE.PlaneGeometry(42, 24, 1, 32);
    const position = geometry.getAttribute("position");
    const colors = [];
    const top = new THREE.Color("#d69cab");
    const middle = new THREE.Color("#f3ae9c");
    const bottom = new THREE.Color("#ffe3b6");

    for (let index = 0; index < position.count; index += 1) {
        const progress = THREE.MathUtils.clamp(
            (position.getY(index) + 12) / 24,
            0,
            1,
        );
        const color =
            progress < 0.58
                ? bottom.clone().lerp(middle, progress / 0.58)
                : middle.clone().lerp(top, (progress - 0.58) / 0.42);
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ vertexColors: true, depthWrite: false }),
    );
}

function createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(128, 128, 12, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255, 216, 151, 0.52)");
    gradient.addColorStop(0.38, "rgba(250, 174, 153, 0.24)");
    gradient.addColorStop(1, "rgba(239, 145, 157, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createHorizon({ base, amplitude, frequency, phase, color, z }) {
    const shape = new THREE.Shape();
    const left = -24;
    const right = 24;
    const bottom = -14;
    const ridgeHeight = (x) =>
        base +
        Math.sin(x * frequency + phase) * amplitude +
        Math.sin(x * frequency * 0.43 + phase * 1.7) * amplitude * 0.3;

    shape.moveTo(left, bottom);
    shape.lineTo(left, ridgeHeight(left));
    for (let x = left + 0.45; x <= right; x += 0.45) {
        shape.lineTo(x, ridgeHeight(x));
    }
    shape.lineTo(right, bottom);
    shape.closePath();

    const mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape, 48),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.position.z = z;
    return mesh;
}

function createPollen() {
    const count = 56;
    const positions = new Float32Array(count * 3);
    let seed = 67;
    const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < count; index += 1) {
        positions[index * 3] = (random() - 0.5) * 13;
        positions[index * 3 + 1] = (random() - 0.1) * 6;
        positions[index * 3 + 2] = -1.8 + random() * 1.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color: "#fff0cd",
            size: 0.035,
            transparent: true,
            opacity: 0.72,
            sizeAttenuation: true,
            depthWrite: false,
        }),
    );
}

export function initHeroScene({ canvas, pauseButton }) {
    if (!canvas) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
        });
    } catch {
        canvas.classList.add("scene-unavailable");
        return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0, 12);
    scene.add(createSky());

    const landscape = new THREE.Group();
    scene.add(landscape);

    const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: createGlowTexture(),
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
        }),
    );
    glow.position.set(2.3, -0.3, -7.2);
    glow.scale.set(7.2, 7.2, 1);
    landscape.add(glow);

    const sun = new THREE.Group();
    sun.position.set(2.3, -0.35, -6.4);
    landscape.add(sun);

    sun.add(
        new THREE.Mesh(
            new THREE.CircleGeometry(2.04, 128),
            new THREE.MeshBasicMaterial({ color: "#ffc66e" }),
        ),
    );

    const sunRim = new THREE.Mesh(
        new THREE.RingGeometry(2.1, 2.125, 128),
        new THREE.MeshBasicMaterial({
            color: "#ffe4ad",
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide,
        }),
    );
    sunRim.position.z = 0.01;
    sun.add(sunRim);

    const horizonLayers = [
        createHorizon({
            base: -1.95,
            amplitude: 0.43,
            frequency: 0.27,
            phase: 0.7,
            color: "#df9a98",
            z: -4.8,
        }),
        createHorizon({
            base: -2.48,
            amplitude: 0.34,
            frequency: 0.34,
            phase: 2.1,
            color: "#eea181",
            z: -3.2,
        }),
        createHorizon({
            base: -3.1,
            amplitude: 0.24,
            frequency: 0.42,
            phase: 4.4,
            color: "#d77f79",
            z: -1.7,
        }),
    ];
    horizonLayers.forEach((layer) => landscape.add(layer));

    const pollen = createPollen();
    scene.add(pollen);

    const targetOffset = new THREE.Vector2(0, 0);
    let sunBaseY = -0.35;
    let paused = reducedMotionQuery.matches;
    let disposed = false;
    let lastFrameTime = 0;
    let elapsed = 0;
    const hero = canvas.closest(".hero");
    hero?.classList.toggle("is-motion-paused", paused);

    if (paused) {
        pauseButton?.setAttribute("aria-label", "Resume scene animation");
        pauseButton?.setAttribute("title", "Resume scene animation");
        const icon = pauseButton?.querySelector(".pause-icon");
        if (icon) icon.textContent = "▶";
    }

    const updateLayout = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);

        if (width < 620) {
            sun.position.x = 0.58;
            sunBaseY = -1.85;
            sun.scale.setScalar(0.82);
            glow.position.x = 0.58;
            glow.scale.set(6.3, 6.3, 1);
        } else if (width < 900) {
            sun.position.x = 1.35;
            sunBaseY = -0.85;
            sun.scale.setScalar(0.91);
            glow.position.x = 1.35;
            glow.scale.set(6.8, 6.8, 1);
        } else {
            sun.position.x = 2.3;
            sunBaseY = -0.35;
            sun.scale.setScalar(1);
            glow.position.x = 2.3;
            glow.scale.set(7.2, 7.2, 1);
        }
        sun.position.y = sunBaseY;
        glow.position.y = sunBaseY + 0.05;
        renderer.render(scene, camera);
    };

    const onPointerMove = (event) => {
        const bounds = canvas.getBoundingClientRect();
        targetOffset.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        targetOffset.y = -(
            ((event.clientY - bounds.top) / bounds.height) * 2 -
            1
        );
        if (paused) {
            landscape.position.x = -targetOffset.x * 0.12;
            renderer.render(scene, camera);
        }
    };

    const onPointerLeave = () => {
        targetOffset.set(0, 0);
        if (paused) renderer.render(scene, camera);
    };

    const onPauseToggle = () => {
        paused = !paused;
        hero?.classList.toggle("is-motion-paused", paused);
        pauseButton?.setAttribute(
            "aria-label",
            paused ? "Resume scene animation" : "Pause scene animation",
        );
        pauseButton?.setAttribute(
            "title",
            paused ? "Resume scene animation" : "Pause scene animation",
        );
        const icon = pauseButton?.querySelector(".pause-icon");
        if (icon) icon.textContent = paused ? "▶" : "Ⅱ";
        if (paused) renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
    pauseButton?.addEventListener("click", onPauseToggle);
    document.addEventListener("visibilitychange", updateLayout);
    updateLayout();

    renderer.setAnimationLoop((time) => {
        if (disposed) return;
        const delta = Math.min((time - lastFrameTime) / 1000 || 0, 0.05);
        lastFrameTime = time;

        if (!paused && !document.hidden) {
            elapsed += delta;
            landscape.position.x +=
                (-targetOffset.x * 0.12 - landscape.position.x) * delta * 1.6;
            landscape.position.y +=
                (-targetOffset.y * 0.055 - landscape.position.y) * delta * 1.4;
            sun.position.y = sunBaseY + Math.sin(elapsed * 0.42) * 0.045;
            glow.position.y = sun.position.y + 0.05;
            sunRim.rotation.z += delta * 0.018;
            pollen.rotation.z = Math.sin(elapsed * 0.12) * 0.012;
            horizonLayers[0].position.x = landscape.position.x * 0.22;
            horizonLayers[1].position.x = landscape.position.x * 0.48;
            horizonLayers[2].position.x = landscape.position.x * 0.72;
            renderer.render(scene, camera);
        }
    });

    window.addEventListener(
        "pagehide",
        () => {
            disposed = true;
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();
            scene.traverse((object) => {
                object.geometry?.dispose();
                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];
                materials.forEach((material) => {
                    material?.map?.dispose();
                    material?.dispose();
                });
            });
            renderer.dispose();
        },
        { once: true },
    );
}
