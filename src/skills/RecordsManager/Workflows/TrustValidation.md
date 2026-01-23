# Trust Validation Workflow

> Validate trust document completeness and ATO compliance

## Triggers

- "Validate trust documents"
- "Check trust completeness"
- "What documents am I missing for [trust]?"
- "Trust compliance check"
- "Pre-EOFY trust validation"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Compliance Guardian ⚖️** | ATO compliance verification | Primary agent for trust validation |
| **Records Keeper 📋** | Document completeness | Checks against required document checklist |
| **Retention Monitor ⏰** | FTE retention tracking | Validates Family Trust Election retention |

### Compliance Guardian Agent (Primary)

**Domain:** Legal Analyst (Retention & Regulatory Requirements)

**Personality:** Cautious, Meticulous, Thorough

**Approach:** Thorough, Exhaustive

**Voice:** Joseph (Formal, authoritative, British - ID: Zlb1dXrM653N07WRdFW3)

```typescript
const { execSync } = require('child_process');
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `

TRUST COMPLIANCE VALIDATION REQUEST:
Trust name: ${trustName}
Trust type: ${trustType}
Trust ABN: ${abn}
FTE date (if family trust): ${fteDate}
Country: ${country}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert.getRetentionForActivity() hierarchical methods
- DO NOT hardcode retention periods - retrieve from TaxonomyExpert for each activity
- For hierarchical navigation, use:
  * TaxonomyExpert.getFunctions(domain) - List all functions
  * TaxonomyExpert.getServices(domain, functionName) - List services in a function
  * TaxonomyExpert.getActivities(domain, functionName, serviceName) - List activities in a service
  * TaxonomyExpert.getDocumentTypesForActivity(domain, functionName, serviceName, activityName) - Get document types for an activity
  * TaxonomyExpert.getRetentionForActivity(domain, functionName, serviceName, activityName) - Get country-specific retention rules
- Use country-specific retention rules (AU, US, UK) with legal citations from TaxonomyExpert
- Document type checklist must reference TaxonomyExpert.getDocumentTypesForActivity()
- Check for special fromDate rules: 'fy_end', 'fte_date', 'creation', 'distribution'
- Validate permanent retention (years: 0) for trust deeds and critical documents

Your task:
1. Navigate hierarchy: getFunctions() → getServices() → getActivities() for trust domain
2. For each activity in TrustGovernance, TaxCompliance, etc., get document types
3. Search paperless-ngx for existing trust documents
4. Compare against required document types from getDocumentTypesForActivity()
5. For each document type, get retention from getRetentionForActivity()
6. Check FTE retention if family trust using fromDate: 'fte_date' and Section 272-80 ITAA 1936
7. Identify missing documents with activity context
8. Check for pre-EOFY requirements (trustee resolutions, distribution minutes)
9. Generate compliance report with TaxonomyExpert legal citations

