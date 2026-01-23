#!/usr/bin/env bun
/**
 * TaxonomyBrowser.ts
 *
 * Interactive taxonomy browser for manual document classification.
 * Helps users navigate the hierarchical taxonomy and select appropriate paths.
 *
 * Usage:
 *   bun run TaxonomyBrowser.ts --domain household
 *   bun run TaxonomyBrowser.ts --domain household --search "vehicle"
 *   bun run TaxonomyBrowser.ts --domain household --function FinancialManagement
 */

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
}

const COUNTRY = process.env.MADEINOZ_RECORDMANAGER_COUNTRY || 'Australia';
const DEFAULT_DOMAIN = (process.env.MADEINOZ_RECORDMANAGER_DEFAULT_DOMAIN as Domain) || 'household';

interface BrowseOptions {
  domain: Domain;
  search?: string;
  function?: string;
  service?: string;
  showRetention?: boolean;
}

/**
 * Display all functions in a domain
 */
function displayFunctions(expert: TaxonomyExpert, domain: Domain): void {
  console.log(`\n📚 ${domain.toUpperCase()} TAXONOMY - FUNCTIONS\n`);
  console.log('='.repeat(80));

  const functions = expert.getFunctions(domain);

  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    const services = expert.getServices(domain, func.name);
    console.log(`${i + 1}. ${func.name} (${services.length} services)`);
    if (func.description) {
      console.log(`   ${func.description}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${functions.length} functions\n`);
}

/**
 * Display services under a function
 */
function displayServices(expert: TaxonomyExpert, domain: Domain, functionName: string): void {
  const services = expert.getServices(domain, functionName);

  if (services.length === 0) {
    console.error(`\n❌ Function "${functionName}" not found in ${domain} taxonomy\n`);
    return;
  }

  console.log(`\n📂 ${functionName} - SERVICES\n`);
  console.log('='.repeat(80));

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const activities = expert.getActivities(domain, functionName, service.name);
    console.log(`${i + 1}. ${service.name} (${activities.length} activities)`);
    if (service.description) {
      console.log(`   ${service.description}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${services.length} services\n`);
}

/**
 * Display activities under a service
 */
function displayActivities(
  expert: TaxonomyExpert,
  domain: Domain,
  functionName: string,
  serviceName: string,
  showRetention: boolean = false
): void {
  const activities = expert.getActivities(domain, functionName, serviceName);

  if (activities.length === 0) {
    console.error(`\n❌ Service "${serviceName}" not found under ${functionName}\n`);
    return;
  }

  console.log(`\n📋 ${functionName} > ${serviceName} - ACTIVITIES\n`);
  console.log('='.repeat(80));

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    const docTypes = expert.getDocumentTypesForActivity(domain, functionName, serviceName, activity.name);

    console.log(`\n${i + 1}. ${activity.name}`);
    if (activity.description) {
      console.log(`   Description: ${activity.description}`);
    }
    console.log(`   Document Types: ${docTypes.length}`);

    if (docTypes.length > 0) {
      console.log(`   Types: ${docTypes.join(', ')}`);
    }

    if (showRetention) {
      const retention = expert.getRetentionForActivity(domain, functionName, serviceName, activity.name);
      const countryCode = COUNTRY === 'Australia' ? 'AUS' : COUNTRY === 'United States' ? 'USA' : 'GBR';

      if (retention && retention[countryCode]) {
        const rule = retention[countryCode];
        console.log(`   Retention: ${rule.years} years (${rule.authority})`);
      }
    }

    // Generate full path
    const tags = expert.generateHierarchicalTags(domain, functionName, serviceName, activity.name);
    console.log(`   Tags: ${tags.join(', ')}`);

    const storagePath = expert.generateStoragePath(domain, functionName, serviceName, activity.name);
    console.log(`   Storage: ${storagePath}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${activities.length} activities\n`);
}

/**
 * Search across the taxonomy
 */
function searchTaxonomy(expert: TaxonomyExpert, domain: Domain, query: string): void {
  console.log(`\n🔍 SEARCHING: "${query}" in ${domain} taxonomy\n`);
  console.log('='.repeat(80));

  const results = expert.searchByKeyword(domain, query);

  if (results.length === 0) {
    console.log('\n❌ No matches found\n');
    return;
  }

  // Group by relevance
  const highRelevance = results.filter(r => r.relevance >= 10);
  const mediumRelevance = results.filter(r => r.relevance >= 5 && r.relevance < 10);
  const lowRelevance = results.filter(r => r.relevance < 5);

  if (highRelevance.length > 0) {
    console.log('\n✅ HIGH RELEVANCE (Score ≥ 10):\n');
    for (const result of highRelevance) {
      console.log(`   ${result.function} > ${result.service} > ${result.activity || '(service level)'}`);
      console.log(`   Score: ${result.relevance} | Match: ${result.matchType}`);
      console.log('');
    }
  }

  if (mediumRelevance.length > 0) {
    console.log('\n⚠️  MEDIUM RELEVANCE (Score 5-9):\n');
    for (const result of mediumRelevance) {
      console.log(`   ${result.function} > ${result.service} > ${result.activity || '(service level)'}`);
      console.log(`   Score: ${result.relevance} | Match: ${result.matchType}`);
      console.log('');
    }
  }

  if (lowRelevance.length > 0 && lowRelevance.length <= 5) {
    console.log('\nℹ️  LOW RELEVANCE (Score < 5):\n');
    for (const result of lowRelevance) {
      console.log(`   ${result.function} > ${result.service} > ${result.activity || '(service level)'}`);
      console.log(`   Score: ${result.relevance} | Match: ${result.matchType}`);
      console.log('');
    }
  }

  console.log('='.repeat(80));
  console.log(`Total matches: ${results.length}\n`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let domain: Domain = DEFAULT_DOMAIN;
  let search: string | undefined;
  let functionName: string | undefined;
  let serviceName: string | undefined;
  let showRetention = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--domain' && args[i + 1]) {
      domain = args[i + 1] as Domain;
      i++;
    } else if (arg === '--search' && args[i + 1]) {
      search = args[i + 1];
      i++;
    } else if (arg === '--function' && args[i + 1]) {
      functionName = args[i + 1];
      i++;
    } else if (arg === '--service' && args[i + 1]) {
      serviceName = args[i + 1];
      i++;
    } else if (arg === '--retention') {
      showRetention = true;
    } else if (arg === '--help') {
      console.log(`
Taxonomy Browser - Navigate hierarchical taxonomy for manual document classification

Usage:
  bun run TaxonomyBrowser.ts [options]

Options:
  --domain <name>       Domain to browse (household, corporate, etc.)
  --search <query>      Search for keyword across taxonomy
  --function <name>     Show services under a function
  --service <name>      Show activities under a service (requires --function)
  --retention           Show retention periods
  --help                Show this help

Examples:
  # List all functions
  bun run TaxonomyBrowser.ts --domain household

  # Search for "vehicle"
  bun run TaxonomyBrowser.ts --domain household --search "vehicle"

  # Browse specific function
  bun run TaxonomyBrowser.ts --domain household --function FinancialManagement

  # Browse specific service
  bun run TaxonomyBrowser.ts --domain household --function FinancialManagement --service BankingServices

  # Show retention periods
  bun run TaxonomyBrowser.ts --domain household --function FinancialManagement --retention
      `);
      process.exit(0);
    }
  }

  const expert = new TaxonomyExpert(COUNTRY, domain, 'hierarchical');

  // Execute based on options
  if (search) {
    searchTaxonomy(expert, domain, search);
  } else if (functionName && serviceName) {
    displayActivities(expert, domain, functionName, serviceName, showRetention);
  } else if (functionName) {
    displayServices(expert, domain, functionName);
  } else {
    displayFunctions(expert, domain);
  }
}

main();
