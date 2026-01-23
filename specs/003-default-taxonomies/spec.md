# Feature Specification: Default Taxonomies for Entity Types and Countries

**Feature Branch**: `001-default-taxonomies`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "the pack does not have any default taxonomies, these need to identified for the differnt types of entities, and countries and needs to be a through taxonmies that align with countries regulatiosn. They also need to be copied across during skiil installation for the country being installed, all entity types must also be copied across as they may be added in the future. will help to read the suer documentaiton aroudn taxonmies for structure"

## Clarifications

### Session 2026-01-22

- Q: What is the target performance for complete taxonomy installation (all 7 entity types for one country)? → A: No specific target (best effort based on API performance)
- Q: What recovery strategy should be used when taxonomy installation fails partway through? → A: Rollback all changes on any failure
- Q: How should the system handle tag conflicts when paperless-ngx already has tags with the same names? → A: Skip existing tags, install only new ones
- Q: How should the system handle retention period changes when a new version updates regulatory requirements? → A: Warn user, require manual review
- Q: What should happen when a user changes their country setting after initial installation? → A: Reinstall taxonomies for new country, preserve existing documents
- Q: What is the transition timeline for migrating from flat document type lists to hierarchical taxonomy model? → A: 12-month transition period with both models supported, then deprecate flat model
- Q: How should users navigate the hierarchical taxonomy (Function → Service → Activity) in CLI workflows? → A: Hybrid approach (support both interactive prompts and path-based input for power users)
- Q: Should the system enforce specific performance targets for API operations during taxonomy installation (e.g., max latency per operation, retry limits)? → A: No specific targets (remain best-effort, installation completes when it completes)
- Q: What does "full feature parity" mean for the 12-month transition between flat and hierarchical taxonomy models? → A: Complete parity (all features, workflows, and performance identical between models)
- Q: How should existing flat document type classifications be mapped to the new hierarchical Function → Service → Activity structure during migration? → A: Hybrid mapping (auto-map standard types with mapping table, manual review for ambiguous cases)

### Session 2026-01-23

- Q: Should country identifiers use ISO 3166-1 alpha-2 (AU, US, GB), alpha-3 (AUS, USA, GBR), or full names (Australia, United States, United Kingdom)? → A: **ISO 3166-1 alpha-3** (3-letter codes) for consistency (always 3 chars), better readability (USA vs US), shorter paths than full names (67% reduction), no spaces, and fixes existing "UK" error (correct is GBR). Include both `country` (code) and `countryName` (human-readable) in taxonomy metadata. See `COUNTRY-CODE-STANDARD.md` for complete rationale.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Taxonomy Installation for Country-Specific Compliance (Priority: P1)

A Records Manager pack user installs the skill for the first time and needs country-specific taxonomies to be automatically available in their paperless-ngx instance. The user selects their country during installation, and all relevant entity types and their taxonomies are automatically copied to their system.

**Why this priority**: Without default taxonomies, users have no document classification framework on installation. This is the foundational capability that enables all other record keeping features.

**Independent Test**: Can be fully tested by installing the skill with a selected country and verifying that all entity type taxonomies for that country appear in paperless-ngx as tags, document types, and retention rules.

**Acceptance Scenarios**:

1. **Given** a fresh PAI installation with paperless-ngx configured, **When** the user installs the Records Manager skill and selects "Australia" as their country, **Then** all entity type taxonomies for Australia (household, corporate, unit-trust, discretionary-trust, family-trust, project, person) are installed with their respective document types, tag categories, and retention rules
2. **Given** a user selecting "United States" as their country during installation, **When** the installation completes, **Then** only the taxonomies applicable to US regulations are installed (household domain initially, with planned corporate/trust support)
3. **Given** an existing installation with taxonomies already present, **When** the user reinstalls or updates the skill, **Then** existing taxonomies are preserved without duplication and only missing entity types are added
4. **Given** a user in a supported country, **When** viewing tags in paperless-ngx after installation, **Then** they see all tag categories defined for their country's entity types (e.g., financial, medical, insurance, legal for Australian household)

---

### User Story 2 - Complete Taxonomy Coverage for All Entity Types (Priority: P1)

A user managing multiple types of records (household, corporate, and various trust structures) needs comprehensive taxonomies for each entity type that align with regulatory requirements. Each entity type must have its full taxonomy available including document types, tag categories, and retention rules.

**Why this priority**: Records Manager supports multiple entity types (household, corporate, three trust types, projects, persons). Each type requires specialized taxonomies. Without complete coverage, users cannot properly classify documents across different entity contexts.

**Independent Test**: Can be tested by verifying that each of the 7 entity types (household, corporate, unit-trust, discretionary-trust, family-trust, project, person) has a complete taxonomy defined with document types, tag categories, and retention rules that match the country's regulatory requirements.

**Acceptance Scenarios**:

1. **Given** the Records Manager skill installed for Australia, **When** a user queries available document types for "family-trust" entity, **Then** they see all 19 trust-specific document types including Family Trust Election, Trust Deed, Trustee Resolutions, etc.
2. **Given** a user managing corporate records, **When** they view document types for the "corporate" entity, **Then** they see all 27 corporate document types including Invoice, Employee Contract, Board Resolution, Balance Sheet, etc.
3. **Given** a user managing unit trusts, **When** they access the "unit-trust" taxonomy, **Then** they see unit-specific tags like "unit-registry", "distribution", "unitholder" and document types like "Unit Registry", "Unit Transfer Form"
4. **Given** a user managing discretionary trusts, **When** they view the "discretionary-trust" taxonomy, **Then** they see discretionary-trust specific tags like "trustee-resolution", "beneficiary", "pre-eofy", "streaming"
5. **Given** each entity type, **When** examining retention rules, **Then** every document type has a defined retention period with legal justification (e.g., Family Trust Election: 5 years from FTE date per Section 272-80 ITAA 1936)

---

### User Story 3 - Regulatory Alignment Across Countries (Priority: P2)

A user in any supported country (Australia, United States, United Kingdom) must have taxonomies that accurately reflect their country's regulatory requirements. Each country has different document types, retention periods, and classification needs based on local laws.

**Why this priority**: Regulatory compliance varies significantly by country. Australian tax laws (ATO) differ from US IRS requirements and UK HMRC rules. Users need accurate local guidance to maintain legal compliance.

**Independent Test**: Can be tested by comparing the installed taxonomies for each country against official government guidance documents (ATO, IRS, HMRC) to verify retention periods and document type recommendations match.

**Acceptance Scenarios**:

1. **Given** an Australian user, **When** they check tax return retention, **Then** the system shows 7 years retention with ATO Section 254 of Tax Administration Act 1953 as the reason
2. **Given** a United States user, **When** they check tax return retention, **Then** the system shows 7 years retention with IRS recommendation as the reason (3 years minimum, 7 for safety)
3. **Given** a United Kingdom user, **When** they check tax return retention, **Then** the system shows 7 years retention with HMRC self-assessment requirement as the reason
4. **Given** an Australian family trust, **When** checking Family Trust Election retention, **Then** the system shows 5 years from FTE date (not EOFY) with Section 272-80 ITAA 1936 as the reason
5. **Given** any country, **When** viewing document types, **Then** the types available reflect documents actually used in that country's record keeping (e.g., P60, P11D, SA302 for UK; not applicable to Australia)

---

### User Story 4 - Future-Proof Entity Type Extensibility (Priority: P2)

As the Records Manager skill evolves, new entity types may be added beyond the current 7 types. The taxonomy installation system must automatically handle new entity types without requiring updates to existing installations.

