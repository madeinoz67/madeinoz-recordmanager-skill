# Adding New Hierarchical Taxonomies

This guide provides step-by-step instructions for adding new hierarchical taxonomies to the Records Manager system.

## Overview

Hierarchical taxonomies are organized as a 4-level structure:
- **Function**: Top-level category (e.g., "FinancialManagement")
- **Service**: Mid-level category within a function (e.g., "Accounting")
- **Activity**: Specific operational area (e.g., "Bookkeeping")
- **Document Types**: Specific document types for the activity

## File Structure

Taxonomy files are stored as JSON in:
```
src/skills/RecordsManager/Config/taxonomies/hierarchical/{domain}.json
```

Where `{domain}` is one of:
- `household.json`
- `corporate.json`
- `unit-trust.json`
- `discretionary-trust.json`
- `family-trust.json`
- `hybrid-trust.json`
- `project.json`
- `person.json`

## Taxonomy JSON Structure

```json
{
  "entityType": "household",
  "country": "AUS",
  "countryName": "Australia",
  "version": "1.0.0",
  "functions": {
    "FunctionName": {
      "name": "FunctionName",
      "description": "Human-readable description",
      "icon": "📋",
      "services": {
        "ServiceName": {
          "name": "ServiceName",
          "description": "Human-readable description",
          "icon": "📊",
          "activities": {
            "ActivityName": {
              "name": "ActivityName",
              "description": "Human-readable description",
              "icon": "📄",
              "documentTypes": [
                "Document Type 1",
                "Document Type 2"
              ],
              "retention": {
                "AUS": {
                  "years": 7,
                  "authority": "ATO Section 254",
                  "notes": "Optional notes",
                  "fromDate": "fy_end"
                },
                "USA": {
                  "years": 7,
                  "authority": "IRS",
                  "fromDate": "fy_end"
                },
                "GBR": {
                  "years": 6,
                  "authority": "HMRC",
                  "fromDate": "fy_end"
                }
              },
              "keywords": ["keyword1", "keyword2"]
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

## Required Fields

### Root Level
- `entityType` (string): Entity type identifier (e.g., "household")
- `country` (string): **ISO 3166-1 alpha-3** country code (e.g., "AUS", "USA", "GBR")
- `countryName` (string): Full country name (e.g., "Australia", "United States", "United Kingdom")
- `version` (string): Semantic version (e.g., "1.0.0")
- `functions` (object): Map of function definitions
- `metadata` (object): Creation metadata

**Country Code Standard**: Use ISO 3166-1 alpha-3 (3-letter codes):
- Australia: `"AUS"`
- United States: `"USA"`
- United Kingdom: `"GBR"`

See `COUNTRY-CODE-STANDARD.md` for rationale and full details.

### Function Level
- `name` (string): PascalCase function name
- `description` (string): Human-readable description
- `icon` (string, optional): Emoji icon for UI
- `services` (object): Map of service definitions

### Service Level
- `name` (string): PascalCase service name
- `description` (string): Human-readable description
- `icon` (string, optional): Emoji icon for UI
- `activities` (object): Map of activity definitions

### Activity Level
- `name` (string): PascalCase activity name
- `description` (string): Human-readable description
- `icon` (string, optional): Emoji icon for UI
- `documentTypes` (array): List of document type strings
- `retention` (object): Country-specific retention rules
- `keywords` (array, optional): Search keywords

### Retention Rules
- `years` (number): Retention period in years (0 = permanent)
- `authority` (string): Legal authority or regulation
- `notes` (string, optional): Additional context
- `fromDate` (string, optional): One of "creation", "fy_end", "fte_date", "distribution"

## Naming Conventions

### Functions, Services, Activities
- Use PascalCase (e.g., "FinancialManagement")
- Names should be descriptive but concise
- Avoid special characters (except numbers)
- Use whole words, not abbreviations (unless widely understood)

### Document Types
- Use PascalCase (e.g., "Tax Return")
- Can include spaces for multi-word names
- Avoid special characters like `/` in names (use hyphens or spaces instead)

## Country-Specific Retention

Each activity must have retention rules for at least one country using **ISO 3166-1 alpha-3 codes**:

```json
"retention": {
  "AUS": {
    "years": 7,
    "authority": "ATO Section 254 of Tax Administration Act 1953"
  },
  "USA": {
    "years": 7,
    "authority": "IRS Publication 583"
  },
  "GBR": {
    "years": 6,
    "authority": "HMRC BKM40"
  }
}
```

**Important**: Always use 3-letter country codes (AUS, USA, GBR) in retention rules, not 2-letter codes (AU, US, GB).

## Common Retention Periods

| Document Type | AUS Years | USA Years | GBR Years | Authority |
|---------------|-----------|-----------|-----------|-----------|
| Tax Returns | 7 | 7 | 6 | ATO/IRS/HMRC |
| Financial Statements | 7 | 7 | 6 | Corporations Act |
| Bank Statements | 5 | 7 | 5 | ATO |
| Insurance Policies | 0 (permanent) | 0 (permanent) | 0 (permanent) | Contract law |
| Trust Deed | 0 (permanent) | 0 (permanent) | 0 (permanent) | Trust law |

## Step-by-Step: Creating a New Taxonomy

### 1. Plan the Structure

Before coding, plan your hierarchy:

```
Function: What major area does this cover?
  └─ Service: What sub-category?
      └─ Activity: What specific operation?
          └─ Document Types: What documents are produced?
