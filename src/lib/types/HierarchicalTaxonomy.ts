/**
 * Hierarchical Taxonomy Type Definitions
 *
 * Type-safe interfaces for the hierarchical Function → Service → Activity → Document Types
 * taxonomy model that extends beyond compliance-focused flat document types.
 *
 * @see specs/003-default-taxonomies/contracts/taxonomy-api.ts
 * @see specs/003-default-taxonomies/data-model.md
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Entity types supported by the system
 */
export type Domain =
  | 'household'
  | 'corporate'
  | 'unit-trust'
  | 'discretionary-trust'
  | 'family-trust'
  | 'hybrid-trust'
  | 'project'
  | 'person';

/**
 * Supported countries with distinct retention rules (ISO 3166-1 alpha-3)
 */
export type Country = 'AUS' | 'USA' | 'GBR';

/**
 * Taxonomy operation mode during transition period
 */
export type TaxonomyMode = 'flat' | 'hierarchical' | 'hybrid';

/**
 * Date from which retention period calculation starts
 */
export type RetentionFromDate = 'creation' | 'fy_end' | 'fte_date' | 'distribution';

/**
 * Mapping confidence level
 */
export type MappingConfidence = 'high' | 'medium' | 'low';

/**
 * Migration method
 */
export type MigrationMethod = 'automatic' | 'manual' | 'failed';

/**
 * Taxonomy data source
 */
export type TaxonomySource = 'default-taxonomy' | 'custom' | 'imported';

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Country-specific retention requirement
 */
export interface RetentionRule {
  /** Retention period in years (0 = permanent) */
  years: number;
  /** Legal authority or regulation */
  authority: string;
  /** Additional context or special rules */
  notes?: string;
  /** Date from which retention period starts (default: 'creation') */
  fromDate?: RetentionFromDate;
}

/**
 * Leaf-level taxonomy category with document types and retention rules
 */
export interface TaxonomyActivity {
  /** Activity name (PascalCase, unique within service) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Document types associated with this activity */
  documentTypes: string[];
  /** Country-specific retention rules */
  retention: Record<Country, RetentionRule>;
  /** Optional icon for UI display */
  icon?: string;
  /** Search keywords for autocomplete */
  keywords?: string[];
}

/**
 * Mid-level taxonomy category representing a service area
 */
export interface TaxonomyService {
  /** Service name (PascalCase, unique within function) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Map of activity names to activity definitions */
  activities: Record<string, TaxonomyActivity>;
  /** Optional icon for UI display */
  icon?: string;
}

/**
 * Top-level taxonomy category representing a major area of activity
 */
export interface TaxonomyFunction {
  /** Function name (PascalCase, unique within taxonomy) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Map of service names to service definitions */
  services: Record<string, TaxonomyService>;
  /** Optional icon for UI display */
  icon?: string;
}

/**
 * Metadata about taxonomy creation and updates
 */
export interface TaxonomyMetadata {
  /** When taxonomy was created (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
  /** Creator (system or user identifier) */
  createdBy: string;
  /** Source of taxonomy data */
  source: TaxonomySource;
  /** Content hash for integrity validation (SHA-256) */
  checksum?: string;
}

/**
 * Root entity representing complete hierarchical taxonomy for an entity type
 */
export interface HierarchicalTaxonomy {
  /** Entity type this taxonomy applies to */
  entityType: Domain;
  /** Country for retention rules (ISO 3166-1 alpha-2) */
  country: Country;
  /** Map of function names to function definitions */
  functions: Record<string, TaxonomyFunction>;
  /** Taxonomy version (semantic version X.Y.Z) */
  version: string;
  /** Metadata about taxonomy creation and updates */
  metadata: TaxonomyMetadata;
}

// ============================================================================
// Navigation and Path Entities
// ============================================================================

/**
 * Complete navigation path through the hierarchy
 */
export interface TaxonomyPath {
  /** Function name */
  function: string;
  /** Service name */
  service: string;
  /** Activity name */
  activity: string;
  /** Complete slash-delimited path (Function/Service/Activity) */
  fullPath: string;
}

