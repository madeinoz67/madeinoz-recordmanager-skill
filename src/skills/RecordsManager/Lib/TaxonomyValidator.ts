// $PAI_DIR/lib/recordsmanager/TaxonomyValidator.ts
/**
 * Taxonomy Validator - Validation layer for agent workflow integration
 * Ensures expert agents use taxonomy from TaxonomyExpert as single source of truth
 */

import { TaxonomyExpert, Domain } from './TaxonomyExpert.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * T003: Agent suggestions interface for workflow validation
 */
export interface AgentSuggestions {
  documentType?: string;
  tags?: string[];
  retentionYears?: number;
  retentionReason?: string;
}

/**
 * T003: Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: AgentSuggestions;
}

/**
 * Taxonomy Validator - Validates agent suggestions against TaxonomyExpert
 */
export class TaxonomyValidator {
  /**
   * T008: Validate agent suggestions against TaxonomyExpert
   * Checks document types, tags, and retention years for correctness
   *
   * CRITICAL: This is the enforcement layer that prevents agents from inventing
   * tags, document types, or retention periods outside taxonomies.yaml.
   * Used in ALL workflows to validate agent outputs before applying to paperless-ngx.
   *
   * @param suggestions - Agent suggestions to validate (documentType, tags, retentionYears, retentionReason)
   * @param country - Country for compliance rules (Australia, United States, United Kingdom)
   * @param domain - Entity type domain (household, corporate, unit-trust, etc.)
   * @returns Validation result with valid flag, errors array, and original suggestions
   *
   * @example
   * ```typescript
   * const validation = TaxonomyValidator.validateAgentSuggestions(
   *   { documentType: 'Tax Return', tags: ['tax', '2024'], retentionYears: 7 },
   *   'Australia',
   *   'household'
   * );
   * if (!validation.valid) {
   *   console.error('Agent suggestions invalid:', validation.errors);
   *   // Abort workflow - do not apply invalid suggestions
   * }
   * ```
   */
  static validateAgentSuggestions(
    suggestions: AgentSuggestions,
    country: string,
    domain: Domain
  ): ValidationResult {
    const taxonomyExpert = new TaxonomyExpert(country, domain);
    const errors: string[] = [];

    // Validate document type
    if (suggestions.documentType) {
      const validDocTypes = taxonomyExpert.getDocumentTypes(domain);
      if (!validDocTypes.includes(suggestions.documentType)) {
        errors.push(
          `Invalid document type: "${suggestions.documentType}". Valid types for ${domain}: ${validDocTypes.join(', ')}`
        );
      }

      // Validate retention years if provided
      if (suggestions.retentionYears !== undefined) {
        const retentionReq = taxonomyExpert.getRetentionRequirements(
          suggestions.documentType,
          domain
        );
        if (retentionReq && retentionReq.years !== suggestions.retentionYears) {
          errors.push(
            `Invalid retention period for "${suggestions.documentType}": suggested ${suggestions.retentionYears} years, but TaxonomyExpert requires ${retentionReq.years} years (${retentionReq.reason})`
          );
        }
      }
    }

    // Validate tags
    if (suggestions.tags && suggestions.tags.length > 0) {
      const tagCategories = taxonomyExpert.getTagCategories(domain);
      const allValidTags = Object.values(tagCategories).flat();

      for (const tag of suggestions.tags) {
        if (!allValidTags.includes(tag)) {
          errors.push(
            `Invalid tag: "${tag}". Valid tags for ${domain}: ${allValidTags.join(', ')}`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * T009: Write validation log entry to JSONL file
   * Logs validation failures for audit and debugging
   *
   * Creates audit trail of taxonomy validation failures at:
   * $PAI_DIR/MEMORY/RECORDSMANAGER/taxonomy-validation-failures.jsonl
   *
   * Only logs failures (validation.valid = false) to keep logs focused on issues.
   * Each entry includes timestamp, workflow, agent, country, domain, suggestions, and errors.
   *
   * @param validation - Validation result from validateAgentSuggestions()
   * @param context - Workflow context (workflow name, agent name, country, domain)
   * @returns Promise that resolves when log entry is written
   *
   * @example
   * ```typescript
   * const validation = TaxonomyValidator.validateAgentSuggestions(suggestions, 'Australia', 'household');
   * await TaxonomyValidator.writeValidationLog(validation, {
   *   workflow: 'UploadWorkflow',
   *   agent: 'Records Keeper',
   *   country: 'Australia',
   *   domain: 'household'
   * });
   * ```
   */
  static async writeValidationLog(
    validation: ValidationResult,
    context: {
      workflow: string;
      agent: string;
      country: string;
      domain: Domain;
    }
  ): Promise<void> {
    const paiDir = process.env.PAI_DIR || process.env.HOME + '/.claude';
    const logDir = path.join(paiDir, 'MEMORY', 'RECORDSMANAGER');
    const logFile = path.join(logDir, 'taxonomy-validation-failures.jsonl');

    // Only log failures
    if (validation.valid) {
      return;
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      workflow: context.workflow,
      agent: context.agent,
      country: context.country,
      domain: context.domain,
      suggestions: validation.suggestions,
      errors: validation.errors,
    };

    // Append as JSONL
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  /**
   * T050: Write workflow execution log entry to JSONL file
   * Logs all workflow executions with agents invoked and validation results
   *
   * Creates audit trail of ALL workflow executions at:
   * $PAI_DIR/MEMORY/RECORDSMANAGER/workflow-executions.jsonl
   *
   * Logs both successful and failed workflows, tracking which agents were invoked
   * and what validation results they produced. Useful for debugging agent behavior
   * and understanding workflow patterns.
   *
   * @param workflowName - Name of workflow being executed (e.g., 'UploadWorkflow', 'DeleteConfirmation')
   * @param agentsInvoked - Array of agent names invoked during workflow
   * @param validationResults - Array of validation results from all agents
   * @param context - Workflow context (country, domain, optional documentId)
   * @returns Promise that resolves when log entry is written
   *
   * @example
   * ```typescript
   * await TaxonomyValidator.writeWorkflowLog(
   *   'UploadWorkflow',
   *   ['Records Keeper', 'Sensitivity Scanner'],
   *   [validation1, validation2],
   *   { country: 'Australia', domain: 'household', documentId: 1234 }
   * );
   * ```
   */
  static async writeWorkflowLog(
    workflowName: string,
    agentsInvoked: string[],
    validationResults: ValidationResult[],
    context: {
      country: string;
      domain: Domain;
      documentId?: number;
    }
  ): Promise<void> {
    const paiDir = process.env.PAI_DIR || process.env.HOME + '/.claude';
    const logDir = path.join(paiDir, 'MEMORY', 'RECORDSMANAGER');
    const logFile = path.join(logDir, 'workflow-executions.jsonl');

    // Create directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      workflow: workflowName,
      agentsInvoked,
      validationResults: validationResults.map(v => ({
        valid: v.valid,
        errorCount: v.errors.length,
        errors: v.errors,
      })),
      country: context.country,
      domain: context.domain,
      documentId: context.documentId,
    };

    // Append as JSONL
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}
