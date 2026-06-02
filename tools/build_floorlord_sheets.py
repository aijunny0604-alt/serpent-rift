from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

FRAME_W = 384
FRAME_H = 384
COLS = 6
ROWS = 4

FLOORLORDS = [
    ("boss-floorlord-1.png", "boss-floorlord-1-sheet.png", (125, 255, 176, 255)),
    ("boss-floorlord-2.png", "boss-floorlord-2-sheet.png", (255, 124, 58, 255)),
    ("boss-floorlord-3.png", "boss-floorlord-3-sheet.png", (150, 235, 255, 255)),
    ("boss-floorlord-4.png", "boss-floorlord-4-sheet.png", (205, 94, 255, 255)),
    ("boss-floorlord-5.png", "boss-floorlord-5-sheet.png", (255, 238, 145, 255)),
]


def crop_alpha(img: Image.Image) -> Image.Image:
    bbox = img.getchannel("A").getbbox()
    return img.crop(bbox)


def fit(img: Image.Image, target_h: int = 354, target_w: int = 360) -> Image.Image:
    cropped = crop_alpha(img)
    scale = min(target_h / cropped.height, target_w / cropped.width)
    return cropped.resize((max(1, int(cropped.width * scale)), max(1, int(cropped.height * scale))), Image.Resampling.LANCZOS)


def transform(base: Image.Image, sx=1.0, sy=1.0, rot=0.0, bright=1.0) -> Image.Image:
    w = max(1, int(base.width * sx))
    h = max(1, int(base.height * sy))
    img = base.resize((w, h), Image.Resampling.LANCZOS)
    if bright != 1.0:
        img = ImageEnhance.Brightness(img).enhance(bright)
    if rot:
        img = img.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)
    return img


def tint(img: Image.Image, rgba) -> Image.Image:
    overlay = Image.new("RGBA", img.size, rgba)
    out = Image.alpha_composite(img, overlay)
    out.putalpha(img.getchannel("A"))
    return out


def paste(sheet: Image.Image, img: Image.Image, col: int, row: int, xoff=0, yoff=0):
    x = col * FRAME_W + (FRAME_W - img.width) // 2 + int(xoff)
    y = row * FRAME_H + FRAME_H - img.height - 18 + int(yoff)
    sheet.alpha_composite(img, (x, y))


def draw_shadow(sheet: Image.Image, col: int, row: int, power: float, accent):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    draw.ellipse([ox + 76, oy + 324 - power * 8, ox + 310, oy + 366 + power * 5], fill=(0, 0, 0, int(86 + power * 42)))
    draw.ellipse([ox + 98, oy + 310 - power * 10, ox + 288, oy + 370 + power * 7], outline=accent[:3] + (int(62 + power * 90),), width=5)


def draw_attack(sheet: Image.Image, col: int, row: int, phase: float, accent):
    hit = math.sin(phase * math.pi)
    if hit <= 0:
        return
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    alpha = int(210 * hit)
    box = [ox + 178 - hit * 72, oy + 76 - hit * 16, ox + 396 + hit * 22, oy + 296 + hit * 30]
    draw.arc(box, 198, 344, fill=accent[:3] + (alpha,), width=22)
    draw.arc([box[0] + 18, box[1] + 18, box[2] - 18, box[3] - 18], 208, 334, fill=(255, 255, 255, int(alpha * 0.76)), width=8)
    for i in range(12):
        a = -0.8 + i * 0.16 + phase * 0.8
        r1 = 84 + (i % 4) * 10
        r2 = r1 + 28 + hit * 18
        cx = ox + 216 + hit * 34
        cy = oy + 176
        draw.line(
            [
                (cx + math.cos(a) * r1, cy + math.sin(a) * r1 * 0.75),
                (cx + math.cos(a) * r2, cy + math.sin(a) * r2 * 0.75),
            ],
            fill=(255, 248, 205, int(alpha * 0.62)),
            width=4,
        )


def draw_cast_runes(sheet: Image.Image, col: int, row: int, power: float, accent):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    alpha = int(115 + power * 70)
    for i in range(3):
        pad = 64 + i * 18
        draw.ellipse([ox + pad, oy + 292 - i * 8, ox + FRAME_W - pad, oy + 362 + i * 5], outline=accent[:3] + (alpha - i * 22,), width=4)
    for i in range(10):
        a = math.tau * i / 10 + power * 1.4
        x = ox + 192 + math.cos(a) * 132
        y = oy + 326 + math.sin(a) * 38
        draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(255, 255, 255, int(alpha * 0.78)))


def build_one(src_name: str, out_name: str, accent):
    src = Image.open(ASSETS / src_name).convert("RGBA")
    base = fit(src)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))

    for col in range(COLS):
        t = math.tau * col / COLS
        breath = math.sin(t)
        draw_shadow(sheet, col, 0, abs(breath), accent)
        frame = transform(base, 1 + breath * 0.016, 1 - breath * 0.022, breath * 1.2, 1.0 + abs(breath) * 0.035)
        paste(sheet, frame, col, 0, yoff=breath * -5)
        draw_cast_runes(sheet, col, 0, abs(breath) * 0.4, accent)

    for col in range(COLS):
        t = math.tau * col / COLS
        step = math.sin(t)
        lift = abs(step)
        draw_shadow(sheet, col, 1, lift, accent)
        frame = transform(base, 1 + lift * 0.06, 1 - lift * 0.07, step * 4.5, 1.0 + lift * 0.06)
        paste(sheet, frame, col, 1, xoff=step * 14, yoff=-lift * 18)
        draw_cast_runes(sheet, col, 1, lift * 0.55, accent)

    for col in range(COLS):
        phase = col / (COLS - 1)
        hit = math.sin(phase * math.pi)
        windup = max(0, 0.45 - phase) / 0.45
        strike = min(1, phase / 0.55)
        draw_shadow(sheet, col, 2, hit, accent)
        frame = transform(base, 1 + hit * 0.1, 1 - hit * 0.07, -8 + strike * 16, 1.07 + hit * 0.09)
        paste(sheet, frame, col, 2, xoff=-windup * 18 + hit * 36, yoff=-hit * 16)
        draw_attack(sheet, col, 2, phase, accent)

    for col in range(COLS):
        p = 1 - col / (COLS - 1)
        draw_shadow(sheet, col, 3, p, (255, 80, 96, 255))
        frame = tint(base, (255, 68, 86, int(92 * p)))
        frame = transform(frame, 1 + p * 0.09, 1 - p * 0.08, math.sin(col * 2.6) * 7, 1.18)
        paste(sheet, frame, col, 3, xoff=math.sin(col * 2.1) * 20, yoff=p * 8)
        draw_attack(sheet, col, 3, p * 0.45, (255, 80, 96, 255))

    sheet.save(ASSETS / out_name)
    print(out_name)


def main():
    for src_name, out_name, accent in FLOORLORDS:
        build_one(src_name, out_name, accent)


if __name__ == "__main__":
    main()
