// بسم الله الرحمن الرحيم

/**
 * 🧪 MemoryTopology Tests
 * "وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ" — يس: 12
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MemoryTopology, type TopologicalPattern } from '#memory/memory_topology';
import { MicroMemory } from '#memory/micro_memory';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(process.cwd(), '.iqra', 'iqra_memory.db');

beforeAll(async () => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  await MicroMemory.init();
});

afterAll(() => { MicroMemory.close(); });

describe('MemoryTopology — الذاكرة الطوبولوجية', () => {

  // ── Working Memory ──────────────────────────────────────────────────────────

  describe('① Working Memory — RAM', () => {
    it('يكتب ويقرأ من Working Memory', async () => {
      await MemoryTopology.write('working', 'test_key', { data: 'test' });
      const result = await MemoryTopology.read<any>('working', 'test_key');
      expect(result).not.toBeNull();
      expect(result.data).toBe('test');
    });

    it('يُرجع null لمفتاح غير موجود', async () => {
      const result = await MemoryTopology.read('working', 'nonexistent');
      expect(result).toBeNull();
    });

    it('Working Memory مؤقتة — تختفي بعد TTL', async () => {
      MemoryTopology.working.set('temp', 'value', 1); // 1ms TTL
      await new Promise(r => setTimeout(r, 10));
      expect(MemoryTopology.working.get('temp')).toBeNull();
    });
  });

  // ── Topological Pattern ─────────────────────────────────────────────────────

  describe('⑤ Topological Pattern Storage', () => {
    it('يُخزّن نمطاً طوبولوجياً', async () => {
      const pattern: TopologicalPattern = {
        verse_ref: '24:35',
        pattern_type: 'semantic',
        description: 'آية النور تشبه تجويف الرنين الليزري',
        strength: 0.87,
        related_verses: ['57:28', '2:255'],
        shannon_hel: 0.82,
        discovery_level: 'resonance',
      };

      const key = await MemoryTopology.storePattern(pattern);
      expect(key).toContain('24:35');
      expect(key).toContain('semantic');
    });

    it('النمط يُخزَّن في Working Memory للوصول السريع', async () => {
      const pattern: TopologicalPattern = {
        verse_ref: '112:1',
        pattern_type: 'numerical',
        description: 'سورة الإخلاص — إنتروبي منخفض',
        strength: 0.92,
        related_verses: ['2:255'],
        shannon_hel: 0.72,
        discovery_level: 'resonance',
      };

      await MemoryTopology.storePattern(pattern);

      // يجب أن يكون في Working Memory
      const cached = MemoryTopology.working.get<TopologicalPattern>(
        `pattern:112:1:numerical`
      );
      expect(cached).not.toBeNull();
      expect(cached!.strength).toBe(0.92);
    });
  });

  // ── Multi-Layer Search ──────────────────────────────────────────────────────

  describe('🔍 Multi-Layer Search', () => {
    it('يبحث في Working Memory', async () => {
      MemoryTopology.working.set('search_test', { content: 'آية النور' });

      const results = await MemoryTopology.search({
        text: 'search_test',
        type: 'working',
        topK: 5,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it('يبحث في كل الطبقات (all)', async () => {
      const results = await MemoryTopology.search({
        text: 'نور',
        type: 'all',
        topK: 7,
        min_relevance: 0.0,
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ── Stats ───────────────────────────────────────────────────────────────────

  describe('📊 Stats', () => {
    it('يُرجع إحصائيات صحيحة', async () => {
      const stats = await MemoryTopology.getStats();

      expect(typeof stats.working).toBe('number');
      expect(typeof stats.semantic).toBe('number');
      expect(typeof stats.episodic).toBe('number');
      expect(stats.bridge).toBeDefined();
    });
  });

  // ── 7 Memory Types ──────────────────────────────────────────────────────────

  describe('7 أنواع الذاكرة', () => {
    it('كل نوع يكتب بدون خطأ', async () => {
      const types = ['working', 'semantic', 'episodic', 'topological', 'graph', 'quantum'] as const;

      for (const type of types) {
        await expect(
          MemoryTopology.write(type, `test_${type}`, { test: true })
        ).resolves.not.toThrow();
      }
    });
  });
});
