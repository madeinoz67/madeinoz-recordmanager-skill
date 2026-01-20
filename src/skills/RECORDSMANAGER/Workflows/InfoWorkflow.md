# Info Workflow

> Get detailed information about a specific document including metadata, tags, retention, and sensitivity

## Triggers

- "Info on document #1234"
- "Show me [document]"
- "Document details for [id]"
- "What's in document #[id]?"
- "Metadata for [document]"

## Agents Used

This workflow typically does not require agents for basic info retrieval. However, specialized agents may be invoked for extended analysis:

| Agent | Role | When Used |
|-------|------|-----------|
| **Compliance Guardian ⚖️** | Retention analysis | When user asks about retention/compliance |
| **Sensitivity Scanner 🔒** | Classification check | When user asks about sensitivity |

## Process

### Step 1: Retrieve Document

```bash
bun run Tools/RecordManager.ts info --id ${documentId}
```

### Step 2: Present Document Information

```
📄 Document Information

══════════════════════════════════════════════════
ID: #1234
Title: Medical_Receipt_Pharmacy_20240315.pdf
══════════════════════════════════════════════════

BASIC INFO:
  Created: 2024-03-15 14:23:45
  Modified: 2024-03-15 14:23:45
  Added: 2024-03-16 09:15:22
  Pages: 1
  File size: 245 KB
  Original filename: scan_20240315_001.pdf

CLASSIFICATION:
  Document type: Medical Receipt
  Correspondent: Priceline Pharmacy
  Storage path: /Household/Medical/Receipts

TAGS (6):
  🏷️  household
  🏷️  medical
  🏷️  receipt
  🏷️  2024
  🏷️  tax-deductible
  🏷️  pharmacy

SENSITIVITY:
  Level: CONFIDENTIAL
  Color: 🟠 Orange
  Contains: PII (name, address)

RETENTION:
  Retain until: 2031-03-15 (7 years)
  Days remaining: 1,881 days
  Basis: ATO tax deduction substantiation

ENTITY:
  Not assigned to entity

CUSTOM FIELDS:
  Amount: $89.95
  Vendor: Priceline Pharmacy

══════════════════════════════════════════════════

Actions:
  • tag #1234 [tag] - Add tag
  • edit #1234 - Edit metadata
  • download #1234 - Download original
  • delete #1234 - Delete (requires confirmation)
```

### Step 3: Extended Analysis (Optional)

If user requests deeper analysis, invoke appropriate agents:

#### Retention Analysis
```typescript
// User: "What are the retention requirements for #1234?"
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `
Analyze retention requirements for this document:
${documentDetails}

Provide:
- Legal retention requirement
- Regulatory basis
- Safe deletion date
- Any special considerations
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

#### Sensitivity Analysis
```typescript
// User: "Is #1234 properly classified?"
const sensitivityScannerPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "security,cautious,systematic,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: sensitivityScannerPrompt + `
Review sensitivity classification for this document:
${documentDetails}

Verify:
- Current classification is appropriate
- All sensitive data types detected
- Security controls are adequate
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Information Fields

### Basic Metadata
| Field | Description |
|-------|-------------|
| ID | Unique document identifier |
| Title | Document title |
| Created | Original document date |
| Modified | Last modification date |
| Added | Date added to paperless-ngx |
| Pages | Number of pages |
| File size | Size in KB/MB |

### Classification
| Field | Description |
|-------|-------------|
| Document type | Category (Invoice, Receipt, etc.) |
| Correspondent | Sender/source organization |
| Storage path | Virtual folder location |

### Tags
All tags applied to the document, including:
- Domain tags
- Category tags
- Year tags
- Entity tags
- Sensitivity tags

### Retention
| Field | Description |
|-------|-------------|
| Retain until | Date document must be kept until |
| Days remaining | Days until retention period ends |
| Basis | Legal/regulatory basis for retention |

### Custom Fields
Entity-specific fields like:
- ABN (for business entities)
- FTE Date (for family trusts)
- Amount (for financial documents)

## CLI Integration

```bash
# Get document info
bun run Tools/RecordManager.ts info --id 1234

# Get info by title search
bun run Tools/RecordManager.ts info --title "Medical Receipt"

# Get info with retention analysis
bun run Tools/RecordManager.ts info --id 1234 --retention

# Get info with sensitivity analysis
bun run Tools/RecordManager.ts info --id 1234 --sensitivity

# Get info in JSON format
bun run Tools/RecordManager.ts info --id 1234 --json

# Download document
bun run Tools/RecordManager.ts download --id 1234 --output ./

# Open document in viewer
bun run Tools/RecordManager.ts open --id 1234
```

## Quick Actions

From the info view, users can:

| Action | Command | Description |
|--------|---------|-------------|
| Add tag | `tag #1234 medical` | Apply tag to document |
| Remove tag | `untag #1234 old-tag` | Remove tag from document |
| Edit | `edit #1234` | Modify document metadata |
| Download | `download #1234` | Download original file |
| Delete | `delete #1234` | Delete (with confirmation) |
| Assign entity | `assign #1234 smith-trust` | Assign to entity |

## Error Handling

| Error | Resolution |
|-------|------------|
| Document not found | Verify document ID, check permissions |
| Access denied | Check API token permissions |
| Connection failed | Verify paperless-ngx URL and connectivity |

## Related Workflows

- `SearchWorkflow.md` - Find documents (uses Records Keeper)
- `TagWorkflow.md` - Modify tags (uses Records Keeper)
- `RetentionWorkflow.md` - Detailed retention analysis (uses Retention Monitor)
- `DeleteConfirmation.md` - Delete document (uses Deletion Auditor)
