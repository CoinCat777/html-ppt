#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "config", "themes.json");
const indexPath = path.join(root, "config", "themes.index.json");

const requiredTokenKeys = [
  "bg_main",
  "bg_card",
  "bg_subtle",
  "text_primary",
  "text_secondary",
  "text_muted",
  "accent",
  "accent_soft",
  "accent_strong",
  "border",
  "divider",
  "toc_active_bg",
  "toc_active_border",
  "progress_track",
  "progress_fill",
  "shadow",
  "card_radius"
];

const requiredFontKeys = [
  "font_heading_zh",
  "font_body_zh",
  "font_heading_en",
  "font_body_en",
  "font_fallback"
];

const requiredUiKeys = [
  "progress_height",
  "progress_radius",
  "toc_radius",
  "toc_border_width",
  "card_padding",
  "slide_pad_x",
  "slide_pad_y"
];

function fail(message, errors) {
  errors.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hexToRgb(hex) {
  const value = String(hex || "").replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function relativeLuminance({ r, g, b }) {
  const convert = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  const [rs, gs, bs] = [convert(r), convert(g), convert(b)];
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA, hexB) {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return null;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

const registry = readJson(registryPath);
const indexEntries = readJson(indexPath);
const errors = [];
const warnings = [];

if (!Array.isArray(registry.themes) || !registry.themes.length) {
  fail("themes.json must contain a non-empty themes array", errors);
}

for (const theme of registry.themes || []) {
  if (!theme.id) fail("theme.id is required", errors);
  if (typeof theme.order !== "number") fail(`${theme.id}: order must be numeric`, errors);
  if (!theme.preview) fail(`${theme.id}: preview path is required`, errors);

  for (const mode of ["light", "dark"]) {
    const tokenMap = theme.tokens?.[mode];
    if (!tokenMap) {
      fail(`${theme.id}: tokens.${mode} is required`, errors);
      continue;
    }
    for (const key of requiredTokenKeys) {
      if (!(key in tokenMap)) fail(`${theme.id}: tokens.${mode}.${key} is missing`, errors);
    }

    const bodyContrast = contrastRatio(tokenMap.bg_main, tokenMap.text_primary);
    const cardContrast = contrastRatio(tokenMap.bg_card, tokenMap.text_primary);
    if (bodyContrast !== null && bodyContrast < 4.5) {
      fail(`${theme.id}: tokens.${mode} body contrast ${bodyContrast.toFixed(2)} is below 4.5`, errors);
    }
    if (cardContrast !== null && cardContrast < 4.5) {
      fail(`${theme.id}: tokens.${mode} card contrast ${cardContrast.toFixed(2)} is below 4.5`, errors);
    }

    const accentContrast = contrastRatio(tokenMap.bg_main, tokenMap.accent);
    if (accentContrast !== null && accentContrast < 2.2) {
      warnings.push(`${theme.id}: tokens.${mode} accent contrast ${accentContrast.toFixed(2)} is low for small text`);
    }
  }

  for (const key of requiredFontKeys) {
    if (!(key in (theme.fonts || {}))) fail(`${theme.id}: fonts.${key} is missing`, errors);
  }
  for (const key of requiredUiKeys) {
    if (!(key in (theme.ui || {}))) fail(`${theme.id}: ui.${key} is missing`, errors);
  }

  const previewPath = path.join(root, theme.preview);
  if (!fs.existsSync(previewPath)) fail(`${theme.id}: preview not found at ${theme.preview}`, errors);
}

const orderedKeys = indexEntries.map((entry) => entry.key);
const expectedKeys = registry.themes.slice().sort((a, b) => a.order - b.order).map((theme) => theme.id);
if (JSON.stringify(orderedKeys) !== JSON.stringify(expectedKeys)) {
  fail(`themes.index.json order mismatch: expected ${expectedKeys.join(", ")}`, errors);
}

if (errors.length) {
  console.error("Theme validation failed:");
  for (const message of errors) console.error(`- ${message}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log(`Validated ${registry.themes.length} themes successfully.`);
if (warnings.length) {
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
