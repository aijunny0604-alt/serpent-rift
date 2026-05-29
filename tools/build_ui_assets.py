from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def glow_icon(size, bg1, bg2):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    for r in range(size // 2, 0, -1):
        t = r / (size / 2)
        col = tuple(int(bg1[i] * (1 - t) + bg2[i] * t) for i in range(3))
        draw.ellipse([size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r], fill=(*col, int(255 * (1 - t * 0.18))))
    draw.ellipse([5, 5, size - 5, size - 5], outline=(255, 246, 181, 230), width=3)
    draw.ellipse([10, 10, size - 10, size - 10], outline=(255, 255, 255, 70), width=1)
    return img


def draw_star(draw, cx, cy, r1, r2, fill):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        r = r1 if i % 2 == 0 else r2
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    draw.polygon(pts, fill=fill)


def build_skill_icons():
    size = 96
    icons = Image.new("RGBA", (size * 5, size), (0, 0, 0, 0))
    specs = [
        ((255, 199, 59), (58, 28, 6), "nova"),
        ((64, 221, 255), (2, 38, 66), "lance"),
        ((212, 93, 255), (42, 10, 76), "rift"),
        ((130, 255, 246), (6, 58, 62), "storm"),
        ((255, 121, 50), (81, 15, 5), "meteor"),
    ]
    for i, (c1, c2, kind) in enumerate(specs):
        icon = glow_icon(size, c1, c2)
        d = ImageDraw.Draw(icon, "RGBA")
        cx = cy = size // 2
        if kind == "nova":
            draw_star(d, cx, cy, 30, 12, (255, 255, 255, 245))
            draw_star(d, cx, cy, 20, 7, (255, 216, 79, 255))
        elif kind == "lance":
            d.line([24, 72, 72, 24], fill=(255, 255, 255, 255), width=9)
            d.line([31, 70, 75, 26], fill=(87, 236, 255, 255), width=4)
            d.polygon([(72, 24), (82, 13), (79, 32)], fill=(255, 245, 170, 255))
        elif kind == "rift":
            d.ellipse([22, 22, 74, 74], outline=(255, 255, 255, 230), width=5)
            d.arc([16, 16, 80, 80], 20, 285, fill=(226, 120, 255, 255), width=9)
            d.ellipse([38, 38, 58, 58], fill=(255, 255, 255, 240))
        elif kind == "storm":
            for k in range(4):
                a = k * math.pi / 2 + 0.5
                d.arc([18, 18, 78, 78], int(math.degrees(a)), int(math.degrees(a + 1.2)), fill=(255, 255, 255, 245), width=7)
            d.line([49, 16, 36, 48, 58, 48, 42, 80], fill=(126, 255, 246, 255), width=7)
        elif kind == "meteor":
            d.line([24, 22, 65, 63], fill=(255, 218, 90, 220), width=14)
            d.line([18, 30, 57, 69], fill=(255, 92, 54, 180), width=10)
            d.ellipse([48, 48, 79, 79], fill=(255, 245, 170, 255), outline=(255, 92, 54, 255), width=4)
        icons.alpha_composite(icon, (i * size, 0))
    icons.save(ASSETS / "skill-icons.png")


def build_item_icons():
    size = 72
    icons = Image.new("RGBA", (size * 8, size), (0, 0, 0, 0))
    random.seed(7)
    palette = [
        ((76, 220, 255), "sword"),
        ((255, 217, 92), "armor"),
        ((203, 102, 255), "ring"),
        ((112, 255, 174), "boots"),
        ((255, 111, 91), "gem"),
        ((255, 245, 183), "scroll"),
        ((120, 160, 255), "orb"),
        ((255, 156, 55), "helm"),
    ]
    for i, (col, kind) in enumerate(palette):
        icon = glow_icon(size, col, (8, 12, 18))
        d = ImageDraw.Draw(icon, "RGBA")
        cx = cy = size // 2
        if kind == "sword":
            d.line([22, 54, 52, 18], fill=(255, 255, 255, 255), width=7)
            d.line([27, 54, 56, 21], fill=(*col, 255), width=3)
            d.line([20, 44, 32, 56], fill=(255, 220, 120, 255), width=5)
        elif kind == "armor":
            d.polygon([(23, 22), (36, 16), (49, 22), (53, 54), (36, 61), (19, 54)], fill=(255, 231, 123, 245))
            d.line([36, 18, 36, 59], fill=(80, 46, 18, 150), width=3)
        elif kind == "ring":
            d.ellipse([21, 24, 51, 54], outline=(255, 226, 120, 255), width=7)
            d.polygon([(34, 16), (43, 24), (36, 33), (27, 24)], fill=(*col, 255))
        elif kind == "boots":
            d.polygon([(24, 21), (38, 21), (40, 46), (56, 51), (52, 60), (25, 56)], fill=(*col, 240))
        elif kind == "gem":
            d.polygon([(36, 13), (56, 29), (47, 57), (25, 57), (16, 29)], fill=(*col, 245), outline=(255, 245, 200, 230))
        elif kind == "scroll":
            d.rounded_rectangle([20, 18, 52, 57], radius=7, fill=(255, 239, 183, 245), outline=(120, 84, 38, 220), width=3)
            d.line([27, 30, 45, 30], fill=(120, 84, 38, 200), width=2)
            d.line([27, 40, 43, 40], fill=(120, 84, 38, 200), width=2)
        elif kind == "orb":
            d.ellipse([18, 18, 54, 54], fill=(*col, 230), outline=(255, 255, 255, 230), width=4)
            d.ellipse([28, 24, 38, 34], fill=(255, 255, 255, 190))
        elif kind == "helm":
            d.pieslice([18, 15, 54, 57], 180, 360, fill=(*col, 245), outline=(255, 230, 160, 255), width=3)
            d.line([21, 38, 51, 38], fill=(255, 230, 160, 255), width=4)
        icons.alpha_composite(icon, (i * size, 0))
    icons.save(ASSETS / "item-icons.png")


def build_ui_panel():
    img = Image.new("RGBA", (640, 720), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([12, 12, 628, 708], radius=24, fill=(5, 14, 14, 226), outline=(151, 255, 220, 190), width=3)
    d.rounded_rectangle([28, 30, 612, 96], radius=18, fill=(15, 44, 39, 235), outline=(255, 229, 144, 150), width=2)
    for i in range(5):
        d.rounded_rectangle([42 + i * 112, 132, 132 + i * 112, 222], radius=14, fill=(9, 26, 25, 230), outline=(112, 255, 218, 90), width=2)
    for r in range(4):
        for c in range(5):
            x = 46 + c * 112
            y = 276 + r * 92
            d.rounded_rectangle([x, y, x + 76, y + 76], radius=12, fill=(9, 20, 21, 225), outline=(255, 238, 166, 85), width=2)
    d.line([40, 248, 600, 248], fill=(255, 238, 166, 120), width=2)
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=120))
    img.save(ASSETS / "ui-panel.png")


