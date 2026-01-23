# Troubleshooting

This page covers common issues and solutions when working with the Records Manager Skill and its documentation.

---

## Documentation Issues

### Build Errors

**Problem**: `mkdocs build` fails with errors

**Common causes and solutions**:

1. **Invalid Mermaid syntax**
   ```bash
   # Look for errors like:
   # ERROR: Invalid mermaid syntax

   # Solution: Check mermaid diagram syntax
   # Verify diagram starts with ```mermaid and ends with ```
   ```

2. **Broken internal links**
   ```bash
   # Look for errors like:
   # WARNING: Documentation file 'xxx.md' not found

   # Solution: Update broken link in mkdocs.yml nav section
   # Verify file path is correct relative to docs/ directory
   ```

3. **Missing images or assets**
   ```bash
   # Look for errors like:
   # WARNING: Image 'path/to/image.png' not found

   # Solution: Verify image exists in docs/assets/ or use absolute URL
   ```

**Clean build**:
```bash
rm -rf site/
mkdocs build --clean
```

---

### Local Preview Issues

**Problem**: `mkdocs serve` won't start

**Port already in use**:
```bash
# Try alternative port
mkdocs serve -a localhost:8001
```

**Changes not reflecting**:

*   Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

*   Check file saved in correct location (docs/ directory)

*   Restart server

**Blank pages**:

*   Check browser console for JavaScript errors

*   Verify Mermaid syntax is correct

*   Try `mkdocs build --strict` to find errors

---

## Skill Installation Issues

### Paperless-ngx Connection Failed

**Problem**: `Error: Failed to connect to paperless-ngx`

**Solutions**:

1. **Verify URL is correct**
   ```bash
   echo $MADEINOZ_RECORDMANAGER_PAPERLESS_URL
   # Should include protocol (http:// or https://)
   ```

2. **Test paperless-ngx is accessible**
   ```bash
   curl $MADEINOZ_RECORDMANAGER_PAPERLESS_URL
   # Should return HTML response
   ```

3. **Verify API token**
   ```bash
   # Test token works
   curl -H "Authorization: Token $MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN" \
     $MADEINOZ_RECORDMANAGER_PAPERLESS_URL/api/documents/
   ```

4. **Check network/firewall**
*   Ensure paperless-ngx URL is accessible from your network
*   Check if VPN is required
*   Verify no firewall blocking connections

---

### API Token Authentication Failed

**Problem**: `Error: 401 Unauthorized` or `Error: 403 Forbidden`

**Solutions**:

1. **Regenerate API token** in paperless-ngx:
*   Go to Settings → Tokens
*   Create new token with "Read/Write" permissions
*   Update environment variable

2. **Verify token permissions**:
*   Token must have "Read/Write" access
   - "Read only" tokens cannot upload documents

3. **Check token format**:
   ```bash
   # Should not have extra quotes or spaces
   export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-token-here"
   ```

---

### Environment Variables Not Set

**Problem**: Commands fail with "undefined" errors

**Solutions**:

1. **Check if variables are set**:
   ```bash
   echo $MADEINOZ_RECORDMANAGER_PAPERLESS_URL
   echo $MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN
   echo $MADEINOZ_RECORDMANAGER_COUNTRY
   echo $MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN
   ```

2. **Set variables**:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-paperless-url.com"
   export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"
   export MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
   export MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"

   # Reload shell
   source ~/.zshrc  # or source ~/.bashrc
   ```

3. **Use .env file** (recommended):
   ```bash
   # Create .env in PAI directory
   cat > ~/.claude/.env << EOF
   MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://your-paperless-url.com"
   MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"
   MADEINOZ_RECORDMANAGER_COUNTRY="Australia"
   MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
   EOF
   ```

---

## Document Upload Issues

### Upload Fails with OCR Timeout

**Problem**: Document uploaded but OCR processing times out

**Solutions**:

1. **Check paperless-ngx OCR status**:
*   Go to paperless-ngx web UI
*   Check "Tasks" in left menu
*   Verify OCR tasks are processing

2. **Wait for OCR to complete**:
*   Large PDFs can take 30-60 seconds
*   Image-heavy documents take longer
*   Check document in paperless-ngx UI for "Processing" status

3. **Reduce file size**:
*   Scan at lower DPI (200 DPI instead of 300)
*   Remove unnecessary pages
*   Compress PDF before upload

---

### No Tags Suggested

**Problem**: Document uploaded but no tags applied

**Solutions**:

1. **Wait for OCR completion**:
*   Tags are applied after OCR finishes
*   Check document in paperless-ngx UI
*   Wait 30-60 seconds for processing

2. **Verify document has text**:
*   OCR must extract text from document
*   Image-only PDFs won't be tagged
*   Check if document text is selectable in paperless-ngx

3. **Check domain taxonomy**:
   ```bash
   # Verify domain supports document type
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts info \
     --id <document-id>
   ```

4. **Manual tagging**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts tag \
     --id <document-id> \
     --tags "manual,tag1,tag2"
   ```

