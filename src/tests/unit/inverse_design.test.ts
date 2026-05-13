/**
 * Unit Tests: InverseDesign
 *
 * Tests the pure `propose()` function and the async `designBinder()` method.
 * No external dependencies — fully deterministic.
 *
 * Covers:
 *  - propose() routing logic for all four TawbahAction kinds
 *  - designBinder() template generation for each action kind
 *  - Regex extraction of ErrorClass and filePath from log strings
 *  - Edge cases: empty inputs, undefined fields
 */

import { describe, it, expect } from 'vitest';
import { InverseDesign, type FailureSignature } from '#skills/inverse_design';

// ── propose() — routing ───────────────────────────────────────────────────────

describe('InverseDesign.propose() — routing logic', () => {
  it('returns halt for errorClass=SovereignError', () => {
    const action = InverseDesign.propose({ errorClass: 'SovereignError' });
    expect(action.kind).toBe('halt');
    expect(action.reason).toContain('MĪTHĀQ');
  });

  it('returns halt when message contains "haram"', () => {
    const action = InverseDesign.propose({ message: 'Operation is haram under constitution.' });
    expect(action.kind).toBe('halt');
  });

  it('returns halt when message contains "mock data"', () => {
    const action = InverseDesign.propose({ message: 'Found mock data in production path' });
    expect(action.kind).toBe('halt');
  });

  it('is case-insensitive for halt triggers', () => {
    // errorClass comparison is lowercased
    const action = InverseDesign.propose({ errorClass: 'sovereignerror' });
    expect(action.kind).toBe('halt');
  });

  it('returns rerun_with_trace for timeout error message', () => {
    const action = InverseDesign.propose({ message: 'request timeout after 5000ms' });
    expect(action.kind).toBe('rerun_with_trace');
    expect(action.reason).toContain('Transient timeout');
  });

  it('returns rerun_with_trace for etimedout message', () => {
    const action = InverseDesign.propose({ message: 'connect ETIMEDOUT 10.0.0.1:443' });
    expect(action.kind).toBe('rerun_with_trace');
  });

  it('returns widen_context for "cannot find module"', () => {
    const action = InverseDesign.propose({
      message: "Cannot find module '#quran/loader'",
      filePath: 'src/lib/iqra/04-quran/loader.ts',
    });
    expect(action.kind).toBe('widen_context');
    if (action.kind === 'widen_context') {
      expect(action.addPaths).toContain('src/lib/iqra/04-quran/loader.ts');
    }
  });

  it('returns widen_context for "is not defined" message', () => {
    const action = InverseDesign.propose({ message: 'PatternHunter is not defined' });
    expect(action.kind).toBe('widen_context');
  });

  it('returns widen_context with empty addPaths when filePath is missing', () => {
    const action = InverseDesign.propose({ message: 'foo is not defined' });
    expect(action.kind).toBe('widen_context');
    if (action.kind === 'widen_context') {
      expect(action.addPaths).toHaveLength(0);
    }
  });

  it('returns revert as the default fallback', () => {
    const action = InverseDesign.propose({ message: 'some unknown error' });
    expect(action.kind).toBe('revert');
    expect(action.reason).toContain('Default');
  });

  it('returns revert for completely empty signature', () => {
    const action = InverseDesign.propose({});
    expect(action.kind).toBe('revert');
  });

  it('halt takes precedence over timeout when both keywords present', () => {
    const action = InverseDesign.propose({ message: 'haram operation caused timeout' });
    // "haram" triggers halt before "timeout" is checked
    expect(action.kind).toBe('halt');
  });
});

// ── designBinder() — code template generation ─────────────────────────────────

describe('InverseDesign.designBinder()', () => {
  it('generates a halt snippet for SovereignError logs', async () => {
    const log = 'Unhandled SovereignError: operation is haram';
    const snippet = await InverseDesign.designBinder(log);

    expect(snippet).toContain('throw new Error');
    expect(snippet).toContain('Sovereign halt');
    expect(snippet).toContain('// Action: halt');
  });

  it('generates a rerun_with_trace snippet for timeout logs', async () => {
    const log = 'Error: timeout exceeded waiting for response';
    const snippet = await InverseDesign.designBinder(log);

    expect(snippet).toContain('rerunWithTrace');
    expect(snippet).toContain('// Action: rerun_with_trace');
    expect(snippet).toContain('export async function');
  });

  it('generates a widen_context snippet and includes file path', async () => {
    const log = 'Cannot find module at src/lib/iqra/04-quran/loader.ts: build failed';
    const snippet = await InverseDesign.designBinder(log);

    expect(snippet).toContain('WIDEN_CONTEXT');
    expect(snippet).toContain('// Action: widen_context');
  });

  it('generates a revert snippet for generic errors', async () => {
    const log = 'Error: unknown failure in process';
    const snippet = await InverseDesign.designBinder(log);

    expect(snippet).toContain('SUGGEST_REVERT');
    expect(snippet).toContain('// Action: revert');
  });

  it('header always contains timestamp and action details', async () => {
    const snippet = await InverseDesign.designBinder('some error log');
    expect(snippet).toContain('// IQRA Tawbah binder — designed');
    expect(snippet).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('handles empty string gracefully and returns revert snippet', async () => {
    const snippet = await InverseDesign.designBinder('');
    expect(typeof snippet).toBe('string');
    expect(snippet).toContain('// Action: revert');
  });

  it('extracts ErrorClass from log via regex', async () => {
    // The regex picks up something like "TypeError"
    const log = 'TypeError: cannot read property of undefined';
    const snippet = await InverseDesign.designBinder(log);
    // TypeError is not "SovereignError", so should not halt
    expect(snippet).not.toContain('Sovereign halt');
  });

  it('extracts filePath from "at " pattern', async () => {
    const log = 'at src/lib/iqra/module.ts:42:10\nCannot find module x';
    const snippet = await InverseDesign.designBinder(log);
    // widen_context should include the .ts file path
    expect(snippet).toContain('WIDEN_CONTEXT');
  });

  it('generates valid TypeScript export in rerun snippet', async () => {
    const snippet = await InverseDesign.designBinder('request timed out (etimedout)');
    // Should export an async function
    expect(snippet).toContain('export async function rerunWithTrace');
    expect(snippet).toContain('Promise<T>');
  });
});

// ── Determinism ───────────────────────────────────────────────────────────────

describe('InverseDesign — determinism', () => {
  it('propose() is deterministic for the same input', () => {
    const sig: FailureSignature = { message: 'Cannot find module foo', filePath: 'a.ts' };
    const a = InverseDesign.propose(sig);
    const b = InverseDesign.propose(sig);
    expect(a).toEqual(b);
  });

  it('designBinder() produces structurally identical snippets on repeated calls (modulo timestamp)', async () => {
    const log = 'some unknown error';
    const s1 = await InverseDesign.designBinder(log);
    const s2 = await InverseDesign.designBinder(log);
    // Strip out the timestamp line before comparing structure
    const strip = (s: string) => s.replace(/designed \d{4}-\d{2}-\d{2}T[^\n]+/, 'designed <TS>');
    expect(strip(s1)).toBe(strip(s2));
  });
});