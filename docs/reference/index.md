# Reference

This section provides comprehensive reference documentation for the Records Manager Skill.

## Overview

The Records Manager Skill provides expert record keeping with paperless-ngx integration, country-specific taxonomies, and intelligent document management. This reference section covers:

- **[CLI Commands](cli.md)** - Complete command-line interface reference
- **[Taxonomy Data Structure](taxonomy-data-structure.md)** - Entity types, categories, tags, and retention rules

## Key Components

### Three-Layer Architecture

```
INTENT LAYER (SKILL.md)
    Detects record keeping intent, routes to workflows

EXPERTISE LAYER (src/lib/)
    TaxonomyExpert   - Country-specific retention rules (AU/US/UK)
    TrustExpert      - ATO-compliant trust document management
    WorkflowExpert   - Automated workflow recommendations
    EntityCreator    - Dynamic entity creation
    SensitivityExpert - Document sensitivity classification

EXECUTION LAYER
    PaperlessClient - Full paperless-ngx API wrapper (NO DELETE methods)
    RecordManager   - CLI tool for all operations
```

## Environment Variables

All paperless-ngx configuration uses the `MADEINOZ_RECORDMANAGER_` prefix:

| Variable | Description | Default |
|----------|-------------|---------|
| `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` | paperless-ngx instance URL | *Required* |
| `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` | API token with read/write permissions | *Required* |
| `MADEINOZ_RECORDMANAGER_COUNTRY` | Country for compliance rules | `Australia` |
| `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN` | Default domain | `household` |

## Supported Countries

- **Australia** (AU) - Full household, corporate, and trust support
- **United States** (US) - Household records
- **United Kingdom** (UK) - Household records

## Entity Types

| Type | Description |
|------|-------------|
| `household` | Personal and family records |
| `corporate` | Business and company records |
| `unit-trust` | Unit trust structures |
| `discretionary-trust` | Discretionary family trusts |
| `family-trust` | Family trusts with FTE |
| `project` | Project-based records |
| `person` | Individual family member records |

## Safety Design

**Important:** The `PaperlessClient` has NO delete methods. Deletion requires the `DeleteConfirmation` workflow which mandates explicit user confirmation. This prevents catastrophic data loss.

## Related Documentation

- [Getting Started](../getting-started/index.md) - Installation and setup
- [User Guide](../user-guide/index.md) - Usage patterns and workflows
- [Architecture](../architecture/index.md) - System design details
