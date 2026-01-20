# Taxonomy Validation

This guide explains how to validate your custom taxonomies, troubleshoot common issues, and ensure proper integration with the Records Manager Skill system.

---

## Overview

The validation system helps ensure your taxonomies are correctly configured and will work properly with the document management system. It checks for:

* **Syntax Errors**: Invalid YAML/JSON formatting

* **Structure Validation**: Correct taxonomy organization

* **Data Integrity**: Valid document types, tags, and retention rules

* **System Integration**: Proper registration and availability

---

## CLI Validation Commands

### 1. Basic Validation

```bash
# Validate all taxonomies
bun run recordmanager validate --taxonomies

# Validate specific entity type
bun run recordmanager validate --entity legal-practice

# Validate configuration file
bun run recordmanager validate --config custom-taxonomy.yaml

# Show detailed validation results
bun run recordmanager validate --taxonomies --verbose
```

### 2. Component-Specific Validation

```bash
# Validate document types
bun run recordmanager validate --document-types --domain legal-practice

# Validate tag categories
bun run recordmanager validate --tags --domain legal-practice

# Validate retention rules
bun run recordmanager validate --retention --domain legal-practice

# Validate all components
bun run recordmanager validate --all --domain legal-practice
```

### 3. Integration Testing

```bash
# Test metadata suggestions
bun run recordmanager validate --suggestions --file sample.pdf --domain legal-practice

# Test retention calculations
bun run recordmanager validate --retention-calc --document-type "Client File" --domain legal-practice

# Test search functionality
bun run recordmanager validate --search --tags "billing,urgent" --domain legal-practice

# Complete integration test
bun run recordmanager validate --integration --domain legal-practice
```

### 4. Advanced Validation

```bash
# Check for conflicts with existing taxonomies
bun run recordmanager validate --conflicts --domain legal-practice

# Validate against jurisdiction requirements
bun run recordmanager validate --jurisdiction --domain legal-practice --country Australia

# Performance testing
bun run recordmanager validate --performance --domain legal-practice

# Security audit
bun run recordmanager validate --security --domain legal-practice
```

---

## Validation Modes

### Mode 1: Quick Check
```bash
bun run recordmanager validate --quick
```
*   Checks basic syntax
*   Verifies required fields
*   Ensures no obvious errors

### Mode 2: Standard Validation
```bash
bun run recordmanager validate --standard
```
*   All quick checks
*   Document type validation
*   Tag format validation
*   Basic retention rule checking

### Mode 3: Comprehensive Validation
```bash
bun run recordmanager validate --comprehensive
```
*   All standard checks
*   Integration testing
*   Performance analysis
*   Conflict detection

### Mode 4: Production Validation
```bash
bun run recordmanager validate --production
```
*   All comprehensive checks
*   Data migration safety
*   User permission verification
*   Audit trail testing

---

## Common Errors and Troubleshooting

### Error: Invalid Taxonomy Syntax

**Error Message**: `Invalid YAML syntax in custom-taxonomy.yaml`

**Causes**:

* Missing colons or incorrect indentation

* Unbalanced quotes or brackets

* Invalid date formats

* Special characters in strings

**Solutions**:
```bash
# Check YAML syntax
python -c "import yaml; yaml.safe_load(open('custom-taxonomy.yaml'))"

# Use online YAML validator
# https://yaml-online-parser.appspot.com/

# Validate with schema
bun run recordmanager validate --schema custom-taxonomy.yaml
```

### Error: Missing Required Fields

**Error Message**: `Missing required field: document_types in legal-practice`

**Causes**:

* Required sections missing from configuration

* Incorrect field names

* Case sensitivity issues

**Solutions**:
```yaml
# Ensure all required fields are present
legal-practice:
  document_types: []          # Required
  tag_categories: {}          # Required
  retention_rules: {}        # Required
```

### Error: Duplicate Document Types

**Error Message**: `Duplicate document type: "Client File" found in multiple categories`

**Causes**:

* Same document type defined in multiple places

* Inconsistent naming conventions

* Merge conflicts during configuration updates

**Solutions**:
```bash
# Find duplicates
bun run recordmanager validate --duplicates --domain legal-practice

# Check document type uniqueness
grep -r "Client File" TaxonomyExpert.ts
```

### Error: Invalid Tag Format

**Error Message**: `Invalid tag format: "Client File" - must be lowercase with hyphens`

**Causes**:

* Uppercase letters in tags

* Spaces instead of hyphens

* Special characters

* Starting/ending hyphens

**Solutions**:
```yaml
# Correct tag format
tag_categories:
  legal-practice:
*   client-file        # ✓ Correct
*   billing           # ✓ Correct
*   urgent-priority   # ✓ Correct

  # Incorrect examples:
  # - Client File    ✗ (spaces)
  # - client_file    ✗ (underscores)
  # - client-File    ✗ (mixed case)
```

### Error: Invalid Retention Period

**Error Message**: `Invalid retention period: -1 years for "Court Filing"`

**Causes**:

* Negative retention periods

* Non-numeric values

* Impossible date calculations

**Solutions**:
```yaml
# Valid retention rules
retention_rules:
  Court Filing:
    years: 15               # ✓ Valid positive integer
    reason: "Court requirements"

  Invalid Example:
  Court Filing:
    years: -5              ✗ (negative)
    reason: "Some reason"
```

### Error: Entity Not Registered

**Error Message**: `Entity type 'legal-practice' not found in TaxonomyExpert`

**Causes**:

* Missing registration in Domain type

* Not added to COUNTRY_TAXONOMIES

* Import/export issues

**Solutions**:
```typescript
# Check registration
grep -r "legal-practice" src/skills/RecordsManager/Lib/TaxonomyExpert.ts

# Add to Domain type
export type Domain = 'legal-practice' | /* other types */;
```

