# Example Prompts

This document provides practical examples for using the Records Manager skill across different use cases. Each category includes multiple prompts that demonstrate the full range of capabilities.

---

## Document Upload & Organization

### Example 1: Upload tax documents
```prompt
Upload these tax documents and organize them properly
```

**Description**: Automatically upload, tag, and categorize tax documents in the paperless-ngx instance.

**Use Case**: When you have tax-related PDFs that need proper organization and tagging for compliance purposes.

**Expected Behavior**:
- Scans for PDFs in common locations or prompts for file selection
- Extracts document metadata (dates, document types)
- Applies appropriate tax-related tags
- Organizes into the correct entity structure

**Variations**:
- "I need to upload my 2024 tax documents"
- "Please process these tax receipts and categorize them"
- "Upload and organize all tax-related PDFs from my email"

---

### Example 2: Add invoice with tags
```prompt
Add this invoice to my household records with appropriate tags
```

**Description**: Uploads a specific invoice and applies relevant tags based on content analysis.

**Use Case**: For processing individual invoices that need proper categorization and record-keeping.

**Expected Behavior**:
- Extracts invoice details (amount, vendor, date)
- Applies auto-generated tags (vendor, amount category, date)
- Stores in the household entity structure
- Creates associated workflow entry if applicable

**Variations**:
- "Upload this electricity bill to my household records"
- "File this tax invoice with correct tagging"
- "Add this contractor invoice to corporate entity"

---

### Example 3: Batch import with classification
```prompt
Import all PDFs from ~/Downloads and classify them
```

**Description**: Bulk imports all PDF files from a specified location with automatic classification and tagging.

**Use Case**: When you have many unorganized documents that need systematic processing.

**Expected Behavior**:
- Scans specified directory for PDF files
- Analyzes each document content for classification
- Applies appropriate entity assignments and tags
- Provides summary of processed documents

**Variations**:
- "Process all PDFs in my documents folder"
- "Import and classify everything in ~/Documents/Records"
- "Batch upload all PDFs from my downloads folder with auto-tagging"

---

## Search & Retrieval

### Example 1: Filter by date and type
```prompt
Find all insurance documents from 2024
```

**Description**: Searches for documents matching specific criteria (insurance type and year).

**Use Case**: When you need to locate documents related to insurance policies or claims from a specific time period.

**Expected Behavior**:
- Filters documents by type "insurance"
- Narrows results to documents from 2024
- Returns list with key information (document names, dates)
- Provides options to view or export results

**Variations**:
- "Show me all insurance policies from 2024"
- "Find home insurance documents from last year"
- "What insurance claims do I have on file?"

---

### Example 2: Entity-based search
```prompt
Search for documents related to the Smith family trust
```

**Description**: Retrieves all documents associated with a specific entity using entity-based search.

**Use Case**: When you need to find all documents related to a specific entity, such as a family trust or business entity.

**Expected Behavior**:
- Identifies all documents linked to the Smith family trust
- Returns comprehensive list with document types and dates
- May include related documents based on shared tags
- Provides overview of trust documentation completeness

**Variations**:
- "What documents are in the Johnson family trust?"
- "Find all records for the corporate entity"
- "Show me documents related to the Smith Family Trust"

---

### Example 3: Topic-based search
```prompt
What documents do I have about vehicle registration?
```

**Description**: Searches for documents based on content topics rather than document types.

**Use Case**: When you need to find documents that discuss or relate to specific topics, not just document classifications.

**Expected Behavior**:
- Searches document content for "vehicle registration" keywords
- Returns relevant documents across different entity types
- May include registration certificates, insurance, related correspondence
- Provides summary of vehicle-related documentation

**Variations**:
- "Find all documents about my car registration"
- "What documents mention vehicle ownership?"
- "Show me all documents related to vehicle registration"

---

## Entity Management

### Example 1: Taxonomy review
```prompt
Review and restructure the household entity taxonomy
```

**Description**: Analyzes the current taxonomy structure for an entity and provides recommendations for improvement.

