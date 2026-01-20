# Data Model: MkDocs Documentation Site

**Feature**: 001-mkdocs-documentation
**Date**: 2026-01-20

---

## Core Entities

### Documentation Page

A single page of documentation content with associated metadata.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | Relative path from docs/ root (e.g., `user-guide/uploading.md`) |
| `title` | string | Yes | Page title displayed in navigation and browser |
| `nav_position` | integer | No | Order within parent section (defaults to alphabetical) |
| `section` | string | Yes | Parent section identifier |
| `last_updated` | datetime | Auto | Git commit timestamp (auto-populated) |
| `created` | datetime | Auto | Git first commit timestamp (auto-populated) |

**Validation Rules:**
- Path must end with `.md`
- Path must be unique within the documentation tree
- Title must be non-empty and under 100 characters

---

### Navigation Section

A grouping of related documentation pages.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Section identifier (e.g., `getting-started`) |
| `title` | string | Yes | Display title in navigation |
| `level` | integer | Yes | Hierarchy level (1=tab, 2=section, 3=subsection) |
| `parent` | string | No | Parent section ID (null for top-level) |
| `index_page` | string | No | Path to section index page |
| `icon` | string | No | Material icon name (e.g., `material/rocket-launch`) |

**Hierarchy Structure:**
```
Level 1 (Tab):     Getting Started | User Guide | Reference | Extending
Level 2 (Section): Installation | Prerequisites | Quick Start
Level 3 (Page):    Individual documentation pages
```

---

### Build Artifact

Generated static site files from documentation build.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `build_id` | string | Yes | Unique build identifier (git SHA) |
| `timestamp` | datetime | Yes | Build completion time |
| `status` | enum | Yes | `success` \| `failed` |
| `output_dir` | string | Yes | Path to generated site (default: `site/`) |
| `pages_count` | integer | Yes | Number of pages built |
| `duration_seconds` | float | Yes | Build duration |

---

## Documentation Structure

### File Tree

```
docs/
├── index.md                         # Homepage
├── assets/
│   ├── icon.png                     # Site logo (from pack icon)
│   └── favicon.png                  # Browser favicon
├── stylesheets/
│   └── extra.css                    # Custom PAI colors
├── getting-started/
│   ├── index.md                     # Section overview
│   ├── installation.md
│   ├── prerequisites.md
│   └── quick-start.md
├── user-guide/
│   ├── index.md
│   ├── uploading.md
│   ├── searching.md
│   ├── tagging.md
│   ├── retention.md
│   ├── trusts.md
│   └── workflows.md
├── reference/
│   ├── index.md
│   ├── cli.md
│   ├── agents.md
│   ├── environment.md
│   └── api.md
├── extending/
│   ├── index.md
│   ├── taxonomies.md
│   ├── new-entity-types.md
│   ├── custom-taxonomies.md
│   └── examples.md
├── examples/
│   ├── index.md
│   └── prompts.md
├── architecture/
│   ├── index.md
│   └── overview.md
├── changelog.md
└── troubleshooting.md
```

### Page Count by Section

| Section | Pages | Priority |
|---------|-------|----------|
| Getting Started | 4 | P1 |
| User Guide | 7 | P1 |
| Reference | 5 | P1 |
| Extending | 5 | P2 |
| Examples | 2 | P2 |
| Architecture | 2 | P3 |
| Root pages | 3 | P1 |
| **Total** | **28** | - |

---

## Content Mapping

### Source to Documentation

| Source File | Documentation Section | Notes |
|-------------|----------------------|-------|
| `README.md` | `index.md` (condensed) | Keep under 300 lines |
| `SKILL.md` | `user-guide/workflows.md` | Workflow routing table |
| `AGENTS.md` | `reference/agents.md` | Agent roster |
| `src/lib/TaxonomyExpert.ts` | `extending/taxonomies.md` | Code documentation |
| `src/lib/TrustExpert.ts` | `user-guide/trusts.md` | Trust compliance |
| `src/skills/RecordsManager/Tools/RecordManager.ts` | `reference/cli.md` | CLI commands |
| `.env.example` | `reference/environment.md` | Environment variables |

### New Content Requirements

| Page | Content Source | Diagrams Required |
|------|---------------|-------------------|
| `architecture/overview.md` | New content | 3-layer architecture flowchart |
| `examples/prompts.md` | Spec FR-019 | None |
| `extending/new-entity-types.md` | New content | Taxonomy inheritance diagram |
| `user-guide/retention.md` | TaxonomyExpert | Retention lifecycle state diagram |

---

## Diagram Specifications

### Required Mermaid Diagrams

1. **System Architecture** (`architecture/overview.md`)
   - Type: Flowchart
   - Shows: Intent → Expertise → Execution layers
   - Subgraphs: Each layer with components

2. **Upload Workflow** (`user-guide/uploading.md`)
   - Type: Sequence diagram
   - Actors: User, Skill, TaxonomyExpert, PaperlessClient, paperless-ngx

3. **Retention Lifecycle** (`user-guide/retention.md`)
   - Type: State diagram
   - States: Active → Archive Ready → Archived → Delete Eligible → Deleted

4. **Taxonomy Inheritance** (`extending/taxonomies.md`)
   - Type: Flowchart
   - Shows: Base → Country → Entity → Custom overlay pattern

5. **Agent Collaboration** (`reference/agents.md`)
   - Type: Flowchart
   - Shows: Annual Records Review workflow with agent handoffs

6. **Deletion Safety** (`user-guide/workflows.md`)
   - Type: Sequence diagram
   - Shows: User request → Deletion Auditor → Approval → Execution

7. **Trust Document Relationships** (`user-guide/trusts.md`)
   - Type: ER diagram
   - Entities: Trust, FTE, Trust Deed, Distribution Minutes

---

## State Transitions

### Documentation Page Lifecycle

```
[Draft] --> [Review] --> [Published] --> [Updated] --> [Published]
                                   |
                                   v
                              [Deprecated] --> [Archived]
```

**States:**
- **Draft**: Content being written, not in nav
- **Review**: Content complete, pending approval
- **Published**: Live on documentation site
- **Updated**: Content modified, pending rebuild
- **Deprecated**: Marked for removal, warning banner shown
- **Archived**: Removed from nav, still accessible via URL

---

## Validation Rules

### Page Content

1. **Frontmatter** (optional but recommended):
   ```yaml
   ---
   title: Page Title
   description: SEO description
   ---
   ```

2. **Headers**: Must start with H1 (`# Title`), unique per page

3. **Links**: Internal links use relative paths (`../reference/cli.md`)

4. **Images**: Must be in `docs/assets/` or absolute URLs

5. **Code blocks**: Must specify language for syntax highlighting

### Build Validation

- No broken internal links
- All images resolve
- No duplicate nav entries
- All required pages present
- Mermaid diagrams parse correctly
