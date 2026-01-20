# Environment Variables

The Records Manager Skill uses environment variables with the `MADEINOZ_RECORDMANAGER_` prefix for all configuration. These should be set in your PAI directory's `.env` file.

## Required Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` | Yes | None | URL of your paperless-ngx instance (include `https://` or `http://`) |
| `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` | Yes | None | API token from paperless-ngx (generate in Settings → Tokens) |

## Optional Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MADEINOZ_RECORDMANAGER_COUNTRY` | No | `Australia` | Your country for compliance rules (see [Country Selection](country-selection.md)) |
| `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN` | No | `household` | Primary use case: `household`, `corporate`, `projects`, or a trust type |
| `MADEINOZ_RECORDMANAGER_TAXONOMY_PATH` | No | Built-in | Custom taxonomy directory path |
| `MADEINOZ_RECORDMANAGER_RETENTION_TAX_YEARS` | No | Country default | Override tax document retention period |
| `MADEINOZ_RECORDMANAGER_RETENTION_MEDICAL_YEARS` | No | Country default | Override medical record retention period |
| `MADEINOZ_RECORDMANAGER_RETENTION_INSURANCE_YEARS` | No | Country default | Override insurance policy retention period |

## Configuration File

Place your configuration in `$PAI_DIR/.env`:

```bash
# =============================================================================
# Paperless-ngx Configuration
# =============================================================================

# Your paperless-ngx instance URL
# Include the protocol (https:// or http://)
MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"

# API token from paperless-ngx
# Generate in: Settings → Tokens → Create new token
# Required permissions: Read/Write
MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token-here"

# =============================================================================
# Records Manager Settings
# =============================================================================

# Your country for record keeping compliance
# Supported: Australia, UnitedStates, UnitedKingdom
# Default: Australia
MADEINOZ_RECORDMANAGER_COUNTRY="Australia"

# Your primary use case
# Options: household, corporate, projects, unit-trust, discretionary-trust, family-trust
# Default: household
MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"

# =============================================================================
# Optional Configuration
# =============================================================================

# Custom retention periods (overrides defaults)
# MADEINOZ_RECORDMANAGER_RETENTION_TAX_YEARS="7"
# MADEINOZ_RECORDMANAGER_RETENTION_MEDICAL_YEARS="7"
# MADEINOZ_RECORDMANAGER_RETENTION_INSURANCE_YEARS="10"

# Custom taxonomy path (if you want custom taxonomies)
# MADEINOZ_RECORDMANAGER_TAXONOMY_PATH="$PAI_DIR/skills/RecordsManager/Taxonomies/"
```

## Variable Details

### MADEINOZ_RECORDMANAGER_PAPERLESS_URL

The full URL to your paperless-ngx instance.

**Examples:**

*   `https://paperless.example.com` (remote instance with SSL)

*   `http://localhost:8000` (local development instance)

**Important:** Always include the protocol (`https://` or `http://`).

### MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN

API token for authenticating with paperless-ngx.

**To generate:**

1. Log in to paperless-ngx

2. Go to **Settings** → **Tokens**

3. Click **Create new token**

4. Give it a descriptive name (e.g., "Records Manager")

5. Ensure **Read/Write** permissions are enabled

6. Copy the token and paste it into your `.env` file

### MADEINOZ_RECORDMANAGER_COUNTRY

Determines which country's record keeping guidelines to apply.

**Supported values:**
| Value | Description |
|-------|-------------|
| `Australia` | Australian Taxation Office (ATO) guidelines |
| `UnitedStates` | IRS recommendations |
| `UnitedKingdom` | HMRC requirements |

See [Country Selection](country-selection.md) for detailed information about each country's guidelines.

### MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN

Your primary record keeping use case. This affects which taxonomy suggestions and document types are available.

**Valid values:**
| Domain | Description |
|--------|-------------|
| `household` | Personal records, taxes, medical, insurance, warranties |
| `corporate` | Business invoices, contracts, payroll, compliance |
| `projects` | Project plans, deliverables, communications |
| `unit-trust` | Unit trust deeds, distributions, unitholder records |
| `discretionary-trust` | Family trust with discretionary distributions |
| `family-trust` | Family trust with Family Trust Election (FTE) |

### MADEINOZ_RECORDMANAGER_TAXONOMY_PATH

Optional path to custom taxonomy files. If not specified, built-in taxonomies are used.

**Example:**
```bash
MADEINOZ_RECORDMANAGER_TAXONOMY_PATH="$PAI_DIR/skills/RecordsManager/Taxonomies/"
```

### Retention Override Variables

Override default retention periods for specific document categories.

**Available overrides:**

*   `MADEINOZ_RECORDMANAGER_RETENTION_TAX_YEARS` - Tax documents

*   `MADEINOZ_RECORDMANAGER_RETENTION_MEDICAL_YEARS` - Medical records

*   `MADEINOZ_RECORDMANAGER_RETENTION_INSURANCE_YEARS` - Insurance policies

**Example:**
```bash
# Keep tax records for 10 years instead of default 7
MADEINOZ_RECORDMANAGER_RETENTION_TAX_YEARS="10"
```

## Validation

After setting your environment variables, verify the configuration:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

Expected output:
```
Records Manager Status
======================

Paperless-ngx: Connected (https://your-instance.com)
Country: Australia
Default Domain: household

Available Commands:

*   upload: Add documents with intelligent tagging

*   search: Find documents by tag, type, or content

*   retention: Check retention requirements

*   status: Verify connection and configuration
```

## Troubleshooting

### Variable Not Recognized

If a variable isn't being read:

1. Ensure the `.env` file is in your PAI directory (`$PAI_DIR/.env`)

2. Verify the variable name matches exactly (case-sensitive)

3. Restart your shell or run `source ~/.zshrc`

### Connection Failed

If connection to paperless-ngx fails:

1. Verify `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` includes the protocol

2. Test the URL in your browser

3. Confirm the API token is valid and has Read/Write permissions

4. Check for firewall or SSL certificate issues

### Country Fallback

If you specify an unsupported country, the system will fall back to `Australia` and log a warning. Check the [supported countries](country-selection.md) list.
