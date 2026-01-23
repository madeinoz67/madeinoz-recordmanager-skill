// Integration test for taxonomy installation workflow
// $PAI_DIR/src/tests/integration/installation.test.ts
/**
 * Phase 4 (User Story 1) - Integration Tests
 *
 * T040: Integration test for full installation workflow
 *
 * End-to-end tests for:
 * - Complete taxonomy installation for all entity types
 * - Paperless-ngx integration
 * - Hierarchical taxonomy navigation
 * - Cross-entity type consistency
 * - Performance with large taxonomies
 * - Migration from flat to hierarchical
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { TaxonomyInstaller } from '../../skills/RecordsManager/Lib/TaxonomyInstaller';
import { TaxonomyExpert } from '../../skills/RecordsManager/Lib/TaxonomyExpert';
import { PaperlessClient } from '../../skills/RecordsManager/Lib/PaperlessClient';
import { Domain } from '../../skills/RecordsManager/Lib/TaxonomyExpert';

// ============================================================================
// Mock PaperlessClient for Integration Testing
// ============================================================================

/**
 * In-memory mock that simulates paperless-ngx API behavior
 */
class IntegrationMockClient implements Partial<PaperlessClient> {
  private tags: Map<number, any> = new Map();
  private documentTypes: Map<number, any> = new Map();
  private storagePaths: Map<number, any> = new Map();
  private customFields: Map<number, any> = new Map();
  private tagIdCounter = 1;
  private docTypeIdCounter = 1;
  private storagePathIdCounter = 1;
  private customFieldIdCounter = 1;

  async getTags() {
    return Array.from(this.tags.values());
  }

  async getDocumentTypes() {
    return Array.from(this.documentTypes.values());
  }

  async getStoragePaths() {
    return Array.from(this.storagePaths.values());
  }

  async getCustomFields() {
    return Array.from(this.customFields.values());
  }

