#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "config", "themes.json");
const previewsDir = path.join(root, "references", "previews");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "html-ppt-theme-preview-"));

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function detectBrowser() {
  const candidates = [
    process.env.HTML_PPT_PREVIEW_BROWSER,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function charWeight(char) {
  return /[^\u0000-\u00ff]/.test(char) ? 2 : 1;
}

function wrapText(input, maxUnits) {
  const source = String(input || "").trim();
  if (!source) return [];

  if (/\s/.test(source)) {
    const tokens = source.split(/(\s+)/).filter(Boolean);
    const lines = [];
    let current = "";
    let units = 0;

    for (const token of tokens) {
      const width = [...token].reduce((sum, char) => sum + charWeight(char), 0);
      if (current && units + width > maxUnits) {
        lines.push(current.trim());
        current = token.trimStart();
        units = [...current].reduce((sum, char) => sum + charWeight(char), 0);
        continue;
      }
      current += token;
      units += width;
    }

    if (current.trim()) lines.push(current.trim());
    return lines;
  }

  const lines = [];
  let current = "";
  let units = 0;

  for (const char of source) {
    const width = charWeight(char);
    if (current && units + width > maxUnits) {
      lines.push(current.trim());
      current = char;
      units = width;
      continue;
    }
    current += char;
    units += width;
  }

  if (current.trim()) lines.push(current.trim());
  return lines;
}

function buildTextBlock({ x, y, lines, color, fontSize, fontFamily, fontWeight = 400, fontStyle = "normal", lineHeight = 1.35 }) {
  if (!lines.length) return "";
  const step = Math.round(fontSize * lineHeight);
  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : step}">${escapeHtml(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}" font-style="${fontStyle}">${tspans}</text>`;
}

function buildIcon(themeId, accent) {
  if (themeId === "business") {
    return `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="32" height="24" rx="6" stroke="${accent}" stroke-width="2"/>
      <path d="M15 10V7C15 5.9 15.9 5 17 5H25C26.1 5 27 5.9 27 7V10" stroke="${accent}" stroke-width="2"/>
      <path d="M5 18H37" stroke="${accent}" stroke-width="2"/>
    </svg>`;
  }
  if (themeId === "light-tech") {
    return `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="28" height="28" rx="7" stroke="${accent}" stroke-width="2"/>
      <path d="M21 12V30M12 21H30" stroke="${accent}" stroke-width="2"/>
      <circle cx="21" cy="21" r="5" fill="${accent}" opacity="0.18"/>
    </svg>`;
  }
  if (themeId === "warm-minimal") {
    return `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 29C14 22 18 18 21 18C24 18 28 22 32 29" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="21" cy="15" r="4" stroke="${accent}" stroke-width="2"/>
      <path d="M8 33H34" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 31C10 22 15 11 21 11C27 11 32 22 32 31" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 25C18 22 24 22 28 25" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="21" cy="13" r="2.5" fill="${accent}"/>
  </svg>`;
}

function buildSvg(theme, mode) {
  const tokens = theme.tokens[mode];
  const fonts = theme.fonts;
  const fontHeading = escapeHtml(fonts.font_heading_en);
  const fontBody = escapeHtml(fonts.font_body_en);
  const zhName = escapeHtml(theme.displayName.zh);
  const enName = escapeHtml(theme.displayName.en);
  const icon = buildIcon(theme.id, tokens.accent);
  const voiceZhLines = wrapText("清晰的資訊節奏，保留設計感與閱讀舒適度", 24).slice(0, 2);
  const voiceEnLines = wrapText("Clear structure, calm contrast, and a sharp visual identity", 34).slice(0, 2);
  const descZhLines = wrapText(theme.description.zh, 20).slice(0, 2);
  const descEnLines = wrapText(theme.description.en, 30).slice(0, 2);
  const modeLabel = mode === "dark" ? "Dark Variant" : "Light Default";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="760" viewBox="0 0 1200 760" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGlow-${theme.id}" x1="180" y1="80" x2="1020" y2="700" gradientUnits="userSpaceOnUse">
      <stop stop-color="${tokens.accent_soft}"/>
      <stop offset="1" stop-color="${tokens.bg_main}"/>
    </linearGradient>
    <filter id="shadow-${theme.id}" x="0" y="0" width="1200" height="760" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="${tokens.shadow}" />
    </filter>
  </defs>
  <rect width="1200" height="760" rx="32" fill="${tokens.bg_main}"/>
  <rect x="40" y="40" width="1120" height="680" rx="28" fill="url(#bgGlow-${theme.id})"/>
  <rect x="82" y="92" width="688" height="576" rx="28" fill="${tokens.bg_card}" filter="url(#shadow-${theme.id})"/>
  <rect x="806" y="92" width="312" height="264" rx="28" fill="${tokens.bg_card}" filter="url(#shadow-${theme.id})"/>
  <rect x="806" y="388" width="312" height="280" rx="28" fill="${tokens.bg_card}" filter="url(#shadow-${theme.id})"/>
  <rect x="82" y="92" width="688" height="10" rx="5" fill="${tokens.progress_track}"/>
  <rect x="82" y="92" width="352" height="10" rx="5" fill="${tokens.progress_fill}"/>
  <text x="130" y="150" fill="${tokens.accent}" font-size="20" font-family="${fontBody}" font-weight="700" letter-spacing="2">0${theme.order}</text>
  <text x="198" y="150" fill="${tokens.text_secondary}" font-size="18" font-family="${fontBody}" font-weight="600">${modeLabel}</text>
  <text x="130" y="206" fill="${tokens.text_primary}" font-size="50" font-family="${fontHeading}" font-weight="700">${zhName}</text>
  <text x="130" y="252" fill="${tokens.text_secondary}" font-size="28" font-family="${fontHeading}" font-style="italic">${enName}</text>
  <text x="130" y="318" fill="${tokens.text_primary}" font-size="24" font-family="${fontBody}" font-weight="600">品牌語氣 / Theme Voice</text>
  ${buildTextBlock({ x: 130, y: 356, lines: voiceZhLines, color: tokens.text_secondary, fontSize: 21, fontFamily: fontBody, lineHeight: 1.34 })}
  ${buildTextBlock({ x: 130, y: 412, lines: voiceEnLines, color: tokens.text_secondary, fontSize: 20, fontFamily: fontBody, lineHeight: 1.28 })}
  <rect x="130" y="458" width="184" height="132" rx="22" fill="${tokens.bg_subtle}" stroke="${tokens.border}"/>
  <text x="156" y="512" fill="${tokens.text_secondary}" font-size="18" font-family="${fontBody}" font-weight="700">KPI</text>
  <text x="156" y="564" fill="${tokens.accent}" font-size="52" font-family="${fontHeading}" font-weight="700">84%</text>
  <text x="156" y="598" fill="${tokens.text_secondary}" font-size="19" font-family="${fontBody}">Audience retention</text>
  <rect x="340" y="458" width="322" height="132" rx="22" fill="${tokens.bg_subtle}" stroke="${tokens.border}"/>
  <text x="368" y="512" fill="${tokens.text_primary}" font-size="20" font-family="${fontBody}" font-weight="700">Primary / Card / Accent</text>
  <rect x="368" y="548" width="72" height="18" rx="9" fill="${tokens.bg_main}" stroke="${tokens.border}"/>
  <rect x="456" y="548" width="72" height="18" rx="9" fill="${tokens.bg_card}" stroke="${tokens.border}"/>
  <rect x="544" y="548" width="72" height="18" rx="9" fill="${tokens.accent}" />
  ${buildTextBlock({ x: 368, y: 578, lines: descEnLines, color: tokens.text_secondary, fontSize: 16, fontFamily: fontBody, lineHeight: 1.18 })}
  <text x="840" y="150" fill="${tokens.text_secondary}" font-size="19" font-family="${fontBody}" font-weight="700">Icon / Accent</text>
  <g transform="translate(836 186)">${icon}</g>
  <text x="836" y="320" fill="${tokens.text_secondary}" font-size="19" font-family="${fontBody}" font-weight="700">Typography Pairing</text>
  <text x="836" y="358" fill="${tokens.text_primary}" font-size="24" font-family="${fontHeading}" font-weight="700">${escapeHtml(fonts.font_heading_en)}</text>
  <text x="836" y="392" fill="${tokens.text_secondary}" font-size="20" font-family="${fontBody}">${escapeHtml(fonts.font_body_en)}</text>
  <text x="836" y="450" fill="${tokens.text_secondary}" font-size="19" font-family="${fontBody}" font-weight="700">Mood</text>
  <text x="836" y="486" fill="${tokens.text_primary}" font-size="22" font-family="${fontBody}" font-weight="700">${zhName}</text>
  ${buildTextBlock({ x: 836, y: 522, lines: descZhLines, color: tokens.text_secondary, fontSize: 17, fontFamily: fontBody, lineHeight: 1.22 })}
  <rect x="836" y="582" width="224" height="8" rx="4" fill="${tokens.progress_track}"/>
  <rect x="836" y="582" width="126" height="8" rx="4" fill="${tokens.progress_fill}"/>
  <text x="836" y="624" fill="${tokens.accent}" font-size="16" font-family="${fontBody}" font-weight="700">Preview / Auto Generated</text>
</svg>`;
}

function renderPng(browserPath, svgPath, pngPath) {
  const htmlPath = path.join(tempDir, `${path.basename(svgPath, ".svg")}.html`);
  const svgUrl = `file:///${svgPath.replace(/\\/g, "/")}`;
  fs.writeFileSync(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff;}img{display:block;width:1200px;height:760px;}</style></head><body><img src="${svgUrl}" alt=""></body></html>`,
    "utf8"
  );
  execFileSync(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      `--screenshot=${pngPath}`,
      "--window-size=1200,760",
      htmlPath
    ],
    { stdio: "ignore" }
  );
}

function main() {
  ensureDir(previewsDir);
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const browserPath = detectBrowser();

  for (const theme of registry.themes) {
    for (const mode of ["light", "dark"]) {
      const suffix = mode === "dark" ? "-dark-preview" : "-preview";
      const svgPath = path.join(previewsDir, `${theme.id}${suffix}.svg`);
      const pngPath = path.join(previewsDir, `${theme.id}${suffix}.png`);
      fs.writeFileSync(svgPath, buildSvg(theme, mode), "utf8");
      if (browserPath) {
        renderPng(browserPath, svgPath, pngPath);
      } else {
        console.warn(`Browser not found. SVG generated only for ${theme.id} (${mode}).`);
      }
    }
  }

  console.log(`Generated previews in ${path.relative(root, previewsDir)}`);
}

main();
