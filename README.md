---
name: Records Manager Skill
pack-id: madeinoz-recordmanager-skill-v1.2.0
version: 1.2.0
author: madeinoz67
description: Subject matter expert in record keeping and paperless-ngx API integration with country-specific taxonomies and deletion confirmation safeguards
type: skill
purpose-type: [productivity, automation, organization]
platform: agnostic
dependencies: []
keywords: [records, management, paperless-ngx, documents, taxonomy, archiving, household, corporate, compliance]
---

<p align="center">
  <img src="icons/madeinoz-recordmanager-skill.svg" alt="Records Manager Skill" width="256">
</p>

# Records Manager Skill

[![Documentation](https://github.com/madeinoz67/madeinoz-recordmanager-skill/actions/workflows/docs.yml/badge.svg)](https://github.com/madeinoz67/madeinoz-recordmanager-skill/actions/workflows/docs.yml)

> Expert record keeping system with paperless-ngx integration, country-specific taxonomies, and intelligent document management

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

- **Intelligent Document Organization** - Automatic tagging, categorization, and taxonomic structure
- **Country-Specific Compliance** - Record keeping guidelines for Australia, US, and UK
- **Safe Operations** - Deletion confirmation workflow prevents catastrophic data loss
- **Search Optimization** - Data structures optimized for finding relevant documents quickly
- **Expert Taxonomies** - Household, corporate, trust, and project management record structures
- **Specialized Agents** - Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, and Retention Monitor

## How It Works

The Records Manager Skill uses a **three-layer architecture**:

1. **Intent Layer** - Detects record keeping intent and routes to workflows
2. **Expertise Layer** - Provides domain-specific knowledge (taxonomies, compliance, trust management)
3. **Execution Layer** - Performs operations via CLI and paperless-ngx API

**Core principle**: Organize once, find forever. Your AI assistant becomes an expert records manager that knows how to properly categorize, tag, and manage documents according to best practices and local requirements.

## Example Usage

```bash
# Upload document with intelligent tagging
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Downloads/invoice.pdf \
  --domain household

# Search for documents
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --tags "invoice,2024" \
  --domain household

# Check retention status
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain household
```

**Deletion Safety**: All deletions require explicit confirmation through the Deletion Auditor agent - cannot be bypassed.

## Documentation

📖 **[Full Documentation](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)**

- **[Installation Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/getting-started/installation/)** - Complete setup instructions
- **[User Guide](https://madeinoz67.github.io/madeinoz-recordmanager-skill/user-guide/)** - Daily workflows and operations
- **[CLI Reference](https://madeinoz67.github.io/madeinoz-recordmanager-skill/reference/cli/)** - Complete command documentation
- **[Architecture](https://madeinoz67.github.io/madeinoz-recordmanager-skill/architecture/)** - System design and diagrams
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

### Latest Release: v1.2.0 (2026-01-20)

- Added `status` command for connection testing
- Added StatusCheck workflow for skill-based verification
- Updated documentation with MkDocs Material theme
- Added comprehensive architecture diagrams

---

**Links**:
- [Documentation](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)
- [GitHub Repository](https://github.com/madeinoz67/madeinoz-recordmanager-skill)
- [Issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)
- [paperless-ngx](https://docs.paperless-ngx.com/)
