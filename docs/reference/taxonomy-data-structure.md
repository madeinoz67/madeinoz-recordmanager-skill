# Taxonomy Data Structure

This reference describes the taxonomy data structures used by the Records Manager for document classification, tagging, and retention rules.

## Overview

The taxonomy system provides country-specific record keeping guidelines with domain-specific document types, tag categories, and retention rules.

## Type Definitions

### Domain

A domain represents a record keeping context (household, corporate, trusts, projects).

```typescript
type Domain =
  | 'household'
  | 'corporate'
  | 'projects'
  | 'unit-trust'
  | 'discretionary-trust'
  | 'family-trust';
```

### Taxonomy Suggestion

Result from analyzing a document for metadata suggestions.

```typescript
interface TaxonomySuggestion {
  tags: string[];              // Suggested tag names
  documentType?: string;       // Matching document type
  retentionYears?: number;     // Suggested retention period
  retentionReason?: string;    // Legal/regulatory reason
  notes?: string;              // Additional notes/warnings
}
```

### Domain Taxonomy

Complete taxonomy definition for a domain.

```typescript
interface DomainTaxonomy {
  documentTypes: string[];                    // Available document types
  tagCategories: {                            // Tag category mappings
    [category: string]: string[];             // category -> tags[]
  };
  retentionRules: {                           // Document type retention
    [documentType: string]: {
      years: number;                          // Retention period
      reason: string;                         // Legal basis
    };
  };
}
```

## Entity Types

The Records Manager supports multiple entity types, each with specialized taxonomies.

| Entity Type | Description | Use Case |
|-------------|-------------|----------|
| `household` | Personal and family records | Personal finance, medical, identity documents |
| `corporate` | Business records | Invoices, payroll, contracts, compliance |
| `unit-trust` | Unit trust structures | Unit registries, distributions, capital accounts |
| `discretionary-trust` | Discretionary family trusts | Distribution minutes, beneficiary declarations |
| `family-trust` | Family trusts with FTE | Family Trust Election, streaming resolutions |
| `project` | Project-based records | Project documentation, deliverables |
| `person` | Individual family members | Personal records, identity documents |

## Tag Categories

Tags are organized into categories for consistent classification. Below are the standard categories by domain.

### Household Tag Categories

| Category | Tags |
|----------|------|
| `financial` | tax, income, expense, investment, superannuation, dividend, loan, mortgage |
| `medical` | doctor, hospital, pharmacy, insurance, receipt, referral, test-results, prescription, health-record |
| `insurance` | home, contents, vehicle, health, life, claim, pet-insurance |
| `legal` | contract, agreement, will, power-of-attorney, lease |
| `education` | transcript, certificate, qualification |
| `household` | utility, maintenance, warranty, manual, rate-notice |
| `vehicle` | car, registration, lease, insurance |
| `pet` | vaccination, microchip, vet, pet-registration, desexing, breed, adoption |
| `identity` | birth-certificate, passport, license, medicare, citizenship, marriage, divorce, death, name-change, wwcc |

### Corporate Tag Categories

| Category | Tags |
|----------|------|
| `financial` | accounts-payable, accounts-receivable, expense, revenue, purchase-order, credit-note, debit-note |
| `legal` | contract, agreement, insurance, license, lease, loan |
| `hr` | employee, payroll, leave, performance, pay-slip, timesheet, employee-contract, termination, warning |
| `compliance` | audit, report, certificate, permit |
| `corporate` | board, shareholder, meeting, resolution |
| `reporting` | balance-sheet, cash-flow, income-statement, equity, statement-of-changes |
| `vehicle` | car, registration, lease |

### Trust Tag Categories (All Trust Types)

| Category | Tags |
|----------|------|
| `financial` | income, expense, capital-gain, loss, gst, distribution |
| `compliance` | tax, superannuation, gst, bas, actuarial |
| `governance` | trustee, beneficiary, resolution, minutes, trust-deed, correspondence |

### Unit Trust Specific Tags

| Category | Tags |
|----------|------|
| `unit-trust` | unit-registry, distribution, unitholder, unit-transfer, capital-account, unit-statement |

### Discretionary Trust Specific Tags

