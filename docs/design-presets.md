# Design Presets

ReelForge presets are schema-valid `design-tokens.json` files for `vf compile --preset`.
All presets keep the shared local Pretendard font asset and encode source style through color, role weights, mood pacing, and subtitle tokens.
The catalog contains 16 video presets plus 3 fixture/demo variants (`dark`, `demo-dark`, `light`), for 19 preset files total under `fixtures/presets/`.

Compile pattern:

```sh
node bin/vf compile <projectDir> --preset fixtures/presets/<preset>.json
```

## Catalog

각 프리셋의 브랜드 톤·디자인 시스템 정본은 design-* 스킬과 hyperframes-creative 팔레트다(선택 트리: skills/reelforge/references/design-direction.md §1). 아래 Mood / Grammar 열은 영상 압축·video-safe 관점의 보정 델타만 기술한다.

| Preset | Best Use | Mood / Grammar | Research Basis |
|---|---|---|---|
| `linear` | Dark technical SaaS, product dashboards, premium developer tooling. | Video-safe `#0a0b0e`; lifted surface deltas and hairlines for compression. | color-texture |
| `linear-demo` | Linear-style demo renders where subtitles should not cover the frame. | Safe dark treatment, stronger layered glow, `subtitle.visible=false`. | color-texture |
| `vercel` | Minimal developer docs, infrastructure explainers, code-first dashboards. | 4:2:0-safe magenta/red/cyan; no glow on light backgrounds. | color-texture |
| `stripe` | Fintech, B2B SaaS landing reels, pricing or growth stories. | Softened ruby/magenta; mesh-gradient colors only in large areas. | color-texture |
| `notion` | Docs, education, wiki/productivity, warm workspace narratives. | Lifted hero panel, stronger pastel tints, safer hairlines. | color-texture |
| `apple` | Premium product showcase, keynote-style reels, low-density gallery scenes. | Visible dark-tile deltas; large dark-on-light type. | color-texture |
| `nebula-pop` | Optimistic science explainers, bright educational reels. | Object-first motion with large neon hits. | youtube-channels |
| `pressroom` | Vox / Johnny Harris style journalism, maps, documentary explainers. | Grain/print texture treatment. | youtube-channels |
| `neon-terminal` | Fast tech explainers, code reels, developer launch beats. | Video-safe terminal black; high-chroma hits only in large areas. | youtube-channels, color-texture |
| `broadcast-news` | Global news packages, lower thirds, live updates, sports-adjacent explainers. | Status/alert colors with tabular data hierarchy. | broadcast-news |
| `data-journal` | FT/Economist/NYT style charts, statistics, source-backed explainers. | Direct-label charts; flat, no-glow treatment. | broadcast-news |
| `cinematic-trailer` | Brand intros, title cards, blockbuster trailer text hits. | Letterbox, grain, and controlled glow. | cinematic-trailer |
| `mono-impact` | Noir campaign cards, black/white hard-cut statements, one-word impact reels. | Red only for large emphasis; no glow or particles. | cinematic-trailer, color-texture |
| `wrapped-bold` | Rankings, recaps, metrics, social-stat cards. | Huge condensed type with grain/scratch texture. | studio-trends |
| `k-variety` | Korean variety captions, YouTube entertainment edits, reaction-heavy clips. | White captions with black stroke, yellow keywords, dense syllable-pop/shout grammar. | korean-video |
| `k-broadcast` | Korean news, election/count-up graphics, information YouTube panels. | Flat breaking red, yellow headlines; tabular count grammar. | korean-video, broadcast-news |

## Video-Safe Notes

> Research Basis 원문 문서는 레포에서 제거되었으며 `/mnt/d/reelforge-archive/research/12-video-design/`에 보관되어 있다. 표의 명칭은 그 아카이브의 파일명이다.

The `color-texture` correction table is applied to the preset source values, not as an extra top-level `videoSafe` object, because `schemas/design-tokens.schema.json` permits only `version`, `presetId`, `colors`, `moods`, `subtitle`, and `fonts`.

Hard rules carried into the catalog:

| Rule | Applied As |
|---|---|
| Full-frame black `#000000`-`#070707` is forbidden. | Dark backgrounds are lifted to `#0a0b0e`, `#0a0a0c`, or domain-specific safe darks such as `#0d2b32`. |
| Full-frame white `#ffffff` is forbidden. | Light backgrounds use `#fafafa`, `#fbfcfe`, `#fff1e5`, or paper/off-white values; pure white is retained only as foreground/action text where contrast requires it. |
| Adjacent dark surfaces need visible deltas. | Linear and Apple dark ladders were redistributed with channel deltas of at least 8 where the levels are meant to remain distinct after compression. |
| Red/magenta/cyan chroma fringe risk. | `#ff0080`, `#ee0000`, and similar values were softened or kept away from subtitle text; high-chroma colors in `neon-terminal`, `nebula-pop`, `mono-impact`, and `wrapped-bold` are for large blocks, wipes, accents, or display words, not small captions or 1px rules. |
| Large dark gradients need grain. | Moods that imply texture use `grain`; dark cinematic/terminal/Linear styles use lifted backgrounds plus layered glow strings instead of one large raw blur. |

## Contrast Notes

The table below records measured text contrast for preset tuning. Runtime visual QC currently accepts text when measured contrast is `>= 3` or the central-edge contrast heuristic passes. Subtitle backgrounds that are `rgba(...)` are measured after compositing over the preset background; transparent subtitles also rely on stroke as an extra video safeguard.

