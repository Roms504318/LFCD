/* ============================================================
   LFCD — Bootstrap
   Each page declares itself via <body data-page="...">.
   Data loads first; render; then motion enhances what exists.
   ============================================================ */

import { loadData } from "./data.js";
import * as render from "./render.js";
import * as ui from "./components.js";
import * as motion from "./motion.js";

async function boot() {
  const page = document.body.dataset.page;
  ui.initHeader();

  try {
    if (page === "home") {
      const { district, projects, events, metrics, map } = await loadData();
      render.renderHero(district);
      render.renderStory(district);
      render.renderProgramStats(metrics);
      render.renderHonestNumbers(metrics);
      render.renderWorkedExample(district);
      render.renderEligibility(district);
      render.renderIsIsNot(district);
      render.renderAssets(projects);
      render.renderVisualizations(projects);
      render.renderEvents(events, { teaserOnly: true });
      render.renderMap(map);
      render.renderFooter(district);
      ui.initModal();
    }

    if (page === "events") {
      const { district, events } = await loadData("district", "events");
      render.renderStatusChips(district);
      render.renderEvents(events);
      render.renderFooter(district);
      ui.initFilterTabs(render.filterEvents);
    }

    if (page === "map") {
      const { district, map, projects } = await loadData("district", "map", "projects");
      render.renderStatusChips(district);
      render.renderMap(map);
      render.renderAssets(projects);
      render.renderFooter(district);
      ui.initModal();
    }
  } catch (err) {
    /* If data fails to load (e.g. opened via file://), say so honestly */
    console.error(err);
    const notice = document.createElement("p");
    notice.className = "boot-notice";
    notice.textContent =
      "Content could not be loaded. Run a local server (e.g. `python3 -m http.server`) and reload — see README.md.";
    document.body.prepend(notice);
    return;
  }

  /* Interactive components on whatever was rendered */
  ui.initCompareSliders();
  ui.initStageViewers();

  /* Motion last — it only enhances, never gates, the content */
  motion.initSmoothScroll();
  motion.initHero();
  motion.initReveals();
  motion.initParallax();
  motion.initCounters();
  motion.initBars();
}

boot();
