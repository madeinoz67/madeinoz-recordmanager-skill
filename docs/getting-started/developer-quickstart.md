# Developer Quickstart: Hierarchical Taxonomies

Get started using the hierarchical taxonomy system in your code in under 10 minutes.

## Quick Setup

**1. Install dependencies:**

```bash
cd madeinoz-recordmanager-skill
bun install
```

**2. Set environment variables:**

```bash
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-paperless-url.com"
export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"
export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"  # or "United States", "United Kingdom"
export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
```

**3. Verify setup:**

```bash
bun test  # Should pass 447/464 tests (96%)
```

---

## Quick Examples

### Example 1: Navigate Hierarchy (30 seconds)

```typescript
import { TaxonomyExpert } from './src/lib/TaxonomyExpert';

const expert = new TaxonomyExpert('AUS', 'household');

// Get all functions
const functions = expert.getFunctions('household');
console.log(functions.map(f => f.name));
// Output: ['HealthManagement', 'FinanceManagement', 'PropertyManagement', ...]

// Get services in HealthManagement
const services = expert.getServices('household', 'HealthManagement');
console.log(services.map(s => s.name));
// Output: ['MedicalCare', 'DentalCare', 'VisionCare']

// Get activities in MedicalCare
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
console.log(activities.map(a => a.name));
// Output: ['Consultations', 'Prescriptions', 'TestResults']

// Get document types for Consultations
const docTypes = expert.getDocumentTypesForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'Consultations'
);
console.log(docTypes);
// Output: ['Medical Receipt', 'Referral Letter', 'Specialist Referral']
```

### Example 2: Validate and Classify Document (1 minute)

```typescript
// Validate a hierarchical path
const path = 'HealthManagement/MedicalCare/Consultations/MedicalReceipt';
const validation = expert.validatePath('household', path);

if (validation.valid) {
  // Generate hierarchical tags
  const tags = expert.generateHierarchicalTags(path);
  console.log(tags);
  // Output: [
  //   'Function:HealthManagement',
  //   'Service:MedicalCare',
  //   'Activity:Consultations',
  //   'DocumentType:MedicalReceipt'
  // ]

  // Generate storage path
  const storagePath = expert.generateStoragePath(path);
  console.log(storagePath);
  // Output: 'Health_Management/Medical_Care/Consultations/Medical_Receipt'

  // Get retention requirements
  const retention = expert.getRetentionForActivity(
    'household',
    'HealthManagement',
    'MedicalCare',
    'Consultations',
    'Medical Receipt'
  );
  console.log(retention);
  // Output: {
  //   years: 7,
  //   legalCitation: 'ATO Record Keeping Requirements - Medical Expenses',
  //   canDelete: false,
  //   reason: 'Document from 2019 must be kept until 2026 (7 years)'
  // }
}
```

### Example 3: Autocomplete User Input (2 minutes)

```typescript
// User types partial path
const userInput = 'health/med/cons';

// Get autocomplete suggestions
const suggestions = expert.autocomplete('household', userInput);
console.log(suggestions);
// Output: [
//   'HealthManagement/MedicalCare/Consultations/MedicalReceipt',
//   'HealthManagement/MedicalCare/Consultations/ReferralLetter',
//   'HealthManagement/MedicalCare/Consultations/SpecialistReferral'
// ]

// Resolve partial path to see progress
const resolved = expert.resolvePath('household', 'health/med');
console.log(resolved);
// Output: {
//   suggestions: [
//     'HealthManagement/MedicalCare/Consultations',
//     'HealthManagement/MedicalCare/Prescriptions',
//     'HealthManagement/MedicalCare/TestResults'
//   ],
//   matched: ['HealthManagement', 'MedicalCare'],
//   remaining: 2  // Still need Activity and DocumentType
// }
```

### Example 4: Keyword Search (1 minute)

```typescript
// User describes document in natural language
const userQuery = 'dental invoice consultation';

// Search by keywords
const results = expert.searchByKeyword('household', userQuery);
console.log(results);
// Output: [
//   {
//     path: 'HealthManagement/DentalCare/Consultations/DentalInvoice',
//     score: 0.95,
//     matchedKeywords: ['dental', 'invoice', 'consultation']
//   },
//   {
//     path: 'HealthManagement/DentalCare/Consultations/TreatmentPlan',
//     score: 0.65,
//     matchedKeywords: ['dental', 'consultation']
//   }
// ]

// Use top result
const bestMatch = results[0];
const tags = expert.generateHierarchicalTags(bestMatch.path);
```

