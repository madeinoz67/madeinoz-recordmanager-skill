# Country Code Standardization

**Decision Date**: 2026-01-23
**Status**: Approved
**Applies To**: All hierarchical taxonomy files, retention rules, and country identification

## Decision: Use ISO 3166-1 Alpha-3 (3-Letter Codes)

After analyzing the current implementation and considering path length, standardization, and clarity, we are adopting **ISO 3166-1 alpha-3** (3-letter country codes) as the standard for all country identifiers in the Records Manager taxonomy system.

## Rationale

### Advantages of 3-Letter Codes (ISO 3166-1 Alpha-3)

1. **Consistency**: All codes are exactly 3 characters
   - `AUS` (Australia)
   - `USA` (United States)
   - `GBR` (United Kingdom)

2. **Fixes Existing Error**: Current implementation uses "UK" which is NOT a valid ISO code
   - Correct alpha-2: `GB` (Great Britain)
   - Correct alpha-3: `GBR` (United Kingdom of Great Britain and Northern Ireland)

3. **Better Readability**: 3-letter codes are more recognizable
   - `USA` is universally recognized vs `US`
   - `AUS` is clearer than `AU` (could be confused with chemical symbol for gold)

4. **Shorter Paths**: User's observation is correct
   - `"AUS"` (3 chars) vs `"Australia"` (9 chars) = 67% shorter
   - Hierarchical paths like `HealthManagement/MedicalCare/DoctorVisits/AUS` remain concise
   - No spaces in paths (unlike country names)

5. **International Standard**: ISO 3166-1 alpha-3 is widely used
   - UN statistical systems
   - International banking (SWIFT codes)
   - Sports organizations (IOC codes)

### Comparison with Alternatives

| Approach | Example | Length | Standard | Issues |
|----------|---------|--------|----------|--------|
| **Full Names** | `"Australia"` | 9 chars | ❌ No | Spaces, inconsistent length |
| **Alpha-2** | `"AU"` | 2 chars | ✅ ISO 3166-1 alpha-2 | Less readable, "UK" not valid |
| **Alpha-3** (CHOSEN) | `"AUS"` | 3 chars | ✅ ISO 3166-1 alpha-3 | ✅ All advantages |

## Implementation Standard

### Taxonomy Metadata

Add both `country` (code) and `countryName` (human-readable) to taxonomy files:

```json
{
  "entityType": "household",
  "country": "AUS",
  "countryName": "Australia",
  "version": "1.0.0",
  "functions": { ... }
}
```

### Retention Rules

Use 3-letter codes in retention rule keys:

```json
"retention": {
  "AUS": {
    "years": 7,
    "authority": "Privacy Act 1988"
  },
  "USA": {
    "years": 6,
    "authority": "HIPAA"
  },
  "GBR": {
    "years": 8,
    "authority": "NHS"
  }
}
```

### Country Code Mapping

**Supported Countries (Initial Launch)**:

| Country | Alpha-3 Code | Alpha-2 Code (Legacy) | Full Name |
|---------|--------------|----------------------|-----------|
| Australia | `AUS` | `AU` | Australia |
| United States | `USA` | `US` | United States of America |
| United Kingdom | `GBR` | `GB` | United Kingdom of Great Britain and Northern Ireland |

**Note**: Current implementation incorrectly uses "UK" - this will be migrated to "GBR"

### Backward Compatibility

TaxonomyExpert will accept both alpha-2 and alpha-3 codes during transition:

```typescript
const countryCodeMap: Record<string, string> = {
  // Alpha-2 → Alpha-3 migration
  'AU': 'AUS',
  'US': 'USA',
  'GB': 'GBR',
  'UK': 'GBR', // Legacy incorrect code
  // Full names → Alpha-3
  'Australia': 'AUS',
  'United States': 'USA',
  'United Kingdom': 'GBR',
};
```

## Migration Plan

### Phase 1: Update Taxonomy Files (Current)
- [x] Add `countryName` field to all taxonomy JSON files
- [ ] Change `"country": "AU"` → `"country": "AUS"`
- [ ] Update all retention rules: `"AU"` → `"AUS"`, `"US"` → `"USA"`, `"UK"` → `"GBR"`

### Phase 2: Update Code (Current)
- [ ] Update TaxonomyExpert constructor to accept both formats
- [ ] Add `countryCodeMap` for backward compatibility
- [ ] Update TaxonomyInstaller to use alpha-3 codes

### Phase 3: Update Documentation (Current)
- [ ] Update data-model.md with alpha-3 standard
- [ ] Update ADDING-TAXONOMIES.md for contributors
- [ ] Update spec.md clarifications

### Phase 4: Update Tests (Current)
- [ ] Update all test fixtures to use alpha-3 codes
- [ ] Add tests for backward compatibility
- [ ] Verify migration mapping tests

## Benefits Summary

1. **Shorter paths**: 67% reduction vs full country names
2. **No spaces**: Cleaner paths and file naming
3. **Consistent length**: Always 3 characters
4. **International standard**: ISO 3166-1 alpha-3
5. **Fixes error**: Corrects invalid "UK" code to "GBR"
6. **Better UX**: `countryName` provides human readability where needed

## References

- **ISO 3166-1 Standard**: [https://www.iso.org/iso-3166-country-codes.html](https://www.iso.org/iso-3166-country-codes.html)
- **UN Country Codes**: [https://unstats.un.org/unsd/methodology/m49/](https://unstats.un.org/unsd/methodology/m49/)
- **Current Implementation**: `src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/*.json`
- **TaxonomyExpert**: `src/skills/RECORDSMANAGER/Lib/TaxonomyExpert.ts`
