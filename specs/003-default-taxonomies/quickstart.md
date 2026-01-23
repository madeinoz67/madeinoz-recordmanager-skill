# Quickstart: Hierarchical Taxonomy Development

**Feature**: Default Taxonomies with Hierarchical Structure
**Date**: 2026-01-22
**Phase**: 1 (Design & Contracts)

## For Developers

This guide helps developers understand and implement the hierarchical taxonomy feature.

## Prerequisites

- TypeScript and bun runtime installed
- Existing Records Manager Skill codebase
- Access to paperless-ngx test instance
- Familiarity with existing TaxonomyExpert and PaperlessClient

## Quick Start

### 1. Understand the Architecture

The hierarchical taxonomy extends the existing three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ INTENT LAYER (SKILL.md)                                      │
│ - Workflow routing (unchanged)                              │
│ - Context detection                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ EXPERTISE LAYER (src/lib/)                                   │
│ - TaxonomyExpert.ts ← EXTENDS with hierarchical methods     │
│ - TaxonomyInstaller.ts ← NEW for installation/migration      │
│ - types/HierarchicalTaxonomy.ts ← NEW type definitions       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ EXECUTION LAYER                                              │
│ - PaperlessClient.ts (unchanged - no new API methods)        │
│ - RecordManager.ts ← EXTENDS with hierarchical CLI commands │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle**: No changes to PaperlessClient API. All hierarchical logic lives in TaxonomyExpert.

### 2. Review Design Artifacts

Before writing code, read these files in order:

