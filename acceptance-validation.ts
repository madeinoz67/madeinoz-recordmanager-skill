/**
 * Acceptance Scenario Validation from spec.md
 *
 * Validates key acceptance criteria from User Stories 1-6:
 * - US1: Installation across countries
 * - US2: Complete taxonomy coverage for all entity types
 * - US3: Regulatory alignment across countries
 * - US4: Future-proof extensibility (validated by extensibility.test.ts)
 * - US5: Comprehensive operational taxonomy (hierarchical)
 * - US6: Expert agent integration
 */

import { TaxonomyExpert } from './src/skills/RECORDSMANAGER/Lib/TaxonomyExpert';
import type { Domain } from './src/lib/types/HierarchicalTaxonomy';
import * as fs from 'fs';

console.log('✅ Acceptance Scenario Validation\n');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passCount++;
  } else {
    console.log(`  ✗ ${name}${details ? ` - ${details}` : ''}`);
    failCount++;
  }
}

// ============================================================================
// User Story 1: Installation across countries
// ============================================================================
console.log('\n📋 User Story 1: Installation Across Countries');
console.log('-'.repeat(80));

const entityTypes: Domain[] = [
  'household',
  'corporate',
  'unit-trust',
  'discretionary-trust',
  'family-trust',
  'hybrid-trust',
  'project',
  'person'
];

// AS1.1: All 8 entity types available for Australia
test('AS1.1: All 8 entity types have AUS taxonomies', entityTypes.every(type => {
  const path = `./src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/${type}.json`;
  return fs.existsSync(path);
}));

// AS1.3: Verify taxonomies preserve structure (JSON files exist and are valid)
const validJsonCount = entityTypes.filter(type => {
  try {
    const path = `./src/skills/RECORDSMANAGER/Config/taxonomies/hierarchical/${type}.json`;
    const content = fs.readFileSync(path, 'utf-8');
    const taxonomy = JSON.parse(content);
    return taxonomy.entityType === type && taxonomy.country === 'AUS';
  } catch {
    return false;
  }
}).length;

test('AS1.3: All taxonomies are valid JSON with correct structure', validJsonCount === 8,
  `${validJsonCount}/8 valid`);

// ============================================================================
// User Story 2: Complete Taxonomy Coverage
// ============================================================================
console.log('\n📋 User Story 2: Complete Taxonomy Coverage');
console.log('-'.repeat(80));

const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');

// AS2.1: Family trust has comprehensive document types
const familyTrustExpert = new TaxonomyExpert('AUS', 'family-trust', 'hierarchical');
const familyFunctions = familyTrustExpert.getFunctions('family-trust');
let familyDocCount = 0;
for (const func of familyFunctions) {
  const services = familyTrustExpert.getServices('family-trust', func.name);
  for (const service of services) {
    const activities = familyTrustExpert.getActivities('family-trust', func.name, service.name);
    for (const activity of activities) {
      const docs = familyTrustExpert.getDocumentTypesForActivity('family-trust', func.name, service.name, activity.name);
      familyDocCount += docs.length;
    }
  }
}
test('AS2.1: Family trust has comprehensive document types', familyDocCount >= 15,
  `Found ${familyDocCount} document types`);

// AS2.2: Corporate entity has comprehensive coverage
const corporateExpert = new TaxonomyExpert('AUS', 'corporate', 'hierarchical');
const corporateFunctions = corporateExpert.getFunctions('corporate');
test('AS2.2: Corporate entity has comprehensive functions', corporateFunctions.length >= 10,
  `Found ${corporateFunctions.length} functions`);

// AS2.5: Every entity type has retention rules
let entityTypesWithRetention = 0;
for (const type of entityTypes) {
  const e = new TaxonomyExpert('AUS', type, 'hierarchical');
  const functions = e.getFunctions(type);
  if (functions.length > 0) {
    const services = e.getServices(type, functions[0].name);
    if (services.length > 0) {
      const activities = e.getActivities(type, functions[0].name, services[0].name);
      if (activities.length > 0) {
        const retention = e.getRetentionForActivity(type, functions[0].name, services[0].name, activities[0].name);
        if (retention && retention.AUS && retention.AUS.years > 0) {
          entityTypesWithRetention++;
        }
      }
    }
  }
}
test('AS2.5: All entity types have retention rules defined', entityTypesWithRetention === 8,
  `${entityTypesWithRetention}/8 types with retention`);

// ============================================================================
// User Story 3: Regulatory Alignment
// ============================================================================
console.log('\n📋 User Story 3: Regulatory Alignment');
console.log('-'.repeat(80));

// AS3.1: Australian tax document retention is 7 years with ATO reference
const householdExpert = new TaxonomyExpert('AUS', 'household', 'hierarchical');
const finFunctions = householdExpert.getFunctions('household').filter(f =>
  f.name.toLowerCase().includes('financial') || f.name.toLowerCase().includes('tax')
);

let foundTaxRetention = false;
let taxRetentionCorrect = false;
for (const func of finFunctions) {
  const services = householdExpert.getServices('household', func.name);
  for (const service of services) {
    const activities = householdExpert.getActivities('household', func.name, service.name);
    for (const activity of activities) {
      const retention = householdExpert.getRetentionForActivity('household', func.name, service.name, activity.name);
      if (retention?.AUS) {
        foundTaxRetention = true;
        if (retention.AUS.years === 7 &&
            retention.AUS.authority &&
            retention.AUS.authority.includes('ATO')) {
          taxRetentionCorrect = true;
        }
      }
    }
  }
}

test('AS3.1: Tax retention is 7 years with ATO authority', taxRetentionCorrect,
  foundTaxRetention ? 'Found retention but incorrect' : 'No retention found');

