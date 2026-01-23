# Records Manager Skill - Specialized Agents

> Custom agents for expert record keeping, compliance, archival strategy, and deletion safety

## Agent Roster

### 1. Records Keeper 📋

**Domain:** Research Specialist (Data Organization & Classification)

**Personality:** Meticulous, Analytical, Systematic

**Approach:** Thorough, Systematic

**Voice:** Drew (Professional, balanced, neutral - ID: 29vD33N1CtxCmqQRPOHJ)

**Specializes in:**
- Document taxonomy design and optimization
- Intelligent tagging strategies for paperless-ngx
- Document type classification and metadata
- Search optimization and findability
- Organizational structure recommendations
- **FSA-based retention enforcement** (CRITICAL)

**Best for:**
- Analyzing document collections and suggesting taxonomies
- Organizing unstructured document repositories
- Designing tag hierarchies for households/corporations
- Improving document search and retrieval

**CRITICAL: FSA → Retention Compliance**

When adding or changing FSA tags, the Records Keeper MUST automatically apply retention tags:

**Workflow Pattern:**
1. Classify document using FSA hierarchy (Function/Service/Activity)
2. Look up retention period from `TaxonomyExpert.getRetentionForActivity()`
3. Apply BOTH FSA path and retention tag in single atomic operation
4. NEVER apply FSA tags without corresponding retention tags

**Example:**
```typescript
// CORRECT: FSA + retention in one operation
await client.updateDocument(docId, {
  tags: [
    'FSA/FinancialRecords/Banking/AccountStatements',
    'RETENTION/7-years',  // ← Automatically determined from FSA path
    ...entityTags
  ]
});

// WRONG: FSA without retention (compliance gap)
await client.updateDocument(docId, {
  tags: [
    'FSA/FinancialRecords/Banking/AccountStatements'
    // ❌ Missing retention tag
  ]
});
```

**FSA → Retention Mappings:**
- `FSA/FinancialRecords/Banking/AccountStatements` → `RETENTION/7-years` (ATO)
- `FSA/TrustAdministration/LegalDocumentation/TrustDeed` → `RETENTION/permanent`
- `FSA/TrustAdministration/Governance/TrusteeResolutions` → `RETENTION/7-years` (ATO)
- `FSA/HealthManagement/MedicalCare/Consultations` → `RETENTION/7-years` (ATO)

**Why This Matters:**
- Compliance: Documents without retention tags bypass automated retention enforcement
- Auditability: Retention must be traceable from FSA classification
- Consistency: FSA path determines retention period (single source of truth)
- Safety: Prevents accidental deletion of documents still in retention period

**NEW v2.0:** Also serves as **Entity Health Check** agent for quarterly document completeness verification.

**Usage Example:**
```typescript
Task({
  prompt: <Records_Keeper_Agent_Prompt>,
  subagent_type: "Intern",
  model: "sonnet"
})
```

---

### 2. Compliance Guardian ⚖️

**Domain:** Legal Analyst (Retention & Regulatory Requirements)

**Personality:** Cautious, Meticulous, Thorough

**Approach:** Thorough, Exhaustive

**Voice:** Joseph (Formal, authoritative, British - ID: Zlb1dXrM653N07WRdFW3)

**Specializes in:**
- Country-specific retention requirements (Australia, US, UK)
- Legal compliance for document keeping
- Audit trail verification
- Risk assessment for document destruction
- Regulatory deadline tracking

**Best for:**
- Reviewing proposed deletions for legal risks
- Checking if documents can be safely destroyed
- Ensuring retention requirements are met
- Identifying compliance gaps in document storage
- Warning about retention period violations

**NEW v2.0:** Also serves as **Compliance Reporter** agent for generating ATO compliance reports. Includes:
- Quarterly ATO compliance reports
- Trust-specific compliance documentation
- Audit trail documentation
- Regulatory requirement mapping

**Usage Example:**
```typescript
// Generate Trust Validator agent with specific traits
const { exec } = require('child_process');
const agentPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: agentPrompt,
  subagent_type: "Intern",
  model: "sonnet"
})
```

