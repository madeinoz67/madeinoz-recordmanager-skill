# Add Entity Workflow

> Create a new entity with required tags based on taxonomy

## Triggers

- "Add a new entity"
- "Create a trust"
- "Set up a new business"
- "Add entity: [type]"
- "Create household"
- "New project entity"

## Prerequisites

- paperless-ngx connection configured
- TaxonomyExpert available for tag determination
- EntityCreator library loaded

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role in Workflow | When Used |
|-------|-----------------|-----------|
| **Records Keeper 📋** | Taxonomy & tag optimization | Determines optimal tag structure for entity type |
| **Compliance Guardian ⚖️** | Retention rule verification | Validates trust FTE dates, retention requirements |

### Agent Invocation

**Records Keeper** - For tag structure and organization:
```typescript
const { execSync } = require('child_process');
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

ENTITY TAG STRUCTURE ANALYSIS:
Entity type: ${entityType}
Domain: ${domain}
Country: ${country}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL tag suggestions MUST come from TaxonomyExpert.getTagCategories(domain)
- DO NOT invent or hardcode tags - retrieve from taxonomy only
- Required tags for entity type MUST be from TaxonomyExpert
- Use TaxonomyExpert as single source of truth

Task: Analyze entity type and suggest optimal tag structure using TaxonomyExpert.getTagCategories(${domain})
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

**Compliance Guardian** - For trust compliance verification:
```typescript
const complianceGuardianPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "legal,meticulous,cautious,thorough"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: complianceGuardianPrompt + `

TRUST COMPLIANCE VERIFICATION:
Trust type: ${trustType}
Trust name: ${trustName}
FTE date (if family trust): ${fteDate}
Country: ${country}

CRITICAL TAXONOMY ENFORCEMENT:
- ALL retention requirements MUST come from TaxonomyExpert.getRetentionRequirements(documentType, domain)
- DO NOT hardcode retention periods - retrieve from TaxonomyExpert for each document type
- Use country-specific retention rules with legal citations from TaxonomyExpert

Task: Verify trust configuration meets ATO requirements and validate all retention periods against TaxonomyExpert
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Workflow Steps

### Step 1: Determine Entity Type

Ask the user to select entity type if not specified:

**Question:** "What type of entity do you want to create?"

**Options:**
| Type | Description |
|------|-------------|
| `household` | Personal/family record keeping |
| `corporate` | Business records (sole trader, company, partnership) |
| `unit-trust` | Unit trust with unit holders |
| `discretionary-trust` | Discretionary trust with beneficiaries |
| `family-trust` | Family trust with FTE requirements |
| `project` | Project-specific documentation |

### Step 2: Gather Type-Specific Information

Based on entity type, gather required information:

#### Household
| Field | Required | Description |
|-------|----------|-------------|
| householdName | Yes | Name for the household (e.g., "Smith Household") |
| startYear | No | Year household records begin |

#### Corporate
| Field | Required | Description |
|-------|----------|-------------|
| businessName | Yes | Legal business name |
| abn | No | Australian Business Number (11 digits) |
| businessType | Yes | sole-trader, company, or partnership |

#### Unit Trust
| Field | Required | Description |
|-------|----------|-------------|
| trustName | Yes | Trust name (e.g., "Smith Unit Trust") |
| trusteeName | Yes | Name of trustee (individual or company) |
| abn | Yes | Trust ABN (11 digits) |
| tfn | No | Trust TFN (8-9 digits) |
| unitCount | No | Total number of units on issue |

#### Discretionary Trust
| Field | Required | Description |
|-------|----------|-------------|
| trustName | Yes | Trust name |
| trusteeName | Yes | Name of trustee |
| abn | Yes | Trust ABN (11 digits) |
| tfn | No | Trust TFN (8-9 digits) |
| beneficiaries | No | Comma-separated list of beneficiaries |

#### Family Trust
| Field | Required | Description |
|-------|----------|-------------|
| trustName | Yes | Trust name |
| trusteeName | Yes | Name of trustee |
| abn | Yes | Trust ABN (11 digits) |
| tfn | No | Trust TFN (8-9 digits) |
| fteDate | **CRITICAL** | Family Trust Election date (affects retention!) |

#### Project
| Field | Required | Description |
|-------|----------|-------------|
| projectName | Yes | Project name |
| projectType | Yes | software, construction, research, creative, other |
| startDate | No | Project start date |

### Step 3: Validate Configuration

Before creating, validate:

1. **Required fields present** - All mandatory fields have values
2. **Format validation** - ABN is 11 digits, TFN is 8-9 digits, dates are valid
3. **No duplicates** - Entity name doesn't already exist
4. **Trust-specific** - Family trusts MUST have FTE date

### Step 4: Create Entity in paperless-ngx

Using EntityCreator, create:

1. **Entity Tag**
   - Name: `entity:{entity-id}`
   - Color: Type-specific color
   - Purpose: Primary identifier for all entity documents

2. **Required Tags** (from TaxonomyExpert)
   | Entity Type | Required Tags |
   |-------------|---------------|
   | household | `household`, `personal` |
   | corporate | `corporate`, `business` |
   | unit-trust | `trust`, `unit-trust`, `governance` |
   | discretionary-trust | `trust`, `discretionary-trust`, `governance` |
   | family-trust | `trust`, `family-trust`, `fte`, `governance` |
   | project | `project` |

3. **Storage Path**
   - Creates hierarchical path for document organization
   - Example: `/Trusts/Family Trusts/Smith Family Trust`

4. **Custom Fields** (trusts only)
   - ABN, TFN, Trustee Name, Trust Deed Date
   - FTE Date (family trusts)
   - Unit Count (unit trusts)
   - Beneficiaries (discretionary trusts)

### Step 5: Register Entity

Save entity configuration to local registry:
- Location: `$PAI_HOME/skills/RecordsManager/Context/entities.json`
- Includes all configuration for future reference

### Step 6: Confirm Creation

Report to user:

```
✅ Entity Created Successfully

