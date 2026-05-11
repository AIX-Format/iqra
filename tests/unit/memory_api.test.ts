import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IQRAMemory } from '#memory/memory.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

// Mock getBridge to avoid the memory leak / infinite loop if present
vi.mock('#memory/memory_bridge', () => ({
  MemoryBridge: {
    write: vi.fn().mockResolvedValue(true),
    read: vi.fn().mockResolvedValue({ hit: false, value: null })
  }
}));

const TEST_MEMORY_PATH = path.join(process.cwd(), '.iqra', 'memory.json');

describe('IQRAMemory Public API', () => {
  // Clean up any test artifacts
  beforeEach(async () => {
    // Reset local data
    if (fs.existsSync(TEST_MEMORY_PATH)) {
      await fsPromises.unlink(TEST_MEMORY_PATH);
    }

    // Disable external connections
    (IQRAMemory as any)._redis = null;
    (IQRAMemory as any).getRedis = vi.fn().mockResolvedValue(null);
  });

  afterEach(async () => {
    if (fs.existsSync(TEST_MEMORY_PATH)) {
      await fsPromises.unlink(TEST_MEMORY_PATH);
    }
  });

  it('should correctly set and get a simple value using local fallback', async () => {
    const testKey = 'test_key';
    const testValue = { hello: 'world', time: Date.now() };

    // Set the value
    const result = await IQRAMemory.set(testKey, testValue);
    expect(result).toBe('OK');

    // Get the value
    const retrieved = await IQRAMemory.get<typeof testValue>(testKey);
    expect(retrieved).not.toBeNull();
    expect(retrieved).toEqual(testValue);
  });

  it('should return null for non-existent key', async () => {
    const retrieved = await IQRAMemory.get('non_existent_key_12345');
    expect(retrieved).toBeNull();
  });
});
