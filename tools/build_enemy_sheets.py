from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FRAME_W = 128
FRAME_H = 128
COLS = 6
ROWS = 4


def crop_alpha(img):
    bbox = img.getchannel("A").getbbox()
    return img.crop(bbox)


def fit(img, target_h, target_w=None):
    img = crop_alpha(img)
    scale = target_h / img.height
    if target_w:
        scale = min(scale, target_w / img.width)
    return img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.Resampling.LANCZOS)


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
    return x, y


def draw_walk_ground(sheet, col, row, power, color=(210, 190, 120, 115)):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    a = int(80 + abs(power) * 70)
    draw.ellipse([ox + 36 - abs(power) * 6, oy + 111, ox + 92 + abs(power) * 8, oy + 123], fill=color[:3] + (a,))
    for i in range(3):
        x = ox + 42 + i * 17 + power * 8
        draw.line([(x, oy + 113 + i % 2 * 3), (x - power * 10, oy + 118 + i % 2 * 2)], fill=color[:3] + (int(a * 0.55),), width=2)


def draw_attack_burst(sheet, col, row, phase, color):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    hit = math.sin(math.pi * phase)
    if hit <= 0:
        return
    alpha = int(190 * hit)
    cx = ox + 72 + hit * 12
    cy = oy + 58
    box = [cx - 56, cy - 40, cx + 54, cy + 64]
    draw.arc(box, 208, 348, fill=color[:3] + (alpha,), width=9)
    draw.arc([box[0] + 8, box[1] + 8, box[2] - 8, box[3] - 8], 218, 336, fill=(255, 255, 255, int(alpha * 0.72)), width=3)
    for i in range(7):
        a = -0.9 + i * 0.27 + phase * 0.65
        r1 = 34 + i % 3 * 5
        r2 = r1 + 12 + hit * 10
        x1 = cx + math.cos(a) * r1
        y1 = cy + math.sin(a) * r1 * 0.72
        x2 = cx + math.cos(a) * r2
        y2 = cy + math.sin(a) * r2 * 0.72
        draw.line([(x1, y1), (x2, y2)], fill=(255, 245, 190, int(alpha * 0.55)), width=2)


def draw_cast_shadow(sheet, col, row, power):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    draw.ellipse([ox + 28, oy + 108 - power * 2, ox + 100, oy + 124 + power * 2], fill=(0, 0, 0, int(65 + power * 50)))


def build(src_name, out_name, target_h):
    src = Image.open(ASSETS / src_name).convert("RGBA")
    base = fit(src, target_h, 96 if "boss" in src_name else None)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
    for col in range(COLS):
        t = math.tau * col / COLS
        breath = math.sin(t)
        paste(sheet, transform(base, 1 + breath * 0.018, 1 - breath * 0.028, breath * 1.6), col, 0, yoff=breath * -3)
    for col in range(COLS):
        t = math.tau * col / COLS
        step = math.sin(t)
        lift = abs(step)
        frame = transform(base, 1 + lift * 0.12, 1 - lift * 0.14, step * 12, 1.0 + lift * 0.08)
        paste(sheet, frame, col, 1, xoff=step * 13, yoff=-lift * 10)
        draw_walk_ground(sheet, col, 1, step)
    for col in range(COLS):
        phase = col / (COLS - 1)
        hit = math.sin(math.pi * phase)
        windup = max(0, 0.45 - phase) / 0.45
        strike = min(1, phase / 0.55)
        frame = transform(base, 1 + hit * 0.26, 1 - hit * 0.14, -22 + strike * 42, 1.06 + hit * 0.16)
        paste(sheet, frame, col, 2, xoff=-windup * 10 + hit * 26, yoff=-hit * 8)
        draw_attack_burst(sheet, col, 2, phase, (255, 112, 120, 255))
    for col in range(COLS):
        p = 1 - col / (COLS - 1)
        hurt = tint(base, (255, 70, 80, int(95 * p)))
        paste(sheet, transform(hurt, 1 + p * 0.2, 1 - p * 0.18, math.sin(col * 2.7) * 14, 1.25), col, 3, xoff=math.sin(col * 2.1) * 14, yoff=p * 5)
    sheet.save(ASSETS / out_name)
    print(out_name)


def build_boss_variant(src_name, out_name, target_h=124, accent=(255, 240, 180, 255)):
    src = Image.open(ASSETS / src_name).convert("RGBA")
    base = fit(src, target_h, 96)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
    for col in range(COLS):
        t = math.tau * col / COLS
        breath = math.sin(t)
        draw_cast_shadow(sheet, col, 0, abs(breath))
        paste(sheet, transform(base, 1 + breath * 0.018, 1 - breath * 0.028, breath * 1.4), col, 0, yoff=breath * -3)
    for col in range(COLS):
        t = math.tau * col / COLS
        step = math.sin(t)
        lift = abs(step)
        draw_cast_shadow(sheet, col, 1, lift)
        frame = transform(base, 1 + lift * 0.11, 1 - lift * 0.13, step * 10, 1.0 + lift * 0.08)
        paste(sheet, frame, col, 1, xoff=step * 12, yoff=-lift * 9)
        draw_walk_ground(sheet, col, 1, step, accent[:3] + (100,))
    for col in range(COLS):
        phase = col / (COLS - 1)
        hit = math.sin(math.pi * phase)
        windup = max(0, 0.45 - phase) / 0.45
        strike = min(1, phase / 0.55)
        draw_cast_shadow(sheet, col, 2, hit)
        frame = transform(base, 1 + hit * 0.22, 1 - hit * 0.12, -18 + strike * 36, 1.08 + hit * 0.12)
        paste(sheet, frame, col, 2, xoff=-windup * 8 + hit * 24, yoff=-hit * 8)
        draw_attack_burst(sheet, col, 2, phase, accent)
    for col in range(COLS):
        p = 1 - col / (COLS - 1)
        frame = tint(base, (255, 70, 80, int(95 * p)))
        draw_cast_shadow(sheet, col, 3, p)
        paste(sheet, transform(frame, 1 + p * 0.18, 1 - p * 0.18, math.sin(col * 2.7) * 13, 1.25), col, 3, xoff=math.sin(col * 2.1) * 13, yoff=p * 5)
    sheet.save(ASSETS / out_name)
    print(out_name)


def main():
    build("shade.png", "shade-action-sheet.png", 92)
    build("elite.png", "elite-action-sheet.png", 108)
    build("boss.png", "boss-action-sheet.png", 100)
    build_boss_variant("boss-forest.png", "boss-forest-action-sheet.png", 100, (98, 255, 156, 255))
    build_boss_variant("boss-volcano.png", "boss-volcano-action-sheet.png", 100, (255, 105, 32, 255))
    build_boss_variant("boss-frost.png", "boss-frost-action-sheet.png", 100, (160, 236, 255, 255))
    build_boss_variant("boss-void.png", "boss-void-action-sheet.png", 100, (202, 91, 255, 255))


if __name__ == "__main__":
    main()