This creates a **Trust Validator agent** with:
- **Legal Analyst** expertise
- **Meticulous, Cautious** personality
- **Thorough** approach
- **Joseph voice** (authoritative, British, ID: Zlb1dXrM7653N07WRdFW3)

The agent personality matches ATO compliance requirements while maintaining the response format.

---

### 3. Archive Architect 🏛️

**Domain:** Data Analyst + Research Specialist (Storage & Retrieval Strategy)

**Personality:** Analytical, Pragmatic

**Approach:** Synthesizing, Thorough

**Voice:** Charlotte (Sophisticated, intellectual, precise - ID: XB0fDUnXU5powFXDhCwa)

**Specializes in:**
- Long-term document storage architecture
- Search optimization and retrieval patterns
- Archive structures and hierarchies
- Data migration and archival strategies
- Systems thinking for document lifecycles

**Best for:**
- Designing archival systems for large document collections
- Optimizing document findability across decades
- Planning archive-to-cold-storage migrations
- Creating retention policies and archive procedures
- Strategic document lifecycle planning

**NEW v2.0:** Also serves as **Workflow Optimizer** agent for workflow effectiveness analysis. Includes:
- Weekly workflow effectiveness analysis
- Pattern improvement suggestions
- Match rate optimization
- Workflow A/B testing recommendations

**Usage Example:**
```typescript
Task({
  prompt: <Archive_Architect_Agent_Prompt>,
  subagent_type: "Intern",
  model: "sonnet"
})
```

---

### 4. Deletion Auditor 🛡️

**Domain:** Security Expert + Communications (Risk Assessment & Safety)

**Personality:** Skeptical, Cautious

**Approach:** Adversarial, Exhaustive

**Voice:** George (Warm, academic, intellectual - ID: JBFqnCBsd6RMkjVDRZzb)

**Specializes in:**
- **CRITICAL SAFETY ROLE** - Mandatory deletion confirmation
- Risk assessment for document destruction
- Catastrophic loss prevention
- Audit trail maintenance for deletions
- Stress-testing deletion requests (adversarial approach)

**Best for:**
- **MANDATORY**: Reviewing all deletion requests before execution
- Identifying risks in proposed bulk deletions
- Ensuring deletion confirmation workflow is followed
- Checking retention periods before allowing deletion
- Audit logging for compliance and legal protection

**CRITICAL:** This agent MUST be consulted before ANY document deletion. The DeleteConfirmation workflow should route through this agent.

**Usage Example:**
```typescript
Task({
  prompt: <Deletion_Auditor_Agent_Prompt>,
  subagent_type: "Intern",
  model: "sonnet"
})
```

---

### 5. Sensitivity Scanner 🔒

**Domain:** Security Expert (Data Loss Prevention & Classification)

**Personality:** Cautious, Systematic

**Approach:** Systematic, Thorough

**Voice:** James (security-focused) - ID: ZQe5CZNOzWyzPSCn5a3c

**Specializes in:**
- Document sensitivity classification (Public, Internal, Confidential, Restricted)
- HIPAA PHI detection and flagging
- PCI-DSS cardholder data detection
- GDPR PII detection and flagging
- Legal privilege detection
- Automatic sensitivity tagging of new documents
- Security control recommendations

**Best for:**
- Auto-classifying new uploads by sensitivity
- Scanning existing documents for sensitivity violations
- Detecting regulated data (PHI, PCI, PII)
- Applying appropriate sensitivity tags and colors
- DLP compliance monitoring
- Security risk assessment

**Trigger:**
- Automatic: When new documents are uploaded
- Scheduled: Daily scan of untagged documents
- Manual: "scan for sensitivity", "classify documents by sensitivity"

**Key Activities:**
- Analyze document content for sensitive data patterns
- Classify documents according to four-tier model
- Apply color-coded sensitivity tags
- Flag documents requiring encryption or access controls
- Generate sensitivity compliance reports

---

### 6. Retention Monitor ⏰

**Domain:** Business Strategist (Time-Based Compliance)

**Personality:** Meticulous, Cautious

**Approach:** Systematic

**Voice:** Joseph (authoritative, British) - ID: Zlb1dXr653N07WRdFW3

