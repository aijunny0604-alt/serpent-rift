from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "player.png"
OUT = ASSETS / "player-riding-sheet.png"

FRAME_W = 160
FRAME_H = 160
COLS = 6
ROWS = 5


def fit_sprite(src: Image.Image, target_h: int = 82) -> Image.Image:
    alpha = src.getchannel("A")
    bbox = alpha.getbbox()
    cropped = src.crop(bbox)
    scale = target_h / cropped.height
    return cropped.resize((int(cropped.width * scale), target_h), Image.Resampling.LANCZOS)


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


def draw_mount(draw: ImageDraw.ImageDraw, ox: int, oy: int, phase: float, action: str, power: float):
    bob = math.sin(phase) * 4
    stride = math.sin(phase) * 10
    glow = int(80 + abs(math.sin(phase)) * 70 + power * 45)
    body = [
        ox + 31,
        oy + 88 + bob,
        ox + 129,
        oy + 130 + bob,
    ]
    mane = (190, 255, 124, 210)
    deep = (24, 55, 58, 245)
    mid = (38, 96, 92, 245)
    light = (184, 255, 125, 235)
    white = (255, 255, 255, 235)

    draw.ellipse([ox + 32, oy + 122, ox + 132, oy + 146], fill=(0, 0, 0, 72))
    for r, a in [(56, 38), (42, 48), (30, 58)]:
        draw.ellipse([ox + 80 - r, oy + 109 + bob - r * 0.42, ox + 80 + r, oy + 109 + bob + r * 0.42], fill=(120, 255, 185, a))
    draw.ellipse(body, fill=deep, outline=light, width=3)
    draw.ellipse([ox + 93, oy + 64 + bob, ox + 140, oy + 104 + bob], fill=mid, outline=light, width=3)
    draw.polygon([(ox + 107, oy + 67 + bob), (ox + 112, oy + 44 + bob), (ox + 121, oy + 70 + bob)], fill=mid, outline=light)
    draw.polygon([(ox + 124, oy + 69 + bob), (ox + 139, oy + 51 + bob), (ox + 134, oy + 80 + bob)], fill=mid, outline=light)
    draw.ellipse([ox + 122, oy + 77 + bob, ox + 130, oy + 85 + bob], fill=white)
    draw.ellipse([ox + 126, oy + 79 + bob, ox + 130, oy + 83 + bob], fill=(30, 52, 60, 255))

    tail_wave = math.sin(phase + 0.7) * 9
    draw.line([(ox + 35, oy + 102 + bob), (ox + 15, oy + 86 + bob + tail_wave), (ox + 4, oy + 102 + bob - tail_wave * 0.3)], fill=mane, width=8)
    draw.line([(ox + 36, oy + 103 + bob), (ox + 16, oy + 89 + bob + tail_wave)], fill=white, width=2)

    leg_base = oy + 119 + bob
    legs = [
        (ox + 50, stride, 0),
        (ox + 70, -stride, 1.2),
        (ox + 98, -stride * 0.8, 2.2),
        (ox + 116, stride * 0.8, 3.1),
    ]
    for x, s, off in legs:
        knee_y = leg_base + 11 + abs(math.sin(phase + off)) * 7
        foot_x = x + s
        draw.line([(x, leg_base), (x + s * 0.34, knee_y), (foot_x, oy + 142)], fill=(22, 50, 52, 255), width=8)
        draw.line([(x + 1, leg_base), (x + s * 0.34, knee_y), (foot_x, oy + 142)], fill=light, width=2)

    draw.ellipse([ox + 57, oy + 72 + bob, ox + 103, oy + 99 + bob], fill=(35, 25, 28, 220), outline=(255, 218, 98, 220), width=2)
    draw.line([(ox + 62, oy + 93 + bob), (ox + 99, oy + 86 + bob)], fill=(255, 240, 160, 160), width=2)

    if action == "attack":
        draw.arc([ox + 88, oy + 34, ox + 172, oy + 112], 196, 302, fill=(255, 255, 255, int(170 * power)), width=8)
        draw.arc([ox + 78, oy + 28, ox + 182, oy + 120], 200, 308, fill=(87, 223, 255, int(150 * power)), width=12)
    if action == "cast":
        draw.ellipse([ox + 36, oy + 99, ox + 126, oy + 139], outline=(141, 255, 251, int(170 * power)), width=4)
        for i in range(7):
            a = math.tau * i / 7 + phase
            x = ox + 81 + math.cos(a) * 48
            y = oy + 119 + math.sin(a) * 18
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 245, 175, int(190 * power)))
    if action == "hurt":
        draw.line([(ox + 30, oy + 50), (ox + 18, oy + 34)], fill=(255, 84, 105, int(180 * power)), width=5)
        draw.line([(ox + 132, oy + 52), (ox + 148, oy + 36)], fill=(255, 84, 105, int(180 * power)), width=5)


def paste_rider(frame: Image.Image, rider: Image.Image, x: int, y: int):
    frame.alpha_composite(rider, (x, y))


def main():
    rider_base = fit_sprite(Image.open(SOURCE).convert("RGBA"))
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))

    row_actions = ["idle", "walk", "attack", "hurt", "cast"]
    for row, action in enumerate(row_actions):
        for col in range(COLS):
            phase = col / COLS * math.tau
            p = math.sin(col / (COLS - 1) * math.pi)
            frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
            draw = ImageDraw.Draw(frame, "RGBA")
            if action == "idle":
                draw_mount(draw, 0, 0, phase * 0.4, action, p)
                rider = transform(rider_base, 1.0, 1.0, math.sin(phase) * 1.5)
                paste_rider(frame, rider, 54, 29 + int(math.sin(phase) * -2))
            elif action == "walk":
                draw_mount(draw, 0, 0, phase * 1.35, action, p)
                rider = transform(rider_base, 1 + abs(math.sin(phase)) * 0.03, 1 - abs(math.sin(phase)) * 0.025, math.sin(phase) * 3)
                paste_rider(frame, rider, 54 + int(math.sin(phase) * 4), 27 - int(abs(math.sin(phase)) * 5))
            elif action == "attack":
                draw_mount(draw, 0, 0, phase, action, p)
                rider = transform(rider_base, 1 + p * 0.08, 1 - p * 0.04, -12 + p * 22, 1 + p * 0.1)
                paste_rider(frame, rider, 58 + int(p * 12), 26 - int(p * 4))
            elif action == "hurt":
                q = 1 - col / (COLS - 1)
                draw_mount(draw, 0, 0, phase, action, q)
                rider = transform(tint(rider_base, (255, 68, 86, int(70 * q))), 1 + q * 0.07, 1 - q * 0.06, math.sin(col * 2.3) * 7)
                paste_rider(frame, rider, 53 + int(math.sin(col * 2.1) * 7), 31 + int(q * 3))
            else:
                draw_mount(draw, 0, 0, phase, action, p)
                rider = transform(rider_base, 1 + p * 0.06, 1 + p * 0.04, -p * 4, 1 + p * 0.12)
                paste_rider(frame, rider, 54, 25 - int(p * 7))

            sheet.alpha_composite(frame, (col * FRAME_W, row * FRAME_H))

    sheet.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
