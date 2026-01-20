# Tutorial: Creating Custom Entities

This tutorial shows you how to create custom entities for organizing documents by household, trust, business, or project.

## Objective

Create a custom entity with specialized taxonomies and retention rules.

## Prerequisites

- ✅ Completed [First Upload](./first-upload.md) tutorial
- ✅ Understanding of your record keeping requirements
- ✅ Write access to paperless-ngx

## Step 1: Understand Entity Types

Records Manager supports several entity types, each with specialized behavior:

| Entity Type | Use Case | Retention Focus |
|-------------|----------|-----------------|
| `household` | Personal/family records | General household retention |
| `corporate` | Business documents | Corporate tax & legal retention |
| `unit-trust` | Unit trust structures | Trust-specific compliance |
| `discretionary-trust` | Family/discretionary trusts | Trust deed + distribution retention |
| `family-trust` | Family trust elections | FTE + trust deed retention |
| `project` | Temporary/project work | Project-based retention |

## Step 2: Create a Household Entity

Create a basic household entity for personal documents:

```bash
# Via PAI
records-manager entity create \
  --type household \
  --name "My Household" \
  --description "Personal household records"

# Or directly
bun run src/skills/RecordsManager/Tools/RecordManager.ts \
  entity create \
  --type household \
  --name "My Household" \
  --description "Personal household records"
```

**Expected output:**
```
✓ Entity created successfully
  Entity ID: household_my-household
  Type: household
  Name: My Household
  Description: Personal household records
  Taxonomy: AU_HOUSEHOLD (default)
```

## Step 3: Create a Corporate Entity

For business documents, create a corporate entity with specific retention:

```bash
records-manager entity create \
  --type corporate \
  --name "ACME Corporation" \
  --description "Operating company records" \
  --country AU \
  --tax-id "51-123456789" \
  --retention-years 7
```

**Parameters explained:**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `--type` | Entity type | `corporate`, `household`, `trust` |
| `--name` | Display name | `"ACME Corporation"` |
| `--description` | Entity purpose | `"Operating company records"` |
| `--country` | Tax jurisdiction | `AU`, `US`, `UK` |
| `--tax-id` | Tax identifier | `"51-123456789"` |
| `--retention-years` | Default retention period | `7` |

## Step 4: Create a Trust Entity

Trusts require special handling for compliance documents:

```bash
records-manager entity create \
  --type discretionary-trust \
  --name "Smith Family Trust" \
  --description "Discretionary trust established 2020" \
  --trust-deed-date "2020-03-15" \
  --tax-id "XXX-000-000-000"
```

**Trust-specific parameters:**
| Parameter | Description | Required |
|-----------|-------------|----------|
| `--trust-deed-date` | Date trust deed was executed | Yes (for trusts) |
| `--fte-date` | Family Trust Election date | Conditional |
| `--tax-id` | Trust TFN | Recommended |

## Step 5: Verify Entity Creation

List all entities to confirm creation:

```bash
records-manager entity list
```

**Expected output:**
```
Registered Entities:

1. household_my-household
   Type: household
   Name: My Household
   Documents: 0

2. corporate_acme-corporation
   Type: corporate
   Name: ACME Corporation
   Tax ID: 51-123456789
   Documents: 0

3. discretionary-trust_smith-family-trust
   Type: discretionary-trust
   Name: Smith Family Trust
   Trust Deed Date: 2020-03-15
   Documents: 0
```

## Step 6: Upload to Specific Entity

Once created, upload documents directly to an entity:

```bash
records-manager upload /path/to/document.pdf \
  --domain corporate_acme-corporation \
  --document-type invoice
```

## Expected Outcomes

After completing this tutorial, you should be able to:

- ✅ Create entities of any supported type
- ✅ Configure entity-specific retention rules
- ✅ Set up trust entities with deed tracking
- ✅ Upload documents to specific entities
- ✅ List and manage existing entities

## Troubleshooting

### Issue: "Entity type not recognized"

**Solution:** Use valid entity types:

* `household`

* `corporate`

* `unit-trust`

* `discretionary-trust`

* `family-trust`

* `project`

### Issue: "Trust deed date required"

**Solution:** Trust entities require the trust execution date:
```bash
# Add the trust deed date
--trust-deed-date "YYYY-MM-DD"
```

### Issue: "Entity already exists"

**Solution:** Entity names must be unique. Either:

1. Use a different name
2. Delete the existing entity first (requires confirmation)
3. Update the existing entity instead

## Best Practices

1. **Plan your entity structure** before creating multiple entities

2. **Use descriptive names** that clearly identify the entity

3. **Set appropriate retention** based on your jurisdiction

4. **Document trust dates** accurately for compliance

5. **Test with a few uploads** before bulk importing

## Next Steps

* Learn about [Retention Checking](./retention-check.md) for your entities

* Set up [Batch Import](./batch-import.md) for existing documents

* Configure [Automated Workflows](../workflows/index.md)

## Reference: Entity Naming Convention

Entity IDs follow the pattern: `{type}_{slugified-name}`

Examples:

* `household_my-household` → `My Household`

* `corporate_acme-corp` → `ACME Corp`

* `discretionary-trust_smith-family` → `Smith Family Trust`
