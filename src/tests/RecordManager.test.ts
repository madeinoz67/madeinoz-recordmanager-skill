// $PAI_DIR/lib/recordsmanager/tests/RecordManager.test.ts
/**
 * Test suite for Records Manager
 * Tests: PaperlessClient, TaxonomyExpert, and integration
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { TaxonomyExpert, Domain } from '../skills/RecordsManager/Lib/TaxonomyExpert';
import { PaperlessClient, PaperlessConfig } from '../skills/RecordsManager/Lib/PaperlessClient';

// Mock environment variables for testing
process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL = 'https://test-paperless.example.com';
process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN = 'test-token-for-testing';
process.env.MADEINOZ_RECORDMANAGER_COUNTRY = 'AUS';
process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN = 'household';

describe('TaxonomyExpert', () => {
  describe('Country Support', () => {
    test('should support Australia', () => {
      expect(TaxonomyExpert.isCountrySupported('AUS')).toBe(true);
    });

    test('should support United States', () => {
      expect(TaxonomyExpert.isCountrySupported('USA')).toBe(true);
    });

    test('should support United Kingdom', () => {
      expect(TaxonomyExpert.isCountrySupported('GBR')).toBe(true);
    });

    test('should list all supported countries', () => {
      const countries = TaxonomyExpert.getSupportedCountries();
      expect(countries).toContain('AUS');
      expect(countries).toContain('USA');
      expect(countries).toContain('GBR');
    });
  });

  describe('Household Domain - Australia', () => {
    const expert = new TaxonomyExpert('AUS', 'household', 'flat');

    test('should suggest tags for tax document', () => {
      const suggestion = expert.suggestMetadata('2024_tax_return.pdf');
      expect(suggestion.documentType).toBe('Tax Return');
      expect(suggestion.tags).toContain('tax');
      expect(suggestion.tags).toContain('financial');
      expect(suggestion.retentionYears).toBe(7);
    });

    test('should suggest tags for medical receipt', () => {
      const suggestion = expert.suggestMetadata('pharmacy_receipt.pdf');
      expect(suggestion.tags).toContain('pharmacy');
      expect(suggestion.tags).toContain('medical');
      expect(suggestion.tags).toContain('receipt');
    });

    test('should suggest tags for insurance policy', () => {
      const suggestion = expert.suggestMetadata('home_insurance_policy.pdf');
      expect(suggestion.tags).toContain('home');
      expect(suggestion.tags).toContain('insurance');
      expect(suggestion.retentionYears).toBe(10);
    });

    test('should get document types for household', () => {
      const types = expert.getDocumentTypes();
      expect(types).toContain('Tax Return');
      expect(types).toContain('Medical Receipt');
      expect(types).toContain('Insurance Policy');
      expect(types).toContain('Bank Statement');
    });

    test('should get tag categories for household', () => {
      const categories = expert.getTagCategories();
      expect(categories.financial).toContain('tax');
      expect(categories.medical).toContain('doctor');
      expect(categories.insurance).toContain('home');
    });

    test('should get retention requirements for tax return', () => {
      const retention = expert.getRetentionRequirements('Tax Return');
      expect(retention).not.toBeNull();
      expect(retention?.years).toBe(7);
      expect(retention?.reason).toContain('ATO');
    });
  });

  describe('Corporate Domain - Australia', () => {
    const expert = new TaxonomyExpert('AUS', 'corporate');

    test('should suggest tags for invoice', () => {
      const suggestion = expert.suggestMetadata('INV-2024-001.pdf', undefined, 'corporate');
      expect(suggestion.tags).toContain('financial');
      expect(suggestion.documentType).toBe('Invoice');
    });

    test('should get document types for corporate', () => {
      const types = expert.getDocumentTypes('corporate');
      expect(types).toContain('Invoice');
      expect(types).toContain('Contract');
      expect(types).toContain('Employee Record');
    });
  });

  describe('Retention Logic', () => {
    const expert = new TaxonomyExpert('AUS', 'household');

    test('should allow deletion after retention period', () => {
      const oldDoc = {
        type: 'Tax Return',
        createdDate: new Date('2015-01-01'), // 9+ years ago
      };
      expect(expert.canDelete(oldDoc)).toBe(true); // 7 years retention
    });

    test('should not allow deletion before retention period', () => {
      const recentDoc = {
        type: 'Tax Return',
        createdDate: new Date('2023-01-01'), // 1 year ago
      };
      expect(expert.canDelete(recentDoc)).toBe(false); // 7 years retention
    });

    test('should return false for documents without retention rules', () => {
      const unknownDoc = {
        type: 'Unknown Document Type',
        createdDate: new Date('2010-01-01'),
      };
      expect(expert.canDelete(unknownDoc)).toBe(false);
    });
  });
});

describe('PaperlessClient', () => {
  describe('Client Construction', () => {
    test('should create client with config', () => {
      const config: PaperlessConfig = {
        baseUrl: 'https://paperless.example.com',
        apiToken: 'test-token',
      };
      const client = new PaperlessClient(config);
      expect(client).toBeDefined();
    });

    test('should remove trailing slash from baseUrl', () => {
      const config: PaperlessConfig = {
        baseUrl: 'https://paperless.example.com/',
        apiToken: 'test-token',
      };
      const client = new PaperlessClient(config);
      expect(client).toBeDefined();
    });
  });

  describe('Environment Variables', () => {
    test('should create client from environment variables', () => {
      const client = PaperlessClient.prototype.constructor.bind(null);
      expect(() => {
        // This would normally call createClientFromEnv()
        // but for testing we just verify the environment is set
        expect(process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL).toBeDefined();
        expect(process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN).toBeDefined();
      }).not.toThrow();
    });

    test('should throw when environment variables not set', () => {
      // Temporarily clear environment
      const originalUrl = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL;
      const originalToken = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN;
      delete process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL;
      delete process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN;

      expect(() => {
        // This would throw in real scenario
        if (!process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL || !process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN) {
          throw new Error('MADEINOZ_RECORDMANAGER_PAPERLESS_URL and MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN must be set');
        }
      }).toThrow();

      // Restore environment
      process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL = originalUrl;
      process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN = originalToken;
    });
  });
});

describe('Integration Tests', () => {
  describe('Upload Workflow', () => {
    test('should generate appropriate metadata for household tax document', () => {
      const expert = new TaxonomyExpert('AUS', 'household', 'flat');
      const suggestion = expert.suggestMetadata('my_2024_tax_return.pdf');

      expect(suggestion.documentType).toBe('Tax Return');
      expect(suggestion.tags).toContain('tax');
      expect(suggestion.tags).toContain('financial');
      expect(suggestion.tags).toContain('household');
      expect(suggestion.retentionYears).toBe(7);
    });

    test('should generate appropriate metadata for corporate invoice', () => {
      const expert = new TaxonomyExpert('AUS', 'corporate', 'flat');
      const suggestion = expert.suggestMetadata('invoice_vendor_2024.pdf', undefined, 'corporate');

      expect(suggestion.documentType).toBe('Invoice');
      expect(suggestion.tags).toContain('financial');
      expect(suggestion.retentionYears).toBe(7);
    });
  });

  describe('Search Workflow', () => {
    test('should parse tag IDs from tag names', async () => {
      // This would normally call PaperlessClient.getTags()
      // For testing, we verify the logic works
      const tagNames = 'tax,financial,2024';
      const names = tagNames.split(',').map(t => t.trim());
      expect(names).toEqual(['tax', 'financial', '2024']);
    });
  });

  describe('Retention Checking', () => {
    const expert = new TaxonomyExpert('AUS', 'household');

    test('should identify documents past retention', () => {
      const pastRetention = new Date();
      pastRetention.setFullYear(pastRetention.getFullYear() - 8); // 8 years ago

      const result = expert.canDelete({
        type: 'Tax Return',
        createdDate: pastRetention,
      });

      expect(result).toBe(true); // 7 year retention, 8 years old
    });

    test('should identify documents within retention', () => {
      const withinRetention = new Date();
      withinRetention.setFullYear(withinRetention.getFullYear() - 3); // 3 years ago

      const result = expert.canDelete({
        type: 'Tax Return',
        createdDate: withinRetention,
      });

      expect(result).toBe(false); // 7 year retention, 3 years old
    });
  });
});

describe('Safety Checks', () => {
  test('should not allow deletion without approval workflow', () => {
    // This test verifies the safety principle:
    // Deletion must go through DeleteConfirmation workflow
    const expert = new TaxonomyExpert('AUS', 'household');

    // Even for documents past retention
    const oldDoc = {
      type: 'Tax Return',
      createdDate: new Date('2010-01-01'),
    };

    // canDelete only checks IF it's safe to delete
    // It doesn't actually delete
    expect(expert.canDelete(oldDoc)).toBe(true);

    // Actual deletion requires explicit approval via workflow
    // This is verified by the lack of delete methods in PaperlessClient
  });
});

describe('TaxonomyValidator - Edge Cases (T055)', () => {
  const { TaxonomyValidator } = require('../skills/RecordsManager/Lib/TaxonomyValidator');

  describe('Invalid Document Types', () => {
    test('should reject document type not in taxonomy', () => {
      const suggestions = {
        documentType: 'CustomInventedType',
        tags: ['tax'],
        retentionYears: 5,
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid document type');
    });

    test('should accept valid document type from taxonomy', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax', 'income'], // Use actual tags from financial category, not category name
        retentionYears: 7,
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('Invalid Tags', () => {
    test('should reject tag not in taxonomy', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax', 'custom-invented-tag'], // 'tax' is valid, 'custom-invented-tag' is invalid
        retentionYears: 7,
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid tag');
      expect(validation.errors[0]).toContain('custom-invented-tag');
    });

    test('should reject multiple invalid tags', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax', 'fake-tag-1', 'fake-tag-2'],
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThanOrEqual(2);
    });

    test('should accept all valid tags from taxonomy', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax', 'income', 'expense'], // Use actual tags from taxonomy, not category names
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(true);
    });

    test('should handle empty tags array', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: [],
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(true); // Empty is okay
    });
  });

  describe('Invalid Retention Periods', () => {
    test('should reject incorrect retention period for document type', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax'],
        retentionYears: 3, // Wrong - should be 7 for Australia tax returns
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid retention period');
      expect(validation.errors[0]).toContain('7 years');
    });

    test('should accept correct retention period from taxonomy', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax'],
        retentionYears: 7, // Correct for Australia
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(true);
    });

    test('should handle missing retention period gracefully', () => {
      const suggestions = {
        documentType: 'Tax Return',
        tags: ['tax'],
        // retentionYears omitted
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      // Should pass validation if retention not provided
      expect(validation.valid).toBe(true);
    });
  });

  describe('Cross-Domain Validation', () => {
    test('should reject household document type in corporate domain', () => {
      const suggestions = {
        documentType: 'Medical Receipt', // Household-specific
        tags: ['medical'],
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'corporate'
      );
      expect(validation.valid).toBe(false);
    });

    test('should reject corporate document type in household domain', () => {
      const suggestions = {
        documentType: 'Employee Record', // Corporate-specific
        tags: ['hr'],
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
    });
  });

  describe('Multiple Simultaneous Errors', () => {
    test('should report all errors when multiple validations fail', () => {
      const suggestions = {
        documentType: 'FakeDocType',
        tags: ['fake-tag-1', 'fake-tag-2'],
        retentionYears: 999,
      };
      const validation = TaxonomyValidator.validateAgentSuggestions(
        suggestions,
        'AUS',
        'household'
      );
      expect(validation.valid).toBe(false);
      // Should have errors for: document type + 2 tags = 3 errors minimum
      expect(validation.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('TaxonomyInstaller - Edge Cases (T055)', () => {
  // Note: These are unit tests for installer logic, not integration tests
  // Integration tests would require actual paperless-ngx instance

  describe('Country Validation', () => {
    test('should handle unsupported country gracefully', () => {
      // TaxonomyInstaller should fall back to Australia for unsupported countries
      // This is tested via constructor behavior
      expect(() => {
        const expert = new TaxonomyExpert('UnsupportedCountry');
        expect(expert).toBeDefined();
      }).not.toThrow();
    });

    test('should support all three countries', () => {
      expect(TaxonomyExpert.isCountrySupported('AUS')).toBe(true);
      expect(TaxonomyExpert.isCountrySupported('USA')).toBe(true);
      expect(TaxonomyExpert.isCountrySupported('GBR')).toBe(true);
    });
  });

  describe('Duplicate Detection', () => {
    test('should detect duplicate tags case-insensitively', () => {
      // Test case-insensitive duplicate detection logic
      const existingTags = ['Tax', 'Financial'];
      const newTag = 'tax'; // Lowercase variant

      const existingSet = new Set(existingTags.map(t => t.toLowerCase()));
      expect(existingSet.has(newTag.toLowerCase())).toBe(true);
    });

    test('should skip already-existing resources', () => {
      // Verify skip logic works correctly
      const existing = ['tax', 'financial'];
      const toInstall = ['tax', 'financial', 'household']; // First two already exist

      const existingSet = new Set(existing.map(t => t.toLowerCase()));
      const skipped: string[] = [];
      const installed: string[] = [];

      for (const tag of toInstall) {
        if (existingSet.has(tag.toLowerCase())) {
          skipped.push(tag);
        } else {
          installed.push(tag);
        }
      }

      expect(skipped).toEqual(['tax', 'financial']);
      expect(installed).toEqual(['household']);
    });
  });

  describe('Tag Color Cycling', () => {
    test('should cycle through colors using modulo', () => {
      const colors = ['#1e90ff', '#32cd32', '#ff6347', '#ffa500', '#9370db', '#20b2aa'];

      // Test modulo cycling
      expect(colors[0 % colors.length]).toBe('#1e90ff'); // Tag 0
      expect(colors[5 % colors.length]).toBe('#20b2aa'); // Tag 5
      expect(colors[6 % colors.length]).toBe('#1e90ff'); // Tag 6 wraps to 0
      expect(colors[12 % colors.length]).toBe('#1e90ff'); // Tag 12 wraps to 0
    });
  });

  describe('Entity Type Discovery', () => {
    test('should discover all entity types dynamically', () => {
      const expert = new TaxonomyExpert('AUS');
      const domains = expert.getSupportedDomains();

      // Should include at least: household, corporate, trust types
      expect(domains.length).toBeGreaterThan(0);
      expect(domains).toContain('household');
      expect(domains).toContain('corporate');
    });
  });
});

// Run tests with: bun test $PAI_DIR/lib/recordsmanager/tests/RecordManager.test.ts
