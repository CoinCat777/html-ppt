---
name: html-ppt
description: >
  將使用者提供的任何素材（文字、文件內容、URL 摘要、條列資料）轉化為一頁式、
  桌面版互動網頁報告 (Interactive One-Page Web Report)。輸出為單一自包含 HTML 檔，
  具備鍵盤翻頁、底部進度條、左側隱藏目錄 (TOC) 三項核心互動。
  **務必在以下情境觸發**：使用者提到「HTML 報告」
  「一頁式網頁」「投影片網頁」「網頁簡報」「做成 PPT 網頁」「html ppt」
  。即使使用者沒有明確說「skill」，
  只要意圖符合上述情境，即應觸發本 skill。
---

# html-ppt Skill — 互動式單頁網頁報告

## 工作流程總覽

本 skill 強制執行**兩階段流程**，不得跳過 Phase 1 直接輸出 HTML：

```
Phase 1: 分析素材 → 產出 storyboard.md → 【暫停，等待確認】
Phase 2: 使用者確認後 → 產出 index.html
```

---

## Phase 1 — 分鏡規劃 (Storyboard)

### 1-0. 主題確認（分鏡前必做）

**在分析素材之前**，先詢問使用者選擇主題風格，不得自行假設：

> 在開始規劃分鏡前，請先選擇這份報告的視覺主題：
>
> | 主題 | 配色 | 字型 | 適合 |
> |------|------|------|------|
> | **tech** | 炭灰底 / 霓虹青 | JetBrains Mono | AI、編程、科技產品 |
> | **business** | 深藍底 / 金色 | Noto Serif TC | 企業報告、提案、年報 |
> | **minimal** | 白底 / 純黑 | Inter | 設計、品牌、學術、現代感 |
> | **warm** | 奶油米底 / 磚橘 | Lora serif + DM Sans | 教育、品牌故事、溫暖專業感 |
>
> 請回覆主題名稱（tech / business / minimal / warm），或描述你想要的風格。

收到使用者回覆後，將選定主題記在分鏡文件頂部，再進入 1-A 素材解析。

### 1-A. 素材解析

依據使用者提供的素材，識別以下結構：
- **主題與核心訴求**：整份報告要傳達什麼？
- **自然分頁邊界**：每個獨立主題、轉折點、數據群組為一頁
- **建議頁數**：一般 <20 頁（封面 + 內容 + 結尾）；不超過 30 頁

### 1-B. 去 AI 感規則

在整理文案時，必須套用以下規則，讓內容讀起來像真人撰寫：

**禁用詞（出現即替換）**

| 禁用 | 替換建議 |
|------|---------|
| 此外、值得注意的是 | 直接陳述，不加過渡 |
| 綜上所述、總結來看 | 直接說結論 |
| 在…方面、就…而言 | 改用主動句型 |
| 我們不難發現 | 直接說發現了什麼 |
| 毫無疑問 | 刪除，陳述事實即可 |
| 顯而易見 | 刪除 |
| 隨著…的發展 | 直接說趨勢 |

**寫作結構**：標題 + 短句（每句 ≤ 30 字） + 數字亮點
**加入洞察**：每頁至少一句主觀判斷，說明「為什麼這件事重要」
**語氣設定**：專業但不冷漠，像顧問面對客戶說話

