# Workflow Creator Workflow

> Analyze document patterns and create automated paperless-ngx workflows

## Triggers

- "Create a workflow for [documents]"
- "Automate tagging of [pattern]"
- "Recommend workflow for [entity]"
- "Set up auto-classification"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Archive Architect 🏛️** | Workflow design & optimization | Primary agent for workflow creation |
| **Records Keeper 📋** | Pattern analysis | Analyzes document patterns for matching rules |

### Archive Architect Agent (Primary)

**Domain:** Data Analyst + Research Specialist (Storage & Retrieval Strategy)

**Personality:** Analytical, Pragmatic

**Approach:** Synthesizing, Thorough

**Voice:** Charlotte (Sophisticated, intellectual, precise - ID: XB0fDUnXU5powFXDhCwa)

```typescript
const { execSync } = require('child_process');
const archiveArchitectPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: archiveArchitectPrompt + `

WORKFLOW DESIGN REQUEST:
Entity: ${entity}
Sample documents: ${sampleDocuments}
Current tags: ${existingTags}
Document patterns observed: ${patterns}

Your task:
1. Analyze document naming patterns and content
2. Design paperless-ngx workflow matching rules
3. Determine optimal tag assignments
4. Configure storage path routing
5. Set document type auto-classification
6. Calculate expected match rate
7. Generate workflow configuration

Return: {
  workflowName,
  matchingPattern,
  assignedTags,
  documentType,
  storagePath,
  correspondent,
  confidence,
  expectedMatchRate,
  testResults
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Records Keeper Agent (For Pattern Analysis)

```typescript
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

PATTERN ANALYSIS REQUEST:
Documents to analyze: ${documentIds}
Entity: ${entity}

Analyze filename patterns, content patterns, and existing tags.
Identify common patterns that could be used for automated matching.
Return: { filenamePatterns, contentPatterns, commonTags, anomalies }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Gather Sample Documents

Ask user for:
- Entity or document collection to analyze
- Sample documents (IDs or search criteria)
- Desired automation outcome

### Step 2: Analyze Document Patterns

**Records Keeper agent analyzes:**

1. **Filename patterns:**
   - Common prefixes (INV-, STMT-, etc.)
   - Date formats in filenames
   - Entity name patterns

2. **Content patterns:**
   - Header text
   - Recurring phrases
   - Document structure

3. **Existing tags:**
   - Most common tags
   - Missing tags that should be applied

### Step 3: Design Workflow

**Archive Architect agent designs:**

```
📐 Workflow Design Analysis

Entity: Smith Family Trust
Documents analyzed: 47
Pattern confidence: HIGH (92%)

PROPOSED WORKFLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: Smith Family Trust Auto-Tag

Matching Pattern:
  Filename: .*Smith.*Trust|Family.*Trust.*Smith.*
  Content: "Smith Family Trust" OR "ABN 12 345 678 901"

Assignments:
  • Tag: entity:family-trust-smith-family-trust-2024
  • Tag: trust
  • Tag: family-trust
  • Storage Path: /Trusts/Family Trusts/Smith Family Trust
  • Document Type: Auto-detect from content

Match Analysis:
  • 45/47 sample documents would match (96%)
  • 2 documents have non-standard naming

Confidence: HIGH
Reasoning: Strong pattern consistency across document collection
```

### Step 4: Test Workflow

**Before deployment, test against sample documents:**

```
🧪 Workflow Test Results

Testing "Smith Family Trust Auto-Tag" against 47 documents...

✅ MATCHES (45):
  #1001 Trust_Deed_Smith_Family.pdf → Matched (filename)
  #1002 FTE_Smith_Family_Trust_2020.pdf → Matched (filename)
  #1003 ATO_Assessment_Notice.pdf → Matched (content: ABN)
  ...

⚠️  FALSE NEGATIVES (2):
  #1045 scan_20240115.pdf → No match (generic filename)
  #1046 Document_2024.pdf → No match (generic filename)

  Recommendation: Manually tag these 2 documents

❌ FALSE POSITIVES (0):
  None detected

MATCH RATE: 96% (45/47)
RECOMMENDATION: ✅ Deploy workflow
```

### Step 5: Deploy Workflow

**After user approval:**

```typescript
// Create workflow in paperless-ngx
const workflow = await paperlessClient.createWorkflow({
  name: "Smith Family Trust Auto-Tag",
  order: 1,
  triggers: [
    {
      type: "consumption",
      matching_pattern: ".*Smith.*Trust|Family.*Trust.*Smith.*",
      match_type: "regex"
    }
  ],
  actions: [
    {
      type: "assign_tags",
      tags: [entityTagId, trustTagId, familyTrustTagId]
    },
    {
      type: "assign_storage_path",
      storage_path: storagePathId
    }
  ]
});
```

### Step 6: Confirm Deployment

```
✅ Workflow Created Successfully

Workflow: Smith Family Trust Auto-Tag
ID: #15
Status: Active

The workflow will automatically:
  • Match documents containing "Smith.*Trust" pattern
  • Apply tags: entity:family-trust-smith-family-trust-2024, trust, family-trust
  • Route to: /Trusts/Family Trusts/Smith Family Trust

Test the workflow by uploading a new document matching the pattern.
```

## Workflow Configuration Options

### Matching Types

| Type | Example | Use Case |
|------|---------|----------|
| `filename_contains` | "Invoice" | Simple keyword matching |
| `filename_regex` | `INV-\d{4}-\d{3}` | Complex patterns |
| `content_contains` | "Smith Family Trust" | Content-based matching |
| `content_regex` | `ABN\s*\d{11}` | Pattern in content |

### Actions

| Action | Description |
|--------|-------------|
| `assign_tags` | Apply one or more tags |
| `assign_document_type` | Set document type |
| `assign_storage_path` | Route to storage path |
| `assign_correspondent` | Set correspondent |

## CLI Integration

```bash
# Analyze patterns for entity
bun run Tools/RecordManager.ts workflow analyze --entity smith-family-trust

# Create workflow from analysis
bun run Tools/RecordManager.ts workflow create --entity smith-family-trust

# Test workflow against documents
bun run Tools/RecordManager.ts workflow test --id 15 --sample 50

# List all workflows
bun run Tools/RecordManager.ts workflow list

# Review workflow effectiveness
bun run Tools/RecordManager.ts workflow review --id 15
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Low confidence pattern | Gather more sample documents |
| High false positive rate | Tighten matching pattern |
| High false negative rate | Broaden matching or add content match |
| Workflow creation failed | Check paperless-ngx permissions |

## Related Workflows

- `WorkflowReview.md` - Review existing workflow effectiveness (uses Archive Architect)
- `UploadWorkflow.md` - Test workflows with new uploads (uses Sensitivity Scanner)
- `OrganizeWorkflow.md` - Manual organization for non-matching documents (uses Records Keeper)
