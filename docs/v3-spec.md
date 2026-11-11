# GurryGames v3 — build contract

A static, single-page studio notice with one matching error page. No framework, no build
step, no npm dependencies. Everything in the repository is what GitHub Pages serves.

Host: GitHub Pages at `https://gurrygames.xyz`, served from the repo root. All internal
URLs are root-relative (`/css/gurry.css`, `/#catalogue`), which is correct for the custom
domain. A project-page deployment under `/repo/` would require prefixing them.

## 1. Concept

A late-night studio transmission: black and oxblood, the desk still warm, the catalogue
switched off. The page has to feel like a place, not a landing-page template, while saying
almost nothing: the games are not announced, there is nothing to download, and the site
will say so plainly.

The two photographic plates establish that place. The hero is the physical desk — laptop,
headphones, a GG mark behind the screen. The studio slab is the work itself — the monitor
showing a nighttime test render. Captions name them as `Fig. 01` and `Fig. 02`.

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

The wordmark is Archivo 800 at `min(10vw, 7.9rem)`, two lines, `line-height .84`, tight
tracking, with a crimson period. It caps below the container width so “GAMES.” cannot clip;
mobile uses `min(18.5vw, 6.2rem)`. Section headings are Source Serif 4 500 with italic
accent phrases. Metadata is uppercase Archivo at 8–11px with wide tracking.

Body measure stays between 40ch and 54ch. The studio slab is the only light surface; it
breaks the dark rhythm exactly once, between the catalogue and the closing.

### Motion language

Fast, weighted easings (`cubic-bezier(.16, 1, .3, 1)` and `cubic-bezier(.22, .68, .28, 1)`),
short travel distances, no bounce. Content reveals once, on entry, then stays put.

## 3. Layout and responsive behaviour

- Shell: `max-width: 1240px`, fluid gutter `clamp(20px, 4.6vw, 56px)`.
- Hero: two columns above 980px; two tighter columns from 681–980px; stacked with the
  copy first and the plate second at 680px and below.
- The framed plate is capped at 424px. On short desktop viewports (`max-height: 940px`)
  it scales from the viewport height so the ticker remains above the fold. The compact
  rules trim hero padding, grid padding, lede/action spacing and ticker padding together.
- Catalogue: vault panel with a two-column body above 899px, single column below.
- Studio: cream slab with image left / copy right above 980px; stacked with the image
  first below 980px. The slab keeps a small margin from the viewport edge.
- Header status pill hides below 1180px; desktop nav hides below 900px and the menu button
  takes over. The header uses `min-height`, so it grows with text zoom instead of clipping.
- Hero type steps down at 680px, 620px, 480px and 380px; CTAs go full-width at 480px.
- `scrollbar-gutter: stable` prevents layout shift when the mobile menu locks scrolling.

Tested with no horizontal overflow at 320, 390, 768, 844, 980, 1024, 1280, 1366, 1440,
1536, 1920 and 2560px wide. The hero and ticker fit exactly at 720, 768, 864, 900, 1080
and 1440px tall. Landscape phone menus (`844×390`, `844×320`) remain scrollable and all
items are reachable.

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

- **Boot curtain** — brand + loading line, dismissed on `load` (minimum 180ms), removed
  after the fade. Shown once per session via `sessionStorage`; a 1.2s hard stop guarantees
  it never holds the page. Hidden entirely for reduced motion.
- **Reading progress** — a 1px crimson scaleX bar at the bottom of the header, updated in
  `requestAnimationFrame` on scroll.
- **Header state** — glass background and hairline appear after 18px of scroll.
- **Scroll reveals** — `IntersectionObserver` adds `.is-in` once per `[data-reveal]`
  element, with per-element `--delay`.
- **Scrollspy** — observes `#catalogue` and `#studio`, sets `.is-active` and
  `aria-current="location"` on the matching nav link.
- **Mobile menu** — opens with a staggered index, animates the button to an X, locks
  scroll, marks `main` and footer `inert`, moves focus to the first link synchronously,
  closes on link click, Escape, or resize to desktop, and restores focus to the toggle.
  While open, the skip link is also `inert` and removed from the tab order.
