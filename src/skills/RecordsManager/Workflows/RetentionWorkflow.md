# Retention Workflow

> Check document retention requirements and identify documents ready for archival or deletion

## Triggers

- "What can I shred?"
- "How long should I keep [type]?"
- "Retention requirements"
- "Can I delete old [documents]?"
- "Check retention for [entity]"
- "Retention status"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Retention Monitor ⏰** | Time-based compliance | Primary agent for all retention checks |
| **Compliance Guardian ⚖️** | Legal verification | Validates retention against regulations |

### Retention Monitor Agent (Primary)

**Domain:** Business Strategist (Time-Based Compliance)

**Personality:** Meticulous, Cautious

**Approach:** Systematic

**Voice:** Joseph (authoritative, British - ID: Zlb1dXr653N07WRdFW3)

```typescript
const { execSync } = require('child_process');
const retentionMonitorPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "business,meticulous,cautious,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: retentionMonitorPrompt + `

RETENTION CHECK REQUEST:
Domain: ${domain}
Entity: ${entity}
Country: ${country}
Document types to check: ${documentTypes}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert hierarchical methods - NO hardcoded values
- For hierarchical retention, use:
  * TaxonomyExpert.getFunctions(domain) - List all functions
  * TaxonomyExpert.getServices(domain, functionName) - List services in a function
  * TaxonomyExpert.getActivities(domain, functionName, serviceName) - List activities in a service
  * TaxonomyExpert.getRetentionForActivity(domain, functionName, serviceName, activityName) - Get country-specific retention rules
- Include legal citations from TaxonomyExpert in all retention recommendations
- Use country-specific retention rules (AU, US, UK) with regulatory references
- Note fromDate field: 'fy_end' (financial year end), 'fte_date' (Family Trust Election), 'creation' (document creation)

Your task:
1. Navigate hierarchy: getFunctions() → getServices() → getActivities()
2. For each activity, get retention from getRetentionForActivity()
3. Extract country-specific retention: retention.AU, retention.US, or retention.UK
4. Check for special fromDate rules (fy_end, fte_date) that affect calculation
5. Calculate retention end dates based on fromDate and retention period
6. Identify documents PAST retention period (safe to delete)
7. Identify documents WITHIN retention period (must keep) with legal citation
8. Flag documents with special retention (FTE dates, permanent retention: years=0)
9. Generate retention compliance summary with TaxonomyExpert citations

