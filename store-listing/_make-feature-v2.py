#!/usr/bin/env python3
"""Generate the v2.0 Play Store feature graphic (1024x500).

Design: deep-navy app background, gold calligraphy 港 launcher icon on the left,
clean Noto Sans HK typography on the right. Reproducible: run with
`uv run --with pillow python _make-feature-v2.py` from the repo root.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 500
ICON = "/opt/data/repos/hk-mbti/icon-512.png"
FONT_BLACK = "/opt/data/tmp/fonts/NotoSansHK-900.ttf"
FONT_REG = "/opt/data/tmp/fonts/NotoSansHK-400.ttf"
OUT = "/opt/data/repos/hk-mbti/store-listing/feature-graphic-v2.png"

GOLD = (212, 169, 95)
PAPER = (250, 247, 240)
MUTED = (150, 164, 182)

icon = Image.open(ICON).convert("RGB")
# 用 icon 角落顏色做底色 → 完全無縫
bg_color = icon.getpixel((6, 6))
print("icon 角落色:", bg_color)

canvas = Image.new("RGB", (W, H), bg_color)
d = ImageDraw.Draw(canvas)

# 1) icon（左邊，垂直居中）
ICON_PX = 168
ic = icon.resize((ICON_PX, ICON_PX), Image.LANCZOS)
canvas.paste(ic, (76, (H - ICON_PX) // 2))

# 2) 文字區
f_title = ImageFont.truetype(FONT_BLACK, 78)
f_sub = ImageFont.truetype(FONT_REG, 38)
f_tag = ImageFont.truetype(FONT_REG, 21)

X = 306
d.text((X, 138), "港式 MBTI", font=f_title, fill=GOLD)
d.text((X + 2, 246), "你是哪種港人？", font=f_sub, fill=PAPER)

# 3) 金色幼線
d.line([(X + 2, 316), (X + 330, 316)], fill=(120, 100, 62), width=2)

# 4) 細字 tagline（超闊就自動縮）
tag = "60 題廣東話版 ・ 多種香港情景 ・ 16 型人格測試"
size = 21
while f_tag.getlength(tag) > 640 and size > 15:
    size -= 1
    f_tag = ImageFont.truetype(FONT_REG, size)
d.text((X + 2, 340), tag, font=f_tag, fill=MUTED)
print(f"title 闊 {f_title.getlength('港式 MBTI'):.0f}｜sub 闊 {f_sub.getlength('你是哪種港人？'):.0f}｜tag {size}px 闊 {f_tag.getlength(tag):.0f}")

canvas.save(OUT, "PNG", optimize=True)
print("寫出:", OUT, canvas.size)
