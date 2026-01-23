# Delete Confirmation Workflow

> **CRITICAL SAFEGUARD:** This workflow MUST be used for ALL deletion operations. Direct API deletion is disabled to prevent catastrophic data loss.

## Purpose

Ensure that document deletion is intentional, understood, and approved by the principal. This workflow:
1. Explains what will be deleted
2. Describes consequences
3. Requires explicit confirmation
4. Logs the decision for audit trail

## Agents Used (MANDATORY)

This workflow **REQUIRES** the Deletion Auditor agent from `AGENTS.md`:

| Agent | Role | Why Mandatory |
|-------|------|---------------|
| **Deletion Auditor 🛡️** | Risk assessment & safety checkpoint | CRITICAL - Must review ALL deletions before execution |
| **Compliance Guardian ⚖️** | Retention verification | Validates documents are past retention period |
| **Retention Monitor ⏰** | Time-based compliance | Checks retention deadlines before deletion |

### Deletion Auditor Agent (MANDATORY)

**Domain:** Security Expert + Communications (Risk Assessment & Safety)

**Personality:** Skeptical, Cautious

**Approach:** Adversarial, Exhaustive

**Voice:** George (Warm, academic, intellectual - ID: JBFqnCBsd6RMkjVDRZzb)

```typescript
const { execSync } = require('child_process');
const deletionAuditorPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "security,skeptical,cautious,adversarial"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: deletionAuditorPrompt + `

DELETION REVIEW REQUEST:
Documents proposed for deletion: ${documentCount}
Search criteria: ${searchCriteria}
Document IDs: ${documentIds.join(', ')}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert.getRetentionRequirements()
- DO NOT hardcode retention periods - retrieve from TaxonomyExpert for each document type
- Use country-specific retention rules with legal citations

Your task:
1. Review each document for deletion safety
2. For each document, get retention from TaxonomyExpert.getRetentionRequirements(documentType, domain)
3. Verify document is PAST retention period before approving deletion
4. Identify ANY risks with this deletion
5. Stress-test the deletion request (adversarial approach)
6. Provide explicit recommendation: APPROVE or REJECT with retention verification

Be SKEPTICAL. When in doubt, REJECT.
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Compliance Guardian Agent (Supporting)

For retention period verification:

```typescript
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `

RETENTION COMPLIANCE CHECK:
Documents: ${documentIds.join(', ')}
Document types: ${documentTypes.join(', ')}
Country: ${country}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention periods MUST come from TaxonomyExpert.getRetentionRequirements(documentType, domain)
- DO NOT use hardcoded retention periods
- Cite legal reasons from TaxonomyExpert for each retention requirement

Your task:
1. For each document type, get retention from TaxonomyExpert.getRetentionRequirements()
2. Verify each document is PAST its retention period
3. Flag any documents still within retention with legal citation from TaxonomyExpert
4. Recommend REJECT for any documents within retention period
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## When to Use

Trigger this workflow when:
- User asks to delete documents
- User asks to remove old records
- User asks to clean up or purge documents
- ANY deletion intent is detected

## Process

### Step 1: Describe Deletion Scope

```bash
# Show what will be deleted
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts search --query "<search_criteria>"
```

For each document:
- Show document ID, title, created date
- Show tags and document type
- Check retention requirements
- Warn if retention period not met

### Step 2: Explain Consequences

Inform the principal:
1. **Deletion is permanent** - paperless-ngx does not have an undo function
2. **Backup status** - Are these documents backed up elsewhere?
3. **Retention warning** - Are any documents still within retention period?
4. **Search impact** - Deleting these may affect future searches

### Step 3: Require Explicit Confirmation

Ask the principal to type:

```
I understand this cannot be undone and I want to proceed with deleting N documents
```

**Accept ONLY this exact phrasing.** Do not accept "yes", "proceed", "do it", or similar.

### Step 4: Execute Deletion (If Approved)

**Only after explicit confirmation:**

```typescript
// Execute deletion via paperless-ngx API
// Note: This is the ONLY place where deletion API calls are made
const response = await fetch(`${process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL}/api/documents/${id}/`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Token ${process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN}`,
  },
});
```

### Step 5: Log Decision

Append to `$PAI_DIR/MEMORY/deletions.log`:

```json
{
  "timestamp": "2026-01-17T12:00:00Z",
  "principal": "{principal.name}",
  "documents_deleted": N,
  "search_criteria": "<criteria>",
  "confirmation": "EXPLICIT",
  "retention_warnings": ["doc 123 within retention period"]
}
```

## Example Execution

```
AI: You've asked to delete 12 documents with tag "insurance" from before 2020.

    Here's what will be deleted:
    [45] Home Insurance Policy - State Farm (2018-05-15)
    [46] Car Insurance Policy - Geico (2019-03-22)
    ...

    ⚠️  RETENTION WARNING: Some documents may still be within retention period
    ⚠️  DELETION IS PERMANENT - No undo function available

    To proceed, type: "I understand this cannot be undone and I want to proceed with deleting 12 documents"

Principal: I understand this cannot be undone and I want to proceed with deleting 12 documents

AI: ✓ Deleting 12 documents...
    ✓ Decision logged to $PAI_DIR/MEMORY/deletions.log
```

## Anti-Patterns

❌ **DO NOT** delete without showing document details
❌ **DO NOT** accept casual confirmation like "yes" or "ok"
❌ **DO NOT** skip retention warnings
❌ **DO NOT** bypass this workflow for "batch" deletions
❌ **DO NOT** delete documents that are within retention period without explicit warning

## Safety First

When in doubt, **DO NOT DELETE**. Suggest:
- Moving to archive storage instead
- Adding "do_not_delete" tag to important documents
- Creating a backup before deletion
- Reviewing documents individually before batch deletion
