# Manual Document Tagging Workflow

**Purpose:** Manually classify documents into the hierarchical taxonomy with expert guidance.

**When to use:** Primary method for migrating from flat tags to hierarchical taxonomy.

**Why manual:** Automated keyword matching achieves only 14% accuracy due to semantic false positives. Manual classification with taxonomy guidance is faster and more accurate than cleaning up automated errors.

---

## Prerequisites

1. Paperless-ngx instance configured
2. Environment variables set in `~/.claude/.env`:
   - `MADEINOZ_RECORDMANAGER_PAPERLESS_URL`
   - `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN`
   - `MADEINOZ_RECORDMANAGER_COUNTRY`
   - `MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN`

---

## Workflow Steps

### Step 1: Identify Document to Classify

Open the document in paperless-ngx and note:
- **Document ID** (from URL: `/documents/123`)
- **Title**
- **Content** (skim the document)
- **Current tags** (if any)
- **Document type** (if set)

### Step 2: Search Taxonomy

Use the taxonomy browser to find relevant classification:

```bash
# Search by keyword
bun run Tools/TaxonomyBrowser.ts --domain household --search "vehicle registration"

# Browse by function
bun run Tools/TaxonomyBrowser.ts --domain household --function VehicleManagement

# Browse specific service
bun run Tools/TaxonomyBrowser.ts --domain household \
  --function VehicleManagement --service Registration
```

**Search Strategy:**
1. Start with most specific keywords from document (e.g., "vehicle registration renewal")
2. If no results, broaden to single keywords (e.g., "vehicle", "registration")
3. Review high relevance matches first (Score ≥ 10)
4. If still unclear, browse related functions

### Step 3: Select Classification Path

Choose the most appropriate path based on:
- **Primary purpose** of the document (not just keywords)
- **Retention requirements** (use `--retention` flag to view)
- **Document type** alignment

**Example Decision Process:**

Document: "Comprehensive Car Insurance - New Policy"
- ❌ Wrong: VehicleManagement/Registration (keyword "policy" matches)
- ✅ Correct: VehicleManagement/Insurance/VehicleInsurance (primary purpose is insurance)

Document: "Australian Higher Education Graduation Statement"
- ❌ Wrong: FinancialManagement/BankingServices (keyword "statement" matches)
- ✅ Correct: Education/AcademicRecords/Transcripts (primary purpose is education)

### Step 4: Apply Tags

Use RecordManager CLI to apply the hierarchical tags:

```bash
bun run Tools/RecordManager.ts tag <document-id> \
  --function <FunctionName> \
  --service <ServiceName> \
  --activity <ActivityName> \
  --domain household
```

**Example:**
```bash
bun run Tools/RecordManager.ts tag 123 \
  --function VehicleManagement \
  --service Insurance \
  --activity VehicleInsurance \
  --domain household
```

This will:
1. Add hierarchical tags: `VehicleManagement`, `Insurance`, `VehicleInsurance`
2. Add document type tags: `insurance policy`, `premium`, `coverage`
3. Set storage path: `/Household/Vehicle Management/Insurance/Vehicle Insurance`
4. Set retention period based on country rules

### Step 5: Verify

Check in paperless-ngx that:
- All hierarchical tags are applied
- Storage path is set
- Document appears in correct location

---

## Batch Processing Strategy

For large migrations (100+ documents):

### Week 1: High-Value Documents (10%)
- Financial records (tax, banking, insurance)
- Legal documents (deeds, contracts, licenses)
- Medical records (prescriptions, test results)
- **Goal:** Protect critical documents first

### Week 2: Frequent-Access Documents (20%)
- Recent documents (last 2 years)
- Frequently searched types (receipts, invoices, warranties)
- **Goal:** Improve daily workflow

### Week 3: Bulk Categories (40%)
- Vehicle documents
- Property/household documents
- Education records
- **Goal:** Process large homogeneous groups

### Week 4: Long-Tail Documents (30%)
- Miscellaneous documents
- Edge cases requiring research
- **Goal:** Complete migration

---

## Tips for Efficiency

### 1. Group Similar Documents
Process all vehicle registrations together, all insurance policies together, etc. This builds pattern recognition and speeds up classification.

