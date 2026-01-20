# Daily Usage

This guide covers common tasks and operations you'll perform regularly with Records Manager. These are the day-to-day activities for maintaining an organized and compliant document system.

## Common Daily Tasks

### Uploading Documents

The most frequent activity is adding new documents to your records.

#### Quick Upload

```
User: "Upload this invoice"
AI: [Analyzes document, suggests tags, uploads to paperless-ngx]
```

#### Specified Domain Upload

```
User: "Store this bank statement in household records"
AI: "Suggested tags: financial, bank, statement, 2024"
    "Document uploaded as #5678"
```

#### Batch Upload Concept

While Records Manager processes one document at a time, you can efficiently handle multiple documents:

```bash
# Process multiple files
for file in ~/Downloads/invoices/*.pdf; do
  bun run RecordManager.ts upload "$file" --domain corporate
done
```

### Finding Documents

Daily document lookup is streamlined with intelligent search.

#### By Tag

```
User: "Show me all medical receipts"
AI: [Returns documents tagged with 'medical' and 'receipt']
```

#### By Type

```
User: "Find all tax returns"
AI: [Returns all documents with type 'Tax Return']
```

#### By Date Range

```
User: "Show invoices from January 2024"
AI: [Searches and filters by date]
```

#### Combining Filters

```
User: "Find medical receipts from 2024 that are tax deductible"
AI: "Found 8 documents matching:"
    "  #1234: Medical Receipt - Dr Smith (tags: medical, receipt, tax-deductible, 2024)"
    "  #1235: Pharmacy receipt (tags: medical, receipt, tax-deductible, 2024)"
    "  ..."
```

### Checking Document Details

Before performing operations, verify document information.

```
User: "Show me document 1234"
AI: "Document #1234:"
    "  Title: Medical Receipt - Dr Smith"
    "  Created: 2024-03-15"
    "  Tags: medical, receipt, tax-deductible, 2024"
    "  Type: Medical Receipt"
    "  Retention: 7 years (until 2031-03-15)"
    "  Status: Can be deleted after retention date"
```

## Weekly Tasks

### Organizing New Documents

Set aside time weekly to organize recently uploaded documents.

```
User: "Organize my household records"
AI: "Found 12 untagged or poorly tagged documents:"
    "  #4567: [Untitled] → Suggested: 'Utility Bill' with tags: household, utility"
    "  #4568: scan001.pdf → Suggested: 'Receipt' with tags: financial, receipt"
    "  ..."
    "Apply these suggestions? (yes/no)"
```

### Reviewing Tags

Ensure consistent tagging across your documents.

```
User: "Tag documents 1234, 1235, 1236 as tax-deductible"
AI: "Applying tag 'tax-deductible' to 3 documents..."
    "✅ Tags applied"
```

### Retention Check

Quick check for any documents approaching retention deadlines.

```
User: "Check retention for tax documents"
AI: "Tax Document Retention Status:"
    "  Tax Return 2018: Retention expires 2025-10-31 (safe to delete after)"
    "  Tax Assessment 2020: Retention expires 2027-11-15 (keep)"
    "  Invoice #4567: Retention expires 2028-03-20 (keep)"
```

## Monthly Tasks

### Workflow Review

Ensure automated workflows are performing correctly.

```
User: "Review my auto-tag workflows"
AI: "Workflow: 'Auto Tag - Smith Family Trust'"
    "  Match Rate: 87% (45/52 documents)"
    "  Accuracy: 94% (42/45 correctly tagged)"
    "  Suggestions:"
    "    - Consider adding 'variation' to match pattern for deed variations"
```

### Document Cleanup

Identify and organize documents that need attention.

```
User: "Find untagged documents"
AI: "Found 8 untagged documents:"
    "  #7890: Unknown document (created 2024-01-15)"
    "  #7891: Unknown document (created 2024-01-18)"
    "  ..."
    "Run organize workflow to suggest tags?"
```

## End of Financial Year (EOFY)

