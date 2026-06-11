/* ============================================================
   LFCD — Renderers
   Every piece of content on the site is rendered here from
   the /data JSON files. Markup in the HTML pages is structure
   only; copy, facts, figures, and records all flow from data.
   ============================================================ */

import { fmt } from "./data.js";
import { openModal } from "./components.js";

const $ = (sel, root = document) => root.querySelector(sel);

/* ---------- Hero (home) ---------- */
export function renderHero(district) {
  $("#hero-kicker").textContent = district.hero.kicker;
  $("#hero-title").innerHTML =
    district.hero.title.replace("second act", "<em>second act</em>");
  $("#hero-lede").textContent = district.hero.lede;
  $("#hero-welcome").textContent = district.hero.welcome;
  renderStatusChips(district);
}

/* Status is data-driven everywhere it appears */
export function renderStatusChips(district) {
  document.querySelectorAll("[data-status-chip]").forEach((el) => {
    el.textContent = district.status.label;
  });
  document.querySelectorAll("[data-status-detail]").forEach((el) => {
    el.textContent = `${district.status.detail} (As of ${district.status.asOf}.)`;
  });
}

/* ---------- Story chapters ---------- */
export function renderStory(district) {
  district.story.forEach((ch) => {
    const sec = document.querySelector(`[data-chapter="${ch.id}"]`);
    if (!sec) return;
    $(".kicker", sec).textContent = ch.kicker;
    $("h2", sec).textContent = ch.title;
    $(".chapter__body", sec).textContent = ch.body;
    const note = $(".chapter__note", sec);
    if (note && ch.note) note.textContent = ch.note;
  });
}

/* ---------- Program stat band ---------- */
export function renderProgramStats(metrics) {
  const wrap = $("#program-stats");
  if (!wrap) return;
  const p = metrics.program;
  const stats = [
    { v: p.creditRatePct, fmt: "percent", label: "of qualified rehabilitation costs returned as a state credit" },
    { v: p.ruralRatePct, fmt: "percent", label: "in rural areas" },
    { v: p.carryforwardYears, fmt: "plain", suffix: " yrs", label: "carryforward — and the credit is fully transferable" },
    { v: p.annualCap, fmt: "currency-m", label: "annual program cap" },
    { v: 2028, fmt: "plain", label: "program sunsets December 31, 2028", raw: true },
  ];
  wrap.innerHTML = stats
    .map(
      (s) => `<div class="stat">
        <div class="stat__value" data-count="${s.v}" data-count-format="${s.fmt}"${s.suffix ? ` data-count-suffix="${s.suffix}"` : ""}${s.raw ? ` data-count-done="2028"` : ""}>0</div>
        <div class="stat__label">${s.label}</div>
      </div>`
    )
    .join("");
}

/* ---------- Honest zeros + comparison bars ---------- */
export function renderHonestNumbers(metrics) {
  const head = $("#zeros-explainer");
  if (head) head.textContent = metrics.honestZeros.explainer;

  const barsWrap = $("#comparison-bars");
  if (!barsWrap) return;
  const max = Math.max(...metrics.comparison.map((c) => c.value));
  barsWrap.innerHTML = metrics.comparison
    .map((c) => {
      const pct = max ? Math.max((c.value / max) * 100, 0) : 0;
      const zero = c.value === 0;
      return `<div class="bar${zero ? " bar--zero" : ""}">
        <div class="bar__meta">
          <span class="bar__label">${c.label} <span class="bar__sub">· ${c.sub}</span></span>
          <span class="bar__value">${fmt.currency(c.value)}</span>
        </div>
        <div class="bar__track"><div class="bar__fill" data-width="${pct.toFixed(2)}"></div></div>
      </div>`;
    })
    .join("");
}

/* ---------- Worked example receipt ---------- */
export function renderWorkedExample(district) {
  const wrap = $("#worked-example");
  if (!wrap) return;
  const ex = district.workedExample;
  $("#worked-title").textContent = ex.title;
  $("#worked-note").textContent = ex.note;
  $("#worked-transfer").textContent = ex.transferNote;
  wrap.innerHTML = ex.rows
    .map((r, i) => {
      const last = i === ex.rows.length - 1;
      const credit = r.sign === "-";
      return `<div class="receipt__row${last ? " receipt__row--total" : ""}">
        <span>${r.label}</span>
        <span class="receipt__amount${credit ? " is-credit" : ""}">${r.sign === "-" ? "−" : ""}${fmt.currencyExact(r.amount)}</span>
      </div>`;
    })
    .join("");
}

