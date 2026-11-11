import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = "assets"
OUT = "assets/opt"
os.makedirs(OUT, exist_ok=True)

def save_webp(img, name, quality=82):
    p = os.path.join(OUT, name)
    img.save(p, "WEBP", quality=quality, method=6)
    print(f"{name:22} {img.size[0]}x{img.size[1]:<5} {os.path.getsize(p)//1024:5} KB")

def fit(img, w, h):
    """cover-crop to exact box"""
    iw, ih = img.size
    s = max(w / iw, h / ih)
    img = img.resize((int(iw * s + .5), int(ih * s + .5)), Image.LANCZOS)
    iw, ih = img.size
    l = (iw - w) // 2
    t = (ih - h) // 2
    return img.crop((l, t, l + w, t + h))

def width(img, w):
    iw, ih = img.size
    return img.resize((w, int(ih * w / iw + .5)), Image.LANCZOS)

# ---- hero / background art ----------------------------------------------
save_webp(fit(Image.open(f"{SRC}/king.png").convert("RGB"), 1920, 1280), "king.webp", 80)
save_webp(fit(Image.open(f"{SRC}/stalkbg.png").convert("RGB"), 1920, 1280), "stalkbg.webp", 80)
save_webp(fit(Image.open(f"{SRC}/BG.jpg").convert("RGB"), 1920, 1080), "bg.webp", 80)
save_webp(fit(Image.open(f"{SRC}/dw.jpg").convert("RGB"), 1600, 700), "dw.webp", 82)

# ---- posters -------------------------------------------------------------
save_webp(width(Image.open(f"{SRC}/poster.png").convert("RGB"), 800), "poster.webp", 84)
save_webp(width(Image.open(f"{SRC}/darkweb.png").convert("RGB"), 800), "darkweb.webp", 84)
save_webp(width(Image.open(f"{SRC}/uber.png").convert("RGB"), 800), "uber.webp", 84)
save_webp(width(Image.open(f"{SRC}/stalker.png").convert("RGB"), 800), "stalker.webp", 84)

# ---- logo ---------------------------------------------------------------
logo = Image.open(f"{SRC}/logo.png")
save_webp(logo.resize((240, 240), Image.LANCZOS), "logo.webp", 90)

# ---- screenshots (small source, upscale softly to a 2x-friendly 694) -----
for n in (1, 2, 3):
    im = Image.open(f"{SRC}/sc{n}.png").convert("RGB")
    save_webp(im.resize((im.width * 2, im.height * 2), Image.LANCZOS), f"sc{n}.webp", 86)

# ---- social cards -------------------------------------------------------
FONT = r"C:\Windows\Fonts\seguibl.ttf"   # Segoe UI Bold
font_path = FONT if os.path.exists(FONT) else r"C:\Windows\Fonts\arialbd.ttf"

def wrap(draw, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def og(src, title, out, focus=0.5):
    W, H = 1200, 630
    base = fit(Image.open(src).convert("RGB"), W, H)
    bg = base.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.42))
    d = ImageDraw.Draw(bg, "RGBA")
    # bottom-up oxblood wash
    for y in range(H):
        a = int(235 * (y / H) ** 1.5)
        d.line([(0, y), (W, y)], fill=(15, 4, 4, a))
    d.rectangle([0, 0, W, 5], fill=(255, 61, 61, 255))
    # left rule + kicker
    f_small = ImageFont.truetype(font_path, 26)
    f_title = ImageFont.truetype(font_path, 92)
    d.text((72, 60), "GURRYGAMES", font=f_small, fill=(255, 236, 236, 210))
    d.text((72, 96), "THE KING OF HORROR GAMES", font=ImageFont.truetype(font_path, 18), fill=(212, 155, 155, 190))
    y = 250
    for line in wrap(d, title.upper(), f_title, W - 144)[:3]:
        d.text((72, y), line, font=f_title, fill=(255, 236, 236, 255))
        y += 104
    d.rectangle([72, y + 18, 132, y + 24], fill=(255, 61, 61, 255))
    f_tag = ImageFont.truetype(font_path, 22)
    d.text((72, H - 74), "PSYCHOLOGICAL HORROR  /  WINDOWS PC", font=f_tag, fill=(255, 236, 236, 170))
    p = os.path.join(OUT, out)
    bg.save(p, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{out:22} 1200x630      {os.path.getsize(p)//1024:5} KB")

og(f"{SRC}/stalker.png", "Stalker Man From Japan", "og-stalker.jpg")
og(f"{SRC}/poster.png", "Deak Killer 2", "og-deak.jpg")
og(f"{SRC}/darkweb.png", "Dark Web Man From Japan", "og-darkweb.jpg")
og(f"{SRC}/uber.png", "Uber Man From Japan", "og-uber.jpg")
og(f"{SRC}/king.png", "Gurry Games", "og-home.jpg")
print("done")