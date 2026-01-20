# Custom Taxonomies - Configuration Format

This guide explains how to create custom taxonomies with specialized document types, tags, and retention rules for your specific domain needs. You can extend existing entity types or create completely new taxonomies.

---

## Configuration Overview

Taxonomies are defined using YAML or JSON format that specifies:
- **Document Types**: Categories of documents you manage
- **Tag Categories**: Logical groupings for tags
- **Retention Rules**: How long to keep each document type

### Format Structure

```yaml
entity_type_name:
  document_types:
    - Document Type Name
    - Another Document Type
  tag_categories:
    category_name:
      - tag_name_1
      - tag_name_2
    another_category:
      - tag_a
      - tag_b
  retention_rules:
    Document Type Name:
      years: 7
      reason: "Legal or business reason"
    Another Document Type:
      years: 0
      reason: "Keep until expires"
```

---

## Configuration Methods

### Method 1: Direct File Extension (Recommended)

Add your taxonomy to the `COUNTRY_TAXONOMIES` object in `TaxonomyExpert.ts`:

```typescript
// In src/skills/RecordsManager/Lib/TaxonomyExpert.ts

// Add to Australia.domains
'legal-practice': {
  documentTypes: [
    'Client File',
    'Court Filing',
    'Legal Agreement',
    // ... your document types
  ],
  tagCategories: {
    'legal-practice': ['client-matter', 'court-filing', 'billing'],
    // ... your tag categories
  },
  retentionRules: {
    'Client File': {
      years: 7,
      reason: 'Legal professional requirements'
    },
    // ... your retention rules
  },
},
```

### Method 2: External Configuration File (Advanced)

Create a separate configuration file that extends the base taxonomies:

```yaml
# custom-taxonomies.yaml
extends: base-australia

extensions:
  legal-practice:
    document_types:
      - Client File
      - Court Filing
      - Legal Agreement
    tag_categories:
      legal-practice:
        - client-matter
        - court-filing
        - billing
      document-type:
        - pleading
        - contract
        - opinion
    retention_rules:
      Client File:
        years: 7
        reason: "Legal professional requirements"
      Court Filing:
        years: 15
        reason: "Court record requirements"
```

### Method 3: Runtime Configuration (Dynamic)

Load taxonomies from environment variables or API calls:

```typescript
// Load from environment
const customTaxonomy = JSON.parse(process.env.CUSTOM_TAXONOMY || '{}');

// Merge with existing
const extendedTaxonomies = {
  ...COUNTRY_TAXONOMIES,
  Australia: {
    ...COUNTRY_TAXONOMIES.Australia,
    domains: {
      ...COUNTRY_TAXONOMIES.Australia.domains,
      ...customTaxonomy.extensions,
    },
  },
};
```

---

## Configuration Examples

### Example 1: Legal Practice

```yaml
legal-practice:
  document_types:
    - Client File
    - Court Filing
    - Legal Agreement
    - Billing Invoice
    - Cost Estimate
    - Legal Opinion
    - Barrister Brief
    - Evidence Document
    - Court Order
    - Subpoena
    - Affidavit
    - Will
    - Power of Attorney
    - Trust Deed
    - Property Contract
    - Shareholders Agreement

  tag_categories:
    legal-practice:
      - client-matter
      - court-filing
      - billing
      - cost-estimate
      - legal-opinion
    practice-area:
      - corporate
      - litigation
      - family-law
      - property
      - wills-estates
      - employment
    document-type:
      - pleading
      - contract
      - opinion
      - evidence
      - administrative
      - correspondence
    status:
      - active
      - closed
      - archived
      - draft
      - filed
    priority:
      - urgent
      - normal
      - routine
      - follow-up
    confidentiality:
      - confidential
      - restricted
      - public
      - internal-only

  retention_rules:
    Client File:
      years: 7
      reason: "Legal professional requirements - statute of limitations"
    Court Filing:
      years: 15
      reason: "Court record requirements - permanent file reference"
    Legal Agreement:
      years: 15
      reason: "Contract statute of limitations + potential future disputes"
    Billing Invoice:
      years: 7
      reason: "Tax requirements and billing dispute period"
    Cost Estimate:
      years: 7
      reason: "Reference for billing and cost tracking"
    Legal Opinion:
      years: 15
      reason: "Legal precedent and future reference"
    Court Order:
      years: 15
      reason: "Court record - permanent legal reference"
    Will:
      years: 15
      reason: "Estate planning - permanent document"
    Power of Attorney:
      years: 10
      reason: "Validity period and potential challenges"
    Barrister Brief:
      years: 7
      reason: "Legal work product and billing reference"
    Evidence Document:
      years: 15
      reason: "Evidence preservation for potential appeals"
    Subpoena:
      years: 7
      reason: "Legal requirement compliance and reference"
    Affidavit:
      years: 15
      reason: " sworn statement - permanent legal record"
    Trust Deed:
      years: 15
      reason: "Permanent trust document"
    Property Contract:
      years: 10
      reason: "Property transaction and title reference"
    Shareholders Agreement:
      years: 15
      reason: "Corporate governance - permanent record"
```

