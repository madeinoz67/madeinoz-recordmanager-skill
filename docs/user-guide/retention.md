# Retention and Compliance

Document retention is a critical legal requirement. Records Manager helps you comply with country-specific regulations by tracking how long documents must be kept and when they can be safely deleted.

## Why Retention Matters

### Legal Obligations

Tax authorities and regulatory bodies mandate minimum retention periods:

- **ATO (Australia)**: 7 years for most tax documents
- **IRS (United States)**: 3-7 years depending on document type
- **HMRC (United Kingdom)**: 7 years for self-assessment records

### Consequences of Non-Compliance

- Penalties for missing records during audit
- Inability to substantiate tax deductions
- Legal exposure in disputes
- Trust compliance issues

## Retention Periods (Australia)

### Financial Documents (7 years)

| Document Type | Retention | ATO Reference |
|---------------|-----------|---------------|
| Tax Returns | 7 years | Section 254, Tax Administration Act 1953 |
| Tax Assessments | 7 years | ATO requirement |
| Invoices | 7 years | Income and deduction substantiation |
| Receipts | 7 years | Expense substantiation |
| Bank Statements | 5 years | Income and deduction evidence |
| Investment Statements | 7 years | Capital gains tax calculation |
| Superannuation Statements | 7 years | Contribution and balance records |
| Dividend Statements | 7 years | Investment income substantiation |
| Loan Documents | 7 years | Interest deduction evidence |
| Mortgage Statements | 7 years | Interest deduction substantiation |

### Medical Records (7-10 years)

| Document Type | Retention | Reason |
|---------------|-----------|--------|
| Medical Receipts | 7 years | Tax deduction substantiation |
| Test Results | 7 years | Medical history and tax |
| Prescriptions | 5 years | Medical expense substantiation |
| Health Records | 10 years | Long-term personal health history |
| Referral Letters | 5 years | Treatment substantiation |

### Insurance Documents (10 years)

| Document Type | Retention | Reason |
|---------------|-----------|--------|
| Insurance Policies | 10 years | Until expired + claims period |
| Insurance Claims | 7 years | Tax deduction + dispute period |
| Home Insurance | 10 years | Current + expired policy |
| Vehicle Insurance | 10 years | Current + expired policy |
| Health Insurance | 10 years | Current + expired policy |

### Legal Documents (10-15 years)

| Document Type | Retention | Reason |
|---------------|-----------|--------|
| Contracts | 10 years | Statute of limitations |
| Wills | 15 years | Permanent personal record |
| Powers of Attorney | 15 years | Permanent legal record |
| Lease Agreements | 7 years | Contract statute of limitations |
| Loan Agreements | 7 years | Contract and tax substantiation |

### Trust Documents (5-15 years)

| Document Type | Retention | Reason |
|---------------|-----------|--------|
| Trust Deed | 15 years | Permanent trust record |
| Family Trust Election (FTE) | **5 years from FTE date** | Special ATO rule (not EOFY) |
| Trustee Resolutions | 7 years | Distribution substantiation |
| Distribution Minutes | 7 years | Distribution evidence |
| Beneficiary Declarations | 7 years | Entitlement evidence |
| Annual Financial Statements | 7 years | Income tax substantiation |
| Unit Registry | 15 years | Permanent ownership record |
| Unit Distribution Statements | 7 years | CGT calculation evidence |

### Identity Documents (5-15 years)

| Document Type | Retention | Reason |
|---------------|-----------|--------|
| Birth Certificate | 15 years | Permanent personal record |
| Passport | 10 years | Until expired + travel history |
| Driver License | 5 years | Until renewed |
| Medicare Card | 5 years | Current card + claims evidence |
| Marriage Certificate | 15 years | Permanent legal record |
| Citizenship Certificate | 15 years | Permanent personal record |

## Retention Workflow

### Check Individual Document