**Use Case**: When you want to optimize your document organization structure for better efficiency and compliance.

**Expected Behavior**:
- Analyzes current taxonomy structure
- Identifies gaps or redundancies
- Provides restructuring recommendations
- Suggests new categories or hierarchical improvements

**Variations**:
- "Optimize my household document structure"
- "Review the corporate entity filing system"
- "Suggest improvements to the family trust taxonomy"

---

### Example 2: Create new entity
```prompt
Create a new entity for my investment property at 123 Main St
```

**Description**: Creates a new entity with appropriate taxonomy structure for a specific use case.

**Use Case**: When you need to establish a new entity structure for a property, business, or personal category.

**Expected Behavior**:
- Creates new entity with descriptive name
- Sets up appropriate taxonomy structure
- Configures retention rules based on entity type
- Links to relevant parent or related entities if applicable

**Variations**:
- "Add a new entity for rental property at 456 Oak Ave"
- "Create a business entity for my freelance work"
- "Set up a new entity for my side project"

---

### Example 3: Entity overview
```prompt
Show me all entities and their document counts
```

**Description**: Provides a comprehensive overview of all entities with statistics about their document holdings.

**Use Case**: When you need a high-level view of your document organization across all entities.

**Expected Behavior**:
- Lists all configured entities
- Shows document count for each entity
- Displays key statistics (total documents, distribution)
- May include information about entity status or health

**Variations**:
- "What entities do I have configured?"
- "Show me entity statistics"
- "List all entities with document counts"

---

## Retention & Compliance

### Example 1: Retention status check
```prompt
Check retention status for all corporate documents
```

**Description**: Analyzes documents against retention policies and identifies items that may need attention.

**Use Case**: When you need to ensure compliance with retention requirements for specific document types or entities.

**Expected Behavior**:
- Checks retention rules for corporate documents
- Identifies documents approaching retention deadlines
- Highlights documents that may be eligible for archival
- Provides compliance status summary

**Variations**:
- "Which documents are due for retention review?"
- "Check retention compliance for tax documents"
- "Show me documents that can be archived"

---

### Example 2: Deletion eligibility
```prompt
What documents can I safely delete?
```

**Description**: Identifies documents that meet criteria for safe deletion based on retention policies.

**Use Case**: When you want to clean up documents while maintaining compliance with retention requirements.

**Expected Behavior**:
- Analyzes document retention periods
- Identifies documents past their retention date
- Provides list of eligible documents for deletion
- Requires confirmation before any actual deletion

**Variations**:
- "Find documents ready for destruction"
- "What can I delete safely?"
- "Identify documents to archive or delete"

---

### Example 3: Compliance report
```prompt
Generate an ATO compliance report for the family trust
```

**Description**: Creates a comprehensive compliance report for a specific entity based on regulatory requirements.

**Use Case**: When you need to demonstrate compliance with tax authority requirements, particularly for trust documents.

**Expected Behavior**:
- Analyzes family trust documentation completeness
- Identifies missing required documents
- Summarizes retention status
- Provides compliance score and recommendations

**Variations**:
- "ATO compliance check for my discretionary trust"
- "Generate tax compliance report for household"
- "Check compliance for corporate entity"

---

## Trust-Specific Operations

### Example 1: FTE compliance validation
```prompt
Validate all trust documents for FTE compliance
```

**Description**: Validates that all Family Trust Election (FTE) documents meet compliance requirements.

**Use Case**: When you need to ensure your trust documents meet Australian Tax Office requirements for family trusts.

**Expected Behavior**:
- Checks for required FTE documents
- Verifies document completeness
- Validates retention periods based on FTE date
- Provides compliance status with any issues flagged

**Variations**:
- "Check FTE document compliance"
- "Validate family trust documentation"
- "Are my trust documents ATO compliant?"

---

### Example 2: Trust documentation review
```prompt
Check if the family trust has all required documentation
```

**Description**: Reviews a trust entity to identify any missing or incomplete documentation.

**Use Case**: When you want to audit your trust documentation for completeness and compliance.