**Why this priority**: Hard-coding entity types creates maintenance debt and prevents extensibility. A dynamic system that discovers and installs all available entity types ensures the skill can grow without breaking existing installations.

**Independent Test**: Can be tested by adding a new entity type definition to the taxonomy data structure and verifying that installation automatically includes the new type without code changes to the installation process.

**Acceptance Scenarios**:

1. **Given** the taxonomy data structure with 7 defined entity types, **When** an 8th entity type is added to the data structure, **Then** the installation process automatically discovers and installs the new entity type's taxonomies without modification
2. **Given** an existing installation with 7 entity types, **When** the skill is updated to include a new entity type, **Then** running the installation again adds only the new entity type without duplicating existing taxonomies
3. **Given** any supported country, **When** taxonomies are installed, **Then** all entity types defined for that country are installed regardless of how many exist in the data structure
4. **Given** a country with partial entity type support (e.g., United States with only household domain defined), **When** installation runs, **Then** only the defined entity types are installed without errors for missing types

---

### User Story 5 - Comprehensive Operational Taxonomy (Function → Service → Activity) (Priority: P0)

A user managing records for any entity type needs a comprehensive operational taxonomy that represents all functions, services, and activities performed by that entity. The taxonomy must cover ALL operations, not just compliance-focused document types. Documents should be organized hierarchically by: Function (top-level capability) → Service (specific offering) → Activity (discrete task) → Document Types (evidence/artifacts).

**Why this priority**: P0 (Critical Foundation) - Current taxonomy is compliance-focused (tax documents, legal filings) but doesn't represent the full operational scope of entities. A household performs functions like Health Management, Education, Pet Care beyond just "financial compliance". A corporate entity has Operations, Marketing, Product Development beyond just "accounting and HR". Without comprehensive operational taxonomies, users cannot properly classify 80% of their documents because the document types don't exist in the current limited taxonomy.

**Independent Test**: Can be tested by analyzing document collections from real entities (household, corporate, trust) and verifying that the operational taxonomy provides appropriate Function → Service → Activity → Document Type paths for 95%+ of documents without requiring custom document types.

**Acceptance Scenarios**:

1. **Given** a household entity, **When** the user views the operational taxonomy, **Then** they see comprehensive functions including: Health Management, Financial Management, Property Management, Vehicle Management, Pet Care, Education, Insurance, Legal Affairs, Tax & Compliance, Estate Planning, Travel, Entertainment, each with 3-8 services and 2-5 activities per service

2. **Given** a corporate entity, **When** the user views the operational taxonomy, **Then** they see comprehensive functions including: Finance & Accounting, Human Resources, Operations, Sales & Marketing, Product Development, Customer Service, IT & Technology, Legal & Compliance, Facilities, Procurement, Quality Assurance, Strategic Planning, each with 4-10 services and 3-8 activities per service

3. **Given** a family trust entity, **When** the user views the operational taxonomy, **Then** they see trust-specific functions including: Trust Governance, Beneficiary Management, Distribution Management, Investment Management, Tax & Compliance, Legal Affairs, each with 2-6 services and 2-5 activities per service

4. **Given** any entity type and function, **When** the user navigates to a specific activity (e.g., Finance → Accounts Payable → Invoice Processing), **Then** they see 3-8 document types relevant to that specific activity (Invoice, Purchase Order, Payment Receipt, Vendor Statement, Credit Note, etc.)

5. **Given** a user uploading a document, **When** the Records Keeper agent analyzes the document, **Then** it suggests the appropriate Function → Service → Activity → Document Type path based on document content and context

6. **Given** a user searching for documents, **When** they search by function or service, **Then** they can retrieve all documents within that hierarchical scope (e.g., all "Health Management" documents across all services and activities)

7. **Given** storage path organization, **When** documents are stored, **Then** they follow the hierarchical path: `{Entity}/{Function}/{Service}/{Activity}/` for intuitive browsing

8. **Given** retention rules, **When** defined at the activity level, **Then** all document types within that activity inherit the retention period unless explicitly overridden (e.g., all "Invoice Processing" documents default to 7 years ATO compliance)

9. **Given** tags, **When** generated from the taxonomy, **Then** they include function tags (function:finance), service tags (service:accounts-payable), and activity tags (activity:invoice-processing) for multi-dimensional classification

10. **Given** a new version of the taxonomy, **When** a new activity is added to an existing service, **Then** all document types for that activity are automatically available without requiring manual reconfiguration

11. **Given** a user uploading a document via CLI, **When** prompted for hierarchy classification, **Then** they can choose either interactive drill-down prompts (selecting Function, then Service, then Activity from menus) OR path-based input (typing "HealthManagement/MedicalCare/DoctorVisits") with both methods producing identical results

12. **Given** a power user familiar with taxonomy structure, **When** using path-based input with partial paths (e.g., "Health/Med/Doc"), **Then** the system provides autocomplete suggestions to expand to full path "HealthManagement/MedicalCare/DoctorVisits"

13. **Given** the 12-month transition period, **When** a user performs identical operations (upload, search, retention check) using flat model vs hierarchical model, **Then** both models produce identical outcomes, performance, and user experience with no functional differences

14. **Given** existing documents classified with flat document types (e.g., "Tax Return", "Invoice", "Medical Receipt"), **When** migration to hierarchical taxonomy executes, **Then** 90%+ are automatically mapped using explicit mapping table (e.g., "Tax Return" → "FinancialManagement/TaxCompliance/TaxReturns/Tax Return") and <10% ambiguous cases are flagged for manual review with mapping options presented

**Data Model Example**:

```yaml
Australia:
  household:
    functions:
      HealthManagement:
        description: "Health and medical record management for household members"
        services:
          MedicalCare:
            description: "Primary and specialist medical services"
            activities:
              DoctorVisits:
                description: "GP and specialist consultations"
                documentTypes:
                  - Medical Receipt
                  - Referral Letter
                  - Test Results
                  - Prescription
                  - Treatment Plan
                retentionDefault:
                  years: 10
                  reason: "Long-term health history substantiation"
                tags:
                  - medical
                  - consultation
                  - health-record
              Prescriptions:
                description: "Prescription medications and management"
                documentTypes:
                  - Prescription
                  - Pharmacy Receipt
                  - Medication List
                retentionDefault:
                  years: 5
                  reason: "Medical expense tax deduction substantiation"
          DentalCare:
            description: "Dental health services"
            activities:
              DentalCheckups:
                documentTypes:
                  - Dental Receipt
                  - Treatment Plan
                  - X-Ray Results
              Orthodontics:
                documentTypes:
                  - Orthodontic Treatment Plan
                  - Progress Report
                  - Payment Plan

      FinancialManagement:
        description: "Household financial operations and compliance"
        services:
          BankingServices:
            activities:
              AccountManagement:
                documentTypes:
                  - Bank Statement
                  - Account Opening Form
                  - Account Closure Letter
              TransferPayments:
                documentTypes:
                  - Transfer Receipt
                  - Payment Confirmation
          TaxCompliance:
            activities:
              TaxReturns:
                documentTypes:
                  - Tax Return
                  - Tax Assessment
                  - Notice of Assessment
                retentionDefault:
                  years: 7
                  reason: "ATO Section 254 of Tax Administration Act 1953"
              DeductionRecords:
                documentTypes:
                  - Receipt
                  - Invoice
                  - Donation Receipt

  corporate:
    functions:
      Operations:
        description: "Core operational activities and production"
        services:
          Production:
            activities:
              ManufacturingProcess:
                documentTypes:
                  - Production Report
                  - Quality Control Record
                  - Work Order
              QualityControl:
                documentTypes:
                  - Inspection Report
                  - Test Certificate
                  - Non-Conformance Report
          SupplyChain:
            activities:
              ProcurementProcess:
                documentTypes:
                  - Purchase Order
                  - Supplier Quote
                  - Supplier Agreement
              InventoryManagement:
                documentTypes:
                  - Stock Report
                  - Inventory Adjustment

      SalesMarketing:
        description: "Customer acquisition and revenue generation"
        services:
          SalesOperations:
            activities:
              QuotationProcess:
                documentTypes:
                  - Sales Quote
                  - Proposal
                  - Pricing Sheet
              OrderFulfillment:
                documentTypes:
                  - Sales Order
                  - Delivery Note
                  - Invoice
          Marketing:
            activities:
              CampaignManagement:
                documentTypes:
                  - Campaign Plan
                  - Marketing Report
                  - Campaign Budget
              ContentCreation:
                documentTypes:
                  - Marketing Material
                  - Brand Guidelines
                  - Creative Brief
```

