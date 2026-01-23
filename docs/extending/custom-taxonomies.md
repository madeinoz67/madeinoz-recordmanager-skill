# Custom Taxonomies - Configuration Format

This guide explains how to create custom taxonomies with specialized document types, tags, and retention rules for your specific domain needs. You can extend existing entity types or create completely new taxonomies.

---

## Configuration Overview

Taxonomies are defined in the YAML configuration file `Config/taxonomies.yaml` which specifies:

* **Document Types**: Categories of documents you manage

* **Tag Categories**: Logical groupings for tags

* **Retention Rules**: How long to keep each document type

### Format Structure

```yaml
entity_type_name:
  documentTypes:
    - Document Type Name
    - Another Document Type
  tagCategories:
    category_name:
      - tag_name_1
      - tag_name_2
    another_category:
      - tag_a
      - tag_b
  retentionRules:
    Document Type Name:
      years: 7
      reason: "Legal or business reason"
    Another Document Type:
      years: 0
      reason: "Keep until expires"
```

---

## Configuration Methods

### Method 1: Direct YAML Extension (Recommended)

Edit the `Config/taxonomies.yaml` file to add your custom domain under the appropriate country:

**Location:** `src/skills/RecordsManager/Config/taxonomies.yaml`

```yaml
Australia:
  country: Australia
  domains:
    # ... existing domains (household, corporate, etc.) ...

    # Add your custom domain
    legal-practice:
      documentTypes:
        - Client File
        - Court Filing
        - Legal Agreement
        # ... your document types
      tagCategories:
        legal-practice:
          - client-matter
          - court-filing
          - billing
        # ... your tag categories
      retentionRules:
        Client File:
          years: 7
          reason: "Legal professional requirements"
        # ... your retention rules
```

**Steps:**
1. Open `Config/taxonomies.yaml`
2. Find your country section (e.g., `Australia:`)
3. Add a new domain under `domains:`
4. Define documentTypes, tagCategories, and retentionRules
5. Run `install` command to populate paperless-ngx with new taxonomies

### Method 2: Add New Country

To add support for a country not yet in the system:

```yaml
# Add after existing countries in taxonomies.yaml

Canada:
  country: Canada
  domains:
    household:
      documentTypes:
        - Tax Return
        - Medical Receipt
        # ... your document types
      tagCategories:
        financial:
          - tax
          - income
        # ... your categories
      retentionRules:
        Tax Return:
          years: 6
          reason: "CRA requirement - 6 years from filing date"
        # ... your retention rules
```

**Important:** After adding a new country, you must also:
1. Update the `Domain` type in `TaxonomyExpert.ts` if adding new domain types
2. Run the `install` command to bootstrap taxonomies
3. Test metadata suggestions work correctly

---

## Configuration Examples

### Example 1: Legal Practice

Add this to your country's domains in `Config/taxonomies.yaml`:

```yaml
legal-practice:
  documentTypes:
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

  tagCategories:
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

  retentionRules:
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

Add this to your country's domains in `Config/taxonomies.yaml`:

```yaml
medical-practice:
  documentTypes:
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

  tagCategories:
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

  retentionRules:
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

Add this to your country's domains in `Config/taxonomies.yaml`:

```yaml
real-estate:
  documentTypes:
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

  tagCategories:
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

  retentionRules:
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

* Use clear, descriptive names

* Start with capital letters

* Use consistent formatting

* Avoid abbreviations unless universally understood

**Tag Categories**:

* Use lowercase with hyphens

* Be descriptive but concise

* Group related tags logically

* Follow established patterns when extending existing entities

**Retention Rules**:

* Use specific, verifiable reasons

* Reference legal or business requirements

* Be consistent across similar document types

* Document exceptions clearly

### Organizational Tips

1. **Group Related Document Types**

   * Keep similar documents together

   * Use logical hierarchies

   * Avoid overlap between categories

2. **Consistent Tag Structure**

   * Use a standard tag naming convention

   * Create hierarchical relationships

   * Balance specificity and flexibility

3. **Realistic Retention Periods**

   * Base on legal requirements first

   * Consider business needs second

   * Document special cases clearly

4. **Future-Proofing**

   * Leave room for new document types

   * Use flexible category structures

   * Plan for organizational changes

### Validation Rules

When creating custom taxonomies, ensure:

1. **Document Types**:
   - Use clear, descriptive names
   - Start with capital letters
   - Avoid duplicates within the same domain

2. **Tag Names**:
   - Use lowercase with hyphens only
   - Pattern: `^[a-z][a-z0-9-]*$`
   - Examples: `client-matter`, `urgent`, `financial`

3. **Retention Rules**:
   - Years must be >= 0
   - Use 0 for "keep until event" (e.g., warranties)
   - Use 15 for "permanent/indefinite" retention
   - Reason must be at least 10 characters and reference legal/business requirement

4. **YAML Syntax**:
   - Proper indentation (2 spaces per level)
   - Use `-` for list items
   - Use `:` for key-value pairs
   - Quote strings containing special characters

After editing `taxonomies.yaml`, validate the syntax:

```bash
# Check YAML syntax
bun run src/skills/RecordsManager/Lib/TaxonomyExpert.ts

