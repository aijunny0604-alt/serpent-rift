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
    return x, y


def transform(base: Image.Image, scale_x=1.0, scale_y=1.0, rotate=0, brightness=1.0) -> Image.Image:
    w = max(1, int(base.width * scale_x))
    h = max(1, int(base.height * scale_y))
    img = base.resize((w, h), Image.Resampling.LANCZOS)
    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
    if rotate:
        img = img.rotate(rotate, resample=Image.Resampling.BICUBIC, expand=True)
    return img


def walk_deform(sprite: Image.Image, phase: float) -> Image.Image:
    out = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
    for y in range(sprite.height):
        lower = max(0, (y - sprite.height * 0.48) / (sprite.height * 0.52))
        sway = math.sin(phase) * (lower ** 1.5) * 5
        bob = -abs(math.sin(phase)) * lower * 3
        row = sprite.crop((0, y, sprite.width, y + 1))
        out.alpha_composite(row, (int(sway), int(y + bob)))
    return out


def apply_walk_pose(sprite: Image.Image, phase: float) -> Image.Image:
    w, h = sprite.size
    body = sprite.copy()
    leg_y = int(h * 0.56)
    leg_h = h - leg_y
    stride = int(math.sin(phase) * 9)
    lift_front = int(max(0, math.cos(phase)) * 6)
    lift_back = int(max(0, -math.cos(phase)) * 6)
    parts = [
        {
            "box": (int(w * 0.18), leg_y, int(w * 0.53), h),
            "dx": stride,
            "dy": -lift_front,
        },
        {
            "box": (int(w * 0.42), leg_y, int(w * 0.78), h),
            "dx": -stride,
            "dy": -lift_back,
        },
    ]
    for part in parts:
        x1, y1, x2, y2 = part["box"]
        patch = sprite.crop((x1, y1, x2, y2))
        clear = Image.new("RGBA", patch.size, (0, 0, 0, 0))
        body.paste(clear, (x1, y1), patch.getchannel("A"))
        body.alpha_composite(patch, (x1 + part["dx"], y1 + part["dy"]))

    # A tiny shoulder sway makes the walk readable without drawing helper bones.
    out = Image.new("RGBA", (w + 12, h + 6), (0, 0, 0, 0))
    out.alpha_composite(body, (6 + int(math.sin(phase) * 2), int(abs(math.sin(phase)) * -2)))
    return out


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


def draw_walk_row(sheet: Image.Image, base: Image.Image):
    sheet.paste((0, 0, 0, 0), (0, FRAME_H, FRAME_W * COLS, FRAME_H * 2))
    for col in range(COLS):
        t = col / COLS * math.tau
        sprite = transform(base, 1 + abs(math.sin(t)) * 0.025, 1 - abs(math.sin(t)) * 0.035, math.sin(t) * 3)
        sprite = walk_deform(sprite, t)
        sprite = apply_walk_pose(sprite, t)
        paste_center(sheet, sprite, col, 1, xoff=math.sin(t) * 5, yoff=-abs(math.sin(t)) * 7)
        draw = ImageDraw.Draw(sheet, "RGBA")
        ox = col * FRAME_W
        draw.ellipse([ox + 52, 137, ox + 108, 150], fill=(215, 198, 139, int(70 + abs(math.sin(t)) * 60)))


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
    draw_walk_row(sheet, base)

    # Row 2: attack
    for col in range(COLS):
        phase = col / (COLS - 1)
        p = math.sin(phase * math.pi)
        sprite = transform(base, 1 + p * 0.09, 1 - p * 0.04, -18 + p * 30, 1 + p * 0.14)
        paste_center(sheet, sprite, col, 2, xoff=p * 24, yoff=-p * 4)
        draw_attack_fx(sheet, col, 2, p)

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

    # Redraw the walk row last so oversized attack effects cannot bleed into it.
    draw_walk_row(sheet, base)

    sheet.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