### Example 2: Medical Practice

```yaml
medical-practice:
  document_types:
    - Patient Record
    - Medical Certificate
    - Pathology Report
    - Imaging Report
    - Referral Letter
    - Prescription
    - Bulk Bill
    - Private Invoice
    - Medicare Claim
    - Health Fund Claim
    - Consent Form
    - Treatment Plan
    - Discharge Summary
    - Specialist Report
    - Mental Health Plan
    - Immunization Record
    - Surgical Report
    - Pathology Request
    - Blood Test Results
    - X-Ray Report
    - MRI Report
    - CT Scan Report
    - Ultrasound Report
    - ECG Report
    - Specialist Referral
    - Care Plan
    - Progress Note

  tag_categories:
    medical-practice:
      - patient-record
      - billing
      - pathology
      - imaging
      - prescription
      - referral
    document-type:
      - clinical
      - administrative
      - billing
      - compliance
      - diagnostic
      - treatment
    status:
      - active
      - archived
      - review
      - completed
      - pending
      - cancelled
    priority:
      - urgent
      - routine
      - follow-up
      - routine-review
    confidentiality:
      - confidential
      - restricted
      - public
      - internal-only
    provider:
      - doctor
      - specialist
      - nurse
      - admin
      - pathologist
      - radiologist
    patient-type:
      - new
      - existing
      - follow-up
      - chronic-care

  retention_rules:
    Patient Record:
      years: 7
      reason: "Privacy Act requirements - patient access rights"
    Pathology Report:
      years: 7
      reason: "Medical necessity and potential future treatment"
    Imaging Report:
      years: 7
      reason: "Diagnostic reference and treatment planning"
    Medical Certificate:
      years: 3
      reason: "Employment and insurance verification"
    Referral Letter:
      years: 3
      reason: "Referral tracking and continuity of care"
    Prescription:
      years: 3
      reason: "Medical necessity and potential verification"
    Bulk Bill:
      years: 7
      reason: "Medicare requirements and billing verification"
    Private Invoice:
      years: 7
      reason: "Billing and accounts receivable"
    Medicare Claim:
      years: 7
      reason: "Medicare compliance and audit trail"
    Health Fund Claim:
      years: 7
      reason: "Private health insurance verification"
    Consent Form:
      years: 10
      reason: "Legal requirements - evidence of informed consent"
    Treatment Plan:
      years: 7
      reason: "Treatment planning and continuity of care"
    Discharge Summary:
      years: 7
      reason: "Hospitalization record and ongoing care"
    Specialist Report:
      years: 7
      reason: "Specialist consultation and treatment planning"
    Mental Health Plan:
      years: 7
      reason: "Mental health treatment and compliance requirements"
    Immunization Record:
      years: 7
      reason: "Public health requirements and future vaccination"
    Surgical Report:
      years: 7
      reason: "Surgical procedure documentation and outcomes"
    Blood Test Results:
      years: 7
      reason: "Diagnostic reference and trend analysis"
    "X-Ray Report":
      years: 7
      reason: "Diagnostic imaging reference"
    "MRI Report":
      years: 7
      reason: "Advanced diagnostic imaging reference"
    "CT Scan Report":
      years: 7
      reason: "Diagnostic imaging reference"
    "Ultrasound Report":
      years: 7
      reason: "Diagnostic imaging reference"
    "ECG Report":
      years: 7
      reason: "Cardiac diagnostic reference"
```

### Example 3: Real Estate Agency

