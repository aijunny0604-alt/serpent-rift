from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "player.png"
OUT = ASSETS / "player-action-sheet.png"

FRAME_W = 160
FRAME_H = 160
COLS = 6
ROWS = 5


def fit_sprite(src: Image.Image, target_h: int = 136) -> Image.Image:
    alpha = src.getchannel("A")
    bbox = alpha.getbbox()
    cropped = src.crop(bbox)
    scale = target_h / cropped.height
    resized = cropped.resize((int(cropped.width * scale), target_h), Image.Resampling.LANCZOS)
    return resized


def tint(sprite: Image.Image, rgba) -> Image.Image:
    overlay = Image.new("RGBA", sprite.size, rgba)
    out = Image.alpha_composite(sprite, overlay)
    out.putalpha(sprite.getchannel("A"))
    return out


def paste_center(sheet: Image.Image, sprite: Image.Image, col: int, row: int, xoff=0, yoff=0):
    x = col * FRAME_W + (FRAME_W - sprite.width) // 2 + int(xoff)
    y = row * FRAME_H + FRAME_H - sprite.height - 8 + int(yoff)
    sheet.alpha_composite(sprite, (x, y))


def transform(base: Image.Image, scale_x=1.0, scale_y=1.0, rotate=0, brightness=1.0) -> Image.Image:
    w = max(1, int(base.width * scale_x))
    h = max(1, int(base.height * scale_y))
    img = base.resize((w, h), Image.Resampling.LANCZOS)
    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
    if rotate:
        img = img.rotate(rotate, resample=Image.Resampling.BICUBIC, expand=True)
    return img


def draw_attack_fx(sheet: Image.Image, col: int, row: int, power: float):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    cx = ox + 102
    cy = oy + 62
    box = [cx - 58, cy - 44, cx + 70, cy + 76]
    alpha = int(210 * power)
    draw.arc(box, 210, 345, fill=(255, 244, 155, alpha), width=12)
    draw.arc([box[0] + 8, box[1] + 8, box[2] - 6, box[3] - 6], 218, 338, fill=(255, 255, 255, alpha), width=4)


def draw_attack_arm(sheet: Image.Image, col: int, row: int, phase: float):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    shoulder = (ox + 86, oy + 79)
    sweep = -145 + 250 * phase
    upper_len = 28
    fore_len = 30
    sword_len = 78
    upper_angle = math.radians(sweep - 18)
    fore_angle = math.radians(sweep + 18 * math.sin(phase * math.pi))
    elbow = (
        shoulder[0] + math.cos(upper_angle) * upper_len,
        shoulder[1] + math.sin(upper_angle) * upper_len,
    )
    hand = (
        elbow[0] + math.cos(fore_angle) * fore_len,
        elbow[1] + math.sin(fore_angle) * fore_len,
    )
    tip = (
        hand[0] + math.cos(fore_angle) * sword_len,
        hand[1] + math.sin(fore_angle) * sword_len,
    )
    guard_a = fore_angle + math.pi / 2
    guard_1 = (hand[0] + math.cos(guard_a) * 10, hand[1] + math.sin(guard_a) * 10)
    guard_2 = (hand[0] - math.cos(guard_a) * 10, hand[1] - math.sin(guard_a) * 10)

    trail_alpha = int(190 * math.sin(phase * math.pi))
    trail_box = [ox + 18, oy + 8, ox + 151, oy + 141]
    draw.arc(trail_box, int(sweep - 42), int(sweep + 34), fill=(255, 235, 109, trail_alpha), width=14)
    draw.arc([trail_box[0] + 8, trail_box[1] + 8, trail_box[2] - 8, trail_box[3] - 8], int(sweep - 32), int(sweep + 24), fill=(255, 255, 255, trail_alpha), width=4)

    # Gold-trimmed animated arm drawn above the body so the swing reads clearly.
    draw.line([shoulder, elbow], fill=(35, 35, 54, 255), width=13)
    draw.line([shoulder, elbow], fill=(220, 168, 72, 245), width=5)
    draw.line([elbow, hand], fill=(30, 31, 48, 255), width=12)
    draw.line([elbow, hand], fill=(70, 190, 245, 230), width=4)
    draw.ellipse([hand[0] - 7, hand[1] - 7, hand[0] + 7, hand[1] + 7], fill=(236, 185, 98, 255), outline=(255, 243, 176, 255), width=2)
    draw.line([guard_1, guard_2], fill=(255, 220, 111, 255), width=5)
    draw.line([hand, tip], fill=(255, 255, 255, 255), width=9)
    draw.line([hand, tip], fill=(75, 220, 255, 255), width=4)
    draw.ellipse([tip[0] - 5, tip[1] - 5, tip[0] + 5, tip[1] + 5], fill=(255, 245, 126, 240))


