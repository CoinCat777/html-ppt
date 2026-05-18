#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "config", "themes.json");
const indexPath = path.join(root, "config", "themes.index.json");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const output = registry.themes
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((theme) => ({
    id: theme.order,
    key: theme.id,
    displayName: theme.displayName,
    preview: theme.preview,
    shortDescription: {
      zh: theme.description.zh,
      en: theme.description.en
    }
  }));

fs.writeFileSync(indexPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(`Generated ${path.relative(root, indexPath)}`);
