/**
 * Migration Tests for TaxonomyInstaller
 * Tests automatic mapping, manual review, and audit logging
 *
 * Tests: T112-T114
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TaxonomyInstaller } from '../skills/RecordsManager/Lib/TaxonomyInstaller';
import type {
  MigrationMapping,
  MigrationResult,
  DocumentMappingEntry,
} from '../lib/types/HierarchicalTaxonomy';

// Mock PaperlessClient
const mockDocuments = [
  {
    id: 1,
    title: 'Medical Receipt',
    document_type: 'Medical Bill',
    tags: [],
  },
  {
    id: 2,
    title: 'Tax Return 2025',
    document_type: 'Tax Return',
    tags: [],
  },
  {
    id: 3,
    title: 'Electricity Bill June',
    document_type: 'Electricity Bill',
    tags: [],
  },
  {
    id: 4,
    title: 'Bank Statement',
    document_type: 'Bank Statement',
    tags: [],
  },
  {
    id: 5,
    title: 'Dental Invoice',
    document_type: 'Dental Bill',
    tags: [],
  },
  {
    id: 6,
    title: 'Gas Bill July',
    document_type: 'Gas Bill',
    tags: [],
  },
  {
    id: 7,
    title: 'Water Bill August',
    document_type: 'Water Bill',
    tags: [],
  },
  {
    id: 8,
    title: 'Prescription Receipt',
    document_type: 'Pharmacy Receipt',
    tags: [],
  },
  {
    id: 9,
    title: 'Payslip',
    document_type: 'Payslip',
    tags: [],
  },
  {
    id: 10,
    title: 'Insurance Policy',
    document_type: 'Insurance Document',
    tags: [],
  },
];

const mockPaperlessClient = {
  getDocuments: async () => mockDocuments,
  updateDocument: async (id: number, updates: any) => ({
    id,
    ...updates,
  }),
  getTags: async () => [],
  createTag: async (name: string) => ({ id: 999, name }),
};

describe('TaxonomyInstaller - Migration (T112-T114)', () => {
  let installer: TaxonomyInstaller;

  beforeEach(() => {
    installer = new TaxonomyInstaller(
      mockPaperlessClient as any,
      'AUS',
      '/tmp/test-taxonomies'
    );
  });

  describe('T112: Automatic Mapping', () => {
    it('should load migration mapping table from JSON', async () => {
      const mapping = await installer.loadMappingTable('household');

      expect(mapping).toBeDefined();
      expect(Array.isArray(mapping)).toBe(true);
      expect(mapping.length).toBeGreaterThan(0);

      // Verify mapping structure
      const firstMapping = mapping[0];
      expect(firstMapping).toHaveProperty('flatType');
      expect(firstMapping).toHaveProperty('hierarchicalPath');
      expect(firstMapping).toHaveProperty('confidence');
      expect(firstMapping).toHaveProperty('rationale');
    });

    it('should retrieve mapping for a flat document type', async () => {
      await installer.loadMappingTable('household');

      const mapping = installer.getMapping('Medical Bill');

      expect(mapping).toBeDefined();
      expect(mapping?.flatType).toBe('Medical Bill');
      expect(mapping?.confidence).toBe('high');
      expect(mapping?.hierarchicalPath).toMatch(
        /HealthManagement\/MedicalCare/
      );
    });

    it('should return undefined for unmapped document type', async () => {
      await installer.loadMappingTable('household');

      const mapping = installer.getMapping('Nonexistent Type');

      expect(mapping).toBeUndefined();
    });

    it('should auto-map document with high confidence mapping', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateDocument(1);

      expect(result.method).toBe('automatic');
      expect(result.newPath).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.originalType).toBe('Medical Bill');
    });

    it('should flag document with ambiguous mapping for manual review', async () => {
      await installer.loadMappingTable('household');

      // "Insurance Document" has multiple valid paths (document 10)
      const result = await installer.migrateDocument(10);

      expect(result.method).toBe('manual');
      expect(result.newPath).toBeUndefined();
      expect(result.originalType).toBe('Insurance Document');
    });

    it('should fail migration for document with no mapping', async () => {
      await installer.loadMappingTable('household');

      // Create a document with a type that has no mapping
      const unmappedDoc = {
        id: 999,
        title: 'Unknown Type',
        document_type: 'Completely Unknown Type',
        tags: [],
      };

      // Temporarily add it to the mock
      const originalGetDocs = mockPaperlessClient.getDocuments;
      mockPaperlessClient.getDocuments = async () => [
        ...mockDocuments,
        unmappedDoc,
      ];

      const result = await installer.migrateDocument(999);

      expect(result.method).toBe('failed');
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No mapping found');

      // Restore original mock
      mockPaperlessClient.getDocuments = originalGetDocs;
    });

    it('should achieve 90%+ automatic mapping rate', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      const autoMapRate = (result.autoMapped / result.totalDocuments) * 100;

      expect(autoMapRate).toBeGreaterThanOrEqual(90);
      expect(result.autoMapped).toBeGreaterThan(0);
      expect(result.manualReview).toBeLessThanOrEqual(result.totalDocuments * 0.1);
    });
  });

  describe('T113: Manual Review Workflow', () => {
    it('should retrieve documents requiring manual review', async () => {
      await installer.loadMappingTable('household');
      await installer.migrateAllDocuments();

      const reviewDocs = await installer.getDocumentsForManualReview();

      expect(Array.isArray(reviewDocs)).toBe(true);
      reviewDocs.forEach((doc) => {
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('document_type');
        expect(doc).toHaveProperty('alternatives');
      });
    });

    it('should prompt user for manual review and update document', async () => {
      await installer.loadMappingTable('household');

      // Simulate user selecting an alternative path
      const userChoice = 'HealthManagement/Insurance/Claims/Insurance Claim';
      const mockPrompt = async (doc: any, alternatives: string[]) => userChoice;

      const result = await installer.promptManualReview(10, mockPrompt);

      expect(result.method).toBe('manual');
      expect(result.newPath).toBe(userChoice);
      expect(result.documentId).toBe(10);
    });

    it('should handle user skipping manual review', async () => {
      await installer.loadMappingTable('household');

      // Simulate user skipping
      const mockPrompt = async () => undefined;

      const result = await installer.promptManualReview(10, mockPrompt);

      expect(result.method).toBe('failed');
      expect(result.error).toContain('Skipped by user');
    });

    it('should support alternative path suggestions for ambiguous types', async () => {
      await installer.loadMappingTable('household');

      const mapping = installer.getMapping('Insurance Document');

      expect(mapping?.hierarchicalPath).toBe('AMBIGUOUS');
      expect(mapping?.alternatives).toBeDefined();
      expect(mapping!.alternatives!.length).toBeGreaterThan(1);
    });
  });

  describe('T114: Audit Logging', () => {
    it('should create audit log entry for each migrated document', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      expect(result.mappingLog).toBeDefined();
      expect(result.mappingLog.length).toBe(result.totalDocuments);

      result.mappingLog.forEach((entry: DocumentMappingEntry) => {
        expect(entry).toHaveProperty('documentId');
        expect(entry).toHaveProperty('originalType');
        expect(entry).toHaveProperty('method');
        expect(entry).toHaveProperty('timestamp');
        expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
      });
    });

    it('should log automatic mappings with new path', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      const autoMappedEntries = result.mappingLog.filter(
        (e: DocumentMappingEntry) => e.method === 'automatic'
      );

      autoMappedEntries.forEach((entry: DocumentMappingEntry) => {
        expect(entry.newPath).toBeDefined();
        expect(entry.error).toBeUndefined();
      });
    });

    it('should log manual review entries without new path', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      const manualEntries = result.mappingLog.filter(
        (e: DocumentMappingEntry) => e.method === 'manual'
      );

      manualEntries.forEach((entry: DocumentMappingEntry) => {
        expect(entry.newPath).toBeUndefined();
        expect(entry.error).toBeUndefined();
      });
    });

    it('should log failed migrations with error message', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      const failedEntries = result.mappingLog.filter(
        (e: DocumentMappingEntry) => e.method === 'failed'
      );

      failedEntries.forEach((entry: DocumentMappingEntry) => {
        expect(entry.error).toBeDefined();
        expect(entry.newPath).toBeUndefined();
      });
    });

    it('should include migration timestamp in result', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
    });

    it('should persist audit log to file system', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      // Verify audit log is written to disk
      const auditLogPath = `/tmp/test-taxonomies/audit/migration-${result.timestamp.replace(/:/g, '-')}.json`;
      const logExists = await Bun.file(auditLogPath).exists();

      expect(logExists).toBe(true);

      if (logExists) {
        const logContent = await Bun.file(auditLogPath).json();
        expect(logContent).toEqual(result);
      }
    });
  });

  describe('Migration Statistics', () => {
    it('should calculate correct migration statistics', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      expect(result.totalDocuments).toBe(mockDocuments.length);
      expect(result.autoMapped + result.manualReview + result.failed).toBe(
        result.totalDocuments
      );
    });

    it('should track migration progress percentage', async () => {
      await installer.loadMappingTable('household');

      const result = await installer.migrateAllDocuments();

      const successRate =
        ((result.autoMapped + result.manualReview) / result.totalDocuments) * 100;

      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });
  });
});
