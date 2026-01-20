# Feature Specification: MkDocs Material Documentation Site

**Feature Branch**: `001-mkdocs-documentation`
**Created**: 2026-01-20
**Status**: Clarified
**Input**: User description: "I want to add mkdocs-material to the project and a git action publishing workflow. document the project"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Project Documentation Online (Priority: P1)

As a potential user or contributor, I want to read comprehensive project documentation on a public website so that I can understand what the Records Manager Skill does, how to install it, and how to use it effectively.

**Why this priority**: Documentation accessibility is the foundation - without a hosted site, no other documentation features matter. This enables self-service onboarding for all users.

**Independent Test**: Can be fully tested by visiting the published documentation URL and verifying that all major sections are readable and navigation works correctly.

**Acceptance Scenarios**:

1. **Given** the documentation site is deployed, **When** a user visits the site URL, **Then** they see a professionally styled homepage with project overview
2. **Given** the user is on the documentation site, **When** they use the navigation menu, **Then** they can access all major sections (Installation, Usage, API Reference, Workflows)
3. **Given** the user is on any documentation page, **When** they use the search feature, **Then** relevant pages appear in search results within 2 seconds

---

### User Story 2 - Automatic Documentation Publishing (Priority: P2)

As a project maintainer, I want documentation changes to be automatically published when I push to the main branch so that the live documentation always reflects the current state of the project.

**Why this priority**: Automation ensures documentation stays current without manual intervention. This prevents stale docs and reduces maintenance burden.

**Independent Test**: Can be tested by making a documentation change, pushing to main, and verifying the change appears on the live site.

**Acceptance Scenarios**:

1. **Given** a documentation file is modified and pushed to main branch, **When** the GitHub Actions workflow runs, **Then** the updated documentation is published within 10 minutes
2. **Given** a workflow run completes, **When** checking the workflow status, **Then** success or failure is clearly indicated with actionable error messages on failure
3. **Given** the documentation site is published, **When** checking the site, **Then** it reflects the content from the latest successful build

---

### User Story 3 - Local Documentation Preview (Priority: P3)

As a documentation contributor, I want to preview documentation changes locally before pushing so that I can verify formatting and content accuracy.

**Why this priority**: Local preview prevents broken documentation from being published and speeds up the documentation writing workflow.

**Independent Test**: Can be tested by running a local server command and viewing documentation changes in a browser before committing.

**Acceptance Scenarios**:

1. **Given** a contributor has cloned the repository, **When** they run the local preview command, **Then** a local server starts and documentation is viewable at localhost
2. **Given** the local server is running, **When** a contributor modifies a documentation file, **Then** changes are reflected in the browser (with or without manual refresh)

---

### User Story 4 - Track Release History (Priority: P2)

As a user or contributor, I want to view a changelog so that I can understand what changed between versions and whether I need to update my configuration.

**Why this priority**: Release tracking builds trust and helps users make informed upgrade decisions. Essential for production deployments.

**Independent Test**: Can be tested by viewing the Changelog page and verifying version entries are present with categorized changes.

**Acceptance Scenarios**:

1. **Given** a user visits the Changelog page, **When** they look for a specific version, **Then** they see categorized changes (Added, Changed, Fixed, etc.)
2. **Given** a new version is released, **When** the maintainer updates CHANGELOG.md, **Then** the docs site reflects the new entry after deployment

---

### User Story 5 - Understand System Architecture (Priority: P3)

As a developer or advanced user, I want to see visual diagrams of the system architecture so that I can understand how components interact and where to look when debugging.

**Why this priority**: Visual documentation accelerates understanding for technical users. Mermaid diagrams are low-maintenance and version-controlled.

**Independent Test**: Can be tested by viewing architecture pages and confirming Mermaid diagrams render correctly.

**Acceptance Scenarios**:

1. **Given** a user views the Architecture page, **When** diagrams load, **Then** Mermaid flowcharts and sequence diagrams render correctly
2. **Given** a user views workflow documentation, **When** they see a process diagram, **Then** the diagram accurately represents the described workflow

