// $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts
#!/usr/bin/env bun
/**
 * Records Manager CLI Tool
 * Main interface for all record keeping operations
 */

import { PaperlessClient, createClientFromEnv } from '../Lib/PaperlessClient';
import { TaxonomyExpert, createExpertFromEnv, Domain } from '../Lib/TaxonomyExpert';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface CommandOptions {
  [key: string]: string | boolean | number | string[];
}

/**
 * Upload document with intelligent tagging
 */
async function upload(file: string, options: CommandOptions): Promise<void> {
  const client = createClientFromEnv();
  const expert = createExpertFromEnv();
  const domain = (options.domain as Domain) || undefined;

  console.log(`📄 Uploading: ${file}`);

  // Read file
  const fileContent = await readFile(file);
  const fileName = file.split('/').pop() || file;

  // Get taxonomy suggestions
  const suggestions = expert.suggestMetadata(fileName, undefined, domain);

  console.log('💡 Suggested metadata:');
  console.log(`   Document Type: ${suggestions.documentType || 'Auto-detect'}`);
  console.log(`   Tags: ${suggestions.tags.join(', ') || 'None'}`);
  console.log(`   Retention: ${suggestions.retentionYears ? `${suggestions.retentionYears} years` : 'Not specified'}`);
  if (suggestions.retentionReason) {
    console.log(`   Reason: ${suggestions.retentionReason}`);
  }

  // Get or create tags
  const tagIds: number[] = [];
  for (const tagName of suggestions.tags) {
    const tag = await client.getOrCreateTag(tagName);
    tagIds.push(tag.id);
    console.log(`✓ Created/found tag: ${tag.name}`);
  }

  // Get or create document type
  let documentTypeId: number | undefined;
  if (suggestions.documentType) {
    const docType = await client.getOrCreateDocumentType(suggestions.documentType);
    documentTypeId = docType.id;
    console.log(`✓ Created/found document type: ${docType.name}`);
  }

  // Upload document
  const blob = new Blob([fileContent], { type: 'application/pdf' });
  const uploaded = await client.uploadDocument(blob, {
    title: options.title as string || fileName,
    tags: tagIds,
    document_type: documentTypeId,
    created: new Date().toISOString(),
  });

  console.log(`✅ Document uploaded successfully! ID: ${uploaded.id}`);
}

/**
 * Search documents
 */
async function search(options: CommandOptions): Promise<void> {
  const client = createClientFromEnv();

  console.log(`🔍 Searching documents...`);

  const params: any = {};
  if (options.query) params.query = options.query as string;
  if (options.tags) {
    const tagIds = await parseTagIds(client, options.tags as string);
    params.tags__id__in = tagIds;
  }
  if (options.type) {
    const types = await client.getDocumentTypes();
    const type = types.find(t => t.name.toLowerCase() === (options.type as string).toLowerCase());
    if (type) params.document_type__id = type.id;
  }

  const results = await client.searchDocuments(params);

  console.log(`\n📊 Found ${results.count} documents:\n`);
  for (const doc of results.results) {
    console.log(`[${doc.id}] ${doc.title}`);
    console.log(`    Created: ${new Date(doc.created).toLocaleDateString()}`);
    console.log(`    Tags: ${doc.tags.length > 0 ? doc.tags.join(', ') : 'None'}`);
    console.log('');
  }
}

/**
 * Organize documents with taxonomy improvements
 */
async function organize(options: CommandOptions): Promise<void> {
  const client = createClientFromEnv();
  const expert = createExpertFromEnv();
  const domain = (options.domain as Domain) || undefined;

  console.log(`🗂️  Analyzing document organization...`);

  // Get recent documents without proper tags
  const results = await client.searchDocuments({ page_size: 100 });
  const untagged = results.results.filter(d => d.tags.length === 0);

  console.log(`\n📋 Found ${untagged.length} documents without tags\n`);

  for (const doc of untagged) {
    const suggestions = expert.suggestMetadata(doc.title, doc.content, domain);

    console.log(`[${doc.id}] ${doc.title}`);
    console.log(`    Suggested Tags: ${suggestions.tags.join(', ') || 'None'}`);
    console.log(`    Suggested Type: ${suggestions.documentType || 'Auto-detect'}`);

    if (options.apply) {
      // Apply suggestions
      const tagIds: number[] = [];
      for (const tagName of suggestions.tags) {
        const tag = await client.getOrCreateTag(tagName);
        tagIds.push(tag.id);
      }

      await client.updateDocument(doc.id, { tags: tagIds });
      console.log(`    ✅ Applied tags`);
    }
    console.log('');
  }
}

/**
 * Add tags to documents
 */
