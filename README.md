# html-ppt — 互動式單頁網頁報告 Skill

> 將任何素材（文字、文件、條列資料）轉化為具備鍵盤翻頁、底部進度條、左側目錄的互動式 HTML 簡報。

---

## 功能概覽

- **單一 HTML 輸出**：所有 CSS / JS inline，無需伺服器，直接瀏覽器開啟
- **Reveal.js 驅動**：鍵盤 `← →` 切換、滑鼠點擊、ESC 總覽 + 滾輪
- **左側 Hover TOC**：滑鼠移到左邊緣即展開目錄，點擊跳頁
- **底部進度條**：即時顯示閱讀進度
- **4 種視覺主題**：business / light-tech / warm-minimal / brand-warm
- **8 種圖解 Pattern**：內建結構圖模板，分鏡規劃時直接指定使用
- **Pattern metadata**：每個 pattern 另有 JSON metadata，可供驗證與後續擴充
- **Theme registry**：主題顏色、字體、dark mode 與預覽集中在 `config/themes.json`

---

## 觸發方式

在 Claude Code 中提到以下任一關鍵詞即自動觸發：

> 「互動網頁」「HTML 報告」「一頁式網頁」「投影片網頁」「網頁簡報」「html ppt」「把這個做成網頁」「轉成互動式報告」

---

## 4 種視覺主題

| 主題 | 配色 | 適合場景 |
|------|------|---------|
| **business** | 亮底 / 香檳金 | 企業報告、商業提案、董事會簡報 |
| **light-tech** | 冷白底 / 科技青 | AI、產品說明、數據展示 |
| **warm-minimal** | 暖白底 / 深碳黑 | 品牌內容、設計、閱讀型簡報 |
| **brand-warm** | 奶油米底 / 磚橘 | 教育、品牌故事、溫暖專業感 |


---

## 8 種圖解 Pattern

| Pattern | 用途 | 別名 |
|---------|------|------|
| `flowchart-vertical` | 3–6 步驟垂直循環圖，左側回饋線 | PDCA / loop diagram |
| `flowchart-horizontal` | 3–6 步驟水平流程圖，圓圈編號節點 | 4-step flow / 操作步驟 |
| `compare-pairs` | 3–5 組水平對照列，左欄問題→右欄解法 | problem-solution / before-after |
| `ng-ok-split` | 左虛線反例 + 右實線正例雙面板 | NG vs OK / 錯誤 vs 正確 |
| `timeline-dual` | 兩條並行垂直時間線 | 學習路線 / two-path |
| `stat-grid` | 2×3 或 2×2 數字 KPI 卡片格 | numbers dashboard / 數據亮點 |
| `vs-duel` | 兩張大卡片 + 中央 VS 徽章對決 | 傳統 vs 新方法 / A vs B |
| `warm-card-pattern` | 暖色編號卡片堆疊，適合教學步驟與方法拆解 | stacked info cards / numbered steps |

Pattern 視覺 Demo 見 [`references/patternindex.html`](references/patternindex.html)。
Pattern metadata 與驗證規格見 [`references/patterns/README.md`](references/patterns/README.md)。

主題預覽圖與選單索引見：

- [`config/themes.index.json`](config/themes.index.json)
- [`references/previews/`](references/previews/)

---

## 目錄結構

```
html-ppt/
├── SKILL.md                  # Skill 主指令（Claude 讀取）
├── config/
│   ├── themes.json           # 主題 registry（唯一來源）
│   └── themes.index.json     # 輕量選單索引
├── assets/
│   ├── theme-business.css
│   ├── theme-light-tech.css
│   ├── theme-warm-minimal.css
│   ├── theme-brand-warm.css
│   ├── theme-tech.css        # legacy alias -> light-tech
│   ├── theme-minimal.css     # legacy alias -> warm-minimal
│   └── theme-warm.css        # legacy alias -> brand-warm
├── docs/
│   ├── theme-guidelines.zh.md
│   ├── theme-guidelines.en.md
│   └── CONTRIBUTING_THEMES.md
├── references/
│   ├── patternindex.html     # Pattern 索引（視覺 Demo 入口）
│   ├── layouts.md            # Pattern 結構速查表（CSS 關鍵規則）
│   ├── previews/             # 主題預覽圖（SVG / PNG）
│   ├── flowchart-vertical.html
│   ├── flowchart-horizontal.html
│   ├── compare-pairs.html
│   ├── ng-ok-split.html
│   ├── timeline-dual.html
│   ├── stat-grid.html
│   ├── vs-duel.html
│   ├── warm-card-pattern.html
│   └── patterns/
│       ├── index.json
│       ├── pattern.schema.json
│       ├── README.md
│       └── *.json
├── scripts/
│   ├── validate-patterns.js
│   ├── validate-themes.js
│   ├── generate-themes-index.js
│   ├── generate-theme-previews.js
│   └── theme-loader.js
└── evals/
    └── evals.json            # 測試案例
```

---

## 工作流程

```
Phase 1：分析素材 → 用數字選主題 → 讀取 `themes.index.json` → 輸出 storyboard.md → 等待確認
Phase 2：確認後 → 產出 index.html
```

**Phase 1 完成後會暫停**，讓你確認分頁規劃和內容再開始 coding。預設使用 bright mode，偵測瀏覽器為 dark mode 可自動切換 dark mode。

---

## 安裝方式

將整個 `html-ppt/` 資料夾放入 Claude Code 的 skills 目錄：

**Mac / Linux**
```bash
~/.claude/skills/html-ppt/
```

**Windows**
```
C:\Users\<你的帳號>\.claude\skills\html-ppt\
```

---

## License

MIT
