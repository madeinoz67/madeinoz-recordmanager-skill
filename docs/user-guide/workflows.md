# Workflows

Workflows are the primary mechanism for interacting with Records Manager. Each workflow handles a specific type of task, from uploading documents to validating trust compliance.

## Available Workflows

Records Manager provides 13 specialized workflows:

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| Upload | Add documents with intelligent tagging | "Upload this document" |
| Search | Find documents by tags, content, type | "Search for [query]" |
| Organize | Improve document structure | "Organize my records" |
| Tag | Add or modify tags | "Tag these documents" |
| Delete Confirmation | **Required approval for all deletions** | "Delete documents" |
| Retention | Check retention requirements | "What can I shred?" |
| Info | Get document details | "Show me document [ID]" |
| Add Entity | Create new entity | "Add a new entity" |
| Workflow Creator | Create automated workflows | "Create a workflow" |
| Workflow Review | Analyze workflow effectiveness | "Review workflow" |
| Trust Validation | Validate trust documents | "Validate trust documents" |
| FTE Check | Check FTE retention | "Check FTE retention" |
| Status Check | Test system connection | "Check status" |

## Upload Workflow

The Upload workflow handles document ingestion with automatic tagging and classification.

### When to Use

*   Adding new documents to your records
*   Scanning and storing receipts, invoices, or statements
*   Archiving important documents

### Process

1. **Provide File**: Specify the file path or document to upload

2. **Determine Domain**: System identifies domain (household/corporate/trust) from context or asks

3. **Suggest Tags**: TaxonomyExpert analyzes filename and suggests appropriate tags

4. **Create Tags**: Tags are created in paperless-ngx if they don't exist

5. **Upload**: Document is uploaded with all metadata

6. **Confirm**: System returns document ID and applied tags

### Example

```bash
# CLI usage
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts upload \
  /path/to/tax-return-2024.pdf --domain household
```

### Natural Language

```
User: "Store this medical receipt for tax"
AI: "Analyzing document..."
    "Suggested tags: medical, receipt, tax-deductible, 2024"
    "Uploading to paperless-ngx..."
    "✅ Document uploaded as #1234"
```

## Search Workflow

The Search workflow finds documents matching your criteria.

### When to Use

*   Locating specific documents
*   Reviewing documents by category or date
*   Preparing for tax time or audits

### Process

1. **Parse Criteria**: Extract search terms from your request

2. **Build Query**: Combine tags, types, dates, and text search

3. **Execute Search**: Query paperless-ngx API

4. **Present Results**: Show matches with document details

5. **Refine Option**: Offer to narrow or expand search

### Example

```bash
# CLI usage
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts search \
  --query "medical" --tags "receipt" --type "Medical Receipt"
```

### Search Tips

*   Use specific terms: "invoice 2024" instead of "recent documents"
*   Combine filters: tags + date range for precise results
*   Use document types: "Tax Return" for official tax documents
*   Search content: paperless-ngx indexes document text

## Organize Workflow

The Organize workflow analyzes and improves document structure.

### When to Use

*   Cleaning up untagged or poorly tagged documents
*   Improving overall document organization
*   Implementing consistent tagging practices

### Process

1. **Scan Documents**: Find untagged or sparsely tagged documents

2. **Analyze Patterns**: TaxonomyExpert suggests improvements

3. **Show Suggestions**: Display proposed tags and types

4. **Get Approval**: Ask before applying changes

5. **Update Metadata**: Apply approved changes in paperless-ngx

6. **Report Changes**: Summary of modifications made

### Example

```bash
# CLI usage - dry run
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts organize \
  --domain household

# CLI usage - apply changes
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts organize \
  --domain household --apply
```

## Tag Workflow

The Tag workflow adds or modifies tags on existing documents.

### When to Use

*   Adding category tags to multiple documents
*   Implementing new tagging scheme
*   Correcting incorrect tags

### Process

1. **Identify Documents**: Get document IDs to tag

2. **Verify Existence**: Confirm documents exist in paperless-ngx

3. **Create Tags**: Create new tags if needed

4. **Apply Tags**: Update document metadata

5. **Confirm Changes**: Show what was tagged

### Example

```bash
# CLI usage
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts tag \
  1234,5678 "tax-deductible" "2024"
```

## Delete Confirmation Workflow

**CRITICAL SAFETY FEATURE**: This is the ONLY workflow that can delete documents.

