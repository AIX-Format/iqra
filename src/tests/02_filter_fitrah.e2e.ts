/**
 * E2E Test 02 — FITRAH Filter
 * "فَأَمَّا الزَّبَدُ فَيَذْهَبُ جُفَاءً" — الرعد: 17
 *
 * Tests the real filter that reads DASTŪR.md and FITRAH.md from disk.
 * No mocks — real file reads, real keyword matching.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { IQRAFilter } from '../lib/iqra/filter';

beforeAll(() => {
  // Force re-initialization from real .md files
  IQRAFilter.initialize();
});

describe('🌿 FITRAH Filter — المصفاة', () => {

  // ── ALLOWED ────────────────────────────────────────────────────────────────

  it('allows a clean Quranic question (Arabic)', async () => {
    const result = await IQRAFilter.validate('ما معنى سورة الفاتحة في القرآن الكريم؟');
    expect(result.isAllowed).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('allows a clean English question', async () => {
    const result = await IQRAFilter.validate(
      'What are the numerical patterns in Surah Al-Baqarah?'
    );
    expect(result.isAllowed).toBe(true);
  });

  it('allows a technical coding question', async () => {
    const result = await IQRAFilter.validate(
      'How do I implement a cosine similarity function in TypeScript?'
    );
    expect(result.isAllowed).toBe(true);
  });

  it('allows a question about lost civilizations', async () => {
    const result = await IQRAFilter.validate(
      'Tell me about the people of Aad and the city of Iram'
    );
    expect(result.isAllowed).toBe(true);
  });

  // ── BLOCKED ────────────────────────────────────────────────────────────────

  it('blocks a request containing "كيف أكذب"', async () => {
    const result = await IQRAFilter.validate('كيف أكذب على الناس وأخدعهم؟');
    expect(result.isAllowed).toBe(false);
  });

  it('blocks a request containing "الظلم"', async () => {
    const result = await IQRAFilter.validate('أريد أن أمارس الظلم على الآخرين');
    expect(result.isAllowed).toBe(false);
  });

  it('blocks sparse noise content', async () => {
    const result = await IQRAFilter.validate('abc');
    expect(result.isAllowed).toBe(false);
  });

  // ── SCORE ──────────────────────────────────────────────────────────────────

  it('gives higher score to Quran-aligned content', async () => {
    const quranResult = await IQRAFilter.validate(
      'أريد فهم القرآن والسنة وخدمة الإسلام بإتقان'
    );
    const neutralResult = await IQRAFilter.validate(
      'What is the weather like today in Cairo?'
    );
    expect(quranResult.score).toBeGreaterThan(neutralResult.score);
  });

  it('returns score between 0 and 1', async () => {
    const result = await IQRAFilter.validate('تحليل الأنماط القرآنية');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
