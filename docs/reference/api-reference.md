# API Reference: TaxonomyExpert

Complete API reference for the hierarchical taxonomy system (v2.0).

## Constructor

### `new TaxonomyExpert(country, domain, configPath?)`

Create a new TaxonomyExpert instance for navigating hierarchical taxonomies.

**Parameters:**
- `country` (string): ISO 3166-1 alpha-3 country code ('AUS', 'USA', or 'GBR')
- `domain` (Domain): Entity type domain ('household', 'corporate', 'unit-trust', etc.)
- `configPath` (string, optional): Custom path to taxonomies.yaml file

**Returns:** `TaxonomyExpert` instance

**Example:**

```typescript
import { TaxonomyExpert } from './src/lib/TaxonomyExpert';

const expert = new TaxonomyExpert('AUS', 'household');
```

**Throws:**
- Error if country is not supported
- Error if config file cannot be loaded

---

## Hierarchical Navigation Methods

### `getFunctions(domain)`

Get all functions for an entity type. Functions are the top level of the hierarchy.

**Parameters:**
- `domain` (Domain): Entity type ('household', 'corporate', etc.)

**Returns:** `TaxonomyFunction[]`

```typescript
interface TaxonomyFunction {
  name: string;
  description: string;
  keywords: string[];
  services: Record<string, TaxonomyService>;
}
```

**Example:**

```typescript
const functions = expert.getFunctions('household');
functions.forEach(func => {
  console.log(`${func.name}: ${func.description}`);
  console.log(`Keywords: ${func.keywords.join(', ')}`);
});
```

**Output:**
```
HealthManagement: Health and medical records management
Keywords: health, medical, wellness
FinanceManagement: Financial records and tax documentation
Keywords: finance, money, tax
...
```

---

### `getServices(domain, functionName)`

Get all services within a function. Services are the second level of the hierarchy.

**Parameters:**
- `domain` (Domain): Entity type
- `functionName` (string): Name of the function

**Returns:** `TaxonomyService[]`

```typescript
interface TaxonomyService {
  name: string;
  description: string;
  keywords: string[];
  activities: Record<string, TaxonomyActivity>;
}
```

**Example:**

```typescript
const services = expert.getServices('household', 'HealthManagement');
services.forEach(service => {
  console.log(`${service.name}: ${service.description}`);
});
```

**Output:**
```
MedicalCare: General medical and healthcare services
DentalCare: Dental health services
VisionCare: Vision and eye care services
```

---

### `getActivities(domain, functionName, serviceName)`

Get all activities within a service. Activities are the third level of the hierarchy.

**Parameters:**
- `domain` (Domain): Entity type
- `functionName` (string): Name of the function
- `serviceName` (string): Name of the service

**Returns:** `TaxonomyActivity[]`

```typescript
interface TaxonomyActivity {
  name: string;
  description: string;
  keywords: string[];
  documentTypes: Record<string, DocumentTypeConfig>;
}
```

**Example:**

```typescript
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
activities.forEach(activity => {
  console.log(`${activity.name}: ${activity.description}`);
});
```

**Output:**
```
Consultations: Medical consultations and visits
Prescriptions: Medication prescriptions and receipts
TestResults: Medical test results and reports
```

---

### `getDocumentTypesForActivity(domain, functionName, serviceName, activityName)`

Get all document types for an activity. Document types are the fourth level (leaf nodes).

**Parameters:**
- `domain` (Domain): Entity type
- `functionName` (string): Name of the function
- `serviceName` (string): Name of the service
- `activityName` (string): Name of the activity

**Returns:** `string[]` - Array of document type names

**Example:**

```typescript
const docTypes = expert.getDocumentTypesForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'Consultations'
);
console.log(docTypes);
```

**Output:**
```
['Medical Receipt', 'Referral Letter', 'Specialist Referral']
```

---

### `getRetentionForActivity(domain, functionName, serviceName, activityName, documentType)`

Get retention requirements for a specific document type with full hierarchical context.

**Parameters:**
- `domain` (Domain): Entity type
- `functionName` (string): Name of the function
- `serviceName` (string): Name of the service
- `activityName` (string): Name of the activity
- `documentType` (string): Name of the document type

**Returns:** `RetentionRequirement`

```typescript
interface RetentionRequirement {
  years: number;
  legalCitation: string;
  reasoning: string;
  canDelete: boolean;
  reason?: string;
}
```

**Example:**

```typescript
const retention = expert.getRetentionForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'Consultations',
  'Medical Receipt'
);

console.log(retention);
```

**Output:**
```typescript
{
  years: 7,
  legalCitation: 'ATO Record Keeping Requirements - Medical Expenses',
  reasoning: 'Medical expenses may be claimed as tax deductions for 7 years',
  canDelete: false,
  reason: 'Document from 2019 must be kept until 2026 (7 years)'
}
```

