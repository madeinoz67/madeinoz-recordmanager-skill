# Tag-Based Organization

Tags are the foundation of document organization in Records Manager. A well-designed tagging strategy makes your documents instantly searchable and manageable.

## Tag Philosophy

**Tags are permanent.** Well-tagged documents are findable documents.

Unlike folders where a document can only exist in one location, tags allow documents to exist in multiple contexts simultaneously. An invoice can be both `financial` and `tax-deductible` and `2024` and relate to a specific trust.

## Tag Categories

Records Manager uses several tag categories:

### Domain Tags

Identify the entity or context:

- `household` - Personal records
- `corporate` - Business records
- `unit-trust` - Unit trust documents
- `discretionary-trust` - Discretionary trust documents
- `family-trust` - Family trust documents
- `project` - Project-based documents

### Category Tags

High-level document classification:

- `financial` - Money-related documents
- `medical` - Health and medical records
- `insurance` - Insurance policies and claims
- `legal` - Contracts and legal documents
- `hr` - Human resources records
- `compliance` - Regulatory and audit documents
- `reporting` - Financial statements and reports
- `governance` - Trust governance documents
- `household` - Home and utility records
- `vehicle` - Car and vehicle records
- `pet` - Pet-related documents
- `identity` - Identity documents

### Document Type Tags

Specific document identification:

- `invoice`, `receipt`, `contract`
- `tax-return`, `bank-statement`
- `insurance-policy`, `insurance-claim`
- `trust-deed`, `trustee-resolution`
- `distribution-minutes`

### Status Tags

Document state or purpose:

- `tax-deductible` - Claimable on tax return
- `paid`, `unpaid` - Payment status
- `pending` - Awaiting action
- `archived` - No longer active
- `critical` - Important documents (FTE, trust deeds)

### Temporal Tags

Time-based organization:

- `2024`, `2023`, `2022` - Financial years
- `q1`, `q2`, `q3`, `q4` - Quarters
- `january`, `february`, etc. - Months

## Tag Suggestion System

Records Manager automatically suggests tags based on:

### Filename Analysis

```
File: "medical-receipt-dr-smith-2024.pdf"
Suggested tags:
  - medical (from "medical")
  - receipt (from "receipt")
  - 2024 (from "2024")
```

### Content Analysis

```
File: "scan001.pdf" (content includes "Tax Return for 2023")
Suggested tags:
  - tax (from content)
  - 2023 (from content)
```

### Domain Patterns

Each domain has characteristic tag patterns:

**Household:**
```
financial: tax, income, expense, investment, superannuation
medical: doctor, hospital, pharmacy, insurance, receipt
insurance: home, contents, vehicle, health, life
```

**Corporate:**
```
financial: accounts-payable, accounts-receivable, expense, revenue
hr: employee, payroll, leave, performance
compliance: audit, report, certificate, permit
```

**Trusts:**
```
governance: trustee-resolution, minutes, variation
financial: distribution, income, capital-gain
regulatory: abn, tfn, ato, lodgment
```

## Tagging Workflow

### Upload Tagging

When uploading documents, tags are suggested automatically:

```
User: "Upload medical-receipt.pdf"
AI: "Suggested tags:"
    "  - medical (category)"
    "  - receipt (document type)"
    "  - 2024 (year)"
    "  - tax-deductible (potential deduction)"
    ""
    "Accept these tags? (yes/no/modify)"
```

### Adding Tags Later

Apply tags to existing documents:

```
User: "Tag documents 1234, 1235 as tax-deductible"
AI: "Applying 'tax-deductible' tag to 2 documents..."
    "✅ Complete"
```

### Bulk Tagging

Tag multiple documents at once:

```bash
# Tag all search results
bun run RecordManager.ts search --query "office supplies" --tag "expense"
```

## Tag Strategies by Domain

### Household Domain

**Essential Tags:**
```
financial, medical, insurance, legal, household, vehicle, pet, identity
```

**Year Tags:**
```
2024, 2023, 2022, etc.
```

**Household-Specific:**
```
# Financial
tax, income, expense, investment, superannuation, dividend, loan, mortgage

# Medical
doctor, hospital, pharmacy, receipt, referral, test-results, prescription

# Insurance
home, contents, vehicle, health, life, claim, pet-insurance

# Household
utility, maintenance, warranty, manual, rate-notice

# Vehicle
car, registration, lease, insurance

# Pet
vaccination, microchip, vet, pet-registration

# Identity
passport, license, medicare, citizenship, marriage, divorce
```

### Corporate Domain

**Essential Tags:**
```
financial, hr, legal, compliance, corporate, reporting
```

**Corporate-Specific:**
```
# Financial
accounts-payable, accounts-receivable, expense, revenue, purchase-order

# HR
employee, payroll, leave, performance, pay-slip, timesheet

# Compliance
audit, report, certificate, permit, license

# Reporting
balance-sheet, cash-flow, income-statement, equity
```

### Trust Domains

**Essential Tags:**
```
governance, financial, regulatory, [trust-type]
```

**Unit Trust Tags:**
```
unit-trust, unit-registry, distribution, unitholder, unit-transfer
capital-account, unit-statement
```

