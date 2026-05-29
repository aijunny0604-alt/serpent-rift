from pathlib import Path
import math

from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FRAME_W = 128
FRAME_H = 128
COLS = 6
ROWS = 4


def crop_alpha(img):
    bbox = img.getchannel("A").getbbox()
    return img.crop(bbox)


def fit(img, target_h):
    img = crop_alpha(img)
    scale = target_h / img.height
    return img.resize((max(1, int(img.width * scale)), target_h), Image.Resampling.LANCZOS)


def transform(base, sx=1, sy=1, rot=0, bright=1):
    img = base.resize((max(1, int(base.width * sx)), max(1, int(base.height * sy))), Image.Resampling.LANCZOS)
    if bright != 1:
        img = ImageEnhance.Brightness(img).enhance(bright)
    if rot:
        img = img.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
    return img


def tint(img, rgba):
    overlay = Image.new("RGBA", img.size, rgba)
    out = Image.alpha_composite(img, overlay)
    out.putalpha(img.getchannel("A"))
    return out


def paste(sheet, img, col, row, xoff=0, yoff=0):
    x = col * FRAME_W + (FRAME_W - img.width) // 2 + int(xoff)
    y = row * FRAME_H + FRAME_H - img.height - 8 + int(yoff)
    sheet.alpha_composite(img, (x, y))


def build(src_name, out_name, target_h):
    src = Image.open(ASSETS / src_name).convert("RGBA")
    base = fit(src, target_h)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
    for col in range(COLS):
        t = math.tau * col / COLS
        paste(sheet, transform(base, 1 + math.sin(t) * 0.025, 1 - math.sin(t) * 0.035, math.sin(t) * 2), col, 0, yoff=math.sin(t) * -3)
    for col in range(COLS):
        t = math.tau * col / COLS
        paste(sheet, transform(base, 1 + abs(math.sin(t)) * 0.08, 1 - abs(math.sin(t)) * 0.1, math.sin(t) * 9), col, 1, xoff=math.sin(t) * 9, yoff=-abs(math.sin(t)) * 7)
    for col in range(COLS):
        p = math.sin(math.pi * col / (COLS - 1))
        paste(sheet, transform(base, 1 + p * 0.22, 1 - p * 0.12, -16 + p * 32, 1.16), col, 2, xoff=p * 20, yoff=-p * 6)
    for col in range(COLS):
        p = 1 - col / (COLS - 1)
        hurt = tint(base, (255, 70, 80, int(95 * p)))
        paste(sheet, transform(hurt, 1 + p * 0.16, 1 - p * 0.16, math.sin(col * 2.7) * 12, 1.25), col, 3, xoff=math.sin(col * 2.1) * 12, yoff=p * 5)
    sheet.save(ASSETS / out_name)
    print(out_name)


def main():
    build("shade.png", "shade-action-sheet.png", 92)
    build("elite.png", "elite-action-sheet.png", 108)
    build("boss.png", "boss-action-sheet.png", 124)


if __name__ == "__main__":
    main()