def build_rune_effects():
    size = 256
    img = Image.new("RGBA", (size * 3, size), (0, 0, 0, 0))
    colors = [(255, 217, 88), (86, 231, 255), (216, 106, 255)]
    for i, col in enumerate(colors):
        tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(tile, "RGBA")
        cx = cy = size // 2
        for r, a in [(92, 180), (68, 130), (42, 100)]:
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(*col, a), width=5)
        for k in range(12):
            a = math.tau * k / 12
            d.line([cx + math.cos(a) * 58, cy + math.sin(a) * 58, cx + math.cos(a) * 94, cy + math.sin(a) * 94], fill=(255, 255, 255, 135), width=3)
        draw_star(d, cx, cy, 36, 16, (*col, 120))
        tile = tile.filter(ImageFilter.GaussianBlur(0.3))
        img.alpha_composite(tile, (i * size, 0))
    img.save(ASSETS / "rune-effects.png")


def build_loot_icons():
    size = 72
    img = Image.new("RGBA", (size * 4, size), (0, 0, 0, 0))
    specs = [
        ((255, 215, 75), "coin"),
        ((94, 235, 255), "crystal"),
        ((255, 111, 91), "ruby"),
        ((214, 115, 255), "chest"),
    ]
    for i, (col, kind) in enumerate(specs):
        tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(tile, "RGBA")
        if kind == "coin":
            d.ellipse([13, 12, 59, 60], fill=(255, 181, 44, 255), outline=(255, 250, 170, 255), width=5)
            d.ellipse([23, 22, 49, 50], outline=(125, 76, 8, 130), width=4)
            d.line([36, 22, 36, 50], fill=(255, 248, 175, 230), width=4)
        elif kind == "crystal":
            d.polygon([(36, 7), (56, 29), (47, 63), (25, 63), (16, 29)], fill=(*col, 245), outline=(255, 255, 255, 230))
            d.line([36, 7, 36, 63], fill=(255, 255, 255, 120), width=3)
        elif kind == "ruby":
            d.polygon([(36, 10), (58, 27), (50, 56), (36, 66), (22, 56), (14, 27)], fill=(*col, 245), outline=(255, 232, 204, 240))
            d.polygon([(36, 10), (47, 28), (36, 36), (25, 28)], fill=(255, 196, 172, 180))
        elif kind == "chest":
            d.rounded_rectangle([13, 28, 59, 60], radius=8, fill=(118, 63, 28, 255), outline=(255, 202, 86, 255), width=4)
            d.pieslice([13, 10, 59, 46], 180, 360, fill=(166, 89, 38, 255), outline=(255, 202, 86, 255), width=4)
            d.rectangle([31, 32, 41, 47], fill=(255, 216, 92, 255))
        tile = tile.filter(ImageFilter.UnsharpMask(radius=1, percent=160))
        img.alpha_composite(tile, (i * size, 0))
    img.save(ASSETS / "loot-icons.png")