Entity ID: {entity-id}
Name: {name}
Type: {type}

Created in paperless-ngx:
  • Entity tag: entity:{entity-id}
  • Required tags: {list of tags}
  • Storage path: {path}
  {• Custom fields: {list} (trusts only)}

Documents can now be tagged with 'entity:{entity-id}'
```

## Example: Creating a Family Trust

```
User: "Add a family trust for the Smiths"

AI: Creating family trust entity. I'll need some information:

1. Trust name: "Smith Family Trust"
2. Trustee name: "John Smith"
3. ABN: "12345678901"
4. TFN (optional): "123456789"
5. Family Trust Election date: "2020-02-01"

[Validation passes]

Creating entity in paperless-ngx...

✅ Entity Created Successfully

Entity ID: family-trust-smith-family-trust-2024
Name: Smith Family Trust
Type: family-trust

Created in paperless-ngx:
  • Entity tag: entity:family-trust-smith-family-trust-2024
  • Required tags: trust, family-trust, fte, governance
  • Storage path: /Trusts/Family Trusts/Smith Family Trust
  • Custom fields: ABN, TFN, Trustee Name, Trust Deed Date, FTE Date

⚠️  FTE Retention Warning:
    Family Trust Election dated 2020-02-01 must be retained until 2025-02-01
    (5 years from FTE date, not EOFY - Section 272-80 ITAA 1936)

Documents can now be tagged with 'entity:family-trust-smith-family-trust-2024'
```

## CLI Integration

```bash
# Interactive entity creation
bun run Tools/RecordManager.ts entity add

# Direct entity creation with type
bun run Tools/RecordManager.ts entity add --type family-trust

# List all entities
bun run Tools/RecordManager.ts entity list

# Get entity details
bun run Tools/RecordManager.ts entity info <entity-id>
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Duplicate entity name | Suggest alternative name or append year |
| Invalid ABN format | Show correct format (11 digits, no spaces) |
| Invalid TFN format | Show correct format (8-9 digits) |
| Missing FTE date for family trust | FTE date is mandatory - explain importance |
| paperless-ngx connection failed | Check MADEINOZ_RECORDMANAGER_PAPERLESS_URL |
| API authentication failed | Regenerate MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN |

## Agent Collaboration Pattern

For complex entity creation (especially trusts), use agent collaboration:

```
1. User: "Create a family trust for the Smiths"

2. System spawns Records Keeper agent:
   → Analyzes entity type requirements
   → Suggests optimal tag structure
   → Recommends storage path hierarchy

3. System spawns Compliance Guardian agent:
   → Validates FTE date format and retention calculation
   → Checks ATO compliance requirements
   → Warns about Section 272-80 ITAA 1936 requirements

4. EntityCreator executes:
   → Creates entity tag
   → Creates required tags from taxonomy
   → Creates storage path
   → Creates custom fields (trusts)

5. Records Keeper confirms:
   → Verifies tag structure is complete
   → Suggests initial document upload workflow
```

### When to Use Parallel Agents

**Use parallel agents for:**
- Trust entities (compliance + taxonomy expertise needed)
- Corporate entities with complex structure
- Entities requiring compliance verification

**Single agent sufficient for:**
- Household entities (simple taxonomy)
- Project entities (standard structure)

## Related Workflows

- `TrustValidation.md` - Validate entity documents after creation (uses Compliance Guardian)
- `WorkflowCreator.md` - Create auto-tagging workflow for entity (uses Archive Architect)
- `DeleteConfirmation.md` - Required for any entity deletion (uses Deletion Auditor - MANDATORY)