**Expected Behavior**:
- Lists all required trust documents
- Identifies missing or incomplete items
- Provides priority for addressing gaps
- Suggests next steps for documentation

**Variations**:
- "What's missing from my trust documents?"
- "Check trust documentation completeness"
- "Audit family trust required documents"

---

### Example 3: FTE retention period
```prompt
When does the FTE retention period expire for Smith Family Trust?
```

**Description**: Calculates and displays retention deadlines based on Family Trust Election dates.

**Use Case**: When you need to know specific retention deadlines for trust documentation management.

**Expected Behavior**:
- Identifies Smith Family Trust FTE date
- Calculates retention periods (5+ years from FTE)
- Shows current status and expiration dates
- May include upcoming deadlines

**Variations**:
- "FTE retention deadline for Johnson Family Trust"
- "When can I archive Smith Family Trust documents?"
- "Retention expiration dates for trust documents"

---

## Workflow & Automation

### Example 1: Set up auto-tagging
```prompt
Set up automatic tagging for bank statements
```

**Description**: Creates automated workflows to classify and tag incoming documents of specific types.

**Use Case**: When you want to reduce manual processing time for recurring document types.

**Expected Behavior**:
- Defines workflow rules for bank statements
- Sets up automatic extraction of key information
- Configures appropriate tagging based on content
- Provides activation confirmation and monitoring options

**Variations**:
- "Create automatic tagging for invoices"
- "Set up workflow for processing tax receipts"
- "Automate tagging of insurance documents"

---

### Example 2: Document classification workflow
```prompt
Create a workflow to classify incoming invoices
```

**Description**: Establishes an automated workflow for processing and classifying invoice documents.

**Use Case**: When you want systematic processing of incoming invoices to ensure proper categorization and record-keeping.

**Expected Behavior**:
- Defines invoice classification rules
- Sets up tag assignment based on vendor/type
- Configures approval routing if needed
- Provides workflow activation and monitoring

**Variations**:
- "Set up invoice processing workflow"
- "Create automation for contractor invoices"
- "Workflow for automatic invoice categorization"

---

### Example 3: Workflow status check
```prompt
What workflows are currently active?
```

**Description**: Lists all active workflows and their current status in the system.

**Use Case**: When you want to monitor the automation systems and ensure they're functioning properly.

**Expected Behavior**:
- Lists all configured workflows
- Shows status (active, paused, error)
- Provides processing statistics
- May include recent activity logs

**Variations**:
- "Show active automation workflows"
- "What workflows are running?"
- "List all document processing workflows"

---

## System Administration

### Example 1: Connection test
```prompt
Test connection to paperless-ngx
```

**Description**: Validates connectivity and authentication with the paperless-ngx instance.

**Use Case**: When you need to verify that the system is properly configured and can communicate with the document management system.

**Expected Behavior**:
- Tests API connectivity
- Validates authentication credentials
- Checks system compatibility
- Provides detailed status report with any issues

**Variations**:
- "Check paperless-ngx connection"
- "Verify system configuration"
- "Test paperless integration"

---

### Example 2: System configuration
```prompt
Show current configuration and environment
```

**Description**: Displays current system configuration settings and environment variables.

**Use Case**: When you need to review system settings or troubleshoot configuration issues.

**Expected Behavior**:
- Lists all configuration parameters
- Shows environment variables (masked for sensitive data)
- Displays system version and status
- Provides configuration validation results

**Variations**:
- "What's the current system configuration?"
- "Show me all settings"
- "Display environment configuration"

---

### Example 3: System health check
```prompt
Run a health check on all entities
```

**Description**: Performs comprehensive system health checks across all entities and components.

**Use Case**: When you want to verify overall system health, identify issues, or ensure everything is functioning properly.

**Expected Behavior**:
- Checks connectivity to all services
- Validates entity configurations
- Monitors document processing status
- Provides comprehensive health report with recommendations

**Variations**:
- "Perform system health check"
- "Check system status"
- "Validate all entity configurations"