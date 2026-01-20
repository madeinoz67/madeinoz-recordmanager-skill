# Tutorial: Your First Document Upload

This tutorial walks you through uploading your first document to paperless-ngx using the Records Manager Skill.

## Objective

Upload a document to paperless-ngx with automatic domain tagging and title suggestion.

## Prerequisites

- ✅ paperless-ngx instance running
- ✅ API token generated in paperless-ngx settings
- ✅ Environment variables configured (see [Configuration Guide](../configuration/index.md))
- ✅ A PDF or image file to upload

## Step 1: Verify Your Setup

First, confirm the Records Manager can connect to your paperless-ngx instance:

```bash
# Via PAI
records-manager status

# Or directly via CLI
bun run src/skills/RecordsManager/Tools/RecordManager.ts status
```

**Expected output:**
```
✓ Connected to paperless-ngx at https://your-instance.com
✓ API token validated
✓ Version: 1.16.0
```

**Troubleshooting:**
- If connection fails, verify `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` is correct
- If API token fails, regenerate in paperless-ngx (Settings → API Tokens)
- Check network connectivity to your paperless-ngx instance

## Step 2: Prepare Your Document

Create or locate a test document. For this tutorial, we'll use a sample invoice:

```bash
# Create a test file (or use your own)
echo "Sample Invoice #12345
Date: 2025-01-20
Amount: $150.00" > /tmp/sample-invoice.txt
```

## Step 3: Upload with Domain Tagging

Upload your document with automatic domain classification:

```bash
# Via PAI (recommended)
records-manager upload /tmp/sample-invoice.txt --domain household

# Or directly via CLI
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload \
  /tmp/sample-invoice.txt \
  --domain household
```

**Expected output:**
```
📤 Uploading document...
✓ Document uploaded successfully
  Document ID: 1234
  Title: Sample Invoice
  Domain: household
  URL: https://your-instance.com/documents/1234
```

## Step 4: Upload with Custom Metadata

For better organization, provide additional metadata:

```bash
records-manager upload /path/to/document.pdf \
  --domain corporate \
  --title "ACME Corp Invoice - January 2025" \
  --tags "invoice,2025,acme" \
  --document-type "invoice" \
  --created "2025-01-15"
```

**Parameters explained:**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `--domain` | Entity domain | `household`, `corporate`, `trust` |
| `--title` | Custom document title | `"Invoice #12345"` |
| `--tags` | Comma-separated tags | `"invoice,tax,2025"` |
| `--document-type` | Document type | `"invoice"`, `"receipt"`, `"contract"` |
| `--created` | Document date | `"2025-01-15"` |

## Step 5: Verify Upload in paperless-ngx

1. Open your paperless-ngx web interface
2. Navigate to **Documents**
3. Your document should appear with:
   - The assigned title
   - Domain-based tags
   - Correct document type

## Expected Outcomes

After completing this tutorial, you should be able to:

- ✅ Upload documents via CLI or PAI
- ✅ Assign domains and tags automatically
- ✅ Verify documents appear in paperless-ngx
- ✅ Understand basic upload parameters

## Troubleshooting

### Issue: "API token invalid"

**Solution:** Regenerate your API token in paperless-ngx:
1. Go to **Settings** → **API Tokens**
2. Click **Create new token**
3. Copy and update `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN`

### Issue: "Document upload failed"

**Solution:** Check file format support:
- Supported: PDF, PNG, JPEG, TIFF
- Max size: Depends on paperless-ngx configuration (typically 100MB)
- Verify file path is absolute, not relative

### Issue: "Domain not recognized"

**Solution:** Use valid domain values:
- `household` - Personal documents
- `corporate` - Business documents
- `unit-trust` - Unit trust documents
- `discretionary-trust` - Discretionary trust documents
- `family-trust` - Family trust documents
- `project` - Project-specific documents

## Next Steps

- Learn how to [Create Custom Entities](./entity-creation.md)
- Check [Retention Compliance](./retention-check.md)
- Explore [Batch Import](./batch-import.md) for multiple documents
