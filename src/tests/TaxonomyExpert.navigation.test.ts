// Test file for TaxonomyExpert navigation
// $PAI_DIR/src/tests/TaxonomyExpert.navigation.test.ts
/**
 * Phase 9 (User Story 7) - Hierarchical Navigation Tests
 *
 * T095-T097: Unit tests for CLI navigation features
 *
 * Tests verify that:
 * - Path parsing works correctly
 * - Path validation catches invalid paths
 * - Autocomplete provides relevant suggestions
 * - Keyword search finds matching activities
 * - Storage paths are generated correctly
 */

import { describe, it, expect } from 'bun:test';
import { TaxonomyExpert } from '../skills/RecordsManager/Lib/TaxonomyExpert';

describe('TaxonomyExpert Navigation (T095-T097)', () => {
  const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

  // T095: Path parsing tests
  describe('T095: Path Parsing', () => {
    it('should parse valid function path', () => {
      const parsed = expert.parsePath('household', 'FinancialManagement');

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBe('FinancialManagement');
      expect(parsed.service).toBeUndefined();
      expect(parsed.activity).toBeUndefined();
    });

    it('should parse valid service path', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name}/${services[0].name}`;

      const parsed = expert.parsePath('household', path);

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBe(functions[0].name);
      expect(parsed.service).toBe(services[0].name);
      expect(parsed.activity).toBeUndefined();
    });

    it('should parse valid activity path', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const path = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      const parsed = expert.parsePath('household', path);

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBe(functions[0].name);
      expect(parsed.service).toBe(services[0].name);
      expect(parsed.activity).toBe(activities[0].name);
      expect(parsed.documentTypes).toBeDefined();
      expect(parsed.retention).toBeDefined();
    });

    it('should handle invalid paths', () => {
      const parsed = expert.parsePath('household', 'InvalidFunction/InvalidService');

      expect(parsed.valid).toBe(false);
      expect(parsed.function).toBeUndefined();
    });

    it('should handle empty path', () => {
      const parsed = expert.parsePath('household', '');

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name.toLowerCase()}/${services[0].name.toLowerCase()}`;

      const parsed = expert.parsePath('household', path);

      expect(parsed.valid).toBe(true); // Should work with different case
    });
  });

  // T096: Path validation tests
  describe('T096: Path Validation', () => {
    it('should validate correct function', () => {
      const validation = expert.validatePath('household', 'FinancialManagement');

      expect(validation.valid).toBe(true);
      expect(validation.resolved?.function).toBe('FinancialManagement');
    });

    it('should reject incorrect function', () => {
      const validation = expert.validatePath('household', 'InvalidFunction');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid function');
    });

    it('should validate correct service', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name}/${services[0].name}`;

      const validation = expert.validatePath('household', path);

      expect(validation.valid).toBe(true);
      expect(validation.resolved?.service).toBe(services[0].name);
    });

    it('should reject incorrect service', () => {
      const validation = expert.validatePath('household', 'FinancialManagement/InvalidService');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid service');
    });

    it('should validate correct activity', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const path = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      const validation = expert.validatePath('household', path);

      expect(validation.valid).toBe(true);
      expect(validation.resolved?.activity).toBe(activities[0].name);
    });

    it('should reject incorrect activity', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name}/${services[0].name}/InvalidActivity`;

      const validation = expert.validatePath('household', path);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid activity');
    });

    it('should include document types and retention for full path', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const path = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      const validation = expert.validatePath('household', path);

      expect(validation.valid).toBe(true);
      expect(validation.resolved?.documentTypes).toBeDefined();
      expect(Array.isArray(validation.resolved?.documentTypes)).toBe(true);
      expect(validation.resolved?.retention).toBeDefined();
    });

    it('should provide helpful error messages', () => {
      const validation = expert.validatePath('household', 'FinancialManagement/InvalidService');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid service');
      expect(validation.error).toContain('FinancialManagement');
    });
  });

  // T097: Autocomplete tests
  describe('T097: Autocomplete Functionality', () => {
    it('should suggest all functions for empty path', () => {
      const autocomplete = expert.autocomplete('household', '');

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.types).toContain('function');
      expect(autocomplete.remaining).toBe(3);
    });

    it('should suggest services for function path', () => {
      const functions = expert.getFunctions('household');
      const autocomplete = expert.autocomplete('household', functions[0].name);

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.types).toContain('service');
      expect(autocomplete.suggestions[0]).toContain(functions[0].name);
      expect(autocomplete.remaining).toBe(2);
    });

    it('should suggest activities for service path', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name}/${services[0].name}`;

      const autocomplete = expert.autocomplete('household', path);

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.types).toContain('activity');
      expect(autocomplete.suggestions[0]).toContain(functions[0].name);
      expect(autocomplete.suggestions[0]).toContain(services[0].name);
      expect(autocomplete.remaining).toBe(1);
    });

    it('should suggest document types for activity path', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const path = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      const autocomplete = expert.autocomplete('household', path);

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.types).toContain('documentType');
    });

    it('should provide fuzzy matching for invalid input', () => {
      const autocomplete = expert.autocomplete('household', 'financ');

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.suggestions[0].toLowerCase()).toContain('financ');
    });

    it('should respect limit option', () => {
      const autocomplete = expert.autocomplete('household', '', { limit: 3 });

      expect(autocomplete.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Path Resolution', () => {
    it('should resolve partial path with suggestions', () => {
      const resolution = expert.resolvePath('household', 'Financial');

      expect(resolution.suggestions.length).toBeGreaterThan(0);
      expect(resolution.matched).toEqual([]);
      expect(resolution.remaining).toBe(3);
    });

    it('should resolve full path with document types', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const path = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      const resolution = expert.resolvePath('household', path);

      expect(resolution.matched.length).toBe(3);
      expect(resolution.remaining).toBe(0);
      expect(resolution.suggestions.length).toBeGreaterThan(0);
    });

    it('should track matched components', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const path = `${functions[0].name}/${services[0].name}`;

      const resolution = expert.resolvePath('household', path);

      expect(resolution.matched).toEqual([functions[0].name, services[0].name]);
      expect(resolution.remaining).toBe(1);
    });
  });

  describe('Keyword Search', () => {
    it('should search by keyword across all levels', () => {
      const results = expert.searchByKeyword('household', 'tax');

      expect(results.length).toBeGreaterThan(0);

      for (const result of results) {
        expect(result).toHaveProperty('function');
        expect(result).toHaveProperty('service');
        expect(result).toHaveProperty('activity');
        expect(result).toHaveProperty('matchType');
        expect(result).toHaveProperty('relevance');
      }
    });

    it('should prioritize name matches over keyword matches', () => {
      const results = expert.searchByKeyword('household', 'tax');

      // Name matches should have higher relevance
      const nameMatches = results.filter(r => r.matchType === 'name');
      const keywordMatches = results.filter(r => r.matchType === 'keyword');

      if (nameMatches.length > 0 && keywordMatches.length > 0) {
        expect(nameMatches[0].relevance).toBeGreaterThan(keywordMatches[0].relevance);
      }
    });

    it('should return results sorted by relevance', () => {
      const results = expert.searchByKeyword('household', 'medical');

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].relevance).toBeGreaterThanOrEqual(results[i + 1].relevance);
        }
      }
    });

    it('should limit results to 20', () => {
      const results = expert.searchByKeyword('household', 'document');

      expect(results.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Hierarchical Tags Generation', () => {
    it('should generate tags from hierarchy', () => {
      const tags = expert.generateHierarchicalTags(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      expect(tags).toContain('FinancialManagement');
      expect(tags).toContain('BankingServices');
      expect(tags).toContain('BankStatements');
    });

    it('should include activity keywords', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const tags = expert.generateHierarchicalTags(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Should include function, service, activity
      expect(tags).toContain(functions[0].name);
      expect(tags).toContain(services[0].name);
      expect(tags).toContain(activities[0].name);

      // Should include activity keywords if they exist
      if (activities[0].keywords) {
        for (const keyword of activities[0].keywords) {
          expect(tags).toContain(keyword);
        }
      }
    });

    it('should remove duplicate tags', () => {
      const tags = expert.generateHierarchicalTags(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      const uniqueTags = Array.from(new Set(tags));
      expect(tags).toEqual(uniqueTags);
    });
  });

  describe('Storage Path Generation', () => {
    it('should generate readable storage path', () => {
      const path = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
      expect(path.startsWith('/')).toBe(true);
    });

    it('should convert PascalCase to readable format', () => {
      const path = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      expect(path).toContain('Financial Management');
      expect(path).toContain('Banking Services');
      expect(path).toContain('Bank Statements');
    });

    it('should include all hierarchy levels', () => {
      const path = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      expect(path).toContain('Household');
      expect(path).toContain('Financial Management');
      expect(path).toContain('Banking Services');
      expect(path).toContain('Bank Statements');
    });

    it('should capitalize each part', () => {
      const path = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'BankingServices',
        'BankStatements'
      );

      // Each word should be capitalized
      const parts = path.split('/').filter(p => p.length > 0);
      for (const part of parts) {
        expect(part[0]).toBe(part[0].toUpperCase());
      }
    });
  });

  describe('Mode and Availability', () => {
    it('should report hierarchical availability', () => {
      expect(expert.isHierarchicalAvailable()).toBe(true);
    });

    it('should report taxonomy mode', () => {
      expect(expert.getTaxonomyMode()).toBe('hierarchical');
    });

    it('should support flat mode', () => {
      const flatExpert = new TaxonomyExpert('Australia', 'household', 'flat');

      expect(flatExpert.getTaxonomyMode()).toBe('flat');
    });

    it('should support hybrid mode', () => {
      const hybridExpert = new TaxonomyExpert('Australia', 'household', 'hybrid');

      expect(hybridExpert.getTaxonomyMode()).toBe('hybrid');
    });
  });
});
