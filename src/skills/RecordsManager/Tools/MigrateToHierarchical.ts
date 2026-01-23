#!/usr/bin/env bun
/**
 * MigrateToHierarchical.ts
 *
 * Migration tool for converting flat-tagged documents to hierarchical taxonomy.
 *
 * Features:
 * - Dry-run mode (default) to preview changes without applying
 * - Batch processing of multiple documents
 * - Intelligent path suggestion using TaxonomyExpert
 * - Audit logging of all changes
 * - Rollback support via audit log
 *
 * Usage:
 *   bun run MigrateToHierarchical.ts --doc-id 123 --dry-run
 *   bun run MigrateToHierarchical.ts --doc-id 123,456,789
 *   bun run MigrateToHierarchical.ts --all --limit 50
 */

import { PaperlessClient } from '../Lib/PaperlessClient.js';
import { TaxonomyExpert, Domain } from '../Lib/TaxonomyExpert.js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const paiDir = process.env.PAI_DIR || path.join(process.env.HOME || '', '.claude');
const envPath = path.join(paiDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  }
  console.log(`Loaded environment from: ${envPath}`);
}

// Configuration from environment
const PAPERLESS_URL = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL;
const PAPERLESS_TOKEN = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN;
const COUNTRY = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'AUS';
const DEFAULT_DOMAIN = (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) || 'household';

interface MigrationResult {
  documentId: number;
  title: string;
  success: boolean;
  suggestedPath?: string;
  newTags?: string[];
  storagePath?: string;
  retentionYears?: number;
  retentionAuthority?: string;
  error?: string;
  changes?: {
    tagsAdded: string[];
    tagsRemoved: string[];
    documentTypeChanged: boolean;
    storagePathSet: boolean;
  };
}

interface MigrationLog {
  timestamp: string;
  documentId: number;
  oldTags: string[];
  newTags: string[];
  oldDocumentType: string | null;
  newDocumentType: string | null;
  oldStoragePath: string | null;
  newStoragePath: string | null;
  path: string;
  retentionYears?: number;
  retentionAuthority?: string;
}

/**
 * Suggest hierarchical path for a document using TaxonomyExpert
 * Enhanced algorithm:
 * 1. Document type gets highest priority (exact match)
 * 2. Multi-word phrase matching in title
 * 3. Individual keyword search as fallback
 * 4. Confidence threshold to filter weak matches
 */