---

### User Story 6 - Extend Taxonomy System (Priority: P2)

As a power user or developer, I want documentation on how to add new entity taxonomies and create custom taxonomies so that I can adapt the Records Manager to my specific organizational needs.

**Why this priority**: Taxonomy customization is a key differentiator - users need to extend the system for their specific domains (legal, medical, real estate, etc.) without modifying core code.

**Independent Test**: Can be tested by following the documentation to create a new custom entity type with its own taxonomy and verifying it works end-to-end.

**Acceptance Scenarios**:

1. **Given** a user reads the taxonomy extension guide, **When** they follow the steps to add a new entity type, **Then** they can successfully create documents under that entity with appropriate tags
2. **Given** a user needs country-specific retention rules, **When** they follow the custom taxonomy guide, **Then** they can define retention periods that differ from built-in defaults
3. **Given** a user creates a custom taxonomy, **When** they use it in the CLI, **Then** the system validates documents against their custom rules

---

### User Story 7 - Learn From Example Prompts (Priority: P2)

As a new user, I want to see example prompts organized by task category so that I can quickly learn how to interact with the Records Manager skill effectively.

**Why this priority**: Example prompts dramatically reduce onboarding time - users learn by copying and adapting rather than guessing syntax.

**Independent Test**: Can be tested by browsing the example prompts page and copying a prompt to use with the skill.

**Acceptance Scenarios**:

1. **Given** a user visits the Example Prompts page, **When** they browse categories, **Then** they see at least 3 examples per category (upload, search, entity, retention, trust, workflow, admin)
2. **Given** a user copies an example prompt, **When** they use it with the skill, **Then** the skill responds appropriately to the prompt

---

### User Story 8 - Understand Agent Capabilities (Priority: P3)

As a power user, I want to understand the specialized agents available so that I can leverage the right agent for complex tasks.

**Why this priority**: Agent awareness unlocks advanced workflows - users who understand agents can accomplish more sophisticated document management tasks.

**Independent Test**: Can be tested by reading the Agents page and understanding when to invoke each agent type.

**Acceptance Scenarios**:

1. **Given** a user reads the Agents documentation, **When** they review the agent roster, **Then** they understand each agent's expertise, personality, and best use cases
2. **Given** a user needs to perform a deletion, **When** they check the documentation, **Then** they learn that Deletion Auditor is mandatory for all deletions

---

### Edge Cases

- What happens when a documentation build fails due to syntax errors in markdown?
- How does the system handle broken internal links between documentation pages?
- What happens when GitHub Actions quotas are exceeded?
- How does the site behave when accessed on mobile devices?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Documentation site MUST display all existing project documentation (README content, SKILL.md workflows, CLI usage, installation guide)
- **FR-002**: Documentation MUST be organized into logical sections with clear navigation hierarchy
- **FR-003**: Site MUST include a search feature that searches across all documentation content
- **FR-004**: Site MUST be responsive and readable on mobile devices and tablets
- **FR-005**: GitHub Actions workflow MUST automatically build and publish documentation on push to main branch
- **FR-006**: GitHub Actions workflow MUST report build status (success/failure) clearly in the repository
- **FR-007**: Documentation MUST include syntax highlighting for code examples (bash commands, TypeScript, JSON)
- **FR-008**: Site MUST provide clear navigation back to the project's GitHub repository
- **FR-009**: Local development MUST support live preview of documentation changes
- **FR-010**: Documentation MUST render properly with consistent styling across all pages
- **FR-011**: Documentation MUST include comprehensive user guides covering installation, configuration, and daily usage workflows
- **FR-012**: Documentation MUST support Mermaid diagrams for visualizing architecture, workflows, and data flows
- **FR-013**: Site MUST include a Changelog page documenting version history, new features, and breaking changes
- **FR-014**: User documentation MUST include step-by-step tutorials with examples for common tasks (upload, search, retention check)
- **FR-015**: Documentation MUST include a guide for adding new entity types with their associated taxonomies
- **FR-016**: Documentation MUST include instructions for creating custom taxonomies with country-specific retention rules
- **FR-017**: Documentation MUST explain the taxonomy data structure (categories, tags, retention periods, compliance requirements)
- **FR-018**: Documentation MUST provide example custom taxonomy configurations for common use cases (legal, medical, real estate)
- **FR-019**: Documentation MUST include example prompts demonstrating common user interactions with the skill
- **FR-020**: Documentation MUST describe all specialized agent types with their expertise, personality, and use cases
- **FR-021**: README.md MUST be refactored to be concise (under 300 lines) with detailed content moved to documentation site
- **FR-022**: README.md MUST link to documentation site for detailed guides, API reference, and tutorials
- **FR-023**: INSTALL.md MUST exist with complete installation instructions for both humans and AI assistants
- **FR-024**: README.md MUST include AI assistant installation section directing to read INSTALL.md

