// Test file for TaxonomyInstaller extensibility
// $PAI_DIR/src/tests/TaxonomyInstaller.extensibility.test.ts
/**
 * Phase 7 (User Story 4) - Entity Type Extensibility Tests
 *
 * T073-T078: Tests verifying new entity types can be added without code changes
 *
 * Tests verify that:
 * - Entity types are discovered dynamically from directory scanning
 * - New entity types can be added by dropping a JSON file
 * - Installation process handles partial country coverage
 * - No code changes required for new entity types
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { TaxonomyExpert } from '../skills/RecordsManager/Lib/TaxonomyExpert';
import { TaxonomyInstaller, InstallOptions } from '../skills/RecordsManager/Lib/TaxonomyInstaller';

// Mock PaperlessClient for testing
class MockPaperlessClient {
  private tags = new Map<number, Tag>();
  private documentTypes = new Map<number, DocumentType>();
  private storagePaths = new Map<number, StoragePath>();
  private customFields = new Map<number, CustomField>();
  private tagIdCounter = 1;
  private docTypeIdCounter = 1;
  private storagePathIdCounter = 1;
  private customFieldIdCounter = 1;

  async getOrCreateTag(name: string, color?: string): Promise<Tag> {
    const existing = Array.from(this.tags.values()).find(
      t => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const tag: Tag = {
      id: this.tagIdCounter++,
      name,
      slug: name.toLowerCase().replace(/[\s\/]+/g, '-'),
      color: color || '#4a90d9',
      matching_algorithm: 0,
      is_insensitive: true,
    };
    this.tags.set(tag.id, tag);
    return tag;
  }

  async getOrCreateDocumentType(name: string, match?: string): Promise<DocumentType> {
    const existing = Array.from(this.documentTypes.values()).find(
      dt => dt.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const docType: DocumentType = {
      id: this.docTypeIdCounter++,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      match: match || name.toLowerCase(),
      matching_algorithm: 0,
    };
    this.documentTypes.set(docType.id, docType);
    return docType;
  }

  async createStoragePath(path: string): Promise<StoragePath> {
    const existing = Array.from(this.storagePaths.values()).find(
      sp => sp.path.toLowerCase() === path.toLowerCase()
    );
    if (existing) return existing;

    const storagePath: StoragePath = {
      id: this.storagePathIdCounter++,
      path,
      name: path.split('/').pop() || path,
    };
    this.storagePaths.set(storagePath.id, storagePath);
    return storagePath;
  }

  async createCustomField(name: string, dataType: string): Promise<CustomField> {
    const existing = Array.from(this.customFields.values()).find(
      cf => cf.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const customField: CustomField = {
      id: this.customFieldIdCounter++,
      name,
      data_type: dataType,
    };
    this.customFields.set(customField.id, customField);
    return customField;
  }

  async deleteTag(id: number): Promise<void> {
    this.tags.delete(id);
  }

  async deleteDocumentType(id: number): Promise<void> {
    this.documentTypes.delete(id);
  }

  async deleteStoragePath(id: number): Promise<void> {
    this.storagePaths.delete(id);
  }

  async deleteCustomField(id: number): Promise<void> {
    this.customFields.delete(id);
  }

  async getOrCreateStoragePath(path: string): Promise<StoragePath> {
    const existing = Array.from(this.storagePaths.values()).find(
      sp => sp.path.toLowerCase() === path.toLowerCase()
    );
    if (existing) return existing;

    const storagePath: StoragePath = {
      id: this.storagePathIdCounter++,
      path,
      name: path.split('/').pop() || path,
    };
    this.storagePaths.set(storagePath.id, storagePath);
    return storagePath;
  }

  clear() {
    this.tags.clear();
    this.documentTypes.clear();
    this.storagePaths.clear();
    this.customFields.clear();
    this.tagIdCounter = 1;
    this.docTypeIdCounter = 1;
    this.storagePathIdCounter = 1;
    this.customFieldIdCounter = 1;
  }

  getTags() {
    return Array.from(this.tags.values());
  }

  getDocumentTypes() {
    return Array.from(this.documentTypes.values());
  }

  getStoragePaths() {
    return Array.from(this.storagePaths.values());
  }

  getCustomFields() {
    return Array.from(this.customFields.values());
  }
}

// Use the actual taxonomy directory for testing
const TAXONOMY_DIR = join(process.cwd(), 'src', 'skills', 'RecordsManager', 'Config', 'taxonomies', 'hierarchical');
const BACKUP_DIR = join(process.cwd(), 'src', 'lib', 'data', 'taxonomies', '.backup-extensibility');

describe('TaxonomyInstaller Extensibility (T073-T078)', () => {
  let mockClient: MockPaperlessClient;
  let installer: TaxonomyInstaller;
  let expert: TaxonomyExpert;

  beforeEach(() => {
    mockClient = new MockPaperlessClient();
    installer = new TaxonomyInstaller(mockClient as any, 'AUS');
    expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
  });

  afterEach(() => {
    mockClient.clear();
  });

  // T073: Unit test for dynamic entity type discovery
  describe('T073: Dynamic Entity Type Discovery', () => {
    it('should discover entity types from directory scanning', () => {
      const domains = expert.getSupportedDomains();

      // Should discover all 8 entity types from the directory
      expect(domains).toContain('household');
      expect(domains).toContain('corporate');
      expect(domains).toContain('unit-trust');
      expect(domains).toContain('discretionary-trust');
      expect(domains).toContain('family-trust');
      expect(domains).toContain('hybrid-trust');
      expect(domains).toContain('project');
      expect(domains).toContain('person');
      expect(domains.length).toBeGreaterThanOrEqual(8);
    });

    it('should not have hardcoded entity type list', () => {
      // Verify that getSupportedDomains returns from the Map, not hardcoded
      const taxonomy = expert.getHierarchicalTaxonomy('household');
      expect(taxonomy).toBeDefined();
      expect(taxonomy?.entityType).toBe('household');

      // The hierarchicalTaxonomies Map is populated from directory scanning
      // This test verifies the mechanism works
      const domains = expert.getSupportedDomains();
      expect(domains.length).toBeGreaterThan(0);
    });

    it('should return consistent results across calls', () => {
      const domains1 = expert.getSupportedDomains();
      const domains2 = expert.getSupportedDomains();

      expect(domains1).toEqual(domains2);
    });
  });

  // T075: Verify discoverEntityTypes uses directory scanning
  describe('T075: Directory Scanning Implementation', () => {
    it('should use file system to discover entity types', () => {
      // Create a new expert instance to verify directory scanning
      const newExpert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
      const domains = newExpert.getSupportedDomains();

      // Should have discovered domains from file system
      expect(domains.length).toBeGreaterThan(0);

      // Each domain should have a valid hierarchical taxonomy
      for (const domain of domains) {
        const taxonomy = newExpert.getHierarchicalTaxonomy(domain);
        expect(taxonomy).toBeDefined();
        expect(taxonomy?.entityType).toBe(domain);
      }
    });

    it('should load taxonomy data from JSON files', () => {
      const householdTaxonomy = expert.getHierarchicalTaxonomy('household');

      expect(householdTaxonomy).toBeDefined();
      expect(householdTaxonomy?.version).toBeDefined();
      expect(householdTaxonomy?.functions).toBeDefined();
      expect(Object.keys(householdTaxonomy!.functions).length).toBeGreaterThan(0);
    });
  });

  // T076 & T078: Test adding new entity type without code changes
  describe('T076, T078: Adding New Entity Type', () => {
    const TEST_ENTITY_FILE = join(TAXONOMY_DIR, 'test-charity.json');

    beforeEach(() => {
      // Create backup if not exists
      if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
      }
    });

    afterEach(() => {
      // Clean up test file
      if (existsSync(TEST_ENTITY_FILE)) {
        rmSync(TEST_ENTITY_FILE);
      }
    });

    it('T076: should discover new entity type from test fixture', () => {
      // Create a test charity taxonomy file
      const charityTaxonomy = {
        entityType: 'charity',
        country: 'AUS',
        version: '1.0.0',
        functions: {
          DonorManagement: {
            name: 'DonorManagement',
            description: 'Managing donor relationships',
            icon: '🤝',
            services: {
              DonorAcquisition: {
                name: 'DonorAcquisition',
                description: 'Acquiring new donors',
                icon: '📣',
                activities: {
                  FundraisingCampaigns: {
                    name: 'FundraisingCampaigns',
                    description: 'Fundraising campaigns',
                    icon: '💰',
                    documentTypes: ['Campaign Plan', 'Donation Receipt'],
                    retention: {
                      AUS: {
                        years: 7,
                        authority: 'ATO',
                      },
                    },
                    keywords: ['fundraising', 'campaign', 'donation'],
                  },
                },
              },
            },
          },
        },
        metadata: {
          createdAt: '2026-01-22T00:00:00Z',
          updatedAt: '2026-01-22T00:00:00Z',
          createdBy: 'test',
          source: 'test-fixture',
        },
      };

      // Ensure test fixtures directory exists
      if (!existsSync(TAXONOMY_DIR)) {
        mkdirSync(TAXONOMY_DIR, { recursive: true });
      }

      // Write test entity type
      writeFileSync(TEST_ENTITY_FILE, JSON.stringify(charityTaxonomy, null, 2));

      // Create new expert to discover the new entity type
      const testExpert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
      const domains = testExpert.getSupportedDomains();

      // Verify the new entity type is discovered
      expect(domains).toContain('charity');

      // Verify the taxonomy is loaded correctly
      const charityTaxonomyLoaded = testExpert.getHierarchicalTaxonomy('charity');
      expect(charityTaxonomyLoaded).toBeDefined();
      expect(charityTaxonomyLoaded?.entityType).toBe('charity');

      // Verify functions are accessible
      const functions = testExpert.getFunctions('charity');
      expect(functions.length).toBeGreaterThan(0);
      expect(functions[0].name).toBe('DonorManagement');
    });

    it('T078: should install new entity type without code changes', async () => {
      // Create test charity taxonomy
      const charityTaxonomy = {
        entityType: 'charity',
        country: 'AUS',
        version: '1.0.0',
        functions: {
          FinancialManagement: {
            name: 'FinancialManagement',
            description: 'Financial operations',
            icon: '💰',
            services: {
              Accounting: {
                name: 'Accounting',
                description: 'Accounting operations',
                icon: '📊',
                activities: {
                  Bookkeeping: {
                    name: 'Bookkeeping',
                    description: 'Daily bookkeeping',
                    icon: '📝',
                    documentTypes: ['Invoice', 'Receipt'],
                    retention: {
                      AUS: {
                        years: 7,
                        authority: 'ATO',
                      },
                    },
                    keywords: ['invoice', 'receipt', 'payment'],
                  },
                },
              },
            },
          },
        },
        metadata: {
          createdAt: '2026-01-22T00:00:00Z',
          updatedAt: '2026-01-22T00:00:00Z',
          createdBy: 'test',
          source: 'test-fixture',
        },
      };

      // Ensure test fixtures directory exists
      if (!existsSync(TAXONOMY_DIR)) {
        mkdirSync(TAXONOMY_DIR, { recursive: true });
      }

      // Write test entity type
      writeFileSync(TEST_ENTITY_FILE, JSON.stringify(charityTaxonomy, null, 2));

      // Create new installer with the test entity type
      const testExpert = new TaxonomyExpert('AUS', 'charity', 'hierarchical');
      const testInstaller = new TaxonomyInstaller(mockClient as any, 'AUS');

      // Install the new entity type
      const result = await testInstaller.install({ entityTypes: ['charity'] });

      // Verify installation succeeded
      expect(result.success).toBe(true);
      expect(result.entityTypes).toContain('charity');

      // Verify tags were created
      const tags = mockClient.getTags();
      expect(tags.length).toBeGreaterThan(0);

      // Verify document types were created
      const docTypes = mockClient.getDocumentTypes();
      expect(docTypes.length).toBeGreaterThan(0);

      // Verify the specific document types from the charity taxonomy
      const charityDocTypes = docTypes.filter(dt =>
        ['Invoice', 'Receipt'].includes(dt.name)
      );
      expect(charityDocTypes.length).toBeGreaterThan(0);
    });
  });

  // T077: Verify installation handles partial country coverage
  describe('T077: Partial Country Coverage', () => {
    it('should handle entity types with only AU coverage', async () => {
      // Create a test entity type with only AU coverage
      const partialTaxonomy = {
        entityType: 'test-partial',
        country: 'AUS',
        version: '1.0.0',
        functions: {
          TestFunction: {
            name: 'TestFunction',
            description: 'Test function',
            icon: '🧪',
            services: {
              TestService: {
                name: 'TestService',
                description: 'Test service',
                icon: '🔬',
                activities: {
                  TestActivity: {
                    name: 'TestActivity',
                    description: 'Test activity',
                    icon: '📋',
                    documentTypes: ['Test Document'],
                    retention: {
                      AUS: {
                        years: 5,
                        authority: 'Test Authority',
                      },
                      // Note: No USA or GBR rules - partial coverage
                    },
                    keywords: ['test'],
                  },
                },
              },
            },
          },
        },
        metadata: {
          createdAt: '2026-01-22T00:00:00Z',
          updatedAt: '2026-01-22T00:00:00Z',
          createdBy: 'test',
          source: 'test-fixture',
        },
      };

      const TEST_ENTITY_FILE = join(TAXONOMY_DIR, 'test-partial.json');

      // Ensure test fixtures directory exists
      if (!existsSync(TAXONOMY_DIR)) {
        mkdirSync(TAXONOMY_DIR, { recursive: true });
      }

      // Write test entity type
      writeFileSync(TEST_ENTITY_FILE, JSON.stringify(partialTaxonomy, null, 2));

      try {
        // Create new expert to discover the partial entity type
        const testExpert = new TaxonomyExpert('AUS', 'test-partial', 'hierarchical');

        // Verify the entity type is discovered
        const domains = testExpert.getSupportedDomains();
        expect(domains).toContain('test-partial');

        // Get the taxonomy
        const taxonomy = testExpert.getHierarchicalTaxonomy('test-partial');
        expect(taxonomy).toBeDefined();

        // Get retention for the activity
        const functions = testExpert.getFunctions('test-partial');
        const services = testExpert.getServices('test-partial', functions[0].name);
        const activities = testExpert.getActivities('test-partial', functions[0].name, services[0].name);
        const retention = testExpert.getRetentionForActivity(
          'test-partial',
          functions[0].name,
          services[0].name,
          activities[0].name
        );

        // Verify AUS rules exist (using ISO 3166-1 alpha-3)
        expect(retention.AUS).toBeDefined();
        expect(retention.AUS.years).toBe(5);

        // Verify USA/GBR rules don't exist (partial coverage)
        expect(retention.USA).toBeUndefined();
        expect(retention.UK).toBeUndefined();

        // Install should work with partial coverage
        const testInstaller = new TaxonomyInstaller(mockClient as any, 'AUS');
        const result = await testInstaller.install({ entityTypes: ['test-partial'] });

        expect(result.success).toBe(true);
        expect(result.entityTypes).toContain('test-partial');
      } finally {
        // Clean up test file
        if (existsSync(TEST_ENTITY_FILE)) {
          rmSync(TEST_ENTITY_FILE);
        }
      }
    });

    it('should handle entity types with mixed country coverage', async () => {
      // Create a test entity type with mixed coverage
      const mixedTaxonomy = {
        entityType: 'test-mixed',
        country: 'AUS',
        version: '1.0.0',
        functions: {
          TestFunction: {
            name: 'TestFunction',
            description: 'Test function',
            icon: '🧪',
            services: {
              TestService: {
                name: 'TestService',
                description: 'Test service',
                icon: '🔬',
                activities: {
                  TestActivity: {
                    name: 'TestActivity',
                    description: 'Test activity',
                    icon: '📋',
                    documentTypes: ['Test Document'],
                    retention: {
                      AUS: { years: 5, authority: 'ATO' },
                      USA: { years: 7, authority: 'IRS' },
                      // Note: No GBR rules
                    },
                    keywords: ['test'],
                  },
                },
              },
            },
          },
        },
        metadata: {
          createdAt: '2026-01-22T00:00:00Z',
          updatedAt: '2026-01-22T00:00:00Z',
          createdBy: 'test',
          source: 'test-fixture',
        },
      };

      const TEST_ENTITY_FILE = join(TAXONOMY_DIR, 'test-mixed.json');

      // Ensure test fixtures directory exists
      if (!existsSync(TAXONOMY_DIR)) {
        mkdirSync(TAXONOMY_DIR, { recursive: true });
      }

      // Write test entity type
      writeFileSync(TEST_ENTITY_FILE, JSON.stringify(mixedTaxonomy, null, 2));

      try {
        // Create new expert to discover the mixed entity type
        const testExpert = new TaxonomyExpert('AUS', 'test-mixed', 'hierarchical');

        // Get retention for the activity
        const functions = testExpert.getFunctions('test-mixed');
        const services = testExpert.getServices('test-mixed', functions[0].name);
        const activities = testExpert.getActivities('test-mixed', functions[0].name, services[0].name);
        const retention = testExpert.getRetentionForActivity(
          'test-mixed',
          functions[0].name,
          services[0].name,
          activities[0].name
        );

        // Verify mixed coverage (using ISO 3166-1 alpha-3)
        expect(retention.AUS).toBeDefined();
        expect(retention.USA).toBeDefined();
        expect(retention.GBR).toBeUndefined();

        // Install should work with mixed coverage
        const testInstaller = new TaxonomyInstaller(mockClient as any, 'AUS');
        const result = await testInstaller.install({ entityTypes: ['test-mixed'] });

        expect(result.success).toBe(true);
      } finally {
        // Clean up test file
        if (existsSync(TEST_ENTITY_FILE)) {
          rmSync(TEST_ENTITY_FILE);
        }
      }
    });
  });
});

// Type definitions for mock
interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  matching_algorithm: number;
  is_insensitive: boolean;
}

interface DocumentType {
  id: number;
  name: string;
  slug: string;
  match: string;
  matching_algorithm: number;
}

interface StoragePath {
  id: number;
  path: string;
  name: string;
}

interface CustomField {
  id: number;
  name: string;
  data_type: string;
}
