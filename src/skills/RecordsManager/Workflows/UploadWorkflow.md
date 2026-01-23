# Upload Workflow

> Upload documents to paperless-ngx with intelligent tagging and sensitivity classification

## Triggers

- "Upload this document"
- "Store this file"
- "Add to records"
- "Save this [document type]"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Sensitivity Scanner 🔒** | Data classification & DLP | Scans EVERY upload for sensitive data (PHI, PCI, PII) |
| **Records Keeper 📋** | Taxonomy & tagging | Suggests optimal tags based on content and filename |

### Sensitivity Scanner Agent (AUTOMATIC)

**Domain:** Security Expert (Data Loss Prevention & Classification)

**Personality:** Cautious, Systematic

**Approach:** Systematic, Thorough

**Voice:** James (security-focused - ID: ZQe5CZNOzWyzPSCn5a3c)

```typescript
const { execSync } = require('child_process');
const sensitivityScannerPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "security,cautious,systematic,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: sensitivityScannerPrompt + `

SENSITIVITY SCAN REQUEST:
Filename: ${filename}
Content preview: ${contentPreview}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL sensitivity tags MUST come from TaxonomyExpert.getTagCategories(domain)
- DO NOT invent or hardcode tags - retrieve from taxonomy
- Use TaxonomyExpert as single source of truth for all document classifications

Your task:
1. Classify document sensitivity (Public, Internal, Confidential, Restricted)
2. Detect PHI (HIPAA): SSN, DOB, medical record numbers, health info
3. Detect PCI-DSS: Credit card numbers, CVV, expiry dates
4. Detect PII (GDPR): Names, addresses, emails, phone numbers
5. Detect legal privilege markers
6. Recommend ONLY sensitivity tags that exist in TaxonomyExpert for this domain

Return: { level, tags, warnings, securityRequirements }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Records Keeper Agent (For Tagging)

```typescript
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

TAG SUGGESTION REQUEST:
Filename: ${filename}
Domain: ${domain}
Content preview: ${contentPreview}
Country: ${country}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL suggestions MUST come from TaxonomyExpert hierarchical methods - NO hardcoded values
- For hierarchical navigation, use:
  * TaxonomyExpert.getFunctions(domain) - List all functions
  * TaxonomyExpert.getServices(domain, functionName) - List services in a function
  * TaxonomyExpert.getActivities(domain, functionName, serviceName) - List activities in a service
  * TaxonomyExpert.getDocumentTypesForActivity(domain, functionName, serviceName, activityName) - Get document types for an activity
  * TaxonomyExpert.getRetentionForActivity(domain, functionName, serviceName, activityName) - Get retention rules
- DO NOT guess or invent retention periods - retrieve from TaxonomyExpert
- Use TaxonomyExpert as single source of truth for all document classifications

HIERARCHICAL FSA TAG REQUIREMENT (MANDATORY):
- MUST use FULL FSA path format for hierarchical classification
- Format: "Function/Service/Activity" (e.g., "PetCare/EndOfLifeCare/Cremation")
- NEVER suggest individual level tags (e.g., DO NOT suggest "PetCare", "EndOfLifeCare", "Cremation" separately)
- Use TaxonomyExpert.generateHierarchicalTags() to get correct full path format
- Example correct: "HealthManagement/MedicalCare/DoctorVisits"
- Example WRONG: ["HealthManagement", "MedicalCare", "DoctorVisits"]
- Each document MUST have exactly ONE full FSA path tag for primary classification

Your task:
1. Navigate hierarchy: getFunctions() → getServices() → getActivities()
2. Identify activity that matches the document content/filename
3. Suggest document types from getDocumentTypesForActivity()
4. Suggest tags based on function/service/activity names
5. Get retention from getRetentionForActivity() with country-specific rules
6. Recommend storage path based on domain (e.g., /Household/FinancialManagement/Accounting/Bookkeeping)

Return: { function, service, activity, documentType, tags, retentionYears, retentionReason, storagePath }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Validation Checkpoint (REQUIRED)

**After receiving agent suggestions, validate against TaxonomyExpert:**

```typescript
import { TaxonomyExpert } from '../Lib/TaxonomyExpert.js';