**Discretionary Trust Tags:**
```
discretionary-trust, beneficiary, distribution, pre-eofy, streaming
trustee-resolution, minutes, variation
```

**Family Trust Tags:**
```
family-trust, fte, family-trust-election, beneficiary, interposed-entity
trustee-resolution, pre-eofy, distribution-minutes
```

**Critical Trust Tags:**
```
critical - For FTE, trust deeds, appointments
permanent - For documents never to be deleted
```

## Tag Organization Principles

### 1. Category First

Always include a category tag:

```
Good: medical, receipt, 2024
Bad: dr-smith-receipt
```

### 2. Add Context

Include domain and purpose tags:

```
Good: household, financial, tax-deductible, 2024
Bad: receipt, 2024
```

### 3. Use Consistent Naming

Establish tag naming conventions:

```
Good: tax-deductible (always hyphenated)
Bad: tax_deductible, taxdeductible, Tax Deductible
```

### 4. Tag for Findability

Tag for how you'll search, not just describe:

```
Good: tax-deductible (you'll search for this)
Bad: receipt-from-dr-smith-in-march (too specific)
```

### 5. Year Tags Are Essential

Always tag with financial year:

```
Good: 2024, tax, income
Bad: tax, income (which year?)
```

## Tag Management

### Creating Tags

Tags are created automatically when needed:

```
User: "Tag 1234 as new-tag"
AI: "Tag 'new-tag' created and applied to document #1234"
```

### Renaming Tags

Rename through paperless-ngx UI for bulk changes:

1. Access paperless-ngx
2. Go to Tags section
3. Edit tag name
4. All documents update automatically

### Merging Tags

Combine similar tags:

1. Identify duplicates: `receipt` and `receipts`
2. Choose primary tag
3. Use Tag workflow to reapply
4. Remove unused tag

### Deleting Tags

Remove unused tags through paperless-ngx:
- Tag deletion doesn't delete documents
- Documents simply lose that tag

## Tag Cleanup Workflow

### Find Untagged Documents

```
User: "Find untagged documents"
AI: "Found 23 untagged documents:"
    "  #4567: [Untitled]"
    "  #4568: scan001.pdf"
    "  ..."
```

### Organize Poorly Tagged Documents

```
User: "Organize household documents"
AI: "Found 15 documents with inconsistent tagging:"
    "  #5678: Only tagged 'receipt' → Suggest: financial, receipt, 2024"
    "  #5679: Only tagged 'pdf' → Suggest: remove 'pdf', add appropriate tags"
```

## Tag Best Practices

### DO

- **Use lowercase**: `tax-deductible`, not `Tax-Deductible`
- **Hyphenate multi-word**: `tax-deductible`, not `tax deductible`
- **Use year tags**: Always include `2024`, `2023`, etc.
- **Tag by category**: Always include category tag
- **Tag for search**: Tag how you'll search later
- **Be consistent**: Use same tags for similar documents

### DON'T

- **Don't over-tag**: 3-5 tags is usually enough
- **Don't use vague tags**: `document`, `pdf`, `file` are useless
- **Don't tag for content**: Content search finds words; tags find categories
- **Don't create single-use tags**: Tags should apply to multiple documents
- **Don't tag everything**: Not every document needs every relevant tag

## Tag Examples by Document Type

### Invoice

```
File: "invoice-acme-supply-2024-03-15.pdf"
Tags:
  - financial (category)
  - invoice (type)
  - 2024 (year)
  - unpaid (status)
```

### Medical Receipt

```
File: "receipt-dr-smith-2024-02-20.pdf"
Tags:
  - medical (category)
  - receipt (type)
  - 2024 (year)
  - tax-deductible (purpose)
```

### Insurance Policy

```
File: "home-insurance-policy-2024.pdf"
Tags:
  - insurance (category)
  - home (type)
  - household (domain)
  - 2024 (year)
  - insurance-policy (type)
```

### Trust Deed

```
File: "smith-family-trust-deed.pdf"
Tags:
  - family-trust (domain)
  - governance (category)
  - trust-deed (type)
  - critical (importance)
  - permanent (retention)
```

### Tax Return

```
File: "tax-return-2024.pdf"
Tags:
  - household (domain)
  - financial (category)
  - tax-return (type)
  - 2024 (year)
  - tax (purpose)
```

## Advanced Tagging

### Entity Tags

For multi-entity management:

```
entity:smith-family-trust
entity:jones-unit-trust
entity:abc-corporation
```

### Workflow Tags

Track document processing:

```
uploaded:2024-03-15
processed:2024-03-16
reviewed:2024-03-17
```

### Sensitivity Tags

For document classification:

```
sensitivity:public
sensitivity:confidential
sensitivity:secret
```

## Tag Maintenance Schedule

### Weekly
- Tag new uploads properly
- Fix any mis-tagged documents

### Monthly
- Review tag consistency
- Merge duplicate tags
- Remove unused tags

### Quarterly
- Audit tag usage
- Identify tag gaps
- Update tag conventions

### Annually
- Archive old year tags
- Create new year tags
- Review entire tag structure
