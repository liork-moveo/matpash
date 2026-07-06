# מתפ״ש — Demo 1 · Designer Handover

Everything the next designer (and their Claude Code) needs to run, understand, and
continue this prototype. Read this top-to-bottom once; it takes ~5 minutes.

---

## 0. TL;DR — get it running in 30 seconds

```bash
# from THIS folder (matpash-prototype/demo-1/)
cd "matpash-prototype/demo-1"
python3 -m http.server 8000
```

Open **http://localhost:8000/** in a browser, then **switch to a mobile viewport
(~390 × 844)** — DevTools device toolbar (⌘⇧M in Chrome) or a narrow window.

- ⚠️ **Must be served over HTTP.** Opening `index.html` as a `file://` breaks the
  `<video>` elements. Any static server works (Python, `npx serve`, Live Server…).
- ⚠️ **It's a phone design.** At desktop width it looks stretched/wrong. Always
  preview narrow.
- **Nothing to install or build.** Plain HTML + CSS + vanilla JS.

---

## 1. ⚠️ Which folder is the real one? (important)

The repo contains **two** `demo-1` folders. They are NOT the same:

| Path | What it is | Use it? |
|---|---|---|
| `matpash-prototype/demo-1/` | **← THIS folder. The active, current build.** Single-page app: `index.html` + `style.css` + `app.js`. | ✅ **Edit here.** |
| `demo-1/` (repo root) | Old multi-file version (`matpash-map.html`, `matpash-role.html`…). This is what's published to GitHub Pages. | ❌ Legacy. Don't edit unless re-publishing. |

All work described in this handover lives in **`matpash-prototype/demo-1/`**.
Demo 1 is also live online (the *old* version): https://roiyot26.github.io/matpash-demo-1/

---

## 2. What this prototype is

A **mobile-only, RTL (Hebrew)** brand/experience prototype for מתפ״ש (Coordinator of
Government Activities in the Territories). It is a single HTML page with JS-driven,
scroll-hijacked "full-page" navigation through four vertical sections, plus two
tap-in sub-screens.

**The four scroll sections (top → bottom):**
1. **Hero / intro** — tagline + headline, one animated monitor icon.
2. **Mosaic** — tile-mosaic dashboard of roles; bouncing scroll-cue arrows.
3. **Map** — cinematic map with a Figma-exact location pin; a horizontal
   **carousel** pans between 4 points (נפח → קריה → איו״ש → שדה תימן), RTL loop.
4. **גיוס והכשרה (Recruitment & Training) stepper** — a 4-step click-through
   accordion with a right-side timeline, and a footer with WhatsApp + social links.

**Two tap-in sub-screens:**
- **Role pages** — tapping a mosaic tile opens a role detail view.
- **Locations map** — tapping the small map thumbnail opens a full locations map
  with 3 photo pins and an up-arrow to return.

---

## 3. Files & structure

```
matpash-prototype/demo-1/
├── index.html          ← markup for all views (284 lines)
├── style.css           ← all styling + design tokens (561 lines)
├── app.js              ← all behavior: scroll-hijack, carousel, stepper, sub-screens (813 lines)
├── HANDOVER.md         ← this file
└── assets/
    ├── fonts/          ping-hl-bold.otf, ping-hl-light.otf   (local Hebrew brand font "Ping HL")
    ├── icons/
    │   ├── hero/       1–8.svg          (monitor/animated hero icons)
    │   ├── steps/      step-tironut/kurs/tafkid/shibutz.svg  (stepper timeline badges)
    │   ├── social/     whatsapp.svg, instagram.svg, tiktok.svg  (stepper footer)
    │   ├── role-*.svg  (8 role icons: bitachoni, dovrut, ezrahi, kishrei, meyda, mivtsaim, pikud, tashtit)
    │   └── logo.png
    ├── maps/           locations-map.png, pin-photo.png, aiosh/kirya/sde-teiman.png
    ├── posters/        video poster stills + matpash-try1.jpg (stepper photo), map-2.jpg
    ├── thumbs/         nafach/kirya/ayosh/sde-teyman.png (map carousel point thumbnails)
    └── videos/         map-2.mp4, matpash-try1.mp4, dovrut/ezrahi/meyda.mp4
```

Total folder size ≈ 53 MB (mostly the `.mp4` videos). All assets are **local and
committed** — copy the whole folder and it works offline (except the web font, see below).

