# Add Taxonomy Workflow

AI workflow for adding new hierarchical taxonomies to the Records Manager system.

## Trigger

User requests: "add a new taxonomy" or "create taxonomy for [entity type]"

## Workflow Steps

### 1. Gather Requirements

Ask the user to clarify:

**Question 1: Entity Type**
```
Which entity type is this taxonomy for?
Options: [
  "household" - Personal household records,
  "corporate" - Business/corporate records,
  "unit-trust" - Unit trust structure,
  "discretionary-trust" - Discretionary trust structure,
  "family-trust" - Family trust structure,
  "hybrid-trust" - Hybrid trust structure,
  "project" - Project management records,
  "person" - Individual personal records,
  "Custom (specify)"
]
```

**Question 2: Coverage Area**
```
What functional area does this taxonomy cover?
Examples: "Financial Management", "Health Records", "Legal Documents", "Vehicle Management"
```

**Question 3: Country**
```
Which country's retention rules apply?
Options: ["AU" (Australia), "US" (United States), "UK" (United Kingdom), "Multiple"]
```

### 2. Plan the Hierarchy

Work with the user to design the 4-level structure:

```
Function (Major Area)
  └─ Service (Sub-category)
      └─ Activity (Specific Operation)
          └─ Document Types (Specific Documents)
```

**Example for Vehicle Management:**
```
Function: AssetManagement
  └─ Service: VehicleManagement
      └─ Activity: VehicleMaintenance
          └─ Document Types: ["Maintenance Record", "Repair Invoice", "Warranty Document"]
```

### 3. Validate the Structure

Before creating the JSON, validate:

- [ ] Each function has at least one service
- [ ] Each service has at least one activity
- [ ] Each activity has at least one document type
- [ ] Each activity has retention rules for at least one country
- [ ] Document type names avoid special characters like `/`
- [ ] Names follow PascalCase convention (functions, services, activities)
- [ ] Document types can use spaces for multi-word names

### 4. Create the JSON File

File location: `src/skills/RecordsManager/Config/taxonomies/hierarchical/{entityType}.json`

**Template:**
```json
{
  "entityType": "entity-type",
  "country": "AU",
  "version": "1.0.0",
  "functions": {
    "FunctionName": {
      "name": "FunctionName",
      "description": "Human-readable description",
      "icon": "📋",
      "services": {
        "ServiceName": {
          "name": "ServiceName",
          "description": "Human-readable description",
          "icon": "📊",
          "activities": {
            "ActivityName": {
              "name": "ActivityName",
              "description": "Human-readable description",
              "icon": "📄",
              "documentTypes": [
                "Document Type 1",
                "Document Type 2"
              ],
              "retention": {
                "AU": {
                  "years": 7,
                  "authority": "Legal Authority",
                  "notes": "Optional context",
                  "fromDate": "fy_end"
                }
              },
              "keywords": ["keyword1", "keyword2"]
            }
          }
        }
      }
    }
  },
  "metadata": {
    "createdAt": "2026-01-22T00:00:00Z",
    "updatedAt": "2026-01-22T00:00:00Z",
    "createdBy": "user",
    "source": "custom"
  }
}
```

### 5. Validate the JSON

Run validation:
```bash
bun /tmp/validate-taxonomies.ts
```

All "Missing" values must be 0.

### 6. Test the Taxonomy

```bash
bun -e "
import { TaxonomyExpert } from './src/skills/RecordsManager/Lib/TaxonomyExpert';
const expert = new TaxonomyExpert('Australia', '{entityType}', 'hierarchical');

// Test navigation
const functions = expert.getFunctions('{entityType}');
console.log('Functions:', functions.length);

// Test each level
for (const func of functions) {
  const services = expert.getServices('{entityType}', func.name);
  console.log(\`  \${func.name}: \${services.length} services\`);

  for (const service of services) {
    const activities = expert.getActivities('{entityType}', func.name, service.name);
    console.log(\`    \${service.name}: \${activities.length} activities\`);

    for (const activity of activities) {
      const docTypes = expert.getDocumentTypesForActivity('{entityType}', func.name, service.name, activity.name);
      const retention = expert.getRetentionForActivity('{entityType}', func.name, service.name, activity.name);
      console.log(\`      \${activity.name}: \${docTypes.length} doc types, retention: \${Object.keys(retention).length} countries\`);
    }
  }
}
"
```

