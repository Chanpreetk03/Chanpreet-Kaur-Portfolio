import "./style.css";
import { portfolioData } from "./data.js";
import { initHeroScene } from "./scene.js";
import { initChapterScenes } from "./chapterScenes.js";
import {
    renderAchievements,
    renderProjectList,
    renderTimeline,
} from "./content.js";

document.querySelector("#project-list").innerHTML = renderProjectList(
    portfolioData.projects,
);
document.querySelector("#experience-list").innerHTML = renderTimeline(
    portfolioData.experience,
);
document.querySelector("#achievement-list").innerHTML = renderAchievements(
    portfolioData.achievements,
);
document.querySelector("#education-list").innerHTML = renderTimeline(
    portfolioData.education,
);
document.querySelector("#year").textContent = String(new Date().getFullYear());

const chapterTimes = {
    sunrise: { label: "Sunrise", time: "06:00" },
    noon: { label: "Noon", time: "12:00" },
    evening: { label: "Evening", time: "18:00" },
    night: { label: "Night", time: "21:00" },
};
const chapterTime = document.querySelector("#chapter-time");
const chapterPhase = document.querySelector("#chapter-phase");
const hourHand = document.querySelector(".clock-hour-hand");
const minuteHand = document.querySelector(".clock-minute-hand");
const chapterLinks = document.querySelectorAll("[data-chapter-link]");
let activeChapter;

const setActiveChapter = (chapter) => {
    if (!chapter || chapter.dataset.day === activeChapter) return;
    activeChapter = chapter.dataset.day;
    const clock = chapterTimes[activeChapter];
    if (!clock) return;

    document.documentElement.dataset.daytime = activeChapter;
    chapterTime.dateTime = clock.time;
    chapterTime.textContent = clock.time;
    chapterPhase.textContent = clock.label;

    const [hours, minutes] = clock.time.split(":").map(Number);
    hourHand.style.transform = `translateX(-50%) rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutes * 6}deg)`;

    chapterLinks.forEach((link) => {
        if (link.dataset.chapterLink === activeChapter) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    dayScenes.forEach((scene) => {
        scene.classList.toggle("is-active", scene === chapter);
    });
};

const dayScenes = [...document.querySelectorAll(".day-scene[data-day]")];
let particleSeed = 20261003;
const particleRandom = () => {
    particleSeed = (Math.imul(particleSeed, 1664525) + 1013904223) >>> 0;
    return particleSeed / 4294967296;
};

for (const [scene, particleClass, count] of [
    ["noon", "noon-mote", 12],
    ["evening", "evening-firefly", 9],
    ["night", "night-star", 25],
]) {
    const container = document.querySelector(`.${scene}-atmosphere .ambient-particles`);
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
        const particle = document.createElement("span");
        const x = scene === "noon" ? 62 + particleRandom() * 35 : 4 + particleRandom() * 92;
        const y = scene === "evening" ? 66 + particleRandom() * 27 : 5 + particleRandom() * 57;
        particle.className = particleClass;
        particle.style.setProperty("--x", `${x.toFixed(1)}%`);
        particle.style.setProperty("--y", `${y.toFixed(1)}%`);
        particle.style.setProperty("--size", `${(scene === "night" ? 1.5 + particleRandom() * 1.5 : 2 + particleRandom() * 3).toFixed(1)}px`);
        particle.style.setProperty("--delay", `${(-particleRandom() * 19).toFixed(1)}s`);
        particle.style.setProperty("--duration", `${(scene === "night" ? 2.8 + particleRandom() * 4 : 5 + particleRandom() * 4).toFixed(1)}s`);
        fragment.appendChild(particle);
    }
    container?.appendChild(fragment);
}

let activeChapterFrame = 0;

function updateActiveChapter() {
    activeChapterFrame = 0;
    const marker = Math.min(window.innerHeight * 0.36, 320);
    const currentChapter = dayScenes.find((chapter) => {
        const bounds = chapter.getBoundingClientRect();
        return bounds.top <= marker && bounds.bottom > marker;
    });
    if (currentChapter) setActiveChapter(currentChapter);
}

function scheduleActiveChapterUpdate() {
    if (activeChapterFrame) return;
    activeChapterFrame = window.requestAnimationFrame(updateActiveChapter);
}

window.addEventListener("scroll", scheduleActiveChapterUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveChapterUpdate, { passive: true });
scheduleActiveChapterUpdate();

function navigateChapter(index) {
    if (chapterNavigationLocked) return;
    const target = dayScenes[Math.max(0, Math.min(dayScenes.length - 1, index))];
    if (!target) return;

    const top = target.offsetTop;
    if (Math.abs(window.scrollY - top) < 2) return;

    chapterNavigationLocked = true;
    window.clearTimeout(chapterUnlockTimer);
    window.addEventListener("scrollend", releaseChapterNavigation, { once: true });
    chapterUnlockTimer = window.setTimeout(releaseChapterNavigation, 1400);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, top);
    } else {
        window.scrollTo({ top, behavior: "smooth" });
    }
}