### Deletion Safety Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant RMC as RecordManager CLI
    participant DC as DeleteConfirmation Workflow
    participant DA as Deletion Auditor Agent
    participant CG as Compliance Guardian Agent
    participant RM as Retention Monitor Agent
    participant RK as Records Keeper Agent
    participant PC as PaperlessClient
    participant PNX as paperless-ngx API

    User->>+RMC: Delete command (e.g., "delete 2018 bank statements")
    RMC->>RMC: Parse deletion request
    RMC->>+DC: Trigger DeleteConfirmation workflow

    DC->>DC: Display warning message
    DC->>DC: List all documents for deletion
    DC-->>-User: Show deletion preview with exact details

    User->>+DC: Request proceed with deletion
    DC->>+DA: Initiate Deletion Auditor review

    %% Deletion Auditor Safety Review
    DA->>DA: Stress-test deletion request
    DA->>DA: Check for catastrophic loss scenarios
    DA->>+CG: Request compliance validation
    CG->>CG: Verify retention periods
    CG->>CG: Check regulatory requirements
    CG-->>-DA: Compliance status

    DA->>+RM: Request retention validation
    RM->>RM: Check retention periods against deletion list
    RM-->>-DA: Retention validation results

    DA->>+RK: Request document impact assessment
    RK->>RK: Analyze document relationships
    RK->>RK: Assess business impact
    RK-->>-DA: Impact assessment

    DA->>DA: Compile safety assessment report
    DA->>DA: Generate explicit warnings
    DA->>DA: Create exact confirmation requirement
    DA-->>-DC: Safety review complete

    DC->>DC: Present safety warnings and requirements
    DC-->>-User: Show exact confirmation phrase required

    alt User provides exact confirmation
        User->>+DC: Type exact phrase: "I understand this cannot be undone and I want to proceed with deleting N documents"
        DC->>DC: Verify exact match
        DC->>+PC: Execute deletion via PaperlessClient
        PC->>+PNX: DELETE /api/documents/{ids}/
        PNX-->>-PC: Deletion confirmation
        PC-->>-DC: Deletion successful
        DC->>DC: Log deletion to audit trail
        DC-->>-User: Confirm deletion with summary
    else User does not provide exact confirmation
        DC->>DC: Rejection logged
        DC-->>-User: Deletion cancelled
    end

    %% Post-deletion
    DC->>DC: Update document indexes
    DC->>DC: Trigger retention monitoring updates
    DC->>DC: Notify other agents of changes
    DC-->>-RM: Workflow complete
    RM-->>-User: Final confirmation
```

!!! warning
    **DELETION DISCLAIMER**

    While the Records Manager Skill and the Deletion Auditor agent provide safety checks and retention guidance, **you are ultimately responsible for verifying deletions and understanding retention requirements before deleting documents**.

    The system provides recommendations based on general taxonomies and common retention periods, but these may not apply to your specific situation. You should:

*   **Verify retention periods** apply to your jurisdiction and use case
*   **Consult with legal or tax professionals** for compliance-critical documents
*   **Understand that deletion is permanent** - once deleted, documents cannot be recovered
*   **Consider maintaining backups** of important documents, even after retention expires
*   **Review audit trails** regularly to track deletion decisions

    The Records Manager Skill and its agents provide tools to assist with document management, but **compliance is your responsibility**.

### When to Use

*   Removing documents past retention period
*   Cleaning up duplicate documents
*   Purging obsolete records

### Mandatory Approval Process

1. **Show Documents**: Display all documents that will be deleted (ID, title, date, tags)

2. **Check Retention**: Warn if any documents are within retention period

3. **Explain Consequences**: Explicitly state deletion is permanent and irreversible

4. **Require Exact Phrase**: You must type the exact confirmation phrase

5. **Execute Deletion**: Only after confirmation, delete documents

6. **Log Decision**: Record deletion to audit trail

### Safety Features

#### Deletion Auditor Agent Review
* **Adversarial Analysis**: Agent actively looks for what could go wrong

* **Risk Assessment**: Identifies potential business impact and data loss

* **Compliance Check**: Validates retention periods and regulatory requirements

* **Relationship Analysis**: Ensures dependent documents aren't affected

#### Multi-Agent Validation
* **Compliance Guardian**: Verifies legal compliance of deletion

* **Retention Monitor**: Confirms documents are past retention periods

* **Records Keeper**: Assesses impact on document relationships

#### Emergency Safeguards
* **Exact Phrase Requirement**: Cannot be bypassed or automated

* **Explicit Warnings**: Clear statement of permanent consequences

* **Audit Trail**: Complete documentation of deletion decision

* **Rollback Capability**: System state can be restored from backups

### Mandatory Confirmation Phrase

```
I understand this cannot be undone and I want to proceed with deleting N documents
```

The system will NOT accept:
* "yes"

* "do it"

* "proceed"

* "delete them"

* Any casual confirmation

### Example

```
User: "Delete my 2018 bank statements"
AI: "Found 12 documents matching criteria:"
    "  #4567: Bank Statement Jan 2018 (tags: financial, bank)"
    "  #4568: Bank Statement Feb 2018 (tags: financial, bank)"
    "  ..."
    ""
    "⚠️  RETENTION CHECK: These documents are past the 5-year retention period."
    ""
    "This action CANNOT be undone. Deleted documents are permanently removed."
    ""
    "To proceed, type exactly:"
    "  I understand this cannot be undone and I want to proceed with deleting 12 documents"
