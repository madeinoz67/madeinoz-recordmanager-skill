# Contributing Taxonomies

This guide explains how to contribute new hierarchical taxonomy paths to the Records Manager Skill.

## Overview

The hierarchical taxonomy system allows you to add new classification paths for documents. Contributions help the community by:
- Adding support for new document types
- Covering new industries or domains
- Expanding existing hierarchies
- Adding country-specific variations

## Before You Start

**Requirements:**
- Understanding of hierarchical taxonomy structure (Function → Service → Activity → DocumentType)
- Knowledge of retention requirements for your country
- Familiarity with YAML syntax
- Access to authoritative retention sources (tax authority websites, legal documentation)

**What to contribute:**
- New hierarchical paths for document types (Function/Service/Activity/DocumentType)
- Retention period requirements with legal citations (REQUIRED for each Activity level)
- Keywords for improved search matching
- Migration mappings from flat to hierarchical taxonomies

**CRITICAL - FSA Tag Format:**

Documents receive a SINGLE full FSA path tag, NOT individual level tags:

**CORRECT:**
```
FSA/HealthManagement/MedicalCare/Consultations
```

**INCORRECT (Do NOT contribute):**
```
Function:HealthManagement
Service:MedicalCare
Activity:Consultations
DocumentType:MedicalReceipt
```

**Why this matters:**
- Full FSA path is single source of truth for classification
- FSA Activity level automatically determines retention via `TaxonomyExpert.getRetentionForActivity()`
- FSA tag and retention tag MUST be applied atomically together
- Prevents compliance gaps where documents have classification but no retention enforcement

---

## Contribution Process

### Step 1: Identify the Need (5 minutes)

**Determine what's missing:**

```bash
# Search existing taxonomies
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy search \
  --domain household \
  --keywords "your document type"
```

If no results, the document type may not be in the taxonomy yet.

**Check existing functions:**

```bash
# List all functions for the domain
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions \
  --domain household
```

**Decide where it fits:**
- Is there an existing Function that covers this? (e.g., HealthManagement, FinanceManagement)
- Does an existing Service apply? (e.g., MedicalCare, Banking)
- Is there a matching Activity? (e.g., Consultations, Accounts)

---

### Step 2: Research Retention Requirements (15 minutes)

**Find authoritative sources:**

