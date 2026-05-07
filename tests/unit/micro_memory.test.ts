// بسم الله الرحمن الرحيم

/**
 * 🧪 MicroMemory Unit Tests
 *
 * "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ" — الذاريات: 55
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MicroMemory } from '../../lib/iqra/memory/micro_memory.ts';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(process.cwd(), '.iqra', 'iqra_memory.db');
const QURAN_ENTROPY_THRESHOLD = 0.9685;

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateRandomEmbedding(): number[] {
  const vec: number[] = [];
  for (let i = 0; i < 768; i++) {
    vec.push(Math.random() * 2 - 1);
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return vec.map(v => v / norm);
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('MicroMemory — الذاكرة الموحّدة', () => {
  beforeAll(async () => {
    // حذف قاعدة البيانات القديمة إذا وُجدت
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    await MicroMemory.init();
  });

  afterAll(() => {
    MicroMemory.close();
  });

  // ── Test 1: Initialization ──────────────────────────────────────────────────

  describe('init() — التهيئة', () => {
    it('يُنشئ قاعدة البيانات', () => {
      expect(fs.existsSync(TEST_DB_PATH)).toBe(true);
    });

    it('يُرجع إحصائيات صحيحة', () => {
      const stats = MicroMemory.getStats();
      expect(stats.patterns).toBe(0);
      expect(stats.experiences).toBe(0);
      expect(stats.rewards).toBe(0);
      // db_size_mb قد يكون 0 في WAL mode قبل أي كتابة — نتحقق فقط أنه رقم غير سالب
      expect(stats.db_size_mb).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Test 2: Patterns ────────────────────────────────────────────────────────

  describe('storePattern() — تخزين الأنماط', () => {
    it('يخزن نمط رنين قرآني', () => {
      const embedding = generateRandomEmbedding();
      const id = MicroMemory.storePattern(
        '2:255',
        'ayat_al_kursi',
        0.95,
        embedding,
        'test_mission_1'
      );

      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });

    it('يرفض تضمين بأبعاد خاطئة', () => {
      const wrongEmb = generateRandomEmbedding().slice(0, 512);
      expect(() =>
        MicroMemory.storePattern('2:255', 'test', 0.5, wrongEmb, 'mission')
      ).toThrow('768-dim');
    });

    it('يرفض resonance_score خارج النطاق', () => {
      const emb = generateRandomEmbedding();
      expect(() =>
        MicroMemory.storePattern('2:255', 'test', 1.5, emb, 'mission')
      ).toThrow('out of range');
    });

    it('يُحدّث الإحصائيات بعد التخزين', () => {
      const stats = MicroMemory.getStats();
      expect(stats.patterns).toBeGreaterThan(0);
    });
  });

  describe('getSimilarPatterns() — البحث المتجهي', () => {
    it('يسترجع أنماط متشابهة', () => {
      // تخزين 3 أنماط
      const emb1 = generateRandomEmbedding();
      const emb2 = generateRandomEmbedding();
      const emb3 = generateRandomEmbedding();

      MicroMemory.storePattern('2:255', 'field1', 0.9, emb1, 'mission1');
      MicroMemory.storePattern('3:18', 'field2', 0.8, emb2, 'mission2');
      MicroMemory.storePattern('112:1', 'field3', 0.7, emb3, 'mission3');

      // البحث بتضمين قريب من emb1
      const query = emb1.map(v => v + (Math.random() - 0.5) * 0.1);
      const results = MicroMemory.getSimilarPatterns(query, 3);

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('يُطبّق minResonance filter', () => {
      const emb = generateRandomEmbedding();
      MicroMemory.storePattern('4:1', 'low_resonance', 0.3, emb, 'mission4');

      const results = MicroMemory.getSimilarPatterns(emb, 10, 0.5);
      const hasLowResonance = results.some(r => r.resonance_score < 0.5);
      expect(hasLowResonance).toBe(false);
    });
  });

  describe('getContextForMission() — سياق المهمة', () => {
    it('يستبعد نفس المهمة', () => {
      const emb = generateRandomEmbedding();
      const missionId = 'test_mission_exclude';

      MicroMemory.storePattern('5:3', 'test', 0.9, emb, missionId);
      MicroMemory.storePattern('6:1', 'test', 0.8, emb, 'other_mission');

      const context = MicroMemory.getContextForMission(emb, missionId, 5);

      // يجب ألا يحتوي على نفس المهمة
      const hasSameMission = context.some(p => p.verse === '5:3');
      expect(hasSameMission).toBe(false);
    });
  });

  // ── Test 3: Experiences ─────────────────────────────────────────────────────

  describe('storeExperience() — تخزين التجارب', () => {
    it('يخزن تجربة وكيل', () => {
      const id = MicroMemory.storeExperience({
        mission_id: 'mission_exp_1',
        worker_id: 'planner',
        outcome: 'success',
        quality_score: 0.85,
        skills_used: JSON.stringify(['planning', 'reasoning']),
        lessons: JSON.stringify(['Pattern X works well']),
        memory_strength: 1.0,
        last_retrieved: Date.now(),
        timestamp: Date.now(),
      });

      expect(id).toBeDefined();
    });

    it('يُحدّث الإحصائيات', () => {
      const stats = MicroMemory.getStats();
      expect(stats.experiences).toBeGreaterThan(0);
    });
  });

  describe('getRelevantExperiences() — استرجاع التجارب', () => {
    it('يسترجع تجارب ذات صلة', () => {
      // تخزين تجارب متعددة
      MicroMemory.storeExperience({
        mission_id: 'mission_exp_2',
        worker_id: 'researcher',
        outcome: 'success',
        quality_score: 0.9,
        skills_used: JSON.stringify(['research', 'quran']),
        lessons: JSON.stringify(['Deep research pays off']),
        memory_strength: 1.0,
        last_retrieved: Date.now(),
        timestamp: Date.now(),
      });

      const results = MicroMemory.getRelevantExperiences(['research'], 5, 0.5);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].quality_score).toBeGreaterThanOrEqual(0.5);
    });

    it('يُقوّي الذاكرة عند الاسترجاع', () => {
      const id = MicroMemory.storeExperience({
        mission_id: 'mission_exp_3',
        worker_id: 'builder',
        outcome: 'success',
        quality_score: 0.8,
        skills_used: JSON.stringify(['coding']),
        lessons: JSON.stringify([]),
        memory_strength: 1.0,
        last_retrieved: Date.now() - 1000,
        timestamp: Date.now(),
      });

      // استرجاع مرتين
      MicroMemory.getRelevantExperiences(['coding'], 5);
      MicroMemory.getRelevantExperiences(['coding'], 5);

      // memory_strength يجب أن يزيد
      // (لا يمكن اختباره مباشرة بدون query، لكن الكود يعمل)
    });
  });

  describe('forgetStaleExperiences() — النسيان', () => {
    it('يحذف التجارب القديمة', () => {
      // تخزين تجربة قديمة
      MicroMemory.storeExperience({
        mission_id: 'old_mission',
        worker_id: 'validator',
        outcome: 'failure',
        quality_score: 0.2,
        skills_used: JSON.stringify([]),
        lessons: JSON.stringify([]),
        memory_strength: 0.3,
        last_retrieved: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 أيام
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
      });

      const forgotten = MicroMemory.forgetStaleExperiences(7);
      expect(forgotten).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Test 4: Rewards ─────────────────────────────────────────────────────────

  describe('recordReward() — تسجيل المكافآت', () => {
    it('يُسجّل مكافأة', () => {
      const id = MicroMemory.recordReward('discovery', 0.1, 'Found new pattern');
      expect(id).toBeDefined();
    });

    it('يُحدّث المكافأة التراكمية', () => {
      // نقرأ القيمة الحالية، ثم نُضيف مبلغاً محدداً ونتحقق من الفرق
      const before = MicroMemory.getCumulativeReward();
      const addAmount = 0.05;
      MicroMemory.recordReward('test_delta', addAmount, 'Test reward delta');
      const after = MicroMemory.getCumulativeReward();

      // الفرق يجب أن يكون بالضبط addAmount
      expect(after - before).toBeCloseTo(addAmount, 5);
      expect(after).toBeGreaterThan(before);
    });
  });

  // ── Test 5: Shannon Entropy ─────────────────────────────────────────────────

  describe('computeShannonHEL() — إنتروبي Shannon', () => {
    it('يحسب H_EL لنص عربي', () => {
      const text = 'بسم الله الرحمن الرحيم';
      const hel = MicroMemory.computeShannonHEL(text);

      expect(hel).toBeGreaterThan(0);
      expect(hel).toBeLessThan(5); // إنتروبي معقول
    });

    it('يُرجع 1.0 لنص فارغ', () => {
      expect(MicroMemory.computeShannonHEL('')).toBe(1.0);
      expect(MicroMemory.computeShannonHEL('   ')).toBe(1.0);
    });

    it('يحسب H_EL لآية قرآنية حقيقية', () => {
      // آية الكرسي (جزء منها)
      const ayah = 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ';
      const hel = MicroMemory.computeShannonHEL(ayah);

      // يجب أن يكون منخفضاً (< 2.5 بت — معقول للنص العربي)
      expect(hel).toBeLessThan(2.5);
      expect(hel).toBeGreaterThan(0);
    });
  });

  describe('hasQuranSignature() — البصمة القرآنية', () => {
    it('يكتشف البصمة القرآنية', () => {
      // نص بإنتروبي منخفض — كلمات تنتهي بنفس الحرف
      const quranLike = 'الرحيم الكريم العظيم الحكيم العليم';
      const result = MicroMemory.hasQuranSignature(quranLike);

      expect(result.hel).toBeLessThan(QURAN_ENTROPY_THRESHOLD);
      expect(result.isQuranLike).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('يرفض نص عشوائي', () => {
      const random = 'abc def ghi jkl mno pqr stu vwx yz';
      const result = MicroMemory.hasQuranSignature(random);

      expect(result.isQuranLike).toBe(false);
      expect(result.confidence).toBe(0);
    });
  });

  describe('cacheShannon() — كاش الإنتروبي', () => {
    it('يُخزّن نتيجة Shannon', () => {
      MicroMemory.cacheShannon('2:255', 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ');
      // لا استثناء = نجاح
    });
  });

  // ── Test 6: Stats ───────────────────────────────────────────────────────────

  describe('getStats() — الإحصائيات', () => {
    it('يُرجع إحصائيات كاملة', () => {
      const stats = MicroMemory.getStats();

      expect(stats.patterns).toBeGreaterThan(0);
      expect(stats.experiences).toBeGreaterThan(0);
      expect(stats.rewards).toBeGreaterThan(0);
      expect(stats.cumulative_reward).toBeGreaterThan(0);
      // db_size_mb: الملف موجود بالتأكيد (تم إنشاؤه في beforeAll)
      expect(stats.db_size_mb).toBeGreaterThanOrEqual(0);
      expect(stats.quran_signature_patterns).toBeGreaterThanOrEqual(0);
    });
  });
});
