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

**在分析素材之前**，先掃描素材的「細節密度」，並讀取 `config/themes.index.json` 詢問主題。若素材含有高價值的實作細節（如程式碼、設定檔、深度機制），必須給予使用者「精簡/豪華」的選擇，不得自行假設：

> 在開始規劃分鏡前，請先選擇這份報告的視覺主題（直接回覆數字即可）：
>
> | 編號 | 主題 | 配色 | 字型 | 適合 |
> |------|------|------|------|------|
> | **1** | **business** | 亮底 / 香檳金 | Noto Serif TC + Playfair Display | 企業報告、提案、年報 |
> | **2** | **light-tech** | 冷白底 / 科技青 | Space Grotesk + Noto Sans TC | AI、產品、數據展示 |
> | **3** | **warm-minimal** | 暖白底 / 深碳黑 | Cormorant Garamond + Noto Sans TC | 品牌、設計、閱讀型簡報 |
> | **4** | **brand-warm** | 奶油米底 / 磚橘 | Lora + DM Sans | 教育、品牌故事、溫暖專業感 |
>
> **2. 選擇內容深度**（我偵測到素材內有大量高價值實作細節）：
> - **[A] 精簡版 (Concise)**：只保留核心觀念與高階架構，刪減所有程式碼與繁雜細節（適合快速報告）。
> - **[B] 精彩豪華版 (Deluxe)**：保留所有核心實作細節（如程式碼、進階機制），（適合技術分享與教學手冊）。
> 
> 請回覆「主題編號 + 深度選擇」（例如：2 + B，若素材無特別細節則不顯示第 2 點）。

收到使用者回覆後，將選定主題記在分鏡文件頂部

再進入 1-A 素材解析。

### 1-A. 素材解析

依據使用者提供的素材，識別以下結構：

- **主題與核心訴求**：整份報告要傳達什麼？
- **自然分頁邊界**：每個獨立主題、轉折點、數據群組為一頁
- **建議頁數**：一般 <20 頁（封面 + 內容 + 結尾）；不超過 30 頁

### 1-A-1. PPT/PPTX 素材處理（如使用者提供 PowerPoint 檔）

當使用者素材為 `.ppt` 或 `.pptx` 檔案，**必須在進入 1-B 前**完成以下三步驟，否則分鏡會缺乏實際畫面，HTML 也會少掉可直接重用的工具截圖、流程截圖。

**步驟 1：抽出每一頁的文字內容 + 全頁 PNG**

優先用 PowerPoint COM（Windows + 已安裝 Office），可同時拿到文字與整頁畫面：

```powershell
# 將 .ppt / .pptx 轉成全頁 PNG + 抽出純文字
$file = "C:\path\to\xxx.ppt"
$outDir = "C:\path\to\extracted"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($file, $true, $false, $false)
$i = 0
foreach ($slide in $pres.Slides) {
    $i++
    Write-Output "=== SLIDE $i ==="
    foreach ($shape in $slide.Shapes) {
        if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
            Write-Output $shape.TextFrame.TextRange.Text
        }
    }
    $slide.Export((Join-Path $outDir ("slide_{0:D2}.png" -f $i)), "PNG", 1280, 720)
}
$pres.Close(); $pp.Quit()
```

`.pptx` 也可改用 `python-pptx`（純文字）或解壓 zip 取 `ppt/media/` 內所有圖。`.ppt` 僅 COM 可靠。

**步驟 2：抽出每張投影片的「內嵌圖片物件」（不是整頁截圖）**

整頁截圖會把原 PPT 的標題列、品牌條、模板色塊也一起帶進去，做不出乾淨的 HTML。要的是**每個 Shape 物件單獨匯出**：

