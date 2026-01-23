# Hierarchical Taxonomy Data Structure

This reference describes the hierarchical taxonomy data structures used by the Records Manager for document classification, tagging, and retention rules.

## Overview

The Records Manager uses a **4-level hierarchical taxonomy** system that provides structured, navigable classification for documents. This hierarchy mirrors natural organizational thinking and enables precise document classification while maintaining discoverability.

**Configuration Location:** Taxonomies are stored as JSON files in `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/{domain}.json` and loaded by the TaxonomyExpert.

**For extending taxonomies:** See [Adding Hierarchical Taxonomies](../../specs/003-default-taxonomies/ADDING-TAXONOMIES.md).

## Hierarchical Structure

```
Function → Service → Activity → DocumentType
```

- **Function**: Top-level capability area (e.g., "HealthManagement", "FinancialManagement")
- **Service**: Specific offering within a function (e.g., "MedicalCare", "DentalCare")
- **Activity**: Discrete operational task (e.g., "Consultations", "Prescriptions")
- **DocumentType**: Specific document types for the activity (e.g., "Medical Receipt", "Prescription")

**Example:**
```
HealthManagement/MedicalCare/Consultations/MedicalReceipt
```

## TypeScript Type Definitions

All types are defined in `src/lib/types/HierarchicalTaxonomy.ts`.

### Domain

Domains supported by the system:

```typescript
type Domain =
  | 'household'      // Personal and family records
  | 'corporate'      // Business records
  | 'unit-trust'     // Unit trust structures
  | 'discretionary-trust'  // Discretionary family trusts
  | 'family-trust'   // Family trusts with FTE
  | 'hybrid-trust'   // Hybrid trust structures
  | 'project'        // Project-based records
  | 'person';        // Individual family member records
```

### Country

Supported countries with distinct retention rules (**ISO 3166-1 alpha-3**):

```typescript
type Country = 'AUS' | 'USA' | 'GBR';
```

- **AUS**: Australia
- **USA**: United States
- **GBR**: United Kingdom

### TaxonomyMode

Operation mode during the 12-month transition period:

```typescript
type TaxonomyMode = 'flat' | 'hierarchical' | 'hybrid';
```

- **flat**: Legacy flat document type system
- **hierarchical**: New 4-level FSA structure
- **hybrid**: Both systems active (transition period)

### RetentionFromDate

Date from which retention period calculation starts:

```typescript
type RetentionFromDate = 'creation' | 'fy_end' | 'fte_date' | 'distribution';
```

- **creation**: From document creation date
- **fy_end**: From end of financial year
- **fte_date**: From Family Trust Election date (trust-specific)
- **distribution**: From distribution date (trust-specific)

## Core Hierarchical Entities

### HierarchicalTaxonomy

Root entity representing the complete taxonomy for a domain:

```typescript
interface HierarchicalTaxonomy {
  entityType: Domain;               // Domain (household, corporate, etc.)
  country: Country;                 // Country code (AUS, USA, GBR)
  countryName: string;              // Human-readable country name
  version: string;                  // Semantic version (e.g., "1.0.0")
  functions: Record<string, TaxonomyFunction>;  // Map of function definitions
  metadata: TaxonomyMetadata;       // Creation and update metadata
}
```

**Example:**
```json
{
  "entityType": "household",
  "country": "AUS",
  "countryName": "Australia",
  "version": "1.0.0",
  "functions": { ... },
  "metadata": { ... }
}
```

### TaxonomyFunction

Top-level category representing a major area of activity:

```typescript
interface TaxonomyFunction {
  name: string;                     // Function name (PascalCase, unique)
  description: string;              // Human-readable description
  services: Record<string, TaxonomyService>;  // Map of service definitions
  icon?: string;                    // Optional icon (emoji or identifier)
}
```

**Example:**
```json
{
  "name": "HealthManagement",
  "description": "Health and medical care documentation",
  "icon": "🏥",
  "services": { ... }
}
```