// Create TaxonomyExpert instance
const expert = new TaxonomyExpert(country, domain, 'hierarchical');

// Validate Records Keeper suggestions
const validationErrors = [];

// Validate function exists
if (recordsKeeperResponse.function) {
  const functions = expert.getFunctions(domain);
  if (!functions.some(f => f.name === recordsKeeperResponse.function)) {
    validationErrors.push(`Invalid function: ${recordsKeeperResponse.function}`);
  }
}

// Validate service exists for function
if (recordsKeeperResponse.service && recordsKeeperResponse.function) {
  const services = expert.getServices(domain, recordsKeeperResponse.function);
  if (!services.some(s => s.name === recordsKeeperResponse.service)) {
    validationErrors.push(`Invalid service: ${recordsKeeperResponse.service} for function ${recordsKeeperResponse.function}`);
  }
}

// Validate activity exists for service
if (recordsKeeperResponse.activity && recordsKeeperResponse.service) {
  const activities = expert.getActivities(domain, recordsKeeperResponse.function, recordsKeeperResponse.service);
  if (!activities.some(a => a.name === recordsKeeperResponse.activity)) {
    validationErrors.push(`Invalid activity: ${recordsKeeperResponse.activity} for service ${recordsKeeperResponse.service}`);
  }
}

// Validate document type exists for activity
if (recordsKeeperResponse.documentType && recordsKeeperResponse.activity) {
  const docTypes = expert.getDocumentTypesForActivity(
    domain,
    recordsKeeperResponse.function,
    recordsKeeperResponse.service,
    recordsKeeperResponse.activity
  );
  if (!docTypes.includes(recordsKeeperResponse.documentType)) {
    validationErrors.push(`Invalid document type: ${recordsKeeperResponse.documentType} for activity ${recordsKeeperResponse.activity}`);
  }
}

// Validate retention matches TaxonomyExpert
if (recordsKeeperResponse.activity) {
  const retention = expert.getRetentionForActivity(
    domain,
    recordsKeeperResponse.function,
    recordsKeeperResponse.service,
    recordsKeeperResponse.activity
  );

  const countryRetention = retention[countryCode] || retention.AU;
  if (countryRetention && recordsKeeperResponse.retentionYears !== countryRetention.years) {
    validationErrors.push(`Retention mismatch: suggested ${recordsKeeperResponse.retentionYears} years, expected ${countryRetention.years} years from TaxonomyExpert`);
  }
}

if (validationErrors.length > 0) {
  console.error('❌ Agent suggestions failed validation:');
  validationErrors.forEach(err => console.error(`   - ${err}`));

  // Write validation failure to audit log
  const auditLog = {
    timestamp: new Date().toISOString(),
    workflow: 'UploadWorkflow',
    agent: 'Records Keeper',
    country,
    domain,
    errors: validationErrors,
    suggestions: recordsKeeperResponse
  };

  // TODO: Write to audit log file
  console.error('Validation failure logged for audit:', JSON.stringify(auditLog, null, 2));

  // REJECT invalid suggestions - DO NOT proceed with upload
  throw new Error('Agent suggestions do not match TaxonomyExpert - aborting upload');
}