| Category | Tags |
|----------|------|
| `discretionary-trust` | trustee-resolution, beneficiary, distribution, pre-eofy, streaming |

### Family Trust Specific Tags

| Category | Tags |
|----------|------|
| `family-trust` | fte, family-trust-election, beneficiary, trustee-resolution, interpositionary |

## Document Types

### Household Document Types (Australia)

**Financial:** Tax Return, Tax Assessment, Bank Statement, Investment Statement, Superannuation Statement, Dividend Statement, Loan Document, Mortgage Statement, Rate Notice

**Medical:** Medical Receipt, Health Record, Referral Letter, Test Results, Prescription

**Insurance:** Insurance Policy, Insurance Claim

**Legal:** Contract, Legal Document, Lease Agreement, Car Lease

**Identity:** Birth Certificate, Passport, Driver License, Medicare Card, Citizenship Certificate, Marriage Certificate, Divorce Decree, Death Certificate, Change of Name Certificate, Working With Children Check

**Household:** Utility Bill, Warranty Document, Education Record

**Vehicle:** Car Registration

**Pet:** Pet Vaccination Record, Pet Medical Record, Pet Insurance Policy, Pet Microchip Registration, Pet Registration, Pet Adoption Record, Breeder Certificate

### Corporate Document Types (Australia)

**Financial:** Invoice, Receipt, Purchase Order, Credit Note, Debit Note

**Reporting:** Financial Statement, Balance Sheet, Cash Flow Statement, Income Statement, Statement of Changes, Equity Statement

**HR:** Employee Record, Payroll Record, Pay Slip, Timesheet, Employee Contract, Termination Letter, Warning Letter

**Legal:** Contract, Lease Agreement, Loan Agreement

**Compliance:** Tax Document, Compliance Report, License, Permit, Insurance Certificate

**Corporate:** Board Resolution, Shareholder Record

**Vehicle:** Car Registration

### Trust Document Types

**Unit Trust:** Trust Deed, Unit Registry, Trustee Appointment, ABN Registration, TFN Registration, Annual Financial Statements, Unit Distribution Statement, Tax Return, Unit Transfer Form, Beneficiary Statement, Trustee Resolution, Trustee Minutes, GST Registration, Business Activity Statement, Capital Account Statement, Variation to Trust Deed, Unit Statement, Unitholder Statement, Trust Correspondence, Actuarial Certificate

**Discretionary Trust:** Trust Deed, Trustee Resolution, Trustee Minutes, Beneficiary Declaration, Distribution Minutes, Annual Financial Statements, Tax Return, Beneficiary Consent, Trustee Appointment, Trustee Resignation, Variation to Trust Deed, Appointor Appointment, Appointor Resignation, Guardian Appointment, Income Distribution Statement, Capital Gains Tax Election, Streaming Resolution, Trust Correspondence, Actuarial Certificate

**Family Trust:** Trust Deed, Family Trust Election, Trustee Resolution, Trustee Minutes, Beneficiary Declaration, Distribution Minutes, Annual Financial Statements, Tax Return, Beneficiary Consent, Trustee Appointment, Trustee Resignation, Variation to Trust Deed, Appointor Appointment, Appointor Resignation, Interpositionary Trust Election, Loss Trust Election, Revocation of Family Trust Election, Income Distribution Statement, Trust Correspondence, Actuarial Certificate

## Retention Rules

### Retention Rule Format

```typescript
{
  years: number;      // 0 = keep forever/until expired
  reason: string;     // Legal or regulatory basis
}
```

### Key Retention Periods (Australia)

| Document Type | Years | Reason |
|---------------|-------|--------|
| Tax Returns | 7 | ATO Section 254 of Tax Administration Act 1953 |
| Tax Assessments | 7 | ATO requirement |
| Bank Statements | 5 | ATO evidence for income and deductions |
| Investment Statements | 7 | ATO capital gains tax calculation |
| Medical Receipts | 7 | ATO tax deduction substantiation |
| Insurance Policies | 10 | Until expired + claims period |
| Contracts | 10 | Statute of limitations |
| Legal Documents | 15 | Indefinitely for wills, powers of attorney |
| Warranties | 0 | Keep until warranty expires |
| Birth Certificate | 15 | Permanent personal record |
| Passport | 10 | Keep until expired + travel history |
| Working With Children Check | 5 | Keep until renewed |

