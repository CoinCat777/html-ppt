# html-ppt 轉場動畫參考

共 10 種：Reveal.js 內建 6 種 + 自訂 4 種。

---

## Reveal.js 內建 6 種（直接使用，無需額外 CSS）

在 `Reveal.initialize({ transition: '...' })` 設全域預設，或在個別 `<section data-transition="...">` 覆蓋單頁。

| 值 | 效果 |
|----|------|
| `none` | 瞬間切換，無動畫 |
| `fade` | 淡入淡出（推薦預設）|
| `slide` | 水平滑動（前進←左，後退→右）|
| `convex` | 凸面角度滑動 |
| `concave` | 凹面角度滑動 |
| `zoom` | 新頁從畫面中央放大出現 |

**進出分開設定（-in / -out 修飾語）：**
```html
<!-- 進場 fade，出場 slide -->
<section data-transition="fade-in slide-out">...</section>
```

---

## 自訂 4 種（需將對應 CSS snippet inline 進 `<style>`）

使用方式：把下方 CSS 貼進 `<style>`，section 加上 `data-transition="flip"`（或其他名稱）。

---

### flip — Y 軸翻轉

```css
@keyframes kf-flip-in {
  from { transform: perspective(1000px) rotateY(90deg); opacity: 0; }
  to   { transform: perspective(1000px) rotateY(0deg);  opacity: 1; }
}
@keyframes kf-flip-out {
  from { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
  to   { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
}
.reveal .slides section[data-transition="flip"].present {
  animation: kf-flip-in 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
}
.reveal .slides section[data-transition="flip"].past,
.reveal .slides section[data-transition="flip"].future {
  animation: kf-flip-out 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
}
```

---

### reveal — 簾幕橫向揭開（從左到右展開）

```css
@keyframes kf-reveal-in {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0%   0 0); }
}
@keyframes kf-reveal-out {
  from { clip-path: inset(0 0%   0 0); }
  to   { clip-path: inset(0 0% 0 100%); }
}
.reveal .slides section[data-transition="reveal"].present {
  animation: kf-reveal-in 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
}
.reveal .slides section[data-transition="reveal"].past,
.reveal .slides section[data-transition="reveal"].future {
  animation: kf-reveal-out 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
}
```

---

### fly-in — 從上方飛入

```css
@keyframes kf-flyin-in {
  from { transform: translateY(-80px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes kf-flyin-out {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(80px); opacity: 0; }
}
.reveal .slides section[data-transition="fly-in"].present {
  animation: kf-flyin-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
}
.reveal .slides section[data-transition="fly-in"].past,
.reveal .slides section[data-transition="fly-in"].future {
  animation: kf-flyin-out 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
}
```

---

### split — 從中央上下撕開

```css
@keyframes kf-split-in {
  from { clip-path: inset(50% 0); }
  to   { clip-path: inset(0%  0); }
}
@keyframes kf-split-out {
  from { clip-path: inset(0%  0); }
  to   { clip-path: inset(50% 0); }
}
.reveal .slides section[data-transition="split"].present {
  animation: kf-split-in 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
}
.reveal .slides section[data-transition="split"].past,
.reveal .slides section[data-transition="split"].future {
  animation: kf-split-out 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
}
```

---

## 實作注意事項

- `clip-path` 動畫（reveal / split）需瀏覽器支援，Chrome / Edge / Firefox 現代版皆可
- 自訂轉場 CSS 放在 `<style>` 區塊的**最後**，避免被 Reveal.js 預設樣式覆蓋
- 若同一份 HTML 有多種自訂轉場，把所有用到的 snippet 一起貼入，不重複貼
