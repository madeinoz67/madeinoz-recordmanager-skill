# FTE Check Workflow

> Check Family Trust Election (FTE) status, retention requirements, and compliance for family trusts

## Triggers

- "Check FTE for [trust]"
- "FTE status"
- "Family trust election check"
- "Is my FTE still valid?"
- "When does FTE retention end?"
- "FTE compliance check"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Retention Monitor ⏰** | FTE retention tracking | Primary agent for FTE date calculations |
| **Compliance Guardian ⚖️** | ATO compliance | Verifies FTE against Section 272-80 ITAA 1936 |

### Retention Monitor Agent (Primary)

**Domain:** Business Strategist (Time-Based Compliance)

**Personality:** Meticulous, Cautious

**Approach:** Systematic

**Voice:** Joseph (Authoritative, British - ID: Zlb1dXr653N07WRdFW3)

```typescript
const { execSync } = require('child_process');
const retentionMonitorPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "business,meticulous,cautious,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: retentionMonitorPrompt + `

FTE RETENTION CHECK:
Trust name: ${trustName}
Trust ABN: ${abn}
FTE date: ${fteDate}
FTE document ID: ${fteDocumentId}
Current date: ${currentDate}
Country: ${country}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- FTE retention requirements MUST come from TaxonomyExpert.getRetentionRequirements('Family Trust Election', domain)
- DO NOT hardcode 5-year retention period - retrieve from TaxonomyExpert
- Use legal citations from TaxonomyExpert in all retention calculations
- Reference TaxonomyExpert for Section 272-80 ITAA 1936 citation

Your task:
1. Get FTE retention from TaxonomyExpert.getRetentionRequirements('Family Trust Election', domain)
2. Calculate FTE retention end date using TaxonomyExpert retention period
3. Calculate days remaining until retention ends
4. Determine FTE document status:
   - ACTIVE: Within retention period, must retain
   - APPROACHING: Within 90 days of retention end
   - EXPIRED: Past retention period per TaxonomyExpert
5. Check if FTE document exists in paperless-ngx
6. Verify FTE date custom field is set on entity
7. Generate retention compliance status with TaxonomyExpert citations

IMPORTANT: FTE retention is from FTE DATE (not EOFY) per TaxonomyExpert.
Reference: TaxonomyExpert.getRetentionRequirements('Family Trust Election', domain)

