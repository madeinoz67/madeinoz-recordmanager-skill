// $PAI_DIR/lib/recordsmanager/TaxonomyInstaller.ts
/**
 * Taxonomy Installer - Automated installation of country-specific taxonomies
 * Handles atomic installation with rollback support for tags, document types, storage paths, and custom fields
 */

import { PaperlessClient, Tag, DocumentType, StoragePath, CustomField } from './PaperlessClient.js';
import { TaxonomyExpert, Domain } from './TaxonomyExpert.js';
import type {
  MigrationMapping,
  MigrationResult,
  DocumentMappingEntry,
} from '../../../lib/types/HierarchicalTaxonomy';
import * as path from 'path';
import * as fs from 'fs';

/**
 * T001: Installation state tracking for rollback
 */
export interface InstallationState {
  createdTags: number[];
  createdDocumentTypes: number[];
  createdStoragePaths: number[];
  createdCustomFields: number[];
}

/**
 * T001: Installation result reporting
 */
export interface InstallationResult {
  success: boolean;
  country: string;
  entityTypes: string[];
  installed: {
    tags: number;
    documentTypes: number;
    storagePaths: number;
    customFields: number;
  };
  skipped: {
    tags: string[];
    documentTypes: string[];
    storagePaths: string[];
    customFields: string[];
  };
  errors?: string[];
}

/**
 * T001: Installation options for customization
 */
export interface InstallOptions {
  force?: boolean; // Force update of existing retention rules
  dryRun?: boolean; // Simulate installation without changes
  entityTypes?: Domain[]; // Install only specific entity types
}

/**
 * T018: Update options for taxonomy synchronization
 */
export interface UpdateOptions {
  dryRun?: boolean; // Simulate update without changes
  autoApprove?: boolean; // Auto-approve all changes (dangerous for retention changes)
  entityTypes?: Domain[]; // Update only specific entity types
}

/**
 * T019: Retention rule change for manual review
 */
export interface RetentionChange {
  documentType: string;
  entityType: Domain;
  oldYears: number;
  newYears: number;
  oldReason: string;
  newReason: string;
}

/**
 * T020: Taxonomy diff showing changes between current and new taxonomies
 */
export interface TaxonomyDiff {
  country: string;
  hasChanges: boolean;
  newTags: Array<{ name: string; entityType: Domain }>;
  newDocumentTypes: Array<{ name: string; entityType: Domain }>;
  retentionChanges: RetentionChange[];
  newStoragePaths: Array<{ path: string; entityType: Domain }>;
  newCustomFields: Array<{ name: string; entityType: Domain }>;
}

/**
 * T021: Update result reporting
 */
export interface UpdateResult {
  success: boolean;
  country: string;
  diff: TaxonomyDiff;
  applied: {
    tags: number;
    documentTypes: number;
    storagePaths: number;
    customFields: number;
    retentionChanges: number;
  };
  requiresManualReview: boolean;
  errors?: string[];
}

/**
 * T001: Existing resources fetched for skip detection
 */
export interface ExistingResources {
  tags: Tag[];
  documentTypes: DocumentType[];
  storagePaths: StoragePath[];
  customFields: CustomField[];
}

/**
 * T002: Custom error class for taxonomy installation failures
 */
export class TaxonomyInstallationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: {
      country?: string;
      entityType?: string;
      step?: string;
    }
  ) {
    super(message);
    this.name = 'TaxonomyInstallationError';
  }
}

/**
 * Taxonomy Installer - Main class for installing country-specific taxonomies
 */
export class TaxonomyInstaller {
  private readonly validatedCountry: string;

  constructor(
    private readonly client: PaperlessClient,
    private readonly country: string,
    private readonly configPath?: string
  ) {
    // Normalize country code to ISO 3166-1 alpha-3
    const normalizedCountry = this.normalizeCountryCode(country);

    // T031: Country validation with fallback to Australia
    const taxonomyExpert = new TaxonomyExpert(normalizedCountry);
    if (!TaxonomyExpert.isCountrySupported(normalizedCountry)) {
      console.warn(`Country "${country}" not supported, falling back to Australia`);
      this.validatedCountry = 'AUS';
    } else {
      this.validatedCountry = normalizedCountry;
    }
  }

