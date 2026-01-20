# Implementation Plan: Records Manager Pack Icon

**Branch**: `002-pack-icon` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pack-icon/spec.md`

## Summary

Create a visually distinctive pack icon for the Records Manager Skill depicting a classic vertical filing cabinet. The icon will be generated using the PAI Art skill following PAI pack icon specifications (256x256 PNG with transparency, electric blue/purple color palette).

## Technical Context

**Language/Version**: N/A (asset generation, no code)
**Primary Dependencies**: PAI Art skill (Generate.ts with gpt-image-1 or nano-banana-pro model)
**Storage**: PNG file at `icons/madeinoz-recordmanager-skill.png`
**Testing**: Visual inspection at 64x64, 256x256, and 512x512 sizes
**Target Platform**: Cross-platform (GitHub README, PAI pack listings, documentation)
**Project Type**: Asset-only (icon generation)
**Performance Goals**: Icon loads instantly, file size <100KB
**Constraints**: Must remain readable at 64x64 pixels, work on light/dark backgrounds
**Scale/Scope**: Single 256x256 PNG icon with transparency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|-----------|----------|--------|-------|
| I. Safety-First Architecture | No | N/A | No document operations |
| II. Taxonomy-Driven Organization | No | N/A | No document management |
| III. Compliance-Aware Retention | No | N/A | No retention concerns |
| IV. Three-Layer Separation | No | N/A | Asset only, no code layers |
| V. Environment Variable Standards | No | N/A | No configuration needed |
| VI. CLI-First Interface | Partial | PASS | Using Art skill CLI for generation |
| VII. Codanna-First Code Intelligence | No | N/A | No code exploration needed |

**Gate Status**: PASS - This is an asset-only feature with no code changes required.

## Project Structure

### Documentation (this feature)

```text
specs/002-pack-icon/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (icon metadata)
├── quickstart.md        # Phase 1 output (generation instructions)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
icons/
└── madeinoz-recordmanager-skill.png   # Generated icon asset (256x256 transparent PNG)
```

**Structure Decision**: Asset-only structure. Single icon file placed in `icons/` directory matching the existing README.md reference.

## Complexity Tracking

No violations - this is a minimal asset generation task with no architectural complexity.

---

## Phase 0: Research Summary

### PAI Pack Icon Specifications (from CreatePAIPackIcon.md)

| Attribute | Requirement |
|-----------|-------------|
| Dimensions | 256x256 pixels (square) |
| Format | PNG with true transparency |
| Primary Color | Electric Blue #4a90d9 |
| Accent Color | Purple #8b5cf6 (10-15% max) |
| Style | Modern flat design, simple geometry |
| Readability | Must be clear at 64x64 pixels |

### Filing Cabinet Icon Concept

**Decision**: Classic vertical filing cabinet with 3-4 drawers
**Rationale**:
- Filing cabinets are universally recognized as record storage
- Vertical orientation fits square canvas well
- Drawer details provide visual interest while remaining simple
- Aligns with "Records Manager" naming

**Alternatives Considered**:
1. Folder stack - Too generic, used by many file management icons
2. Archive box - Less recognizable at small sizes
3. Document with seal - Conflicts with legal/notary imagery
4. Database cylinder - Too technical, misrepresents the human-friendly concept

### Model Selection

**Decision**: Use `gpt-image-1` (newly configured OpenAI model)
**Rationale**:
- Just configured with native OpenAI API key
- Good at following specific style instructions
- Supports 1024x1024 generation (can downscale to 256x256)

**Fallback**: `nano-banana-pro` with `--remove-bg` if needed

---

## Phase 1: Design Artifacts

### Icon Metadata (data-model.md content)

```yaml
icon:
  name: madeinoz-recordmanager-skill
  format: PNG
  dimensions: 256x256
  transparency: true
  location: icons/madeinoz-recordmanager-skill.png

visual_design:
  subject: Vertical filing cabinet (3-4 drawers)
  style: Modern flat design, minimal shadows
  primary_color: "#4a90d9"  # Electric blue
  accent_color: "#8b5cf6"   # Purple (drawer handles/highlights)
  background: Transparent

validation:
  min_readable_size: 64x64
  max_file_size: 100KB
  light_bg_test: "#FFFFFF"
  dark_bg_test: "#1A1A1A"
```

### Generation Command (quickstart.md content)

```bash
# Generate icon using PAI Art skill
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model gpt-image-1 \
  --prompt "A modern flat-design vertical filing cabinet icon with 3 drawers. Electric blue (#4a90d9) metal cabinet body with purple (#8b5cf6) drawer handles. Clean minimalist style, centered composition, transparent background. No shadows, no text, simple geometric shapes. Professional app icon style." \
  --size 1024x1024 \
  --output ~/Downloads/recordmanager-icon-raw.png

# Remove background (if not transparent)
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model gpt-image-1 \
  --prompt "..." \
  --size 1024x1024 \
  --remove-bg \
  --output ~/Downloads/recordmanager-icon.png

# Resize to 256x256 using ImageMagick
magick ~/Downloads/recordmanager-icon.png -resize 256x256 icons/madeinoz-recordmanager-skill.png

# Validate readability at small sizes
magick icons/madeinoz-recordmanager-skill.png -resize 64x64 ~/Downloads/icon-64x64-test.png
```

### Validation Checklist

- [ ] Icon file exists at `icons/madeinoz-recordmanager-skill.png`
- [ ] PNG format with alpha channel (transparency)
- [ ] Dimensions: 256x256 pixels
- [ ] File size < 100KB
- [ ] Filing cabinet clearly visible
- [ ] Primary color is electric blue (#4a90d9)
- [ ] Readable/recognizable at 64x64 pixels
- [ ] Works on light background (#FFFFFF)
- [ ] Works on dark background (#1A1A1A)
- [ ] README.md displays icon correctly

---

## Implementation Notes

This is an asset-only feature. No code changes are required beyond placing the generated icon file. The icon generation will be performed using the Art skill CLI tool with the newly configured OpenAI gpt-image-1 model.

Post-generation, visual validation will confirm the icon meets all requirements before considering the feature complete.