Return: {
  fteDate,
  retentionEndDate,
  daysRemaining,
  status: 'ACTIVE' | 'APPROACHING' | 'EXPIRED',
  documentExists: boolean,
  entityConfigured: boolean,
  warnings: [],
  recommendations: []
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

FTE COMPLIANCE VERIFICATION:
Trust name: ${trustName}
FTE date: ${fteDate}
FTE status: ${fteStatus}
Country: ${country}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- FTE compliance requirements MUST come from TaxonomyExpert.getRetentionRequirements('Family Trust Election', domain)
- DO NOT hardcode Section 272-80 requirements - retrieve from TaxonomyExpert
- Use legal citations from TaxonomyExpert in all compliance assessments

Your task:
1. Get FTE requirements from TaxonomyExpert.getRetentionRequirements('Family Trust Election', domain)
2. Verify FTE complies with legal citation from TaxonomyExpert
3. Check if FTE was made within required timeframe
4. Verify FTE is in writing and signed
5. Check for FTE revocation requirements
6. Assess impact if FTE document is lost/deleted
7. Provide ATO compliance assessment using TaxonomyExpert citations

Return: {
  compliant: boolean,
  issues: [],
  atoRequirements: [],
  impactIfLost: [],
  recommendations: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Identify Family Trust

```bash
# Search for family trusts
bun run Tools/RecordManager.ts entity search --type family-trust
```

### Step 2: Retrieve FTE Information

```bash
# Get trust entity details
bun run Tools/RecordManager.ts entity info --id ${entityId}

# Search for FTE document
bun run Tools/RecordManager.ts search --entity ${entityTag} --type "Family Trust Election"
```

### Step 3: Calculate FTE Status

**Retention Monitor agent calculates:**

```
📋 Family Trust Election (FTE) Status Report

Trust: Smith Family Trust
ABN: 12 345 678 901
Entity tag: entity:family-trust-smith-family-trust-2024

══════════════════════════════════════════════════
FTE RETENTION STATUS
══════════════════════════════════════════════════

FTE Date: 2020-02-01
Retention Period: 5 years (Section 272-80 ITAA 1936)
Retention End Date: 2025-02-01

┌─────────────────────────────────────┐
│  ⚠️  STATUS: APPROACHING            │
│                                     │
│  Days remaining: 13 days            │
│  Expires: 2025-02-01                │
└─────────────────────────────────────┘

FTE Document: ✅ Found (#1002)
  Title: Family_Trust_Election_Smith_2020.pdf
  Pages: 2
  Added: 2020-02-15

Entity Configuration: ✅ Configured
  FTE Date field: 2020-02-01

══════════════════════════════════════════════════
COMPLIANCE ANALYSIS
══════════════════════════════════════════════════

Section 272-80 Requirements:
  ✅ Election made in writing
  ✅ Signed by trustee
  ✅ Lodged within required timeframe
  ✅ Document retained for 5-year period

⚠️  WARNINGS:

1. FTE retention period ends in 13 days
   After 2025-02-01, the 5-year retention requirement is satisfied.

2. HOWEVER: Consider retaining FTE indefinitely because:
   • Trust structure depends on this election
   • May be needed for future ATO audits
   • Proves trust was properly elected as family trust
   • Loss could complicate trust administration

══════════════════════════════════════════════════
RECOMMENDATIONS
══════════════════════════════════════════════════

1. 🔒 Retain FTE document indefinitely
   Even though 5-year retention ends 2025-02-01,
   this document should be kept for trust continuity.

2. 📋 Archive to permanent storage
   Consider marking as "permanent retention" in system.

3. 🔄 Create backup
   Ensure FTE document is backed up off-site.

4. 📅 Schedule annual FTE review
   Add to calendar for yearly verification.

Would you like to:
  • Mark FTE as permanent retention
  • Create backup of FTE document
  • View full compliance report
```

## FTE Retention Rules

### Section 272-80 ITAA 1936

| Requirement | Details |
|-------------|---------|
| Retention Period | 5 years from date of election |
| Start Date | Date FTE was made (NOT EOFY) |
| Form | Must be in writing, signed by trustee |
| Location | Must be accessible for ATO audit |

### FTE Status Levels

| Status | Condition | Color | Action |
|--------|-----------|-------|--------|
| ACTIVE | > 90 days remaining | 🟢 Green | Retain as normal |
| APPROACHING | 1-90 days remaining | 🟡 Yellow | Review retention decision |
| EXPIRED | Past retention date | 🔵 Blue | May delete (but recommend keep) |

### Why Retain FTE Indefinitely?

Even after the 5-year retention requirement ends:

1. **Trust Continuity** - Proves family trust status
2. **ATO Audits** - May be requested in future audits
3. **Succession** - Needed when trustee changes
4. **Legal Protection** - Evidence of proper trust establishment
5. **No Storage Cost** - Digital storage is essentially free

## CLI Integration

```bash
# Check FTE for specific trust
bun run Tools/RecordManager.ts fte check --entity smith-family-trust

# Check FTE for all family trusts
bun run Tools/RecordManager.ts fte check --all

# Show FTE approaching retention end
bun run Tools/RecordManager.ts fte check --approaching

# Mark FTE as permanent retention
bun run Tools/RecordManager.ts fte permanent --entity smith-family-trust

# Generate FTE compliance report
bun run Tools/RecordManager.ts fte report --entity smith-family-trust
```

## Error Handling

| Error | Resolution |
|-------|------------|
| FTE document not found | Upload FTE document first |
| FTE date not set | Update entity with FTE date |
| Trust not family trust | FTE only applies to family trusts |
| Invalid FTE date | Check and correct FTE date format |

## Related Workflows

- `TrustValidation.md` - Full trust document validation (uses Compliance Guardian)
- `RetentionWorkflow.md` - General retention checks (uses Retention Monitor)
- `EntityAudit.md` - Complete entity health check (uses all agents)
- `AddEntityWorkflow.md` - Create family trust entity with FTE (uses Records Keeper)
