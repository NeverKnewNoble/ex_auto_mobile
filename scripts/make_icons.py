import math, os
from PIL import Image, ImageDraw

OUT = "/Users/larry-noble/Desktop/dev/react-native/ex_auto/assets/images"

ASPHALT = (11, 12, 15, 255)      # #0B0C0F
RED      = (255, 63, 76, 255)    # #FF3F4C
OFFWHITE = (244, 242, 236, 255)  # #F4F2EC
WHITE    = (255, 255, 255, 255)

SS = 4  # supersample

def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return (cx + r * math.cos(a), cy + r * math.sin(a))

def render(final, bg=None, arc_col=RED, needle_col=OFFWHITE, hub_dot=RED, r_frac=0.30, ticks=True):
    S = final * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if bg is not None:
        d.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=bg)
    cx = cy = S / 2
    R = S * r_frac
    stroke = R * 0.19

    # gauge arc (270°, open at the bottom)
    d.arc([cx - R, cy - R, cx + R, cy + R], 135, 405, fill=arc_col, width=int(stroke))

    # tick marks around the dial
    if ticks:
        for deg in range(150, 391, 30):
            p1 = pt(cx, cy, R - stroke * 0.75, deg)
            p2 = pt(cx, cy, R - stroke * 1.85, deg)
            d.line([p1, p2], fill=arc_col, width=int(stroke * 0.30))

    # needle -> pointing up-right toward the redline
    ang = 312
    dx, dy = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    px, py = -dy, dx
    tip = (cx + dx * R * 1.0, cy + dy * R * 1.0)
    back = (cx - dx * R * 0.18, cy - dy * R * 0.18)
    b1 = (back[0] + px * stroke * 0.55, back[1] + py * stroke * 0.55)
    b2 = (back[0] - px * stroke * 0.55, back[1] - py * stroke * 0.55)
    d.polygon([tip, b1, b2], fill=needle_col)

    # hub
    hr = stroke * 0.62
    d.ellipse([cx - hr, cy - hr, cx + hr, cy + hr], fill=needle_col)
    ir = stroke * 0.26
    d.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=hub_dot)

    return img.resize((final, final), Image.LANCZOS)

def save(img, name):
    p = os.path.join(OUT, name)
    img.save(p)
    print("wrote", name, img.size)

# App icon (iOS + fallback): asphalt tile + mark
save(render(1024, bg=ASPHALT, r_frac=0.30), "icon.png")

# Android adaptive foreground: transparent, mark within safe zone
save(render(1024, bg=None, r_frac=0.25), "android-icon-foreground.png")

# Android adaptive background: solid asphalt
bg = Image.new("RGBA", (1024, 1024), ASPHALT); bg.save(os.path.join(OUT, "android-icon-background.png")); print("wrote android-icon-background.png")

# Android monochrome (themed icons): white silhouette on transparent
save(render(1024, bg=None, arc_col=WHITE, needle_col=WHITE, hub_dot=WHITE, r_frac=0.25), "android-icon-monochrome.png")

# Splash logo: mark on transparent (splash plugin adds the asphalt background)
save(render(1024, bg=None, r_frac=0.34), "splash-icon.png")

# Web favicon
save(render(48, bg=ASPHALT, r_frac=0.32, ticks=False), "favicon.png")
print("done")
