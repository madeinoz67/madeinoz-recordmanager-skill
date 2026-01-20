# Installation Guide

Complete installation instructions for the Records Manager Skill with PAI integration and paperless-ngx configuration.

---

## Overview

The Records Manager Skill installs as a PAI pack and integrates with your paperless-ngx instance for document storage. This guide covers the complete installation process.

---

## Prerequisites

Before installing, ensure you have:

| Requirement | Minimum Version | Notes |
|-------------|-----------------|-------|
| **PAI** | v2.0+ | Personal AI Infrastructure |
| **paperless-ngx** | v1.13+ | Document management system |
| **Bun** | v1.0+ | TypeScript runtime |
| **Git** | Any | For cloning the repository |

See [Prerequisites](prerequisites.md) for detailed setup instructions.

---

## Installation Methods

### Method 1: Clone to PAI Skills Directory (Recommended)

This method installs the skill directly into your PAI environment for seamless integration.

```bash
# 1. Navigate to your PAI skills directory
cd ~/.claude/skills/

# 2. Clone the repository
git clone https://github.com/madeinoz/madeinoz-recordmanager-skill.git RecordsManager

# 3. Verify installation
ls -la ~/.claude/skills/RecordsManager/
```

You should see the skill structure:
```
RecordsManager/
├── src/
│   ├── lib/                    # Core libraries
│   ├── skills/RecordsManager/  # Skill definition
│   └── tools/                  # CLI tools
├── SKILL.md                    # Main skill file
└── README.md
```

---

## Configuration

### Step 1: Obtain paperless-ngx Credentials

1. Log in to your paperless-ngx instance

2. Navigate to **Settings** → **API Tokens**

3. Create a new API token with read/write permissions

4. Copy the token (you won't see it again)

### Step 2: Set Environment Variables

Add the following to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# paperless-ngx connection
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"
export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token-here"

# Records Manager settings
export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"  # Australia|US|UK
export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"  # household|corporate|project
```

**Reload your shell:**
```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Step 3: Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` | Yes | Your paperless-ngx instance URL |
| `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` | Yes | API token with read/write permissions |
| `MADEINOZ_RECORDMANAGER_COUNTRY` | No | Your country for compliance (default: Australia) |
| `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN` | No | Default entity type (default: household) |

---

## Verification

### Step 1: Verify CLI Installation

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts --help
```

Expected output:
```
Records Manager CLI v1.2.0

Commands:
  upload     Upload a document with intelligent tagging
  search     Search for documents by tags, type, or content
  tag        Add or modify tags on documents
  info       Get document details and metadata
  retention  Check retention requirements for documents
  status     Test connection to paperless-ngx

Options:
  --help     Show this help message
```

### Step 2: Verify Connection to paperless-ngx

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts status
```

Expected output:
```
✓ Connected to paperless-ngx
  URL: https://paperless.example.com
  Documents: 1,234
  Tags: 45
  Document Types: 12
```

If connection fails:

* Verify your paperless-ngx URL is correct

* Check that your API token has valid permissions

* Ensure paperless-ngx is accessible from your network

### Step 3: Test Upload (Optional)

```bash
# Create a test document
echo "Test document for Records Manager" > /tmp/test-upload.txt

# Upload to paperless-ngx
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file /tmp/test-upload.txt \
  --domain household \
  --dry-run
```

The `--dry-run` flag shows what would happen without actually uploading.

---

## Upgrading

To upgrade to the latest version:

```bash
cd ~/.claude/skills/RecordsManager
git pull origin main
```

Check for configuration changes in the changelog.

---

## Uninstallation

To remove the Records Manager Skill:

```bash
# 1. Remove the skill directory
rm -rf ~/.claude/skills/RecordsManager

# 2. Remove environment variables from your shell profile
# Edit ~/.zshrc or ~/.bashrc and remove the MADEINOZ_RECORDMANAGER_ lines

# 3. Reload your shell
source ~/.zshrc
```

**Note**: This does not affect documents stored in paperless-ngx.

---

## Configuration Options

### Country Selection

The skill supports country-specific retention guidelines:

| Country | Retention Source | Taxonomy Features |
|---------|------------------|-------------------|
| **Australia** | ATO guidelines | Trust document support, FTE tracking |
| **US** | IRS guidelines | Corporate tax records, compliance |
| **UK** | HMRC guidelines | VAT records, company documents |

Set with:
```bash
export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
```

### Domain Selection

Choose your primary use case:

| Domain | Use For | Taxonomy Focus |
|--------|---------|----------------|
| **household** | Personal/family documents | Financial, medical, insurance, legal |
| **corporate** | Business records | Invoices, contracts, compliance, HR |
| **project** | Project documentation | Plans, deliverables, communications |

Set with:
```bash
export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
```

---

## Troubleshooting

### "Command not found" error

**Problem**: `bun run` fails with command not found

**Solution**:
```bash
# Install Bun if not present
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### "Connection refused" error

**Problem**: Cannot connect to paperless-ngx

**Solution**:

1. Verify paperless-ngx is running
2. Check firewall rules
3. Ensure URL includes protocol (https://)
4. Test connectivity: `curl $MADEINOZ_RECORDMANAGER_PAPERLESS_URL`

### "API token invalid" error

**Problem**: paperless-ngx rejects API token

**Solution**:

1. Regenerate API token in paperless-ngx
2. Verify token has read/write permissions
3. Check for extra characters in environment variable

### "Skill not found" error

**Problem**: PAI cannot find the Records Manager skill

**Solution**:
```bash
# Verify skill location
ls -la ~/.claude/skills/RecordsManager/SKILL.md

# Check PAI skills directory
echo $PAI_DIR

# If PAI_DIR is not set, set it
export PAI_DIR="$HOME/.claude"
```

---

## Next Steps

After successful installation:

1. **Complete the Quickstart Tutorial** - Upload your first document
2. **Learn Taxonomies** - Understand entity types and tagging
3. **Configure Retention** - Set up country-specific retention rules
4. **Explore CLI** - Master the command-line interface

---

## Getting Help

If you encounter issues during installation:

*   **Check logs**: `~/.claude/MEMORY/` for PAI session logs
*   **Verify configuration**: Run `bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts status`
*   **Review prerequisites**: Ensure all system requirements are met
*   **Open an issue**: [GitHub Issues](https://github.com/madeinoz/madeinoz-recordmanager-skill/issues)

---

**Version**: 1.2.0
**Last Updated**: 2026-01-20