---

## Path Validation & Autocomplete Methods

### `validatePath(domain, path)`

Validate a hierarchical path exists in the taxonomy.

**Parameters:**
- `domain` (Domain): Entity type
- `path` (string): Hierarchical path to validate (Format: `Function/Service/Activity/DocumentType`)

**Returns:** `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  components?: {
    function: string;
    service: string;
    activity: string;
    documentType: string;
  };
  reason?: string;
  suggestion?: string;
}
```

**Example:**

```typescript
const valid = expert.validatePath('household', 'HealthManagement/MedicalCare/Consultations/MedicalReceipt');
console.log(valid);
```

**Output (valid path):**
```typescript
{
  valid: true,
  components: {
    function: 'HealthManagement',
    service: 'MedicalCare',
    activity: 'Consultations',
    documentType: 'MedicalReceipt'
  }
}
```

**Output (invalid path):**
```typescript
{
  valid: false,
  reason: 'Service "InvalidService" not found in function "HealthManagement"',
  suggestion: 'Did you mean: MedicalCare, DentalCare, VisionCare?'
}
```

---

### `parsePath(path)`

Parse a hierarchical path into its component levels.

**Parameters:**
- `path` (string): Hierarchical path (Format: `Function/Service/Activity/DocumentType`)

**Returns:** Object with components

```typescript
{
  function: string;
  service: string;
  activity: string;
  documentType: string;
}
```

**Example:**

```typescript
const parsed = expert.parsePath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
console.log(parsed);
```

**Output:**
```typescript
{
  function: 'HealthManagement',
  service: 'MedicalCare',
  activity: 'Consultations',
  documentType: 'MedicalReceipt'
}
```

---

### `resolvePath(domain, partialPath)`

Resolve a partial path with suggestions for completion.

**Parameters:**
- `domain` (Domain): Entity type
- `partialPath` (string): Incomplete hierarchical path

**Returns:** Resolution result

```typescript
{
  suggestions: string[];  // Full paths that match the partial input
  matched: string[];      // Components successfully matched so far
  remaining: number;      // Number of levels still needed
}
```

**Example:**

```typescript
const resolved = expert.resolvePath('household', 'health/med');
console.log(resolved);
```

**Output:**
```typescript
{
  suggestions: [
    'HealthManagement/MedicalCare/Consultations',
    'HealthManagement/MedicalCare/Prescriptions',
    'HealthManagement/MedicalCare/TestResults'
  ],
  matched: ['HealthManagement', 'MedicalCare'],
  remaining: 2  // Still need Activity and DocumentType
}
```

---

### `autocomplete(domain, partialPath)`

Get autocomplete suggestions for a partial hierarchical path.

**Parameters:**
- `domain` (Domain): Entity type
- `partialPath` (string): Partial path typed by user

**Returns:** `string[]` - Array of matching full paths

**Features:**
- Case-insensitive matching
- Fuzzy substring matching
- Progressive path completion

**Example:**

```typescript
// Partial function name
const suggestions1 = expert.autocomplete('household', 'health');
console.log(suggestions1);
// Output: ['HealthManagement/MedicalCare/...', 'HealthManagement/DentalCare/...', ...]

// Partial path with multiple levels
const suggestions2 = expert.autocomplete('household', 'health/med/cons');
console.log(suggestions2);
// Output: [
//   'HealthManagement/MedicalCare/Consultations/MedicalReceipt',
//   'HealthManagement/MedicalCare/Consultations/ReferralLetter',
//   'HealthManagement/MedicalCare/Consultations/SpecialistReferral'
// ]

// Case-insensitive
const suggestions3 = expert.autocomplete('household', 'HEALTH/MEDICAL');
console.log(suggestions3);
// Output: Same as suggestions2
```

---

### `searchByKeyword(domain, keywords)`

Search for hierarchical paths by keywords (natural language description).

**Parameters:**
- `domain` (Domain): Entity type
- `keywords` (string): Space-separated keywords describing the document

**Returns:** `SearchResult[]`

```typescript
interface SearchResult {
  path: string;
  score: number;           // Relevance score (0-1)
  matchedKeywords: string[];
}
```

**Example:**

```typescript
const results = expert.searchByKeyword('household', 'dental invoice consultation');
console.log(results);
```

**Output:**
```typescript
[
  {
    path: 'HealthManagement/DentalCare/Consultations/DentalInvoice',
    score: 0.95,
    matchedKeywords: ['dental', 'invoice', 'consultation']
  },
  {
    path: 'HealthManagement/DentalCare/Consultations/TreatmentPlan',
    score: 0.65,
    matchedKeywords: ['dental', 'consultation']
  }
]
```