```yaml
real-estate:
  document_types:
    - Listing Agreement
    - Sale Contract
    - Purchase Contract
    - Lease Agreement
    - Property Inspection Report
    - Building Inspection Report
    - Pest Inspection Report
    - Valuation Report
    - Market Appraisal
    - Vendor Statement
    - Contract of Sale
    - Cooling Off Notice
    - Finance Approval
    - Settlement Statement
    - Transfer of Land
    - Body Corporate Report
    - Strata Report
    - Council Rates
    - Water Rates
    - Land Tax Notice
    - Rental Application
    - Tenancy Agreement
    - Bond lodgement
    - Condition Report
    - Rent Roll
    - Commission Statement
    - Marketing Material
    - Photography Release
    - Open House Register
    - Buyer Profile
    - Seller Profile

  tag_categories:
    real-estate:
      - listing
      - sale
      - lease
      - inspection
      - valuation
      - marketing
    transaction-type:
      - sale
      - purchase
      - lease
      - rental
      - management
    property-type:
      - house
      - unit
      - townhouse
      - commercial
      - industrial
      - rural
    document-type:
      - agreement
      - contract
      - inspection
      - valuation
      - report
      - application
      - statement
      - notice
    status:
      - active
      - pending
      - completed
      - cancelled
      - expired
    priority:
      - urgent
      - normal
      - routine
      - follow-up
    confidentiality:
      - confidential
      - restricted
      - public
      - client-only

  retention_rules:
    Listing Agreement:
      years: 7
      reason: "Agency agreement and commission entitlement"
    Sale Contract:
      years: 15
      reason: "Property transaction and title reference"
    Lease Agreement:
      years: 7
      reason: "Tenancy and landlord obligations"
    Property Inspection Report:
      years: 7
      reason: "Due diligence and disclosure requirements"
    Building Inspection Report:
      years: 7
      reason: "Property condition and defects disclosure"
    Pest Inspection Report:
      years: 7
      reason: "Pest infestation disclosure and treatment"
    Valuation Report:
      years: 7
      reason: "Property value assessment and financing"
    Market Appraisal:
      years: 3
      reason: "Market analysis and pricing reference"
    Vendor Statement:
      years: 7
      reason: "Property disclosure and sale process"
    Contract of Sale:
      years: 15
      reason: "Property transfer and title records"
    Cooling Off Notice:
      years: 3
      reason: "Statutory compliance and consumer protection"
    Finance Approval:
      years: 7
      reason: "Financing contingency and settlement"
    Settlement Statement:
      years: 15
      reason: "Property settlement and financial records"
    Transfer of Land:
      years: 15
      reason: "Property title transfer - permanent record"
    Body Corporate Report:
      years: 7
      reason: "Strata property information and levies"
    Strata Report:
      years: 7
      reason: "Strata scheme information and compliance"
    Council Rates:
      years: 7
      reason: "Property ownership and local government"
    Water Rates:
      years: 7
      reason: "Property utility charges and ownership"
    Land Tax Notice:
      years: 7
      reason: "State tax requirements and ownership"
    Rental Application:
      years: 3
      reason: "Tenant screening and reference checking"
    Tenancy Agreement:
      years: 7
      reason: "Tenancy terms and obligations"
    Bond Lodgement:
      years: 7
      reason: "Security deposit and tenancy bond board"
    Condition Report:
      years: 7
      reason: "Property condition at tenancy start/end"
    Rent Roll:
      years: 7
      reason: "Property income and tenancy management"
    Commission Statement:
      years: 7
      reason: "Agency commission and revenue records"
    Marketing Material:
      years: 3
      reason: "Promotional materials and campaigns"
    Photography Release:
      years: 3
      reason: "Model releases and property photography"
    Open House Register:
      years: 3
      reason: "Visitor tracking and lead generation"
    Buyer Profile:
      years: 3
      reason: "Client information and service history"
    Seller Profile:
      years: 7
      reason: "Client relationship and service delivery"
```

---

## Configuration Best Practices

### Naming Conventions

**Document Types**:
- Use clear, descriptive names
- Start with capital letters
- Use consistent formatting
- Avoid abbreviations unless universally understood

**Tag Categories**:
- Use lowercase with hyphens
- Be descriptive but concise
- Group related tags logically
- Follow established patterns when extending existing entities

**Retention Rules**:
- Use specific, verifiable reasons
- Reference legal or business requirements
- Be consistent across similar document types
- Document exceptions clearly

### Organizational Tips

1. **Group Related Document Types**
   - Keep similar documents together
   - Use logical hierarchies
   - Avoid overlap between categories

2. **Consistent Tag Structure**
   - Use a standard tag naming convention
   - Create hierarchical relationships
   - Balance specificity and flexibility

3. **Realistic Retention Periods**
   - Base on legal requirements first
   - Consider business needs second
   - Document special cases clearly

4. **Future-Proofing**
   - Leave room for new document types
   - Use flexible category structures
   - Plan for organizational changes

### Validation Rules

Add custom validation to ensure data quality:

```typescript
// Validate document type existence
validateDocumentType(documentType: string, entityType: string): boolean {
  const taxonomy = this.getTaxonomy(entityType as Domain);
  return taxonomy?.documentTypes.includes(documentType) || false;
}

// Validate tag format
validateTagFormat(tag: string): boolean {
  const tagPattern = /^[a-z][a-z0-9-]*$/;
  return tagPattern.test(tag);
}

// Validate retention periods
validateRetentionRules(rules: RetentionRules): boolean {
  for (const [docType, rule] of Object.entries(rules)) {
    if (rule.years < 0) return false;
    if (!rule.reason || rule.reason.trim().length < 10) return false;
  }
  return true;
}
```