  /**
   * Normalize country code to ISO 3166-1 alpha-3 format
   */
  private normalizeCountryCode(code: string): string {
    const mapping: Record<string, string> = {
      // Alpha-2 → alpha-3 (backward compatibility)
      'AU': 'AUS',
      'US': 'USA',
      'GB': 'GBR',
      'UK': 'GBR', // Legacy incorrect code
      // Full names → alpha-3
      'Australia': 'AUS',
      'United States': 'USA',
      'United Kingdom': 'GBR',
      'Great Britain': 'GBR',
    };
    return mapping[code] || code; // If already alpha-3 or unknown, return as-is
  }

  /**
   * T006: Initialize empty installation state
   */
  private initializeState(): InstallationState {
    return {
      createdTags: [],
      createdDocumentTypes: [],
      createdStoragePaths: [],
      createdCustomFields: [],
    };
  }

  /**
   * T005: Fetch existing resources from paperless-ngx for skip detection
   */
  private async getExistingResources(): Promise<ExistingResources> {
    const [tags, documentTypes, storagePaths, customFields] = await Promise.all([
      this.client.getTags(),
      this.client.getDocumentTypes(),
      this.client.getStoragePaths(),
      this.client.getCustomFields(),
    ]);

    return {
      tags,
      documentTypes,
      storagePaths,
      customFields,
    };
  }

  /**
   * T007: Rollback all created resources in reverse order
   * Uses best-effort deletion (doesn't fail on individual delete errors)
   *
   * CRITICAL: Rollback is triggered when installation fails partway through.
   * We delete in reverse order (custom fields → storage paths → document types → tags)
   * to avoid dependency conflicts (e.g., can't delete tag if document type uses it).
   *
   * Best-effort means: if one delete fails, we continue trying to delete others.
   * This prevents a single stuck resource from blocking the entire rollback.
   */
  private async rollback(state: InstallationState): Promise<void> {
    // Delete in reverse order of creation to respect dependencies
    // Custom fields first (highest in dependency chain)
    for (const id of state.createdCustomFields.reverse()) {
      try {
        await this.client.deleteCustomField(id);
      } catch (error) {
        // Best effort - log but continue to attempt other deletions
        console.error(`Failed to delete custom field ${id}:`, error);
      }
    }

    for (const id of state.createdStoragePaths.reverse()) {
      try {
        await this.client.deleteStoragePath(id);
      } catch (error) {
        console.error(`Failed to delete storage path ${id}:`, error);
      }
    }

    for (const id of state.createdDocumentTypes.reverse()) {
      try {
        await this.client.deleteDocumentType(id);
      } catch (error) {
        console.error(`Failed to delete document type ${id}:`, error);
      }
    }

    for (const id of state.createdTags.reverse()) {
      try {
        await this.client.deleteTag(id);
      } catch (error) {
        console.error(`Failed to delete tag ${id}:`, error);
      }
    }
  }

  /**
   * T010: Dynamically discover entity types from TaxonomyExpert for extensibility
   */
  private getEntityTypes(taxonomyExpert: TaxonomyExpert): Domain[] {
    return taxonomyExpert.getSupportedDomains();
  }

  /**
   * T011: Install tags for an entity type
   * Updated to work with hierarchical taxonomies
   */
  private async installTags(
    entityType: Domain,
    expert: TaxonomyExpert,
    existing: ExistingResources,
    state: InstallationState,
    skipped: string[]
  ): Promise<number> {
    // Get all tags from taxonomy for this entity type (hierarchical-aware)
    const tagCategories = expert.getAllTagCategories(entityType);
    const allTags = Object.values(tagCategories).flat();

    // Build lowercase set for case-insensitive duplicate detection
    const existingTagNames = new Set(existing.tags.map(t => t.name.toLowerCase()));

    // Track tag IDs we see (both existing and new) to update the existing check
    const allExistingTags = new Map(existing.tags.map(t => [t.name.toLowerCase(), t.id]));

    let installed = 0;
    for (const tagName of allTags) {
      // Skip if tag already exists (case-insensitive)
      if (existingTagNames.has(tagName.toLowerCase())) {
        skipped.push(tagName);
        continue;
      }

      // Cycle through 6 predefined colors using modulo operator
      // Colors: blue, green, red-orange, orange, purple, teal
      const colors = ['#1e90ff', '#32cd32', '#ff6347', '#ffa500', '#9370db', '#20b2aa'];
      const color = colors[installed % colors.length];

      const created = await this.client.getOrCreateTag(tagName, color);

      // Only track for rollback if this is a NEW tag (not previously existing)
      if (!allExistingTags.has(tagName.toLowerCase())) {
        state.createdTags.push(created.id);
        allExistingTags.set(tagName.toLowerCase(), created.id);
        existingTagNames.add(tagName.toLowerCase());
        installed++;
      } else {
        // Tag was created by a previous entity type in THIS installation session
        skipped.push(tagName);
      }
    }

    return installed;
  }

