# GurryGames v3 — build contract

A static, single-page studio notice with one matching error page. No framework, no build
step, no npm dependencies. Everything in the repository is what GitHub Pages serves.

Host: GitHub Pages at `https://gurrygames.xyz`, served from the repo root. All internal
URLs are root-relative (`/css/gurry.css`, `/#catalogue`), which is correct for the custom
domain. A project-page deployment under `/repo/` would require prefixing them.

## 1. Concept

A late-night studio transmission: black and oxblood, a monitor still on, the catalogue
switched off. The page has to feel like a place, not a landing-page template, while saying
almost nothing: the games are not announced, there is nothing to download, and the site
will say so plainly.

The one-page order is fixed:

1. boot curtain
2. fixed header + reading progress
3. hero — wordmark, status, framed studio plate, ticker
4. catalogue vault — status panel, counts, table
5. studio — cream paper slab, desk image, three principles
6. closing statement
7. footer

There are no game titles, posters, store links, trailers, wishlists, countdowns or dates.
Retired game pages stay in `archive/` on the working copy and are never linked or published.

## 2. Design system

### Palette

| Token | Value | Use |
|---|---|---|
| `--void` | `#080303` | page background |
| `--void-2` | `#0b0404` | subtle dark surface |
| `--coal` | `#120606` | panel base |
| `--ink` | `#f7eae2` | headings, wordmark, key values |
| `--ink-soft` | `#e9d3ca` | secondary light text |
| `--body` | `#c8a49c` | body copy on dark |
| `--dim` | `#a07b74` | captions, labels, fine print |
| `--accent` | `#ff4a3d` | status dots, focus ring, rules |
| `--accent-hot` | `#ff8873` | emphasised dark-theme text |
| `--accent-deep` | `#9e241b` | accent on the cream slab |
| `--cream` | `#f3e7de` | studio slab |
| `--cream-2` | `#ead9cd` | studio slab falloff |
| `--cream-ink` | `#1b0a08` | headings on cream |
| `--cream-body` | `#54342e` | body copy on cream |

Depth comes from layered gradients, a fine film-grain overlay, two blurred crimson orbs,
a masked grid, glass panels (`backdrop-filter`), inset highlights and long soft shadows.
Effects are deliberately restrained: one warm light source, no rainbow gradients, no
stacked glow borders.

### Type

Self-hosted variable fonts, latin subsets only, no runtime Google Fonts request:

- **Archivo** variable, weight 400–900, width 62–125% — wordmark, navigation, labels,
  numerals, buttons (`assets/fonts/archivo-var-latin.woff2`, 90 KB).
- **Source Serif 4** variable, weight 400–600 — section headings and reading copy
  (`source-serif-4-var-latin.woff2`, 122 KB).
- **Source Serif 4 Italic** 400 — emphatic words and captions
  (`source-serif-4-italic-latin.woff2`, 50 KB, loaded on demand).

The wordmark is Archivo 800 at `clamp(4.1rem, 10.4vw, 9.9rem)`, two lines, `line-height
.8`, tight tracking, with a crimson period. Section headings are Source Serif 4 500 with
italic accent phrases. Metadata is uppercase Archivo at 8–11px with wide tracking.

Body measure stays between 40ch and 54ch. The studio slab is the only light surface; it
breaks the dark rhythm exactly once, between the catalogue and the closing.

### Motion language

Fast, weighted easings (`cubic-bezier(.16, 1, .3, 1)` and `cubic-bezier(.22, .68, .28, 1)`),
short travel distances, no bounce. Content reveals once, on entry, then stays put.

## 3. Layout and responsive behaviour

- Shell: `max-width: 1240px`, fluid gutter `clamp(20px, 4.6vw, 56px)`.
- Hero: two columns above 980px; two tighter columns from 681–980px; stacked with the
  copy first and the plate second at 680px and below.
- The framed plate is capped at 424px. On short desktop viewports (`max-height: 880px`)
  it scales from the viewport height so the ticker remains above the fold.
