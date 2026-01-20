# 📋 Records Manager Skill - Now Available for PAI

**Expert record keeping with paperless-ngx integration, country-specific taxonomies, and intelligent document management**

---

## 🎯 Overview

The **Records Manager Skill** is now available for the PAI (Personal AI Infrastructure) community. This pack transforms how you organize, search, and retain documents by turning your AI assistant into an expert records manager that knows how to properly categorize, tag, and manage documents according to best practices and legal requirements.

**Core principle**: Organize once, find forever.

---

## ✨ Key Features

### 🏷️ Intelligent Document Organization
- Automatic tagging and categorization based on document content
- Domain-specific taxonomies for household, corporate, and project records
- Smart suggestions for document types and metadata

### 🌍 Country-Specific Compliance
- Record keeping guidelines tailored to your jurisdiction (Australia, US, UK)
- Automatic retention period recommendations
- ATO-compliant trust document management for Australian users

### 🛡️ Safe Operations
- **Mandatory deletion confirmation workflow** prevents catastrophic data loss
- Explicit approval required for any document destruction
- Complete audit trail for compliance and legal protection

### 🔍 Powerful Search
- Optimized data structures for finding relevant documents quickly
- Search by tags, document types, dates, and content
- Filterable results with retention status indicators

### 🤖 Specialized Agents
Six domain expert agents for complex tasks:
- **Records Keeper** - Taxonomy design and organization
- **Compliance Guardian** - Legal retention requirements
- **Archive Architect** - Storage and retrieval strategy
- **Deletion Auditor** - Safety checkpoint for all deletions
- **Sensitivity Scanner** - Data classification and DLP
- **Retention Monitor** - Time-based compliance tracking

### 🔧 Extensible Architecture
- Create custom entity types with their own taxonomies
- Define country-specific retention rules
- Add domain-specific tags and categories

---

## 🚀 Quick Start

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

5. **Start managing records**:
   ```
   Upload this invoice and organize it properly
   ```

---

## 📚 Documentation

Comprehensive documentation is available at: **[https://madeinoz67.github.io/madeinoz-recordmanager-skill/](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)**

Includes:
- Installation guides and tutorials
- Configuration reference
- API documentation
- Taxonomy customization guide
- Example prompts and workflows

---

## ⚠️ Safety Notice

> **DISCLAIMER**: This tool interacts with your paperless-ngx instance and can delete documents. Despite safety features including mandatory deletion confirmation workflows and Deletion Auditor agent approval requirements, **you are solely responsible for backing up your data** before using this tool.

**Before using this tool, you MUST:**
1. ✅ Set up a dedicated PAI user with limited permissions
2. ✅ Enable paperless-ngx backup and recovery
3. ✅ Test the deletion confirmation workflow in a safe environment

---

## 🛠️ Requirements

- **PAI (Personal AI Infrastructure)** installed
- **paperless-ngx** instance with API access
- **Bun** runtime for TypeScript execution

---

## 📦 What's Included

| Component | Description |
|-----------|-------------|
| **Skill Definition** | Intent detection and workflow routing |
| **Paperless API Client** | Complete paperless-ngx integration |
| **Taxonomy Expert** | Country-specific record keeping guidelines |
| **Record Manager CLI** | Command-line tool for all operations |
| **Delete Confirmation** | Mandatory approval workflow for deletions |
| **Specialized Agents** | Six domain expert agents for complex tasks |

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main repository.

---

## 📖 Links

- **GitHub Repository**: [madeinoz67/madeinoz-recordmanager-skill](https://github.com/madeinoz67/madeinoz-recordmanager-skill)
- **Documentation**: [https://madeinoz67.github.io/madeinoz-recordmanager-skill/](https://madeinoz67.github.io/madeinoz-recordmanager-skill/)
- **Issue Tracker**: [GitHub Issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)
- **PAI Project**: [danielmiessler/PAI](https://github.com/danielmiessler/PAI)

---

**Version**: 1.2.0
**License**: MIT
**Last Updated**: 2026-01-20

---

*Transform your document management with AI-powered expertise and country-specific compliance.*
