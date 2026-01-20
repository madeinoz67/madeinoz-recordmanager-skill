# Tasks: MkDocs Material Documentation Site

**Input**: Design documents from `/specs/001-mkdocs-documentation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Visual validation only - no automated tests for this documentation project.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Root directory**: Documentation build system at repository root
- **docs/**: All documentation content (Markdown files)
- **.github/workflows/**: GitHub Actions workflows
- Paths follow single project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic MkDocs configuration

- [X] T001 Create mkdocs.yml with Material theme configuration at repository root
- [X] T002 Create requirements-docs.txt with Python dependencies at repository root
- [X] T003 [P] Create docs/ directory structure per plan.md (getting-started/, user-guide/, configuration/, tutorials/, reference/, extending/, architecture/, examples/)
- [X] T004 [P] Create docs/assets/images/ directory for site assets
- [X] T005 [P] Create docs/stylesheets/ directory for custom CSS
- [X] T006 [P] Copy pack icon to docs/assets/icon.png for site logo (placeholder created)
- [X] T007 [P] Copy pack icon to docs/assets/favicon.png for browser favicon (placeholder created)

**Checkpoint**: MkDocs project structure initialized, ready for configuration and content

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Configure mkdocs.yml site metadata (site_name, site_url, site_description, repo_url, repo_name, edit_uri)
- [X] T009 Configure Material theme features in mkdocs.yml (navigation.tabs, navigation.sections, navigation.expand, search.suggest, search.highlight, content.code.copy)
- [X] T010 Configure PAI color scheme in mkdocs.yml (primary: indigo, accent: purple, light/dark mode toggle)
- [X] T011 Create docs/stylesheets/extra.css with custom PAI color variables (#4a90d9, #8b5cf6)
- [X] T012 Configure markdown_extensions in mkdocs.yml (pymdownx.superfences with mermaid, pymdownx.highlight, pymdownx.tabbed, pymdownx.tasklist, admonition, attr_list, md_in_html, toc)
- [X] T013 Configure plugins in mkdocs.yml (search with lang: en, minify, git-revision-date-localized)
- [X] T014 Configure nav structure in mkdocs.yml with all section placeholders per plan.md

**Checkpoint**: MkDocs fully configured - all documentation pages can now be created in parallel

---

## Phase 3: User Story 1 - Browse Project Documentation Online (Priority: P1) 🎯 MVP

**Goal**: Deploy a public documentation site with comprehensive content covering installation, usage, API reference, and workflows

**Independent Test**: Visit the published documentation URL and verify:
1. Professional homepage displays with project overview
2. Navigation menu provides access to all major sections
3. Search feature returns relevant results within 2 seconds

### Content Creation for User Story 1

- [X] T015 [P] [US1] Create docs/index.md homepage with project overview, features, and quick links
- [X] T016 [P] [US1] Create docs/getting-started/index.md section overview page
- [X] T017 [P] [US1] Create docs/getting-started/installation.md with installation guide for humans
- [X] T018 [P] [US1] Create docs/getting-started/prerequisites.md with system requirements (PAI, paperless-ngx, Bun runtime)
- [X] T019 [P] [US1] Create docs/getting-started/quickstart.md with first upload tutorial
- [X] T020 [P] [US1] Create docs/user-guide/index.md section overview page
- [X] T021 [P] [US1] Create docs/user-guide/workflows.md with workflow routing table from SKILL.md
- [X] T022 [P] [US1] Create docs/user-guide/daily-usage.md with common tasks and operations
- [X] T023 [P] [US1] Create docs/user-guide/search.md with document search workflows
- [X] T024 [P] [US1] Create docs/user-guide/tagging.md with tag-based organization guide
- [X] T025 [P] [US1] Create docs/user-guide/retention.md with retention checking and compliance workflows
- [X] T026 [P] [US1] Create docs/user-guide/trusts.md with trust document handling (FTE, deeds)
- [X] T027 [P] [US1] Create docs/configuration/index.md section overview page
- [X] T028 [P] [US1] Create docs/configuration/environment.md with environment variable reference
- [X] T029 [P] [US1] Create docs/configuration/paperless-setup.md with paperless-ngx configuration guide
- [X] T030 [P] [US1] Create docs/configuration/country-selection.md with country-specific compliance (AU/US/UK)
- [X] T031 [P] [US1] Create docs/tutorials/index.md section overview page
- [X] T032 [P] [US1] Create docs/tutorials/first-upload.md with step-by-step upload tutorial
- [X] T033 [P] [US1] Create docs/tutorials/entity-creation.md with creating custom entities tutorial
- [X] T034 [P] [US1] Create docs/tutorials/retention-check.md with checking retention status tutorial
- [X] T035 [P] [US1] Create docs/tutorials/batch-import.md with bulk document import tutorial
- [X] T036 [P] [US1] Create docs/reference/index.md section overview page
- [X] T037 [P] [US1] Create docs/reference/cli.md with CLI command reference from RecordManager.ts
- [X] T038 [P] [US1] Create docs/reference/taxonomy-data-structure.md with taxonomy format reference

### Navigation Integration for User Story 1

- [X] T039 [US1] Update mkdocs.yml nav section with all Getting Started pages (T016-T019)
- [X] T040 [US1] Update mkdocs.yml nav section with all User Guide pages (T020-T026)
- [X] T041 [US1] Update mkdocs.yml nav section with all Configuration pages (T027-T030)
- [X] T042 [US1] Update mkdocs.yml nav section with all Tutorials pages (T031-T035)
- [X] T043 [US1] Update mkdocs.yml nav section with all Reference pages (T036-T038)

**Checkpoint**: All core documentation content created and integrated into navigation - ready for deployment

---

## Phase 4: User Story 2 - Automatic Documentation Publishing (Priority: P2)

**Goal**: GitHub Actions workflow automatically builds and publishes documentation on push to main branch

**Independent Test**: Make a documentation change, push to main branch, and verify:
1. GitHub Actions workflow triggers automatically
2. Updated documentation appears on live site within 10 minutes
3. Workflow status clearly shows success/failure

### GitHub Actions Workflow for User Story 2

- [X] T044 [P] [US2] Create .github/workflows/ directory at repository root
- [X] T045 [US2] Create .github/workflows/docs.yml workflow file with mkdocs gh-deploy configuration
- [X] T046 [US2] Configure workflow trigger in docs.yml (push to main branch)
- [X] T047 [US2] Configure workflow permissions in docs.yml (contents: write)
- [X] T048 [US2] Add Python setup step in docs.yml (python-version: 3.x)
- [X] T049 [US2] Add dependency caching step in docs.yml (pip cache in ~/.cache)
- [X] T050 [US2] Add pip install step in docs.yml (mkdocs-material, mkdocs-minify-plugin, mkdocs-git-revision-date-localized-plugin)
- [X] T051 [US2] Add mkdocs gh-deploy step in docs.yml with --force flag
- [X] T052 [US2] Add workflow status badge to README.md

**Checkpoint**: Documentation auto-deploys on push to main - site always current

---

## Phase 5: User Story 4 - Track Release History (Priority: P2)

**Goal**: Changelog page displays version history with categorized changes (Added, Changed, Fixed, etc.)

**Independent Test**: Visit the Changelog page and verify:
1. Version entries display with categorized changes
2. Changelog updates from CHANGELOG.md appear after deployment

### Changelog Content for User Story 4

- [X] T053 [P] [US4] Create CHANGELOG.md at repository root in Keep a Changelog format
- [X] T054 [P] [US4] Create docs/reference/changelog.md with changelog content
- [X] T055 [US4] Add initial version entry to CHANGELOG.md (version 1.0.0 with initial release notes)
- [X] T056 [US4] Update mkdocs.yml nav section to include Changelog page (T054)

**Checkpoint**: Version history tracked and visible on documentation site

---

## Phase 6: User Story 6 - Extend Taxonomy System (Priority: P2)

**Goal**: Comprehensive documentation on adding new entity types and creating custom taxonomies

**Independent Test**: Follow the taxonomy extension guide to:
1. Create a new custom entity type with taxonomy
2. Verify documents can be created under that entity with appropriate tags

### Taxonomy Documentation for User Story 6

- [X] T057 [P] [US6] Create docs/extending/index.md section overview page
- [X] T058 [P] [US6] Create docs/extending/taxonomies.md with taxonomy system overview (built-in types, country variations, inheritance model)
- [X] T059 [P] [US6] Create docs/extending/custom-entities.md with step-by-step guide for adding new entity types (required fields, registering with TaxonomyExpert, testing)
- [X] T060 [P] [US6] Create docs/extending/custom-taxonomies.md with YAML/JSON configuration format (category definitions, retention rule syntax, country-specific overrides)
- [X] T061 [P] [US6] Create docs/extending/validation.md with CLI validation commands, common errors, troubleshooting
- [X] T062 [US6] Add legal practice taxonomy example to docs/extending/custom-taxonomies.md (client-matters, court-filings with retention periods)
- [X] T063 [US6] Add medical practice taxonomy example to docs/extending/custom-taxonomies.md (patient records, billing with retention periods)
- [X] T064 [US6] Add real estate taxonomy example to docs/extending/custom-taxonomies.md (property transactions, leases with retention periods)
- [X] T065 [US6] Update mkdocs.yml nav section with all Extending pages (T057-T061)

**Checkpoint**: Users can extend taxonomies for their specific domains

---

## Phase 7: User Story 7 - Learn From Example Prompts (Priority: P2)

**Goal**: Categorized example prompts demonstrating common user interactions

**Independent Test**: Browse the Example Prompts page and verify:
1. At least 3 examples per category (7 categories total)
2. Copied prompts work correctly with the skill

### Example Prompts Documentation for User Story 7

- [X] T066 [P] [US7] Create docs/examples/index.md section overview page
- [X] T067 [P] [US7] Create docs/examples/prompts.md with Document Upload & Organization examples (3+ prompts)
- [X] T068 [P] [US7] Add Search & Retrieval examples to docs/examples/prompts.md (3+ prompts)
- [X] T069 [P] [US7] Add Entity Management examples to docs/examples/prompts.md (3+ prompts)
- [X] T070 [P] [US7] Add Retention & Compliance examples to docs/examples/prompts.md (3+ prompts)
- [X] T071 [P] [US7] Add Trust-Specific Operations examples to docs/examples/prompts.md (3+ prompts)
- [X] T072 [P] [US7] Add Workflow & Automation examples to docs/examples/prompts.md (3+ prompts)
- [X] T073 [P] [US7] Add System Administration examples to docs/examples/prompts.md (3+ prompts)
- [X] T074 [US7] Update mkdocs.yml nav section with Examples pages (T066-T073)

**Checkpoint**: New users can quickly learn effective prompt patterns

---

## Phase 8: User Story 5 - Understand System Architecture (Priority: P3)

**Goal**: Visual Mermaid diagrams showing system architecture, workflows, and data flows

**Independent Test**: View architecture pages and verify:
1. Mermaid diagrams render correctly without JavaScript errors
2. Diagrams accurately represent documented workflows

### Architecture Diagrams for User Story 5

- [X] T075 [P] [US5] Create docs/architecture/index.md section overview page
- [X] T076 [P] [US5] Create docs/architecture/overview.md with system architecture flowchart (Intent → Expertise → Execution layers)
- [X] T077 [P] [US5] Create docs/architecture/layers.md with three-layer architecture explanation
- [X] T078 [P] [US5] Create docs/architecture/upload-workflow.md with upload workflow sequence diagram (User → Skill → TaxonomyExpert → PaperlessClient → paperless-ngx)
- [X] T079 [P] [US5] Create docs/architecture/retention-lifecycle.md with retention state diagram (Active → Archive Ready → Archived → Delete Eligible → Deleted)
- [X] T080 [US5] Add taxonomy inheritance Mermaid diagram to docs/extending/taxonomies.md (Base → Country → Entity → Custom)
- [X] T081 [US5] Add agent collaboration flowchart to docs/reference/agents.md (Annual Records Review workflow)
- [X] T082 [US5] Add deletion safety sequence diagram to docs/user-guide/workflows.md (User request → Deletion Auditor → Approval → Execution)
- [X] T083 [US5] Add trust document relationships ER diagram to docs/user-guide/trusts.md (Trust, FTE, Trust Deed, Distribution Minutes)
- [X] T084 [US5] Update mkdocs.yml nav section with Architecture pages (T075-T079)

**Checkpoint**: Visual documentation accelerates technical understanding

---

## Phase 9: User Story 8 - Understand Agent Capabilities (Priority: P3)

**Goal**: Dedicated documentation describing all 6 specialized agent types

**Independent Test**: Read the Agents page and verify:
1. Each agent's expertise, personality, and use cases are clear
2. Deletion Auditor mandatory requirement is documented

### Agent Documentation for User Story 8

- [X] T085 [P] [US8] Create docs/reference/agents.md with agent roster table (Records Keeper, Compliance Guardian, Archive Architect, Deletion Auditor, Sensitivity Scanner, Retention Monitor)
- [X] T086 [P] [US8] Add Records Keeper agent details to docs/reference/agents.md (expertise, personality, voice, trigger phrases, use cases)
- [X] T087 [P] [US8] Add Compliance Guardian agent details to docs/reference/agents.md (expertise, personality, voice, trigger phrases, use cases)
- [X] T088 [P] [US8] Add Archive Architect agent details to docs/reference/agents.md (expertise, personality, voice, trigger phrases, use cases)
- [X] T089 [P] [US8] Add Deletion Auditor agent details to docs/reference/agents.md with MANDATORY deletion review emphasis (expertise, personality, voice, trigger phrases, use cases)
- [X] T090 [P] [US8] Add Sensitivity Scanner agent details to docs/reference/agents.md (expertise, personality, voice, trigger phrases, use cases)
- [X] T091 [P] [US8] Add Retention Monitor agent details to docs/reference/agents.md (expertise, personality, voice, trigger phrases, use cases)
- [X] T092 [US8] Add agent collaboration Mermaid flowchart to docs/reference/agents.md (showing how agents work together on Annual Records Review)

**Checkpoint**: Users understand when and how to leverage specialized agents

---

## Phase 10: User Story 3 - Local Documentation Preview (Priority: P3)

**Goal**: Local preview command enables contributors to verify changes before pushing

**Independent Test**: Run local preview command and verify:
1. Server starts and documentation is viewable at localhost
2. File changes are reflected in browser (auto-reload)

### Local Preview Setup for User Story 3

- [X] T093 [US3] Update quickstart.md (already exists from /speckit.plan) with local preview commands
- [X] T094 [P] [US3] Create CONTRIBUTING.md with local development workflow (mkdocs serve, live reload, testing changes)
- [X] T095 [US3] Add .vscode/launch.json configuration for VS Code users (optional devtools integration)

**Checkpoint**: Contributors can iterate on documentation locally

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T096 [P] Refactor README.md to be concise (< 300 lines) - move detailed content to docs site, keep only title, badges, quick install, features, documentation links, AI assistant section
- [X] T097 [P] Create INSTALL.md with AI assistant installation guide (prerequisites, quick install commands, environment variables, verification checklist, troubleshooting)
- [X] T098 [P] Add "For AI Assistants 🤖" section to README.md directing to INSTALL.md
- [X] T099 [P] Add documentation URL links to README.md (Full Documentation, Installation Guide, User Guide, API Reference)
- [X] T100 [P] Verify all Mermaid diagrams render correctly by running mkdocs build and checking for errors
- [X] T101 [P] Verify all internal links resolve correctly by running mkdocs build and checking for broken links
- [X] T102 [P] Test search functionality locally with common terms (paperless, taxonomy, upload, retention, trust)
- [X] T103 [P] Verify mobile responsiveness by testing site on viewport widths 375px (phone) and 768px (tablet)
- [X] T104 [P] Add docs/troubleshooting.md with common documentation build issues and solutions
- [X] T105 [P] Verify code blocks have syntax highlighting by checking all code examples specify language
- [X] T106 Run mkdocs serve locally and validate all pages load without errors
- [X] T107 Run mkdocs build and verify site/ output directory is generated successfully
- [X] T108 Add site/ to .gitignore to prevent build artifacts from being committed
- [X] T109 [P] Fix site logo and favicon - replace placeholder PNG files with actual pack icon from icons/ directory or create proper SVG icons
- [X] T110 [P] Add deletion disclaimer to relevant sections (configuration, workflows) - clarify that while all care is taken, end users are responsible for verifying deletions and understanding retention requirements before deleting documents
- [X] T111 [P] Add PAI user security section to docs/configuration/paperless-setup.md covering: creating a dedicated PAI user in paperless-ngx without delete permissions, assigning user to appropriate groups, configuring group-based entity access for isolation, and step-by-step security best practices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T007) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T008-T014) - MVP CONTENT
- **User Story 2 (Phase 4)**: Depends on Foundational - can run in parallel with US3-US8
- **User Story 4 (Phase 5)**: Depends on Foundational - can run in parallel with US3, US5-US8
- **User Story 6 (Phase 6)**: Depends on Foundational - can run in parallel with US3-US5, US7-US8
- **User Story 7 (Phase 7)**: Depends on Foundational - can run in parallel with US3-US6, US8
- **User Story 5 (Phase 8)**: Depends on Foundational + US6 (taxonomy diagram) - can run in parallel with US3, US7-US8
- **User Story 8 (Phase 9)**: Depends on Foundational + US1 (agent docs) - can run in parallel with US3-US7
- **User Story 3 (Phase 10)**: Depends on Foundational - can run in parallel with US1, US4-US8
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: No dependencies on other stories - foundational documentation content
- **User Story 2 (P2)**: No dependencies on other stories - GitHub Actions workflow independent
- **User Story 3 (P3)**: No dependencies on other stories - local preview setup independent
- **User Story 4 (P2)**: No dependencies on other stories - changelog content independent
- **User Story 6 (P2)**: No dependencies on other stories - taxonomy documentation independent
- **User Story 7 (P2)**: No dependencies on other stories - example prompts independent
- **User Story 5 (P3)**: DEPENDS on User Story 6 - taxonomy inheritance diagram needs taxonomy docs to exist
- **User Story 8 (P3)**: No dependencies on other stories - agent documentation independent

### Critical Path (MVP Delivery)

1. **Phase 1 (Setup)**: T001-T007 - 3 estimated parallel groups
2. **Phase 2 (Foundational)**: T008-T014 - Must complete sequentially
3. **Phase 3 (User Story 1)**: T015-T043 - 24 estimated parallel groups, then 5 sequential nav updates
4. **STOP AND VALIDATE**: Test User Story 1 independently - site should be browsable with full content
5. **Deploy**: GitHub Pages deployment if ready

### Within Each User Story

- Content pages (marked [P]) can be created in parallel - different files
- Navigation integration tasks must be sequential - all update same mkdocs.yml
- Diagram tasks (US5) depend on content existence
- Polish tasks (Phase 11) can run in parallel across all stories

### Parallel Opportunities

**Setup (Phase 1)**:
- T003-T007 (5 tasks): Directory creation, file copying - can run in parallel

**Foundational (Phase 2)**:
- No parallel opportunities - all sequential configuration of mkdocs.yml

**User Story 1 (Phase 3)**:
- T015-T038 (24 tasks): All documentation pages - can run in parallel
- T039-T043 (5 tasks): Navigation updates - sequential (same file)

**User Story 2 (Phase 4)**:
- T044 (1 task): Directory creation - independent
- T045-T052 (8 tasks): Workflow creation - sequential (same file)

**User Story 4 (Phase 5)**:
- T053-T054 (2 tasks): Changelog files - can run in parallel
- T055-T056 (2 tasks): Sequential

**User Story 6 (Phase 6)**:
- T057-T064 (8 tasks): All taxonomy documentation pages - can run in parallel
- T065 (1 task): Navigation update

**User Story 7 (Phase 7)**:
- T066-T073 (8 tasks): All example prompts - single file, sequential

**User Story 5 (Phase 8)**:
- T075-T079 (5 tasks): Architecture pages - can run in parallel
- T080-T084 (5 tasks): Diagram additions to existing pages - sequential

**User Story 8 (Phase 9)**:
- T085-T091 (7 tasks): Agent documentation - single file, sequential
- T092 (1 task): Diagram addition

**Polish (Phase 11)**:
- T096-T105 (10 tasks): All independent - can run in parallel

**Cross-Story Parallelization** (after Foundational completes):
- User Stories 1, 2, 3, 4, 6, 7, 8 can all proceed in parallel
- User Story 5 must wait for User Story 6 (taxonomy diagram dependency)

---

## Parallel Example: User Story 1 Content Creation

```bash
# Launch all Getting Started content pages together:
Task: "Create docs/getting-started/index.md section overview page"
Task: "Create docs/getting-started/installation.md with installation guide"
Task: "Create docs/getting-started/prerequisites.md with system requirements"
Task: "Create docs/getting-started/quickstart.md with first upload tutorial"

