# System Architecture

## Overview

The Records Manager Skill follows a three-layer architecture that ensures clear separation of concerns, safety, and extensibility. This diagram shows the high-level system architecture and how components interact within and between layers.

## System Architecture Diagram

```mermaid
flowchart TB
    %% Force top-to-bottom ordering
    linkStyle default stroke-width:2px,fill:none,stroke:#333

    subgraph Intent["Intent Layer"]
        SKILL["SKILL.md<br/>Intent Detection"]
        TAX["TaxonomyExpert<br/>Country Rules"]
        TRUST["TrustExpert<br/>Compliance"]
        WF["WorkflowExpert<br/>Automation"]
        ENTITY["EntityCreator<br/>Dynamic Entities"]
        SENS["SensitivityExpert<br/>Data Classification"]

        SKILL --> TAX
        SKILL --> TRUST
        SKILL --> WF
        SKILL --> ENTITY
        SKILL --> SENS
    end

    subgraph Expertise["Expertise Layer"]
        direction LR
        CLIENT["PaperlessClient<br/>API Integration"]

        TAX --> CLIENT
        TRUST --> CLIENT
        WF --> CLIENT
        ENTITY --> CLIENT
        SENS --> CLIENT
    end

    subgraph Execution["Execution Layer"]
        MGR["RecordManager CLI<br/>Command Tool"]
        API["PaperlessClient<br/>Full API"]
        NGX["paperless-ngx<br/>Document Storage"]
        ENV["Environment<br/>Configuration"]

        MGR --> API
        API --> NGX
        MGR --> ENV
    end

    subgraph Safety["Safety Features"]
        DW["DeleteConfirmation<br/>Workflow"]
        DA["Deletion Auditor<br/>Mandatory Check"]

        DW --> DA
        DA --> API
    end

    %% Layer flow (top to bottom)
    Intent --> Expertise
    Expertise --> Execution

    %% Style definitions with better text handling
    classDef intentStyle fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000
    classDef expertiseStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:3px,color:#000
    classDef executionStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:3px,color:#000
    classDef safetyStyle fill:#ffebee,stroke:#b71c1c,stroke-width:3px,color:#000

    class SKILL,TAX,TRUST,WF,ENTITY,SENS intentStyle
    class CLIENT expertiseStyle
    class MGR,API,NGX,ENV executionStyle
    class DW,DA safetyStyle
```

## Key Components

### Intent Layer (`SKILL.md`)
- **Primary Function**: Detects user intent and routes to appropriate expertise
- **Components**:
  - TaxonomyExpert for document classification
  - TrustExpert for trust-specific compliance
  - WorkflowExpert for automation recommendations
  - EntityCreator for dynamic entity management
  - SensitivityExpert for data classification

### Expertise Layer
- **Primary Function**: Provides domain-specific knowledge and processing
- **Components**:
  - **TaxonomyExpert**: Country-specific retention rules and classification
  - **TrustExpert**: Trust document management and ATO compliance
  - **WorkflowExpert**: Automated workflow recommendations
  - **EntityCreator**: Dynamic entity creation and management
  - **SensitivityExpert**: Document sensitivity classification

### Execution Layer
- **Primary Function**: Executes operations and manages API interactions
- **Components**:
  - **RecordManager CLI**: Main command-line interface
  - **PaperlessClient**: Full paperless-ngx API wrapper (safe - no delete methods)
  - **Environment Variables**: Configuration management

### Safety Features
- **Primary Function**: Ensures safe operation and prevents data loss
- **Components**:
  - **DeleteConfirmation Workflow**: Mandatory approval for all deletions
  - **Deletion Auditor**: Safety checkpoint before any destructive operations

### External Systems
- **paperless-ngx**: Document management system backend
- **Environment Variables**: Configuration with `MADEINOZ_RECORDMANAGER_` prefix

## Data Flow

1. **Intent Detection**: User request → SKILL.md analyzes and determines required expertise
2. **Expertise Application**: Appropriate experts process the request with domain knowledge
3. **Execution**: RecordManager CLI calls PaperlessClient for API operations
4. **Safety Check**: All deletions flow through DeleteConfirmation workflow
5. **External Integration**: PaperlessClient interfaces with paperless-ngx

## Safety Design

The architecture includes multiple safety layers:
- **No Delete Methods**: PaperlessClient intentionally omits delete operations
- **Mandatory Workflows**: All deletions require explicit user confirmation
- **Audit Trail**: Complete tracking of all operations
- **Configuration Validation**: Environment variable validation before operations

## Extensibility Points

The modular design allows for easy extension:
- **New Expert Types**: Add new expertise components without affecting existing layers
- **Custom Workflows**: Extend workflow system with new automation patterns
- **Entity Types**: Support additional entity types beyond household/corporate/trust
- **External Integrations**: Interface with other document management systems

## Configuration

All configuration uses environment variables with `MADEINOZ_RECORDMANAGER_` prefix:
- `MADEINOZ_RECORDMANAGER_PAPERLESS_URL` - paperless-ngx instance URL
- `MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN` - API token
- `MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY` - Country for compliance rules
- `MADEINOZ_RECORDMANAGER_RECORDS_DEFAULT_DOMAIN` - Default domain

This architecture ensures the system remains safe, extensible, and maintainable while providing powerful document management capabilities.