### Key Entities

- **Documentation Page**: A single page of documentation content with title, content, navigation position, and metadata
- **Navigation Structure**: Hierarchical organization of documentation pages into sections and subsections
- **Build Artifact**: The generated static site files produced by the documentation build process

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Documentation site loads completely within 3 seconds on standard internet connections
- **SC-002**: All documentation pages pass accessibility checks for basic screen reader compatibility
- **SC-003**: Documentation builds complete within 5 minutes from push to published
- **SC-004**: Search returns relevant results for at least 90% of common project terms (paperless, taxonomy, upload, retention, trust)
- **SC-005**: 100% of existing README content is discoverable within 2 clicks from the homepage
- **SC-006**: Documentation site achieves mobile-friendly status (readable without horizontal scrolling on phones)
- **SC-007**: All Mermaid diagrams render correctly without JavaScript errors in modern browsers (Chrome, Firefox, Safari)
- **SC-008**: Changelog page displays at least the current version with categorized changes
- **SC-009**: Taxonomy extension guide enables a developer to create a working custom entity type within 30 minutes of reading
- **SC-010**: README.md is under 300 lines with clear links to documentation site for details

## Assumptions

- GitHub Pages will be used for hosting (free, integrated with GitHub Actions)
- MkDocs with Material theme is the chosen documentation framework per user request
- Documentation source files will be in Markdown format
- The project already has substantial documentation in README.md and SKILL.md that will be migrated
- Standard MkDocs Material features (search, navigation, code highlighting) are sufficient without custom plugins

## Clarifications *(from speckit.clarify)*

The following decisions were made during specification clarification:

### Access Control
**Decision**: Public access
**Rationale**: Documentation will be publicly accessible to anyone - standard for open source projects. No authentication required.

### MkDocs Plugins
**Decision**: Standard plugin set with diagram support
**Plugins enabled**:
- `search` - Full-text search across all documentation
- `minify` - HTML/CSS/JS minification for faster load times
- `git-revision-date-localized` - Shows last updated date on each page

**Markdown extensions enabled**:
- `pymdownx.superfences` with `mermaid` custom fence - Renders Mermaid diagrams inline
- `pymdownx.tabbed` - Tabbed content blocks for multi-platform instructions

### Navigation Structure
**Decision**: 3-level navigation depth
**Structure**: Section > Subsection > Page
**Rationale**: Accommodates larger documentation sets with room for growth (Installation > Prerequisites > System Requirements)

### Branding
**Decision**: Use pack icon as site logo
**Implementation**: Display `icons/madeinoz-recordmanager-skill.png` in site header
**Rationale**: Consistent branding with PAI pack ecosystem

