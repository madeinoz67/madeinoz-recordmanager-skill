# Custom Entities - Step-by-Step Guide

This guide shows you how to create custom entity types beyond the built-in household, corporate, trust, and project types. Custom entities allow you to organize documents according to your specific organizational structure.

---

## Overview

A custom entity defines a specific scope for document organization with its own:
- **Configuration requirements** (questions asked during creation)
- **Document types** (categories of documents you'll manage)
- **Tag structure** (how documents are tagged and organized)
- **Retention rules** (how long to keep different document types)

### Use Cases for Custom Entities

| Scenario | Recommended Entity Type | Benefits |
|---|---|---|
| **Law Firm** | `legal-practice` | Client matter, court filing, billing separation |
| **Medical Clinic** | `medical-practice` | Patient records, billing, compliance documents |
| **Real Estate Agency** | `real-estate` | Property transactions, leases, client files |
| **University Department** | `academic-department` | Research, grants, student records, publications |
| **Non-Profit** | `non-profit` | Grants, donations, compliance, programs |
| **Investment Club** | `investment-club` | Portfolio management, member records |

---

## Step 1: Define Your Entity Configuration

### 1.1 Choose an Entity Type Name

Select a descriptive, lowercase name with hyphens:
- Good: `legal-practice`, `medical-clinic`, `real-estate-agency`
- Bad: `Legal Practice`, `medical clinic`, `RealEstateAgency`

### 1.2 Define Configuration Questions

Each entity type requires specific configuration information. Define the questions users will answer during creation:

```typescript
// Example: Legal Practice Entity Questions
const legalPracticeQuestions: EntityQuestion[] = [
  {
    key: 'firmName',
    question: 'What is the law firm name?',
    type: 'text',
    required: true,
    validation: (value: string) => {
      if (!value || value.trim().length < 2) {
        return { valid: false, error: 'Firm name must be at least 2 characters' };
      }
      return true;
    }
  },
  {
    key: 'practiceArea',
    question: 'What is the primary practice area?',
    type: 'select',
    required: true,
    options: ['general', 'corporate', 'litigation', 'family-law', 'property']
  },
  {
    key: 'abn',
    question: 'What is the ABN? (optional)',
    type: 'text',
    required: false,
    validation: (value: string) => {
      if (!value) return true;
      if (!/^\d{11}$/.test(value.replace(/\s/g, ''))) {
        return { valid: false, error: 'ABN must be 11 digits' };
      }
      return true;
    }
  }
];
```

### 1.3 Entity Configuration Interface

Define the TypeScript interface for your entity configuration:

```typescript
interface LegalPracticeConfig {
  firmName: string;
  practiceArea: string;
  abn?: string;
}
```

---

## Step 2: Register with TaxonomyExpert

### 2.1 Extend the TaxonomyExpert

Modify the `TaxonomyExpert.ts` file to include your custom entity:

```typescript
// Add to Domain type
export type Domain =
  | 'household'
  | 'corporate'
  | 'projects'
  | 'unit-trust'
  | 'discretionary-trust'
  | 'family-trust'
  | 'legal-practice';  // Your custom entity

// Add to EntityCreator EntityType
export type EntityType =
  // ... existing types ...
  | 'legal-practice';
```

### 2.2 Define Taxonomy Structure

Add your entity's taxonomy to the country-specific definitions:

```typescript
// In COUNTRY_TAXONOMIES
Australia: {
  country: 'Australia',
  domains: {
    // ... existing domains ...
    'legal-practice': {
      documentTypes: [
        'Client File',
        'Court Filing',
        'Legal Agreement',
        'Billing Invoice',
        'Cost Estimate',
        'Legal Opinion',
        'Barrister Brief',
        'Evidence Document',
        'Court Order',
        'Subpoena',
        'Affidavit',
        'Will',
        'Power of Attorney',
        'Trust Deed',
        'Property Contract',
        'Shareholders Agreement',
      ],
      tagCategories: {
        'legal-practice': ['client-matter', 'court-filing', 'billing', 'cost-estimate'],
        'practice-area': ['corporate', 'litigation', 'family-law', 'property', 'wills-estates'],
        'document-type': ['pleading', 'contract', 'opinion', 'evidence', 'administrative'],
        'status': ['active', 'closed', 'archived', 'draft'],
        'priority': ['urgent', 'normal', 'routine'],
        'confidentiality': ['confidential', 'restricted', 'public'],
      },
      retentionRules: {
        'Client File': {
          years: 7,
          reason: 'Legal professional requirements - statute of limitations'
        },
        'Court Filing': {
          years: 15,
          reason: 'Court record requirements - permanent file reference'
        },
        'Legal Agreement': {
          years: 15,
          reason: 'Contract statute of limitations + potential future disputes'
        },
        'Billing Invoice': {
          years: 7,
          reason: 'Tax requirements and billing dispute period'
        },
        'Cost Estimate': {
          years: 7,
          reason: 'Reference for billing and cost tracking'
        },
        'Legal Opinion': {
          years: 15,
          reason: 'Legal precedent and future reference'
        },
        'Court Order': {
          years: 15,
          reason: 'Court record - permanent legal reference'
        },
        'Will': {
          years: 15,
          reason: 'Estate planning - permanent document'
        },
        'Power of Attorney': {
          years: 10,
          reason: 'Validity period and potential challenges'
        },
      },
    },
  },
},
```

---

## Step 3: Update EntityCreator

### 3.1 Add Entity Type to Creator

Extend the `EntityCreator` class to handle your custom entity:

```typescript
// Add to EntityCreator getQuestionsForEntityType method
'legal-practice': [
  {
    key: 'firmName',
    question: 'What is the law firm name?',
    type: 'text',
    required: true,
    validation: (value: string) => {
      if (!value || value.trim().length < 2) {
        return { valid: false, error: 'Firm name must be at least 2 characters' };
      }
      return true;
    },
  },
  {
    key: 'practiceArea',
    question: 'What is the primary practice area?',
    type: 'select',
    required: true,
    options: ['general', 'corporate', 'litigation', 'family-law', 'property', 'wills-estates'],
  },
  {
    key: 'abn',
    question: 'What is the ABN? (optional)',
    type: 'text',
    required: false,
    validation: (value: string) => {
      if (!value) return true;
      if (!/^\d{11}$/.test(value.replace(/\s/g, ''))) {
        return { valid: false, error: 'ABN must be 11 digits' };
      }
      return true;
    },
  },
],
```

### 3.2 Add Configuration Interface

Add your entity configuration interface:

```typescript
// Add to EntityCreator interfaces
export interface LegalPracticeConfig {
  firmName: string;
  practiceArea: string;
  abn?: string;
}

// Add to EntityConfig interface
export interface EntityConfig {
  // ... existing fields ...
  legalPracticeConfig?: LegalPracticeConfig;
}
```

### 3.3 Update Configuration Builder

Extend the `buildConfigFromAnswers` method:

```typescript
// In buildConfigFromAnswers switch statement
case 'legal-practice':
  config.legalPracticeConfig = {
    firmName: name,
    practiceArea: answers.practiceArea,
    abn: answers.abn,
  };
  break;
```

### 3.4 Add Validation Logic

Extend the validation method:

```typescript
// In validateEntityConfig method
// Legal practice validation
if (config.type === 'legal-practice') {
  if (!config.legalPracticeConfig) {
    errors.push('Legal practice configuration is required');
  } else {
    if (!config.legalPracticeConfig.firmName) {
      errors.push('Firm name is required');
    }
    if (!config.legalPracticeConfig.practiceArea) {
      errors.push('Practice area is required');
    }
    if (config.legalPracticeConfig.abn && !/^\d{11}$/.test(config.legalPracticeConfig.abn.replace(/\s/g, ''))) {
      errors.push('ABN must be 11 digits');
    }
  }
}
```

---

## Step 4: Create Required Tags and Storage Paths

### 4.1 Define Required Tags

Add your entity's required tags in `createRequiredTags`:

```typescript
// In createRequiredTags method
const requiredTags: Record<EntityType, string[]> = {
  // ... existing mappings ...
  'legal-practice': ['legal-practice', 'confidential'],
};
```

### 4.2 Define Storage Path

Add your entity's storage path in `createStoragePath`:

```typescript
// In createStoragePath method
const pathMap: Record<EntityType, (c: EntityConfig) => string | null> = {
  // ... existing mappings ...
  'legal-practice': (c) => `/Legal Practice/${c.name}`,
};
```

### 4.3 Define Color

Add your entity's tag color in `getColorForEntityType`:

```typescript
// In getColorForEntityType method
const colors: Record<EntityType, string> = {
  // ... existing colors ...
  'legal-practice': '#2c3e50', // Dark blue-gray for legal
};
```

---

## Step 5: Test Your Custom Entity

### 5.1 Manual Testing

Create a test entity and verify:

```bash
# Test entity creation
bun run recordmanager create --entity-type legal-practice

# Verify metadata suggestions
bun run recordmanager test --suggest --file client-agreement.pdf --domain legal-practice

# Check retention rules
bun run recordmanager test --retention --document-type "Client File" --domain legal-practice
```

### 5.2 Validation Commands

```bash
# Validate entity configuration
bun run recordmanager validate --entity legal-practice

# Test all validation rules
bun run recordmanager validate --all
```

### 5.3 Integration Testing

Test the complete workflow:

1. Create a legal practice entity
2. Upload various document types
3. Verify automatic tagging and retention
4. Test search functionality
5. Verify storage path structure

---

## Complete Example: Medical Practice Entity

### Configuration

```typescript
// Entity interface
export interface MedicalPracticeConfig {
  practiceName: string;
  abn?: string;
  providerType: 'clinic' | 'hospital' | 'specialist' | 'general-practice';
}

// Questions
' medical-practice': [
  {
    key: 'practiceName',
    question: 'What is the medical practice name?',
    type: 'text',
    required: true,
    validation: (value: string) => {
      if (!value || value.trim().length < 2) {
        return { valid: false, error: 'Practice name must be at least 2 characters' };
      }
      return true;
    },
  },
  {
    key: 'providerType',
    question: 'What type of practice?',
    type: 'select',
    required: true,
    options: ['clinic', 'hospital', 'specialist', 'general-practice'],
  },
  {
    key: 'abn',
    question: 'What is the ABN? (optional)',
    type: 'text',
    required: false,
    validation: (value: string) => {
      if (!value) return true;
      if (!/^\d{11}$/.test(value.replace(/\s/g, ''))) {
        return { valid: false, error: 'ABN must be 11 digits' };
      }
      return true;
    },
  },
],
```

### Taxonomy Structure

```typescript
' medical-practice': {
  documentTypes: [
    'Patient Record',
    'Medical Certificate',
    'Pathology Report',
    'Imaging Report',
    'Referral Letter',
    'Prescription',
    'Bulk Bill',
    'Private Invoice',
    'Medicare Claim',
    'Health Fund Claim',
    'Consent Form',
    'Treatment Plan',
    'Discharge Summary',
    'Specialist Report',
    'Mental Health Plan',
  ],
  tagCategories: {
    'medical-practice': ['patient-record', 'billing', 'pathology', 'imaging'],
    'document-type': ['clinical', 'administrative', 'billing', 'compliance'],
    'status': ['active', 'archived', 'review', 'completed'],
    'priority': ['urgent', 'routine', 'follow-up'],
    'confidentiality': ['confidential', 'restricted', 'public'],
    'provider': ['doctor', 'specialist', 'nurse', 'admin'],
  },
  retentionRules: {
    'Patient Record': {
      years: 7,
      reason: 'Privacy Act requirements - patient access rights'
    },
    'Pathology Report': {
      years: 7,
      reason: 'Medical necessity and potential future treatment'
    },
    'Consent Form': {
      years: 10,
      reason: 'Legal requirements - evidence of informed consent'
    },
    'Prescription': {
      years: 3,
      reason: 'Medical necessity and potential verification'
    },
    'Bulk Bill': {
      years: 7,
      reason: 'Medicare requirements and billing verification'
    },
  },
},
```

---

## Troubleshooting

### Common Issues

**Issue**: Entity not recognized in creation
- **Solution**: Check EntityType includes your new type

**Issue**: Questions not showing during creation
- **Solution**: Verify `getQuestionsForEntityType` mapping

**Issue**: Tags not being created
- **Solution**: Check `requiredTags` mapping and tag creation logic

**Issue**: Wrong storage path
- **Solution**: Verify `pathMap` in `createStoragePath` method

### Debug Commands

```bash
# Enable debug logging
export DEBUG=recordsmanager:*

# Test entity creation step by step
bun run recordmanager create --entity-type legal-practice --verbose

# Check tag creation
bun run recordmanager test --tags --domain legal-practice

# Validate all extensions
bun run recordmanager validate --extensions
```

---

## Next Steps

Once you've created your custom entity:

1. **Create Custom Taxonomies** if you need more specialized document types
2. **Add Validation Rules** for quality assurance
3. **Update Documentation** for your team
4. **Test Integration** with existing workflows

See [Custom Taxonomies](custom-taxonomies.md) for advanced configuration options.

---

*Last Updated: 2026-01-20*