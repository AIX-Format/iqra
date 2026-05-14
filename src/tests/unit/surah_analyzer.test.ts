// بسم الله الرحمن الرحيم
/**
 * 🧪 SurahAnalyzer — Unit Tests
 * النية: التحقق من محرك تحليل السور بشكل كامل.
 *
 * المصادر: [read] من الملفات المُعدَّلة هذه الجلسة.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TopologicalResonance } from '#quran/topological_curiosity';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('#quran/topological_curiosity', () => ({
  TopologicalCuriosityEngine: {
    discoverResonance: vi.fn(),
  },
}));

vi.mock('#quran/go_engine_client', () => ({
  goEngine: {
    healthCheck: vi.fn(),
  },
}));

vi.mock('#security/security', () => ({
  appendToTrustChain: vi.fn(),
}));

vi.mock('#infra/logger', () => ({
  IQRALogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('#quran/numerical_validator', () => ({
  NumericalValidator: {
    validate: vi.fn().mockReturnValue({
      score: 0.5,
      patterns: ['Pattern_7', 'Sacred_Term'],
      isResonant: false,
    }),
  },
}));

vi.mock('#memory/pattern_memory', () => ({
  PatternMemory: {
    storePattern: vi.fn(),
    getSimilarPatterns: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('#memory/memory', () => ({
  IQRAMemory: {
    generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0)),
    cosineSimilarity: vi.fn().mockReturnValue(0),
  },
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue(''),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
  existsSync: vi.fn().mockReturnValue(false),
  readFileSync: vi.fn().mockReturnValue(''),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { SurahAnalyzer } from '#quran/surah_analyzer';
import { TopologicalCuriosityEngine } from '#quran/topological_curiosity';
import { goEngine } from '#quran/go_engine_client';
import { appendToTrustChain } from '#security/security';
import { NumericalValidator } from '#quran/numerical_validator';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeResonance(
  verse: string,
  resonanceScore: number,
  noveltyScore: number = 0.5,
  h1Cycles: number = 1
): TopologicalResonance {
  return {
    verse,
    field: 'Test Field',
    resonance_score: resonanceScore,
    novelty_score: noveltyScore,
    fractal_depth: 2,
    h1_cycles: h1Cycles,
    h0_components: 1,
    is_novel: noveltyScore >= 0.6,
    should_reward: (resonanceScore + noveltyScore) / 2 >= 0.5,
    trust_chain_hash: 'a'.repeat(64),
    source_tags: ['[prior-training]'],
    similar_patterns: [],
    numerical_patterns: [],
    timestamp: Date.now(),
  };
}

// ══════════════════════════════════════════════════════════════
// Input Validation
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw on surah number 0', async () => {
    await expect(SurahAnalyzer.analyzeSurah(0)).rejects.toThrow(
      'Invalid surah number: 0. Must be 1-114.'
    );
  });

  it('should throw on negative surah number', async () => {
    await expect(SurahAnalyzer.analyzeSurah(-1)).rejects.toThrow(
      'Invalid surah number: -1. Must be 1-114.'
    );
  });

  it('should throw on surah number 115', async () => {
    await expect(SurahAnalyzer.analyzeSurah(115)).rejects.toThrow(
      'Invalid surah number: 115. Must be 1-114.'
    );
  });

  it('should throw on very large surah number', async () => {
    await expect(SurahAnalyzer.analyzeSurah(999)).rejects.toThrow(
      /Invalid surah number/
    );
  });

  it('should not throw for boundary surah 1 (الفاتحة)', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.8)
    );

    await expect(SurahAnalyzer.analyzeSurah(1)).resolves.toBeDefined();
  });

  it('should not throw for boundary surah 114 (الناس)', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('114:1', 0.5)
    );

    await expect(SurahAnalyzer.analyzeSurah(114)).resolves.toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════
// Surah Metadata
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — surah metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5)
    );
  });

  it('should return correct surah name for Surah 1 (الفاتحة)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(1);
    expect(result.surah_name).toBe('الفاتحة');
  });

  it('should return correct surah name for Surah 2 (البقرة)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(2);
    expect(result.surah_name).toBe('البقرة');
  });

  it('should return correct surah name for Surah 114 (الناس)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(114);
    expect(result.surah_name).toBe('الناس');
  });

  it('should return correct verse count for Surah 1 (7 verses)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(1);
    expect(result.total_verses).toBe(7);
  });

  it('should return correct verse count for Surah 2 (286 verses)', async () => {
    // Use a short-circuit mock to avoid 286 iterations
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('2:1', 0.5)
    );
    const result = await SurahAnalyzer.analyzeSurah(2);
    expect(result.total_verses).toBe(286);
  });

  it('should return correct surah number in result', async () => {
    const result = await SurahAnalyzer.analyzeSurah(36);
    expect(result.surah_number).toBe(36);
  });

  it('should return correct surah name for Surah 36 (يس)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(36);
    expect(result.surah_name).toBe('يس');
  });

  it('should return correct verse count for Surah 112 (الإخلاص — 4 verses)', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(result.total_verses).toBe(4);
  });
});

// ══════════════════════════════════════════════════════════════
// Resonance Statistics
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — resonance statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute correct average_resonance for uniform scores', async () => {
    // Surah 112 has 4 verses → mock 4 returns at 0.6
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.6)
    );

    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(result.average_resonance).toBeCloseTo(0.6, 5);
  });

  it('should compute correct max_resonance', async () => {
    const scores = [0.3, 0.9, 0.5, 0.7];
    let callIndex = 0;
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, scores[callIndex++ % scores.length])
    );

    const result = await SurahAnalyzer.analyzeSurah(112); // 4 verses
    expect(result.max_resonance).toBeCloseTo(0.9, 5);
  });

  it('should compute correct average_resonance from mixed scores', async () => {
    const scores = [0.4, 0.6, 0.8, 0.2];
    let callIndex = 0;
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, scores[callIndex++])
    );

    const result = await SurahAnalyzer.analyzeSurah(112); // 4 verses
    const expectedAvg = (0.4 + 0.6 + 0.8 + 0.2) / 4;
    expect(result.average_resonance).toBeCloseTo(expectedAvg, 5);
  });

  it('should return average_resonance = 0 if all discoverResonance returns null', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(null);

    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(result.average_resonance).toBe(0);
    expect(result.max_resonance).toBe(0);
  });

  it('should count high_resonance_count correctly (threshold = 0.7)', async () => {
    // Surah 103 (العصر) has 3 verses
    const scores = [0.6, 0.8, 0.75]; // 2 above threshold
    let callIndex = 0;
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, scores[callIndex++])
    );

    const result = await SurahAnalyzer.analyzeSurah(103);
    expect(result.high_resonance_count).toBe(2);
  });

  it('should set high_resonance_count = 0 when no verse exceeds threshold', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5) // below 0.7
    );

    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(result.high_resonance_count).toBe(0);
  });

  it('should count exactly at threshold (0.7) as high resonance', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.7) // exactly at threshold
    );

    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(result.high_resonance_count).toBe(4); // all 4 verses at 0.7
  });

  it('should accumulate total_h1_cycles from all verses', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5, 0.5, 3) // h1_cycles = 3
    );

    const result = await SurahAnalyzer.analyzeSurah(112); // 4 verses
    expect(result.total_h1_cycles).toBe(12); // 4 × 3
  });
});

// ══════════════════════════════════════════════════════════════
// Top Verses
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — top verses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return top 3 verses sorted by resonance descending', async () => {
    // Surah 112 has 4 verses
    const scores = [0.3, 0.9, 0.5, 0.7];
    let callIndex = 0;
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, scores[callIndex++])
    );

    const result = await SurahAnalyzer.analyzeSurah(112);

    expect(result.top_verses.length).toBe(3);
    expect(result.top_verses[0].resonance).toBeCloseTo(0.9, 5);
    expect(result.top_verses[1].resonance).toBeCloseTo(0.7, 5);
    expect(result.top_verses[2].resonance).toBeCloseTo(0.5, 5);
  });

  it('should return fewer than 3 top verses when surah has fewer verses with results', async () => {
    // Surah 108 (الكوثر) has 3 verses — all null
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(null);

    const result = await SurahAnalyzer.analyzeSurah(108);
    expect(result.top_verses.length).toBe(0);
  });

  it('should include verse, resonance and novelty in top_verses entries', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, 0.8, 0.6)
    );

    const result = await SurahAnalyzer.analyzeSurah(112); // 4 verses
    expect(result.top_verses[0]).toHaveProperty('verse');
    expect(result.top_verses[0]).toHaveProperty('resonance');
    expect(result.top_verses[0]).toHaveProperty('novelty');
    expect(typeof result.top_verses[0].verse).toBe('string');
    expect(typeof result.top_verses[0].resonance).toBe('number');
    expect(typeof result.top_verses[0].novelty).toBe('number');
  });

  it('should use correct verse format (surahNumber:ayahNumber)', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockImplementation(
      async (verse: string) => makeResonance(verse, 0.8)
    );

    const result = await SurahAnalyzer.analyzeSurah(112);
    // All verses should follow the pattern "112:N"
    for (const tv of result.top_verses) {
      expect(tv.verse).toMatch(/^112:\d+$/);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// Go Engine Integration
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — Go Engine integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should call goEngine.healthCheck when useGoEngine = true', async () => {
    vi.mocked(goEngine.healthCheck).mockResolvedValue(true);

    await SurahAnalyzer.analyzeSurah(112, true);

    expect(goEngine.healthCheck).toHaveBeenCalledOnce();
  });

  it('should NOT call goEngine.healthCheck when useGoEngine = false', async () => {
    await SurahAnalyzer.analyzeSurah(112, false);

    expect(goEngine.healthCheck).not.toHaveBeenCalled();
  });

  it('should handle Go Engine healthCheck throwing gracefully', async () => {
    vi.mocked(goEngine.healthCheck).mockRejectedValue(new Error('Connection refused'));

    const result = await SurahAnalyzer.analyzeSurah(112, true);
    // Should still return a valid result despite Go Engine failure
    expect(result).toBeDefined();
    expect(result.surah_number).toBe(112);
  });

  it('should set is_fractal = false when Go Engine is unavailable', async () => {
    vi.mocked(goEngine.healthCheck).mockResolvedValue(false);

    const result = await SurahAnalyzer.analyzeSurah(112, true);
    expect(result.is_fractal).toBe(false);
  });

  it('should set has_quran_signature = false when Go Engine is unavailable', async () => {
    vi.mocked(goEngine.healthCheck).mockResolvedValue(false);

    const result = await SurahAnalyzer.analyzeSurah(112, true);
    expect(result.has_quran_signature).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// Numerical Patterns
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — numerical patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should include numerical_patterns from NumericalValidator in result', async () => {
    vi.mocked(NumericalValidator.validate).mockReturnValue({
      score: 0.8,
      patterns: ['Pattern_7', 'Sacred_Term', 'Tesla_369'],
      isResonant: true,
    });

    const result = await SurahAnalyzer.analyzeSurah(112);

    expect(Array.isArray(result.numerical_patterns)).toBe(true);
    expect(result.numerical_patterns).toContain('Pattern_7');
    expect(result.numerical_patterns).toContain('Sacred_Term');
    expect(result.numerical_patterns).toContain('Tesla_369');
  });

  it('should call NumericalValidator.validate with surah name and context', async () => {
    await SurahAnalyzer.analyzeSurah(112);

    expect(NumericalValidator.validate).toHaveBeenCalledWith(
      'الإخلاص',
      { surah: 112, ayah: 1 }
    );
  });
});

// ══════════════════════════════════════════════════════════════
// Timestamps and Processing Time
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — timestamps and processing time', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should include processing_time_ms in result', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);

    expect(typeof result.processing_time_ms).toBe('number');
    expect(result.processing_time_ms).toBeGreaterThanOrEqual(0);
  });

  it('should include timestamp in result', async () => {
    const before = Date.now();
    const result = await SurahAnalyzer.analyzeSurah(112);
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });

  it('should include a valid numeric timestamp', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(typeof result.timestamp).toBe('number');
    expect(result.timestamp).toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════════════════════
// TrustChain Integration
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeSurah — TrustChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should call appendToTrustChain after analysis', async () => {
    await SurahAnalyzer.analyzeSurah(112);

    expect(appendToTrustChain).toHaveBeenCalledWith(
      'SURAH_ANALYZER:COMPLETE',
      'surah_112',
      expect.any(String),
      expect.any(Number)
    );
  });

  it('should pass average_resonance as the score to TrustChain', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.8)
    );

    await SurahAnalyzer.analyzeSurah(112);

    expect(appendToTrustChain).toHaveBeenCalledWith(
      'SURAH_ANALYZER:COMPLETE',
      'surah_112',
      expect.any(String),
      expect.closeTo(0.8, 4)
    );
  });
});

// ══════════════════════════════════════════════════════════════
// quickAnalyze
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.quickAnalyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should return a valid SurahAnalysisResult', async () => {
    const result = await SurahAnalyzer.quickAnalyze(112);

    expect(result).toBeDefined();
    expect(result.surah_number).toBe(112);
    expect(result.surah_name).toBe('الإخلاص');
  });

  it('should NOT call goEngine.healthCheck (useGoEngine = false)', async () => {
    await SurahAnalyzer.quickAnalyze(112);

    expect(goEngine.healthCheck).not.toHaveBeenCalled();
  });

  it('should throw on invalid surah number', async () => {
    await expect(SurahAnalyzer.quickAnalyze(0)).rejects.toThrow(
      /Invalid surah number/
    );
  });

  it('should work for boundary surah 1', async () => {
    const result = await SurahAnalyzer.quickAnalyze(1);
    expect(result.surah_number).toBe(1);
    expect(result.surah_name).toBe('الفاتحة');
  });
});

// ══════════════════════════════════════════════════════════════
// getSurahStats
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.getSurahStats', () => {
  it('should return null (not yet implemented)', async () => {
    const result = await SurahAnalyzer.getSurahStats(1);
    expect(result).toBeNull();
  });

  it('should return null for any valid surah number', async () => {
    const result1 = await SurahAnalyzer.getSurahStats(55);
    const result114 = await SurahAnalyzer.getSurahStats(114);

    expect(result1).toBeNull();
    expect(result114).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════
// analyzeAllSurahs
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer.analyzeAllSurahs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5)
    );
  });

  it('should return correct total_surahs for a small range', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.total_surahs).toBe(3); // 114 - 112 + 1
  });

  it('should return processed_surahs equal to total_surahs on success', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.processed_surahs).toBe(3);
  });

  it('should return correct total_surahs for single surah range', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 112, 10);

    expect(result.total_surahs).toBe(1);
    expect(result.processed_surahs).toBe(1);
  });

  it('should populate results array with one entry per surah', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.results).toHaveLength(3);
  });

  it('should compute overall_average_resonance as mean of surah averages', async () => {
    // All surahs will return resonance 0.6 for each verse
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.6)
    );

    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.overall_average_resonance).toBeCloseTo(0.6, 4);
  });

  it('should set overall_average_resonance = 0 when no results', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(null);

    const result = await SurahAnalyzer.analyzeAllSurahs(112, 112, 10);

    expect(result.overall_average_resonance).toBe(0);
  });

  it('should collect high_resonance_surahs when average resonance >= 0.7', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.8) // 0.8 >= 0.7
    );

    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.high_resonance_surahs).toContain(112);
    expect(result.high_resonance_surahs).toContain(113);
    expect(result.high_resonance_surahs).toContain(114);
  });

  it('should NOT add surah to high_resonance_surahs when average resonance < 0.7', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5) // 0.5 < 0.7
    );

    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.high_resonance_surahs).toHaveLength(0);
  });

  it('should accumulate total_discoveries as sum of high_resonance_count across surahs', async () => {
    // Surah 112 has 4 verses, 113 has 5, 114 has 6 — all at 0.8 (above threshold)
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.8) // all above 0.7
    );

    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    // All verses return 0.8, so all count as high resonance
    // 112: 4 verses, 113: 5 verses, 114: 6 verses = 15 total
    expect(result.total_discoveries).toBe(15);
  });

  it('should include a valid timestamp', async () => {
    const before = Date.now();
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });

  it('should include total_time_ms >= 0', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(typeof result.total_time_ms).toBe('number');
    expect(result.total_time_ms).toBeGreaterThanOrEqual(0);
  });

  it('should call appendToTrustChain with BATCH_COMPLETE event', async () => {
    await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(appendToTrustChain).toHaveBeenCalledWith(
      'SURAH_ANALYZER:BATCH_COMPLETE',
      'surahs_112_114',
      expect.any(String),
      expect.any(Number)
    );
  });

  it('should respect batchSize when processing surahs', async () => {
    // With batchSize=2, surahs 112-114 will be processed as [112,113] then [114]
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 2);

    expect(result.total_surahs).toBe(3);
    expect(result.processed_surahs).toBe(3);
  });

  it('should not include any fractal_surahs when none are fractal', async () => {
    // The current implementation always sets is_fractal = false
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.fractal_surahs).toHaveLength(0);
  });

  it('should not include any quran_signature_surahs when none have it', async () => {
    // The current implementation always sets has_quran_signature = false
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result.quran_signature_surahs).toHaveLength(0);
  });

  it('should return results with correct surah_number for each surah', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    const surahNumbers = result.results.map(r => r.surah_number);
    expect(surahNumbers).toContain(112);
    expect(surahNumbers).toContain(113);
    expect(surahNumbers).toContain(114);
  });
});

// ══════════════════════════════════════════════════════════════
// SurahAnalysisResult Interface Shape
// ══════════════════════════════════════════════════════════════

describe('SurahAnalysisResult — interface shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.5)
    );
  });

  it('should return all required fields in SurahAnalysisResult', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);

    expect(result).toHaveProperty('surah_number');
    expect(result).toHaveProperty('surah_name');
    expect(result).toHaveProperty('total_verses');
    expect(result).toHaveProperty('average_resonance');
    expect(result).toHaveProperty('max_resonance');
    expect(result).toHaveProperty('high_resonance_count');
    expect(result).toHaveProperty('total_h1_cycles');
    expect(result).toHaveProperty('is_fractal');
    expect(result).toHaveProperty('has_quran_signature');
    expect(result).toHaveProperty('numerical_patterns');
    expect(result).toHaveProperty('top_verses');
    expect(result).toHaveProperty('processing_time_ms');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return is_fractal as boolean', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(typeof result.is_fractal).toBe('boolean');
  });

  it('should return has_quran_signature as boolean', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(typeof result.has_quran_signature).toBe('boolean');
  });

  it('should return numerical_patterns as array', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(Array.isArray(result.numerical_patterns)).toBe(true);
  });

  it('should return top_verses as array', async () => {
    const result = await SurahAnalyzer.analyzeSurah(112);
    expect(Array.isArray(result.top_verses)).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// BatchAnalysisResult Interface Shape
// ══════════════════════════════════════════════════════════════

describe('BatchAnalysisResult — interface shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5)
    );
  });

  it('should return all required fields in BatchAnalysisResult', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);

    expect(result).toHaveProperty('total_surahs');
    expect(result).toHaveProperty('processed_surahs');
    expect(result).toHaveProperty('overall_average_resonance');
    expect(result).toHaveProperty('high_resonance_surahs');
    expect(result).toHaveProperty('fractal_surahs');
    expect(result).toHaveProperty('quran_signature_surahs');
    expect(result).toHaveProperty('total_discoveries');
    expect(result).toHaveProperty('results');
    expect(result).toHaveProperty('total_time_ms');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return high_resonance_surahs as array', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);
    expect(Array.isArray(result.high_resonance_surahs)).toBe(true);
  });

  it('should return fractal_surahs as array', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);
    expect(Array.isArray(result.fractal_surahs)).toBe(true);
  });

  it('should return quran_signature_surahs as array', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 114, 10);
    expect(Array.isArray(result.quran_signature_surahs)).toBe(true);
  });

  it('should return results as array of SurahAnalysisResult objects', async () => {
    const result = await SurahAnalyzer.analyzeAllSurahs(112, 112, 10);
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results[0]).toHaveProperty('surah_number');
    expect(result.results[0]).toHaveProperty('surah_name');
    expect(result.results[0]).toHaveProperty('average_resonance');
  });
});

// ══════════════════════════════════════════════════════════════
// Regression: Boundary and edge cases
// ══════════════════════════════════════════════════════════════

describe('SurahAnalyzer — regression and boundary cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('regression: analyzeAllSurahs with startSurah = endSurah should process exactly 1 surah', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5)
    );

    const result = await SurahAnalyzer.analyzeAllSurahs(1, 1, 10);

    expect(result.total_surahs).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].surah_number).toBe(1);
  });

  it('regression: analyzeSurah throws error message includes surah number', async () => {
    try {
      await SurahAnalyzer.analyzeSurah(200);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('200');
    }
  });

  it('regression: analyzeSurah returns stable surah_name for all 114 surahs', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(null);

    // Spot check a few representative surahs
    const checks: Array<[number, string]> = [
      [1, 'الفاتحة'],
      [36, 'يس'],
      [55, 'الرحمن'],
      [67, 'الملك'],
      [112, 'الإخلاص'],
      [113, 'الفلق'],
      [114, 'الناس'],
    ];

    for (const [num, name] of checks) {
      const result = await SurahAnalyzer.analyzeSurah(num);
      expect(result.surah_name).toBe(name);
    }
  });

  it('regression: surah Al-Fatiha (1) has exactly 7 verses in result', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('1:1', 0.5)
    );

    const result = await SurahAnalyzer.analyzeSurah(1);
    expect(result.total_verses).toBe(7);
  });

  it('regression: surah Al-Baqara (2) has exactly 286 verses in result', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('2:1', 0.5)
    );

    const result = await SurahAnalyzer.analyzeSurah(2);
    expect(result.total_verses).toBe(286);
  });

  it('regression: all resonance-related numbers are non-negative', async () => {
    vi.mocked(TopologicalCuriosityEngine.discoverResonance).mockResolvedValue(
      makeResonance('112:1', 0.6, 0.4, 2)
    );

    const result = await SurahAnalyzer.analyzeSurah(112);

    expect(result.average_resonance).toBeGreaterThanOrEqual(0);
    expect(result.max_resonance).toBeGreaterThanOrEqual(0);
    expect(result.high_resonance_count).toBeGreaterThanOrEqual(0);
    expect(result.total_h1_cycles).toBeGreaterThanOrEqual(0);
  });
});