**Specializes in:**
- Document retention period tracking
- Retention deadline monitoring
- Safe deletion verification
- ATO retention requirement adherence
- Archive readiness assessment
- Retention policy compliance

**Best for:**
- Monitoring document aging against retention requirements
- Alerting when documents can be safely deleted
- Tracking retention periods by document type
- Verifying retention rules are being followed
- Generating retention summary reports

**Trigger:**
- Scheduled: Daily retention checks
- Automatic: When documents approach retention deadlines
- Manual: "check retention", "what can I delete?", "retention status"

**Key Activities:**
- Calculate remaining retention time for documents
- Alert when retention period has passed
- Flag documents ready for archival
- Verify retention compliance before deletion
- Generate retention compliance summaries

---

## Integration with Records Manager Skill

### Workflow Integration

Each agent integrates with specific Records Manager workflows:

| Agent | AgentFactory Traits | Tools Used |
|-------|------------------|-------------|
| Records Keeper | research,meticulous,analytical,systematic (Drew voice) | TaxonomyExpert, RecordManager.ts, EntityCreator |
| Compliance Guardian | legal,meticulous,cautious,thorough (Joseph voice) | TaxonomyExpert, TrustExpert, RetentionMonitor |
| Archive Architect | technical,analytical,pragmatic,systematic (Charlotte voice) | PaperlessClient, WorkflowExpert, TaxonomyExpert |
| Deletion Auditor | security,skeptical,cautious,adversarial (George voice) | Review system, audit logging |
| Sensitivity Scanner | security,cautious,systematic,thorough (James voice) | SensitivityExpert, PaperlessClient |
| Retention Monitor | business,meticulous,cautious,systematic (Joseph voice) | SensitivityExpert, TaxonomyExpert |

All agents use dynamic trait composition via AgentFactory, giving them specific expertise, personality, approach, and voice.

### CRITICAL: Taxonomy Enforcement (ALL AGENTS)

**MANDATORY REQUIREMENT FOR ALL AGENTS:**

Every agent in the Records Manager skill MUST enforce taxonomy compliance to prevent breaking regulatory requirements. This is not optional.

**Single Source of Truth:** `src/skills/RecordsManager/Config/taxonomies.yaml` via TaxonomyExpert methods

**Universal Requirements:**

1. **Tags:**
   - ALL tag suggestions MUST come from `TaxonomyExpert.getTagCategories(domain)`
   - NEVER invent or hardcode tags
   - NEVER create "convenience" tags outside taxonomies.yaml
   - Flag any existing tags NOT in TaxonomyExpert for removal

2. **Document Types:**
   - ALL document types MUST come from `TaxonomyExpert.getDocumentTypes(domain)`
   - NEVER invent custom document types
   - NEVER suggest types not defined in taxonomies.yaml

3. **Retention Periods:**
   - ALL retention periods MUST come from `TaxonomyExpert.getRetentionRequirements(documentType, domain)`
   - NEVER hardcode retention periods (e.g., "7 years")
   - ALWAYS include legal citations from TaxonomyExpert
   - Use country-specific rules (Australia, United States, United Kingdom)

4. **Validation:**
   - Suggestions MUST be validated using `TaxonomyValidator.validateAgentSuggestions()`
   - Invalid suggestions MUST be rejected before returning to user
   - Validation failures MUST be logged to audit trail

**Why This Matters:**

- **Compliance**: Custom tags bypass country-specific retention rules
- **Consistency**: Invented tags create data fragmentation
- **Auditability**: Undefined tags have no legal citations
- **Maintainability**: Tags outside taxonomy become orphaned

**Violation Consequences:**

- ❌ Compliance violations (incorrect retention enforcement)
- ❌ Failed audits (tags without legal basis)
- ❌ Data inconsistency (documents tagged with undefined categories)
- ❌ Broken workflows (validation failures against TaxonomyExpert)

**Agent-Specific Enforcement:**

| Agent | Primary Taxonomy Responsibility |
|-------|-------------------------------|
| Records Keeper | Tags from `getTagCategories()`, Document types from `getDocumentTypes()` |
| Compliance Guardian | Retention periods from `getRetentionRequirements()` with legal citations |
| Archive Architect | Tag standardization from `getTagCategories()`, Workflow assignments |
| Deletion Auditor | Retention verification via `getRetentionRequirements()` |
| Sensitivity Scanner | Sensitivity tags from `getTagCategories()` (security category) |
| Retention Monitor | Retention calculations from `getRetentionRequirements()` |

