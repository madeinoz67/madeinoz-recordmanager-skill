# Getting Started

Welcome to the Records Manager Skill. This section will guide you through installing, configuring, and using the skill for expert document management with paperless-ngx.

---

## Overview

The Records Manager Skill is a PAI (Personal AI Infrastructure) pack that transforms your AI assistant into an expert records manager. It provides:

* **Intelligent document organization** with automatic tagging and categorization

* **Country-specific compliance** for record retention (Australia, US, UK)

* **Safe operations** with mandatory deletion confirmation

* **Powerful search** optimized for finding documents quickly

---

## What You'll Need

Before you begin, ensure you have:

1. **A PAI installation** - The skill integrates with your PAI environment

2. **A paperless-ngx instance** - For document storage and management

3. **Bun runtime** - For running TypeScript tools

4. **API credentials** - paperless-ngx URL and API token

See [Prerequisites](prerequisites.md) for detailed requirements.

---

## Installation Path

Follow these guides in order:

### 1. [Prerequisites](prerequisites.md)
Verify your system meets all requirements before installing.

### 2. [Installation Guide](installation.md)
Step-by-step installation for PAI integration and paperless-ngx configuration.

### 3. [Quickstart Tutorial](quickstart.md)
Upload your first document with intelligent tagging and learn the basics.

---

## Quick Reference

After installation, you can use the Records Manager Skill:

```bash
# Upload a document
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file <path> --domain household

# Search for documents
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --query "insurance"

# Check retention status
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain corporate
```

---

## Next Steps

1. **Configure your environment** - Set up paperless-ngx connection

2. **Upload your first document** - Follow the quickstart tutorial

3. **Explore taxonomies** - Learn about entity types and tagging

4. **Set up retention** - Configure country-specific retention rules

---

## Need Help?

* **Troubleshooting**: See the [Troubleshooting](../troubleshooting.md) section

* **Configuration Guide**: See [Configuration](../configuration/)

* **API Reference**: See [CLI Commands](../reference/cli.md)

---

## What's Next?

After completing the getting started guide:

* **User Guide**: Learn daily workflows for document management

* **Tutorials**: Step-by-step guides for common tasks

* **Extending**: Create custom taxonomies and entity types

* **Architecture**: Understand system design and components
