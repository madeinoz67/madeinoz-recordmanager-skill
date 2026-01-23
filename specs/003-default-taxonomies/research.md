# Research: Hierarchical Taxonomy Implementation

**Feature**: Default Taxonomies with Hierarchical Structure
**Date**: 2026-01-22
**Phase**: 0 (Research & Design Decisions)

## Overview

This document captures research findings and design decisions for implementing a hierarchical Function → Service → Activity → Document Types taxonomy model for the Records Manager Skill.

## Key Design Decisions

### 1. Hierarchical Data Structure

**Decision**: Use nested TypeScript interfaces with indexed access patterns

**Rationale**:
- TypeScript provides compile-time type safety for taxonomy structure
- Indexed access patterns enable O(1) lookup performance
- Nested structure naturally represents Function → Service → Activity hierarchy
- JSON serialization supports data fixtures and persistence

**Alternatives Considered**:
- **Graph database** (e.g., Neo4j): Rejected due to additional infrastructure dependency and overkill for fixed hierarchy depth
- **Flat structure with path strings**: Rejected due to loss of type safety and increased parsing overhead
- **Separate tables per level**: Rejected due to join complexity and migration difficulty

**Implementation Approach**:
```typescript
interface HierarchicalTaxonomy {
  functions: {
    [functionName: string]: {
      description: string;
      services: {
        [serviceName: string]: {
          description: string;
          activities: {
            [activityName: string]: {
              description: string;
              documentTypes: string[];
              retentionYears?: number;
            };
          };
        };
      };
    };
  };
}
```

### 2. Path-Based Navigation Format

**Decision**: Use forward-slash delimited paths with case-insensitive matching

