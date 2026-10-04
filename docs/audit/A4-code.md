# A4 代碼審計：單一真相來源缺失

- 範圍：`/opt/data/repos/hk-mbti`（主體 `index.html` 7053 行＋佢載入嘅 `data.js` / `pair-data.js` / `social.js` / `premium-data.js` / `type-icons.js` / `tailwind.css` / `sw.js`）。`tools/` 只係對硬編碼畫面清單。
- 樹：`HEAD` `77dda73`，working tree 乾淨。**冇改 repo、冇 push／tag。**
- 方法：acorn 抽 top-level `window.X =`／`function` 宣告；jsdom 抽 `<section id>`；字串陣列同 object key 同真相來源對 diff。CSS 只喺 selector 抽 class（唔把 `font-size:.875rem` 當 class）。
- 事實／推測分開寫。下面「建議」全部未執行。

## 摘要

| 級 | 數 | 而家用戶可見？ |
|---|---|---|
| 高 | **0** | — |
| 中 | **3** | 1 個可見（配對空狀態文案）；2 個係離線／測試盲區 |
| 低 | **7** | 多數係腳槍或輕微樣式，而家未爆 |

已知個案（`window.show` 雙定義＋隱藏清單漏 `pair`）喺呢棵樹 **未重現**：`f7c1b1b` 已把 `pair` 補入清單，`pair_test.js:105-110` 有守門。剩低嘅係同一類「手寫清單會再分叉」。

---

## 1. 重複定義

全頁 top-level（`window.X =`、`function` 宣告、`var`）同名 ≥2 次：**只有 `show`**。其他 HTML 頁（`record.html` / `stats.html` / `tee.html` / `privacy.html` / `offline.html`）抽樣：冇同名 top-level 覆蓋。

### `window.show` — 有心 wrapper，唔係意外覆蓋

| | 位置 | 角色 |
|---|---|---|
| 真身 | `index.html:3227` | `window.show = function(id){ … }` 隱藏清單喺 `:3251` |
| 保存 | `index.html:5250` | `const _origShow = window.show` |
| wrapper | `index.html:5251-5259` | 再賦值；先 `_origShow(id)`，再結果頁 `setShareHint`、離開測試頁 `stopQuestionVoice` |

- **判斷：有心。** 後者唔會丟掉前者（會呼叫 `_origShow`）。運行時生效嘅係 wrapper，但真身仍然跑。
- 賦值區塊 163 字（5251–5259，含 `window.show = `）。口述「162 字」同而家源碼差 1，可能計法唔包換行。**事實係呢段。**
- 嚴重程度：**低**（接駁正確）。腳槍：第三個 `window.show =` 如果唔呼叫前一個，就會靜靜覆蓋。而家未發生。
- 影響：用戶唔會因為「雙定義」而失去切頁。疊頁 bug 嘅根因係清單，唔係 wrapper。
- 建議：保持一條鏈，或者合併做一個 `show`。唔好再加第三個賦值。

onclick **冇**直接叫 `show(...)`。切頁掣叫 `goHome` / `openHub` / `goBack` 等，佢哋內部先叫 `show()`，所以會行到 wrapper。呢個係事實，唔係缺定義。

---

## 2. 硬編碼清單

### 2.1 畫面清單 — 生產路徑而家齊；測試路徑分叉

**真相：** `index.html` 共 17 個 `<section id>`（`about:1431` `hub:1507` `dims:1614` `deep:1654` `deepChapter:1683` `upgrade:1716` `privacy:1754` `letter:1832` `pair:1886` `socialArticle:1897` `romanceArticle:1928` `type:1957` `method:2028` `home:2091` `profile:2274` `test:2355` `result:2384`）。重複 id：**0**。

**生產清單** `index.html:3251`：

```text
["home","profile","test","result","about","hub","dims","letter","type","socialArticle","romanceArticle","method","privacy","upgrade","deep","deepChapter","pair"]
```

同 17 個 section id **完全一致**（冇漏、冇多餘）。`git blame`：呢行係 `f7c1b1b`（2026-10-04）先加 `"pair"`。之前漏 `pair` 先至疊頁。**而家未重現。**

