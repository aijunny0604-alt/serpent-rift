from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FRAME_W = 160
FRAME_H = 160
COLS = 6
ROWS = 5


def fit_sprite(src: Image.Image, target_h: int = 118) -> Image.Image:
    alpha = src.getchannel("A")
    bbox = alpha.getbbox()
    cropped = src.crop(bbox)
    scale = target_h / cropped.height
    return cropped.resize((max(1, int(cropped.width * scale)), target_h), Image.Resampling.LANCZOS)


def tint(sprite: Image.Image, rgba) -> Image.Image:
    overlay = Image.new("RGBA", sprite.size, rgba)
    out = Image.alpha_composite(sprite, overlay)
    out.putalpha(sprite.getchannel("A"))
    return out


def transform(base: Image.Image, scale_x=1.0, scale_y=1.0, rotate=0, brightness=1.0) -> Image.Image:
    w = max(1, int(base.width * scale_x))
    h = max(1, int(base.height * scale_y))
    img = base.resize((w, h), Image.Resampling.LANCZOS)
    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
    if rotate:
        img = img.rotate(rotate, resample=Image.Resampling.BICUBIC, expand=True)
    return img


def paste_center(sheet: Image.Image, sprite: Image.Image, col: int, row: int, xoff=0, yoff=0):
    x = col * FRAME_W + (FRAME_W - sprite.width) // 2 + int(xoff)
    y = row * FRAME_H + FRAME_H - sprite.height - 14 + int(yoff)
    sheet.alpha_composite(sprite, (x, y))


def draw_weapon_fx(sheet: Image.Image, col: int, row: int, power: float, color, kind: str):
    draw = ImageDraw.Draw(sheet, "RGBA")
    ox = col * FRAME_W
    oy = row * FRAME_H
    cx = ox + 92
    cy = oy + 74
    alpha = int(210 * power)
    if kind == "blade":
        draw.arc([cx - 38, cy - 34, cx + 72, cy + 70], 210, 345, fill=(255, 255, 255, alpha), width=5)
        draw.arc([cx - 44, cy - 42, cx + 82, cy + 80], 215, 348, fill=color[:3] + (int(160 * power),), width=10)
    elif kind == "tank":
        draw.arc([ox + 28, oy + 30, ox + 142, oy + 128], 140, 318, fill=color[:3] + (int(190 * power),), width=12)
        draw.arc([ox + 42, oy + 44, ox + 128, oy + 118], 150, 308, fill=(255, 255, 255, int(130 * power)), width=5)
        draw.line([(ox + 54, oy + 102), (ox + 126, oy + 102)], fill=color[:3] + (int(150 * power),), width=5)
    else:
        draw.ellipse([ox + 44, oy + 107, ox + 118, oy + 135], outline=color[:3] + (int(170 * power),), width=4)
        for i in range(7):
            a = math.tau * i / 7 + power
            x = ox + 81 + math.cos(a) * 46
            y = oy + 119 + math.sin(a) * 17
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 255, 255, int(180 * power)))


def draw_partner(name: str, src_name: str, out_name: str, tint_rgba, accent_rgba, kind: str):
    src = Image.open(ASSETS / src_name).convert("RGBA")
    base = fit_sprite(src)
    if tint_rgba:
        base = tint(base, tint_rgba)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))

    for row, action in enumerate(["idle", "walk", "attack", "hurt", "cast"]):
        for col in range(COLS):
            phase = col / COLS * math.tau
            power = math.sin((col / (COLS - 1)) * math.pi)
            if action == "idle":
                sprite = transform(base, 1 + math.sin(phase) * 0.01, 1 - math.sin(phase) * 0.012, math.sin(phase) * 1.2)
                paste_center(sheet, sprite, col, row, yoff=math.sin(phase) * -3)
            elif action == "walk":
                stride = abs(math.sin(phase))
                sprite = transform(base, 1 + stride * 0.03, 1 - stride * 0.04, math.sin(phase) * 4)
                paste_center(sheet, sprite, col, row, xoff=math.sin(phase) * 5, yoff=-stride * 8)
                draw = ImageDraw.Draw(sheet, "RGBA")
                ox = col * FRAME_W
                draw.ellipse([ox + 55, row * FRAME_H + 137, ox + 108, row * FRAME_H + 149], fill=accent_rgba[:3] + (80,))
            elif action == "attack":
                sprite = transform(base, 1 + power * 0.08, 1 - power * 0.04, -14 + power * 26, 1 + power * 0.12)
                paste_center(sheet, sprite, col, row, xoff=power * 18, yoff=-power * 4)
                draw_weapon_fx(sheet, col, row, power, accent_rgba, kind)
            elif action == "hurt":
                q = 1 - col / (COLS - 1)
                sprite = transform(tint(base, (255, 68, 86, int(q * 80))), 1 + q * 0.09, 1 - q * 0.11, math.sin(col * 2.2) * 9)
                paste_center(sheet, sprite, col, row, xoff=math.sin(col * 2.1) * 9, yoff=q * 4)
                draw = ImageDraw.Draw(sheet, "RGBA")
                ox = col * FRAME_W
                oy = row * FRAME_H
                for i in range(4):
                    a = math.tau * i / 4 + 0.4
                    draw.line([ox + 80 + math.cos(a) * 30, oy + 76 + math.sin(a) * 22, ox + 80 + math.cos(a) * 50, oy + 76 + math.sin(a) * 38], fill=(255, 80, 98, int(160 * q)), width=4)
            else:
                sprite = transform(base, 1 + power * 0.06, 1 + power * 0.06, -power * 4, 1 + power * 0.16)
                paste_center(sheet, sprite, col, row, yoff=-power * 11)
                draw_weapon_fx(sheet, col, row, power, accent_rgba, "staff")

    sheet.save(ASSETS / out_name)
    print(name, ASSETS / out_name)


def main():
    draw_partner("aria", "partner-aria.png", "partner-aria-sheet.png", None, (141, 255, 251, 255), "staff")
    draw_partner("bran", "partner-bran.png", "partner-bran-sheet.png", None, (60, 255, 170, 255), "tank")
    draw_partner("ren", "partner-ren.png", "partner-ren-sheet.png", None, (255, 217, 101, 255), "blade")


if __name__ == "__main__":
    main()
