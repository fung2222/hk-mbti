# 港式 MBTI → Apple App Store 上架準備

> 查證日期：**2026-09-29**（今日）
> 官方來源：Apple App Review Guidelines（Last Updated: **2026-06-08**）、Apple Developer Program 報名／會員頁、App Store Connect Help、Apple News（年齡分級更新）
> ⚠️ 呢份文件係「準備功課」，**未開工**。每一步做之前會再同你確認。
> 👉 **要跟住做嘅逐步清單喺 `APPLE-STORE-CHECKLIST.md`**（資料清單 + 7 個 Phase + 素材硬性規格）

---

## 一、最重要 3 句（睇完呢 3 句就明晒個局）

1. **iOS 冇 TWA。** Android 我哋靠 PWABuilder 出一個 `.aab` 就上到；iOS 冇呢條路 —— Apple 唔接受「純網站」。要另外包一層 **WKWebView 原生殼**（用 Capacitor），Apple 先會當你係一個 app。
2. **最大風險係 Apple 審核條文 4.2（Minimum Functionality）。** 原文：*「Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store.」* → 即係「唔好交一個扮成 app 嘅網站」。我哋要**加真嘅原生功能**（離線、通知、分享、震動回饋、IAP）先過得。
3. **可以同 Play 一齊做，但唔係「一次做完兩邊」。** 兩個平台獨立審核、獨立素材、獨立收錢系統（Play Billing vs StoreKit）。iOS 嗰邊工作量明顯大過 Play，而且**唔可以靠「網頁一改即刻生效」**（見第六節）。

---

## 二、Apple vs Google Play 邊個難？（老實對比）

| 項目 | Google Play（你而家做緊） | Apple App Store |
|------|--------------------------|-----------------|
| 開帳號費用 | US$25 **一次性** | **US$99 / 年**（每年續） |
| 個人帳號顯示名 | 可自訂（你而家用 `港式風味`） | ⚠️ **個人帳號＝你嘅法定姓名**，唔可以改（要有公司實體＋D-U-N-S 才可以顯示公司／品牌名） |
| 身份驗證 | 上載身份證，1–2 日 | 要法定姓名＋電話＋地址，**可能要求政府身份證號或證件相**；地址唔收郵政信箱 |
| 上架前測試關卡 | 封閉測試 **12 人 × 連續 14 日**（最痛） | **TestFlight**（內部測試 100 人免審；**外部測試要 Apple 審核**一次，通常幾小時至 1 日）**冇 12×14 關卡** |
| 審核時間 | 新開發者可以幾日 | 平均 **~8 小時**（2026-05 數據）；新 app 常見 **2–5 日** |
| 抽佣 | 30%（首 US$1M 15%） | **30%**（App Store Small Business Program 合資格 → **15%**），合資格訂閱 15% |
| 年齡分級 | IARC 問卷 | App Store Connect 問卷；新制 **4+ / 9+ / 13+ / 16+ / 18+**（2025-07 起，取消 12+ / 17+） |
| 私隱要求 | Data safety 表格 | **App Privacy 標籤** ＋ 一定要有隱私政策連結（App Store Connect 欄位 ＋ app 內） |
| 網頁自動更新 | ✅ TWA 內容即時跟網站更新 | ❌ 唔得（見第六節） |
| 上架需要 Mac？ | 唔需要 | **唔需要有 Mac**（可以用雲端 Mac：Codemagic / Bitrise / Expo EAS / GitHub Actions macOS runner）但要有 Apple 帳號 |
| 中國大陸上架 | 需要 APP 備案（ICP） | 需要 **ICP 備案號**（中國工信部要求）→ 可以**唔上中國區**，避開 |

**一句總結**：Apple **唔難在關卡（冇 12×14）**，但**難在「內容唔可以係網站」同「收錢要用 StoreKit」**。

---

## 三、上架流程（實際 6 步）