`pair_test.js:105-110` 已用 `<section id>` 對住呢條清單做守門（由 DOM 推導，唔係再抄一份）。返回鍵疊頁亦有 `pair_test.js:88-103`。

| 清單 | 位置 | 對 17 section | 嚴重 | 影響 |
|---|---|---|---|---|
| `show()` 隱藏清單 | `index.html:3251` | 齊 | 低（結構腳槍，有守門） | 而家用戶睇唔到疊頁 |
| `SECTIONS` | `tools/ui/boot_reload_test.js:9` | **漏 `pair`** | **中** | 用戶唔直接見到。下拉重整可見性檢查（同檔 `:64`）只睇呢份清單，`#pair` 疊住其他頁都當唔到。reload 案例亦冇「停喺 pair」 |
| `SECTIONS` | `tools/desktop_layout_test.js:47` | **漏 `pair`、`dims`** | 低 | 桌面 `display` 守門睇唔到 `#pair`／`#dims`。而家 `html.dt #pair`（`index.html:175`）只設 max-width，未見 `display` 覆寫。**推測：** 未爆，但清單過期 |

`tools/deeplink_test.js:96`、`tools/ui/premium_test.js:39` 都有 section 名，但係「邊幾頁可見／手風琴次序」子集，唔係畫面全集。唔當漏項。

建議：`boot_reload_test.js` / `desktop_layout_test.js` 改成同 `pair_test.js:107` 一樣由 `<section id>` 生成。生產 `show()` 可以繼續手寫（已有守門），或者改 `querySelectorAll("section[id]")` 做唯一來源，清單就唔使再同步。

### 2.2 16 型 — 主要登記表齊

真相：`data.js:207` `window.TYPES_FULL` 16 鍵（INTJ…ESFP，標準 16，冇多冇少）。

| 登記 | 位置 | 對 TYPES_FULL |
|---|---|---|
| `window.TYPES` | `index.html:3039` | 齊 |
| `window.TYPE_ICONS` | `type-icons.js:4` | 齊 |
| `window.PALETTE` | `data.js:948` | 齊 |
| `window.PREMIUM` | `premium-data.js:10` | 齊（16 型，每型 chapters） |
| `window.DEEP_ORDER` | `index.html:5898` | 齊 |
| `window.TYPE_ORDER` | `index.html:6776` | 齊 |
| `SOCIAL` 7 場景 × `articles` | `social.js:3` | 每場景 16 型齊（註解「7×16」屬實） |
| `ROMANCE` 3 場景 × `articles` | `social.js:162` | 每場景 16 型齊（註解「3×16」屬實） |

`window.LETTERS`（`data.js:2`）係 E/I/S/N/T/F/J/P 8 鍵，唔係 16 型。維度頁 `HUB_LETTERS`（`index.html:6419`）另有「T vs A」。字母頁掣只開 8 字母，T/A 只係說明卡。**唔當漏型。**

### 2.3 Icon 對應 — 場景名齊；強弱項 icon 對得上顯示來源

| 對 | 結果 |
|---|---|
| `SCENARIOS` 名（`index.html:3059`，10 個） vs `SCENARIO_ICONS`（`:3073`） | 齊 |
| `SOCIAL`/`ROMANCE` 嘅 `name` vs `HUB_SCENE_ICONS`（`:3086` 抄 SCENARIO，`:3087` 再加 10 個場景名） | 7+3 個場景名都有 icon。冇多餘「用唔到嘅場景名」 |
| `PROS_WORD_ICO`（`index.html:6075`，100 鍵） vs `TYPES_FULL` 嘅 strength/weakness（結果頁／人格頁 `prosIconHtml`，`:6177`） | **0 個未對應**。未知詞會跌去 `shield`（`:6180`），而家顯示路徑未觸發 |
| `LETTERS` strength/weakness 有 46 個詞唔喺 `PROS_WORD_ICO` | 字母頁用文字 badge（`index.html:6689`），唔行 icon。**而家唔影響畫面。** 低，只係兩套詞庫未統一 |

### 2.4 配對文案同資料分叉 — 中（用戶可見）

**事實：**

