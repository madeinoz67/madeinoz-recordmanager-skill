#!/usr/bin/env bun
/**
 * SelectPilotDocuments.ts
 *
 * Intelligently select 50 representative documents for pilot migration testing.
 *
 * Selection criteria:
 * - Diverse document types (financial, legal, medical, vehicle, etc.)
 * - Common document types get more samples (e.g., Bank Statements)
 * - Edge cases and unusual documents included
 * - Spread across different years
 * - Various tagging patterns (flat, hierarchical, mixed)
 */

import * as fs from 'fs';
import * as path from 'path';

// PAI directory resolution
const paiDir = process.env.PAI_DIR || path.join(process.env.HOME || '', '.claude');

interface Document {
  id: number;
  title: string;
  created: string;
  tags: string[];
  document_type?: string;
  correspondent?: string;
  original_file_name: string;
}

interface DocumentGroup {
  type: string;
  documents: Document[];
}

/**
 * Load all documents from exported JSON
 */
function loadDocuments(filePath: string): Document[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Document[];
}

/**
 * Group documents by type
 */
function groupByType(documents: Document[]): Map<string, Document[]> {
  const groups = new Map<string, Document[]>();

  for (const doc of documents) {
    const type = doc.document_type || 'Unknown';
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(doc);
  }

  return groups;
}

/**
 * Categorize documents into functional categories
 */
function categorizeDocument(doc: Document): string {
  const title = doc.title.toLowerCase();
  const tags = doc.tags.map(t => t.toLowerCase()).join(' ');
  const type = (doc.document_type || '').toLowerCase();
  const combined = `${title} ${tags} ${type}`;

  if (combined.includes('bank') || combined.includes('statement') || combined.includes('account')) {
    return 'financial:banking';
  }
  if (combined.includes('tax') || combined.includes('invoice') || combined.includes('receipt')) {
    return 'financial:tax';
  }
  if (combined.includes('insurance') || combined.includes('policy') || combined.includes('certificate')) {
    return 'insurance';
  }
  if (combined.includes('vehicle') || combined.includes('car') || combined.includes('motor')) {
    return 'vehicle';
  }
  if (combined.includes('medical') || combined.includes('health') || combined.includes('prescription')) {
    return 'health';
  }
  if (combined.includes('legal') || combined.includes('contract') || combined.includes('deed')) {
    return 'legal';
  }
  if (combined.includes('utility') || combined.includes('energy') || combined.includes('bill')) {
    return 'household:utilities';
  }
  if (combined.includes('quotation') || combined.includes('estimate')) {
    return 'household:maintenance';
  }
  if (combined.includes('test') || combined.includes('error')) {
    return 'test';
  }

  return 'other';
}

/**
 * Select pilot documents with balanced representation
 */
function selectPilotDocuments(documents: Document[], targetCount: number = 50): Document[] {
  // Categorize all documents
  const categories = new Map<string, Document[]>();
  for (const doc of documents) {
    const category = categorizeDocument(doc);
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(doc);
  }

  // Remove test documents from pilot (we don't need to migrate test data)
  categories.delete('test');

  // Calculate samples per category (weighted by size)
  const totalDocs = Array.from(categories.values()).reduce((sum, docs) => sum + docs.length, 0);
  const selected: Document[] = [];
  const categoryAllocation = new Map<string, number>();

  // Allocate samples proportionally, with minimum 2 per category
  for (const [category, docs] of categories.entries()) {
    const proportion = docs.length / totalDocs;
    const allocation = Math.max(2, Math.round(proportion * targetCount));
    categoryAllocation.set(category, Math.min(allocation, docs.length));
  }

  // Adjust if we're over target
  let totalAllocated = Array.from(categoryAllocation.values()).reduce((sum, n) => sum + n, 0);
  if (totalAllocated > targetCount) {
    // Reduce from largest categories first
    const sorted = Array.from(categoryAllocation.entries()).sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sorted) {
      if (totalAllocated <= targetCount) break;
      const reduction = Math.min(count - 2, totalAllocated - targetCount);
      categoryAllocation.set(category, count - reduction);
      totalAllocated -= reduction;
    }
  }

  // Select documents from each category
  for (const [category, docs] of categories.entries()) {
    const count = categoryAllocation.get(category) || 2;
    // Sort by created date to get a spread across time
    const sorted = docs.sort((a, b) => a.created.localeCompare(b.created));

    // Select evenly distributed samples
    const step = Math.max(1, Math.floor(sorted.length / count));
    for (let i = 0; i < count && i * step < sorted.length; i++) {
      selected.push(sorted[i * step]);
    }
  }

  // If we're under target, add more from largest categories
  if (selected.length < targetCount) {
    const remaining = targetCount - selected.length;
    const selectedIds = new Set(selected.map(d => d.id));
    const unselected = documents.filter(d => !selectedIds.has(d.id) && categorizeDocument(d) !== 'test');

    for (let i = 0; i < remaining && i < unselected.length; i++) {
      selected.push(unselected[i]);
    }
  }

  // Sort by ID for consistent output
  return selected.sort((a, b) => a.id - b.id);
}

