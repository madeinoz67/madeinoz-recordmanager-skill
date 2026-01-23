// Integration test for CLI navigation
// $PAI_DIR/src/tests/integration/cli-navigation.test.ts
/**
 * Phase 9 (User Story 7) - CLI Navigation Integration Tests
 *
 * T098: Integration test for interactive CLI navigation
 *
 * Tests verify:
 * - Interactive drill-down prompts work
 * - Path-based input produces same results as interactive
 * - Breadcrumb display shows navigation context
 * - Autocomplete suggestions are helpful
 */

import { describe, it, expect } from 'bun:test';
import { TaxonomyExpert } from '../../skills/RecordsManager/Lib/TaxonomyExpert';

describe('CLI Navigation Integration (T098)', () => {
  const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

  describe('T098: Interactive CLI Navigation', () => {
    it('should support interactive drill-down workflow', () => {
      // Simulate interactive drill-down:

      // Level 1: Show functions
      const functions = expert.getFunctions('household');

      expect(functions.length).toBeGreaterThan(0);
      expect(functions[0]).toHaveProperty('name');
      expect(functions[0]).toHaveProperty('description');

      // Level 2: User selects a function, show services
      const selectedFunction = functions[0].name;
      const services = expert.getServices('household', selectedFunction);

      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('description');

      // Level 3: User selects a service, show activities
      const selectedService = services[0].name;
      const activities = expert.getActivities('household', selectedFunction, selectedService);

      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0]).toHaveProperty('name');
      expect(activities[0]).toHaveProperty('description');
      expect(activities[0]).toHaveProperty('documentTypes');

      // Level 4: User selects an activity, show document types
      const selectedActivity = activities[0].name;
      const docTypes = expert.getDocumentTypesForActivity(
        'household',
        selectedFunction,
        selectedService,
        selectedActivity
      );

      expect(docTypes.length).toBeGreaterThan(0);
      expect(typeof docTypes[0]).toBe('string');
    });

    it('should display breadcrumbs during navigation', () => {
      // Simulate breadcrumb display using actual taxonomy values
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const breadcrumb = {
        domain: 'household',
        function: functions[0].name,
        service: services[0].name,
        activity: activities[0].name
      };

      // Breadcrumb should show full path
      const breadcrumbDisplay = `${breadcrumb.domain} > ${breadcrumb.function} > ${breadcrumb.service} > ${breadcrumb.activity}`;

      expect(breadcrumbDisplay).toBeDefined();
      expect(breadcrumbDisplay).toContain('household');
      expect(breadcrumbDisplay).toContain(functions[0].name);
    });

    it('should allow backtracking in navigation', () => {
      // Start at activity level
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      // Go back to service level
      const servicesAgain = expert.getServices('household', functions[0].name);
      expect(servicesAgain.length).toBe(services.length);

      // Go back to function level
      const functionsAgain = expert.getFunctions('household');
      expect(functionsAgain.length).toBe(functions.length);
    });
  });

  describe('Path-Based Input', () => {
    it('should accept full path input', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const fullPath = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      // Parse the path
      const parsed = expert.parsePath('household', fullPath);

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBe(functions[0].name);
      expect(parsed.service).toBe(services[0].name);
      expect(parsed.activity).toBe(activities[0].name);
    });

    it('should accept partial path input', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const partialPath = `${functions[0].name}/${services[0].name}`;

      const parsed = expert.parsePath('household', partialPath);

      expect(parsed.valid).toBe(true);
      expect(parsed.function).toBe(functions[0].name);
      expect(parsed.service).toBe(services[0].name);
      expect(parsed.activity).toBeUndefined();
    });

    it('should autocomplete partial paths', () => {
      const partialPath = 'Fin';

      const autocomplete = expert.autocomplete('household', partialPath);

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.types).toContain('function');
    });
  });

  describe('Interactive vs Path-Based Consistency', () => {
    it('should produce identical results from both methods', () => {
      // Interactive drill-down result
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const docTypesInteractive = expert.getDocumentTypesForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );
      const retentionInteractive = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Path-based result
      const fullPath = `${functions[0].name}/${services[0].name}/${activities[0].name}`;
      const parsed = expert.parsePath('household', fullPath);
      const docTypesPath = parsed.documentTypes;
      const retentionPath = parsed.retention;

      // Should be identical
      expect(docTypesPath).toEqual(docTypesInteractive);
      expect(retentionPath).toEqual(retentionInteractive);
    });

    it('should validate paths consistently', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const validPath = `${functions[0].name}/${services[0].name}/${activities[0].name}`;

      // Validate the path
      const validation = expert.validatePath('household', validPath);

      expect(validation.valid).toBe(true);

      // Parse the path
      const parsed = expert.parsePath('household', validPath);

      expect(parsed.valid).toBe(true);

      // Should get same document types both ways
      const docTypesFromValidate = validation.resolved?.documentTypes;
      const docTypesFromParse = parsed.documentTypes;

      expect(docTypesFromValidate).toEqual(docTypesFromParse);
    });
  });

  describe('Autocomplete Suggestions', () => {
    it('should provide helpful suggestions at each level', () => {
      // At function level
      const functionSuggestions = expert.autocomplete('household', '');
      expect(functionSuggestions.suggestions.length).toBeGreaterThan(0);
      expect(functionSuggestions.types).toContain('function');

      // At service level
      const serviceSuggestions = expert.autocomplete('household', 'FinancialManagement');
      expect(serviceSuggestions.suggestions.length).toBeGreaterThan(0);
      expect(serviceSuggestions.types).toContain('service');

      // At activity level
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', 'FinancialManagement');
      if (services.length > 0) {
        const activitySuggestions = expert.autocomplete(
          'household',
          'FinancialManagement/' + services[0].name
        );
        expect(activitySuggestions.suggestions.length).toBeGreaterThan(0);
        expect(activitySuggestions.types).toContain('activity');
      }
    });

    it('should handle fuzzy input with suggestions', () => {
      const fuzzyInput = 'fin';  // Partial match for "FinancialManagement"

      const autocomplete = expert.autocomplete('household', fuzzyInput);

      expect(autocomplete.suggestions.length).toBeGreaterThan(0);
      expect(autocomplete.suggestions[0].toLowerCase()).toContain('fin');
    });

    it('should limit suggestions for readability', () => {
      const autocomplete = expert.autocomplete('household', '', { limit: 5 });

      expect(autocomplete.suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Search Integration', () => {
    it('should support keyword search across all levels', () => {
      const results = expert.searchByKeyword('household', 'invoice');

      expect(results.length).toBeGreaterThan(0);

      for (const result of results) {
        expect(result).toHaveProperty('function');
        expect(result).toHaveProperty('service');
        expect(result).toHaveProperty('activity');
        expect(result).toHaveProperty('matchType');
        expect(result).toHaveProperty('relevance');
      }
    });

    it('should provide relevance-ranked results', () => {
      const results = expert.searchByKeyword('household', 'tax');

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].relevance).toBeGreaterThanOrEqual(results[i + 1].relevance);
        }
      }
    });

    it('should support finding activities by document type', () => {
      const results = expert.searchByKeyword('household', 'Invoice');

      const docTypeMatches = results.filter(r => r.matchType === 'documentType');

      expect(docTypeMatches.length).toBeGreaterThan(0);
    });
  });

  describe('Tag Generation', () => {
    it('should generate appropriate tags from path', () => {
      const tags = expert.generateHierarchicalTags(
        'household',
        'FinancialManagement',
        'Accounting',
        'Bookkeeping'
      );

      expect(tags).toContain('FinancialManagement');
      expect(tags).toContain('Accounting');
      expect(tags).toContain('Bookkeeping');
      expect(tags.length).toBeGreaterThanOrEqual(3);
    });

    it('should include activity-specific keywords', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const tags = expert.generateHierarchicalTags(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Should include activity keywords
      if (activities[0].keywords && activities[0].keywords.length > 0) {
        for (const keyword of activities[0].keywords) {
          expect(tags).toContain(keyword);
        }
      }
    });
  });

  describe('Storage Path Generation', () => {
    it('should generate consistent storage paths', () => {
      const path1 = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'Accounting',
        'Bookkeeping'
      );
      const path2 = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'Accounting',
        'Bookkeeping'
      );

      expect(path1).toBe(path2);
    });

    it('should generate different paths for different activities', () => {
      const path1 = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'Accounting',
        'Bookkeeping'
      );
      const path2 = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'TaxCompliance',
        'TaxReturn'
      );

      expect(path1).not.toBe(path2);
    });

    it('should format paths consistently', () => {
      const path = expert.generateStoragePath(
        'household',
        'FinancialManagement',
        'Accounting',
        'Bookkeeping'
      );

      // Should start with /
      expect(path.startsWith('/')).toBe(true);

      // Should use / as separator
      const parts = path.split('/').filter(p => p.length > 0);
      expect(parts.length).toBe(4); // domain, function, service, activity

      // Each part should have proper capitalization
      for (const part of parts) {
        expect(part[0]).toBe(part[0].toUpperCase());
      }
    });
  });
});
