#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const referencesDir = path.join(root, "references");
const patternsDir = path.join(referencesDir, "patterns");
const patternIndexPath = path.join(referencesDir, "patternindex.html");
const indexJsonPath = path.join(patternsDir, "index.json");
const schemaPath = path.join(patternsDir, "pattern.schema.json");
const assetsDir = path.join(root, "assets");

const knownThemes = [
  "theme-warm.css",
  "theme-business.css",
  "theme-minimal.css",
  "theme-tech.css",
  "theme-brand-warm.css",
  "theme-light-tech.css",
  "theme-warm-minimal.css"
];
const requiredTopLevel = [
  "schemaVersion",
  "id",
  "title",
  "htmlDemo",
  "summary",
  "tags",
  "themeHints",
  "flexible",
  "legacy",
  "layout",
  "themeStrategy",
  "defaults",
  "constraints"
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseThemeTokens(css) {
  const tokens = {};
  const regex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = regex.exec(css))) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return null;
  const normalized = value.length === 3
    ? value.split("").map((char) => char + char).join("")
    : value;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
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

function fail(message, errors) {
  errors.push(message);
}

const errors = [];
const warnings = [];

if (!fs.existsSync(indexJsonPath)) fail(`Missing ${indexJsonPath}`, errors);
if (!fs.existsSync(schemaPath)) fail(`Missing ${schemaPath}`, errors);
if (!fs.existsSync(patternIndexPath)) fail(`Missing ${patternIndexPath}`, errors);

const index = readJson(indexJsonPath);
const patternIndexHtml = fs.readFileSync(patternIndexPath, "utf8");
const themeMaps = {};

for (const themeFile of knownThemes) {
  const filePath = path.join(assetsDir, themeFile);
  if (!fs.existsSync(filePath)) {
    fail(`Missing theme file ${filePath}`, errors);
    continue;
  }
  themeMaps[themeFile.replace("theme-", "").replace(".css", "")] = parseThemeTokens(fs.readFileSync(filePath, "utf8"));
}

const htmlPatternIds = [...patternIndexHtml.matchAll(/data-pattern="([^"]+)"/g)].map((match) => match[1]);
const htmlJsonRefs = [...patternIndexHtml.matchAll(/data-json="([^"]+)"/g)].map((match) => match[1]);

for (const entry of index) {
  const htmlPath = path.join(referencesDir, entry.html);
  const jsonPath = path.join(referencesDir, entry.schema);

  if (!fs.existsSync(htmlPath)) fail(`Missing html demo for ${entry.id}: ${htmlPath}`, errors);
  if (!fs.existsSync(jsonPath)) fail(`Missing schema file for ${entry.id}: ${jsonPath}`, errors);
  if (!htmlPatternIds.includes(entry.id)) fail(`patternindex.html is missing data-pattern="${entry.id}"`, errors);
  if (!htmlJsonRefs.includes(entry.schema)) fail(`patternindex.html is missing data-json="${entry.schema}"`, errors);

  const json = readJson(jsonPath);
  for (const field of requiredTopLevel) {
    if (!(field in json)) fail(`${entry.id} is missing required field "${field}"`, errors);
  }

  if (json.id !== entry.id) fail(`ID mismatch: index has ${entry.id}, json has ${json.id}`, errors);
  if (json.htmlDemo !== `../${entry.html}`) fail(`htmlDemo mismatch for ${entry.id}: expected ../${entry.html}`, errors);

  const tokenValues = Object.values(json.themeStrategy?.tokens || {});
  for (const token of tokenValues) {
    for (const themeHint of json.themeHints || []) {
      const themeMap = themeMaps[themeHint];
      if (!themeMap) {
        fail(`${entry.id} references unknown themeHint "${themeHint}"`, errors);
        continue;
      }
      if (!(token in themeMap)) fail(`${entry.id} uses unknown theme token "${token}" for theme "${themeHint}"`, errors);
    }
  }

  const bodyThreshold = Number(json.constraints?.minContrastBody || 4.5);
  for (const themeHint of json.themeHints || []) {
    const themeMap = themeMaps[themeHint];
    if (!themeMap) continue;
    const bgToken = json.themeStrategy.tokens.pageBg || json.themeStrategy.tokens.panelBg;
    const textToken = json.themeStrategy.tokens.text;
    const bgColor = themeMap[bgToken];
    const textColor = themeMap[textToken];
    const ratio = contrastRatio(bgColor, textColor);
    if (ratio === null) {
      warnings.push(`${entry.id} / ${themeHint}: contrast skipped because token colors are not plain hex`);
      continue;
    }
    if (ratio < bodyThreshold) {
      fail(`${entry.id} / ${themeHint}: contrast ${ratio.toFixed(2)} is below ${bodyThreshold}`, errors);
    }
  }

  const badgeRange = json.constraints?.badgeSizeRatioRange;
  if (badgeRange) {
    if (!Array.isArray(badgeRange) || badgeRange.length !== 2 || badgeRange[0] >= badgeRange[1]) {
      fail(`${entry.id} has invalid badgeSizeRatioRange`, errors);
    }
  }
}

for (const htmlPatternId of htmlPatternIds) {
  if (!index.find((entry) => entry.id === htmlPatternId)) {
    fail(`patternindex.html contains unmanaged pattern ${htmlPatternId}`, errors);
  }
}

if (errors.length) {
  console.error("Pattern validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log(`Validated ${index.length} patterns successfully.`);
if (warnings.length) {
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