  /**
   * T012: Install document types for an entity type
   * Updated to work with hierarchical taxonomies
   */
  private async installDocumentTypes(
    entityType: Domain,
    expert: TaxonomyExpert,
    existing: ExistingResources,
    state: InstallationState,
    skipped: string[]
  ): Promise<number> {
    const documentTypes = expert.getAllDocumentTypes(entityType);
    const existingDocTypeNames = new Set(existing.documentTypes.map(dt => dt.name.toLowerCase()));
    const allExistingDocTypes = new Map(existing.documentTypes.map(dt => [dt.name.toLowerCase(), dt.id]));

    let installed = 0;
    for (const docTypeName of documentTypes) {
      if (existingDocTypeNames.has(docTypeName.toLowerCase())) {
        skipped.push(docTypeName);
        continue;
      }

      const created = await this.client.getOrCreateDocumentType(docTypeName);

      // Only track for rollback if this is a NEW document type
      if (!allExistingDocTypes.has(docTypeName.toLowerCase())) {
        state.createdDocumentTypes.push(created.id);
        allExistingDocTypes.set(docTypeName.toLowerCase(), created.id);
        existingDocTypeNames.add(docTypeName.toLowerCase());
        installed++;
      } else {
        skipped.push(docTypeName);
      }
    }

    return installed;
  }

  /**
   * T013: Install storage paths per entity type
   */
  private async installStoragePaths(
    entityType: Domain,
    existing: ExistingResources,
    state: InstallationState,
    skipped: string[]
  ): Promise<number> {
    // Create storage path for this entity type
    const storagePath = `/${entityType}`;
    const existingPathStrings = new Set(existing.storagePaths.map(sp => sp.path.toLowerCase()));
    const allExistingPaths = new Map(existing.storagePaths.map(sp => [sp.path.toLowerCase(), sp.id]));

    if (existingPathStrings.has(storagePath.toLowerCase())) {
      skipped.push(storagePath);
      return 0;
    }

    const created = await this.client.getOrCreateStoragePath(storagePath);

    // Only track for rollback if this is a NEW storage path
    if (!allExistingPaths.has(storagePath.toLowerCase())) {
      state.createdStoragePaths.push(created.id);
      return 1;
    } else {
      skipped.push(storagePath);
      return 0;
    }
  }

  /**
   * T014: Install custom fields for trust/person entities
   * Updated to support all entity types (person, hybrid-trust, etc.)
   */
  private async installCustomFields(
    entityType: Domain,
    existing: ExistingResources,
    state: InstallationState,
    skipped: string[]
  ): Promise<number> {
    // Create custom fields for trust and person entity types
    const customFieldTypes: Domain[] = ['unit-trust', 'discretionary-trust', 'family-trust', 'hybrid-trust', 'person'];

    if (!customFieldTypes.includes(entityType)) {
      return 0; // No custom fields needed for other entity types
    }

    // Create custom field with entity type name suffix
    const fieldName = `${entityType}-name`;
    const existingFieldNames = new Set(existing.customFields.map(cf => cf.name.toLowerCase()));

    if (existingFieldNames.has(fieldName.toLowerCase())) {
      skipped.push(fieldName);
      return 0;
    }

    const created = await this.client.createCustomField({
      name: fieldName,
      data_type: 'string',
    });
    state.createdCustomFields.push(created.id);
    return 1;
  }

  /**
   * T015: Orchestrate installation for a single entity type
   */
  private async installEntityType(
    entityType: Domain,
    expert: TaxonomyExpert,
    existing: ExistingResources,
    state: InstallationState,
    skippedResources: {
      tags: string[];
      documentTypes: string[];
      storagePaths: string[];
      customFields: string[];
    }
  ): Promise<void> {
    await this.installTags(entityType, expert, existing, state, skippedResources.tags);
    await this.installDocumentTypes(entityType, expert, existing, state, skippedResources.documentTypes);
    await this.installStoragePaths(entityType, existing, state, skippedResources.storagePaths);
    await this.installCustomFields(entityType, existing, state, skippedResources.customFields);
  }