**Migration Path**:

1. Phase 1 (Months 1-2): Extend taxonomy data structure to support hierarchical Function → Service → Activity model while maintaining backwards compatibility with flat document type lists
2. Phase 2 (Months 3-5): Populate comprehensive operational taxonomies for all entity types (household, corporate, all trust types, projects, persons)
3. Phase 3 (Months 6-7): Update TaxonomyExpert to navigate hierarchical structure with new API methods: `getFunctions()`, `getServices(function)`, `getActivities(service)`, `getDocumentTypes(activity)`
4. Phase 4 (Months 8-9): Update upload workflow to suggest Function → Service → Activity path during document classification
5. Phase 5 (Months 10-11): Update storage path strategy to organize by function/service/activity hierarchy
6. Phase 6 (Month 12): Generate hierarchical tags (function:X, service:Y, activity:Z) from taxonomy structure
7. **Transition Period**: 12-month coexistence period where both flat and hierarchical models are fully supported with feature parity
8. **Deprecation (Month 13+)**: Flat model deprecated, hierarchical model becomes the only supported taxonomy structure

---

### User Story 6 - Expert Agent Workflow Integration (Priority: P1)

Specialized expert agents (Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, Retention Monitor) must use the correct taxonomy and tags for all operations. When agents perform document classification, retention checks, or compliance validation, they must reference the installed taxonomies to ensure consistent, accurate, and regulatory-aligned results.

**Why this priority**: The value of default taxonomies is realized when expert agents use them consistently. Without proper workflow integration, agents may use incorrect or incomplete taxonomy data, leading to misclassification, compliance risks, or incorrect retention advice.

**Independent Test**: Can be tested by invoking each expert agent workflow and verifying that the agent references the correct taxonomy data (document types, tags, retention rules) for the user's country and selected entity type.

**Acceptance Scenarios**:

1. **Given** a user uploading a document for "Smith Family Trust" entity, **When** the Records Keeper agent processes the upload, **Then** it suggests tags from the family-trust taxonomy (fte, beneficiary, trustee-resolution, governance) and document types specific to family trusts
2. **Given** a user checking retention for a "Tax Return" document, **When** the Retention Monitor agent calculates retention, **Then** it uses the country-specific retention rule (Australia: 7 years with ATO Section 254 citation; United States: 7 years with IRS citation)
3. **Given** a user validating trust completeness, **When** the Compliance Guardian agent checks required documents, **Then** it uses the correct document type checklist for the specific trust type (unit-trust: 20 types; discretionary-trust: 19 types; family-trust: 19 types)
4. **Given** a user reviewing documents before deletion, **When** the Deletion Auditor agent assesses safety, **Then** it references retention rules from the correct country taxonomy and warns for documents within retention periods
5. **Given** a user with multiple entity types, **When** the Sensitivity Scanner agent classifies document sensitivity, **Then** it applies entity-specific sensitivity rules using the appropriate taxonomy tags
6. **Given** any expert agent workflow, **When** the agent requires taxonomy data, **Then** it retrieves data from the single source of truth (TaxonomyExpert) rather than hardcoded values or separate configurations
7. **Given** a user switching between entity types, **When** the Archive Architect agent recommends storage strategy, **Then** it uses the storage path mapping defined for the selected entity type

---

### Edge Cases

- What happens when a user's country is not supported (falls back to Australia with warning)?
- What happens when taxonomy installation fails partway through → **System performs complete rollback of all taxonomy changes to maintain data consistency and prevent orphaned tags/document types**
- What happens when paperless-ngx already has tags with conflicting names → **System skips existing tags and installs only new ones, preserving user customizations while completing installation successfully**
- What happens when retention periods change between versions → **System warns user about retention period changes and requires manual review before applying updates to prevent unexpected compliance policy changes**
- What happens when an entity type is removed from the taxonomy data structure (preserve existing user data)?
- What happens when a user changes their country setting after initial installation → **System reinstalls taxonomies for the new country while preserving all existing documents; retention periods shift to new country's rules**
- What happens when custom field definitions for trust/person entities conflict (naming strategy)?
- What happens when an expert agent is invoked before taxonomies are installed (graceful fallback or prompt to install)?
- What happens when an agent workflow requests a non-existent entity type taxonomy (error message with suggested types)?
- What happens when an agent attempts to use a tag not defined in the taxonomy for the selected entity type (validation error and correction)?
- What happens when an agent suggests a document type not in the taxonomy (validation error with closest match suggestion)?
- What happens when an agent workflow uses hardcoded retention values instead of TaxonomyExpert (enforcement failure detected)?
- What happens when multiple agents operate on the same document and suggest conflicting tags (reconciliation strategy using taxonomy priority)?

---

## Taxonomy Enforcement Mechanism *(mandatory)*

### Overview

Expert agents (Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, Retention Monitor) MUST use correct taxonomies and tags at all times. This section defines the enforcement mechanism that prevents agents from using incorrect, outdated, or hardcoded taxonomy data.

### Single Source of Truth

**TaxonomyExpert class** (`src/skills/RecordsManager/Lib/TaxonomyExpert.ts`) is the ONLY authoritative source for:
- Document types (`documentTypes` array)
- Tag categories (`tagCategories` mapping)
- Retention rules (`retentionRules` mapping)
- Country-specific compliance requirements
- Entity type taxonomies

### Enforcement Rules

#### Rule 1: No Hardcoded Taxonomy Data

**PROHIBITED:**
```typescript
// ❌ WRONG - Hardcoded document type
const documentType = "Tax Return";

// ❌ WRONG - Hardcoded tags
const tags = ["financial", "tax", "2024"];

// ❌ WRONG - Hardcoded retention
const retentionYears = 7;
```

**REQUIRED:**
```typescript
// ✅ CORRECT - Retrieve from TaxonomyExpert
const taxonomyExpert = createExpertFromEnv();
const suggestion = taxonomyExpert.suggestMetadata(fileName, content, domain);
const documentType = suggestion.documentType;
const tags = suggestion.tags;
const retentionYears = suggestion.retentionYears;
```

#### Rule 2: Validate All Suggestions

Before applying any tag or document type, workflows MUST validate against TaxonomyExpert:

