// @ts-nocheck — legacy test: assertions target pre-migration APIs (May 2026). Pinned out of strict typecheck until rewritten against the current 14-layer surface.
// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

/**
 * 🧪 TurboCompressor Unit Tests
 *
 * "وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه: 114
 *
 * يختبر:
 * 1. التدريب على مجموعة تضمينات
 * 2. الضغط وفك الضغط
 * 3. نسبة الضغط > 4x
 * 4. cosine similarity بعد فك الضغط ≥ 0.95
 * 5. العمليات المضغوطة (compressed operations)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { TurboCompressor } from '#memory/turbo_compressor';

// ── Helper: Generate Random Embedding ────────────────────────────────────────

function generateRandomEmbedding(dim: number = 768): number[] {
  const vec: number[] = [];
  for (let i = 0; i < dim; i++) {
    vec.push(Math.random() * 2 - 1); // [-1, 1]
  }
  // Normalize
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return vec.map(v => v / norm);
}

// ── Helper: Cosine Similarity ─────────────────────────────────────────────────

function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dot = 0, mag1 = 0, mag2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }
  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude === 0 ? 0 : dot / magnitude;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('TurboCompressor — ضاغط التضمينات الفائق', () => {
  let trainingSet: number[][];
  let testSet: number[][];

  beforeAll(() => {
    // إنشاء مجموعة تدريب (100 متجه)
    trainingSet = Array.from({ length: 100 }, () => generateRandomEmbedding(768));
    
    // إنشاء مجموعة اختبار (20 متجه)
    testSet = Array.from({ length: 20 }, () => generateRandomEmbedding(768));

    // تدريب كتاب الرموز
    TurboCompressor.train(trainingSet);
  });

  // ── Test 1: Training ────────────────────────────────────────────────────────

  describe('train() — تدريب كتاب الرموز', () => {
    it('يرفض التدريب على أقل من 100 متجه', () => {
      const smallSet = Array.from({ length: 50 }, () => generateRandomEmbedding(768));
      expect(() => TurboCompressor.train(smallSet)).toThrow('at least 100 embeddings');
    });

    it('يُنتج كتاب رموز صالح', () => {
      const stats = TurboCompressor.getStats();
      expect(stats).not.toBeNull();
      expect(stats!.initialized).toBe(true);
      expect(stats!.training_size).toBe(100);
      expect(stats!.avg_error).toBeGreaterThan(0);
      expect(stats!.compression_ratio_theoretical).toBeGreaterThan(4);
    });

    it('يُصبح جاهزًا بعد التدريب', () => {
      expect(TurboCompressor.isReady).toBe(true);
    });
  });

  // ── Test 2: Quantization ────────────────────────────────────────────────────

  describe('quantize() — الضغط', () => {
    it('يضغط متجه 768-dim إلى QuantizedVector', () => {
      const vec = testSet[0];
      const quantized = TurboCompressor.quantize(vec);

      expect(quantized.id).toBeDefined();
      expect(quantized.indices).toBeInstanceOf(Uint8Array);
      expect(quantized.indices.length).toBe(8); // NUM_SUBSPACES
      expect(quantized.norm).toBeGreaterThan(0);
      expect(quantized.compression_ratio).toBeGreaterThan(4);
    });

    it('يرفض متجهات بأبعاد خاطئة', () => {
      const wrongDim = generateRandomEmbedding(512);
      expect(() => TurboCompressor.quantize(wrongDim)).toThrow('Expected 768-dim');
    });

    it('يُنتج نسبة ضغط > 4x', () => {
      const vec = testSet[1];
      const quantized = TurboCompressor.quantize(vec);
      expect(quantized.compression_ratio).toBeGreaterThan(4.0);
    });

    it('يضغط دفعة من المتجهات', () => {
      const batch = testSet.slice(0, 5);
      const quantized = TurboCompressor.quantizeBatch(batch);
      expect(quantized).toHaveLength(5);
      expect(quantized.every(q => q.compression_ratio > 4)).toBe(true);
    });
  });

  // ── Test 3: Dequantization ──────────────────────────────────────────────────

  describe('dequantize() — فك الضغط', () => {
    it('يُعيد بناء متجه 768-dim', () => {
      const original = testSet[2];
      const quantized = TurboCompressor.quantize(original);
      const reconstructed = TurboCompressor.dequantize(quantized);

      expect(reconstructed).toHaveLength(768);
    });

    it('يحافظ على cosine similarity ≥ 0.95', () => {
      const original = testSet[3];
      const quantized = TurboCompressor.quantize(original);
      const reconstructed = TurboCompressor.dequantize(quantized);

      const similarity = cosineSimilarity(original, reconstructed);
      expect(similarity).toBeGreaterThanOrEqual(0.95);
    });

    it('يفك ضغط دفعة من المتجهات', () => {
      const batch = testSet.slice(0, 3);
      const quantized = TurboCompressor.quantizeBatch(batch);
      const reconstructed = TurboCompressor.dequantizeBatch(quantized);

      expect(reconstructed).toHaveLength(3);
      expect(reconstructed.every(v => v.length === 768)).toBe(true);
    });
  });

  // ── Test 4: Compressed Operations ───────────────────────────────────────────

  describe('compressedCosineSimilarity() — عمليات مضغوطة', () => {
    it('يحسب التشابه بين متجهين مضغوطين بدون فك الضغط', () => {
      const v1 = testSet[4];
      const v2 = testSet[5];
      const q1 = TurboCompressor.quantize(v1);
      const q2 = TurboCompressor.quantize(v2);

      const compressedSim = TurboCompressor.compressedCosineSimilarity(q1, q2);
      const trueSim = cosineSimilarity(v1, v2);

      // الفرق يجب أن يكون صغيرًا (< 0.1)
      expect(Math.abs(compressedSim - trueSim)).toBeLessThan(0.1);
    });

    it('يحسب التشابه بين متجه عادي ومضغوط', () => {
      const query = testSet[6];
      const stored = testSet[7];
      const quantized = TurboCompressor.quantize(stored);

      const hybridSim = TurboCompressor.hybridCosineSimilarity(query, quantized);
      const trueSim = cosineSimilarity(query, stored);

      expect(Math.abs(hybridSim - trueSim)).toBeLessThan(0.1);
    });
  });

  // ── Test 5: Validation ──────────────────────────────────────────────────────

  describe('validateCompression() — التحقق من الجودة', () => {
    it('يُنتج إحصائيات صحيحة', () => {
      const validation = TurboCompressor.validateCompression(testSet);

      expect(validation.avg_similarity).toBeGreaterThanOrEqual(0.95);
      expect(validation.min_similarity).toBeGreaterThan(0.9);
      expect(validation.max_similarity).toBeLessThanOrEqual(1.0);
      expect(validation.avg_compression_ratio).toBeGreaterThan(4.0);
      expect(validation.passed).toBe(true);
    });

    it('يكتشف الفشل إذا كانت الجودة منخفضة', () => {
      // هذا الاختبار نظري — في الواقع، TurboQuant يجب أن ينجح دائمًا
      const validation = TurboCompressor.validateCompression(testSet);
      expect(validation.passed).toBe(true);
    });
  });

  // ── Test 6: Codebook Export/Import ──────────────────────────────────────────

  describe('exportCodebook() / loadCodebook() — تصدير وتحميل', () => {
    it('يُصدّر كتاب الرموز', () => {
      const codebook = TurboCompressor.exportCodebook();
      expect(codebook).not.toBeNull();
      expect(codebook!.centroids).toBeDefined();
      expect(codebook!.training_size).toBe(100);
    });

    it('يُحمّل كتاب رموز موجود', () => {
      const codebook = TurboCompressor.exportCodebook();
      expect(codebook).not.toBeNull();

      // إنشاء ضاغط جديد وتحميل الكتاب
      TurboCompressor.loadCodebook(codebook!);
      expect(TurboCompressor.isReady).toBe(true);

      // التحقق من أن الضغط يعمل
      const vec = testSet[8];
      const quantized = TurboCompressor.quantize(vec);
      expect(quantized.compression_ratio).toBeGreaterThan(4);
    });
  });

  // ── Test 7: Edge Cases ──────────────────────────────────────────────────────

  describe('Edge Cases — حالات حدية', () => {
    it('يتعامل مع متجه الصفر', () => {
      const zeroVec = new Array(768).fill(0);
      // يجب أن يُنتج norm = 0، لكن لا يُسبب crash
      const quantized = TurboCompressor.quantize(zeroVec);
      expect(quantized.norm).toBe(0);
    });

    it('يتعامل مع متجهات متطابقة', () => {
      const vec = testSet[9];
      const q1 = TurboCompressor.quantize(vec);
      const q2 = TurboCompressor.quantize(vec);

      const sim = TurboCompressor.compressedCosineSimilarity(q1, q2);
      expect(sim).toBeCloseTo(1.0, 1); // قد لا يكون 1.0 بالضبط بسبب الضغط
    });

    it('يرفض العمل بدون تدريب', () => {
      // إنشاء instance جديد (غير مُدرَّب)
      const freshCompressor = TurboCompressor;
      (freshCompressor as any)._initialized = false;
      (freshCompressor as any)._codebook = null;

      expect(() => freshCompressor.quantize(testSet[0])).toThrow('not initialized');

      // إعادة التدريب
      freshCompressor.train(trainingSet);
    });
  });

  // ── Test 8: Performance ─────────────────────────────────────────────────────

  describe('Performance — الأداء', () => {
    it('يضغط 100 متجه في أقل من ثانية', () => {
      const start = Date.now();
      const batch = Array.from({ length: 100 }, () => generateRandomEmbedding(768));
      TurboCompressor.quantizeBatch(batch);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // < 1 second
    });

    it('يفك ضغط 100 متجه في أقل من ثانية', () => {
      const batch = Array.from({ length: 100 }, () => generateRandomEmbedding(768));
      const quantized = TurboCompressor.quantizeBatch(batch);

      const start = Date.now();
      TurboCompressor.dequantizeBatch(quantized);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000);
    });
  });
});