### Family Trust Election (FTE) - Critical Retention

**Family Trust Election documents require 5+ year retention from FTE date, NOT EOFY.**

| Document Type | Years | Reason |
|---------------|-------|--------|
| Family Trust Election | 5 | ATO Section 272-80 ITAA 1936 - 5 years from FTE date |
| Interpositionary Trust Election | 5 | ATO Section 272-80 ITAA 1936 |
| Loss Trust Election | 5 | ATO Section 272-80 ITAA 1936 |
| Revocation of Family Trust Election | 5 | ATO Section 272-80 ITAA 1936 |

### Trust Document Retention

| Document Type | Years | Reason |
|---------------|-------|--------|
| Trust Deed | 15 | Permanent trust record - foundational document |
| Variation to Trust Deed | 15 | Permanent trust amendment record |
| Trustee Appointment | 15 | Permanent governance record |
| Appointor Appointment | 15 | Permanent governance - appointor controls trust |
| Trustee Resolutions | 7 | ATO distribution substantiation |
| Annual Financial Statements | 7 | ATO income tax substantiation |
| Unit/Income Distribution Statements | 7 | ATO CGT calculation |

## Validation Requirements

### Entity Validation

Each entity type has specific validation requirements:

#### Household
- `householdName` (required, 2+ characters)
- `startYear` (optional, valid year)

#### Corporate
- `businessName` (required, 2+ characters)
- `abn` (optional, 11 digits if provided)
- `businessType` (required: sole-trader, company, partnership)

#### Unit Trust
- `trustName` (required, 2+ characters)
- `trusteeName` (required, 2+ characters)
- `abn` (required, 11 digits)
- `tfn` (optional, 8-9 digits)
- `unitCount` (optional, positive number)

#### Discretionary Trust
- `trustName` (required, 2+ characters)
- `trusteeName` (required, 2+ characters)
- `abn` (required, 11 digits)
- `tfn` (optional, 8-9 digits)
- `beneficiaries` (optional, comma-separated list)

#### Family Trust
- `trustName` (required, 2+ characters)
- `trusteeName` (required, 2+ characters)
- `abn` (required, 11 digits)
- `tfn` (optional, 8-9 digits)
- `fteDate` (required, valid date) - **CRITICAL for retention**

#### Project
- `projectName` (required, 2+ characters)
- `projectType` (required: software, construction, research, creative, other)
- `startDate` (optional, valid date)

#### Person
- `fullName` (required, 2+ characters)
- `relationship` (required: self, spouse, child, parent, sibling, other)
- `dateOfBirth` (optional, valid date)
- `email` (optional, valid email format)
- `phone` (optional)

### Storage Path Mapping

Each entity type has a default storage path:

| Entity Type | Storage Path |
|-------------|--------------|
| `household` | `/Household/{name}` |
| `corporate` | `/Corporate/{name}` |
| `unit-trust` | `/Trusts/Unit Trusts/{name}` |
| `discretionary-trust` | `/Trusts/Discretionary Trusts/{name}` |
| `family-trust` | `/Trusts/Family Trusts/{name}` |
| `project` | `/Projects/{name}` |
| `person` | `/Household/People/{name}` |

### Tag Color Mapping

Each entity type has an associated tag color:

| Entity Type | Color |
|-------------|-------|
| `household` | #4a90d9 (blue) |
| `corporate` | #50c878 (green) |
| `unit-trust` | #ff6b6b (red) |
| `discretionary-trust` | #ffd93d (yellow) |
| `family-trust` | #6bcb77 (light green) |
| `project` | #9b59b6 (purple) |
| `person` | #e056fd (magenta) |

## Country Support

| Country | Household | Corporate | Trusts |
|---------|-----------|-----------|--------|
| Australia | Full | Full | Full (all types) |
| United States | Full | Planned | Planned |
| United Kingdom | Full | Planned | Planned |

## Related Documentation

- [CLI Command Reference](cli.md) - Using taxonomies from the CLI
- [Entity Management](../user-guide/entity-management.md) - Creating and managing entities
- [Trust Documents](../user-guide/trust-documents.md) - Trust-specific document handling
