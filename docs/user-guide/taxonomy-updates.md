# Taxonomy Updates & Synchronization

This guide explains how to keep your taxonomies up to date with the latest regulatory requirements and taxonomy definitions.

## Overview

The Records Manager skill includes country-specific taxonomies that evolve over time. As regulations change (e.g., ATO updates retention periods from 5 to 7 years), you need a safe way to update your paperless-ngx instance without losing existing customizations.

**The update workflow provides:**

* **Change Detection**: See what's new before applying updates
* **Manual Review**: Explicit approval required for retention rule changes
* **Atomic Updates**: Rollback on failure prevents partial state
* **Preservation**: Existing user customizations are never overwritten

---

## When to Update Taxonomies

Update your taxonomies when:

1. **Regulatory Changes**: Tax authorities update retention requirements
2. **New Document Types**: Skill adds support for new document types
3. **New Tags**: New classification tags become available
4. **Country Expansion**: New countries or entity types added

**Recommendation**: Check for updates quarterly or after major skill version updates.

---

## Update Workflow

### Step 1: Check for Updates

Before applying any changes, check what's available:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia
```

**Output Example:**

```
🔍 Checking for taxonomy updates for Australia...

📊 Changes detected:

📌 New Tags (3):
   • pet (household)
   • vaccination (household)
   • microchip (household)

📄 New Document Types (5):
   • Pet Vaccination Record (household)
   • Pet Medical Record (household)
   • Pet Insurance Policy (household)
   • Pet Microchip Registration (household)
   • Pet Registration (household)

⚠️  Retention Rule Changes (1) - REQUIRES MANUAL REVIEW:
   • Tax Return (household)
     Old: 5 years - Previous ATO guidance
     New: 7 years - ATO Section 254 of Tax Administration Act 1953

⚠️  Run with --approve-retention-changes to apply these updates
```

This is a **dry run** - nothing is changed in your paperless-ngx instance.

---

### Step 2: Review Changes

Pay special attention to:

**Retention Rule Changes** ⚠️

* **Impact**: May affect deletion policies for existing documents
* **Compliance**: Verify changes align with latest official regulations
* **Legal Review**: Consult with tax advisor if unsure

**Example Scenario:**

```
Tax Return retention changed from 5 to 7 years:
  Old: "Previous ATO guidance"
  New: "ATO Section 254 of Tax Administration Act 1953"

Action Required:
  ✅ Verify this matches current ATO website guidance
  ✅ Check if you have any Tax Returns older than 5 years
  ✅ Update your deletion review process
  ⚠️  DO NOT approve if uncertain about regulatory compliance
```

---

### Step 3: Apply Updates

#### Scenario A: No Retention Changes

If only tags/document types/paths are new:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia
```

Updates apply automatically with no additional approval needed.

#### Scenario B: Retention Changes Detected

If retention rules changed, explicit approval is **required**:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia --approve-retention-changes
```

**Warning**: Only use `--approve-retention-changes` after verifying regulatory compliance.

---

### Step 4: Verify Results

After applying updates, verify:

```bash
# Check taxonomy version
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies

# Verify new tags exist
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --tags "pet"

# Test new document types
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain household
```

---

## Version History

View taxonomy version history and all changes:

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies
```

**Output:**

```
📋 Taxonomy Version History

Current Version: 1.1.0
Last Updated: 2026-01-22

📜 Changelog:

Version 1.1.0 (2026-01-22)
   • Added Pet documents to household domain
   • Updated Tax Return retention from 5 to 7 years (ATO)
   • Added medical records category for family-trust domain

Version 1.0.0 (2026-01-01)
   • Initial taxonomy definitions for Australia, United States, United Kingdom
   • Complete household, corporate, and trust domain taxonomies
   • Country-specific retention rules with legal citations
```

---

## Safety Features

### Atomic Transactions

All updates use atomic transactions:

```
1. Detect changes
2. Begin transaction
3. Create tags → Create document types → Create storage paths → Create custom fields
4. Commit transaction

If ANY step fails: Rollback ALL changes
```

**Result**: Your paperless-ngx instance is never left in a partial state.