```
Step 1  Apple 帳號（個人）
        └─ Apple ID 開雙重認證 → 用「Apple Developer」app 報名
           → 填法定姓名（同身份證一樣）／電話／地址 → 付 US$99

Step 2  技術準備（我主力）
        ├─ 2a 用 Capacitor 將 PWA 包成 Xcode 專案（iOS）
        ├─ 2b 加原生功能（4.2 過關用，見第五節）
        └─ 2c 設定 bundle ID（例如 com.fung2222.hkmbti）

Step 3  雲端 build（唔需要 Mac）
        └─ Codemagic / Bitrise 免費 tier，用 GitHub 攞 code → 出 .ipa → 上傳 App Store Connect

Step 4  App Store Connect 填資料
        ├─ 名稱／副標題／描述／關鍵詞／類別（Lifestyle 或 Health & Fitness）
        ├─ 截圖（iPhone 6.9" 同 6.5" 一定要；iPad 冇支援可以免）
        ├─ App Privacy 標籤（如實填：本機儲存、GoatCounter 匿名瀏覽）
        ├─ 年齡分級問卷（照你既資料答）
        └─ 隱私政策 URL：https://fung2222.github.io/hk-mbti/privacy.html

Step 5  TestFlight 試（可選但建議）
        └─ 自己／朋友試 → 執 bug → 之後先送審

Step 6  送審 → 等審核（通常 1–3 日）→ 通過 → 上架
        ⚠️ 被拒都要當常態：4.2 最常見，可以改完再交（見第五節）
```

---

## 四、你要準備咩（分「你」同「我」）

### 你要做／決定嘅
| # | 事 | 備註 |
|---|-----|------|
| 1 | **Apple ID（新開一個專用）** | 開雙重認證；姓名要用身份證嘅法定姓名 |
| 2 | **US$99 年費** | 用信用卡／Apple Pay |
| 3 | **接受「App Store 會顯示你真名」** | 個人帳號冇得改⚠️ 想顯示品牌名就要開公司＋D-U-N-S（你暫時冇公司 → 建議用個人） |
| 4 | **決定上唔上中國區** | 唔上中國區就避開 ICP 備案（建議：**唔上**，同 Play 唔同） |
| 5 | **有冇 Mac / iPhone？** | 冇都得（雲端 build）但冇 iPhone 就自己試唔到 IAP 真實付款 |

### 我可以做（等你開咗帳號之後）
- Capacitor 專案 scaffold、iOS 設定、圖示／啟動畫面（用返現有 icon）
- 加原生功能（見下）＋ 寫好向 Apple 解釋嘅 review notes
- App Store Connect 文案（中文描述／關鍵詞／版本説明）— 可以沿用 Play 嗰份再調整
- 截圖整理（iOS 尺寸唔同 Android，要重新裁）
- 雲端 build 設定（Codemagic yaml / GitHub Actions）
- 寫好「被拒 4.2 點上訴」嘅信

---

## 四之二、⚠️ 冇 Apple 裝置有冇影響？（2026-09-29 查官方 · Roy 情況：只有 Android + Windows，可以問朋友借 Mac）

**答：技術上做到，但有 2 個位會痛。**

| 步驟 | 冇 iPhone／iPad／Mac 得唔得？ | 官方講法 |
|------|--------------------------|---------|
| 開 Apple ID（雙重認證） | ✅ 得（網頁 appleid.apple.com，Windows 都可以） | — |
| 報名 Apple Developer Program | ✅ **網頁路線**可以（官方：*「Enrollment ... is available through the Apple Developer app and on the web」*） | 要**自己嘅信用卡**（唔可以用別人張卡，用咗會延遲） |
| **身份驗證（影身份證／護照）** | ⚠️ **可能要 Apple 裝置** | 官方：*「Identity verification in the app is required for certain processes, including those that are started and completed on the web」*；用 Apple Developer app 要 iPhone／iPad／有 T2＋Apple Silicon 嘅 Mac，**全程要同一部裝置**。如果唔想畀證件相 → 官方講可以**聯絡 Apple 攞替代驗證方法** |
| 出 build（.ipa） | ✅ 得（雲端 Codemagic／Bitrise／GitHub Actions）**唔需要 Mac** | — |
| 上傳 App Store Connect | ✅ 得（雲端／網頁） | — |
| **TestFlight 自己試 app** | ❌ **要 iPhone／iPad** | TestFlight 只有 iOS／iPadOS app |
| **IAP 真實付款測試** | ❌ 要 iPhone（Sandbox 帳號） | 唔試都可以，但上架後有問題風險 |
| 借朋友 Mac 有冇用？ | 有用但**唔係必須** | 好處：可以裝 Xcode 本地 build／Debug；壞處：Xcode 要 40GB+，朋友未必想裝 |

