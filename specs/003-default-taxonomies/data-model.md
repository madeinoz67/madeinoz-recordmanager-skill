# Data Model: Hierarchical Taxonomy System

**Feature**: Default Taxonomies with Hierarchical Structure
**Date**: 2026-01-22
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data model for the hierarchical taxonomy system, including entity definitions, relationships, validation rules, and state transitions.

## Core Entities

### 1. HierarchicalTaxonomy

**Purpose**: Root entity representing the complete hierarchical taxonomy structure for an entity type.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `entityType` | `Domain` | Yes | Must be valid domain (household, corporate, trust types, project, person) | Entity type this taxonomy applies to |
| `country` | `string` | Yes | ISO 3166-1 alpha-3 code (AUS, USA, GBR) | Country code for retention rules |
| `countryName` | `string` | Yes | Full country name | Human-readable country name (e.g., "Australia", "United States", "United Kingdom") |
| `functions` | `Record<string, TaxonomyFunction>` | Yes | Non-empty, keys match function names | Map of function names to function definitions |
| `version` | `string` | Yes | Semantic version (X.Y.Z) | Taxonomy version for migration tracking |
| `metadata` | `TaxonomyMetadata` | Yes | | Metadata about taxonomy creation and updates |

**Validation Rules**:
- `entityType` must be one of: `household`, `corporate`, `unit-trust`, `discretionary-trust`, `family-trust`, `hybrid-trust`, `project`, `person`
- `country` must be ISO 3166-1 alpha-3 code: `AUS` (Australia), `USA` (United States), `GBR` (United Kingdom)
- `countryName` must match the `country` code (e.g., "Australia" for AUS)
- `functions` must contain at least 1 function
- All function names must be PascalCase (e.g., `HealthManagement`, `FinancialManagement`)

**Note on Country Codes**: The system uses ISO 3166-1 alpha-3 (3-letter codes) for consistency, readability, and shorter paths. See `COUNTRY-CODE-STANDARD.md` for rationale. Backward compatibility with alpha-2 codes (AU, US, GB) is supported during transition.

**Example**:
```typescript
{
  entityType: "household",
  country: "AUS",
  countryName: "Australia",
  version: "1.0.0",
  functions: {
    "HealthManagement": { /* TaxonomyFunction */ },
    "FinancialManagement": { /* TaxonomyFunction */ }
  },
  metadata: {
    createdAt: "2026-01-22T00:00:00Z",
    updatedAt: "2026-01-22T00:00:00Z",
    createdBy: "system",
    source: "default-taxonomy"
  }
}
```

### 2. TaxonomyFunction

**Purpose**: Top-level category in the hierarchy representing a major area of activity (e.g., Health, Finance, Legal).

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | `string` | Yes | PascalCase, unique within taxonomy | Function name |
| `description` | `string` | Yes | Non-empty, <500 chars | Human-readable description |
| `services` | `Record<string, TaxonomyService>` | Yes | Non-empty, keys match service names | Map of service names to service definitions |
| `icon` | `string` | No | Emoji or icon identifier | Optional icon for UI display |

**Validation Rules**:
- `name` must be PascalCase and unique within the taxonomy
- `services` must contain at least 1 service
- All service names must be PascalCase

**Example**:
```typescript
{
  name: "HealthManagement",
  description: "Health and medical care documentation",
  icon: "🏥",
  services: {
    "MedicalCare": { /* TaxonomyService */ },
    "DentalCare": { /* TaxonomyService */ }
  }
}
```

### 3. TaxonomyService

**Purpose**: Mid-level category representing a specific service area within a function (e.g., Medical Care, Tax Compliance).

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | `string` | Yes | PascalCase, unique within function | Service name |
| `description` | `string` | Yes | Non-empty, <500 chars | Human-readable description |
| `activities` | `Record<string, TaxonomyActivity>` | Yes | Non-empty, keys match activity names | Map of activity names to activity definitions |
| `icon` | `string` | No | Emoji or icon identifier | Optional icon for UI display |

**Validation Rules**:
- `name` must be PascalCase and unique within the function
- `activities` must contain at least 1 activity
- All activity names must be PascalCase

