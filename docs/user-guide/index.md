# User Guide

Welcome to the Records Manager User Guide. This section provides comprehensive documentation for using the Records Manager skill to manage your documents, organize records, and maintain compliance with retention requirements.

## Overview

The Records Manager is an expert record keeping system that integrates with paperless-ngx to provide intelligent document organization, country-specific taxonomies, and automated workflow management. Whether you are managing household records, corporate documents, or trust structures, the Records Manager offers specialized expertise for your domain.

## What You Can Do

*   **Upload Documents**: Intelligently tag and organize documents as you add them to your system
*   **Search Records**: Find documents quickly by tags, content, type, or custom queries
*   **Organize Collections**: Improve document structure with taxonomy-driven suggestions
*   **Check Retention**: Understand how long to keep documents for legal compliance
*   **Manage Tags**: Apply consistent tagging across your document library
*   **Validate Trusts**: Ensure trust documents meet ATO requirements (Australia)
*   **Create Workflows**: Automate document processing with custom workflows

## Key Concepts

### Domains

Records Manager supports multiple domains, each with specialized taxonomies and retention rules:

*   **Household**: Personal records including tax, medical, insurance, legal, education, and identity documents
*   **Corporate**: Business records including invoices, contracts, employee records, and financial statements
*   **Unit Trust**: Unit trust documents with unit registry and distribution tracking
*   **Discretionary Trust**: Discretionary trust governance and distribution records
*   **Family Trust**: Family trust documents including FTE compliance tracking
*   **Projects**: Project documentation organized by phase and deliverables

### Tags

Tags are the primary organizational mechanism in Records Manager. They can represent:

*   **Categories**: financial, medical, insurance, legal, hr, compliance
*   **Entity Types**: household, corporate, unit-trust, discretionary-trust, family-trust, project
*   **Document Types**: invoice, receipt, contract, tax-return, insurance-policy
*   **Custom Fields**: Any tag you create for your specific needs

### Retention Periods

Each document type has a legally-defined retention period based on your country's regulations:

*   **7 years**: Most tax and financial documents (Australia ATO requirement)
*   **10 years**: Insurance policies, contracts, personal records
*   **15 years**: Permanent trust records, wills, powers of attorney
*   **5 years**: Family Trust Election (from FTE date, not EOFY)

## Getting Started

### Prerequisites

Before using Records Manager, ensure you have:

1. **Paperless-ngx instance**: A running paperless-ngx installation

2. **API Token**: Generated from paperless-ngx settings

3. **Environment configured**: Required environment variables set

### Quick Start

The simplest way to use Records Manager is through natural language commands:

```
User: "Upload this tax return to my records"
AI: [Invokes Upload workflow, suggests tags, uploads to paperless-ngx]

User: "Find all medical receipts from 2024"
AI: [Invokes Search workflow, returns matching documents]

User: "Check retention for my trust documents"
AI: [Invokes Retention workflow, shows compliance status]
```

## Navigation

Use the sidebar to navigate to specific topics:

*   **[Workflows](workflows.md)**: Detailed workflow documentation and usage
*   **[Daily Usage](daily-usage.md)**: Common tasks and operations
*   **[Search](search.md)**: Document search workflows and tips
*   **[Tagging](tagging.md)**: Tag-based organization strategies
*   **[Retention](retention.md)**: Compliance and retention checking
*   **[Trusts](trusts.md)**: Trust document management and FTE compliance

## Safety First

Records Manager includes important safety features:

*   **Deletion Confirmation**: All document deletions require explicit approval with the exact confirmation phrase
*   **Retention Warnings**: Automatic alerts when documents cannot be legally deleted
*   **Audit Trail**: All deletion decisions are logged for compliance
*   **FTE Protection**: Family Trust Election documents receive special retention tracking

## Need Help?

If you encounter issues:

1. Check the [Troubleshooting](../reference/troubleshooting.md) section
2. Review [Workflow Documentation](workflows.md) for specific workflow issues
3. Run `check status` to verify your paperless-ngx connection

## Next Steps

*   Read the [Workflows](workflows.md) section to understand available operations
*   Explore [Daily Usage](daily-usage.md) for common task patterns
*   Set up your first [Entity](../setup/entities.md) for domain-specific organization