# Launch all User Guide content pages together:
Task: "Create docs/user-guide/index.md section overview page"
Task: "Create docs/user-guide/workflows.md with workflow routing table"
Task: "Create docs/user-guide/daily-usage.md with common tasks"
Task: "Create docs/user-guide/search.md with document search workflows"
Task: "Create docs/user-guide/tagging.md with tag-based organization"
Task: "Create docs/user-guide/retention.md with retention checking"
Task: "Create docs/user-guide/trusts.md with trust document handling"

# Launch all Reference content pages together:
Task: "Create docs/reference/index.md section overview page"
Task: "Create docs/reference/cli.md with CLI command reference"
Task: "Create docs/reference/taxonomy-data-structure.md with taxonomy reference"
```

---

## Parallel Example: Polish Phase

```bash
# Launch all polish tasks together:
Task: "Refactor README.md to be concise (< 300 lines)"
Task: "Create INSTALL.md with AI assistant installation guide"
Task: "Add AI assistant section to README.md"
Task: "Verify all Mermaid diagrams render correctly"
Task: "Verify all internal links resolve correctly"
Task: "Test search functionality locally"
Task: "Verify mobile responsiveness"
Task: "Add troubleshooting documentation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to hosted documentation**:

1. Complete Phase 1: Setup (T001-T007) - ~30 minutes
2. Complete Phase 2: Foundational (T008-T014) - ~1 hour
3. Complete Phase 3: User Story 1 (T015-T043) - ~4-6 hours (content creation)
4. **STOP and VALIDATE**:
   - Run `mkdocs serve` locally
   - Verify all pages load and navigation works
   - Test search functionality
