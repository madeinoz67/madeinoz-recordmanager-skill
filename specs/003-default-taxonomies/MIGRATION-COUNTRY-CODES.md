# Migration Plan: Country Code Standardization (Alpha-2 → Alpha-3)

**Created**: 2026-01-23
**Status**: Ready for Implementation
**Scope**: Update all taxonomy files and code to use ISO 3166-1 alpha-3 country codes

## Overview

This migration updates the Records Manager system from ISO 3166-1 alpha-2 (2-letter) codes to alpha-3 (3-letter) codes for consistency, readability, and to fix the invalid "UK" code.

**Migration**: `AU` → `AUS`, `US` → `USA`, `UK` → `GBR`

## Files Requiring Updates

### 1. Taxonomy JSON Files (8 files)

**Location**: `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/`

**Files to update**:
- household.json
- corporate.json
- unit-trust.json
- discretionary-trust.json
- family-trust.json
- hybrid-trust.json
- project.json
- person.json

**Changes per file**:

1. Update metadata field:
```json
// BEFORE
{
  "entityType": "household",
  "country": "AU",
  "version": "1.0.0",
  ...
}

// AFTER
{
  "entityType": "household",
  "country": "AUS",
  "countryName": "Australia",
  "version": "1.0.0",
  ...
}
```

2. Update all retention rules (find and replace):
```json
// BEFORE
"retention": {
  "AU": { ... },
  "US": { ... },
  "UK": { ... }
}

// AFTER
"retention": {
  "AUS": { ... },
  "USA": { ... },
  "GBR": { ... }
}
```

**Automated sed commands**:

```bash
# Update all taxonomy JSON files at once
cd src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/

# Add countryName after country field (manual edit required - depends on current structure)
# This needs careful manual editing per file to preserve JSON structure

# Update all retention rule country codes
sed -i '' 's/"AU":/"AUS":/g' *.json
sed -i '' 's/"US":/"USA":/g' *.json
sed -i '' 's/"UK":/"GBR":/g' *.json

# Update country metadata field
sed -i '' 's/"country": "AU"/"country": "AUS"/g' *.json
sed -i '' 's/"country": "US"/"country": "USA"/g' *.json
sed -i '' 's/"country": "UK"/"country": "GBR"/g' *.json
```

**Manual step after sed**: Add `"countryName"` field after each `"country"` field:
- After `"country": "AUS"` add `"countryName": "Australia"`

### 2. TaxonomyExpert.ts

**Location**: `src/skills/RECORDSMANAGER/Lib/TaxonomyExpert.ts`

**Changes**:

1. Add country code mapping for backward compatibility (around line 147):

```typescript
// BEFORE
// Map full country names to ISO codes for matching
const countryToCode: Record<string, string> = {
  'Australia': 'AU',
  'United States': 'US',
  'United Kingdom': 'UK',
  'UK': 'UK',
  'US': 'US',
  'AU': 'AU',
};

// AFTER
// Map all formats to ISO 3166-1 alpha-3 codes
const countryToCode: Record<string, string> = {
  // Full names → alpha-3
  'Australia': 'AUS',
  'United States': 'USA',
  'United Kingdom': 'GBR',
  // Alpha-2 → alpha-3 (backward compatibility)
  'AU': 'AUS',
  'US': 'USA',
  'GB': 'GBR',
  'UK': 'GBR', // Legacy incorrect code
  // Alpha-3 (pass through)
  'AUS': 'AUS',
  'USA': 'USA',
  'GBR': 'GBR',
};
```

2. Update environment variable fallback (around line 933):

```typescript
// BEFORE
const country = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';

// AFTER
const country = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'AUS';
```

3. Update validation to accept both alpha-2 and alpha-3:

```typescript
// Add normalization function
function normalizeCountryCode(code: string): string {
  const mapping: Record<string, string> = {
    'AU': 'AUS', 'US': 'USA', 'GB': 'GBR', 'UK': 'GBR',
    'Australia': 'AUS', 'United States': 'USA', 'United Kingdom': 'GBR',
  };
  return mapping[code] || code;
}
```

### 3. TaxonomyInstaller.ts

**Location**: `src/skills/RECORDSMANAGER/Lib/TaxonomyInstaller.ts`

**Changes**:

1. Update constructor to normalize country code:

```typescript
constructor(client: PaperlessClient, country: string, configDir?: string) {
  this.client = client;
  this.country = this.normalizeCountryCode(country); // Normalize to alpha-3
  this.configDir = configDir || path.join(__dirname, '../Config');
  this.migrationMappings = new Map();
}

private normalizeCountryCode(code: string): string {
  const mapping: Record<string, string> = {
    'AU': 'AUS', 'US': 'USA', 'GB': 'GBR', 'UK': 'GBR',
    'Australia': 'AUS', 'United States': 'USA', 'United Kingdom': 'GBR',
  };
  return mapping[code] || code;
}
```

### 4. Test Files (4 files)

**Location**: `src/tests/`

**Files**:
- TaxonomyExpert.coverage.test.ts
- TaxonomyExpert.navigation.test.ts
- TaxonomyExpert.regulatory.test.ts
- TaxonomyInstaller.migration.test.ts
- integration/migration.test.ts

**Changes**: Update all country code references from 2-letter to 3-letter:

