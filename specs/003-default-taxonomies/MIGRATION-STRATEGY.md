# Migration Strategy: Immediate Deprecation

**Date**: 2026-01-23
**Decision**: Deprecate `taxonomies.yaml` immediately after migration completes

## Original Plan vs Current Decision

### Original Plan (from spec.md Q17)
- 12-month transition period with both flat and hierarchical models supported
- Gradual migration of documents over time
- Full feature parity between both models
- Deprecation warnings starting month 1, hard deprecation month 13

### Current Decision
- **Immediate deprecation** after migration completes
- One-time migration of all documents from flat → hierarchical
- Once migration succeeds, `taxonomies.yaml` is archived/removed
- All operations use hierarchical model only

## Benefits of Immediate Deprecation

1. **Simpler codebase** - No dual-mode support logic needed
2. **Faster adoption** - Users immediately benefit from hierarchical structure
3. **Easier maintenance** - Single taxonomy system to maintain
4. **Clearer migration path** - One clear cutover point
5. **Reduced complexity** - No feature parity requirements between models

## Migration Process

### Phase 1: Pre-Migration
1. Backup all document classifications
2. Load migration mapping table for entity type
3. Analyze documents to estimate auto-mapping success rate
4. Present user with migration plan

### Phase 2: Migration Execution
1. Auto-map documents with high/medium confidence mappings
2. Flag ambiguous documents for manual review
3. Present manual review queue to user with alternatives
4. User selects correct path for each ambiguous document
5. Apply all mappings to paperless-ngx

### Phase 3: Post-Migration
1. Verify all documents successfully migrated
2. Generate migration audit log
3. Archive `taxonomies.yaml` → `taxonomies.yaml.deprecated`
4. Update TaxonomyExpert to use hierarchical-only mode
5. **No rollback** - migration is one-way

## Rollback Not Supported

Unlike the original 12-month plan which allowed reversion, immediate deprecation means:
- Migration is **one-way** and **permanent**
- Users must complete manual review before finalizing
- Once complete, no going back to flat model
- This is acceptable because hierarchical model is strictly more capable

## Files to Archive After Migration

```
Config/
├── taxonomies.yaml → taxonomies.yaml.deprecated
└── taxonomies/
    └── hierarchical/  # Now the ONLY taxonomy source
```

## Implementation Impact

### Simplified Tasks
- **T126**: ~~Implement 12-month transition period~~ → Skip (immediate cutover)
- **T127**: ~~Add deprecation warnings~~ → Simplified (just prevent flat model usage post-migration)

### Migration Method Changes
- Migration must be more robust (no safety net of dual-mode)
- Better pre-migration validation required
- Clear user confirmation before point-of-no-return

## User Communication

**Before Migration:**
```
⚠️  MIGRATION REQUIRED

This will migrate all documents from the legacy flat taxonomy to the
new hierarchical taxonomy (Function → Service → Activity → Document Types).

✅ Benefits:
  • Better organization with 12+ functions per entity type
  • Clearer document categorization
  • Country-specific compliance built-in
  • More powerful search and navigation

⚠️  Important:
  • This is a ONE-WAY migration
  • Once complete, you cannot return to the old system
  • Review ambiguous documents carefully during migration

Estimated: 90%+ documents will be auto-mapped
           <10% will need your manual review

Continue? [Y/n]
```

**After Migration:**
```
✅ Migration Complete

  • Total documents: 1,234
  • Auto-mapped: 1,178 (95.5%)
  • Manual review: 56 (4.5%)
  • Failed: 0

The legacy taxonomy system has been deprecated.
All operations now use the hierarchical taxonomy.

Audit log: /path/to/migration-2026-01-23T10:30:00.json
```

## Decision Log

**2026-01-23**: User (Seaton) decided immediate deprecation is preferable to 12-month transition for:
- Reduced complexity
- Faster value delivery
- Simpler maintenance

This overrides the original spec.md Q17 answer.