5. **Manual Deploy**: Run `mkdocs gh-deploy --force` for initial deployment
6. **THEN**: Add GitHub Actions (US2) for subsequent deployments

**MVP Deliverable**: Full documentation site with comprehensive content, manually deployed

### Incremental Delivery

**Add automation and advanced features**:

1. **Sprint 1**: Setup + Foundational + User Story 1 → Deploy manually → **MVP COMPLETE**
2. **Sprint 2**: Add User Story 2 (GitHub Actions) → Test auto-deploy → Automation complete
3. **Sprint 3**: Add User Stories 4, 6, 7 (Changelog, Taxonomies, Examples) → Deploy → Content expansion
4. **Sprint 4**: Add User Stories 5, 8 (Diagrams, Agents) → Deploy → Visual enhancements complete
5. **Sprint 5**: Add User Story 3 (Local Preview docs) + Polish → Final polish

Each sprint adds measurable value without breaking previous functionality.

### Parallel Team Strategy

**With multiple contributors**:

1. **Team completes Setup + Foundational together** (sprint kickoff, ~2 hours)
2. **Once Foundational is done, split stories**:
   - **Contributor A**: User Story 1 (Getting Started, User Guide, Tutorials content)
   - **Contributor B**: User Story 2 (GitHub Actions workflow) + User Story 4 (Changelog)
   - **Contributor C**: User Story 6 (Taxonomies) + User Story 7 (Examples)
   - **Contributor D**: User Story 8 (Agents) - waits for US1 agent content