/* ---------- Eligibility ---------- */
export function renderEligibility(district) {
  const wrap = $("#eligibility-grid");
  if (!wrap) return;
  wrap.innerHTML = district.eligibility
    .map(
      (e) => `<div class="elig-cell">
        <h4>${e.requirement}</h4>
        <p>${e.meaning}</p>
      </div>`
    )
    .join("");
}

/* ---------- Is / Is-not ---------- */
export function renderIsIsNot(district) {
  const isList = $("#is-list");
  const notList = $("#isnot-list");
  if (!isList || !notList) return;
  isList.innerHTML = district.isIsNot.is.map((t) => `<li>${t}</li>`).join("");
  notList.innerHTML = district.isIsNot.isNot.map((t) => `<li>${t}</li>`).join("");
}

/* ---------- Asset / property cards ---------- */
function field(label, value, placeholderText) {
  const v =
    value == null || value === ""
      ? `<span data-placeholder>${placeholderText || "To be researched"}</span>`
      : value;
  return `<div><dt>${label}</dt><dd>${v}</dd></div>`;
}

function assetDetailHTML(item, disclaimer) {
  const isAnchor = item.type === "anchor";
  const photos = (item.photos || []).length
    ? item.photos.map((p) => `<img src="${p}" alt="${item.name}">`).join("")
    : `<div class="photo-placeholder">Photo<br>coming soon</div>
       <div class="photo-placeholder">Photo<br>coming soon</div>`;
  return `
    <p class="kicker">${isAnchor ? "District anchor" : "Corridor building"}</p>
    <h2 style="font-size:var(--step-3)">${item.name}</h2>
    ${item.summary ? `<p class="lede" style="font-size:var(--step-0)">${item.summary}</p>` : ""}
    <dl class="detail-fields">
      ${field("History", item.history, "Short history to be written with community input")}
      ${field("Year built", item.yearBuilt ? `${item.yearBuilt}${item.turns50 ? ` — turns 50 in <strong>${item.turns50}</strong>` : ""}` : null, "To be confirmed")}
      ${field("Current owner", item.owner, "To be confirmed")}
      ${field("Historic status", item.historicStatus, "Assessment pending")}
      ${field("Cultural significance", item.significance, "To be documented in the asset assessment")}
      ${!isAnchor ? field("Building area", fmt.sqft(item.buildingSqFt)) : ""}
      ${!isAnchor ? field("Land area", fmt.sqft(item.landSqFt)) : ""}
      ${!isAnchor ? field("Assessed value (2026)", item.assessedTotalValue ? fmt.currencyExact(item.assessedTotalValue) : null, "To be confirmed") : ""}
      ${!isAnchor && item.construction ? field("Notes", item.construction) : ""}
      ${!isAnchor ? field("Parcel", item.parcelId) : ""}
    </dl>
    <h4 style="margin-top:var(--space-m)">Photos &amp; visual assets</h4>
    <div class="detail-photos">${photos}</div>
    <p style="margin-top:var(--space-m);font-size:0.8rem;color:var(--ink-soft)">${disclaimer}</p>`;
}

export function renderAssets(projects) {
  const wrap = $("#asset-grid");
  if (!wrap) return;
  const discl = $("#assets-disclaimer");
  if (discl) discl.textContent = projects.disclaimer;

  const anchors = projects.anchors.map(
    (a) => `<button class="asset-card asset-card--anchor" data-asset-id="${a.id}" type="button">
      <span class="asset-card__year"><small>District anchor</small>◆</span>
      <span class="asset-card__name">${a.name}</span>
      <ul class="asset-card__facts"><li>${a.summary}</li></ul>
      <span class="asset-card__cta">Open detail →</span>
    </button>`
  );

  const props = projects.properties.map(
    (p) => `<button class="asset-card" data-asset-id="${p.id}" type="button">
      <span class="asset-card__year"><small>Turns 50 in</small>${p.turns50}</span>
      <span class="asset-card__name">${p.name}</span>
      <ul class="asset-card__facts">
        <li>${p.owner}</li>
        <li>${fmt.sqft(p.buildingSqFt)} building · ${fmt.sqft(p.landSqFt)} land</li>
      </ul>
      <span class="asset-card__cta">Open detail →</span>
    </button>`
  );

  wrap.innerHTML = [...anchors, ...props].join("");

  const all = [...projects.anchors, ...projects.properties];
  wrap.querySelectorAll("[data-asset-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const item = all.find((x) => x.id === card.dataset.assetId);
      if (item) openModal(assetDetailHTML(item, projects.disclaimer));
    });
  });
}

