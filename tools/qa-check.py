"""Final static checks for the GurryGames v2 teaser build."""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIVE = ["index.html", "404.html"]
errors = []

print("== encoding ==")
for name in LIVE + ["README.md", "archive/README.md", "css/gurry.css", "js/site.js", "sitemap.xml"]:
    p = ROOT / name
    try:
        text = p.read_text(encoding="utf-8")
        bad = "\ufffd" in text
    except UnicodeDecodeError as exc:
        errors.append(f"{name}: not UTF-8 ({exc})")
        continue
    print(f"  {name:24} {p.stat().st_size:7} B  utf8=ok  replacement-char={bad}")
    if bad:
        errors.append(f"{name}: contains U+FFFD")

print("\n== class coverage ==")
css = (ROOT / "css/gurry.css").read_text(encoding="utf-8")
defined = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
for name in LIVE:
    html = (ROOT / name).read_text(encoding="utf-8")
    used = set()
    for attr in re.findall(r'class="([^"]+)"', html):
        used.update(attr.split())
    missing = sorted(used - defined)
    print(f"  {name}: used={len(used)} undefined={missing}")
    if missing:
        errors.append(f"{name}: undefined classes {missing}")

print("\n== markup hygiene ==")
for name in LIVE:
    html = (ROOT / name).read_text(encoding="utf-8")
    checks = {
        "<style>": "<style" in html.lower(),
        "style=": bool(re.search(r"<[^>]+\sstyle=", html)),
        "on*=": bool(re.search(r"<[^>]+\son[a-z]+=", html)),
        "h1 count": html.count("<h1"),
        "canonical": bool(re.search(r'rel="canonical"', html)),
        "og:image": 'property="og:image"' in html,
        "json-ld": 'application/ld+json' in html,
    }
    print(f"  {name}: {checks}")

print("\n== live content leak scan ==")
live_text = " ".join((ROOT / n).read_text(encoding="utf-8").lower() for n in LIVE + ["robots.txt", "sitemap.xml"])
terms = ["deak", "dark web", "uber", "stalker", "deakkiller", "vote.html", "south32", "caseoh", "chickenman"]
hits = [t for t in terms if t in live_text]
print(f"  hits: {hits or 'none'}")
if hits:
    errors.append(f"live pages mention archived material: {hits}")

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

robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
for rule in ["User-agent: *", "Allow: /", "Disallow: /archive/", "Sitemap: https://gurrygames.xyz/sitemap.xml"]:
    if rule not in robots:
        errors.append(f"robots.txt missing: {rule}")
print(f"  robots rules present: {'ok' if not errors or 'robots' not in errors[-1] else 'check'}")

print("\n== assets referenced by live pages ==")
refs = set()
for name in LIVE:
    html = (ROOT / name).read_text(encoding="utf-8")
    refs.update(re.findall(r'(?:src|href)="(/[^"#]+)"', html))
missing_files = []
for ref in sorted(refs):
    if ref.endswith(".html") or ref == "/":
        continue
    if not (ROOT / ref.lstrip("/")).exists():
        missing_files.append(ref)
print(f"  checked {len(refs)} root refs; missing={missing_files or 'none'}")
if missing_files:
    errors.append(f"missing files: {missing_files}")

print("\n== deployment files ==")
for name in ["CNAME", ".nojekyll", "404.html", "favicon.ico"]:
    ok = (ROOT / name).exists()
    print(f"  {name:12} {'ok' if ok else 'MISSING'}")
    if not ok:
        errors.append(f"missing deployment file: {name}")
print(f"  CNAME content: {(ROOT / 'CNAME').read_text(encoding='utf-8').strip()!r}")

print("\n== js syntax (node --check) ==")
print("  see shell run")

print("\n== result ==")
if errors:
    print("  FAIL")
    for e in errors:
        print("   -", e)
    sys.exit(1)
print("  PASS — no static issues found")