Return: {
  trustType,
  required: [{ function, service, activity, documentType, retention }],
  found: [{ id, type, function, service, activity, retention }],
  missing: [{ function, service, activity, documentType, priority }],
  fteStatus: {},
  preTEOFYStatus: {},
  complianceScore,
  recommendations: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Records Keeper Agent (For Document Search)

```typescript
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

TRUST DOCUMENT SEARCH:
Trust entity tag: ${entityTag}
Required documents: ${requiredDocuments}
Domain: ${domain}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL document types MUST come from TaxonomyExpert.getDocumentTypesForActivity()
- DO NOT search for document types not in TaxonomyExpert
- For hierarchical navigation, use getFunctions() → getServices() → getActivities()
- Use TaxonomyExpert as single source of truth for all document types
- Verify document types exist in TaxonomyExpert before searching

Search paperless-ngx for all documents tagged with this trust.
Match against required document types from TaxonomyExpert.getDocumentTypesForActivity().
For each document type found, identify its function, service, and activity context.
Identify any missing critical documents with their activity context.
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Identify Trust

Ask user for trust details:
- Trust name or entity ID
- Trust type (unit-trust, discretionary-trust, family-trust)

### Step 2: Get Required Documents Checklist

**From TrustExpert, based on trust type:**

#### Unit Trust Required Documents
- [ ] Trust Deed
- [ ] Unit Registry
- [ ] Trustee Appointment
- [ ] ABN Registration
- [ ] TFN Registration
- [ ] Annual Financial Statements
- [ ] Unit Distribution Statement
- [ ] Tax Return
- [ ] Trustee Resolution
- [ ] Trustee Minutes

#### Discretionary Trust Required Documents
- [ ] Trust Deed
- [ ] Trustee Resolution (pre-EOFY)
- [ ] Distribution Minutes
- [ ] Beneficiary Declaration
- [ ] Trustee Appointment
- [ ] ABN Registration
- [ ] TFN Registration
- [ ] Annual Financial Statements
- [ ] Tax Return

#### Family Trust Required Documents
- [ ] Trust Deed
- [ ] **Family Trust Election (FTE)** - CRITICAL
- [ ] Trustee Resolution (pre-EOFY)
- [ ] Distribution Minutes
- [ ] Beneficiary Declaration
- [ ] Trustee Appointment
- [ ] ABN Registration
- [ ] TFN Registration
- [ ] Annual Financial Statements
- [ ] Tax Return

### Step 3: Search Existing Documents

**Records Keeper agent searches:**

```bash
bun run Tools/RecordManager.ts search --entity ${entityId} --all
```

### Step 4: Generate Validation Report

```
📋 Trust Validation Report

Trust: Smith Family Trust
Type: Family Trust
ABN: 12 345 678 901
Entity tag: entity:family-trust-smith-family-trust-2024

DOCUMENT COMPLETENESS: 8/10 (80%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FOUND (8):
  • Trust Deed (#1001) - Created 2015-03-15
  • Family Trust Election (#1002) - FTE Date 2020-02-01
  • Trustee Appointment (#1003) - Created 2015-03-15
  • ABN Registration (#1004) - Created 2015-03-20
  • Annual Financial Statements 2023 (#1005)
  • Tax Return 2023 (#1006)
  • Trustee Resolution 2023 (#1007)
  • Distribution Minutes 2023 (#1008)

❌ MISSING (2):
  • Beneficiary Declaration - REQUIRED
  • TFN Registration - RECOMMENDED

⚠️  FTE RETENTION STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FTE Date: 2020-02-01
  Retain Until: 2025-02-01
  Days Remaining: 13 days
  Status: ⚠️ APPROACHING RETENTION END

  IMPORTANT: After 2025-02-01, the FTE document may be deleted.
  However, the trust structure depends on this election.
  RECOMMENDATION: Retain indefinitely for trust continuity.

📅 PRE-EOFY CHECK (Financial Year 2024-25):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EOFY Date: 2025-06-30
  Days until EOFY: 162 days

  Required before EOFY:
  ⚠️  Trustee Resolution 2025 - NOT YET CREATED
  ⚠️  Distribution Minutes 2025 - NOT YET CREATED

  REMINDER: Trustee resolution documenting beneficiary
  distributions MUST be created before June 30, 2025.

📊 COMPLIANCE SCORE: 80%

🔧 RECOMMENDED ACTIONS:
  1. Upload Beneficiary Declaration document
  2. Upload TFN Registration if available
  3. Create 2024-25 Trustee Resolution before June 30
  4. Document beneficiary distributions for 2024-25
```

### Step 5: Offer Remediation

If documents missing:
- Suggest templates for required documents
- Offer to create reminder tasks for pre-EOFY documents
- Provide ATO reference links for compliance

## Trust Type Specific Checks

### Family Trust Special Checks

| Check | Requirement | Reference |
|-------|-------------|-----------|
| FTE Exists | Mandatory | Section 272-80 ITAA 1936 |
| FTE Retention | 5 years from FTE date | Section 272-80 ITAA 1936 |
| Pre-EOFY Resolution | Before June 30 each year | ATO distribution requirements |
| Distribution Minutes | Document all distributions | Section 100A compliance |

### Unit Trust Special Checks

| Check | Requirement | Reference |
|-------|-------------|-----------|
| Unit Registry | Must be current | Trust deed requirements |
| Unit Distribution | Per unit holding | Trust deed |
| Capital Account | Track each unitholder | CGT requirements |

### Discretionary Trust Special Checks

| Check | Requirement | Reference |
|-------|-------------|-----------|
| Pre-EOFY Resolution | Before June 30 each year | ATO distribution requirements |
| Streaming Resolution | If streaming income types | Division 6 ITAA 1936 |
| Beneficiary Declaration | Document beneficiaries | Trust deed |

## CLI Integration

```bash
# Validate specific trust
bun run Tools/RecordManager.ts trust validate --entity smith-family-trust

# Validate all trusts
bun run Tools/RecordManager.ts trust validate --all

# Pre-EOFY validation
bun run Tools/RecordManager.ts trust validate --pre-eofy

# Generate compliance report
bun run Tools/RecordManager.ts trust validate --report --entity smith-family-trust
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Trust not found | Check entity ID or create entity first |
| Missing trust type | Entity must have trust type specified |
| FTE date missing | Family trusts require FTE date - update entity |

## Related Workflows

- `AddEntityWorkflow.md` - Create new trust entity (uses Compliance Guardian)
- `FTECheck.md` - Detailed FTE retention check (uses Retention Monitor)
- `RetentionWorkflow.md` - Check retention for trust documents (uses Retention Monitor)
- `DeleteConfirmation.md` - **REQUIRED** before deleting trust documents (uses Deletion Auditor)