| Preset | Primary Text | Subtitle Text | Action Text |
|---|---:|---:|---:|
| `linear` | `#f7f8f8` on `#0a0b0e` = `18.50:1` | `#f7f8f8` on `#121317` = `17.45:1` | `#ffffff` on `#5e6ad2` = `4.70:1` |
| `linear-demo` | `#f7f8f8` on `#0a0b0e` = `18.50:1` | `#f7f8f8` on `#121317` = `17.45:1` | `#ffffff` on `#5e6ad2` = `4.70:1` |
| `vercel` | `#171717` on `#fafafa` = `17.18:1` | `#171717` on `#fbfbfb` = `17.32:1` | `#ffffff` on `#171717` = `17.93:1` |
| `stripe` | `#0d253d` on `#fbfcfe` = `15.16:1` | `#0d253d` on `#fbfcfe` = `15.16:1` | `#ffffff` on `#5b4bec` = `5.73:1` |
| `notion` | `#1a1a1a` on `#fafafa` = `16.67:1` | `#1a1a1a` on `#f6f5f4` = `15.98:1` | `#ffffff` on `#5645d4` = `6.57:1` |
| `apple` | `#1d1d1f` on `#fafafa` = `16.12:1` | `#1d1d1f` on `#f5f5f7` = `15.46:1` | `#ffffff` on `#0066cc` = `5.57:1` |
| `nebula-pop` | `#f4f0e8` on `#0a0e3f` = `16.10:1` | `#f4f0e8` on `#0a0e3f` = `16.10:1` | `#0a0e3f` on `#008cf7` = `5.31:1` |
| `pressroom` | `#1a1a1a` on `#f7f5f0` = `15.97:1` | `#1a1a1a` on `#f7f5f0` = `15.97:1` | `#f7f5f0` on `#1e2a3a` = `13.32:1` |
| `neon-terminal` | `#dddddd` on `#0a0b0e` = `14.49:1` | `#ffffff` on `#0a0b0e` = `19.68:1` | `#0a0b0e` on `#58c4dd` = `9.70:1` |
| `broadcast-news` | `#f5f7f8` on `#0b0e14` = `17.98:1` | `#f5f7f8` on `#0a142e` = `16.96:1` | `#ffffff` on `#d21f26` = `5.30:1` |
| `data-journal` | `#0c0c0c` on `#fff1e5` = `17.67:1` | `#0c0c0c` on `#fff1e5` = `17.67:1` | `#ffffff` on `#e3120b` = `4.82:1` |
| `cinematic-trailer` | `#fff3e4` on `#0d2b32` = `13.62:1` | `#fff3e4` on `#0b171b` = `16.65:1` | `#0a0b0e` on `#ff8c42` = `8.51:1` |
| `mono-impact` | `#f5f2ea` on `#0a0a0c` = `17.68:1` | `#f5f2ea` on `#0a0a0c` = `17.68:1` | `#fff3e4` on `#e10600` = `4.54:1` |
| `wrapped-bold` | `#faf7f0` on `#0a0a0c` = `18.49:1` | `#faf7f0` on `#0a0a0c` = `18.49:1` | `#0a0a0c` on `#1db954` = `7.65:1` |
| `k-variety` | `#f8fafc` on `#0f172a` = `17.06:1` | `#ffffff` on `#0f172a` = `17.85:1` | `#111111` on `#ffd400` = `13.19:1` |
| `k-broadcast` | `#f8fafc` on `#0a1530` = `17.26:1` | `#ffffff` on `#0a1530` = `18.06:1` | `#ffffff` on `#d71920` = `5.19:1` |

## Selection Guide

Use the Catalog's Best Use column to choose product-system fidelity (`linear`–`apple`), YouTube-native grammar (`nebula-pop`–`neon-terminal`), information authority (`broadcast-news`, `data-journal`), impact (`cinematic-trailer`–`wrapped-bold`), or Korean caption systems (`k-*`).

## Extended craft color keys (2026-07 block surgery)

Beyond the base `colors` roles, the compiler injects these **optional** preset keys as CSS
variables when present (`src/compiler/compiler.mjs` `blockFrameStyle()`). Blocks consume them
with `var(--rf-*, <fallback>)`, so presets that omit them stay fully valid:

| Preset key | CSS variable | Role |
|---|---|---|
| `background` | `--rf-bg` | scene canvas (near-black/near-white, never pure #000/#fff) |
| `surface2` / `surface3` | `--rf-surface-2/-3` | dark surface ladder steps (adjacent delta >= 8) |
| `hairline` / `hairlineStrong` | `--rf-hairline(-strong)` | 1px structural borders — the only allowed "frame" |
| `inkSubtle` / `inkTertiary` | `--rf-ink-subtle/-tertiary` | secondary/tertiary text below `mutedText` |
| `accentAlt` | `--rf-accent-alt` | hover/glow companion to `accent` |
| `onAccent` (or `onPrimary`) | `--rf-on-accent` | text on accent fills |
| `success` | `--rf-success` | earned/true/zero-cost beats — keep scarce |

`mutedText` now feeds `--rf-muted-text` through the same contrast guard as `text`
(previously it was erroneously injected as a copy of `text`). Reference implementation of the
full key set: `fixtures/presets/linear.json` and `fixtures/presets/dark-hype.json`.