```
User: "Check retention for document 1234"
AI: "Document #1234: Medical Receipt - Dr Smith"
    "  Created: 2024-03-15"
    "  Retention: 7 years"
    "  Retain Until: 2031-03-15"
    "  Reason: ATO tax deduction substantiation"
    "  Status: Keep - retention period active"
```

### Check by Category

```
User: "Check retention for all tax documents"
AI: "Tax Document Retention Status:"
    "  Tax Return 2018: Retention expires 2025-10-31 (safe to delete after)"
    "  Tax Assessment 2020: Retention expires 2027-11-15 (keep)"
    "  Invoice #4567: Retention expires 2028-03-20 (keep)"
    ""
    "  Documents past retention: 1"
    "  Documents within retention: 2"
```

### Check Before Deletion

```
User: "Can I delete my 2018 documents?"
AI: "Analyzing 2018 documents for deletion eligibility..."
    ""
    "SAFE TO DELETE (24):"
    "  - Bank Statements (5-year retention expired)"
    "  - Utility Bills (2-year retention expired)"
    "  - Receipts (5-year retention expired)"
    ""
    "⚠️  MUST KEEP (8):"
    "  - Tax Return 2018 (7-year retention until 2025-10-31)"
    "  - Insurance Policies (keep until expired + 10 years)"
    "  - Legal Documents (10-year retention until 2028)"
    ""
    "Recommendation: Delete safe documents, retain others"
```

## Special Retention Cases

### Family Trust Election (FTE)

**CRITICAL**: FTE retention is calculated from the FTE lodgment date, NOT EOFY.

This is a common source of confusion. The ATO specifically requires FTE documents to be retained for 5 years from the lodgment date of the FTE itself.

```
User: "When can I delete my Family Trust Election document?"
AI: "Family Trust Election Date: 2020-02-01"
    "Retention Period: 5 years from FTE date"
    "Retain Until: 2025-02-01"
    ""
    "⚠️  DO NOT DELETE before 2025-02-01"
    "ATO Requirement: Section 272-80 ITAA 1936"
    "Reason: FTE must be retained for 5 years from lodgment date"
    ""
    "Current Date: 2025-01-20"
    "Days Remaining: 12 days"
    ""
    "After 2025-02-01, you may safely delete this document"
```

**Why this matters:**
- EOFY is June 30, but FTE lodgment could be any date
- Deleting FTE before 5 years from lodgment risks entire trust structure
- ATO can request FTE during audits to verify trust eligibility

### Pre-EOFY Trustee Resolutions

Trustee resolutions made before June 30 each year document the trustee's intention to distribute income. These must be retained for 7 years.

```
User: "Check retention for trustee resolutions"
AI: "Trustee Resolutions - Retention Status:"
    "  Pre-EOFY Resolution 2023: Retention until 2030-06-30"
    "  Pre-EOFY Resolution 2022: Retention until 2029-06-30"
    "  "
    "  Required for: ATO distribution substantiation"
    "  ATO Reference: Section 100A ITAA 1936 compliance"
```

### Permanent Records

Some documents should essentially never be destroyed:

- **Trust Deeds**: Foundational trust documents
- **Wills**: Estate planning documents
- **Powers of Attorney**: Legal authority documents
- **Birth/Marriage/Death Certificates**: Vital records
- **Company Constitutions**: Corporate governance documents

## Retention Audit Workflow

### Annual Retention Review

```
User: "Run retention audit for all documents"
AI: "Retention Audit Results:"
    ""
    "Total Documents: 1,247"
    "Within Retention: 1,198"
    "Past Retention: 49"
    ""
    "Documents past retention (49):"
    "  Category            | Count | Earliest   | Safe to Delete"
    "  ------------------- | ----- | ---------- | -------------"
    "  Bank Statements     | 24    | 2018-01-01 | ✓ Yes"
    "  Utility Bills       | 18    | 2018-03-15 | ✓ Yes"
    "  Tax Returns         | 3     | 2017-07-01 | ✓ Yes"
    "  Receipts            | 4     | 2017-11-20 | ✓ Yes"
    ""
    "Recommendations:"
    "  1. Archive bank statements (minimal value)"
    "  2. Delete utility bills (no ongoing value)"
    "  3. Review tax returns with accountant before deletion"
    "  4. Archive receipts with potential warranty claims"
```