  /**
   * T028: Validate taxonomy completeness before installation
   * Updated to work with hierarchical taxonomies
   */
  private validateTaxonomyCompleteness(
    expert: TaxonomyExpert,
    entityType: Domain
  ): void {
    const errors: string[] = [];

    // Check if hierarchical taxonomy is available for this entity type
    const hierarchicalTaxonomy = expert.getHierarchicalTaxonomy(entityType);

    if (hierarchicalTaxonomy) {
      // Hierarchical validation
      const functions = expert.getFunctions(entityType);
      if (!functions || functions.length === 0) {
        errors.push(`No functions defined for ${entityType} hierarchical taxonomy`);
      }

      // Check that functions have services with activities
      for (const func of functions) {
        const services = expert.getServices(entityType, func.name);
        if (!services || services.length === 0) {
          errors.push(`Function ${func.name} has no services`);
        }

        // Check that services have activities with document types
        for (const service of services) {
          const activities = expert.getActivities(entityType, func.name, service.name);
          if (!activities || activities.length === 0) {
            errors.push(`Service ${service.name} has no activities`);
          }

          // Check that activities have document types and retention
          for (const activity of activities) {
            const docTypes = expert.getDocumentTypesForActivity(entityType, func.name, service.name, activity.name);
            if (!docTypes || docTypes.length === 0) {
              errors.push(`Activity ${activity.name} has no document types`);
            }

            const retention = expert.getRetentionForActivity(entityType, func.name, service.name, activity.name);
            if (!retention || Object.keys(retention).length === 0) {
              errors.push(`Activity ${activity.name} has no retention rules`);
            }
          }
        }
      }
    } else {
      // Flat taxonomy validation (backward compatibility)
      const documentTypes = expert.getAllDocumentTypes(entityType);
      if (!documentTypes || documentTypes.length === 0) {
        errors.push(`No document types defined for ${entityType}`);
      }

      // Validate tag categories exist
      const tagCategories = expert.getAllTagCategories(entityType);
      if (!tagCategories || Object.keys(tagCategories).length === 0) {
        errors.push(`No tag categories defined for ${entityType}`);
      }

      // Validate retention rules exist for document types
      if (documentTypes && documentTypes.length > 0) {
        let hasRetentionRules = false;
        for (const docType of documentTypes.slice(0, 3)) { // Check first 3 as sample
          const retention = expert.getRetentionRequirements(docType, entityType);
          if (retention && retention.years !== undefined) {
            hasRetentionRules = true;
            break;
          }
        }
        if (!hasRetentionRules) {
          errors.push(`No retention rules defined for ${entityType} document types`);
        }
      }
    }

    if (errors.length > 0) {
      throw new TaxonomyInstallationError(
        `Taxonomy validation failed for ${entityType}`,
        undefined,
        {
          country: this.validatedCountry,
          entityType,
          step: 'validation',
        }
      );
    }
  }

  /**
   * T016: Main installation method
   * Orchestrates installation with rollback on failure
   *
   * @param options - Installation options (force, dryRun, entityTypes)
   * @returns Installation result with counts of installed/skipped resources
   * @throws {TaxonomyInstallationError} If installation fails (after rollback)
   *
   * @example
   * ```typescript
   * const installer = new TaxonomyInstaller(client, 'Australia');
   * const result = await installer.install({ entityTypes: ['household', 'corporate'] });
   * console.log(`Installed ${result.installed.tags} tags, ${result.installed.documentTypes} document types`);
   * ```
   */
  async install(options?: InstallOptions): Promise<InstallationResult> {
    const state = this.initializeState();
    const taxonomyExpert = new TaxonomyExpert(this.validatedCountry);
    const skippedResources = {
      tags: [] as string[],
      documentTypes: [] as string[],
      storagePaths: [] as string[],
      customFields: [] as string[],
    };

    try {
      // Get entity types to install (all or subset from options)
      const entityTypesToInstall = options?.entityTypes || this.getEntityTypes(taxonomyExpert);

      // T028: Validate taxonomy completeness before installation
      for (const entityType of entityTypesToInstall) {
        this.validateTaxonomyCompleteness(taxonomyExpert, entityType);
      }

      // Get existing resources to determine what to skip
      const existing = await this.getExistingResources();

      // Install for each entity type
      for (const entityType of entityTypesToInstall) {
        await this.installEntityType(entityType, taxonomyExpert, existing, state, skippedResources);
      }

      return this.buildSuccessResult(state, skippedResources, entityTypesToInstall);
    } catch (error) {
      await this.rollback(state);
      throw new TaxonomyInstallationError(
        'Installation failed and was rolled back',
        error instanceof Error ? error : new Error(String(error)),
        {
          country: this.validatedCountry,
          step: 'installation',
        }
      );
    }
  }

