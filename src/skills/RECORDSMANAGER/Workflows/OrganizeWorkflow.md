# Organize Workflow

> Reorganize and improve document taxonomy for better findability and compliance

## Triggers

- "Organize my documents"
- "Improve document organization"
- "Clean up tags"
- "Reorganize [entity/domain]"
- "Fix document structure"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Records Keeper 📋** | Taxonomy optimization | Primary agent for organization analysis and improvement |
| **Archive Architect 🏛️** | Strategic restructuring | Large-scale reorganization across multiple entities |

### Records Keeper Agent (Primary)

**Domain:** Research Specialist (Data Organization & Classification)

**Personality:** Meticulous, Analytical, Systematic

**Approach:** Thorough, Systematic

**Voice:** Drew (Professional, balanced - ID: 29vD33N1CtxCmqQRPOHJ)

```typescript
const { execSync } = require('child_process');
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

ORGANIZATION ANALYSIS REQUEST:
Domain: ${domain}
Entity: ${entity}
Country: ${country}
Document count: ${documentCount}
Current tags: ${existingTags}

Your task:
1. Analyze current document organization
2. Identify taxonomy gaps and inconsistencies
3. Suggest tag hierarchy improvements
4. Recommend document type corrections
5. Propose naming convention standards
6. Calculate organization score (0-100)
7. Generate improvement plan

Return: {
  currentStructure,
  issues: [],
  proposedTags: [],
  tagHierarchy: {},
  documentTypeChanges: [],
  namingStandards: {},
  organizationScore,
  improvementPlan: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Archive Architect Agent (For Large-Scale Restructuring)

```typescript
const archiveArchitectPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: archiveArchitectPrompt + `

LARGE-SCALE REORGANIZATION REQUEST:
Domains: ${domains}
Total documents: ${totalDocuments}
Current structure: ${currentStructure}

Your task:
1. Design comprehensive organization architecture
2. Plan cross-domain tag standardization
3. Create storage path strategy
4. Design workflow automation for ongoing maintenance
5. Estimate migration effort and risk

Return: {
  architecturePlan,
  tagStandardization: {},
  storagePathStrategy: {},
  automationWorkflows: [],
  migrationPlan: {},
  riskAssessment
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Analyze Current State

```bash
# Get all tags in domain
bun run Tools/RecordManager.ts tags list --domain ${domain}

# Get document distribution
bun run Tools/RecordManager.ts stats --domain ${domain}
```

### Step 2: Records Keeper Analysis

**Agent identifies:**
1. Orphaned tags (tags with no documents)
2. Inconsistent tagging patterns
3. Missing required tags
4. Duplicate or similar tags
5. Documents without proper categorization

### Step 3: Present Organization Report

```
📁 Organization Analysis Report

Domain: Household
Documents analyzed: 234
Current tags: 45

ORGANIZATION SCORE: 67/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 ISSUES FOUND:

Tag Issues:
  ⚠️  5 orphaned tags (no documents)
  ⚠️  3 duplicate tag pairs detected
  ⚠️  12 documents missing domain tag

Hierarchy Issues:
  ⚠️  Year tags inconsistent (2024 vs FY2024)
  ⚠️  Entity tags not following convention

Document Types:
  ⚠️  8 documents with incorrect type
  ⚠️  15 documents with no type assigned

📋 PROPOSED IMPROVEMENTS:

1. Merge duplicate tags:
   • "tax-return" + "tax-returns" → "tax-return"
   • "bank-stmt" + "bank-statement" → "bank-statement"
   • "ins" + "insurance" → "insurance"

2. Standardize year tags:
   • Convert all "FY2024" → "2024"
   • Add missing year tags to 23 documents

3. Apply missing domain tags:
   • Add "household" to 12 documents

4. Fix document types:
   • 8 documents need type correction
   • 15 documents need type assignment

5. Remove orphaned tags:
   • Delete 5 unused tags

Apply these improvements? (yes/no/selective)
```

### Step 4: Apply Improvements (With Confirmation)

```typescript
// Apply tag changes
if (userApproves('tags')) {
  // Merge duplicate tags
  for (const merge of tagMerges) {
    await paperlessClient.mergeTags(merge.from, merge.to);
  }

  // Apply missing tags
  for (const doc of missingTagDocs) {
    await paperlessClient.updateDocument(doc.id, {
      tags: [...doc.tags, ...missingTags]
    });
  }

  // Delete orphaned tags
  for (const tag of orphanedTags) {
    await paperlessClient.deleteTag(tag.id);
  }
}
```

### Step 5: Confirm Changes

```
✅ Organization improvements applied

Changes made:
  • Merged 3 duplicate tag pairs
  • Added domain tags to 12 documents
  • Standardized 23 year tags
  • Corrected 8 document types
  • Assigned types to 15 documents
  • Removed 5 orphaned tags

NEW ORGANIZATION SCORE: 89/100 (+22 improvement)

Recommended follow-up:
  • Create workflow for auto-tagging new uploads
  • Review remaining 15 untyped documents manually
```

## Organization Patterns

### Tag Hierarchy Standards

```
Domain Level:
└── household | corporate | trust

Category Level:
├── financial
│   ├── tax
│   ├── banking
│   └── insurance
├── legal
│   ├── contracts
│   └── compliance
├── medical
└── administrative

Entity Level:
└── entity:{type}-{name}-{year}

Time Level:
└── {year} (e.g., 2024, 2025)
```

### Naming Conventions

| Document Type | Convention | Example |
|--------------|------------|---------|
| Tax Return | `{year}_Tax_Return_{entity}` | `2024_Tax_Return_Personal` |
| Bank Statement | `{bank}_{account}_Statement_{date}` | `NAB_Savings_Statement_202401` |
| Invoice | `INV_{vendor}_{date}_{amount}` | `INV_Telstra_20240115_89.95` |
| Receipt | `REC_{vendor}_{date}_{category}` | `REC_Pharmacy_20240320_Medical` |

## CLI Integration

```bash
# Analyze organization
bun run Tools/RecordManager.ts organize --domain household --analyze

# Apply improvements
bun run Tools/RecordManager.ts organize --domain household --apply

# Organize specific entity
bun run Tools/RecordManager.ts organize --entity smith-family-trust

# Preview changes without applying
bun run Tools/RecordManager.ts organize --domain household --dry-run

# Generate organization report
bun run Tools/RecordManager.ts organize --domain household --report
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Tag merge conflict | Review manually, choose primary tag |
| Protected tag | Cannot modify system-required tags |
| Bulk update limit | Process in batches of 50 |

## Related Workflows

- `TagWorkflow.md` - Add/modify individual tags (uses Records Keeper)
- `SearchWorkflow.md` - Find documents to organize (uses Records Keeper)
- `WorkflowCreator.md` - Automate organization (uses Archive Architect)
- `EntityAudit.md` - Full entity health check (uses all agents)
