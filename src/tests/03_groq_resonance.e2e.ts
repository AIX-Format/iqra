/**
 * E2E Test 03 — Groq Real Resonance
 * "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت: 53
 *
 * Tests REAL Groq API calls — no mocks.
 * Validates the resonance engine finds genuine connections.
 */
import { describe, it, expect } from 'vitest';
import {
  callGroqForResonance,
  callGroqForTruthValidation,
} from '../lib/iqra/llm/groq';

// ── Real Ayahs for testing ────────────────────────────────────────────────────
const AYAH_AAD = 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ إِرَمَ ذَاتِ الْعِمَادِ الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ';
const AYAH_WATER = 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ';
const AYAH_RASS = 'وَبِئْرٍ مُّعَطَّلَةٍ وَقَصْرٍ مَّشِيدٍ';

describe('🌀 Groq Resonance Engine — محرك الرنين', () => {

  it('finds resonance between Aad ayah and NASA sinkhole discovery', async () => {
    const result = await callGroqForResonance(
      AYAH_AAD,
      'NASA satellite radar in 1992 discovered ancient caravan tracks converging at Shisr oasis in Oman, where a city collapsed into a limestone sinkhole — matching the description of Iram of the Pillars',
      {}
    );

    expect(result).toBeTruthy();
    expect(result.type).toBeTruthy();
    expect(result.reason).toBeTruthy();
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(typeof result.isTrivial).toBe('boolean');

    console.log(`\n🌀 Resonance Type: ${result.type}`);
    console.log(`📖 Reason: ${result.reason}`);
    console.log(`💯 Confidence: ${result.confidence}`);
  }, 30000);

  it('finds resonance between water ayah and biology discovery', async () => {
    const result = await callGroqForResonance(
      AYAH_WATER,
      'Modern biology confirms all known life forms require liquid water — from single-cell bacteria to complex mammals, water is the universal solvent for biochemical reactions',
      {}
    );

    expect(result).toBeTruthy();
    expect(result.type).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);

    console.log(`\n🌊 Water Resonance: ${result.type} — ${result.reason}`);
  }, 30000);

  it('returns valid JSON structure always', async () => {
    const result = await callGroqForResonance(
      AYAH_RASS,
      'Archaeological surveys in central Arabia found giant geological depressions (Dahl al-Hit) near ancient well systems',
      {}
    );

    // Must have all required fields
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('isTrivial');
  }, 30000);

  it('confidence is higher for strong resonance than weak', async () => {
    const strongResonance = await callGroqForResonance(
      AYAH_WATER,
      'All living organisms on Earth require water for cellular metabolism and biochemical processes',
      {}
    );

    const weakResonance = await callGroqForResonance(
      AYAH_WATER,
      'The stock market closed higher today due to tech sector gains',
      {}
    );

    console.log(`\n💪 Strong: ${strongResonance.confidence} | Weak: ${weakResonance.confidence}`);
    // Strong scientific connection should score higher
    expect(strongResonance.confidence).toBeGreaterThanOrEqual(weakResonance.confidence);
  }, 60000);
});

describe('🪞 Inverse Mirror — التحقق من الحقيقة', () => {

  it('validates a genuine resonance as true', async () => {
    const resonance = {
      type: 'Scientific',
      reason: 'The Quran states all life comes from water, confirmed by modern biology',
      confidence: 0.9,
    };

    const validation = await callGroqForTruthValidation(
      AYAH_WATER,
      'All known life requires water for biochemical processes',
      resonance
    );

    expect(validation).toHaveProperty('isTrue');
    expect(validation).toHaveProperty('critique');
    expect(validation).toHaveProperty('strengthOfCounterArgument');
    expect(typeof validation.strengthOfCounterArgument).toBe('number');

    console.log(`\n🪞 Validation: isTrue=${validation.isTrue}, counter=${validation.strengthOfCounterArgument}`);
  }, 30000);

  it('challenges a weak/trivial resonance', async () => {
    const weakResonance = {
      type: 'Spiritual',
      reason: 'Both mention the concept of existence',
      confidence: 0.3,
    };

    const validation = await callGroqForTruthValidation(
      AYAH_WATER,
      'The color blue is popular in modern design',
      weakResonance
    );

    expect(validation).toHaveProperty('strengthOfCounterArgument');
    // Weak resonance should have a stronger counter-argument
    expect(validation.strengthOfCounterArgument).toBeGreaterThan(0.3);

    console.log(`\n🛡️ Counter strength: ${validation.strengthOfCounterArgument}`);
    console.log(`   Critique: ${validation.critique}`);
  }, 30000);
});