**Example**:
```typescript
{
  name: "MedicalCare",
  description: "Primary healthcare and specialist consultations",
  icon: "🩺",
  activities: {
    "DoctorVisits": { /* TaxonomyActivity */ },
    "TestResults": { /* TaxonomyActivity */ }
  }
}
```

### 4. TaxonomyActivity

**Purpose**: Leaf-level category representing a specific activity with associated document types and retention rules.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | `string` | Yes | PascalCase, unique within service | Activity name |
| `description` | `string` | Yes | Non-empty, <500 chars | Human-readable description |
| `documentTypes` | `string[]` | Yes | Non-empty array of strings | Document types associated with this activity |
| `retention` | `Record<string, RetentionRule>` | Yes | Must include rule for taxonomy country | Country-specific retention rules |
| `icon` | `string` | No | Emoji or icon identifier | Optional icon for UI display |
| `keywords` | `string[]` | No | Array of lowercase keywords | Search keywords for autocomplete |

**Validation Rules**:
- `name` must be PascalCase and unique within the service
- `documentTypes` must contain at least 1 document type
- `retention` must include a rule for the taxonomy's country
- Document type names can be in any case (e.g., "Tax Return", "Invoice")

**Example**:
```typescript
{
  name: "DoctorVisits",
  description: "Medical appointments and consultation records",
  icon: "👨‍⚕️",
  documentTypes: [
    "Doctor's Note",
    "Consultation Summary",
    "Referral Letter",
    "Test Order"
  ],
  retention: {
    AUS: {
      years: 7,
      authority: "Privacy Act 1988",
      notes: "Medical records retention requirement"
    },
    USA: {
      years: 6,
      authority: "HIPAA",
      notes: "Minimum retention for medical records"
    },
    GBR: {
      years: 8,
      authority: "NHS",
      notes: "NHS medical records retention"
    }
  },
  keywords: ["doctor", "physician", "gp", "medical", "consultation"]
}
```

### 5. RetentionRule

**Purpose**: Country-specific retention requirement for a document type or activity.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `years` | `number` | Yes | Integer >= 0 | Retention period in years (0 = permanent) |
| `authority` | `string` | Yes | Non-empty | Legal authority or regulation |
| `notes` | `string` | No | <500 chars | Additional context or special rules |
| `fromDate` | `'creation' \| 'fy_end' \| 'fte_date' \| 'distribution'` | No | | Date from which retention period starts |

**Validation Rules**:
- `years` must be non-negative integer
- `years: 0` indicates permanent retention (e.g., trust deeds)
- If `fromDate` not specified, defaults to `'creation'`

**Example**:
```typescript
{
  years: 7,
  authority: "ATO",
  notes: "From FTE date for family trusts, from EOFY for individuals",
  fromDate: "fte_date"
}
```

### 6. TaxonomyMetadata

**Purpose**: Metadata about taxonomy creation, updates, and provenance.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `createdAt` | `string` | Yes | ISO 8601 datetime | When taxonomy was created |
| `updatedAt` | `string` | Yes | ISO 8601 datetime | Last update timestamp |
| `createdBy` | `string` | Yes | Non-empty | Creator (system or user identifier) |
| `source` | `'default-taxonomy' \| 'custom' \| 'imported'` | Yes | | Source of taxonomy data |
| `checksum` | `string` | No | SHA-256 hash | Content hash for integrity validation |

**Validation Rules**:
- `createdAt` must be valid ISO 8601 datetime
- `updatedAt` must be >= `createdAt`

**Example**:
```typescript
{
  createdAt: "2026-01-22T00:00:00Z",
  updatedAt: "2026-01-22T00:00:00Z",
  createdBy: "system",
  source: "default-taxonomy",
  checksum: "a1b2c3d4e5f6..."
}
```

## Supporting Entities

### 7. TaxonomyPath

**Purpose**: Represents a complete navigation path through the hierarchy.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `function` | `string` | Yes | Must exist in taxonomy | Function name |
| `service` | `string` | Yes | Must exist under function | Service name |
| `activity` | `string` | Yes | Must exist under service | Activity name |
| `fullPath` | `string` | Yes | Format: `Function/Service/Activity` | Complete slash-delimited path |

**Validation Rules**:
- `fullPath` must match concatenation of `function/service/activity`
- All components must exist in the taxonomy