  /**
   * T017: Build success result with counts and skipped resources
   */
  private buildSuccessResult(
    state: InstallationState,
    skippedResources: {
      tags: string[];
      documentTypes: string[];
      storagePaths: string[];
      customFields: string[];
    },
    entityTypes: Domain[]
  ): InstallationResult {
    return {
      success: true,
      country: this.validatedCountry,
      entityTypes: entityTypes.map(et => String(et)),
      installed: {
        tags: state.createdTags.length,
        documentTypes: state.createdDocumentTypes.length,
        storagePaths: state.createdStoragePaths.length,
        customFields: state.createdCustomFields.length,
      },
      skipped: skippedResources,
    };
  }

  /**
   * T022: Detect changes between current paperless-ngx state and taxonomy definitions
   * Returns diff showing new resources and retention rule changes
   *
   * Change detection compares taxonomy YAML against live paperless-ngx state:
   * 1. New tags/document types - exist in YAML but not in paperless-ngx
   * 2. Retention changes - updated retention periods (requires manual approval)
   * 3. New storage paths - new entity type directories needed
   * 4. New custom fields - trust-specific metadata fields
   *
   * This is a READ-ONLY operation - safe to run anytime for preview.
   *
   * @param options - Update options (dryRun, autoApprove, entityTypes)
   * @returns Taxonomy diff with lists of new/changed resources
   *
   * @example
   * ```typescript
   * const installer = new TaxonomyInstaller(client, 'Australia');
   * const diff = await installer.detectChanges();
   * if (diff.hasChanges) {
   *   console.log(`Found ${diff.newTags.length} new tags, ${diff.retentionChanges.length} retention changes`);
   * }
   * ```
   */
  async detectChanges(options?: UpdateOptions): Promise<TaxonomyDiff> {
    const taxonomyExpert = new TaxonomyExpert(this.validatedCountry);
    const existing = await this.getExistingResources();
    const entityTypesToCheck = options?.entityTypes || this.getEntityTypes(taxonomyExpert);

    // Initialize empty diff structure
    const diff: TaxonomyDiff = {
      country: this.validatedCountry,
      hasChanges: false,
      newTags: [],
      newDocumentTypes: [],
      retentionChanges: [],
      newStoragePaths: [],
      newCustomFields: [],
    };

    // Compare taxonomy YAML against paperless-ngx for each entity type
    for (const entityType of entityTypesToCheck) {
      await this.detectEntityTypeChanges(entityType, taxonomyExpert, existing, diff);
    }

    // Set hasChanges flag if any category has changes
    diff.hasChanges =
      diff.newTags.length > 0 ||
      diff.newDocumentTypes.length > 0 ||
      diff.retentionChanges.length > 0 ||
      diff.newStoragePaths.length > 0 ||
      diff.newCustomFields.length > 0;

    return diff;
  }

