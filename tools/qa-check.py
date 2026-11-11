"""Static checks for the GurryGames v3 build.

Run from the repo root:  python tools/qa-check.py
Exits non-zero on any failure.
"""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIVE = ["index.html", "404.html"]
errors = []


def read(name):
    return (ROOT / name).read_text(encoding="utf-8")


def check_encoding():
    print("== encoding ==")
    names = LIVE + ["README.md", "docs/v3-spec.md", "css/gurry.css", "js/site.js", "sitemap.xml"]
    for name in names:
        p = ROOT / name
        if not p.exists():
            errors.append(f"{name}: missing")
            print(f"  {name:28} MISSING")
            continue
        text = p.read_text(encoding="utf-8")
        bad = "\ufffd" in text
        print(f"  {name:28} {p.stat().st_size:7} B  utf8=ok  replacement-char={bad}")
        if bad:
            errors.append(f"{name}: contains U+FFFD")


def check_classes():
    print("\n== class coverage ==")
    css = read("css/gurry.css")
    defined = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
    for name in LIVE:
        html = read(name)
        used = set()
        for attr in re.findall(r'class="([^"]+)"', html):
            used.update(attr.split())
        used.discard("no-js")  # state marker, deliberately unstyled
        missing = sorted(used - defined)
        print(f"  {name}: used={len(used)} undefined={missing or 'none'}")
        if missing:
            errors.append(f"{name}: undefined classes {missing}")


def check_markup():
    print("\n== markup hygiene ==")
    for name in LIVE:
        html = read(name)
        ids = re.findall(r'\sid="([^"]+)"', html)
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        inline = [s for s in re.findall(r'<[^>]+\sstyle="([^"]*)"', html)
                  if not s.strip().startswith("--")]
        checks = {
            "style tag": "<style" in html.lower(),
            "visual style=": bool(inline),
            "on*=": bool(re.search(r"<[^>]+\son[a-z]+=", html)),
            "h1 count": html.count("<h1"),
            "canonical": bool(re.search(r'rel="canonical"', html)),
            "og:image": 'property="og:image"' in html,
            "json-ld": 'application/ld+json' in html,
            "duplicate ids": dupes or "none",
        }
        print(f"  {name}: {checks}")
        if checks["style tag"] or checks["visual style="] or checks["on*="]:
            errors.append(f"{name}: inline styling or handlers found")
        if checks["h1 count"] != 1:
            errors.append(f"{name}: expected one h1, found {checks['h1 count']}")
        if name == "index.html":
            if not checks["canonical"] or not checks["og:image"]:
                errors.append(f"{name}: missing canonical or og:image")
        elif 'name="robots" content="noindex"' not in html:
            errors.append(f"{name}: missing noindex robots meta")
        if dupes:
            errors.append(f"{name}: duplicate ids {dupes}")


def check_leaks():
    print("\n== live content leak scan ==")
    live_text = " ".join(read(n).lower() for n in LIVE + ["robots.txt", "sitemap.xml"])
    terms = ["deak", "dark web", "uber", "stalker", "deakkiller", "vote.html", "south32",
             "caseoh", "chickenman"]
    hits = [t for t in terms if t in live_text]
    print(f"  hits: {hits or 'none'}")
    if hits:
        errors.append(f"live pages mention archived material: {hits}")


def check_anchors():
    print("\n== internal anchors ==")
    index_ids = set(re.findall(r'\sid="([^"]+)"', read("index.html")))
    for name in LIVE:
        html = read(name)
        targets = re.findall(r'href="(?:/)?#([^"]+)"', html)
        missing = sorted({t for t in targets if t not in index_ids})
        print(f"  {name}: anchors={len(targets)} missing={missing or 'none'}")
        if missing:
            errors.append(f"{name}: anchor targets missing {missing}")


def check_sitemap_robots():
    print("\n== sitemap / robots ==")
    try:
        tree = ET.parse(ROOT / "sitemap.xml")
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs = [e.text for e in tree.getroot().findall("s:url/s:loc", ns)]
        print(f"  sitemap urls: {locs}")
        if locs != ["https://gurrygames.xyz/"]:
            errors.append(f"sitemap has unexpected urls: {locs}")
    except ET.ParseError as exc:
        errors.append(f"sitemap.xml invalid: {exc}")

    robots = read("robots.txt")
    for rule in ["User-agent: *", "Allow: /", "Disallow: /archive/",
                 "Disallow: /docs/", "Disallow: /tools/", "Disallow: /qa/",
                 "Sitemap: https://gurrygames.xyz/sitemap.xml"]:
        if rule not in robots:
            errors.append(f"robots.txt missing: {rule}")
    print("  robots rules present: ok")