```

## Retention Workflow

The Retention workflow checks how long documents must be kept.

### When to Use

*   Determining what documents can be shredded
*   Planning document storage
*   Preparing for end of financial year

### Process

1. **Get Document Type**: Identify category or specific documents

2. **Lookup Requirements**: Query retention rules for country and type

3. **Show Retention Period**: Display years and legal reason

4. **Calculate Date**: Show when retention expires

5. **Advise Action**: Recommend archive, keep, or safe to delete

### Retention Periods (Australia)

| Document Type | Retention | Legal Basis |
|---------------|-----------|-------------|
| Tax Returns | 7 years | ATO Section 254 |
| Invoices/Receipts | 7 years | ATO substantiation |
| Bank Statements | 5 years | ATO evidence |
| Insurance Policies | 10 years | Until expired + claims |
| Trust Deed | 15 years | Permanent trust record |
| Family Trust Election | 5 years | From FTE date, not EOFY |

## Info Workflow

The Info workflow retrieves detailed metadata for a specific document.

### When to Use

*   Checking document tags and metadata
*   Verifying document details before operations
*   Reviewing retention status

### Example

```bash
# CLI usage
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts info 1234
```

## Add Entity Workflow

The Add Entity workflow creates new entity structures in paperless-ngx.

### When to Use

*   Setting up a new trust
*   Adding a business entity
*   Creating project organization

### Entity Types

*   **Household**: Personal records organization
*   **Corporate**: Business entity with ABN/TFN tracking
*   **Unit Trust**: Unit trust with unit registry
*   **Discretionary Trust**: Discretionary trust with beneficiary management
*   **Family Trust**: Family trust with FTE tracking
*   **Project**: Project-based document organization

### Example

```
User: "Add a family trust for Smith family"
AI: "Creating Smith Family Trust entity..."
    "I'll need some information:"
    "  - Trustee name?"
    "  - ABN?"
    "  - Family Trust Election date?"
    "  - TFN (optional)?"
    [Gathers information and creates entity]
    "✅ Entity created: smith-family-trust-2024"
```

## Workflow Creator

The Workflow Creator analyzes document patterns and recommends automated workflows.

### When to Use

*   Automating repetitive document tagging
*   Creating consistent document processing
*   Reducing manual organization effort

### Process

1. **Get Sample Documents**: Analyze existing documents

2. **Detect Patterns**: Identify commonalities in filename, content, tags

3. **Recommend Configuration**: Suggest match patterns and assignments

4. **Show Confidence**: Indicate reliability of recommendation

5. **Create Workflow**: Build workflow in paperless-ngx after approval

6. **Test Effectiveness**: Report match rate and accuracy

## Workflow Review

The Workflow Review analyzes existing workflow performance.

### When to Use

*   Troubleshooting workflow issues
*   Improving match accuracy
*   Optimizing automated processing

## Trust Validation

The Trust Validation workflow verifies trust document completeness.

### When to Use

*   End of financial year preparation
*   Trust establishment review
*   Compliance auditing

### Process

1. **Get Trust Type**: Identify trust structure

2. **Load Checklist**: Retrieve required documents for trust type

3. **Search Documents**: Find existing documents in paperless-ngx

4. **Compare Results**: Identify missing documents

5. **Report Status**: Show completeness with warnings

### Example

```
User: "Validate Smith Family Trust documents"
AI: "Checking Smith Family Trust completeness..."
    "Required documents (10):"
    "  ✅ Trust Deed"
    "  ✅ Family Trust Election (FTE) - Retain until 2025-02-01"
    "  ⚠️  Beneficiary Declaration - MISSING"
    "  ❌ TFN Registration - NOT FOUND"
    ""
    "Action items:"
    "  1. Upload Beneficiary Declaration"
    "  2. Upload TFN Registration"
    "  3. Create pre-EOFY trustee resolution (before June 30)"
```

## FTE Check

The FTE Check workflow verifies Family Trust Election retention compliance.

### Critical Distinction

**FTE retention is calculated from the FTE lodgment date, NOT EOFY.**

### Example

```
User: "When can I delete my Family Trust Election document?"
AI: "Family Trust Election Date: 2020-02-01"
    "Retention Period: 5 years from FTE date"
    "Retain Until: 2025-02-01"
    ""
    "⚠️  DO NOT DELETE before 2025-02-01"
    "ATO Requirement: Section 272-80 ITAA 1936"
    "Current Date: 2025-01-20"
    "Days Remaining: 12 days"
```

## Status Check

The Status Check workflow verifies paperless-ngx connectivity and system health.

### When to Use

*   Troubleshooting connection issues
*   Verifying installation
*   Pre-operation system check

### Example

```bash
# CLI usage
bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts status
```

## CLI Reference

All workflows are accessible via the RecordManager CLI tool:

```bash
# Show help
bun run src/skills/RecordsManager/Tools/RecordManager.ts --help

# Common commands
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload <file>
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --query <text>
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain <domain>
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

## Workflow Best Practices

1. **Always Review Suggestions**: Upload workflow suggests tags—review before confirming

2. **Check Retention First**: Use Retention workflow before any deletion

3. **Validate Regularly**: Run Trust Validation before EOFY for compliance

4. **Monitor Workflows**: Review workflow effectiveness monthly

5. **Use Specific Search**: Combine filters for faster document location
