"""Generate the site's imagery from the studio key art.

Run from the repo root:  python tools/build-hero.py
Writes the WebP plates used by the live pages and the social card.
Pass --preview to also drop JPEG previews in qa/tests/.
"""
import os
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

SRC = "assets/king.png"
OUT = "assets/opt"

INK = (255, 236, 236)
BLACK = (12, 3, 3)
ACCENT = (255, 66, 54)

SANS_BLACK = "C:/Windows/Fonts/ariblk.ttf"
SANS = "C:/Windows/Fonts/segoeuib.ttf"
SANS_REG = "C:/Windows/Fonts/segoeui.ttf"


def duotone(im, contrast=1.12, bright=0.7):
    grey = ImageOps.grayscale(im)
    grey = ImageEnhance.Contrast(grey).enhance(contrast)
    out = ImageOps.colorize(grey, black=(18, 4, 4), white=(255, 232, 220))
    warm = Image.new("RGB", out.size, (112, 22, 16))
    out = Image.blend(out, warm, 0.06)
    return ImageEnhance.Brightness(out).enhance(bright)


def vignette(im, strength=0.55):
    w, h = im.size
    rad = Image.radial_gradient("L").resize((w, h), Image.LANCZOS)
    mask = rad.point(lambda v: 255 - int(v * strength))
    dark = Image.new("RGB", (w, h), BLACK)
    return Image.composite(im, dark, mask)


def grain(im, amount=0.03):
    noise = Image.effect_noise(im.size, 20).convert("RGB")
    return Image.blend(im, noise, amount)


def edge_fade(im, reach=0.26, strength=1.0):
    """Darken the right edge so the cropped logo behind the monitor falls away."""
    w, h = im.size
    row = Image.new("L", (w, 1))
    start = w * (1 - reach)
    for x in range(w):
        t = 0.0 if x < start else (x - start) / (w - start)
        row.putpixel((x, 0), int((t ** 0.9) * 255 * strength))
    mask = row.resize((w, h))
    black = Image.new("RGB", (w, h), BLACK)
    return Image.composite(black, im, mask)


def render(src, frac, size, bright=0.7, contrast=1.12, vig=0.55, soft=0.0,
           centering=(0.5, 0.5), fade_right=0.0):
    w, h = src.size
    box = (
        int(frac[0] * w),
        int(frac[1] * h),
        int(frac[2] * w),
        int(frac[3] * h),
    )
    im = src.crop(box)
    im = ImageOps.fit(im, size, Image.LANCZOS, centering=centering)
    im = duotone(im, contrast=contrast, bright=bright)
    if soft:
        im = im.filter(ImageFilter.GaussianBlur(soft))
    if fade_right:
        im = edge_fade(im, reach=fade_right)
    im = vignette(im, vig)
    return grain(im)


def spaced(draw, xy, text, font, fill, tracking=6):
    """Draw uppercase text with manual letter spacing."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def build_og(src):
    """1200x630 social card: type on the left, desk plate falling away right."""
    w, h = 1200, 630
    card = Image.new("RGB", (w, h), BLACK)
    art = render(src, (0.60, 0.08, 1.00, 1.00), (640, 900), bright=0.78,
                 contrast=1.16, vig=0.7, centering=(0.55, 0.45))
    art = ImageOps.fit(art, (600, 900), Image.LANCZOS, centering=(0.45, 0.5))

    # Fade the plate's left edge into the card so type never fights the image.
    fade = Image.new("L", (600, 900), 0)
    for x in range(600):
        fade.paste(int(255 * min(1, (x / 300) ** 1.5)), (x, 0, x + 1, 900))
    card.paste(art, (600, -135), fade)

    # Warm floor and corner falloff.
    glow = Image.new("RGB", (w, h), BLACK)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-320, 300, 780, 1200), fill=(58, 7, 7))
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    card = Image.blend(card, glow, 0.55)

    d = ImageDraw.Draw(card)
    d.rectangle((84, 96, 148, 100), fill=ACCENT)

    display = ImageFont.truetype(SANS_BLACK, 138)
    d.text((78, 128), "GURRY", font=display, fill=INK)
    d.text((78, 268), "GAMES", font=display, fill=INK)

    tag = ImageFont.truetype(SANS_REG, 27)
    d.text((84, 452), "Independent horror games for Windows PC.", font=tag,
           fill=(214, 176, 170))

    rule = ImageFont.truetype(SANS, 15)
    spaced(d, (84, 534), "GAMES COMING SOON  /  NO TEASERS  /  NO COUNTDOWNS",
           rule, (255, 120, 108), tracking=3)

    path = os.path.join(OUT, "og-home.jpg")
    card.save(path, "JPEG", quality=90, optimize=True, progressive=True)
    print("og-home.jpg", card.size, os.path.getsize(path) // 1024, "KB")


def main():
    src = Image.open(SRC).convert("RGB")
    os.makedirs(OUT, exist_ok=True)

    jobs = {
        # Portrait plate: laptop, headphones and the screen glow on the studio desk.
        "hero-panel": ((0.60, 0.08, 1.00, 1.00), (1400, 1750), 0.78,
                       (0.55, 0.45), 0.18, 1.16),
        # Square plate: the monitor test render, for the studio section.
        "desk": ((0.00, 0.12, 0.36, 0.96), (1200, 1200), 0.80,
                 (0.5, 0.5), 0.0, 1.14),
    }

    for name, (frac, size, bright, centering, fade, contrast) in jobs.items():
        im = render(src, frac, size, bright=bright, centering=centering,
                    fade_right=fade, contrast=contrast)
        path = os.path.join(OUT, name + ".webp")
        im.save(path, "WEBP", quality=84, method=6)
        print(name + ".webp", im.size, os.path.getsize(path) // 1024, "KB")

        if name == "hero-panel":
            small = im.resize((700, 875), Image.LANCZOS)
            path = os.path.join(OUT, "hero-panel-sm.webp")
            small.save(path, "WEBP", quality=82, method=6)
            print("hero-panel-sm.webp", small.size, os.path.getsize(path) // 1024, "KB")

    build_og(src)

    if "--preview" in sys.argv:
        os.makedirs("qa/tests", exist_ok=True)
        for name, (frac, size, bright, centering, fade, contrast) in jobs.items():
            im = render(src, frac, size, bright=bright, centering=centering,
                        fade_right=fade, contrast=contrast)
            im.thumbnail((900, 900), Image.LANCZOS)
            im.save("qa/tests/" + name + ".jpg", "JPEG", quality=88)
            print("preview", name)


if __name__ == "__main__":
    main()