# If it loads without error, the YAML is valid
```

---

## Integration and Testing

### 1. After Adding Custom Taxonomy

After editing `Config/taxonomies.yaml`:

```bash
# 1. Validate YAML loads correctly
bun run src/skills/RecordsManager/Lib/TaxonomyExpert.ts

# 2. Install the new taxonomies to paperless-ngx
bun run src/skills/RecordsManager/Tools/RecordManager.ts install --country Australia

# 3. Test document type recognition
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload sample.pdf --domain legal-practice

# 4. Check retention requirements
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain legal-practice
```

### 2. Test Metadata Suggestions

```bash
# Test automatic tagging with a sample document
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload legal-agreement.pdf --domain legal-practice

# Verify the document was tagged correctly
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --tags "legal-practice"
```

### 3. Integration Testing

```bash
# Complete workflow test
# 1. Upload various document types
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload client-file.pdf --domain legal-practice
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload court-filing.pdf --domain legal-practice

# 2. Search by tags
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --tags "client-matter,active"

# 3. Check retention requirements
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain legal-practice
```

---

## Advanced Configuration

### Multi-Country Support

To support the same domain across multiple countries with different retention rules:

```yaml
# In taxonomies.yaml

Australia:
  country: Australia
  domains:
    legal-practice:
      retentionRules:
        Client File:
          years: 7
          reason: "Legal Profession Act - statute of limitations"

"United States":
  country: "United States"
  domains:
    legal-practice:
      retentionRules:
        Client File:
          years: 7
          reason: "State bar requirements and statute of limitations"
        Attorney-Client Privilege:
          years: 15
          reason: "Privilege protection - maintain confidentiality"

"United Kingdom":
  country: "United Kingdom"
  domains:
    legal-practice:
      retentionRules:
        Client File:
          years: 6
          reason: "Solicitors Regulation Authority requirements"
```

### Domain-Specific Document Types

You can define completely different document types for the same domain name across countries:

```yaml
Australia:
  domains:
    medical-practice:
      documentTypes:
        - Medicare Claim
        - Bulk Bill

"United States":
  domains:
    medical-practice:
      documentTypes:
        - Insurance Claim
        - Medicaid Claim
        - Medicare Claim
```

### Using the TaxonomyExpert API

Once your YAML is configured, the TaxonomyExpert will automatically load it. You can query it programmatically:

```typescript
import { TaxonomyExpert } from './TaxonomyExpert.js';

// Create expert for specific country
const expert = new TaxonomyExpert('Australia');

// Get document types for a domain
const docTypes = expert.getDocumentTypes('legal-practice');

// Get retention requirements
const retention = expert.getRetentionRequirements('Client File', 'legal-practice');
// Returns: { years: 7, reason: "..." }

// Suggest metadata for a file
const suggestions = expert.suggestMetadata('client-agreement.pdf', '', 'legal-practice');
// Returns: { tags: [...], documentType: "Legal Agreement", retentionYears: 15, ... }
```

---

## Troubleshooting

### Common Configuration Issues

**Issue**: Document types not recognized

* **Solution**: Verify exact spelling in configuration

* **Solution**: Check case sensitivity and formatting

**Issue**: Tags not being applied

* **Solution**: Verify tag category definitions

* **Solution**: Check tag naming conventions

**Issue**: Wrong retention periods

* **Solution**: Verify retention rule syntax

* **Solution**: Check document type matching

**Issue**: Entity not available

* **Solution**: Verify entity type registration

* **Solution**: Check TaxonomyExpert imports

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
   cp src/skills/RecordsManager/Config/taxonomies.yaml src/skills/RecordsManager/Config/taxonomies.yaml.backup
   ```

2. **Apply New Configuration**

   Edit `Config/taxonomies.yaml` directly:
   - Add new document types to the `documentTypes` list
   - Add new tags to appropriate `tagCategories`
   - Add retention rules for new document types

3. **Install Updated Taxonomies**

   ```bash
   # Reinstall taxonomies to paperless-ngx
   bun run src/skills/RecordsManager/Tools/RecordManager.ts install --country Australia
   ```

   This will:
   - Create any new tags that don't exist
   - Create any new document types that don't exist
   - Skip existing resources (safe to run multiple times)

4. **Validate Changes**

   ```bash
   # Test that YAML loads correctly
   bun run src/skills/RecordsManager/Lib/TaxonomyExpert.ts

   # Test document recognition
   bun run src/skills/RecordsManager/Tools/RecordManager.ts upload test-document.pdf --domain legal-practice
   ```

5. **Update Documentation**

   - Document new document types
   - Update user guides
   - Train team members

### Data Migration Considerations

1. **Existing Documents**: Review metadata for affected documents using search

2. **Search Queries**: Update search strategies for new tags

3. **Retention Policies**: Verify new rules don't conflict with existing requirements

4. **User Training**: Ensure users understand new categorization

### Rollback Procedure

If you need to rollback changes:

```bash
# 1. Restore backup
cp src/skills/RecordsManager/Config/taxonomies.yaml.backup src/skills/RecordsManager/Config/taxonomies.yaml

# 2. Manually delete any newly created tags/document types in paperless-ngx UI
# (There is no automatic rollback for paperless-ngx resources)

# 3. Verify rollback
bun run src/skills/RecordsManager/Lib/TaxonomyExpert.ts
```

---

*Last Updated: 2026-01-22*