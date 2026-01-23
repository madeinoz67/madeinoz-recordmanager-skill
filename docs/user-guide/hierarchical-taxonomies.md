# Hierarchical Taxonomies

**NEW in v2.0:** The Records Manager now supports hierarchical taxonomies with a 4-level structure for precise document classification.

## Overview

Hierarchical taxonomies provide a structured, navigable classification system that mirrors how we naturally think about documents. Instead of flat lists of tags and document types, you can now navigate through a logical hierarchy to find the exact classification you need.

### Structure

The hierarchical taxonomy has 4 levels:

```
Function → Service → Activity → DocumentType
```

**Example: Medical Receipt**

```
HealthManagement/                    ← Function
├── MedicalCare/                     ← Service
│   ├── Consultations/               ← Activity
│   │   ├── Medical Receipt          ← DocumentType
│   │   ├── Referral Letter
│   │   └── Specialist Referral
│   ├── Prescriptions/
│   │   ├── Prescription
│   │   └── Medication Receipt
│   └── TestResults/
│       ├── Pathology Report
│       └── Imaging Report
└── DentalCare/
    └── Consultations/
        ├── Dental Invoice
        └── Treatment Plan
```

### Why Hierarchical Taxonomies?

**Benefits:**

1. **Precision** - Navigate through logical levels to find exact document type
2. **Discoverability** - Explore related document types in the same category
3. **Consistency** - Standardized paths ensure uniform classification
4. **Scalability** - Easy to add new document types within existing structure
5. **Compliance** - Hierarchical paths map directly to retention requirements

**Traditional flat taxonomy:**
- 100+ document types in one long list
- Hard to find the right type
- No relationship between similar documents

**Hierarchical taxonomy:**
- Navigate Function → Service → Activity → DocumentType
- Related documents grouped together
- Clear context at each level

## Using Hierarchical Taxonomies

### Interactive Classification

When uploading a document, navigate the hierarchy step-by-step:

```bash
# User: "I want to upload a medical receipt"

# Step 1: Select function
Available functions:
• HealthManagement
• FinanceManagement
• PropertyManagement
...

> HealthManagement

# Step 2: Select service
Available services in HealthManagement:
• MedicalCare
• DentalCare
• VisionCare

> MedicalCare

# Step 3: Select activity
Available activities in Medical Care:
• Consultations
• Prescriptions
• TestResults

> Consultations

# Step 4: Select document type
Available document types for Consultations:
• Medical Receipt
• Referral Letter
• Specialist Referral

> Medical Receipt

✓ Classified as: HealthManagement/MedicalCare/Consultations/MedicalReceipt
```

### Path Format

Hierarchical paths use forward slashes (`/`) to separate levels:

```
Function/Service/Activity/DocumentType
```

**Examples:**
- `HealthManagement/MedicalCare/Consultations/MedicalReceipt`
- `FinanceManagement/Banking/Accounts/BankStatement`
- `PropertyManagement/Maintenance/Repairs/InvoiceReceipt`

**Rules:**
- Case-sensitive (use exact names)
- No spaces around slashes
- Must include all 4 levels

### Autocomplete

The system provides intelligent autocomplete for partial paths:

```bash
# Type partial path
> health/med/cons

# Get suggestions
→ HealthManagement/MedicalCare/Consultations/

# Continue typing
> health/med/cons/medical

# Get exact match
→ HealthManagement/MedicalCare/Consultations/MedicalReceipt
```

**Fuzzy matching:**
- Case-insensitive: `HEALTH` matches `HealthManagement`
- Partial matches: `med` matches `MedicalCare`
- Keyword matching: `dental bill` finds `HealthManagement/DentalCare/Consultations/DentalInvoice`

### Tags and Storage Paths

Once classified, the system generates:

**FSA Classification Tag** (applied to paperless-ngx):
```
FSA/HealthManagement/MedicalCare/Consultations
```