---

## 4. Dependencies

- **None to install.** No npm, no build step, no framework.
- **Google Fonts "Assistant"** is loaded via `<link>` in `index.html` (needs internet).
  It's the primary UI font. If offline, it gracefully falls back to the **local
  "Ping HL"** brand font (`assets/fonts/*.otf`, declared `@font-face` in `style.css`)
  and then Arial Hebrew. So the demo runs offline — text just renders in the fallback.
- **No Mapbox / no API tokens** in Demo 1. (That's Demo 2 — different folder,
  irrelevant here.) The "map" sections use a video + PNGs, not a live map.

---

## 5. How the code works (architecture)

### Views
Markup for every screen lives in `index.html`. Views are toggled with an `.active`
class and `body.dataset.view` (`home` / `role` / `places` / `frozen`). Hash routing
(`#home`, etc.) drives it. When a sub-screen like the locations map is open,
`body.dataset.view` is set to `places`, which **pauses the scroll-hijack**.

### Scroll-hijack "full-page" navigation (in `app.js`)
The four sections are stacked and the body is tall (`7vh` of scroll track). JS reads
`scrollY` and snaps between fixed stops:

```js
const STOP_VH = [0, 2, 4, 6];   // scrollY (in vh) of hero · mosaic · map · stepper
const MAP_SECTION = 2;          // the carousel only lives on the map section
```

`frame()` (app.js:448) is the master render function. It computes three progress
ratios from scroll position and drives every cross-section animation:
- `raw1` — hero → mosaic assembly (0→2vh)
- `raw2` — mosaic exit → map reveal (2→4vh) — mosaic tiles clear, map fades in beneath
- `raw3` — map → stepper (4→6vh)

It also flies the **logo** across sections (nav → mosaic tile → map pin → stepper
nav bar) by interpolating positions and cross-fading CSS vars `--emblem-op` /
`--nav-logo-op`.

### Map carousel
Horizontal swipe/arrow across the 4 map points. Pan uses a **lerp-glide inertia**
loop (`mapGlide()`), tuned by `MAP_SMOOTH = 0.08` (lower = slower glide) with an
`850ms` cooldown (`carLocked`) between points so it doesn't skip. RTL: `ArrowLeft`
advances forward.

### Stepper (גיוס והכשרה)
`buildGiyus()` (app.js:195) renders 4 steps into `#giyusStepper`. Clicking a step
calls `setGiyusActive(i)`: the active step becomes a dark card
(heading + description + **inline photo**), the others collapse to bordered pills.
`layoutTimeline()` positions the right-side rail so it spans the first→last dot,
and re-runs after 400 ms to re-align once the expand transition settles.

Smooth-height without jerkiness uses the **CSS grid `0fr → 1fr` trick** (an inner
`overflow:hidden` wrapper), not `max-height`. Transitions are a unified `0.6s`. The
active card uses `21px` vertical padding so the heading stays vertically centred and
doesn't "jump" during expand.

### Locations sub-screen
`buildPlaces()` / `openPlaces()` / `closePlaces()`. `PLACES_PINS` holds the 3 photo
pins as `{l, t}` percentages over `locations-map.png`.

---

## 6. Design tokens — where to change colors/fonts

Top of `style.css`, the block marked:

```css
/* ---- Design tokens (EDIT HERE) ---- */
```

Key values in use:
- Cream background / nav color: **`#FFFCF8`** (`--c-cream`). All nav bars use this,
  with **no stroke and no shadow** (deliberate).
- Dark card / ink: **`#4a4847`**.
- Mosaic scroll-cue arrow color: **`#FBF1E8`**.
- Fonts: `"Assistant","Ping HL","Arial Hebrew",Arial,sans-serif`.

---

## 7. Section-by-section: what's built & the fine details

These are decisions already locked in — don't "fix" them by accident.

**Mosaic**
- Bouncing scroll-cue arrows in the frame, color `#FBF1E8`.
- Scrolling down clears the mosaic tiles at **full opacity** (no fade on the tiles);
  the **map** underneath is what fades in. Map sits fixed beneath the mosaic.
- The mosaic logo does not disappear — it travels into the white map pin.

**Map**
- The pin is a **pixel-exact rebuild of Figma node 1101:7330**: teardrop + emblem +
  a separate dot marker with radial halo / white ring / dark dot. The pin and its
  dot are **static (no bounce)** — this was an explicit request.
