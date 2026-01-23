# Migration Guide: Flat to Hierarchical Taxonomies

This guide walks you through migrating existing documents from flat taxonomies to the new hierarchical taxonomy system introduced in v2.0.

## Overview

**Flat taxonomy (v1.x):**
```
Tags: Medical, Receipt, Tax-Deductible
Document Type: Medical Receipt
```

**Hierarchical taxonomy (v2.0):**
```
Path: HealthManagement/MedicalCare/Consultations/MedicalReceipt
Tags: Function:HealthManagement, Service:MedicalCare, Activity:Consultations, DocumentType:MedicalReceipt
Storage Path: Health_Management/Medical_Care/Consultations/Medical_Receipt
```

## Migration Phases

### Phase 1: Preparation (15 minutes)

**1. Backup your paperless-ngx database:**

```bash
# Docker deployment
docker exec paperless_db pg_dump -U paperless paperless > paperless_backup_$(date +%Y%m%d).sql

# Manual deployment
pg_dump -U paperless paperless > paperless_backup_$(date +%Y%m%d).sql
```

**2. Verify environment:**

```bash
# Check current country setting
echo $MADEINOZ_RECORDMANAGER_COUNTRY

# Verify hierarchical taxonomy is available
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions --domain household
```

**3. Document current state:**

```bash
# Export current document list
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search --domain household --query "*" > pre_migration_docs.txt

# Count documents by domain
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts stats --domain household
```

---

### Phase 2: Load Migration Mapping Table (5 minutes)

The system includes automatic mapping from flat document types to hierarchical paths.

**1. Load mapping table:**

```typescript
import { TaxonomyInstaller } from '~/src/lib/TaxonomyInstaller';
import { PaperlessClient } from '~/src/lib/PaperlessClient';

const client = new PaperlessClient(
  process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL,
  process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN
);

const installer = new TaxonomyInstaller(
  client,
  'AUS',  // Your country code
  '/tmp/migration-logs'
);

// Load migration mappings
const mappings = await installer.loadMappingTable('household');
console.log(`Loaded ${mappings.length} migration mappings`);
```

**2. Review mapping coverage:**

```typescript
// Check how many of your documents can be auto-mapped
const documents = await client.getDocuments();
const coverage = mappings.filter(m =>
  documents.some(d => d.document_type === m.flatDocumentType)
).length;

console.log(`Mapping coverage: ${coverage}/${documents.length} (${(coverage/documents.length*100).toFixed(1)}%)`);
```

**Expected:** 90%+ of documents should have automatic mappings.

---

### Phase 3: Run Automatic Migration (30 minutes for 1000 docs)

**1. Perform migration:**

```typescript
// Migrate all documents in domain
const result = await installer.migrateAllDocuments();

console.log('Migration Results:');
console.log(`Total Documents: ${result.totalDocuments}`);
console.log(`Auto-Mapped: ${result.autoMapped}`);
console.log(`Manual Review Needed: ${result.manualReview}`);
console.log(`Failed: ${result.failed}`);
```

**2. Check migration audit log:**

```typescript
// View detailed migration log
result.mappingLog.forEach(entry => {
  console.log(`Doc ${entry.documentId}: ${entry.originalType} → ${entry.hierarchicalPath} (${entry.method})`);
});
```

**Example output:**
```
Doc 1234: Medical Receipt → HealthManagement/MedicalCare/Consultations/MedicalReceipt (automatic)
Doc 1235: Tax Return → FinanceManagement/Taxation/Returns/TaxReturn (automatic)
Doc 1236: Utility Bill → PropertyManagement/Utilities/Bills/ElectricityBill (automatic)
Doc 1237: Unknown Type → null (manual)
```

---

### Phase 4: Manual Review for Unmapped Documents (1 hour)

**1. Get documents needing manual review:**

```typescript
const reviewDocs = await installer.getDocumentsForManualReview();

console.log(`${reviewDocs.length} documents need manual review`);
```

**2. Review each document:**

```typescript
for (const doc of reviewDocs) {
  console.log(`\nDocument ${doc.id}: "${doc.title}"`);
  console.log(`Original type: ${doc.document_type}`);
  console.log(`Alternatives:`);
  doc.alternatives.forEach((alt, i) => {
    console.log(`  ${i + 1}. ${alt.path} (score: ${alt.score})`);
  });

  // Prompt user to select correct path
  const selection = await promptUser('Select path (1-N): ');
  const selectedPath = doc.alternatives[selection - 1].path;

  // Apply selected mapping
  await installer.applyManualMapping(doc.id, selectedPath);
}
```

**3. Validate manual mappings:**

```typescript
// Verify all documents now have hierarchical paths
const unmapped = await installer.getUnmappedDocuments();
console.log(`Remaining unmapped: ${unmapped.length}`);
```

---

### Phase 5: Verification (15 minutes)

**1. Verify migration completeness:**

```bash
# Check all documents have hierarchical tags
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts migration verify --domain household
```

**Expected output:**
```
✓ Migration Verification Results:
  Total Documents: 1000
  With Hierarchical Tags: 1000 (100%)
  With Storage Paths: 1000 (100%)
  Missing Mappings: 0 (0%)

✓ All documents successfully migrated
```

**2. Spot-check random documents:**

```typescript
// Sample 10 random migrated documents
const docs = await client.getDocuments();
const sample = docs.sort(() => Math.random() - 0.5).slice(0, 10);

for (const doc of sample) {
  console.log(`\nDocument ${doc.id}: ${doc.title}`);
  console.log(`Tags:`, doc.tags);
  console.log(`Custom Fields:`, doc.custom_fields);

  // Verify hierarchical tags exist
  const hasFunction = doc.tags.some(t => t.startsWith('Function:'));
  const hasService = doc.tags.some(t => t.startsWith('Service:'));
  const hasActivity = doc.tags.some(t => t.startsWith('Activity:'));
  const hasDocType = doc.tags.some(t => t.startsWith('DocumentType:'));

  if (hasFunction && hasService && hasActivity && hasDocType) {
    console.log('✓ Hierarchical tags present');
  } else {
    console.log('✗ Missing hierarchical tags');
  }
}
```

