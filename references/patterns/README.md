# html-ppt Pattern Metadata

本資料夾提供 pattern 的機器可讀 metadata，目的不是把版型鎖死，而是提供：

- `index.json`：所有 pattern 的索引，供 validator、未來 UI、或 storyboard 檢查使用。
- `pattern.schema.json`：pattern metadata 的基本結構。
- `*.json`：各 pattern 的主題策略、預設值、可接受範圍與內容容量。

## 設計原則

- **HTML demo 仍是第一參考來源**：`references/[pattern].html`
- **JSON 只補充結構與預設**：讓 AI 可在安全範圍內彈性創作，不把所有細節寫死
- **顏色統一走 theme token**：pattern 優先吃主題 token，再視需要用 `overrides` 做小幅偏移

## 合併優先順序

生成 HTML 時，建議依下列順序合併樣式參數：

1. 使用者明確指定的 override
2. AI 當次回傳的 pattern 參數
3. `references/patterns/[pattern].json` 的 `defaults`
4. theme CSS 對應的 token（如 `--accent`, `--bg-card`, `--text-primary`）
5. renderer 的全域保底值

## Theme token 策略

每個 pattern 透過 `themeStrategy.tokens` 指定應使用的主題變數。例如：

```json
{
  "themeStrategy": {
    "mode": "theme-tokens",
    "tokens": {
      "pageBg": "bg-primary",
      "panelBg": "bg-card",
      "accent": "accent",
      "text": "text-primary",
      "muted": "text-secondary"
    }
  }
}
```

這代表 pattern 不直接要求固定色碼，而是吃目前主題對應的 CSS 變數。若某個 pattern 在某主題需要微調，可用：

```json
{
  "themeStrategy": {
    "overrides": {
      "warm": { "accent": "#c56a3a" }
    }
  }
}
```

## 驗證

可在 skill 根目錄執行：

```bash
node scripts/validate-patterns.js
```

驗證腳本會檢查：

- `index.json` 與 `patternindex.html` 的 pattern id 是否對齊
- 每個 `htmlDemo` 與 `schema` 檔案是否存在
- theme token 是否為合法 token 名稱
- 必要欄位是否缺漏
- 主要文字/背景對比是否達到最低要求