```powershell
# 接續上方，用 Shape.Export 把 Picture 類型 (Type=13/11) 與群組內的子圖逐一輸出
$imgDir = "C:\path\to\images"
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null
$pres = $pp.Presentations.Open($file, $true, $false, $false)
$si = 0
foreach ($slide in $pres.Slides) {
    $si++
    $shi = 0
    foreach ($shape in $slide.Shapes) {
        $shi++
        if ($shape.Type -eq 13 -or $shape.Type -eq 11) {
            $name = "slide{0:D2}_img{1:D2}.png" -f $si, $shi
            $shape.Export((Join-Path $imgDir $name), 2)  # 2 = ppShapeFormatPNG
        } elseif ($shape.Type -eq 6) {
            foreach ($child in $shape.GroupItems) {
                $shi++
                if ($child.Type -eq 13 -or $child.Type -eq 11) {
                    $name = "slide{0:D2}_img{1:D2}.png" -f $si, $shi
                    $child.Export((Join-Path $imgDir $name), 2)
                }
            }
        }
    }
}
$pres.Close(); $pp.Quit()
```

命名規則固定為 `slideXX_imgYY.png`（投影片編號 + Shape 索引），方便後續對應。

**步驟 3：人工識別每張圖的內容並建立對應表**

抽出後不要照單全收。逐張用 Read 工具或 IDE 預覽，**判斷哪些值得保留**：

| 類型 | 處理 |
|------|------|
| 實際工具/產品截圖（UI、儀表板、實機畫面） | **保留並優先嵌入分鏡** |
| 真實雜亂資料、報表、原始輸入 | 保留作為痛點頁的視覺證明 |
| Gemini/ChatGPT 對話過程截圖 | 保留作為流程頁的步驟 thumbnail |
| 簡報自製的流程圖、對照圖（顏色不符選定主題） | **不嵌入**，改用 pattern 重繪；路徑保留在分鏡末段供比對 |
| 純裝飾插畫、品牌 logo、模板色塊 | 不嵌入 |
| 過小、解析度低、被裁切的截圖 | 不嵌入 |
| 圖檔只是單純文字和圖框| 不嵌入，改用 html 的方式重繪 |

把識別結果寫成一張「圖檔使用對應表」，放在分鏡文件末段（見下方 1-C 模板）。

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

**寫作內容**：盡量保持素材原來語意
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
- **視覺素材**：[`截圖: images/slideXX_imgYY.png` / `CSS生成` / `純文字`] + 一句描述用途或畫面說明
  - 若有從 PPT 抽出的可用圖檔（見 1-A-1），檔名直接寫成 `images/slideXX_imgYY.png` 形式
  - 同一頁可列多張圖，每張一行說明它放在哪個版位（如「卡 1 thumbnail」「步驟 ② 內嵌截圖」）
  - 該頁有實際圖檔時，建議在 Section 末段補一段 `#### 圖檔預覽` 用 markdown 圖片語法 `![alt](images/xxx.png)` 引用，方便使用者在 IDE 預覽分鏡時直接看到畫面