**3. Test search functionality:**

```bash
# Test hierarchical path search
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations"

# Test tag search
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --domain household \
  --tags "Function:HealthManagement"
```

---

### Phase 6: Dual-Mode Operation (12 months recommended)

During the transition period, support both flat and hierarchical taxonomies:

**1. Enable dual-mode:**

```typescript
const expert = new TaxonomyExpert('AUS', 'household');
const mode = expert.getTaxonomyMode();
console.log(`Current mode: ${mode}`);  // Should return 'hierarchical' or 'dual-mode'
```

**2. Handle legacy flat queries:**

```typescript
// Legacy flat query (still works)
const flatResults = expert.getDocumentTypes('household');

// New hierarchical query (preferred)
const hierarchicalResults = expert.getFunctions('household');
```

**3. Gradual deprecation:**

Over the 12-month transition period:
- Month 1-3: Dual-mode with no warnings
- Month 4-9: Dual-mode with deprecation warnings
- Month 10-12: Hierarchical-only with migration prompts
- After 12 months: Flat taxonomy fully deprecated

---

## Rollback Procedure

If you need to rollback the migration:

**1. Stop paperless-ngx:**

```bash
docker-compose down  # or systemctl stop paperless
```

**2. Restore database backup:**

```bash
docker exec -i paperless_db psql -U paperless paperless < paperless_backup_20260122.sql
```

**3. Restart paperless-ngx:**

```bash
docker-compose up -d  # or systemctl start paperless
```

**4. Verify rollback:**

```bash
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search --domain household --query "*" > post_rollback_docs.txt

diff pre_migration_docs.txt post_rollback_docs.txt
```

---

## Common Migration Issues

### Issue 1: Mapping Coverage Below 90%

**Cause:** Custom or non-standard document types

**Solution:**

1. Add custom mappings to migration table:
   ```typescript
   await installer.addCustomMapping({
     flatDocumentType: 'My Custom Type',
     hierarchicalPath: 'FinanceManagement/Custom/Activity/CustomType',
     confidence: 1.0
   });
   ```

2. Re-run migration:
   ```typescript
   await installer.migrateAllDocuments();
   ```

### Issue 2: Retention Requirements Changed

**Cause:** Hierarchical paths have different retention periods

**Solution:**

1. Review retention for affected documents:
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

2. Update retention dates if needed (preserve original if longer)

### Issue 3: Tags Duplicated

**Cause:** Both flat and hierarchical tags applied

**Solution:**

1. Remove old flat tags:
   ```typescript
   // Keep only hierarchical tags
   await client.updateDocument(documentId, {
     tags: doc.tags.filter(t =>
       t.startsWith('Function:') ||
       t.startsWith('Service:') ||
       t.startsWith('Activity:') ||
       t.startsWith('DocumentType:')
     )
   });
   ```

### Issue 4: Storage Paths Inconsistent

**Cause:** Legacy documents have old storage paths

**Solution:**

1. Regenerate storage paths for all documents:
   ```typescript
   for (const doc of documents) {
     const hierarchicalPath = doc.custom_fields.taxonomy_path;
     const newStoragePath = expert.generateStoragePath(hierarchicalPath);

     await client.updateDocument(doc.id, {
       custom_fields: {
         ...doc.custom_fields,
         storage_path: newStoragePath
       }
     });
   }
   ```

---

## Post-Migration Checklist

- [ ] All documents have hierarchical tags (Function, Service, Activity, DocumentType)
- [ ] All documents have storage paths in custom fields
- [ ] Search works with hierarchical paths
- [ ] Retention checking works with hierarchical paths
- [ ] Upload workflow uses hierarchical classification
- [ ] Backup of pre-migration state is verified and accessible
- [ ] Migration audit log is saved for compliance
- [ ] Team members trained on hierarchical taxonomy navigation
- [ ] Documentation updated for new taxonomy structure
- [ ] Deprecation timeline communicated to users

---

## Migration Timeline

**Recommended schedule for production migration:**

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Week 1** | Preparation | Backup, testing, mapping table review |
| **Week 2** | Pilot | Migrate 10% of documents, verify, collect feedback |
| **Week 3** | Gradual Rollout | Migrate 50% of remaining documents |
| **Week 4** | Full Migration | Complete migration, manual review |
| **Week 5-8** | Dual-Mode | Support both flat and hierarchical queries |
| **Month 3-12** | Transition | Gradual deprecation of flat taxonomy |
| **Month 13+** | Hierarchical-Only | Flat taxonomy fully deprecated |

---

## Support During Migration

**Documentation:**
- [Hierarchical Taxonomies Guide](../user-guide/hierarchical-taxonomies.md)
- [Troubleshooting](../troubleshooting.md)
- [API Reference](../reference/api-reference.md)

**Tools:**
- Migration CLI tool: `bun run Tools/RecordManager.ts migration`
- Verification script: `bun run Tools/RecordManager.ts migration verify`
- Manual mapping UI: `bun run Tools/RecordManager.ts migration review`

**Help:**
- GitHub Issues: [Report migration issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)
- Migration audit logs: Saved to `/tmp/migration-logs/`

---

**Migration Version:** 2.0.0
**Last Updated:** 2026-01-22
**Test Coverage:** T115 (Complete Migration Workflow Integration)
