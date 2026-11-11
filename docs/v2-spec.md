# GurryGames v2 — build contract

Static site. No framework, no build step, no npm dependencies. Every page links
`/css/gurry.css` and `/js/site.js`. **No `<style>`, no inline `style=`, no inline event handlers.**

Host: GitHub Pages on `https://gurrygames.xyz`, served from the repo root.
All internal URLs root-relative: `/`, `/#games`, `/#studio`.

## 1. Scope

v2 is a **single-page studio notice**. The four v1 game pages, `vote.html` and the prank
asset live in `archive/v1/` on the working copy and are not published. No game titles,
posters, downloads or trailers appear anywhere. The only public statement about games is
the "Games coming soon" section.

## 2. Design direction

The page is an editorial spread, not a product landing page: type on the left, a photograph
of the desk bleeding off the right edge. The wordmark is the loudest thing on the page and
the only display type. Sections below it stay quiet and factual.

**Banned, because they read as machine-made:** feature-card grids; numbered section markers;
small all-caps labels above headings; monospace micro-labels; marquee tickers; outlined or
gradient-filled display type; centred hero with two buttons; icon sets; scroll-reveal
animations; glass, glow or vignette overlays; piles of hairline rules.

The two photographs are duotoned, lightly grained and edge-faded in `tools/build-hero.py`.
That treatment is baked into the WebP files. No grain, gradient or vignette is applied in CSS.

**Palette** (four values, a band tint, plus two rule tints):

```
--bg        #0f0404   page
--bg-soft   #140505   the games band
--ink       #ffecec   headings, wordmark, key values
--muted     #d49b9b   body text
--dim       #ac7474   captions, fine print, table labels
--accent    #ff4d4d   status dots, focus ring, 404 numeral
--line      rgba(255,80,80,.14)
--line-2    rgba(255,80,80,.28)
```

**Type** — two families, one Google request:

`family=Archivo:wght@400;500;700;900&family=Source+Serif+4:ital,wght@0,400;0,600;1,400`

- Archivo 900: the two-line `h1` wordmark, header brand, footer brand, 404 numeral.
- Archivo 500: navigation, status values, captions, legal.
- Source Serif 4 600: `h2` section headings.
- Source Serif 4 400: body copy. Italic 400: the lede's companion note and status labels.

Body 18px/1.6, measure ≤ 46ch in the studio section and ≤ 40ch in the games section. The
`h1` is two lines, `GURRY` / `GAMES`, sized to fill its column:
`clamp(3.1rem, 25.5cqw, 11rem)` with `letter-spacing: -.038em` and `line-height: .84`.
The `cqw` value is read from the `.hero-copy` container; a `10vw` fallback is declared first
for browsers without container query units.

## 3. Files

| Path | Owner |
|---|---|
| `archive/` (retired pages, local only) | not published |
| `css/gurry.css` | stylesheet |
| `js/site.js` | footer year only |
| `index.html` | homepage |
| `404.html` | error page |
| `tools/build-hero.py` | crops and tones the two live photographs |
| `robots.txt`, `sitemap.xml`, `README.md`, `CNAME`, `.nojekyll` | plumbing |

## 4. Images

Three files are loaded from `assets/opt/`:

- `hero-panel.webp` 1600×1900 — the left monitor and keyboard, duotone, right edge faded.
  Absolute panel from 52vw to the right edge on desktop; full-width band above the copy
  below 780px.
- `desk.webp` 1200×1200 — the right-hand laptop, headphones and die, square.
- `og-home.jpg` 1200×630 — social card, referenced by meta tags only.

`king.webp` is no longer loaded by a page. `hero.webp`, `plate.webp` and `logo.webp` are not
loaded either; they stay in `assets/opt/` for later use. The two live photographs are generated
from `assets/king.png` by `python tools/build-hero.py`.

## 5. Header

```html
<a class="skip" href="#main">Skip to content</a>
<header class="head">
  <div class="head-inner">
    <a class="brand" href="/"><span>GURRY GAMES</span></a>
    <nav class="nav" aria-label="Main">
      <a href="/#games">Games</a>
      <a href="/#studio">Studio</a>
    </nav>
  </div>
</header>
```

Static (not sticky), one hairline bottom border. No hamburger: two links fit at 320px, so
the menu never hides.

## 6. Footer

```html
<footer class="foot">
  <div class="wrap foot-inner">
    <p class="foot-brand">GURRY GAMES</p>
    <nav class="foot-nav" aria-label="Footer">
      <a href="/#games">Games</a>
      <a href="/#studio">Studio</a>
    </nav>
    <p class="foot-legal">© <span id="year">2026</span> Gurry Games<br>No cookies, no analytics.</p>
  </div>
</footer>
```

## 7. Class inventory — every class must exist in `css/gurry.css`

`wrap` `head` `head-inner` `brand` `nav`

`hero` `hero-inner` `hero-copy` `wordmark` `lede` `hero-status` `hero-art`

`block` `games` `games-copy` `section-note` `status` `off`
`studio` `studio-art` `studio-copy`

`foot` `foot-inner` `foot-brand` `foot-nav` `foot-legal`

`error` `err-code` `err-title` `err-back`

`skip` `sr-only`

Deleted since the first pass: `btn*`, `hero-*` (the old landing-page set), `ticker*`,
`coming-*`, `sec-*`, `eyebrow`, `reveal`, `intro`, `band`, `split`.

## 8. Page structure

```
header.head
main#main
  section.hero
    .wrap.hero-inner > .hero-copy
      h1.wordmark             GURRY / GAMES, two lines
      p.lede                  one sentence, two to three lines
      p.hero-status           red dot + "Next release not announced"
    figure.hero-art
      img hero-panel.webp     1600×1900, alt describes the desk
  section.block#games > .wrap.games
    .games-copy > h2 "Games coming soon" + p + p.section-note
    dl.status                 4 rows: Next release / Catalogue / Platform / Last update
  section.block#studio > .wrap.studio
    figure.studio-art
      img desk.webp           1200×1200, alt describes the desk
      figcaption              "Studio desk."
    .studio-copy > h2 "Studio" + two paragraphs
footer.foot
script js/site.js defer
```

Exactly one `h1`. Heading order `h1` → `h2`. No `h3`. No numbered markers. No card grid.

Below 780px the hero becomes a column: the photograph first, then the wordmark and copy.
The `h1` still fills the content width because it is sized from the copy container.

## 9. Copy voice

Plain, first person plural, slightly dry. State the situation instead of dressing it up.
No aphorisms, no slogans, no "atmosphere-first", no invented dates, versions, awards, team
size, socials or contact addresses. The site is allowed to say there is nothing to play.

## 10. JS contract (`js/site.js`)

- One IIFE, `'use strict'`, no dependencies, loaded with `defer`.
- `#year` → current year, guarded if the element is absent.
- Nothing else. No navigation state, no observers, no storage, no network.

## 11. Definition of done

- No horizontal overflow at 320 / 390 / 768 / 1024 / 1440 / 1920 / 2560.
- The wordmark fits the copy column at every width, with a few px of slack.
- The hero image has `width`/`height` and an `alt`; the studio image too.
- All text ≥ 4.5:1 against its own background; the games band is measured separately.
- Visible keyboard focus on every link; skip link is the first stop.
- The hero copy stays on solid `--bg`; no text sits over the photograph.
- No `<style>`, no `style=`, no `on*=` in live HTML.
- `robots.txt` allows `/` and disallows `/archive/`, `/docs/`, `/tools/`, `/qa/`.
- `sitemap.xml` contains only `https://gurrygames.xyz/`.