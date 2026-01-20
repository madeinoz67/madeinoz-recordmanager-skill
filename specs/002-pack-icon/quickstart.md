# Quickstart: Records Manager Pack Icon Generation

**Feature Branch**: `002-pack-icon`
**Date**: 2026-01-20

## Prerequisites

- PAI Art skill configured with OpenAI gpt-image-1 model
- ImageMagick installed (`brew install imagemagick`)
- `icons/` directory exists in repository root

## Step 1: Generate Icon

```bash
# Navigate to repository
cd /Users/seaton/Documents/src/madeinoz-recordmanager-skill

# Create icons directory if needed
mkdir -p icons

# Generate icon using PAI Art skill
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model gpt-image-1 \
  --prompt "A modern flat-design vertical filing cabinet icon with 3 drawers. Electric blue (#4a90d9) metal cabinet body with purple (#8b5cf6) drawer handles. Clean minimalist style, centered composition, transparent background. No shadows, no text, simple geometric shapes. Professional app icon style suitable for software pack/plugin branding." \
  --size 1024x1024 \
  --output ~/Downloads/recordmanager-icon-raw.png
```

## Step 2: Process Icon

```bash
# Resize to 256x256 (PAI standard size)
magick ~/Downloads/recordmanager-icon-raw.png \
  -resize 256x256 \
  -background transparent \
  -gravity center \
  -extent 256x256 \
  icons/madeinoz-recordmanager-skill.png
```

## Step 3: Validate Icon

```bash
# Check dimensions
magick identify icons/madeinoz-recordmanager-skill.png

# Generate test sizes for visual inspection
magick icons/madeinoz-recordmanager-skill.png -resize 64x64 ~/Downloads/icon-test-64.png
magick icons/madeinoz-recordmanager-skill.png -resize 128x128 ~/Downloads/icon-test-128.png

# Check file size
ls -la icons/madeinoz-recordmanager-skill.png

# Test on light background
magick -size 300x300 xc:"#FFFFFF" icons/madeinoz-recordmanager-skill.png \
  -gravity center -composite ~/Downloads/icon-test-light.png

# Test on dark background
magick -size 300x300 xc:"#1A1A1A" icons/madeinoz-recordmanager-skill.png \
  -gravity center -composite ~/Downloads/icon-test-dark.png
```

## Step 4: Visual Inspection

Open these files and verify:

1. **~/Downloads/icon-test-64.png** - Cabinet shape recognizable?
2. **~/Downloads/icon-test-128.png** - Drawer details visible?
3. **~/Downloads/icon-test-light.png** - Clear on white background?
4. **~/Downloads/icon-test-dark.png** - Clear on dark background?
5. **icons/madeinoz-recordmanager-skill.png** - Full detail correct?

## Step 5: Verify README Display

```bash
# Open README in browser preview to confirm icon displays
open README.md
```

## Troubleshooting

### Icon Not Transparent

If the generated icon has a background:

```bash
# Use remove.bg API (requires REMOVEBG_API_KEY)
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model gpt-image-1 \
  --prompt "..." \
  --size 1024x1024 \
  --remove-bg \
  --output ~/Downloads/recordmanager-icon-raw.png
```

### Wrong Colors

If colors don't match specification:

1. Regenerate with more explicit color hex codes in prompt
2. Or use ImageMagick color replacement:

```bash
magick icons/madeinoz-recordmanager-skill.png \
  -fill "#4a90d9" -opaque "close-to-blue-color" \
  icons/madeinoz-recordmanager-skill.png
```

### Not Readable at 64x64

If icon is too detailed for small sizes:

1. Simplify prompt: "Minimalist filing cabinet silhouette, solid blue fill"
2. Reduce to 2 drawers instead of 3
3. Remove drawer handles, use simple lines

## Validation Checklist

- [ ] File exists at `icons/madeinoz-recordmanager-skill.png`
- [ ] Dimensions: 256x256 pixels
- [ ] Format: PNG with alpha channel
- [ ] File size: < 100KB
- [ ] Recognizable at 64x64
- [ ] Clear on light background
- [ ] Clear on dark background
- [ ] Filing cabinet clearly depicted
- [ ] Blue primary color visible
