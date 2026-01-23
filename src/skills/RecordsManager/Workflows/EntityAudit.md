# Entity Audit Workflow

> Comprehensive audit of an existing entity and its documents with recommendations for taxonomy alignment, sensitivity classification, and retention compliance

## Triggers

- "Audit [entity]"
- "Review entity [name]"
- "Entity health check"
- "What's wrong with my [entity] documents?"
- "Check entity compliance"
- "Annual entity review"

## Agents Used

This workflow leverages **multiple specialized agents** from `AGENTS.md` for comprehensive analysis:

| Agent | Role | When Used |
|-------|------|-----------|
| **Records Keeper 📋** | Taxonomy alignment | Analyzes tags, document types, organization |
| **Compliance Guardian ⚖️** | Retention compliance | Verifies retention periods, regulatory requirements |
| **Sensitivity Scanner 🔒** | Classification review | Checks sensitivity levels, DLP compliance |
| **Archive Architect 🏛️** | Strategic recommendations | Overall health assessment, optimization suggestions |

### Records Keeper Agent (Taxonomy Alignment)

**Domain:** Research Specialist (Data Organization & Classification)

**Personality:** Meticulous, Analytical, Systematic

**Voice:** Drew (Professional, balanced - ID: 29vD33N1CtxCmqQRPOHJ)

```typescript
const { execSync } = require('child_process');
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

TAXONOMY ALIGNMENT AUDIT:
Entity: ${entityName}
Entity type: ${entityType}
Entity tag: ${entityTag}
Country: ${country}
Domain: ${domain}
Documents found: ${documentCount}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL expected tags MUST come from TaxonomyExpert.getTagCategories(domain)
- ALL document types MUST come from TaxonomyExpert.getDocumentTypes(domain)
- DO NOT suggest tags not in TaxonomyExpert - flag them for removal
- Use TaxonomyExpert as single source of truth

Your task:
1. Retrieve expected tags from TaxonomyExpert.getTagCategories(domain)
2. Retrieve expected document types from TaxonomyExpert.getDocumentTypes(domain)
3. Compare expected vs actual tags on entity documents
4. Identify missing tags that should be applied (from TaxonomyExpert ONLY)
5. Identify incorrect/deprecated tags to remove (NOT in TaxonomyExpert)
6. Check document type consistency against TaxonomyExpert
7. Analyze naming convention compliance
8. Score taxonomy health (0-100)

Return: {
  expectedTags: [],
  actualTags: [],
  missingTags: [],
  incorrectTags: [],
  documentTypeIssues: [],
  namingIssues: [],
  taxonomyScore,
  recommendations: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Compliance Guardian Agent (Retention Compliance)

**Domain:** Legal Analyst (Retention & Regulatory Requirements)

**Personality:** Cautious, Meticulous, Thorough

**Voice:** Joseph (Formal, authoritative, British - ID: Zlb1dXrM653N07WRdFW3)

```typescript
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `

RETENTION COMPLIANCE AUDIT:
Entity: ${entityName}
Entity type: ${entityType}
Country: ${country}
Domain: ${domain}
Documents: ${documents}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert.getRetentionRequirements(documentType, domain)
- DO NOT hardcode retention periods - retrieve from TaxonomyExpert for each document type
- Use country-specific retention rules with legal citations from TaxonomyExpert
- Required documents checklist must come from TaxonomyExpert.getDocumentTypes(domain)

Your task:
1. For each document type, get retention from TaxonomyExpert.getRetentionRequirements()
2. Identify documents approaching retention deadlines using TaxonomyExpert periods
3. Identify documents past retention (safe to delete) per TaxonomyExpert
4. Check for required documents from TaxonomyExpert.getDocumentTypes(domain)
5. Verify FTE retention for family trusts using TaxonomyExpert
6. Check pre-EOFY requirements for trusts
7. Score retention compliance (0-100) with TaxonomyExpert citations

Return: {
  compliantDocuments: [],
  approachingDeadline: [],
  pastRetention: [],
  missingRequired: [],
  fteStatus: {},
  preTOEOFYStatus: {},
  complianceScore,
  warnings: [],
  recommendations: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Sensitivity Scanner Agent (Classification Review)

**Domain:** Security Expert (Data Loss Prevention & Classification)

**Personality:** Cautious, Systematic

**Voice:** James (Security-focused - ID: ZQe5CZNOzWyzPSCn5a3c)

```typescript
const sensitivityScannerPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "security,cautious,systematic,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: sensitivityScannerPrompt + `

SENSITIVITY CLASSIFICATION AUDIT:
Entity: ${entityName}
Entity type: ${entityType}
Documents: ${documents}

Your task:
1. Review current sensitivity classifications
2. Identify unclassified documents
3. Identify potentially misclassified documents
4. Check for PHI (HIPAA) compliance
5. Check for PCI-DSS compliance
6. Check for PII (GDPR) compliance
7. Verify security controls match sensitivity levels
8. Score sensitivity compliance (0-100)