1. **spec.md** - Feature requirements (what we're building)
2. **research.md** - Design decisions (why we chose this approach)
3. **data-model.md** - Entity definitions (what the data looks like)
4. **contracts/taxonomy-api.ts** - TypeScript interfaces (type-safe contracts)
5. **This file** - Implementation guide (how to build it)

### 3. Set Up Development Environment

```bash
# Clone repository (if needed)
git clone <repo-url>
cd madeinoz-recordmanager-skill

# Check out feature branch
git checkout 003-default-taxonomies

# Install dependencies
bun install

# Run existing tests to verify setup
bun test
```

### 4. Explore Existing Code

Use Codanna CLI for code exploration:

```bash
# Find TaxonomyExpert
codanna retrieve describe TaxonomyExpert

# Understand existing methods
codanna retrieve calls TaxonomyExpert

# Find where TaxonomyExpert is used
codanna retrieve callers TaxonomyExpert
```

## Implementation Checklist

### Phase 1: Type Definitions

- [ ] Create `src/lib/types/HierarchicalTaxonomy.ts`
  - Copy interfaces from `contracts/taxonomy-api.ts`
  - Add JSDoc comments for IDE autocomplete
  - Export all types

- [ ] Create sample taxonomy JSON files
  - `src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json`
  - `src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json`
  - Start with 2-3 Functions each for initial testing

### Phase 2: TaxonomyExpert Extension

- [ ] Extend `TaxonomyExpert` class with hierarchical methods
  - `getFunctions(entityType: Domain): string[]`
  - `getServices(entityType, functionName): string[]`
  - `getActivities(entityType, functionName, serviceName): string[]`
  - `getDocumentTypesForActivity(entityType, path): string[]`
  - `getRetentionForActivity(entityType, path, country): RetentionRule`

- [ ] Add path validation and resolution
  - `validatePath(entityType, path): boolean`
  - `parsePath(path): TaxonomyPath | null`
  - `resolvePath(entityType, partialPath): string | null`

- [ ] Add autocomplete and search
  - `autocomplete(entityType, input, maxSuggestions?): AutocompleteSuggestion[]`
  - `searchByKeyword(entityType, keyword): string[]`

- [ ] Add tag and storage path generation
  - `generateHierarchicalTags(path): string[]`
  - `generateStoragePath(entityType, path): string`

- [ ] Add mode management
  - `getTaxonomyMode(): TaxonomyMode`
  - `isHierarchicalAvailable(entityType): boolean`

### Phase 3: Migration Support

- [ ] Create `TaxonomyInstaller` class
  - Migration mapping table loading
  - Automatic migration for high-confidence mappings
  - Manual review workflow for ambiguous cases
  - Audit logging

- [ ] Create sample migration mapping
  - `src/skills/RecordsManager/Config/mappings/household-migration.json`
  - Start with 10-20 common document types

### Phase 4: CLI Integration

- [ ] Extend RecordManager CLI with hierarchical navigation
  - Interactive drill-down prompts
  - Path-based input support
  - Breadcrumb display
  - Autocomplete integration

### Phase 5: Testing

- [ ] Unit tests for TaxonomyExpert hierarchical methods
  - `tests/TaxonomyExpert.test.ts` (extend existing)
  - Test each hierarchical method
  - Test path parsing and validation
  - Test autocomplete

- [ ] Integration tests for CLI navigation
  - Mock user input for interactive prompts
  - Test path-based input
  - Test autocomplete suggestions

- [ ] Migration tests
  - Test automatic mapping
  - Test manual review workflow
  - Test audit logging

## Development Workflow

### Step 1: Read Existing Code

Use Codanna to understand TaxonomyExpert:

```bash
# Get full TaxonomyExpert implementation
codanna retrieve describe TaxonomyExpert

# Find all files that use TaxonomyExpert
codanna retrieve callers TaxonomyExpert

# Understand dependencies
codanna retrieve calls TaxonomyExpert
```

### Step 2: Create Types

Create `src/lib/types/HierarchicalTaxonomy.ts`:

```typescript
/**
 * Hierarchical taxonomy type definitions
 * @see specs/003-default-taxonomies/contracts/taxonomy-api.ts
 */

export type Domain = 'household' | 'corporate' | /* ... */;
export type Country = 'AU' | 'US' | 'UK';

export interface HierarchicalTaxonomy {
  entityType: Domain;
  country: Country;
  functions: Record<string, TaxonomyFunction>;
  version: string;
  metadata: TaxonomyMetadata;
}

// ... copy remaining interfaces from contracts/taxonomy-api.ts
```

### Step 3: Create Sample Taxonomy

Create `src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json`:

```json
{
  "entityType": "household",
  "country": "AU",
  "version": "1.0.0",
  "functions": {
    "HealthManagement": {
      "name": "HealthManagement",
      "description": "Health and medical care documentation",
      "icon": "🏥",
      "services": {
        "MedicalCare": {
          "name": "MedicalCare",
          "description": "Primary healthcare and specialist consultations",
          "icon": "🩺",
          "activities": {
            "DoctorVisits": {
              "name": "DoctorVisits",
              "description": "Medical appointments and consultation records",
              "icon": "👨‍⚕️",
              "documentTypes": [
                "Doctor's Note",
                "Consultation Summary",
                "Referral Letter"
              ],
              "retention": {
                "AU": {
                  "years": 7,
                  "authority": "Privacy Act 1988",
                  "notes": "Medical records retention requirement"
                }
              },
              "keywords": ["doctor", "physician", "gp", "medical", "consultation"]
            }
          }
        }
      }
    }
  },
  "metadata": {
    "createdAt": "2026-01-22T00:00:00Z",
    "updatedAt": "2026-01-22T00:00:00Z",
    "createdBy": "system",
    "source": "default-taxonomy"
  }
}
```

### Step 4: Extend TaxonomyExpert

Add hierarchical methods to `src/lib/TaxonomyExpert.ts`:

```typescript
import type {
  HierarchicalTaxonomy,
  TaxonomyPath,
  AutocompleteSuggestion
} from './types/HierarchicalTaxonomy';

export class TaxonomyExpert {
  // Existing properties and methods...

  private hierarchicalTaxonomies: Map<Domain, HierarchicalTaxonomy> = new Map();

  /**
   * Load hierarchical taxonomy for entity type
   */
  private loadHierarchicalTaxonomy(entityType: Domain): HierarchicalTaxonomy {
    if (this.hierarchicalTaxonomies.has(entityType)) {
      return this.hierarchicalTaxonomies.get(entityType)!;
    }

    const path = `./data/taxonomies/hierarchical/${entityType}.json`;
    const taxonomy = require(path) as HierarchicalTaxonomy;
    this.hierarchicalTaxonomies.set(entityType, taxonomy);
    return taxonomy;
  }

  /**
   * Get all functions for an entity type
   */
  getFunctions(entityType: Domain): string[] {
    const taxonomy = this.loadHierarchicalTaxonomy(entityType);
    return Object.keys(taxonomy.functions);
  }

  /**
   * Get all services for a function
   */
  getServices(entityType: Domain, functionName: string): string[] {
    const taxonomy = this.loadHierarchicalTaxonomy(entityType);
    const func = taxonomy.functions[functionName];
    if (!func) {
      throw new Error(`Function not found: ${functionName}`);
    }
    return Object.keys(func.services);
  }

  // ... implement remaining methods
}
```

### Step 5: Write Tests

Create `tests/TaxonomyExpert.hierarchical.test.ts`:

```typescript
import { describe, it, expect } from 'bun:test';
import { TaxonomyExpert } from '../src/lib/TaxonomyExpert';

describe('TaxonomyExpert - Hierarchical', () => {
  const expert = new TaxonomyExpert('AU');

  it('should get functions for household', () => {
    const functions = expert.getFunctions('household');
    expect(functions).toContain('HealthManagement');
    expect(functions).toContain('FinancialManagement');
  });

  it('should get services for HealthManagement', () => {
    const services = expert.getServices('household', 'HealthManagement');
    expect(services).toContain('MedicalCare');
  });

  it('should validate path', () => {
    const valid = expert.validatePath(
      'household',
      'HealthManagement/MedicalCare/DoctorVisits'
    );
    expect(valid).toBe(true);
  });

  it('should parse path', () => {
    const parsed = expert.parsePath('Health/Medical/Visits');
    expect(parsed).not.toBeNull();
    expect(parsed?.function).toBe('Health');
    expect(parsed?.service).toBe('Medical');
    expect(parsed?.activity).toBe('Visits');
  });

  // ... more tests
});
```

### Step 6: Run Tests

```bash
# Run hierarchical tests
bun test tests/TaxonomyExpert.hierarchical.test.ts

# Run all tests
bun test
```

## Common Patterns

### Loading Hierarchical Taxonomy

```typescript
// In TaxonomyExpert
private loadHierarchicalTaxonomy(entityType: Domain): HierarchicalTaxonomy {
  if (this.hierarchicalTaxonomies.has(entityType)) {
    return this.hierarchicalTaxonomies.get(entityType)!;
  }

  const path = `./data/taxonomies/hierarchical/${entityType}.json`;
  const taxonomy = require(path) as HierarchicalTaxonomy;

  // Validate taxonomy
  this.validateTaxonomy(taxonomy);

  // Cache it
  this.hierarchicalTaxonomies.set(entityType, taxonomy);
  return taxonomy;
}
```

### Navigating Hierarchy

```typescript
// Get activity object from path
getActivity(entityType: Domain, path: string): TaxonomyActivity | null {
  const parsed = this.parsePath(path);
  if (!parsed) return null;

  const taxonomy = this.loadHierarchicalTaxonomy(entityType);
  const func = taxonomy.functions[parsed.function];
  if (!func) return null;

  const service = func.services[parsed.service];
  if (!service) return null;

  return service.activities[parsed.activity] || null;
}
```

### Autocomplete Implementation

```typescript
autocomplete(
  entityType: Domain,
  input: string,
  maxSuggestions = 10
): AutocompleteSuggestion[] {
  const parts = input.split('/');
  const taxonomy = this.loadHierarchicalTaxonomy(entityType);

  if (parts.length === 1) {
    // Autocomplete function
    return this.matchFunctions(taxonomy, parts[0], maxSuggestions);
  } else if (parts.length === 2) {
    // Autocomplete service
    return this.matchServices(taxonomy, parts[0], parts[1], maxSuggestions);
  } else {
    // Autocomplete activity
    return this.matchActivities(
      taxonomy,
      parts[0],
      parts[1],
      parts[2],
      maxSuggestions
    );
  }
}
```

## Testing Strategy

### Unit Tests

Test each method in isolation:

```typescript
describe('TaxonomyExpert.getFunctions', () => {
  it('returns all functions for entity type', () => {
    const functions = expert.getFunctions('household');
    expect(functions.length).toBeGreaterThan(0);
    expect(functions).toContain('HealthManagement');
  });

  it('throws error for invalid entity type', () => {
    expect(() => expert.getFunctions('invalid' as Domain))
      .toThrow('Invalid entity type');
  });
});
```

### Integration Tests

Test workflows:

```typescript
describe('Hierarchical Navigation Workflow', () => {
  it('navigates from root to activity', async () => {
    const expert = new TaxonomyExpert('AU');

    // 1. Get functions
    const functions = expert.getFunctions('household');
    expect(functions).toContain('HealthManagement');

    // 2. Select function, get services
    const services = expert.getServices('household', 'HealthManagement');
    expect(services).toContain('MedicalCare');

    // 3. Select service, get activities
    const activities = expert.getActivities(
      'household',
      'HealthManagement',
      'MedicalCare'
    );
    expect(activities).toContain('DoctorVisits');

    // 4. Get document types for activity
    const docTypes = expert.getDocumentTypesForActivity(
      'household',
      'HealthManagement/MedicalCare/DoctorVisits'
    );
    expect(docTypes).toContain("Doctor's Note");
  });
});
```

### Contract Tests

Verify type compliance:

```typescript
describe('Type Contracts', () => {
  it('HierarchicalTaxonomy matches interface', () => {
    const taxonomy = expert.loadHierarchicalTaxonomy('household');

    // TypeScript compile-time check
    const test: HierarchicalTaxonomy = taxonomy;

    expect(test.entityType).toBe('household');
    expect(test.country).toMatch(/^(AU|US|UK)$/);
    expect(test.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// In TaxonomyExpert
private debug = process.env.DEBUG_TAXONOMY === 'true';

getFunctions(entityType: Domain): string[] {
  if (this.debug) {
    console.log(`[TaxonomyExpert] getFunctions(${entityType})`);
  }
  // ... implementation
}
```

Run with debugging:

```bash
DEBUG_TAXONOMY=true bun test
```

### Use Codanna for Impact Analysis

Before modifying TaxonomyExpert:

```bash
# See what will be affected
codanna retrieve callers TaxonomyExpert

# Check all calls to understand usage patterns
codanna retrieve calls TaxonomyExpert
```

### Validate JSON with Schema

```bash
# Install JSON schema validator
bun add -d ajv

# Create validation script
cat > scripts/validate-taxonomy.ts << 'EOF'
import Ajv from 'ajv';
import schema from '../specs/003-default-taxonomies/contracts/taxonomy-schema.json';
import household from '../src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

if (validate(household)) {
  console.log('✅ Taxonomy valid');
} else {
  console.error('❌ Validation errors:', validate.errors);
  process.exit(1);
}
EOF

# Run validation
bun run scripts/validate-taxonomy.ts
```

## Next Steps

1. **Read data-model.md** - Understand all entities and relationships
2. **Review contracts/taxonomy-api.ts** - See type-safe API contracts
3. **Start with types** - Create `HierarchicalTaxonomy.ts` first
4. **Build incrementally** - Implement one method at a time with tests
5. **Use Codanna** - Explore code relationships before making changes

## References

- **Feature Spec**: `specs/003-default-taxonomies/spec.md`
- **Research**: `specs/003-default-taxonomies/research.md`
- **Data Model**: `specs/003-default-taxonomies/data-model.md`
- **Type Contracts**: `specs/003-default-taxonomies/contracts/taxonomy-api.ts`
- **Constitution**: `.specify/memory/constitution.md`
- **Existing Code**: `src/lib/TaxonomyExpert.ts`, `src/lib/PaperlessClient.ts`

## Getting Help

- Check existing tests in `tests/` for patterns
- Use Codanna CLI for code exploration
- Review constitution for architectural principles
- Ask questions in pull request reviews
