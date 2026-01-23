#!/usr/bin/env bun
// $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts
/**
 * Records Manager CLI Tool
 * Main interface for all record keeping operations
 */

// Load environment variables from .env file
import { config } from 'dotenv';
import { join } from 'path';

// Try loading from PAI_DIR, fallback to ~/.claude
const paiDir = process.env.PAI_DIR || join(process.env.HOME || '', '.claude');
const envPaths = [
  join(paiDir, '.env'),
  '.env', // Local fallback
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (result.error) {
      // Try next path
      continue;
    }
    envLoaded = true;
    break;
  } catch {
    // Try next path
  }
}

import { PaperlessClient, createClientFromEnv } from '../Lib/PaperlessClient';
import { TaxonomyExpert, createExpertFromEnv, Domain } from '../Lib/TaxonomyExpert';
import { TaxonomyInstaller } from '../Lib/TaxonomyInstaller';
import { TaxonomyValidator } from '../Lib/TaxonomyValidator';
import { SensitivityExpert } from '../Lib/SensitivityExpert';
import { readFile } from 'fs/promises';

interface CommandOptions {
  [key: string]: string | boolean | number | string[];
}

/**
 * Upload document with intelligent tagging and validation
 */
async function upload(file: string, options: CommandOptions): Promise<void> {
  const client = createClientFromEnv();
  const expert = createExpertFromEnv();
  const sensitivityExpert = new SensitivityExpert();
  const domain = (options.domain as Domain) || undefined;
  const country = process.env.MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY || 'Australia';

  console.log(`📄 Uploading: ${file}`);
  console.log('');

  // Read file
  const fileContent = await readFile(file);
  const fileName = file.split('/').pop() || file;
  const content = fileContent.toString(); // Convert buffer to string for analysis

  // STEP 1: Get taxonomy suggestions from Records Keeper Agent
  console.log('🤖 Records Keeper Agent - Analyzing document...');
  const suggestions = expert.suggestMetadata(fileName, content, domain);

  // STEP 2: Classify sensitivity with Sensitivity Scanner Agent
  console.log('🔒 Sensitivity Scanner Agent - Classifying document...');
  const classification = sensitivityExpert.classifyDocument(fileName, content, domain);

  // STEP 2.5: Handle entity (if provided)
  const entityName = options.entity as string | undefined;
  let entityTag: { id: number; name: string } | undefined;
  let entityStoragePath: { id: number; path: string } | undefined;
  let correspondentId: number | undefined;

  if (entityName) {
    console.log(`🏢 Entity Handler - Setting up entity: ${entityName}...`);

    try {
      // Create or find entity tag
      entityTag = await client.getOrCreateTag(`entity:${entityName}`);
      console.log(`   ✓ Entity tag: ${entityTag.name}`);

      // Create or find entity storage path
      entityStoragePath = await client.getOrCreateStoragePath(entityName);
      console.log(`   ✓ Storage path: ${entityStoragePath.path}`);

      // Create or find correspondent (entity name)
      const correspondent = await client.getOrCreateCorrespondent(entityName);
      correspondentId = correspondent.id;
      console.log(`   ✓ Correspondent: ${correspondent.name}`);
    } catch (error) {
      console.error(`❌ Entity setup failed: ${error}`);
      throw error;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 AGENT ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Display taxonomy suggestions
  console.log('📝 Records Keeper Suggestions:');
  console.log(`   Document Type: ${suggestions.documentType || '(Not specified)'}`);
  console.log(`   Tags: ${suggestions.tags.length > 0 ? suggestions.tags.join(', ') : '(None)'}`);
  console.log(`   Retention: ${suggestions.retentionYears ? `${suggestions.retentionYears} years` : '(Not specified)'}`);
  if (suggestions.retentionReason) {
    console.log(`   Reason: ${suggestions.retentionReason}`);
  }
  console.log('');

  // Display sensitivity classification
  console.log('🔒 Sensitivity Classification:');
  console.log(`   Level: ${classification.level.toUpperCase()} (${classification.confidence} confidence)`);
  console.log(`   Color: ${classification.color}`);
  console.log(`   Reasoning:`);
  for (const reason of classification.reasoning) {
    console.log(`     • ${reason}`);
  }
  if (classification.industrySpecific && classification.industrySpecific.type !== 'None') {
    console.log(`   Industry Standard: ${classification.industrySpecific.type}`);
    if (classification.industrySpecific.description) {
      console.log(`   Details: ${classification.industrySpecific.description}`);
    }
  }
  console.log(`   Required Controls:`);
  console.log(`     • Encryption: ${classification.requires.encryption ? 'YES' : 'No'}`);
  console.log(`     • Access Control: ${classification.requires.accessControl ? 'YES' : 'No'}`);
  console.log(`     • Audit Logging: ${classification.requires.auditLogging ? 'YES' : 'No'}`);
  console.log(`     • DLP Monitoring: ${classification.requires.dlp ? 'YES' : 'No'}`);
  console.log('');

  // STEP 3: Validate suggestions against TaxonomyExpert
  console.log('✅ Taxonomy Validator - Checking compliance...');
  const validation = TaxonomyValidator.validateAgentSuggestions(
    suggestions,
    country,
    domain || 'household'
  );

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 VALIDATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (validation.valid) {
    console.log('✅ All suggestions are valid and compliant.');
    console.log('');
  } else {
    console.log('❌ VALIDATION FAILED - Suggestions do not comply with taxonomy:');
    console.log('');
    for (const error of validation.errors) {
      console.log(`   ❌ ${error}`);
    }
    console.log('');
    console.log('───────────────────────────────────────────────────────────');
    console.log('💡 HOW TO FIX:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('');

    // Show valid options
    const validDocTypes = expert.getDocumentTypes(domain);
    const tagCategories = expert.getTagCategories(domain);
    const allValidTags = Object.values(tagCategories).flat();

    console.log('Valid Document Types for this domain:');
    for (const docType of validDocTypes.slice(0, 10)) {
      console.log(`   • ${docType}`);
    }
    if (validDocTypes.length > 10) {
      console.log(`   ... and ${validDocTypes.length - 10} more`);
    }
    console.log('');

    console.log('Valid Tags for this domain:');
    const tagCategoryNames = Object.keys(tagCategories);
    for (const category of tagCategoryNames.slice(0, 5)) {
      const tags = tagCategories[category];
      console.log(`   ${category}: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? ', ...' : ''}`);
    }
    console.log('');

    console.log('To proceed with upload, you have two options:');
    console.log('1. Retry with correct metadata: Use --type and --tags flags with valid values');
    console.log('2. Force upload anyway: Use --force flag (NOT RECOMMENDED - bypasses validation)');
    console.log('');

    // Log validation failure for audit
    await TaxonomyValidator.writeValidationLog(validation, {
      workflow: 'UploadWorkflow',
      agent: 'Records Keeper',
      country,
      domain: domain || 'household',
    });

    // Exit unless --force flag is set
    if (!options.force) {
      console.log('Upload aborted. Fix validation errors and try again.');
      console.log('');
      process.exit(1);
    } else {
      console.log('⚠️  WARNING: Forcing upload despite validation errors!');
      console.log('');
    }
  }

  // STEP 4: User confirmation
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⏸️  CONFIRMATION REQUIRED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('The following metadata will be applied:');
  console.log(`   • Document Type: ${suggestions.documentType || 'None'}`);
  console.log(`   • Tags: ${suggestions.tags.join(', ') || 'None'}`);
  console.log(`   • Sensitivity: ${classification.level.toUpperCase()}`);
  console.log(`   • Title: ${options.title || fileName}`);
  if (entityName) {
    console.log(`   • Entity: ${entityName}`);
    console.log(`   • Storage Path: ${entityStoragePath?.path || 'N/A'}`);
    console.log(`   • Correspondent: ${entityName}`);
  }
  console.log('');

  // In non-interactive mode (with --yes flag), skip confirmation
  if (!options.yes) {
    console.log('To proceed with upload, run again with --yes flag.');
    console.log('');
    console.log('Example:');
    console.log(`  bun run RecordManager.ts upload "${file}" --domain ${domain || 'household'} --yes`);
    console.log('');
    process.exit(0);
  }

  // STEP 5: Proceed with upload
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📤 UPLOADING DOCUMENT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Get or create tags
  const tagIds: number[] = [];
  for (const tagName of suggestions.tags) {
    const tag = await client.getOrCreateTag(tagName);
    tagIds.push(tag.id);
    console.log(`✓ Created/found tag: ${tag.name}`);
  }

  // Add sensitivity tags
  for (const tagName of classification.tags) {
    const tag = await client.getOrCreateTag(tagName);
    if (!tagIds.includes(tag.id)) {
      tagIds.push(tag.id);
      console.log(`✓ Created/found sensitivity tag: ${tag.name}`);
    }
  }

  // Add entity tag (if provided)
  if (entityTag && !tagIds.includes(entityTag.id)) {
    tagIds.push(entityTag.id);
    console.log(`✓ Added entity tag: ${entityTag.name}`);
  }

  // Get or create document type
  let documentTypeId: number | undefined;
  if (suggestions.documentType) {
    const docType = await client.getOrCreateDocumentType(suggestions.documentType);
    documentTypeId = docType.id;
    console.log(`✓ Created/found document type: ${docType.name}`);
  }

  // Upload document
  // Create a proper File object (not just Blob) for paperless-ngx
  const fileObj = new File([fileContent], fileName, { type: 'application/pdf' });
  const uploaded = await client.uploadDocument(fileObj, {
    title: options.title as string || fileName,
    tags: tagIds,
    document_type: documentTypeId,
    correspondent: correspondentId,
    storage_path: entityStoragePath?.id,
    created: new Date().toISOString(),
  });

  console.log('');
  console.log(`✅ Document uploaded successfully!`);
  console.log(`   Document ID: ${uploaded.id}`);
  console.log(`   Sensitivity: ${classification.level.toUpperCase()}`);
  console.log(`   Tags Applied: ${tagIds.length}`);
  console.log('');

  // Log workflow execution
  await TaxonomyValidator.writeWorkflowLog(
    'UploadWorkflow',
    ['Records Keeper', 'Sensitivity Scanner', 'Taxonomy Validator'],
    [validation],
    {
      country,
      domain: domain || 'household',
      documentId: uploaded.id,
    }
  );
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
 * Update document tags (add and/or remove)
 */
async function update(docId: string, options: CommandOptions): Promise<void> {
  const client = createClientFromEnv();
  const id = parseInt(docId, 10);

  console.log(`📝 Updating document ${id}...\n`);

  // Get current document
  const doc = await client.getDocument(id);
  const allTags = await client.getTags();

  console.log(`Current: ${doc.title}`);
  console.log(`Tags: ${doc.tags.length > 0 ? doc.tags.map(tid => allTags.find(t => t.id === tid)?.name || tid).join(', ') : '(None)'}\n`);

  let currentTagIds = [...doc.tags];

  // Handle tag removal
  if (options['remove-tags']) {
    const removeNames = (options['remove-tags'] as string).split(',').map(t => t.trim());
    const removeIds: number[] = [];

    for (const name of removeNames) {
      const tag = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (tag && currentTagIds.includes(tag.id)) {
        removeIds.push(tag.id);
        console.log(`🗑️  Removing: ${tag.name}`);
      } else if (!tag) {
        console.log(`⚠️  Tag not found: ${name}`);
      } else {
        console.log(`⚠️  Document doesn't have: ${name}`);
      }
    }

    currentTagIds = currentTagIds.filter(id => !removeIds.includes(id));
  }

  // Handle tag addition
  if (options['add-tags']) {
    const addNames = (options['add-tags'] as string).split(',').map(t => t.trim());

    for (const name of addNames) {
      const tag = await client.getOrCreateTag(name);
      if (!currentTagIds.includes(tag.id)) {
        currentTagIds.push(tag.id);
        console.log(`➕ Adding: ${tag.name}`);
      } else {
        console.log(`⚠️  Already has: ${tag.name}`);
      }
    }
  }

  // Update document
  await client.updateDocument(id, { tags: currentTagIds });

  console.log(`\n✅ Document updated!`);
  console.log(`New tags (${currentTagIds.length}): ${currentTagIds.map(tid => allTags.find(t => t.id === tid)?.name || tid).join(', ')}\n`);
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
 * T018-T020: Install default taxonomies for selected country
 */
async function install(options: CommandOptions): Promise<void> {
  // Get country from --country flag or environment variable
  const country = (options.country as string) ||
                  process.env.MADEINOZ_RECORDMANAGER_RECORDS_COUNTRY ||
                  'Australia';

  console.log(`\n📦 Installing Taxonomies for ${country}\n`);
  console.log(`${'─'.repeat(50)}\n`);

  try {
    const client = createClientFromEnv();
    const installer = new TaxonomyInstaller(client, country);

    const result = await installer.install();

    // T019: Output JSON or human-readable format
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    // Human-readable output
    console.log(`✅ Installation complete for ${result.country}\n`);
    console.log(`📊 Installation Summary:\n`);
    console.log(`   Entity Types: ${result.entityTypes.join(', ')}\n`);
    console.log(`   Installed Resources:`);
    console.log(`     - Tags: ${result.installed.tags}`);
    console.log(`     - Document Types: ${result.installed.documentTypes}`);
    console.log(`     - Storage Paths: ${result.installed.storagePaths}`);
    console.log(`     - Custom Fields: ${result.installed.customFields}`);

    if (result.skipped.tags.length > 0) {
      console.log(`\n   ⏭️  Skipped (already exist):`);
      console.log(`     - Tags: ${result.skipped.tags.length}`);
      if (result.skipped.documentTypes.length > 0) {
        console.log(`     - Document Types: ${result.skipped.documentTypes.length}`);
      }
      if (result.skipped.storagePaths.length > 0) {
        console.log(`     - Storage Paths: ${result.skipped.storagePaths.length}`);
      }
      if (result.skipped.customFields.length > 0) {
        console.log(`     - Custom Fields: ${result.skipped.customFields.length}`);
      }
    }

    console.log(`\n✨ Your paperless-ngx instance is now configured with ${country} taxonomies!`);
    console.log(``);

    // T020: Exit with success code
    process.exit(0);
  } catch (error) {
    // T020: Error handling and exit codes
    console.error(`\n❌ Installation failed: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && 'context' in error) {
      const context = (error as any).context;
      if (context) {
        console.error(`\n   Context:`);
        if (context.country) console.error(`     Country: ${context.country}`);
        if (context.entityType) console.error(`     Entity Type: ${context.entityType}`);
        if (context.step) console.error(`     Step: ${context.step}`);
      }
    }

    console.error(`\n   All changes have been rolled back.`);
    console.error(``);

    if (options.json) {
      console.log(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }, null, 2));
    }

    // T020: Exit with failure code
    process.exit(1);
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
 * T108: Interactive drill-down navigation through taxonomy hierarchy
 */
async function navigate(options: CommandOptions): Promise<void> {
  const domain = (options.domain as Domain) ||
                 (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) ||
                 'household';
  const expert = createExpertFromEnv();

  console.log(`\n🧭 Interactive Taxonomy Navigation`);
  console.log(`Domain: ${domain}\n`);
  console.log(`${'─'.repeat(50)}\n`);

  let currentPath: string[] = [];

  while (true) {
    // Display breadcrumb
    const breadcrumb = currentPath.length > 0
      ? `${domain} > ${currentPath.join(' > ')}`
      : domain;

    console.log(`\n📍 Current: ${breadcrumb}\n`);

    // Get options at current level
    const suggestions = expert.autocomplete(domain, currentPath.join('/'));

    if (suggestions.suggestions.length === 0) {
      console.log('🏁 End of path reached');
      break;
    }

    // Display numbered options
    console.log('Options:\n');
    for (let i = 0; i < suggestions.suggestions.length; i++) {
      const suggestion = suggestions.suggestions[i];
      const displayParts = suggestion.split('/');

      // Show only the next level
      const nextLevel = displayParts[currentPath.length] || displayParts[displayParts.length - 1];

      // Format with PascalCase to readable
      const readable = nextLevel
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, s => s.toUpperCase());

      console.log(`  ${i + 1}. ${readable}`);
    }

    if (currentPath.length > 0) {
      console.log(`  ${suggestions.suggestions.length + 1}. ⬅️  Back`);
    }
    console.log(`  0. 🚪 Exit\n`);

    // For now, just show structure and exit
    // In a real interactive CLI, you'd prompt for input here
    console.log('(Interactive navigation requires readline integration)');
    console.log('Use "path" command with specific path instead:\n');

    break;
  }
}

/**
 * T109: Parse and display taxonomy path information
 */
async function path(pathInput: string, options: CommandOptions): Promise<void> {
  const domain = (options.domain as Domain) ||
                 (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) ||
                 'household';
  const expert = createExpertFromEnv();

  console.log(`\n🔍 Taxonomy Path Analysis`);
  console.log(`${'─'.repeat(50)}\n`);

  // Validate and parse path
  const validation = expert.validatePath(domain, pathInput);
  const parsed = expert.parsePath(domain, pathInput);

  // Show breadcrumb
  console.log('📍 Path Breadcrumb:\n');
  const breadcrumbParts = [domain];
  if (parsed.function) breadcrumbParts.push(parsed.function);
  if (parsed.service) breadcrumbParts.push(parsed.service);
  if (parsed.activity) breadcrumbParts.push(parsed.activity);

  const breadcrumb = breadcrumbParts.join(' > ');
  console.log(`  ${breadcrumb}\n`);

  if (validation.valid) {
    console.log('✅ Path is valid\n');

    // Show resolved components
    if (validation.resolved) {
      const resolved = validation.resolved;

      if (resolved.function) {
        console.log('📁 Function:');
        const func = expert.getFunctions(domain).find(f => f.name === resolved.function);
        if (func) {
          console.log(`   Name: ${func.name}`);
          console.log(`   Description: ${func.description}\n`);
        }
      }

      if (resolved.service) {
        console.log('📂 Service:');
        const services = expert.getServices(domain, resolved.function!);
        const svc = services.find(s => s.name === resolved.service);
        if (svc) {
          console.log(`   Name: ${svc.name}`);
          console.log(`   Description: ${svc.description}\n`);
        }
      }

      if (resolved.activity) {
        console.log('📄 Activity:');
        const activities = expert.getActivities(domain, resolved.function!, resolved.service!);
        const act = activities.find(a => a.name === resolved.activity);
        if (act) {
          console.log(`   Name: ${act.name}`);
          console.log(`   Description: ${act.description}\n`);
        }
      }

      if (resolved.documentTypes && resolved.documentTypes.length > 0) {
        console.log('📋 Document Types:');
        for (const docType of resolved.documentTypes) {
          console.log(`   • ${docType}`);
        }
        console.log();
      }

      if (resolved.retention) {
        console.log('⏰ Retention Requirements:');
        if (resolved.retention.AU) {
          console.log(`   Australia: ${resolved.retention.AU.years === 0 ? 'Permanent' : resolved.retention.AU.years + ' years'}`);
          console.log(`   Authority: ${resolved.retention.AU.authority}`);
        }
        console.log();
      }
    }

    // Show storage path
    if (parsed.function && parsed.service && parsed.activity) {
      const storagePath = expert.generateStoragePath(
        domain,
        parsed.function,
        parsed.service,
        parsed.activity
      );
      console.log('💾 Storage Path:\n');
      console.log(`  ${storagePath}\n`);
    }

    // Show hierarchical tags
    if (parsed.function && parsed.service && parsed.activity) {
      const tags = expert.generateHierarchicalTags(
        domain,
        parsed.function,
        parsed.service,
        parsed.activity
      );
      console.log('🏷️  Hierarchical Tags:\n');
      for (const tag of tags) {
        console.log(`  • ${tag}`);
      }
      console.log();
    }

  } else {
    console.log('❌ Path is invalid\n');
    if (validation.error) {
      console.log(`Error: ${validation.error}\n`);
    }

    // Show autocomplete suggestions
    const autocomplete = expert.autocomplete(domain, pathInput);
    if (autocomplete.suggestions.length > 0) {
      console.log('💡 Did you mean:\n');
      for (const suggestion of autocomplete.suggestions.slice(0, 5)) {
        console.log(`  • ${suggestion}`);
      }
      console.log();
    }
  }
}

/**
 * T111: Search taxonomy by keyword
 */
async function searchTaxonomy(keyword: string, options: CommandOptions): Promise<void> {
  const domain = (options.domain as Domain) ||
                 (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) ||
                 'household';
  const expert = createExpertFromEnv();

  console.log(`\n🔍 Taxonomy Keyword Search`);
  console.log(`Domain: ${domain} | Keyword: "${keyword}"\n`);
  console.log(`${'─'.repeat(50)}\n`);

  const results = expert.searchByKeyword(domain, keyword);

  if (results.length === 0) {
    console.log('No results found.\n');
    return;
  }

  console.log(`Found ${results.length} results:\n`);

  for (const result of results) {
    const matchIcon = result.matchType === 'name' ? '🎯' : result.matchType === 'keyword' ? '🔑' : '📄';
    const relevance = '█'.repeat(Math.ceil(result.relevance / 20));

    console.log(`${matchIcon} ${result.function} > ${result.service} > ${result.activity}`);
    console.log(`   Match: ${result.matchType} | Relevance: ${result.relevance}% ${relevance}`);

    // Get activity details
    const activities = expert.getActivities(domain, result.function, result.service);
    const activity = activities.find(a => a.name === result.activity);
    if (activity) {
      console.log(`   Description: ${activity.description}`);
    }

    console.log();
  }
}

/**
 * Check for taxonomy updates
 */
async function checkUpdates(options: CommandOptions): Promise<void> {
  const country = (options.country as string) || process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';
  const client = createClientFromEnv();

  console.log(`🔍 Checking for taxonomy updates for ${country}...\n`);

  const installer = new TaxonomyInstaller(client, country);
  const diff = await installer.detectChanges();

  if (!diff.hasChanges) {
    console.log(`✅ No updates available - taxonomies are up to date\n`);
    return;
  }

  console.log(`📊 Changes detected:\n`);

  if (diff.newTags.length > 0) {
    console.log(`📌 New Tags (${diff.newTags.length}):`);
    for (const tag of diff.newTags) {
      console.log(`   • ${tag.name} (${tag.entityType})`);
    }
    console.log('');
  }

  if (diff.newDocumentTypes.length > 0) {
    console.log(`📄 New Document Types (${diff.newDocumentTypes.length}):`);
    for (const docType of diff.newDocumentTypes) {
      console.log(`   • ${docType.name} (${docType.entityType})`);
    }
    console.log('');
  }

  if (diff.newStoragePaths.length > 0) {
    console.log(`📁 New Storage Paths (${diff.newStoragePaths.length}):`);
    for (const path of diff.newStoragePaths) {
      console.log(`   • ${path.path} (${path.entityType})`);
    }
    console.log('');
  }

  if (diff.newCustomFields.length > 0) {
    console.log(`🔧 New Custom Fields (${diff.newCustomFields.length}):`);
    for (const field of diff.newCustomFields) {
      console.log(`   • ${field.name} (${field.entityType})`);
    }
    console.log('');
  }

  if (diff.retentionChanges.length > 0) {
    console.log(`⚠️  Retention Rule Changes (${diff.retentionChanges.length}) - REQUIRES MANUAL REVIEW:`);
    for (const change of diff.retentionChanges) {
      console.log(`   • ${change.documentType} (${change.entityType})`);
      console.log(`     Old: ${change.oldYears} years - ${change.oldReason}`);
      console.log(`     New: ${change.newYears} years - ${change.newReason}`);
    }
    console.log('');
    console.log(`⚠️  Run with --approve-retention-changes to apply these updates\n`);
  } else {
    console.log(`💡 Run 'sync-taxonomies' to apply these updates\n`);
  }
}

/**
 * Sync taxonomies (apply updates)
 */
async function syncTaxonomies(options: CommandOptions): Promise<void> {
  const country = (options.country as string) || process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';
  const client = createClientFromEnv();
  const autoApprove = options['approve-retention-changes'] === true;

  console.log(`🔄 Synchronizing taxonomies for ${country}...\n`);

  const installer = new TaxonomyInstaller(client, country);
  const result = await installer.update({
    autoApprove,
  });

  if (result.requiresManualReview) {
    console.log(`⚠️  Manual review required for retention changes:\n`);
    for (const change of result.diff.retentionChanges) {
      console.log(`   • ${change.documentType} (${change.entityType})`);
      console.log(`     Old: ${change.oldYears} years - ${change.oldReason}`);
      console.log(`     New: ${change.newYears} years - ${change.newReason}`);
    }
    console.log('');
    console.log(`⚠️  Rerun with --approve-retention-changes to apply\n`);
    return;
  }

  if (!result.diff.hasChanges) {
    console.log(`✅ No changes to apply - taxonomies are up to date\n`);
    return;
  }

  console.log(`✅ Taxonomy synchronization complete!\n`);
  console.log(`📊 Applied changes:`);
  console.log(`   • Tags created: ${result.applied.tags}`);
  console.log(`   • Document types created: ${result.applied.documentTypes}`);
  console.log(`   • Storage paths created: ${result.applied.storagePaths}`);
  console.log(`   • Custom fields created: ${result.applied.customFields}`);
  if (result.applied.retentionChanges > 0) {
    console.log(`   • Retention rules updated: ${result.applied.retentionChanges}`);
  }
  console.log('');
}

/**
 * Show taxonomy diff between versions
 */
async function diffTaxonomies(options: CommandOptions): Promise<void> {
  const metadata = TaxonomyExpert.getMetadata();

  if (!metadata) {
    console.log(`❌ No taxonomy metadata available\n`);
    return;
  }

  console.log(`📋 Taxonomy Version History\n`);
  console.log(`Current Version: ${metadata.version}`);
  console.log(`Last Updated: ${metadata.lastUpdated}\n`);

  if (metadata.changelog && metadata.changelog.length > 0) {
    console.log(`📜 Changelog:\n`);
    for (const entry of metadata.changelog) {
      console.log(`Version ${entry.version} (${entry.date})`);
      for (const change of entry.changes) {
        console.log(`   • ${change}`);
      }
      console.log('');
    }
  } else {
    console.log(`No changelog available\n`);
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

      case 'update':
        if (!args[1]) {
          console.error('❌ Error: update command requires a document ID');
          console.error('   Example: update 105 --add-tags "tag1,tag2" --remove-tags "tag3,tag4"');
          process.exit(1);
        }
        await update(args[1], options);
        break;

      case 'info':
        await info(args[1]);
        break;

      case 'retention':
        await retention(options);
        break;

      case 'install':
        await install(options);
        break;

      case 'status':
        await status();
        break;

      case 'check-updates':
        await checkUpdates(options);
        break;

      case 'sync-taxonomies':
        await syncTaxonomies(options);
        break;

      case 'diff-taxonomies':
        await diffTaxonomies(options);
        break;

      case 'navigate':
        await navigate(options);
        break;

      case 'path':
        if (!args[1]) {
          console.error('❌ Error: path command requires a path argument');
          console.error('   Example: path FinancialManagement/BankingServices/BankStatements');
          process.exit(1);
        }
        await path(args[1], options);
        break;

      case 'search-taxonomy':
        if (!args[1]) {
          console.error('❌ Error: search-taxonomy command requires a keyword argument');
          console.error('   Example: search-taxonomy "tax"');
          process.exit(1);
        }
        await searchTaxonomy(args[1], options);
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
  upload <file>              Upload document with intelligent tagging and validation
    --title <title>          Custom document title
    --domain <domain>        household | corporate | projects
    --entity <name>          Entity name (sets storage path and correspondent)
    --yes                    Confirm upload without interactive prompt
    --force                  Force upload despite validation errors (NOT RECOMMENDED)

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

  update <docId>             Update document tags (add/remove)
    --add-tags <tags>        Comma-separated tags to add
    --remove-tags <tags>     Comma-separated tags to remove

  info <docId>               Get document information and retention status

  retention                  Show retention requirements for document types
    --domain <domain>        Domain to show

  navigate                   Interactive drill-down navigation through taxonomy hierarchy
    --domain <domain>        Domain to navigate (default: household)

  path <path>                Parse and display taxonomy path information
    --domain <domain>        Domain for path (default: household)
    Example: path FinancialManagement/BankingServices/BankStatements

  search-taxonomy <keyword>  Search taxonomy by keyword across all levels
    --domain <domain>        Domain to search (default: household)
    Example: search-taxonomy "tax"

  install                    Install default taxonomies for country
    --country <country>      Country (default: Australia)
    --json                   Output JSON format for scripting

  check-updates              Check for taxonomy updates from YAML definitions
    --country <country>      Country to check (default: Australia)

  sync-taxonomies            Synchronize taxonomies (apply updates)
    --country <country>      Country to sync (default: Australia)
    --approve-retention-changes  Approve retention rule changes (required if detected)

  diff-taxonomies            Show taxonomy version history and changelog

  status                     Test connection and show system status
                             Verifies env vars, API connectivity, auth, and taxonomy

  delete <query>             ⚠️  REQUIRES EXPLICIT APPROVAL
                             Must use DeleteConfirmation workflow

Examples:
  # Install taxonomies
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts install --country Australia

  # Upload workflow (two-step: analyze first, then confirm)
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts upload invoice.pdf --domain corporate
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts upload invoice.pdf --domain corporate --yes

  # Search and organize
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts search --tags "tax,2024"
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts organize --domain household --apply

  # Document info and retention
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts info 12345
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts retention --domain corporate

  # Taxonomy management
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts check-updates --country Australia
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts sync-taxonomies --approve-retention-changes
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts diff-taxonomies

  # Taxonomy navigation
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts navigate --domain household
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts path FinancialManagement/BankingServices/BankStatements
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts search-taxonomy "tax"

  # System status
  bun run $PAI_DIR/skills/RecordsManager/Tools/RecordManager.ts status

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