- **圖解模式**：[pattern 名稱，如 `flowchart-vertical` / `compare-pairs` / `flowchart-horizontal` / `ng-ok-split` / `timeline-dual` / `stat-grid` / `vs-duel`；若無結構圖解填「無」]
- **轉場動畫**：內建 6 種 [none / fade / slide / convex / concave / zoom]；自訂 4 種 [flip / reveal / fly-in / split]。詳見 `references/transitions.md`
- **圖表類型**：[無 / 長條圖 / 折線圖 / 圓餅圖 / 數字卡片]
- **字型規範**：依選用主題（見下方主題說明）
```

**轉場動畫多樣性規則（規劃時必讀）：**

10 種轉場分三組，整份分鏡三組各至少挑選 1 種，不得只用 fade：

| 組別 | 轉場效果 | 典型情境 |
|------|---------|---------|
| **開場衝擊** | `split` `zoom` `flip` | 封面、重點揭示、強對比頁（vs-duel）|
| **流動敘事** | `slide` `reveal` `fly-in` | 流程頁、連續工具展示、問題帶入頁 |
| **節奏收尾** | `convex` `concave` `none` `fade` | 轉折停頓、靜態展示、結語 |

強制限制：
- `fade` 全場最多 **3 次**（含結語），超出即替換同組其他轉場
- 連續 3 頁使用相同轉場 = 違規，第 3 頁必須換用其他效果
- 分鏡規劃完成後，在 1-D 自查步驟中統計三組覆蓋情況

**欄位填寫規則：**
- `佈局類型` 只描述版面結構（如「左文右圖」「三欄卡片」），不得含主題語言（❌ "terminal 對話框"、"glow 卡片"）
- `視覺素材` 的顏色與材質描述必須符合選定主題調性（business 用「暖白底／香檳金線」、light-tech 用「冷白底／科技青邊框」、warm-minimal 用「暖白底／柔灰細線」、brand-warm 用「奶油米／磚橘重點」）
- icon 一律用 Lucide 名稱標注，不用 emoji 或 Unicode

**圖解模式選用規則：** 以下任一情況必須在 `圖解模式` 填入具名 pattern，不得填「無」：
- 頁面含**連接線、箭頭流程**（任何節點 + 連線組合，包含兩個節點以上）
- 頁面含**左右對照或對應組**（≥ 2 組 problem/solution、NG/OK、before/after）
- 頁面含**雙欄垂直時間線或並行路徑**
- 頁面呈現**兩個選項的高層次對決**（方法 A vs 方法 B、傳統 vs 新潮、路線選擇）→ 優先使用 `vs-duel`

可用 pattern 清單與視覺效果見 `references/patternindex.html`（索引）及各 pattern 獨立 HTML 檔。
Pattern metadata 存於 `references/patterns/index.json` 與 `references/patterns/*.json`，用於驗證可用名稱、主題相容性與彈性預設值。
若所需 pattern 不在清單中，在 `圖解模式` 填 `待新增: [描述]`，Phase 2 自行設計後補寫新 pattern 檔至 `references/`。

### 1-D. 存檔與暫停

分鏡規劃完成後，必須依序執行：

1. **主題一致性自查（存檔前）**：逐頁掃描，確認以下五點皆符合，否則先修正再存檔：
   - `佈局類型` 欄位不含主題特定詞彙（如 "terminal"、"neon"、"glow"、"霓虹"）
   - `視覺素材` 的顏色、材質描述完全符合選定主題（business：暖白 / 香檳金；light-tech：冷白 / 科技青；warm-minimal：暖白 / 深碳黑；brand-warm：奶油米 / 磚橘）
   - `圖解模式` 欄位：含連線或對照組的頁面已填入具名 pattern（非「無」），且 pattern 名稱存在於 `references/patterns/index.json`（對應 HTML demo 位於 `references/`）
   - `轉場動畫` 欄位：統計 `fade` 出現次數 ≤ 3；確認「開場衝擊 / 流動敘事 / 節奏收尾」三組各至少 1 頁；無連續 3 頁相同轉場
   - **圖檔對應**（若 1-A-1 有抽出 PPT 圖）：所有 `視覺素材` 引用的 `images/slideXX_imgYY.png` 路徑都實際存在；不嵌入主題不符的原 PPT 流程圖（路徑保留在末段對應表中註記「參考用，不嵌入」）

2. **將分鏡存成 `storyboard.md`**，放在與 index.html 相同的資料夾，讓使用者可直接在編輯器修改

   若 1-A-1 有抽出圖檔，**末段必須附「圖檔使用對應表」**，格式如下：

   ```markdown
   ## 圖檔使用對應表

   | Section | 用途 | 來源檔案 |
   |--------|------|---------|
   | S4 | CP 計分工具截圖 | `images/slide04_img03.png` |
   | S4 | Bitmap 分析工具截圖 | `images/slide04_img16.png` |
   | S7 | （參考用，不嵌入）原 PPT 流程圖 | `images/slide07_img02.png` |
   ```

   表格目的：(a) 讓使用者一眼確認哪些圖被用、放在哪頁；(b) Phase 2 開發時不必回查每個 section 的視覺素材欄位；(c) 標註「參考用，不嵌入」讓使用者明白該圖被刻意排除（通常是配色不符）。
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
- 若 `references/patterns/[pattern-name].json` 存在，開發時先讀取其 `themeStrategy`、`defaults`、`constraints`，再套到頁面 CSS 變數與布局。
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
    /* === 1. 主題 CSS 完整 inline（優先由 config/themes.json 生成；若使用快照則從 assets/theme-[name].css 複製）=== */
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
     同步參考 `references/patterns/[pattern].json` 的主題 token、元件預設與可接受範圍
  2. **CSS/SVG inline 視覺**：幾何圖案、卡片、流程圖、關鍵字浮動（僅在無 pattern 指定時使用）
  3. **截圖補充**：詢問使用者是否有相關截圖可補入
  4. **AI 生成圖片**（使用者確認後）：說明風格提示詞，由使用者用 Midjourney/DALL-E 生成後提供 URL

