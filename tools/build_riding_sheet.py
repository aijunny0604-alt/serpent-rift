from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PLAYER_SOURCE = ASSETS / "player.png"
MOUNT_SOURCE = ASSETS / "lumi-mount.png"
OUT = ASSETS / "player-riding-sheet-v2.png"

FRAME_W = 160
FRAME_H = 160
COLS = 6
ROWS = 5


def fit_sprite(src: Image.Image, target_h: int) -> Image.Image:
    alpha = src.getchannel("A")
    bbox = alpha.getbbox()
    cropped = src.crop(bbox)
    scale = target_h / cropped.height
    return cropped.resize((max(1, int(cropped.width * scale)), target_h), Image.Resampling.LANCZOS)


def fit_mount(src: Image.Image, target_w: int = 146) -> Image.Image:
    alpha = src.getchannel("A")
    bbox = alpha.getbbox()
    cropped = src.crop(bbox)
    scale = target_w / cropped.width
    return cropped.resize((target_w, max(1, int(cropped.height * scale))), Image.Resampling.LANCZOS)


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


def paste_center(frame: Image.Image, sprite: Image.Image, center_x: int, bottom_y: int):
    x = int(center_x - sprite.width / 2)
    y = int(bottom_y - sprite.height)
    frame.alpha_composite(sprite, (x, y))
    return x, y


def draw_shadow_and_glow(frame: Image.Image, mount: Image.Image, x: int, y: int, color=(87, 255, 217, 160)):
    draw = ImageDraw.Draw(frame, "RGBA")
    draw.ellipse([24, 126, 142, 151], fill=(0, 0, 0, 74))

    aura = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    aura.alpha_composite(mount, (x, y))
    alpha = aura.getchannel("A").filter(ImageFilter.GaussianBlur(7))
    glow = Image.new("RGBA", frame.size, color)
    glow.putalpha(alpha.point(lambda v: int(v * 0.35)))
    frame.alpha_composite(glow)


def draw_action_fx(draw: ImageDraw.ImageDraw, action: str, phase: float, power: float):
    if action == "attack":
        draw.arc([86, 36, 174, 112], 192, 304, fill=(255, 255, 255, int(190 * power)), width=7)
        draw.arc([74, 28, 186, 122], 198, 312, fill=(87, 223, 255, int(150 * power)), width=12)
    elif action == "cast":
        draw.ellipse([25, 108, 139, 150], outline=(141, 255, 251, int(180 * power)), width=4)
        draw.ellipse([45, 116, 121, 142], outline=(255, 232, 112, int(150 * power)), width=2)
        for i in range(8):
            a = math.tau * i / 8 + phase
            x = 82 + math.cos(a) * 58
            y = 130 + math.sin(a) * 22
            draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 245, 175, int(190 * power)))
    elif action == "hurt":
        draw.line([(25, 52), (11, 32)], fill=(255, 84, 105, int(190 * power)), width=5)
        draw.line([(134, 52), (151, 32)], fill=(255, 84, 105, int(190 * power)), width=5)


def main():
    rider_base = fit_sprite(Image.open(PLAYER_SOURCE).convert("RGBA"), 76)
    mount_base = fit_mount(Image.open(MOUNT_SOURCE).convert("RGBA"), 146)
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
    row_actions = ["idle", "walk", "attack", "hurt", "cast"]

    for row, action in enumerate(row_actions):
        for col in range(COLS):
            phase = col / COLS * math.tau
            power = math.sin(col / (COLS - 1) * math.pi)
            frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))

            if action == "idle":
                bob = math.sin(phase) * -2
                mount = transform(mount_base, 1.0, 1.0, math.sin(phase) * 0.8)
                rider = transform(rider_base, 1.0, 1.0, math.sin(phase) * 1.4)
                mx, my = paste_center(frame, mount, 78, 136 + bob)
                draw_shadow_and_glow(frame, mount, mx, my)
                frame.alpha_composite(mount, (mx, my))
                paste_center(frame, rider, 73, 91 + bob)
            elif action == "walk":
                stride = abs(math.sin(phase))
                bob = -stride * 7
                mount = transform(mount_base, 1 + stride * 0.035, 1 - stride * 0.025, math.sin(phase) * 2.5, 1 + stride * 0.05)
                rider = transform(rider_base, 1 + stride * 0.03, 1 - stride * 0.025, math.sin(phase) * 3)
                mx, my = paste_center(frame, mount, 80 + int(math.sin(phase) * 3), 137 + bob)
                draw_shadow_and_glow(frame, mount, mx, my)
                frame.alpha_composite(mount, (mx, my))
                paste_center(frame, rider, 74 + int(math.sin(phase) * 4), 91 + bob)
            elif action == "attack":
                mount = transform(mount_base, 1 + power * 0.04, 1 - power * 0.02, -2 + power * 5, 1 + power * 0.08)
                rider = transform(rider_base, 1 + power * 0.08, 1 - power * 0.04, -10 + power * 22, 1 + power * 0.12)
                mx, my = paste_center(frame, mount, 82 + int(power * 5), 136 - int(power * 3))
                draw_shadow_and_glow(frame, mount, mx, my)
                frame.alpha_composite(mount, (mx, my))
                paste_center(frame, rider, 78 + int(power * 12), 90 - int(power * 4))
                draw_action_fx(ImageDraw.Draw(frame, "RGBA"), action, phase, power)
            elif action == "hurt":
                q = 1 - col / (COLS - 1)
                mount = transform(tint(mount_base, (255, 72, 90, int(q * 55))), 1 + q * 0.025, 1 - q * 0.025, math.sin(col * 2.1) * 4)
                rider = transform(tint(rider_base, (255, 68, 86, int(75 * q))), 1 + q * 0.06, 1 - q * 0.05, math.sin(col * 2.3) * 7)
                mx, my = paste_center(frame, mount, 78 + int(math.sin(col * 2.1) * 5), 136 + int(q * 3))
                draw_shadow_and_glow(frame, mount, mx, my, (255, 110, 126, 150))
                frame.alpha_composite(mount, (mx, my))
                paste_center(frame, rider, 72 + int(math.sin(col * 2.1) * 7), 92 + int(q * 3))
                draw_action_fx(ImageDraw.Draw(frame, "RGBA"), action, phase, q)
            else:
                mount = transform(mount_base, 1 + power * 0.025, 1 + power * 0.015, -power * 2, 1 + power * 0.08)
                rider = transform(rider_base, 1 + power * 0.05, 1 + power * 0.035, -power * 4, 1 + power * 0.12)
                mx, my = paste_center(frame, mount, 79, 136 - int(power * 2))
                draw_shadow_and_glow(frame, mount, mx, my)
                frame.alpha_composite(mount, (mx, my))
                paste_center(frame, rider, 74, 90 - int(power * 7))
                draw_action_fx(ImageDraw.Draw(frame, "RGBA"), action, phase, power)

            sheet.alpha_composite(frame, (col * FRAME_W, row * FRAME_H))

    sheet.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
