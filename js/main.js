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
      const { district, events, metrics, map } = await loadData("district", "events", "metrics", "map");
      render.renderHero(district);
      render.renderStory(district);
      render.renderHonestZeros(metrics);
      render.renderCulturalAssets(metrics);
      render.renderIsIsNot(district);
      render.renderEvents(events, { teaserOnly: true });
      render.renderMap(map);
      render.renderFooter(district);
    }

    if (page === "events") {
      const { district, events } = await loadData("district", "events");
      render.renderStatusChips(district);
      render.renderEvents(events);
      render.renderFooter(district);
      ui.initFilterTabs(render.filterEvents);
    }

    if (page === "map") {
      const { district, map } = await loadData("district", "map");
      render.renderStatusChips(district);
      render.renderMap(map);
      render.renderFooter(district);
    }

    /* Buildings — the property records and the Historic Tax Credit case, together */
    if (page === "buildings") {
      const { district, projects, metrics } = await loadData("district", "projects", "metrics");
      render.renderStatusChips(district);
      render.renderStory(district); /* fills the HTC "tool" chapter on this page */
      render.renderProgramStats(metrics);
      render.renderComparisonBars(metrics);
      render.renderWorkedExample(district);
      render.renderEligibility(district);
      render.renderAssets(projects);
      render.renderVisualizations(projects);
      render.renderFooter(district);
      ui.initModal();
    }

    /* Businesses — the district map plus cultural anchors, businesses, partners */
    if (page === "business") {
      const { district, map, projects } = await loadData("district", "map", "projects");
      render.renderStatusChips(district);
      render.renderMap(map);
      render.renderAnchors(projects);
      render.renderFooter(district);
      ui.initModal();
    }

    /* 4 Pillars */
    if (page === "pillars") {
      const { district, pillars } = await loadData("district", "pillars");
      render.renderStatusChips(district);
      render.renderPillars(pillars);
      render.renderFooter(district);
    }

    /* Scaffold pages awaiting content from lakeforestculturaldistrict.org */
    if (page === "basic") {
      const { district } = await loadData("district");
      render.renderStatusChips(district);
      render.renderFooter(district);
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
