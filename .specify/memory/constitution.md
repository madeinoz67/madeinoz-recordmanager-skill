<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.2 → 1.1.3 (PATCH - added PAI_DIR pattern to environment standards)

Modified Principles:
- V. Environment Variable Standards: Added mandatory PAI_DIR pattern requirement

Added Sections: None

Removed Sections: None

Templates Requiring Updates:
- ✅ plan-template.md - No changes needed (generic guidance)
- ✅ spec-template.md - No changes needed (feature-level, not implementation)
- ✅ tasks-template.md - No changes needed (task organization unchanged)
- ✅ checklist-template.md - No changes needed (validation patterns unchanged)
- ✅ agent-file-template.md - No changes needed (agent structure unchanged)

Follow-up TODOs: None
-->

# Records Manager Skill Constitution

## Core Principles

### I. Safety-First Architecture

All document operations MUST prioritize data preservation over convenience:
- Deletion MUST require explicit confirmation via the DeleteConfirmation workflow
- PaperlessClient library MUST NOT implement delete methods directly
- All destructive operations MUST be logged to an audit trail
- Batch operations MUST preview affected documents before execution

**Rationale:** Digital records are often irreplaceable. Tax documents, legal papers, and trust documents cannot be recovered once deleted. The architecture enforces safety at the API client level.

### II. Taxonomy-Driven Organization

Document management MUST be driven by expert taxonomies, not ad-hoc decisions:
- All document uploads MUST receive tag suggestions from TaxonomyExpert
- Country-specific retention rules MUST be enforced (AU, US, UK supported)
- Entity types (household, corporate, trusts) MUST have distinct taxonomies
- Search optimization MUST be prioritized over hierarchical nesting

**Rationale:** Consistent taxonomy transforms storage into searchable knowledge. Expert-driven structure prevents the gradual degradation of organizational quality.

### III. Compliance-Aware Retention

Retention requirements MUST be treated as legally binding:
- TaxonomyExpert MUST provide retention periods for all document types
- Trust documents (FTE) MUST calculate retention from FTE date, not EOFY
- Deletion requests MUST check retention requirements before proceeding
- Retention warnings MUST be surfaced before any destructive operation

**Rationale:** Record retention has legal weight. Australian FTE documents require 5+ year retention from the election date. Incorrect retention can result in audit failures and penalties.

### IV. Three-Layer Separation

The skill MUST maintain clear separation between layers:
- **Intent Layer** (SKILL.md): Workflow routing and context detection
- **Expertise Layer** (lib/): TaxonomyExpert, TrustExpert, WorkflowExpert
- **Execution Layer**: PaperlessClient API wrapper and RecordManager CLI

Each layer MUST be independently testable and MUST NOT bypass adjacent layers.

**Rationale:** Separation of concerns enables independent evolution of routing logic, domain expertise, and API operations. Breaking this separation creates hidden dependencies.

### V. Environment Variable Standards

All configuration MUST follow the established prefix convention:
- Environment variables MUST use `MADEINOZ_RECORDMANAGER_` prefix
- Paperless-ngx connection MUST be configured via environment variables
- Country and domain defaults MUST be configurable without code changes
- Sensitive credentials MUST NEVER be committed to version control

**PAI Directory Resolution:**
- All code MUST use the pattern: `process.env.PAI_DIR || '~/.claude'`
- MUST NOT include `PAI_HOME` fallback (deprecated pattern)
- This aligns with PAI core skills (Art, System) for consistency

**Rationale:** Consistent naming prevents conflicts with other PAI skills. Environment-based configuration enables secure deployment across different instances. The PAI_DIR pattern matches core PAI conventions established in the broader ecosystem.

### VI. CLI-First Interface

All functionality MUST be accessible via the RecordManager CLI tool:
- Every workflow MUST have a corresponding CLI command
- CLI output MUST support both human-readable and JSON formats
- CLI MUST provide meaningful exit codes for scripting
- CLI MUST refuse to execute destructive operations directly