async function tag(docIds: string[], tagNames: string[]): Promise<void> {
  const client = createClientFromEnv();

  console.log(`🏷️  Tagging ${docIds.length} documents...`);

  // Get or create tags
  const tagIds: number[] = [];
  for (const tagName of tagNames) {
    const tag = await client.getOrCreateTag(tagName);
    tagIds.push(tag.id);
    console.log(`✓ Tag: ${tag.name} (ID: ${tag.id})`);
  }

  // Apply to documents
  for (const idStr of docIds) {
    const id = parseInt(idStr, 10);
    const doc = await client.getDocument(id);

    const newTags = [...new Set([...doc.tags, ...tagIds])];
    await client.updateDocument(id, { tags: newTags });

    console.log(`✅ Tagged document ${id}: ${doc.title}`);
  }
}

/**
 * Get document information
 */
async function info(docId: string): Promise<void> {
  const client = createClientFromEnv();
  const expert = createExpertFromEnv();

  const id = parseInt(docId, 10);
  const doc = await client.getDocument(id);

  console.log(`\n📄 Document Information\n`);
  console.log(`ID: ${doc.id}`);
  console.log(`Title: ${doc.title}`);
  console.log(`Filename: ${doc.original_file_name}`);
  console.log(`Created: ${new Date(doc.created).toLocaleString()}`);
  console.log(`Modified: ${new Date(doc.modified).toLocaleString()}`);

  // Get tags
  const allTags = await client.getTags();
  const docTags = allTags.filter(t => doc.tags.includes(t.id));
  console.log(`\nTags:`);
  if (docTags.length === 0) {
    console.log(`  (None)`);
  } else {
    for (const tag of docTags) {
      console.log(`  • ${tag.name} (${tag.color})`);
    }
  }

  // Get document type
  if (doc.document_type) {
    const allTypes = await client.getDocumentTypes();
    const docType = allTypes.find(t => t.id === doc.document_type);
    if (docType) {
      console.log(`\nDocument Type: ${docType.name}`);

      // Check retention
      const retention = expert.getRetentionRequirements(docType.name);
      if (retention) {
        const retentionDate = new Date(doc.created);
        retentionDate.setFullYear(retentionDate.getFullYear() + retention.years);
        const canDelete = retentionDate < new Date();

        console.log(`\nRetention:`);
        console.log(`  Period: ${retention.years} years`);
        console.log(`  Reason: ${retention.reason}`);
        console.log(`  Keep Until: ${retentionDate.toLocaleDateString()}`);
        console.log(`  Can Delete: ${canDelete ? 'Yes (past retention)' : 'No'}`);
      }
    }
  }

  console.log('');
}

/**
 * Check retention requirements
 */
async function retention(options: CommandOptions): Promise<void> {
  const expert = createExpertFromEnv();
  const domain = (options.domain as Domain) || undefined;

  console.log(`📅 Retention Requirements for ${expert.constructor.name}\n`);

  const docTypes = expert.getDocumentTypes(domain);

  for (const docType of docTypes) {
    const retention = expert.getRetentionRequirements(docType, domain);
    if (retention) {
      console.log(`${docType}:`);
      console.log(`  Keep for: ${retention.years} years`);
      console.log(`  Reason: ${retention.reason}`);
      console.log('');
    }
  }
}

/**
 * Test connection and show system status
 */