- Catalogue: vault panel with a two-column body above 899px, single column below.
- Studio: cream slab with image left / copy right above 980px; stacked with the image
  first below 980px. The slab keeps a small margin from the viewport edge.
- Header status pill hides below 1180px; desktop nav hides below 900px and the menu button
  takes over.
- Hero type steps down at 680px, 620px, 480px and 380px; CTAs go full-width at 480px.
- `scrollbar-gutter: stable` prevents layout shift when the mobile menu locks scrolling.

Tested with no horizontal overflow at 320, 390, 768, 1024, 1280, 1366, 1440, 1536, 1920
and 2560px wide. The hero and ticker fit the viewport at 720, 768, 864 and 900px tall.

## 4. Page anatomy

```
body
  a.skip
  div.boot[data-boot]                 boot curtain, removed after load
  svg.sprite                          arrow symbols
  header.site-head[data-head]         fixed; brand, nav, status, menu button, progress
  div.menu#site-menu[data-menu]       full-screen mobile index; inert when closed
  main#main
    section.hero[data-spotlight]
      .hero-atmos                     orbs + masked grid
      .shell.hero-grid
        .hero-copy                    kicker, h1, lede, CTAs, meta
        figure.hero-figure            framed plate, HUD, caption
      .shell.hero-foot                scroll cue, domain
      .ticker                         duplicated marquee track
    section.catalogue#catalogue
      .sec-head                       index, h2, lede
      .vault                          head, body (00 + status), foot
    section.studio#studio
      .studio-slab
        .studio-grid                  figure + copy + principles + signature
    section.closing
      .closing-inner                  statement, CTAs, status, ghost wordmark
  footer.foot
```

Exactly one `h1` per page. Heading order is `h1 → h2 → h3` (the studio principles use
`h3`). Decorative ghost type and HUD text are `aria-hidden`.

## 5. Interactions

All of it is progressive enhancement. With JavaScript disabled the page is complete, the
boot curtain never displays, reveals never hide, and the menu is replaced by in-page nav.

- **Boot curtain** — brand + loading line, dismissed on `load` (minimum 700ms) and removed
  after the fade. A 2.2s failsafe guarantees it never holds the page. Hidden entirely for
  reduced motion.
- **Reading progress** — a 1px crimson scaleX bar at the bottom of the header, updated in
  `requestAnimationFrame` on scroll.
- **Header state** — glass background and hairline appear after 18px of scroll.
- **Scroll reveals** — `IntersectionObserver` adds `.is-in` once per `[data-reveal]`
  element, with per-element `--delay`.
- **Scrollspy** — observes `#catalogue` and `#studio`, sets `.is-active` and
  `aria-current="location"` on the matching nav link.
- **Mobile menu** — opens with a staggered index, animates the button to an X, locks
  scroll, marks `main` and footer `inert`, moves focus to the first link, closes on link
  click, Escape, or resize to desktop, and restores focus to the toggle.
- **Parallax** — orbs and the hero plate translate slightly against scroll, capped to the
  viewport neighbourhood and skipped for reduced motion.
- **Card tilt + glare** — hero plate and studio frame tilt up to ~7° toward a fine pointer
  and track a soft glare; disabled on touch and for reduced motion.
- **Spotlight** — hero and vault track the pointer with a faint radial wash.
- **Micro-interactions** — primary button fill rises from below, ghost buttons warm and
  glow, arrows nudge, nav rules draw left-to-right, footer top button inverts, ticker
  pauses on hover.
- **Ticker** — duplicated list, CSS `translateX(-50%)` loop; static under reduced motion.

### Reduced motion

`prefers-reduced-motion: reduce` removes the boot curtain, forces all reveals visible,
stops the ticker, disables tilt and parallax, removes transforms from the frames, collapses
animation/transition durations, and turns smooth scrolling off.

## 6. Accessibility

- Skip link is the first focusable element.
- Landmarks: `header`, `nav` (primary, menu, footer), `main`, `footer`.
- One `h1`; section headings follow in order.
- Descriptive alt text on both photographic images; decorative HUD, ghost type and orbs
  are hidden from assistive technology.