**Rationale**:
- Familiar format (file system paths, URLs)
- Easy to parse with `split('/')`
- Case-insensitive matching improves usability (users don't need exact casing)
- Autocomplete can suggest completions at each level

**Format**: `FunctionName/ServiceName/ActivityName`

**Examples**:
- `HealthManagement/MedicalCare/DoctorVisits`
- `FinancialManagement/TaxCompliance/TaxReturns`
- `VehicleManagement/Maintenance/ServiceRecords`

**Alternatives Considered**:
- **Dot notation** (e.g., `Health.Medical.Visits`): Rejected due to potential confusion with property access
- **Array-based** (e.g., `["Health", "Medical", "Visits"]`): Rejected due to poor CLI ergonomics
- **Arrow notation** (e.g., `Health → Medical → Visits`): Rejected due to keyboard input complexity

### 3. Autocomplete Strategy

**Decision**: Prefix-based fuzzy matching with abbreviation support

**Rationale**:
- Prefix matching is intuitive and predictable
- Abbreviations reduce typing (e.g., "Fin/Tax/Ret" → "FinancialManagement/TaxCompliance/TaxReturns")
- Fuzzy tolerance handles minor typos without frustrating users
- Can be implemented with simple string matching (no ML required)

**Matching Rules**:
1. Exact prefix match (highest priority)
2. Case-insensitive prefix match
3. Abbreviated match (first N characters of each word)
4. Fuzzy match with Levenshtein distance ≤ 2

**Implementation**:
- Use existing string similarity libraries (e.g., `fast-levenshtein`)
- Cache compiled abbreviation patterns for performance
- Rank suggestions by match quality (exact > prefix > abbreviated > fuzzy)

### 4. Backwards Compatibility Strategy

**Decision**: Dual-mode operation with feature flag and 12-month deprecation timeline

**Rationale**:
- Allows gradual migration without breaking existing workflows
- Users can test hierarchical model before committing
- Enables side-by-side comparison during transition
- Clear deprecation timeline sets expectations

**Implementation Phases** (from spec clarification Q1):
1. **Months 1-2**: Extend data structure, maintain flat API compatibility
2. **Months 3-5**: Populate hierarchical taxonomies for all entity types
3. **Months 6-7**: Add hierarchical navigation methods to TaxonomyExpert
4. **Months 8-9**: Update upload workflow with hierarchical suggestions
5. **Months 10-11**: Update storage path strategy
6. **Month 12**: Generate hierarchical tags
7. **Month 13+**: Deprecate flat model

**Feature Flag**:
```typescript
// Environment variable: MADEINOZ_RECORDMANAGER_TAXONOMY_MODE
// Values: "flat" | "hierarchical" | "hybrid"
// Default during transition: "hybrid" (supports both)
```

### 5. Migration Mapping Table

**Decision**: Explicit JSON mapping table with manual review workflow for ambiguous cases

**Rationale** (from spec clarification Q5):
- 90%+ of documents can be auto-mapped with explicit table
- <10% ambiguous cases require human judgment
- JSON format enables version control and peer review
- Audit trail tracks all mapping decisions

**Mapping Table Structure**:
```json
{
  "version": "1.0.0",
  "mappings": [
    {
      "flatType": "Tax Return",
      "hierarchicalPath": "FinancialManagement/TaxCompliance/TaxReturns",
      "confidence": "high",
      "rationale": "Direct 1:1 mapping"
    },
    {
      "flatType": "Invoice",
      "hierarchicalPath": "AMBIGUOUS",
      "alternatives": [
        "FinancialManagement/AccountsPayable/SupplierInvoices",
        "FinancialManagement/AccountsReceivable/CustomerInvoices"
      ],
      "confidence": "low",
      "rationale": "Context-dependent classification"
    }
  ]
}
```

**Manual Review Workflow**:
1. Automatic migration applies high-confidence mappings
2. Ambiguous documents flagged with REVIEW status
3. CLI presents alternatives with rationale
4. User selects correct mapping or creates custom path
5. Decision logged to audit trail

### 6. Storage Path Strategy

**Decision**: Generate hierarchical storage paths from taxonomy structure

**Rationale**:
- Physical file organization mirrors logical taxonomy
- Enables filesystem-based navigation and discovery
- Simplifies backup and archival strategies
- Aligns with paperless-ngx storage path feature

**Path Format**: `{EntityType}/{Function}/{Service}/{Activity}`

**Examples**:
- Household: `household/HealthManagement/MedicalCare/DoctorVisits`
- Corporate: `corporate/FinancialManagement/TaxCompliance/TaxReturns`
- Trust: `family-trust-smith/LegalCompliance/TrustAdministration/DistributionMinutes`

**Implementation**:
- TaxonomyExpert generates storage path during upload
- PaperlessClient creates storage path if not exists (existing functionality)
- Migration updates storage paths for existing documents

### 7. Tag Generation Strategy

**Decision**: Generate hierarchical tags at all levels (Function, Service, Activity)

**Rationale**:
- Multi-level tagging enables flexible searching
- Users can search broadly (Function) or narrowly (Activity)
- Hierarchical tags preserve navigation path in metadata
- Compatible with paperless-ngx tag system

**Tag Format**: `{level}:{name}`

**Examples**:
- Function tag: `function:HealthManagement`
- Service tag: `service:MedicalCare`
- Activity tag: `activity:DoctorVisits`
- Full set for a document: `["function:HealthManagement", "service:MedicalCare", "activity:DoctorVisits"]`

**Benefits**:
- Search for all health documents: `function:HealthManagement`
- Search for all medical care: `service:MedicalCare`
- Search for specific activity: `activity:DoctorVisits`
- Combine with other tags: `function:HealthManagement correspondent:DrJones`

### 8. Interactive CLI Navigation Pattern

**Decision**: Sequential drill-down with breadcrumb context display (from spec clarification Q2)

**Rationale**:
- Novice-friendly progressive disclosure
- Breadcrumbs prevent disorientation
- Number-based selection reduces typing
- Cancel/back navigation supports exploration

**Flow Example**:
```
$ recordmanager upload document.pdf --domain household

Select Function:
  HealthManagement → Medical Care → [Select Activity]

  1. HealthManagement
  2. FinancialManagement
  3. VehicleManagement
  4. PropertyManagement
  5. LegalCompliance
  (or enter path: Health/Med/Doc)

> 1

Select Service (HealthManagement):
  HealthManagement → MedicalCare → [Select Activity]

  1. MedicalCare
  2. DentalCare
  3. VisionCare
  4. PharmacyCare
  (or enter path: Med/Doc)

> 1

Select Activity (HealthManagement → MedicalCare):
  HealthManagement → MedicalCare → DoctorVisits

  1. DoctorVisits
  2. TestResults
  3. Prescriptions
  4. Referrals

> 1

Selected: HealthManagement/MedicalCare/DoctorVisits
```

### 9. Country-Specific Taxonomy Variations

**Decision**: Base taxonomy structure is universal, retention rules vary by country

**Rationale**:
- Core activities (healthcare, finance, legal) are universal across countries
- Retention requirements differ based on jurisdiction
- Single taxonomy structure simplifies maintenance
- Country-specific retention in activity metadata

**Implementation**:
```typescript
interface Activity {
  name: string;
  description: string;
  documentTypes: string[];
  retention: {
    [country: string]: {
      years: number;
      authority: string; // e.g., "ATO", "IRS", "HMRC"
      notes?: string;
    };
  };
}
```

**Example**:
```typescript
{
  name: "TaxReturns",
  description: "Annual tax return filings",
  documentTypes: ["Tax Return", "Notice of Assessment", "Tax Receipt"],
  retention: {
    AU: { years: 7, authority: "ATO", notes: "From FTE date for trusts" },
    US: { years: 7, authority: "IRS", notes: "From filing date" },
    UK: { years: 6, authority: "HMRC", notes: "From end of tax year" }
  }
}
```

### 10. Performance Optimization

**Decision**: Best-effort with in-memory caching and lazy loading (from spec clarification Q3)

**Rationale**:
- No specific performance targets required
- In-memory cache eliminates repeated API calls
- Lazy loading reduces initial load time
- Sufficient for CLI usage patterns (interactive, not high-throughput)

**Caching Strategy**:
- Cache hierarchical taxonomy structure on first access
- Cache invalidation on structure changes (rare)
- Cache per entity type (separate household from corporate)
- Cache TTL: session-based (clear on CLI exit)

**Lazy Loading**:
- Load Functions on demand
- Load Services when Function selected
- Load Activities when Service selected
- Load Document Types when Activity selected

**Benchmarks** (estimated, no hard requirements):
- Initial taxonomy load: <500ms
- Navigation drill-down: <100ms per level
- Path-based lookup: <50ms
- Migration processing: ~1-10 docs/sec (API-bound)

## Technology Stack Decisions

### TypeScript Type System

**Decision**: Leverage TypeScript's type system for compile-time taxonomy validation

**Benefits**:
- Catch taxonomy structure errors at compile time
- IDE autocomplete for taxonomy navigation code
- Type-safe API contracts between layers
- Self-documenting code through types

**Example**:
```typescript
type FunctionName = "HealthManagement" | "FinancialManagement" | "VehicleManagement";
type ServiceName<F extends FunctionName> =
  F extends "HealthManagement" ? "MedicalCare" | "DentalCare" | "VisionCare" :
  F extends "FinancialManagement" ? "TaxCompliance" | "AccountsPayable" :
  never;
```

### JSON Data Format

**Decision**: Store taxonomy definitions as JSON files

**Rationale**:
- Human-readable and version-controllable
- Easy to review in pull requests
- Standard format for data fixtures
- No compilation step required

**Location**: `src/skills/RecordsManager/Config/taxonomies/hierarchical/{entity-type}.json`

### Existing Testing Infrastructure

**Decision**: Use bun test with existing test patterns

**Rationale**:
- Consistent with project standards
- No new tooling required
- Fast execution (bun runtime)
- Existing test fixtures can be extended

**Test Coverage**:
- Unit tests: TaxonomyExpert hierarchical methods
- Integration tests: CLI navigation workflows
- Migration tests: Flat-to-hierarchical conversion
- Contract tests: TypeScript interface compliance

## Open Questions

None remaining. All clarifications resolved through `/speckit.clarify` workflow:
- ✅ Transition timeline: 12-month coexistence, deprecation Month 13+
- ✅ CLI navigation: Hybrid (interactive + path-based)
- ✅ Performance targets: Best-effort (no specific latency requirements)
- ✅ Feature parity definition: Complete parity (features + workflows + performance <10% variance)
- ✅ Migration mapping: Hybrid (90%+ auto-map via table, <10% manual review)

## Next Steps

Proceed to Phase 1:
1. Generate `data-model.md` with entity definitions
2. Generate `contracts/taxonomy-api.ts` with TypeScript interfaces
3. Generate `quickstart.md` with developer guide
4. Update agent context files
5. Re-evaluate Constitution Check

## References

- Feature Specification: `specs/003-default-taxonomies/spec.md`
- Constitution: `.specify/memory/constitution.md`
- Existing TaxonomyExpert: `src/lib/TaxonomyExpert.ts`
- PaperlessClient: `src/lib/PaperlessClient.ts`
