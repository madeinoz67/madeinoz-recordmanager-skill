# Document Search

Effective document search is critical for maintaining an organized records system. Records Manager provides powerful search capabilities through paperless-ngx integration, combining full-text content search with tag-based filtering.

## Search Basics

### Simple Search

The quickest way to find documents is by describing what you're looking for:

```
User: "Find my tax return"
AI: [Returns documents matching 'tax return']

User: "Show me medical receipts"
AI: [Returns documents with 'medical' and 'receipt' tags]
```

### Search by Document ID

If you know the exact document ID:

```
User: "Show me document 1234"
AI: [Returns detailed information for document #1234]
```

## Search Strategies

### By Content

Paperless-ngx indexes document content, enabling full-text search:

```
User: "Search for documents containing 'Smith'"
AI: [Returns all documents where 'Smith' appears in content]
```

**Tips for content search:**

*   Use specific terms: "invoice" instead of "payment document"
*   Include names: "Dr Smith" instead of "doctor"
*   Search dates: "January 2024" instead of "early this year"

### By Tags

Tags are the primary organizational mechanism:

```
User: "Find all documents tagged 'medical'"
AI: [Returns documents with 'medical' tag]

User: "Show documents tagged 'financial' and '2024'"
AI: [Returns documents with both tags]
```

**Tag search patterns:**

*   Single tag: `medical`
*   Multiple tags: `financial tax 2024`
*   Tag categories: `insurance vehicle`

### By Document Type

Each document has a type for classification:

```
User: "Find all invoices"
AI: [Returns documents with type 'Invoice']

User: "Show medical receipts"
AI: [Returns documents with type 'Medical Receipt']
```

**Common document types:**
*   Invoice, Receipt, Tax Return, Bank Statement
*   Insurance Policy, Contract, Legal Document
*   Trust Deed, Distribution Minutes, Trustee Resolution

### By Date Range

Filter documents by creation or document date:

```
User: "Find invoices from January 2024"
AI: [Returns invoices created in January 2024]

User: "Show tax documents from 2023"
AI: [Returns tax documents dated 2023]
```

### Combined Searches

The most powerful searches combine multiple filters:

```
User: "Find medical receipts from 2024 that are tax deductible"
AI: "Searching with filters:"
    "  - Type: Medical Receipt"
    "  - Tags: medical, receipt, tax-deductible, 2024"
    "  "
    "Found 8 documents:"
    "  #1234: Medical Receipt - Dr Smith ($150)"
    "  #1235: Pharmacy Receipt ($45)"
    "  ..."
```

## Search Workflow

The Search workflow follows a consistent process:

1. **Parse Request**: Extract search criteria from natural language
2. **Build Query**: Combine filters (tags, type, content, dates)
3. **Execute Search**: Query paperless-ngx API
4. **Present Results**: Show matches with key details
5. **Offer Refinement**: Suggest ways to narrow or expand

### Result Display

Search results include:

```
#1234: Medical Receipt - Dr Smith
  Created: 2024-03-15
  Tags: medical, receipt, tax-deductible, 2024
  Type: Medical Receipt
  Retention: Until 2031-03-15 (7 years)
```

## CLI Search

For programmatic or script-based search:

```bash
# Basic search
bun run RecordManager.ts search --query "medical"

# Search with tags
bun run RecordManager.ts search --tags "financial,tax,2024"

# Search by type
bun run RecordManager.ts search --type "Invoice"

# Combined search
bun run RecordManager.ts search \
  --query "office supplies" \
  --tags "expense,2024" \
  --type "Receipt"
```

## Advanced Search Techniques

### Fuzzy Matching

Paperless-ngx supports fuzzy matching for typos and variations:

```
User: "Find documents from Dr Smyth" (note: typo)
AI: [Finds documents from 'Dr Smith']
```

### Regular Expressions

For complex pattern matching:

```bash
bun run RecordManager.ts search --query "invoice.*2024"
```

### Exclude Terms

Use negation to exclude certain results:

```
User: "Find invoices excluding cancelled ones"
AI: [Returns invoices without 'cancelled' tag]
```

### Search Within Results

Refine previous searches:

```
User: "Find all 2024 documents"
AI: [Returns 156 documents]

User: "Now show only the medical ones"
AI: [Refines to 23 medical documents from 2024]
```

## Search Best Practices

### Be Specific

Vague searches return too many results:

