/**
 * Unit Tests: DoctrinalGuard
 *
 * Tests the new deterministic, no-LLM guard introduced in PR #31.
 * All functions are pure/synchronous (or trivially async wrappers),
 * so no external mocking is required.
 *
 * Covers:
 *  - DoctrinalGuard.verify() — PASS and FAIL paths
 *  - DoctrinalGuard.isSafe() — async boolean wrapper
 *  - Empty/missing input handling
 *  - Anchoring rules (ref citation vs. quote window)
 *  - Scientific domain: numerical hallucination detection
 *  - Banned-phrase detection
 *  - Arabic digit normalization path
 */

import { describe, it, expect } from 'vitest';
import { DoctrinalGuard, type DoctrinalCheckInput } from '#security/doctrinal_guard';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const AYAH_WATER = 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ';
const REF_WATER = '21:30';
const AYAH_IRON = 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ';
const REF_IRON = '57:25';

// ── PASS cases ────────────────────────────────────────────────────────────────

describe('DoctrinalGuard.verify — PASS cases', () => {
  it('passes when claim cites the verse reference verbatim', () => {
    const input: DoctrinalCheckInput = {
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `According to verse ${REF_WATER}, all living things require water.`,
    };
    const result = DoctrinalGuard.verify(input);
    expect(result.check).toBe('PASS');
    expect(result.error_type).toBeUndefined();
  });

  it('passes when claim quotes ≥8 contiguous characters from the verse', () => {
    // Take a clear 10-char window from the Arabic verse
    const quote = AYAH_WATER.slice(5, 15);
    const input: DoctrinalCheckInput = {
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `The verse says "${quote}" — water is life.`,
    };
    const result = DoctrinalGuard.verify(input);
    expect(result.check).toBe('PASS');
  });

  it('passes scientific claim with no extra numbers (only allowed numbers)', () => {
    const input: DoctrinalCheckInput = {
      ayah_text: AYAH_IRON,
      ayah_ref: REF_IRON,
      claim: `The Quran (${REF_IRON}) mentions iron — formed in supernovae. Pattern found 7 times.`,
      domain: 'scientific',
    };
    const result = DoctrinalGuard.verify(input);
    // 7 is in the allow-list, so should PASS
    expect(result.check).toBe('PASS');
  });

  it('passes scientific claim when introduced number appears in verse', () => {
    // Verse with a number embedded — use a verse known to contain a numeral reference
    // We synthesize a simple scenario: ayah_text contains "19" in Latin digits
    const ayahWithNum = 'there are 19 guardians in the fire';
    const input: DoctrinalCheckInput = {
      ayah_text: ayahWithNum,
      ayah_ref: '74:30',
      claim: 'Verse 74:30 speaks of 19 guardians.',
      domain: 'scientific',
    };
    const result = DoctrinalGuard.verify(input);
    expect(result.check).toBe('PASS');
  });

  it('passes spiritual claim (domain=spiritual) even when numbers differ', () => {
    const input: DoctrinalCheckInput = {
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER} speaks of water as a spiritual metaphor for purification (100 types of knowledge).`,
      domain: 'spiritual',
    };
    // domain is spiritual — Rule 2 (numerical) is skipped
    const result = DoctrinalGuard.verify(input);
    expect(result.check).toBe('PASS');
  });

  it('passes when quote window matches end of verse', () => {
    const endQuote = AYAH_WATER.slice(-10);
    const input: DoctrinalCheckInput = {
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `The verse ends with "${endQuote}", describing all life.`,
    };
    const result = DoctrinalGuard.verify(input);
    expect(result.check).toBe('PASS');
  });
});

// ── FAIL: EMPTY_INPUT ─────────────────────────────────────────────────────────

describe('DoctrinalGuard.verify — EMPTY_INPUT failures', () => {
  it('fails when ayah_text is empty', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: '',
      ayah_ref: REF_WATER,
      claim: 'Some claim',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('EMPTY_INPUT');
  });

  it('fails when claim is empty', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: '',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('EMPTY_INPUT');
  });

  it('fails when ayah_ref is empty string', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: '',
      claim: 'Water is mentioned.',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('EMPTY_INPUT');
  });

  it('fails when ayah_ref is whitespace-only', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: '   ',
      claim: 'Water is mentioned.',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('EMPTY_INPUT');
  });
});

// ── FAIL: UNANCHORED_CLAIM ────────────────────────────────────────────────────

describe('DoctrinalGuard.verify — UNANCHORED_CLAIM failures', () => {
  it('fails when claim does not cite ref or quote from verse', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: 'The sky is blue and water is wet.',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('UNANCHORED_CLAIM');
    expect(result.details).toContain(REF_WATER);
  });

  it('fails when claim quotes fewer than 8 characters from verse', () => {
    // Quote only 6 chars (< MIN_QUOTE_CHARS)
    const shortQuote = AYAH_WATER.slice(0, 6);
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `The verse fragment "${shortQuote}" is relevant.`,
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('UNANCHORED_CLAIM');
  });

  it('fails with empty-string ref bypass attempt (claim.includes("") was always true)', () => {
    // Previously, an empty ayah_ref combined with claim.includes('') would bypass.
    // The fix now returns EMPTY_INPUT when ref is empty/whitespace.
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: '',
      claim: 'This claim would previously slip through.',
    });
    expect(result.check).toBe('FAIL');
    // Either EMPTY_INPUT (preferred new behaviour)
    expect(['EMPTY_INPUT', 'UNANCHORED_CLAIM']).toContain(result.error_type);
  });
});

// ── FAIL: NUMERICAL_HALLUCINATION ─────────────────────────────────────────────

describe('DoctrinalGuard.verify — NUMERICAL_HALLUCINATION failures', () => {
  it('fails scientific claim introducing a number not in verse or allow-list', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER}: water covers exactly 1234 km of ocean floor.`,
      domain: 'scientific',
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('NUMERICAL_HALLUCINATION');
    expect(result.details).toContain('1234');
  });

  it('allows numbers 7, 19, 40, 369 in scientific claims without verse coverage', () => {
    for (const n of [7, 19, 40, 369]) {
      const result = DoctrinalGuard.verify({
        ayah_text: AYAH_WATER,
        ayah_ref: REF_WATER,
        claim: `Verse ${REF_WATER}: there are ${n} known categories.`,
        domain: 'scientific',
      });
      expect(result.check, `Number ${n} should be in allow-list`).toBe('PASS');
    }
  });

  it('does NOT trigger NUMERICAL_HALLUCINATION when domain is spiritual', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER}: water covers 5000 miles of creation spiritually speaking.`,
      domain: 'spiritual',
    });
    // Rule 2 skipped for spiritual domain
    expect(result.check).toBe('PASS');
  });

  it('defaults to spiritual domain when domain is not specified', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER}: water covers 9999 of whatever.`,
      // domain not specified — defaults to 'spiritual'
    });
    expect(result.check).toBe('PASS');
  });
});