def build_element_fx():
    size = 256
    img = Image.new("RGBA", (size * 2, size), (0, 0, 0, 0))
    # Lightning tile
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile, "RGBA")
    for offset, alpha, width in [(0, 255, 9), (8, 130, 17), (-8, 90, 23)]:
        pts = [(126 + offset, 6), (96, 76), (132, 72), (90, 154), (132, 142), (108, 250)]
        d.line(pts, fill=(115, 240, 255, alpha), width=width, joint="curve")
    d.line([(126, 6), (96, 76), (132, 72), (90, 154), (132, 142), (108, 250)], fill=(255, 255, 255, 255), width=4)
    tile = tile.filter(ImageFilter.GaussianBlur(0.2))
    img.alpha_composite(tile, (0, 0))

    # Fire pillar tile
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile, "RGBA")
    for i in range(9):
        x = 60 + i * 16 + math.sin(i) * 10
        h = 130 + (i % 3) * 34
        color = (255, 70 + i * 14, 18, 155)
        d.polygon([(x, 236), (x - 28, 112), (x, 236 - h), (x + 30, 112)], fill=color)
    d.polygon([(128, 240), (70, 118), (130, 20), (186, 118)], fill=(255, 210, 80, 220))
    d.polygon([(132, 234), (98, 130), (135, 62), (166, 130)], fill=(255, 255, 210, 230))
    tile = tile.filter(ImageFilter.GaussianBlur(0.5))
    img.alpha_composite(tile, (size, 0))
    img.save(ASSETS / "element-fx.png")


def main():
    build_skill_icons()
    build_item_icons()
    build_ui_panel()
    build_rune_effects()
    build_loot_icons()
    build_element_fx()
    print("built ui assets")


if __name__ == "__main__":
    main()
