# Lake Forest Cultural District — Stakeholder Concept Site

A static HTML/CSS/JS concept site for the proposed **Lake Forest Cultural District**
in New Orleans East — the 2025 proposed boundary (Mayo Rd. · I-10 Service Rd. ·
Michoud Blvd. · Dwyer Blvd.), centered on Lake Forest Boulevard and anchored by
Joe W. Brown Memorial Park and the Audubon Louisiana Nature Center.

**Designation status is data-driven** and currently reads
*"Proposed — application in progress"* from `data/district.json`. Nothing on the site
claims the district is certified, and no placeholder presents unverified information as fact.

---

## Run it locally

The site renders its content from JSON via `fetch()`, so it needs to be served over HTTP
(opening `index.html` directly from the filesystem will show a notice instead of content):

```bash
cd LFCD
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

## Folder structure

```
/
  index.html        Homepage / Story — hero, scroll story (Orlandia → Main Street focus), map, events teaser
  map.html          Full map view — the single 2025 proposed district map
  pillars.html      The 4 Main Street Pillars — LFCD committees ↔ MSA points, governance chart, presentation download
  business.html     Businesses & partners — district map markers, anchors, directory (imports pending)
  buildings.html    Buildings & Historic Tax Credits — property records, program stats, worked example, eligibility
  events.html       Events — special vs recurring, filterable, data-driven
  artworks.html     Artworks — scaffold, content importing from lakeforestculturaldistrict.org
  committees.html   Committees — scaffold, content importing from lakeforestculturaldistrict.org
  gallery.html      Community gallery — scaffold, content importing from lakeforestculturaldistrict.org
  /css/
    tokens.css      Palette, type scale, spacing, motion tokens (edit colors here)
    base.css        Reset, typography, accessibility primitives
    components.css  Cards, modal, sliders, badges, header, footer
    sections.css    Hero, chapters, map section, page heroes
  /js/
    data.js         THE fetch layer — single seam for the future backend
    render.js       All content rendering from /data JSON
    components.js   Slider, stage viewer, modal, tabs (keyboard accessible)
    motion.js       GSAP + ScrollTrigger + Lenis choreography (reduced-motion safe)
    main.js         Per-page bootstrap
  /assets/img/      Web-optimized images extracted from the project PDFs and committee materials
  /assets/docs/     Downloadable documents (committee presentation PDF)
  /data/            ALL editable content (see below)
  README.md
```

## Editing content (no code required)

Every piece of copy, every fact, and every record lives in `/data/`:

| File | What it controls | Notes |
|---|---|---|
| `district.json` | Designation **status**, hero & story copy, the section-3 facts, is/is-not lists, worked example, eligibility table, footer | When the designation is granted, update `status.label`, `status.detail`, and `status.certified` here — it propagates to every page |
| `projects.json` | The 7 corridor properties, 2 anchors, and the rehabilitation visualization sets | Property fields: history, year built, owner, historic status, significance, photos. `null` fields render as clearly-marked placeholders |
| `events.json` | Special and recurring events | Listings with `"sample": true` get a visible **Sample** badge. Replace with real events as confirmed |
| `metrics.json` | The honest counts (including the real zeros), comparison bars, program numbers | Zeros are intentional — they are the argument |
| `map.json` | The single 2025 district map image/caption, boundary streets, **placeholder** boundary GeoJSON | Per the committee (Aug 2026): one map — the 2025 proposed map. Drop in surveyed GeoJSON when available |
| `pillars.json` | The 4 Pillars page: mission, LFCD committees ↔ MSA four points, sub-committees, outcomes, governance chart, presentation download | Sourced from the July 23, 2026 committee presentation |

### Honesty rules baked into the build

- Status defaults to **Proposed — application in progress** and is read from data everywhere.
- The eliminated original-art sales-tax exemption (Act 11, eff. Jan 1 2025) appears
  **only** as "not a current benefit" — never as a benefit.
- Missing data renders as visibly provisional (`data-placeholder` styling adds a
  "— pending" tag); photo slots show "Photo coming soon" frames.
- The assessor-data disclaimer and the visualization disclaimer from the source PDFs
  are carried verbatim and rendered next to the related content.

## Backend / GitHub / Vercel seams

The site was architected so wiring a backend means **changing one file**:

- **`js/data.js`** — the `SOURCES` map points at static JSON today; point each key at an
  API endpoint tomorrow. Every renderer reads through `loadData()`. `TODO:` comments mark
  the seam.
- **Map** (`map.html`, `data/map.json`) — the static styled map is the presentation layer;
  `map.json` already has the structure (boundary GeoJSON slot, anchor markers, corridor
  endpoints) for a Leaflet/MapLibre swap. `TODO:` comment marks the spot.
- **Events feed** — `events.json` mirrors the shape an events API would return
  (`special[]` / `recurring[]`).
- **Metrics** — `metrics.json` is ready to be replaced by a live program-data feed.
- **GitHub** — the repo is the CMS until then: edit `/data/*.json` in the GitHub UI and
  the site updates on next deploy.
- **Vercel** — deploys as a zero-config static site (`vercel` from the repo root, or
  connect the repo in the Vercel dashboard). No build step required.

## Design system

- **Palette** (CSS custom properties in `css/tokens.css`): Cream `#F4EFE0`,
  Deep Forest `#15301E`, Canopy `#234D33`, Moss `#4C7A57`, Lake Sage `#9FBC97`,
  Pale Sage `#DDE7D3`, Gold `#C29A3B`, Gold Deep `#9C7B26`.
- **Type**: Fraunces (display) + Public Sans (body), fluid type scale.
- **Motion**: GSAP + ScrollTrigger with Lenis smooth scroll, all loaded from CDN.
  `prefers-reduced-motion` disables everything; if the CDNs are unreachable the site
  renders fully static. Content is never hidden behind animation.

## Source material

Images and facts on the site were extracted from the committee's reference documents
(the June 2026 board deck, the HTC plan, parish assessor records, the rehabilitation
visualizations, and the program project records). Those reference documents are kept in the
maintainer's repository only and are **not** part of the hand-off package. The "Orlandia"
advertisement in the history chapter is reproduced from the visualization deck.

## Pending content imports

Per the committee's August 2026 direction, the **Businesses directory**, **Events**,
**Artworks**, **Committees**, and **Community gallery** pages are to be populated from
[lakeforestculturaldistrict.org](https://www.lakeforestculturaldistrict.org/). Until that
content is confirmed, those sections render a visible "Content being imported" notice —
nothing unverified is presented as fact.

## Connecting the lakeforestculturaldistrict.org domain (hand-off)

Per the Aug 25, 2026 meeting: keep the domain registered at Squarespace and point it at the
Vercel deployment — no migration of either site's content is required, and the Squarespace
pages stay fully editable at their own URLs.

1. In the Vercel project → **Settings → Domains**, add `lakeforestculturaldistrict.org`
   and `www.lakeforestculturaldistrict.org`.
2. In Squarespace → **Settings → Domains → DNS Settings** for the domain:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`
3. Vercel verifies the records and issues SSL automatically (allow up to an hour for DNS).

**Hand-off package:** run `bash handoff/build-handoff.sh` to produce
`dist/LFCD-site-handoff.zip`. It copies only an allowlist (the pages, `css/`, `js/`, `data/`,
`assets/`) plus the beginner-friendly guide in `handoff/README.md`, and it refuses to build if any
reference or pitch document slips in. Don't hand over a zip of the whole repo (GitHub's
"Download ZIP" or `git archive`): that includes the private reference documents in the repo root.
