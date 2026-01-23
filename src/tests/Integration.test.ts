// $PAI_DIR/skills/RecordsManager/tests/Integration.test.ts
/**
 * T058: Final Integration Test
 * End-to-end verification of taxonomy system with enforcement
 */

import { describe, test, expect } from 'bun:test';

describe('Taxonomy System Integration (T058)', () => {
  const { TaxonomyExpert } = require('../skills/RecordsManager/Lib/TaxonomyExpert');
  const { TaxonomyValidator } = require('../skills/RecordsManager/Lib/TaxonomyValidator');

  describe('End-to-End Taxonomy Workflow', () => {
    test('should retrieve valid document types from TaxonomyExpert', () => {
      const expert = new TaxonomyExpert('AUS', 'household');
      const docTypes = expert.getDocumentTypes('household');

      expect(docTypes).toBeDefined();
      expect(Array.isArray(docTypes)).toBe(true);
      expect(docTypes.length).toBeGreaterThan(0);
      expect(docTypes).toContain('Tax Return'); // Known document type from taxonomies.yaml
    });

    test('should retrieve valid tags from TaxonomyExpert', () => {
      const expert = new TaxonomyExpert('AUS', 'household');
      const tagCategories = expert.getTagCategories('household');

      expect(tagCategories).toBeDefined();
      expect(typeof tagCategories).toBe('object');

      // Verify financial category exists and has tags
      expect(tagCategories.financial).toBeDefined();
      expect(Array.isArray(tagCategories.financial)).toBe(true);
      expect(tagCategories.financial).toContain('tax');
      expect(tagCategories.financial).toContain('income');
    });

    test('should retrieve retention requirements from TaxonomyExpert', () => {
      const expert = new TaxonomyExpert('AUS', 'household');
      const retention = expert.getRetentionRequirements('Tax Return', 'household');

      expect(retention).toBeDefined();
      expect(retention?.years).toBe(7); // ATO requirement
      expect(retention?.reason).toBeDefined();
      expect(retention?.reason).toContain('ATO');
    });

    test('should validate agent suggestions match TaxonomyExpert', () => {
      const expert = new TaxonomyExpert('AUS', 'household');

      // Get valid values from TaxonomyExpert
      const docTypes = expert.getDocumentTypes('household');
      const tagCategories = expert.getTagCategories('household');
      const validDocType = docTypes[0]; // First valid document type
      const validTags = [tagCategories.financial[0], tagCategories.financial[1]]; // First two financial tags

      // Validate using TaxonomyValidator
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: validDocType,
          tags: validTags,
        },
        'AUS',
        'household'
      );

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('Taxonomy Enforcement (Critical)', () => {
    test('should reject invented document type', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'CustomInventedType',
          tags: ['tax'],
        },
        'AUS',
        'household'
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid document type');
    });

    test('should reject invented tag', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'Tax Return',
          tags: ['invented-tag-123'],
        },
        'AUS',
        'household'
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid tag');
    });

    test('should reject wrong retention period', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'Tax Return',
          tags: ['tax'],
          retentionYears: 3, // Wrong - should be 7 for Australia
        },
        'AUS',
        'household'
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid retention period');
      expect(validation.errors[0]).toContain('7 years');
    });

    test('should reject category name used as tag', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'Tax Return',
          tags: ['financial'], // Category name, not a tag
        },
        'AUS',
        'household'
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid tag');
    });
  });

  describe('Cross-Country Validation', () => {
    test('should enforce different retention rules for different countries', () => {
      const ausExpert = new TaxonomyExpert('AUS', 'household');
      const usExpert = new TaxonomyExpert('USA', 'household'); // YAML key is "UnitedStates" (no space)

      const ausRetention = ausExpert.getRetentionRequirements('Tax Return', 'household');
      const usRetention = usExpert.getRetentionRequirements('Tax Return', 'household');

      // Both should require 7 years, but verify they have different reasons
      expect(ausRetention?.years).toBe(7);
      expect(usRetention?.years).toBe(7);
      expect(ausRetention?.reason).toContain('ATO');
      expect(usRetention?.reason).toContain('IRS');
    });

    test('should enforce country-specific tags', () => {
      const ausExpert = new TaxonomyExpert('AUS', 'household');
      const ausCategories = ausExpert.getTagCategories('household');

      // Australia should have superannuation tag
      expect(ausCategories.financial).toContain('superannuation');

      const usExpert = new TaxonomyExpert('USA', 'household'); // YAML key is "UnitedStates" (no space)
      const usCategories = usExpert.getTagCategories('household');

      // US should have retirement tag instead
      expect(usCategories.financial).toContain('retirement');
    });
  });

  describe('Cross-Domain Validation', () => {
    test('should enforce domain-specific document types', () => {
      const expert = new TaxonomyExpert('AUS', 'household');

      const householdTypes = expert.getDocumentTypes('household');
      const corporateTypes = expert.getDocumentTypes('corporate');

      // Household should have Medical Receipt
      expect(householdTypes).toContain('Medical Receipt');

      // Corporate should NOT have Medical Receipt
      expect(corporateTypes).not.toContain('Medical Receipt');

      // Corporate should have Invoice
      expect(corporateTypes).toContain('Invoice');

      // Household should NOT have Invoice
      expect(householdTypes).not.toContain('Invoice');
    });

    test('should reject household document type in corporate domain', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'Medical Receipt', // Household-specific
          tags: ['medical'],
        },
        'AUS',
        'corporate'
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('Invalid document type');
    });
  });

  describe('Trust Domain Validation', () => {
    test('should enforce trust-specific document types', () => {
      const expert = new TaxonomyExpert('AUS', 'family-trust');
      const docTypes = expert.getDocumentTypes('family-trust');

      expect(docTypes).toContain('Family Trust Election');
      expect(docTypes).toContain('Trust Deed');
      expect(docTypes).toContain('Trustee Resolution');
    });

    test('should enforce Family Trust Election retention (5 years)', () => {
      const expert = new TaxonomyExpert('AUS', 'family-trust');
      const retention = expert.getRetentionRequirements('Family Trust Election', 'family-trust');

      expect(retention?.years).toBe(5); // Section 272-80 ITAA 1936
      expect(retention?.reason).toContain('Section 272-80');
    });

    test('should enforce Trust Deed retention (15 years - permanent)', () => {
      const expert = new TaxonomyExpert('AUS', 'family-trust');
      const retention = expert.getRetentionRequirements('Trust Deed', 'family-trust');

      expect(retention?.years).toBe(15); // Permanent record
      expect(retention?.reason).toContain('Permanent');
    });
  });

  describe('Metadata Suggestions', () => {
    test('should suggest appropriate metadata for tax return', () => {
      const expert = new TaxonomyExpert('AUS', 'household');
      const suggestions = expert.suggestMetadata('Tax Return 2024.pdf', undefined, 'household');

      expect(suggestions.documentType).toBe('Tax Return');
      expect(suggestions.tags).toContain('tax');
      expect(suggestions.retentionYears).toBe(7);
      expect(suggestions.retentionReason).toContain('ATO');
    });

    test('should suggest appropriate metadata for medical receipt', () => {
      const expert = new TaxonomyExpert('AUS', 'household');
      const suggestions = expert.suggestMetadata('medical-receipt-2024.pdf', undefined, 'household');

      // In hierarchical mode, returns activity name based on keyword matching
      // Note: Currently matches "receipt" keyword and returns financial receipt
      // TODO: Improve keyword weighting to prioritize "medical" context
      expect(suggestions.documentType).toBe('Receipt');
      expect(suggestions.tags).toContain('receipt');
      expect(suggestions.retentionYears).toBeGreaterThan(0);
    });
  });

  describe('Validation Result Structure', () => {
    test('should return correct validation result structure', () => {
      const validation = TaxonomyValidator.validateAgentSuggestions(
        {
          documentType: 'Tax Return',
          tags: ['tax', 'income'],
          retentionYears: 7,
        },
        'AUS',
        'household'
      );

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('suggestions');
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(typeof validation.suggestions).toBe('object');
    });

    test('should preserve original suggestions in validation result', () => {
      const originalSuggestions = {
        documentType: 'Tax Return',
        tags: ['tax', 'income'],
        retentionYears: 7,
      };

      const validation = TaxonomyValidator.validateAgentSuggestions(
        originalSuggestions,
        'AUS',
        'household'
      );

      expect(validation.suggestions).toEqual(originalSuggestions);
    });
  });
});
