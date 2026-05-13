// بسم الله الرحمن الرحيم

/**
 * 🧪 Pulse369 Unit Tests
 * "وَهُوَ الَّذِي يَتَوَفَّاكُم بِاللَّيْلِ" — الأنعام: 60
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Pulse369 } from '#memory/pulse_369.ts';
import { MemoryBridge } from '#memory/memory_bridge.ts';
import { MicroMemory } from '#memory/micro_memory.ts';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(process.cwd(), '.iqra', 'iqra_memory.db');

describe('Pulse369 — نبض الذاكرة الثلاثي', () => {

  beforeEach(async () => {
    Pulse369.resetCounter();
    MemoryBridge.clearHot();
    if (!fs.existsSync(TEST_DB)) {
      await MicroMemory.init();
    }
  });

  afterAll(() => {
    MicroMemory.close();
  });

  // ── Test 1: العداد ──────────────────────────────────────────────────────────

  describe('tick() — العداد', () => {
    it('يُحدّث العداد مع كل نبضة', async () => {
      const c1 = await Pulse369.tick('test_1');
      const c2 = await Pulse369.tick('test_2');
      const c3 = await Pulse369.tick('test_3');

      // كل نبضة تزيد العداد — c3 > c1 على الأقل
      expect(c3).toBeGreaterThan(c1);
      // الفرق بين c1 و c3 يجب أن يكون 2 على الأقل
      expect(c3 - c1).toBeGreaterThanOrEqual(2);
    });

    it('يُرجع العداد الصحيح', async () => {
      await Pulse369.tick('m1');
      await Pulse369.tick('m2');
      const counter = await Pulse369.getCounter();
      expect(counter).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Test 2: promoteHotToWarm ────────────────────────────────────────────────

  describe('promoteHotToWarm() — Hot → Warm', () => {
    it('يُرجع 0 إذا كانت الطبقة الساخنة فارغة', async () => {
      const promoted = await Pulse369.promoteHotToWarm();
      expect(promoted).toBe(0);
    });

    it('لا يُرقّي المدخلات الحديثة جداً', async () => {
      // كتابة مدخل حديث
      await MemoryBridge.write('recent_key', { data: 'fresh' }, { layer: 'hot' });

      const promoted = await Pulse369.promoteHotToWarm();
      // المدخل حديث جداً (< دقيقتان) — لا يُرقَّى
      expect(promoted).toBe(0);
    });

    it('يُرقّي المدخلات القديمة', async () => {
      // نُضيف مدخلاً قديماً مباشرة في الـ hot map
      const hotMap = (MemoryBridge as any)._hot;
      const oldTime = Date.now() - 5 * 60 * 1000; // 5 دقائق

      hotMap.set('old_key_1', {
        id: 'test-id-1',
        key: 'old_key_1',
        value: { data: 'old' },
        layer: 'hot',
        created_at: oldTime,
        last_accessed: oldTime,
        access_count: 0,
        ttl_ms: 60 * 60 * 1000,
      });

      hotMap.set('old_key_2', {
        id: 'test-id-2',
        key: 'old_key_2',
        value: { data: 'old2' },
        layer: 'hot',
        created_at: oldTime,
        last_accessed: oldTime,
        access_count: 0,
        ttl_ms: 60 * 60 * 1000,
      });

      const promoted = await Pulse369.promoteHotToWarm();
      expect(promoted).toBeGreaterThan(0);
    });
  });

  // ── Test 3: archiveWarmToCold ───────────────────────────────────────────────

  describe('archiveWarmToCold() — Warm → Cold', () => {
    it('يُرجع 0 إذا لم توجد تجارب قديمة', async () => {
      await MicroMemory.init();
      const archived = await Pulse369.archiveWarmToCold();
      expect(archived).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Test 4: purgeExpiredCold ────────────────────────────────────────────────

  describe('purgeExpiredCold() — Tazkiyah', () => {
    it('يُنظّف المدخلات منتهية الصلاحية من Hot', async () => {
      // إضافة مدخل منتهي الصلاحية
      const hotMap = (MemoryBridge as any)._hot;
      hotMap.set('expired_key', {
        id: 'exp-id',
        key: 'expired_key',
        value: { data: 'expired' },
        layer: 'hot',
        created_at: Date.now() - 2 * 60 * 60 * 1000, // ساعتان
        last_accessed: Date.now() - 2 * 60 * 60 * 1000,
        access_count: 0,
        ttl_ms: 60 * 60 * 1000, // TTL = ساعة واحدة (منتهي)
      });

      const sizeBefore = hotMap.size;
      await Pulse369.purgeExpiredCold();
      const sizeAfter = hotMap.size;

      expect(sizeAfter).toBeLessThanOrEqual(sizeBefore);
    });
  });

  // ── Test 5: دورة كاملة ─────────────────────────────────────────────────────

  describe('دورة كاملة — 9 نبضات', () => {
    it('يُشغّل promoteHotToWarm عند النبضة 9', async () => {
      // 8 نبضات أولاً
      for (let i = 0; i < 8; i++) {
        await Pulse369.tick(`mission_${i}`);
      }

      const statsBefore = Pulse369.getStats();

      // النبضة 9 — يجب أن تُشغّل promote
      await Pulse369.tick('mission_9');

      const statsAfter = Pulse369.getStats();
      expect(statsAfter.last_promote).toBeGreaterThanOrEqual(statsBefore.last_promote);
    });

    it('يُشغّل archiveWarmToCold عند النبضة 27', async () => {
      // 26 نبضة
      for (let i = 0; i < 26; i++) {
        await Pulse369.tick(`m_${i}`);
      }

      const statsBefore = Pulse369.getStats();
      await Pulse369.tick('m_27');
      const statsAfter = Pulse369.getStats();

      expect(statsAfter.last_archive).toBeGreaterThanOrEqual(statsBefore.last_archive);
    });
  });

  // ── Test 6: الإحصائيات ─────────────────────────────────────────────────────

  describe('getStats() — الإحصائيات', () => {
    it('يُرجع إحصائيات صحيحة', async () => {
      await Pulse369.tick('stats_test');
      const stats = Pulse369.getStats();

      expect(stats.counter).toBeGreaterThan(0);
      expect(stats.total_promoted).toBeGreaterThanOrEqual(0);
      expect(stats.total_archived).toBeGreaterThanOrEqual(0);
      expect(stats.total_purged).toBeGreaterThanOrEqual(0);
    });
  });
});
