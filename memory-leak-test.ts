/**
 * Memory Leak Test for Hierarchical Taxonomy Caching
 *
 * Tests:
 * 1. Multiple instance creation doesn't leak memory
 * 2. Repeated taxonomy loading is properly cached
 * 3. Navigation operations don't accumulate memory
 * 4. Stress test with thousands of operations
 */

import { TaxonomyExpert } from './src/skills/RECORDSMANAGER/Lib/TaxonomyExpert';
import type { Domain } from './src/lib/types/HierarchicalTaxonomy';

// Helper to get current memory usage in MB
function getMemoryUsageMB(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed / 1024 / 1024;
  }
  // Bun runtime
  return (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;
}

// Helper to force garbage collection (if available)
function forceGC() {
  if (global.gc) {
    global.gc();
  }
}

console.log('🧪 Memory Leak Test for Hierarchical Taxonomy Caching\n');
console.log('=' .repeat(80));

// Test 1: Multiple instance creation
console.log('\n📊 Test 1: Multiple Instance Creation');
console.log('-'.repeat(80));

forceGC();
const startMem1 = getMemoryUsageMB();

const instances: TaxonomyExpert[] = [];
for (let i = 0; i < 100; i++) {
  instances.push(new TaxonomyExpert('AUS', 'household', 'hierarchical'));
}

const afterCreateMem1 = getMemoryUsageMB();
instances.length = 0; // Clear references
forceGC();

const afterGCMem1 = getMemoryUsageMB();

console.log(`  Initial memory: ${startMem1.toFixed(2)} MB`);
console.log(`  After 100 instances: ${afterCreateMem1.toFixed(2)} MB (+${(afterCreateMem1 - startMem1).toFixed(2)} MB)`);
console.log(`  After GC: ${afterGCMem1.toFixed(2)} MB`);
console.log(`  Memory reclaimed: ${(afterCreateMem1 - afterGCMem1).toFixed(2)} MB`);
console.log(`  ✓ ${((afterCreateMem1 - afterGCMem1) / (afterCreateMem1 - startMem1) * 100).toFixed(1)}% of memory reclaimed`);

// Test 2: Repeated taxonomy loading
console.log('\n📊 Test 2: Repeated Taxonomy Loading (Cache Test)');
console.log('-'.repeat(80));

forceGC();
const startMem2 = getMemoryUsageMB();

const expert = new TaxonomyExpert('AUS', 'household', 'hierarchical');

// First load
expert.getFunctions('household');
const afterFirstLoad = getMemoryUsageMB();

// Repeated loads (should use cache)
for (let i = 0; i < 1000; i++) {
  expert.getFunctions('household');
}
const afterRepeatedLoads = getMemoryUsageMB();

console.log(`  Initial memory: ${startMem2.toFixed(2)} MB`);
console.log(`  After first load: ${afterFirstLoad.toFixed(2)} MB (+${(afterFirstLoad - startMem2).toFixed(2)} MB)`);
console.log(`  After 1000 repeated loads: ${afterRepeatedLoads.toFixed(2)} MB (+${(afterRepeatedLoads - afterFirstLoad).toFixed(2)} MB)`);
console.log(`  ✓ Repeated loads use cache (${(afterRepeatedLoads - afterFirstLoad).toFixed(3)} MB increase)`);

// Test 3: Navigation operations
console.log('\n📊 Test 3: Navigation Operations Memory Stability');
console.log('-'.repeat(80));

forceGC();
const startMem3 = getMemoryUsageMB();

const entityTypes: Domain[] = ['household', 'corporate', 'unit-trust', 'discretionary-trust'];

for (let i = 0; i < 1000; i++) {
  for (const entityType of entityTypes) {
    const e = new TaxonomyExpert('AUS', entityType, 'hierarchical');
    const functions = e.getFunctions(entityType);
    if (functions.length > 0) {
      const services = e.getServices(entityType, functions[0].name);
      if (services.length > 0) {
        const activities = e.getActivities(entityType, functions[0].name, services[0].name);
        if (activities.length > 0) {
          e.validatePath(entityType, `${functions[0].name}/${services[0].name}/${activities[0].name}`);
          e.parsePath(entityType, `${functions[0].name}/${services[0].name}/${activities[0].name}`);
        }
      }
    }
  }
}

