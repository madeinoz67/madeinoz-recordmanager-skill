# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Records Manager Skill** - a PAI (Personal AI Infrastructure) pack that provides expert record keeping with paperless-ngx integration, country-specific taxonomies, and intelligent document management. It's designed to be installed into a PAI environment.

## Commands

**Run tests:**
```bash
bun test                                    # Run all tests
bun test src/tests/RecordManager.test.ts   # Run specific test file
```

**Type checking:**
```bash
bun build src/lib/PaperlessClient.ts --outdir /tmp/test-build  # Verify TypeScript compiles
```

**Run the CLI tool (requires PAI installation):**
```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts --help
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload <file> --domain household
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --query "invoice"
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain corporate
```

## Architecture

### Three-Layer Design

```
1. INTENT LAYER (SKILL.md)
   └── Detects record keeping intent, routes to workflows

2. EXPERTISE LAYER (src/lib/)
   ├── TaxonomyExpert.ts  - Country-specific retention rules (AU/US/UK)
   ├── TrustExpert.ts     - ATO-compliant trust document management
   ├── WorkflowExpert.ts  - Automated workflow recommendations
   ├── EntityCreator.ts   - Dynamic entity creation (households, trusts, etc.)
   └── SensitivityExpert.ts - Document sensitivity classification

3. EXECUTION LAYER
   ├── PaperlessClient.ts - Full paperless-ngx API wrapper (NO DELETE methods)
   └── RecordManager.ts   - CLI tool for all operations
```

### Key Safety Design

**PaperlessClient has NO delete methods** - deletion requires the `DeleteConfirmation` workflow (`src/workflows/DeleteConfirmation.md`) which mandates explicit user confirmation. This prevents catastrophic data loss.

### Entity Types

The system supports multiple entity types: `household`, `corporate`, `unit-trust`, `discretionary-trust`, `family-trust`, `project`. Each has specialized taxonomies and retention rules.

### Environment Variables

All paperless-ngx config uses `MADEINOZ_RECORDMANAGER_` prefix:
- `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` - paperless-ngx instance URL
- `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` - API token
- `MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY` - Country for compliance rules
- `MADEINOZ_RECORDMANAGER_RECORDS_DEFAULT_DOMAIN` - Default domain

### File Structure

```
src/
├── lib/                    # Core libraries
│   ├── PaperlessClient.ts  # API wrapper (no delete methods)
│   ├── TaxonomyExpert.ts   # Retention rules by country
│   ├── TrustExpert.ts      # Trust-specific compliance
│   ├── WorkflowExpert.ts   # Workflow automation
│   ├── EntityCreator.ts    # Entity management
│   └── SensitivityExpert.ts # Data classification
├── tools/
│   └── RecordManager.ts    # Main CLI tool
├── workflows/
│   └── DeleteConfirmation.md # Required approval workflow
├── tests/                  # Test files (*.test.ts)
└── skills/recordsmanager/
    ├── SKILL.md            # Skill definition with workflow routing
    └── AGENTS.md           # Specialized agent definitions
```

### Specialized Agents

Located in `src/skills/recordsmanager/AGENTS.md`:
- **Records Keeper** - Taxonomy and organization
- **Compliance Guardian** - Legal retention requirements
- **Archive Architect** - Storage strategy
- **Deletion Auditor** - Safety checkpoint (mandatory for all deletions)
- **Sensitivity Scanner** - Data classification
- **Retention Monitor** - Time-based compliance

### Trust Document Retention (Australia)

Family Trust Election (FTE) documents require 5+ year retention **from FTE date, not EOFY**. Trust deeds must be kept forever.

# Codanna Code Intelligence Workflow

## CLI Syntax

Codanna supports both MCP tools and CLI commands with Unix-friendly syntax:

### Simple Commands (positional arguments):
```bash
# Text output (DEFAULT - prefer this to save context)
codanna mcp find_symbol main
codanna mcp get_calls process_file
codanna mcp find_callers init

# JSON output (only when structured data needed)
codanna mcp find_symbol main --json
```

### Complex Commands (key:value pairs):
```bash
# Text output (DEFAULT - prefer this)
codanna mcp search_symbols query:parse limit:10
codanna mcp semantic_search_docs query:"error handling"

# JSON output (only for parsing/piping)
codanna mcp search_symbols query:parse --json | jq '.data[].name'
```

### Important: Prefer TEXT Output
- TEXT output is concise and human-readable
- JSON fills context window quickly (3-5x more tokens)
- Only use `--json` when you need to parse results programmatically
- Default to TEXT for exploration and analysis

---

## Query Optimization

Codanna's semantic search works best with technical terms and specific concepts. Before searching, optimize vague queries:

1. **If vague** (e.g., "that parsing thing") → Make it specific (e.g., "language parser implementation")
2. **If a question** (e.g., "how does parsing work?") → Extract keywords (e.g., "parsing implementation process")
3. **If conversational** (e.g., "the stuff that handles languages") → Use technical terms (e.g., "language handler processor")
4. **If too broad** (e.g., "errors") → Add context (e.g., "error handling exception management")

---