def check_refs():
    print("\n== local references ==")
    refs = set()
    for name in LIVE:
        html = read(name)
        refs.update(re.findall(r'(?:src|href)="(/[^"#]+|assets/[^"#]+)"', html))
        for srcset in re.findall(r'srcset="([^"]+)"', html):
            for part in srcset.split(","):
                url = part.strip().split(" ")[0]
                if url.startswith("/") or url.startswith("assets/"):
                    refs.add(url)
    css = read("css/gurry.css")
    refs.update(re.findall(r'url\("?(/[^")?#]+)', css))

    missing = []
    for ref in sorted(refs):
        if ref.endswith(".html") or ref == "/":
            continue
        if not (ROOT / ref.lstrip("/")).exists():
            missing.append(ref)
    print(f"  checked {len(refs)} refs; missing={missing or 'none'}")
    if missing:
        errors.append(f"missing files: {missing}")


def check_preload():
    print("\n== hero preload matches img ==")
    html = read("index.html")
    preloads = re.findall(r'<link[^>]+rel="preload"[^>]*>', html)
    hero = [p for p in preloads if "hero-panel" in p]
    imgs = re.findall(r'<img[^>]+hero-panel[^>]*>', html)
    if len(hero) != 1 or len(imgs) != 1:
        errors.append(f"hero preload/img count: {len(hero)}/{len(imgs)}")
        print(f"  preloads={len(hero)} imgs={len(imgs)}")
        return

    def attr(tag, name):
        m = re.search(name + r'="([^"]+)"', tag)
        return re.sub(r"\s+", " ", m.group(1)).strip() if m else None

    pairs = [("imagesrcset", "srcset"), ("imagesizes", "sizes")]
    for a, b in pairs:
        left, right = attr(hero[0], a), attr(imgs[0], b)
        print(f"  {a}: {left}")
        if left != right:
            errors.append(f"preload {a} does not match img {b}")
    print("  match: ok" if not any(a for a, _ in pairs) else "")


def check_images():
    print("\n== image dimensions ==")
    try:
        from PIL import Image
    except ImportError:
        print("  Pillow not installed; skipped")
        return
    expected = {
        "assets/opt/hero-panel.webp": (1400, 1750),
        "assets/opt/hero-panel-sm.webp": (700, 875),
        "assets/opt/desk.webp": (1200, 1200),
        "assets/opt/og-home.jpg": (1200, 630),
    }
    for name, size in expected.items():
        p = ROOT / name
        if not p.exists():
            errors.append(f"{name}: missing")
            continue
        with Image.open(p) as im:
            ok = im.size == size
            print(f"  {name:34} {im.size} {'ok' if ok else 'EXPECTED ' + str(size)}")
            if not ok:
                errors.append(f"{name}: wrong dimensions {im.size}")
        if p.stat().st_size > 250 * 1024:
            errors.append(f"{name}: unexpectedly large ({p.stat().st_size // 1024} KB)")


def check_deploy():
    print("\n== deployment files ==")
    for name in ["CNAME", ".nojekyll", "404.html", "favicon.ico", "robots.txt", "sitemap.xml"]:
        ok = (ROOT / name).exists()
        print(f"  {name:14} {'ok' if ok else 'MISSING'}")
        if not ok:
            errors.append(f"missing deployment file: {name}")
    print(f"  CNAME content: {read('CNAME').strip()!r}")


def main():
    check_encoding()
    check_classes()
    check_markup()
    check_leaks()
    check_anchors()
    check_sitemap_robots()
    check_refs()
    check_preload()
    check_images()
    check_deploy()

    print("\n== result ==")
    if errors:
        print("  FAIL")
        for e in errors:
            print("   -", e)
        sys.exit(1)
    print("  PASS - no static issues found")


if __name__ == "__main__":
    main()