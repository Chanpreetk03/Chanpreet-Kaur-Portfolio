import "./style.css";
import { portfolioData } from "./data.js";
import { initHeroScene } from "./scene.js";

const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) =>
        ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[character],
    );

const safeExternalUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : "#";
    } catch {
        return "#";
    }
};

const projectVisuals = {
    codex: `
        <div class="fake-window">
          <div class="fake-titlebar"><i></i><i></i><i></i><span>CODEX USAGE / WORKSPACE</span></div>
          <div class="usage-window">
            <div class="usage-side"><b>◉ Usage</b> Sessions<br>Repositories<br>Account limits</div>
            <div class="usage-main"><small>Selected session</small><h4>Review handoff &amp; implement</h4><div class="metric-row"><div class="metric"><span>INPUT</span><strong>18.4k</strong></div><div class="metric"><span>OUTPUT</span><strong>4.2k</strong></div><div class="metric"><span>MODEL</span><strong>Codex</strong></div></div><div class="usage-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          </div>
        </div>`,
    auth: `
        <div class="auth-flow"><div class="auth-label">Protocol studio / OAuth 2.0</div><h4>Authorization code flow</h4><div class="flow-steps"><div class="flow-step active">Client<br>request</div><span class="flow-line"></span><div class="flow-step">Identity<br>provider</div><span class="flow-line"></span><div class="flow-step">Protected<br>resource</div></div><div class="flow-status"><span>PKCE enabled</span><span>STATE: VALID</span></div></div>`,
    dj: `
        <div class="dj-console"><div class="dj-head"><span>AI-DJ / ROOM 04</span><span>● LIVE</span></div><div class="dj-level"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="dj-stats"><div>ROOM ENERGY<strong>0.78</strong></div><div>ACTIVE PEOPLE<strong>24</strong></div><div>TEMPO<strong>118 BPM</strong></div></div></div>`,
};

const projectList = document.querySelector("#project-list");
projectList.innerHTML = portfolioData.projects
    .map((project, index) => {
        const preview = projectVisuals[project.visual] ?? "";
        const links = (project.links ?? [])
            .map(
                (link) => `
                    <a href="${escapeHtml(safeExternalUrl(link.url))}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`,
            )
            .join("");
        const tags = (project.technologies ?? [])
            .map(
                (technology) =>
                    `<span class="tag">${escapeHtml(technology)}</span>`,
            )
            .join("");

        return `
            <article class="project-card${project.featured ? " featured" : ""} reveal">
              <div class="project-art ${escapeHtml(project.visual)}-art" aria-hidden="true">${preview}</div>
              <div class="project-content">
                <div class="project-topline"><span>${String(index + 1).padStart(2, "0")} / ${escapeHtml(project.category)}</span><span>${escapeHtml(project.year)}</span></div>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="tags">${tags}</div>
                <div class="project-links">${links}</div>
              </div>
            </article>`;
    })
    .join("");

const renderTimeline = (items) =>
    items
        .map((item) => {
            const highlights = (item.highlights ?? [])
                .map((highlight) => `<li>${escapeHtml(highlight)}</li>`)
                .join("");

            return `
                <article class="timeline-entry reveal">
                  <div class="timeline-period">${escapeHtml(item.period)}</div>
                  <div class="timeline-main">
                    <h3>${escapeHtml(item.title)}</h3>
                    <div class="timeline-role">${escapeHtml(item.role)}</div>
                    <p class="timeline-description">${escapeHtml(item.description)}</p>
                    ${highlights ? `<ul class="timeline-highlights">${highlights}</ul>` : ""}
                  </div>
                  <div class="timeline-type">${escapeHtml(item.type)}</div>
                </article>`;
        })
        .join("");

document.querySelector("#experience-list").innerHTML = renderTimeline(
    portfolioData.experience,
);
document.querySelector("#achievement-list").innerHTML = portfolioData.achievements
        .map(
                (achievement) => `
                        <article class="achievement-feature reveal">
                            <div class="achievement-scale"><strong>${escapeHtml(achievement.scale)}</strong><span>${escapeHtml(achievement.scaleLabel)}</span></div>
                            <div class="achievement-copy">
                                <p class="achievement-year">${escapeHtml(achievement.year)} / ${escapeHtml(achievement.recognition)}</p>
                                <h3>${escapeHtml(achievement.title)}</h3>
                                <p>${escapeHtml(achievement.description)}</p>
                            </div>
                            <div class="achievement-mark" aria-hidden="true">✳</div>
                        </article>`,
        )
        .join("");
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