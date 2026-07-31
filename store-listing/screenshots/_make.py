"""
港式 MBTI · Play Store Screenshots
5 張 1080×1920 PNG · 9:16 比例
共用 helper：phone frame + app 內容 mock
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = '/opt/data/repos/hk-mbti/store-listing/screenshots'
W, H = 1080, 1920

GOLD = (212, 169, 95)
PAPER = (250, 247, 240)
INK = (26, 26, 26)
SOFT = (242, 237, 224)
ASH = (200, 196, 184)
DIM = (122, 118, 108)
DARK_BG = (30, 42, 59)
DARKER = (15, 24, 37)
LIFE_GOLD_BG = (255, 248, 232)
LIFE_GOLD_BORDER = (212, 169, 95)
ADV_BLUE_BORDER = (91, 143, 217)
ADV_BLUE_BG = (240, 246, 255)
BB_PURPLE_BORDER = (196, 139, 201)
BB_PURPLE_BG = (251, 243, 252)
ACCENT = (232, 93, 93)

FONT_ZH = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
FONT_MO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'

def zh(sz):
    return ImageFont.truetype(FONT_ZH, sz, encoding='utf-8')

def mo(sz):
    return ImageFont.truetype(FONT_MO, sz)

def make_bg(img, top=DARK_BG, bot=DARKER):
    px = img.load()
    for y in range(H):
        t = y / H
        for x in range(W):
            px[x, y] = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3))

def add_caption(img, title, sub, y=80):
    d = ImageDraw.Draw(img, 'RGBA')
    d.text((60, y), title, font=zh(54), fill=GOLD)
    if sub:
        d.text((60, y + 78), sub, font=zh(28), fill=PAPER)

def add_phone_frame(img, x, y, w, h, radius=60):
    d = ImageDraw.Draw(img, 'RGBA')
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius,
                        fill=(20, 20, 20), outline=GOLD, width=3)
    inner = 14
    d.rounded_rectangle(
        [x + inner, y + inner, x + w - inner, y + h - inner],
        radius=radius - inner, fill=(250, 247, 240))
    return (x + inner, y + inner, w - 2 * inner, h - 2 * inner)


# ============== Screenshot 2: 測試中 ==============
img = Image.new('RGB', (W, H), DARKER)
make_bg(img)
add_caption(img, '60 題廣東話', '5 分鐘完成 · 每次打亂')

px, py, pw, ph = add_phone_frame(img, 90, 250, 900, 1500)
d = ImageDraw.Draw(img, 'RGBA')

d.text((px + 30, py + 30), '港式 MBTI', font=zh(40), fill=GOLD)
d.text((px + 30, py + 90), '23 / 60', font=zh(18), fill=DIM)

bar_y = py + 135
d.rounded_rectangle([px + 30, bar_y, px + 30 + pw - 60, bar_y + 18],
                    radius=9, fill=SOFT)
filled = int((pw - 60) * 23 / 60)
d.rounded_rectangle([px + 30, bar_y, px + 30 + filled, bar_y + 18],
                    radius=9, fill=GOLD)
d.text((px + pw - 100, py + 90), 'x 退出', font=zh(16), fill=DIM, anchor='ra')

card_y = py + 200
d.rounded_rectangle([px + 30, card_y, px + 30 + pw - 60, card_y + 320],
                    radius=20, fill=(255, 255, 255))
d.text((px + 50, card_y + 30), 'E/I · 第 23 題', font=zh(18), fill=GOLD)
d.text((px + 50, card_y + 80), '一班朋友約食飯，你傾向：', font=zh(34), fill=INK)

opt_y = card_y + 170
opts = [
    'A. 自己揀餐廳再約人',
    'B. 去邊食都 OK 跟大隊',
    'C. 主動提議但最終畀人揀',
    'D. 唔會自己 group',
]
for i, opt in enumerate(opts):
    y = opt_y + i * 44
    d.rounded_rectangle([px + 50, y, px + 50 + pw - 100, y + 36],
                        radius=10, fill=SOFT, outline=(220, 220, 220), width=2)
    d.text((px + 70, y + 8), opt, font=zh(20), fill=INK)

d.text((px + 30, py + ph - 80), '用廣東話情境題', font=zh(16), fill=DIM)
d.text((px + 30, py + ph - 50), '每題影響你嘅 E/I 維度分數', font=zh(16), fill=DIM)

img.save(os.path.join(OUT_DIR, '02-test.png'), 'PNG', optimize=True)
print('2/5 ok')


# ============== Screenshot 3: 結果 ==============
img = Image.new('RGB', (W, H), DARKER)
make_bg(img)
add_caption(img, '你嘅 4 字母', '港式 slogan · 性格分析')

px, py, pw, ph = add_phone_frame(img, 90, 250, 900, 1500)
d = ImageDraw.Draw(img, 'RGBA')

d.text((px + 30, py + 30), '港式 MBTI', font=zh(40), fill=GOLD)
d.text((px + 30, py + 90), '🎉 你嘅港式人格', font=zh(20), fill=INK)
d.rounded_rectangle([px + 220, py + 88, px + 360, py + 118], radius=15, fill=SOFT)
d.text((px + 228, py + 92), '生活版', font=zh(16), fill=INK)

big_y = py + 200
d.text((px + pw / 2, big_y), 'INFP', font=zh(160), fill=GOLD, anchor='mm')
d.text((px + pw / 2, big_y + 140), '調停者 · Mediator', font=zh(36), fill=INK, anchor='mm')
d.text((px + pw / 2, big_y + 200), '內心戲多 · 寧靜派 · 重視意義',
       font=zh(22), fill=DIM, anchor='mm')

ana_y = big_y + 280
d.rounded_rectangle([px + 30, ana_y, px + 30 + pw - 60, ana_y + 200],
                    radius=20, fill=(255, 255, 255))
d.text((px + 50, ana_y + 25), '📖 你的性格分析', font=zh(22), fill=INK)
d.text((px + 50, ana_y + 70), '• 創意豐富、重視和諧', font=zh(18), fill=INK)
d.text((px + 50, ana_y + 105), '• 易受他人情緒影響', font=zh(18), fill=INK)
d.text((px + 50, ana_y + 140), '• 適合創作、輔導、寫作', font=zh(18), fill=INK)
d.text((px + 50, ana_y + 175), '看完整分析 →', font=zh(18), fill=ACCENT)

share_y = ana_y + 240
btns = [('儲存圖片', GOLD), ('分享圖片', SOFT), ('分享網址', SOFT)]
btn_w = (pw - 90) / 3
for i, (label, fill_color) in enumerate(btns):
    x = px + 30 + i * (btn_w + 15)
    d.rounded_rectangle([x, share_y, x + btn_w, share_y + 70],
                        radius=15, fill=fill_color)
    d.text((x + btn_w / 2, share_y + 22), label,
           font=zh(20), fill=INK, anchor='mm')

img.save(os.path.join(OUT_DIR, '03-result.png'), 'PNG', optimize=True)
print('3/5 ok')


# ============== Screenshot 4: 場景配對 ==============
img = Image.new('RGB', (W, H), DARKER)
make_bg(img)
add_caption(img, '你係邊種港人？', '茶餐廳 / 港鐵 / 7-11 配對')

px, py, pw, ph = add_phone_frame(img, 90, 250, 900, 1500)
d = ImageDraw.Draw(img, 'RGBA')

d.text((px + 30, py + 30), '港式 MBTI', font=zh(40), fill=GOLD)

scene_y = py + 130
d.rounded_rectangle([px + 30, scene_y, px + 30 + pw - 60, scene_y + 500],
                    radius=20, fill=(255, 255, 255))
d.text((px + 50, scene_y + 25), '🍳 你是哪種港人？', font=zh(26), fill=INK)

scenes = [
    ('凍檸茶常客', '享受慢活', True),
    ('港鐵戰士', '快節奏派', False),
    ('煲劇廢', '宅家一族', False),
    ('茶記常客', '老香港味', False),
]
for i, (name, sub, highlight) in enumerate(scenes):
    row = i // 2
    col = i % 2
    cell_x = px + 50 + col * ((pw - 130) / 2 + 15)
    cell_y = scene_y + 90 + row * 200
    cell_w = (pw - 130) / 2
    cell_h = 180
    if highlight:
        d.rounded_rectangle(
            [cell_x, cell_y, cell_x + cell_w, cell_y + cell_h],
            radius=15, fill=LIFE_GOLD_BG, outline=GOLD, width=4)
        d.text((cell_x + 15, cell_y + 20), '✦ 最似你', font=zh(18), fill=GOLD)
        name_y = cell_y + 70
        sub_y = cell_y + 115
    else:
        d.rounded_rectangle(
            [cell_x, cell_y, cell_x + cell_w, cell_y + cell_h],
            radius=15, fill=SOFT)
        name_y = cell_y + 40
        sub_y = cell_y + 85
    d.text((cell_x + 15, name_y), name, font=zh(24), fill=INK)
    d.text((cell_x + 15, sub_y), sub, font=zh(18), fill=DIM)

cta_y = scene_y + 540
d.text((px + pw / 2, cta_y), '看完整分析 →', font=zh(22), fill=ACCENT, anchor='mm')

img.save(os.path.join(OUT_DIR, '04-scenario.png'), 'PNG', optimize=True)
print('4/5 ok')


# ============== Screenshot 5: 探索更多 ==============
img = Image.new('RGB', (W, H), DARKER)
make_bg(img)
add_caption(img, '探索更多', '百科 · 相處 · 拍拖 · 私隱')

px, py, pw, ph = add_phone_frame(img, 90, 250, 900, 1500)
d = ImageDraw.Draw(img, 'RGBA')

d.text((px + 30, py + 30), '港式 MBTI', font=zh(40), fill=GOLD)
d.text((px + 30, py + 90), '📂 探索更多', font=zh(20), fill=GOLD)

acc_y = py + 150
items = [
    ('📖', '關於港式 MBTI', '由來、廣東話版特色'),
    ('🔤', 'MBTI 性格光譜', 'E/I S/N T/F J/P 解釋'),
    ('📚', '性格百科', '16 種完整介紹'),
    ('🤝', '個人相處', '5 個場景 × 16 型攻略'),
    ('💕', '個人拍拖', '3 個場景 × 16 型攻略'),
    ('🔒', '私隱聲明', '點處理你嘅資料'),
]
for i, (icon, title, sub) in enumerate(items):
    y = acc_y + i * 100
    d.rounded_rectangle([px + 30, y, px + 30 + pw - 60, y + 85],
                        radius=15, fill=(255, 255, 255))
    d.text((px + 50, y + 15), icon, font=zh(28), fill=GOLD)
    d.text((px + 100, y + 12), title, font=zh(22), fill=INK)
    d.text((px + 100, y + 45), sub, font=zh(15), fill=DIM)
    d.text((px + pw - 70, y + 30), 'v', font=zh(18), fill=DIM)

img.save(os.path.join(OUT_DIR, '05-explore.png'), 'PNG', optimize=True)
print('5/5 ok')


# ============== Final ==============
files = sorted([f for f in os.listdir(OUT_DIR) if f.endswith('.png')])
print('---')
for f in files:
    p = os.path.join(OUT_DIR, f)
    print(f'{os.path.getsize(p):>8d}  {f}')