---

## Tag & Path Generation Methods

### `generateHierarchicalTags(path)`

Generate hierarchical tags from a validated path for paperless-ngx tagging.

**Parameters:**
- `path` (string): Full hierarchical path (Format: `Function/Service/Activity/DocumentType`)

**Returns:** `string[]` - Array of hierarchical tags

**Example:**

```typescript
const tags = expert.generateHierarchicalTags('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
console.log(tags);
```

**Output:**
```typescript
[
  'Function:HealthManagement',
  'Service:MedicalCare',
  'Activity:Consultations',
  'DocumentType:MedicalReceipt'
]
```

---

### `generateStoragePath(path)`

Generate a filesystem-safe storage path from a hierarchical path.

**Parameters:**
- `path` (string): Full hierarchical path

**Returns:** `string` - Filesystem-safe path with underscores

**Example:**

```typescript
const storagePath = expert.generateStoragePath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
console.log(storagePath);
```

**Output:**
```
Health_Management/Medical_Care/Consultations/Medical_Receipt
```

**Conversion rules:**
- PascalCase → Snake_Case
- Spaces replaced with underscores
- Forward slashes preserved for directory structure

---

## Helper Methods

### `getAllDocumentTypes(domain)`

Get all document types with their full hierarchical paths.

**Parameters:**
- `domain` (Domain): Entity type

**Returns:** `DocumentTypeWithPath[]`

```typescript
interface DocumentTypeWithPath {
  documentType: string;
  path: string;
  function: string;
  service: string;
  activity: string;
}
```

**Example:**

```typescript
const allTypes = expert.getAllDocumentTypes('household');
allTypes.forEach(dt => {
  console.log(`${dt.documentType} → ${dt.path}`);
});
```

**Output:**
```
Medical Receipt → HealthManagement/MedicalCare/Consultations/MedicalReceipt
Referral Letter → HealthManagement/MedicalCare/Consultations/ReferralLetter
Bank Statement → FinanceManagement/Banking/Accounts/BankStatement
...
```

---

### `getAllTagCategories(domain)`

Get all hierarchical tag categories for a domain.

**Parameters:**
- `domain` (Domain): Entity type

**Returns:** `string[]` - Array of tag categories

**Example:**

```typescript
const categories = expert.getAllTagCategories('household');
console.log(categories);
```

**Output:**
```typescript
[
  'Function:HealthManagement',
  'Service:MedicalCare',
  'Service:DentalCare',
  'Activity:Consultations',
  'Activity:Prescriptions',
  'DocumentType:MedicalReceipt',
  ...
]
```

---

### `isHierarchicalAvailable()`

Check if hierarchical taxonomy is available for this instance.

**Parameters:** None

**Returns:** `boolean` - True if hierarchical taxonomy is loaded and available

**Example:**

```typescript
if (expert.isHierarchicalAvailable()) {
  const functions = expert.getFunctions('household');
} else {
  console.warn('Hierarchical taxonomy not available, falling back to flat taxonomy');
}
```

---

### `getTaxonomyMode()`

Get the current taxonomy mode.

**Parameters:** None

**Returns:** `'hierarchical' | 'flat' | 'dual-mode'`

- `'hierarchical'`: Only hierarchical taxonomies are used
- `'flat'`: Only flat taxonomies are used (legacy)
- `'dual-mode'`: Both hierarchical and flat taxonomies are supported (transition period)

**Example:**

```typescript
const mode = expert.getTaxonomyMode();
console.log(`Current mode: ${mode}`);

if (mode === 'hierarchical') {
  // Use new hierarchical methods
} else if (mode === 'dual-mode') {
  // Support both hierarchical and flat queries
}
```

---

## Static Methods

### `TaxonomyExpert.getSupportedCountries()`

Get list of supported country codes.

**Parameters:** None

**Returns:** `string[]` - Array of ISO 3166-1 alpha-3 country codes

**Example:**

```typescript
const countries = TaxonomyExpert.getSupportedCountries();
console.log(countries);
// Output: ['AUS', 'USA', 'GBR']
```

---

### `TaxonomyExpert.isCountrySupported(country)`

Check if a country code is supported.

**Parameters:**
- `country` (string): ISO 3166-1 alpha-3 country code

**Returns:** `boolean`

**Example:**

```typescript
console.log(TaxonomyExpert.isCountrySupported('AUS'));  // true
console.log(TaxonomyExpert.isCountrySupported('FRA'));  // false
```

---

### `TaxonomyExpert.getSupportedTrustTypes()`

Get list of supported trust entity types.

**Parameters:** None

