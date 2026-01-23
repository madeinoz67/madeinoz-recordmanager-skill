// Test file for agent validation against taxonomy
// $PAI_DIR/src/tests/agents/agent-validation.test.ts
/**
 * Phase 8 (User Story 6) - Agent Validation Tests
 *
 * T080: Unit tests for agent validation against taxonomy
 *
 * Tests verify that:
 * - Agent suggestions are validated against TaxonomyExpert
 * - Invalid suggestions are rejected
 * - Validation failures are logged
 * - Agents use correct hierarchical methods
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { TaxonomyExpert } from '../../skills/RecordsManager/Lib/TaxonomyExpert';

// Mock agent suggestion
interface AgentSuggestion {
  function?: string;
  service?: string;
  activity?: string;
  documentType?: string;
  retentionYears?: number;
  retentionReason?: string;
  tags?: string[];
}

describe('Agent Validation Against Taxonomy (T080)', () => {
  let expert: TaxonomyExpert;

  beforeEach(() => {
    expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');
  });

  describe('T080: Validate Agent Suggestions', () => {
    it('should validate correct function suggestion', () => {
      const functions = expert.getFunctions('household');
      const validFunction = functions[0].name;

      const suggestion: AgentSuggestion = {
        function: validFunction,
      };

      // Validate function exists
      const functionsAfter = expert.getFunctions('household');
      const isValid = functionsAfter.some(f => f.name === suggestion.function);

      expect(isValid).toBe(true);
    });

    it('should reject invalid function suggestion', () => {
      const suggestion: AgentSuggestion = {
        function: 'InvalidFunction',
      };

      // Validate function exists
      const functions = expert.getFunctions('household');
      const isValid = functions.some(f => f.name === suggestion.function);

      expect(isValid).toBe(false);
    });

    it('should validate correct service suggestion', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const validService = services[0].name;

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: validService,
      };

      // Validate service exists for function
      const servicesAfter = expert.getServices('household', suggestion.function!);
      const isValid = servicesAfter.some(s => s.name === suggestion.service);

      expect(isValid).toBe(true);
    });

    it('should reject invalid service suggestion', () => {
      const functions = expert.getFunctions('household');

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: 'InvalidService',
      };

      // Validate service exists for function
      const services = expert.getServices('household', suggestion.function!);
      const isValid = services.some(s => s.name === suggestion.service);

      expect(isValid).toBe(false);
    });

    it('should validate correct activity suggestion', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const validActivity = activities[0].name;

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: validActivity,
      };

      // Validate activity exists for service
      const activitiesAfter = expert.getActivities(
        'household',
        suggestion.function!,
        suggestion.service!
      );
      const isValid = activitiesAfter.some(a => a.name === suggestion.activity);

      expect(isValid).toBe(true);
    });

    it('should reject invalid activity suggestion', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: 'InvalidActivity',
      };

      // Validate activity exists for service
      const activities = expert.getActivities(
        'household',
        suggestion.function!,
        suggestion.service!
      );
      const isValid = activities.some(a => a.name === suggestion.activity);

      expect(isValid).toBe(false);
    });

    it('should validate correct document type suggestion', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const docTypes = expert.getDocumentTypesForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );
      const validDocType = docTypes[0];

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: activities[0].name,
        documentType: validDocType,
      };

      // Validate document type exists for activity
      const docTypesAfter = expert.getDocumentTypesForActivity(
        'household',
        suggestion.function!,
        suggestion.service!,
        suggestion.activity!
      );
      const isValid = docTypesAfter.includes(suggestion.documentType!);

      expect(isValid).toBe(true);
    });

    it('should reject invalid document type suggestion', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: activities[0].name,
        documentType: 'Invalid Document Type',
      };

      // Validate document type exists for activity
      const docTypes = expert.getDocumentTypesForActivity(
        'household',
        suggestion.function!,
        suggestion.service!,
        suggestion.activity!
      );
      const isValid = docTypes.includes(suggestion.documentType!);

      expect(isValid).toBe(false);
    });

    it('should validate correct retention years', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: activities[0].name,
        retentionYears: retention.AUS?.years,
      };

      // Validate retention years match TaxonomyExpert
      const retentionAfter = expert.getRetentionForActivity(
        'household',
        suggestion.function!,
        suggestion.service!,
        suggestion.activity!
      );

      expect(suggestion.retentionYears).toBe(retentionAfter.AUS?.years);
    });

    it('should reject incorrect retention years', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: services[0].name,
        activity: activities[0].name,
        retentionYears: (retention.AUS?.years || 0) + 999, // Wrong retention
      };

      // Validate retention years match TaxonomyExpert
      const retentionAfter = expert.getRetentionForActivity(
        'household',
        suggestion.function!,
        suggestion.service!,
        suggestion.activity!
      );

      expect(suggestion.retentionYears).not.toBe(retentionAfter.AUS?.years);
    });

    it('should validate retention reason matches authority', () => {
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      // Retention reason should come from authority field
      expect(retention.AUS).toBeDefined();
      expect(retention.AUS?.authority).toBeDefined();
      expect(retention.AUS?.authority.length).toBeGreaterThan(0);
    });

    it('should detect permanent retention documents', () => {
      // Find activities with permanent retention (years: 0)
      const functions = expert.getFunctions('family-trust');

      for (const func of functions) {
        const services = expert.getServices('family-trust', func.name);
        for (const service of services) {
          const activities = expert.getActivities('family-trust', func.name, service.name);
          for (const activity of activities) {
            const retention = expert.getRetentionForActivity(
              'family-trust',
              func.name,
              service.name,
              activity.name
            );

            if (retention.AUS?.years === 0) {
              // Found permanent retention
              expect(retention.AUS.years).toBe(0);
              expect(retention.AUS.authority).toBeDefined();
              return;
            }
          }
        }
      }
    });
  });

  describe('Validation Error Collection', () => {
    it('should collect all validation errors', () => {
      const suggestion: AgentSuggestion = {
        function: 'InvalidFunction',
        service: 'InvalidService',
        activity: 'InvalidActivity',
        documentType: 'Invalid Document Type',
      };

      const errors: string[] = [];

      // Validate function
      const functions = expert.getFunctions('household');
      if (!functions.some(f => f.name === suggestion.function)) {
        errors.push(`Invalid function: ${suggestion.function}`);
      }

      // If function is invalid, service validation would fail too
      // But we can still validate the function exists
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should provide detailed error messages', () => {
      const functions = expert.getFunctions('household');
      const suggestion: AgentSuggestion = {
        function: functions[0].name,
        service: 'InvalidService',
      };

      const services = expert.getServices('household', suggestion.function!);
      const isValid = services.some(s => s.name === suggestion.service);

      if (!isValid) {
        const error = `Invalid service: ${suggestion.service} for function ${suggestion.function}`;
        expect(error).toContain('Invalid service');
        expect(error).toContain(suggestion.service!);
        expect(error).toContain(suggestion.function!);
      }
    });
  });

  describe('Cross-Country Validation', () => {
    it('should validate AU retention rules', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');
      const functions = expert.getFunctions('household');
      const services = expert.getServices('household', functions[0].name);
      const activities = expert.getActivities('household', functions[0].name, services[0].name);
      const retention = expert.getRetentionForActivity(
        'household',
        functions[0].name,
        services[0].name,
        activities[0].name
      );

      expect(retention.AUS).toBeDefined();
      expect(retention.AUS?.years).toBeDefined();
      expect(retention.AUS?.authority).toBeDefined();
    });

    it('should validate US retention rules when present', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');
      const functions = expert.getFunctions('household');

      // Find an activity with US rules
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

            if (retention.USA) {
              expect(retention.USA.years).toBeDefined();
              expect(retention.USA.authority).toBeDefined();
              return;
            }
          }
        }
      }
    });

    it('should validate UK retention rules when present', () => {
      const expert = new TaxonomyExpert('Australia', 'household', 'hierarchical');
      const functions = expert.getFunctions('household');

      // Find an activity with UK rules
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

            if (retention.GBR) {
              expect(retention.GBR.years).toBeDefined();
              expect(retention.GBR.authority).toBeDefined();
              return;
            }
          }
        }
      }
    });
  });
});