async function status(): Promise<void> {
  console.log(`\n🔍 Records Manager - Connection Test & Status\n`);
  console.log(`${'─'.repeat(50)}\n`);

  let allPassed = true;

  // 1. Check environment variables
  console.log(`1️⃣  Environment Configuration`);
  const url = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_URL;
  const token = process.env.MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN;
  const country = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';
  const domain = process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN || 'household';

  if (url) {
    console.log(`   ✅ PAPERLESS_URL: ${url}`);
  } else {
    console.log(`   ❌ PAPERLESS_URL: NOT SET`);
    allPassed = false;
  }

  if (token) {
    console.log(`   ✅ API_TOKEN: Set (${token.length} chars)`);
  } else {
    console.log(`   ❌ API_TOKEN: NOT SET`);
    allPassed = false;
  }

  console.log(`   ✅ COUNTRY: ${country}`);
  console.log(`   ✅ DEFAULT_DOMAIN: ${domain}`);
  console.log('');

  if (!url || !token) {
    console.log(`\n❌ Cannot continue - missing required environment variables\n`);
    console.log(`Set these in your .env file:`);
    console.log(`  MADEINOZ_RECORDMANAGER_PAPERLESS_URL=https://your-instance.com`);
    console.log(`  MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN=your-token\n`);
    process.exit(1);
  }

  // 2. Test API connectivity
  console.log(`2️⃣  API Connectivity`);
  try {
    const response = await fetch(`${url}/api/`, {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` },
    });

    if (response.ok) {
      console.log(`   ✅ API endpoint reachable`);
    } else if (response.status === 401) {
      console.log(`   ❌ API reachable but authentication failed (401)`);
      allPassed = false;
    } else {
      console.log(`   ⚠️  API returned unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allPassed = false;
  }
  console.log('');

  // 3. Test authenticated operations
  console.log(`3️⃣  Authentication & Data Access`);
  try {
    const client = createClientFromEnv();

    // Test tags endpoint
    const tags = await client.getTags();
    console.log(`   ✅ Tags accessible: ${tags.length} tags found`);

    // Test document types endpoint
    const docTypes = await client.getDocumentTypes();
    console.log(`   ✅ Document types accessible: ${docTypes.length} types found`);

    // Test documents endpoint
    const docs = await client.searchDocuments({ page_size: 1 });
    console.log(`   ✅ Documents accessible: ${docs.count} total documents`);

  } catch (error) {
    console.log(`   ❌ Data access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allPassed = false;
  }
  console.log('');

  // 4. Test taxonomy expert
  console.log(`4️⃣  Taxonomy Expert`);
  try {
    const expert = createExpertFromEnv();
    const docTypes = expert.getDocumentTypes();
    const tagCategories = expert.getTagCategories();

    console.log(`   ✅ Taxonomy loaded for: ${country}`);
    console.log(`   ✅ Document types: ${docTypes.length} defined`);
    console.log(`   ✅ Tag categories: ${Object.keys(tagCategories).length} categories`);
  } catch (error) {
    console.log(`   ❌ Taxonomy error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allPassed = false;
  }
  console.log('');

  // Summary
  console.log(`${'─'.repeat(50)}`);
  if (allPassed) {
    console.log(`\n✅ All checks passed - Records Manager is ready!\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ Some checks failed - review errors above\n`);
    process.exit(1);
  }
}

/**
 * Parse tag names to IDs
 */
async function parseTagIds(client: PaperlessClient, tagNamesStr: string): Promise<number[]> {
  const tagNames = tagNamesStr.split(',').map(t => t.trim());
  const allTags = await client.getTags();

  const ids: number[] = [];
  for (const name of tagNames) {
    const tag = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (tag) {
      ids.push(tag.id);
    }
  }

  return ids;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse options
  const options: CommandOptions = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  try {
    switch (command) {
      case 'upload':
        await upload(args[1], options);
        break;

      case 'search':
        await search(options);
        break;

      case 'organize':
        await organize(options);
        break;

      case 'tag':
        await tag(args[1].split(','), args.slice(2));
        break;

      case 'info':
        await info(args[1]);
        break;

      case 'retention':
        await retention(options);
        break;

      case 'status':
        await status();
        break;

      case 'delete':
        console.error('❌ Deletion requires explicit approval');
        console.error('   Use the DeleteConfirmation workflow instead');
        console.error('   This prevents catastrophic data loss');
        process.exit(1);
        break;

      default:
        console.log(`
Records Manager CLI - Document Management with Expert Taxonomies

Usage:
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts <command> [options]

Commands:
  upload <file>              Upload document with intelligent tagging
    --title <title>          Custom document title
    --domain <domain>        household | corporate | projects

  search                     Search documents
    --query <text>           Search in content
    --tags <tags>            Comma-separated tag names
    --type <type>            Document type filter

  organize                   Suggest and apply taxonomy improvements
    --domain <domain>        Domain to analyze
    --apply                  Apply suggested tags (dry run without)

  tag <docIds> <tags>        Add tags to documents
    docIds:                  Comma-separated document IDs
    tags:                    Tag names to add

  info <docId>               Get document information and retention status

  retention                  Show retention requirements for document types
    --domain <domain>        Domain to show

  status                     Test connection and show system status
                             Verifies env vars, API connectivity, auth, and taxonomy

  delete <query>             ⚠️  REQUIRES EXPLICIT APPROVAL
                             Must use DeleteConfirmation workflow

Examples:
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts upload invoice.pdf --domain corporate
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts search --tags "tax,2024"
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts organize --domain household --apply
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts info 12345
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts retention --domain corporate

Environment Variables:
  MADEINOZ_RECORDMANAGER_PAPERLESS_URL        Your paperless-ngx instance URL
  MADEINOZ_RECORDMANAGER_PAPERLESS_API_TOKEN  API token with read/write permissions
  MADEINOZ_RECORDMANAGER_COUNTRY              Your country for compliance (default: Australia)
  MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN       Default domain (default: household)
        `);
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

main();
