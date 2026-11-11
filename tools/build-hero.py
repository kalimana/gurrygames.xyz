"""Generate the site's imagery from the studio key art.

Run from the repo root:  python tools/build-hero.py
Writes the WebP plates used by the live pages (plus qa/tests previews when
called with --preview).
"""
import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

SRC = "assets/king.png"
OUT = "assets/opt"

INK = (255, 236, 236)
BLACK = (12, 3, 3)


def duotone(im, contrast=1.12, bright=0.7):
    grey = ImageOps.grayscale(im)
    grey = ImageEnhance.Contrast(grey).enhance(contrast)
    out = ImageOps.colorize(grey, black=BLACK, white=INK)
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


def main():
    src = Image.open(SRC).convert("RGB")
    os.makedirs(OUT, exist_ok=True)

    jobs = {
        # Tall panel: the left monitor, keyboard and a sliver of the logo.
        "hero-panel": ((0.00, 0.12, 0.30, 0.94), (1600, 1900), 0.72, (0.5, 0.5), 0.28),
        # Square plate: the right-hand side of the desk for the studio section.
        "desk": ((0.78, 0.20, 1.00, 1.00), (1200, 1200), 0.72, (0.5, 0.55), 0.0),
    }

    for name, (frac, size, bright, centering, fade) in jobs.items():
        im = render(src, frac, size, bright=bright, centering=centering, fade_right=fade)
        path = os.path.join(OUT, name + ".webp")
        im.save(path, "WEBP", quality=84, method=6)
        print(name + ".webp", im.size, os.path.getsize(path) // 1024, "KB")

    if "--preview" in sys.argv:
        os.makedirs("qa/tests", exist_ok=True)
        for name, (frac, size, bright, centering, fade) in jobs.items():
            im = render(src, frac, size, bright=bright, centering=centering, fade_right=fade)
            im.thumbnail((900, 900), Image.LANCZOS)
            im.save("qa/tests/" + name + ".jpg", "JPEG", quality=88)
            print("preview", name)


if __name__ == "__main__":
    main()