// ============================================================================
// User Story 5: Comprehensive Operational Taxonomy (Hierarchical)
// ============================================================================
console.log('\n📋 User Story 5: Comprehensive Operational Taxonomy');
console.log('-'.repeat(80));

// AS5.1: Household has comprehensive functions (Health, Financial, Property, etc.)
const householdFunctions = expert.getFunctions('household');
const expectedHouseholdFunctions = ['Health', 'Financial', 'Property', 'Vehicle', 'Pet', 'Education', 'Insurance', 'Legal', 'Tax'];
const foundExpectedFunctions = expectedHouseholdFunctions.filter(expected =>
  householdFunctions.some(f => f.name.toLowerCase().includes(expected.toLowerCase()))
).length;
test('AS5.1: Household has comprehensive functions', foundExpectedFunctions >= 7,
  `Found ${foundExpectedFunctions}/${expectedHouseholdFunctions.length} expected functions`);

// AS5.2: Corporate has comprehensive functions
const expectedCorporateFunctions = ['Finance', 'Human', 'Operations', 'Sales', 'Marketing', 'Product', 'Customer', 'Legal', 'Compliance'];
const foundCorporateFunctions = expectedCorporateFunctions.filter(expected =>
  corporateFunctions.some(f => f.name.toLowerCase().includes(expected.toLowerCase()))
).length;
test('AS5.2: Corporate has comprehensive functions', foundCorporateFunctions >= 7,
  `Found ${foundCorporateFunctions}/${expectedCorporateFunctions.length} expected functions`);

// AS5.4: Navigate Function → Service → Activity → Document Types
const healthFunctions = householdFunctions.filter(f => f.name.toLowerCase().includes('health'));
if (healthFunctions.length > 0) {
  const healthServices = expert.getServices('household', healthFunctions[0].name);
  const medicalServices = healthServices.filter(s => s.name.toLowerCase().includes('medical'));

  if (medicalServices.length > 0) {
    const activities = expert.getActivities('household', healthFunctions[0].name, medicalServices[0].name);
    const hasActivities = activities.length > 0;
    const hasDocTypes = hasActivities &&
      expert.getDocumentTypesForActivity('household', healthFunctions[0].name, medicalServices[0].name, activities[0].name).length > 0;

    test('AS5.4: Full hierarchical navigation works (Function→Service→Activity→DocTypes)',
      hasActivities && hasDocTypes,
      `Found ${activities.length} activities with ${hasDocTypes ? 'document types' : 'no document types'}`);
  } else {
    test('AS5.4: Full hierarchical navigation works', false, 'No medical services found');
  }
} else {
  test('AS5.4: Full hierarchical navigation works', false, 'No health functions found');
}

// AS5.7: Storage paths follow hierarchical pattern
const storagePath = expert.generateStoragePath('household', healthFunctions[0]?.name || 'HealthManagement', 'MedicalCare', 'DoctorVisits');
test('AS5.7: Storage paths follow hierarchical pattern',
  storagePath.includes('/') && storagePath.toLowerCase().includes('household'),
  `Generated: ${storagePath}`);

// AS5.9: Tags include function, service, activity
const tags = expert.generateHierarchicalTags('household', healthFunctions[0]?.name || 'HealthManagement', 'MedicalCare', 'DoctorVisits');
const hasMultiLevelTags = tags.length >= 3;
test('AS5.9: Tags include multiple hierarchy levels', hasMultiLevelTags,
  `Generated ${tags.length} tags: ${tags.slice(0, 3).join(', ')}`);

// AS5.11: Path-based input validation
const pathValidation = expert.validatePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
test('AS5.11: Path-based input works', pathValidation.valid,
  pathValidation.valid ? undefined : pathValidation.errors?.join(', '));

// AS5.12: Path parsing and autocomplete
const parsed = expert.parsePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
test('AS5.12: Path parsing works',
  parsed.function === 'HealthManagement' && parsed.service === 'MedicalCare' && parsed.activity === 'DoctorVisits',
  `Parsed: ${parsed.function}/${parsed.service}/${parsed.activity}`);

// ============================================================================
// User Story 6: Expert Agent Integration
// ============================================================================
console.log('\n📋 User Story 6: Expert Agent Integration');
console.log('-'.repeat(80));

// AS6.6: TaxonomyExpert is single source of truth (verify no hardcoded values in workflows)
const workflowFiles = [
  './src/skills/RECORDSMANAGER/Workflows/UploadWorkflow.md',
  './src/skills/RECORDSMANAGER/Workflows/RetentionWorkflow.md',
  './src/skills/RECORDSMANAGER/Workflows/TrustValidation.md'
];

let workflowsUseTaxonomyExpert = 0;
for (const file of workflowFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('TaxonomyExpert') || content.includes('taxonomyExpert')) {
      workflowsUseTaxonomyExpert++;
    }
  }
}

test('AS6.6: Workflows reference TaxonomyExpert (single source of truth)',
  workflowsUseTaxonomyExpert >= 2,
  `${workflowsUseTaxonomyExpert}/${workflowFiles.length} workflows reference TaxonomyExpert`);

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('📊 Acceptance Validation Summary');
console.log('='.repeat(80));
console.log(`  ✓ Passed: ${passCount}`);
console.log(`  ✗ Failed: ${failCount}`);
console.log(`  Total: ${passCount + failCount}`);
console.log(`  Pass Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n  ✅ ALL ACCEPTANCE SCENARIOS VALIDATED');
} else {
  console.log(`\n  ⚠️  ${failCount} SCENARIOS NEED ATTENTION`);
}
console.log('='.repeat(80));

process.exit(failCount === 0 ? 0 : 1);