def draw_cast_fx(sheet: Image.Image, col: int, row: int, power: float):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    cx = ox + FRAME_W // 2
    cy = oy + 104
    alpha = int(150 * power)
    draw.ellipse([cx - 44, cy - 14, cx + 44, cy + 14], outline=(91, 226, 255, alpha), width=4)
    draw.ellipse([cx - 30, cy - 9, cx + 30, cy + 9], outline=(255, 223, 100, alpha), width=2)
    for i in range(6):
        a = math.tau * i / 6 + power
        x = cx + math.cos(a) * 48
        y = cy + math.sin(a) * 17
        draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 242, 151, alpha))


def draw_hurt_fx(sheet: Image.Image, col: int, row: int, power: float):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    cx = ox + FRAME_W // 2
    cy = oy + 75
    alpha = int(180 * power)
    for i in range(5):
        a = math.tau * i / 5
        x1 = cx + math.cos(a) * 35
        y1 = cy + math.sin(a) * 28
        x2 = cx + math.cos(a) * 56
        y2 = cy + math.sin(a) * 46
        draw.line([x1, y1, x2, y2], fill=(255, 78, 92, alpha), width=4)


def main():
    src = Image.open(SOURCE).convert("RGBA")
    base = fit_sprite(src)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))

    # Row 0: idle
    for col in range(COLS):
        t = col / COLS * math.tau
        sprite = transform(base, 1 + math.sin(t) * 0.01, 1 - math.sin(t) * 0.012, math.sin(t) * 1.5)
        paste_center(sheet, sprite, col, 0, yoff=math.sin(t) * -3)

    # Row 1: walk
    for col in range(COLS):
        t = col / COLS * math.tau
        sprite = transform(base, 1 + abs(math.sin(t)) * 0.045, 1 - abs(math.sin(t)) * 0.06, math.sin(t) * 7)
        paste_center(sheet, sprite, col, 1, xoff=math.sin(t) * 6, yoff=-abs(math.sin(t)) * 8)
        draw = ImageDraw.Draw(sheet, "RGBA")
        ox = col * FRAME_W
        draw.ellipse([ox + 52, 137, ox + 108, 150], fill=(215, 198, 139, int(70 + abs(math.sin(t)) * 60)))

    # Row 2: attack
    for col in range(COLS):
        phase = col / (COLS - 1)
        p = math.sin(phase * math.pi)
        sprite = transform(base, 1 + p * 0.09, 1 - p * 0.04, -18 + p * 30, 1 + p * 0.14)
        paste_center(sheet, sprite, col, 2, xoff=p * 24, yoff=-p * 4)
        draw_attack_fx(sheet, col, 2, p)
        draw_attack_arm(sheet, col, 2, phase)

    # Row 3: hurt
    for col in range(COLS):
        p = 1 - col / (COLS - 1)
        sprite = transform(tint(base, (255, 63, 79, int(70 * p))), 1 + p * 0.12, 1 - p * 0.13, math.sin(col * 2.3) * 10)
        paste_center(sheet, sprite, col, 3, xoff=math.sin(col * 2.1) * 10, yoff=p * 4)
        draw_hurt_fx(sheet, col, 3, p)

    # Row 4: cast
    for col in range(COLS):
        p = math.sin((col / (COLS - 1)) * math.pi)
        sprite = transform(base, 1 + p * 0.07, 1 + p * 0.07, p * -5, 1 + p * 0.18)
        paste_center(sheet, sprite, col, 4, yoff=-p * 12)
        draw_cast_fx(sheet, col, 4, p)

    sheet.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
