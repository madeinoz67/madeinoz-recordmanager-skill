---
name: Records Manager Skill
pack-id: madeinoz-recordmanager-skill-v2.0.0
version: 2.0.0
author: madeinoz67
description: Expert record keeping system with paperless-ngx integration, hierarchical taxonomies, and intelligent document management
type: skill
purpose-type: [productivity, automation, organization]
platform: agnostic
dependencies: []
keywords: [records, management, paperless-ngx, documents, hierarchical-taxonomy, archiving, household, corporate, compliance]
---

<p align="center">
  <img src="icons/madeinoz-recordmanager-skill.svg" alt="Records Manager Skill" width="256">
</p>

# Records Manager Skill

[![Documentation](https://github.com/madeinoz67/madeinoz-recordmanager-skill/actions/workflows/docs.yml/badge.svg)](https://github.com/madeinoz67/madeinoz-recordmanager-skill/actions/workflows/docs.yml)

> Expert record keeping system with **hierarchical taxonomies**, paperless-ngx integration, country-specific compliance, and intelligent document management

## Quick Start

```bash
# Clone to PAI skills directory
git clone https://github.com/madeinoz67/madeinoz-recordmanager-skill.git ~/.claude/skills/RecordsManager

# Configure environment
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-paperless-url.com"
export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"
export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"

# Verify installation
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts --help
```

## Features

- **🌳 Hierarchical Taxonomies (NEW v2.0)** - Navigate documents through a 4-level structure: Function → Service → Activity → DocumentType
- **🔍 Intelligent Classification** - Autocomplete, fuzzy matching, and keyword search for precise document categorization
- **⚖️ Country-Specific Compliance** - Record keeping guidelines for Australia, US, and UK with legal citations
- **🛡️ Safe Operations** - Deletion confirmation workflow prevents catastrophic data loss
- **📊 Smart Organization** - Automatic tagging, hierarchical storage paths, and retention tracking
- **🤖 Specialized Agents** - Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, and Retention Monitor
- **🔄 Migration Support** - Seamless migration from flat to hierarchical taxonomies with 90%+ automatic mapping

## How It Works

The Records Manager Skill uses a **three-layer architecture**:

1. **Intent Layer** - Detects record keeping intent and routes to workflows
2. **Expertise Layer** - Provides domain-specific knowledge (taxonomies, compliance, trust management)
3. **Execution Layer** - Performs operations via CLI and paperless-ngx API

**Core principle**: Organize once, find forever. Your AI assistant becomes an expert records manager that knows how to properly categorize, tag, and manage documents according to best practices and local requirements.

## Example Usage

### Hierarchical Classification (v2.0)

```bash
# Upload with hierarchical path
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Downloads/medical-receipt.pdf \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"

# Autocomplete partial paths
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete \
  --domain household \
  --path "health/med/cons"

# Search by keywords
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy search \
  --domain household \
  --keywords "dental invoice"

# Navigate hierarchy interactively
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions --domain household
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy services --domain household --function HealthManagement
```

### Traditional Operations

```bash
# Search for documents
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --tags "Function:HealthManagement,DocumentType:MedicalReceipt" \
  --domain household

# Check retention status
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
```

**Deletion Safety**: All deletions require explicit confirmation through the Deletion Auditor agent - cannot be bypassed.

**What's New in v2.0**: Hierarchical taxonomies provide 4-level classification (Function → Service → Activity → DocumentType) with autocomplete, fuzzy matching, and automatic tag generation. See [Hierarchical Taxonomies Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/user-guide/hierarchical-taxonomies/) for details.

## Taxonomy Management

Keep your paperless-ngx instance synchronized with the latest taxonomy definitions:

```bash
# Check for available updates (read-only, safe to run anytime)
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts check-updates \
  --country Australia

# Apply updates WITHOUT retention changes
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies \
  --country Australia

# Apply updates WITH retention changes (requires explicit approval)
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies \
  --country Australia \
  --approve-retention-changes

# View taxonomy version history
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies
```

**Why This Matters:**
- **Compliance Safety** - Retention changes require explicit approval to prevent accidental compliance violations
- **Atomic Updates** - All changes rollback on failure (no partial state)
- **Audit Trail** - All changes logged to `$PAI_HOME/MEMORY/RECORDSMANAGER/`
- **Single Source of Truth** - All taxonomies come from `src/skills/RecordsManager/Config/taxonomies.yaml`

**CRITICAL**: Never bypass these commands by:
- ❌ Making direct API calls to create tags/document types
- ❌ Manually adding taxonomies through paperless-ngx UI
- ❌ Writing custom scripts that bypass the CLI
- ❌ Using TaxonomyInstaller methods directly without CLI wrapper

See [Taxonomy Update Workflow](https://madeinoz67.github.io/madeinoz-recordmanager-skill/workflows/taxonomy-update/) for complete documentation.

## Documentation

📖 **[Full Documentation](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)**

### Getting Started
- **[Installation Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/getting-started/installation/)** - Complete setup instructions
- **[Developer Quickstart](https://madeinoz67.github.io/madeinoz-recordmanager-skill/getting-started/developer-quickstart/)** - 10-minute quick start for developers

### User Guides
- **[Hierarchical Taxonomies](https://madeinoz67.github.io/madeinoz-recordmanager-skill/user-guide/hierarchical-taxonomies/)** - NEW v2.0: 4-level classification system
- **[User Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/user-guide/)** - Daily workflows and operations
- **[Retention & Compliance](https://madeinoz67.github.io/madeinoz-recordmanager-skill/user-guide/retention/)** - Country-specific requirements

### Reference
- **[API Reference](https://madeinoz67.github.io/madeinoz-recordmanager-skill/reference/api-reference/)** - TaxonomyExpert complete API
- **[CLI Reference](https://madeinoz67.github.io/madeinoz-recordmanager-skill/reference/cli/)** - Complete command documentation
- **[Architecture](https://madeinoz67.github.io/madeinoz-recordmanager-skill/architecture/)** - System design and diagrams

### Tutorials
- **[Migration Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/tutorials/migration-guide/)** - Migrate from flat to hierarchical taxonomies
- **[Contributing Taxonomies](https://madeinoz67.github.io/madeinoz-recordmanager-skill/extending/contributing-taxonomies/)** - Add new hierarchical paths
- **[Tutorials](https://madeinoz67.github.io/madeinoz-recordmanager-skill/tutorials/)** - Step-by-step guides

## For AI Assistants 🤖

**If you are an AI coding assistant (Claude, Cursor, Copilot, etc.), read [INSTALL.md](./INSTALL.md) before attempting installation.**

The INSTALL.md file contains:
- Prerequisites and dependencies
- Pre-installation system analysis
- Step-by-step installation workflow
- Environment variable configuration
- Verification and testing procedures
- Troubleshooting common issues

## Configuration

**Environment Variables** (required):

```bash
# Paperless-ngx connection
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-paperless-url.com"
export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"

# Records Manager settings
export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"  # Australia | US | UK
export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"  # household | corporate | unit-trust | discretionary-trust | family-trust | project
```

See [Environment Variables Reference](https://madeinoz67.github.io/madeinoz-recordmanager-skill/configuration/environment/) for complete configuration options.

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Skill definition | `src/skills/RecordsManager/SKILL.md` | Main skill routing and workflow definitions |
| Paperless API client | `src/lib/PaperlessClient.ts` | Complete paperless-ngx API integration |
| Taxonomy expert | `src/lib/TaxonomyExpert.ts` | Country-specific record keeping taxonomies |
| Trust expert | `src/lib/TrustExpert.ts` | Trust document management (FTE, deeds) |
| Record manager CLI | `src/skills/RecordsManager/Tools/RecordManager.ts` | Main CLI tool for all record operations |
| Delete confirmation | `src/workflows/DeleteConfirmation.md` | Mandatory workflow for deletion approval |
| Test suite | `src/tests/RecordManager.test.ts` | Comprehensive test coverage |

**Summary:**
- **Files**: 7 core components
- **Skills**: 1 registered skill
- **Dependencies**: None (uses bun runtime)
- **External services**: paperless-ngx instance required

## Design Principles

1. **Safety First** - Deletion requires explicit approval through Deletion Auditor
2. **Taxonomy-Driven** - Structure emerges from domain expertise, not ad-hoc decisions
3. **Country-Aware** - Record keeping rules vary by jurisdiction
4. **Search-Optimized** - Structures designed for finding, not just storing
5. **Complete** - Every component from API client to confirmation workflow included

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code contribution guidelines
- Documentation development workflow
- Testing and pull request process
- Local preview setup (`mkdocs serve`)

## License

MIT License - see [LICENSE](LICENSE) for details

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) or [Changelog Documentation](https://madeinoz67.github.io/madeinoz-recordmanager-skill/reference/changelog/) for version history.

### Latest Release: v2.0.0 (2026-01-22)

**Major Features:**
- 🌳 **Hierarchical Taxonomy System** - 4-level classification: Function → Service → Activity → DocumentType
- 🔍 **Smart Classification** - Autocomplete, fuzzy matching, and keyword search
- 📊 **Automatic Tag Generation** - Hierarchical tags and filesystem-safe storage paths
- 🔄 **Migration Support** - 90%+ automatic mapping from flat to hierarchical taxonomies
- ⚖️ **Enhanced Retention** - Full hierarchical context for retention requirements

**Documentation:**
- Comprehensive API reference for TaxonomyExpert (31 methods)
- Developer quickstart guide (10-minute setup)
- Migration guide for existing installations
- Contributing guide for new taxonomies
- Troubleshooting section for hierarchical taxonomies

**Breaking Changes:**
- Country codes normalized to ISO 3166-1 alpha-3 (AU→AUS, US→USA, UK→GBR)
- Hierarchical taxonomy is now the default mode
- Flat taxonomy methods deprecated (12-month transition period)

**See [Migration Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/tutorials/migration-guide/) for upgrade instructions.**

---

**Links**:
- [Documentation](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)
- [GitHub Repository](https://github.com/madeinoz67/madeinoz-recordmanager-skill)
- [Issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)
- [paperless-ngx](https://docs.paperless-ngx.com/)