```

Example for Vehicle Management:
```
Function: AssetManagement
  └─ Service: VehicleManagement
      └─ Activity: VehicleMaintenance
          └─ Document Types: ["Maintenance Record", "Repair Invoice", "Warranty Document"]
```

### 2. Create the JSON File

Create or edit the appropriate domain file:
```bash
src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
```

### 3. Add the Function-Service-Activity Structure

```json
{
  "functions": {
    "AssetManagement": {
      "name": "AssetManagement",
      "description": "Managing household assets",
      "icon": "🏠",
      "services": {
        "VehicleManagement": {
          "name": "VehicleManagement",
          "description": "Vehicle-related management",
          "icon": "🚗",
          "activities": {
            "VehicleMaintenance": {
              "name": "VehicleMaintenance",
              "description": "Vehicle upkeep and repairs",
              "icon": "🔧",
              "documentTypes": [
                "Maintenance Record",
                "Repair Invoice",
                "Warranty Document"
              ],
              "retention": {
                "AU": {
                  "years": 5,
                  "authority": "ATO"
                }
              },
              "keywords": ["maintenance", "repair", "service", "warranty"]
            }
          }
        }
      }
    }
  }
}
```

### 4. Validate the JSON

Run the validation script:
```bash
bun /tmp/validate-taxonomies.ts
```

Expected output:
```
=== Taxonomy Validation Report ===

household:
  Activities: N
  Missing retention: 0
  Missing keywords: 0
  Missing docTypes: 0
  With icons: N

=== Grand Total ===
Total activities: N
Missing retention: 0
Missing keywords: 0
Missing docTypes: 0
```

All "Missing" values must be 0 for validation to pass.

### 5. Test the Taxonomy

```bash
bun -e "
import { TaxonomyExpert } from './src/skills/RecordsManager/Lib/TaxonomyExpert';
const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

// Test navigation
const functions = expert.getFunctions('household');
const vehicleFn = functions.find(f => f.name === 'AssetManagement');
const services = expert.getServices('household', 'AssetManagement');
const activities = expert.getActivities('household', 'AssetManagement', 'VehicleManagement');
const docTypes = expert.getDocumentTypesForActivity('household', 'AssetManagement', 'VehicleManagement', 'VehicleMaintenance');
const retention = expert.getRetentionForActivity('household', 'AssetManagement', 'VehicleManagement', 'VehicleMaintenance');

