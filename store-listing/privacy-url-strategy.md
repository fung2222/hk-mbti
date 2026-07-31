# Step 2a · Privacy URL 策略

> 目標：決定 Play Console 嘅 Privacy Policy URL 欄位填咩。

---

## 兩個 option

### Option 1 · Hash anchor（已有）

```text
URL:  https://fung2222.github.io/hk-mbti/#privacy

優點：
  ✓ 已經實裝（Step 1b-C）
  ✓ 唔使新 file
  ✓ 同主頁共用 header / footer

缺點：
  ✗ Play Console 嘅 Privacy URL 欄位唔接受 hash anchor
  ✗ 用戶 share 連結時 # 後面會被 strip 走
  ✗ Share card preview 唔會見到正確標題
```

### Option 2 · 獨立 privacy.html（推薦）

```text
URL:  https://fung2222.github.io/hk-mbti/privacy.html

優點：
  ✓ Play Console 接受（獨立 URL）
  ✓ Share 出去唔會被 strip
  ✓ 可以獨立 og:title / og:description
  ✓ 用戶直接打 URL 都去到
  ✓ SEO 友善

缺點：
  ✗ 要新 file（淨係 HTML，內容重用 Step 1b-C 嘅 section）
  ✗ 改動時要 sync 兩個地方（或者將 privacy.html 設做 SSOT，主頁用 iframe / JS 引入）
```

---

## 推薦：Option 2

理由：

1. **Play Console 強制要 full URL**，唔可以係 hash anchor
2. **獨立 file 更 SEO 友善**（搜尋引擎會 index）
3. **Share 行為穩定**（唔怕被 strip）
4. **維護成本可控**：
   - 用 JS 注入：主頁 `#privacy` 仍然由 `index.html` render
   - `privacy.html` 內容直接搬過嚟，唔 sync

---

## 實作 plan

### privacy.html 內容（直接由 Step 1b-C 抽出）

```text
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="...">
  <title>私隱聲明 · 港式 MBTI</title>
  <meta name="description" content="本 App 點處理你嘅資料。...">
  <meta property="og:title" content="私隱聲明 · 港式 MBTI">
  <meta property="og:description" content="...">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="stylesheet" href="https://cdn.tailwindcss.com">
  <style>... 簡化版 brand CSS ...</style>
</head>
<body>
  <main>
    <h1>🔒 私隱聲明</h1>
    <p>本 App 點處理你嘅資料</p>
    <!-- 5 段內容（直接由 Step 1b-C 抽出） -->
  </main>
</body>
</html>
```

### 內容來源

- ① 我哋收集咩
- ② 我哋點儲存
- ③ 我哋點分享
- ④ 你嘅權利
- ⑤ 聯絡

### 主頁 `#privacy` 同步

- 主頁 `#privacy` section **保留**（用戶體驗更好，唔使跳頁）
- `privacy.html` 純粹係** Play Console 要求嘅 URL 目標**
- 兩者內容會 sync（每次改 Step 1b-C 嗰陣同時改 privacy.html）

---

## ⚠️ 你嘅選擇

| Option | 做法 | URL |
|--------|------|-----|
| ✅ **Option 2（推薦）** | 新增 `privacy.html` 獨立頁 | `https://fung2222.github.io/hk-mbti/privacy.html` |
| Option 1 | 用 hash anchor（已知 Play 唔接受） | `https://fung2222.github.io/hk-mbti/#privacy` |

**建議你揀 Option 2**。如果你 OK，我就即刻寫 `privacy.html`。

要繼續嗎？