### Trust Document Validation

Critical for trust structures to maintain compliance.

```
User: "Validate Smith Family Trust documents"
AI: "Smith Family Trust - Document Check:"
    "Required Documents: 10"
    "Found: 8/10 complete"
    ""
    "✅ Present:"
    "  - Trust Deed"
    "  - Family Trust Election (FTE)"
    "  - Trustee Appointment"
    "  - ABN Registration"
    "  - Annual Financial Statements (2023)"
    "  - Tax Return (2023)"
    ""
    "⚠️  Missing:"
    "  - Beneficiary Declaration"
    "  - TFN Registration"
    ""
    "⚠️  Warnings:"
    "  - Pre-EOFY Trustee Resolution not created for 2024"
    "  - Distribution Minutes not documented for 2024"
```

### Pre-EOFY Resolution

Create required trustee resolution before June 30.

```
User: "Create pre-EOFY resolution for Smith Family Trust"
AI: "Generating Pre-EOFY Trustee Resolution template..."
    "This resolution documents the trustee's intention to distribute"
    "income for the 2023-2024 financial year."
    ""
    [Provides template for trustee to execute]
```

### Distribution Minutes

Document beneficiary distributions before EOFY.

```
User: "Record trust distribution for Smith Family Trust"
AI: "Creating Distribution Minutes template..."
    "Beneficiaries: [List from trust deed]"
    "Income: $XX,XXX"
    "Capital Gains: $X,XXX"
    ""
    [Provides template for recording distributions]
```

### Tax Document Preparation

Gather all documents needed for tax return.

```
User: "Prepare documents for 2024 tax return"
AI: "Compiling tax documents for 2024..."
    "✅ Income Documents:"
    "  - Payment Summaries (3)"
    "  - Bank Statements (12)"
    "  - Investment Statements (4)"
    ""
    "✅ Deduction Documents:"
    "  - Medical Receipts (8)"
    "  - Charitable Donations (5)"
    "  - Work-Related Expenses (12)"
    ""
    "Ready for tax preparation"
```

## Annual Tasks

### Retention Audit

Review all documents for retention compliance.

```
User: "Run retention audit for all documents"
AI: "Retention Audit Results:"
    "  Total Documents: 1,247"
    "  Within Retention: 1,198"
    "  Past Retention: 49"
    ""
    "Documents past retention (49):"
    "  - Tax Return 2017 (safe to delete)"
    "  - Bank Statements 2018 (safe to delete)"
    "  ..."
    "Review deletion candidates?"
```

### FTE Retention Check

Critical check for Family Trust Election documents.

```
User: "Check FTE retention for all trusts"
AI: "Family Trust Election Retention Status:"
    ""
    "Smith Family Trust:"
    "  FTE Date: 2020-02-01"
    "  Retain Until: 2025-02-01"
    "  Status: ⚠️  EXPIRES IN 12 DAYS"
    "  Action: Plan to archive after 2025-02-01"
    ""
    "Jones Family Trust:"
    "  FTE Date: 2019-06-15"
    "  Retain Until: 2024-06-15"
    "  Status: ✅ RETENTION EXPIRED"
    "  Action: Can be archived or destroyed"
```

## Practical Scenarios

### Scenario: Tax Time Preparation

```
User: "Get ready for tax time"
AI: "Running tax preparation workflow..."
    ""
    "Step 1: Gathering income documents..."
    "  Found 17 income documents"
    ""
    "Step 2: Gathering deduction evidence..."
    "  Found 34 deduction documents"
    ""
    "Step 3: Checking retention..."
    "  All documents current"
    ""
    "Step 4: Organizing by category..."
    "  ✓ Income: payment summaries, interest, dividends"
    "  ✓ Deductions: medical, work, donations"
    ""
    "Tax documents ready. Would you like me to:"
    "  - Generate summary report"
    "  - Create PDF bundle for accountant"
    "  - Export to spreadsheet"
```

### Scenario: Insurance Claim