console.log('Functions:', functions.length);
console.log('Document types:', docTypes);
console.log('Retention:', retention);
"
```

### 6. Run Unit Tests

```bash
bun test src/tests/TaxonomyInstaller.test.ts
bun test src/tests/integration/installation.test.ts
```

## Best Practices

### 1. Use Descriptive Names
- ✅ Good: "FinancialManagement", "TaxCompliance", "VehicleMaintenance"
- ❌ Bad: "Fin", "TaxStuff", "VM"

### 2. Group Related Activities
Keep activities logically grouped under appropriate services and functions.

### 3. Provide Retention Authority
Always cite the legal authority for retention periods (e.g., "ATO Section 254", "IRS Publication 583").

### 4. Include Keywords
Add search keywords to help users find activities:
```json
"keywords": ["invoice", "bill", "receipt", "payment", "vendor"]
```

### 5. Use Icons Sparingly
Icons are optional but helpful for UI. Use relevant emojis:
- Financial: 💰, 📊, 💳
- Legal: ⚖️, 📜, 📋
- Health: 🏥, 💊, 👨‍⚕️
- Vehicle: 🚗, 🚙, 🔧

### 6. Permanent Retention
Use `years: 0` for documents that must be kept permanently:
- Trust deeds
- Insurance policies
- Legal contracts
- Vital records (birth, marriage, death certificates)

### 7. fromDate Values
Use appropriate `fromDate` values:
- `creation`: Start retention from document creation date (default)
- `fy_end`: Start from financial year end (common for tax documents)
- `fte_date`: Start from Family Trust Election date (trust-specific)
- `distribution`: Start from distribution date (trust-specific)

## Common Mistakes to Avoid

### 1. Missing Retention Rules
❌ Don't forget retention rules:
```json
"activities": {
  "SomeActivity": {
    "documentTypes": ["Invoice"],
    // Missing retention!
  }
}
```

✅ Always include retention:
```json
"activities": {
  "SomeActivity": {
    "documentTypes": ["Invoice"],
    "retention": {
      "AU": { "years": 7, "authority": "ATO" }
    }
  }
}
```

### 2. Empty Arrays
❌ Don't use empty document type arrays:
```json
"documentTypes": []
```

✅ If an activity has no specific document types, consider whether it should be a separate activity or merged with another.

### 3. Special Characters in Document Types
❌ Avoid slashes in names:
```json
"documentTypes": ["Before/After Photos"]
```

The `/` will appear in the slug which may cause issues. Use hyphens or spaces instead:
```json
"documentTypes": ["Before-After Photos"]
```

### 4. Inconsistent Country Codes
Always use **ISO 3166-1 alpha-3** codes (3-letter codes):
- ✅ Good: "AUS", "USA", "GBR"
- ❌ Bad: "AU", "US", "UK" (alpha-2)
- ❌ Bad: "Australia", "United States", "United Kingdom" (full names)

## Testing Your Changes

After adding or modifying taxonomies, run the comprehensive validation workflow to ensure quality, performance, and correctness.

### Quick Validation (Required)

**1. Validate JSON syntax:**
```bash
cat src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json | jq .
```

**2. Run validation script:**
```bash
bun /tmp/validate-taxonomies.ts
```

**3. Test with TaxonomyExpert:**
```bash
bun -e "
import { TaxonomyExpert } from './src/skills/RecordsManager/Lib/TaxonomyExpert';
const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
console.log('Hierarchical available:', expert.isHierarchicalAvailable());
console.log('Domains:', expert.getSupportedDomains());
console.log('Functions:', expert.getFunctions('household').length);
"
```

**4. Run unit tests:**
```bash
bun test src/tests/TaxonomyExpert.*.test.ts
bun test src/tests/TaxonomyInstaller.test.ts
```

### Comprehensive Validation (Recommended)

The Records Manager includes comprehensive validation scripts from Phase 11 validation. Run these to ensure production-quality taxonomies.

#### 1. Quickstart Validation

Validates that all API methods work correctly with your new taxonomy:

```bash
bun quickstart-validation.ts
```

**Tests:**
- getFunctions() returns all functions
- getServices() returns services for each function
- getActivities() returns activities for each service
- getDocumentTypesForActivity() returns document types
- validatePath() confirms path validity
- parsePath() extracts components correctly
- getRetentionForActivity() returns retention rules
- generateHierarchicalTags() creates tags
- generateStoragePath() creates paths
- autocomplete() works without errors

**Expected:** All 10 scenarios passing

#### 2. Performance Testing

Validates that your taxonomy loads and operates within performance targets:

```bash
bun performance-test.ts
```

**Benchmarks:**
- Initial loading time (<2ms target for single domain)
- Cache effectiveness
- Navigation method performance (<1ms per operation)
- Autocomplete performance (<1ms)
- Keyword search performance (<1ms)
- Full hierarchy traversal (<10ms for all entities)

**Expected:** All operations complete in sub-millisecond to low-millisecond range

#### 3. Memory Leak Testing

Validates that your taxonomy doesn't cause memory leaks:

```bash
bun memory-leak-test.ts
```

**Tests:**
- Multiple instance creation
- Cache stability (0MB growth on repeated loads)
- Navigation operation stability
- Stress test with 10,000 operations

**Expected:**
- 0MB cache growth
- Linear bounded memory usage
- Negative or near-zero growth rate (indicates active garbage collection)

#### 4. Acceptance Validation

Validates that your taxonomy meets acceptance criteria from the specification:

```bash
bun acceptance-validation.ts
```

**Scenarios:**
- All domains have taxonomies
- Comprehensive document type coverage
- Retention rules defined for all activities
- Full hierarchical navigation works
- Path parsing and validation work
- Tags and storage paths generate correctly

**Expected:** >90% pass rate (13/14+ scenarios)

### Integration Testing

After all validation passes, run integration tests:

```bash
bun test src/tests/integration/
```

**Tests:**
- End-to-end taxonomy installation
- Cross-domain compatibility
- Extensibility patterns
- Migration workflows (if applicable)

**Expected:** >85% pass rate

### Full Test Suite

Finally, run the complete test suite to ensure no regressions:

```bash
bun test
```

**Expected:** >95% pass rate (some pre-existing test failures are acceptable if documented)

### Validation Checklist

Before committing your taxonomy changes:

- [ ] JSON syntax validates with `jq .`
- [ ] Validation script passes (0 missing retention/keywords/docTypes)
- [ ] TaxonomyExpert methods work (getFunctions, getServices, etc.)
- [ ] Quickstart validation passes (10/10 scenarios)
- [ ] Performance benchmarks meet targets (<2ms load, <1ms operations)
- [ ] Memory leak test passes (0MB cache growth, stable memory)
- [ ] Acceptance validation passes (>90% scenarios)
- [ ] Integration tests pass (>85%)
- [ ] Full test suite runs without new regressions
- [ ] All country codes use ISO 3166-1 alpha-3 (AUS/USA/GBR)
- [ ] All retention rules have authority citations
- [ ] All activities have at least one retention rule
- [ ] Keywords provided for major activities

### Performance Targets

Your taxonomy should meet these performance targets (from Phase 11, Task T147):

| Metric | Target | Typical |
|--------|--------|---------|
| Initial load (single entity) | <2ms | 0.8-1.5ms |
| getFunctions() | <0.01ms | <0.001ms |
| getServices() | <0.01ms | <0.001ms |
| getActivities() | <0.01ms | <0.001ms |
| validatePath() | <0.01ms | 0.001ms |
| autocomplete() | <1ms | 0.02-0.21ms |
| searchByKeyword() | <1ms | 0.31ms |
| Full traversal (8 domains) | <10ms | 6.87ms |

If your taxonomy significantly exceeds these targets (>2x slower), consider:
- Reducing the number of activities per service
- Simplifying keyword arrays
- Removing unnecessary nesting

### Troubleshooting Test Failures

**Quickstart validation fails:**
- Check that all required methods exist in TaxonomyExpert
- Verify JSON structure matches type definitions
- Ensure country codes are correct (AUS/USA/GBR)

**Performance tests fail:**
- Check for very large keyword arrays
- Verify no circular references in JSON
- Consider reducing the number of activities

**Memory leak tests fail:**
- Check for circular references
- Verify no global state modifications
- Ensure proper cleanup in TaxonomyExpert

**Acceptance validation fails:**
- Check retention rules are present for all activities
- Verify document types arrays are not empty
- Ensure hierarchical paths are valid

### CI/CD Integration

For automated validation in CI/CD pipelines:

```bash
#!/bin/bash
# Run all validation checks
bun /tmp/validate-taxonomies.ts && \
bun quickstart-validation.ts && \
bun performance-test.ts && \
bun memory-leak-test.ts && \
bun acceptance-validation.ts && \
bun test