- **Parallax** — orbs and the hero plate translate slightly against scroll. Base positions
  are measured once, cached, and invalidated on resize; off-screen elements are skipped;
  disabled for reduced motion.
- **Card tilt + glare** — hero plate and studio frame tilt up to ~7° toward a fine pointer
  and track a soft glare. Pointer writes are coalesced into `requestAnimationFrame` and
  rects are invalidated on scroll/resize; disabled on touch and for reduced motion.
- **Spotlight** — hero and vault track the pointer with a faint radial wash.
- **Micro-interactions** — primary button fill rises from below, ghost buttons warm and
  glow, arrows nudge, nav rules draw left-to-right, footer top button inverts, ticker
  pauses on hover and focus-within.
- **Ticker** — duplicated list, CSS `translateX(-50%)` loop; static under reduced motion
  and on touch devices without hover.

### JavaScript failure and no-JS

`.js` is set inline in `<head>`; only `.js` gates the mobile menu and hides the desktop nav
at narrow widths. If `js/site.js` never sets `window.__ggReady`, a 2.5s inline failsafe
removes `.js` and adds `.js-failed`, which restores the visible nav and leaves every
`[data-reveal]` element in its default visible state. The boot curtain is never displayed
without `.js`.

### Reduced motion

`prefers-reduced-motion: reduce` removes the boot curtain, forces all reveals visible,
stops the ticker, disables tilt and parallax, removes transforms from the frames, collapses
animation/transition durations, and turns smooth scrolling off.

## 6. Accessibility

- Skip link is the first focusable element. It is `inert` and `tabindex="-1"` while the
  mobile menu is open, so focus cannot escape behind the overlay.
- Landmarks: `header`, `nav` (primary, menu, footer), `main`, `footer`. Both `<main>`
  elements carry `tabindex="-1"` so the skip link and in-page anchors move focus.
- One `h1`; section headings follow in order.
- Descriptive alt text on both photographic images; decorative HUD, ghost type and orbs
  are hidden from assistive technology. The menu toggle keeps an accessible name at all
  widths; below 480px the visible “Menu” label is visually hidden rather than removed.
- Focus-visible ring: 2px accent with 3px offset on every interactive element.
- The menu exposes `aria-expanded` and `aria-controls`, and swaps `aria-hidden`/`inert`
  correctly. Its close label updates with state.
- The scrollspy sets and removes `aria-current`.
- Every interactive target measures at least 44×44px, including footer links, the back-to-
  top control and the menu button.
- All text pairings meet WCAG AA; most exceed AAA. Measured ratios: ink 17.4:1, body
  9.0:1, dim 5.5:1, accent 6.2:1, cream body 9.1:1, cream dim 6.7:1, accent-deep 6.4:1.
- Forced-colors mode restores `CanvasText` for the hero wordmark, status dots and outlined
  numerals, removes decorative gradients, and keeps panel borders visible.
- Print styles force every reveal visible, invert to a white ground with dark text, keep
  panel rules and hide the header, menu, ticker, boot curtain, imagery and footer controls.

## 7. Assets

Loaded by the live pages:

| File | Dimensions | Size | Notes |
|---|---|---|---|
| `assets/opt/hero-panel.webp` | 1400×1750 | ~54 KB | hero plate — laptop, headphones, desk |
| `assets/opt/hero-panel-sm.webp` | 700×875 | ~21 KB | narrow / 1× candidate |
| `assets/opt/desk.webp` | 1200×1200 | ~38 KB | studio slab — monitor test render, lazy |
| `assets/opt/og-home.jpg` | 1200×630 | ~63 KB | Open Graph / Twitter card |
| `assets/opt/logo.webp` | — | ~22 KB | organization JSON-LD only |

Fonts total ~262 KB, two files preloaded. There are no icon fonts, no sprite sheets, no
third-party scripts, no analytics.