**Rationale:** CLI-first ensures automatable, scriptable operations. Direct workflow invocation for deletions enforces the safety principle.

### VII. Codanna-First Code Intelligence

Code exploration and analysis MUST prioritize Codanna CLI over standard tools:
- Symbol lookup MUST use `codanna retrieve symbol <name>` instead of grep/ripgrep
- Caller/callee analysis MUST use `codanna retrieve callers` / `codanna retrieve calls`
- Symbol exploration MUST use `codanna retrieve describe <name|symbol_id:XXX>`
- Documentation search MUST use `codanna documents search <query>` for markdown/text files
- Impact analysis MUST use Codanna analyze_impact for dependency graphs
- Standard tools (grep, find, rg) MAY be used only when Codanna index is unavailable

**Codanna CLI Priority Order:**
1. `codanna retrieve describe <name>` - Start here for symbol exploration with full context
2. `codanna retrieve symbol <name>` - Direct symbol lookup by name
3. `codanna retrieve callers <name|symbol_id:XXX>` - Who calls this function
4. `codanna retrieve calls <name|symbol_id:XXX>` - What this function calls
5. `codanna documents search <query>` - Search indexed markdown and documentation
6. Codanna semantic search - Broad exploration with natural language
7. Codanna analyze_impact - Full dependency graph before refactoring

**Output Format Preference:**
- TEXT output (default) MUST be preferred to conserve context window
- JSON output (`--json` flag) SHOULD only be used when parsing results programmatically

**Rationale:** Codanna provides semantic code intelligence with symbol IDs, line ranges, and relationship graphs that grep/find cannot provide. Using standard tools when Codanna is available wastes context on imprecise results and misses architectural insights.

## Data Safety & Compliance

### Trust Document Requirements

Trust-specific compliance rules that MUST be enforced:

| Trust Type | Critical Documents | Retention Rule |
|------------|-------------------|----------------|
| Family Trust | FTE, Trust Deed | FTE: 5 years from election date |
| Discretionary | Trustee Resolution | Annual, pre-EOFY |
| Unit Trust | Unit Registry | Lifetime of trust |
| All Trusts | Distribution Minutes | 7 years from distribution |

### Deletion Safeguards

The DeleteConfirmation workflow MUST enforce:
1. Display of all documents to be deleted
2. Retention period check for each document
3. Warning for documents within retention period
4. Exact confirmation phrase requirement
5. Audit log entry regardless of outcome

Acceptable confirmation: "I understand this cannot be undone and I want to proceed with deleting N documents"

NOT acceptable: "yes", "do it", "proceed", "delete them", or any casual confirmation

## Development Workflow

### Test Requirements

- New functionality MUST include test coverage
- Tests MUST be written before implementation (TDD)
- PaperlessClient changes MUST NOT add delete methods
- Workflow changes MUST update SKILL.md routing table

### Code Organization

- Libraries belong in `src/lib/`
- CLI tools belong in `src/skills/RecordsManager/Tools/`
- Workflows belong in `src/workflows/`
- Tests belong in `src/tests/`

### Code Intelligence Workflow

When exploring or modifying code:
1. Start with `codanna retrieve describe <name>` for symbol exploration
2. Use symbol IDs from results for precise lookups (`symbol_id:XXX`)
3. Read only the line ranges provided (saves tokens)
4. Use `codanna retrieve callers` / `codanna retrieve calls` for relationships
5. Fall back to grep/find only if Codanna index is unavailable or stale

### Documentation

- Workflow routing changes MUST update SKILL.md
- New entity types MUST document required fields
- Retention rule changes MUST cite legal authority

## Governance

This constitution supersedes all other practices for the Records Manager Skill:
- All changes MUST verify compliance with these principles
- Amendments require documentation of rationale
- Migration plan required for breaking changes
- Complexity additions MUST be justified against these principles

Use CLAUDE.md and SKILL.md for runtime development guidance.

**Version**: 1.1.3 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-23