## Search and Explore

### Step 1: Semantic Search

```bash
codanna mcp semantic_search_with_context query:"your search" limit:5
```

Returns:
```
1. unified - Method at src/io/output.rs:257-301 [symbol_id:896]
   Similarity Score: 0.726
   Documentation: Output a UnifiedOutput structure...
```

You get:
- Line ranges: `257-301`
- Symbol ID: `[symbol_id:896]`
- Relevance score (focus on > 0.6)

### Step 2: Read Code

Use line ranges to read only what you need:

**Formula:** `limit = end_line - start_line + 1`

**Example:** For range `257-301`:
```
Read tool with:
  file_path: "src/io/output.rs"
  offset: 257
  limit: 45  (301 - 257 + 1)
```

**Alternative (Unix/macOS):**
```bash
sed -n '257,301p' src/io/output.rs
```

### Step 3: Explore Details

```bash
codanna retrieve describe symbol_id:896
```

Shows full signature, documentation, calls, and callers.

### Step 4: Follow Relationships

```bash
# Who calls it
codanna retrieve callers symbol_id:896

# What it calls
codanna retrieve calls symbol_id:896
```

### Step 5: Refine

Run semantic search again with refined terms.

---

## Quick Reference

**Semantic search (start here):**
```bash
codanna mcp semantic_search_with_context query:"..." limit:5
```

**Explore symbol:**
```bash
codanna retrieve describe <name|symbol_id:XXX>
```

**Relationships:**
```bash
codanna retrieve callers <name|symbol_id:XXX>
codanna retrieve calls <name|symbol_id:XXX>
```

**Direct lookup:**
```bash
codanna retrieve symbol <name>
```

---

## Tips

- Read only line ranges provided (saves tokens)
- Use symbol_id to chain commands
- Add `lang:rust` to filter by language
- Semantic search uses ~500 tokens, targeted reads use ~100-200 tokens
- Use `rg` (ripgrep) for pattern matching when available: `rg "pattern" src/`

---

## Document Search

Search indexed markdown and text files for project documentation:

```bash
codanna mcp search_documents query:"installation guide" limit:5
```

Returns relevant chunks with context and highlighted keywords from:
- README files
- Documentation directories
- Markdown files indexed with the codebase

Use this when searching for:
- Project setup instructions
- Architecture documentation
- API usage examples
- Configuration guides

---

## Multi-Hop Analysis Pattern

For complex features or deep analysis, use iterative exploration rather than single-shot queries.

### Key Principles

1. **Start Broad, Then Deep**: First query maps the landscape, follow-ups drill into specifics
2. **Track Progress**: Use TodoWrite for complex analyses
3. **Score and Iterate**: Mentally score each response (0-10) and identify gaps
4. **Context Preservation**: Each follow-up should reference findings from previous hops

### Context Forward-Passing

Since each query starts fresh, pass forward relevant context from previous discoveries:

**What to Forward:**
- Specific file paths and line numbers discovered
- Struct/function names that need investigation
- Patterns or conventions identified
- Key findings that narrow the search scope
- Relationships between components

**Example:**
```
"CONTEXT FROM PREVIOUS ANALYSIS:
- The Symbol struct at src/types/symbol.rs:45 already has Serialize/Deserialize
- Main output logic is in src/main.rs lines 901-1684
- Found 14 commands using direct println! calls

Now focus on: [specific targeted request based on above context]"
```

### Common Multi-Hop Patterns

#### Pattern 1: Architecture → Details → Examples
```
Hop 1: "Map the architecture of [feature]"
Hop 2: "Drill into specific implementations of [component]"
Hop 3: "Show concrete examples of [pattern]"
```

#### Pattern 2: Current State → Impact → Migration
```
Hop 1: "Analyze current implementation of [system]"
Hop 2: "Identify all dependencies and touchpoints"
Hop 3: "Propose migration strategy with examples"
```

#### Pattern 3: Search → Filter → Deep Dive
```
Hop 1: "Find all occurrences of [pattern]"
Hop 2: "Filter to [specific criteria]"
Hop 3: "Analyze top candidates in detail"
```

### Red Flags Requiring Follow-Up

- Agent says "I found some examples" without specifics → Ask for line numbers
- Agent provides high-level description → Ask for code snippets
- Agent analyzes structure but not patterns → Ask for pattern analysis
- Agent misses complexity assessment → Ask for difficulty ratings
- Report feels incomplete (score <8) → Identify gaps and iterate

## Active Technologies
- Python 3.11+ (MkDocs runtime), Markdown (content), YAML (configuration) + mkdocs-material, mkdocs-minify-plugin, mkdocs-git-revision-date-localized-plugin, pymdownx.superfences (Mermaid) (001-mkdocs-documentation)
- Static files on GitHub Pages (no database) (001-mkdocs-documentation)

## Recent Changes
- 001-mkdocs-documentation: Added Python 3.11+ (MkDocs runtime), Markdown (content), YAML (configuration) + mkdocs-material, mkdocs-minify-plugin, mkdocs-git-revision-date-localized-plugin, pymdownx.superfences (Mermaid)
