import "./style.css";
import { portfolioData } from "./data.js";
import { initHeroScene } from "./scene.js";
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
