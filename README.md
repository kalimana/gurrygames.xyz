# GurryGames.xyz

Static teaser site for Gurry Games. One page, no framework, no build step: what is in the
repo is what GitHub Pages serves.

Live at **https://gurrygames.xyz/**.

## File map

| Path | What it is |
|---|---|
| `index.html` | The public site: hero, coming soon, studio |
| `css/gurry.css` | All styling. No inline `<style>` or `style=` in any live page |
| `js/site.js` | Prints the current year in the footer. Nothing else |
| `assets/opt/` | Optimised WebP and `og-*.jpg` files actually loaded by the site |
| `assets/` | Original source art. Kept for remasters, not loaded by live pages |
| `archive/v1/` | Retired v1 game pages, vote page and manifest. Local only — not published, not linked |
| `docs/v2-spec.md` | Build contract: brand, class inventory, markup, definition of done |
| `tools/build-assets.py` | Asset pipeline that writes `assets/opt/` |
| `tools/build-hero.py` | Crops and tones `hero-panel.webp` and `desk.webp` |

Root plumbing: `404.html`, `robots.txt`, `sitemap.xml`, `favicon.ico`.

## Preview locally

From the repo root:

```sh
python -m http.server 8080
```

Open <http://127.0.0.1:8080/>. Pages use root-relative URLs (`/css/gurry.css`,
`/assets/opt/hero-panel.webp`), so serve the directory — opening `index.html` straight from disk
will miss the stylesheet and images.

## Deploy

Push to `main` on `github.com/kalimana/gurrygames.xyz`. GitHub Pages serves the repo root at
the custom domain `gurrygames.xyz`. There is nothing to compile and no generated output to
commit apart from `assets/opt/`.

## Adding a game back later

The retired pages live in `archive/v1/pages/` on the working copy — they are deliberately not in
this repo, and they also sit in this repo's git history from before the relaunch. They were built
for v1: they reference the original art in `assets/` and carry their own inline CSS, so they will
not match the current site as-is.
Remaster each one onto `css/gurry.css` with the v2 header and footer, then link it from the
homepage and add its URL to `sitemap.xml`. Until that happens, keep them out of both.

## Assets

```sh
python tools/build-assets.py
python tools/build-hero.py
```

`build-assets.py` regenerates `assets/opt/*.webp` from the originals in `assets/`, plus the
1200×630 `og-*.jpg` social cards. `build-hero.py` cuts `hero-panel.webp` and `desk.webp`
from `assets/king.png` and applies the duotone, grain and edge fade used by the page. Both
require Pillow (`python -m pip install pillow`). The social cards use Segoe UI Bold and fall
back to Arial Bold if that font is missing.

## Notes

- `robots.txt` allows `/` and disallows `/archive/`, `/docs/`, `/tools/` and `/qa/`. None of those
  are linked from any page, and `sitemap.xml` lists only the homepage. `archive/` is not published
  at all; the other two are repo documentation and build scripts.
- They are still ordinary files in a Pages repo, so they are reachable by direct URL. Keep
  anything genuinely private out of the repo rather than relying on `robots.txt`.