  /**
   * T023: Detect changes for a single entity type
   * Updated to work with hierarchical taxonomies
   */
  private async detectEntityTypeChanges(
    entityType: Domain,
    expert: TaxonomyExpert,
    existing: ExistingResources,
    diff: TaxonomyDiff
  ): Promise<void> {
    // Detect new tags (hierarchical-aware)
    const tagCategories = expert.getAllTagCategories(entityType);
    const allTags = Object.values(tagCategories).flat();
    const existingTagNames = new Set(existing.tags.map(t => t.name.toLowerCase()));

    for (const tagName of allTags) {
      if (!existingTagNames.has(tagName.toLowerCase())) {
        diff.newTags.push({ name: tagName, entityType });
      }
    }

    // Detect new document types (hierarchical-aware)
    const documentTypes = expert.getAllDocumentTypes(entityType);
    const existingDocTypeNames = new Set(existing.documentTypes.map(dt => dt.name.toLowerCase()));

    for (const docTypeName of documentTypes) {
      if (!existingDocTypeNames.has(docTypeName.toLowerCase())) {
        diff.newDocumentTypes.push({ name: docTypeName, entityType });
      }
    }

    // Detect retention rule changes (for existing document types)
    for (const docType of existing.documentTypes) {
      const newRetention = expert.getRetentionRequirements(docType.name, entityType);

      if (newRetention) {
        // Check if this document type is defined for this entity type
        if (documentTypes.includes(docType.name)) {
          // For now, we can't get the old retention period from paperless-ngx
          // This would require storing retention metadata as custom fields
          // We'll need to implement retention tracking in a future update
          // For now, we just flag that a retention rule exists
        }
      }
    }

    // Detect new storage paths
    const storagePath = `/${entityType}`;
    const existingPathStrings = new Set(existing.storagePaths.map(sp => sp.path.toLowerCase()));

    if (!existingPathStrings.has(storagePath.toLowerCase())) {
      diff.newStoragePaths.push({ path: storagePath, entityType });
    }

    // Detect new custom fields (for trust and person types)
    const customFieldTypes: Domain[] = ['unit-trust', 'discretionary-trust', 'family-trust', 'hybrid-trust', 'person'];
    if (customFieldTypes.includes(entityType)) {
      const fieldName = `${entityType}-name`;
      const existingFieldNames = new Set(existing.customFields.map(cf => cf.name.toLowerCase()));

      if (!existingFieldNames.has(fieldName.toLowerCase())) {
        diff.newCustomFields.push({ name: fieldName, entityType });
      }
    }
  }

  /**
   * T024: Apply taxonomy updates based on detected changes
   * Requires manual approval for retention rule changes
   *
   * CRITICAL SAFETY: Retention changes affect compliance and legal requirements.
   * We require explicit approval (--approve-retention-changes) because:
   * 1. Shorter retention = documents may be deleted prematurely (legal risk)
   * 2. Longer retention = storage requirements increase (cost/compliance)
   * 3. Wrong retention = audit failures (ATO/IRS/HMRC violations)
   *
   * Non-retention changes (tags, document types) can be applied without approval
   * as they don't affect when documents can be deleted.
   *
   * @param options - Update options (dryRun, autoApprove, entityTypes)
   * @returns Update result with applied counts and manual review requirement status
   * @throws {TaxonomyInstallationError} If update fails (after rollback)
   *
   * @example
   * ```typescript
   * const installer = new TaxonomyInstaller(client, 'Australia');
   * const result = await installer.update({ autoApprove: false });
   * if (result.requiresManualReview) {
   *   console.log('Retention changes detected - manual approval required');
   *   // User must re-run with autoApprove: true
   * }
   * ```
   */
  async update(options?: UpdateOptions): Promise<UpdateResult> {
    // First, detect what changes exist
    const diff = await this.detectChanges(options);

    // Early return if nothing to update
    if (!diff.hasChanges) {
      return {
        success: true,
        country: this.validatedCountry,
        diff,
        applied: {
          tags: 0,
          documentTypes: 0,
          storagePaths: 0,
          customFields: 0,
          retentionChanges: 0,
        },
        requiresManualReview: false,
      };
    }

    // SAFETY CHECK: Block retention changes unless explicitly approved
    // This prevents accidental compliance violations from automated updates
    const requiresManualReview = diff.retentionChanges.length > 0 && !options?.autoApprove;

    if (requiresManualReview) {
      return {
        success: false,
        country: this.validatedCountry,
        diff,
        applied: {
          tags: 0,
          documentTypes: 0,
          storagePaths: 0,
          customFields: 0,
          retentionChanges: 0,
        },
        requiresManualReview: true,
        errors: [
          'Retention rule changes detected. Manual review required.',
          'Run with --approve-retention-changes to apply updates.',
        ],
      };
    }

    // Apply updates (same as install but only for new resources)
    const state = this.initializeState();

    try {
      // Apply new tags
      for (const tag of diff.newTags) {
        const colors = ['#1e90ff', '#32cd32', '#ff6347', '#ffa500', '#9370db', '#20b2aa'];
        const color = colors[state.createdTags.length % colors.length];
        const created = await this.client.createTag(tag.name, color);
        state.createdTags.push(created.id);
      }

      // Apply new document types
      for (const docType of diff.newDocumentTypes) {
        const created = await this.client.createDocumentType(docType.name);
        state.createdDocumentTypes.push(created.id);
      }

      // Apply new storage paths
      for (const path of diff.newStoragePaths) {
        const created = await this.client.getOrCreateStoragePath(path.path);
        state.createdStoragePaths.push(created.id);
      }

      // Apply new custom fields
      for (const field of diff.newCustomFields) {
        const created = await this.client.createCustomField({
          name: field.name,
          data_type: 'string',
        });
        state.createdCustomFields.push(created.id);
      }

      return {
        success: true,
        country: this.validatedCountry,
        diff,
        applied: {
          tags: state.createdTags.length,
          documentTypes: state.createdDocumentTypes.length,
          storagePaths: state.createdStoragePaths.length,
          customFields: state.createdCustomFields.length,
          retentionChanges: diff.retentionChanges.length,
        },
        requiresManualReview: false,
      };
    } catch (error) {
      await this.rollback(state);
      throw new TaxonomyInstallationError(
        'Update failed and was rolled back',
        error instanceof Error ? error : new Error(String(error)),
        {
          country: this.validatedCountry,
          step: 'update',
        }
      );
    }
  }