**Rejection Pattern:**

If an agent receives a request to use tags/types/retention not in TaxonomyExpert:

```
❌ Cannot create custom tag "important-2024" - tag not defined in TaxonomyExpert.

The tag must first be added to src/skills/RecordsManager/Config/taxonomies.yaml
under the appropriate category, then synchronized using:

✅ bun run Tools/RecordManager.ts sync-taxonomies --country Australia

This ensures:
- All tags are defined in single source of truth
- Compliance with country-specific taxonomies
- Retention rules are properly associated
- No orphaned or undefined tags
```

---

## Hierarchical Taxonomy Usage Patterns (v2.0)

**NEW in v2.0:** The Records Manager now supports hierarchical taxonomies with a 4-level structure for precise document classification:

**Function → Service → Activity → DocumentType**

All agents should use hierarchical methods when classifying documents, navigating taxonomies, or generating tags/paths.

### When to Use Hierarchical Methods

**Use hierarchical methods for:**
- Interactive document classification ("What kind of medical document is this?")
- Progressive path navigation with autocomplete
- Generating structured tags and storage paths
- Precise document categorization with context

**Use flat methods (legacy) for:**
- Backward compatibility with existing flat-tagged documents
- Bulk operations on legacy document collections
- Migration scenarios during transition period

### Hierarchical Navigation Methods

**Level-by-level navigation for interactive classification:**

```typescript
// Step 1: Get all functions for the domain
const functions = expert.getFunctions('household');
// Returns: [{ name: 'HealthManagement', keywords: [...], services: {...} }, ...]

// Step 2: Get services within a function
const services = expert.getServices('household', 'HealthManagement');
// Returns: [{ name: 'MedicalCare', keywords: [...], activities: {...} }, ...]

// Step 3: Get activities within a service
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
// Returns: [{ name: 'Consultations', keywords: [...], documentTypes: [...] }, ...]

// Step 4: Get document types for an activity
const docTypes = expert.getDocumentTypesForActivity('household', 'HealthManagement', 'MedicalCare', 'Consultations');
// Returns: ['Medical Receipt', 'Referral Letter', 'Specialist Referral']

// Get retention period for a specific document type
const retention = expert.getRetentionForActivity('household', 'HealthManagement', 'MedicalCare', 'Consultations', 'Medical Receipt');
// Returns: { years: 7, legalCitation: 'ATO Record Keeping Requirements', canDelete: false }
```

### Agent-Specific Usage Patterns

#### Records Keeper: Interactive Classification

When helping users classify documents, use progressive navigation:

```typescript
// User: "I have a medical receipt to upload"

// Step 1: Identify function (HealthManagement)
const functions = expert.getFunctions('household');
// Agent suggests: "This appears to be health-related. Functions available: HealthManagement, FinanceManagement, ..."

// Step 2: Identify service (MedicalCare)
const services = expert.getServices('household', 'HealthManagement');
// Agent suggests: "Medical services include: MedicalCare, DentalCare, VisionCare"

// Step 3: Identify activity (Consultations)
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
// Agent suggests: "Medical care activities: Consultations, Prescriptions, TestResults"

// Step 4: Identify document type (Medical Receipt)
const docTypes = expert.getDocumentTypesForActivity('household', 'HealthManagement', 'MedicalCare', 'Consultations');
// Agent suggests: "Consultation documents: Medical Receipt, Referral Letter, Specialist Referral"

// Step 5: Generate tags and storage path
const tags = expert.generateHierarchicalTags('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: ['Function:HealthManagement', 'Service:MedicalCare', 'Activity:Consultations', 'DocumentType:MedicalReceipt']

const storagePath = expert.generateStoragePath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
// Returns: 'Health_Management/Medical_Care/Consultations/Medical_Receipt'
```

#### Compliance Guardian: Retention Checking with Hierarchy

When checking retention requirements, use hierarchical path for context:

```typescript
// User: "Can I delete this medical receipt from 2018?"

// Parse the hierarchical path
const path = 'HealthManagement/MedicalCare/Consultations/MedicalReceipt';
const parsed = expert.parsePath(path);
// Returns: { function: 'HealthManagement', service: 'MedicalCare', activity: 'Consultations', documentType: 'MedicalReceipt' }

// Get retention requirement with full context
const retention = expert.getRetentionForActivity(
  'household',
  parsed.function,
  parsed.service,
  parsed.activity,
  parsed.documentType
);
// Returns: {
//   years: 7,
//   legalCitation: 'ATO Record Keeping Requirements - Medical Expenses',
//   canDelete: false,
//   reason: 'Document from 2018 must be kept until 2025 (7 years)'
// }

// Agent response: "❌ Cannot delete. Medical receipts must be retained for 7 years per ATO requirements. This document can be deleted after 2025."
```

#### Archive Architect: Organizing with Hierarchical Paths

When designing storage structures, use hierarchical storage paths:

```typescript
// User: "Organize my health documents into a logical folder structure"

// Get all health-related document types with their full paths
const allDocTypes = expert.getAllDocumentTypes('household');
const healthDocs = allDocTypes.filter(dt => dt.path.startsWith('HealthManagement/'));

// Generate storage paths for each
healthDocs.forEach(docType => {
  const storagePath = expert.generateStoragePath(docType.path);
  console.log(`${docType.documentType} -> ${storagePath}`);
});

// Output:
// Medical Receipt -> Health_Management/Medical_Care/Consultations/Medical_Receipt
// Prescription -> Health_Management/Medical_Care/Prescriptions/Prescription
// Dental Invoice -> Health_Management/Dental_Care/Consultations/Dental_Invoice
// ...

// Agent creates folder structure:
// Health_Management/
// ├── Medical_Care/
// │   ├── Consultations/
// │   ├── Prescriptions/
// │   └── Test_Results/
// └── Dental_Care/
//     └── Consultations/
```

#### Deletion Auditor: Path Validation Before Deletion

When reviewing deletion requests, validate hierarchical paths:

```typescript
// User: "Delete all documents in HealthManagement/MedicalCare/OldRecords"

// Validate the path exists
const validation = expert.validatePath('household', 'HealthManagement/MedicalCare/OldRecords');
// Returns: { valid: false, reason: 'Activity "OldRecords" not found in service "MedicalCare"' }

if (!validation.valid) {
  // Agent response: "❌ Invalid path: HealthManagement/MedicalCare/OldRecords"
  // Agent suggests alternatives using autocomplete
  const suggestions = expert.autocomplete('household', 'HealthManagement/MedicalCare/');
  // Returns: ['HealthManagement/MedicalCare/Consultations', 'HealthManagement/MedicalCare/Prescriptions', ...]

  // Agent: "Did you mean one of these paths?"
  // - HealthManagement/MedicalCare/Consultations
  // - HealthManagement/MedicalCare/Prescriptions
  // - HealthManagement/MedicalCare/TestResults
}
```

### Autocomplete and Fuzzy Matching

All agents should use autocomplete for user-friendly path navigation:

```typescript
// User types partial path
const partial = 'health/med/cons';

// Get autocomplete suggestions with fuzzy matching
const suggestions = expert.autocomplete('household', partial);
// Returns: ['HealthManagement/MedicalCare/Consultations']

// User types case-insensitive
const suggestions2 = expert.autocomplete('household', 'HEALTH/medical');
// Returns: ['HealthManagement/MedicalCare/Consultations', 'HealthManagement/MedicalCare/Prescriptions', ...]

// Resolve partial path to see progress
const resolved = expert.resolvePath('household', 'health/med');
// Returns: {
//   suggestions: ['HealthManagement/MedicalCare/Consultations', 'HealthManagement/MedicalCare/Prescriptions', ...],
//   matched: ['HealthManagement', 'MedicalCare'],
//   remaining: 2  // Still need Activity and DocumentType
// }
```

### Keyword Search Across Hierarchy

When users describe documents in natural language, use keyword search:

```typescript
// User: "Where should I file my dentist bill?"

// Search by keywords
const results = expert.searchByKeyword('household', 'dentist bill invoice');
// Returns: [
//   {
//     path: 'HealthManagement/DentalCare/Consultations/DentalInvoice',
//     score: 0.95,
//     matchedKeywords: ['dental', 'invoice', 'dentist']
//   },
//   {
//     path: 'HealthManagement/DentalCare/Consultations/TreatmentPlan',
//     score: 0.65,
//     matchedKeywords: ['dental']
//   }
// ]

// Agent suggests: "Based on keywords, this should be filed as:"
// → HealthManagement/DentalCare/Consultations/DentalInvoice (95% match)
```

### Tag and Path Generation

Always generate tags and storage paths from validated hierarchical paths:

```typescript
// After classifying a document with path: 'FinanceManagement/Banking/Accounts/BankStatement'

// Generate hierarchical tags
const tags = expert.generateHierarchicalTags('FinanceManagement/Banking/Accounts/BankStatement');
// Returns: [
//   'Function:FinanceManagement',
//   'Service:Banking',
//   'Activity:Accounts',
//   'DocumentType:BankStatement'
// ]

// Generate storage path
const storagePath = expert.generateStoragePath('FinanceManagement/Banking/Accounts/BankStatement');
// Returns: 'Finance_Management/Banking/Accounts/Bank_Statement'

// Apply to paperless-ngx document
await paperlessClient.updateDocument(documentId, {
  tags: tags,
  custom_fields: {
    storage_path: storagePath,
    taxonomy_path: 'FinanceManagement/Banking/Accounts/BankStatement'
  }
});
```

### Error Handling

Handle invalid paths gracefully with helpful suggestions:

```typescript
// User provides invalid path
const path = 'HealthManagement/InvalidService/SomeActivity/Document';

// Validate first
const validation = expert.validatePath('household', path);
// Returns: {
//   valid: false,
//   reason: 'Service "InvalidService" not found in function "HealthManagement"',
//   suggestion: 'Did you mean: MedicalCare, DentalCare, VisionCare?'
// }

// Agent response:
// ❌ Invalid path: Service "InvalidService" not found
//
// Available services in HealthManagement:
// • MedicalCare
// • DentalCare
// • VisionCare
//
// Try: HealthManagement/MedicalCare/... instead
```

### Migration Support

During the transition period, support both hierarchical and flat taxonomies:

```typescript
// Check if hierarchical taxonomy is available
if (!expert.isHierarchicalAvailable()) {
  // Fall back to flat taxonomy methods
  const docTypes = expert.getDocumentTypes('household');
  const tags = expert.getTagCategories('household');
} else {
  // Use hierarchical methods (preferred)
  const mode = expert.getTaxonomyMode();  // Returns 'hierarchical' or 'dual-mode'

  if (mode === 'hierarchical') {
    // New documents: use hierarchical classification
    const functions = expert.getFunctions('household');
  } else {
    // Dual-mode: support both for backward compatibility
    // Use hierarchical for new documents, flat for legacy queries
  }
}
```

### Best Practices for Agents

1. **Progressive Navigation**: Guide users through Function → Service → Activity → DocumentType step-by-step
2. **Autocomplete**: Always offer autocomplete suggestions for partial paths
3. **Fuzzy Matching**: Accept case-insensitive inputs and fuzzy matches
4. **Keyword Search**: When users describe documents in natural language, use `searchByKeyword()`
5. **Path Validation**: Validate paths before applying tags or generating storage paths
6. **Error Recovery**: Provide helpful suggestions when paths are invalid
7. **Tag Generation**: Always use `generateHierarchicalTags()` for consistent tag format
8. **Storage Paths**: Always use `generateStoragePath()` for filesystem-safe paths
9. **Retention Context**: Include full hierarchical path when checking retention requirements
10. **Backward Compatibility**: Support flat taxonomy queries during transition period

---

### Agent Collaboration

Multiple agents can work together on complex tasks:

**Example: Annual Records Review**
1. **Records Keeper** analyzes current document organization
2. **Compliance Guardian** identifies retention requirements
3. **Archive Architect** suggests optimization strategies
4. **Deletion Auditor** reviews any proposed deletions for safety

### Environment Setup

All agents require the Records Manager environment variables:

```bash
MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"
MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-token"
MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
```

---

## Agent Prompts

Each agent was generated with a complete prompt including:
- Domain expertise and knowledge base
- Personality characteristics
- Approach methodology
- Voice identity for audio output
- Operational guidelines
- Response format requirements

To use an agent, capture its generated prompt and provide it to the Task tool with appropriate parameters.

---

## Voice Configuration

All agents have ElevenLabs voice IDs assigned:

| Agent | Voice | Voice Characteristics |
|-------|-------|---------------------|
| Records Keeper | Drew | Professional, balanced, neutral |
| Compliance Guardian | Joseph | Formal, authoritative, British |
| Archive Architect | Charlotte | Sophisticated, intellectual, precise |
| Deletion Auditor | George | Warm, academic, intellectual |

**Voice Server Integration:**
These agents work with the PAI Voice Server to deliver spoken responses with personality-appropriate voices.

---

## Usage Patterns

### Single Agent Usage

For focused tasks, invoke a single specialized agent:

```bash
# User: "Organize my tax documents with proper tags"
→ System invokes Records Keeper agent
→ Agent uses TaxonomyExpert and RecordManager tools
→ Agent provides organized taxonomy and tagging strategy
```

### Parallel Agent Usage

For comprehensive analysis, launch multiple agents in parallel:

```bash
# User: "Review my entire document management system"
→ System spawns all 4 agents in parallel
• Records Keeper: Analyzes organization and tagging
• Compliance Guardian: Checks retention compliance
• Archive Architect: Evaluates archive strategy
• Deletion Auditor: Reviews deletion safety
→ Agents provide coordinated insights
→ System synthesizes recommendations
```

### Sequential Agent Usage

For complex multi-step workflows:

```bash
# User: "Prepare to archive old documents"
→ 1. Records Keeper: Organizes and tags documents
→ 2. Compliance Guardian: Checks retention requirements
→ 3. Archive Architect: Designs archive structure
→ 4. Deletion Auditor: Reviews any deletions
→ Complete archive plan with safety approval
```

---

## Safety Considerations

### Deletion Auditor (Critical Role)

The Deletion Auditor agent is the **safety checkpoint** for all deletion operations:

1. **MANDATORY REVIEW**: All deletion requests route through this agent
2. **RETENTION CHECKING**: Verifies documents are past retention periods
3. **RISK ASSESSMENT**: Identifies potential issues with deletion
4. **EXPLICIT APPROVAL**: Requires exact confirmation phrase
5. **AUDIT LOGGING**: Records all deletion decisions for compliance

**Anti-Pattern:**
❌ Bypassing Deletion Auditor for batch deletions
❌ Using direct API deletion without agent review
❌ Ignoring agent warnings about retention periods

---

## Example Scenarios

### Scenario 1: Document Upload with Organization

```
User: "Upload these tax documents and organize them properly"

System Response:
→ Spawns Records Keeper agent
→ Agent analyzes filenames and content
→ Uses TaxonomyExpert to suggest tags
→ Calls RecordManager upload with intelligent metadata
→ Provides summary of organization applied
```

### Scenario 2: Proposed Deletion

```
User: "Delete all insurance documents from before 2020"

System Response:
→ Routes to DeleteConfirmation workflow
→ Spawns Deletion Auditor agent
→ Agent stress-tests the request:
  • Checks retention requirements
  • Identifies risks
  • Shows what will be deleted
  • Warns about consequences
→ Requires explicit confirmation phrase
→ Only after approval: executes via Compliance Guardian review
→ Logs decision to audit trail
```

### Scenario 3: Archive Planning

```
User: "Design an archive strategy for my corporate records"

System Response:
→ Spawns Archive Architect agent
→ Analyzes document collection structure
→ Designs tiered storage strategy
→ Optimizes for search and retrieval
→ Provides migration plan with timelines
→ Compliance Guardian reviews for retention compliance
→ Records Keeper optimizes taxonomies
→ Complete archival blueprint delivered
```

---

## Testing Agent Integration

Before using agents in production, test their integration:

