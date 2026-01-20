# Architecture Documentation

## Overview

This section provides comprehensive architectural documentation for the Records Manager Skill, including system design, workflow patterns, and component relationships.

## Architecture Documentation Structure

### Core Architecture
*   [System Architecture](overview.md) - High-level system architecture and component interactions
*   [Three-Layer Architecture](layers.md) - Detailed explanation of the Intent, Expertise, and Execution layers
*   [Upload Workflow](upload-workflow.md) - Document upload process and workflow
*   [Retention Lifecycle](retention-lifecycle.md) - Document lifecycle management and retention rules

### Extended Architecture
*   [Taxonomy Inheritance](../extending/taxonomies.md#taxonomy-inheritance) - How taxonomies are structured and extended
*   [Agent Collaboration](../reference/agents.md#agent-collaboration) - Agent workflows and handoffs
*   [Deletion Safety](../user-guide/workflows.md#deletion-safety-workflow) - Safe document deletion process
*   [Trust Document Relationships](../user-guide/trusts.md#trust-document-relationships) - Trust document management structure

## Key Design Principles

The Records Manager Skill follows a three-layer architecture that ensures:

1. **Separation of Concerns**: Clear boundaries between intent recognition, domain expertise, and execution

2. **Safety-First Design**: Mandatory checkpoints for destructive operations

3. **Extensibility**: Modular components that can be easily extended or replaced

4. **Compliance**: Built-in support for country-specific retention requirements

5. **Auditability**: Complete tracking of all document operations and state changes

## Mermaid Diagrams

All architecture diagrams use Mermaid syntax for easy rendering in MkDocs and GitHub Pages. Each diagram provides a visual representation of:

*   Component relationships and data flow
*   State transitions and lifecycle management
*   Decision points and approval workflows
*   Entity relationships and data structures

## Navigation

Use the navigation menu to explore specific architectural components, or start with the [System Architecture](overview.md) for a comprehensive overview.