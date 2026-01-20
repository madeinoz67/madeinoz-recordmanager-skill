# Records Manager Skill

> Expert record keeping system with paperless-ngx integration, country-specific taxonomies, and intelligent document management

[![PAI Pack](https://img.shields.io/badge/PAI-Pack-purple)](https://github.com/danielmiessler/PAI)
[![Version](https://img.shields.io/badge/version-1.2.0-blue)](https://github.com/madeinoz67/madeinoz-recordmanager-skill)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/madeinoz67/madeinoz-recordmanager-skill/blob/main/LICENSE)

---

!!! warning "DISCLAIMER: Use at Your Own Risk"

    **The project owner and contributors are NOT responsible for any data loss, accidental deletions, or damages caused by using this software.**

    This tool interacts with your paperless-ngx instance and can delete documents. Despite safety features including:

    *   Mandatory deletion confirmation workflows
    *   Deletion Auditor agent approval requirements
    *   Explicit confirmation prompts

    **You are solely responsible for:**

    *   **Backing up your data** before using this tool
    *   **Verifying all deletion operations** before confirming
    *   **Understanding your legal retention requirements**
    *   **Following paperless-ngx security best practices**

    **Before using this tool, you MUST:**

    1. ✅ **Set up a dedicated PAI user** with limited permissions - see [Security Best Practices](configuration/paperless-setup.md#pai-user-security-best-practices)
    2. ✅ **Enable paperless-ngx backup and recovery** - see [paperless-ngx backup documentation](https://docs.paperless-ngx.com/advanced_usage/#backing-up-paperless-ngx)
    3. ✅ **Test the deletion confirmation workflow** in a safe environment
    4. ✅ **Understand that deleted documents cannot be recovered** without a backup

    By using this software, you agree that you have read and understood this disclaimer, and that you have taken appropriate steps to protect your data.

---

## Overview

The Records Manager Skill is a comprehensive document management system that transforms how you organize, search, and retain documents. Built as a PAI (Personal AI Infrastructure) pack, it integrates seamlessly with paperless-ngx to provide intelligent, taxonomy-driven document management for households, businesses, and projects.

**Core principle**: Organize once, find forever. Your AI assistant becomes an expert records manager that knows how to properly categorize, tag, and manage documents according to best practices and local requirements.

---

## Key Features

### Intelligent Document Organization

* Automatic tagging and categorization based on document content

* Domain-specific taxonomies for household, corporate, and project records

* Smart suggestions for document types and metadata

### Country-Specific Compliance

* Record keeping guidelines tailored to your jurisdiction (Australia, US, UK)

* Automatic retention period recommendations

* ATO-compliant trust document management for Australian users

### Safe Operations

* **Mandatory deletion confirmation workflow** prevents catastrophic data loss

* Explicit approval required for any document destruction

* Complete audit trail for compliance and legal protection

### Powerful Search

* Optimized data structures for finding relevant documents quickly

* Search by tags, document types, dates, and content

* Filterable results with retention status indicators

### Specialized Agents

* **Records Keeper** - Taxonomy design and organization

* **Compliance Guardian** - Legal retention requirements

* **Archive Architect** - Storage and retrieval strategy

* **Deletion Auditor** - Safety checkpoint for all deletions

* **Sensitivity Scanner** - Data classification and DLP

* **Retention Monitor** - Time-based compliance tracking

### Extensible Architecture

* Create custom entity types with their own taxonomies

* Define country-specific retention rules

* Add domain-specific tags and categories

---

## Quick Start

1. **Download the latest release** from [GitHub Releases](https://github.com/madeinoz67/madeinoz-recordmanager-skill/releases)

2. **Extract to your Packs directory**:

   ```bash
   mkdir -p ~/pai/Packs
   unzip madeinoz-recordmanager-skill-*.zip -d ~/pai/Packs/
   ```

3. **Open Claude Code in the pack directory**:

   ```bash
   cd ~/pai/Packs/madeinoz-recordmanager-skill
   claude
   ```

4. **Tell the AI**: "Install this pack"

   The AI will handle the rest:
*   Copy the skill to `$PAI_DIR/skills/`
*   Configure environment variables
*   Verify installation

5. **Start managing records**:

   ```
   Upload this invoice and organize it properly
   ```

---

## What's Included

| Component | Description |
|-----------|-------------|
| **Skill Definition** | Intent detection and workflow routing |
| **Paperless API Client** | Complete paperless-ngx integration |
| **Taxonomy Expert** | Country-specific record keeping guidelines |
| **Record Manager CLI** | Command-line tool for all operations |
| **Delete Confirmation** | Mandatory approval workflow for deletions |
| **Specialized Agents** | Six domain expert agents for complex tasks |

---

## Get Started

### [Installation Guide](getting-started/installation.md)

Complete setup instructions for PAI integration and paperless-ngx configuration.

### [Quickstart Tutorial](getting-started/quickstart.md)

Step-by-step walkthrough for uploading your first document with intelligent tagging.

### [Prerequisites](getting-started/prerequisites.md)

System requirements including PAI, paperless-ngx, and Bun runtime.

---

## Documentation Sections

### [User Guide](user-guide/)

Daily workflows for upload, search, tagging, and retention management.

### [Configuration](configuration/)

Environment variables, paperless-ngx setup, and country selection.

### [Tutorials](tutorials/)

Step-by-step guides for common tasks and advanced workflows.

### [API Reference](reference/)

CLI commands, library functions, and agent documentation.

### [Extending](extending/)

Create custom taxonomies, add entity types, and extend the system.

### [Architecture](architecture/)

System design, component interaction, and data flows.

---

## For AI Assistants

If you are an AI coding assistant (Claude, Cursor, Copilot, etc.):

**Read [INSTALL.md](https://github.com/madeinoz67/madeinoz-recordmanager-skill/blob/main/INSTALL.md) before attempting installation.**

---

## Example Usage

### Upload with Intelligent Tagging

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Downloads/medical-bill.pdf \
  --domain household \
  --country Australia

# Skill automatically:
# - Detects document type (Medical Receipt)
# - Suggests tags: medical, receipt, health-insurance
# - Sets retention: 7 years (ATO requirement)
# - Applies household accounting tags
```

### Search by Taxonomy

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --tags "tax,financial,2024" \
  --domain household
```

### Retention Check

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain corporate
```

---

## Architecture

```
User Request
    ↓
┌─────────────────────────────────────────────────────────┐
│  RECORDS MANAGER SKILL                                  │
│  - Triggers on record/document intent                   │
│  - Routes to appropriate workflow                       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  TAXONOMY EXPERT                                        │
│  - Country-specific guidelines                          │
│  - Domain expertise (household/corporate/projects)      │
│  - Suggests tags, types, retention periods              │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  PAPERLESS-NGX API CLIENT                               │
│  - Document upload with OCR                             │
│  - Tag and document type management                     │
│  - Search with filters                                  │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│  DELETION CONFIRMATION (SPECIAL CASE)                   │
│  - Explicit approval required                           │
│  - Explains consequences                                │
│  - Cannot be bypassed                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Safety Design

### Deletion Protection

The Records Manager Skill has a critical safety feature: **deletion always requires explicit confirmation**.

*   The `PaperlessClient` has **NO delete methods** - they are intentionally excluded
*   All deletion requests route through the `DeleteConfirmation` workflow
*   The Deletion Auditor agent must approve any deletion
*   Full audit trail maintained for compliance

This prevents catastrophic data loss from accidental bulk deletions.

---

## License

MIT License - see [LICENSE](https://github.com/madeinoz67/madeinoz-recordmanager-skill/blob/main/LICENSE) for details.

---

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main repository.

---

## Links

*   **GitHub Repository**: [madeinoz67/madeinoz-recordmanager-skill](https://github.com/madeinoz67/madeinoz-recordmanager-skill)
*   **Issue Tracker**: [GitHub Issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)
*   **PAI Project**: [danielmiessler/PAI](https://github.com/danielmiessler/PAI)
*   **paperless-ngx**: [paperless-ngx/docs](https://docs.paperless-ngx.com/)

---

**Version**: 1.2.0
**Last Updated**: 2026-01-20
