// $PAI_DIR/lib/recordsmanager/TaxonomyExpert.ts
/**
 * Taxonomy Expert - Country-specific record keeping guidelines
 * Provides domain expertise for household, corporate, trust, and project management records
 *
 * Supports both flat (YAML) and hierarchical (JSON) taxonomy modes for backward compatibility
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as url from 'url';
import { HierarchicalTaxonomy, TaxonomyFunction, TaxonomyService, TaxonomyActivity, TaxonomyMode } from '../../types/HierarchicalTaxonomy.js';

// Get the directory of this module using import.meta.url for ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Domain =
  | 'household'
  | 'corporate'
  | 'project'  // Updated from 'projects'
  | 'person'
  | 'unit-trust'
  | 'discretionary-trust'
  | 'family-trust'
  | 'hybrid-trust';  // Added hybrid trust

export interface TaxonomySuggestion {
  tags: string[];
  documentType?: string;
  retentionYears?: number;
  retentionReason?: string;
  notes?: string;
}

export interface CountryGuidelines {
  country: string;
  domains: {
    [key in Domain]?: DomainTaxonomy;
  };
}

export interface DomainTaxonomy {
  documentTypes: string[];
  tagCategories: {
    [category: string]: string[];
  };
  retentionRules: {
    [documentType: string]: {
      years: number;
      reason: string;
    };
  };
}

export interface TaxonomyMetadata {
  version: string;
  lastUpdated: string;
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

export interface TaxonomyData {
  metadata?: TaxonomyMetadata;
  [country: string]: CountryGuidelines | TaxonomyMetadata | undefined;
}

/**
 * Load country-specific taxonomies from YAML config file
 */
