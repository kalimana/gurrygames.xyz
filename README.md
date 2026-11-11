# GurryGames.xyz

Static teaser site for Gurry Games. One page plus a matching 404, no framework, no build
step, no package manager. What is in the repository is what GitHub Pages serves.

Live at **https://gurrygames.xyz/**.

## The design

v3 is a late-night studio transmission: near-black and oxblood, one warm crimson light,
a monitor still on, the catalogue switched off. The page is a single editorial sequence —
hero, catalogue vault, a cream studio slab, closing statement — with glass panels, a fine
grain overlay, self-hosted variable type and restrained motion.

- **Type:** Archivo variable for the wordmark and interface; Source Serif 4 variable for
  headings and reading copy. Both are served locally from `assets/fonts/`, so there is no
  Google Fonts request at runtime.
- **Colour:** `#080303` ground, `#f7eae2` ink, `#c8a49c` body, `#ff4a3d` accent, and a
  single `#f3e7de` paper slab for the studio.
- **Motion:** boot curtain, reading progress, scroll reveals, parallax, card tilt, pointer
  spotlight, scrollspy, a CSS ticker and small hover states. All of it is progressive
  enhancement and all of it is disabled under `prefers-reduced-motion`.

The full build contract — layout, tokens, interactions, accessibility and QA — is in
[`docs/v3-spec.md`](docs/v3-spec.md).

## File map

| Path | What it is |
|---|---|
| `index.html` | The public site: hero, catalogue status, studio, closing |
| `404.html` | Not-found page using the same shell and stylesheet |
| `css/gurry.css` | The entire design system: tokens, layout, motion, reduced-motion, print |
| `js/site.js` | All interactions. One IIFE, no dependencies |
| `assets/fonts/` | Self-hosted variable WOFF2 subsets (latin) |
| `assets/opt/` | The optimised images the live pages load, plus the social card |
| `assets/` | Original source art. Kept for remasters, not loaded by live pages |
| `archive/` | Retired v1 game pages and assets. Local only — not published, not linked |
| `docs/v3-spec.md` | Build contract: concept, tokens, anatomy, interactions, QA |
| `qa/` | Screenshots and local QA output. Not part of the site |
| `tools/build-hero.py` | Generates the hero plate, studio plate and OG card from `king.png` |
| `tools/build-assets.py` | Legacy v1/v2 asset pipeline. Not used by the current pages |
| `tools/qa-check.py` | Static checks: encoding, classes, markup, refs, sitemap, leaks |

Root plumbing: `favicon.ico`, `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll`.

## Preview locally

From the repository root:

```sh
python -m http.server 8080
```

Open <http://127.0.0.1:8080/>. The site uses root-relative URLs (`/css/gurry.css`,
`/assets/opt/hero-panel.webp`), so serve the directory — opening `index.html` from disk
will miss the stylesheet and images.

## Editing

- **Copy** lives directly in `index.html`. The page is deliberately small; there is no CMS
  and no data file.
- **Anchors** are `#main`, `#catalogue` and `#studio`. The header, mobile menu and footer
  link to them. Keep the three in sync if sections are renamed.
- **Theme** is controlled by the token block at the top of `css/gurry.css` and the two
  `@font-face` families below it.
- **Motion** is split between CSS transitions/keyframes and the guarded observers in
  `js/site.js`. Every effect has a reduced-motion path; preserve it when adding new ones.
- **404** mirrors the home shell. If the header or footer changes, change both pages.

## Images and fonts

```sh
python tools/build-hero.py
python tools/build-hero.py --preview
```

`build-hero.py` crops `assets/king.png`, applies the duotone, grain, vignette and edge fade,
and writes:

- `assets/opt/hero-panel.webp` — 1400×1750, ~50 KB
- `assets/opt/hero-panel-sm.webp` — 700×875, ~18 KB
- `assets/opt/desk.webp` — 1200×1200, ~32 KB
- `assets/opt/og-home.jpg` — 1200×630, ~63 KB social card

The hero `<img>` and its `<link rel="preload">` share the same `srcset` and `sizes`; keep
them matched or the browser will fetch the image twice and log a preload warning. The desk
image is lazy-loaded and has explicit `width`/`height`.

The fonts are already subset to latin. If they are replaced, keep the same family names,
weight ranges and file paths, or update both the `@font-face` blocks and the preloads.

## Deploy

Push to `main` on `github.com/kalimana/gurrygames.xyz`. GitHub Pages serves the repo root
at the custom domain `gurrygames.xyz`. There is nothing to compile.

Commit asset changes with the HTML that references them. The Pages CDN can serve stale
HTML for a minute or two; verify with a `?v=` query if a change appears missing.

## QA

```sh
node --check js/site.js
python tools/qa-check.py
```

`qa-check.py` verifies encoding, class coverage, markup hygiene, local asset references,
sitemap/robots rules and that no retired game titles leak into the live pages.

Browser checks performed for v3: 320×640, 390×844, 768×1024, 1024×768, 1280×720,
1366×768, 1440×900, 1536×864, 1920×1080 and 2560×1440. No horizontal overflow; the hero
and ticker fit the fold; the mobile menu, anchors, focus restoration, 404 page and
reduced-motion mode were exercised in Chromium. Console is clean.

## Adding a game back later

The retired pages live in `archive/v1/pages/` on the working copy — they are deliberately
not in this repo, and they also sit in this repo's git history from before the relaunch.
They were built for v1: they reference the original art in `assets/` and carry their own
inline CSS, so they will not match the current site as-is.

Remaster each one onto `css/gurry.css` with the current header and footer, then link it
from the homepage and add its URL to `sitemap.xml`. Until that happens, keep them out of
both.

## Notes

- `robots.txt` allows `/` and disallows `/archive/`, `/docs/`, `/tools/` and `/qa/`.
  None of those are linked from any page, and `sitemap.xml` lists only the homepage.
- Those folders are still ordinary files in a Pages repo, so they are reachable by direct
  URL. Keep anything genuinely private out of the repo rather than relying on `robots.txt`.
- No cookies, analytics, third-party scripts or network calls.