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

Your task:
1. Classify document sensitivity (Public, Internal, Confidential, Restricted)
2. Detect PHI (HIPAA): SSN, DOB, medical record numbers, health info
3. Detect PCI-DSS: Credit card numbers, CVV, expiry dates
4. Detect PII (GDPR): Names, addresses, emails, phone numbers
5. Detect legal privilege markers
6. Recommend sensitivity tags and security controls

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

Your task:
1. Identify document type from TaxonomyExpert
2. Suggest appropriate tags based on content
3. Determine retention requirements
4. Recommend storage path

Return: { documentType, tags, retentionYears, storagePath }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

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