function loadTaxonomies(): Record<string, CountryGuidelines> {
  const configPath = path.join(__dirname, '../Config/taxonomies.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const data = yaml.load(fileContents) as TaxonomyData;

  // Extract metadata and remove it from the taxonomies object
  const { metadata, ...taxonomies } = data;

  return taxonomies as Record<string, CountryGuidelines>;
}

/**
 * Load taxonomy metadata from YAML config file
 */
function loadTaxonomyMetadata(): TaxonomyMetadata | null {
  const configPath = path.join(__dirname, '../Config/taxonomies.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const data = yaml.load(fileContents) as TaxonomyData;

  return data.metadata || null;
}

/**
 * Country-specific taxonomies loaded from config
 */
const COUNTRY_TAXONOMIES: Record<string, CountryGuidelines> = loadTaxonomies();

/**
 * Function name to category tag mapping for FSA taxonomy
 * Maps hierarchical Function names to simple category tags for document tagging
 */
const FUNCTION_TO_CATEGORY: Record<string, string> = {
  // Household functions
  'HealthManagement': 'medical',
  'FinancialManagement': 'financial',
  'PropertyManagement': 'property',
  'VehicleManagement': 'vehicle',
  'PetCare': 'pet',
  'Education': 'education',
  'LegalAffairs': 'legal',
  'TaxCompliance': 'tax',
  'EstatePlanning': 'estate',
  'Travel': 'travel',
  'Entertainment': 'entertainment',
  'Insurance': 'insurance',

  // Corporate functions
  'FinanceAccounting': 'financial',
  'HumanResources': 'hr',
  'Operations': 'operations',
  'SalesMarketing': 'sales',
  'ProductDevelopment': 'development',
  'ITTechnology': 'it',
  'LegalCompliance': 'legal',
  'CustomerService': 'customer-service',
  'Procurement': 'financial',
  'QualityAssurance': 'quality',
  'StrategicPlanning': 'strategic'
};

/**
 * Taxonomy Expert Class
 */
export class TaxonomyExpert {
  private country: string;
  private defaultDomain: Domain;
  private taxonomies: Record<string, CountryGuidelines>;
  private hierarchicalTaxonomies: Map<Domain, HierarchicalTaxonomy> = new Map();
  private mode: TaxonomyMode;

  constructor(country: string, defaultDomain: Domain = 'household', mode: TaxonomyMode = 'hierarchical') {
    this.country = country;
    this.defaultDomain = defaultDomain;
    this.taxonomies = COUNTRY_TAXONOMIES;
    this.mode = mode;

    // Load hierarchical taxonomies in hierarchical or hybrid mode
    if (mode === 'hierarchical' || mode === 'hybrid') {
      this.loadHierarchicalTaxonomies();
    }
  }

  /**
   * Load hierarchical taxonomies from JSON files
   * T043: Load hierarchical taxonomy from JSON
   */
  private loadHierarchicalTaxonomies(): void {
    // Path from src/skills/RecordsManager/Lib/TaxonomyExpert.ts to Config/taxonomies/hierarchical/
    // Go up 1 level (Lib -> RecordsManager) then down to Config/taxonomies/hierarchical/
    const taxonomyDir = path.join(__dirname, '../Config/taxonomies/hierarchical');

    if (!fs.existsSync(taxonomyDir)) {
      console.warn(`Hierarchical taxonomy directory not found: ${taxonomyDir}`);
      return;
    }

    const files = fs.readdirSync(taxonomyDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(taxonomyDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const taxonomy = JSON.parse(content) as HierarchicalTaxonomy;

        // Map all formats to ISO 3166-1 alpha-3 codes for matching
        const countryToCode: Record<string, string> = {
          // Full names → alpha-3
          'Australia': 'AUS',
          'United States': 'USA',
          'United Kingdom': 'GBR',
          'Great Britain': 'GBR',
          // Alpha-2 → alpha-3 (backward compatibility)
          'AU': 'AUS',
          'US': 'USA',
          'GB': 'GBR',
          'UK': 'GBR', // Legacy incorrect code
          // Alpha-3 (pass through)
          'AUS': 'AUS',
          'USA': 'USA',
          'GBR': 'GBR',
        };

        // Get the country code for matching
        const countryCode = countryToCode[this.country] || this.country;
        const taxonomyCountryCode = taxonomy.country;

        // Match by code or direct comparison
        if (taxonomyCountryCode === countryCode || taxonomyCountryCode === this.country) {
          this.hierarchicalTaxonomies.set(taxonomy.entityType as Domain, taxonomy);
        }
      } catch (error) {
        console.error(`Failed to load hierarchical taxonomy from ${file}:`, error);
      }
    }
  }

  /**
   * T042: Discover entity types dynamically
   * Returns all available entity types (domains) that have taxonomies loaded for this country.
   * In hierarchical mode, returns entity types from JSON taxonomy files.
   * In flat mode, returns entity types from YAML configuration.
   *
   * @returns Array of supported entity types (domains) such as 'household', 'corporate', 'unit-trust', etc.
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const domains = expert.getSupportedDomains();
   * // Returns: ['household', 'corporate', 'unit-trust', 'discretionary-trust', 'family-trust', 'project', 'person']
   * ```
   */
  getSupportedDomains(): Domain[] {
    // In hierarchical mode, return keys from loaded taxonomies
    if (this.hierarchicalTaxonomies.size > 0) {
      return Array.from(this.hierarchicalTaxonomies.keys());
    }

    // Fall back to flat taxonomy domains
    const countryData = this.taxonomies[this.country];
    if (!countryData) {
      return [];
    }
    return Object.keys(countryData.domains) as Domain[];
  }

  /**
   * Get hierarchical taxonomy for a specific entity type (domain).
   * Returns the complete hierarchical structure including all functions, services, activities, and document types.
   *
   * @param entityType - The entity type (domain) to retrieve, e.g., 'household', 'corporate', 'unit-trust'
   * @returns The hierarchical taxonomy object if available, null if not loaded or unsupported
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const taxonomy = expert.getHierarchicalTaxonomy('household');
   * if (taxonomy) {
   *   console.log(taxonomy.country);  // 'AUS'
   *   console.log(Object.keys(taxonomy.functions));  // ['HealthManagement', 'FinanceManagement', ...]
   * }
   * ```
   */
  getHierarchicalTaxonomy(entityType: Domain): HierarchicalTaxonomy | null {
    return this.hierarchicalTaxonomies.get(entityType) || null;
  }

  /**
   * T083: Get all functions for an entity type
   * Functions are the top level of the hierarchical taxonomy (e.g., HealthManagement, FinanceManagement).
   * This is the first step in navigating the 4-level hierarchy: Function → Service → Activity → DocumentType.
   *
   * @param entityType - The entity type (domain) to query, e.g., 'household', 'corporate'
   * @returns Array of taxonomy functions with their name, description, keywords, and nested services
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const functions = expert.getFunctions('household');
   * functions.forEach(func => {
   *   console.log(func.name);  // 'HealthManagement', 'FinanceManagement', etc.
   *   console.log(func.keywords);  // ['health', 'medical', 'wellness']
   * });
   * ```
   */
  getFunctions(entityType: Domain): TaxonomyFunction[] {
    // Retrieve the hierarchical taxonomy for this entity type
    const taxonomy = this.getHierarchicalTaxonomy(entityType);
    if (!taxonomy) {
      return [];
    }
    // Extract all function objects from the taxonomy
    return Object.values(taxonomy.functions);
  }

  /**
   * T084: Get all services for a function
   * Services are the second level of the hierarchical taxonomy, nested under functions.
   * This is step 2 in navigating the hierarchy: Function → **Service** → Activity → DocumentType.
   *
   * @param entityType - The entity type (domain) to query
   * @param functionName - The parent function name (case-sensitive), e.g., 'HealthManagement'
   * @returns Array of taxonomy services under the specified function, or empty array if function not found
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const services = expert.getServices('household', 'HealthManagement');
   * services.forEach(svc => {
   *   console.log(svc.name);  // 'MedicalCare', 'DentalCare', 'MentalHealthCare'
   *   console.log(svc.keywords);  // ['doctor', 'clinic', 'appointment']
   * });
   * ```
   */
  getServices(entityType: Domain, functionName: string): TaxonomyService[] {
    // Get the hierarchical taxonomy for this entity type
    const taxonomy = this.getHierarchicalTaxonomy(entityType);
    if (!taxonomy) {
      return [];
    }
    // Navigate to the specified function
    const func = taxonomy.functions[functionName];
    // Return all services under this function, or empty array if function doesn't exist
    return func ? Object.values(func.services) : [];
  }

  /**
   * T085: Get all activities for a service
   * Activities are the third level of the hierarchical taxonomy, nested under services.
   * This is step 3 in navigating the hierarchy: Function → Service → **Activity** → DocumentType.
   * Activities contain the actual document types and retention rules.
   *
   * @param entityType - The entity type (domain) to query
   * @param functionName - The parent function name (case-sensitive)
   * @param serviceName - The parent service name (case-sensitive), e.g., 'MedicalCare'
   * @returns Array of taxonomy activities under the specified service, or empty array if not found
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
   * activities.forEach(activity => {
   *   console.log(activity.name);  // 'Consultations', 'Prescriptions', 'TestResults'
   *   console.log(activity.documentTypes);  // ['Medical Receipt', 'Referral Letter']
   *   console.log(activity.retention.AUS);  // { years: 7, authority: 'ATO requirement...' }
   * });
   * ```
   */
  getActivities(entityType: Domain, functionName: string, serviceName: string): TaxonomyActivity[] {
    // Get all services for the specified function
    const services = this.getServices(entityType, functionName);
    // Find the specific service by name
    const service = services.find(s => s.name === serviceName);
    // Return activities for this service, or empty array if service doesn't exist
    return service ? Object.values(service.activities) : [];
  }

  /**
   * T086: Get document types for an activity
   * Document types are the fourth and final level of the hierarchical taxonomy.
   * This is step 4 in navigating the hierarchy: Function → Service → Activity → **DocumentType**.
   *
   * @param entityType - The entity type (domain) to query
   * @param functionName - The parent function name (case-sensitive)
   * @param serviceName - The parent service name (case-sensitive)
   * @param activityName - The parent activity name (case-sensitive), e.g., 'Consultations'
   * @returns Array of document type names for this activity, or empty array if activity not found
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const docTypes = expert.getDocumentTypesForActivity(
   *   'household',
   *   'HealthManagement',
   *   'MedicalCare',
   *   'Consultations'
   * );
   * console.log(docTypes);  // ['Medical Receipt', 'Referral Letter', 'Specialist Referral']
   * ```
   */
  getDocumentTypesForActivity(entityType: Domain, functionName: string, serviceName: string, activityName: string): string[] {
    // Get all activities for the specified service
    const activities = this.getActivities(entityType, functionName, serviceName);
    // Find the specific activity by name
    const activity = activities.find(a => a.name === activityName);
    // Return document types, or empty array if activity doesn't exist
    return activity?.documentTypes || [];
  }

  /**
   * T087: Get retention rules for an activity
   * Retrieves country-specific retention requirements (years to keep, legal authority) for an activity.
   * Retention rules are keyed by country code (AUS, USA, GBR).
   *
   * @param entityType - The entity type (domain) to query
   * @param functionName - The parent function name (case-sensitive)
   * @param serviceName - The parent service name (case-sensitive)
   * @param activityName - The activity name to get retention rules for
   * @returns Retention rules object keyed by country code, or null if activity not found
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const retention = expert.getRetentionForActivity(
   *   'household',
   *   'HealthManagement',
   *   'MedicalCare',
   *   'Consultations'
   * );
   * console.log(retention.AUS);
   * // { years: 7, authority: 'ATO requirement for medical expense substantiation' }
   * console.log(retention.USA);
   * // { years: 6, authority: 'IRS medical deduction records' }
   * ```
   */
  getRetentionForActivity(entityType: Domain, functionName: string, serviceName: string, activityName: string): Record<string, any> | null {
    // Get all activities for the specified service
    const activities = this.getActivities(entityType, functionName, serviceName);
    // Find the specific activity by name
    const activity = activities.find(a => a.name === activityName);
    // Return retention rules, or null if activity doesn't exist
    return activity?.retention || null;
  }

  /**
   * Extract all document types from hierarchical taxonomy (flat view)
   * Used for backward compatibility with flat-based systems.
   * Traverses the entire hierarchy and collects all unique document types into a flat array.
   *
   * @param entityType - The entity type (domain) to extract document types from
   * @returns Array of all unique document type names across the entire taxonomy
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const allDocTypes = expert.getAllDocumentTypes('household');
   * console.log(allDocTypes);
   * // ['Medical Receipt', 'Referral Letter', 'Tax Return', 'Invoice', 'Bank Statement', ...]
   * // Contains all document types from all activities in the hierarchy
   * ```
   */
  getAllDocumentTypes(entityType: Domain): string[] {
    const taxonomy = this.getHierarchicalTaxonomy(entityType);
    if (!taxonomy) {
      // Fall back to flat taxonomy
      return this.getDocumentTypes(entityType);
    }

    const documentTypes = new Set<string>();

    // Traverse the hierarchy: Function → Service → Activity → DocumentTypes
    for (const func of Object.values(taxonomy.functions)) {
      for (const service of Object.values(func.services)) {
        for (const activity of Object.values(service.activities)) {
          activity.documentTypes.forEach(dt => documentTypes.add(dt));
        }
      }
    }

    return Array.from(documentTypes);
  }

  /**
   * Extract all tags from hierarchical taxonomy (flat view)
   * Used for backward compatibility with flat-based systems.
   * Creates tag categories organized by function name, containing activity names and document types.
   *
   * @param entityType - The entity type (domain) to extract tags from
   * @returns Object with function names as keys and arrays of tag strings (activity names + document types) as values
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const tagCategories = expert.getAllTagCategories('household');
   * console.log(tagCategories);
   * // {
   * //   'HealthManagement': ['Consultations', 'Prescriptions', 'Medical Receipt', 'Referral Letter', ...],
   * //   'FinanceManagement': ['TaxReturns', 'Invoices', 'Tax Return', 'Invoice', ...],
   * //   ...
   * // }
   * ```
   */
  getAllTagCategories(entityType: Domain): Record<string, string[]> {
    const taxonomy = this.getHierarchicalTaxonomy(entityType);
    if (!taxonomy) {
      // Fall back to flat taxonomy
      return this.getTagCategories(entityType);
    }

    const tagCategories: Record<string, string[]> = {};

    // Build categories from function level - each function becomes a category
    for (const [funcName, func] of Object.entries(taxonomy.functions)) {
      const category = funcName;
      const tags: string[] = [];

      // Add function-level activities as tags
      for (const service of Object.values(func.services)) {
        for (const activity of Object.values(service.activities)) {
          // Add activity names as tags
          tags.push(activity.name);
          // Add document types as tags
          activity.documentTypes.forEach(dt => tags.push(dt));
        }
      }

      tagCategories[category] = tags;
    }

    return tagCategories;
  }

  /**
   * T088: Check if hierarchical mode is available
   * Determines if hierarchical taxonomy files were successfully loaded for this instance.
   *
   * @returns true if at least one hierarchical taxonomy JSON file was loaded, false otherwise
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
   * if (expert.isHierarchicalAvailable()) {
   *   // Use hierarchical methods
   *   const functions = expert.getFunctions('household');
   * } else {
   *   // Fall back to flat taxonomy
   *   const docTypes = expert.getDocumentTypes('household');
   * }
   * ```
   */
  isHierarchicalAvailable(): boolean {
    return this.hierarchicalTaxonomies.size > 0;
  }

  /**
   * T106: Get current taxonomy mode
   * Returns the mode this TaxonomyExpert instance was initialized with.
   *
   * @returns The current taxonomy mode: 'hierarchical', 'flat', or 'hybrid'
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
   * console.log(expert.getTaxonomyMode());  // 'hierarchical'
   * ```
   */
  getTaxonomyMode(): TaxonomyMode {
    return this.mode;
  }

  /**
   * T099: Validate a taxonomy path
   * Validates a slash-separated path string against the hierarchical taxonomy.
   * Paths can be partial (function only, function/service) or complete (function/service/activity).
   * Matching is case-insensitive for user convenience.
   *
   * @param domain - The entity type (domain) to validate against
   * @param path - Slash-separated path string, e.g., "HealthManagement/MedicalCare/Consultations"
   * @returns Validation result with resolved components if valid, or error message if invalid
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   *
   * // Valid complete path
   * const result1 = expert.validatePath('household', 'HealthManagement/MedicalCare/Consultations');
   * // { valid: true, resolved: { function: 'HealthManagement', service: 'MedicalCare', activity: 'Consultations', documentTypes: [...], retention: {...} } }
   *
   * // Valid partial path (case-insensitive)
   * const result2 = expert.validatePath('household', 'healthmanagement/medicalcare');
   * // { valid: true, resolved: { function: 'HealthManagement', service: 'MedicalCare' } }
   *
   * // Invalid path
   * const result3 = expert.validatePath('household', 'InvalidFunction');
   * // { valid: false, error: 'Invalid function: InvalidFunction' }
   * ```
   */
  validatePath(domain: Domain, path: string): {
    valid: boolean;
    error?: string;
    resolved?: {
      function?: string;
      service?: string;
      activity?: string;
      documentTypes?: string[];
      retention?: Record<string, any>;
    };
  } {
    if (!this.isHierarchicalAvailable()) {
      return { valid: false, error: 'Hierarchical taxonomy not available' };
    }

    const parts = path.split('/').map(p => p.trim()).filter(p => p.length > 0);
    const resolved: any = {};

    // Validate function (case-insensitive)
    if (parts.length > 0) {
      const functions = this.getFunctions(domain);
      const func = functions.find(f => f.name.toLowerCase() === parts[0].toLowerCase());

      if (!func) {
        return { valid: false, error: `Invalid function: ${parts[0]}` };
      }
      resolved.function = func.name;
    }

    // Validate service (case-insensitive)
    if (parts.length > 1 && resolved.function) {
      const services = this.getServices(domain, resolved.function);
      const svc = services.find(s => s.name.toLowerCase() === parts[1].toLowerCase());

      if (!svc) {
        return { valid: false, error: `Invalid service: ${parts[1]} for function ${resolved.function}` };
      }
      resolved.service = svc.name;
    }

    // Validate activity (case-insensitive)
    if (parts.length > 2 && resolved.service) {
      const activities = this.getActivities(domain, resolved.function, resolved.service);
      const act = activities.find(a => a.name.toLowerCase() === parts[2].toLowerCase());

      if (!act) {
        return { valid: false, error: `Invalid activity: ${parts[2]} for service ${resolved.service}` };
      }
      resolved.activity = act.name;
      resolved.documentTypes = act.documentTypes;
      resolved.retention = act.retention;
    }

    // Path is valid
    return { valid: true, resolved };
  }

  /**
   * T100: Parse a taxonomy path into components (case-insensitive)
   * Convenience method that parses a path and returns the resolved components directly.
   * This is a simpler interface than validatePath() when you only need the components.
   *
   * @param domain - The entity type (domain) to parse against
   * @param path - Slash-separated path string
   * @returns Parsed components with valid flag, or { valid: false } if parsing failed
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const parsed = expert.parsePath('household', 'HealthManagement/MedicalCare/Consultations');
   *
   * if (parsed.valid) {
   *   console.log(parsed.function);      // 'HealthManagement'
   *   console.log(parsed.service);       // 'MedicalCare'
   *   console.log(parsed.activity);      // 'Consultations'
   *   console.log(parsed.documentTypes); // ['Medical Receipt', 'Referral Letter', ...]
   *   console.log(parsed.retention);     // { AUS: { years: 7, authority: '...' } }
   * }
   * ```
   */
  parsePath(domain: Domain, path: string): {
    function?: string;
    service?: string;
    activity?: string;
    documentTypes?: string[];
    retention?: Record<string, any>;
    valid: boolean;
  } {
    const validation = this.validatePath(domain, path);

    if (!validation.valid) {
      return { valid: false };
    }

    return {
      ...validation.resolved,
      valid: true,
    };
  }

  /**
   * T101: Resolve a partial path with suggestions for completion
   * Provides intelligent autocomplete suggestions for hierarchical path navigation.
   * Supports fuzzy matching (case-insensitive substring search) when exact matches fail.
   * Returns what has been matched so far, what's suggested next, and how many levels remain.
   *
   * @param domain - The entity type (domain) to resolve against
   * @param partialPath - Incomplete path string, can be empty, partial function, function/service, etc.
   * @returns Object with suggestions for next level, matched components so far, and remaining levels
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   *
   * // Empty path - get all functions
   * const r1 = expert.resolvePath('household', '');
   * // { suggestions: ['HealthManagement', 'FinanceManagement', ...], matched: [], remaining: 3 }
   *
   * // Partial function match - fuzzy suggestions
   * const r2 = expert.resolvePath('household', 'health');
   * // { suggestions: ['HealthManagement'], matched: [], remaining: 3 }
   *
   * // Complete function - suggest services
   * const r3 = expert.resolvePath('household', 'HealthManagement');
   * // { suggestions: ['HealthManagement/MedicalCare', 'HealthManagement/DentalCare', ...], matched: ['HealthManagement'], remaining: 2 }
   *
   * // Complete path - suggest document types
   * const r4 = expert.resolvePath('household', 'HealthManagement/MedicalCare/Consultations');
   * // { suggestions: ['HealthManagement/MedicalCare/Consultations/Medical Receipt', ...], matched: ['HealthManagement', 'MedicalCare', 'Consultations'], remaining: 0 }
   * ```
   */
  resolvePath(domain: Domain, partialPath: string): {
    suggestions: string[];
    matched: string[];
    remaining: number;
  } {
    const parts = partialPath.split('/').map(p => p.trim()).filter(p => p.length > 0);
    let suggestions: string[] = [];
    let matched: string[] = [];

    if (parts.length === 0) {
      // Suggest all functions
      const functions = this.getFunctions(domain);
      matched = [];
      suggestions = functions.map(f => f.name);
      return { suggestions, matched, remaining: 3 };
    }

    // Check function
    const functions = this.getFunctions(domain);
    const funcMatch = functions.find(f => f.name.toLowerCase() === parts[0].toLowerCase());

    if (!funcMatch) {
      // Fuzzy match functions
      matched = [];
      suggestions = functions
        .filter(f => f.name.toLowerCase().includes(parts[0].toLowerCase()))
        .map(f => f.name);
      return { suggestions, matched, remaining: 3 };
    }

    matched = [funcMatch.name];

    if (parts.length === 1) {
      // Suggest services for this function
      const services = this.getServices(domain, funcMatch.name);
      suggestions = services.map(s => `${funcMatch.name}/${s.name}`);
      return { suggestions, matched, remaining: 2 };
    }

    // Check service
    const services = this.getServices(domain, funcMatch.name);
    const serviceMatch = services.find(s => s.name.toLowerCase() === parts[1].toLowerCase());

    if (!serviceMatch) {
      // Fuzzy match services
      suggestions = services
        .filter(s => s.name.toLowerCase().includes(parts[1].toLowerCase()))
        .map(s => `${funcMatch.name}/${s.name}`);
      return { suggestions, matched, remaining: 2 };
    }

    matched = [funcMatch.name, serviceMatch.name];

    if (parts.length === 2) {
      // Suggest activities for this service
      const activities = this.getActivities(domain, funcMatch.name, serviceMatch.name);
      suggestions = activities.map(a => `${funcMatch.name}/${serviceMatch.name}/${a.name}`);
      return { suggestions, matched, remaining: 1 };
    }

    // Check activity
    const activities = this.getActivities(domain, funcMatch.name, serviceMatch.name);
    const activityMatch = activities.find(a => a.name.toLowerCase() === parts[2].toLowerCase());

    if (!activityMatch) {
      // Fuzzy match activities
      suggestions = activities
        .filter(a => a.name.toLowerCase().includes(parts[2].toLowerCase()))
        .map(a => `${funcMatch.name}/${serviceMatch.name}/${a.name}`);
      return { suggestions, matched, remaining: 1 };
    }

    matched = [funcMatch.name, serviceMatch.name, activityMatch.name];

    // Path is complete, suggest document types
    const docTypes = this.getDocumentTypesForActivity(
      domain,
      funcMatch.name,
      serviceMatch.name,
      activityMatch.name
    );

    suggestions = docTypes.map(dt => `${funcMatch.name}/${serviceMatch.name}/${activityMatch.name}/${dt}`);
    return { suggestions, matched, remaining: 0 };
  }

  /**
   * T102: Autocomplete with fuzzy matching
   * Higher-level autocomplete interface that wraps resolvePath() with options.
   * Limits the number of suggestions returned and indicates what type of item is being suggested.
   *
   * @param domain - The entity type (domain) to autocomplete against
   * @param partialPath - Incomplete path string for autocomplete
   * @param options - Optional configuration: limit (default 10) and fuzzy (default true)
   * @returns Suggestions limited to specified count, type indicators, and remaining levels
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   *
   * // Get up to 5 function suggestions
   * const result = expert.autocomplete('household', 'health', { limit: 5 });
   * // { suggestions: ['HealthManagement'], types: ['function'], remaining: 3 }
   *
   * // Service-level autocomplete
   * const result2 = expert.autocomplete('household', 'HealthManagement/med');
   * // { suggestions: ['HealthManagement/MedicalCare'], types: ['service'], remaining: 2 }
   * ```
   */
  autocomplete(domain: Domain, partialPath: string, options?: {
    limit?: number;
    fuzzy?: boolean;
  }): {
    suggestions: string[];
    types: ('function' | 'service' | 'activity' | 'documentType')[];
    remaining: number;
  } {
    const limit = options?.limit || 10;
    const fuzzy = options?.fuzzy !== false;

    const resolution = this.resolvePath(domain, partialPath);
    const types: ('function' | 'service' | 'activity' | 'documentType')[] = [];

    if (resolution.remaining === 3) {
      types.push('function');
    } else if (resolution.remaining === 2) {
      types.push('service');
    } else if (resolution.remaining === 1) {
      types.push('activity');
    } else {
      types.push('documentType');
    }

    return {
      suggestions: resolution.suggestions.slice(0, limit),
      types,
      remaining: resolution.remaining,
    };
  }

  /**
   * T103: Search for activities by keyword
   * Performs a full-text search across the taxonomy hierarchy (function/service/activity names, keywords, and document types).
   * Returns results sorted by relevance score, with higher scores for exact name matches.
   *
   * @param domain - The entity type (domain) to search within
   * @param keyword - Search term (case-insensitive substring match)
   * @returns Array of matches with full path, match type, and relevance score (sorted by relevance, top 20 results)
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   *
   * // Search for medical-related activities
   * const results = expert.searchByKeyword('household', 'medical');
   * // [
   * //   { function: 'HealthManagement', service: 'MedicalCare', activity: 'Consultations', matchType: 'keyword', relevance: 7 },
   * //   { function: 'HealthManagement', service: 'MedicalCare', activity: 'Prescriptions', matchType: 'documentType', relevance: 6 },
   * //   ...
   * // ]
   *
   * // Search by document type
   * const invoices = expert.searchByKeyword('household', 'invoice');
   * // Finds all activities that have 'Invoice' as a document type
   * ```
   */
  searchByKeyword(domain: Domain, keyword: string): {
    function: string;
    service: string;
    activity: string;
    matchType: 'name' | 'keyword' | 'documentType';
    relevance: number;
  }[] {
    const results: any[] = [];
    const lowerKeyword = keyword.toLowerCase();

    const functions = this.getFunctions(domain);

    for (const func of functions) {
      // Check function name and keywords
      const funcNameMatch = func.name.toLowerCase().includes(lowerKeyword);
      const funcKeywordMatch = func.keywords?.some((k: string) => k.toLowerCase().includes(lowerKeyword));

      if (funcNameMatch || funcKeywordMatch) {
        results.push({
          function: func.name,
          service: '',
          activity: '',
          matchType: funcNameMatch ? 'name' : 'keyword',
          relevance: funcNameMatch ? 10 : 5,
        });
      }

      const services = this.getServices(domain, func.name);

      for (const service of services) {
        const serviceNameMatch = service.name.toLowerCase().includes(lowerKeyword);
        const serviceKeywordMatch = service.keywords?.some((k: string) => k.toLowerCase().includes(lowerKeyword));

        if (serviceNameMatch || serviceKeywordMatch) {
          results.push({
            function: func.name,
            service: service.name,
            activity: '',
            matchType: serviceNameMatch ? 'name' : 'keyword',
            relevance: serviceNameMatch ? 8 : 4,
          });
        }

        const activities = this.getActivities(domain, func.name, service.name);

        for (const activity of activities) {
          const activityNameMatch = activity.name.toLowerCase().includes(lowerKeyword);
          const activityKeywordMatch = activity.keywords?.some((k: string) => k.toLowerCase().includes(lowerKeyword));
          const docTypeMatch = activity.documentTypes?.some((dt: string) => dt.toLowerCase().includes(lowerKeyword));

          if (activityNameMatch || activityKeywordMatch || docTypeMatch) {
            let matchType: 'name' | 'keyword' | 'documentType' = 'name';
            if (activityKeywordMatch) matchType = 'keyword';
            else if (docTypeMatch) matchType = 'documentType';

            results.push({
              function: func.name,
              service: service.name,
              activity: activity.name,
              matchType,
              relevance: docTypeMatch ? 6 : activityNameMatch ? 7 : 3,
            });
          }
        }
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);
  }

  /**
   * T104: Generate hierarchical tags based on function/service/activity
   * Creates a tag array for paperless-ngx tagging from the hierarchical path.
   * Includes function, service, activity names plus any keywords defined for the activity.
   *
   * @param domain - The entity type (domain)
   * @param functionName - Function name from the hierarchy
   * @param serviceName - Service name from the hierarchy
   * @param activityName - Activity name from the hierarchy
   * @returns Array of unique tag strings suitable for document tagging
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const tags = expert.generateHierarchicalTags(
   *   'household',
   *   'HealthManagement',
   *   'MedicalCare',
   *   'Consultations'
   * );
   * console.log(tags);
   * // ['HealthManagement', 'MedicalCare', 'Consultations', 'medical', 'doctor', 'clinic']
   * // (Function, Service, Activity, plus keywords from activity definition)
   * ```
   */
  generateHierarchicalTags(domain: Domain, functionName: string, serviceName: string, activityName: string): string[] {
    const tags: string[] = [];

    // Add function tag
    tags.push(functionName);

    // Add service tag
    tags.push(serviceName);

    // Add activity tag
    tags.push(activityName);

    // Get activity to extract any additional tags (keywords)
    const activities = this.getActivities(domain, functionName, serviceName);
    const activity = activities.find(a => a.name === activityName);

    if (activity?.keywords) {
      tags.push(...activity.keywords);
    }

    // Remove duplicates and return
    return Array.from(new Set(tags));
  }

  /**
   * T105: Generate storage path based on hierarchy
   * Converts hierarchical taxonomy path into a human-readable filesystem path.
   * PascalCase names are converted to "Spaced Capitalized" format for readability.
   *
   * @param domain - The entity type (domain)
   * @param functionName - Function name from the hierarchy (PascalCase)
   * @param serviceName - Service name from the hierarchy (PascalCase)
   * @param activityName - Activity name from the hierarchy (PascalCase)
   * @returns Forward-slash separated path suitable for storage organization
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const path = expert.generateStoragePath(
   *   'household',
   *   'HealthManagement',
   *   'MedicalCare',
   *   'Consultations'
   * );
   * console.log(path);
   * // '/Household/Health Management/Medical Care/Consultations'
   * ```
   */
  generateStoragePath(domain: Domain, functionName: string, serviceName: string, activityName: string): string {
    // Convert PascalCase to readable format for paths (e.g., 'MedicalCare' → 'Medical Care')
    const toReadable = (str: string) => str.replace(/([A-Z])/g, ' $1').trim();

    const parts = [domain, toReadable(functionName), toReadable(serviceName), toReadable(activityName)];

    // Capitalize each part for consistent formatting
    const capitalized = parts.map(p =>
      p.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );

    return `/${capitalized.join('/')}`;
  }

  /**
   * Get taxonomy for a domain
   */
  private getTaxonomy(domain: Domain): DomainTaxonomy | null {
    const countryData = this.taxonomies[this.country];
    if (!countryData) {
      return null;
    }
    return countryData.domains[domain] || null;
  }

  /**
   * Suggest tags and metadata for a document
   */
  suggestMetadata(
    fileName: string,
    content?: string,
    domain?: Domain
  ): TaxonomySuggestion {
    const targetDomain = domain || this.defaultDomain;

    // Branch based on taxonomy mode
    if (this.mode === 'hierarchical') {
      return this.suggestMetadataHierarchical(fileName, content, targetDomain);
    } else {
      return this.suggestMetadataFlat(fileName, content, targetDomain);
    }
  }

  /**
   * Suggest metadata using hierarchical FSA taxonomy
   */
  private suggestMetadataHierarchical(
    fileName: string,
    content: string | undefined,
    targetDomain: Domain
  ): TaxonomySuggestion {
    const suggestion: TaxonomySuggestion = {
      tags: [],
    };

    // Extract filename tokens (normalize and split)
    const lowerName = fileName.toLowerCase().replace(/[_-]/g, ' ');
    const nameTokens = lowerName
      .replace(/\.(pdf|doc|docx|jpg|jpeg|png|txt)$/, '') // Remove file extension
      .split(/\s+/)
      .filter(token => token.length > 2); // Filter out short tokens

    // Get hierarchical taxonomy for this domain
    const hierarchicalTaxonomy = this.getHierarchicalTaxonomy(targetDomain);

    if (!hierarchicalTaxonomy) {
      return { tags: [], notes: `No hierarchical taxonomy found for ${targetDomain}` };
    }

    // Collect all Activities with matching document types, scored by keyword overlap
    interface ScoredActivity {
      func: TaxonomyFunction;
      service: TaxonomyService;
      activity: TaxonomyActivity;
      docType: string;
      score: number;
    }

    const matches: ScoredActivity[] = [];
    const functions = this.getFunctions(targetDomain);

    for (const func of functions) {
      const services = this.getServices(targetDomain, func.name);

      for (const service of services) {
        const activities = this.getActivities(targetDomain, func.name, service.name);

        for (const activity of activities) {
          // Check if any document type matches the filename or content
          const docTypeMatch = activity.documentTypes?.find(docType => {
            const normalizedType = docType.toLowerCase().replace(/[_-]/g, ' ');

            // Special abbreviations
            const isInvoice = docType === 'Invoice' && (
              lowerName.includes('inv') || lowerName.includes(normalizedType)
            );

            return isInvoice ||
                   lowerName.includes(normalizedType) ||
                   (content && content.toLowerCase().includes(docType.toLowerCase()));
          });

          if (docTypeMatch) {
            // Score this match based on keyword overlap with filename
            let score = 0;

            if (activity.keywords) {
              for (const keyword of activity.keywords) {
                const normalizedKeyword = keyword.toLowerCase().replace(/[_-]/g, ' ');

                // Check bidirectional matching:
                // 1. Does filename contain keyword? (e.g., "pharmacy receipt" contains "pharmacy")
                // 2. Does keyword contain any filename token? (e.g., "invoice" contains "inv")
                // 3. Does content contain keyword?
                const filenameContainsKeyword = lowerName.includes(normalizedKeyword);
                const keywordContainsToken = nameTokens.some(token => normalizedKeyword.includes(token));
                const contentContainsKeyword = content && content.toLowerCase().includes(keyword.toLowerCase());

                if (filenameContainsKeyword || keywordContainsToken || contentContainsKeyword) {
                  score += 10; // Keyword match adds 10 points
                }
              }
            }

            matches.push({
              func,
              service,
              activity,
              docType: docTypeMatch,
              score
            });
          }
        }
      }
    }

    // Select the highest-scoring match
    if (matches.length > 0) {
      const bestMatch = matches.sort((a, b) => b.score - a.score)[0];

      suggestion.documentType = bestMatch.docType;

      // Add retention rule (this.country is already a country code like 'AUS', 'USA', 'GBR')
      const countryCode = this.country;
      const retention = bestMatch.activity.retention?.[countryCode];
      if (retention) {
        suggestion.retentionYears = retention.years;
        suggestion.retentionReason = retention.authority;

        // Special handling for Family Trust Election
        if (bestMatch.docType === 'Family Trust Election' && targetDomain === 'family-trust') {
          suggestion.notes = 'CRITICAL: Family Trust Election must be retained for 5 years from FTE date, not EOFY. This affects the entire trust structure.';
        }
      }

      // Add Function category tag (e.g., HealthManagement → medical)
      const categoryTag = FUNCTION_TO_CATEGORY[bestMatch.func.name];
      if (categoryTag && !suggestion.tags.includes(categoryTag)) {
        suggestion.tags.push(categoryTag);
      }

      // Add Activity keywords
      if (bestMatch.activity.keywords) {
        for (const keyword of bestMatch.activity.keywords) {
          if (!suggestion.tags.includes(keyword)) {
            suggestion.tags.push(keyword);
          }
        }
      }

      // Add domain name as a tag (e.g., 'household')
      if (!suggestion.tags.includes(targetDomain)) {
        suggestion.tags.push(targetDomain);
      }

      return suggestion;
    }

    // If no document type matched, try to add filename tokens as tags
    for (const token of nameTokens) {
      if (!suggestion.tags.includes(token)) {
        suggestion.tags.push(token);
      }
    }

    return suggestion;
  }

  /**
   * Suggest metadata using flat YAML taxonomy (backward compatibility)
   */
  private suggestMetadataFlat(
    fileName: string,
    content: string | undefined,
    targetDomain: Domain
  ): TaxonomySuggestion {
    const taxonomy = this.getTaxonomy(targetDomain);

    if (!taxonomy) {
      return { tags: [], notes: `No taxonomy found for ${this.country}` };
    }

    const suggestion: TaxonomySuggestion = {
      tags: [],
    };

    // Analyze filename for hints
    const lowerName = fileName.toLowerCase().replace(/[_-]/g, ' ');

    // Check for known document types (normalized matching)
    for (const docType of taxonomy.documentTypes) {
      const normalizedType = docType.toLowerCase().replace(/[_-]/g, ' ');

      // Special abbreviations for invoice
      const isInvoice = docType === 'Invoice' && (
        lowerName.includes('inv') ||
        lowerName.includes(normalizedType) ||
        fileName.includes(docType)
      );

      if (isInvoice ||
          lowerName.includes(normalizedType) ||
          fileName.includes(docType) ||
          (content && content.toLowerCase().includes(docType.toLowerCase()))) {
        suggestion.documentType = docType;

        // Apply retention rule
        const retention = taxonomy.retentionRules[docType];
        if (retention) {
          suggestion.retentionYears = retention.years;
          suggestion.retentionReason = retention.reason;

          // Special handling for Family Trust Election
          if (docType === 'Family Trust Election' && targetDomain === 'family-trust') {
            suggestion.notes = 'CRITICAL: Family Trust Election must be retained for 5 years from FTE date, not EOFY. This affects the entire trust structure.';
          }
        }

        break;
      }
    }

    // Suggest tags based on categories (normalized matching)
    for (const [category, tags] of Object.entries(taxonomy.tagCategories)) {
      let categoryMatched = false;

      for (const tag of tags) {
        const normalizedTag = tag.toLowerCase().replace(/[_-]/g, ' ');
        if (lowerName.includes(normalizedTag) ||
            lowerName.includes(tag) ||
            (content && content.toLowerCase().includes(tag.toLowerCase()))) {
          if (!suggestion.tags.includes(tag)) {
            suggestion.tags.push(tag);
          }
          categoryMatched = true;
        }
      }

      // If any tag from this category matched, add the category name as a tag too
      if (categoryMatched && !suggestion.tags.includes(category)) {
        suggestion.tags.push(category);
      }
    }

    // Add domain name as a tag (e.g., 'household')
    if (!suggestion.tags.includes(targetDomain)) {
      suggestion.tags.push(targetDomain);
    }

    return suggestion;
  }

  /**
   * Get all document types for a domain
   * Legacy flat taxonomy method - retrieves document types from YAML configuration.
   * For hierarchical taxonomies, use getAllDocumentTypes() instead.
   *
   * @param domain - Optional entity type (uses default domain if not specified)
   * @returns Array of document type names from flat taxonomy
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household', 'flat');
   * const docTypes = expert.getDocumentTypes('household');
   * // Returns flat list from YAML config
   * ```
   */
  getDocumentTypes(domain?: Domain): string[] {
    const targetDomain = domain || this.defaultDomain;
    const taxonomy = this.getTaxonomy(targetDomain);
    return taxonomy?.documentTypes || [];
  }

  /**
   * Get all tag categories for a domain
   * Legacy flat taxonomy method - retrieves tag categories from YAML configuration.
   * For hierarchical taxonomies, use getAllTagCategories() instead.
   *
   * @param domain - Optional entity type (uses default domain if not specified)
   * @returns Object with category names as keys and tag arrays as values
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household', 'flat');
   * const categories = expert.getTagCategories('household');
   * // { 'financial': ['invoice', 'receipt'], 'medical': ['prescription', 'test-result'], ... }
   * ```
   */
  getTagCategories(domain?: Domain): Record<string, string[]> {
    const targetDomain = domain || this.defaultDomain;
    const taxonomy = this.getTaxonomy(targetDomain);
    return taxonomy?.tagCategories || {};
  }

  /**
   * Get retention requirements for a document type
   * Retrieves retention rules (years to keep, legal reason) for a specific document type.
   * Works with both flat and hierarchical taxonomies.
   *
   * @param documentType - Document type name to look up
   * @param domain - Optional entity type (uses default domain if not specified)
   * @returns Retention rule object, or null if no rule defined
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const retention = expert.getRetentionRequirements('Tax Return', 'household');
   * // { years: 7, reason: 'ATO requirement for tax records' }
   * ```
   */
  getRetentionRequirements(documentType: string, domain?: Domain): {
    years: number;
    reason: string;
  } | null {
    const targetDomain = domain || this.defaultDomain;
    const taxonomy = this.getTaxonomy(targetDomain);
    if (!taxonomy) return null;
    return taxonomy.retentionRules[documentType] || null;
  }

  /**
   * Check if documents can be deleted based on retention
   * Calculates if a document has exceeded its retention period and can be deleted.
   * Returns false for documents with no retention rule or "keep forever" (0 years).
   *
   * @param document - Document object with type and creation date
   * @param domain - Optional entity type (uses default domain if not specified)
   * @returns true if document can be deleted, false if it must be retained
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'household');
   * const doc = { type: 'Utility Bill', createdDate: new Date('2020-01-01') };
   *
   * const canDelete = expert.canDelete(doc, 'household');
   * // true if current date > 2022-01-01 (assuming 2-year retention)
   * // false if still within retention period
   * ```
   */
  canDelete(document: {
    type: string;
    createdDate: Date;
  }, domain?: Domain): boolean {
    const targetDomain = domain || this.defaultDomain;
    const retention = this.getRetentionRequirements(document.type, targetDomain);

    if (!retention || retention.years === 0) {
      return false; // Cannot auto-delete if no rule or "keep forever"
    }

    // Calculate retention expiry date
    const retentionDate = new Date(document.createdDate);
    retentionDate.setFullYear(retentionDate.getFullYear() + retention.years);

    // Can delete if retention period has passed
    return retentionDate < new Date();
  }

  /**
   * Get supported countries
   * Returns ISO 3166-1 alpha-3 country codes that have taxonomy definitions.
   *
   * @returns Array of supported country codes (e.g., ['AUS', 'USA', 'GBR'])
   *
   * @example
   * ```typescript
   * const countries = TaxonomyExpert.getSupportedCountries();
   * console.log(countries);  // ['AUS', 'USA', 'GBR']
   * ```
   */
  static getSupportedCountries(): string[] {
    return Object.keys(COUNTRY_TAXONOMIES);
  }

  /**
   * Check if country is supported
   * Validates if a country code has taxonomy definitions available.
   *
   * @param country - Country code to check (ISO 3166-1 alpha-3, e.g., 'AUS')
   * @returns true if country is supported, false otherwise
   *
   * @example
   * ```typescript
   * const isSupported = TaxonomyExpert.isCountrySupported('AUS');  // true
   * const notSupported = TaxonomyExpert.isCountrySupported('FRA');  // false
   * ```
   */
  static isCountrySupported(country: string): boolean {
    return country in COUNTRY_TAXONOMIES;
  }

  /**
   * Get all supported trust types
   * Returns entity types that are classified as trusts.
   *
   * @returns Array of trust entity type names
   *
   * @example
   * ```typescript
   * const trustTypes = TaxonomyExpert.getSupportedTrustTypes();
   * // ['unit-trust', 'discretionary-trust', 'family-trust']
   * ```
   */
  static getSupportedTrustTypes(): string[] {
    return ['unit-trust', 'discretionary-trust', 'family-trust'];
  }

  /**
   * Check if entity type is a trust
   * Determines if a given entity type represents a trust structure.
   *
   * @param entity - Entity type string to check
   * @returns true if entity is a trust type, false otherwise
   *
   * @example
   * ```typescript
   * TaxonomyExpert.isTrustType('family-trust');   // true
   * TaxonomyExpert.isTrustType('household');      // false
   * TaxonomyExpert.isTrustType('unit-trust');     // true
   * ```
   */
  static isTrustType(entity: string): boolean {
    return TaxonomyExpert.getSupportedTrustTypes().includes(entity);
  }

  /**
   * Get FTE retention warning for family trusts
   * Calculates Family Trust Election retention deadline (5 years from FTE date, NOT EOFY).
   * This is a critical compliance requirement for Australian family trusts under ITAA 1936 Section 272-80.
   *
   * @param fteDate - The date the Family Trust Election was signed
   * @returns Object with retention deadline and detailed warning message
   *
   * @example
   * ```typescript
   * const expert = new TaxonomyExpert('AUS', 'family-trust');
   * const fteDate = new Date('2020-06-30');
   * const warning = expert.getFTERetentionWarning(fteDate);
   *
   * console.log(warning.retentionUntil);  // 2025-06-30
   * console.log(warning.warning);
   * // "Family Trust Election (dated 2020-06-30) must be retained until 2025-06-30 (5 years from FTE date, not EOFY). Section 272-80 ITAA 1936 requirement. This document is critical for the trust's tax structure."
   * ```
   */
  getFTERetentionWarning(fteDate: Date): {
    retentionUntil: Date;
    warning: string;
  } {
    const retentionUntil = new Date(fteDate);
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 5);

    return {
      retentionUntil,
      warning: `Family Trust Election (dated ${fteDate.toISOString().split('T')[0]}) must be retained until ${retentionUntil.toISOString().split('T')[0]} (5 years from FTE date, not EOFY). Section 272-80 ITAA 1936 requirement. This document is critical for the trust's tax structure.`,
    };
  }

  /**
   * Get taxonomy metadata (version, changelog)
   * Retrieves version information and change history from the taxonomy configuration.
   *
   * @returns Taxonomy metadata object with version and changelog, or null if not available
   *
   * @example
   * ```typescript
   * const metadata = TaxonomyExpert.getMetadata();
   * if (metadata) {
   *   console.log(metadata.version);      // '1.0.0'
   *   console.log(metadata.lastUpdated);  // '2024-01-23'
   *   console.log(metadata.changelog);    // Array of version changes
   * }
   * ```
   */
  static getMetadata(): TaxonomyMetadata | null {
    return loadTaxonomyMetadata();
  }
}

/**
 * Create expert from environment variables
 * Factory function that initializes a TaxonomyExpert using configuration from environment variables.
 * Falls back to Australia if the specified country is not supported.
 *
 * Environment variables:
 * - MADEINOZ_RECORDMANAGER_COUNTRY: ISO 3166-1 alpha-3 country code (default: 'Australia')
 * - MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN: Entity type domain (default: 'household')
 *
 * @returns Configured TaxonomyExpert instance
 *
 * @example
 * ```bash
 * # In .env file:
 * MADEINOZ_RECORDMANAGER_COUNTRY="AUS"
 * MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN="household"
 * ```
 *
 * ```typescript
 * import { createExpertFromEnv } from './TaxonomyExpert';
 *
 * const expert = createExpertFromEnv();
 * // Expert initialized with country and domain from environment variables
 * ```
 */
export function createExpertFromEnv(): TaxonomyExpert {
  const country = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';
  const defaultDomain = (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) || 'household';

  if (!TaxonomyExpert.isCountrySupported(country)) {
    console.warn(`Country ${country} not supported, falling back to Australia`);
    return new TaxonomyExpert('Australia', defaultDomain);
  }

  return new TaxonomyExpert(country, defaultDomain);
}