**結論（我建議）**：
1. **可以照做**：用 Windows 網頁報名 + 雲端 build。
2. **最好借到一部 iPhone（唔係 Mac）** —— 因為要（a）可能做身份驗證（b）TestFlight 自測（c）IAP 真付款測試。借朋友 iPhone 登入你自己 Apple ID 就得，唔會影響朋友帳號。
3. 借 Mac 嘅價值遠低於借 iPhone（Xcode 可以唔用；雲端 build 反而乾淨）。

---

## 四之三、香港 iOS 佔比（2026-09-29 查 StatCounter 官方）+ 決策框架

**硬數據**（StatCounter Global Stats，香港 · 手機 OS · **2026-08**）：
- **Android 52.44%**
- **iOS 47.55%**
- 來源：https://gs.statcounter.com/os-market-share/mobile/hong-kong

→ 即係**差唔多一半香港手機用戶係 iPhone**。主打香港人嘅 app，唔覆蓋 iOS = 一次過放棄近半潛在用戶。

### 要分清兩件事（好多人搞錯）

| | 功能上 | 曝光上 |
|---|---|---|
| iPhone 用戶 | ✅ **用得到**：Safari 開 → 分享 → 「加入主畫面」→ 有 icon、全螢幕、離線都跑（PWA） | ❌ App Store **搵唔到**你個 app，冇「下載」按鈕 |
| 實際影響 | 普通人**唔識**「加入主畫面」呢個操作 → 等於冇 | 呢個先係真正流失位：**冇發現渠道** |

**結論**：iPhone 用戶唔係「用唔到」，係**唔會知你存在**。對主打香港人嘅 app 嚟講，呢個損失係實質嘅。

### 3 個選項（成本 vs 得到）

| 選項 | 成本 | 得到 | 風險 |
|------|------|------|------|
| **A · 唔上 iOS** | $0 | 靠 PWA（要用戶自己識加主畫面） | 放棄近半香港用戶嘅發現渠道 |
| **B · 上 iOS** | US$99/年 ＋ 做一個 WKWebView 殼 ＋ 維護兩邊 | App Store 曝光 ＋ 完整覆蓋 | 4.2 審核風險（有應對方案，見第五節） |
| **C · 先睇數據才決定** | $0（而家） | 有真實數字支持決定 | 遲一點才覆蓋 iOS |

### 建議（C 先，再決定 A/B）

**先睇一個數據**：你個網站有裝 GoatCounter（匿名統計）→ 入去睇**瀏覽器／裝置分佈**（**Safari = iPhone 為主**）。
- 如果實際訪客有接近一半係 Safari／iPhone → **做 iOS 係合理**（唔係感覺，係數字）
- 如果 iPhone 訪客佔比遠低於市佔率 → 可能你嘅客群偏 Android，可以遲啲做

（同時：網站上可以加一句「iPhone 用戶：Safari → 分享 → 加入主畫面」嘅小提示，成本 $0，即刻減少流失。）

---

## 五、4.2 過關策略（最關鍵嘅一節）

Apple 審核員會問一句：**「呢個 app 有咩係 Safari 做唔到？」** 我哋要答得出 3 樣。

| 我哋已經有 | 算唔算 native 增值 | 要唔要補強 |
|-----------|------------------|-----------|
| 離線可以用（Service Worker cache） | ✅ 算（飛航模式都開到） | 要確保**第一次開就 cache 好**（Apple 會試飛航模式） |
| TTS 語音朗讀 | ✅ 算 | 開聲要順 |
| 分享卡（canvas 生成圖片） | ✅ 算 | 用 native share sheet 效果更好 |
| 本機記錄（localStorage） | ✅ 算 | — |
| **要加**：震動回饋（Haptics） | ✅ 明顯 native | 答題／撳掣時輕震 |
| **要加**：iOS 原生分享（Share Sheet） | ✅ | 分享成績卡用 |
| **要加**：本地通知（例如「你上次未做完測試」） | ✅✅ 最有效 | iOS 上 web push 限制多，用原生本地通知最穩 |
| **要加**：StoreKit IAP（解鎖完整分析） | ✅ | 呢個同時係收入來源 |

⚠️ **要避免**：
- 唔好交一個「主要係載入網站」嘅殼（4.2.2 明文禁止 web clippings / content aggregators）
- **唔好用「turn website into app」嘅第三方服務代交**（4.2.6：模板／生成服務代交會被拒，除非由內容提供者自己提交）→ 自己用 Capacitor 做，自己提交 ✅
- 4.3(b) Spam：Apple 講明「fortune telling」類要有明顯差異 → 我哋賣點係**港式廣東話＋香港統計＋相處攻略**，差異化要寫得明
- 1.4.1：唔可以聲稱「診斷」→ 免責聲明要跟（我哋已有）

