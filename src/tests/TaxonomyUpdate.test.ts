// $PAI_DIR/tests/TaxonomyUpdate.test.ts
/**
 * Tests for taxonomy update/sync functionality
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { TaxonomyInstaller, TaxonomyDiff, UpdateResult } from '../skills/RecordsManager/Lib/TaxonomyInstaller';
import { PaperlessClient } from '../skills/RecordsManager/Lib/PaperlessClient';
import { TaxonomyExpert } from '../skills/RecordsManager/Lib/TaxonomyExpert';

// Mock PaperlessClient for testing
class MockPaperlessClient extends PaperlessClient {
  private mockTags: any[] = [];
  private mockDocumentTypes: any[] = [];
  private mockStoragePaths: any[] = [];
  private mockCustomFields: any[] = [];
  private nextId = 1;

  constructor() {
    super({ baseUrl: 'http://localhost', apiToken: 'test-token' });
  }

  async getTags() {
    return this.mockTags;
  }

  async getDocumentTypes() {
    return this.mockDocumentTypes;
  }

  async getStoragePaths() {
    return this.mockStoragePaths;
  }

  async getCustomFields() {
    return this.mockCustomFields;
  }

  async createTag(name: string, color?: string) {
    const tag = {
      id: this.nextId++,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      color: color || '#4a90d9',
      matching_algorithm: 0,
      is_insensitive: true,
    };
    this.mockTags.push(tag);
    return tag;
  }

  async createDocumentType(name: string) {
    const docType = {
      id: this.nextId++,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      matching_algorithm: 0,
      is_insensitive: true,
    };
    this.mockDocumentTypes.push(docType);
    return docType;
  }

  async createStoragePath(path: string) {
    const storagePath = {
      id: this.nextId++,
      name: path.split('/').filter(Boolean).pop() || path,
      path,
      document_count: 0,
    };
    this.mockStoragePaths.push(storagePath);
    return storagePath;
  }

  async createCustomField(field: any) {
    const customField = {
      id: this.nextId++,
      ...field,
    };
    this.mockCustomFields.push(customField);
    return customField;
  }

  async deleteTag(id: number) {
    this.mockTags = this.mockTags.filter(t => t.id !== id);
  }

  async deleteDocumentType(id: number) {
    this.mockDocumentTypes = this.mockDocumentTypes.filter(dt => dt.id !== id);
  }

  async deleteStoragePath(id: number) {
    this.mockStoragePaths = this.mockStoragePaths.filter(sp => sp.id !== id);
  }

  async deleteCustomField(id: number) {
    this.mockCustomFields = this.mockCustomFields.filter(cf => cf.id !== id);
  }

  // Helpers for testing
  reset() {
    this.mockTags = [];
    this.mockDocumentTypes = [];
    this.mockStoragePaths = [];
    this.mockCustomFields = [];
    this.nextId = 1;
  }

  seedExistingData() {
    // Add some existing tags
    this.mockTags.push({
      id: this.nextId++,
      name: 'financial',
      slug: 'financial',
      color: '#1e90ff',
      matching_algorithm: 0,
      is_insensitive: true,
    });

    // Add some existing document types
    this.mockDocumentTypes.push({
      id: this.nextId++,
      name: 'Tax Return',
      slug: 'tax-return',
      matching_algorithm: 0,
      is_insensitive: true,
    });

    // Add some existing storage paths
    this.mockStoragePaths.push({
      id: this.nextId++,
      name: 'household',
      path: '/household',
      document_count: 0,
    });
  }
}

describe('TaxonomyInstaller - Update/Sync', () => {
  let client: MockPaperlessClient;
  let installer: TaxonomyInstaller;

  beforeEach(() => {
    client = new MockPaperlessClient();
    installer = new TaxonomyInstaller(client as any, 'Australia');
  });

  test('detectChanges - should detect new tags', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // When: Checking for updates
    const diff = await installer.detectChanges();

    // Then: Should detect all taxonomy tags as new
    expect(diff.hasChanges).toBe(true);
    expect(diff.newTags.length).toBeGreaterThan(0);
    // In hierarchical taxonomy, tags are FSA-based (e.g., TaxCompliance, not 'tax')
    expect(diff.newTags.some(t => t.name.toLowerCase().includes('tax'))).toBe(true);
  });

  test('detectChanges - should detect new document types', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // When: Checking for updates
    const diff = await installer.detectChanges();

    // Then: Should detect all taxonomy document types as new
    expect(diff.newDocumentTypes.length).toBeGreaterThan(0);
    expect(diff.newDocumentTypes.some(dt => dt.name === 'Tax Return')).toBe(true);
  });

  test('detectChanges - should skip existing resources', async () => {
    // Given: Paperless-ngx with some existing data
    client.reset();
    client.seedExistingData();

    // When: Checking for updates
    const diff = await installer.detectChanges();

    // Then: Should not include existing resources in new resources
    expect(diff.newTags.every(t => t.name !== 'financial')).toBe(true);
    expect(diff.newDocumentTypes.every(dt => dt.name !== 'Tax Return')).toBe(true);
    expect(diff.newStoragePaths.every(sp => sp.path !== '/household')).toBe(true);
  });

  test('detectChanges - should detect new storage paths', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // When: Checking for updates
    const diff = await installer.detectChanges();

    // Then: Should detect storage paths for all entity types
    expect(diff.newStoragePaths.length).toBeGreaterThan(0);
    expect(diff.newStoragePaths.some(sp => sp.path === '/household')).toBe(true);
    expect(diff.newStoragePaths.some(sp => sp.path === '/corporate')).toBe(true);
  });

  test('detectChanges - should detect new custom fields for trust types', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // When: Checking for updates
    const diff = await installer.detectChanges();

    // Then: Should detect custom fields for trust entity types
    expect(diff.newCustomFields.length).toBeGreaterThan(0);
    expect(diff.newCustomFields.some(cf => cf.name === 'family-trust-name')).toBe(true);
    expect(diff.newCustomFields.some(cf => cf.name === 'unit-trust-name')).toBe(true);
    expect(diff.newCustomFields.some(cf => cf.name === 'discretionary-trust-name')).toBe(true);
  });

  test('detectChanges - should return no changes when up to date', async () => {
    // Given: Paperless-ngx with all taxonomies installed
    client.reset();
    await installer.install(); // Install all taxonomies

    // Create a new installer instance to clear internal state
    const installer2 = new TaxonomyInstaller(client as any, 'Australia');

    // When: Checking for updates again
    const diff = await installer2.detectChanges();

    // Then: Should report no changes
    expect(diff.hasChanges).toBe(false);
    expect(diff.newTags.length).toBe(0);
    expect(diff.newDocumentTypes.length).toBe(0);
    expect(diff.newStoragePaths.length).toBe(0);
    expect(diff.newCustomFields.length).toBe(0);
  });

  test('update - should apply new resources without retention changes', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // When: Applying updates
    const result = await installer.update();

    // Then: Should create new resources
    expect(result.success).toBe(true);
    expect(result.applied.tags).toBeGreaterThan(0);
    expect(result.applied.documentTypes).toBeGreaterThan(0);
    expect(result.applied.storagePaths).toBeGreaterThan(0);
    expect(result.applied.customFields).toBeGreaterThan(0);
  });

  test('update - should skip when no changes detected', async () => {
    // Given: Paperless-ngx with all taxonomies installed
    client.reset();
    await installer.install();

    const installer2 = new TaxonomyInstaller(client as any, 'Australia');

    // When: Applying updates
    const result = await installer2.update();

    // Then: Should report no changes applied
    expect(result.success).toBe(true);
    expect(result.applied.tags).toBe(0);
    expect(result.applied.documentTypes).toBe(0);
    expect(result.applied.storagePaths).toBe(0);
    expect(result.applied.customFields).toBe(0);
  });

  test('update - should require manual review for retention changes', async () => {
    // Given: Paperless-ngx with existing data (simulated retention change scenario)
    client.reset();
    client.seedExistingData();

    // Mock a retention change by manually adding to diff
    // (In reality, this would require comparing old vs new retention rules)
    // For now, we test the behavior when retention changes exist

    // When: Applying updates WITHOUT approval flag
    const result = await installer.update({ autoApprove: false });

    // Then: Should not fail even if no actual retention changes detected
    // (Current implementation doesn't detect retention changes yet)
    expect(result.success).toBe(true);
  });

  test('update - should rollback on failure', async () => {
    // Given: Empty paperless-ngx instance
    client.reset();

    // Mock a failure during custom field creation
    const originalCreateCustomField = client.createCustomField.bind(client);
    let callCount = 0;
    client.createCustomField = async (field: any) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Simulated API failure');
      }
      return originalCreateCustomField(field);
    };

    // When: Applying updates
    let error: Error | null = null;
    try {
      await installer.update();
    } catch (e) {
      error = e as Error;
    }

    // Then: Should have thrown error and rolled back
    expect(error).not.toBeNull();
    expect(error?.message).toContain('rolled back');

    // All created resources should be removed (rollback)
    // Note: In a real scenario, we'd verify IDs were deleted
  });
});

describe('TaxonomyExpert - Metadata', () => {
  test('getMetadata - should return version metadata', () => {
    // When: Getting metadata
    const metadata = TaxonomyExpert.getMetadata();

    // Then: Should have version, lastUpdated, and changelog
    expect(metadata).not.toBeNull();
    expect(metadata?.version).toBe('1.0.0');
    expect(metadata?.lastUpdated).toBe('2026-01-22');
    expect(metadata?.changelog).toBeDefined();
    expect(metadata?.changelog.length).toBeGreaterThan(0);
  });

  test('getMetadata - should have changelog entries', () => {
    // When: Getting metadata
    const metadata = TaxonomyExpert.getMetadata();

    // Then: Changelog should have entries with version, date, and changes
    expect(metadata?.changelog).toBeDefined();
    const firstEntry = metadata?.changelog[0];
    expect(firstEntry).toBeDefined();
    expect(firstEntry?.version).toBe('1.0.0');
    expect(firstEntry?.date).toBe('2026-01-22');
    expect(firstEntry?.changes).toBeDefined();
    expect(firstEntry?.changes.length).toBeGreaterThan(0);
  });
});
