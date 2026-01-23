# Search Workflow

> Find documents in paperless-ngx using intelligent search with taxonomy expertise

## Triggers

- "Find [document type]"
- "Search for [query]"
- "Show me [tag] documents"
- "Where are my [type] records?"
- "List all [category] documents"

## Agents Used

This workflow leverages specialized agents from `AGENTS.md`:

| Agent | Role | When Used |
|-------|------|-----------|
| **Records Keeper 📋** | Search optimization | Translates natural language to optimal search queries |
| **Archive Architect 🏛️** | Complex searches | Multi-criteria searches across large collections |

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

SEARCH OPTIMIZATION REQUEST:
User query: "${userQuery}"
Domain: ${domain}
Country: ${country}

Your task:
1. Parse natural language query into search criteria
2. Identify relevant tags from TaxonomyExpert
3. Suggest document types to filter by
4. Determine date range if applicable
5. Build optimal paperless-ngx search query

Return: { tags, documentTypes, dateRange, fullTextQuery, searchStrategy }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

### Archive Architect Agent (For Complex Searches)

```typescript
const archiveArchitectPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "technical,analytical,pragmatic,synthesizing"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: archiveArchitectPrompt + `

COMPLEX SEARCH REQUEST:
User query: "${userQuery}"
Document count: ${totalDocuments}
Search history: ${previousSearches}

Your task:
1. Design multi-stage search strategy
2. Optimize for large document collections
3. Suggest faceted search approach
4. Identify potential search refinements

Return: { searchPlan, stages, facets, refinements }
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```

## Process

### Step 1: Parse Search Intent

**Records Keeper agent analyzes query:**

1. Extract key terms and concepts
2. Map to taxonomy tags
3. Identify document types
4. Detect date references
5. Build structured search

### Step 2: Execute Search

```bash
# Execute search via CLI
bun run Tools/RecordManager.ts search --query "<text>" --tags "<tags>" --type "<type>"
```

### Step 3: Present Results

```
🔍 Search Results for "tax receipts 2024"

Found 15 documents matching your criteria:

ID    | Title                          | Date       | Tags
------|--------------------------------|------------|------------------
#1234 | Medical Receipt - Dr. Smith    | 2024-03-15 | medical, tax, 2024
#1235 | Pharmacy Receipt - Chemist     | 2024-04-22 | pharmacy, tax, 2024
#1236 | Donation Receipt - Red Cross   | 2024-06-01 | charity, tax, 2024
...

Showing 10 of 15 results. Type 'more' to see additional results.

Refine search:
  • Add tag: --tags "medical"
  • Filter by date: --from 2024-01-01 --to 2024-06-30
  • Show document: info #1234
```

### Step 4: Offer Refinements

If results are too broad:
- Suggest additional tag filters
- Recommend date range narrowing
- Offer document type filtering

If no results:
- Suggest alternative tags
- Check for typos
- Broaden search criteria

## Search Syntax

### Basic Search
```bash
bun run Tools/RecordManager.ts search --query "tax receipt"
```

### Tag-Based Search
```bash
bun run Tools/RecordManager.ts search --tags "tax,medical,2024"
```

### Document Type Search
```bash
bun run Tools/RecordManager.ts search --type "Medical Receipt"
```

### Date Range Search
```bash
bun run Tools/RecordManager.ts search --from 2024-01-01 --to 2024-12-31
```

### Combined Search
```bash
bun run Tools/RecordManager.ts search \
  --query "receipt" \
  --tags "tax" \
  --type "Medical Receipt" \
  --from 2024-01-01
```

## Natural Language Examples

| User Says | Records Keeper Translates |
|-----------|--------------------------|
| "Find my 2024 tax receipts" | `--tags tax,2024 --type Receipt` |
| "Show insurance policies" | `--tags insurance --type "Insurance Policy"` |
| "Where are the Smith Family Trust documents?" | `--tags entity:smith-family-trust` |
| "Medical records from last year" | `--tags medical --from 2023-01-01 --to 2023-12-31` |
| "Find all FTE documents" | `--tags fte,family-trust --type "Family Trust Election"` |

## CLI Integration

```bash
# Natural language search (Records Keeper interprets)
bun run Tools/RecordManager.ts search "tax receipts from 2024"

# Structured search
bun run Tools/RecordManager.ts search --tags tax --from 2024-01-01

# Search within entity
bun run Tools/RecordManager.ts search --entity smith-family-trust --type "Tax Return"

# Export search results
bun run Tools/RecordManager.ts search --query "invoices" --export csv
```

## Error Handling

| Error | Resolution |
|-------|------------|
| No results found | Suggest broader search or alternative tags |
| Too many results | Suggest additional filters |
| Invalid tag | Show available tags from taxonomy |
| Connection failed | Check paperless-ngx connectivity |

## Related Workflows

- `InfoWorkflow.md` - Get details on specific document
- `TagWorkflow.md` - Add or modify tags on found documents
- `RetentionWorkflow.md` - Check retention on search results