```typescript
// ✅ CORRECT - Validate tags
const validTags = [];
const taxonomyExpert = createExpertFromEnv();
const tagCategories = taxonomyExpert.getTagCategories(domain);
const allValidTags = Object.values(tagCategories).flat();

for (const tag of suggestedTags) {
  if (allValidTags.includes(tag)) {
    validTags.push(tag);
  } else {
    console.warn(`Invalid tag "${tag}" not in taxonomy for ${domain}`);
    // Suggest closest match or reject
  }
}

// ✅ CORRECT - Validate document type
const documentTypes = taxonomyExpert.getDocumentTypes(domain);
if (!documentTypes.includes(suggestedDocType)) {
  throw new Error(`Invalid document type "${suggestedDocType}" not in taxonomy for ${domain}`);
}

// ✅ CORRECT - Validate retention
const retention = taxonomyExpert.getRetentionRequirements(documentType, domain);
if (!retention) {
  throw new Error(`No retention rule found for "${documentType}" in ${domain}`);
}
```

#### Rule 3: Agent Prompt Requirements

All expert agent prompts MUST include these instructions:

```
TAXONOMY ENFORCEMENT REQUIREMENTS:

1. NEVER use hardcoded document types, tags, or retention periods
2. ALWAYS retrieve taxonomy data from TaxonomyExpert class methods:
   - getDocumentTypes(domain) - Get valid document types
   - getTagCategories(domain) - Get valid tag categories and tags
   - getRetentionRequirements(documentType, domain) - Get retention rules
3. VALIDATE all suggestions against taxonomy before returning them
4. If a user-provided value doesn't match taxonomy, suggest the closest match
5. Include country and entity type context in all taxonomy requests
6. If taxonomies are not installed, STOP and prompt user to run installation
```

#### Rule 4: Workflow Validation Layer

Every workflow that processes agent suggestions MUST include a validation step:

```typescript
function validateAgentSuggestions(
  suggestions: AgentSuggestions,
  country: string,
  domain: Domain
): ValidationResult {
  const taxonomyExpert = new TaxonomyExpert(country, domain);
  const errors: string[] = [];

  // Validate document type
  const validDocTypes = taxonomyExpert.getDocumentTypes(domain);
  if (suggestions.documentType && !validDocTypes.includes(suggestions.documentType)) {
    errors.push(`Invalid document type: ${suggestions.documentType}`);
  }

  // Validate tags
  const tagCategories = taxonomyExpert.getTagCategories(domain);
  const allValidTags = Object.values(tagCategories).flat();
  for (const tag of suggestions.tags) {
    if (!allValidTags.includes(tag)) {
      errors.push(`Invalid tag: ${tag} not in taxonomy for ${domain}`);
    }
  }

  // Validate retention
  if (suggestions.documentType) {
    const retention = taxonomyExpert.getRetentionRequirements(
      suggestions.documentType,
      domain
    );
    if (!retention) {
      errors.push(`No retention rule for: ${suggestions.documentType}`);
    } else if (suggestions.retentionYears !== retention.years) {
      errors.push(`Retention mismatch: expected ${retention.years}, got ${suggestions.retentionYears}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions
  };
}
```

#### Rule 5: Audit Logging

All taxonomy validation failures MUST be logged:

```typescript
interface TaxonomyValidationLog {
  timestamp: string;
  agentType: string; // "Records Keeper", "Compliance Guardian", etc.
  country: string;
  entityType: Domain;
  validationType: "tag" | "documentType" | "retention";
  attemptedValue: string;
  validValues: string[];
  error: string;
  correctionApplied?: string;
}
```

Logs are written to: `$PAI_HOME/MEMORY/RECORDSMANAGER/taxonomy-validation-failures.jsonl`

### Enforcement Implementation Checklist

For each expert agent workflow:

- [ ] Agent prompt includes TaxonomyExpert retrieval instructions
- [ ] Agent prompt prohibits hardcoded taxonomy data
- [ ] Workflow includes validation step before applying suggestions
- [ ] Invalid suggestions are rejected with descriptive errors
- [ ] Validation failures are logged to audit trail
- [ ] Closest match suggestions are provided for near-misses
- [ ] Country and entity type context is passed to all taxonomy calls
- [ ] Installation check occurs before taxonomy operations

### Testing Enforcement

Test cases to verify enforcement:

1. **Test hardcoded bypass detection**: Agent returns hardcoded tag → Workflow rejects it
2. **Test invalid tag rejection**: Agent suggests "foobar" tag → Validation fails, closest match suggested
3. **Test invalid document type rejection**: Agent suggests "Unknown" type → Validation fails with error
4. **Test retention validation**: Agent suggests wrong retention period → Validation catches mismatch
5. **Test country mismatch**: Agent uses US taxonomy for AU country → Validation detects country error
6. **Test entity type mismatch**: Agent uses household tags for corporate domain → Validation catches domain error
7. **Test missing taxonomy**: Agent called before installation → Workflow prompts to install first
8. **Test logging**: Invalid suggestion → Validation failure logged to JSONL file

---

## Workflow Agent Enforcement *(mandatory)*

### Overview

All Records Manager workflows MUST use the specialized expert agents defined in `AGENTS.md`. Workflows cannot bypass agents and directly modify documents without agent review and validation. This ensures consistent taxonomy usage, compliance checking, and safety validation across all operations.

### Mandatory Agent Usage by Workflow

| Workflow | Required Agents | Enforcement Rule |
|----------|----------------|------------------|
| **UploadWorkflow.md** | Sensitivity Scanner (automatic), Records Keeper (tagging) | MUST scan for sensitivity, MUST use Records Keeper for tag suggestions |
| **SearchWorkflow.md** | Records Keeper (optional - query optimization) | MAY use Records Keeper to optimize search queries |
| **OrganizeWorkflow.md** | Records Keeper (mandatory) | MUST use Records Keeper for taxonomy analysis and tag suggestions |
| **TagWorkflow.md** | Records Keeper (mandatory), Sensitivity Scanner (if tags include sensitivity) | MUST validate tags against taxonomy via Records Keeper |
| **DeleteConfirmation.md** | Deletion Auditor (mandatory), Compliance Guardian (mandatory) | MUST route through Deletion Auditor for safety check, MUST verify retention via Compliance Guardian |
| **RetentionWorkflow.md** | Retention Monitor (mandatory), Compliance Guardian (mandatory) | MUST use Retention Monitor for period calculations, MUST cite regulations via Compliance Guardian |
| **InfoWorkflow.md** | Records Keeper (optional - suggest improvements) | MAY use Records Keeper to suggest taxonomy improvements |
| **AddEntityWorkflow.md** | Records Keeper (mandatory) | MUST use Records Keeper to design entity taxonomy structure |
| **WorkflowCreator.md** | Archive Architect (mandatory), Records Keeper (validation) | MUST use Archive Architect for workflow design, MUST validate via Records Keeper |
| **WorkflowReview.md** | Archive Architect (mandatory) | MUST use Archive Architect for effectiveness analysis |
| **TrustValidation.md** | Compliance Guardian (mandatory), Records Keeper (checklist) | MUST use Compliance Guardian for ATO compliance, MUST validate completeness via Records Keeper |
| **FTECheck.md** | Compliance Guardian (mandatory) | MUST use Compliance Guardian for FTE retention calculation |
| **StatusCheck.md** | None | System check workflow - no agent required |
| **EntityAudit.md** | Records Keeper (mandatory), Compliance Guardian (mandatory) | MUST use Records Keeper for completeness check, MUST verify compliance via Compliance Guardian |

### Enforcement Rules for Workflows

#### Rule 1: No Agent Bypass

Workflows MUST NOT perform these operations without agent review:

**PROHIBITED:**
```markdown
<!-- ❌ WRONG - Direct tag application without agent -->
1. Get document ID from user
2. Apply tags: ["financial", "tax", "2024"]
3. Update document in paperless-ngx
```

**REQUIRED:**
```markdown
<!-- ✅ CORRECT - Agent-validated tagging -->
1. Get document ID and filename from user
2. Invoke Records Keeper agent with:
   - Filename
   - Current tags
   - Entity type (domain)
   - Country
