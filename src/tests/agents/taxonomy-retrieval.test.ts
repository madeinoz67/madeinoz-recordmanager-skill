// Test file for TaxonomyExpert retrieval by agents
// $PAI_DIR/src/tests/agents/taxonomy-retrieval.test.ts
/**
 * Phase 8 (User Story 6) - Agent Integration Tests
 *
 * T079: Unit tests for TaxonomyExpert retrieval by agents
 *
 * Tests verify that:
 * - Agents can retrieve hierarchical taxonomy data
 * - All required methods are accessible
 * - Country-specific retention rules are retrieved correctly
 * - Document types are accessible for activities
 */

import { describe, it, expect } from 'bun:test';
import { TaxonomyExpert } from '../../skills/RecordsManager/Lib/TaxonomyExpert';

describe('TaxonomyExpert Retrieval by Agents (T079)', () => {
  describe('T079: Hierarchical Taxonomy Retrieval', () => {
    const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

    it('should retrieve all functions for a domain', () => {
      const functions = expert.getFunctions('household');

      expect(functions).toBeDefined();
      expect(functions.length).toBeGreaterThan(0);
      expect(functions[0]).toHaveProperty('name');
      expect(functions[0]).toHaveProperty('description');
      expect(functions[0]).toHaveProperty('services');
    });

    it('should retrieve services for a function', () => {
      const functions = expert.getFunctions('household');
      const firstFunction = functions[0];

      const services = expert.getServices('household', firstFunction.name);

      expect(services).toBeDefined();
      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('description');
      expect(services[0]).toHaveProperty('activities');
    });

    it('should retrieve activities for a service', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);

      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      expect(activities).toBeDefined();
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0]).toHaveProperty('name');
      expect(activities[0]).toHaveProperty('description');
      expect(activities[0]).toHaveProperty('documentTypes');
      expect(activities[0]).toHaveProperty('retention');
    });

    it('should retrieve document types for an activity', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const docTypes = expert.getDocumentTypesForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      expect(docTypes).toBeDefined();
      expect(Array.isArray(docTypes)).toBe(true);
      expect(docTypes.length).toBeGreaterThan(0);
      expect(typeof docTypes[0]).toBe('string');
    });

    it('should retrieve retention for an activity', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      expect(retention).toBeDefined();
      expect(typeof retention).toBe('object');
      expect(Object.keys(retention).length).toBeGreaterThan(0);
    });

    it('should retrieve country-specific retention rules', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Check AU rules exist
      expect(retention.AUS).toBeDefined();
      expect(retention.AUS).toHaveProperty('years');
      expect(retention.AUS).toHaveProperty('authority');

      // Check for optional fields
      if (retention.AUS.notes) {
        expect(typeof retention.AUS.notes).toBe('string');
      }

      if (retention.AUS.fromDate) {
        expect(['creation', 'fy_end', 'fte_date', 'distribution']).toContain(retention.AUS.fromDate);
      }
    });

    it('should retrieve multiple country retention rules', () => {
      const functions = expert.getFunctions('household');

      // Find an activity with multiple country rules
      let multiCountryRetention = null;
      for (const func of functions) {
        const services = expert.getServices('household', func.name);
        for (const service of services) {
          const activities = expert.getActivities('household', func.name, service.name);
          for (const activity of activities) {
            const retention = expert.getRetentionForActivity(
              'household',
              func.name,
              service.name,
              activity.name
            );

            if (Object.keys(retention).length > 1) {
              multiCountryRetention = retention;
              break;
            }
          }
          if (multiCountryRetention) break;
        }
        if (multiCountryRetention) break;
      }

      if (multiCountryRetention) {
        expect(Object.keys(multiCountryRetention).length).toBeGreaterThan(1);

        // Verify each country has required fields
        for (const [country, rule] of Object.entries(multiCountryRetention)) {
          expect(rule).toHaveProperty('years');
          expect(rule).toHaveProperty('authority');
        }
      }
    });

    it('should support all entity types', () => {
      const domains = expert.getSupportedDomains();

      expect(domains.length).toBeGreaterThanOrEqual(8);

      for (const domain of domains) {
        const functions = expert.getFunctions(domain);
        expect(functions.length).toBeGreaterThan(0);

        const services = expert.getServices(domain, functions[0].name);
        expect(services.length).toBeGreaterThan(0);

        const activities = expert.getActivities(domain, functions[0].name, services[0].name);
        expect(activities.length).toBeGreaterThan(0);
      }
    });

    it('should support hierarchical mode', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

      expect(expert.isHierarchicalAvailable()).toBe(true);
      expect(expert.getTaxonomyMode()).toBe('hierarchical');
    });

    it('should support flat mode for backwards compatibility', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'flat');

      expect(expert.getTaxonomyMode()).toBe('flat');
    });

    it('should support hybrid mode', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hybrid');

      expect(expert.getTaxonomyMode()).toBe('hybrid');
      expect(expert.isHierarchicalAvailable()).toBe(true);
    });
  });

  describe('Agent Method Accessibility', () => {
    it('should expose getHierarchicalTaxonomy method', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

      const taxonomy = expert.getHierarchicalTaxonomy('household');

      expect(taxonomy).toBeDefined();
      expect(taxonomy).toHaveProperty('entityType');
      expect(taxonomy).toHaveProperty('country');
      expect(taxonomy).toHaveProperty('version');
      expect(taxonomy).toHaveProperty('functions');
      expect(taxonomy).toHaveProperty('metadata');
    });

    it('should expose getAllDocumentTypes method', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

      const docTypes = expert.getAllDocumentTypes('household');

      expect(docTypes).toBeDefined();
      expect(Array.isArray(docTypes)).toBe(true);
      expect(docTypes.length).toBeGreaterThan(0);
    });

    it('should expose getSupportedDomains method', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');

      const domains = expert.getSupportedDomains();

      expect(domains).toBeDefined();
      expect(Array.isArray(domains)).toBe(true);
      expect(domains.length).toBeGreaterThan(0);
    });
  });
});