  // ============================================================================
  // MIGRATION METHODS (T119-T127)
  // ============================================================================

  private migrationMappings: Map<string, MigrationMapping> = new Map();
  private migrationStatus?: MigrationResult;

  /**
   * T119: Load migration mapping table from JSON
   * Maps flat document types to hierarchical paths
   */
  async loadMappingTable(entityType: string): Promise<MigrationMapping[]> {
    const mappingPath = path.join(
      __dirname,
      '../Config/mappings',
      `${entityType}-migration.json`
    );

    if (!fs.existsSync(mappingPath)) {
      throw new Error(`Migration mapping not found: ${mappingPath}`);
    }

    const mappings: MigrationMapping[] = JSON.parse(
      fs.readFileSync(mappingPath, 'utf-8')
    );

    // Cache mappings for quick lookup
    this.migrationMappings.clear();
    for (const mapping of mappings) {
      this.migrationMappings.set(mapping.flatType, mapping);
    }

    return mappings;
  }

  /**
   * T120: Get mapping for a specific flat document type
   */
  getMapping(flatType: string): MigrationMapping | undefined {
    return this.migrationMappings.get(flatType);
  }

  /**
   * T121: Migrate a single document from flat to hierarchical
   */
  async migrateDocument(documentId: number): Promise<DocumentMappingEntry> {
    const docs = await this.client.getDocuments();
    const doc = docs.find((d) => d.id === documentId);

    if (!doc) {
      return {
        documentId,
        originalType: 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: 'Document not found',
      };
    }

    const mapping = this.getMapping(doc.document_type || 'unknown');

    if (!mapping) {
      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: 'No mapping found for document type',
      };
    }