### Example 5: Upload Document with Classification (3 minutes)

```typescript
import { PaperlessClient } from './src/lib/PaperlessClient';

const client = new PaperlessClient(
  process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL!,
  process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN!
);

// Classify document
const path = 'HealthManagement/MedicalCare/Consultations/MedicalReceipt';
const tags = expert.generateHierarchicalTags(path);
const storagePath = expert.generateStoragePath(path);

// Upload to paperless-ngx
const uploadResult = await client.uploadDocument('/path/to/medical-receipt.pdf', {
  title: 'Medical Receipt - Dr. Smith - 2026-01-22',
  tags: tags,
  custom_fields: {
    taxonomy_path: path,
    storage_path: storagePath,
    uploaded_via: 'RecordsManager v2.0'
  }
});

console.log(`Document uploaded: ID ${uploadResult.id}`);
```

---

## Core Concepts

### 1. Hierarchical Structure

4-level hierarchy: **Function → Service → Activity → DocumentType**

```
HealthManagement/                    ← Function (top-level category)
  MedicalCare/                       ← Service (sub-category)
    Consultations/                   ← Activity (specific action)
      Medical Receipt                ← DocumentType (exact document)
```

### 2. Path Format

Hierarchical paths use forward slashes:

```typescript
const path = 'Function/Service/Activity/DocumentType';
```

**Rules:**
- Case-sensitive (use exact names)
- No spaces around slashes
- Must include all 4 levels for complete classification

### 3. Tags and Storage Paths

From a hierarchical path, generate:

```typescript
// Input: 'HealthManagement/MedicalCare/Consultations/MedicalReceipt'

// Hierarchical tags (for paperless-ngx):
const tags = expert.generateHierarchicalTags(path);
// ['Function:HealthManagement', 'Service:MedicalCare', 'Activity:Consultations', 'DocumentType:MedicalReceipt']

// Storage path (filesystem-safe):
const storagePath = expert.generateStoragePath(path);
// 'Health_Management/Medical_Care/Consultations/Medical_Receipt'
```

### 4. Validation

Always validate paths before use:

```typescript
const validation = expert.validatePath('household', path);
if (!validation.valid) {
  console.error(`Invalid path: ${validation.reason}`);
  console.log(`Suggestion: ${validation.suggestion}`);
}
```

### 5. Country-Specific Retention

Retention requirements vary by country:

```typescript
const expertAUS = new TaxonomyExpert('AUS', 'household');
const retentionAUS = expertAUS.getRetentionForActivity(...);
// Returns: { years: 7, legalCitation: 'ATO Record Keeping Requirements' }

const expertUSA = new TaxonomyExpert('USA', 'household');
const retentionUSA = expertUSA.getRetentionForActivity(...);
// Returns: { years: 7, legalCitation: 'IRS Publication 583' }

const expertGBR = new TaxonomyExpert('GBR', 'household');
const retentionGBR = expertGBR.getRetentionForActivity(...);
// Returns: { years: 6, legalCitation: 'HMRC Record Keeping Requirements' }
```

---

## TaxonomyExpert API Reference

### Navigation Methods

```typescript
// Get all functions for a domain
getFunctions(domain: Domain): TaxonomyFunction[]

// Get services within a function
getServices(domain: Domain, functionName: string): TaxonomyService[]

// Get activities within a service
getActivities(domain: Domain, functionName: string, serviceName: string): TaxonomyActivity[]

// Get document types for an activity
getDocumentTypesForActivity(
  domain: Domain,
  functionName: string,
  serviceName: string,
  activityName: string
): string[]

// Get retention for a specific document type
getRetentionForActivity(
  domain: Domain,
  functionName: string,
  serviceName: string,
  activityName: string,
  documentType: string
): RetentionRequirement
```

### Path Validation & Autocomplete

```typescript
// Validate a hierarchical path
validatePath(domain: Domain, path: string): ValidationResult

// Parse path into components
parsePath(path: string): { function: string, service: string, activity: string, documentType: string }

// Resolve partial path with suggestions
resolvePath(domain: Domain, partialPath: string): {
  suggestions: string[],
  matched: string[],
  remaining: number
}

// Get autocomplete suggestions
autocomplete(domain: Domain, partialPath: string): string[]

// Search by keywords
searchByKeyword(domain: Domain, keywords: string): SearchResult[]
```

### Tag & Path Generation

```typescript
// Generate hierarchical tags from path
generateHierarchicalTags(path: string): string[]

// Generate filesystem-safe storage path
generateStoragePath(path: string): string
```