```bash
# Test Records Keeper
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts organize --domain household
# Should trigger Records Keeper for taxonomy suggestions

# Test Compliance Guardian
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts retention --domain corporate
# Should trigger Compliance Guardian for retention requirements

# Test Archive Architect
# Provide complex document organization scenario
# Should trigger Archive Architect for strategic recommendations

# Test Deletion Auditor
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts delete --query "old documents"
# Should trigger Delete Auditor - REFUSES to delete without approval
### Scenario 3: Archive Planning

```
User: "Design an archive strategy for my corporate records"

System Response:
Spawns Archive Architect agent using AgentFactory:
```typescript
const { execSync } = require('child_process');
const agentPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: agentPrompt,
  subagent_type: "Intern",
  model: "sonnet"
})
```

Agent analyzes document collection structure
Designs tiered storage strategy
Optimizes for search and retrieval
Provides migration plan with timelines

Compliance Guardian reviews for retention compliance
Records Keeper optimizes taxonomies
Complete archival blueprint delivered
```

---

## Creating Specialized Agents with AgentFactory

All Records Manager agents are created using the Agents skill's AgentFactory tool with specific trait combinations:

### Agent Creation Commands

```bash
# Trust Validator Agent (Legal + Meticulous + Cautious + Thorough)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"
# Output: Prompt with Joseph voice (authoritative, British)

# Workflow Optimizer Agent (Technical + Analytical + Pragmatic + Systematic)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,systematic"
# Output: Prompt with Daniel voice (precise, intellectual)

# Sensitivity Scanner Agent (Security + Cautious + Systematic + Thorough)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "security,cautious,systematic,thorough"
# Output: Prompt with James voice (security-focused)

# Retention Monitor Agent (Business + Meticulous + Cautious + Systematic)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "business,meticulous,cautious,systematic"
# Output: Prompt with Joseph voice (authoritative, British)

# Entity Health Check Agent (Data + Analytical + Thorough + Systematic)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "data,analytical,thorough,systematic"
# Output: Prompt with Drew voice (balanced professional)

# Compliance Reporter Agent (Legal + Meticulous + Thorough + Systematic)
cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,thorough,systematic"
# Output: Prompt with Alice voice (precise, methodical)
```

### Using the Generated Agents

Each command outputs a complete agent prompt. Use it with the Task tool:

```typescript
// Example: Using the Trust Validator agent
const { execSync } = require('child_process');
const trustValidatorPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'uttf8', shell: true }
).stdout.toString();

Task({
  prompt: trustValidatorPrompt,
  subagent_type: "Intern",
  model: "sonnet"
});
```

This creates a specialized agent with:
- **Expertise**: Legal Analyst
- **Personality**: Meticulous, Cautious, Thorough
- **Approach**: Thorough
- **Voice**: Joseph (authoritative, British, ID: Zlb1dXrM7653N07WRdFW3)

The agent brings domain expertise and personality to trust document validation with ATO-compliant retention tracking and pre-EOFY compliance monitoring.

---

## Agent Creation Summary

All agents were created using the Agents skill's AgentFactory tool:

| Agent | Traits | Expertise | Voice |
|-------|--------|----------|-------|
| Records Keeper | meticulous, analytical, systematic | Research Specialist | Drew |
| Compliance Guardian | legal, cautious, meticulous, thorough | Legal Analyst | Joseph |
| Archive Architect | data, analytical, pragmatic, synthesizing | Data Analyst + Research | Charlotte |
| Deletion Auditor | security, skeptical, cautious, adversarial | Security + Communications | George |

Each agent is a dynamic composition specifically tailored for Records Manager skill workflows, with:
- Expert domain knowledge
- Personality-driven thinking style
- Systematic approach methodology
- Voice-matched audio output capability
- Complete operational guidelines

---

## Next Steps

1. **Test agents individually**: Verify each agent works with their specialized task
2. **Configure voice server**: Update VoiceServer configuration with agent voice IDs
3. **Create agent shortcuts**: Add skill-level routing for common agent patterns
4. **Document workflows**: Write specific workflow integrations for each agent
5. **Train users**: Explain when and how to use each specialized agent

---

**Version:** 1.0.0
**Created:** 2026-01-17
**For:** madeinoz-recordmanager-skill
**Using:** Agents skill v1.0.0