---

## Search Issues

### Search Returns No Results

**Problem**: Can't find recently uploaded documents

**Solutions**:

1. **Wait for OCR processing**:
*   Search works on extracted text
*   Wait 30-60 seconds after upload
*   Check document in paperless-ngx UI

2. **Broader search terms**:
   ```bash
   # Try without specific tags
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
     --query "invoice" \
     --domain household

   # Try just one tag
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
     --tags "invoice" \
     --domain household
   ```

3. **Check document was uploaded**:
   ```bash
   # List recent documents
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
     --query "*" \
     --domain household
   ```

---

## Retention Issues

### Retention Check Shows Wrong Period

**Problem**: Documents show incorrect retention periods

**Solutions**:

1. **Verify country setting**:
   ```bash
   echo $MADEINOZ_RECORDMANAGER_COUNTRY
   # Retention varies by country (AU, US, UK)
   ```

2. **Check document type**:
*   Different document types have different retention
*   Tax documents: 7 years in Australia
*   Medical records: 7 years for tax purposes
*   Insurance policies: While active + retention period

3. **Update document type**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts tag \
     --id <document-id> \
     --doctype "Tax Return" \
     --domain household
   ```

---

## Deletion Issues

### Deletion Blocked by Auditor

**Problem**: Can't delete documents even though retention expired

**This is by design** - Deletion Auditor requires explicit approval.

**Solutions**:

1. **Understand the workflow**:
*   Deletion Auditor is a **safety feature**
*   Prevents accidental data loss
*   Requires explicit confirmation

2. **Follow the approval process**:
*   Review what will be deleted
*   Verify retention periods are truly expired
*   Check documents aren't needed for audit
*   Type exact approval phrase when prompted

3. **If you truly need to delete**:
   ```bash
   # The deletion workflow will prompt you
   # Read the warning carefully
   # Type: "I understand this cannot be undone"
   # when you're absolutely certain
   ```

---

## Hierarchical Taxonomy Issues

### Path Validation Fails

**Problem**: `Error: Invalid path` when trying to classify a document

**Example**:
```
❌ Invalid path: HealthManagement/InvalidService/SomeActivity/Document
```

**Solutions**:

1. **Use autocomplete to find valid paths**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete \
     --domain household \
     --path "HealthManagement/"
   ```

2. **Check path structure**:
   - Must have all 4 levels: `Function/Service/Activity/DocumentType`
   - Use exact names (case-sensitive)
   - No spaces around slashes

3. **Browse available functions**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions \
     --domain household
   ```

---

### Can't Find the Right Document Type

**Problem**: Don't know which hierarchical path to use for a document

**Solutions**:

1. **Use keyword search**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy search \
     --domain household \
     --keywords "medical receipt consultation"
   ```
   Returns matching paths with relevance scores.

2. **Navigate step-by-step**:
   ```bash
   # Step 1: Get functions
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy functions --domain household

   # Step 2: Get services within a function
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy services \
     --domain household \
     --function HealthManagement

   # Step 3: Get activities within a service
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy activities \
     --domain household \
     --function HealthManagement \
     --service MedicalCare

   # Step 4: Get document types for an activity
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy documenttypes \
     --domain household \
     --path "HealthManagement/MedicalCare/Consultations"
   ```

3. **Use fuzzy matching**:
   - Type partial paths: `health/med/cons` matches `HealthManagement/MedicalCare/Consultations`
   - Case-insensitive: `HEALTH` matches `HealthManagement`
   - Autocomplete suggests completions

---

### Hierarchical Tags Not Generated

**Problem**: Document uploaded but no hierarchical tags applied

**Solutions**:

1. **Verify hierarchical taxonomy is enabled**:
   ```typescript
   const expert = new TaxonomyExpert('AUS', 'household');
   console.log(expert.isHierarchicalAvailable());  // Should return true
   ```