### Helper Methods

```typescript
// Get all document types with their full paths
getAllDocumentTypes(domain: Domain): DocumentTypeWithPath[]

// Get all tag categories (hierarchical)
getAllTagCategories(domain: Domain): string[]

// Check if hierarchical taxonomy is available
isHierarchicalAvailable(): boolean

// Get current taxonomy mode
getTaxonomyMode(): 'hierarchical' | 'flat' | 'dual-mode'
```

---

## Testing

Run tests to verify your implementation:

```bash
# Run all tests
bun test

# Run specific test suites
bun test src/tests/TaxonomyExpert.test.ts
bun test src/tests/integration/migration.test.ts

# Run with coverage
bun test --coverage
```

**Expected test results:**
- 447/464 tests passing (96%)
- Hierarchical navigation tests: 100% pass
- Path validation tests: 100% pass
- Retention requirement tests: 100% pass

---

## Common Patterns

### Pattern 1: Progressive Classification UI

```typescript
// Build interactive classification wizard
async function classifyDocument(domain: Domain): Promise<string> {
  // Step 1: Select function
  const functions = expert.getFunctions(domain);
  const selectedFunction = await promptUser('Select function:', functions.map(f => f.name));

  // Step 2: Select service
  const services = expert.getServices(domain, selectedFunction);
  const selectedService = await promptUser('Select service:', services.map(s => s.name));

  // Step 3: Select activity
  const activities = expert.getActivities(domain, selectedFunction, selectedService);
  const selectedActivity = await promptUser('Select activity:', activities.map(a => a.name));

  // Step 4: Select document type
  const docTypes = expert.getDocumentTypesForActivity(domain, selectedFunction, selectedService, selectedActivity);
  const selectedDocType = await promptUser('Select document type:', docTypes);

  // Build full path
  return `${selectedFunction}/${selectedService}/${selectedActivity}/${selectedDocType}`;
}
```

### Pattern 2: Bulk Classification

```typescript
// Classify multiple documents using keyword search
async function bulkClassify(documents: { id: number, description: string }[]): Promise<void> {
  for (const doc of documents) {
    const results = expert.searchByKeyword('household', doc.description);

    if (results.length > 0 && results[0].score > 0.8) {
      // High confidence match
      const path = results[0].path;
      const tags = expert.generateHierarchicalTags(path);
      const storagePath = expert.generateStoragePath(path);

      await client.updateDocument(doc.id, {
        tags,
        custom_fields: { taxonomy_path: path, storage_path: storagePath }
      });

      console.log(`✓ Document ${doc.id}: ${path} (confidence: ${results[0].score})`);
    } else {
      // Requires manual review
      console.log(`✗ Document ${doc.id}: Manual review needed`);
    }
  }
}
```

### Pattern 3: Retention Checking Before Deletion

```typescript
// Check if document can be deleted
async function canDeleteDocument(documentId: number): Promise<boolean> {
  const doc = await client.getDocument(documentId);
  const hierarchicalPath = doc.custom_fields.taxonomy_path;

  if (!hierarchicalPath) {
    console.warn('No hierarchical path - cannot verify retention');
    return false;
  }

  const parsed = expert.parsePath(hierarchicalPath);
  const retention = expert.getRetentionForActivity(
    'household',
    parsed.function,
    parsed.service,
    parsed.activity,
    parsed.documentType
  );

  if (!retention.canDelete) {
    console.error(`Cannot delete: ${retention.reason}`);
    console.log(`Legal citation: ${retention.legalCitation}`);
    return false;
  }

  return true;
}
```

---

## Next Steps

1. **Explore the codebase:**
   - Read `src/lib/TaxonomyExpert.ts` for implementation details
   - Check `src/tests/TaxonomyExpert.test.ts` for usage examples
   - Review `src/lib/types/HierarchicalTaxonomy.ts` for type definitions

2. **Build something:**
   - Create a classification UI using progressive navigation
   - Implement autocomplete for path input
   - Add keyword search to your upload workflow

3. **Contribute:**
   - See [Contributing Taxonomies](../extending/contributing-taxonomies.md)
   - Add new hierarchical paths for your domain
   - Submit improvements to mapping table

4. **Read more:**
   - [Hierarchical Taxonomies Guide](../user-guide/hierarchical-taxonomies.md)
   - [API Reference](../reference/api-reference.md)
   - [Migration Guide](../tutorials/migration-guide.md)

---

**Quickstart Version:** 2.0.0
**Last Updated:** 2026-01-22
**Estimated Time:** 10 minutes