/* ---------- Visualization sets ---------- */
export function renderVisualizations(projects) {
  const wrap = $("#viz-sets");
  if (!wrap) return;
  const viz = projects.visualizations;
  $("#viz-disclaimer").textContent = viz.disclaimer;

  wrap.innerHTML = viz.sets
    .map(
      (set) => `<div class="viz-set" data-stage-viewer>
        <h3>${set.title}</h3>
        <p class="viz-sub">${set.subtitle}</p>
        <div class="stage-viewer">
          <div class="stage-viewer__frame">
            <span class="badge badge--viz">Concept visualization</span>
            ${set.stages
              .map(
                (s, i) =>
                  `<img src="${s.image}" alt="${set.title} — ${s.label}" loading="lazy" class="${i === 0 ? "is-active" : ""}">`
              )
              .join("")}
          </div>
          <div class="stage-tabs" role="tablist" aria-label="${set.title} stages">
            ${set.stages
              .map(
                (s, i) =>
                  `<button role="tab" aria-selected="${i === 0}" type="button">${s.label}</button>`
              )
              .join("")}
          </div>
        </div>
      </div>`
    )
    .join("");
}

/* ---------- Events ---------- */
const icons = {
  calendar: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="flex:none"><rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M1.5 6h13M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.6"/></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="flex:none"><path d="M8 14.5S3 9.8 3 6.3a5 5 0 0 1 10 0c0 3.5-5 8.2-5 8.2z" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="6.3" r="1.7" fill="currentColor"/></svg>`,
};

function eventCardHTML(ev, type) {
  const special = type === "special";
  const when = special ? `${ev.date}${ev.time && ev.time !== "TBD" ? " · " + ev.time : ""}` : ev.schedule;
  return `<article class="event-card ${special ? "event-card--special" : ""}" data-event-type="${type}">
    <div class="event-card__meta">
      <span class="event-card__type">${special ? "Special event" : "Recurring"}</span>
      ${ev.sample ? `<span class="badge badge--sample">Sample</span>` : ""}
    </div>
    <h3 style="font-size:var(--step-1)">${ev.title}</h3>
    <div class="event-card__meta">
      <span style="display:inline-flex;align-items:center;gap:0.4rem">${icons.calendar} ${when}</span>
      <span style="display:inline-flex;align-items:center;gap:0.4rem">${icons.pin} ${ev.location}</span>
    </div>
    <p style="font-size:var(--step--1);color:var(--ink-soft)">${ev.description}</p>
  </article>`;
}

export function renderEvents(events, { teaserOnly = false } = {}) {
  const note = $("#events-note");
  if (note) note.textContent = events.programmingStatus;

  const wrap = $("#events-grid");
  if (!wrap) return;

  let special = events.special.map((e) => eventCardHTML(e, "special"));
  let recurring = events.recurring.map((e) => eventCardHTML(e, "recurring"));
  if (teaserOnly) {
    wrap.innerHTML = [...special.slice(0, 2), ...recurring.slice(0, 1)].join("");
    return;
  }
  wrap.innerHTML = [...special, ...recurring].join("");
}

export function filterEvents(type) {
  document.querySelectorAll("#events-grid [data-event-type]").forEach((card) => {
    card.style.display = type === "all" || card.dataset.eventType === type ? "" : "none";
  });
}

/* ---------- Map ---------- */
export function renderMap(mapData) {
  const focused = $("#map-focused");
  if (focused) {
    focused.src = mapData.staticMaps.focused.image;
    focused.alt = mapData.staticMaps.focused.alt;
  }
  const focusedCap = $("#map-focused-caption");
  if (focusedCap) focusedCap.textContent = mapData.staticMaps.focused.caption;

  /* Before/after map comparison */
  const cmpBroad = $("#cmp-broad");
  const cmpFocused = $("#cmp-focused");
  if (cmpBroad) {
    cmpBroad.src = mapData.staticMaps.broad.image;
    cmpBroad.alt = mapData.staticMaps.broad.alt;
  }
  if (cmpFocused) {
    cmpFocused.src = mapData.staticMaps.focused.image;
    cmpFocused.alt = mapData.staticMaps.focused.alt;
  }

  document.querySelectorAll("[data-endpoint-from]").forEach((el) => (el.textContent = mapData.corridor.from.name));
  document.querySelectorAll("[data-endpoint-to]").forEach((el) => (el.textContent = mapData.corridor.to.name));
}

/* ---------- Footer ---------- */
export function renderFooter(district) {
  const line = $("#footer-line");
  if (line) line.textContent = district.footer.line;
  const disc = $("#footer-disclaimer");
  if (disc) disc.textContent = district.footer.disclaimer;
  const facts = $("#footer-facts");
  if (facts) {
    facts.innerHTML = [district.facts.act, district.facts.artExemptionEliminated]
      .map((f) => `<p>${f}</p>`)
      .join("");
  }
}