3. Records Keeper retrieves taxonomy via TaxonomyExpert
4. Records Keeper suggests valid tags
5. Validate suggestions against taxonomy
6. Apply only validated tags
7. Log validation results
```

#### Rule 2: Agent Prompt Template

All workflows that invoke agents MUST use this template structure:

```markdown
### Step X: Invoke [Agent Name] Agent

**Agent Type:** [Records Keeper | Compliance Guardian | Archive Architect | Deletion Auditor | Sensitivity Scanner | Retention Monitor]

**AgentFactory Traits:** [trait1, trait2, trait3, trait4]

**Agent Invocation:**
```typescript
const { execSync } = require('child_process');
const agentPrompt = execSync(
  `cd ~/.claude/skills/Agents && bun run Tools/AgentFactory.ts --traits "[traits]"`,
  { encoding: 'utf8', shell: true }
).stdout.toString();

Task({
  prompt: agentPrompt + `

TASK CONTEXT:
[Workflow-specific context]

TAXONOMY ENFORCEMENT:
- Country: ${country}
- Entity Type: ${domain}
- Operation: [upload|tag|delete|retention|etc.]

REQUIREMENTS:
1. Retrieve taxonomy from TaxonomyExpert using country and domain
2. Use ONLY document types from getDocumentTypes(domain)
3. Use ONLY tags from getTagCategories(domain)
4. Use ONLY retention rules from getRetentionRequirements(documentType, domain)
5. Return suggestions in JSON format for validation

YOUR TASK:
[Specific agent task description]

RETURN FORMAT:
{
  "documentType": "...",
  "tags": ["...", "..."],
  "retentionYears": X,
  "retentionReason": "...",
  "warnings": ["..."]
}
`,
  subagent_type: "Intern",
  model: "sonnet"
});
```\`\`\`

**Validation Step:**
```typescript
const validationResult = validateAgentSuggestions(
  agentResponse,
  country,
  domain
);

if (!validationResult.valid) {
  throw new Error(`Agent validation failed: ${validationResult.errors.join(", ")}`);
}
```
```

#### Rule 3: Workflow Validation Checkpoints

Every workflow MUST include these validation checkpoints:

1. **Pre-Agent Checkpoint:**
   - [ ] Taxonomy installation verified
   - [ ] Country and domain context determined
   - [ ] Required agent identified
   - [ ] Agent prompt prepared with taxonomy enforcement instructions

2. **Agent Invocation Checkpoint:**
   - [ ] Agent invoked with AgentFactory using correct traits
   - [ ] Taxonomy enforcement instructions included in prompt
   - [ ] Country and domain context passed to agent
   - [ ] Agent response captured

3. **Post-Agent Checkpoint:**
   - [ ] Agent response validated against TaxonomyExpert
   - [ ] Invalid suggestions rejected with errors
   - [ ] Valid suggestions approved for application
   - [ ] Validation results logged

4. **Application Checkpoint:**
   - [ ] Only validated suggestions applied to documents
   - [ ] Application success confirmed
   - [ ] User notified of results
   - [ ] Audit trail updated

#### Rule 4: Agent Bypass Detection

Workflows MUST detect and prevent agent bypass attempts:

```typescript
// ✅ CORRECT - Agent bypass detection
function detectAgentBypass(workflowName: string, operation: string): void {
  const requiredAgents = WORKFLOW_AGENT_REQUIREMENTS[workflowName];

  if (!requiredAgents || requiredAgents.length === 0) {
    return; // No agents required for this workflow
  }

  const agentInvoked = checkAgentInvocationInWorkflow(workflowName);

  if (!agentInvoked) {
    throw new Error(
      `Agent bypass detected in ${workflowName}. ` +
      `This workflow requires: ${requiredAgents.join(", ")}. ` +
      `Operation "${operation}" cannot proceed without agent review.`
    );
  }
}
```

#### Rule 5: Workflow Audit Logging

All workflow executions MUST log agent usage:

```typescript
interface WorkflowExecutionLog {
  timestamp: string;
  workflowName: string;
  operation: string;
  country: string;
  entityType: Domain;
  agentsInvoked: string[]; // ["Records Keeper", "Compliance Guardian"]
  agentValidationsPassed: number;
  agentValidationsFailed: number;
  validationErrors: string[];
  outcome: "success" | "failure" | "partial";
  documentsAffected: number[];
}
```

Logs are written to: `$PAI_HOME/MEMORY/RECORDSMANAGER/workflow-executions.jsonl`

### Workflow Compliance Checklist

For each workflow file (`*.md` in `src/skills/RecordsManager/Workflows/`):

- [ ] Workflow identifies required agents (see table above)
- [ ] Workflow includes agent invocation step with AgentFactory call
- [ ] Agent prompt includes taxonomy enforcement requirements
- [ ] Agent prompt passes country and domain context
- [ ] Workflow includes validation step after agent response
- [ ] Workflow rejects invalid agent suggestions
- [ ] Workflow logs validation failures
- [ ] Workflow detects and prevents agent bypass
- [ ] Workflow logs execution details for audit
- [ ] Workflow handles agent invocation failures gracefully

### Testing Workflow Enforcement

Test cases to verify workflow agent enforcement:

1. **Test agent requirement detection**: Upload workflow without Sensitivity Scanner → Enforcement error
2. **Test agent bypass prevention**: TagWorkflow attempts direct tagging → Enforcement blocks operation
3. **Test validation checkpoint**: Agent returns invalid tag → Workflow validation rejects it
4. **Test audit logging**: DeleteConfirmation workflow → Execution logged with agents invoked
5. **Test graceful failure**: Agent invocation fails → Workflow provides helpful error message
6. **Test multi-agent workflow**: TrustValidation invokes both Compliance Guardian and Records Keeper → Both validated
7. **Test optional agent**: SearchWorkflow without Records Keeper → Succeeds (agent optional)
8. **Test mandatory agent**: OrganizeWorkflow without Records Keeper → Fails with enforcement error

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide default taxonomies for all entity types (household, corporate, unit-trust, discretionary-trust, family-trust, project, person) in the taxonomy data structure
- **FR-002**: System MUST provide default taxonomies for all supported countries (Australia, United States, United Kingdom) with regulatory-aligned retention rules
- **FR-003**: Each entity type taxonomy MUST include: document types array, tag categories mapping (category: tags[]), retention rules mapping (documentType: {years, reason})
- **FR-004**: System MUST copy all entity type taxonomies to paperless-ngx during skill installation for the selected country
- **FR-005**: System MUST automatically discover all entity types defined in the taxonomy data structure without hard-coding entity type names
- **FR-006**: System MUST create all tag categories and tags defined in each entity type's taxonomy as paperless-ngx tags with appropriate colors
- **FR-007**: System MUST configure retention rules for each document type with years period and legal/regulatory reason citation
- **FR-008**: System MUST handle entity type extensibility so that new entity types added to the data structure are automatically included in installation
- **FR-009**: System MUST detect and avoid duplicate taxonomy installation when run multiple times
- **FR-010**: System MUST skip existing tags with the same names and install only new tags, preserving user customizations while completing installation successfully
- **FR-011**: System MUST provide clear feedback about which entity types and taxonomies were installed during installation, including counts of skipped existing tags
- **FR-012**: System MUST perform complete rollback of all taxonomy changes if any API operation fails during installation to prevent partial/inconsistent state
- **FR-013**: System MUST support partial country coverage (e.g., US with only household domain) by installing only defined entity types
- **FR-014**: System MUST create storage path mappings for each entity type according to the defined path structure
- **FR-015**: System MUST create custom field definitions for trust and person entity types during taxonomy installation
- **FR-016**: System MUST validate taxonomy data structure completeness before installation (document types, tags, retention rules all present)
- **FR-017**: When retention periods change between taxonomy versions, system MUST warn user and require manual review before applying retention rule updates to prevent unexpected compliance policy changes
- **FR-018**: When a user changes their country setting after initial installation, system MUST reinstall taxonomies for the new country while preserving all existing documents and applying the new country's retention rules
- **FR-019**: System MUST document the taxonomy data structure format in user-facing documentation for contributors adding new countries
- **FR-020**: Expert agents MUST retrieve taxonomy data from the single source of truth (TaxonomyExpert) rather than using hardcoded values
- **FR-021**: Records Keeper agent MUST suggest tags from the correct entity type taxonomy when processing document uploads
- **FR-022**: Retention Monitor agent MUST use country-specific retention rules when calculating document retention periods
- **FR-023**: Compliance Guardian agent MUST use entity-type-specific document type checklists when validating completeness
- **FR-024**: Deletion Auditor agent MUST reference the correct country's retention rules when assessing deletion safety
- **FR-025**: Sensitivity Scanner agent MUST apply entity-specific sensitivity rules using appropriate taxonomy tags
- **FR-026**: Archive Architect agent MUST use storage path mappings defined for the selected entity type
- **FR-027**: All expert agent workflows MUST detect when taxonomies are not installed and prompt the user to run installation
- **FR-028**: Expert agents MUST gracefully handle requests for non-existent entity types with helpful error messages listing available types
- **FR-029**: When multiple entity types exist in a user's system, agents MUST allow entity type selection and use the corresponding taxonomy
- **FR-030**: Agent workflows MUST validate that required taxonomy elements exist (document types, tags, retention rules) before proceeding with operations
- **FR-031**: Expert agents MUST NOT use hardcoded document types, tags, or retention rules - all taxonomy data MUST be retrieved from TaxonomyExpert class methods
- **FR-032**: Expert agents MUST validate all suggested tags against the entity type's tagCategories in TaxonomyExpert before applying them
- **FR-033**: Expert agents MUST validate all suggested document types against the entity type's documentTypes array in TaxonomyExpert before assigning them
- **FR-034**: Expert agents MUST validate retention periods by calling TaxonomyExpert.getRetentionRequirements() rather than calculating or hardcoding values
- **FR-035**: Workflows MUST detect when expert agents suggest tags or document types not defined in TaxonomyExpert and reject them with validation errors
- **FR-036**: All expert agent prompt templates MUST include explicit instructions to retrieve taxonomy data from TaxonomyExpert before making suggestions
- **FR-037**: Expert agents MUST include country and entity type context when retrieving taxonomy data to ensure correct regional compliance
- **FR-038**: Workflows MUST log all taxonomy validation failures (invalid tags, document types, retention rules) for audit purposes
- **FR-039**: Expert agents MUST provide fallback suggestions using the closest matching taxonomy elements when user input doesn't match exactly
- **FR-040**: System MUST support hierarchical taxonomy data structure organized as Function → Service → Activity → Document Types while maintaining backwards compatibility with flat document type lists
- **FR-041**: TaxonomyExpert MUST provide API methods for hierarchical navigation: `getFunctions(domain)`, `getServices(function, domain)`, `getActivities(service, function, domain)`, `getDocumentTypes(activity, service, function, domain)`
- **FR-042**: System MUST organize storage paths hierarchically as `{Entity}/{Function}/{Service}/{Activity}/` when hierarchical taxonomy is available
- **FR-043**: System MUST generate hierarchical tags including function tags (function:X), service tags (service:Y), and activity tags (activity:Z) for multi-dimensional document classification
- **FR-044**: System MUST apply activity-level retention rules by default to all document types within that activity, with document-specific retention rules overriding the activity default
- **FR-045**: Each function definition MUST include a description and contain 2-15 services covering the full operational scope of that function
- **FR-046**: Each service definition MUST include a description and contain 2-10 activities representing discrete tasks within that service
- **FR-047**: Each activity definition MUST include a description, 2-10 document types, retention default (years + reason), and 2-8 tags for classification
- **FR-048**: Household entity taxonomy MUST include comprehensive operational functions beyond compliance: Health Management, Financial Management, Property Management, Vehicle Management, Pet Care, Education, Insurance, Legal Affairs, Tax & Compliance, Estate Planning, Travel, Entertainment (minimum 12 functions)
- **FR-049**: Corporate entity taxonomy MUST include comprehensive operational functions beyond compliance: Finance & Accounting, Human Resources, Operations, Sales & Marketing, Product Development, Customer Service, IT & Technology, Legal & Compliance, Facilities, Procurement, Quality Assurance, Strategic Planning (minimum 12 functions)
- **FR-050**: Trust entity taxonomies MUST include trust-specific functions: Trust Governance, Beneficiary Management, Distribution Management, Investment Management, Tax & Compliance, Legal Affairs (minimum 6 functions)
- **FR-051**: When uploading documents, Records Keeper agent MUST suggest the appropriate Function → Service → Activity → Document Type path based on document content and context
- **FR-052**: When searching documents, system MUST support hierarchical queries allowing users to retrieve all documents within a function (all services/activities) or within a service (all activities)
- **FR-053**: System MUST validate that hierarchical taxonomy provides appropriate classification paths for 95%+ of real-world documents without requiring custom document types
- **FR-054**: Migration from flat taxonomy to hierarchical taxonomy MUST preserve existing document classifications using a hybrid mapping strategy: automatic mapping for standard document types with explicit mapping table, manual review workflow for ambiguous cases without clear hierarchical equivalents
- **FR-055**: System MUST support extensibility for adding new activities to existing services without requiring reconfiguration of existing documents
- **FR-056**: Hierarchical taxonomy structure MUST be documented with examples for all entity types to guide users and contributors in understanding the organizational model
- **FR-057**: System MUST maintain complete parity between flat and hierarchical taxonomy models during the 12-month transition period, ensuring identical features, workflows, and performance for all operations (upload, search, retention, agent workflows, validation) regardless of which model is used
- **FR-058**: After the 12-month transition period, flat model MUST be deprecated with appropriate warnings and migration guidance provided to remaining users
- **FR-059**: CLI workflows MUST support interactive drill-down prompts for hierarchical taxonomy navigation, presenting users with Function menu, then Service menu, then Activity menu in sequence
- **FR-060**: CLI workflows MUST support path-based input for hierarchical taxonomy navigation, allowing users to specify full path (e.g., "HealthManagement/MedicalCare/DoctorVisits") for faster workflows
- **FR-061**: Path-based input MUST support partial paths with autocomplete suggestions (e.g., "Health/Med/Doc" expands to "HealthManagement/MedicalCare/DoctorVisits")
- **FR-062**: Interactive prompts MUST display hierarchy context showing current position (e.g., "HealthManagement → MedicalCare → [Select Activity]")
- **FR-063**: Both navigation methods (interactive and path-based) MUST produce identical classification results for the same hierarchy selection
- **FR-064**: System MUST provide an explicit mapping table documenting how each flat document type maps to hierarchical Function → Service → Activity → Document Type path (e.g., "Tax Return" → "FinancialManagement/TaxCompliance/TaxReturns/Tax Return")
- **FR-065**: Automatic migration MUST apply mapping table transformations to all documents with standard flat document types, updating metadata to include hierarchical path while preserving original classification
- **FR-066**: When encountering ambiguous flat document types with multiple possible hierarchical mappings, system MUST flag for manual review and present mapping options to user for selection
- **FR-067**: Manual review workflow MUST display original flat classification, proposed hierarchical mappings with rationale, and allow user to select correct mapping or create custom mapping
- **FR-068**: All migration mappings (both automatic and manual) MUST be logged with timestamp, original classification, new hierarchical path, and mapping method (auto/manual) for audit trail

