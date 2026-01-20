# Tutorial: Bulk Document Import

This tutorial guides you through importing multiple documents efficiently, with automatic tagging and organization.

## Objective

Import multiple documents in bulk with consistent tagging, domain assignment, and metadata.

## Prerequisites

- ✅ Completed [First Upload](./first-upload.md) tutorial
- ✅ Entities created (see [Entity Creation](./entity-creation.md))
- ✅ Multiple documents prepared for import
- ✅ Understanding of your desired folder/tag structure

## Step 1: Prepare Your Document Structure

Organize your documents for efficient import:

```
~/Documents/Import/
├── corporate/
│   ├── invoices/
│   │   ├── 2024/
│   │   │   ├── acme-jan.pdf
│   │   │   └── acme-feb.pdf
│   │   └── 2025/
│   │       └── acme-jan.pdf
│   └── contracts/
│       └── vendor-agreement.pdf
├── household/
│   ├── receipts/
│   └── insurance/
└── trust/
    └── deeds/
        └── smith-trust-deed.pdf
```

**Tips for organization:**
- Group by entity (corporate, household, trust)
- Separate by document type (invoices, receipts, contracts)
- Use date-based folders for chronological sorting
- Keep filenames descriptive but consistent

## Step 2: Single Folder Bulk Import

Import all documents from a single folder:

```bash
# Via PAI
records-manager upload ~/Documents/Import/corporate/invoices/2024/ \
  --domain corporate \
  --document-type invoice \
  --tags "2024,invoice" \
  --batch

# Or directly
bun run src/skills/RecordsManager/Tools/RecordManager.ts upload \
  ~/Documents/Import/corporate/invoices/2024/ \
  --domain corporate \
  --document-type invoice \
  --tags "2024,invoice" \
  --batch
```

**Expected output:**
```
📤 Batch Upload Started
Folder: ~/Documents/Import/corporate/invoices/2024/
Documents found: 24

Progress:
[████████████████████████████████████] 100%
✓ Uploaded: acme-jan.pdf
✓ Uploaded: acme-feb.pdf
✓ Uploaded: acme-mar.pdf
...

Summary:
✓ Successfully uploaded: 24
✗ Failed: 0
⏱️  Duration: 2m 15s

Next steps:
- Review uploaded documents at: https://your-instance.com/documents
- Run: records-manager search --tag "2024,invoice"
```

## Step 3: Recursive Import with Date Parsing

Import from a folder tree with automatic date extraction from filenames:

```bash
records-manager upload ~/Documents/Import/corporate/ \
  --domain corporate \
  --recursive \
  --date-from-filename \
  --pattern ".*-(\d{4})-(\d{2})\.pdf$"
```

**Parameters explained:**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `--recursive` | Process subdirectories | Scans entire tree |
| `--date-from-filename` | Extract date from filename | `"invoice-2024-01.pdf"` → Jan 2024 |
| `--pattern` | Regex pattern for date extraction | Matches YYYY-MM format |

## Step 4: Smart Import with Type Detection

Let Records Manager detect document types automatically:

```bash
records-manager upload ~/Documents/Import/ \
  --domain household \
  --recursive \
  --detect-type \
  --auto-tag
```

**Features:**
- Detects document type from content (invoice, receipt, contract, etc.)
- Generates tags from folder structure
- Suggests titles from filenames
- Creates document dates from file metadata

## Step 5: Import with CSV Metadata

For precise control, use a CSV file to specify metadata for each document:

**Create `import.csv`:**
```csv
filename,domain,document-type,title,tags,created
acme-jan.pdf,corporate,invoice,"ACME Corp January Invoice","2024,acme",2024-01-15
vendor-agreement.pdf,corporate,contract,"Vendor Master Services Agreement","contract,active",2024-01-01
insurance.pdf,household,insurance,"Home Insurance Policy 2024","insurance,2024",2024-01-01
```

**Run import with CSV:**
```bash
records-manager upload ~/Documents/Import/ \
  --metadata-csv import.csv \
  --base-path ~/Documents/Import/
```