典型高留白情境與主題對應補強方案：

| 情境 | warm-minimal | light-tech | business | brand-warm |
|------|---------|------|----------|------|
| 純結語 / 封底頁 | 引言卡片（暖灰細框） | 幾何科技卡片 + 細網格 | 香檳金細線裝飾框 | 磚橘引號大字卡片（圓角） |
| 純引言大字頁 | 右側 editorial 幾何區塊 | 右側科技資訊面板 | 背景紙質漸層 + 細金線 | 奶油米漸層背景 + 磚橘細線裝飾 |
| 條列只有 2-3 點 | insight bar + 放大字型 | insight bar + 科技青底條 | insight bar + 香檳金左邊線 | insight bar + 磚橘左邊線 + 圓角卡片 |

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

確認使用者選擇的主題後，優先以 `config/themes.json` 作為主題來源：

1. 先用 `scripts/theme-loader.js` 依主題名稱或數字選單產生 CSS 變數
2. 若需快速快照，可直接 inline `assets/theme-business.css`、`assets/theme-light-tech.css`、`assets/theme-warm-minimal.css`、`assets/theme-brand-warm.css`
3. 預設輸出為 bright mode，並在 `<html data-theme-mode="light">` 下渲染；若偵測瀏覽器為頁面為 dark mode, 則切換 dark mode 的函式

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
- **圖片路徑**：使用者提供的截圖或從 PPT 抽出（見 1-A-1）的圖檔，放在與 index.html 同層的 `images/` 子資料夾，HTML 用相對路徑引用（如 `src="images/slide04_img03.png"`）；檔名含空格時用 `%20` 編碼
- **圖檔來源優先序**：(1) 1-A-1 抽出的可重用截圖 > (2) 使用者新提供的圖 > (3) CSS/SVG 重繪。對抽出但配色不符主題的圖（如原 PPT 的紫綠粉橘流程圖）一律改用 pattern 重繪，不嵌入
- 不使用 base64 圖片（保持檔案輕量）；無圖片時用 CSS 漸層或 inline SVG 填補空間
- 輸出完成後說明：「已完成 index.html，包含 N 頁、[主題名] 主題。預設為 bright mode，頁面可切換 dark mode。請在瀏覽器開啟測試：← → 鍵盤切換、滑鼠左鍵切換、ESC 總覽 + 滾輪、左側 TOC、底部進度條。」

### 2-F. 完成後自我檢查（Output Self-Check）

**HTML 輸出完成後立即執行，有問題直接修正，不等使用者回報。**

**① 圖片 ↔ 文字重疊檢查**
- 含截圖的頁面（`img-section`、`grid-section`、`screenshot-grid` 等）：
  - 圖片 `src` 路徑已正確 URL 編碼（空格 → `%20`），檔名與目錄圖檔一致
  - `position: absolute` overlay（step-badge、step-caption、utf8-warning 等）只覆蓋圖片邊緣，不遮蔽核心畫面主體
  - 圖片欄與文字欄使用 flex / grid 正確分隔，無 CSS 層疊導致的視覺重疊