### Key Entities

- **Default Taxonomy**: A complete taxonomy definition for a specific country and entity type, including document types, tag categories, and retention rules aligned with that country's regulations
- **Entity Type**: A record keeping context such as household, corporate, unit-trust, discretionary-trust, family-trust, project, or person
- **Taxonomy Data Structure**: The canonical source of taxonomy definitions organized by country and entity type, stored in the codebase as the single source of truth
- **Country Guidelines**: The collection of all taxonomies for a specific country, containing domains (entity types) and their respective taxonomies
- **Domain Taxonomy**: The taxonomy for a single entity type, including document types, tag categories, and retention rules
- **Retention Rule**: A mapping from document type to retention period and legal reason, ensuring compliance with regulatory requirements
- **Expert Agent**: A specialized agent that performs specific record keeping tasks (Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, Retention Monitor) using taxonomy data for accurate, compliant operations
- **Function**: A top-level operational capability of an entity representing a major area of responsibility (e.g., Health Management, Financial Management for households; Operations, Sales & Marketing for corporates). Functions are stable and rarely change.
- **Service**: A specific offering or capability within a function (e.g., Medical Care and Dental Care under Health Management; BankingServices and TaxCompliance under Financial Management). Services represent distinct sub-capabilities within a function.
- **Activity**: A discrete task or process within a service that generates documents (e.g., Doctor Visits and Prescriptions under Medical Care; Invoice Processing and Payment Reconciliation under Accounts Payable). Activities are the level where retention rules are defined by default.
- **Hierarchical Taxonomy**: A comprehensive operational taxonomy organized as Function → Service → Activity → Document Types, covering all operations performed by an entity (not just compliance), enabling intuitive navigation and multi-dimensional classification
- **Activity-Level Retention**: Default retention rules defined at the activity level that apply to all document types within that activity unless explicitly overridden, reducing configuration complexity
- **Hierarchical Tags**: Multi-dimensional tags generated from taxonomy structure including function tags (function:X), service tags (service:Y), and activity tags (activity:Z), enabling powerful filtering and search capabilities
- **Hierarchical Storage Path**: Document organization pattern following `{Entity}/{Function}/{Service}/{Activity}/` structure, mirroring the taxonomy hierarchy for intuitive file system-like navigation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can install the Records Manager skill and have all relevant taxonomies available in paperless-ngx without manual configuration (installation time depends on paperless-ngx API performance and network conditions)
- **SC-002**: 100% of entity types defined in the taxonomy data structure are automatically installed during skill installation
- **SC-003**: All document types defined for an entity type are available as selectable document types in paperless-ngx after installation
- **SC-004**: All tag categories and their tags defined for an entity type exist as tags in paperless-ngx after installation
- **SC-005**: All retention rules defined for document types include both a years period and a legal/regulatory reason citation
- **SC-006**: Adding a new entity type to the taxonomy data structure results in automatic inclusion during installation without code changes to the installation process
- **SC-007**: Taxonomy installation can be run multiple times without creating duplicate tags, document types, or retention rules
- **SC-008**: When existing tags with the same names are found, installation skips them and reports the count of skipped tags, completing successfully with only new tags installed
- **SC-009**: When installation fails at any point, 100% of taxonomy changes are rolled back, leaving paperless-ngx in the same state as before installation attempt
- **SC-010**: Users in Australia, United States, and United Kingdom each receive taxonomies appropriate to their country's regulations
- **SC-011**: Installation process reports the exact number of entity types, document types, tags, and retention rules installed
- **SC-012**: 95% of document types have retention rules that match official government guidance for the respective country
- **SC-013**: 100% of expert agent operations use taxonomy data from the single source of truth (TaxonomyExpert)
- **SC-014**: When Records Keeper agent processes a document upload, 95% of suggested tags match the entity type's defined tag categories
- **SC-015**: Retention Monitor agent provides country-specific retention periods with legal citation in 100% of queries
- **SC-016**: Compliance Guardian agent uses the correct document type checklist for the specified entity type in 100% of validations
- **SC-017**: Deletion Auditor agent references the correct country's retention rules when assessing deletion safety in 100% of cases
- **SC-018**: When taxonomies are not installed, 100% of expert agent workflows prompt the user to run installation before proceeding
- **SC-019**: 100% of expert agent operations complete successfully when using the correct taxonomy for country and entity type
- **SC-020**: 0% of expert agent operations use hardcoded document types, tags, or retention rules - all must retrieve from TaxonomyExpert
- **SC-021**: 100% of invalid tag suggestions (not in entity type's tagCategories) are caught and rejected by validation
- **SC-022**: 100% of invalid document type suggestions (not in entity type's documentTypes) are caught and rejected by validation
- **SC-023**: 100% of retention period calculations use TaxonomyExpert.getRetentionRequirements() with country-specific rules
- **SC-024**: All expert agent workflows include TaxonomyExpert validation calls before applying any tags or document types
- **SC-025**: Taxonomy validation failures are logged with entity type, country, attempted value, and validation error for 100% of failures
- **SC-026**: When user-provided tags don't match taxonomy exactly, agents provide closest match suggestions in 95% of cases
- **SC-027**: Hierarchical taxonomy structure (Function → Service → Activity → Document Types) is available for 100% of entity types (household, corporate, all trust types, projects, persons)
- **SC-028**: Each entity type has minimum required number of functions: household (12+), corporate (12+), trusts (6+), projects (8+), persons (5+)
- **SC-029**: Each function contains 2-15 services with clear descriptions covering the full operational scope of that function
- **SC-030**: Each service contains 2-10 activities with clear descriptions representing discrete tasks within that service
- **SC-031**: Each activity contains 2-10 document types relevant to that specific task, with activity-level retention default
- **SC-032**: 95%+ of real-world documents from sample collections (household, corporate, trust) can be classified using existing Function → Service → Activity → Document Type paths without requiring custom types
- **SC-033**: Storage paths follow hierarchical organization `{Entity}/{Function}/{Service}/{Activity}/` for 100% of documents uploaded with hierarchical taxonomy
- **SC-034**: Documents are tagged with hierarchical tags (function:X, service:Y, activity:Z) enabling multi-dimensional search and filtering
- **SC-035**: Activity-level retention rules are applied by default to all document types within that activity, with document-specific overrides working correctly in 100% of cases
- **SC-036**: TaxonomyExpert API methods (`getFunctions()`, `getServices()`, `getActivities()`, `getDocumentTypes()`) return hierarchically organized data for all entity types
- **SC-037**: Records Keeper agent suggests correct Function → Service → Activity → Document Type path for 90%+ of uploaded documents based on content analysis
- **SC-038**: Hierarchical search queries (e.g., "all Health Management documents" or "all Invoice Processing documents") return complete result sets including all nested services/activities
- **SC-039**: Migration from flat taxonomy to hierarchical taxonomy completes without data loss, preserving all existing document classifications
- **SC-040**: Adding new activities to existing services is possible without breaking existing document classifications or requiring system reconfiguration
- **SC-041**: Hierarchical taxonomy documentation includes complete examples for all entity types with at least 2 functions, 4 services, and 8 activities demonstrated per entity type
- **SC-042**: Interactive drill-down prompts successfully navigate hierarchical taxonomy with correct menu presentation at each level (Function → Service → Activity) in 100% of workflows
- **SC-043**: Path-based input correctly parses and resolves full paths (e.g., "HealthManagement/MedicalCare/DoctorVisits") in 100% of valid path entries
- **SC-044**: Partial path autocomplete provides correct suggestions with at least 90% accuracy for abbreviated inputs
- **SC-045**: Both navigation methods (interactive and path-based) produce identical classification outcomes when selecting the same hierarchy elements
- **SC-046**: Interactive prompts display hierarchy context (breadcrumb trail) showing current position in 100% of navigation sessions
- **SC-047**: During 12-month transition period, all workflows (upload, search, retention, organize, tag, delete) produce identical outcomes when using flat model vs hierarchical model for the same document classification
- **SC-048**: During 12-month transition period, performance metrics (latency, throughput) are equivalent between flat and hierarchical models with <10% variance for comparable operations
- **SC-049**: During 12-month transition period, all expert agents (Records Keeper, Compliance Guardian, etc.) function identically regardless of whether user selected flat or hierarchical taxonomy model
- **SC-050**: Users can switch between flat and hierarchical models mid-session without data loss or workflow disruption during the 12-month transition period
- **SC-051**: Mapping table provides explicit hierarchical paths for 90%+ of standard flat document types, enabling automatic migration without manual review
- **SC-052**: Automatic migration successfully transforms 90%+ of existing documents from flat to hierarchical classifications using mapping table
- **SC-053**: Ambiguous document types requiring manual review represent <10% of total documents during migration
- **SC-054**: Manual review workflow correctly presents mapping options with rationale for 100% of ambiguous cases
- **SC-055**: Migration audit log captures complete transformation history (timestamp, original, new path, method) for 100% of migrated documents
- **SC-056**: After migration completion, 100% of documents have valid hierarchical classifications that maintain original retention rules and compliance requirements

## Assumptions

1. The taxonomy data structure in `TaxonomyExpert.ts` (COUNTRY_TAXONOMIES constant) is the single source of truth for default taxonomies
2. Entity types will not be removed from the data structure once released (only added)
3. Users select their country during initial skill installation via environment variable or interactive prompt
4. Paperless-ngx API is accessible and functional during taxonomy installation
5. Taxonomy installation performance is best-effort without specific latency targets, retry limits, or timeout constraints; performance depends entirely on paperless-ngx API responsiveness and network conditions (installation involves creating ~200+ tags, document types, and retention rules via sequential API calls)
6. Tag colors follow the existing entity type color mapping defined in `EntityCreator.ts`
7. Storage path mappings follow the existing path structure defined in the documentation
8. Users may customize taxonomies after installation; the system preserves customizations on reinstall
9. Regulatory retention periods are based on current government guidance at time of release
10. When retention periods change between taxonomy versions, users must manually review and approve updates to prevent unexpected compliance policy changes
11. Unsupported countries fall back to Australian taxonomies with a warning message
12. Custom field definitions for trust/person entities include the entity name in parentheses to avoid conflicts
13. Expert agents are defined in the skill's AGENTS.md and are invoked via the skill's workflow routing
14. Expert agents have access to the TaxonomyExpert class for retrieving taxonomy data
15. Users may have multiple entity types configured; agents will prompt for entity type selection when context is ambiguous
16. All expert agent workflows include validation steps that reject suggestions not matching TaxonomyExpert data
17. Agents that bypass TaxonomyExpert validation will be caught by workflow enforcement checks
18. Tag and document type suggestions are case-insensitive but must match canonical forms defined in TaxonomyExpert
19. Hierarchical taxonomy (Function → Service → Activity → Document Types) represents the comprehensive operational model for entities, covering both compliance and operational document classification needs
20. Functions are stable top-level capabilities that rarely change (e.g., Health Management, Financial Management for households); services and activities beneath them may evolve
21. Activity-level retention rules provide sensible defaults for all document types within that activity, reducing configuration burden
22. Document types within an activity are semantically related and typically share the same retention requirements unless explicitly overridden
23. Storage path hierarchy mirrors the taxonomy hierarchy, enabling intuitive file system-like navigation of documents
24. Multi-dimensional tagging (function, service, activity) enables powerful search and filtering capabilities not possible with flat taxonomies
25. Backwards compatibility with flat document type lists is maintained during a 12-month transition period, with both models coexisting with complete parity (identical features, workflows, and performance for all operations); flat model is deprecated after month 12
26. Comprehensive operational taxonomies reduce the need for custom document types by 80%+ compared to compliance-only taxonomies
27. The hierarchical model scales to accommodate new activities and services without restructuring the entire taxonomy
28. CLI workflows support hybrid navigation (interactive prompts + path-based input) to accommodate both novice users (who prefer guided menus) and power users (who prefer typed paths)
29. Path-based input uses forward slash (/) as hierarchy delimiter matching common file path conventions
30. Interactive prompts use numbered menus or arrow key selection for drill-down navigation
31. Autocomplete for partial paths uses fuzzy matching on hierarchy element names to assist with abbreviated input
32. Taxonomy installation provides progress feedback (e.g., "Installing entity type 3 of 7...") to inform users of ongoing activity during best-effort installation
33. API operation failures during installation trigger immediate rollback rather than retry loops, preventing indefinite hangs
34. Complete parity between flat and hierarchical models means users experience identical UX, performance, and outcomes regardless of model choice; internal implementation differences are acceptable as long as external behavior is identical
35. During transition period, both models receive equal maintenance, bug fixes, and feature updates to maintain parity
36. Mapping table is manually curated during Phase 2 (taxonomy population) to ensure accurate flat-to-hierarchical transformations for all standard document types
37. Ambiguous document types are those with valid interpretations in multiple hierarchical paths (e.g., "Receipt" could map to multiple activities depending on context)
38. Manual review workflow is designed for batch processing to efficiently handle the <10% of ambiguous cases
39. Migration preserves all original metadata (tags, retention, dates) while adding new hierarchical path information
40. Mapping table is versioned and documented as part of taxonomy data structure for transparency and maintainability

## Dependencies

1. Paperless-ngx instance must be running and accessible via API
2. Existing `TaxonomyExpert.ts` class with `COUNTRY_TAXONOMIES` data structure
3. Existing `EntityCreator.ts` for tag and storage path creation
4. Environment variables for country selection (`MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY`)
5. User's PAI installation directory for storing entity registry

## Out of Scope

1. User interface for browsing or editing taxonomies (this is a CLI/installation feature)
2. Automated updates to taxonomies when regulations change (requires manual version updates)
3. Taxonomy export or backup functionality
4. Multi-country support in a single installation (one country per installation)
5. Custom taxonomy creation by users (they can manually create tags in paperless-ngx)
6. Migration from previous taxonomy versions (handled by standard reinstall)
7. Taxonomy validation against changing government regulations
8. Creation of new expert agents (this spec covers integration with existing agents defined in AGENTS.md)
9. Real-time synchronization of taxonomy changes to running agent workflows