  async getOrCreateTag(name: string, color?: string) {
    const existing = Array.from(this.tags.values()).find(
      (t: any) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const tag = {
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

  async createTag(name: string, color?: string) {
    return this.getOrCreateTag(name, color);
  }

  async getOrCreateDocumentType(name: string) {
    const existing = Array.from(this.documentTypes.values()).find(
      (dt: any) => dt.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const docType = {
      id: this.docTypeIdCounter++,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      match: name,
      matching_algorithm: 0,
      is_insensitive: true,
    };
    this.documentTypes.set(docType.id, docType);
    return docType;
  }

  async createDocumentType(name: string) {
    return this.getOrCreateDocumentType(name);
  }

  async getOrCreateStoragePath(path: string) {
    const existing = Array.from(this.storagePaths.values()).find(
      (sp: any) => sp.path.toLowerCase() === path.toLowerCase()
    );
    if (existing) return existing;

    const storagePath = {
      id: this.storagePathIdCounter++,
      name: path.split('/').pop() || path,
      path,
      document_count: 0,
    };
    this.storagePaths.set(storagePath.id, storagePath);
    return storagePath;
  }

  async createStoragePath(path: string, name?: string) {
    return this.getOrCreateStoragePath(path);
  }

  async createCustomField(field: { name: string; data_type: string }) {
    const existing = Array.from(this.customFields.values()).find(
      (cf: any) => cf.name.toLowerCase() === field.name.toLowerCase()
    );
    if (existing) return existing;

    const customField = {
      id: this.customFieldIdCounter++,
      name: field.name,
      data_type: field.data_type,
    };
    this.customFields.set(customField.id, customField);
    return customField;
  }

  async deleteTag(id: number) {
    this.tags.delete(id);
  }

  async deleteDocumentType(id: number) {
    this.documentTypes.delete(id);
  }

  async deleteStoragePath(id: number) {
    this.storagePaths.delete(id);
  }

  async deleteCustomField(id: number) {
    this.customFields.delete(id);
  }

  /**
   * Get statistics about installed resources
   */
  getStats() {
    return {
      tags: this.tags.size,
      documentTypes: this.documentTypes.size,
      storagePaths: this.storagePaths.size,
      customFields: this.customFields.size,
    };
  }

  /**
   * Reset all mock data
   */
  reset() {
    this.tags.clear();
    this.documentTypes.clear();
    this.storagePaths.clear();
    this.customFields.clear();
    this.tagIdCounter = 1;
    this.docTypeIdCounter = 1;
    this.storagePathIdCounter = 1;
    this.customFieldIdCounter = 1;
  }
}

// ============================================================================
// Integration Test Suite
// ============================================================================

describe('Taxonomy Installation Integration Tests (T040)', () => {
  let mockClient: IntegrationMockClient;
  let installer: TaxonomyInstaller;
  let taxonomyExpert: TaxonomyExpert;

  beforeAll(() => {
    mockClient = new IntegrationMockClient();
    installer = new TaxonomyInstaller(mockClient as unknown as PaperlessClient, 'AUS');
    taxonomyExpert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
  });

  afterAll(() => {
    mockClient.reset();
  });

  // ========================================================================
  // Full Installation Workflow Tests
  // ========================================================================

  describe('Full Installation Workflow', () => {
    test('should install all entity types successfully', async () => {
      const result = await installer.install();

      expect(result.success).toBe(true);
      expect(result.country).toBe('AUS');
      expect(result.entityTypes.length).toBeGreaterThan(0);

      // Verify resources were created
      expect(result.installed.tags).toBeGreaterThan(0);
      expect(result.installed.documentTypes).toBeGreaterThan(0);
      expect(result.installed.storagePaths).toBeGreaterThan(0);

      // Get stats from mock client
      const stats = mockClient.getStats();
      expect(stats.tags).toBeGreaterThan(0);
      expect(stats.documentTypes).toBeGreaterThan(0);
      expect(stats.storagePaths).toBeGreaterThan(0);
    });

    test('should handle re-installation gracefully (idempotency)', async () => {
      // First installation
      const result1 = await installer.install();
      expect(result1.success).toBe(true);

      const stats1 = mockClient.getStats();

      // Second installation should skip existing resources
      const result2 = await installer.install();
      expect(result2.success).toBe(true);

      const stats2 = mockClient.getStats();

      // Stats should be identical (no new resources created)
      expect(stats2.tags).toBe(stats1.tags);
      expect(stats2.documentTypes).toBe(stats1.documentTypes);
      expect(stats2.storagePaths).toBe(stats1.storagePaths);

      // Second installation should have skipped resources
      expect(result2.installed.tags).toBe(0);
      expect(result2.installed.documentTypes).toBe(0);
      expect(result2.installed.storagePaths).toBe(0);
    });

    test('should install specific entity types when requested', async () => {
      mockClient.reset();

      const entityTypes: Domain[] = ['household', 'corporate'];
      const result = await installer.install({
        entityTypes,
      });

      expect(result.success).toBe(true);
      expect(result.entityTypes).toEqual(entityTypes);
      expect(result.installed.storagePaths).toBe(2);

      const stats = mockClient.getStats();
      expect(stats.storagePaths).toBe(2);
    });
  });

  // ========================================================================
  // Hierarchical Taxonomy Integration Tests
  // ========================================================================

  describe('Hierarchical Taxonomy Integration', () => {
    test('should navigate complete hierarchy for all entity types', () => {
      const domains = taxonomyExpert.getSupportedDomains();

      expect(domains.length).toBeGreaterThanOrEqual(8);

      // Verify each entity type has complete hierarchy
      for (const domain of domains) {
        const taxonomy = taxonomyExpert.getHierarchicalTaxonomy(domain as Domain);
        expect(taxonomy).toBeDefined();

        const functions = taxonomyExpert.getFunctions(domain as Domain);
        expect(functions.length).toBeGreaterThan(0);

        for (const func of functions) {
          const services = taxonomyExpert.getServices(domain as Domain, func.name);
          expect(services.length).toBeGreaterThan(0);

          for (const service of services) {
            const activities = taxonomyExpert.getActivities(domain as Domain, func.name, service.name);
            expect(activities.length).toBeGreaterThan(0);

            for (const activity of activities) {
              const docTypes = taxonomyExpert.getDocumentTypesForActivity(
                domain as Domain,
                func.name,
                service.name,
                activity.name
              );
              expect(docTypes.length).toBeGreaterThan(0);

              const retention = taxonomyExpert.getRetentionForActivity(
                domain as Domain,
                func.name,
                service.name,
                activity.name
              );
              expect(Object.keys(retention).length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    test('should flatten hierarchy for backward compatibility', () => {
      const domains = taxonomyExpert.getSupportedDomains();

      for (const domain of domains) {
        // getAllDocumentTypes should return flat list
        const docTypes = taxonomyExpert.getAllDocumentTypes(domain as Domain);
        expect(Array.isArray(docTypes)).toBe(true);
        expect(docTypes.length).toBeGreaterThan(0);

        // getAllTagCategories should return flat categories
        const tagCategories = taxonomyExpert.getAllTagCategories(domain as Domain);
        expect(typeof tagCategories).toBe('object');
        expect(Object.keys(tagCategories).length).toBeGreaterThan(0);
      }
    });

    test('should maintain consistency between hierarchical and flat views', () => {
      const domain = 'household' as Domain;

      // Get hierarchical document types
      const functions = taxonomyExpert.getFunctions(domain);
      const hierarchicalDocTypes = new Set<string>();

      for (const func of functions) {
        const services = taxonomyExpert.getServices(domain, func.name);
        for (const service of services) {
          const activities = taxonomyExpert.getActivities(domain, func.name, service.name);
          for (const activity of activities) {
            const docTypes = taxonomyExpert.getDocumentTypesForActivity(
              domain,
              func.name,
              service.name,
              activity.name
            );
            docTypes.forEach(dt => hierarchicalDocTypes.add(dt));
          }
        }
      }

      // Get flat document types
      const flatDocTypes = taxonomyExpert.getAllDocumentTypes(domain);

      // Should have same document types
      expect(flatDocTypes.length).toBe(hierarchicalDocTypes.size);

      for (const docType of flatDocTypes) {
        expect(hierarchicalDocTypes.has(docType)).toBe(true);
      }
    });
  });

  // ========================================================================
  // Cross-Entity Type Consistency Tests
  // ========================================================================

  describe('Cross-Entity Type Consistency', () => {
    test('should use consistent document type names across entity types', () => {
      const domains = taxonomyExpert.getSupportedDomains();
      const allDocTypes = new Map<string, Set<Domain>>();

      for (const domain of domains) {
        const docTypes = taxonomyExpert.getAllDocumentTypes(domain as Domain);
        for (const docType of docTypes) {
          if (!allDocTypes.has(docType)) {
            allDocTypes.set(docType, new Set());
          }
          allDocTypes.get(docType)!.add(domain as Domain);
        }
      }

      // Verify that common document types (like "Invoice") appear in multiple entity types
      const invoice = allDocTypes.get('Invoice');
      expect(invoice).toBeDefined();
      expect(invoice!.size).toBeGreaterThan(1);
    });

    test('should create unique storage paths per entity type', async () => {
      mockClient.reset();

      const result = await installer.install();
      const storagePaths = await mockClient.getStoragePaths();

      // Should have one storage path per entity type
      expect(result.installed.storagePaths).toBe(result.entityTypes.length);
      expect(storagePaths.length).toBe(result.entityTypes.length);

      // Verify storage paths are unique
      const paths = storagePaths.map(sp => sp.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    test('should apply correct custom fields to entity types', async () => {
      mockClient.reset();

      await installer.install({
        entityTypes: ['family-trust', 'person', 'household'],
      });

      const customFields = await mockClient.getCustomFields();

      // Should have custom fields for trust and person, not household
      expect(customFields.length).toBe(2);

      const fieldNames = customFields.map(cf => cf.name);
      expect(fieldNames).toContain('family-trust-name');
      expect(fieldNames).toContain('person-name');
      expect(fieldNames).not.toContain('household-name');
    });
  });

  // ========================================================================
  // Performance Tests
  // ========================================================================

  describe('Performance', () => {
    test('should handle large taxonomies efficiently', async () => {
      mockClient.reset();

      const startTime = Date.now();

      const result = await installer.install();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);

      // Should complete within reasonable time (adjust as needed)
      // This is a soft check - actual performance depends on system
      console.log(`Installation completed in ${duration}ms`);
      expect(duration).toBeLessThan(30000); // 30 seconds max for all entity types
    });

    test('should handle change detection efficiently', async () => {
      await installer.install();

      const startTime = Date.now();

      const diff = await installer.detectChanges();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(diff).toBeDefined();
      console.log(`Change detection completed in ${duration}ms`);
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    test('should validate all taxonomies efficiently', () => {
      const startTime = Date.now();

      const domains = taxonomyExpert.getSupportedDomains();

      for (const domain of domains) {
        const functions = taxonomyExpert.getFunctions(domain as Domain);
        expect(functions.length).toBeGreaterThan(0);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Validated ${domains.length} entity types in ${duration}ms`);
      expect(duration).toBeLessThan(5000); // 5 seconds max for validation
    });
  });

  // ========================================================================
  // Error Recovery Tests
  // ========================================================================

  describe('Error Recovery', () => {
    test('should maintain consistency after partial failure', async () => {
      mockClient.reset();

      // This test verifies that the system can recover from failures
      // and maintain consistent state

      // First successful installation
      const result1 = await installer.install({
        entityTypes: ['household'],
      });

      expect(result1.success).toBe(true);
      const stats1 = mockClient.getStats();

      // Simulate failure by trying to install with different configuration
      // (In real scenario, this would be a network error or API failure)
      // For now, we verify that subsequent installations work

      const result2 = await installer.install({
        entityTypes: ['corporate'],
      });

      expect(result2.success).toBe(true);
      const stats2 = mockClient.getStats();

      // Should have resources from both installations
      expect(stats2.tags).toBeGreaterThan(stats1.tags);
      expect(stats2.documentTypes).toBeGreaterThan(stats1.documentTypes);
      expect(stats2.storagePaths).toBe(stats1.storagePaths + 1);
    });

    test('should handle concurrent operations safely', async () => {
      mockClient.reset();

      // Run multiple installations concurrently
      const promises = [
        installer.install({ entityTypes: ['household'] }),
        installer.install({ entityTypes: ['corporate'] }),
        installer.install({ entityTypes: ['person'] }),
      ];

      const results = await Promise.all(promises);

      // All should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify final state is consistent
      const stats = mockClient.getStats();
      expect(stats.storagePaths).toBeGreaterThanOrEqual(3);
    });
  });

  // ========================================================================
  // Country-Specific Tests
  // ========================================================================

  describe('Country-Specific Behavior', () => {
    test('should use correct retention rules for Australia', () => {
      const expertAU = new TaxonomyExpert('AUS', 'household', 'hierarchical');

      const functions = expertAU.getFunctions('household');
      const services = expertAU.getServices('household', functions[0].name);
      const activities = expertAU.getActivities('household', functions[0].name, services[0].name);

      const retention = expertAU.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Should have AU retention rules
      expect(retention).toBeDefined();
      expect(retention.AUS).toBeDefined();
      expect(retention.AUS.years).toBeDefined();
      expect(retention.AUS.authority).toBeDefined();
    });

    test('should fallback gracefully for unsupported countries', () => {
      // Should not throw for unsupported country
      expect(() => {
        new TaxonomyExpert('Unsupported', 'household', 'hierarchical');
      }).not.toThrow();

      const installerFallback = new TaxonomyInstaller(
        mockClient as unknown as PaperlessClient,
        'Unsupported'
      );

      expect(installerFallback).toBeDefined();
    });
  });

  // ========================================================================
  // Data Integrity Tests
  // ========================================================================

  describe('Data Integrity', () => {
    test('should maintain referential integrity', async () => {
      mockClient.reset();

      await installer.install();

      const tags = await mockClient.getTags();
      const documentTypes = await mockClient.getDocumentTypes();
      const storagePaths = await mockClient.getStoragePaths();

      // Verify all resources have valid IDs
      tags.forEach(tag => {
        expect(tag.id).toBeDefined();
        expect(tag.id).toBeGreaterThan(0);
        expect(tag.name).toBeDefined();
        expect(tag.name.length).toBeGreaterThan(0);
      });

      documentTypes.forEach(dt => {
        expect(dt.id).toBeDefined();
        expect(dt.id).toBeGreaterThan(0);
        expect(dt.name).toBeDefined();
        expect(dt.name.length).toBeGreaterThan(0);
      });

      storagePaths.forEach(sp => {
        expect(sp.id).toBeDefined();
        expect(sp.id).toBeGreaterThan(0);
        expect(sp.path).toBeDefined();
        expect(sp.path.length).toBeGreaterThan(0);
      });
    });

    test('should handle special characters in names', async () => {
      mockClient.reset();

      // Hierarchical taxonomies should handle special characters
      const result = await installer.install({
        entityTypes: ['household'],
      });

      expect(result.success).toBe(true);

      const tags = await mockClient.getTags();

      // Verify tag names don't have problematic characters
      tags.forEach(tag => {
        expect(tag.slug).not.toContain('/');
        expect(tag.slug).not.toContain(' ');
      });
    });

    test('should maintain case-insensitive uniqueness', async () => {
      mockClient.reset();

      // Create a tag with specific case
      await mockClient.getOrCreateTag('TestInvoice', '#ff0000');

      // Install taxonomy that includes similar tag
      await installer.install({
        entityTypes: ['household'],
      });

      const tags = await mockClient.getTags();

      // Should not have duplicate tags (case-insensitive)
      const testInvoiceTags = tags.filter(t => t.name.toLowerCase() === 'testinvoice');
      expect(testInvoiceTags.length).toBe(1);
    });
  });

  // ========================================================================
  // Migration Readiness Tests
  // ========================================================================

  describe('Migration Readiness', () => {
    test('should support backward compatibility with flat taxonomies', () => {
      // Create expert in hierarchical mode
      const expertHierarchical = new TaxonomyExpert('AUS', 'household', 'hierarchical');

      // Get flat view
      const docTypes = expertHierarchical.getAllDocumentTypes('household');
      const tagCategories = expertHierarchical.getAllTagCategories('household');

      expect(docTypes).toBeDefined();
      expect(Array.isArray(docTypes)).toBe(true);
      expect(tagCategories).toBeDefined();
      expect(typeof tagCategories).toBe('object');

      // Verify flat mode still works
      const expertFlat = new TaxonomyExpert('AUS', 'household', 'flat');
      const flatDocTypes = expertFlat.getDocumentTypes('household');
      const flatTagCategories = expertFlat.getTagCategories('household');

      expect(flatDocTypes).toBeDefined();
      expect(flatTagCategories).toBeDefined();
    });

    test('should detect hierarchical availability', () => {
      const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');

      expect(expert.isHierarchicalAvailable()).toBe(true);
      expect(expert.getTaxonomyMode()).toBe('hierarchical');
    });
  });

  // ========================================================================
  // Comprehensive Coverage Tests
  // ========================================================================

  describe('Comprehensive Coverage', () => {
    test('should cover all entity types with complete hierarchies', () => {
      const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
      const domains = expert.getSupportedDomains();

      // Expected entity types
      const expectedTypes: Domain[] = [
        'household',
        'corporate',
        'unit-trust',
        'discretionary-trust',
        'family-trust',
        'hybrid-trust',
        'project',
        'person',
      ];

      expect(domains.length).toBeGreaterThanOrEqual(expectedTypes.length);

      for (const type of expectedTypes) {
        expect(domains).toContain(type);
      }
    });

    test('should have complete data for all activities', () => {
      const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
      const domains = expert.getSupportedDomains();

      let totalActivities = 0;
      let activitiesWithDocTypes = 0;
      let activitiesWithRetention = 0;

      for (const domain of domains) {
        const functions = expert.getFunctions(domain);

        for (const func of functions) {
          const services = expert.getServices(domain, func.name);

          for (const service of services) {
            const activities = expert.getActivities(domain, func.name, service.name);

            for (const activity of activities) {
              totalActivities++;

              const docTypes = expert.getDocumentTypesForActivity(
                domain,
                func.name,
                service.name,
                activity.name
              );

              const retention = expert.getRetentionForActivity(
                domain,
                func.name,
                service.name,
                activity.name
              );

              if (docTypes.length > 0) activitiesWithDocTypes++;
              if (Object.keys(retention).length > 0) activitiesWithRetention++;
            }
          }
        }
      }

      console.log(`Total activities: ${totalActivities}`);
      console.log(`Activities with document types: ${activitiesWithDocTypes}`);
      console.log(`Activities with retention: ${activitiesWithRetention}`);

      // All activities should have document types and retention
      expect(activitiesWithDocTypes).toBe(totalActivities);
      expect(activitiesWithRetention).toBe(totalActivities);
    });
  });
});