function getActiveChapterIndex() {
    const activeIndex = dayScenes.findIndex((chapter) =>
        chapter.classList.contains("is-active"),
    );
    if (activeIndex >= 0) return activeIndex;

    return dayScenes.reduce((closestIndex, chapter, index) => {
        const distance = Math.abs(chapter.getBoundingClientRect().top);
        const closestDistance = Math.abs(
            dayScenes[closestIndex].getBoundingClientRect().top,
        );
        return distance < closestDistance ? index : closestIndex;
    }, 0);
}

let chapterNavigationLocked = false;
let chapterUnlockTimer = 0;
function releaseChapterNavigation() {
    chapterNavigationLocked = false;
    window.clearTimeout(chapterUnlockTimer);
    window.removeEventListener("scrollend", releaseChapterNavigation);
}

const desktopChapterMode = window.matchMedia(
    "(min-width: 1100px) and (min-height: 760px)",
);
let wheelIntent = 0;
let lastWheelTime = 0;

document.addEventListener(
    "wheel",
    (event) => {
        if (!desktopChapterMode.matches || event.ctrlKey || event.deltaY === 0) {
            return;
        }

        event.preventDefault();
        if (chapterNavigationLocked) return;

        const now = performance.now();
        if (now - lastWheelTime > 220) wheelIntent = 0;
        lastWheelTime = now;
        wheelIntent += event.deltaY;

        if (Math.abs(wheelIntent) < 55) {
            return;
        }

        navigateChapter(getActiveChapterIndex() + Math.sign(wheelIntent));
        wheelIntent = 0;
    },
    { passive: false },
);

document.addEventListener("keydown", (event) => {
    if (
        !desktopChapterMode.matches ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
    ) {
        return;
    }

    const target = event.target;
    if (
        target instanceof HTMLElement &&
        target.closest("a, button, input, textarea, select, [contenteditable='true']")
    ) {
        return;
    }

    const chapterKey = ["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End", " "].includes(event.key);
    if (chapterNavigationLocked) {
        if (chapterKey) event.preventDefault();
        return;
    }

    const activeIndex = getActiveChapterIndex();
    if (["PageDown", "ArrowDown"].includes(event.key) || event.key === " ") {
        event.preventDefault();
        navigateChapter(activeIndex + 1);
    } else if (["PageUp", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        navigateChapter(activeIndex - 1);
    } else if (event.key === "Home") {
        event.preventDefault();
        navigateChapter(0);
    } else if (event.key === "End") {
        event.preventDefault();
        navigateChapter(dayScenes.length - 1);
    }
});

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        }
    },
    { threshold: 0.12 },
);

document
    .querySelectorAll(".reveal")
    .forEach((element) => revealObserver.observe(element));

initHeroScene({
    canvas: document.querySelector("#hero-canvas"),
    pauseButton: document.querySelector(".motion-control"),
});
initChapterScenes();