2. **Check path was provided during upload**:
   ```bash
   # Upload with hierarchical path
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
     /path/to/document.pdf \
     --domain household \
     --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
   ```

3. **Manually generate tags for existing document**:
   ```typescript
   const tags = expert.generateHierarchicalTags('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
   // Apply tags to document via paperless API
   ```

---

### Storage Path Generation Fails

**Problem**: Can't generate filesystem-safe storage path

**Solutions**:

1. **Validate path first**:
   ```typescript
   const validation = expert.validatePath('household', 'HealthManagement/MedicalCare/Consultations/MedicalReceipt');
   if (!validation.valid) {
     console.error(validation.reason);
   }
   ```

2. **Generate storage path from validated hierarchical path**:
   ```typescript
   const storagePath = expert.generateStoragePath('HealthManagement/MedicalCare/Consultations/MedicalReceipt');
   // Returns: 'Health_Management/Medical_Care/Consultations/Medical_Receipt'
   ```

3. **Ensure path has all 4 levels**:
   - Incomplete paths won't generate storage paths
   - Must specify: Function/Service/Activity/DocumentType

---

### Retention Requirements Unclear

**Problem**: Don't know how long to keep a document with hierarchical path

**Solutions**:

1. **Get retention with full hierarchical context**:
   ```typescript
   const retention = expert.getRetentionForActivity(
     'household',
     'HealthManagement',
     'MedicalCare',
     'Consultations',
     'Medical Receipt'
   );
   console.log(retention.legalCitation);  // Shows legal basis
   console.log(retention.years);  // Retention period
   console.log(retention.reason);  // Why it can't be deleted
   ```

2. **Check country-specific retention**:
   - Australia: 7 years for medical expenses (ATO requirement)
   - United States: Varies by state and document type
   - United Kingdom: 6 years for tax documents (HMRC requirement)

3. **Verify retention enforcement**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
     --domain household \
     --path "HealthManagement/MedicalCare/Consultations/MedicalReceipt"
   ```

---

### Migration from Flat Taxonomies

**Problem**: Need to migrate existing flat-tagged documents to hierarchical structure

**Solutions**:

1. **Follow the migration guide**:
   - See [Migration Guide](tutorials/migration-guide.md) for step-by-step instructions
   - Automatic mapping for 90%+ of documents
   - Manual review for edge cases

2. **Check migration status**:
   ```bash
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts migration status \
     --domain household
   ```

3. **Use dual-mode during transition**:
   - Hierarchical taxonomies support backward compatibility
   - Flat and hierarchical can coexist during migration period
   - Legacy queries still work with flat tags

---

### Autocomplete Not Working

**Problem**: Autocomplete doesn't suggest paths as expected

**Solutions**:

1. **Check input format**:
   - Use forward slashes: `HealthManagement/MedicalCare`
   - No spaces around slashes
   - Case-insensitive matching supported

2. **Try partial path**:
   ```bash
   # Works with partial matches
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts taxonomy autocomplete \
     --domain household \
     --path "health"
   # Suggests: HealthManagement/...
   ```

3. **Verify domain is correct**:
   - Different domains have different taxonomies
   - `household` vs `corporate` vs `unit-trust`
   - Check domain supports the function you're searching for

---

## Getting Help

### Still Having Issues?

1. **Check the documentation**:
   - [Installation Guide](getting-started/installation.md)
   - [User Guide](user-guide/)
   - [Configuration Guide](configuration/)

2. **Search existing issues**:
   - [GitHub Issues](https://github.com/madeinoz67/madeinoz-recordmanager-skill/issues)

3. **Create a new issue**:
   Include:
*   Your OS and version
*   paperless-ngx version
*   Error message (full output)
*   Steps to reproduce the problem
*   What you expected to happen

4. **Check paperless-ngx documentation**:
   - [paperless-ngx Docs](https://docs.paperless-ngx.com/)
*   Many issues are related to paperless-ngx configuration

---

## Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Failed to connect to paperless-ngx` | URL incorrect or service down | Verify URL, test connection |
| `401 Unauthorized` | Invalid API token | Regenerate token in paperless-ngx |
| `Document not found` | Wrong document ID | Search for document to find correct ID |
| `No tags suggested` | OCR not complete or no text | Wait for OCR, check document has text |
| `Retention period not found` | Invalid country or document type | Verify country and domain settings |
| `Deletion requires approval` | Deletion Auditor safety feature | Follow approval workflow |

---

**Version**: 1.2.0
**Last Updated**: 2026-01-20