---

## Integration and Testing

### 1. Validate Configuration

```bash
# Validate taxonomy syntax
bun run recordmanager validate --taxonomies --file custom-taxonomy.yaml

# Test document type recognition
bun run recordmanager test --recognize --file sample.pdf --domain legal-practice

# Validate retention calculations
bun run recordmanager test --retention --document-type "Client File" --domain legal-practice
```

### 2. Test Metadata Suggestions

```bash
# Test automatic tagging
bun run recordmanager test --suggest --file legal-agreement.pdf --domain legal-practice

# Verify category mapping
bun run recordmanager test --categories --domain legal-practice

# Test retention suggestions
bun run recordmanager test --retention-suggest --file court-filing.pdf
```

### 3. Integration Testing

```bash
# Complete workflow test
bun run recordmanager create --entity-type legal-practice
bun run recordmanager upload --file client-file.pdf --domain legal-practice
bun run recordmanager search --tags "client-matter,active" --domain legal-practice
bun run recordmanager retention --domain legal-practice
```

---

## Advanced Configuration

### Conditional Rules

Define rules based on entity attributes:

```yaml
retention_rules:
  Client File:
    years:
      base: 7
      conditions:
        - if: practice_area == "litigation"
          years: 10
          reason: "Extended litigation potential"
        - if: priority == "urgent"
          years: 10
          reason: "High-priority matter"
    reason: "Standard client file retention"
```

### Country-Specific Extensions

Override rules for different jurisdictions:

```yaml
extends: base-australia

extensions:
  legal-practice:
    # Australian-specific rules
    retention_rules:
      Client File:
        years: 7
        reason: "Legal profession Act requirements"

  # Add US-specific version
  legal-practice-us:
    document_types:
      - Attorney-Client Privilege
      - Discovery Document
    retention_rules:
      Attorney-Client Privilege:
        years: 15
        reason: "Privilege protection - maintain confidentiality"
```

### Dynamic Tag Generation

Generate tags based on document content:

```typescript
// Custom tag generation function
generateDynamicTags(content: string, entityType: string): string[] {
  const tags: string[] = [];

  // Extract dates for time-based tagging
  const dates = extractDates(content);
  tags.push(`year-${dates.found ? dates.year : 'current'}`);

  // Extract entity-specific information
  if (entityType === 'legal-practice') {
    const parties = extractParties(content);
    tags.push(`client-${parties.client}`);
    tags.push(`matter-${parties.matter}`);
  }

  return tags;
}
```

---

## Troubleshooting

### Common Configuration Issues

**Issue**: Document types not recognized
- **Solution**: Verify exact spelling in configuration
- **Solution**: Check case sensitivity and formatting

**Issue**: Tags not being applied
- **Solution**: Verify tag category definitions
- **Solution**: Check tag naming conventions

**Issue**: Wrong retention periods
- **Solution**: Verify retention rule syntax
- **Solution**: Check document type matching

**Issue**: Entity not available
- **Solution**: Verify entity type registration
- **Solution**: Check TaxonomyExpert imports

### Debug Commands

```bash
# Enable taxonomy debugging
export DEBUG=recordsmanager:taxonomy

# Validate configuration syntax
bun run recordmanager validate --taxonomies --verbose

# Test specific document recognition
bun run recordmanager test --recognize --file test.pdf --domain legal-practice --verbose

# Check tag generation
bun run recordmanager test --tags --file sample.pdf --domain legal-practice --show-matching
```

---

## Migration Guide

### Upgrading Existing Taxonomies

1. **Backup Current Configuration**
   ```bash
   cp TaxonomyExpert.ts TaxonomyExpert.ts.backup
   ```

2. **Apply New Configuration**
   ```bash
   # Merge new taxonomy with existing
   python merge-taxonomies.py new-taxonomy.yaml >> TaxonomyExpert.ts
   ```

3. **Validate Migration**
   ```bash
   bun run recordmanager validate --migration
   bun run recordmanager test --integration
   ```

4. **Update Documentation**
   - Document new document types
   - Update user guides
   - Train team members

### Data Migration Considerations

1. **Existing Documents**: Review metadata for affected documents
2. **Search Queries**: Update search strategies for new tags
3. **Retention Policies**: Verify new rules don't conflict with existing
4. **User Training**: Ensure users understand new categorization

---

*Last Updated: 2026-01-20*