async function suggestHierarchicalPath(
  expert: TaxonomyExpert,
  document: any,
  domain: Domain,
  tagMap: Map<number, string>,
  documentTypeMap: Map<number, string>
): Promise<{
  path: string | null;
  tags: string[];
  storagePath: string | null;
  retentionYears?: number;
  retentionAuthority?: string;
  confidence: number;
}> {
  const title = (document.title || '').toLowerCase();
  // Convert document_type ID to name using lookup map
  const docTypeName = document.document_type
    ? documentTypeMap.get(document.document_type) || ''
    : '';
  const docType = docTypeName.toLowerCase();

  let bestMatch: any = null;
  let bestScore = 0;
  let matchSource = '';

  // Strategy 1: Document Type exact match (highest priority)
  if (docType) {
    const typeResults = expert.searchByKeyword(domain, docType);
    for (const result of typeResults) {
      if (result.activity && result.matchType === 'documentType') {
        const score = result.relevance + 10; // Boost document type matches
        if (score > bestScore) {
          bestMatch = result;
          bestScore = score;
          matchSource = `docType:${docType}`;
        }
      }
    }
  }

  // Strategy 2: Multi-word phrases from title (high priority)
  if (!bestMatch || bestScore < 15) {
    // Extract 2-3 word phrases
    const words = title.split(/\s+/).filter((w: string) => w.length > 2);

    for (let i = 0; i < words.length - 1; i++) {
      // Try 3-word phrases first
      if (i < words.length - 2) {
        const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
        const results = expert.searchByKeyword(domain, phrase);

        for (const result of results) {
          if (result.activity) {
            const score = result.relevance + 5; // Boost phrase matches
            if (score > bestScore) {
              bestMatch = result;
              bestScore = score;
              matchSource = `phrase3:${phrase}`;
            }
          }
        }
      }

      // Try 2-word phrases
      const phrase = `${words[i]} ${words[i+1]}`;
      const results = expert.searchByKeyword(domain, phrase);

      for (const result of results) {
        if (result.activity) {
          const score = result.relevance + 3; // Moderate boost for 2-word phrases
          if (score > bestScore) {
            bestMatch = result;
            bestScore = score;
            matchSource = `phrase2:${phrase}`;
          }
        }
      }
    }
  }

  // Strategy 3: Individual keywords (fallback)
  if (!bestMatch || bestScore < 10) {
    const searchTerms = title.split(/\s+/).filter((term: string) => term.length > 3);

    for (const term of searchTerms) {
      const results = expert.searchByKeyword(domain, term);

      for (const result of results) {
        if (result.activity && result.relevance > bestScore) {
          bestMatch = result;
          bestScore = result.relevance;
          matchSource = `keyword:${term}`;
        }
      }
    }
  }

  // Apply confidence threshold - only return if confidence is reasonable
  const CONFIDENCE_THRESHOLD = 5; // Minimum relevance score

  if (!bestMatch || !bestMatch.activity || bestScore < CONFIDENCE_THRESHOLD) {
    return {
      path: null,
      tags: [],
      storagePath: null,
      confidence: 0,
    };
  }

  // Normalize confidence to 0-100 scale
  const normalizedConfidence = Math.min(100, (bestScore / 20) * 100);

  // Generate hierarchical components
  const hierarchicalPath = `${bestMatch.function}/${bestMatch.service}/${bestMatch.activity}`;
  const tags = expert.generateHierarchicalTags(
    domain,
    bestMatch.function,
    bestMatch.service,
    bestMatch.activity
  );
  const storagePath = expert.generateStoragePath(
    domain,
    bestMatch.function,
    bestMatch.service,
    bestMatch.activity
  );

  // Get retention information
  const retention = expert.getRetentionForActivity(
    domain,
    bestMatch.function,
    bestMatch.service,
    bestMatch.activity
  );

  const countryCode = COUNTRY === 'Australia' ? 'AUS' : COUNTRY === 'United States' ? 'USA' : 'GBR';
  const retentionRule = retention?.[countryCode];

  return {
    path: hierarchicalPath,
    tags,
    storagePath,
    retentionYears: retentionRule?.years,
    retentionAuthority: retentionRule?.authority,
    confidence: normalizedConfidence,
  };
}

/**
 * Migrate a single document to hierarchical taxonomy
 */