// ── FAIL: BANNED_PHRASE ───────────────────────────────────────────────────────

describe('DoctrinalGuard.verify — BANNED_PHRASE failures', () => {
  it('blocks claim containing "allah said in surah none"', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `According to ${REF_WATER}, Allah said in Surah None that water is everywhere.`,
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('BANNED_PHRASE');
    expect(result.details).toContain('allah said in surah none');
  });

  it('blocks claim containing "prophet said never" (case-insensitive)', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER}: Prophet Said Never to doubt water's importance.`,
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('BANNED_PHRASE');
  });

  it('blocks claim containing "as the quran does not say"', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER}: as the Quran does not say anything, we interpret freely.`,
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('BANNED_PHRASE');
  });
});

// ── isSafe() async wrapper ────────────────────────────────────────────────────

describe('DoctrinalGuard.isSafe()', () => {
  it('returns true for a well-anchored claim', async () => {
    const safe = await DoctrinalGuard.isSafe(
      AYAH_IRON,
      REF_IRON,
      `The verse (${REF_IRON}) mentions iron — formed in supernovae.`,
      'spiritual',
    );
    expect(safe).toBe(true);
  });

  it('returns false for an unanchored claim', async () => {
    const safe = await DoctrinalGuard.isSafe(
      AYAH_IRON,
      REF_IRON,
      'Iron is just a metal used in construction.',
      'scientific',
    );
    expect(safe).toBe(false);
  });

  it('returns false for empty ayah_text', async () => {
    const safe = await DoctrinalGuard.isSafe('', REF_WATER, 'Some claim');
    expect(safe).toBe(false);
  });

  it('defaults domain to spiritual when not provided', async () => {
    const safe = await DoctrinalGuard.isSafe(
      AYAH_WATER,
      REF_WATER,
      `Verse ${REF_WATER} reminds us to appreciate water daily.`,
    );
    expect(safe).toBe(true);
  });
});

// ── Edge / regression cases ───────────────────────────────────────────────────

describe('DoctrinalGuard — edge and regression cases', () => {
  it('rejects a claim that is only punctuation/whitespace as unanchored', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: '...',
    });
    expect(result.check).toBe('FAIL');
  });

  it('handles very short verse text (< MIN_QUOTE_CHARS) gracefully', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: 'short',  // Only 5 chars
      ayah_ref: '1:1',
      claim: 'Verse 1:1 is short.',
    });
    // ref is cited so it should PASS
    expect(result.check).toBe('PASS');
  });

  it('passes when ref contains colon format like "2:255"', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      ayah_ref: '2:255',
      claim: 'The Throne Verse (2:255) establishes divine sovereignty.',
    });
    expect(result.check).toBe('PASS');
  });

  it('banned phrase check is case-insensitive', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_WATER,
      ayah_ref: REF_WATER,
      claim: `Verse ${REF_WATER} — ALLAH SAID IN SURAH NONE that water matters.`,
    });
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('BANNED_PHRASE');
  });

  it('returns error_type and details on NUMERICAL_HALLUCINATION', () => {
    const result = DoctrinalGuard.verify({
      ayah_text: AYAH_IRON,
      ayah_ref: REF_IRON,
      claim: `Verse ${REF_IRON}: iron has atomic number 26 and melts at 1538 degrees.`,
      domain: 'scientific',
    });
    // 26 and 1538 are not in verse or allow-list
    expect(result.check).toBe('FAIL');
    expect(result.error_type).toBe('NUMERICAL_HALLUCINATION');
    expect(result.details).toBeDefined();
  });
});