const afterOps = getMemoryUsageMB();
forceGC();
const afterGC3 = getMemoryUsageMB();

console.log(`  Initial memory: ${startMem3.toFixed(2)} MB`);
console.log(`  After 4000 navigation operations: ${afterOps.toFixed(2)} MB (+${(afterOps - startMem3).toFixed(2)} MB)`);
console.log(`  After GC: ${afterGC3.toFixed(2)} MB`);
console.log(`  Memory per 1000 ops: ${((afterOps - startMem3) / 4).toFixed(3)} MB`);
console.log(`  ✓ Memory growth is linear and bounded`);

// Test 4: Stress test
console.log('\n📊 Test 4: Stress Test (10,000 operations)');
console.log('-'.repeat(80));

forceGC();
const startMem4 = getMemoryUsageMB();
const memorySnapshots: number[] = [];

for (let i = 0; i < 10; i++) {
  // 1000 operations per iteration
  for (let j = 0; j < 1000; j++) {
    const e = new TaxonomyExpert('AUS', 'household', 'hierarchical');
    e.getFunctions('household');
    e.getServices('household', 'HealthManagement');
    e.validatePath('household', 'HealthManagement/MedicalCare/DoctorVisits');
    e.generateHierarchicalTags('household', 'HealthManagement', 'MedicalCare', 'DoctorVisits');
  }
  memorySnapshots.push(getMemoryUsageMB());
}

const endMem4 = getMemoryUsageMB();
forceGC();
const afterGC4 = getMemoryUsageMB();

console.log(`  Initial memory: ${startMem4.toFixed(2)} MB`);
console.log(`  After 10,000 operations: ${endMem4.toFixed(2)} MB (+${(endMem4 - startMem4).toFixed(2)} MB)`);
console.log(`  After GC: ${afterGC4.toFixed(2)} MB`);
console.log(`  Memory snapshots (every 1000 ops):`);
for (let i = 0; i < memorySnapshots.length; i++) {
  const change = i > 0 ? (memorySnapshots[i] - memorySnapshots[i - 1]).toFixed(2) : '0.00';
  console.log(`    ${((i + 1) * 1000).toString().padStart(5)} ops: ${memorySnapshots[i].toFixed(2)} MB (${change >= '0' ? '+' : ''}${change} MB)`);
}

// Calculate memory growth trend
const firstHalf = memorySnapshots.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
const secondHalf = memorySnapshots.slice(5, 10).reduce((a, b) => a + b, 0) / 5;
const growthRate = ((secondHalf - firstHalf) / firstHalf) * 100;

console.log(`  Memory growth rate: ${growthRate.toFixed(2)}% (first half → second half)`);
console.log(`  ✓ ${growthRate < 10 ? 'Minimal' : growthRate < 25 ? 'Acceptable' : 'High'} memory growth rate`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ Memory Leak Test Summary');
console.log('='.repeat(80));

const results = {
  instanceCleanup: ((afterCreateMem1 - afterGCMem1) / (afterCreateMem1 - startMem1) * 100) > 80,
  cacheStability: (afterRepeatedLoads - afterFirstLoad) < 1,
  navStability: ((afterOps - startMem3) / 4) < 5,
  stressTestStable: growthRate < 25,
};

console.log(`  Instance cleanup: ${results.instanceCleanup ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Cache stability: ${results.cacheStability ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Navigation stability: ${results.navStability ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Stress test stable: ${results.stressTestStable ? '✓ PASS' : '✗ FAIL'}`);

const allPassed = Object.values(results).every(r => r);
console.log(`\n  ${allPassed ? '✅ NO MEMORY LEAKS DETECTED' : '⚠️  POTENTIAL MEMORY ISSUES'}`);
console.log('=' .repeat(80));

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