/**
 * Navigation breadcrumb for CLI display
 */
export interface NavigationBreadcrumb {
  /** Current function (null if at root) */
  function: string | null;
  /** Current service (null if function not selected) */
  service: string | null;
  /** Current activity (null if service not selected) */
  activity: string | null;
  /** Formatted breadcrumb string (e.g., "Health → Medical → [Select Activity]") */
  display: string;
}

/**
 * Autocomplete suggestion with ranking
 */
export interface AutocompleteSuggestion {
  /** Full path or component name */
  value: string;
  /** Display text for user */
  display: string;
  /** Match quality score (0-1, higher is better) */
  score: number;
  /** Match type for ranking */
  matchType: 'exact' | 'prefix' | 'abbreviated' | 'fuzzy';
}

// ============================================================================
// Migration Entities
// ============================================================================

/**
 * Mapping from flat document type to hierarchical path
 */
export interface MigrationMapping {
  /** Original flat document type name */
  flatType: string;
  /** Target hierarchical path or "AMBIGUOUS" */
  hierarchicalPath: string;
  /** Confidence level of mapping */
  confidence: MappingConfidence;
  /** Reason for mapping decision */
  rationale: string;
  /** Alternative paths for ambiguous cases */
  alternatives?: string[];
}

/**
 * Audit trail entry for a single document's migration
 */
export interface DocumentMappingEntry {
  /** Paperless-ngx document ID */
  documentId: number;
  /** Original flat document type */
  originalType: string;
  /** New hierarchical classification (if successful) */
  newPath?: string;
  /** How mapping was performed */
  method: MigrationMethod;
  /** When mapping occurred (ISO 8601) */
  timestamp: string;
  /** Error message if migration failed */
  error?: string;
}

/**
 * Outcome of migrating documents from flat to hierarchical
 */
export interface MigrationResult {
  /** Total documents processed */
  totalDocuments: number;
  /** Documents auto-mapped with high confidence */
  autoMapped: number;
  /** Documents requiring manual review */
  manualReview: number;
  /** Documents that failed migration */
  failed: number;
  /** Detailed log of each document's mapping */
  mappingLog: DocumentMappingEntry[];
  /** When migration was performed (ISO 8601) */
  timestamp: string;
}

// ============================================================================
// Validation Results
// ============================================================================

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** True if validation passed */
  valid: boolean;
  /** Validation errors (if any) */
  errors: string[];
  /** Validation warnings (non-fatal) */
  warnings?: string[];
}

/**
 * Validation API for taxonomy integrity
 */
export interface ValidationAPI {
  /**
   * Validate complete taxonomy structure
   *
   * @param taxonomy - Taxonomy to validate
   * @returns Validation result with errors
   */
  validateTaxonomy(taxonomy: HierarchicalTaxonomy): ValidationResult;

  /**
   * Validate retention rules include taxonomy country
   *
   * @param activity - Activity to validate
   * @param country - Required country
   * @returns Validation result
   */
  validateRetentionRules(
    activity: TaxonomyActivity,
    country: Country
  ): ValidationResult;

  /**
   * Validate migration mapping references valid paths
   *
   * @param mapping - Mapping to validate
   * @param taxonomy - Taxonomy to validate against
   * @returns Validation result
   */
  validateMigrationMapping(
    mapping: MigrationMapping,
    taxonomy: HierarchicalTaxonomy
  ): ValidationResult;

  /**
   * Validate all mappings in a mapping table
   *
   * @param mappings - Array of mappings
   * @param taxonomy - Taxonomy to validate against
   * @returns Validation result with all errors
   */
  validateMappingTable(
    mappings: MigrationMapping[],
    taxonomy: HierarchicalTaxonomy
  ): ValidationResult;
}

// ============================================================================
// Hierarchical Taxonomy API (for TaxonomyExpert extension)
// ============================================================================

/**
 * Extended TaxonomyExpert interface with hierarchical navigation methods
 *
 * These methods will be added to the existing TaxonomyExpert class to support
 * hierarchical taxonomy navigation while maintaining backwards compatibility
 * with flat taxonomy methods.
 */
