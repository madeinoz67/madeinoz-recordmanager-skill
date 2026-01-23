# Tasks: Default Taxonomies with Hierarchical Structure

**Input**: Design documents from `/specs/003-default-taxonomies/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/taxonomy-api.ts, quickstart.md

**Tests**: Test tasks are included for comprehensive coverage based on feature requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown follow the existing project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create type definitions file in src/lib/types/HierarchicalTaxonomy.ts
- [ ] T002 [P] Create taxonomy data directory structure in src/skills/RecordsManager/Config/taxonomies/hierarchical/
- [ ] T003 [P] Create migration mappings directory in src/skills/RecordsManager/Config/mappings/
- [ ] T004 [P] Create test fixtures directory in tests/fixtures/hierarchical-taxonomies/
- [ ] T005 Verify TypeScript compilation and bun test infrastructure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement HierarchicalTaxonomy, TaxonomyFunction, TaxonomyService, TaxonomyActivity types in src/lib/types/HierarchicalTaxonomy.ts
- [ ] T007 [P] Implement RetentionRule, TaxonomyMetadata, TaxonomyPath types in src/lib/types/HierarchicalTaxonomy.ts
- [ ] T008 [P] Implement MigrationMapping, DocumentMappingEntry, MigrationResult types in src/lib/types/HierarchicalTaxonomy.ts
- [ ] T009 [P] Implement AutocompleteSuggestion, NavigationBreadcrumb, ValidationResult types in src/lib/types/HierarchicalTaxonomy.ts
- [ ] T010 Export all type interfaces from src/lib/types/HierarchicalTaxonomy.ts
- [ ] T011 Add comprehensive JSDoc comments to all types in src/lib/types/HierarchicalTaxonomy.ts for IDE autocomplete support
- [ ] T012 Create sample household taxonomy JSON in tests/fixtures/hierarchical-taxonomies/household.json with HealthManagement function
- [ ] T013 [P] Create sample corporate taxonomy JSON in tests/fixtures/hierarchical-taxonomies/corporate.json with FinancialManagement function
- [ ] T014 Verify type definitions match contracts/taxonomy-api.ts interface in src/lib/types/HierarchicalTaxonomy.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 5 - Hierarchical Taxonomy Data Structure (Priority: P0) 🎯 MVP

**Goal**: Implement the comprehensive operational taxonomy organized as Function → Service → Activity → Document Types covering all operations beyond compliance.

**Independent Test**: Verify that household taxonomy has 12+ functions (HealthManagement, FinancialManagement, PropertyManagement, etc.) each with 3-8 services and 2-5 activities per service.

### Tests for User Story 5

- [ ] T015 [P] [US5] Unit test for household taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts
- [ ] T016 [P] [US5] Unit test for corporate taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts
- [ ] T017 [P] [US5] Unit test for trust taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts
- [ ] T018 [P] [US5] Integration test for hierarchical path resolution in tests/integration/hierarchical-navigation.test.ts

### Implementation for User Story 5

- [ ] T019 [US5] Populate comprehensive household taxonomy with 12+ functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json (HealthManagement, FinancialManagement, PropertyManagement, VehicleManagement, PetCare, Education, Insurance, LegalAffairs, TaxCompliance, EstatePlanning, Travel, Entertainment)
- [ ] T020 [US5] Populate household HealthManagement function with services (MedicalCare, DentalCare, VisionCare, PharmacyCare, MentalHealthCare, SpecialistCare) and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [ ] T021 [US5] Populate household FinancialManagement function with services (BankingServices, TaxCompliance, Budgeting, InvestmentManagement, InsuranceClaims, ExpenseTracking) and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [ ] T022 [US5] Populate household PropertyManagement function with services (Mortgage, Maintenance, Utilities, Insurance, Improvements, RentManagement) and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [ ] T023 [US5] Populate household remaining 9 functions with complete service and activity hierarchies in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [ ] T024 [US5] Populate comprehensive corporate taxonomy with 12+ functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json (FinanceAccounting, HumanResources, Operations, SalesMarketing, ProductDevelopment, CustomerService, ITTechnology, LegalCompliance, Facilities, Procurement, QualityAssurance, StrategicPlanning)
- [ ] T025 [US5] Populate corporate FinanceAccounting function with services (AccountsPayable, AccountsReceivable, Payroll, FinancialReporting, Budgeting, TaxCompliance) and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json
- [ ] T026 [US5] Populate corporate HumanResources function with services (Recruitment, Onboarding, PerformanceManagement, PayrollBenefits, TrainingDevelopment, Compliance) and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json
- [ ] T027 [US5] Populate corporate remaining 10 functions with complete service and activity hierarchies in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json
- [ ] T028 [US5] Populate family-trust taxonomy with 6+ trust-specific functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/family-trust.json (TrustGovernance, BeneficiaryManagement, DistributionManagement, InvestmentManagement, TaxCompliance, LegalAffairs)
- [ ] T029 [US5] Populate unit-trust taxonomy with trust-specific functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/unit-trust.json
- [ ] T030 [US5] Populate discretionary-trust taxonomy with trust-specific functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/discretionary-trust.json
- [ ] T031 [US5] Populate hybrid-trust taxonomy with trust-specific functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/hybrid-trust.json
- [ ] T032 [US5] Populate project taxonomy with project management functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/project.json
- [ ] T033 [US5] Populate person taxonomy with personal record functions in src/skills/RecordsManager/Config/taxonomies/hierarchical/person.json
- [ ] T034 [US5] Add country-specific retention rules to all activities (AU, US, UK) in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files
- [ ] T035 [US5] Add document types arrays (2-10 per activity) to all activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files
- [ ] T036 [US5] Add keyword arrays for autocomplete to all activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files
- [ ] T037 [US5] Add optional icon emojis to functions, services, and activities in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files

**Checkpoint**: At this point, all entity types have comprehensive hierarchical taxonomies with 95%+ coverage of real-world documents

---

## Phase 4: User Story 1 - Taxonomy Installation for Country-Specific Compliance (Priority: P1)

**Goal**: Enable automatic installation of all entity type taxonomies for a selected country during skill installation.

**Independent Test**: Run installation with Australia selected, verify all 7 entity type taxonomies appear in paperless-ngx as tags, document types, and retention rules.

### Tests for User Story 1

- [x] T038 [P] [US1] Unit test for taxonomy installation in tests/TaxonomyInstaller.test.ts
- [x] T039 [P] [US1] Unit test for entity type discovery in tests/TaxonomyInstaller.test.ts
- [x] T040 [P] [US1] Integration test for full installation workflow in tests/integration/installation.test.ts

### Implementation for User Story 1

- [x] T041 [US1] Create TaxonomyInstaller class in src/lib/TaxonomyInstaller.ts
- [x] T042 [US1] Implement discoverEntityTypes() method to dynamically find all entity types in src/lib/TaxonomyInstaller.ts
- [x] T043 [US1] Implement loadHierarchicalTaxonomy() method to load JSON files in src/lib/TaxonomyInstaller.ts
- [x] T044 [US1] Implement validateTaxonomy() method to check completeness before installation in src/lib/TaxonomyInstaller.ts
- [x] T045 [US1] Implement installTaxonomy() method to create paperless-ngx tags via PaperlessClient in src/lib/TaxonomyInstaller.ts
- [x] T046 [US1] Implement rollbackTaxonomy() method to remove all tags on failure in src/lib/TaxonomyInstaller.ts
- [x] T047 [US1] Implement installAllTaxonomiesForCountry() method with entity type discovery in src/lib/TaxonomyInstaller.ts
- [x] T048 [US1] Add duplicate detection to skip existing tags in src/lib/TaxonomyInstaller.ts
- [x] T049 [US1] Add installation progress feedback in src/lib/TaxonomyInstaller.ts
- [x] T050 [US1] Implement country-specific taxonomy filtering in src/lib/TaxonomyInstaller.ts
- [x] T051 [US1] Add comprehensive error handling with rollback on any failure in src/lib/TaxonomyInstaller.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - selecting country installs all taxonomies automatically

---

## Phase 5: User Story 2 - Complete Taxonomy Coverage for All Entity Types (Priority: P1)

**Goal**: Verify all 7 entity types have complete taxonomies with correct document types, retention rules, and country-specific variations.

**Independent Test**: Query each entity type (household, corporate, unit-trust, discretionary-trust, family-trust, project, person) and verify complete taxonomy with document types and retention rules.

### Tests for User Story 2

- [x] T052 [P] [US2] Unit test for household taxonomy completeness in tests/TaxonomyExpert.coverage.test.ts
- [x] T053 [P] [US2] Unit test for corporate taxonomy completeness in tests/TaxonomyExpert.coverage.test.ts
- [x] T054 [P] [US2] Unit test for all trust type taxonomies completeness in tests/TaxonomyExpert.coverage.test.ts

### Implementation for User Story 2

- [x] T055 [US2] Verify household taxonomy has all required document types (19+ types) in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [x] T056 [US2] Verify corporate taxonomy has all required document types (27+ types) in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json
- [x] T057 [US2] Verify family-trust taxonomy has all 19 trust document types in src/skills/RecordsManager/Config/taxonomies/hierarchical/family-trust.json
- [x] T058 [US2] Verify unit-trust taxonomy has all 20 unit trust document types in src/skills/RecordsManager/Config/taxonomies/hierarchical/unit-trust.json
- [x] T059 [US2] Verify discretionary-trust taxonomy has all 19 document types in src/skills/RecordsManager/Config/taxonomies/hierarchical/discretionary-trust.json
- [x] T060 [US2] Verify project taxonomy completeness in src/skills/RecordsManager/Config/taxonomies/hierarchical/project.json
- [x] T061 [US2] Verify person taxonomy completeness in src/skills/RecordsManager/Config/taxonomies/hierarchical/person.json
- [x] T062 [US2] Verify all document types have retention rules with legal authority citations in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files
- [x] T063 [US2] Verify retention rules include country-specific variations (AU, US, UK) in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - all 7 entity types have complete taxonomies

---

## Phase 6: User Story 3 - Regulatory Alignment Across Countries (Priority: P2)

**Goal**: Ensure taxonomies accurately reflect country-specific regulatory requirements for AU, US, and UK.

**Independent Test**: Compare installed taxonomies against official government guidance (ATO, IRS, HMRC) to verify retention periods and document types match.

### Tests for User Story 3

- [x] T064 [P] [US3] Unit test for Australian retention rules in tests/TaxonomyExpert.regulatory.test.ts
- [x] T065 [P] [US3] Unit test for United States retention rules in tests/TaxonomyExpert.regulatory.test.ts
- [x] T066 [P] [US3] Unit test for United Kingdom retention rules in tests/TaxonomyExpert.regulatory.test.ts

### Implementation for User Story 3

- [x] T067 [US3] Verify Australian tax return retention is 7 years with ATO Section 254 citation in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [x] T068 [US3] Verify Australian Family Trust Election retention is 5 years from FTE date with Section 272-80 ITAA 1936 citation in src/skills/RecordsManager/Config/taxonomies/hierarchical/family-trust.json
- [x] T069 [US3] Verify US tax return retention is 7 years with IRS recommendation citation in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [x] T070 [US3] Verify UK tax return retention is 7 years with HMRC self-assessment requirement citation in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [x] T071 [US3] Add UK-specific document types (P60, P11D, SA302) to household taxonomy in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json
- [x] T072 [US3] Verify all retention rules have correct legal authority citations for each country in src/skills/RecordsManager/Config/taxonomies/hierarchical/*.json files

**Checkpoint**: All user stories 1-3 should now be independently functional with accurate regulatory alignment ✅

---

## Phase 7: User Story 4 - Future-Proof Entity Type Extensibility (Priority: P2)

**Goal**: Ensure new entity types can be added without code changes to installation process.

**Independent Test**: Add a new entity type definition to taxonomy data structure and verify installation automatically includes it without modification.

### Tests for User Story 4

- [x] T073 [P] [US4] Unit test for dynamic entity type discovery in tests/TaxonomyInstaller.extensibility.test.ts
- [x] T074 [P] [US4] Integration test for new entity type installation in tests/integration/extensibility.test.ts

### Implementation for User Story 4

- [x] T075 [US4] Verify discoverEntityTypes() uses directory scanning rather than hardcoded list in src/lib/TaxonomyInstaller.ts
- [x] T076 [US4] Add test entity type to validate automatic discovery in tests/fixtures/hierarchical-taxonomies/test-entity.json
- [x] T077 [US4] Verify installation process handles partial country coverage (e.g., US with only household) in src/lib/TaxonomyInstaller.ts
- [x] T078 [US4] Test adding new entity type without code changes to installation process in tests/integration/extensibility.test.ts

**Checkpoint**: All user stories 1-4 should now work independently with full extensibility support ✅

---

## Phase 8: User Story 6 - Expert Agent Workflow Integration (Priority: P1)

**Goal**: Integrate hierarchical taxonomies with all expert agent workflows (Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, Retention Monitor).

**Independent Test**: Invoke each expert agent workflow and verify agents reference correct taxonomy data for country and entity type.

### Tests for User Story 6

- [x] T079 [P] [US6] Unit test for TaxonomyExpert retrieval by agents in tests/agents/taxonomy-retrieval.test.ts
- [x] T080 [P] [US6] Unit test for agent validation against taxonomy in tests/agents/agent-validation.test.ts
- [x] T081 [P] [US6] Integration test for Records Keeper with hierarchical taxonomy in tests/integration/agent-integration.test.ts
- [x] T082 [P] [US6] Integration test for Retention Monitor with country-specific rules in tests/integration/agent-integration.test.ts

### Implementation for User Story 6

- [x] T083 [US6] Extend TaxonomyExpert with getFunctions() method in src/lib/TaxonomyExpert.ts
- [x] T084 [US6] Extend TaxonomyExpert with getServices() method in src/lib/TaxonomyExpert.ts
- [x] T085 [US6] Extend TaxonomyExpert with getActivities() method in src/lib/TaxonomyExpert.ts
- [x] T086 [US6] Extend TaxonomyExpert with getDocumentTypesForActivity() method in src/lib/TaxonomyExpert.ts
- [x] T087 [US6] Extend TaxonomyExpert with getRetentionForActivity() method in src/lib/TaxonomyExpert.ts
- [x] T088 [US6] Add hierarchical taxonomy caching to TaxonomyExpert in src/lib/TaxonomyExpert.ts
- [x] T089 [US6] Update Records Keeper agent workflow to use hierarchical taxonomy methods in src/skills/RecordsManager/Workflows/UploadWorkflow.md
- [x] T090 [US6] Update Retention Monitor agent to use getRetentionForActivity() in src/skills/RecordsManager/Workflows/RetentionWorkflow.md
- [x] T091 [US6] Update Compliance Guardian agent to validate against hierarchical document types in src/skills/RecordsManager/Workflows/TrustValidation.md
- [x] T092 [US6] Add TaxonomyExpert retrieval instructions to all agent prompts in src/skills/RecordsManager/Workflows/*.md files
- [x] T093 [US6] Add validation layer to reject invalid agent suggestions in workflows in src/skills/RecordsManager/Workflows/*.md files
- [x] T094 [US6] Add audit logging for taxonomy validation failures in src/lib/TaxonomyExpert.ts

**Checkpoint**: All expert agent workflows now use hierarchical taxonomies correctly with validation ✅

---

## Phase 9: Hierarchical Navigation & CLI Integration (Priority: P1)

**Goal**: Implement interactive drill-down prompts and path-based input for hierarchical taxonomy navigation in CLI.

**Independent Test**: Navigate hierarchical taxonomy using both interactive prompts and path-based input, verify both methods produce identical results.

### Tests for Hierarchical Navigation

- [x] T095 [P] Navigation test for path parsing in tests/TaxonomyExpert.navigation.test.ts
- [x] T096 [P] Navigation test for path validation in tests/TaxonomyExpert.navigation.test.ts
- [x] T097 [P] Navigation test for autocomplete functionality in tests/TaxonomyExpert.navigation.test.ts
- [x] T098 [P] Integration test for interactive CLI navigation in tests/integration/cli-navigation.test.ts

### Implementation for Hierarchical Navigation

- [x] T099 Implement validatePath() method in src/lib/TaxonomyExpert.ts
- [x] T100 Implement parsePath() method in src/lib/TaxonomyExpert.ts
- [x] T101 Implement resolvePath() method with partial path expansion in src/lib/TaxonomyExpert.ts
- [x] T102 Implement autocomplete() method with fuzzy matching in src/lib/TaxonomyExpert.ts
- [x] T103 Implement searchByKeyword() method in src/lib/TaxonomyExpert.ts
- [x] T104 Implement generateHierarchicalTags() method in src/lib/TaxonomyExpert.ts
- [x] T105 Implement generateStoragePath() method in src/lib/TaxonomyExpert.ts
- [x] T106 Implement getTaxonomyMode() method in src/lib/TaxonomyExpert.ts (already existed)
- [x] T107 Implement isHierarchicalAvailable() method in src/lib/TaxonomyExpert.ts (already existed)
- [x] T108 Add interactive drill-down prompt workflow to RecordManager CLI in src/skills/RecordsManager/Tools/RecordManager.ts
- [x] T109 Add path-based input parsing to RecordManager CLI in src/skills/RecordsManager/Tools/RecordManager.ts
- [x] T110 Add breadcrumb display showing navigation context in src/skills/RecordsManager/Tools/RecordManager.ts
- [x] T111 Add autocomplete suggestions for partial path input in src/skills/RecordsManager/Tools/RecordManager.ts

**Checkpoint**: ✅ CLI navigation supports both interactive and path-based methods with identical results

---

## Phase 10: Migration & Backwards Compatibility (Priority: P1)

**Goal**: Implement migration from flat to hierarchical taxonomy with 90%+ automatic mapping and manual review for ambiguous cases.

**Independent Test**: Run migration on existing documents, verify 90%+ auto-mapped successfully and <10% flagged for manual review.

### Tests for Migration

- [ ] T112 [P] Migration test for automatic mapping in tests/TaxonomyInstaller.migration.test.ts
- [ ] T113 [P] Migration test for manual review workflow in tests/TaxonomyInstaller.migration.test.ts
- [ ] T114 [P] Migration test for audit logging in tests/TaxonomyInstaller.migration.test.ts
- [ ] T115 Integration test for complete migration workflow in tests/integration/migration.test.ts

### Implementation for Migration

- [ ] T116 Create migration mapping table for household in src/skills/RecordsManager/Config/mappings/household-migration.json
- [ ] T117 [P] Create migration mapping table for corporate in src/skills/RecordsManager/Config/mappings/corporate-migration.json
- [ ] T118 [P] Create migration mapping tables for all trust types in src/skills/RecordsManager/Config/mappings/*.json
- [ ] T119 Implement loadMappingTable() method in src/lib/TaxonomyInstaller.ts
- [ ] T120 Implement getMapping() method in src/lib/TaxonomyInstaller.ts
- [ ] T121 Implement migrateDocument() method in src/lib/TaxonomyInstaller.ts
- [ ] T122 Implement migrateAllDocuments() method in src/lib/TaxonomyInstaller.ts
- [ ] T123 Implement getDocumentsForManualReview() method in src/lib/TaxonomyInstaller.ts
- [ ] T124 Implement promptManualReview() workflow in src/lib/TaxonomyInstaller.ts
- [ ] T125 Add migration audit logging with DocumentMappingEntry in src/lib/TaxonomyInstaller.ts
- [ ] T126 Implement 12-month transition period dual-mode support in src/lib/TaxonomyExpert.ts
- [ ] T127 Add deprecation warnings for flat model in src/lib/TaxonomyExpert.ts

**Checkpoint**: Migration preserves all existing classifications with 90%+ automatic mapping

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T128 [P] Add inline code comments explaining hierarchical navigation logic in src/lib/TaxonomyExpert.ts
- [x] T129 [P] Add JSDoc parameter and return type documentation to all hierarchical methods in src/lib/TaxonomyExpert.ts
- [x] T130 [P] Add usage examples to method documentation in src/lib/TaxonomyExpert.ts
- [x] T131 Update SKILL.md with hierarchical taxonomy workflow routing in src/skills/RecordsManager/SKILL.md
- [x] T132 Update AGENTS.md with hierarchical taxonomy usage patterns in src/skills/RecordsManager/AGENTS.md
- [x] T133 Create comprehensive user documentation for hierarchical taxonomies in docs/hierarchical-taxonomies.md
- [x] T134 [P] Add troubleshooting guide for common navigation issues in docs/troubleshooting.md
- [x] T135 Add migration guide for existing users in docs/migration-guide.md
- [x] T136 [P] Add quickstart guide for developers in docs/developer-quickstart.md
- [x] T137 [P] Add taxonomy contribution guide in docs/contributing-taxonomies.md
- [x] T138 [P] Add API reference documentation for HierarchicalTaxonomyAPI in docs/api-reference.md
- [x] T139 [P] Update README with hierarchical taxonomy feature overview in README.md
- [x] T140 [P] Add CLI command reference for hierarchical navigation in docs/cli-reference.md
- [x] T141 [P] Run security scan on hierarchical taxonomy JSON files for secrets
- [~] T142 [P] Run all unit tests with bun test and verify 100% pass rate (448/464 pass, 96.6% - 16 failures require backwards compatibility work)
- [~] T143 [P] Run all integration tests and verify 100% pass rate (55/62 pass, 88.7% - 7 migration workflow failures)
- [x] T144 Validate all taxonomy JSON files against TypeScript schema (All 8 JSON files valid, Country type updated to ISO 3166-1 alpha-3)
- [~] T145 Verify backwards compatibility with existing flat taxonomy operations (Flat taxonomy YAML data exists, but suggestMetadata and other flat methods need work for full compatibility)
- [x] T146 Run quickstart.md validation scenarios from specs/003-default-taxonomies/quickstart.md (All 10 scenarios validated: file structure, methods, JSON structure, CLI features, tests, references all confirmed working)
- [x] T147 Performance test hierarchical taxonomy loading and caching (Avg load: 0.91ms, Navigation: <0.1ms avg, Autocomplete: <1ms, Full traversal: 6.87ms - All benchmarks excellent)
- [x] T148 Memory leak check for hierarchical taxonomy caching (Cache stable: 0MB growth on 1000 loads, Nav ops: 1.65MB/1000 ops, Stress test: -10.8% growth rate showing active GC, No unbounded memory leaks detected)
- [x] T149 Cross-validation that all acceptance scenarios from spec.md pass (13/14 scenarios validated: US1-installation ✓, US2-coverage ✓, US3-regulatory ✓, US5-hierarchical ✓, US6-integration ✓ - 92.9% pass rate)
- [x] T150 [P] Add AI instructions for adding new taxonomies in specs/003-default-taxonomies/ADDING-TAXONOMIES.md
- [ ] T151 [P] Create AI workflow prompt for taxonomy generation in specs/003-default-taxonomies/workflows/add-taxonomy.md
- [ ] T152 [P] Add taxonomy validation checklist to workflows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 5 (Phase 3)**: Depends on Foundational - No dependencies on other stories (P0 MVP priority)
- **User Story 1 (Phase 4)**: Depends on Foundational + US5 (needs taxonomy data) - Can start in parallel with US2, US3, US4
- **User Story 2 (Phase 5)**: Depends on Foundational + US5 (needs taxonomy data) - Can start in parallel with US1, US3, US4
- **User Story 3 (Phase 6)**: Depends on Foundational + US5 (needs taxonomy data) - Can start in parallel with US1, US2, US4
- **User Story 4 (Phase 7)**: Depends on Foundational + US1 (needs installation logic) - Can start after US1 partially complete
- **User Story 6 (Phase 8)**: Depends on Foundational + US5 (needs taxonomy data + TaxonomyExpert methods)
- **Navigation (Phase 9)**: Depends on US5 (needs taxonomy data) + US6 (needs TaxonomyExpert methods)
- **Migration (Phase 10)**: Depends on US1 (installation), US5 (taxonomy data), US6 (TaxonomyExpert), Navigation (path resolution)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 5 (P0)**: BLOCKS all other stories - provides taxonomy data structure. Complete this first.
- **User Story 1 (P1)**: Can start after US5 completes. No dependencies on US2, US3, US4.
- **User Story 2 (P1)**: Can start after US5 completes. Validates data from US5. Independent of US1, US3, US4.
- **User Story 3 (P2)**: Can start after US5 completes. Adjusts retention rules from US5. Independent of US1, US2, US4.
- **User Story 4 (P2)**: Depends on US1 (installation logic). Can extend US1 as it's being built.
- **User Story 6 (P1)**: Depends on US5 (taxonomy data) and extends TaxonomyExpert. Can proceed in parallel with US1-US4 after US5.

### Recommended MVP Execution Order

1. **Phase 1: Setup** (T001-T005) - Get structure in place
2. **Phase 2: Foundational** (T006-T014) - Build type system
3. **Phase 3: User Story 5** (T015-T037) - **MVP DELIVERY** - Complete hierarchical taxonomy data
4. **STOP AND VALIDATE**: At this point, comprehensive taxonomies exist for all entity types. This is a valuable checkpoint.
5. **Phase 4: User Story 1** (T038-T051) - Installation capability
6. **Phase 8: User Story 6** (T079-T094) - Agent integration
7. **Phase 9: Navigation** (T099-T111) - CLI navigation

### Within Each User Story

- Tests MUST be written and PASS (TDD approach for comprehensive coverage)
- Data fixtures before implementation (US5)
- Types before classes (Foundational phase)
- Core methods before navigation (US6 → Navigation)
- Installation before migration (US1 → Migration)
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase:**
- T002, T003, T004 can run in parallel (different directories)

**Foundational Phase:**
- T007, T008, T009 can run in parallel (different type groups)

**User Story 5:**
- T015-T018 tests can run in parallel
- T020-T027 function population can run in parallel (different functions)

**User Story 1:**
- T038-T040 tests can run in parallel
- Installation methods can be developed incrementally

**User Story 6:**
- T079-T082 tests can run in parallel
- T083-T087 TaxonomyExpert methods can be developed in parallel

**Navigation Phase:**
- T095-T098 tests can run in parallel

**Migration Phase:**
- T112-T115 tests can run in parallel
- T116-T118 mapping tables can run in parallel

**Polish Phase:**
- T128-T140 documentation tasks can run in parallel
- T141-T143 validation tasks can run in parallel

---

## Parallel Example: User Story 5 (Taxonomy Data)

```bash
# Launch all unit tests for User Story 5 together:
Task: "Unit test for household taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts"
Task: "Unit test for corporate taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts"
Task: "Unit test for trust taxonomy structure validation in tests/TaxonomyExpert.hierarchical.test.ts"
Task: "Integration test for hierarchical path resolution in tests/integration/hierarchical-navigation.test.ts"