Return: {
  readyForDeletion: [{ id, type, function, service, activity, retainedUntil, reason }],
  mustRetain: [{ id, type, function, service, activity, retainedUntil, daysLeft, reason }],
  specialRetention: [{ id, type, function, service, activity, specialRule, explanation }],
  complianceSummary
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Compliance Guardian Agent (For Legal Verification)

```typescript
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `

RETENTION LEGAL REVIEW:
Country: ${country}
Domain: ${domain}
Document types: ${documentTypes}
Proposed for deletion: ${proposedDeletions}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert.getRetentionForActivity() hierarchical methods
- Verify retention periods match TaxonomyExpert legal citations for each country
- DO NOT use independent retention calculations - validate against TaxonomyExpert
- Include regulatory references from TaxonomyExpert in approval (ATO, IRS, HMRC)
- Check for special fromDate rules that affect retention calculation
- Validate permanent retention (years: 0) is not proposed for deletion

Your task:
1. For each document, navigate hierarchy to find the activity
2. Get retention from getRetentionForActivity() for the specific country
3. Verify retention requirements match current regulations per TaxonomyExpert citations
4. Check for any legal holds or litigation requirements beyond base retention
5. Validate ATO/IRS/HMRC compliance using TaxonomyExpert legal authority references
6. Confirm fromDate calculations are correct (fy_end, fte_date, creation)
7. Confirm no regulatory violations with legal references from TaxonomyExpert
8. Reject any deletion proposals for documents with permanent retention (years: 0)

Return: { approved: boolean, warnings: [], legalHolds: [], citations: [], rejected: [] }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Determine Scope

Ask user what to check:
- Specific document type
- Entire domain (household/corporate/trust)
- Specific entity
- All documents

### Step 2: Fetch Retention Rules

**Retention Monitor agent retrieves requirements:**

```typescript
// Get retention requirements from TaxonomyExpert
const requirements = taxonomyExpert.getRetentionRequirements(documentType, domain);
// Returns: { years: 7, reason: "ATO requirement - Section 254" }
```

### Step 3: Analyze Documents

For each document:
1. Get creation/received date
2. Get document type
3. Look up retention period
4. Calculate "retain until" date
5. Compare to today's date

### Step 4: Present Retention Summary

```
📊 Retention Analysis for Household Domain

Country: Australia
Analysis date: 2026-01-19

READY FOR DELETION (Past Retention):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID    | Type              | Created    | Retained Until | Status
#101  | Tax Return        | 2017-07-15 | 2024-07-15    | ✅ Past retention
#102  | Bank Statement    | 2018-03-01 | 2023-03-01    | ✅ Past retention
#103  | Utility Bill      | 2022-06-15 | 2024-06-15    | ✅ Past retention

Total: 3 documents ready for deletion

MUST RETAIN (Within Retention Period):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID    | Type              | Created    | Retain Until   | Days Left
#201  | Tax Return        | 2023-07-15 | 2030-07-15    | 1,639 days
#202  | Insurance Policy  | 2024-01-01 | 2034-01-01    | 2,904 days
#203  | Medical Receipt   | 2024-06-15 | 2031-06-15    | 1,974 days

Total: 3 documents must be retained

⚠️  SPECIAL RETENTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#301  | Family Trust Election | 2020-02-01 | 2025-02-01 | 13 days
      Reason: FTE retention is 5 years from FTE date (not EOFY)
      Reference: Section 272-80 ITAA 1936

To proceed with deletion, use: /delete-confirmation
```

### Step 5: Generate Compliance Report (Optional)

**Compliance Guardian agent validates:**

```
📋 Compliance Verification Report

Generated: 2026-01-19
Domain: Household
Country: Australia

✅ COMPLIANT: All retention rules verified against:
  • ATO Tax Administration Act 1953
  • Australian Consumer Law
  • State contract limitations

⚠️  WARNINGS:
  • Family Trust Election (#301) approaches retention end date
  • Recommend archival before deletion

📜 CITATIONS:
  • Tax documents: Section 254, Tax Administration Act 1953
  • Insurance: 10 years per industry standard
  • FTE: Section 272-80, ITAA 1936
```

## Retention Rules by Document Type

### Household (Australia)

| Document Type | Retention | Reason |
|--------------|-----------|--------|
| Tax Return | 7 years | ATO requirement |
| Medical Receipt | 7 years | Tax deduction substantiation |
| Insurance Policy | 10 years | Until expired + claims period |
| Bank Statement | 5 years | ATO evidence |
| Utility Bill | 2 years | Proof of address |
| Contract | 10 years | Statute of limitations |

### Trust (Australia)

| Document Type | Retention | Reason |
|--------------|-----------|--------|
| Trust Deed | 15 years | Permanent trust record |
| Family Trust Election | 5 years from FTE date | Section 272-80 ITAA 1936 |
| Trustee Resolution | 7 years | ATO distribution substantiation |
| Tax Return | 7 years | ATO requirement |
| Distribution Minutes | 7 years | ATO evidence |

## CLI Integration

```bash
# Check retention for domain
bun run Tools/RecordManager.ts retention --domain household

# Check retention for specific entity
bun run Tools/RecordManager.ts retention --entity smith-family-trust

# Check specific document type
bun run Tools/RecordManager.ts retention --type "Tax Return"

# Generate compliance report
bun run Tools/RecordManager.ts retention --report --domain corporate
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Unknown document type | Check TaxonomyExpert for valid types |
| Missing creation date | Documents need dates for retention calculation |
| Country not supported | Currently supports AU, US, UK |

## Related Workflows

- `DeleteConfirmation.md` - **REQUIRED** before any deletion (uses Deletion Auditor)
- `TrustValidation.md` - Validate trust documents (uses Compliance Guardian)
- `SearchWorkflow.md` - Find documents by retention status