**CRITICAL:** Documents receive a SINGLE full FSA path tag, NOT individual level tags.

**WRONG (Do NOT use):**
```
Function:HealthManagement
Service:MedicalCare
Activity:Consultations
DocumentType:MedicalReceipt
```

**RIGHT (Required format):**
```
FSA/HealthManagement/MedicalCare/Consultations
```

**Why full paths matter:**
- Single source of truth for classification
- Maps directly to retention requirements via Activity level
- Prevents ambiguity and tag proliferation
- Provides complete context in one tag

**Storage path** (filesystem-safe):
```
Health_Management/Medical_Care/Consultations/Medical_Receipt
```

### FSA → Retention Compliance (CRITICAL)

**Automatic Retention Enforcement:**

When an FSA tag is applied to a document, the system AUTOMATICALLY determines and applies the correct retention tag based on the FSA Activity level.

**How it works:**

1. Document classified with FSA path: `FSA/FinancialRecords/Banking/AccountStatements`
2. System looks up retention for Activity "AccountStatements" via `TaxonomyExpert.getRetentionForActivity()`
3. System applies BOTH tags atomically:
   - `FSA/FinancialRecords/Banking/AccountStatements`
   - `RETENTION/7-years` (automatically determined from FSA Activity)

**CRITICAL REQUIREMENTS:**

- FSA path and retention tag MUST be applied together in a single atomic operation
- NEVER apply FSA tags without corresponding retention tags
- Retention period is determined from FSA Activity level, not DocumentType
- Prevents compliance gaps where documents have classification but no retention enforcement

**Common FSA → Retention Mappings:**

| FSA Path | Automatic Retention | Legal Basis |
|----------|---------------------|-------------|
| `FSA/FinancialRecords/Banking/AccountStatements` | `RETENTION/7-years` | ATO Record Keeping Requirements |
| `FSA/TrustAdministration/LegalDocumentation/TrustDeed` | `RETENTION/permanent` | Foundational trust document |
| `FSA/TrustAdministration/Governance/TrusteeResolutions` | `RETENTION/7-years` | ATO distribution substantiation |
| `FSA/HealthManagement/MedicalCare/Consultations` | `RETENTION/7-years` | ATO medical expense deduction |

**What this means for users:**

- You classify the document with FSA path
- System automatically applies correct retention
- No manual retention tag selection needed
- Guaranteed compliance with country-specific regulations

## Available Hierarchies

### HealthManagement

Document types for health and medical records:

```
HealthManagement/
├── MedicalCare/
│   ├── Consultations/
│   │   ├── Medical Receipt
│   │   ├── Referral Letter
│   │   └── Specialist Referral
│   ├── Prescriptions/
│   │   ├── Prescription
│   │   └── Medication Receipt
│   └── TestResults/
│       ├── Pathology Report
│       └── Imaging Report
├── DentalCare/
│   └── Consultations/
│       ├── Dental Invoice
│       └── Treatment Plan
└── VisionCare/
    └── Consultations/
        ├── Vision Test Results
        └── Optical Invoice
```

**Retention:** 7 years (Australia) - Medical expenses for tax deduction

### FinanceManagement

Document types for financial records:

```
FinanceManagement/
├── Banking/
│   ├── Accounts/
│   │   ├── Bank Statement
│   │   └── Account Closure Notice
│   └── Transactions/
│       ├── Transfer Receipt
│       └── Direct Debit Notice
├── Investments/
│   ├── Trading/
│   │   ├── Trade Confirmation
│   │   └── Dividend Statement
│   └── Reports/
│       └── Investment Portfolio Report
└── CreditCards/
    └── Statements/
        └── Credit Card Statement
```

**Retention:** 5-7 years (varies by document type and country)

### PropertyManagement

Document types for property and real estate:

```
PropertyManagement/
├── Ownership/
│   ├── Purchase/
│   │   ├── Contract of Sale
│   │   └── Settlement Statement
│   └── Title/
│       └── Title Deed
├── Maintenance/
│   ├── Repairs/
│   │   ├── Invoice Receipt
│   │   └── Work Order
│   └── Inspections/
│       └── Building Inspection Report
└── Rental/
    ├── Agreements/
    │   └── Rental Agreement
    └── Payments/
        └── Rent Receipt
```

**Retention:** Varies (Capital Gains Tax - property held since acquisition)

## Navigation Methods

### CLI Navigation

Use the CLI tool to navigate hierarchically:

```bash
# Get all functions for an entity
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions --domain household

# Get services within a function
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy services --domain household --function HealthManagement

# Get activities within a service
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy activities --domain household --function HealthManagement --service MedicalCare

# Get document types for an activity
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy documenttypes --domain household --path "HealthManagement/MedicalCare/Consultations"

# Autocomplete a partial path
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete --domain household --path "health/med"

# Search by keywords
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy search --domain household --keywords "medical receipt"
```

### API Navigation

Use TaxonomyExpert methods for programmatic access:

```typescript
import { TaxonomyExpert } from './src/lib/TaxonomyExpert';

const expert = new TaxonomyExpert('AUS', 'household');

// Navigate hierarchy
const functions = expert.getFunctions('household');
const services = expert.getServices('household', 'HealthManagement');
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
const docTypes = expert.getDocumentTypesForActivity('household', 'HealthManagement', 'MedicalCare', 'Consultations');

// Validate path
const validation = expert.validatePath('household', 'HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: { valid: true, components: [...] }

// Autocomplete
const suggestions = expert.autocomplete('household', 'health/med');
// Returns: ['HealthManagement/MedicalCare/Consultations', 'HealthManagement/MedicalCare/Prescriptions', ...]

// Search by keywords
const results = expert.searchByKeyword('household', 'medical receipt');
// Returns: [{ path: 'HealthManagement/MedicalCare/Consultations/MedicalReceipt', score: 0.95, matchedKeywords: [...] }]

// Generate FSA classification tag
const fsaTag = expert.generateFSATag('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: 'FSA/HealthManagement/MedicalCare/Consultations'

// Get retention tag for FSA path
const retentionTag = expert.getRetentionTagForPath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: 'RETENTION/7-years'

const storagePath = expert.generateStoragePath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: 'Health_Management/Medical_Care/Consultations/Medical_Receipt'
```

## Retention and Compliance

Hierarchical paths map directly to retention requirements:

```typescript
// Get retention for a specific document type
const retention = expert.getRetentionForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'Consultations',
  'Medical Receipt'
);

// Returns:
// {
//   years: 7,
//   legalCitation: 'ATO Record Keeping Requirements - Medical Expenses',
//   canDelete: false,
//   reason: 'Document from 2019 must be kept until 2026 (7 years)'
// }
```

**Compliance benefits:**
- Retention rules embedded in taxonomy structure
- Legal citations provided for each document type
- Country-specific requirements (AUS, USA, GBR)
- Automatic deletion safety checks

## Migration from Flat Taxonomies

If you have existing documents with flat tags, see the [Migration Guide](../tutorials/migration-guide.md) for step-by-step instructions on migrating to hierarchical taxonomies.

**Key differences:**

| Flat Taxonomy | Hierarchical Taxonomy |
|---------------|----------------------|
| Single tag: `MedicalReceipt` | Path: `HealthManagement/MedicalCare/Consultations/MedicalReceipt` |
| No context | Full context at each level |
| Hard to navigate | Step-by-step navigation |
| No grouping | Related documents grouped by Function/Service/Activity |

## Best Practices