- `pair-data.js:1-3` 註解寫「第一批：INFP × 16 型（16 篇）」。
- 實際 `window.PAIRS`（`pair-data.js:4`）**100** 鍵。左鍵篇數：INFP 16、ENFP 15、ISFJ 14、ESFJ 13、ISTJ 12、ESTJ 11、ISFP 10、ESFP 9。雙向查找後，呢 8 型對所有對手都有文；INTJ/INTP/ENTJ/ENTP/INFJ/ENFJ/ISTP/ESTP 只覆蓋到呢 8 型。
- 空狀態文案寫死喺 `index.html:6562`：「而家已經有 **INFP** 同其他 15 型嘅配對，其他組合會陸續補上。」
- 結果頁每行都出掣，**唔查**有冇文：`index.html:4784-4794` `openPair(type, compat)`。
- 32 個 compat 掣入面 **9 個冇文**：`INTJ×ENTP`、`INTP×ENTJ`、`INTP×ENFJ`、`ENTJ×INTP`、`ENTP×INFJ`、`ENTP×INTJ`、`INFJ×ENTP`、`ENFJ×INTP`、`ISTP×ENFJ`。撳下去會見到上面句過期文案（頁唔會空白；`pair_test.js:66` 只檢查「仲喺度寫」，唔檢查係咪仍然只得 INFP）。

**嚴重程度：中。** 用戶可見：未寫嘅配對會被話成「而家只有 INFP 一批」，但資料已經有 8 型、100 篇。未寫本身係分批內容（代碼有意優雅收場），**過期嘅係文案同檔頭註解**，唔係「應該當 bug 去補晒 256 篇」。

建議：空狀態用 `Object.keys(window.PAIRS)` 計已寫型號，唔好寫死 INFP。同步改 `pair-data.js:2` 註解。

### 2.5 版本清單

測驗版本 id：`life` / `advanced` / `bb`。`record` 係紀錄入口，唔係題庫。

| 來源 | 位置 | 內容 |
|---|---|---|
| 卡 `data-ver` | `index.html:2139/2149/2159/2169` | life 60 題、advanced 30、bb 10、record |
| CSS | `index.html:100/110/120/130` | 四個 `data-ver` 都有規則 |
| 抽題 | `index.html:3904-3907` | 預設每維度 12（×5＝60）、advanced 6、bb 2 |
| 顯示名（複製 6 次） | `:3956` `:4311` `:4505` `:5612` `:5732` `:5755` | `bb→BB版`、`advanced→進階版`、否則 `生活版` |
| 題數（再複製） | `:4549` `:5756` | bb 10 / advanced 30 / 否則 60 |

題數同卡一致。顯示名同卡 **差一個空格**：卡係「BB 版」（`:2162`），JS 係「BB版」。

App 版本：`VERSION` 係 `2.0.0`；`sw.js:1` cache `hk-mbti-v2.0.0`。介面寫死「v2.0」：`index.html:1819`、`:2111`、`:2453`。而家係省略 patch，**唔矛盾**；下次 bump 唔會自動跟 `VERSION`。

嚴重程度：**低。** 建議一個 `VER` 表（id、顯示名、題數）畀卡同 JS 共用；介面版本讀 `VERSION` 或單一常數。

### 2.6 SW precache 漏導航頁 — 中（離線先可見）

`sw.js:2-16` `ASSETS` 有 index／data／social／pair-data／tailwind／voice-data／premium／type-icons／manifest／icon-192／icon-512／offline。

冇：

- `record.html` — `index.html:3339` `goRecord()`、選單 `:3360`
- `stats.html` — 選單 `:3363`

`favicon.png`、`apple-touch-icon.png` 亦唔喺清單（檔案喺 repo，離線圖示先至事，低）。

**事實：** HTML 導航係 network-first（`sw.js:51-64`），失敗先 cache，再跌 `offline.html`。precache 冇呢兩頁 ⇒ 未成功開過、或清 cache 之後，離線開「我的紀錄／統計」會去離線頁。開過一次可能留喺 runtime cache。**推測：** 日常在線用戶睇唔到。

嚴重程度：**中**（設計咗離線，但兩頁導航唔喺預載）。建議加入 `ASSETS`；改 cache 名先會逼舊 client 更新（而家名綁 `v2.0.0`，要同版本政策一齊諗，呢度只係建議）。