3. **Integrate**: Merge all content branches, update navigation sequentially
4. **Contributor D** (or any): User Story 5 (Diagrams) - adds visuals after content exists
5. **Any contributor**: User Story 3 (Local Preview) + Polish (Phase 11)

**Estimated Timeline**: 2-3 days with 4 contributors (vs 1-2 weeks solo)

---

## Notes

- [P] tasks = different files or true independence, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Visual validation replaces automated tests for this documentation project
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Navigation updates within a story must be sequential (same mkdocs.yml file)
- Content creation within a story can be highly parallel (different Markdown files)
- User Stories 1, 2, 3, 4, 6, 7, 8 are largely independent after Foundational phase
- User Story 5 (Diagrams) depends on User Story 6 (taxonomy diagram needs taxonomy content)

---

**Total Task Count**: 111 tasks
- Setup: 7 tasks
- Foundational: 7 tasks
- User Story 1: 29 tasks (MVP content)
- User Story 2: 9 tasks (GitHub Actions)
- User Story 4: 4 tasks (Changelog)
- User Story 6: 9 tasks (Taxonomies)
- User Story 7: 9 tasks (Examples)
- User Story 5: 10 tasks (Diagrams)
- User Story 8: 8 tasks (Agents)
- User Story 3: 3 tasks (Local Preview)
- Polish: 16 tasks

**Estimated Parallel Groups**: 50+ groups identified across all phases

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 43 tasks for fully functional documentation site