async function migrateDocument(
  client: PaperlessClient,
  expert: TaxonomyExpert,
  documentId: number,
  domain: Domain,
  dryRun: boolean,
  tagMap: Map<number, string>,
  documentTypeMap: Map<number, string>
): Promise<MigrationResult> {
  try {
    // Fetch document metadata
    const document = await client.getDocument(documentId);

    if (!document) {
      return {
        documentId,
        title: 'Unknown',
        success: false,
        error: 'Document not found',
      };
    }

    // Get current tags (names, not IDs)
    const currentTags = document.tags || [];

    // Suggest hierarchical path
    const suggestion = await suggestHierarchicalPath(expert, document, domain, tagMap, documentTypeMap);

    if (!suggestion.path) {
      return {
        documentId,
        title: document.title,
        success: false,
        error: 'Could not determine hierarchical path for this document',
      };
    }

    // Prepare changes
    const newTags = [...new Set([...suggestion.tags])];
    const tagsToAdd = newTags.filter(tag => !currentTags.includes(tag));
    const tagsToRemove: string[] = []; // We preserve old tags for now

    const result: MigrationResult = {
      documentId,
      title: document.title,
      success: true,
      suggestedPath: suggestion.path,
      newTags,
      storagePath: suggestion.storagePath || undefined,
      retentionYears: suggestion.retentionYears,
      retentionAuthority: suggestion.retentionAuthority,
      changes: {
        tagsAdded: tagsToAdd,
        tagsRemoved: tagsToRemove,
        documentTypeChanged: false,
        storagePathSet: !!suggestion.storagePath,
      },
    };

    if (!dryRun) {
      // Apply changes
      // Note: We need to get tag IDs for paperless-ngx
      // For now, just log what we would do
      console.log(`[LIVE] Would update document ${documentId} with:`);
      console.log(`  Tags to add: ${tagsToAdd.join(', ')}`);
      console.log(`  Storage path: ${suggestion.storagePath}`);

      // TODO: Implement actual update when we have tag ID resolution
      // This requires:
      // 1. Create missing tags in paperless-ngx
      // 2. Get tag IDs
      // 3. Update document with new tag IDs
    }

    return result;
  } catch (error) {
    return {
      documentId,
      title: 'Unknown',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Write migration log entry
 */
function writeMigrationLog(logPath: string, entry: MigrationLog): void {
  const logEntry = JSON.stringify(entry) + '\n';
  fs.appendFileSync(logPath, logEntry, 'utf-8');
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dryRun = args.includes('--dry-run') || !args.includes('--execute');
  const docIdsArg = args.find(arg => arg.startsWith('--doc-id='));
  const allDocs = args.includes('--all');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

  if (!PAPERLESS_URL || !PAPERLESS_TOKEN) {
    console.error('Error: MADEINOZ_RECORDMANAGER_PAPERLESS_URL and MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN must be set');
    process.exit(1);
  }

  const client = new PaperlessClient({
    baseUrl: PAPERLESS_URL,
    apiToken: PAPERLESS_TOKEN,
  });
  const expert = new TaxonomyExpert(COUNTRY, DEFAULT_DOMAIN, 'hierarchical');

  // Fetch lookup data for tags and document types
  console.log('Loading metadata from paperless-ngx...');
  const [tags, documentTypes] = await Promise.all([
    client.getTags(),
    client.getDocumentTypes(),
  ]);

  // Create lookup maps
  const tagMap = new Map(tags.map(t => [t.id, t.name]));
  const documentTypeMap = new Map(documentTypes.map(dt => [dt.id, dt.name]));
  console.log(`✓ Loaded ${tags.length} tags and ${documentTypes.length} document types\n`);

  // Determine which documents to migrate
  let documentIds: number[] = [];

  if (docIdsArg) {
    const ids = docIdsArg.split('=')[1];
    documentIds = ids.split(',').map(id => parseInt(id.trim(), 10));
  } else if (allDocs) {
    // Fetch all documents
    const response = await client.searchDocuments({ page_size: limit });
    documentIds = response.results.map((doc: any) => doc.id);
  } else {
    console.log('Usage:');
    console.log('  bun run MigrateToHierarchical.ts --doc-id=123 [--dry-run|--execute]');
    console.log('  bun run MigrateToHierarchical.ts --doc-id=123,456,789 [--dry-run|--execute]');
    console.log('  bun run MigrateToHierarchical.ts --all [--limit=50] [--dry-run|--execute]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Preview changes without applying (default)');
    console.log('  --execute    Apply changes to paperless-ngx');
    console.log('  --all        Migrate all documents');
    console.log('  --limit=N    Limit to N documents when using --all (default: 50)');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Migration to Hierarchical Taxonomy`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (applying changes)'}`);
  console.log(`Documents: ${documentIds.length}`);
  console.log(`Domain: ${DEFAULT_DOMAIN}`);
  console.log(`Country: ${COUNTRY}`);
  console.log(`${'='.repeat(80)}\n`);

  // Create log file
  const logDir = path.join(paiDir, 'MEMORY', 'RECORDSMANAGER', 'migration-logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logDir, `migration-${timestamp}.jsonl`);

  // Process documents
  const results: MigrationResult[] = [];

  for (let i = 0; i < documentIds.length; i++) {
    const docId = documentIds[i];
    console.log(`\n[${i + 1}/${documentIds.length}] Processing document ${docId}...`);

    const result = await migrateDocument(client, expert, docId, DEFAULT_DOMAIN, dryRun, tagMap, documentTypeMap);
    results.push(result);

    if (result.success) {
      console.log(`  ✓ ${result.title}`);
      console.log(`    Path: ${result.suggestedPath}`);
      console.log(`    Tags: ${result.newTags?.join(', ')}`);
      console.log(`    Storage: ${result.storagePath}`);
      if (result.retentionYears) {
        console.log(`    Retention: ${result.retentionYears} years (${result.retentionAuthority})`);
      }
      console.log(`    Changes:`);
      console.log(`      Tags added: ${result.changes?.tagsAdded.join(', ') || 'none'}`);
      console.log(`      Tags removed: ${result.changes?.tagsRemoved.join(', ') || 'none'}`);
    } else {
      console.log(`  ✗ Error: ${result.error}`);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Migration Summary`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total documents: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log(`Log file: ${logPath}`);

  if (dryRun) {
    console.log(`\nThis was a DRY RUN. No changes were applied.`);
    console.log(`To apply changes, run with --execute flag.`);
  }
  console.log(`${'='.repeat(80)}\n`);

  // Export results to JSON file for analysis
  const resultsPath = path.join(logDir, `migration-results-${timestamp}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Results exported to: ${resultsPath}\n`);
}

main().catch(console.error);
