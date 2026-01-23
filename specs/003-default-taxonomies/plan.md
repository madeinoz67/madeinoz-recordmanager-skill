# Implementation Plan: Default Taxonomies with Hierarchical Structure

**Branch**: `003-default-taxonomies` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-default-taxonomies/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement comprehensive default taxonomies for all entity types using a hierarchical Function → Service → Activity → Document Types model, enabling operational coverage beyond compliance while maintaining backwards compatibility with existing flat document type lists during a 12-month transition period.

## Technical Context

**Language/Version**: TypeScript with bun runtime (existing project standard)
**Primary Dependencies**: Existing Records Manager Skill (TaxonomyExpert, PaperlessClient, RecordManager CLI)
**Storage**: paperless-ngx PostgreSQL database via REST API (existing integration)
**Testing**: bun test with existing test infrastructure
**Target Platform**: macOS/Linux CLI (PAI environment)
**Project Type**: Single project (CLI tool with library modules)
**Performance Goals**: Best-effort API operation latency (no specific targets per clarification Q3)
**Constraints**:
- Must maintain backwards compatibility with flat model for 12-month transition period
- CLI must support both interactive drill-down and path-based input
- Migration must auto-map 90%+ of documents via mapping table
- Zero data loss during migration
**Scale/Scope**:
- 7 entity types (household, corporate, 4 trust types, project)
- ~8-12 Functions per entity type
- ~3-5 Services per Function
- ~2-4 Activities per Service
- Estimated 200-400 total hierarchical paths per entity type

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance Status | Notes |
|-----------|------------------|-------|
| **I. Safety-First Architecture** | ✅ PASS | No deletion operations in this feature. All operations are additive (creating taxonomies, migrating classifications). |
| **II. Taxonomy-Driven Organization** | ✅ PASS | Core purpose of this feature is to enhance taxonomy structure. Maintains TaxonomyExpert as source of truth. |
| **III. Compliance-Aware Retention** | ✅ PASS | Migration must preserve retention rules. Mapping strategy explicitly maintains compliance requirements (SC-056). |
| **IV. Three-Layer Separation** | ✅ PASS | Changes isolated to Expertise Layer (TaxonomyExpert extension). No changes to Intent Layer routing or Execution Layer API. |
| **V. Environment Variable Standards** | ✅ PASS | No new environment variables required. Uses existing `MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY` for country-specific taxonomies. |
| **VI. CLI-First Interface** | ✅ PASS | Hybrid CLI navigation (FR-059 to FR-063) maintains CLI-first principle with both interactive and path-based interfaces. |
| **VII. Codanna-First Code Intelligence** | ✅ PASS | Development will use Codanna for code exploration and impact analysis on TaxonomyExpert modifications. |

**GATE RESULT (Initial)**: ✅ ALL GATES PASSED - No constitutional violations. Proceed to Phase 0 research.

### Post-Design Re-Evaluation

*Re-checked after Phase 1 design artifacts (research.md, data-model.md, contracts/taxonomy-api.ts, quickstart.md)*

| Principle | Post-Design Status | Design Artifact Verification |
|-----------|-------------------|------------------------------|
| **I. Safety-First Architecture** | ✅ PASS | No deletion operations introduced in contracts/taxonomy-api.ts. Migration preserves audit trail (DocumentMappingEntry). |
| **II. Taxonomy-Driven Organization** | ✅ PASS | HierarchicalTaxonomy entity maintains TaxonomyExpert as source of truth. All navigation methods query taxonomy structure. |
| **III. Compliance-Aware Retention** | ✅ PASS | RetentionRule entity includes country-specific retention with legal authority. Migration validates retention preservation (SC-056). |
| **IV. Three-Layer Separation** | ✅ PASS | HierarchicalTaxonomyAPI extends Expertise Layer only. No PaperlessClient changes. CLI changes limited to navigation. |
| **V. Environment Variable Standards** | ✅ PASS | TaxonomyMode uses existing environment pattern. No new variables beyond optional TAXONOMY_MODE flag. |
| **VI. CLI-First Interface** | ✅ PASS | CLINavigationAPI provides complete CLI interface for all hierarchical operations (interactive + path-based). |
| **VII. Codanna-First Code Intelligence** | ✅ PASS | quickstart.md documents Codanna usage for code exploration. Development workflow prioritizes Codanna CLI. |

**GATE RESULT (Final)**: ✅ ALL GATES PASSED - Design maintains full constitutional compliance. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-default-taxonomies/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── taxonomy-api.ts  # TypeScript interface definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── TaxonomyExpert.ts           # MODIFIED - Add hierarchical taxonomy support
│   ├── TaxonomyInstaller.ts        # NEW - Installation and migration logic
│   └── types/
│       └── HierarchicalTaxonomy.ts # NEW - Type definitions for Function/Service/Activity
│
└── skills/RecordsManager/
    └── Tools/
        └── RecordManager.ts        # MODIFIED - Add hierarchical navigation CLI commands

tests/
├── TaxonomyExpert.test.ts          # MODIFIED - Add hierarchical taxonomy tests
├── TaxonomyInstaller.test.ts       # NEW - Installation and migration tests
└── fixtures/
    └── hierarchical-taxonomies/    # NEW - Sample taxonomy data for testing
        ├── household.json
        ├── corporate.json
        └── trusts.json
```

**Structure Decision**: Single project structure (existing). Changes focused on:
1. Extending TaxonomyExpert library with hierarchical support
2. Adding TaxonomyInstaller for installation/migration workflows
3. Enhancing RecordManager CLI with hybrid navigation
4. Type definitions in centralized types/ directory

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations detected. No complexity justification required.