### Color Scheme
**Decision**: PAI color palette
**Colors**:
- Primary: Electric Blue (#4a90d9)
- Accent: Purple (#8b5cf6)
**Rationale**: Matches pack icon and PAI visual identity

### User Documentation Structure
**Decision**: Comprehensive user guides with tutorials
**Sections required**:
- **Getting Started** - Installation, prerequisites, first upload
- **User Guide** - Daily workflows, search, tagging, retention
- **Configuration** - Environment variables, paperless-ngx setup, country selection
- **Tutorials** - Step-by-step walkthroughs for common tasks
- **API Reference** - CLI commands, library functions
- **Extending** - Taxonomy customization and entity creation (see below)

**Diagram usage**:
- Architecture overview (system components)
- Upload workflow (document → classification → storage)
- Retention lifecycle (document states over time)
- Trust document relationships (entity → documents → compliance)
- Taxonomy inheritance diagram (base → country → entity → custom)
- Agent collaboration flowchart (Annual Records Review workflow)
- Deletion safety workflow (user request → Deletion Auditor → approval → execution)

### Taxonomy Extension Documentation
**Decision**: Dedicated section for taxonomy customization
**Topics covered**:

1. **Understanding the Taxonomy System**
   - Built-in entity types (household, corporate, unit-trust, discretionary-trust, family-trust, project)
   - Country-specific variations (AU, US, UK)
   - Inheritance model: Base taxonomy → Country overlay → Entity specifics

2. **Adding New Entity Types**
   - Step-by-step guide with code examples
   - Required fields: name, categories, default retention rules
   - Registering with TaxonomyExpert
   - Testing the new entity type

3. **Creating Custom Taxonomies**
   - YAML/JSON configuration format
   - Category definitions (document types, tags)
   - Retention rule syntax (duration, trigger events, compliance references)
   - Country-specific overrides

4. **Example Configurations**
   ```yaml
   # Example: Legal practice taxonomy
   legal-practice:
     categories:
       - name: client-matters
         retention: 7 years from matter close
       - name: court-filings
         retention: permanent
   ```

5. **Validation and Testing**
   - Using CLI to validate custom taxonomy
   - Common errors and troubleshooting
   - Integration testing with paperless-ngx

### Changelog
**Decision**: Maintain CHANGELOG.md in Keep a Changelog format
**Format**: [Keep a Changelog](https://keepachangelog.com/) v1.1.0
**Sections per version**:
- Added - New features
- Changed - Changes to existing functionality
- Deprecated - Features to be removed
- Removed - Removed features
- Fixed - Bug fixes
- Security - Security patches

**Integration**: Changelog page in docs pulls from root CHANGELOG.md file

### Example Prompts Documentation
**Decision**: Include categorized example prompts for user reference
**Categories and examples**:

1. **Document Upload & Organization**
   - "Upload these tax documents and organize them properly"
   - "Add this invoice to my household records with appropriate tags"
   - "Import all PDFs from ~/Downloads and classify them"

2. **Search & Retrieval**
   - "Find all insurance documents from 2024"
   - "Search for documents related to the Smith family trust"
   - "What documents do I have about vehicle registration?"

3. **Entity Management**
   - "Review and restructure the household entity taxonomy"
   - "Create a new entity for my investment property at 123 Main St"
   - "Show me all entities and their document counts"
   - "Merge the old corporate entity into the new one"

4. **Retention & Compliance**
   - "Check retention status for all corporate documents"
   - "What documents can I safely delete?"
   - "Generate an ATO compliance report for the family trust"
   - "Flag any documents approaching retention deadlines"

5. **Trust-Specific Operations**
   - "Validate all trust documents for FTE compliance"
   - "Check if the family trust has all required documentation"
   - "When does the FTE retention period expire for Smith Family Trust?"

6. **Workflow & Automation**
   - "Set up automatic tagging for bank statements"
   - "Create a workflow to classify incoming invoices"
   - "What workflows are currently active?"

7. **System Administration**
   - "Test connection to paperless-ngx"
   - "Show current configuration and environment"
   - "Run a health check on all entities"

### Agent Types Documentation
**Decision**: Dedicated section describing each specialized agent
**Agent roster**:

| Agent | Expertise | Personality | Best For |
|-------|-----------|-------------|----------|
| **Records Keeper** 📋 | Data Organization & Classification | Meticulous, Analytical, Systematic | Taxonomy design, tagging strategies, document findability |
| **Compliance Guardian** ⚖️ | Legal & Regulatory Requirements | Cautious, Meticulous, Thorough | Retention compliance, legal risk assessment, ATO compliance |
| **Archive Architect** 🏛️ | Storage & Retrieval Strategy | Analytical, Pragmatic | Archive design, storage optimization, migration planning |
| **Deletion Auditor** 🛡️ | Risk Assessment & Safety | Skeptical, Cautious, Adversarial | **MANDATORY** deletion review, safety checkpoint, audit logging |
| **Sensitivity Scanner** 🔒 | Data Loss Prevention | Cautious, Systematic | Sensitivity classification, PII/PHI detection, DLP compliance |
| **Retention Monitor** ⏰ | Time-Based Compliance | Meticulous, Cautious | Retention tracking, deadline alerts, archive readiness |

**Agent documentation includes**:
- Domain expertise and knowledge base
- Personality characteristics and approach
- Voice identity for audio output
- Trigger phrases and use cases
- Integration with other agents
- Example scenarios with expected behavior

**Mermaid diagram**: Agent collaboration flowchart showing how agents work together on complex tasks (e.g., Annual Records Review workflow)

### README Refactoring
**Decision**: Slim README with links to full documentation
**Target**: Under 300 lines (currently much larger)

**Sections to KEEP in README** (essential for GitHub discovery):
- Project title, icon, and one-line description
- Badges (build status, version, license)
- Quick install (5-10 lines max)
- Basic usage example (single command)
- Key features bullet list (5-7 items)
- Links to documentation sections
- Contributing and license

**Sections to MOVE to docs site**:
- Detailed installation instructions → `docs/getting-started/installation.md`
- Full CLI reference → `docs/reference/cli.md`
- Environment variable details → `docs/configuration/environment.md`
- Workflow descriptions → `docs/user-guide/workflows.md`
- Agent documentation → `docs/reference/agents.md`
- Taxonomy details → `docs/extending/taxonomies.md`
- Trust document handling → `docs/user-guide/trusts.md`
- Troubleshooting → `docs/troubleshooting.md`

**README structure after refactoring**:
```markdown
# Records Manager Skill 📋

> Expert record keeping with paperless-ngx integration

![Build](badge) ![Version](badge) ![License](badge)

## Quick Start
\`\`\`bash
# One command install
\`\`\`

## Features
- Feature 1
- Feature 2
...

## Documentation
📖 [Full Documentation](https://...)
- [Installation Guide](link)
- [User Guide](link)
- [API Reference](link)

## For AI Assistants 🤖
If you are an AI coding assistant (Claude, Cursor, Copilot, etc.):
**Read [INSTALL.md](./INSTALL.md) before attempting installation.**

## Contributing | License
```

### AI Assistant Instructions
**Decision**: Include AI-specific installation guidance in README.md only
**Purpose**: Enable AI coding assistants (Claude Code, Cursor, Copilot, etc.) to correctly install and configure the skill

**README.md addition** (visible on GitHub):
```markdown
## For AI Assistants 🤖
If you are an AI coding assistant (Claude, Cursor, Copilot, etc.):
**Read [INSTALL.md](./INSTALL.md) before attempting installation.**
```

**INSTALL.md structure**:
1. **Prerequisites**
   - PAI installation required
   - paperless-ngx instance URL and API token
   - Node.js/Bun runtime

2. **Quick Install** (for AI assistants)
   ```bash
   # Clone to PAI skills directory
   git clone <repo> ~/.claude/skills/RecordsManager

   # Configure environment
   export MADEINOZ_RECORDMANAGER_PAPERLESS_URL="https://..."
   export MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN="..."

   # Verify installation
   bun run ~/.claude/skills/RecordsManager/Tools/RecordManager.ts --help
   ```

3. **Environment Variables** (complete list with descriptions)

4. **Verification Checklist**
   - [ ] CLI responds to --help
   - [ ] Connection to paperless-ngx succeeds
   - [ ] Test upload works

5. **Troubleshooting**
   - Common errors and solutions