```bash
# Update test files
cd src/tests/

sed -i '' "s/'AU'/'AUS'/g" *.test.ts integration/*.test.ts
sed -i '' 's/"AU"/"AUS"/g' *.test.ts integration/*.test.ts
sed -i '' "s/'US'/'USA'/g" *.test.ts integration/*.test.ts
sed -i '' 's/"US"/"USA"/g' *.test.ts integration/*.test.ts
sed -i '' "s/'UK'/'GBR'/g" *.test.ts integration/*.test.ts
sed -i '' 's/"UK"/"GBR"/g' *.test.ts integration/*.test.ts
```

**Manual review required**: Check that context-appropriate replacements were made (e.g., not replacing "AU" in URLs or other strings).

### 5. Migration Mapping Files

**Location**: `src/skills/RECORDSMANAGER/Config/mappings/`

**Files**:
- household-migration.json
- (future: corporate-migration.json, etc.)

**Changes**: No changes required (migration mappings reference hierarchical paths, not country codes directly).

### 6. Documentation Files

**Already Updated** ✅:
- specs/003-default-taxonomies/spec.md
- specs/003-default-taxonomies/data-model.md
- specs/003-default-taxonomies/ADDING-TAXONOMIES.md
- specs/003-default-taxonomies/COUNTRY-CODE-STANDARD.md (new)

## Validation Steps

After migration, verify:

### 1. JSON Validity
```bash
cd src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/
for file in *.json; do
  echo "Validating $file..."
  bun -e "JSON.parse(require('fs').readFileSync('$file', 'utf-8'))" && echo "✅ Valid" || echo "❌ Invalid"
done
```

### 2. TypeScript Compilation
```bash
bun build src/skills/RECORDSMANAGER/Lib/TaxonomyExpert.ts --outdir /tmp/test-build
bun build src/skills/RECORDSMANAGER/Lib/TaxonomyInstaller.ts --outdir /tmp/test-build
```

### 3. Test Suite
```bash
bun test src/tests/TaxonomyExpert.coverage.test.ts
bun test src/tests/TaxonomyExpert.navigation.test.ts
bun test src/tests/TaxonomyExpert.regulatory.test.ts
bun test src/tests/TaxonomyInstaller.migration.test.ts
bun test src/tests/integration/migration.test.ts
```

### 4. Backward Compatibility
```bash
# Test that old country codes still work
bun -e "
import { TaxonomyExpert } from './src/skills/RECORDSMANAGER/Lib/TaxonomyExpert.ts';

// Should all normalize to alpha-3
const expert1 = new TaxonomyExpert('AU', 'household');
const expert2 = new TaxonomyExpert('AUS', 'household');
const expert3 = new TaxonomyExpert('Australia', 'household');

console.log('All experts created successfully');
"
```

### 5. Manual Verification

For each taxonomy JSON file:
1. Open in editor
2. Verify `country` field is alpha-3 (AUS, USA, GBR)
3. Verify `countryName` field exists and matches
4. Verify all retention rules use alpha-3 codes
5. Check no `"UK":` remains (should be `"GBR":`)

## Rollback Plan

If migration fails:

```bash
# Revert to previous commit
git checkout HEAD -- src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/
git checkout HEAD -- src/skills/RECORDSMANAGER/Lib/TaxonomyExpert.ts
git checkout HEAD -- src/skills/RECORDSMANAGER/Lib/TaxonomyInstaller.ts
git checkout HEAD -- src/tests/
```

## Commit Strategy

Create a single atomic commit with all changes:

```bash
git add -A
git commit -m "feat: Standardize to ISO 3166-1 alpha-3 country codes

- Update all taxonomy JSON files: AU→AUS, US→USA, UK→GBR
- Add countryName field to taxonomy metadata
- Add backward compatibility mapping in TaxonomyExpert
- Update all test fixtures to use alpha-3 codes
- Fix invalid 'UK' code to correct 'GBR'

Rationale: Alpha-3 codes provide better readability, consistent
3-character length, shorter paths, and fix the invalid 'UK' code.

See specs/003-default-taxonomies/COUNTRY-CODE-STANDARD.md
Ref: SC-XXX (country code standardization)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Timeline

**Estimated Duration**: 2-3 hours
- Taxonomy JSON updates: 1 hour (8 files)
- Code updates: 30 minutes (2 files)
- Test updates: 30 minutes (5 files)
- Validation: 30 minutes
- Documentation review: 30 minutes

**Dependencies**: None (can be done immediately)

**Risk**: Low (backward compatibility ensures no breaking changes)

## Success Criteria

✅ All 8 taxonomy JSON files use alpha-3 codes
✅ All retention rules use alpha-3 codes (AUS, USA, GBR)
✅ `countryName` field added to all taxonomies
✅ Backward compatibility tests pass for alpha-2 codes
✅ All existing tests pass
✅ No invalid "UK" codes remain
✅ TypeScript compilation succeeds
✅ JSON files validate successfully

## References

- **Standard Document**: `COUNTRY-CODE-STANDARD.md`
- **Specification**: `spec.md` (Session 2026-01-23 clarification)
- **Data Model**: `data-model.md` (updated HierarchicalTaxonomy)
- **Contributor Guide**: `ADDING-TAXONOMIES.md` (updated examples)
- **ISO 3166-1 Reference**: https://www.iso.org/iso-3166-country-codes.html