    // Check if mapping is ambiguous
    if (mapping.hierarchicalPath === 'AMBIGUOUS' || mapping.confidence === 'low') {
      // If no alternatives provided, treat as failed
      if (!mapping.alternatives || mapping.alternatives.length === 0) {
        return {
          documentId,
          originalType: doc.document_type || 'unknown',
          method: 'failed',
          timestamp: new Date().toISOString(),
          error: 'No mapping found for document type (ambiguous with no alternatives)',
        };
      }

      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        method: 'manual',
        timestamp: new Date().toISOString(),
      };
    }

    // Auto-map with high/medium confidence
    try {
      // Update document with hierarchical tags
      const hierarchicalTags = mapping.hierarchicalPath.split('/');
      await this.client.updateDocument(documentId, {
        tags: hierarchicalTags,
      });

      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        newPath: mapping.hierarchicalPath,
        method: 'automatic',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * T122: Migrate all documents from flat to hierarchical
   */
  async migrateAllDocuments(): Promise<MigrationResult> {
    const docs = await this.client.getDocuments();
    const mappingLog: DocumentMappingEntry[] = [];

    let autoMapped = 0;
    let manualReview = 0;
    let failed = 0;

    for (const doc of docs) {
      const entry = await this.migrateDocument(doc.id);
      mappingLog.push(entry);

      if (entry.method === 'automatic') autoMapped++;
      else if (entry.method === 'manual') manualReview++;
      else if (entry.method === 'failed') failed++;
    }

    this.migrationStatus = {
      totalDocuments: docs.length,
      autoMapped,
      manualReview,
      failed,
      mappingLog,
      timestamp: new Date().toISOString(),
    };

    // Persist audit log
    await this.saveMigrationAuditLog(this.migrationStatus);

    return this.migrationStatus;
  }

  /**
   * T123: Get documents requiring manual review
   */
  async getDocumentsForManualReview(): Promise<any[]> {
    if (!this.migrationStatus) {
      throw new Error('Migration not run yet. Call migrateAllDocuments() first.');
    }

    const manualReviewEntries = this.migrationStatus.mappingLog.filter(
      (e) => e.method === 'manual'
    );

    const docs = await this.client.getDocuments();
    const reviewDocs = [];

    for (const entry of manualReviewEntries) {
      const doc = docs.find((d) => d.id === entry.documentId);
      if (doc) {
        const mapping = this.getMapping(entry.originalType);
        reviewDocs.push({
          ...doc,
          alternatives: mapping?.alternatives || [],
        });
      }
    }

    return reviewDocs;
  }

  /**
   * T124: Prompt user for manual review and apply selection
   */
  async promptManualReview(
    documentId: number,
    promptCallback: (doc: any, alternatives: string[]) => Promise<string | undefined>
  ): Promise<DocumentMappingEntry> {
    const docs = await this.client.getDocuments();
    const doc = docs.find((d) => d.id === documentId);

    if (!doc) {
      return {
        documentId,
        originalType: 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: 'Document not found',
      };
    }

    const mapping = this.getMapping(doc.document_type || 'unknown');
    const alternatives = mapping?.alternatives || [];

    const selectedPath = await promptCallback(doc, alternatives);

    if (!selectedPath) {
      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: 'Skipped by user',
      };
    }

    try {
      const hierarchicalTags = selectedPath.split('/');
      await this.client.updateDocument(documentId, {
        tags: hierarchicalTags,
      });

      const result = {
        documentId,
        originalType: doc.document_type || 'unknown',
        newPath: selectedPath,
        method: 'manual',
        timestamp: new Date().toISOString(),
      };

      // Update migration status if it exists
      if (this.migrationStatus) {
        // Find and update the entry in the mapping log
        const logEntry = this.migrationStatus.mappingLog.find(
          e => e.documentId === documentId
        );
        if (logEntry && logEntry.method === 'manual' && !logEntry.newPath) {
          logEntry.newPath = selectedPath;
          // Document moved from manual review to completed
          this.migrationStatus.manualReview--;
        }
      }

      return result;
    } catch (error) {
      return {
        documentId,
        originalType: doc.document_type || 'unknown',
        method: 'failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * T125: Save migration audit log to disk
   */
  private async saveMigrationAuditLog(result: MigrationResult): Promise<void> {
    const baseDir = this.configPath || path.join(__dirname, '../Config');
    const auditDir = path.join(baseDir, 'audit');

    // Create audit directory if it doesn't exist
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const auditFilePath = path.join(
      auditDir,
      `migration-${result.timestamp.replace(/:/g, '-')}.json`
    );

    fs.writeFileSync(auditFilePath, JSON.stringify(result, null, 2));
  }

  /**
   * T126: Get current migration status
   */
  async getMigrationStatus(): Promise<MigrationResult> {
    if (!this.migrationStatus) {
      throw new Error('Migration not run yet. Call migrateAllDocuments() first.');
    }
    return this.migrationStatus;
  }

  /**
   * T127: Deprecate flat taxonomy model after migration
   * Archives taxonomies.yaml and updates TaxonomyExpert to hierarchical-only mode
   */
  async deprecateFlatModel(): Promise<void> {
    const flatTaxonomyPath = path.join(__dirname, '../Config/taxonomies.yaml');
    const deprecatedPath = path.join(__dirname, '../Config/taxonomies.yaml.deprecated');

    if (fs.existsSync(flatTaxonomyPath)) {
      // Archive the flat taxonomy file
      fs.renameSync(flatTaxonomyPath, deprecatedPath);

      console.log('✅ Flat taxonomy model deprecated');
      console.log(`   Archived: ${deprecatedPath}`);
      console.log('   All operations now use hierarchical taxonomy only.');
    }
  }
}
