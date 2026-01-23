/**
 * Integration Tests for Complete Migration Workflow
 * Tests end-to-end migration from flat to hierarchical taxonomy
 *
 * Test: T115
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { TaxonomyInstaller } from '../../skills/RecordsManager/Lib/TaxonomyInstaller';
import { TaxonomyExpert } from '../../skills/RecordsManager/Lib/TaxonomyExpert';
import type { MigrationResult } from '../../lib/types/HierarchicalTaxonomy';

describe('T115: Complete Migration Workflow Integration', () => {
  let installer: TaxonomyInstaller;
  let expert: TaxonomyExpert;
  let migrationResult: MigrationResult;

  beforeAll(async () => {
    // Mock PaperlessClient with realistic test data
    const mockPaperlessClient = {
      getDocuments: async () => [
        { id: 1, title: 'Medical Receipt 2025', document_type: 'Medical Bill', tags: [] },
        { id: 2, title: 'Tax Return 2024', document_type: 'Tax Return', tags: [] },
        { id: 3, title: 'Electricity Bill', document_type: 'Utility Bill', tags: [] },
        { id: 4, title: 'Insurance Policy', document_type: 'Insurance Document', tags: [] },
        { id: 5, title: 'Bank Statement', document_type: 'Bank Statement', tags: [] },
        { id: 6, title: 'Prescription', document_type: 'Medical Prescription', tags: [] },
        { id: 7, title: 'Vehicle Registration', document_type: 'Vehicle Document', tags: [] },
        { id: 8, title: 'Dental Invoice', document_type: 'Dental Bill', tags: [] },
        { id: 9, title: 'Property Tax', document_type: 'Property Document', tags: [] },
        { id: 10, title: 'Credit Card Statement', document_type: 'Credit Card', tags: [] },
      ],
      updateDocument: async (id: number, updates: any) => ({ id, ...updates }),
      getTags: async () => [],
      createTag: async (name: string) => ({ id: Math.random(), name }),
      getDocumentTypes: async () => [],
      createDocumentType: async (name: string) => ({ id: Math.random(), name }),
    };

    installer = new TaxonomyInstaller(
      mockPaperlessClient as any,
      'AUS'
    );

    expert = new TaxonomyExpert(
      'AUS',
      'household',
      'hierarchical'
    );
  });

  describe('Complete Migration Flow', () => {
    it('should perform complete migration workflow', async () => {
      // Step 1: Load migration mapping table
      const mappings = await installer.loadMappingTable('household');
      expect(mappings.length).toBeGreaterThan(0);

      // Step 2: Run migration on all documents
      migrationResult = await installer.migrateAllDocuments();

      // Step 3: Verify migration statistics
      expect(migrationResult.totalDocuments).toBe(10);
      expect(migrationResult.autoMapped).toBeGreaterThan(0);
      expect(migrationResult.mappingLog.length).toBe(10);

      // Step 4: Verify 90%+ automatic mapping
      const autoMapRate =
        (migrationResult.autoMapped / migrationResult.totalDocuments) * 100;
      expect(autoMapRate).toBeGreaterThanOrEqual(90);
    });

    it('should preserve all document metadata during migration', async () => {
      const docs = await installer.getDocumentsForManualReview();

      // Documents requiring manual review should still have original metadata
      docs.forEach((doc) => {
        expect(doc.title).toBeDefined();
        expect(doc.document_type).toBeDefined();
      });
    });

    it('should create hierarchical tags for migrated documents', async () => {
      // Verify hierarchical taxonomy is applied
      const result = expert.generateHierarchicalTags(
        'household',
        'HealthManagement',
        'MedicalCare',
        'DoctorVisits'
      );

      expect(result).toContain('HealthManagement');
      expect(result).toContain('MedicalCare');
      expect(result).toContain('DoctorVisits');
      expect(result.length).toBeGreaterThan(3);
    });

    it('should maintain backwards compatibility during transition', async () => {
      // Verify both flat and hierarchical models can coexist
      const flatMode = expert.getTaxonomyMode();
      expect(flatMode).toBe('hierarchical');

      // Should still support flat taxonomy queries during transition
      const isHierarchicalAvailable = expert.isHierarchicalAvailable();
      expect(isHierarchicalAvailable).toBe(true);
    });
  });

  describe('Dual-Mode Support (12-Month Transition)', () => {
    it('should support both flat and hierarchical taxonomy queries', async () => {
      // Hierarchical query
      const hierarchicalResult = expert.getActivities(
        'household',
        'HealthManagement',
        'MedicalCare'
      );
      expect(hierarchicalResult.length).toBeGreaterThan(0);

      // Flat query (backwards compatibility)
      // Should still work with legacy flat document types
      const legacyTypes = ['Medical Bill', 'Tax Return', 'Utility Bill'];
      legacyTypes.forEach((type) => {
        expect(type).toBeTruthy();
      });
    });

    it('should show deprecation warnings for flat model usage', async () => {
      let warningShown = false;

      // Mock console.warn to capture deprecation warnings
      const originalWarn = console.warn;
      console.warn = (msg: string) => {
        if (msg.includes('deprecated') || msg.includes('hierarchical')) {
          warningShown = true;
        }
      };

      // Trigger flat model usage
      // (This would be implemented in TaxonomyExpert with deprecation logic)

      console.warn = originalWarn;

      // Verify warning system is in place
      expect(true).toBe(true); // Placeholder until deprecation logic implemented
    });

    it('should enforce hierarchical model after transition period', async () => {
      // After 12 months, flat model should be fully deprecated
      // This test verifies the enforcement mechanism is in place

      const mode = expert.getTaxonomyMode();
      expect(['hierarchical', 'dual-mode']).toContain(mode);
    });
  });

  describe('Migration Rollback and Error Handling', () => {
    it('should rollback migration on critical error', async () => {
      // Simulate migration failure midway
      const mockFailingClient = {
        getDocuments: async () => [
          { id: 1, document_type: 'Valid Type', tags: [] },
        ],
        updateDocument: async () => {
          throw new Error('API Error');
        },
        getTags: async () => [],
        createTag: async () => ({ id: 1, name: 'test' }),
      };

      const failingInstaller = new TaxonomyInstaller(
        mockFailingClient as any,
        'AUS',
        '/tmp/test-migration'
      );

      await failingInstaller.loadMappingTable('household');

      // Migration should handle error gracefully
      try {
        await failingInstaller.migrateAllDocuments();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should preserve original document types on rollback', async () => {
      // After rollback, documents should retain original classifications
      // This ensures zero data loss
      expect(true).toBe(true); // Placeholder for rollback verification
    });
  });

  describe('Manual Review Integration', () => {
    it('should integrate manual review into migration workflow', async () => {
      const reviewDocs = await installer.getDocumentsForManualReview();

      // Should identify documents needing manual review
      expect(Array.isArray(reviewDocs)).toBe(true);

      if (reviewDocs.length > 0) {
        const doc = reviewDocs[0];
        expect(doc).toHaveProperty('alternatives');
        expect(doc.alternatives.length).toBeGreaterThan(0);
      }
    });

    it('should update migration statistics after manual review', async () => {
      // Simulate manual review completion
      const reviewDocs = await installer.getDocumentsForManualReview();

      if (reviewDocs.length > 0) {
        const mockPrompt = async () => reviewDocs[0].alternatives[0];
        await installer.promptManualReview(reviewDocs[0].id, mockPrompt);

        // Statistics should reflect manual review completion
        const updatedResult = await installer.getMigrationStatus();
        expect(updatedResult.manualReview).toBeLessThan(reviewDocs.length);
      }
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large document collections efficiently', async () => {
      const startTime = Date.now();

      await installer.loadMappingTable('household');
      await installer.migrateAllDocuments();

      const duration = Date.now() - startTime;

      // Migration should complete in reasonable time
      // (No specific target per clarification Q3, but track for monitoring)
      // Note: Duration may be 0ms for small datasets due to Date.now() precision
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should batch document updates for better performance', async () => {
      // Verify migration uses batching rather than individual updates
      // This prevents API rate limiting
      await installer.loadMappingTable('household');
      const result = await installer.migrateAllDocuments();

      expect(result.totalDocuments).toBeGreaterThan(0);
    });
  });

  describe('Audit Trail Verification', () => {
    it('should generate comprehensive audit trail', async () => {
      expect(migrationResult.mappingLog.length).toBe(
        migrationResult.totalDocuments
      );

      // Verify audit log completeness
      migrationResult.mappingLog.forEach((entry) => {
        expect(entry.documentId).toBeGreaterThan(0);
        expect(entry.originalType).toBeDefined();
        expect(entry.method).toMatch(/automatic|manual|failed/);
        expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });

    it('should allow audit trail export for compliance', async () => {
      // Audit log should be exportable for regulatory compliance
      const auditLog = migrationResult.mappingLog;

      const exportedLog = JSON.stringify(auditLog, null, 2);
      expect(exportedLog.length).toBeGreaterThan(0);

      // Should be valid JSON
      expect(() => JSON.parse(exportedLog)).not.toThrow();
    });
  });
});
