# Configuration

This section covers all configuration options for the Records Manager Skill, including environment variables, paperless-ngx setup, and country-specific compliance settings.

## Overview

The Records Manager Skill requires configuration to connect to your paperless-ngx instance and apply the correct record keeping guidelines for your jurisdiction. Configuration is done through environment variables with the `MADEINOZ_RECORDMANAGER_` prefix.

## Quick Start

1. **Copy the environment template** to your PAI directory:
   ```bash
   cp src/config/.env.example $PAI_DIR/.env
   ```

2. **Edit the configuration** with your paperless-ngx details:
   ```bash
   nano $PAI_DIR/.env
   ```

3. **Verify the connection**:
   ```bash
   bun run src/skills/RecordsManager/Tools/RecordManager.ts status
   ```

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Primary configuration file (in your PAI directory) |
| `src/config/.env.example` | Template with all available variables |
| `src/skills/RecordsManager/Lib/TaxonomyExpert.ts` | Country-specific taxonomies and retention rules |

## Configuration Sections

- **[Environment Variables](environment.md)** - Complete reference of all configuration variables
- **[paperless-ngx Setup](paperless-setup.md)** - Guide to configuring paperless-ngx integration
- **[Country Selection](country-selection.md)** - Choosing and configuring country-specific compliance

## Validation

After configuration, verify your setup:

```bash
# Check connection status
bun run src/skills/RecordsManager/Tools/RecordManager.ts status

# Expected output:
# Connected to paperless-ngx at https://your-instance.com
# Country: Australia
# Default Domain: household
# Supported Domains: household, corporate, projects, unit-trust, discretionary-trust, family-trust
```

## Troubleshooting

### Connection Issues

If the status check fails:

1. Verify your paperless-ngx URL is accessible
2. Confirm the API token has Read/Write permissions
3. Check for SSL certificate issues (use `http://` for local testing)

### Country Not Supported

If you see "Country X not supported":

```bash
# Check available countries
bun -e "import('./src/skills/RecordsManager/Lib/TaxonomyExpert.ts').then(m => console.log(m.TaxonomyExpert.getSupportedCountries()))"
```

### Invalid Domain

Valid domains are: `household`, `corporate`, `projects`, `unit-trust`, `discretionary-trust`, `family-trust`.

## Next Steps

- Configure [environment variables](environment.md)
- Set up [paperless-ngx](paperless-setup.md)
- Choose your [country](country-selection.md)