// Validation passed - proceed with upload
console.log('✅ Agent suggestions validated against TaxonomyExpert');
```

**Validation checks:**
- Function exists in TaxonomyExpert.getFunctions(domain)
- Service exists in TaxonomyExpert.getServices(domain, function)
- Activity exists in TaxonomyExpert.getActivities(domain, function, service)
- Document type exists in TaxonomyExpert.getDocumentTypesForActivity(domain, function, service, activity)
- Retention years match TaxonomyExpert.getRetentionForActivity() for the country
- Retention reason matches TaxonomyExpert citation

## Process

### Step 1: Receive Document

```bash
# Accept file path from user
bun run Tools/RecordManager.ts upload <file_path> --domain <domain>
```

### Step 2: Sensitivity Scan (AUTOMATIC)

**Sensitivity Scanner agent analyzes document:**

1. Extract text content from document
2. Scan for sensitive data patterns:
   - **PHI (HIPAA):** SSN, DOB, medical record numbers, phone, email + health context
   - **PCI-DSS:** Credit card numbers (13-19 digits), CVV, expiry dates
   - **PII (GDPR):** Names + addresses, emails, phone numbers
   - **Legal:** Attorney-client privilege markers, settlement language
3. Classify sensitivity level:
   - **Public** (green): No sensitive data
   - **Internal** (yellow): Company-only information
   - **Confidential** (orange): Business-sensitive, PII
   - **Restricted** (red): PHI, PCI, legal privilege
4. Apply sensitivity tags automatically

### Step 3: Taxonomy Analysis

**Records Keeper agent suggests metadata:**

1. Analyze filename and content
2. Match against known document types
3. Suggest tags from TaxonomyExpert
4. Determine retention requirements
5. Recommend storage path

### Step 4: User Confirmation

Present suggestions to user:

```
📄 Document Analysis Complete

Filename: medical_receipt_2024.pdf
Sensitivity: CONFIDENTIAL (PHI detected)
  ⚠️ Contains: SSN, DOB, Phone number

Suggested metadata:
  • Document type: Medical Receipt
  • Tags: medical, receipt, tax-deductible, 2024, confidential
  • Retention: 7 years (ATO requirement)
  • Storage path: /Household/Medical/Receipts

Security requirements:
  • Encryption: Required
  • Access control: Required
  • Audit logging: Required

Proceed with upload? (yes/no)
```

### Step 5: Upload to paperless-ngx

```typescript
// Upload document with metadata
const result = await paperlessClient.uploadDocument(
  filePath,
  {
    title: suggestedTitle,
    tags: tagIds,
    documentType: documentTypeId,
    storagePath: storagePathId,
    customFields: sensitivityFields
  }
);
```

### Step 6: Confirm Upload

```
✅ Document uploaded successfully

Document ID: #1234
Title: medical_receipt_2024.pdf
Tags: medical, receipt, tax-deductible, 2024, confidential
Sensitivity: CONFIDENTIAL
Retention until: 2031-01-19

🔒 Security controls applied:
  • Document encrypted at rest
  • Access restricted to authorized users
  • Audit logging enabled
```

## Sensitivity Classification Matrix

| Level | Color | Triggers | Security Requirements |
|-------|-------|----------|----------------------|
| **Public** | Green (#00C853) | Press releases, brochures | None |
| **Internal** | Yellow (#FFD600) | Internal policies, SOPs | Access control |
| **Confidential** | Orange (#FF6D00) | Invoices, PII, contracts | Encryption, audit |
| **Restricted** | Red (#D50000) | PHI, PCI, legal privilege | Full DLP, encryption |

## CLI Integration

```bash
# Upload with auto-classification
bun run Tools/RecordManager.ts upload ./document.pdf --domain household

# Upload with explicit sensitivity override
bun run Tools/RecordManager.ts upload ./document.pdf --sensitivity restricted

# Batch upload with scanning
bun run Tools/RecordManager.ts upload ./documents/ --batch --scan
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Unsupported file type | Convert to PDF or supported format |
| Sensitivity scan failed | Manual classification required |
| Tag creation failed | Check paperless-ngx permissions |
| Upload timeout | Retry or check network connection |

## Related Workflows

- `SearchWorkflow.md` - Find uploaded documents (uses Records Keeper)
- `OrganizeWorkflow.md` - Improve taxonomy after upload (uses Records Keeper)
- `RetentionWorkflow.md` - Check retention requirements (uses Retention Monitor)