if [ $? -eq 0 ]; then
  echo "✅ All validation checks passed"
  exit 0
else
  echo "❌ Validation failed"
  exit 1
fi
```

## Adding a New Domain

To add a completely new domain (e.g., "charity"):

1. **Create the taxonomy file:**
   ```bash
   touch src/skills/RecordsManager/Config/taxonomies/hierarchical/charity.json
   ```

2. **Add the domain to the Domain type:**
   Edit `src/lib/types/HierarchicalTaxonomy.ts`:
   ```typescript
   export type Domain =
     | 'household'
     | 'corporate'
     | 'charity'  // Add new type
     // ... other types
   ```

3. **Add to TaxonomyExpert:**
   Edit `src/skills/RecordsManager/Lib/TaxonomyExpert.ts`:
   ```typescript
   export type Domain =
     | 'household'
     | 'corporate'
     | 'charity'  // Add new type
     // ... other types
   ```

4. **Update TaxonomyInstaller (if needed):**
   Edit `src/skills/RecordsManager/Lib/TaxonomyInstaller.ts`:
   ```typescript
   const customFieldTypes: Domain[] = [
     'unit-trust',
     'discretionary-trust',
     'family-trust',
     'hybrid-trust',
     'person',
     'charity'  // Add if custom fields are needed
   ];
   ```

5. **Populate the taxonomy:**
   Follow the "Step-by-Step: Creating a New Taxonomy" section above.

## Resources

- **Type Definitions:** `src/lib/types/HierarchicalTaxonomy.ts`
- **Taxonomy Expert:** `src/skills/RecordsManager/Lib/TaxonomyExpert.ts`
- **Taxonomy Installer:** `src/skills/RecordsManager/Lib/TaxonomyInstaller.ts`
- **Example Taxonomies:** `src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json`
- **Validation Script:** `/tmp/validate-taxonomies.ts`

## Summary Checklist

When adding a new taxonomy:

- [ ] Plan the hierarchy (Function → Service → Activity → Document Types)
- [ ] Create/edit the JSON file with proper structure
- [ ] Include all required fields at each level
- [ ] Add retention rules for at least one country with authority
- [ ] Include keywords for searchability
- [ ] Validate JSON syntax with `jq .`
- [ ] Run validation script (`bun /tmp/validate-taxonomies.ts`)
- [ ] Test with TaxonomyExpert methods
- [ ] Run all tests (`bun test`)
- [ ] Update this documentation if adding new patterns