/**
 * Main function
 */
function main() {
  const inputPath = path.join(paiDir, 'MEMORY', 'Work', 'current', 'all-documents.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Document file not found at ${inputPath}`);
    console.error('Run FetchAllDocuments.ts first to export documents.');
    process.exit(1);
  }

  console.log('📋 Pilot Document Selection');
  console.log('='.repeat(80));
  console.log('');

  // Load documents
  console.log(`Loading documents from: ${inputPath}`);
  const documents = loadDocuments(inputPath);
  console.log(`✓ Loaded ${documents.length} documents\n`);

  // Group by type
  const typeGroups = groupByType(documents);
  console.log(`📊 Document Types: ${typeGroups.size}`);
  const sortedTypes = Array.from(typeGroups.entries()).sort((a, b) => b[1].length - a[1].length);
  for (const [type, docs] of sortedTypes.slice(0, 10)) {
    console.log(`   ${type}: ${docs.length} documents`);
  }
  console.log('');

  // Categorize
  const categories = new Map<string, number>();
  for (const doc of documents) {
    const category = categorizeDocument(doc);
    categories.set(category, (categories.get(category) || 0) + 1);
  }

  console.log(`📂 Functional Categories: ${categories.size}`);
  const sortedCategories = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);
  for (const [category, count] of sortedCategories) {
    console.log(`   ${category}: ${count} documents`);
  }
  console.log('');

  // Select pilot documents
  console.log('🎯 Selecting 50 pilot documents...');
  const pilot = selectPilotDocuments(documents, 50);
  console.log(`✓ Selected ${pilot.length} documents\n`);

  // Show distribution
  const pilotCategories = new Map<string, number>();
  for (const doc of pilot) {
    const category = categorizeDocument(doc);
    pilotCategories.set(category, (pilotCategories.get(category) || 0) + 1);
  }

  console.log('📊 Pilot Distribution:');
  for (const [category, count] of Array.from(pilotCategories.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${category}: ${count} documents`);
  }
  console.log('');

  // Export pilot list
  const outputDir = path.join(paiDir, 'MEMORY', 'RECORDSMANAGER', 'migration');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pilotIdsPath = path.join(outputDir, 'pilot-document-ids.json');
  const pilotIds = pilot.map(d => d.id);
  fs.writeFileSync(pilotIdsPath, JSON.stringify(pilotIds, null, 2), 'utf-8');
  console.log(`✓ Exported pilot document IDs to: ${pilotIdsPath}`);

  const pilotDetailsPath = path.join(outputDir, 'pilot-documents-details.json');
  fs.writeFileSync(pilotDetailsPath, JSON.stringify(pilot, null, 2), 'utf-8');
  console.log(`✓ Exported pilot document details to: ${pilotDetailsPath}`);

  // Generate migration command
  console.log('');
  console.log('='.repeat(80));
  console.log('Next Steps:');
  console.log('='.repeat(80));
  console.log('');
  console.log('1. Review pilot documents:');
  console.log(`   cat ${pilotDetailsPath} | less`);
  console.log('');
  console.log('2. Run pilot migration (dry-run):');
  console.log(`   bun run Tools/MigrateToHierarchical.ts --doc-id=${pilotIds.join(',')} --dry-run`);
  console.log('');
  console.log('3. Review results and apply if satisfied:');
  console.log(`   bun run Tools/MigrateToHierarchical.ts --doc-id=${pilotIds.join(',')} --execute`);
  console.log('');
}

main();