**② 分鏡文案 vs HTML 文案一致性**
- 分鏡「主標」→ HTML `.slide-title` / `.cover-title`：文字一致，無截斷或多餘內容
- 分鏡「條列重點」→ HTML `.bullet-list li`：項目數相符
- 分鏡「洞察」→ HTML `.insight-bar`：每個有洞察的頁面都存在對應元素
- 分鏡「截圖: images/slideXX_imgYY.png」→ HTML `<img src="images/slideXX_imgYY.png">`：檔名完全對應，`%20` 編碼正確
- 分鏡末段「圖檔使用對應表」→ HTML：對應表中標「保留」的圖必須在對應 Section 出現；標「參考用，不嵌入」的圖**不應**出現在 HTML 中

**③ 轉場動畫實作確認**
- 自訂轉場（split / flip / reveal / fly-in）：`@keyframes` CSS 已 inline 在 `<style>` 最後
- 每個 `<section data-transition="...">` 的值與分鏡欄位完全一致
- 有使用自訂轉場的 CSS snippet 全數包含，無任何遺漏

**④ 結構數量核對**
- `<section>` 數量 = 分鏡頁數
- TOC `.toc-item` 數量 = `<section>` 數量，`data-idx` 從 0 連續遞增無跳號

**⑤ 排版核對**
- 一頁式的 HTML, 確認文字，符號，排版是否有超出可視的範圍

---

## 主題說明

| 主題 | 關鍵詞 | 配色 | 標題字型 | 適用場景 |
|------|--------|------|---------|---------|
| **business** | 商務、企業、提案、董事會 | 暖白底 / 香檳金 | Noto Serif TC + Playfair Display | 公司簡介、提案、年報 |
| **light-tech** | 科技、AI、數據、產品 | 冷白底 / 科技青 | Space Grotesk + Noto Sans TC | 技術發表、產品 Demo、數據分析 |
| **warm-minimal** | 極簡、品牌、學術、閱讀 | 暖白底 / 深碳黑 | Cormorant Garamond + Noto Sans TC | 品牌故事、設計作品集、學術報告 |
| **brand-warm** | 教育、學習、溫暖、親和 | 奶油米底 / 磚橘 | Lora + DM Sans | 教學內容、品牌故事、社群報告 |

**brand-warm 主題設計要點**（Claude / Anthropic 方向）：
- 背景 `#F5EDE0`（奶油米）+ 卡片 `#FAF7F4`（近白帶暖）
- 強調色 `#CC5833`（磚橘），標籤、數字、 accent bar 皆用此色
- `label` / `eyebrow` 用磚橘大寫字，非灰色
- 卡片 `border-radius: 14px` + 淡陰影（無硬邊框感）
- TOC active 項目用磚橘文字 + 淡橘底色
- 進度條 3px，圓角末端

**warm-minimal 主題設計要點**：
- 背景 `#F7F5F0` + 卡片 `#FCFAF6`
- 強調色不追求高彩度，改用深碳黑與暖灰層次
- 邊框與陰影都要很輕，讓頁面偏閱讀感而不是品牌廣告感
- TOC 作用狀態以暖灰底塊為主，不做強烈色條

使用者若未指定，根據內容類型自動推薦。
若使用者不滿意，直接討論調整偏好；新增主題時，優先更新 `config/themes.json`、再產生對應 CSS 與預覽，可持續累積。

---

## 補充：若使用者提供額外素材

- **圖片**：提供 URL → 用 `<img src="...">` 搭配 CSS 濾鏡套用主題色調
- **數據表格**：轉換為 ECharts 圖表，在 slidechanged 時觸發動畫
- **品牌色**：詢問主色後，覆蓋對應 CSS 變數 `--accent`
- **客製風格**：先新增 `config/themes.json` 主題 entry，再視需要產生 `assets/theme-[名稱].css` 與 `references/previews/[名稱]-preview.png`
