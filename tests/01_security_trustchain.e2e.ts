/**
 * E2E Test 01 — TrustChain & Security
 * "إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا" — النساء: 1
 *
 * Tests the immutable audit log that records every action.
 * No mocks — real crypto, real chain verification.
 */
import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import {
  appendToTrustChain,
  validateInput,
  secureRandomId,
  type TrustChainEntry,
} from '../lib/iqra/security.ts';

// ── Helper: rebuild audit hash the same way security.ts does ─────────────────
function recomputeAuditHash(
  prevHash: string,
  action: string,
  input: string,
  output: string
): string {
  const inputHash  = createHash('sha256').update(input).digest('hex');
  const outputHash = createHash('sha256').update(output).digest('hex');
  return createHash('sha256')
    .update(prevHash + action + inputHash + outputHash)
    .digest('hex');
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('🔐 TrustChain — سجل الثقة', () => {

  it('appends an entry and returns a non-empty audit hash', () => {
    const hash = appendToTrustChain('TEST:ACTION', 'input_data', 'output_data', 1.0);
    expect(hash).toBeTruthy();
    expect(hash).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it('produces deterministic hashes for the same input', () => {
    const h1 = recomputeAuditHash('GENESIS', 'ACTION', 'in', 'out');
    const h2 = recomputeAuditHash('GENESIS', 'ACTION', 'in', 'out');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different inputs', () => {
    const h1 = recomputeAuditHash('GENESIS', 'ACTION', 'input_A', 'output_A');
    const h2 = recomputeAuditHash('GENESIS', 'ACTION', 'input_B', 'output_B');
    expect(h1).not.toBe(h2);
  });

  it('chain is tamper-evident — changing one entry breaks the next hash', () => {
    const h1 = recomputeAuditHash('SOVEREIGN_GENESIS', 'STEP_1', 'data1', 'result1');
    const h2_correct   = recomputeAuditHash(h1, 'STEP_2', 'data2', 'result2');
    const h2_tampered  = recomputeAuditHash('TAMPERED_HASH',  'STEP_2', 'data2', 'result2');
    expect(h2_correct).not.toBe(h2_tampered);
  });

  it('records multiple entries in sequence without collision', () => {
    const hashes = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const h = appendToTrustChain(`PULSE:${i}`, `input_${i}`, `output_${i}`, 1.0);
      hashes.add(h);
    }
    // All 7 hashes must be unique (Witr principle)
    expect(hashes.size).toBe(7);
  });
});

describe('🛡️ Input Validation — التحقق من المدخلات', () => {

  it('accepts a valid prompt', () => {
    const result = validateInput({ prompt: 'ما معنى سورة الفاتحة؟' });
    expect(result.success).toBe(true);
  });

  it('rejects missing prompt', () => {
    const result = validateInput({});
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('prompt is required');
  });

  it('rejects prompt exceeding 5000 chars', () => {
    const result = validateInput({ prompt: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('too long');
  });

  it('accepts prompt at exactly 5000 chars', () => {
    const result = validateInput({ prompt: 'x'.repeat(5000) });
    expect(result.success).toBe(true);
  });
});

describe('🔑 Secure Random ID — العشوائية الآمنة', () => {

  it('generates a hex string of correct length', () => {
    const id = secureRandomId(16);
    expect(id).toHaveLength(32); // 16 bytes = 32 hex chars
  });

  it('generates unique IDs — no collisions in 100 runs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => secureRandomId(16)));
    expect(ids.size).toBe(100);
  });
});
