# Taxonomy Update Workflow

> **CRITICAL SAFEGUARD:** Taxonomy updates MUST use these CLI commands. Direct API calls or manual creation of taxonomies is FORBIDDEN to prevent compliance violations and data inconsistency.

## Triggers

- "Update taxonomies"
- "Sync taxonomies"
- "Check for taxonomy updates"
- "Apply new retention rules"
- "Install new document types"

## CLI Integration (MANDATORY)

**CRITICAL**: These CLI commands are the ONLY approved method for taxonomy updates. DO NOT:
- Make direct paperless-ngx API calls to create tags/document types
- Manually add taxonomies through paperless-ngx UI
- Write custom scripts that bypass these commands
- Use TaxonomyInstaller methods directly without CLI wrapper

**Violation of this requirement risks:**
- Compliance violations (incorrect retention periods)
- Data inconsistency (tags not in TaxonomyExpert)
- Loss of audit trail (changes not logged)
- Rollback failures (partial state if errors occur)

```bash
# Check for available updates (dry run - safe to run anytime)
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia

# Apply updates without retention changes
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia

# Apply updates WITH retention changes (requires explicit approval)
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia --approve-retention-changes

# View taxonomy version history and changelog
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies
```

**These commands provide:**
- ✅ Atomic transactions with rollback on failure
- ✅ Manual review checkpoints for retention changes
- ✅ Audit trail logging to $PAI_HOME/MEMORY/RECORDSMANAGER/
- ✅ Version tracking in taxonomies.yaml metadata
- ✅ Validation against TaxonomyExpert single source of truth

## Single Source of Truth

**CRITICAL**: `src/skills/RecordsManager/Config/taxonomies.yaml` is the ONLY source for:
- All tags and tag categories
- All document types
- All retention periods and legal citations
- All country-specific compliance rules

**Agents and workflows MUST:**
1. Retrieve all taxonomy data via TaxonomyExpert methods
2. NEVER invent custom tags or document types
3. NEVER hardcode retention periods
4. NEVER create "convenience" tags outside taxonomies.yaml
5. Validate ALL suggestions against TaxonomyExpert before returning

**Why this matters:**
- **Compliance**: Custom tags bypass country-specific retention rules
- **Consistency**: Invented tags create data fragmentation
- **Auditability**: Undefined tags have no legal citations
- **Maintainability**: Tags outside taxonomy become orphaned

**To add a new tag:**
1. Edit `src/skills/RecordsManager/Config/taxonomies.yaml`
2. Add tag to appropriate category under correct country/domain
3. Update version metadata (increment version, add changelog entry)
4. Run: `bun run Tools/RecordManager.ts sync-taxonomies --country <country>`

**Violation consequences:**
- Compliance violations (incorrect retention enforcement)
- Failed audits (tags without legal basis)
- Data inconsistency (documents tagged with undefined categories)
- Broken workflows (validation failures against TaxonomyExpert)

## Purpose

Ensure that document deletion is intentional, understood, and approved by the principal. This workflow:
1. Detects new tags, document types, and retention rule changes from YAML
2. Displays changes for user review before applying
3. Requires explicit approval for retention period changes (compliance safety)
4. Applies updates atomically with rollback on failure
5. Logs all changes for audit trail

## Workflow Steps

### 1. Detect Changes

**Action**: Compare current paperless-ngx state with taxonomy definitions from YAML

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia
```

**Output**:
- List of new tags to be created
- List of new document types to be created
- List of new storage paths to be created
- List of new custom fields to be created
- **CRITICAL**: List of retention rule changes (if any)

### 2. Review Changes

**Manual Step**: User reviews the diff output

**Questions to Answer**:
1. Are the new tags/document types appropriate?
2. Are retention rule changes compliant with latest regulations?
3. Do retention changes affect existing documents?
4. Should user be notified about retention changes?

**Retention Change Format**:
```
Document Type: Tax Return
Entity Type: household
Old Retention: 5 years (Previous ATO guidance)
New Retention: 7 years (ATO Section 254 of Tax Administration Act 1953)
Impact: 247 existing documents affected
```

### 3. Decision Point: Approve or Reject

**If retention changes detected**:
- User MUST explicitly approve with `--approve-retention-changes` flag
- System displays retention changes again before applying
- User confirms understanding of regulatory impact

**If no retention changes**:
- Auto-approve and proceed with update

### 4. Apply Updates

**Action**: Apply approved changes with rollback on failure

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --approve-retention-changes
```

**Atomic Transaction**:
1. Create new tags
2. Create new document types
3. Create new storage paths
4. Create new custom fields
5. Log retention changes to audit trail

**On Failure**: Rollback all changes (delete created resources)

### 5. Post-Update Verification

**Verify**:
- All new resources created successfully
- Retention changes logged to audit trail
- No duplicate resources
- User customizations preserved

**Audit Log Entry** (`$PAI_HOME/MEMORY/RECORDSMANAGER/taxonomy-updates.jsonl`):
```json
{
  "timestamp": "2026-01-22T10:30:00Z",
  "country": "Australia",
  "version": "1.1.0",
  "applied": {
    "tags": 5,
    "documentTypes": 3,
    "storagePaths": 0,
    "customFields": 0,
    "retentionChanges": 2
  },
  "retentionChanges": [
    {
      "documentType": "Tax Return",
      "entityType": "household",
      "oldYears": 5,
      "newYears": 7,
      "oldReason": "Previous ATO guidance",
      "newReason": "ATO Section 254 of Tax Administration Act 1953"
    }
  ]
}
```