### TaxonomyService

Mid-level category representing a service area:

```typescript
interface TaxonomyService {
  name: string;                     // Service name (PascalCase, unique within function)
  description: string;              // Human-readable description
  activities: Record<string, TaxonomyActivity>;  // Map of activity definitions
  icon?: string;                    // Optional icon
}
```

**Example:**
```json
{
  "name": "MedicalCare",
  "description": "Primary healthcare and specialist consultations",
  "icon": "🩺",
  "activities": { ... }
}
```

### TaxonomyActivity

Leaf-level category with document types and retention rules:

```typescript
interface TaxonomyActivity {
  name: string;                     // Activity name (PascalCase, unique within service)
  description: string;              // Human-readable description
  documentTypes: string[];          // Document types for this activity
  retention: Record<Country, RetentionRule>;  // Country-specific retention rules
  icon?: string;                    // Optional icon
  keywords?: string[];              // Search keywords for autocomplete
}
```

**Example:**
```json
{
  "name": "DoctorVisits",
  "description": "Medical appointments and consultation records",
  "icon": "👨‍⚕️",
  "documentTypes": [
    "Doctor's Note",
    "Consultation Summary",
    "Referral Letter"
  ],
  "retention": {
    "AUS": {
      "years": 7,
      "authority": "Privacy Act 1988",
      "notes": "Medical records retention requirement"
    }
  },
  "keywords": ["doctor", "physician", "gp", "medical", "consultation"]
}
```

### RetentionRule

Country-specific retention requirement:

```typescript
interface RetentionRule {
  years: number;                    // Retention period (0 = permanent)
  authority: string;                // Legal authority or regulation
  notes?: string;                   // Additional context
  fromDate?: RetentionFromDate;     // Start date for retention period
}
```

**Example:**
```json
{
  "years": 7,
  "authority": "ATO Section 254 of Tax Administration Act 1953",
  "notes": "Tax deduction substantiation requirement",
  "fromDate": "fy_end"
}
```

### TaxonomyMetadata

Metadata about taxonomy creation and updates:

```typescript
interface TaxonomyMetadata {
  createdAt: string;                // ISO 8601 timestamp
  updatedAt: string;                // ISO 8601 timestamp
  createdBy: string;                // Creator identifier
  source: TaxonomySource;           // Data source
  checksum?: string;                // SHA-256 content hash
}
```

**TaxonomySource:**
```typescript
type TaxonomySource = 'default-taxonomy' | 'custom' | 'imported';
```

## Navigation and Path Entities

### TaxonomyPath

Complete navigation path through the hierarchy:

```typescript
interface TaxonomyPath {
  function: string;                 // Function name
  service: string;                  // Service name
  activity: string;                 // Activity name
  fullPath: string;                 // Complete slash-delimited path
}
```

**Example:**
```typescript
{
  function: "HealthManagement",
  service: "MedicalCare",
  activity: "DoctorVisits",
  fullPath: "HealthManagement/MedicalCare/DoctorVisits"
}
```

### NavigationBreadcrumb

Breadcrumb for CLI display during navigation:

```typescript
interface NavigationBreadcrumb {
  function: string | null;          // Current function (null if at root)
  service: string | null;           // Current service (null if function not selected)
  activity: string | null;          // Current activity (null if service not selected)
  display: string;                  // Formatted breadcrumb string
}
```

**Example:**
```typescript
{
  function: "HealthManagement",
  service: "MedicalCare",
  activity: null,
  display: "Health Management → Medical Care → [Select Activity]"
}
```

### AutocompleteSuggestion

Autocomplete suggestion with ranking:

```typescript
interface AutocompleteSuggestion {
  value: string;                    // Full path or component name
  display: string;                  // Display text for user
  score: number;                    // Match quality (0-1, higher is better)
  matchType: 'exact' | 'prefix' | 'abbreviated' | 'fuzzy';  // Match type
}
```