export interface HierarchicalTaxonomyAPI {
  // ========================================
  // Hierarchy Retrieval
  // ========================================

  /**
   * Get all functions for an entity type
   *
   * @param entityType - The entity type (household, corporate, etc.)
   * @returns Array of function names
   */
  getFunctions(entityType: Domain): string[];

  /**
   * Get all services for a function
   *
   * @param entityType - The entity type
   * @param functionName - The function name
   * @returns Array of service names
   */
  getServices(entityType: Domain, functionName: string): string[];

  /**
   * Get all activities for a service
   *
   * @param entityType - The entity type
   * @param functionName - The function name
   * @param serviceName - The service name
   * @returns Array of activity names
   */
  getActivities(
    entityType: Domain,
    functionName: string,
    serviceName: string
  ): string[];

  /**
   * Get document types for an activity
   *
   * @param entityType - The entity type
   * @param path - Complete path (Function/Service/Activity)
   * @returns Array of document type names
   */
  getDocumentTypesForActivity(entityType: Domain, path: string): string[];

  /**
   * Get retention rules for an activity
   *
   * @param entityType - The entity type
   * @param path - Complete path (Function/Service/Activity)
   * @param country - Country code for retention rules
   * @returns Retention rule for the specified country
   */
  getRetentionForActivity(
    entityType: Domain,
    path: string,
    country: Country
  ): RetentionRule;

  // ========================================
  // Path Validation and Lookup
  // ========================================

  /**
   * Validate a hierarchical path exists in taxonomy
   *
   * @param entityType - The entity type
   * @param path - Path to validate (Function/Service/Activity)
   * @returns True if path exists, false otherwise
   */
  validatePath(entityType: Domain, path: string): boolean;

  /**
   * Parse a path string into components
   *
   * @param path - Path to parse (Function/Service/Activity)
   * @returns TaxonomyPath object or null if invalid format
   */
  parsePath(path: string): TaxonomyPath | null;

  /**
   * Resolve abbreviated or partial path to full path
   *
   * @param entityType - The entity type
   * @param partialPath - Abbreviated path (e.g., "Fin/Tax/Ret")
   * @returns Full path or null if no match
   */
  resolvePath(entityType: Domain, partialPath: string): string | null;

  // ========================================
  // Autocomplete and Search
  // ========================================

  /**
   * Get autocomplete suggestions for partial input
   *
   * @param entityType - The entity type
   * @param input - Partial path or component (e.g., "Health/Med/Doc")
   * @param maxSuggestions - Maximum suggestions to return (default: 10)
   * @returns Array of autocomplete suggestions ranked by relevance
   */
  autocomplete(
    entityType: Domain,
    input: string,
    maxSuggestions?: number
  ): AutocompleteSuggestion[];

  /**
   * Search activities by keyword
   *
   * @param entityType - The entity type
   * @param keyword - Search keyword
   * @returns Array of matching activity paths
   */
  searchByKeyword(entityType: Domain, keyword: string): string[];

  // ========================================
  // Tag Generation
  // ========================================

  /**
   * Generate hierarchical tags for a path
   *
   * @param path - Complete path (Function/Service/Activity)
   * @returns Array of hierarchical tags
   */
  generateHierarchicalTags(path: string): string[];

  /**
   * Generate storage path from hierarchical taxonomy
   *
   * @param entityType - The entity type
   * @param path - Complete path (Function/Service/Activity)
   * @returns Storage path for paperless-ngx
   */
  generateStoragePath(entityType: Domain, path: string): string;

  // ========================================
  // Mode Management
  // ========================================

  /**
   * Get current taxonomy mode (flat, hierarchical, or hybrid)
   *
   * @returns Current taxonomy mode
   */
  getTaxonomyMode(): TaxonomyMode;

  /**
   * Check if hierarchical taxonomy is available for entity type
   *
   * @param entityType - The entity type
   * @returns True if hierarchical taxonomy exists, false otherwise
   */
  isHierarchicalAvailable(entityType: Domain): boolean;
}
