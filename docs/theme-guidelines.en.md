# html-ppt Theme Guidelines

## Purpose

This document defines the theme registry, token structure, dark-mode behavior, and preview generation rules for the html-ppt skill. [`config/themes.json`](../config/themes.json) is the source of truth. [`config/themes.index.json`](../config/themes.index.json) is the lightweight menu index.

## Theme Set

1. `business`
2. `light-tech`
3. `warm-minimal`
4. `brand-warm`

## Required Theme Structure

Each theme must provide:

- `tokens.light`
- `tokens.dark`
- `fonts`
- `ui`
- `preview`

Required tokens:

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

## Light / Dark Strategy

- Light mode is the default output.
- Dark mode is optional and user-switchable.
- Dark palettes must be designed explicitly instead of simply inverting the light palette.
- `text_primary` should keep at least 4.5:1 contrast against `bg_main` and `bg_card`.

The loader uses `data-theme-mode="light|dark"` to switch variables.

## Preview Rules

Preview assets live in [`references/previews/`](../references/previews/).

Every preview includes:

- Chinese theme label
- English theme label
- background / card / accent swatches
- one icon
- bilingual content sample
- one KPI block

The generation flow:

- build SVG
- render PNG with a headless browser
- discard temporary HTML wrappers

## Skill Integration

Phase 1 should read [`config/themes.index.json`](../config/themes.index.json) and present a numeric menu:

- `1 Business`
- `2 Light Tech`
- `3 Warm Minimal`
- `4 Brand Warm`

Legacy aliases should still resolve:

- `tech` → `light-tech`
- `minimal` → `warm-minimal`
- `warm` → `brand-warm`

## Adding a Theme

1. Add a full theme entry to `config/themes.json`.
2. Run `node scripts/generate-themes-index.js`.
3. Run `node scripts/generate-theme-previews.js`.
4. Run `node scripts/validate-themes.js`.
5. Update both language docs if the new theme needs external explanation.
6. Add `assets/theme-[name].css` if a static CSS snapshot is needed.
