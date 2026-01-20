# Examples

## Example Usage

Here are some practical examples of using the Records Manager Skill for common document management tasks.

## Basic Usage Examples

### Uploading Documents

```bash
# Upload a single document with automatic tagging
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Documents/invoice.pdf \
  --domain household

# Upload with custom tags
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Documents/receipt.jpg \
  --domain household \
  --tags medical,health \
  --correspondent "Family Doctor"
```

### Searching Documents

```bash
# Search by tags
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --tags "tax,financial,2024" \
  --domain household

# Search by document type
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --type "Invoice" \
  --domain corporate

# Search by date range
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --after-date "2024-01-01" \
  --before-date "2024-12-31"
```

### Retention Management

```bash
# Check retention status
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain corporate

# Check retention for specific document type
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --type "Financial" \
  --domain corporate
```

### Entity Management

```bash
# Create a new entity
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts entity create \
  --name "My Family Trust" \
  --type family-trust \
  --description "Family trust documents"

# List all entities
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts entity list

# View entity details
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts entity show \
  --entity "My Family Trust"
```

## Advanced Examples

### Trust Document Management

```bash
# Upload trust deed with automatic compliance checking
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Documents/trust-deed.pdf \
  --domain family-trust \
  --tags "trust-deed,permanent" \
  --correspondent "Solicitor"

# Upload Family Trust Election (FTE) document
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Documents/fte.pdf \
  --domain family-trust \
  --tags "FTE,tax-election" \
  --retention-years 5
```

### Batch Operations

```bash
# Upload multiple documents
for file in ~/Documents/receipts/*.pdf; do
  bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
    --file "$file" \
    --domain household \
    --tags "receipt"
done

# Batch tag update
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts tag add \
  --query "type:Invoice AND date:2024" \
  --tags "2024-invoices" \
  --domain corporate
```

### Workflow Automation

```bash
# Automated invoice processing workflow
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts workflow start \
  --name "Invoice Processing" \
  --trigger "type:Invoice" \
  --actions "tag:invoice,scan:ocr,assign:accounting"

# Compliance check workflow
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts workflow start \
  --name "Retention Monitor" \
  --schedule "monthly" \
  --actions "check:retention,report:expiring"
```

## Integration Examples

### With Paperless-ngx

```bash
# Set up automatic document processing
# 1. Configure paperless-ngx consumption endpoint
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"
export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="your-api-token"

# 2. Upload and let the skill handle classification
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Documents/document.pdf \
  --domain corporate

# 3. Search with automatic taxonomy application
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts search \
  --query "quarterly report" \
  --domain corporate
```

### PAI Integration

```bash
# Using within PAI conversations
user: "I just received a medical bill, can you help me organize it?"

ai: "I'll upload that to your household records with proper medical tags."

bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file ~/Downloads/medical-bill.pdf \
  --domain household \
  --tags "medical,bill,health-insurance" \
  --retention-years 7

user: "Check if any tax documents are expiring soon"

ai: "Checking retention status for your corporate domain."

bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts retention \
  --domain corporate \
  --expiring-soon
```

## Troubleshooting Examples

### Connection Issues

```bash
# Verify connection
export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://paperless.example.com"
bun run ~/.claude/skills/RecordsManager/RecordManager.ts test-connection

# Check API token validity
bun run ~/.claude/skills/RecordsManager/RecordManager.ts test-auth
```

### Debug Mode

```bash
# Enable verbose logging
export MADEINOZ_RECORDMANAGER_DEBUG=true
bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts upload \
  --file document.pdf \
  --domain household \
  --verbose
```

## Tips and Best Practices

1. **Always specify the domain** - This ensures proper taxonomy application
2. **Use descriptive tags** - This makes searching easier later
3. **Check retention regularly** - Especially for time-sensitive documents
4. **Use workflows for automation** - Reduce manual work for repetitive tasks
5. **Test queries before batch operations** - Verify search patterns work as expected
