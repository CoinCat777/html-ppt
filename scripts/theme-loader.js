#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "config", "themes.json");
const indexPath = path.join(root, "config", "themes.index.json");

const fontImports = {
  "Noto Serif TC": "family=Noto+Serif+TC:wght@400;600;700",
  "Noto Sans TC": "family=Noto+Sans+TC:wght@300;400;500;700",
  "Playfair Display": "family=Playfair+Display:wght@500;600;700;800",
  "Montserrat": "family=Montserrat:wght@400;500;600;700",
  "Space Grotesk": "family=Space+Grotesk:wght@400;500;700",
  "Cormorant Garamond": "family=Cormorant+Garamond:wght@400;500;600;700",
  "Lora": "family=Lora:wght@400;500;600;700",
  "DM Sans": "family=DM+Sans:wght@400;500;700"
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadRegistry() {
  return readJson(registryPath);
}

function loadThemeIndex() {
  return readJson(indexPath);
}

function normalizeThemeSelection(selection) {
  const registry = loadRegistry();
  const index = loadThemeIndex();
  if (typeof selection === "number" || /^[1-9]\d*$/.test(String(selection || ""))) {
    const match = index.find((item) => item.id === Number(selection));
    return match ? match.key : null;
  }

  const input = String(selection || "").trim().toLowerCase();
  for (const theme of registry.themes) {
    if (theme.id === input) return theme.id;
    if ((theme.metadata?.legacyAliases || []).includes(input)) return theme.id;
  }
  return null;
}

function getTheme(selection) {
  const registry = loadRegistry();
  const resolvedId = normalizeThemeSelection(selection) || registry.defaultTheme;
  return registry.themes.find((item) => item.id === resolvedId) || registry.themes[0];
}

function toKebab(input) {
  return input.replace(/_/g, "-");
}

function collectFontImportUrl(theme) {
  const families = [
    theme.fonts.font_heading_zh,
    theme.fonts.font_body_zh,
    theme.fonts.font_heading_en,
    theme.fonts.font_body_en
  ]
    .filter(Boolean)
    .map((family) => fontImports[family])
    .filter(Boolean);

  if (!families.length) return null;
  const unique = [...new Set(families)];
  return `https://fonts.googleapis.com/css2?${unique.join("&")}&display=swap`;
}

function buildVariableBlock(selector, tokens, fonts, ui) {
  const lines = [];
  for (const [key, value] of Object.entries(tokens)) {
    lines.push(`  --${toKebab(key)}: ${value};`);
  }
  lines.push(`  --font-heading-zh: '${fonts.font_heading_zh}', ${fonts.font_fallback};`);
  lines.push(`  --font-body-zh: '${fonts.font_body_zh}', ${fonts.font_fallback};`);
  lines.push(`  --font-heading-en: '${fonts.font_heading_en}', ${fonts.font_fallback};`);
  lines.push(`  --font-body-en: '${fonts.font_body_en}', ${fonts.font_fallback};`);
  lines.push(`  --font-heading: var(--font-heading-zh);`);
  lines.push(`  --font-body: var(--font-body-zh);`);
  for (const [key, value] of Object.entries(ui)) {
    lines.push(`  --${toKebab(key)}: ${value};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function buildSharedThemeCss() {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  transition: background 220ms ease, color 220ms ease;
}

.reveal, .reveal .slides {
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.reveal .slides > section {
  padding: var(--slide-pad-y) var(--slide-pad-x);
}

h1, h2, h3, .display-title, .cover-title, .slide-title {
  font-family: var(--font-heading);
}

h1, .slide-title {
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.03em;
}

h2, .slide-subtitle {
  color: var(--text-secondary);
}

.accent, .label, .eyebrow, .theme-number, .stat-number {
  color: var(--accent);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  box-shadow: 0 12px 32px var(--shadow);
  padding: var(--card-padding);
}

.accent-bar {
  display: block;
  width: 40px;
  height: 3px;
  background: var(--accent);
  border-radius: 999px;
  margin: 0.75rem 0 1.25rem;
}

.stat-number {
  font-family: var(--font-heading-en);
  font-weight: 700;
  letter-spacing: -0.03em;
}

#progress-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--progress-height);
  z-index: 100;
  background: var(--progress-track);
}

#progress-bar {
  height: 100%;
  width: 0%;
  background: var(--progress-fill);
  border-radius: var(--progress-radius);
  transition: width 180ms ease;
}

#toc-drawer {
  background: var(--bg-card);
  border-right: var(--toc-border-width) solid var(--border);
}

.toc-item {
  color: var(--text-secondary);
  border-left: var(--toc-border-width) solid transparent;
  border-radius: var(--toc-radius);
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.toc-item:hover,
.toc-item.active {
  color: var(--text-primary);
  background: var(--toc-active-bg);
  border-left-color: var(--toc-active-border);
}

.theme-mode-toggle {
  position: fixed;
  right: 18px;
  top: 18px;
  z-index: 220;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font: 500 0.84rem/1 var(--font-body);
}
`.trim();
}

function buildThemeCss(theme) {
  const importUrl = collectFontImportUrl(theme);
  const lightBlock = buildVariableBlock(":root, html[data-theme-mode='light'], body[data-theme-mode='light']", theme.tokens.light, theme.fonts, theme.ui);
  const darkBlock = buildVariableBlock("html[data-theme-mode='dark'], body[data-theme-mode='dark']", theme.tokens.dark, theme.fonts, theme.ui);
  const imports = importUrl ? `@import url('${importUrl}');\n\n` : "";
  return `${imports}${lightBlock}\n\n${darkBlock}\n\n${buildSharedThemeCss()}\n`;
}

function injectThemeCss(selection, options = {}) {
  const theme = getTheme(selection);
  const css = buildThemeCss(theme);
  const mode = options.mode || loadRegistry().defaultMode || "light";
  return {
    theme,
    mode,
    css,
    script: `
(function () {
  var root = document.documentElement;
  if (!root.getAttribute('data-theme-mode')) {
    root.setAttribute('data-theme-mode', '${mode}');
  }
  window.__HTML_PPT_THEME__ = '${theme.id}';
  window.toggleThemeMode = function () {
    var nextMode = root.getAttribute('data-theme-mode') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme-mode', nextMode);
    return nextMode;
  };
})();
`.trim()
  };
}

module.exports = {
  buildThemeCss,
  getTheme,
  injectThemeCss,
  loadRegistry,
  loadThemeIndex,
  normalizeThemeSelection
};

if (require.main === module) {
  const selection = process.argv[2] || "1";
  const output = injectThemeCss(selection);
  process.stdout.write(output.css);
}
