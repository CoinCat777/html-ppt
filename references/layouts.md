# html-ppt Layout Pattern 目錄

視覺 demo 見各 pattern 獨立 HTML 檔；索引見 `patternindex.html`。
如需 theme token、彈性參數與約束，另查 `patterns/index.json` 與 `patterns/*.json`。
本文件為 Phase 2 開發時的**結構速查表**，每個條目列出關鍵 CSS 決策與實作陷阱。

---

### flowchart-vertical
**用途：** 3–6 個步驟垂直排列，左側回饋循環虛線框，右側絕對定位標注卡片
**別名：** 垂直循環圖 / loop diagram / 4 節點循環 / PDCA
**視覺 demo：** `flowchart-vertical.html`

**HTML 骨架：**
```html
<div class="flow-wrapper">                    <!-- position:relative; margin-left:80px -->
  <div class="return-loop">                   <!-- position:absolute; 三邊dashed框；無右邊 -->
    <div class="loop-text">不對就修正重來</div>
  </div>
  <div class="step-row">                      <!-- position:relative; width:260px -->
    <div class="main-card card-purple">① 步驟標題 / 說明</div>
    <div class="side-card">標注文字</div>     <!-- position:absolute; left:calc(100%+36px) -->
  </div>
  <div class="arrow-down"></div>              <!-- 2px線 + ::after 向下三角 -->
  <!-- 重複 step-row + arrow-down × N -->
</div>
```

**關鍵 CSS：**
- `.flow-wrapper` → `position:relative; display:flex; flex-direction:column; align-items:center; width:fit-content; margin-left:120px`（**`width:fit-content` 不可省**：若缺少此屬性，flex 容器會撐至全寬，`align-items:center` 把 step-row 向右偏移，導致 loop 與卡片之間出現大空白）
- `.return-loop` → `position:absolute; top:30px; bottom:30px; left:-120px; width:105px; border-left/top/bottom:2px dashed`（三邊，不加 border-right；left 絕對值 = margin-left，讓框貼緊卡片左側）
- `.return-loop::after` → 頂部向右三角箭頭（`top:-6px; right:-1px; border-left:8px solid`）
- `.loop-text` → `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:80px; text-align:center`（**務必置中於框內**，勿用 `left:-80px` 否則文字跑出框外產生大空白）
- `.step-row` → `position:relative; width:260px`（固定寬，side-card 定位基準）
- `.side-card` → `position:absolute; left:calc(100%+36px); top:50%; transform:translateY(-50%)`
- `.side-card::before` → 水平虛線連接（`position:absolute; top:50%; left:-36px; width:36px; border-top:2px dashed`）
- 節點色：purple `#f3effc/#b7a6d8`、blue `#eef6fc/#99badb`、green `#e6f5ec/#8bc1a3`、orange `#fdf5e8/#d4ae7a`

**版面高度：** 4 節點約 430px，720p 螢幕充裕
**實作注意：** side-card 必須用 position:absolute（相對 step-row），不可改為 flex item，否則箭頭無法對齊中心

---

### compare-pairs
**用途：** 3–5 組水平對照列：左欄問題/障礙 → 右欄解法/對比，底部全寬洞察橫幅
**別名：** 心理障礙卡 / problem-solution / 左右對應 / before-after
**視覺 demo：** `compare-pairs.html`

**HTML 骨架：**
```html
<div class="compare-list">                   <!-- flex-direction:column; gap -->
  <div class="compare-row">                  <!-- display:flex; position:relative -->
    <div class="card problem">問題文字</div>
    <!-- ::after content:'→' 絕對定位置中，不是 flex item -->
    <div class="card solution">解法文字</div>
  </div>
  <!-- 重複 compare-row × N -->
  <div class="summary">底部全寬洞察橫幅</div>
</div>
```

**關鍵 CSS：**
- `.compare-row` → `display:flex; align-items:center; position:relative`
- `.compare-row::after` → `content:'→'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); pointer-events:none`
- `.card` → `flex:1`（兩欄永遠等寬）
- problem 背景 `#feeceb`，title `#732222`；solution 背景 `#e6f6ef`，title `#0e5b41`
- `.summary` → accent 底色全寬橫幅

**版面高度：** 5 組 + summary 約 520px，720p 略緊；建議 4 組以內
**實作注意：** 箭頭必須用 `::after` 偽元素（position:absolute），不可插入實體元素，否則破壞兩欄等寬

---

### flowchart-horizontal
**用途：** 3–6 個線性步驟水平排列，圓圈編號節點，水平連接線，節點下方標題與說明
**別名：** 水平流程 / 步驟流程圖 / 4-step flow / 操作步驟
**視覺 demo：** `flowchart-horizontal.html`

