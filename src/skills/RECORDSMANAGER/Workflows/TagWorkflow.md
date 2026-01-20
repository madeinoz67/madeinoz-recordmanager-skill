# Tag Workflow

> Add, modify, or remove tags on documents with taxonomy-aware suggestions

## Triggers

- "Tag this as [tag]"
- "Add [tag] to [document]"
- "Remove [tag] from [document]"
- "What tags should I use for [document]?"
- "Suggest tags for [document]"
- "Bulk tag [documents]"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Records Keeper 📋** | Tag suggestions | Recommends appropriate tags based on content and taxonomy |

### Records Keeper Agent (Primary)

**Domain:** Research Specialist (Data Organization & Classification)

**Personality:** Meticulous, Analytical, Systematic

**Approach:** Thorough, Systematic

**Voice:** Drew (Professional, balanced - ID: 29vD33N1CtxCmqQRPOHJ)

```typescript
const { execSync } = require('child_process');
const recordsKeeperPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "research,meticulous,analytical,systematic"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: recordsKeeperPrompt + `

TAG SUGGESTION REQUEST:
Document ID: ${documentId}
Filename: ${filename}
Content preview: ${contentPreview}
Current tags: ${currentTags}
Domain: ${domain}
Country: ${country}

Your task:
1. Analyze document content and filename
2. Retrieve appropriate tags from TaxonomyExpert
3. Identify mandatory tags for document type
4. Suggest additional relevant tags
5. Flag any current tags that should be removed
6. Explain reasoning for each suggestion

Return: {
  mandatoryTags: [],
  suggestedTags: [],
  optionalTags: [],
  tagsToRemove: [],
  reasoning: {}
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Identify Document(s)

```bash
# Single document
bun run Tools/RecordManager.ts info #1234

# Multiple documents from search
bun run Tools/RecordManager.ts search --query "tax receipts 2024"
```

### Step 2: Get Tag Suggestions

**Records Keeper agent analyzes and suggests:**

```
🏷️  Tag Suggestions for Document #1234

Filename: Medical_Receipt_Pharmacy_20240315.pdf
Current tags: [receipt]

MANDATORY (Required for document type):
  ✅ medical - Document contains medical/health content
  ✅ 2024 - Year tag from date in filename
  ✅ household - Domain tag (inferred from content)

SUGGESTED (Highly recommended):
  📝 tax-deductible - Medical expenses are tax deductible
  📝 pharmacy - Vendor type identified in filename
  📝 receipt - Already applied ✓

OPTIONAL (May be relevant):
  📎 health-insurance - If claiming from insurance
  📎 prescription - If prescription medication

TO REMOVE (Potentially incorrect):
  ⚠️  None detected

Apply suggested tags? (yes/no/selective)
```

### Step 3: Apply Tags

```typescript
// Apply selected tags
const selectedTags = ['medical', '2024', 'household', 'tax-deductible', 'pharmacy'];

await paperlessClient.updateDocument(documentId, {
  tags: [...currentTagIds, ...selectedTagIds]
});
```

### Step 4: Confirm Changes

```
✅ Tags updated for Document #1234

Applied tags:
  + medical (new)
  + 2024 (new)
  + household (new)
  + tax-deductible (new)
  + pharmacy (new)
  • receipt (existing)

Total tags: 6
```

## Tag Operations

### Add Single Tag
```bash
bun run Tools/RecordManager.ts tag add --doc 1234 --tag "medical"
```

### Add Multiple Tags
```bash
bun run Tools/RecordManager.ts tag add --doc 1234 --tags "medical,2024,tax-deductible"
```

### Remove Tag
```bash
bun run Tools/RecordManager.ts tag remove --doc 1234 --tag "old-tag"
```

### Bulk Tag (Multiple Documents)
```bash
# Tag all search results
bun run Tools/RecordManager.ts tag add --query "pharmacy receipts" --tag "medical"

# Tag by document IDs
bun run Tools/RecordManager.ts tag add --docs "1234,1235,1236" --tag "2024"
```

### Get Tag Suggestions
```bash
bun run Tools/RecordManager.ts tag suggest --doc 1234
```

## Tag Categories

### Domain Tags
| Tag | Description |
|-----|-------------|
| `household` | Personal/family documents |
| `corporate` | Business documents |
| `trust` | Trust-related documents |

### Entity Tags
| Pattern | Example |
|---------|---------|
| `entity:{type}-{name}-{year}` | `entity:family-trust-smith-family-trust-2024` |

### Category Tags
| Category | Tags |
|----------|------|
| Financial | `tax`, `banking`, `insurance`, `investment` |
| Legal | `contract`, `deed`, `agreement`, `compliance` |
| Medical | `medical`, `health`, `prescription`, `insurance-claim` |
| Administrative | `correspondence`, `notification`, `receipt` |

### Time Tags
| Pattern | Example |
|---------|---------|
| Year | `2024`, `2025` |
| Financial Year | `fy-2024` |

### Sensitivity Tags
| Level | Tag | Color |
|-------|-----|-------|
| Public | `public` | Green |
| Internal | `internal` | Yellow |
| Confidential | `confidential` | Orange |
| Restricted | `restricted` | Red |

## CLI Integration

```bash
# Suggest tags for document
bun run Tools/RecordManager.ts tag suggest --doc 1234

# Add tag
bun run Tools/RecordManager.ts tag add --doc 1234 --tag "medical"

# Remove tag
bun run Tools/RecordManager.ts tag remove --doc 1234 --tag "old-tag"

# Bulk add tag
bun run Tools/RecordManager.ts tag add --query "medical receipts" --tag "tax-deductible"

# List all tags
bun run Tools/RecordManager.ts tags list

# List tags in domain
bun run Tools/RecordManager.ts tags list --domain household

# Create new tag
bun run Tools/RecordManager.ts tags create --name "new-tag" --color "#FF6600"
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Tag not found | Create tag first or check spelling |
| Document not found | Verify document ID |
| Permission denied | Check API token permissions |
| Duplicate tag | Tag already applied to document |

## Related Workflows

- `OrganizeWorkflow.md` - Bulk tag improvements (uses Records Keeper)
- `UploadWorkflow.md` - Auto-tag on upload (uses Sensitivity Scanner)
- `SearchWorkflow.md` - Find documents to tag (uses Records Keeper)
