# Quickstart Tutorial

Learn the basics of the Records Manager Skill by uploading your first document with intelligent tagging.

---

## Overview

This tutorial will guide you through uploading your first document, understanding automatic tagging, and performing basic searches. By the end, you'll have a working document management system.

**Time Required**: 10 minutes
**Prerequisites**: Completed [Installation](installation.md)

---

## Step 1: Prepare Your Document

Find a document you'd like to upload. For this tutorial, we'll use an invoice as an example.

**Supported formats**:

* PDF (preferred for documents with text/OCR)

* Images (PNG, JPG, JPEG - will be OCR-processed)

* Office documents (DOCX, XLSX - converted to PDF)

**Example document**:

* An invoice from a supplier

* A medical receipt

* An insurance policy document

* A tax statement

---

## Step 2: Upload Your Document

Use the `upload` command to add your document with intelligent tagging:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Downloads/invoice.pdf \
  --domain household
```

**What happens**:

1. **Document Upload** - The file is uploaded to paperless-ngx

2. **OCR Processing** - paperless-ngx extracts text from the document

3. **Intelligent Classification** - The Records Manager analyzes the content

4. **Tag Application** - Relevant tags are automatically applied

5. **Retention Assignment** - Retention period is set based on document type

**Expected output**:

```
Uploading invoice.pdf...

Document Analysis:
  Type: Invoice detected
  Amount: $150.00
  Date: 2024-01-15
  Vendor: ABC Supplies

Suggested Tags:

  * invoice

  * supplier

  * 2024

  * household

Document Type: Supplier Invoice
Retention: 7 years (financial record)

✓ Upload complete
  Document ID: 1234
  Archive URL: https://paperless.example.com/archive/1234
```

---

## Step 3: Understanding Automatic Tagging

The Records Manager applies tags based on:

### Content Analysis

The document content is analyzed for:

* Document type (invoice, receipt, statement, policy)

* Dates (document date, tax year)

* Entities (vendor names, organizations)

* Amounts (for financial documents)

### Domain Taxonomy

Your configured domain determines available tags:

| Domain | Common Tags |
|--------|-------------|
| **household** | financial, medical, insurance, legal, education, receipts, invoices |
| **corporate** | accounting, contracts, compliance, hr, invoices, expenses |
| **project** | plans, deliverables, communications, milestones, reports |

### Country Rules

Your country setting affects retention:

| Country | Example Retention |
|---------|-------------------|
| **Australia** | Tax records: 7 years (ATO) |
| **US** | Tax records: 7 years (IRS) |
| **UK** | VAT records: 6 years (HMRC) |

---

## Step 4: Search for Your Document

Now that your document is uploaded, search for it using tags:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --tags "invoice,2024" \
  --domain household
```

**Expected output**:

```
Searching for documents with tags: invoice, 2024

Found 3 documents:

1. ABC Supplies - January Invoice
   ID: 1234
   Date: 2024-01-15
   Tags: invoice, supplier, 2024, household
   Type: Supplier Invoice
   Retention: 7 years (expires 2031-01-15)

2. Utility Company - Electric Bill
   ID: 1235
   Date: 2024-01-10
   Tags: invoice, utilities, 2024, household
   Type: Utility Invoice
   Retention: 7 years (expires 2031-01-10)

[... additional results ...]
```

---

## Step 5: View Document Details

Get detailed information about a specific document:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts info \
  --id 1234
```

**Expected output**:

```
Document Details: ABC Supplies - January Invoice

Basic Information:
  ID: 1234
  Title: ABC Supplies - January Invoice
  Created: 2024-01-20 10:30:00
  Modified: 2024-01-20 10:30:00

Content:
  Type: Supplier Invoice
  Archive Serial: 2024-01-15
  Document Date: 2024-01-15

Tags:

  * invoice (green)

  * supplier (blue)

  * 2024 (yellow)

  * household (purple)

Retention:
  Period: 7 years
  Expires: 2031-01-15
  Reason: Financial record - ATO requirement
  Country: Australia

Metadata:
  Vendor: ABC Supplies
  Amount: $150.00
  Currency: AUD
  Category: Household Expenses

Archive URL: https://paperless.example.com/archive/1234
```

---

## Step 6: Add Additional Tags

You can manually add tags to refine organization:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts tag \
  --id 1234 \
  --tags "home-office,deductible"
```

**Expected output**:

```
Adding tags to document 1234...

Added tags:

  * home-office

  * deductible

Current tags: invoice, supplier, 2024, household, home-office, deductible
```

---

## Step 7: Check Retention Status

Verify which documents are approaching retention deadlines:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain household
```

**Expected output**:

```
Retention Status for: household

Documents Retained: 234

By Retention Period:

  5 years:    45 documents

  7 years:   156 documents (financial records)

  Permanent:  33 documents (legal, insurance)

Expiring Soon (within 90 days):

  * Old tax documents (2016) - safe to review for deletion

Archive Ready:

  * 23 documents past retention can be archived

  * Run with --archive flag to move to cold storage
```

---

## Common Workflows

### Upload Multiple Documents

```bash
# Upload all PDFs from Downloads folder
for file in ~/Downloads/*.pdf; do
  bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
    --file "$file" \
    --domain household
done
```

### Search by Date Range

```bash
# Find all documents from January 2024
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --query "after:2024-01-01 before:2024-01-31" \
  --domain household
```

### Find Untagged Documents

```bash
# Find documents without tags for manual review
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --untagged \
  --domain household
```

---

## Safety Feature: Deletion Requires Confirmation

The Records Manager Skill has a critical safety feature: **deletion always requires explicit confirmation**.

If you try to delete documents:

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts delete \
  --query "tag:old" \
  --domain household
```

**Expected output**:

```
⚠ DELETION REQUESTED ⚠

You are requesting deletion of 12 documents:

1. Old Invoice #1 (2018) - 7 year retention EXPIRED

2. Old Receipt #2 (2018) - 7 year retention EXPIRED

[...]

⚠ SAFETY CHECK ⚠

The Deletion Auditor agent requires:

1. Confirmation that retention periods have expired

2. Verification that documents are not needed for audit

3. Explicit approval phrase to proceed

To confirm deletion, type: "I understand this cannot be undone"

[Type phrase or press Ctrl+C to cancel]
```

**This prevents accidental data loss**.

---

## Next Steps

Now that you've completed the quickstart:

1. **Explore the User Guide** - Learn about daily workflows

2. **Configure Taxonomies** - Customize tags for your needs

3. **Set Up Retention Rules** - Configure country-specific requirements

4. **Try Tutorials** - Step-by-step guides for common tasks

---

## Local Documentation Preview

For contributors and documentation writers, you can run the documentation site locally to preview changes before deploying.

### Start Local Preview Server

```bash
# From the repository root
mkdocs serve
```

The documentation will be available at: http://127.0.0.1:8000

### Live Reload

Any changes you make to documentation files in `docs/` will automatically reload in your browser.

### Alternative Port

If port 8000 is already in use:

```bash
mkdocs serve -a localhost:8001
```

### Build Documentation

To build the static site for testing:

```bash
mkdocs build
```

Output will be in the `site/` directory.

### Clean Build

To clear all cached builds:

```bash
rm -rf site/
mkdocs build --clean
```

For more documentation development workflows, see [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## Troubleshooting

### Upload Fails

**Problem**: "Upload failed" error

**Solutions**:
*   Verify paperless-ngx is accessible: `curl $MADEINOZ_RECORDMANAGER_PAPERLESS_URL`
*   Check API token permissions
*   Ensure file is a supported format

### No Tags Applied

**Problem**: Document uploaded but no tags suggested

**Solutions**:
*   Check that OCR completed in paperless-ngx
*   Verify document contains readable text
*   Try manual tagging with the `tag` command

### Search Returns No Results

**Problem**: Can't find recently uploaded document

**Solutions**:
*   Wait for OCR processing (usually 30-60 seconds)
*   Check spelling of search terms
*   Try broader search without specific tags

---

## Summary

In this quickstart, you learned:

*   - [x] How to upload a document with intelligent tagging
*   - [x] How automatic classification works
*   - [x] How to search for documents by tags
*   - [x] How to view document details
*   - [x] How to add manual tags
*   - [x] How to check retention status
*   - [x] About deletion safety features

---

## What's Next?

*   **[User Guide](../user-guide/)** - Learn daily workflows for document management
*   **[Configuration](../configuration/)** - Customize the skill for your needs
*   **[Tutorials](../tutorials/)** - Step-by-step guides for specific tasks
*   **[API Reference](../reference/)** - Complete CLI command documentation

---

**Version**: 1.2.0
**Last Updated**: 2026-01-20