### Error: Country Not Supported

**Error Message**: `Country 'New Zealand' not supported for entity 'legal-practice'`

**Causes**:

* Requesting country not in supported list

* Missing country configuration for entity

**Solutions**:
```typescript
# Add new country configuration
COUNTRY_TAXONOMIES.NewZealand = {
  country: 'New Zealand',
  domains: {
    'legal-practice': {
      // ... configuration
    }
  }
};
```

---

## Advanced Troubleshooting

### Debug Mode

Enable detailed debugging:

```bash
export DEBUG=recordsmanager:*
bun run recordmanager validate --domain legal-practice --verbose
```

### Schema Validation

Validate against JSON schema:

```bash
# Install schema validator
npm install -g ajv

# Validate taxonomy
ajv validate -s taxonomy-schema.json -d custom-taxonomy.yaml
```

### Performance Analysis

Identify performance bottlenecks:

```bash
# Performance testing
bun run recordmanager validate --performance --domain legal-practice

# Memory usage analysis
node --inspect recordmanager validate --taxonomies
```

### Conflict Detection

Find conflicts with existing systems:

```bash
# Check for naming conflicts
bun run recordmanager validate --conflicts --domain legal-practice

# Check database schema conflicts
bun run recordmanager validate --database --domain legal-practice
```

---

## Testing with Sample Data

### Sample Documents for Testing

Create test documents to validate your taxonomy:

**Legal Practice Test Documents**:

* `client-agreement.pdf` (should map to "Legal Agreement")

* `court-filing-2024.pdf` (should map to "Court Filing")

* `billing-invoice-2024.pdf` (should map to "Billing Invoice")

**Medical Practice Test Documents**:

* `patient-record-john-doe.pdf` (should map to "Patient Record")

* `pathology-results.pdf` (should map to "Pathology Report")

* `prescription-medication.pdf` (should map to "Prescription")

**Real Estate Test Documents**:

* `sale-contract.pdf` (should map to "Sale Contract")

* `lease-agreement.pdf` (should map to "Lease Agreement")

* `property-inspection.pdf` (should map to "Property Inspection Report")

### Test Scenarios

```bash
# Test 1: Document Recognition
bun run recordmanager test --recognize --file client-agreement.pdf --domain legal-practice

# Expected Output:
# Document Type: Legal Agreement
# Confidence: 95%
# Suggested Tags: legal-agreement, contract, client-matter

# Test 2: Metadata Suggestions
bun run recordmanager test --suggest --file court-filing.pdf --domain legal-practice

# Expected Output:
# Tags: court-filing, urgent, active, litigation

# Test 3: Retention Calculation
bun run recordmanager test --retention --document-type "Court Filing" --domain legal-practice

# Expected Output:
# Retention: 15 years
# Expiry Date: 2039-01-20 (from 2024-01-20)
# Reason: Court record requirements - permanent file reference
```

### Integration Testing

Test the complete workflow:

```bash
# 1. Create entity
bun run recordmanager create --entity-type legal-practice

# 2. Upload document with taxonomy
bun run recordmanager upload --file client-agreement.pdf --domain legal-practice

# 3. Search with taxonomy tags
bun run recordmanager search --tags "client-matter,active" --domain legal-practice

# 4. Check retention status
bun run recordmanager retention --domain legal-practice
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/validate-taxonomies.yml
name: Validate Taxonomies

on:
  push:
    paths: ['docs/extending/**/*.yaml', 'src/skills/RecordsManager/Lib/TaxonomyExpert.ts']
  pull_request:
    paths: ['docs/extending/**/*.yaml', 'src/skills/RecordsManager/Lib/TaxonomyExpert.ts']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
*   uses: actions/checkout@v3

*   name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

*   name: Install dependencies
        run: npm install -g bun && bun install

*   name: Validate taxonomies
        run: bun run recordmanager validate --taxonomies

*   name: Test custom entities
        run: |
          bun run recordmanager validate --entity legal-practice
          bun run recordmanager validate --entity medical-practice
          bun run recordmanager validate --entity real-estate

*   name: Integration test
        run: bun run recordmanager validate --integration
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "Validating taxonomies..."
bun run recordmanager validate --taxonomies --quick
if [ $? -ne 0 ]; then
  echo "Taxonomy validation failed. Please fix errors before committing."
  exit 1
fi
```

---

## Best Practices

### 1. Regular Validation

* Run validation after every configuration change

* Use pre-commit hooks to prevent invalid configurations

* Schedule periodic production validation

### 2. Documentation

* Document validation errors and their solutions

* Keep test documents and expected results

* Maintain a troubleshooting guide

### 3. Performance Monitoring

* Track validation performance over time

* Monitor for new error types

* Set up alerts for validation failures

### 4. User Testing

* Test with real user documents

* Gather feedback on tagging accuracy

* Validate retention period expectations

### 5. Backup and Recovery

* Keep validated configuration backups

* Test restore procedures

* Document rollback procedures

---

## Getting Help

### Common Questions

**Q: My document isn't being recognized correctly**
A: Check the document type mapping in your taxonomy. Use the recognition test to see what patterns are being matched.

**Q: Tags aren't being applied as expected**
A: Verify tag category definitions and ensure document names contain the expected keywords.

**Q: Retention periods seem incorrect**
A: Review retention rule definitions and ensure they match legal requirements.

### Support Channels

1. **CLI Help**: `bun run recordmanager validate --help`
2. **Documentation**: [Extending Guide](index.md)
3. **GitHub Issues**: Report bugs and request features
4. **Community**: Join discussions in the PAI repository

---

*Last Updated: 2026-01-20*