```
User: "Find documents for home insurance claim"
AI: "Searching for insurance documents..."
    ""
    "✅ Insurance Policy:"
    "  #1234: Home Insurance Policy (expires 2024-12-31)"
    ""
    "✅ Related Documents:"
    "  #5678: Receipt - Roof Repair (potential claim item)"
    "  #5679: Receipt - Water Damage Repair"
    "  #5680: Quote - Window Replacement"
    ""
    "Would you like to:"
    "  - Download all documents"
    "  - Filter by date range"
    "  - Add claim tag to these documents"
```

### Scenario: Trust Establishment

```
User: "Set up a new family trust"
AI: "Starting Family Trust setup..."
    ""
    "Step 1: Basic Information"
    "  - Trust Name: [Your Trust Name]"
    "  - Trustee: [Individual or Corporate Trustee]"
    "  - Appointor: [Who controls the trust]"
    "  - Beneficiaries: [List eligible beneficiaries]"
    ""
    "Step 2: Registration"
    "  - ABN: [Apply for trust ABN]"
    "  - TFN: [Apply for trust TFN]"
    ""
    "Step 3: Family Trust Election"
    "  - FTE Lodgment Date: [Critical for retention]"
    "  - Note: Must be retained 5 years from FTE date"
    ""
    "Step 4: Document Storage"
    "  Creating entity tag: family-trust-[name]"
    "  Creating storage path: /Trusts/Family/[Trust Name]"
    ""
    "✅ Entity created. Ready to upload trust documents."
```

### Scenario: Document Cleanup

```
User: "Clean up old documents"
AI: "Analyzing documents for cleanup..."
    ""
    "Documents past retention period (49):"
    "  Category            | Count | Earliest"
    "  ------------------- | ----- | ----------"
    "  Bank Statements     | 24    | 2018-01-01"
    "  Utility Bills       | 18    | 2018-03-15"
    "  Tax Returns         | 3     | 2017-07-01"
    "  Receipts            | 4     | 2017-11-20"
    ""
    "Options:"
    "  1. Review individually"
    "  2. Archive all (move to archive storage)"
    "  3. Delete all (permanent, requires confirmation)"
    ""
    "Recommendation: Archive bank statements and receipts,"
    "                Delete utility bills (no long-term value)"
```

## Daily Usage Tips

1. **Upload Immediately**: Process documents as soon as they arrive to prevent backlog

2. **Consistent Tagging**: Let the system suggest tags, but review for accuracy

3. **Search Before Upload**: Check if similar documents exist before adding

4. **Weekly Organization**: Spend 10 minutes weekly organizing new documents

5. **Monthly Review**: Check retention status and workflow performance

6. **EOFY Preparation**: Start gathering tax documents in May, not June

7. **Trust Compliance**: Validate trust documents quarterly, not annually

## Keyboard Shortcuts (CLI)

```bash
# Quick commands for daily use
alias rm-upload='bun run RecordManager.ts upload'
alias rm-search='bun run RecordManager.ts search'
alias rm-info='bun run RecordManager.ts info'
alias rm-status='bun run RecordManager.ts status'

# Usage
rm-upload ~/Downloads/invoice.pdf
rm-search --query "medical" --tags "receipt"
rm-info 1234
rm-status
```

## Troubleshooting Daily Issues

### Document Not Found

```
User: "Find my tax return"
AI: "No exact matches found. Similar documents:"
    "  - Tax Assessment 2023"
    "  - Tax Return 2022"
    "Try: 'search tax return' with year filter"
```

### Upload Failed

```
User: "Upload this document"
AI: "Upload failed. Possible reasons:"
    "  1. File doesn't exist"
    ""
    "  2. Paperless-ngx connection issue"
    ""
    "  3. File type not supported"
    "Run 'check status' to verify connection"
```

### Tag Not Applied

```
User: "Tag 1234 as important"
AI: "Tag 'important' applied to document #1234"
    "Note: Tag was created automatically"
```