---

## 六、⚠️ 一個要你知嘅大 trade-off：iOS 唔可以「網頁改完即刻見」

| | Android（TWA · 而家） | iOS（包殼） |
|---|---|---|
| 我改網頁 | 用戶即刻見到新內容 | **見唔到**（除非 app 載入遠端網站） |
| 如果 app 載入遠端網站 | — | ⚠️ 會撞 4.2.2（「repackaged website」）風險大增 |
| 正路做法 | — | **內容打包入 app**（offline-first），改內容 = 出新版送審（1–3 日） |

→ 即係 iOS 版本上架之後，**每次改題目／文案都要重新出 build＋等 Apple 審**（唔似而家網頁改完即刻見）。
→ 折衷：**主要內容打包入 app，只有唔重要嘅 remote 部分（例如最新消息）由網絡攞**。呢個係技術決定，我哋開工時再詳細傾。

---

## 七、可以同 Play 同步嗎？

**可以同時進行，但唔係「同一份嘢交兩次」。**

- 兩邊**獨立審核**，一個拒唔影響另一個
- **收錢系統唔同**：Play 用 Google Play Billing；iOS 一定要用 **StoreKit**（Apple 3.1.1 明文：解鎖內容唔可以用自己嘅機制／網頁付款）→ 即係 IAP 嗰段 code 要寫兩套
- **素材唔同**：截圖尺寸、文案長度、年齡分級問卷、私隱表格都唔同
- **審核時間唔同**：Apple 通常快（1–3 日），Play 第一次最慢

**建議次序（配合你 12×14 封閉測試）**：
```
而家～14 日完結前（2026-10-12/13 前）
  ├─ 你先搞定 Apple 帳號（因為身份驗證可能 1–2 日）
  └─ 我同步做技術準備（Capacitor 專案 + 原生功能）+ 文案

Play 正式版申請（10-12/13）
  └─ 唔衝突，可以並行

之後
  └─ iOS 送 TestFlight 試 → 送審 → 上架
```

---

## 八、費用（2026-09-29 查）

| 項目 | 金額 |
|------|------|
| Apple Developer Program（個人） | **US$99 / 年**（≈ HK$770 / 年） |
| App Store 抽佣 | **30%**（合資格 Small Business Program → **15%**，門檻：上年度收入 ≤ US$1M） |
| 雲端 build（Codemagic 等） | 免費 tier 一般夠用（每月幾百分鐘） |
| Mac | **唔需要** |

---

## 九、你已答嘅（2026-09-29）

| 問題 | 你嘅答案 | 影響 |
|------|---------|------|
| 有咩 Apple 裝置？ | 只有 **Android + Windows**；可以問朋友借 Mac | → 見第四之二節。**建議借 iPhone 多過借 Mac** |
| 接受 App Store 顯示法定姓名？ | ✅ **接受** | → 可以用個人帳號，最簡單，唔需要開公司／D-U-N-S |
| 幾時開始做？ | ⏸️ **暫時只睇資料，遲啲再決定** | → 我唔會開始動工；呢份文件留住睇。你想開工就講一句 |

**未決定嘅**：上唔上中國區（我建議 **唔上**，避開 ICP 備案）；要唔要 IAP（如果要，iOS 要另寫 StoreKit 一套）。

---

## 十、資料來源（官方，可自行核對）

- App Review Guidelines（官方全文，Last Updated 2026-06-08）：https://developer.apple.com/app-store/review/guidelines/
  - 4.2 Minimum Functionality ／ 4.2.2 ／ 4.2.6 ／ 4.3(b) Spam ／ 2.5.6 WebKit ／ 5.1.1 私隱 ／ 1.4.1
- Apple Developer Program 報名：https://developer.apple.com/programs/enroll/
  - 個人報名要「法定姓名」，**「Your name will be displayed as the seller name of your apps on the App Store」**
- 身份驗證：https://developer.apple.com/help/account/membership/identity-verification/
- 會員權益／收費：https://developer.apple.com/programs/whats-included/
- 年齡分級（新制 4+/9+/13+/16+/18+）：https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/
- 中國 ICP 要求：https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/