**Example:**
```typescript
{
  value: "HealthManagement/MedicalCare/DoctorVisits",
  display: "Health Management / Medical Care / Doctor Visits",
  score: 0.95,
  matchType: "prefix"
}
```

## File Locations

| Domain | File Path |
|--------|-----------|
| household | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/household.json` |
| corporate | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/corporate.json` |
| unit-trust | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/unit-trust.json` |
| discretionary-trust | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/discretionary-trust.json` |
| family-trust | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/family-trust.json` |
| hybrid-trust | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/hybrid-trust.json` |
| project | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/project.json` |
| person | `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/person.json` |

## API Usage

### Loading Taxonomy

```typescript
import { TaxonomyExpert } from './src/skills/RECORDSMANAGER/Lib/TaxonomyExpert';

// Create expert for household entity in Australia using hierarchical mode
const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');

// Get all functions
const functions = expert.getFunctions('household');
// Returns: TaxonomyFunction[]

// Get services for a function
const services = expert.getServices('household', 'HealthManagement');
// Returns: TaxonomyService[]

// Get activities for a service
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
// Returns: TaxonomyActivity[]

// Get document types for an activity
const docTypes = expert.getDocumentTypesForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'DoctorVisits'
);
// Returns: string[]

// Get retention rules for an activity
const retention = expert.getRetentionForActivity(
  'household',
  'HealthManagement',
  'MedicalCare',
  'DoctorVisits'
);
// Returns: Record<Country, RetentionRule>
```

### Path Operations

```typescript
// Validate a path
const validation = expert.validatePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
// Returns: { valid: boolean; errors?: string[] }

// Parse a path
const parsed = expert.parsePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
// Returns: TaxonomyPath

// Autocomplete partial path
const suggestions = expert.autocomplete('household', 'Health/Med', { maxResults: 10 });
// Returns: AutocompleteSuggestion[]

// Generate hierarchical tags
const tags = expert.generateHierarchicalTags(
  'household',
  'HealthManagement',
  'MedicalCare',
  'DoctorVisits'
);
// Returns: string[] (e.g., ['HealthManagement', 'MedicalCare', 'DoctorVisits', ...])

// Generate storage path
const storagePath = expert.generateStoragePath(
  'household',
  'HealthManagement',
  'MedicalCare',
  'DoctorVisits'
);
// Returns: string (e.g., '/Household/Health Management/Medical Care/Doctor Visits')
```

## Performance Characteristics

Based on validation testing (Phase 11, Task T147):

| Operation | Average Time | Notes |
|-----------|--------------|-------|
| Initial taxonomy load | 0.91ms | Cold start, all 8 domains |
| getFunctions | <0.001ms | Cached, sub-millisecond |
| getServices | <0.001ms | Cached, sub-millisecond |
| getActivities | <0.001ms | Cached, sub-millisecond |
| validatePath | 0.001ms | Path validation |
| parsePath | 0.001ms | Path parsing |
| autocomplete | 0.02-0.21ms | Depends on input length |
| searchByKeyword | 0.31ms | Keyword-based search |
| generateHierarchicalTags | 0.002ms | Tag generation |
| generateStoragePath | 0.002ms | Path generation |
| Full traversal (8 domains) | 6.87ms | Complete hierarchy navigation |

**Memory:** No memory leaks detected. Cache stable at 0MB growth on 1,000 repeated loads (Phase 11, Task T148).

## See Also

- [Hierarchical Taxonomies User Guide](../user-guide/hierarchical-taxonomies.md)
- [Adding Hierarchical Taxonomies](../../specs/003-default-taxonomies/ADDING-TAXONOMIES.md)
- [Developer Quickstart](../../specs/003-default-taxonomies/quickstart.md)
- [Type Contracts](../../specs/003-default-taxonomies/contracts/taxonomy-api.ts)
