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

The site is a printed notice on a black wall, not a product landing page. The wordmark does
the work; everything else is quiet.

**Banned, because they read as machine-made:** feature-card grids; numbered section markers;
small all-caps labels above headings; monospace micro-labels; marquee tickers; outlined or
gradient-filled display type; centred hero with two buttons; icon sets; scroll-reveal
animations; glass, glow, grain or vignette overlays; piles of hairline rules.

**Palette** (four values, plus two rule tints):

```
--bg        #0f0404   page
--ink       #ffecec   headings and key values
--muted     #d49b9b   body text
--dim       #ac7474   captions and fine print
--accent    #ff4d4d   one status dot, focus ring, 404 numeral
--line      rgba(255,80,80,.14)
--line-2    rgba(255,80,80,.28)
```

**Type** — two families, one Google request:

`family=Archivo:wght@400;500;700;900&family=Source+Serif+4:ital,wght@0,400;1,400`

- Archivo 900: the `h1` wordmark and the 404 numeral.
- Archivo 700: section headings and the header wordmark.
- Archivo 500/400: navigation, status values, captions, legal.
- Source Serif 4 400: body copy. Italic 400: the one-line aside and the status labels.

Body 18px/1.6, measure ≤ 58ch. The `h1` is one line, sized to fill the container:
`clamp(2rem, 11vw, 8.2rem)`, `letter-spacing: -.038em`.

## 3. Files

| Path | Owner |
|---|---|
| `archive/` (retired pages, local only) | not published |
| `css/gurry.css` | stylesheet |
| `js/site.js` | footer year only |
| `index.html` | homepage |
| `404.html` | error page |
| `robots.txt`, `sitemap.xml`, `README.md`, `CNAME`, `.nojekyll` | plumbing |

## 4. Images

Only two are loaded, both from `assets/opt/`:

- `king.webp` 1920×1280 — full-bleed band, `object-fit: cover`, grayscale filter so the
  colour art sits inside the crimson palette.
- `og-home.jpg` 1200×630 — social card, referenced by meta tags only.

`logo.webp` is not used in the page furniture; it remains for the later remaster.

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
`intro` `wordmark` `lede` `aside`
`band`
`block` `split` `split-a` `status` `off` `prose`
`foot` `foot-inner` `foot-brand` `foot-nav` `foot-legal`
`intro--error` `err-code` `err-title` `err-back`
`skip` `sr-only`

Deleted since the first pass: `btn*`, `nav-*`, `hero-*`, `ticker*`, `coming-*`, `studio-*`,
`sec-*`, `eyebrow`, `reveal`.

## 8. Page structure

```
header.head
main#main
  section.intro > .wrap
    h1.wordmark           GURRY GAMES, one line
    p.lede                two sentences
    p.aside               italic, one line
  figure.band
    img king.webp         1920×1280, alt describes the scene
    figcaption.wrap       "Key art. Kept from the old site."
  section.block#games > .wrap.split
    .split-a > h2 "Games coming soon" + p
    dl.status             4 rows: Next release / Catalogue / Platform / Last update
  section.block#studio > .wrap.split.split--studio
    h2 "Studio"
    .prose                two paragraphs
footer.foot
script js/site.js defer
```

Exactly one `h1`. Heading order `h1` → `h2`. No `h3`. No numbered markers. No card grid.

## 9. Copy voice

Plain, first person plural, slightly dry. State the situation instead of dressing it up.
No aphorisms, no slogans, no "atmosphere-first", no invented dates, versions, awards, team
size, socials or contact addresses. The site is allowed to say there is nothing to play.

## 10. JS contract (`js/site.js`)

- One IIFE, `'use strict'`, no dependencies, loaded with `defer`.
- `#year` → current year, guarded if the element is absent.
- Nothing else. No navigation state, no observers, no storage, no network.

## 11. Definition of done

- No horizontal overflow at 320 / 390 / 768 / 1024 / 1440 / 1920.
- The wordmark never crosses the container, at any width.
- Every image has `width`/`height` and an `alt`.
- All text ≥ 4.5:1 against its background; `--dim` is 5.3:1 on `--bg`.
- Visible keyboard focus on every link; skip link is the first stop.
- No `<style>`, no `style=`, no `on*=` in live HTML.
- `robots.txt` allows `/` and disallows `/archive/`, `/docs/`, `/tools/`, `/qa/`.
- `sitemap.xml` contains only `https://gurrygames.xyz/`.