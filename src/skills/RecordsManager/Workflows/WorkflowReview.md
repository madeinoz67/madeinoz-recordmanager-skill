# Workflow Review Workflow

> Review and optimize existing paperless-ngx automation workflows for effectiveness

## Triggers

- "Review workflow [id/name]"
- "How effective is my [workflow]?"
- "Workflow performance"
- "Optimize workflows"
- "Workflow health check"
- "Are my workflows working?"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Archive Architect 🏛️** | Workflow optimization | Primary agent for workflow analysis |
| **Records Keeper 📋** | Pattern analysis | Analyzes document matching patterns |

### Archive Architect Agent (Primary)

**Domain:** Data Analyst + Research Specialist (Storage & Retrieval Strategy)

**Personality:** Analytical, Pragmatic

**Approach:** Synthesizing, Thorough

**Voice:** Charlotte (Sophisticated, intellectual - ID: XB0fDUnXU5powFXDhCwa)

```typescript
const { execSync } = require('child_process');
const archiveArchitectPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: archiveArchitectPrompt + `

WORKFLOW EFFECTIVENESS REVIEW:
Workflow ID: ${workflowId}
Workflow name: ${workflowName}
Matching pattern: ${matchingPattern}
Match type: ${matchType}
Actions: ${actions}
Created: ${createdDate}
Documents processed: ${processedCount}
Domain: ${domain}
Country: ${country}

Recent activity (last 30 days):
- Documents matched: ${matchedCount}
- Documents missed: ${missedCount}
- False positives: ${falsePositiveCount}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL action improvements MUST use tags from TaxonomyExpert.getTagCategories(domain)
- ALL document type recommendations MUST come from TaxonomyExpert.getDocumentTypes(domain)
- DO NOT suggest tags or document types not in TaxonomyExpert
- Use TaxonomyExpert as single source of truth

Your task:
1. Calculate workflow effectiveness metrics
2. Analyze pattern matching accuracy
3. Identify false positive patterns
4. Identify false negative patterns
5. Suggest pattern optimizations
6. Recommend action improvements using TaxonomyExpert ONLY
7. Generate optimization plan