The hero preload mirrors the `<img>` exactly:

```html
<link rel="preload" as="image" type="image/webp"
      href="/assets/opt/hero-panel.webp"
      imagesrcset="/assets/opt/hero-panel-sm.webp 700w, /assets/opt/hero-panel.webp 1400w"
      imagesizes="(max-width: 680px) 90vw, (max-width: 980px) 44vw, 424px"
      fetchpriority="high">
```

The `<img>` carries the same `srcset`/`sizes`, explicit `width`/`height`, and
`fetchpriority="high"`. One candidate is fetched; no double download, no preload warning.
The 424px cap matches the rendered plate, so a 2× display fetches the 1400px file rather
than requesting a wider slot that does not exist.

`python tools/build-hero.py` regenerates the plates and the social card from
`assets/king.png` with Pillow: crop, warm duotone, grain, vignette and an edge falloff.
`--preview` also writes JPEGs to `qa/tests/`.

Retired source art and unused optimized plates are kept in `../GURRYGAMES-archive/`,
outside the published tree. Only `assets/king.png` remains in the working copy because
the generator reads it; it is not referenced by any live page and is excluded from the
deploy clone.

## 8. Files

| Path | Role |
|---|---|
| `index.html` | homepage |
| `404.html` | not-found page, same shell |
| `css/gurry.css` | entire design system, layout, motion, reduced-motion, print |
| `js/site.js` | all interactions; one IIFE, no dependencies |
| `assets/fonts/` | self-hosted variable WOFF2 subsets |
| `assets/opt/` | live imagery only |
| `assets/king.png` | local source plate for the generator; not deployed |
| `archive/` | retired v1 pages and assets, not published |
| `docs/` | this contract |
| `qa/` | screenshots and local QA output, not published |
| `tools/` | image pipeline and QA script, not published |
| `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll`, `favicon.ico` | plumbing |

## 9. JavaScript contract

- One IIFE, `'use strict'`, `defer`, no dependencies, no build step.
- Every lookup is guarded; the same script serves the 404 page.
- Scroll work is coalesced into `requestAnimationFrame`; listeners are passive.
- No cookies, network calls or third-party code. `sessionStorage` holds a single
  `gg-boot` flag so the curtain plays once per tab session; failures are caught.
- The script sets `window.__ggReady` at the end so the inline 2.5s failsafe can tell a
  successful enhancement pass from a blocked or broken one.
- All motion honours `prefers-reduced-motion` at load.

## 10. Verification

- 404 renders at 1440×900 and 390×844 with no overflow; all links resolve.
- Header nav, hero CTAs, vault link, menu links and footer links land with the 96px
  scroll offset; scrollspy tracks the active section.
- Mobile menu: opens, focuses the first link, locks scroll, closes on Escape, restores
  focus to the button, closes on link navigation. Landscape (`844×390`, `844×320`) keeps
  all items reachable by scrolling.
- Reduced-motion emulation: boot removed, 18/18 reveals visible, ticker `animation: none`,
  frames untransformed, no console errors.
- No-JS: nav visible, menu button hidden, all sections visible, boot absent.
- Print: 18/18 reveals visible, white ground, dark text, hero title black, rules retained.
- Forced colors: hero wordmark and dot use `CanvasText`, gradients removed.
- Console clean on load; hero image fetched once from the correct candidate; fresh
  contexts confirm the new hero and studio plates.
- HTML parser check: no unclosed tags, no duplicate IDs on either page.
- All local `href`/`src`/`url()` references exist.
- Tap-target sweep: every visible link and button is at least 44px on both axes.

## 11. Deploy

No build. Commit the listed files to `main`; GitHub Pages serves the repo root at the
custom domain. `assets/opt` changes are content changes and must be committed with the
HTML. HTML is cached briefly by the Pages CDN; verify with a `?v=` query if needed.

HTTPS enforcement is on in the Pages settings: `http://gurrygames.xyz` 301s to
`https://gurrygames.xyz/`, and the canonical and sitemap URLs use the HTTPS origin.