**HTML 骨架：**
```html
<div class="flow">                           <!-- display:flex -->
  <div class="node">                         <!-- flex:1; position:relative -->
    <div class="circle">1</div>              <!-- 圓圈，z-index:1 蓋過連線 -->
    <div class="node-title">步驟標題</div>
    <div class="node-desc">步驟說明</div>
  </div>
  <!-- .node:not(:last-child)::after 為連接線 -->
</div>
```

**關鍵 CSS：**
- `.node` → `flex:1; position:relative`
- `.node:not(:last-child)::after` → `position:absolute; top:19px; left:calc(50%+22px); right:calc(-50%+22px); height:2px; background:border色`（top 對齊圓圈中心）
- `.circle` → `position:relative; z-index:1`（蓋過連線）
- Hover 效果：`.node:hover .circle { background:accent; color:white }`

**版面高度：** 單行約 200px，版面非常充裕

---

### ng-ok-split
**用途：** 左欄虛線框（反例/錯誤）+ 右欄實線框（正確做法），各含標籤、prompt 框、說明
**別名：** NG vs OK / 反例正例 / 雙面板對比 / 不夠清楚 vs 這樣說才對
**視覺 demo：** `ng-ok-split.html`

**HTML 骨架：**
```html
<div class="split-layout">                  <!-- display:grid; grid-template-columns:1fr 1fr -->
  <div class="panel ng">                    <!-- border:2px dashed; 淡紅底 -->
    <div class="tag ng">✕ 不夠清楚</div>
    <div class="prompt-box">反例文字</div>
    <div class="desc ng">說明為何不好</div>
  </div>
  <div class="panel ok">                    <!-- border:2px solid accent; accent-subtle 底 -->
    <div class="tag ok">✓ 這樣說才對</div>
    <div class="prompt-box">正例文字</div>
    <div class="desc ok">說明優點或條列</div>
  </div>
</div>
```

**關鍵 CSS：**
- `.panel.ng` → `border:2px dashed #e5a598; background:#fdf5f3`
- `.panel.ok` → `border:2px solid var(--accent); background:var(--accent-subtle)`
- `.prompt-box` → `font-family:monospace; background:rgba(255,255,255,0.6)`（讓底色透出）

**版面高度：** 約 320–380px，版面充裕

---

### timeline-dual
**用途：** 兩條並行垂直時間線，各有欄標題，每條 3–5 個步驟（dot + line + 標籤 + 說明）
**別名：** 雙欄時間線 / 學習路線 / two-path / 並行路徑 / 雙軌計劃
**視覺 demo：** `timeline-dual.html`

**HTML 骨架：**
```html
<div class="dual-layout">                   <!-- display:grid; grid-template-columns:1fr 1fr -->
  <div>
    <div class="col-title">欄標題</div>     <!-- border-bottom:2px solid accent -->
    <div class="steps">
      <div class="step">                    <!-- display:flex; gap -->
        <div class="step-left">            <!-- flex-direction:column; align-items:center -->
          <div class="dot"></div>           <!-- accent色邊框圓點 -->
          <div class="line"></div>          <!-- flex:1 垂直線；最後一步不放 -->
        </div>
        <div class="step-body">
          <div class="step-lbl">Day 1</div>
          <div class="step-text">說明</div>
        </div>
      </div>
    </div>
  </div>
  <!-- 第二欄同結構 -->
</div>
```

**關鍵 CSS：**
- `.line` → `flex:1; min-height:28px`（自動填充步驟間距）
- 最後一步的 `.step-left` 只放 `.dot`，不放 `.line`
- `.col-title` → `border-bottom:2px solid var(--accent)`（accent 底線區分欄）

**版面高度：** 每欄 3 步驟約 260px，版面充裕；5 步驟仍在 500px 以內

---

### vs-duel
**用途：** 兩張等寬大卡片並排，中央懸浮圓形 VS 徽章，各卡片含標題、條列說明、底部結論框
**別名：** 傳統 vs 新方法 / A vs B 選擇 / before-after 大卡片 / 戲劇性對決 / 選哪個
**視覺 demo：** `vs-duel.html`

