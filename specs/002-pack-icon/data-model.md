# Data Model: Records Manager Pack Icon

**Feature Branch**: `002-pack-icon`
**Date**: 2026-01-20

## Entities

### Icon Asset

The primary PNG image file representing the Records Manager Skill pack.

```yaml
icon:
  name: madeinoz-recordmanager-skill
  format: PNG
  dimensions:
    width: 256
    height: 256
  transparency: true
  color_depth: 32-bit (RGBA)
  location: icons/madeinoz-recordmanager-skill.png
  max_file_size: 100KB
```

### Visual Design Specification

The visual design requirements for the icon.

```yaml
visual_design:
  subject: Vertical filing cabinet
  drawer_count: 3
  style: Modern flat design

  colors:
    primary:
      name: Electric Blue
      hex: "#4a90d9"
      usage: Cabinet body (85-90%)
    accent:
      name: Purple
      hex: "#8b5cf6"
      usage: Drawer handles/highlights (10-15%)
    background:
      type: Transparent
      value: null

  composition:
    alignment: Centered
    padding: 8-16 pixels from edge
    orientation: Vertical (portrait cabinet)
```

### Validation Rules

Requirements that must be verified post-generation.

```yaml
validation:
  dimensions:
    required: 256x256
    tolerance: 0 (exact match)

  file_format:
    required: PNG
    alpha_channel: required

  file_size:
    max: 100KB

  readability_tests:
    - size: 64x64
      requirement: "Cabinet shape recognizable"
    - size: 128x128
      requirement: "Drawer details visible"
    - size: 256x256
      requirement: "Full detail visible"

  background_tests:
    - background: "#FFFFFF"
      requirement: "Clear visibility, no artifacts"
    - background: "#1A1A1A"
      requirement: "Clear visibility, no artifacts"
```

### Icon Metadata (for pack.json if applicable)

```yaml
icon_metadata:
  path: "icons/madeinoz-recordmanager-skill.png"
  alt_text: "Records Manager Skill - Filing cabinet icon"
  sizes:
    default: 256x256
    thumbnail: 64x64
    display: 128x128
```

## Relationships

```
Pack (madeinoz-recordmanager-skill)
└── Icon Asset (1:1)
    ├── Referenced by: README.md
    ├── Referenced by: pack.json (if exists)
    └── Displayed in: PAI pack listings
```

## State Transitions

This entity has no state transitions - it's a static asset created once.

```
[Not Exists] → [Generated] → [Validated] → [Published]
                    │              │
                    └──(fail)──────┘ (regenerate)
```