Hash 白名單 `index.html:1298-1304` 只得 `#about` `#typeScenes` `#hub` `#method` `#privacy`。係深連結子集，唔係畫面全集。`index.html` 冇 `href="#..."` 指向清單外。**低，而家未分叉。** 選單 `LINKS`（`:3358`）同 `NAV`（`:3367`）對得上（有 href 嘅 record/stats 唔入 NAV）。

---

## 3. 死 class

CSS 來源：`index.html` 四個 `<style>`（`:42` `:739` `:1051` `:1059`）＋ `tailwind.css`（`:1153` 引入）。只計 selector 入面嘅 class。

### HTML 用咗、CSS 冇定義（3 個）

| class | 首見 | 嚴重 | 影響 | 建議 |
|---|---|---|---|---|
| `hover:bg-soft` | `index.html:1529`（另 1533、1537、1541、1633、1637、1641、1645） | 低 | `.bg-soft` 有定義（`:599`），但冇 `.hover\:bg-soft:hover`。手機冇 hover；桌面字母卡 hover 唔會變底 | 加 `:hover` 規則，或刪 class |
| `focus:border-gold` | `index.html:2295`（暱稱 input） | 低 | `.border-gold` 有（`:600`），focus 唔會變金邊。輸入仍然可用 | 加 `:focus` 規則，或刪 class |
| `hub-letter-list` | `index.html:1626` | 低 | 只係掛鉤（`renderDimsLetters` `:6427`、測試有 query）。子元素自帶 `border-l-4` 等。而家排版唔靠佢 | 加規則或改用 id |

### JS 生成、冇自訂 CSS（唔當視覺壞）

- `historyRow` `index.html:5616` — 同行有 `border-t` 等 utility
- `del-btn` `index.html:5633` — 同行有 `bg-white border …` utility

低。自訂名冇規則，視覺靠 utility。

### CSS 定義咗但未用

- `<style>` 自訂 class：未用 **0**
- `tailwind.css` selector class：對 `index.html`＋載入 JS 未用 **0**
- 頭 20 個：無

（舊掃描曾把 `.875rem` 呢類宣告小數當成 class，已丟棄，唔入報告。）

---

## 4. 事件綁定（onclick）

HTML `onclick`（script 外）：**122**。JS 模板再生成一批（`openPair`、`armDeleteHistory`、`pickTypeTile`、`openDeepChapter` 等）。

- **指向唔存在嘅 function：0。**  
  `toggleVoice`（HTML `:2359`）同 `replayQuestionVoice`（`:2373`）唔係 top-level 宣告，而係 IIFE 入面 `window.toggleVoice =`（`:4290`）、`window.replayQuestionVoice =`（`:4251`），IIFE 喺 `:4304` 完、載入時即跑。撳之前已經喺 `window`。
- **指向定義兩次嘅 function：0**（直接）。唯一雙定義係 `show`，onclick 唔直接叫佢（見 §1）。
- 抽樣其他頁：冇做全量 onclick 審計。

---

## 建議修法（未改任何檔）

1. **中／配對文案：** `index.html:6562` 改由 `PAIRS` 鍵推導已寫型號；改 `pair-data.js:2` 註解。唔好為咗呢句去填晒未寫配對。
2. **中／測試清單：** `boot_reload_test.js:9`、`desktop_layout_test.js:47` 改由 `<section id>` 生成，至少補 `pair`（desktop 再補 `dims`）。
3. **中／SW：** `ASSETS` 加 `record.html`、`stats.html`。cache 名要唔要 bump 另議。
4. **低／show：** 可維持現狀（wrapper 正確＋`pair_test` 守門）。若再加畫面，靠守門測試，唔好只改其中一份手寫清單。
5. **低／class：** 補 `hover:bg-soft`、`focus:border-gold`，或刪未生效 class。
6. **低／版本名：** 一個表取代 6 段三元運算；「BB 版」空格統一。

## 已核對、而家齊（唔開項）

- 17 section vs `show()` 清單
- 16 型：TYPES / TYPES_FULL / TYPE_ICONS / PALETTE / PREMIUM / DEEP_ORDER / TYPE_ORDER
- SOCIAL 7×16、ROMANCE 3×16、場景 icon 名
- 測驗 id `life|advanced|bb` 同題數 60/30/10（卡、抽題、進度三邊）
- HTML onclick callee 都存在；重複 id = 0
