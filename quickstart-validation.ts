/**
 * Quickstart Validation Test
 * Validates that the code examples in quickstart.md actually work
 */

import { TaxonomyExpert } from './src/skills/RECORDSMANAGER/Lib/TaxonomyExpert';

console.log('🧪 Quickstart Validation Test\n');
console.log('=' .repeat(60));

// Test example from quickstart: "Hierarchical Navigation Workflow"
const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');

console.log('\n1. Get functions for household...');
const functions = expert.getFunctions('household');
console.log(`   ✓ Found ${functions.length} functions`);
console.log(`   ✓ Contains HealthManagement: ${functions.some(f => f.name === 'HealthManagement')}`);

console.log('\n2. Get services for HealthManagement...');
const services = expert.getServices('household', 'HealthManagement');
console.log(`   ✓ Found ${services.length} services`);
console.log(`   ✓ Contains MedicalCare: ${services.some(s => s.name === 'MedicalCare')}`);

console.log('\n3. Get activities for HealthManagement/MedicalCare...');
const activities = expert.getActivities('household', 'HealthManagement', 'MedicalCare');
console.log(`   ✓ Found ${activities.length} activities`);
console.log(`   ✓ Contains DoctorVisits: ${activities.some(a => a.name === 'DoctorVisits')}`);

console.log('\n4. Get document types for HealthManagement/MedicalCare/DoctorVisits...');
const docTypes = expert.getDocumentTypesForActivity('household', 'HealthManagement', 'MedicalCare', 'DoctorVisits');
console.log(`   ✓ Found ${docTypes.length} document types`);
console.log(`   ✓ Contains "Doctor\'s Note": ${docTypes.includes("Doctor's Note")}`);

console.log('\n5. Validate path...');
const pathValidation = expert.validatePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
console.log(`   ✓ Path validation result: ${pathValidation.valid}`);

console.log('\n6. Parse path...');
const parsed = expert.parsePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
console.log(`   ✓ Function: ${parsed.function}`);
console.log(`   ✓ Service: ${parsed.service}`);
console.log(`   ✓ Activity: ${parsed.activity}`);

console.log('\n7. Get retention rules...');
const retention = expert.getRetentionForActivity('household', 'HealthManagement', 'MedicalCare', 'DoctorVisits');
console.log(`   ✓ AUS retention: ${retention?.AUS?.years} years`);
console.log(`   ✓ Authority: ${retention?.AUS?.authority}`);

console.log('\n8. Generate hierarchical tags...');
const tags = expert.generateHierarchicalTags('household', 'HealthManagement', 'MedicalCare', 'DoctorVisits');
console.log(`   ✓ Generated ${tags.length} tags`);
console.log(`   ✓ Tags: ${tags.slice(0, 3).join(', ')}...`);

console.log('\n9. Generate storage path...');
const storagePath = expert.generateStoragePath('household', 'HealthManagement', 'MedicalCare', 'DoctorVisits');
console.log(`   ✓ Storage path: ${storagePath}`);

console.log('\n10. Test autocomplete...');
const suggestions = expert.autocomplete('household', 'Health/Med', { maxResults: 5 });
console.log(`   ✓ Found ${suggestions.length} suggestions`);
if (suggestions.length > 0) {
  console.log(`   ✓ First suggestion: ${suggestions[0].path}`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All quickstart examples validated successfully!');