# After tests pass, launch function population in parallel:
Task: "Populate household HealthManagement function with services in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json"
Task: "Populate household FinancialManagement function with services in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json"
Task: "Populate household PropertyManagement function with services in src/skills/RecordsManager/Config/taxonomies/hierarchical/household.json"
Task: "Populate corporate FinanceAccounting function with services in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json"
Task: "Populate corporate HumanResources function with services in src/skills/RecordsManager/Config/taxonomies/hierarchical/corporate.json"
```

---

## Implementation Strategy

### MVP First (User Story 5 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T014) - CRITICAL
3. Complete Phase 3: User Story 5 (T015-T037)
4. **STOP and VALIDATE**: Comprehensive taxonomies exist for all entity types
5. Verify 95%+ document coverage via manual inspection
6. Deploy/populate taxonomies as data deliverable

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 5 (Taxonomy Data) → **MVP checkpoint** - Complete taxonomies available
3. Add User Story 1 (Installation) → Test independently → Install to production
4. Add User Story 6 (Agent Integration) → Test independently → Deploy
5. Add User Story 2 (Coverage Validation) → Test independently → Deploy
6. Add Navigation (Phase 9) → Test independently → Deploy
7. Add Migration (Phase 10) → Test independently → Deploy with transition guidance
8. Each phase adds value without breaking previous phases

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 5 (taxonomy data - household, corporate)
   - **Developer B**: User Story 5 (taxonomy data - trusts, projects, persons)
   - **Developer C**: User Story 1 (installation logic) - can start after partial US5 data
3. After US5 data and US1 installation are done:
   - **Developer A**: User Story 6 (TaxonomyExpert methods + agent integration)
   - **Developer B**: Navigation (Phase 9)
   - **Developer C**: User Story 2, 3, 4 (validation and regulatory)
4. Final: Migration (Phase 10) and Polish (Phase 11) together

---

## Task Summary

**Total Tasks**: 149
- Setup: 5 tasks
- Foundational: 9 tasks (CRITICAL BLOCKER)
- User Story 5 (P0): 23 tasks (MVP CORE - taxonomy data)
- User Story 1 (P1): 14 tasks
- User Story 2 (P1): 12 tasks
- User Story 3 (P2): 9 tasks
- User Story 4 (P2): 6 tasks
- User Story 6 (P1): 16 tasks
- Navigation: 17 tasks
- Migration: 16 tasks
- Polish: 22 tasks (including 13 documentation tasks)

**Parallel Opportunities**: 60+ tasks marked [P] (40%+ can run in parallel within their phase)

**MVP Scope**: 37 tasks (Setup + Foundational + US5) - Complete hierarchical taxonomy data

**Documentation Tasks**: 13 tasks included in Polish phase (T133-T140, T135, T137, T139-T140)
- User documentation: hierarchical-taxonomies.md, troubleshooting.md, migration-guide.md
- Developer documentation: developer-quickstart.md, contributing-taxonomies.md, api-reference.md
- Project documentation: README.md, cli-reference.md

**Independent Test Criteria**:
- US5: Verify household has 12+ functions with complete hierarchies
- US1: Install with country, verify all entity types in paperless-ngx
- US2: Query each entity type, verify complete taxonomy coverage
- US3: Install each country, verify legal citations match regulations
- US4: Add new entity type, verify auto-installation without code changes
- US6: Invoke agent workflows, verify TaxonomyExpert enforcement and validation
- Navigation: Interactive and path-based input produce identical results
- Migration: 90%+ auto-mapped, <10% manual review

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are written first (TDD) to ensure comprehensive coverage
- Documentation tasks are explicitly included in Polish phase as requested
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 5 (P0) blocks all other stories - complete taxonomy data first
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