**Example**:
```typescript
{
  function: "HealthManagement",
  service: "MedicalCare",
  activity: "DoctorVisits",
  fullPath: "HealthManagement/MedicalCare/DoctorVisits"
}
```

### 8. MigrationMapping

**Purpose**: Maps flat document types to hierarchical paths for migration.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `flatType` | `string` | Yes | Non-empty | Original flat document type name |
| `hierarchicalPath` | `string` | Yes (if not AMBIGUOUS) | Valid path or "AMBIGUOUS" | Target hierarchical path |
| `confidence` | `'high' \| 'medium' \| 'low'` | Yes | | Confidence level of mapping |
| `rationale` | `string` | Yes | Non-empty | Reason for mapping decision |
| `alternatives` | `string[]` | No (required if AMBIGUOUS) | Array of valid paths | Alternative paths for ambiguous cases |

**Validation Rules**:
- If `hierarchicalPath` is `"AMBIGUOUS"`, `alternatives` must be non-empty
- If `confidence` is `'high'`, `hierarchicalPath` must not be `"AMBIGUOUS"`
- All paths in `hierarchicalPath` and `alternatives` must be valid in the taxonomy

**Example (High Confidence)**:
```typescript
{
  flatType: "Tax Return",
  hierarchicalPath: "FinancialManagement/TaxCompliance/TaxReturns",
  confidence: "high",
  rationale: "Direct 1:1 mapping"
}
```

**Example (Ambiguous)**:
```typescript
{
  flatType: "Invoice",
  hierarchicalPath: "AMBIGUOUS",
  confidence: "low",
  rationale: "Context-dependent: could be accounts payable (supplier invoice) or receivable (customer invoice)",
  alternatives: [
    "FinancialManagement/AccountsPayable/SupplierInvoices",
    "FinancialManagement/AccountsReceivable/CustomerInvoices"
  ]
}
```

### 9. MigrationResult

**Purpose**: Tracks the outcome of migrating documents from flat to hierarchical taxonomy.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `totalDocuments` | `number` | Yes | Integer >= 0 | Total documents processed |
| `autoMapped` | `number` | Yes | Integer >= 0 | Documents auto-mapped with high confidence |
| `manualReview` | `number` | Yes | Integer >= 0 | Documents requiring manual review |
| `failed` | `number` | Yes | Integer >= 0 | Documents that failed migration |
| `mappingLog` | `DocumentMappingEntry[]` | Yes | | Detailed log of each document's mapping |
| `timestamp` | `string` | Yes | ISO 8601 datetime | When migration was performed |

**Validation Rules**:
- `autoMapped + manualReview + failed` must equal `totalDocuments`
- Success rate: `(autoMapped + manualReview) / totalDocuments` should be >= 90% per SC-052

**Example**:
```typescript
{
  totalDocuments: 1500,
  autoMapped: 1350,
  manualReview: 145,
  failed: 5,
  mappingLog: [ /* DocumentMappingEntry[] */ ],
  timestamp: "2026-01-22T10:30:00Z"
}
```

### 10. DocumentMappingEntry

**Purpose**: Audit trail entry for a single document's migration.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `documentId` | `number` | Yes | Paperless-ngx document ID | Document being migrated |
| `originalType` | `string` | Yes | Non-empty | Original flat document type |
| `newPath` | `string` | Yes (if successful) | Valid hierarchical path | New hierarchical classification |
| `method` | `'automatic' \| 'manual' \| 'failed'` | Yes | | How mapping was performed |
| `timestamp` | `string` | Yes | ISO 8601 datetime | When mapping occurred |
| `error` | `string` | No (required if failed) | | Error message if migration failed |

**Validation Rules**:
- If `method` is `'failed'`, `error` must be present and `newPath` must be absent
- If `method` is not `'failed'`, `newPath` must be present

**Example (Automatic)**:
```typescript
{
  documentId: 12345,
  originalType: "Tax Return",
  newPath: "FinancialManagement/TaxCompliance/TaxReturns",
  method: "automatic",
  timestamp: "2026-01-22T10:30:15Z"
}
```

