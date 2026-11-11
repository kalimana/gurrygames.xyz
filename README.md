# gurrygames.xyz

The Gurry Games storefront: an independent horror studio's catalogue, game pages, and development log.

The site is static HTML, CSS, and JavaScript served directly by GitHub Pages from `main`. There is no build step and no runtime dependency.

## Structure

- `/` — storefront: featured title, recently added, searchable catalogue, genres, tags, and devlog
- `/<game-slug>` — game page with screenshots, details, and availability
- `/genre/…`, `/tag/…`, `/platform/…`, `/status/…` — server-rendered catalogue views
- `/assets/games/<game-slug>/` — cover, hero, social card, and screenshot derivatives
- `404.html` — custom not-found page
- `sitemap.xml`, `robots.txt` — crawler metadata

Catalogue data and the generator that produces these pages are kept in the studio's private authoring workspace. This repository contains only the published output.

## Local preview

GitHub Pages resolves clean URLs (`/dead-air`) to `dead-air.html`. A stock static server does not, so preview with any server that supports extensionless files, or request the `.html` path directly.

## Deployment

Push to `main`. GitHub Pages publishes the repository root using `CNAME` and `.nojekyll`.

Before publishing, confirm that no private authoring data, unreleased game records, or hidden artwork is present in the tree.