Return: {
  classifiedDocuments: { public: [], internal: [], confidential: [], restricted: [] },
  unclassified: [],
  misclassified: [],
  phiIssues: [],
  pciIssues: [],
  piiIssues: [],
  securityGaps: [],
  sensitivityScore,
  recommendations: []
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Archive Architect Agent (Strategic Recommendations)

**Domain:** Data Analyst + Research Specialist (Storage & Retrieval Strategy)

**Personality:** Analytical, Pragmatic

**Voice:** Charlotte (Sophisticated, intellectual - ID: XB0fDUnXU5powFXDhCwa)

```typescript
const archiveArchitectPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: archiveArchitectPrompt + `

ENTITY HEALTH ASSESSMENT:
Entity: ${entityName}
Entity type: ${entityType}

Agent Reports:
- Taxonomy Audit: ${taxonomyReport}
- Retention Audit: ${retentionReport}
- Sensitivity Audit: ${sensitivityReport}

Your task:
1. Synthesize findings from all three audit reports
2. Calculate overall entity health score
3. Prioritize issues by severity and impact
4. Generate actionable remediation plan
5. Estimate effort for each remediation
6. Recommend automation opportunities (workflows)
7. Provide strategic long-term recommendations

Return: {
  overallHealthScore,
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F',
  criticalIssues: [],
  moderateIssues: [],
  minorIssues: [],
  remediationPlan: [],
  automationOpportunities: [],
  strategicRecommendations: [],
  nextAuditDate
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Identify Entity

Ask user for entity details or search by name:

```bash
bun run Tools/RecordManager.ts entity search --query "${entityQuery}"
```

### Step 2: Gather Entity Data

```bash
# Get entity details
bun run Tools/RecordManager.ts entity info --id ${entityId}

# Get all documents for entity
bun run Tools/RecordManager.ts search --entity ${entityTag} --all
```

### Step 3: Run Parallel Agent Audits

Launch all four agents in parallel for comprehensive analysis:

```typescript
// Execute all audits in parallel
const [taxonomyAudit, retentionAudit, sensitivityAudit] = await Promise.all([
  runRecordsKeeperAudit(entity, documents),
  runComplianceGuardianAudit(entity, documents),
  runSensitivityScannerAudit(entity, documents)
]);

// Archive Architect synthesizes all findings
const healthAssessment = await runArchiveArchitectAssessment(
  entity,
  taxonomyAudit,
  retentionAudit,
  sensitivityAudit
);
```

### Step 4: Present Audit Report

```
📊 Entity Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Entity: Smith Family Trust
Type: Family Trust
Entity tag: entity:family-trust-smith-family-trust-2024
Documents analyzed: 47
Audit date: 2026-01-19

═══════════════════════════════════════
📈 OVERALL HEALTH: 78/100 (Grade B)
═══════════════════════════════════════

┌─────────────────────────────────────┐
│ TAXONOMY ALIGNMENT: 85/100          │
├─────────────────────────────────────┤
│ ✅ 42/47 documents properly tagged  │
│ ⚠️  3 documents missing entity tag  │
│ ⚠️  2 documents have deprecated tags│
│                                     │
│ Missing tags to apply:              │
│   • #1045, #1046, #1047 → entity:   │
│     family-trust-smith-family-trust │
│                                     │
│ Tags to remove:                     │
│   • #1023, #1024 → remove: old-tag  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ RETENTION COMPLIANCE: 72/100        │
├─────────────────────────────────────┤
│ ✅ 40/47 documents compliant        │
│ ⚠️  5 documents approaching deadline│
│ 🗑️  2 documents past retention      │
│                                     │
│ Approaching deadlines (30 days):    │
│   • FTE Document #1002 → 13 days    │
│   • Tax Return 2018 #1015 → 25 days │
│                                     │
│ Missing required documents:         │
│   • Beneficiary Declaration         │
│   • TFN Registration                │
│                                     │
│ Pre-EOFY Status:                    │
│   ⚠️ Trustee Resolution 2025 needed │
│   ⚠️ Distribution Minutes 2025 needed│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SENSITIVITY CLASSIFICATION: 76/100  │
├─────────────────────────────────────┤
│ Distribution:                       │
│   • Public: 0                       │
│   • Internal: 12                    │
│   • Confidential: 28                │
│   • Restricted: 5                   │
│   • Unclassified: 2                 │
│                                     │
│ Issues found:                       │
│   ⚠️ 2 documents unclassified       │
│   ⚠️ 1 document may be misclassified│
│   ⚠️ PII detected without restricted│
│     tag on #1033                    │
│                                     │
│ Security gaps:                      │
│   • #1033 contains TFN, needs       │
│     restricted classification       │
└─────────────────────────────────────┘

═══════════════════════════════════════
🔧 REMEDIATION PLAN (Priority Order)
═══════════════════════════════════════

🔴 CRITICAL (Do immediately):
1. Classify #1033 as RESTRICTED (contains TFN)
2. Create Trustee Resolution 2025 before June 30

🟠 HIGH (This week):
3. Add entity tag to 3 untagged documents
4. Upload missing Beneficiary Declaration
5. Classify 2 unclassified documents

🟡 MODERATE (This month):
6. Remove deprecated tags from 2 documents
7. Review FTE retention status (13 days remaining)
8. Upload TFN Registration if available

🟢 LOW (When convenient):
9. Consider archiving 2 past-retention documents

═══════════════════════════════════════
🤖 AUTOMATION OPPORTUNITIES
═══════════════════════════════════════

Recommended workflows to create:
1. Auto-tag Smith Family Trust documents
   Pattern: .*Smith.*Trust|ABN.*12.*345.*678.*901
   Expected match rate: 94%
   → Use /workflow-creator to set up

2. Pre-EOFY reminder workflow
   Trigger: 60 days before June 30
   Action: Alert for trustee resolution

═══════════════════════════════════════
📅 NEXT AUDIT: 2026-04-19 (Quarterly)
═══════════════════════════════════════
```

### Step 5: Offer Remediation Actions

```
Would you like me to:

1. 🏷️  Fix taxonomy issues (add missing tags, remove deprecated)
2. 📄  Show required document templates
3. 🔒  Update sensitivity classifications
4. 🤖  Create recommended workflow automations
5. 📋  Export full audit report

Select options (e.g., "1,3,5") or "all":
```

### Step 6: Execute Remediation (With Confirmation)

For each remediation action:

```typescript
// Example: Fix taxonomy issues
if (userApproves('taxonomy')) {
  // Add missing tags
  for (const doc of missingTagDocs) {
    await paperlessClient.updateDocument(doc.id, {
      tags: [...doc.tags, entityTagId]
    });
  }

  // Remove deprecated tags
  for (const doc of deprecatedTagDocs) {
    await paperlessClient.updateDocument(doc.id, {
      tags: doc.tags.filter(t => !deprecatedTags.includes(t))
    });
  }
}
```

## Health Scoring Matrix

### Taxonomy Score (0-100)
| Metric | Weight | Calculation |
|--------|--------|-------------|
| Tag completeness | 40% | % docs with all required tags |
| Tag accuracy | 30% | % docs without incorrect tags |
| Document type consistency | 20% | % docs with correct type |
| Naming convention | 10% | % docs following naming rules |

### Retention Score (0-100)
| Metric | Weight | Calculation |
|--------|--------|-------------|
| Required documents present | 40% | % of required docs found |
| Within retention compliance | 30% | % docs properly retained |
| No overdue actions | 20% | Penalty for missed deadlines |
| FTE/Trust compliance | 10% | Special trust requirements |

### Sensitivity Score (0-100)
| Metric | Weight | Calculation |
|--------|--------|-------------|
| Classification coverage | 40% | % docs with sensitivity tag |
| Classification accuracy | 30% | % correctly classified |
| Regulatory compliance | 20% | PHI/PCI/PII proper handling |
| Security controls | 10% | Controls match classification |

### Overall Health Grade
| Score Range | Grade | Status |
|-------------|-------|--------|
| 90-100 | A | Excellent - minimal action needed |
| 80-89 | B | Good - minor improvements |
| 70-79 | C | Satisfactory - attention needed |
| 60-69 | D | Poor - significant issues |
| 0-59 | F | Critical - immediate action required |

## CLI Integration

```bash
# Full entity audit
bun run Tools/RecordManager.ts audit --entity smith-family-trust

# Audit specific aspects only
bun run Tools/RecordManager.ts audit --entity smith-family-trust --taxonomy-only
bun run Tools/RecordManager.ts audit --entity smith-family-trust --retention-only
bun run Tools/RecordManager.ts audit --entity smith-family-trust --sensitivity-only

# Audit all entities of a type
bun run Tools/RecordManager.ts audit --type family-trust --all

# Export audit report
bun run Tools/RecordManager.ts audit --entity smith-family-trust --export pdf

# Schedule regular audits
bun run Tools/RecordManager.ts audit --schedule quarterly --entity smith-family-trust
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Entity not found | Search for entity or create with AddEntityWorkflow |
| No documents found | Upload documents first, then re-audit |
| Agent timeout | Reduce document batch size, retry |
| Permission denied | Check paperless-ngx API token permissions |

## Related Workflows

- `AddEntityWorkflow.md` - Create new entity if not found (uses Records Keeper)
- `TrustValidation.md` - Deep dive on trust compliance (uses Compliance Guardian)
- `RetentionWorkflow.md` - Detailed retention analysis (uses Retention Monitor)
- `WorkflowCreator.md` - Create automation from recommendations (uses Archive Architect)
- `DeleteConfirmation.md` - Delete past-retention documents (uses Deletion Auditor)
