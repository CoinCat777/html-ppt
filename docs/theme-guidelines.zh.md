# html-ppt 主題規格指南

## 目的

本文件定義 html-ppt skill 的主題資料來源、色彩 token、dark mode 策略與預覽規格。主題資料以 [`config/themes.json`](../config/themes.json) 為唯一來源，`themes.index.json` 為快速選單索引。

## 主題清單

1. `business`：亮底香檳金，偏董事會與提案風格。
2. `light-tech`：亮底科技青，偏產品、AI、數據簡報。
3. `warm-minimal`：暖白 editorial，人文極簡。
4. `brand-warm`：Claude 調性延伸，奶油米與磚橘。

## Token 規範

每個主題都必須提供：

- `tokens.light`
- `tokens.dark`
- `fonts`
- `ui`
- `preview`

核心 token：

- `bg_main`
- `bg_card`
- `bg_subtle`
- `text_primary`
- `text_secondary`
- `text_muted`
- `accent`
- `accent_soft`
- `accent_strong`
- `border`
- `divider`
- `toc_active_bg`
- `toc_active_border`
- `progress_track`
- `progress_fill`
- `shadow`
- `card_radius`

字體欄位：

- `font_heading_zh`
- `font_body_zh`
- `font_heading_en`
- `font_body_en`
- `font_fallback`

UI 欄位：

- `progress_height`
- `progress_radius`
- `toc_radius`
- `toc_border_width`
- `card_padding`
- `slide_pad_x`
- `slide_pad_y`

## Light / Dark 原則

- 預設輸出為 light mode。
- dark mode 為使用者可切換的輔助模式，不直接沿用 light 色票反相。
- `text_primary` 對 `bg_main`、`bg_card` 應至少維持 4.5:1 的基本可讀性。
- `accent` 在 dark mode 可提升亮度，但避免高飽和刺眼。

`theme-loader.js` 會以 `data-theme-mode="light|dark"` 注入對應變數。

## 預覽圖規格

預覽檔位於 [`references/previews/`](../references/previews/)。

每張預覽固定包含：

- 中文主題名
- 英文主題名
- 主色 / 卡片色 / 背景色
- 一個 icon
- 一段中英文文案示意
- 一個 KPI 區塊

預覽由 [`scripts/generate-theme-previews.js`](../scripts/generate-theme-previews.js) 產生：

- 先輸出 SVG
- 再透過 headless browser 轉成 PNG
- HTML 僅用於暫存截圖，不保留到 repo

## Skill 使用規範

Phase 1 請優先讀取 [`config/themes.index.json`](../config/themes.index.json)，用數字方式提供主題選單：

- `1 Business`
- `2 Light Tech`
- `3 Warm Minimal`
- `4 Brand Warm`

若使用者輸入舊名稱，允許以下 alias：

- `tech` → `light-tech`
- `minimal` → `warm-minimal`
- `warm` → `brand-warm`

## 新增主題流程

1. 在 `config/themes.json` 新增完整 theme entry。
2. 執行 `node scripts/generate-themes-index.js`。
3. 執行 `node scripts/generate-theme-previews.js`。
4. 執行 `node scripts/validate-themes.js`。
5. 補充英文與繁體說明。
6. 視需要新增對應 CSS 快照至 `assets/theme-[name].css`。
