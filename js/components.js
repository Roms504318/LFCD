/* ============================================================
   LFCD — Interactive components
   Comparison slider, stage viewer, asset-detail modal,
   filter tabs. All keyboard-accessible; all degrade to
   visible static content if anything fails.
   ============================================================ */

/* ---------- Before/after comparison slider ----------
   Driven by a real <input type="range"> so keyboard and
   screen-reader users get the same control as pointer users. */
export function initCompareSliders(root = document) {
  root.querySelectorAll("[data-compare]").forEach((el) => {
    const range = el.querySelector("input[type=range]");
    if (!range) return;
    const update = () => el.style.setProperty("--pos", range.value + "%");
    range.addEventListener("input", update);
    update();
  });
}

/* ---------- Stage viewer (2–3 rehabilitation stages) ---------- */
export function initStageViewers(root = document) {
  root.querySelectorAll("[data-stage-viewer]").forEach((viewer) => {
    const tabs = viewer.querySelectorAll(".stage-tabs button");
    const imgs = viewer.querySelectorAll(".stage-viewer__frame img");
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
        imgs.forEach((img, j) => img.classList.toggle("is-active", i === j));
      });
    });
  });
}

/* ---------- Asset detail modal ---------- */
let lastFocused = null;

export function openModal(html) {
  const modal = document.getElementById("asset-modal");
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.querySelector(".modal__content").innerHTML = html;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal__close").focus();
}

export function closeModal() {
  const modal = document.getElementById("asset-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

export function initModal() {
  const modal = document.getElementById("asset-modal");
  if (!modal) return;
  modal.querySelector(".modal__scrim").addEventListener("click", closeModal);
  modal.querySelector(".modal__close").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
  /* Keep focus inside the dialog while open */
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = modal.querySelectorAll("button, a[href], input, [tabindex]");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  });
}

/* ---------- Filter tabs (events page) ---------- */
export function initFilterTabs(onChange) {
  const tabs = document.querySelectorAll(".filter-tabs button");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
      onChange(tab.dataset.filter);
    });
  });
}

/* ---------- Header scroll state ---------- */
export function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", update, { passive: true });
  update();
}
