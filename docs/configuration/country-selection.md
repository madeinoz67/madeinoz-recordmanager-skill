# Country Selection

The Records Manager Skill provides country-specific record keeping guidelines for compliance with local regulations. This guide covers selecting and configuring your country.

## Supported Countries

| Country | Code | Authority | Status |
|---------|------|-----------|--------|
| Australia | `Australia` | ATO (Australian Taxation Office) | Full support |
| United States | `UnitedStates` | IRS (Internal Revenue Service) | Full support |
| United Kingdom | `UnitedKingdom` | HMRC (HM Revenue & Customs) | Full support |

## Configuration

Set your country in `$PAI_DIR/.env`:

```bash
MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
```

If not specified, the default is `Australia`.

## Country Guidelines

### Australia

**Authority:** Australian Taxation Office (ATO)

**Key Regulations:**
*   Tax Administration Act 1953, Section 254
*   Family Trust Election (Section 272-80 ITAA 1936)
*   Corporations Act 2001

**Standard Retention Periods:**

| Document Type | Retention | Legal Basis |
|---------------|-----------|-------------|
| Tax Returns | 7 years | ATO Section 254 |
| Tax Assessments | 7 years | ATO requirement |
| Medical Receipts | 7 years | Tax deduction substantiation |
| Bank Statements | 5 years | Income/deduction evidence |
| Investment Statements | 7 years | Capital gains tax calculation |
| Insurance Policies | 10 years | Claims period + expired policies |
| Contracts | 10 years | Statute of limitations |
| Legal Documents | 15+ years | Permanent records (wills, POA) |
| Warrant | Until expires | Consumer guarantees |

**Trust-Specific Retention:**

| Document | Retention | Special Notes |
|----------|-----------|---------------|
| Trust Deed | 15+ years | Permanent - foundational document |
| Family Trust Election (FTE) | 5 years | **From FTE date, not EOFY** |
| Distribution Minutes | 7 years | ATO Section 100A compliance |
| Trustee Resolutions | 7 years | Governance evidence |

**Supported Domains:**

*   `household` - Personal records with comprehensive coverage

*   `corporate` - Business records, Fair Work Act compliance

*   `unit-trust` - Unit trust structures

*   `discretionary-trust` - Family trusts with discretionary distributions

*   `family-trust` - Family trusts with FTE (including interpositionary and loss trust elections)

**Special Considerations:**

*   **Family Trust Election (FTE):** Critical document - 5-year retention from FTE date, NOT end of financial year. Affects entire trust structure.

*   **Trust Deeds:** Should be kept permanently - never discard

*   **Superannuation:** 7-year retention for contribution and balance records

*   **Pets:** 10-year retention for veterinary records, lifetime for microchip/ownership documents

### United States

**Authority:** IRS (Internal Revenue Service)

**Key Regulations:**
*   IRS Revenue Procedure 97-58
*   IRS Publication 552

**Standard Retention Periods:**

| Document Type | Retention | Legal Basis |
|---------------|-----------|-------------|
| Tax Returns | 7 years | IRS recommendation (3 minimum, 7 for safety) |
| Tax Documents | 7 years | IRS supporting documentation |
| Medical Records | 10 years | Long-term health history |
| Insurance Policies | 10 years | Until expired + claims period |
| Receipts | 7 years | Tax deductions, proof of purchase |
| Bank Statements | 7 years | IRS income verification |
| Investment Statements | 7 years | IRS capital gains reporting |
| Contracts | 10 years | State statute of limitations |
| Legal Documents | 15+ years | Estate planning documents |

**Supported Domains:**

*   `household` - Personal records

**Special Considerations:**

*   IRS minimum is 3 years for most documents, but 7 years is recommended

*   Keep records indefinitely if you filed a fraudulent return

*   Keep employment tax records for 4 years

### United Kingdom

**Authority:** HMRC (HM Revenue & Customs)

**Key Regulations:**
*   Self Assessment requirements
*   Financial Conduct Authority (FCA) guidance

**Standard Retention Periods:**

| Document Type | Retention | Legal Basis |
|---------------|-----------|-------------|
| Tax Returns | 7 years | HMRC self-assessment |
| SA302 | 7 years | HMRC mortgage verification |
| P60 | 7 years | HMRC tax year summary |
| P11D | 7 years | HMRC benefits documentation |
| Medical Records | 10 years | NHS and personal health |
| Insurance Policies | 10 years | FCA guidance |
| Utility Bills | 2 years | Proof of address |
| Receipts | 7 years | Consumer Rights Act |
| Bank Statements | 7 years | HMRC income verification |

**Supported Domains:**

*   `household` - Personal records

**Special Considerations:**

*   Self-employed: Keep records for at least 5 years after the 31 January submission deadline

*   Company directors: Records for 6 years from end of accounting period

*   VAT: 6 years (or 10 years for errors)

## Choosing Your Country

Consider these factors when selecting your country:

1. **Tax residency** - Where do you file tax returns?

2. **Legal jurisdiction** - Which country's laws apply to your records?

3. **Document source** - Where were the documents issued?

4. **Entity location** - Where is your business or trust registered?

For complex situations (e.g., expatriates, cross-border entities), consult a tax professional.

## Domain Selection

Each country supports specific domains based on local record keeping practices:

### Australia - All Domains
```bash
MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"  # or corporate, projects, unit-trust, discretionary-trust, family-trust
```

### United States - Household Only
```bash
MADEINOZ_RECORDMANAGER_COUNTRY="UnitedStates"
MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
```

### United Kingdom - Household Only
```bash
MADEINOZ_RECORDMANAGER_COUNTRY="UnitedKingdom"
MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
```

## Unsupported Countries

If your country is not supported, the system will fall back to `Australia` with a warning. For unsupported countries, consider:

1. **Use Australia as base** - Retention periods are generally conservative and safe

2. **Customize retention** - Use override variables for specific document types

3. **Consult local authorities** - Verify retention requirements for your jurisdiction

## Customizing Retention Periods

Override default retention periods for your specific situation:

```bash
# Keep tax records for 10 years instead of default
MADEINOZ_RECORDMANAGER_RETENTION_TAX_YEARS="10"

# Extended medical record retention
MADEINOZ_RECORDMANAGER_RETENTION_MEDICAL_YEARS="15"

# Longer insurance policy retention
MADEINOZ_RECORDMANAGER_RETENTION_INSURANCE_YEARS="15"
```

## Verification

Verify your country and domain configuration:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

Output includes:
```
Country: Australia
Default Domain: household
Supported Domains: household, corporate, projects, unit-trust, discretionary-trust, family-trust
```

## Compliance Disclaimer

The Records Manager Skill provides guidance based on publicly available record keeping requirements. However:

*   **This is not legal advice** - Consult a qualified professional for your specific situation

*   **Regulations change** - Stay informed about updates to record keeping requirements

*   **Special circumstances** - Complex entities, cross-border situations, and specific industries may have different requirements

*   **Professional verification** - Have your record keeping practices reviewed by a qualified accountant or lawyer

## Next Steps

*   Configure [environment variables](environment.md)
*   Set up [paperless-ngx](paperless-setup.md)
*   Learn about [retention policies](../usage/retention.md)