**Returns:** `string[]` - Array of trust types

**Example:**

```typescript
const trustTypes = TaxonomyExpert.getSupportedTrustTypes();
console.log(trustTypes);
// Output: ['unit-trust', 'discretionary-trust', 'family-trust']
```

---

### `TaxonomyExpert.isTrustType(domain)`

Check if a domain is a trust entity type.

**Parameters:**
- `domain` (string): Domain to check

**Returns:** `boolean`

**Example:**

```typescript
console.log(TaxonomyExpert.isTrustType('unit-trust'));      // true
console.log(TaxonomyExpert.isTrustType('household'));       // false
```

---

### `TaxonomyExpert.getMetadata()`

Get metadata about the taxonomy system.

**Parameters:** None

**Returns:** Object with metadata

```typescript
{
  version: string;
  supportedCountries: string[];
  supportedDomains: string[];
  totalFunctions: number;
  totalServices: number;
  totalActivities: number;
  totalDocumentTypes: number;
}
```

**Example:**

```typescript
const metadata = TaxonomyExpert.getMetadata();
console.log(metadata);
```

**Output:**
```typescript
{
  version: '2.0.0',
  supportedCountries: ['AUS', 'USA', 'GBR'],
  supportedDomains: ['household', 'corporate', 'unit-trust', 'discretionary-trust', 'family-trust', 'project'],
  totalFunctions: 12,
  totalServices: 45,
  totalActivities: 180,
  totalDocumentTypes: 450
}
```

---

## Factory Function

### `createExpertFromEnv()`

Create a TaxonomyExpert instance from environment variables.

**Environment Variables:**
- `MADEINOZ_RECORDMANAGER_COUNTRY`: Country code (AUS, USA, or GBR)
- `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN`: Entity type domain

**Returns:** `TaxonomyExpert` instance

**Example:**

```typescript
import { createExpertFromEnv } from './src/lib/TaxonomyExpert';

// Uses environment variables
const expert = createExpertFromEnv();
```

**Throws:**
- Error if environment variables are not set
- Error if values are invalid

---

## Type Definitions

### Domain

```typescript
type Domain =
  | 'household'
  | 'corporate'
  | 'unit-trust'
  | 'discretionary-trust'
  | 'family-trust'
  | 'project';
```

### Country Codes

```typescript
type CountryCode = 'AUS' | 'USA' | 'GBR';
```

### Legacy Country Codes (Deprecated)

```typescript
type LegacyCountryCode = 'AU' | 'US' | 'UK';
// Automatically normalized to alpha-3 codes
```

---

## Error Handling

All methods throw errors for invalid inputs:

```typescript
try {
  const expert = new TaxonomyExpert('INVALID', 'household');
} catch (error) {
  console.error(error.message);
  // Output: 'Country "INVALID" not supported'
}

try {
  expert.validatePath('household', 'Invalid/Path/Here');
} catch (error) {
  console.error(error.message);
  // Returns validation result with { valid: false, reason: '...' }
}
```

---

## Complete Usage Example

```typescript
import { TaxonomyExpert } from './src/lib/TaxonomyExpert';
import { PaperlessClient } from './src/lib/PaperlessClient';

// Initialize expert
const expert = new TaxonomyExpert('AUS', 'household');

// Progressive navigation
const functions = expert.getFunctions('household');
const services = expert.getServices('household', 'HealthManagement');
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
const docTypes = expert.getDocumentTypesForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'Consultations'
);

// Validate and classify
const path = 'HealthManagement/MedicalCare/Consultations/MedicalReceipt';
const validation = expert.validatePath('household', path);

if (validation.valid) {
  // Generate tags and paths
  const tags = expert.generateHierarchicalTags(path);
  const storagePath = expert.generateStoragePath(path);

  // Check retention
  const retention = expert.getRetentionForActivity(
    'household',
    'HealthManagement',
    'MedicalCare',
    'Consultations',
    'Medical Receipt'
  );

  // Upload to paperless-ngx
  const client = new PaperlessClient(
    process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL!,
    process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN!
  );

  await client.uploadDocument('/path/to/document.pdf', {
    title: 'Medical Receipt - Dr. Smith',
    tags: tags,
    custom_fields: {
      taxonomy_path: path,
      storage_path: storagePath,
      retention_years: retention.years,
      legal_citation: retention.legalCitation
    }
  });
}
```

---

**API Reference Version:** 2.0.0
**Last Updated:** 2026-01-22
**See Also:**
- [Developer Quickstart](../getting-started/developer-quickstart.md)
- [Hierarchical Taxonomies Guide](../user-guide/hierarchical-taxonomies.md)
- [Contributing Taxonomies](../extending/contributing-taxonomies.md)
