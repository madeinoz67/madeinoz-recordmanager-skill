# Research: Records Manager Pack Icon

**Feature Branch**: `002-pack-icon`
**Date**: 2026-01-20

## Research Tasks

### 1. PAI Pack Icon Specifications

**Task**: Determine required dimensions, format, and visual style for PAI pack icons.

**Decision**: Follow PAI pack icon standard (256x256 PNG with transparency)

**Rationale**:
- PAI documentation specifies 256x256 pixels as the standard icon size
- PNG format with true transparency required for flexibility
- Must use PAI color palette: Electric Blue (#4a90d9) primary, Purple (#8b5cf6) accent
- Modern flat design style for consistency with other PAI icons

**Source**: `~/.claude/skills/Art/Workflows/CreatePAIPackIcon.md`

---

### 2. Filing Cabinet Visual Design

**Task**: Determine the best visual representation for "Records Manager" concept.

**Decision**: Classic vertical filing cabinet with 3 drawers

**Rationale**:
- Filing cabinets are universally recognized as record/document storage
- Vertical orientation fits square canvas proportionally
- 3 drawers provides visual interest while remaining simple enough for small sizes
- Metal cabinet aesthetic aligns with professional document management

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|------------------|
| Folder stack | Too generic, commonly used by file managers |
| Archive box | Less recognizable at small sizes |
| Document with seal | Implies legal/notary, wrong domain |
| Database cylinder | Too technical, misrepresents human-friendly nature |
| Safe/vault | Implies security focus over organization |

---

### 3. Image Generation Model Selection

**Task**: Determine best AI model for icon generation.

**Decision**: Use `gpt-image-1` (OpenAI) as primary, `nano-banana-pro` as fallback

**Rationale**:
- gpt-image-1 just configured with native OpenAI API key
- Good at following specific style and color instructions
- Produces clean, professional icon-style outputs
- 1024x1024 native size can be downscaled cleanly to 256x256

**Fallback Plan**:
If gpt-image-1 produces unsatisfactory results:
1. Try nano-banana-pro (Gemini) with same prompt
2. Use `--remove-bg` flag to ensure transparency
3. Manual touch-up with ImageMagick if needed

---

### 4. Small Size Readability

**Task**: Ensure icon remains recognizable at 64x64 pixels (favicon size).

**Decision**: Design with minimal detail, high contrast cabinet silhouette

**Rationale**:
- At 64x64, fine details become noise
- Filing cabinet shape (rectangular with horizontal lines) remains recognizable
- High contrast between cabinet body and drawer handles crucial
- Purple accent handles provide visual interest without clutter

**Design Guidelines**:
- No text in icon
- No gradients or shadows
- Bold, simple shapes
- Clear drawer separation lines
- Centered composition

---

## All NEEDS CLARIFICATION: Resolved

No outstanding clarifications. All research tasks complete.