Return: {
  effectivenessScore,
  matchRate,
  falsePositiveRate,
  falseNegativeRate,
  patternIssues: [],
  actionIssues: [],
  optimizations: [],
  recommendedPattern,
  recommendedActions: []
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
Current pattern: ${currentPattern}
Match type: ${matchType}
Sample matched documents: ${matchedDocs}
Sample missed documents: ${missedDocs}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- Pattern improvements must not introduce tags not in TaxonomyExpert
- Use TaxonomyExpert as single source of truth
- Validate all suggested patterns against TaxonomyExpert.getTagCategories(domain)

Your task:
1. Analyze why matched documents matched
2. Analyze why missed documents didn't match
3. Identify common patterns in missed documents
4. Suggest pattern improvements
5. Test suggested pattern against samples
6. Ensure patterns only match documents appropriate for TaxonomyExpert tags

Return: {
  matchedPatterns: [],
  missedPatterns: [],
  suggestedPattern,
  expectedMatchRate,
  testResults: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: List Existing Workflows

```bash
bun run Tools/RecordManager.ts workflow list
```

```
📋 Paperless-ngx Workflows

ID  | Name                          | Status  | Match Rate | Last Run
----|-------------------------------|---------|------------|------------
#1  | Smith Family Trust Auto-Tag   | Active  | 94%        | 2 hours ago
#2  | Tax Receipts 2024             | Active  | 87%        | 1 day ago
#3  | Bank Statements               | Active  | 99%        | 3 hours ago
#4  | Old Insurance Workflow        | Paused  | 45%        | 30 days ago

Select workflow to review (ID or name):
```

### Step 2: Analyze Workflow

**Archive Architect agent performs deep analysis:**

```bash
bun run Tools/RecordManager.ts workflow review --id 2
```

```
📊 Workflow Effectiveness Review

Workflow: Tax Receipts 2024 (#2)
Status: Active
Created: 2024-01-15
Last modified: 2024-01-15

══════════════════════════════════════════════════
CONFIGURATION
══════════════════════════════════════════════════

Matching Pattern: .*receipt.*2024|2024.*receipt.*
Match Type: Regex (filename)

Actions:
  1. Assign tags: [receipt, tax, 2024]
  2. Assign document type: Receipt
  3. Assign storage path: /Household/Tax/2024

══════════════════════════════════════════════════
EFFECTIVENESS METRICS (Last 30 Days)
══════════════════════════════════════════════════

┌─────────────────────────────────────┐
│  EFFECTIVENESS SCORE: 87/100        │
│  Grade: B                           │
└─────────────────────────────────────┘

Documents processed: 156
  ✅ Correctly matched: 135 (87%)
  ⚠️  False negatives: 18 (11%)
  ❌ False positives: 3 (2%)

Match Rate: 87%
Precision: 98%
Recall: 88%

══════════════════════════════════════════════════
PATTERN ANALYSIS
══════════════════════════════════════════════════

📈 CORRECTLY MATCHED PATTERNS:
  • Receipt_Pharmacy_20240315.pdf ✅
  • 2024_Tax_Receipt_Medical.pdf ✅
  • receipt_grocery_2024.pdf ✅

❌ FALSE NEGATIVES (Missed - should have matched):
  • Medical_Rcpt_20240415.pdf - "Rcpt" not recognized
  • REC_Pharmacy_20240520.pdf - "REC" prefix not in pattern
  • Tax-deductible-receipt-2024.pdf - Hyphenated format

⚠️  FALSE POSITIVES (Matched incorrectly):
  • Receipt_Template_2024.docx - Template, not actual receipt
  • Old_Receipt_Archive_2024.zip - Archive file
  • Receipt_Process_2024.md - Documentation

══════════════════════════════════════════════════
OPTIMIZATIONS RECOMMENDED
══════════════════════════════════════════════════

🔧 PATTERN IMPROVEMENTS:

Current pattern:
  .*receipt.*2024|2024.*receipt.*

Recommended pattern:
  (?i)(receipt|rcpt|rec).*2024|2024.*(receipt|rcpt|rec)

Changes:
  + Added case-insensitive flag (?i)
  + Added "rcpt" and "rec" abbreviations
  + Pattern now matches more variations

Expected improvement:
  Match rate: 87% → 96%
  False negatives: 18 → 4

🔧 ACTION IMPROVEMENTS:

Add content-based matching:
  • Also match content containing "receipt" + "2024"
  • Catches documents with generic filenames

Add file type filter:
  • Exclude: .docx, .zip, .md (templates/archives)
  • Reduces false positives

══════════════════════════════════════════════════
TEST RESULTS (Proposed Pattern)
══════════════════════════════════════════════════

Testing new pattern against last 30 days...

Previously missed (now matched):
  ✅ Medical_Rcpt_20240415.pdf
  ✅ REC_Pharmacy_20240520.pdf
  ✅ Tax-deductible-receipt-2024.pdf
  ... +12 more

Previously false positive (now filtered):
  ✅ Receipt_Template_2024.docx - excluded by type
  ✅ Old_Receipt_Archive_2024.zip - excluded by type
  ✅ Receipt_Process_2024.md - excluded by type

New expected metrics:
  Match rate: 96%
  Precision: 99%
  Recall: 96%

Apply optimizations? (yes/no/test-more)
```

### Step 3: Apply Optimizations

```typescript
// Update workflow with optimized configuration
if (userApproves('optimize')) {
  await paperlessClient.updateWorkflow(workflowId, {
    triggers: [{
      type: "consumption",
      matching_pattern: "(?i)(receipt|rcpt|rec).*2024|2024.*(receipt|rcpt|rec)",
      match_type: "regex",
      filter_filename: "*.pdf|*.jpg|*.png", // Exclude non-documents
    }],
    actions: existingActions
  });
}
```

### Step 4: Confirm Changes

```
✅ Workflow optimized successfully

Workflow: Tax Receipts 2024 (#2)

Changes applied:
  • Pattern updated to include abbreviations
  • Case-insensitive matching enabled
  • File type filter added

Expected improvement:
  • Match rate: 87% → 96%
  • False positive rate: 2% → <1%

Monitor performance over next 7 days.
Schedule follow-up review for: 2026-01-26
```

## Effectiveness Metrics

### Match Rate
```
Match Rate = (Correctly Matched) / (Total Relevant Documents) × 100
```

### Precision
```
Precision = (True Positives) / (True Positives + False Positives) × 100
```

### Recall
```
Recall = (True Positives) / (True Positives + False Negatives) × 100
```

### Effectiveness Score
```
Effectiveness = (0.5 × Match Rate) + (0.3 × Precision) + (0.2 × Recall)
```

### Grade Scale
| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | Excellent - minimal optimization needed |
| 80-89 | B | Good - minor improvements possible |
| 70-79 | C | Satisfactory - review recommended |
| 60-69 | D | Poor - optimization required |
| 0-59 | F | Critical - workflow ineffective |

## CLI Integration

```bash
# List all workflows
bun run Tools/RecordManager.ts workflow list

# Review specific workflow
bun run Tools/RecordManager.ts workflow review --id 2

# Review all workflows
bun run Tools/RecordManager.ts workflow review --all

# Apply recommended optimizations
bun run Tools/RecordManager.ts workflow optimize --id 2

# Test pattern without applying
bun run Tools/RecordManager.ts workflow test --id 2 --pattern "new-pattern"

# Pause underperforming workflow
bun run Tools/RecordManager.ts workflow pause --id 4

# Generate workflow report
bun run Tools/RecordManager.ts workflow report --export pdf
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Workflow not found | Check workflow ID, verify it exists |
| No recent activity | Workflow may be paused or pattern too restrictive |
| Cannot update workflow | Check paperless-ngx permissions |
| Pattern syntax error | Validate regex before applying |

## Related Workflows

- `WorkflowCreator.md` - Create new workflows (uses Archive Architect)
- `OrganizeWorkflow.md` - Improve document organization (uses Records Keeper)
- `EntityAudit.md` - Full entity review including workflows (uses all agents)
