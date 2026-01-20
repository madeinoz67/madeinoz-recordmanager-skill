# Tutorial: Checking Retention Compliance

This tutorial demonstrates how to verify document retention compliance for your jurisdiction and entity types.

## Objective

Check which documents are approaching or past their retention deadlines, and understand your compliance obligations.

## Prerequisites

- ✅ Completed [First Upload](./first-upload.md) tutorial
- ✅ Documents already uploaded to paperless-ngx
- ✅ Entities created (see [Entity Creation](./entity-creation.md))

## Step 1: Understand Retention Rules

Records Manager includes built-in retention expertise for several jurisdictions:

| Country | Authority | Typical Retention |
|---------|-----------|-------------------|
| **Australia** | ATO | 5-7 years (tax), Permanent (trust deeds) |
| **United States** | IRS | 3-7 years (tax), Varies by state |
| **United Kingdom** | HMRC | 6 years (tax), 10+ years (legal) |

**Australia-specific examples:**

* Tax documents: 5 years from EOFY

* Trust deeds: Permanent

* Family Trust Election: 5+ years from FTE date

* Employment records: 7 years after termination

## Step 2: Check Overall Retention Status

Get a summary of retention compliance across all documents:

```bash
# Via PAI
records-manager retention check

# Or directly
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention check
```

**Expected output:**
```
📊 Retention Status Summary

Total Documents: 247
Compliant: 231 (93.5%)
⚠️  Review Required: 12 (4.9%)
❌ Overdue: 4 (1.6%)

Documents Approaching Deadline:
*   Invoice #12345 (expires in 30 days)
*   Receipt ABC-999 (expires in 45 days)

Overdue Documents:
*   2020 Tax Return (expired 180 days ago)
*   Employment Contract (expired 365 days ago)
```

## Step 3: Check Specific Entity

Filter retention check by entity:

```bash
records-manager retention check --domain corporate_acme-corp
```

**Expected output:**
```
📊 Retention Status: ACME Corporation

Entity Type: corporate
Jurisdiction: Australia
Total Documents: 89
Compliant: 87 (97.8%)
Review Required: 2 (2.2%)

Approaching Deadline:
*   2020-06-15: Vendor Invoice #INV-2020-089 (30 days)
*   2020-07-22: Expense Receipt (45 days)
```

## Step 4: Get Detailed Document Report

Generate a detailed report including document types and specific retention periods:

```bash
records-manager retention check --detailed --format markdown
```

**Expected output:**
```
# Retention Compliance Report
Generated: 2025-01-20

## Summary by Document Type

| Type | Total | Compliant | Review | Overdue |
|------|-------|-----------|--------|---------|
| Invoice | 45 | 43 | 2 | 0 |
| Receipt | 78 | 75 | 3 | 0 |
| Tax Return | 5 | 5 | 0 | 0 |
| Contract | 12 | 10 | 0 | 2 |

## Overdue Documents

| Document | Type | Entity | Expired |
|----------|------|--------|---------|
| Employment Agreement | contract | corporate | 2024-01-15 (365 days) |
| Lease Agreement | contract | household | 2024-06-01 (232 days) |

## Recommended Actions

1. Review 2 overdue contracts for archiving or extension

2. Process 5 documents approaching 60-day threshold

3. Archive expired documents following deletion workflow
```

## Step 5: Export Retention Report

Save the report for audit purposes:

```bash
# Save as Markdown
records-manager retention check --detailed --format markdown > retention-report.md

# Save as JSON for processing
records-manager retention check --format json > retention-report.json

# Save as CSV for spreadsheet analysis
records-manager retention check --format csv > retention-report.csv
```

## Step 6: Understand Retention by Country

Check retention requirements for your configured country:

```bash
records-manager retention rules --country AU
```

**Expected output:**
```
🇦🇺 Australian Retention Requirements

Income Tax Documents: 5 years after EOFY
*   Tax returns, assessments, notices
*   Payment summaries
*   Business activity statements

GST Records: 5 years
*   Tax invoices
*   Credit/debit notes
*   Accounting records

Employee Records: 7 years after termination
*   Tax file declarations
*   Payment summaries
*   Superannuation contributions

Trust Documents: Special rules
*   Trust deeds: Permanent retention
*   Family Trust Election: 5+ years from FTE date
*   Distribution minutes: 5 years from EOFY

Source: Australian Taxation Office (ATO)
```

## Expected Outcomes

After completing this tutorial, you should be able to:

- ✅ Run retention compliance checks
- ✅ Identify documents approaching expiry
- ✅ Export reports in multiple formats
- ✅ Understand jurisdiction-specific requirements
- ✅ Take action on non-compliant documents

## Troubleshooting

### Issue: "No documents found"

**Solution:** Ensure documents are uploaded:

1. Check documents exist in paperless-ngx

2. Verify document dates are set correctly

3. Confirm entity configuration

### Issue: "Jurisdiction not configured"

**Solution:** Set your country in environment variables:
```bash
# Add to .env or shell profile
export MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY=AU
```

### Issue: "Incorrect retention calculated"

**Solution:** Verify document metadata:

1. Check `created` date is accurate

2. Ensure `document-type` is correctly assigned

3. For trusts, verify `trust-deed-date` is set

## Best Practices

1. **Run monthly** retention checks to stay ahead of deadlines

2. **Export reports** for audit trails and compliance evidence

3. **Set calendar reminders** for quarterly reviews

4. **Archive, don't delete** - use the deletion workflow for confirmation

5. **Keep trust deeds permanently** - they should never expire

## Taking Action on Non-Compliant Documents

When documents are overdue or approaching deadline:

1. **Review required** (30-60 days):

   * Determine if document should be kept longer

   * Check if legal/tax obligation extends retention

   * Document reason for extended retention

2. **Overdue** (past retention):

   * Verify no active legal/tax requirement

   * Use deletion workflow for confirmation

   * Archive if uncertain rather than delete

3. **Trust documents**:

   * Never delete trust deeds

   * Keep FTE documents for 5+ years from FTE date

   * Maintain distribution records

## Next Steps

* Review [Deletion Workflow](../workflows/deletion-confirmation.md) for safe document removal

* Set up [Automated Retention Monitoring](../workflows/index.md)

* Learn [Batch Import](./batch-import.md) for existing document migrations