- Focus-visible ring: 2px accent with 3px offset on every interactive element.
- The menu exposes `aria-expanded` and `aria-controls`, and swaps `aria-hidden`/`inert`
  correctly.
- The scrollspy sets and removes `aria-current`.
- All text pairings meet WCAG AA; most exceed AAA. Measured ratios: ink 17.4:1, body
  9.0:1, dim 5.5:1, accent 6.2:1, cream body 9.1:1, cream dim 6.7:1, accent-deep 6.4:1.

## 7. Assets

Loaded by the live pages:

| File | Dimensions | Size | Notes |
|---|---|---|---|
| `assets/opt/hero-panel.webp` | 1400×1750 | ~50 KB | hero plate, 1×/2× desktop |
| `assets/opt/hero-panel-sm.webp` | 700×875 | ~18 KB | narrow / 1× candidate |
| `assets/opt/desk.webp` | 1200×1200 | ~32 KB | studio slab, lazy |
| `assets/opt/og-home.jpg` | 1200×630 | ~63 KB | Open Graph / Twitter card |
| `assets/opt/logo.webp` | — | ~22 KB | organization JSON-LD only |

Fonts total ~262 KB, two files preloaded. There are no icon fonts, no sprite sheets, no
third-party scripts, no analytics.

The hero preload mirrors the `<img>` exactly:

```html
<link rel="preload" as="image" type="image/webp"
      href="/assets/opt/hero-panel.webp"
      imagesrcset="/assets/opt/hero-panel-sm.webp 700w, /assets/opt/hero-panel.webp 1400w"
      imagesizes="(max-width: 680px) 90vw, (max-width: 980px) 44vw, 30vw"
      fetchpriority="high">
```

The `<img>` carries the same `srcset`/`sizes`, explicit `width`/`height`, and
`fetchpriority="high"`. One candidate is fetched; no double download, no preload warning.

`python tools/build-hero.py` regenerates the plates and the social card from
`assets/king.png` with Pillow: crop, duotone, grain, vignette and a right-edge falloff.
`--preview` also writes JPEGs to `qa/tests/`.

## 8. Files

| Path | Role |
|---|---|
| `index.html` | homepage |
| `404.html` | not-found page, same shell |
| `css/gurry.css` | entire design system, layout, motion, reduced-motion, print |
| `js/site.js` | all interactions; one IIFE, no dependencies |
| `assets/fonts/` | self-hosted variable WOFF2 subsets |
| `assets/opt/` | live imagery |
| `assets/*.png/jpg` | source art, not loaded by live pages |
| `archive/` | retired v1 pages and assets, not published |
| `docs/` | this contract |
| `qa/` | screenshots and local QA output, not published |
| `tools/` | image pipeline and QA script, not published |
| `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll`, `favicon.ico` | plumbing |

## 9. JavaScript contract

- One IIFE, `'use strict'`, `defer`, no dependencies, no build step.
- Every lookup is guarded; the same script serves the 404 page.
- Scroll work is coalesced into `requestAnimationFrame`; listeners are passive.
- No storage, cookies, network calls or third-party code.
- All motion honours `prefers-reduced-motion` at load.

## 10. Verification

- 404 renders at 1440×900 and 390×844 with no overflow; all links resolve.
- Header nav, hero CTAs, vault link, menu links and footer links land with the 96px
  scroll offset; scrollspy tracks the active section.
- Mobile menu: opens, focuses the first link, locks scroll, closes on Escape, restores
  focus to the button, closes on link navigation.
- Reduced-motion emulation: boot removed, 18/18 reveals visible, ticker `animation: none`,
  frames untransformed, no console errors.
- Console clean on load; hero image fetched once from the correct candidate.
- HTML parser check: no unclosed tags, no duplicate IDs on either page.
- All local `href`/`src`/`url()` references exist.

## 11. Deploy

No build. Commit the listed files to `main`; GitHub Pages serves the repo root at the
custom domain. `assets/opt` changes are content changes and must be committed with the
HTML. HTML is cached briefly by the Pages CDN; verify with a `?v=` query if needed.