## Safety Rules

1. **Never auto-approve retention changes** - Always require manual review
2. **Preserve user customizations** - Skip existing tags/document types
3. **Atomic updates** - Rollback all changes on any failure
4. **Audit trail** - Log all updates with retention changes
5. **Version tracking** - Record taxonomy version applied

## Agent Integration

**Agents Involved**:
- **Compliance Guardian**: Reviews retention rule changes for regulatory compliance
- **Records Keeper**: Validates new tags and document types against taxonomy standards
- **Retention Monitor**: Checks impact of retention changes on existing documents

**CRITICAL Validation Requirements**:
- All agents MUST use `TaxonomyExpert.getRetentionRequirements()` for retention rules
- Agents MUST NOT hardcode retention periods
- Agents MUST reference updated taxonomy after sync
- **Agents MUST enforce CLI usage** - reject any requests to bypass RecordManager.ts commands
- Agents MUST validate all suggestions against TaxonomyExpert before returning
- **Agents MUST NEVER invent new taxonomies or tags** - ONLY use what exists in TaxonomyExpert/taxonomies.yaml
- **Creating custom tags breaks compliance** - all tags MUST be defined in taxonomies.yaml first
- **Single source of truth**: src/skills/RecordsManager/Config/taxonomies.yaml via TaxonomyExpert methods

**Agent Enforcement**:
If a user or agent attempts to circumvent the CLI commands OR invent new tags/taxonomies:
1. Agent MUST reject the request immediately
2. Agent MUST explain the compliance and safety risks
3. Agent MUST direct user to the correct workflow
4. Agent MUST NOT proceed with manual taxonomy creation or custom tag invention

Example rejection for CLI circumvention:
```
❌ Cannot create tags manually through API - this bypasses compliance safeguards.

✅ Use: bun run Tools/RecordManager.ts sync-taxonomies --country Australia

This ensures:
- Atomic transactions with rollback
- Retention change approval workflow
- Audit trail logging
- TaxonomyExpert validation
```

Example rejection for inventing tags:
```
❌ Cannot create custom tag "important-2024" - tag not defined in TaxonomyExpert.

The tag must first be added to src/skills/RecordsManager/Config/taxonomies.yaml under the appropriate category, then synchronized using:

✅ bun run Tools/RecordManager.ts sync-taxonomies --country Australia

This ensures:
- All tags are defined in single source of truth
- Compliance with country-specific taxonomies
- Retention rules are properly associated
- No orphaned or undefined tags
```

## Error Scenarios

### Scenario 1: Retention Change Without Approval
**Error**: "Retention rule changes detected. Manual review required."
**Resolution**: User runs with `--approve-retention-changes` flag

### Scenario 2: Network Failure During Update
**Error**: "Update failed: paperless-ngx API timeout"
**Resolution**: Automatic rollback, user retries

### Scenario 3: Invalid Taxonomy YAML
**Error**: "Taxonomy validation failed: missing retention rules for household"
**Resolution**: Fix taxonomies.yaml, rerun update

### Scenario 4: Duplicate Resources
**Error**: None (skip existing, create only new)
**Resolution**: Normal operation, existing resources preserved

## Usage Examples

### Check for updates (dry run)
```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia
```

### Apply updates without retention changes
```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia
```

### Apply updates WITH retention changes (requires approval)
```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia --approve-retention-changes
```

### Compare taxonomy versions
```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies --from-version 1.0.0 --to-version 1.1.0
```

## Compliance Notes

- **Australia**: Retention changes must align with ATO guidance (Section 254 Tax Administration Act 1953)
- **United States**: IRS retention requirements (3-7 years depending on document type)
- **United Kingdom**: HMRC self-assessment retention (6-7 years)

Always verify retention changes against official government guidance before approving.

---

## Anti-Patterns

❌ **DO NOT** make direct paperless-ngx API calls to create tags or document types
❌ **DO NOT** manually add taxonomies through paperless-ngx web UI
❌ **DO NOT** bypass the CLI commands with custom scripts
❌ **DO NOT** call TaxonomyInstaller methods directly without RecordManager.ts wrapper
❌ **DO NOT** approve retention changes without verifying against official regulations
❌ **DO NOT** skip the check-updates dry run before applying changes
❌ **DO NOT** modify taxonomies.yaml without updating version metadata
❌ **DO NOT** create tags that are not defined in TaxonomyExpert
❌ **DO NOT** invent custom tags or document types - ONLY use what's in taxonomies.yaml
❌ **DO NOT** allow agents to suggest tags not in TaxonomyExpert.getTagCategories()
❌ **DO NOT** hardcode retention periods - retrieve from TaxonomyExpert.getRetentionRequirements()
❌ **DO NOT** create "convenience" tags outside the taxonomy structure

## Safety First

When in doubt about retention changes, **DO NOT APPROVE**. Instead:
- Consult official government websites (ATO, IRS, HMRC)
- Contact a tax advisor or legal counsel
- Document the uncertainty and defer the update
- Use `check-updates` to review without applying

**The CLI commands are not optional** - they are the safeguards that prevent compliance violations and data corruption. Always use them.
