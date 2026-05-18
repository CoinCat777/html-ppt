# Theme Contribution Flow

1. Add or update the theme entry in `config/themes.json`.
2. Keep `order`, `displayName`, `preview`, `tokens.light`, `tokens.dark`, `fonts`, and `ui` complete.
3. Regenerate the menu index with `node scripts/generate-themes-index.js`.
4. Regenerate preview assets with `node scripts/generate-theme-previews.js`.
5. Validate contrast and required fields with `node scripts/validate-themes.js`.
6. If the theme is user-facing, update `SKILL.md`, `README.md`, and the bilingual docs.