### Quarterly Retention Check

```
User: "Check retention status for this quarter"
AI: "Quarterly Retention Status:"
    ""
    "Expiring This Quarter:"
    "  - FTE Document: Smith Family Trust (expires 2025-02-01)"
    "  - Tax Return 2018: Retention expires 2025-10-31"
    ""
    "Action Required:"
    "  1. Plan FTE archival after 2025-02-01"
    "  2. Review 2018 tax return for archival"
```

## Retention by Country

### Australia (Default)

- Tax records: 7 years
- Trust deeds: 15 years (permanent)
- FTE: 5 years from FTE date (special rule)

### United States

- Tax returns: 7 years (IRS recommendation)
- Supporting documents: 7 years
- Employment records: 7 years
- Insurance policies: Until expired + claims period

### United Kingdom

- Self-assessment records: 7 years (HMRC)
- SA302 forms: 7 years
- P60/P11D: 7 years
- Medical records: 10 years (NHS guidance)

## Retention Best Practices

### 1. Calculate Retention from Document Date

Not current date. Use created or document date:

```
Correct: Document dated 2020-06-01 → Retention until 2027-06-01
Incorrect: Document uploaded 2024 → Retention until 2031
```

### 2. Track FTE Dates Separately

For Family Trust Elections, record the FTE lodgment date:

```
Document: Family Trust Election
FTE Date: 2020-02-01 (not EOFY 2020-06-30)
Retention Until: 2025-02-01 (5 years from FTE date)
```

### 3. Use Tags for Retention Tracking

Tag documents with retention requirements:

```
retention:7yrs
retention:permanent
retention:fte-2025-02-01
```

### 4. Set Calendar Reminders

For critical retention dates:

```
- FTE Retention Review: 30 days before expiration
- EOFY Document Review: May each year
- Annual Retention Audit: First week of new financial year
```

### 5. Archive, Don't Delete

For documents past retention but with potential value:

```
- Move to archive storage
- Remove from active search
- Keep for "just in case" scenarios
```

## Deletion Safety

### Never Delete Without Checking

Always run retention check before deletion:

```
User: "Delete old documents"
AI: "⚠️  WARNING: Always check retention before deletion"
    "Run: 'Check retention for [documents]' first"
    ""
    "Some documents cannot be legally deleted even if old:"
    "  - FTE documents (5 years from FTE date)"
    "  - Trust deeds (permanent)"
    "  - Active insurance policies"
```

### Mandatory Confirmation

Deletion always requires explicit confirmation:

```
I understand this cannot be undone and I want to proceed with deleting N documents
```

### Audit Trail

All deletion decisions are logged:

```
Deletion Log Entry:
  Date: 2025-01-20
  User: [username]
  Documents: 24 (Bank Statements from 2018)
  Reason: Past 5-year retention period
  Confirmation: Exact phrase confirmed
```

## CLI Retention Commands

```bash
# Check retention for a document
bun run RecordManager.ts retention --doc-id 1234

# Check retention for domain
bun run RecordManager.ts retention --domain household

# Check retention for document type
bun run RecordManager.ts retention --type "Invoice"

# Full retention audit
bun run RecordManager.ts retention --audit
```

## Retention Calendar

### Monthly

- Check for documents nearing retention expiration
- Review FTE retention status (if applicable)

### Quarterly

- Review retention status for quarter
- Plan archival for expiring documents

### Annually (EOFY)

- Full retention audit
- Archive expired documents
- Update retention tracking
- Review trust document completeness

### Multi-Year

- Trust deeds: Keep forever (essentially permanent)
- Wills and powers of attorney: Keep forever
- Vital records: Keep forever