**禁用 emoji / Unicode icon**：不得使用任何 emoji（📊 🚀 ✅ 等）或 Unicode 符號圖示作為視覺元素。
需要圖標時，改用以下方案（依優先順序）：
1. **Lucide Icons inline SVG**：從 [lucide.dev](https://lucide.dev) 取得 SVG 路徑，直接 inline 進 HTML（如 `<svg>...<path d="..."/></svg>`）
2. **Feather Icons / Phosphor Icons**：同樣以 inline SVG 方式嵌入
3. **自繪 CSS/SVG 幾何圖形**：簡單形狀（圓、線、方框、箭頭）用純 CSS 或 `<svg>` 手繪
Lucide 常用 icon 對照（分鏡文檔中可直接引用名稱，HTML 開發時再轉為 SVG）：
- 人物類：`User` `Users` `UserCheck`
- 技術類：`Code2` `Terminal` `Wrench` `Cpu` `GitBranch`
- 商業類：`TrendingUp` `BarChart2` `DollarSign` `Target` `Rocket`
- 資料類：`Package` `Database` `FileText` `Share2`
- 學習類：`BookOpen` `GraduationCap` `Lightbulb` `Library`
- 操作類：`PlugZap` `Settings` `CheckCircle` `ArrowRight`

### 1-C. 分鏡輸出模板

輸出 Markdown 格式的分鏡規劃，每一頁用以下格式：

```markdown
## Section N：[頁面標題]

- **佈局類型**：[封面全版 / 標題+條列 / 左圖右文 / 數據儀表板 / 引言大字 / 結尾CTA]
- **文案要點**：
  - 主標：[標題文字]
  - 副標/說明：[1–2 句核心敘述]
  - 條列重點：（若適用）3–8 點，每點 ≤ 22 字
  - 數字亮點：（若有數據）[數值] + [單位/說明]
- **視覺素材**：[`截圖: filename.png` / `CSS生成` / `純文字`] + 一句描述用途或畫面說明
- **圖解模式**：[pattern 名稱，如 `flowchart-vertical` / `compare-pairs` / `flowchart-horizontal` / `ng-ok-split` / `timeline-dual` / `stat-grid` / `vs-duel`；若無結構圖解填「無」]
- **轉場動畫**：內建 6 種 [none / fade / slide / convex / concave / zoom]；自訂 4 種 [flip / reveal / fly-in / split]。詳見 `references/transitions.md`
- **圖表類型**：[無 / 長條圖 / 折線圖 / 圓餅圖 / 數字卡片]
- **字型規範**：依選用主題（見下方主題說明）
```

**欄位填寫規則：**
- `佈局類型` 只描述版面結構（如「左文右圖」「三欄卡片」），不得含主題語言（❌ "terminal 對話框"、"glow 卡片"）
- `視覺素材` 的顏色與材質描述必須符合選定主題調性（minimal 用「黑框白底」、tech 用「霓虹青邊框」）
- icon 一律用 Lucide 名稱標注，不用 emoji 或 Unicode

**圖解模式選用規則：** 以下任一情況必須在 `圖解模式` 填入具名 pattern，不得填「無」：
- 頁面含**連接線、箭頭流程**（任何節點 + 連線組合，包含兩個節點以上）
- 頁面含**左右對照或對應組**（≥ 2 組 problem/solution、NG/OK、before/after）
- 頁面含**雙欄垂直時間線或並行路徑**
- 頁面呈現**兩個選項的高層次對決**（方法 A vs 方法 B、傳統 vs 新潮、路線選擇）→ 優先使用 `vs-duel`

可用 pattern 清單與視覺效果見 `references/patternindex.html`（索引）及各 pattern 獨立 HTML 檔。
若所需 pattern 不在清單中，在 `圖解模式` 填 `待新增: [描述]`，Phase 2 自行設計後補寫新 pattern 檔至 `references/`。

### 1-D. 存檔與暫停

分鏡規劃完成後，必須依序執行：

1. **主題一致性自查（存檔前）**：逐頁掃描，確認以下三點皆符合，否則先修正再存檔：
   - `佈局類型` 欄位不含主題特定詞彙（如 "terminal"、"neon"、"glow"、"霓虹"）
   - `視覺素材` 的顏色、材質描述完全符合選定主題（minimal：黑框/白底/細線；tech：霓虹青/炭灰；business：深藍/金色）
   - `圖解模式` 欄位：含連線或對照組的頁面已填入具名 pattern（非「無」），且 pattern 名稱存在於 `references/` 目錄

2. **將分鏡存成 `storyboard.md`**，放在與 index.html 相同的資料夾，讓使用者可直接在編輯器修改
3. **告知使用者確認**：

> 以上是分鏡規劃草稿，共 N 頁，已存至 storyboard.md 供你編輯。
> **確認無誤後，請回覆「確認」或「開始 coding」，我將進入 HTML 開發階段。**
> 如需調整任何頁面，請直接說明修改點。

**不得在此時輸出任何 HTML 程式碼。**

---

## Phase 2 — HTML 開發

當使用者回覆確認（「確認」「好」「開始」「開始 coding」等）後，進入本階段。

### 2-0. 模式參考（開發前必讀）

**開始寫任何頁面 CSS 之前**，先掃描分鏡所有 `圖解模式` 欄位：

- 若任何頁面填有具名 pattern（非「無」），**必須先開啟 `references/[pattern-name].html`** 查閱結構，再開始該頁的 HTML+CSS。
- 禁止在未查閱 pattern 檔案的情況下，用 SVG 自行繪製流程圖或自創對照卡片結構——這是過去輸出品質不穩的根本原因。
- 若 pattern 名稱為 `待新增: [描述]`，先依描述自行設計，實作完成後將新 pattern 補寫一個獨立 HTML 檔存至 `references/`，並在 `references/patternindex.html` 索引中新增連結。

### 2-A-0. 轉場動畫實作規則

**Reveal.js 內建（直接使用，無需額外 CSS）：**
- `none` / `fade` / `slide` / `convex` / `concave` / `zoom`
- 在 `Reveal.initialize({ transition: 'fade' })` 設全域預設，或在 `<section data-transition="zoom">` 覆蓋單頁
- 進出可分開：`<section data-transition="fade-in slide-out">`

**自訂轉場（需在 `<style>` 加入對應 CSS）：**
- `flip` / `reveal` / `fly-in` / `split`
- 開發前先開啟 `references/transitions.md`，將對應 CSS snippet inline 進 `<style>` 最後
- section 上加 `data-transition="flip"`（或其他名稱）即觸發

### 2-A. 技術堆疊（固定，不需詢問）

```html
<!-- 頁面引擎 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css">
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>

<!-- 動畫 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>

<!-- 圖表（視需要） -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>

<!-- 微動畫（視需要） -->
<script src="https://cdn.jsdelivr.net/npm/lottie-web@5/build/player/lottie.min.js"></script>
```

### 2-B. HTML 結構模板

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[報告標題]</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  <style>
    /* === 1. 主題 CSS 完整 inline（從 assets/ 對應檔案複製）=== */
    /* === 2. 強制字型基底（必須加）=== */
    .reveal .slides { font-size: max(1rem, 1vw); }
    /* === 3. Reveal 覆蓋 === */
    .reveal-viewport { background: var(--bg-primary) !important; }
    .reveal .slides { text-align: left; }
    .reveal .slides > section {
      top: 0 !important;
      padding: 5vh 7vw;
      height: 100vh;
      display: flex !important;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }
    /* === 4. 各頁面佈局樣式 === */
  </style>
</head>
<body>
  <div id="progress-bar-wrapper"><div id="progress-bar"></div></div>
  <div id="toc-trigger"></div>
  <nav id="toc-drawer">
    <h3>目錄</h3>
    <!-- .toc-item[data-idx="N"] × N -->
  </nav>
  <div class="reveal">
    <div class="slides">
      <!-- section × N，對應分鏡每頁 -->
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <!-- 以下視需要載入 -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script> -->
  <script>
    // 1. Reveal 初始化（固定參數，不要縮放）
    Reveal.initialize({
      width: '100%', height: '100%',
      margin: 0, minScale: 1, maxScale: 1,
      keyboard: true, controls: false,
      progress: false, center: false,
      hash: false, transition: 'fade',
    });
    // 2. 進度條
    // 3. TOC
    // 4. 滑鼠點擊 + 滾輪導覽
    // 5. GSAP 入場動畫
    // 6. ECharts 圖表（視需要）
  </script>
</body>
</html>
```

### 2-B-1. 字型尺寸基準（桌面簡報專用）

簡報在桌面全螢幕下觀看，字型尺寸務必符合以下下限，避免小字難讀：

| 層級 | CSS 規則 | 最小值 |
|------|---------|-------|
| 主標題 | `clamp(1.7rem, 2.8vw, 2.6rem)` | 27px |
| 副標 / 說明 | `clamp(1.05rem, 1.4vw, 1.2rem)` | 17px |
| 卡片內文 / 條列 | `min 0.95rem` | 15px |
| 說明文字 / caption | `min 0.88rem` | 14px |
| 標籤 / badge | `min 0.78rem` | 12px（可接受最小值）|

**強制規則**：在 `.reveal .slides` 加入 `font-size: max(1rem, 1vw)` 作為基底，
讓所有 `em`/`rem` 值自動隨視窗縮放。

### 2-B-2. 留白偵測與視覺補強規則

開發前先預估每頁的「文字填充率」：

- **文字填充率 > 70%**：正常排版，無需補充
- **文字填充率 30–70%**：加入 CSS 裝飾元素（卡片、分隔線、accent bar）
- **文字填充率 < 30%**：必須加入以下其中一項：
  1. **具名 pattern**（優先）：若分鏡 `圖解模式` 已指定 pattern，直接按 `references/[pattern].html` 實作，不走即興路線
  2. **CSS/SVG inline 視覺**：幾何圖案、卡片、流程圖、關鍵字浮動（僅在無 pattern 指定時使用）
  3. **截圖補充**：詢問使用者是否有相關截圖可補入
  4. **AI 生成圖片**（使用者確認後）：說明風格提示詞，由使用者用 Midjourney/DALL-E 生成後提供 URL

典型高留白情境與主題對應補強方案：

| 情境 | minimal | tech | business | warm |
|------|---------|------|----------|------|
| 純結語 / 封底頁 | 引言卡片（黑框大引號） | terminal 卡片 + 閃爍游標 | 金色細線裝飾框 | 磚橘引號大字卡片（圓角） |
| 純引言大字頁 | 右側幾何方框裝飾 | 右側關鍵字浮動雲 | 背景截圖 blur overlay | 米色漸層背景 + 磚橘細線裝飾 |
| 條列只有 2-3 點 | insight bar + 放大字型 | insight bar + glow 底色 | insight bar + 金色左邊線 | insight bar + 磚橘左邊線 + 圓角卡片 |

### 2-C. 五項必備互動元件實作規則

**① 鍵盤導覽（← →）**
Reveal.js `keyboard: true` 預設支援，初始化時已包含。

**② 底部進度條**
```javascript
function updateProgress() {
  const total   = Reveal.getTotalSlides();
  const current = Reveal.getState().indexh + 1;
  document.getElementById('progress-bar').style.width = (current / total * 100) + '%';
}
Reveal.on('ready',        updateProgress);
Reveal.on('slidechanged', updateProgress);
```

**③ 左側 Hover TOC**
```javascript
const trigger = document.getElementById('toc-trigger');
const drawer  = document.getElementById('toc-drawer');
const items   = document.querySelectorAll('.toc-item');

trigger.addEventListener('mouseenter', () => drawer.classList.add('open'));
drawer.addEventListener('mouseleave',  () => drawer.classList.remove('open'));

items.forEach(item => {
  item.addEventListener('click', () => {
    Reveal.slide(parseInt(item.dataset.idx));
    drawer.classList.remove('open');
  });
});
Reveal.on('slidechanged', e => {
  items.forEach((item, i) => item.classList.toggle('active', i === e.indexh));
});
Reveal.on('ready', e => {
  items.forEach((item, i) => item.classList.toggle('active', i === e.indexh));
});
```

**④ 滑鼠左鍵點擊切換下一頁**
```javascript
document.querySelector('.reveal').addEventListener('click', e => {
  if (e.target.closest('#toc-drawer') ||
      e.target.closest('#toc-trigger') ||
      e.target.tagName === 'A' ||
      e.target.tagName === 'BUTTON') return;
  Reveal.next();
});
```

**⑤ 滾輪在總覽模式（ESC）中切換頁面**
```javascript
window.addEventListener('wheel', e => {
  if (!Reveal.isOverview()) return;
  e.preventDefault();
  if (e.deltaY > 0) Reveal.next();
  else              Reveal.prev();
}, { passive: false });
```

**⑥ GSAP 入場動畫（每頁切換時觸發）**
```javascript
function animateSlide(idx) {
  const slide = document.querySelectorAll('.reveal .slides > section')[idx];
  if (!slide) return;
  const tl = gsap.timeline();
  const label = slide.querySelector('.slide-label');
  const title = slide.querySelector('.slide-title, .cover-title');
  const bar   = slide.querySelector('.accent-bar');
  const sub   = slide.querySelector('.slide-subtitle');
  const cards = slide.querySelectorAll('.card, [class*="-card"]');

  if (label) tl.fromTo(label, {opacity:0, y:-12}, {opacity:1, y:0, duration:0.4}, 0);
  if (title) tl.fromTo(title, {opacity:0, y:20},  {opacity:1, y:0, duration:0.5}, 0.1);
  if (bar)   tl.fromTo(bar,   {scaleX:0},          {scaleX:1, duration:0.4, transformOrigin:'left'}, 0.25);
  if (sub)   tl.fromTo(sub,   {opacity:0, y:12},   {opacity:1, y:0, duration:0.45}, 0.3);
  if (cards.length) tl.fromTo(cards, {opacity:0, y:24}, {opacity:1, y:0, duration:0.4, stagger:0.1}, 0.35);
}
Reveal.on('ready',        e => animateSlide(e.indexh));
Reveal.on('slidechanged', e => animateSlide(e.indexh));
```

### 2-D. 主題套用方式

確認使用者選擇的主題後，將對應 CSS 檔的**完整內容** inline 進 `<style>` 標籤。
覆蓋 Reveal.js 預設主題樣式，讓 CSS 變數統一控制顏色、字型、間距。

```css
/* 在自訂 <style> 最頂端，覆蓋 Reveal 預設 */
.reveal, .reveal .slides {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--size-body);
  line-height: var(--lh-body);
}
.reveal .slides section {
  padding: var(--slide-pad-y) var(--slide-pad-x);
  text-align: left;
  height: 100%;
}
```

### 2-E. 輸出規範

- **單一 index.html**：所有 CSS inline 在 `<style>`，JS 在 `<script>`，CDN 連結保留
- **圖片路徑**：使用者提供的截圖放在與 index.html 相同資料夾，用相對路徑引用（如 `src="screenshot.png"`）；檔名含空格時用 `%20` 編碼（如 `src="my%20tool.png"`）
- 不使用 base64 圖片（保持檔案輕量）；無圖片時用 CSS 漸層或 inline SVG 填補空間
- 輸出完成後說明：「已完成 index.html，包含 N 頁、[主題名] 主題。請在瀏覽器開啟測試：← → 鍵盤切換、滑鼠左鍵切換、ESC 總覽 + 滾輪、左側 TOC、底部進度條。」

---

## 主題說明

| 主題 | 關鍵詞 | 配色 | 標題字型 | 適用場景 |
|------|--------|------|---------|---------|
| **business** | 商務、企業、報告、提案 | 深藍底 / 金色強調 | Noto Serif TC | 公司簡介、年報、商業提案 |
| **tech**     | 科技、AI、數據、產品  | 炭灰底 / 霓虹青強調 | JetBrains Mono | 技術發表、產品 Demo、數據分析 |
| **minimal**  | 極簡、設計、品牌、乾淨 | 白底 / 純黑強調 | Inter | 品牌故事、設計作品集、學術報告 |
| **warm**     | 教育、學習、溫暖、親和 | 奶油米底 / 磚橘強調 | Lora serif + DM Sans | 教學內容、品牌故事、社群報告、溫暖專業感 |

**warm 主題設計要點**（Anthropic 風格）：
- 背景 `#f5ede0`（奶油米）+ 卡片 `#faf7f4`（近白帶暖）
- 強調色 `#cc5833`（磚橘），標籤、數字、accent bar 皆用此色
- `label` / `eyebrow` 用磚橘大寫字，非灰色
- 卡片 `border-radius: 14px` + 淡陰影（無硬邊框感）
- TOC active 項目用磚橘文字 + 淡橘底色
- 進度條 3px，圓角末端

使用者若未指定，根據內容類型自動推薦。
若使用者不滿意，直接討論調整偏好，新增 CSS 主題後可持續累積。

---

## 補充：若使用者提供額外素材

- **圖片**：提供 URL → 用 `<img src="...">` 搭配 CSS 濾鏡套用主題色調
- **數據表格**：轉換為 ECharts 圖表，在 slidechanged 時觸發動畫
- **品牌色**：詢問主色後，覆蓋對應 CSS 變數 `--accent`
- **客製風格**：作為新主題 CSS 加入 assets/ 資料夾，命名為 `theme-[名稱].css`