**Australia:**
- [ATO Record Keeping Requirements](https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/record-keeping-for-business)
- [Australian Privacy Principles](https://www.oaic.gov.au/privacy/australian-privacy-principles)
- State-specific regulations

**United States:**
- [IRS Publication 583](https://www.irs.gov/publications/p583)
- State-specific requirements (vary by state)
- Industry regulations (HIPAA, SOX, etc.)

**United Kingdom:**
- [HMRC Record Keeping](https://www.gov.uk/government/publications/record-keeping-for-hmrc)
- [ICO Data Retention Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)

**Document your findings:**
- Retention period (in years)
- Legal citation (exact regulation or publication)
- Special conditions (e.g., "from date of FTE", "while active + 7 years")
- Country variations

---

### Step 3: Design the Hierarchical Path (10 minutes)

**Follow naming conventions:**

1. **Function** - Top-level category (PascalCase, no spaces)
   - Examples: `HealthManagement`, `FinanceManagement`, `PropertyManagement`
   - Should represent a major life area or business function

2. **Service** - Sub-category within function (PascalCase, no spaces)
   - Examples: `MedicalCare`, `Banking`, `Maintenance`
   - Represents a specific service or sub-domain

3. **Activity** - Specific action or process (PascalCase, no spaces)
   - Examples: `Consultations`, `Accounts`, `Repairs`
   - Describes what activity generated the document

4. **DocumentType** - Exact document name (PascalCase, no spaces)
   - Examples: `MedicalReceipt`, `BankStatement`, `InvoiceReceipt`
   - Precise document type name

**Example design:**

```
Function: HealthManagement
  Service: PhysioCare
    Activity: Treatments
      DocumentType: PhysioInvoice
      DocumentType: TreatmentPlan
      DocumentType: ExerciseProgram
```

Full paths:
- `HealthManagement/PhysioCare/Treatments/PhysioInvoice`
- `HealthManagement/PhysioCare/Treatments/TreatmentPlan`
- `HealthManagement/PhysioCare/Treatments/ExerciseProgram`

---

### Step 4: Add to Taxonomy YAML (15 minutes)

**Edit the taxonomy file:**

```bash
# Open the taxonomies file for your country
nano src/skills/RecordsManager/Config/taxonomies.yaml
```

**Add your hierarchical path:**

```yaml
household:
  hierarchical:
    functions:
      HealthManagement:
        name: HealthManagement
        description: Health and medical records management
        keywords:
          - health
          - medical
          - wellness
        services:
          PhysioCare:                        # ← NEW SERVICE
            name: PhysioCare
            description: Physiotherapy and physical rehabilitation
            keywords:
              - physio
              - physiotherapy
              - rehabilitation
              - therapy
            activities:
              Treatments:                     # ← NEW ACTIVITY
                name: Treatments
                description: Physiotherapy treatment sessions
                keywords:
                  - treatment
                  - session
                  - appointment
                documentTypes:
                  PhysioInvoice:              # ← NEW DOCUMENT TYPE
                    name: PhysioInvoice
                    description: Invoice for physiotherapy services
                    retention:
                      AUS:
                        years: 7
                        legalCitation: "ATO Record Keeping Requirements - Medical Expenses"
                        reasoning: "Medical expenses may be claimed as tax deductions for 7 years"
                      USA:
                        years: 7
                        legalCitation: "IRS Publication 502 - Medical Expenses"
                        reasoning: "Medical expense records should be kept for 7 years"
                      GBR:
                        years: 6
                        legalCitation: "HMRC Record Keeping - Medical Expenses"
                        reasoning: "Medical records should be kept for 6 years"
                  TreatmentPlan:
                    name: TreatmentPlan
                    description: Physiotherapy treatment plan document
                    retention:
                      AUS:
                        years: 7
                        legalCitation: "ATO Record Keeping Requirements - Medical Records"
                        reasoning: "Medical treatment records for 7 years"
                      USA:
                        years: 7
                        legalCitation: "HIPAA Medical Records Retention"
                        reasoning: "Medical treatment records for 7 years"
                      GBR:
                        years: 8
                        legalCitation: "NHS Medical Records Retention"
                        reasoning: "NHS recommends 8 years for treatment records"
```

**Key points:**
- Indent with 2 spaces (YAML requirement)
- Add retention for ALL supported countries (AUS, USA, GBR)
- Include legal citations (exact regulation names)
- Add descriptive keywords for search
- Provide clear description for each level

---

### Step 5: Add Migration Mappings (Optional, 10 minutes)

If you're migrating from flat taxonomies, add mappings:

```yaml
household:
  migration:
    mappings:
      # Old flat document type → New hierarchical path
      - flatDocumentType: "Physio Invoice"
        hierarchicalPath: "HealthManagement/PhysioCare/Treatments/PhysioInvoice"
        confidence: 1.0

      - flatDocumentType: "Physiotherapy Bill"
        hierarchicalPath: "HealthManagement/PhysioCare/Treatments/PhysioInvoice"
        confidence: 0.95

      - flatDocumentType: "Treatment Plan"
        hierarchicalPath: "HealthManagement/PhysioCare/Treatments/TreatmentPlan"
        confidence: 0.9  # Lower confidence - could be other types of treatment plans
```

**Confidence levels:**
- `1.0` - Exact match, no ambiguity
- `0.9` - High confidence, minor ambiguity
- `0.8` - Moderate confidence, may need review
- `< 0.8` - Low confidence, requires manual review

---

### Step 6: Validate Your Changes (5 minutes)

**Run validation:**

```bash
# Validate YAML syntax
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy validate \
  --domain household
```

**Check for errors:**
- YAML syntax errors
- Missing required fields (name, description, retention)
- Invalid retention periods
- Missing country-specific retention
- Duplicate paths

**Test the new taxonomy:**

```typescript
import { TaxonomyExpert } from './src/lib/TaxonomyExpert';

const expert = new TaxonomyExpert('AUS', 'household');

// Test navigation
const services = expert.getServices('household', 'HealthManagement');
console.log(services.find(s => s.name === 'PhysioCare'));  // Should exist

const activities = expert.getActivities('household', 'HealthManagement', 'PhysioCare');
console.log(activities.find(a => a.name === 'Treatments'));  // Should exist

const docTypes = expert.getDocumentTypesForActivity(
  'household',
  'HealthManagement',
  'PhysioCare',
  'Treatments'
);
console.log(docTypes);  // Should include 'PhysioInvoice', 'TreatmentPlan'

// Test retention
const retention = expert.getRetentionForActivity(
  'household',
  'HealthManagement',
  'PhysioCare',
  'Treatments',
  'PhysioInvoice'
);
console.log(retention);  // Should return {years: 7, legalCitation: '...', ...}
```

---

### Step 7: Write Tests (15 minutes)

**Add test cases:**

```typescript
// src/tests/TaxonomyExpert.custom.test.ts
import { describe, it, expect } from 'bun:test';
import { TaxonomyExpert } from '../lib/TaxonomyExpert';

describe('Custom Taxonomy: PhysioCare', () => {
  const expert = new TaxonomyExpert('AUS', 'household');

  it('should include PhysioCare service', () => {
    const services = expert.getServices('household', 'HealthManagement');
    const physio = services.find(s => s.name === 'PhysioCare');

    expect(physio).toBeDefined();
    expect(physio?.description).toBe('Physiotherapy and physical rehabilitation');
  });

  it('should include Treatments activity', () => {
    const activities = expert.getActivities('household', 'HealthManagement', 'PhysioCare');
    const treatments = activities.find(a => a.name === 'Treatments');

    expect(treatments).toBeDefined();
  });

  it('should include PhysioInvoice document type', () => {
    const docTypes = expert.getDocumentTypesForActivity(
      'household',
      'HealthManagement',
      'PhysioCare',
      'Treatments'
    );

    expect(docTypes).toContain('PhysioInvoice');
  });

  it('should have correct retention for PhysioInvoice (AUS)', () => {
    const retention = expert.getRetentionForActivity(
      'household',
      'HealthManagement',
      'PhysioCare',
      'Treatments',
      'PhysioInvoice'
    );

    expect(retention.years).toBe(7);
    expect(retention.legalCitation).toContain('ATO');
  });

  it('should generate FSA classification tag', () => {
    const fsaTag = expert.generateFSATag('HealthManagement/PhysioCare/Treatments/PhysioInvoice');

    expect(fsaTag).toBe('FSA/HealthManagement/PhysioCare/Treatments');
  });

  it('should generate retention tag for FSA path', () => {
    const retentionTag = expert.getRetentionTagForPath('HealthManagement/PhysioCare/Treatments/PhysioInvoice');

    expect(retentionTag).toBe('RETENTION/7-years');
  });

  it('should generate storage path', () => {
    const path = expert.generateStoragePath('HealthManagement/PhysioCare/Treatments/PhysioInvoice');

    expect(path).toBe('Health_Management/Physio_Care/Treatments/Physio_Invoice');
  });
});
```

**Run tests:**

```bash
bun test src/tests/TaxonomyExpert.custom.test.ts
```

---

### Step 8: Document Your Contribution (10 minutes)

**Create a pull request description:**

```markdown
## Add PhysioCare Taxonomy

### Summary
Adds hierarchical taxonomy support for physiotherapy documents.

### Changes
- Added `PhysioCare` service under `HealthManagement`
- Added `Treatments` activity
- Added 3 document types: `PhysioInvoice`, `TreatmentPlan`, `ExerciseProgram`
- Included retention requirements for AUS, USA, GBR with legal citations

### Retention Research
- **Australia**: 7 years (ATO Record Keeping Requirements)
- **United States**: 7 years (IRS Publication 502)
- **United Kingdom**: 8 years (NHS Medical Records Retention)

### Testing
- [x] YAML syntax validated
- [x] All tests passing (450/464 tests, 96%)
- [x] Navigation methods tested
- [x] Retention requirements verified
- [x] Tag and path generation tested

### Migration
- Added mappings for common flat document types:
  - "Physio Invoice" → `HealthManagement/PhysioCare/Treatments/PhysioInvoice`
  - "Physiotherapy Bill" → `HealthManagement/PhysioCare/Treatments/PhysioInvoice`
  - "Treatment Plan" → `HealthManagement/PhysioCare/Treatments/TreatmentPlan`

### Documentation
- Updated user guide with PhysioCare examples
- Added troubleshooting entries for physiotherapy documents
```

---

## Contribution Checklist

Before submitting your pull request:

- [ ] YAML syntax is valid
- [ ] All required fields are present (name, description, keywords, retention)
- [ ] Retention periods are researched and documented
- [ ] Legal citations are accurate and complete
- [ ] All supported countries have retention rules (AUS, USA, GBR)
- [ ] PascalCase naming convention followed
- [ ] Keywords added for search discoverability
- [ ] Migration mappings added (if applicable)
- [ ] Tests written and passing
- [ ] No duplicate paths exist
- [ ] Documentation updated
- [ ] Pull request description is complete

---

## Common Patterns

### Adding a New Service to Existing Function

```yaml
functions:
  HealthManagement:
    services:
      NewService:              # ← Add new service here
        name: NewService
        description: Description of new service
        keywords: [keyword1, keyword2]
        activities:
          Activity1:
            # ...
```

### Adding a New Activity to Existing Service

```yaml
services:
  ExistingService:
    activities:
      NewActivity:             # ← Add new activity here
        name: NewActivity
        description: Description of new activity
        keywords: [keyword1, keyword2]
        documentTypes:
          DocumentType1:
            # ...
```

### Adding a New Document Type to Existing Activity

```yaml
activities:
  ExistingActivity:
    documentTypes:
      NewDocumentType:         # ← Add new document type here
        name: NewDocumentType
        description: Description of new document type
        retention:
          AUS:
            years: 7
            legalCitation: "ATO Citation"
            reasoning: "Reason for retention"
          # ... other countries
```

---

## Best Practices

### DO:
- ✅ Research retention requirements thoroughly
- ✅ Cite authoritative sources (ATO, IRS, HMRC)
- ✅ Use PascalCase for all naming
- ✅ Add descriptive keywords for search
- ✅ Test your changes before submitting
- ✅ Add migration mappings for backward compatibility
- ✅ Write tests for new taxonomies
- ✅ Update documentation

### DON'T:
- ❌ Guess retention periods
- ❌ Use spaces in names (use PascalCase)
- ❌ Skip legal citations
- ❌ Forget to add retention for all countries
- ❌ Create duplicate paths
- ❌ Submit untested changes
- ❌ Use ambiguous names

---

## Getting Help

**Questions about:**
- **Retention requirements**: Check the [Retention Guide](../user-guide/retention.md)
- **YAML syntax**: See existing taxonomies in `Config/taxonomies.yaml`
- **Testing**: Review `src/tests/TaxonomyExpert.test.ts`
- **Migration**: See the [Migration Guide](../tutorials/migration-guide.md)

**Need assistance:**
- GitHub Discussions: [Ask a question](https://github.com/madeinoz67/madeinoz-recordmanager-skill/discussions)
- GitHub Issues: [Report a problem](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)

---

**Thank you for contributing to the Records Manager Skill!**

Your contributions help the community by expanding coverage and improving accuracy. Every new taxonomy path you add makes document management easier for all users.

---

**Contributing Guide Version:** 2.0.0
**Last Updated:** 2026-01-22
**License:** MIT