1. **Use autocomplete** - Don't memorize paths, let the system suggest
2. **Search by keywords** - Describe the document, let the system find the path
3. **Validate paths** - Always validate before applying to documents
4. **Generate FSA tags** - Use `generateFSATag()` for full path format (never apply individual level tags)
5. **Apply retention atomically** - When adding FSA tag, ALWAYS include retention tag via `getRetentionTagForPath()`
6. **Storage paths** - Use `generateStoragePath()` for filesystem compatibility
7. **Check retention** - Use FSA Activity level when checking retention requirements
8. **Progressive navigation** - Go level-by-level when unsure of exact path
9. **Context matters** - Full FSA path provides classification AND retention context in one tag

## Performance

The hierarchical taxonomy system is highly optimized for production use, with sub-millisecond operations validated in comprehensive performance testing.

### Benchmark Results

**Validated Performance Metrics (Phase 11, Task T147):**

| Operation | Average Time | Notes |
|-----------|--------------|-------|
| **Initial taxonomy load** | 0.91ms | Cold start, all 8 domains |
| **getFunctions()** | <0.001ms | Cached, sub-millisecond |
| **getServices()** | <0.001ms | Cached, sub-millisecond |
| **getActivities()** | <0.001ms | Cached, sub-millisecond |
| **getDocumentTypesForActivity()** | <0.001ms | Cached, sub-millisecond |
| **validatePath()** | 0.001ms | Path validation |
| **parsePath()** | 0.001ms | Path parsing |
| **autocomplete()** | 0.02-0.21ms | Depends on input length |
| **searchByKeyword()** | 0.31ms | Keyword-based search |
| **generateHierarchicalTags()** | 0.002ms | Tag generation |
| **generateStoragePath()** | 0.002ms | Path generation |
| **Full traversal** | 6.87ms | Complete hierarchy navigation (all 8 domains) |

### Memory Efficiency

**Validated Memory Characteristics (Phase 11, Task T148):**

- **Cache stability:** 0MB growth on 1,000 repeated loads
- **Navigation stability:** Bounded linear growth (1.65MB per 1,000 operations)
- **No memory leaks detected:** Active garbage collection confirmed
- **Memory growth rate:** -10.8% (negative = memory being reclaimed)

### What This Means

**For end users:**
- Instant autocomplete suggestions (<1ms response)
- Zero lag when navigating the hierarchy
- Smooth experience even with thousands of documents

**For developers:**
- Safe to call TaxonomyExpert methods in tight loops
- No performance degradation over time
- Suitable for real-time classification workflows

**For system administrators:**
- Minimal memory footprint
- No cache cleanup required
- Scales to handle all 8 domains simultaneously

These benchmarks were validated on production-representative workloads with 10,000+ operations across all domains (household, corporate, unit-trust, discretionary-trust, family-trust, hybrid-trust, project, person).

## Troubleshooting

**Problem:** Path validation fails

```
❌ Invalid path: HealthManagement/InvalidService/SomeActivity/Document
```

**Solution:** Use autocomplete to find valid paths:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete --domain household --path "HealthManagement/"
```

**Problem:** Can't find the right document type

**Solution:** Use keyword search:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy search --domain household --keywords "medical receipt consultation"
```

**Problem:** Retention requirements unclear

**Solution:** Get retention with full hierarchical context:

```typescript
const retention = expert.getRetentionForActivity('household', 'HealthManagement', 'MedicalCare', 'Consultations', 'Medical Receipt');
console.log(retention.legalCitation);  // Shows legal basis
console.log(retention.reason);  // Shows why it can't be deleted
```

## Next Steps

- [Migration Guide](../tutorials/migration-guide.md) - Migrate existing documents to hierarchical taxonomies
- [CLI Reference](../reference/cli.md) - Complete CLI command reference
- [API Reference](../reference/api-reference.md) - TaxonomyExpert method reference
- [Contributing Taxonomies](../extending/contributing-taxonomies.md) - Add new hierarchical paths

---

**Version:** 2.0.0
**Last Updated:** 2026-01-22
**Feature:** T083-T115 (Hierarchical Taxonomy System)