**HTML 骨架：**
```html
<div class="cards-wrapper">             <!-- display:flex; gap:60px; position:relative -->
  <div class="card card-neg">           <!-- 負面/舊方法卡片：淡紅底 + 紅邊框 -->
    <div class="card-header">❌ 標題</div>
    <div class="card-intro">說明引言</div>
    <ul class="content-list">
      <li>條列項目 × 3–5</li>
    </ul>
    <div class="bottom-box">結論文字</div>
  </div>
  <div class="vs-badge">VS</div>        <!-- position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); 圓形徽章 -->
  <div class="card card-pos">           <!-- 正面/新方法卡片：淡綠底 + 綠邊框 -->
    <div class="card-header">✓ 標題</div>
    <div class="card-intro">說明引言</div>
    <ul class="content-list">
      <li>條列項目 × 3–5</li>
    </ul>
    <div class="bottom-box">結論文字</div>
  </div>
</div>
```

**關鍵 CSS：**
- `.cards-wrapper` → `display:flex; gap:60px; position:relative`（VS badge 定位基準，不可省 `position:relative`）
- `.vs-badge` → `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); border-radius:50%; z-index:10`
- `.card` → `flex:1`（兩卡永遠等寬）+ `display:flex; flex-direction:column`（讓 bottom-box 推到底）
- `.content-list` → `flex-grow:1; margin-bottom:20px`（撐開空間把 bottom-box 推至底部）
- `.bottom-box` → `border:1px dashed; border-radius:8px`（虛線框區別於卡片邊框）
- 負面色：背景 `#fdf3f1`、邊框/標題/結論 `#c44b4b`/`#d7a299`；正面色：背景 `#e6f6ef`、邊框/標題/結論 `#0d6e52`/`#84bba0`
- RWD：`@media (max-width:768px)` → `flex-direction:column`，`.vs-badge` 加 `rotate(90deg)`

**版面高度：** 4 條列項目約 360px，720p 螢幕充裕
**與 ng-ok-split 差異：** ng-ok-split 用 grid、內含 monospace 文字框，適合程式碼/prompt 對比；vs-duel 著重「大 vs 大」視覺衝擊，適合方法論、路徑選擇等高層次對比
**實作注意：** VS badge 必須用 `position:absolute`（相對 `.cards-wrapper`），若改為 flex item 會破壞兩卡等寬

---

### stat-grid
**用途：** 2×3 或 2×2 數字卡片格，每張卡片大數字（accent 色）+ 單位標籤
**別名：** 數字儀表板 / numbers dashboard / KPI cards / 數據亮點
**視覺 demo：** `stat-grid.html`

**HTML 骨架：**
```html
<div class="grid">                          <!-- display:grid; repeat(3,1fr) × repeat(2,1fr) -->
  <div class="card">
    <div class="num">2.5 年</div>           <!-- 大字號，serif，accent色 -->
    <div class="unit">AI 編程實戰積累</div> <!-- 小字，uppercase，muted色 -->
  </div>
  <!-- 重複 × 6（或 4） -->
</div>
```

**關鍵 CSS：**
- `.grid` → `grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(2,1fr)`
- `.num` → `font-family:serif; font-size:clamp(1.6rem,3.2vw,2.8rem); color:var(--accent)`
- `.unit` → `text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted)`
- `.card` → `border-radius:14px; background:var(--bg-card); box-shadow:淡陰影`

**版面高度：** 2×3 格約 260px，版面非常充裕

---

### warm-card-pattern
**用途：** 3–5 張暖色資訊卡垂直堆疊，左側編號徽章，右側可放手繪感圖示或流程圖解
**別名：** stacked info cards / numbered steps / 教學步驟卡 / methodology stack
**視覺 demo：** `warm-card-pattern.html`

**HTML 骨架：**
```html
<div class="warm-stack">
  <div class="warm-card">
    <div class="warm-badge">01</div>
    <div class="warm-copy">
      <div class="warm-card-title">技能可重用</div>
      <div class="warm-card-desc">把常用流程變成可呼叫工具</div>
    </div>
    <div class="warm-icon">inline SVG</div>
  </div>
  <div class="warm-connector"></div>
</div>
```

**關鍵 CSS：**
- `.warm-stack` → `display:flex; flex-direction:column; gap:18px`
- `.warm-card` → `display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:28px`
- `.warm-badge` → 實心圓形徽章，尺寸用 CSS 變數控制（預設卡片高度 28%）
- `.warm-connector` → 細線或箭頭，預設使用單一路徑向下引導
- `.warm-card::before/::after` 或頁面層裝飾 → 角落點陣、大圓弧背景、淡陰影卡片

**版面高度：** 3 張卡片在 720p 內安全，4–5 張需縮減 padding 或改為兩欄
**實作注意：** 色彩優先吃 theme token，不要把暖橘色硬寫死；若 theme 不是 `warm`，保留布局但讓 accent / card / text 走主題變數