**Poor:**
```
User: "Find old documents"
AI: [Returns hundreds of documents]
```

**Better:**
```
User: "Find tax returns from before 2020"
AI: [Returns specific documents]
```

### Use Filters

Combine multiple filters for precision:

```
User: "Find medical receipts from 2024 that are tax deductible over $100"
```

### Search Content, Not Just Titles

Paperless-ngx indexes document content:

```
User: "Search for documents mentioning 'John Smith'"
AI: [Finds contracts, invoices, letters naming John Smith]
```

### Leverage Tags

Well-tagged documents are searchable documents:

```
User: "Show all household documents from 2024"
AI: [Uses 'household' and '2024' tags for fast filtering]
```

## Search Shortcuts

Create aliases for common searches:

```bash
# Common searches
alias rm-tax='bun run RecordManager.ts search --tags "tax"'
alias rm-medical='bun run RecordManager.ts search --tags "medical"'
alias rm-2024='bun run RecordManager.ts search --tags "2024"'
alias rm-invoices='bun run RecordManager.ts search --type "Invoice"'

# Combined searches
alias rm-tax-2024='bun run RecordManager.ts search --tags "tax,2024"'
alias rm-deductions='bun run RecordManager.ts search --tags "tax-deductible"'
```

## Organizing for Better Search

Good search starts with good organization:

### Tag Strategy

*   **Category tags**: financial, medical, insurance, legal
*   **Year tags**: 2024, 2023, 2022
*   **Status tags**: tax-deductible, paid, pending, archived
*   **Entity tags**: household, corporate, trust-name

### Document Type Assignment

Always assign document types (not just tags):

*   Invoices should have type "Invoice"
*   Tax documents should have type "Tax Return" or "Tax Assessment"
*   Insurance documents should have type "Insurance Policy"

### Consistent Naming

Use consistent document titles:

```
Good: "Invoice - Supplier Name - YYYY-MM-DD"
Bad: "Scan001.pdf"
Bad: "Document (1)"
```

## Search Examples by Use Case

### Tax Preparation

```
User: "Find all tax deductible medical expenses from 2024"
AI: "Searching with filters:"
    "  - Tags: medical, tax-deductible, 2024"
    "  - Types: Medical Receipt"
    "  "
    "Found 12 documents totaling $1,847"
```

### Insurance Claims

```
User: "Find home insurance documents and related receipts"
AI: "Found documents:"
    "  Policy: #1234 - Home Insurance (expires 2024-12-31)"
    "  Receipts: 8 documents related to home repairs"
```

### Trust Administration

```
User: "Find all Smith Family Trust documents for 2024"
AI: "Found 34 documents:"
    "  Financial Statements (1)"
    "  Distribution Minutes (1)"
    "  Correspondence (12)"
    "  Tax documents (4)"
    "  Other (16)"
```

### Audit Preparation

```
User: "Find all documents I need for a 2024 financial audit"
AI: "Compiling audit documents..."
    "  Financial Statements: ✓"
    "  Invoices: 127 documents"
    "  Receipts: 234 documents"
    "  Bank Statements: 12 documents"
    "  Tax Documents: 8 documents"
    "  "
    "  Total: 386 documents ready for export"
```

## Troubleshooting Search

### Too Many Results

Narrow with more filters:

```
User: "Find invoices" (returns 500+ results)
AI: "Try refining by:"
    "  - Year: 'invoices from 2024'"
    "  - Tag: 'invoices tagged unpaid'"
    "  - Amount: 'invoices over $1000'"
```

### No Results

Broaden the search:

```
User: "Find invoice from Acme Corp dated March 15 2024" (no results)
AI: "Try broader searches:"
    "  - 'Find Acme Corp invoices'"
    "  - 'Find invoices from March 2024'"
    "  - 'Search for Acme'"
```

### Unexpected Results

Check document tags:

```
User: "Why did this document appear?"
AI: "Document #1234 matched because:"
    "  - Content contains: 'search term'"
    "  - Tags include: 'matching tag'"
    "  - Type is: 'matching type'"
```

## Search Performance Tips

1. **Use tags first**: Tag-based search is faster than content search

2. **Add year filters**: Reduces search space significantly

3. **Specify document types**: Narrowing by type improves results

4. **Search recent first**: Limit to recent years when possible

5. **Combine filters**: Multiple specific filters beat one vague filter