### 2. Use Document Type as Anchor
If document already has a type (e.g., "Invoice"), use taxonomy browser to find all activities that handle invoices:

```bash
bun run Tools/TaxonomyBrowser.ts --domain household --search "invoice"
```

### 3. Create a Cheat Sheet
After classifying 20-30 documents, you'll notice patterns. Document common paths:

```
Vehicle Registration → VehicleManagement/Registration/RegistrationRecords
Car Insurance → VehicleManagement/Insurance/VehicleInsurance
Bank Statement → FinancialManagement/BankingServices/AccountManagement
Medical Prescription → HealthManagement/MedicalCare/Prescriptions
```

### 4. Mark Unclear Documents
If unsure about classification:
1. Add a temporary tag: `needs-review`
2. Continue with other documents
3. Review batch at end when you have more context

### 5. Leverage Correspondents
If document has a correspondent (e.g., "ANZ Bank"), use that to guide classification:
- ANZ Bank → FinancialManagement/BankingServices
- Medicare → HealthManagement/MedicalCare
- DMV → VehicleManagement/Registration

---

## Common Classification Patterns

| Document Type | Typical Path | Retention |
|---------------|--------------|-----------|
| Bank Statement | FinancialManagement/BankingServices/AccountManagement | 5 years (ATO) |
| Tax Return | FinancialManagement/Taxation/TaxReturns | 7 years (ATO) |
| Vehicle Registration | VehicleManagement/Registration/RegistrationRecords | 5 years (State) |
| Car Insurance | VehicleManagement/Insurance/VehicleInsurance | 7 years (Insurance) |
| Medical Prescription | HealthManagement/MedicalCare/Prescriptions | 7 years (Health) |
| Property Deed | PropertyManagement/Legal/PropertyTitles | Permanent |
| Utility Bill | PropertyManagement/Utilities/UtilityBills | 2 years (ATO) |
| Warranty | PropertyManagement/Maintenance/Warranties | 5 years (ATO) |
| Education Transcript | Education/AcademicRecords/Transcripts | Permanent |
| Insurance Policy | VehicleManagement/Insurance/VehicleInsurance OR PropertyManagement/Insurance/HomeInsurance | 7 years |

---

## Avoiding Common Mistakes

### Mistake 1: Keyword Over-Matching
❌ "Contact Information" → HealthManagement/VisionCare/GlassesContacts
✅ "Contact Information" → CommunicationsManagement/Contacts/ContactDirectory

**Fix:** Consider the document's primary purpose, not just keywords.

### Mistake 2: Wrong Hierarchy Level
❌ Putting all vehicle docs under VehicleManagement (function level)
✅ Classify by service: Registration, Insurance, Maintenance, Purchase

**Fix:** Always classify to Activity level (4th level), not Function or Service.

### Mistake 3: Confusing Similar Activities
- "Maintenance/Repairs" vs "Maintenance/Warranties"
- "BankingServices/AccountManagement" vs "BankingServices/LoanManagement"

**Fix:** Read the activity descriptions in TaxonomyBrowser output.

---

## Quality Assurance

After tagging 50+ documents, run a spot check:

```bash
# List documents by function
bun run Tools/RecordManager.ts list --function VehicleManagement

# Review storage paths
bun run Tools/RecordManager.ts audit --check-paths
```

Look for:
- Documents that seem misclassified
- Missing retention periods
- Inconsistent patterns (e.g., some bank statements in different paths)

---

## Estimated Time

Based on pilot testing:
- **Setup and learning:** 30 minutes (one-time)
- **Per document (experienced):** 30-60 seconds
- **Per document (new user):** 2-3 minutes

For 409 documents:
- New user: ~20-30 hours (spread over 2-4 weeks)
- Experienced user: ~5-10 hours (1-2 weeks)

**This is faster than:**
- Cleaning up 274 incorrectly auto-classified documents (~40 hours)
- Reviewing 319 auto-classified documents for accuracy (~15-20 hours)

---

## Next Steps

1. Start with Step 1: Identify a document
2. Use TaxonomyBrowser to search/browse taxonomy
3. Apply tags with RecordManager CLI
4. Build pattern recognition over first 20 documents
5. Increase speed as you learn common paths

**Remember:** Manual classification with proper taxonomy guidance is more efficient than automated classification with 14% accuracy.
