/* ============================================================
   LFCD — Data layer
   Single fetch seam for all site content. Every page reads
   through loadData(); swapping the static JSON files for API
   endpoints later means changing only the SOURCES map below.

   TODO (backend seam): replace each static path with its API
   endpoint when the backend lands, e.g.
     district: "/api/district"
     metrics:  "/api/metrics"   <- live program metrics feed
     events:   "/api/events"    <- events feed (special + recurring)
     projects: "/api/projects"  <- project/asset records (CMS or DB)
     map:      "/api/map"       <- GeoJSON boundary + markers
   Deployment seam: this static site deploys as-is to Vercel;
   data files can also be edited directly in GitHub and served
   from the repo until an API exists.
   ============================================================ */

const SOURCES = {
  district: "data/district.json",
  projects: "data/projects.json",
  events: "data/events.json",
  metrics: "data/metrics.json",
  map: "data/map.json",
};

const cache = {};

async function fetchJSON(key) {
  if (cache[key]) return cache[key];
  const res = await fetch(SOURCES[key]);
  if (!res.ok) throw new Error(`Failed to load ${SOURCES[key]} (${res.status})`);
  cache[key] = await res.json();
  return cache[key];
}

/* Load any subset of sources: loadData("district", "metrics") */
export async function loadData(...keys) {
  const wanted = keys.length ? keys : Object.keys(SOURCES);
  const results = await Promise.all(wanted.map(fetchJSON));
  return Object.fromEntries(wanted.map((k, i) => [k, results[i]]));
}

/* ---- Formatting helpers shared by renderers ---- */
export const fmt = {
  currency(n) {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    return "$" + n.toLocaleString("en-US");
  },
  currencyExact(n) {
    return "$" + n.toLocaleString("en-US");
  },
  number(n) {
    return n.toLocaleString("en-US");
  },
  sqft(n) {
    return n == null ? null : n.toLocaleString("en-US") + " sq ft";
  },
};