### 7. Run Tests

```bash
bun test src/tests/TaxonomyInstaller.test.ts
bun test src/tests/integration/installation.test.ts
```

All tests must pass.

## Retention Period Guidelines

### Australia (AU)
| Document Type | Years | Authority |
|---------------|-------|-----------|
| Tax Returns | 7 | ATO Section 254 |
| Financial Statements | 7 | Corporations Act |
| Bank Statements | 5 | ATO |
| Insurance Policies | 0 (permanent) | Contract law |
| Trust Deeds | 0 (permanent) | Trust law |
| Employee Records | 7 | Fair Work Act |
| Medical Records | 7 | Privacy Act |
| Legal Documents | 0 (permanent) | Various |

### United States (US)
| Document Type | Years | Authority |
|---------------|-------|-----------|
| Tax Returns | 7 | IRS |
| Financial Statements | 7 | IRS |
| Bank Statements | 7 | IRS |
| Insurance Policies | 0 (permanent) | Contract law |
| Employee Records | 7 | EEOC |
| Medical Records | 7 | HIPAA |

### United Kingdom (UK)
| Document Type | Years | Authority |
|---------------|-------|-----------|
| Tax Returns | 6 | HMRC |
| Financial Statements | 6 | Companies Act |
| Bank Statements | 5 | HMRC |
| Insurance Policies | 0 (permanent) | Contract law |
| Employee Records | 6 | HMRC |

## fromDate Values

Use the appropriate `fromDate` value:

- `creation`: Start from document creation date (default)
- `fy_end`: Start from financial year end (common for tax documents)
- `fte_date`: Start from Family Trust Election date (trust-specific)
- `distribution`: Start from distribution date (trust-specific)

## Icon Suggestions

Use these emojis for different functional areas:

- **Financial**: 💰, 📊, 💳, 💵, 🏦
- **Legal**: ⚖️, 📜, 📋, 🏛️
- **Health**: 🏥, 💊, 👨‍⚕️, 🩺
- **Vehicle**: 🚗, 🚙, 🔧, 🚛
- **Property**: 🏠, 🏘️, 🏢, 🏗️
- **Insurance**: 🛡️, 📄, 🔒
- **Tax**: 📝, 📋, 💰
- **General**: 📁, 📂, 🗂️, 📎

## Common Mistakes to Avoid

1. **Missing retention rules**: Every activity must have retention rules
2. **Empty document types**: Each activity must have at least one document type
3. **Special characters in slugs**: Avoid `/` in document type names
4. **Wrong country codes**: Use "AU", "US", "UK" not full names
5. **Inconsistent naming**: Use PascalCase consistently for functions, services, activities

## Completion Checklist

- [ ] Requirements gathered (entity type, coverage area, country)
- [ ] Hierarchy planned (4-level structure designed)
- [ ] JSON file created with proper structure
- [ ] All required fields included
- [ ] Retention rules added with authority citations
- [ ] JSON validated (no syntax errors)
- [ ] Validation script passes (0 missing items)
- [ ] Tested with TaxonomyExpert
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Documentation updated (if adding new entity type)

## Related Documentation

- [Adding Taxonomies Guide](../../../specs/003-default-taxonomies/ADDING-TAXONOMIES.md)
- [Type Definitions](../../../src/lib/types/HierarchicalTaxonomy.ts)
- [Example Taxonomies](../../../src/skills/RecordsManager/Config/taxonomies/hierarchical/)