**Example (Failed)**:
```typescript
{
  documentId: 12346,
  originalType: "Unknown Document",
  method: "failed",
  timestamp: "2026-01-22T10:30:16Z",
  error: "No mapping found and no alternative paths available"
}
```

## Entity Relationships

```
HierarchicalTaxonomy (1) ─┬─> (1..*) TaxonomyFunction
                          │
                          └─> (1) TaxonomyMetadata

TaxonomyFunction (1) ───> (1..*) TaxonomyService

TaxonomyService (1) ────> (1..*) TaxonomyActivity

TaxonomyActivity (1) ───┬─> (1..*) DocumentType (string[])
                        │
                        └─> (1..*) RetentionRule

MigrationMapping (1) ───> (0..*) TaxonomyPath (alternatives)

MigrationResult (1) ────> (1..*) DocumentMappingEntry
```

## State Transitions

### Taxonomy Lifecycle

```
[Not Installed]
    │
    ├─ install()
    │    └─> [Installing]
    │           ├─ success
    │           │    └─> [Installed - Flat Mode]
    │           └─ failure
    │                └─> rollback()
    │                     └─> [Not Installed]
    │
[Installed - Flat Mode]
    │
    ├─ enableHierarchical()
    │    └─> [Hybrid Mode] (12-month transition)
    │           ├─ migrateDocument()
    │           │    ├─ auto-map (high confidence)
    │           │    │    └─> [Document Migrated]
    │           │    └─ manual review (low confidence)
    │           │         └─> [Pending Manual Review]
    │           │              └─ user selects path
    │           │                   └─> [Document Migrated]
    │           └─ after 12 months
    │                └─> deprecateFlat()
    │                     └─> [Hierarchical Only]
    │
[Pending Manual Review]
    │
    ├─ selectMapping()
    │    └─> [Document Migrated]
    │
    └─ skip()
         └─> [Marked for Later Review]
```

### Navigation State

```
[At Root]
    │
    ├─ selectFunction()
    │    └─> [Function Selected]
    │           ├─ selectService()
    │           │    └─> [Service Selected]
    │           │           ├─ selectActivity()
    │           │           │    └─> [Activity Selected]
    │           │           │           └─> return path
    │           │           └─ back()
    │           │                └─> [Function Selected]
    │           └─ back()
    │                └─> [At Root]
    │
    └─ enterPath("Function/Service/Activity")
         └─> [Activity Selected]
```

## Validation Schema

### TypeScript Schema Definitions

Complete type definitions are in `contracts/taxonomy-api.ts`.

### Validation Functions

Key validation functions to be implemented:

```typescript
// Validate complete taxonomy structure
function validateTaxonomy(taxonomy: HierarchicalTaxonomy): ValidationResult;

// Validate path exists in taxonomy
function validatePath(path: string, taxonomy: HierarchicalTaxonomy): boolean;

// Validate retention rules include taxonomy country
function validateRetentionRules(
  activity: TaxonomyActivity,
  country: string
): ValidationResult;

// Validate migration mapping references valid paths
function validateMigrationMapping(
  mapping: MigrationMapping,
  taxonomy: HierarchicalTaxonomy
): ValidationResult;
```

## Data Storage

### JSON Files

Hierarchical taxonomies stored as JSON files in:
- Location: `src/skills/RecordsManager/Config/taxonomies/hierarchical/{entity-type}.json`
- Format: HierarchicalTaxonomy entity serialized to JSON
- Version control: Committed to repository
- Review process: Changes require pull request review

### Migration Mappings

Migration mappings stored separately:
- Location: `src/skills/RecordsManager/Config/mappings/{entity-type}-migration.json`
- Format: Array of MigrationMapping entities
- Version control: Committed to repository
- Review process: Changes require pull request review

### Audit Logs

Migration audit logs stored as JSONL:
- Location: Runtime only, not persisted to repository
- Format: One DocumentMappingEntry per line
- Retention: Local session only
- Purpose: Debugging and rollback support

## References

- Feature Specification: `specs/003-default-taxonomies/spec.md`
- Research Decisions: `specs/003-default-taxonomies/research.md`
- TypeScript Contracts: `specs/003-default-taxonomies/contracts/taxonomy-api.ts`
- Existing TaxonomyExpert: `src/lib/TaxonomyExpert.ts`
