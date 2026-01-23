# CLI Command Reference

The Records Manager CLI provides a comprehensive command-line interface for all document management operations.

## Usage

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts <command> [options]
```

## Commands

### upload

Upload a document with intelligent tagging and metadata suggestions.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload <file> [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--title` | string | Custom document title (defaults to filename) |
| `--domain` | string | Domain: `household`, `corporate`, `unit-trust`, `discretionary-trust`, `family-trust`, `project` |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload invoice.pdf --domain corporate
```

**Output:**

*   Suggested document type
*   Suggested tags
*   Retention period and reason
*   Created tag and document type IDs
*   Uploaded document ID

---

### search

Search documents with filtering options.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts search [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--query` | string | Full-text search in document content |
| `--tags` | string | Comma-separated tag names to filter |
| `--type` | string | Document type filter |

**Examples:**

```bash
# Search by content
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --query "invoice"

# Search by tags
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --tags "tax,2024"

# Search by document type
bun run src/skills/RecordsManager/Tools/RecordManager.ts search --type "Tax Return"
```

**Output:**

*   Total document count
*   Document ID, title, created date, and tags for each result

---

### organize

Analyze and improve document organization with taxonomy suggestions. Dry run by default.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts organize [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to analyze |
| `--apply` | flag | Apply suggested tags (omits for dry run) |

**Examples:**

```bash
# Dry run - see suggestions only
bun run src/skills/RecordsManager/Tools/RecordManager.ts organize --domain household

# Apply suggestions automatically
bun run src/skills/RecordsManager/Tools/RecordManager.ts organize --domain household --apply
```

**Output:**

*   Count of untagged documents
*   Suggested tags and document type for each document
*   Confirmation when tags are applied (with `--apply`)

---

### tag

Add tags to one or more documents.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts tag <docIds> <tagNames>...
```

| Argument | Type | Description |
|----------|------|-------------|
| `docIds` | string | Comma-separated document IDs |
| `tagNames` | strings | Tag names to add (space-separated) |

**Example:**

```bash
# Tag multiple documents
bun run src/skills/RecordsManager/Tools/RecordManager.ts tag "123,456,789" tax 2024 corporate

# Tag single document
bun run src/skills/RecordsManager/Tools/RecordManager.ts tag "123" important
```

**Output:**

*   Tag IDs that were created/found
*   Confirmation for each tagged document

---

### info

Get detailed information about a document including retention status.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts info <docId>
```

| Argument | Type | Description |
|----------|------|-------------|
| `docId` | string | Document ID |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts info 12345
```

**Output:**

*   Document ID and title
*   Filename
*   Created and modified dates
*   Tags (with colors)
*   Document type
*   Retention period and reason (if applicable)
*   Keep until date
*   Whether deletion is allowed

---

### retention

Display retention requirements for all document types in a domain.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to show retention rules for |

**Examples:**

```bash
# Show default domain retention
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention

# Show corporate domain retention
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain corporate

# Show family trust retention
bun run src/skills/RecordsManager/Tools/RecordManager.ts retention --domain family-trust
```

**Output:**

*   All document types for the domain
*   Retention period in years
*   Legal or regulatory reason for retention

---

### status

Test connection to paperless-ngx and display system status.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

**Output:**

**1. Environment Configuration**

*   PAPERLESS_URL (required)

*   API_TOKEN (required)

*   COUNTRY

*   DEFAULT_DOMAIN

**2. API Connectivity**

*   API endpoint reachability

*   Authentication status

**3. Authentication & Data Access**

*   Tag count

*   Document type count

*   Total document count

**4. Taxonomy Expert**

*   Loaded country

*   Document types defined

*   Tag categories available

**Exit Codes:** `0` (all checks passed), `1` (checks failed)

---

### install

Install default country-specific taxonomies during initial setup.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts install [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--country` | string | Country for taxonomy installation (default: Australia) |
| `--json` | flag | Output JSON format for scripting |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts install --country Australia
```

**Output:**

* Country installed
* Entity types installed
* Tags created count
* Document types created count
* Storage paths created count
* Custom fields created count
* Skipped resources (existing)

---

### check-updates

Check for available taxonomy updates from YAML definitions.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--country` | string | Country to check updates for (default: Australia) |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia
```

**Output:**

* **New Tags**: Tags that will be created
* **New Document Types**: Document types that will be created
* **New Storage Paths**: Storage paths that will be created
* **New Custom Fields**: Custom fields that will be created
* **⚠️ Retention Rule Changes**: Changes requiring manual review (if any)

**Note:** This command performs a dry-run and does not modify your paperless-ngx instance.

---

### sync-taxonomies

Synchronize taxonomies by applying detected updates.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--country` | string | Country to synchronize (default: Australia) |
| `--approve-retention-changes` | flag | **Required** if retention rule changes are detected |

**Examples:**

```bash
# Apply updates without retention changes
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia

# Apply updates WITH retention changes (requires explicit approval)
bun run src/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --country Australia --approve-retention-changes
```

**Output:**

* Applied changes summary:
  * Tags created
  * Document types created
  * Storage paths created
  * Custom fields created
  * Retention rules updated (if approved)

**Safety Features:**

* Atomic transaction with rollback on failure
* Manual review required for retention rule changes
* Preserves existing user customizations

---

### diff-taxonomies

Display taxonomy version history and changelog.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies
```

**Output:**

* Current taxonomy version
* Last update date
* Complete changelog with all versions:
  * Version number
  * Release date
  * List of changes

**Example Output:**

```
📋 Taxonomy Version History

Current Version: 1.0.0
Last Updated: 2026-01-22

📜 Changelog:

Version 1.0.0 (2026-01-22)
   • Initial taxonomy definitions for Australia, United States, United Kingdom
   • Complete household, corporate, and trust domain taxonomies
   • Country-specific retention rules with legal citations
```

---

---

### delete

**WARNING:** Direct deletion is not supported through the CLI.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts delete <query>
```

This command will fail with a message directing you to use the `DeleteConfirmation` workflow. This safety measure prevents catastrophic data loss.

## Error Handling

All commands return exit code `1` on error with descriptive error messages:

```bash
❌ Error: Failed to connect to paperless-ngx API
❌ Error: Document 12345 not found
❌ Error: Invalid domain: invalid-domain
```

---

## Hierarchical Taxonomy Commands (v2.0)

The following commands support the new hierarchical taxonomy system with 4-level classification: Function → Service → Activity → DocumentType.

### taxonomy functions

Get all functions (top-level categories) for a domain.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query (defaults to `$MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN`) |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions --domain household
```

**Output:**

```
Functions for household:
• HealthManagement - Health and medical records management
• FinanceManagement - Financial records and tax documentation
• PropertyManagement - Property ownership and maintenance
• VehicleManagement - Vehicle ownership and maintenance
• EducationManagement - Education and training records
• LegalManagement - Legal documents and compliance
```

---

### taxonomy services

Get all services within a function.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy services [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--function` | string | Function name (e.g., 'HealthManagement') |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy services \
  --domain household \
  --function HealthManagement
```

**Output:**

```
Services in HealthManagement:
• MedicalCare - General medical and healthcare services
• DentalCare - Dental health services
• VisionCare - Vision and eye care services
```

---

### taxonomy activities

Get all activities within a service.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy activities [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--function` | string | Function name |
| `--service` | string | Service name (e.g., 'MedicalCare') |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy activities \
  --domain household \
  --function HealthManagement \
  --service MedicalCare
```

**Output:**

```
Activities in HealthManagement/MedicalCare:
• Consultations - Medical consultations and visits
• Prescriptions - Medication prescriptions and receipts
• TestResults - Medical test results and reports
```

---

### taxonomy documenttypes

Get all document types for an activity.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy documenttypes [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--path` | string | Hierarchical path to activity (Format: `Function/Service/Activity`) |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy documenttypes \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations"
```

**Output:**

```
Document Types in HealthManagement/MedicalCare/Consultations:
• Medical Receipt
• Referral Letter
• Specialist Referral
```

---

### taxonomy autocomplete

Get autocomplete suggestions for a partial hierarchical path.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--path` | string | Partial hierarchical path (supports fuzzy matching) |

**Features:**
- Case-insensitive matching
- Fuzzy substring matching
- Progressive path completion

**Examples:**

```bash
# Partial function name
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete \
  --domain household \
  --path "health"

# Output:
# Suggestions for "health":
# • HealthManagement/MedicalCare/Consultations/MedicalReceipt
# • HealthManagement/MedicalCare/Prescriptions/Prescription
# • HealthManagement/DentalCare/Consultations/DentalInvoice
# ...

# Multiple levels
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete \
  --domain household \
  --path "health/med/cons"

# Output:
# Suggestions for "health/med/cons":
# • HealthManagement/MedicalCare/Consultations/MedicalReceipt
# • HealthManagement/MedicalCare/Consultations/ReferralLetter
# • HealthManagement/MedicalCare/Consultations/SpecialistReferral
```

---

### taxonomy search

Search for hierarchical paths by keywords (natural language).

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy search [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--keywords` | string | Space-separated keywords describing the document |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy search \
  --domain household \
  --keywords "dental invoice consultation"
```

**Output:**

```
Search results for "dental invoice consultation":
1. HealthManagement/DentalCare/Consultations/DentalInvoice (score: 0.95)
   Matched keywords: dental, invoice, consultation
2. HealthManagement/DentalCare/Consultations/TreatmentPlan (score: 0.65)
   Matched keywords: dental, consultation
```

---

### taxonomy validate

Validate a hierarchical path exists in the taxonomy.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy validate [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--path` | string | Full hierarchical path to validate (Format: `Function/Service/Activity/DocumentType`) |

**Example:**

```bash
# Valid path
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy validate \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"

# Output:
# ✓ Path is valid
# Components:
#   Function: HealthManagement
#   Service: MedicalCare
#   Activity: Consultations
#   DocumentType: MedicalReceipt

# Invalid path
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy validate \
  --domain household \
  --path "HealthManagement/InvalidService/Test/Doc"

# Output:
# ✗ Invalid path
# Reason: Service "InvalidService" not found in function "HealthManagement"
# Suggestion: Did you mean: MedicalCare, DentalCare, VisionCare?
```

---

### taxonomy generate-tags

Generate hierarchical tags from a validated path.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy generate-tags [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--path` | string | Full hierarchical path |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy generate-tags \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
```

**Output:**

```
Hierarchical tags for: HealthManagement/MedicalCare/Consultations/MedicalReceipt
• Function:HealthManagement
• Service:MedicalCare
• Activity:Consultations
• DocumentType:MedicalReceipt
```

---

### taxonomy generate-path

Generate a filesystem-safe storage path from a hierarchical path.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy generate-path [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--path` | string | Full hierarchical path |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy generate-path \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
```

**Output:**

```
Storage path for: HealthManagement/MedicalCare/Consultations/MedicalReceipt
→ Health_Management/Medical_Care/Consultations/Medical_Receipt

(Filesystem-safe: PascalCase → Snake_Case)
```

---

### taxonomy retention

Get retention requirements for a specific document type.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy retention [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to query |
| `--path` | string | Full hierarchical path to document type |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts taxonomy retention \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
```

**Output:**

```
Retention requirements for: HealthManagement/MedicalCare/Consultations/MedicalReceipt

Country: Australia
Retention Period: 7 years
Legal Citation: ATO Record Keeping Requirements - Medical Expenses
Reasoning: Medical expenses may be claimed as tax deductions for 7 years

Example document from 2019:
  Can delete: No
  Reason: Document from 2019 must be kept until 2026 (7 years)
```

---

### upload (with hierarchical path)

Upload a document with hierarchical classification. Updated in v2.0.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload <file> [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--title` | string | Custom document title (defaults to filename) |
| `--domain` | string | Domain: `household`, `corporate`, etc. |
| `--path` | string | **NEW v2.0:** Full hierarchical path for classification |

**Example:**

```bash
# Upload with hierarchical path
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload medical-receipt.pdf \
  --domain household \
  --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
```

**Output:**

```
Uploading: medical-receipt.pdf
Domain: household
Hierarchical Path: HealthManagement/MedicalCare/Consultations/MedicalReceipt

Generated tags:
• Function:HealthManagement
• Service:MedicalCare
• Activity:Consultations
• DocumentType:MedicalReceipt

Storage path: Health_Management/Medical_Care/Consultations/Medical_Receipt
Retention: 7 years (ATO Record Keeping Requirements)

✓ Document uploaded successfully (ID: 12345)
```

---

### migration status

Check migration status from flat to hierarchical taxonomies.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts migration status [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to check |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts migration status --domain household
```

**Output:**

```
Migration Status for household:
Total Documents: 1000
With Hierarchical Tags: 950 (95%)
With Storage Paths: 950 (95%)
Missing Mappings: 50 (5%)

Status: Migration 95% complete
Remaining: 50 documents need manual review
```

---

### migration verify

Verify migration completeness.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts migration verify [options]
```

| Option | Type | Description |
|--------|------|-------------|
| `--domain` | string | Domain to verify |

**Example:**

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts migration verify --domain household
```

**Output:**

```
✓ Migration Verification Results:
  Total Documents: 1000
  With Hierarchical Tags: 1000 (100%)
  With Storage Paths: 1000 (100%)
  Missing Mappings: 0 (0%)

✓ All documents successfully migrated
```

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` | Yes | Full URL to paperless-ngx instance |
| `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` | Yes | API token from paperless-ngx settings |
| `MADEINOZ_RECORDMANAGER_COUNTRY` | No | Country for compliance (default: Australia) |
| `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN` | No | Default domain (default: household) |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (details printed to stderr) |
