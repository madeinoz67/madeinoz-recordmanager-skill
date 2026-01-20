# Implementation Plan: MkDocs Material Documentation Site

**Branch**: `001-mkdocs-documentation` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mkdocs-documentation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a public MkDocs Material documentation site with GitHub Actions auto-deployment to GitHub Pages. The site will host comprehensive project documentation including installation guides, user tutorials, API reference, architecture diagrams (Mermaid), and taxonomy customization guides. Python 3.11+ runs MkDocs, which generates static HTML for GitHub Pages hosting.

## Technical Context

**Language/Version**: Python 3.11+ (MkDocs runtime), Markdown (content), YAML (configuration)
**Primary Dependencies**: mkdocs-material, mkdocs-minify-plugin, mkdocs-git-revision-date-localized-plugin, pymdownx.superfences (Mermaid)
**Storage**: Static files on GitHub Pages (no database)
**Testing**: Visual validation (mkdocs serve local preview), link checker (optional)
**Target Platform**: GitHub Pages (static hosting), modern browsers (Chrome, Firefox, Safari)
**Project Type**: single (documentation build system + content)
**Performance Goals**: Site loads within 3 seconds, search results within 2 seconds
**Constraints**: GitHub Actions workflow timeout (10 min), GitHub Pages storage (1GB)
**Scale/Scope**: ~50-100 documentation pages, 7 main sections, 3-level navigation depth

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I - Safety-First Architecture
**Status**: ✅ PASS - No destructive operations in documentation system

Documentation is read-only with respect to the Records Manager skill functionality. No deletions or modifications to paperless-ngx data occur.

### Principle II - Taxonomy-Driven Organization
**Status**: ✅ PASS - Documentation will include taxonomy extension guides

The documentation site will include:
- Section: "Extending > Taxonomies" with entity creation and customization guides
- Section: "Reference > Taxonomy Data Structure" explaining retention rules and compliance
- Tutorial: "Adding Custom Entity Types" with code examples

### Principle III - Compliance-Aware Retention
**Status**: ✅ PASS - Documentation will explain retention requirements

Documentation will cover:
- Trust document retention rules (AU FTE 5+ years from election date)
- Retention check workflows with example prompts
- Compliance monitoring workflows

### Principle IV - Three-Layer Separation
**Status**: ✅ PASS - Documentation is orthogonal to execution layer

Documentation site does not modify skill architecture. It documents existing layers:
- Intent Layer (SKILL.md) → docs/user-guide/workflows.md
- Expertise Layer (lib/) → docs/extending/taxonomies.md
- Execution Layer (CLI) → docs/reference/cli.md

### Principle V - Environment Variable Standards
**Status**: ✅ PASS - Documentation will reference existing env var standards

Documentation will include:
- Complete environment variable reference in docs/configuration/environment.md
- All variables follow `MADEINOZ_RECORDMANAGER_` prefix
- Instructions for configuring .env files

### Principle VI - CLI-First Interface
**Status**: ✅ PASS - Documentation will emphasize CLI usage

Documentation will include:
- Complete CLI command reference in docs/reference/cli.md
- Example prompts organized by category (7 categories, 3+ examples each)
- Tutorials using CLI commands for all workflows

### Principle VII - Codanna-First Code Intelligence
**Status**: ✅ PASS - Documentation is content, not code changes

No code modifications to Records Manager skill. Documentation uses Codanna for exploring codebase but does not modify Codanna integration.

**Overall GATE Status**: ✅ ALL PRINCIPLES SATISFIED

## Project Structure

### Documentation (this feature)

```text
specs/001-mkdocs-documentation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── spec.md              # Feature specification (input)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Root directory (documentation build system)
.github/
└── workflows/
    └── ci.yml                  # GitHub Actions workflow for auto-deployment

docs/                            # MkDocs content directory
├── index.md                     # Homepage
├── getting-started/
│   ├── installation.md         # Installation guide for humans and AI
│   ├── prerequisites.md        # System requirements
│   └── quickstart.md           # First upload tutorial
├── user-guide/
│   ├── workflows.md            # Skill workflow documentation
│   ├── daily-usage.md          # Common tasks and operations
│   ├── search.md               # Document search workflows
│   ├── tagging.md              # Tag-based organization
│   ├── retention.md            # Retention checking and compliance
│   └── trusts.md               # Trust document handling (FTE, deeds)
├── configuration/
│   ├── environment.md          # Environment variable reference
│   ├── paperless-setup.md      # paperless-ngx configuration
│   └── country-selection.md    # Country-specific compliance (AU/US/UK)
├── tutorials/
│   ├── first-upload.md         # Step-by-step upload tutorial
│   ├── entity-creation.md      # Creating custom entities
│   ├── retention-check.md      # Checking retention status
│   └── batch-import.md         # Bulk document import
├── reference/
│   ├── cli.md                  # CLI command reference
│   ├── agents.md               # Specialized agent types
│   ├── taxonomy-data-structure.md # Taxonomy format reference
│   └── changelog.md            # Version history (from CHANGELOG.md)
├── extending/
│   ├── taxonomies.md           # Taxonomy system overview
│   ├── custom-entities.md      # Adding new entity types
│   ├── custom-taxonomies.md    # Creating custom taxonomies
│   └── validation.md           # Testing custom configurations
├── architecture/
│   ├── overview.md             # System architecture diagrams (Mermaid)
│   ├── layers.md               # Three-layer architecture
│   ├── upload-workflow.md      # Document upload flow
│   └── retention-lifecycle.md  # Retention state transitions
├── assets/
│   └── images/                 # Diagrams, screenshots
├── javascripts/                # Custom JavaScript (optional)
└── stylesheets/                # Custom CSS overrides (optional)

mkdocs.yml                       # MkDocs configuration
requirements.txt                 # Python dependencies
README.md                        # Refactored to be concise (< 300 lines)
INSTALL.md                       # AI assistant installation guide
CHANGELOG.md                     # Version history (Keep a Changelog format)

src/                             # Existing Records Manager skill (unchanged)
├── skills/RecordsManager/
├── lib/
├── tests/
└── workflows/
```

**Structure Decision**: Single project structure with documentation system in root directory. No backend/frontend split needed - MkDocs generates static HTML. The `docs/` directory contains all documentation content, `mkdocs.yml` configures the build system, and GitHub Actions workflow handles deployment. Existing `src/` structure for the Records Manager skill remains unchanged.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. This section is intentionally blank.

---

**End of Implementation Plan Template**
