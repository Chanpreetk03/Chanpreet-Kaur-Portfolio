import { defineConfig } from "vite";
import { portfolioData } from "./data.js";
import {
    renderAchievements,
    renderProjectList,
    renderTimeline,
} from "./content.js";

const prerenderPortfolioContent = {
    name: "prerender-portfolio-content",
    transformIndexHtml(html) {
        return html
            .replace("<!-- PROJECT_LIST -->", renderProjectList(portfolioData.projects))
            .replace("<!-- EXPERIENCE_LIST -->", renderTimeline(portfolioData.experience))
            .replace("<!-- ACHIEVEMENT_LIST -->", renderAchievements(portfolioData.achievements))
            .replace("<!-- EDUCATION_LIST -->", renderTimeline(portfolioData.education));
    },
};

export default defineConfig({
    base: "./",
    plugins: [prerenderPortfolioContent],
});
