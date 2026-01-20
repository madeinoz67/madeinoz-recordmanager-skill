# Tasks: Records Manager Pack Icon

**Input**: Design documents from `/specs/002-pack-icon/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested - validation is visual inspection only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Asset location**: `icons/madeinoz-recordmanager-skill.png`
- **Generation tool**: `~/.claude/skills/Art/Tools/Generate.ts`
- **Preview location**: `~/Downloads/` (for validation before final placement)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare directory structure and verify prerequisites

- [x] T001 Create icons directory at repository root: `mkdir -p icons`
- [x] T002 [P] Verify PAI Art skill is available: `bun run ~/.claude/skills/Art/Tools/Generate.ts --help`
- [x] T003 [P] Verify ImageMagick is installed: `magick --version`

**Checkpoint**: Infrastructure ready for icon generation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational phase needed - this is an asset-only feature with no code dependencies

**Note**: Phase 1 Setup is the only prerequisite for user story work.

---

## Phase 3: User Story 1 - Identify Pack in Visual Listings (Priority: P1) 🎯 MVP

**Goal**: Create a visually distinctive icon that displays correctly in PAI pack listings and galleries

**Independent Test**: View icon in a PAI pack listing or gallery, confirm it displays at correct size without distortion and is visually distinct from other pack icons

### Implementation for User Story 1

- [x] T004 [US1] Generate raw icon using PAI Art skill with gpt-image-1 model, output to ~/Downloads/recordmanager-icon-raw.png
- [x] T005 [US1] Verify generated icon shows filing cabinet concept and uses PAI color palette (blue #4a90d9, purple #8b5cf6)
- [x] T006 [US1] Process icon: resize to 256x256 pixels using ImageMagick, ensure transparency preserved
- [x] T007 [US1] Place final icon at icons/madeinoz-recordmanager-skill.png
- [x] T008 [US1] Generate 64x64 test version to verify small-size readability: ~/Downloads/icon-test-64.png
- [x] T009 [US1] Visual validation: test icon on light background (#FFFFFF), save to ~/Downloads/icon-test-light.png
- [x] T010 [US1] Visual validation: test icon on dark background (#1A1A1A), save to ~/Downloads/icon-test-dark.png
- [x] T011 [US1] Verify file size is under 100KB: `ls -la icons/madeinoz-recordmanager-skill.png`

**Checkpoint**: Icon exists at correct path, passes all visual validation tests, displays correctly in pack context

---

## Phase 4: User Story 2 - Use Icon in Documentation (Priority: P2)

**Goal**: Ensure icon displays correctly in README.md and documentation

**Independent Test**: View README.md on GitHub and verify icon renders correctly at appropriate size

### Implementation for User Story 2

- [x] T012 [US2] Verify README.md already references icons/madeinoz-recordmanager-skill.png (no change needed if reference exists)
- [x] T013 [US2] Preview README.md to confirm icon displays: `open README.md` or view on GitHub
- [x] T014 [US2] Test README rendering at mobile viewport sizes (if applicable)

**Checkpoint**: Icon displays in README.md without errors, clear and readable at documentation sizes

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [x] T015 [P] Delete temporary test files from ~/Downloads/ (icon-raw, test-64, test-light, test-dark)
- [x] T016 Verify icon dimensions are exactly 256x256: `magick identify icons/madeinoz-recordmanager-skill.png`
- [x] T017 Final visual inspection: confirm filing cabinet is recognizable within 2 seconds of viewing (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational tasks
- **User Story 1 (Phase 3)**: Depends on Setup completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (icon must exist)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (icon must exist to display in documentation)

### Within User Story 1

1. Generate raw icon (T004)
2. Visual verification of generation (T005)
3. Process and resize (T006)
4. Place at final location (T007)
5. Validation tests (T008-T011) can run in parallel after T007

### Parallel Opportunities

- Setup tasks T002 and T003 can run in parallel
- Validation tasks T008-T011 can run in parallel (all test same icon file)
- User Story 2 tasks T012-T014 can run in parallel (all test documentation display)
- Polish task T015 can run independently

---

## Parallel Example: User Story 1 Validation

```bash
# After T007 completes, launch all validation in parallel:
Task: "Generate 64x64 test version: ~/Downloads/icon-test-64.png"
Task: "Visual validation on light background: ~/Downloads/icon-test-light.png"
Task: "Visual validation on dark background: ~/Downloads/icon-test-dark.png"
Task: "Verify file size under 100KB"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 3: User Story 1 (T004-T011)
3. **STOP and VALIDATE**: Icon displays correctly in pack listing context
4. Feature is usable after US1 completes

### Incremental Delivery

1. Complete Setup → Infrastructure ready
2. Add User Story 1 → Icon created and validated → **MVP Complete**
3. Add User Story 2 → Documentation displays icon → Full feature complete
4. Polish → Cleanup and final validation

---

## Fallback Plan

If gpt-image-1 produces unsatisfactory results:

1. Try `nano-banana-pro` model with same prompt
2. Add `--remove-bg` flag if transparency not achieved
3. Adjust prompt for simpler geometry if small-size readability fails
4. Manual color adjustment with ImageMagick if palette is off

---

## Generation Commands Reference

**Primary generation command (T004)**:
```bash
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model gpt-image-1 \
  --prompt "A modern flat-design vertical filing cabinet icon with 3 drawers. Electric blue (#4a90d9) metal cabinet body with purple (#8b5cf6) drawer handles. Clean minimalist style, centered composition, transparent background. No shadows, no text, simple geometric shapes. Professional app icon style suitable for software pack/plugin branding." \
  --size 1024x1024 \
  --output ~/Downloads/recordmanager-icon-raw.png
```

**Resize command (T006)**:
```bash
magick ~/Downloads/recordmanager-icon-raw.png \
  -resize 256x256 \
  -background transparent \
  -gravity center \
  -extent 256x256 \
  icons/madeinoz-recordmanager-skill.png
```

**Validation commands (T008-T010)**:
```bash
# 64x64 test
magick icons/madeinoz-recordmanager-skill.png -resize 64x64 ~/Downloads/icon-test-64.png

# Light background test
magick -size 300x300 xc:"#FFFFFF" icons/madeinoz-recordmanager-skill.png \
  -gravity center -composite ~/Downloads/icon-test-light.png

# Dark background test
magick -size 300x300 xc:"#1A1A1A" icons/madeinoz-recordmanager-skill.png \
  -gravity center -composite ~/Downloads/icon-test-dark.png
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Visual inspection is the primary validation method (no automated tests)
- All preview images go to ~/Downloads/ for inspection before final placement
- Commit after icon is placed at final location (T007)
