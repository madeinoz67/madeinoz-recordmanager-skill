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

- Suggested document type
- Suggested tags
- Retention period and reason
- Created tag and document type IDs
- Uploaded document ID

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

- Total document count
- Document ID, title, created date, and tags for each result

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

- Count of untagged documents
- Suggested tags and document type for each document
- Confirmation when tags are applied (with `--apply`)

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

- Tag IDs that were created/found
- Confirmation for each tagged document

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

- Document ID and title
- Filename
- Created and modified dates
- Tags (with colors)
- Document type
- Retention period and reason (if applicable)
- Keep until date
- Whether deletion is allowed

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

- All document types for the domain
- Retention period in years
- Legal or regulatory reason for retention

---

### status

Test connection to paperless-ngx and display system status.

```bash
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

**Output:**

**1. Environment Configuration**
- PAPERLESS_URL (required)
- API_TOKEN (required)
- COUNTRY
- DEFAULT_DOMAIN

**2. API Connectivity**
- API endpoint reachability
- Authentication status

**3. Authentication & Data Access**
- Tag count
- Document type count
- Total document count

**4. Taxonomy Expert**
- Loaded country
- Document types defined
- Tag categories available

**Exit Codes:** `0` (all checks passed), `1` (checks failed)

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
