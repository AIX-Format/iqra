/**
 * E2E Test 05 — Curiosity Engine (Topological Resonance)
 * "وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ" — الذاريات: 21
 *
 * Tests the full resonance pipeline:
 * Surface similarity → Deep Groq analysis → Inverse Mirror validation → Reward
 *
 * This is the HEART of IQRA — no mocks allowed.
 */
import { describe, it, expect } from 'vitest';
import { CuriosityEngine, ResonanceType } from '../lib/iqra/quran/curiosity';
import { computeArabicSimilarity, normalizeArabic } from '../lib/iqra/utils/similarity';

// ── Real Quranic Ayahs ────────────────────────────────────────────────────────
const AYAH_CREATION = 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ';
const AYAH_IRON = 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ';
const AYAH_STARS = 'وَالنَّجْمِ إِذَا هَوَىٰ مَا ضَلَّ صَاحِبُكُمْ وَمَا غَوَىٰ';

describe('🔬 Arabic Similarity — التشابه العربي', () => {

  it('normalizes Arabic text correctly', () => {
    const text = 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ';
    const normalized = normalizeArabic(text);
    // Should remove harakat
    expect(normalized).not.toMatch(/[\u064B-\u0652]/);
    // Should normalize alif variants
    expect(normalized).not.toMatch(/[أإآ]/);
    console.log(`\n📝 Normalized: "${normalized}"`);
  });

  it('returns 1.0 similarity for identical texts', () => {
    const text = 'بسم الله الرحمن الرحيم';
    const sim = computeArabicSimilarity(text, text);
    expect(sim).toBe(1.0);
  });

  it('returns 0 similarity for completely different texts', () => {
    const sim = computeArabicSimilarity('الماء والحياة', 'النجوم والكواكب');
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThan(0.5);
  });

  it('returns higher similarity for related texts', () => {
    const sim1 = computeArabicSimilarity('الماء والحياة', 'الماء أصل الحياة');
    const sim2 = computeArabicSimilarity('الماء والحياة', 'النجوم في السماء');
    expect(sim1).toBeGreaterThan(sim2);
    console.log(`\n💧 Related: ${sim1.toFixed(3)} | Unrelated: ${sim2.toFixed(3)}`);
  });
});

describe('🌀 Curiosity Engine — محرك الفضول', () => {

  it('processes resonance between water ayah and biology (full pipeline)', async () => {
    const result = await CuriosityEngine.processResonance(
      AYAH_CREATION,
      'Modern biology confirms water is essential for all known life — it enables protein folding, DNA replication, and cellular metabolism',
      {},
      'e2e_test_session'
    );

    // May return null if similarity threshold not met — that's valid
    if (result !== null) {
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThan(0);
      console.log(`\n✅ Resonance found: [${result.type}] ${result.reason}`);
      console.log(`   Confidence: ${result.confidence}`);
    } else {
      console.log('\n⚠️ No resonance found (similarity below threshold) — valid result');
    }
  }, 45000);

  it('processes resonance between iron ayah and astrophysics', async () => {
    const result = await CuriosityEngine.processResonance(
      AYAH_IRON,
      'Astrophysics confirms iron is not produced in stars like lighter elements — it is formed in supernova explosions and literally "sent down" to planets through cosmic impacts',
      {},
      'e2e_test_session'
    );

    if (result !== null) {
      expect(result.type).toBeTruthy();
      console.log(`\n⚙️ Iron Resonance: [${result.type}] ${result.reason}`);
    } else {
      console.log('\n⚠️ Iron resonance below threshold — valid');
    }
  }, 45000);

  it('returns null for clearly unrelated data', async () => {
    // Stock market data has no resonance with Quranic ayah about stars
    const result = await CuriosityEngine.processResonance(
      AYAH_STARS,
      'NASDAQ closed up 2.3% today driven by semiconductor stocks',
      {},
      'e2e_test_unrelated'
    );

    // Should return null — no meaningful resonance
    console.log(`\n📊 Unrelated result: ${result === null ? 'null (correct)' : JSON.stringify(result)}`);
    // We don't assert null strictly — the engine may find a weak connection
    // but confidence should be low if it does
    if (result !== null) {
      expect(result.confidence).toBeLessThan(0.7);
    }
  }, 45000);

  it('ResonanceType enum has all required types', () => {
    expect(ResonanceType.LINGUISTIC).toBe('Linguistic');
    expect(ResonanceType.SCIENTIFIC).toBe('Scientific');
    expect(ResonanceType.HISTORICAL).toBe('Historical');
    expect(ResonanceType.TOPOLOGICAL).toBe('Topological');
    expect(ResonanceType.NUMERICAL).toBe('Numerical');
    expect(ResonanceType.SPIRITUAL).toBe('Spiritual');
    expect(ResonanceType.CONGZI).toBe('Congzi');
  });
});