---

### Preservation of Customizations

The update process **never overwrites** existing resources:

* **Existing Tags**: Skipped (keeps your custom colors, matching rules)
* **Existing Document Types**: Skipped (preserves your modifications)
* **Existing Storage Paths**: Skipped (maintains your folder structure)
* **Existing Custom Fields**: Skipped (retains your field definitions)

**Only NEW resources are created.**

---

### Manual Review for Retention Changes

Retention rule changes require **explicit approval** because they affect:

* **Compliance**: Must align with current regulations
* **Deletion Policies**: May extend or shorten retention periods
* **Existing Documents**: Could change when documents can be deleted

**The system forces you to review and approve these changes separately.**

---

## Common Scenarios

### Scenario 1: Regular Quarterly Update

**Goal**: Stay current with taxonomy improvements

```bash
# 1. Check what's new
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates

# 2. Review output (no retention changes)

# 3. Apply updates
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies

# 4. Verify version
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies
```

**Frequency**: Quarterly or after skill version updates

---

### Scenario 2: Regulatory Update (e.g., ATO Changes)

**Goal**: Update retention rules to comply with new ATO guidance

```bash
# 1. Check for updates
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates

# 2. Review retention changes
#    ⚠️  Tax Return: 5 years → 7 years (ATO Section 254)

# 3. Verify against official ATO website
#    ✅ Confirmed: https://www.ato.gov.au/general/keeping-records/

# 4. Apply with explicit approval
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --approve-retention-changes

# 5. Update deletion review processes
#    • Extend deletion review for Tax Returns to 7 years
#    • Update workflow documentation
```

**Frequency**: As needed when regulations change

---

### Scenario 3: After Skill Version Upgrade

**Goal**: Get new features from skill update

```bash
# 1. Pull latest skill version
git pull origin main

# 2. Check taxonomy changes
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates

# 3. Review new entity types, document types, tags

# 4. Apply updates
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies

# 5. Test new features
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload test-pet-vaccine.pdf --domain household
```

**Frequency**: After each skill version update

---

### Scenario 4: No Changes Available

**Goal**: Verify you're up to date

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates

# Output:
# ✅ No updates available - taxonomies are up to date
```

**Frequency**: Anytime you want to verify currency

---

## Troubleshooting

### Error: "Manual review required for retention changes"

**Cause**: Retention rules changed but `--approve-retention-changes` flag not provided

**Solution**:

```bash
# Review the changes first
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates

# After verifying compliance, approve
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --approve-retention-changes
```

---

### Error: "Update failed and was rolled back"

**Cause**: API error during update (network, permissions, etc.)

**Solution**:

1. Check paperless-ngx is running and accessible
2. Verify API token has write permissions
3. Check network connectivity
4. Retry the update

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status  # Verify connection
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies  # Retry
```

---

### Error: "No taxonomy metadata available"

**Cause**: taxonomies.yaml file missing metadata section

**Solution**: Ensure you're running the latest version of the skill with metadata support.

---

## Best Practices

1. **Check Before Applying**: Always run `check-updates` first to see what will change
2. **Read Retention Changes**: Never blindly approve retention changes - verify against official sources
3. **Quarterly Reviews**: Schedule quarterly taxonomy update checks
4. **Version Tracking**: Keep a log of when you update and what version you're on
5. **Test After Updates**: Verify new tags/document types work as expected
6. **Backup First**: Consider backing up your paperless-ngx database before major updates

---

## Related Documentation

* [CLI Reference](../reference/cli.md) - Complete command syntax
* [Extending Taxonomies](../extending/custom-taxonomies.md) - Custom taxonomy development
* [Retention Management](retention.md) - Understanding retention policies
* [Workflows](workflows.md) - Taxonomy update workflow integration

---

## Need Help?

* **Compliance Questions**: Consult your tax advisor or legal counsel
* **Technical Issues**: Check [Troubleshooting](../troubleshooting.md)
* **Feature Requests**: Open an issue on GitHub
* **Regulatory Updates**: Monitor official government websites (ATO, IRS, HMRC)
