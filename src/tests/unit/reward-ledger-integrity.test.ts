/**
 * Unit Tests: RewardLedger — Hash Chain Integrity
 * Tests the validateChain method and the hash chain added to record().
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RewardLedger } from '#rewards/ledger';
import type { RewardEntry } from '#rewards/types';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeTempLedgerDir(): string {
  const dir = path.join(process.cwd(), '.iqra', 'data', `test_dir_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function makeEntry(overrides: Partial<RewardEntry> = {}): Omit<RewardEntry, 'ledger_id' | 'recorded_at' | 'hash' | 'prev_hash'> {
  return {
    mission_id: 'mission_test_001',
    worker_id: 'TestWorker',
    timestamp: Date.now(),
    base_reward: 0.8,
    total_reward: 0.8,
    reward_vector: { novelty: 0.3, resonance: 0.3, topology: 0.2, penalty: 0.0 },
    discovery_level: 'branch',
    confidence: 0.9,
    validation_status: 'verified',
    notes: 'test entry',
    pristine_multiplier_applied: false,
    multiplier_value: 1.0,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RewardLedger — validateChain', () => {
  let tempDir: string;
  let ledgerFile: string;

  beforeEach(() => {
    tempDir = makeTempLedgerDir();
    RewardLedger.setStorageDir(tempDir);
    ledgerFile = path.join(tempDir, 'reward_ledger.jsonl');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // ── Empty Ledger ───────────────────────────────────────────────────────────

  describe('empty ledger', () => {
    it('should report valid with zero entries when no files exist', async () => {
      const result = await RewardLedger.validateChain();
      expect(result.valid).toBe(true);
      expect(result.total_entries).toBe(0);
    });

    it('should report valid with empty file', async () => {
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(ledgerFile, '', 'utf-8');

      const result = await RewardLedger.validateChain();
      expect(result.valid).toBe(true);
      expect(result.total_entries).toBe(0);
    });
  });

  // ── Single Entry ──────────────────────────────────────────────────────────

  describe('single entry', () => {
    it('should report valid for a single recorded entry', async () => {
      await RewardLedger.record(makeEntry());

      const result = await RewardLedger.validateChain();
      expect(result.valid, result.message).toBe(true);
      expect(result.total_entries).toBe(1);
      expect(result.message).toContain('integrity verified');
    });

    it('should store undefined/omitted as prev_hash for the first entry', async () => {
      await RewardLedger.record(makeEntry());

      const entries = await RewardLedger.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].prev_hash).toBeUndefined();
    });

    it('should store a non-empty hash for the first entry', async () => {
      await RewardLedger.record(makeEntry());

      const entries = await RewardLedger.getAll();
      expect(typeof entries[0].hash).toBe('string');
      expect(entries[0].hash).toHaveLength(64); // SHA-256 hex
    });
  });

  // ── Hash Chain Integrity (Multiple Entries) ───────────────────────────────

  describe('hash chain with multiple entries', () => {
    it('should report valid for two chained entries', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'mission_001' }));
      await RewardLedger.record(makeEntry({ mission_id: 'mission_002' }));

      const result = await RewardLedger.validateChain();
      expect(result.valid, result.message).toBe(true);
      expect(result.total_entries).toBe(2);
    });

    it('should chain prev_hash → hash correctly across entries', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'm1' }));
      await RewardLedger.record(makeEntry({ mission_id: 'm2' }));
      await RewardLedger.record(makeEntry({ mission_id: 'm3' }));

      const entries = await RewardLedger.getAll();
      expect(entries).toHaveLength(3);

      // First entry: prev_hash = undefined
      expect(entries[0].prev_hash).toBeUndefined();

      // Second entry: prev_hash = first entry's hash
      expect(entries[1].prev_hash).toBe(entries[0].hash);

      // Third entry: prev_hash = second entry's hash
      expect(entries[2].prev_hash).toBe(entries[1].hash);
    });

    it('should report valid for five chained entries', async () => {
      for (let i = 1; i <= 5; i++) {
        await RewardLedger.record(makeEntry({ mission_id: `mission_bulk_${i}`, total_reward: i * 0.1 }));
      }

      const result = await RewardLedger.validateChain();
      expect(result.valid, result.message).toBe(true);
      expect(result.total_entries).toBe(5);
    });
  });

  // ── Tampered Ledger Detection ─────────────────────────────────────────────

  describe('tampered ledger detection', () => {
    it('should detect chain breakage when an entry is manually corrupted', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'orig_001' }));
      await RewardLedger.record(makeEntry({ mission_id: 'orig_002' }));
      await RewardLedger.record(makeEntry({ mission_id: 'orig_003' }));

      // Read raw content and tamper with entry at index 1
      const content = fs.readFileSync(ledgerFile, 'utf-8');
      const lines = content.trim().split('\n');
      const entry1 = JSON.parse(lines[1]);
      entry1.total_reward = 999; // tamper: change reward value
      lines[1] = JSON.stringify(entry1);
      fs.writeFileSync(ledgerFile, lines.join('\n') + '\n', 'utf-8');

      const result = await RewardLedger.validateChain();
      expect(result.valid).toBe(false);
      expect(result.broken_chain_at).toBe(1);
    });

    it('should detect chain mismatch when prev_hash does not match previous hash', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'chain_a' }));
      await RewardLedger.record(makeEntry({ mission_id: 'chain_b' }));

      // Tamper: break prev_hash in second entry
      const content = fs.readFileSync(ledgerFile, 'utf-8');
      const lines = content.trim().split('\n');
      const entry1 = JSON.parse(lines[1]);
      entry1.prev_hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      lines[1] = JSON.stringify(entry1);
      fs.writeFileSync(ledgerFile, lines.join('\n') + '\n', 'utf-8');

      const result = await RewardLedger.validateChain();
      expect(result.valid).toBe(false);
      expect(result.broken_chain_at).toBe(1);
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe('record validation', () => {
    it('should reject entries with missing mission_id', async () => {
      const badEntry = makeEntry({ mission_id: '' });
      await expect(RewardLedger.record(badEntry)).rejects.toThrow('LEDGER_ERR: mission_id');
    });

    it('should reject entries with negative total_reward', async () => {
      const badEntry = makeEntry({ total_reward: -1 });
      await expect(RewardLedger.record(badEntry)).rejects.toThrow('LEDGER_ERR: negative reward');
    });

    it('should reject entries with missing worker_id', async () => {
      const badEntry = makeEntry({ worker_id: '' });
      await expect(RewardLedger.record(badEntry)).rejects.toThrow('LEDGER_ERR: worker_id');
    });

    it('should accept entries with zero total_reward (boundary case)', async () => {
      const entry = makeEntry({ total_reward: 0 });
      await expect(RewardLedger.record(entry)).resolves.toBeDefined();

      const result = await RewardLedger.validateChain();
      expect(result.valid).toBe(true);
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return an empty array when the ledger file does not exist', async () => {
      if (fs.existsSync(ledgerFile)) fs.unlinkSync(ledgerFile);
      const entries = await RewardLedger.getAll();
      expect(entries).toEqual([]);
    });

    it('should return all recorded entries in order', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'first' }));
      await RewardLedger.record(makeEntry({ mission_id: 'second' }));
      await RewardLedger.record(makeEntry({ mission_id: 'third' }));

      const entries = await RewardLedger.getAll();
      expect(entries).toHaveLength(3);
      expect(entries[0].mission_id).toBe('first');
      expect(entries[1].mission_id).toBe('second');
      expect(entries[2].mission_id).toBe('third');
    });
  });

  // ── Regression: Hash Determinism ─────────────────────────────────────────

  describe('hash determinism', () => {
    it('should generate consistent 64-char hex strings', async () => {
      await RewardLedger.record(makeEntry({ mission_id: 'deterministic_test', total_reward: 0.5 }));
      const entries = await RewardLedger.getAll();
      const hash = entries[0].hash;
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