- The **small map thumbnail's drop floats** up-and-down continuously
  (`@keyframes markerFloat`, ±3px) to signal it's tappable. Only the thumbnail drop
  animates, not the main map pin.
- Carousel order נפח → קריה → איו״ש → שדה תימן, RTL loop, slowed glide (see §5).
- The map video color is the **original tone** (`#d9cbb8` backing). An earlier
  white/grayscale filter experiment was reverted — don't re-add a filter.

**Stepper (גיוס והכשרה)** — from Figma node **1109-8115** (footer **1105-7983**)
- 4 steps, single-open accordion. Active = dark card w/ heading + description +
  **inline photo** (photo sits next to/under the dark card).
- Right-side **timeline**: hollow-ring dots + a solid segmented rail; dots are
  **top-aligned to the top edge of the dark card**; the active step's dot becomes a
  larger icon badge.
- Exact Figma spacing: heading→text **3px**, title→tabs **29px**, tabs→stepper
  **25px**, step gap **10px**. Top tabs are **right-aligned** (RTL `flex-start`).
- Footer (`direction:ltr`): WhatsApp **"דברו איתנו"** pill on the **LEFT**,
  Instagram + TikTok circles on the **RIGHT**.
- Blue tap-highlight flash removed (`-webkit-tap-highlight-color:transparent`).

**Locations map sub-screen** — from Figma node **1050-5434**
- Opened by tapping the map thumbnail. Styled locations map + 3 bouncing photo pins
  + an up-arrow to return.

**Cross-section motion**
- The logo flies from nav → mosaic → map pin → stepper nav bar as you scroll,
  regardless of which carousel point you're on.
- An earlier idea to **morph the dark map card into the next section's tab was
  cancelled** — the morph target is hidden. Don't reinstate it.

---

## 8. Figma references

Node IDs used while building (open in the מתפ״ש Figma file via the Figma MCP or the
Figma app):
- Map pin: **1101:7330**
- Recruitment stepper: **1109-8115**
- Stepper footer: **1105-7983**
- Locations map screen: **1050-5434**

---

## 9. Testing & gotchas (learned the hard way)

- **Always test at mobile width** (~390×844). Desktop width is not representative.
- **Hard-refresh after editing** `app.js` / `style.css` — the browser caches them
  aggressively. Use ⌘⇧R (Chrome/Safari).
- **The scroll-hijack fights automated browsers.** Driving the scroll animation from
  a headless/preview browser can freeze/pause CSS transitions, so scroll-driven
  behavior is hard to verify programmatically. To inspect an end state, set
  `body.dataset.view='frozen'` and force the target section visible, then measure.
- The stepper accordion is inherently a reflow (opening one step pushes others).
  The current build minimizes the visible "jump" via the grid-height trick + active
  padding. A fully shift-free version was prototyped (photo pinned below the whole
  list) but **the client reverted to the inline photo** — that's the current, desired
  state.
- Videos are the bulk of the folder size; keep them when copying or the map/role
  sections go blank.

---

## 10. Where we left off (current state)

Everything above is **implemented, reviewed, and matches the client's latest
decisions.** The most recent change was reverting the stepper so the **photo is
inline next to the active dark card** (undoing a "photo pinned below the list"
experiment). The smoothing polish (unified 0.6s transitions, grid-height expand,
heading-centered active padding) was kept.

**No open tasks.** One thing to confirm with the client if they raise it again: they
briefly mentioned the timeline "connect the lines to the dots, length = distance
between dots" — that is *already* how it works (`layoutTimeline()` sizes the rail
between the first and last dot, dots top-aligned) — but they retracted it in favor of
the revert, so leave it unless they re-ask.

---

## 11. For the next Claude Code — quick-start prompt

> This is `matpash-prototype/demo-1/` — a mobile-only RTL Hebrew static prototype
> (plain HTML/CSS/vanilla JS, no build). Serve it over HTTP
> (`python3 -m http.server 8000`) and preview at ~390×844. All markup is in
> `index.html`, all styling + design tokens at the top of `style.css`, all behavior
> (scroll-hijack `frame()`, map carousel, `buildGiyus()` stepper, `openPlaces()`
> locations screen) in `app.js`. Read `HANDOVER.md` first. Hard-refresh after every
> CSS/JS edit — the browser caches aggressively. Don't edit the legacy root
> `demo-1/` folder.