**CSV columns:**
| Column | Required | Description |
|--------|----------|-------------|
| `filename` | ✅ | Relative path from base-path |
| `domain` | ✅ | Target entity |
| `document-type` | ❌ | Document type (auto-detected if omitted) |
| `title` | ❌ | Custom title (filename used if omitted) |
| `tags` | ❌ | Comma-separated tags |
| `created` | ❌ | Document date (file date used if omitted) |

## Step 6: Monitor Import Progress

For large imports, monitor progress in real-time:

```bash
# Verbose mode shows each file
records-manager upload ~/Documents/Import/ \
  --domain corporate \
  --recursive \
  --verbose

# Quiet mode only shows summary
records-manager upload ~/Documents/Import/ \
  --domain corporate \
  --recursive \
  --quiet
```

## Step 7: Verify Import Results

After import, verify all documents were processed:

```bash
# Count imported documents
records-manager search --domain corporate --count-only

# Find any failed uploads
records-manager search --domain corporate --tag "import-failed"

# Get import summary by date
records-manager search --domain corporate --after 2024-01-01 --before 2024-01-31
```

## Expected Outcomes

After completing this tutorial, you should be able to:

- ✅ Import multiple documents efficiently
- ✅ Use recursive folder scanning
- ✅ Apply consistent metadata across batches
- ✅ Use CSV files for precise metadata control
- ✅ Verify import success
- ✅ Handle import errors gracefully

## Troubleshooting

### Issue: "No matching files found"

**Solution:** Check your path and permissions:
1. Verify the path is absolute (not relative)
2. Check file permissions on the folder
3. Ensure the path ends with `/` for folders

### Issue: "Date extraction failed"

**Solution:** Adjust your regex pattern:
```bash
# Test your pattern first
echo "invoice-2024-01.pdf" | grep -E ".*-(\d{4})-(\d{2})\.pdf$"

# Simplify pattern if complex
--pattern "(\d{4})-(\d{2})"
```

### Issue: "Some uploads failed"

**Solution:** Review failed files:
1. Check file sizes (may exceed upload limit)
2. Verify file formats are supported
3. Ensure paperless-ngx has sufficient storage
4. Re-run with `--verbose` for specific error details

## Performance Tips

| Strategy | Speed | Use Case |
|----------|-------|----------|
| `--batch` (default) | Fast | Most imports, balanced processing |
| `--parallel` | Faster | Many small files, powerful server |
| `--sequential` | Slower | Large files, limited resources |

**Recommended settings by import size:**
- **< 100 files**: Default settings
- **100-1000 files**: Add `--parallel` with concurrency of 5
- **1000+ files**: Consider multiple smaller imports by folder

## Best Practices

1. **Test with a small batch first** - Run 5-10 files to verify settings
2. **Use descriptive filenames** - Makes title suggestions more accurate
3. **Organize before importing** - Folder structure becomes tags
4. **Keep CSVs as records** - Save import.csv for audit trail
5. **Run verification after import** - Confirm document counts match
6. **Handle failures separately** - Export failed list for retry

## Example: Complete Migration Workflow

Here's a complete workflow for migrating existing documents:

```bash
#!/bin/bash
# migration-script.sh

# 1. Test import with sample
records-manager upload ~/Documents/test-sample/ \
  --domain corporate \
  --dry-run

# 2. Actual import by year
for year in 2020 2021 2022 2023 2024; do
  echo "Importing $year..."
  records-manager upload ~/Documents/archive/$year/ \
    --domain corporate \
    --tags "$year,migration" \
    --date-from-filename \
    --quiet
done

# 3. Verification
echo "Verifying import..."
records-manager retention check --domain corporate

# 4. Report
echo "Migration complete!"
records-manager search --domain corporate --tag "migration" --count-only
```

## Next Steps

- Verify [Retention Compliance](./retention-check.md) after import
- Set up [Automated Workflows](../workflows/index.md) for ongoing processing
- Configure [Monitoring](../configuration/index.md) for import alerts
