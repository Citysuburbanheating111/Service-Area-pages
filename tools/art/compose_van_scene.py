"""Composite the City & Suburban van onto the Chicago skyline at dusk (Pillow only).

  python tools/art/compose_van_scene.py            -> assets/v2/van-scene.webp

Sources (tools/art/src/):
  chicago-skyline-tony-webster-cc-by-2.0.jpg  "Chicago Skyline" by Tony Webster, CC BY 2.0,
      https://commons.wikimedia.org/wiki/File:Chicago_Skyline_(15240030464).jpg
  van-cutout.png  the client's van photo (2026-10-14), background removed with
      @imgly/background-removal-node
Then run python tools/update_design.py to put it on every page.
"""
import random, sys
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

import os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'tools', 'art', 'src')
OUT_W, OUT_H = 1000, 860
WATER_Y = 2300            # waterline in the source skyline photo
HORIZON = 560             # where the waterline lands in the output
ROAD_Y = 604              # top of the road
random.seed(7)

# ── Background: skyline crop around the Hancock tower ──
sky = Image.open(os.path.join(SRC, 'chicago-skyline-tony-webster-cc-by-2.0.jpg')).convert('RGB')
K = sky.width / 3840          # crop values below are for the 3840px original
cw = round(3500 * K)
ch = round(cw * OUT_H / OUT_W)
y0 = round(WATER_Y * K - HORIZON / OUT_H * ch)
x0 = round(0.505 * sky.width - cw / 2)
canvas = Image.new('RGB', (cw, ch), (20, 18, 24))
canvas.paste(sky.crop((x0, y0, x0 + cw, min(sky.height, y0 + ch))), (0, 0))
bg = canvas.resize((OUT_W, OUT_H), Image.LANCZOS)
# Slightly deeper, warmer dusk
bg = ImageEnhance.Contrast(bg).enhance(1.06)
bg = ImageEnhance.Color(bg).enhance(1.12)
bg = ImageEnhance.Brightness(bg).enhance(0.92)
# Sunset glow: warm haze strongest at the horizon, fading up the sky
haze = Image.linear_gradient('L').resize((OUT_W, HORIZON)).point(lambda v: int(min(255, 70 + v * 0.62)))
sky_part = bg.crop((0, 0, OUT_W, HORIZON))
warm = ImageChops.multiply(sky_part, Image.new('RGB', sky_part.size, (255, 178, 128)))
warm = ImageChops.screen(warm, Image.new('RGB', sky_part.size, (92, 34, 0)))
bg.paste(Image.composite(warm, sky_part, haze), (0, 0))

def vgrad(w, h, top, bottom):
    """Vertical RGB gradient."""
    g = Image.linear_gradient('L').resize((w, h))
    return Image.composite(Image.new('RGB', (w, h), bottom), Image.new('RGB', (w, h), top), g)

# ── Road with fine grain ──
road_h = OUT_H - ROAD_Y
road = vgrad(OUT_W, road_h, (50, 43, 45), (14, 13, 17))
grain = Image.effect_noise((OUT_W, road_h), 22).convert('RGB')
road = ImageChops.add(road, ImageEnhance.Brightness(grain).enhance(0.10), scale=1.0)
bg.paste(road, (0, ROAD_Y))
d = ImageDraw.Draw(bg, 'RGBA')
# Curb edge catching the sky light
d.rectangle((0, ROAD_Y, OUT_W, ROAD_Y + 3), fill=(150, 120, 105, 255))
d.rectangle((0, ROAD_Y + 4, OUT_W, ROAD_Y + 9), fill=(40, 34, 36, 255))
# Promenade strip between the water and the road
d.rectangle((0, HORIZON + 6, OUT_W, ROAD_Y), fill=(36, 32, 36, 255))
# Railing in silhouette along the lakefront
rail = (14, 13, 16, 255)
d.rectangle((0, HORIZON - 16, OUT_W, HORIZON - 12), fill=rail)
d.rectangle((0, HORIZON + 2, OUT_W, HORIZON + 5), fill=rail)
for x in range(6, OUT_W, 22):
    d.rectangle((x, HORIZON - 16, x + 2, ROAD_Y - 2), fill=rail)
# Warm streetlight pools on the road
glow = Image.new('L', (OUT_W, OUT_H), 0)
gd = ImageDraw.Draw(glow)
for cx in (120, 930):
    gd.ellipse((cx - 160, ROAD_Y + 10, cx + 160, ROAD_Y + 120), fill=70)
glow = glow.filter(ImageFilter.GaussianBlur(40))
bg = Image.composite(Image.new('RGB', bg.size, (255, 170, 110)), bg, glow)

# ── Van ──
van = Image.open(os.path.join(SRC, 'van-cutout.png')).convert('RGBA')
van = van.crop(van.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())
VAN_W = 770
van = van.resize((VAN_W, round(van.height * VAN_W / van.width)), Image.LANCZOS)
van = van.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
rgb, alpha = van.convert('RGB'), van.getchannel('A')
# Dusk light: dimmer, a little cooler in the shade
rgb = ImageEnhance.Brightness(rgb).enhance(0.74)
rgb = ImageEnhance.Contrast(rgb).enhance(1.05)
rgb = ImageChops.multiply(rgb, Image.new('RGB', rgb.size, (236, 238, 250)))
# Warm sky glow on the roof and upper body, fading downwards
top = Image.linear_gradient('L').resize(rgb.size).point(lambda v: max(0, 120 - v))
rgb = Image.composite(ImageChops.screen(rgb, Image.new('RGB', rgb.size, (255, 150, 90))), rgb, top)
# Darker towards the ground
bottom = Image.linear_gradient('L').resize(rgb.size).point(lambda v: max(0, v - 150))
rgb = Image.composite(ImageChops.multiply(rgb, Image.new('RGB', rgb.size, (150, 145, 155))), rgb, bottom)
van = rgb.convert('RGBA'); van.putalpha(alpha)

vx = 70
vy = OUT_H - 22 - van.height   # wheels just above the bottom edge
# Ground shadow: a soft wide ellipse plus darker contact under the tyres
sh = Image.new('L', (OUT_W, OUT_H), 0)
sd = ImageDraw.Draw(sh)
base = vy + van.height
sd.ellipse((vx - 10, base - 40, vx + VAN_W + 20, base + 26), fill=190)
sh = sh.filter(ImageFilter.GaussianBlur(18))
bg = Image.composite(Image.new('RGB', bg.size, (6, 6, 8)), bg, sh)
contact = Image.new('L', (OUT_W, OUT_H), 0)
cd = ImageDraw.Draw(contact)
cd.rectangle((vx + 20, base - 14, vx + VAN_W - 10, base + 4), fill=230)
contact = contact.filter(ImageFilter.GaussianBlur(6))
bg = Image.composite(Image.new('RGB', bg.size, (4, 4, 6)), bg, contact)

out = bg.convert('RGBA')
out.alpha_composite(van, (vx, vy))
out = out.convert('RGB')
# Gentle vignette
vig = Image.new('L', out.size, 0)
ImageDraw.Draw(vig).ellipse((-220, -160, OUT_W + 220, OUT_H + 260), fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(90))
out = Image.composite(out, ImageEnhance.Brightness(out).enhance(0.72), vig)
out.save(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'v2', 'van-scene.webp'), 'WEBP', quality=88, method=6)
print('saved', out.size)
