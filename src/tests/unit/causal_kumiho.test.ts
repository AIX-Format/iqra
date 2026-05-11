// بسم الله الرحمن الرحيم

/**
 * 🧪 Causal Graph + Kumiho Versioning Tests
 *
 * "وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ" — يس: 12
 *
 * Causal Graph (MAGMA arXiv:2601.03236):
 *   يُجيب "لماذا؟" — السلسلة السببية للاكتشافات
 *
 * Kumiho (arXiv:2603.17244):
 *   نظام نسخ — كل فكرة تتطور ولا تُحذف
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MicroMemory } from '#memory/micro_memory';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(process.cwd(), '.iqra', 'iqra_memory.db');

beforeAll(async () => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  await MicroMemory.init();
});

afterAll(() => { MicroMemory.close(); });

// ── Causal Graph Tests ────────────────────────────────────────────────────────

describe('Causal Graph — الرسم السببي (MAGMA)', () => {

  describe('recordCausalEdge() — تسجيل علاقة سببية', () => {
    it('يُسجّل علاقة سببية بسيطة', () => {
      const id = MicroMemory.recordCausalEdge({
        cause_id: 'pattern_nur_001',
        cause_type: 'pattern',
        effect_id: 'discovery_laser_001',
        effect_type: 'discovery',
        relation: 'led_to',
        strength: 0.87,
        explanation: 'تحليل آية النور أدى لاكتشاف رنين مع فيزياء الليزر',
      });

      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(10);
    });

    it('يُسجّل سلسلة سببية متعددة', () => {
      // سبب ١ → نتيجة ١ → نتيجة ٢
      MicroMemory.recordCausalEdge({
        cause_id: 'exp_001',
        cause_type: 'experience',
        effect_id: 'pattern_001',
        effect_type: 'pattern',
        relation: 'enabled',
        strength: 0.75,
        explanation: 'تجربة البحث مكّنت من اكتشاف النمط',
      });

      MicroMemory.recordCausalEdge({
        cause_id: 'pattern_001',
        cause_type: 'pattern',
        effect_id: 'skill_001',
        effect_type: 'skill',
        relation: 'inspired',
        strength: 0.65,
        explanation: 'النمط ألهم بناء مهارة جديدة',
      });
    });

    it('يدعم كل أنواع العلاقات', () => {
      const relations = ['led_to', 'enabled', 'contradicted', 'extended', 'inspired'] as const;
      for (const relation of relations) {
        const id = MicroMemory.recordCausalEdge({
          cause_id: `cause_${relation}`,
          cause_type: 'pattern',
          effect_id: `effect_${relation}`,
          effect_type: 'discovery',
          relation,
          strength: 0.5,
          explanation: `علاقة ${relation}`,
        });
        expect(id).toBeDefined();
      }
    });
  });

  describe('getCausalChain() — السلسلة السببية', () => {
    it('يسترجع السلسلة السببية للخلف', () => {
      // بناء سلسلة: A → B → C
      MicroMemory.recordCausalEdge({
        cause_id: 'chain_A',
        cause_type: 'experience',
        effect_id: 'chain_B',
        effect_type: 'pattern',
        relation: 'led_to',
        strength: 0.9,
        explanation: 'A أدى لـ B',
      });

      MicroMemory.recordCausalEdge({
        cause_id: 'chain_B',
        cause_type: 'pattern',
        effect_id: 'chain_C',
        effect_type: 'discovery',
        relation: 'led_to',
        strength: 0.8,
        explanation: 'B أدى لـ C',
      });

      const chain = MicroMemory.getCausalChain('chain_C', 5);
      expect(chain.length).toBeGreaterThan(0);
      // يجب أن يجد على الأقل B → C
      const hasBC = chain.some(e => e.cause_id === 'chain_B' && e.effect_id === 'chain_C');
      expect(hasBC).toBe(true);
    });

    it('يحترم maxDepth', () => {
      const chain = MicroMemory.getCausalChain('chain_C', 1);
      expect(chain.length).toBeLessThanOrEqual(7);
    });
  });

  describe('getCausalEffects() — النتائج السببية', () => {
    it('يسترجع كل ما أنتجه حدث معين', () => {
      MicroMemory.recordCausalEdge({
        cause_id: 'root_cause',
        cause_type: 'pattern',
        effect_id: 'effect_1',
        effect_type: 'discovery',
        relation: 'led_to',
        strength: 0.9,
        explanation: 'أدى لاكتشاف ١',
      });

      MicroMemory.recordCausalEdge({
        cause_id: 'root_cause',
        cause_type: 'pattern',
        effect_id: 'effect_2',
        effect_type: 'skill',
        relation: 'inspired',
        strength: 0.7,
        explanation: 'ألهم مهارة ٢',
      });

      const effects = MicroMemory.getCausalEffects('root_cause');
      expect(effects.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ── Kumiho Versioning Tests ───────────────────────────────────────────────────

describe('Kumiho Versioning — نظام النسخ', () => {

  describe('recordKnowledgeVersion() — تسجيل نسخة', () => {
    it('يُسجّل النسخة الأولى', () => {
      const id = MicroMemory.recordKnowledgeVersion(
        'knowledge_nur',
        'interpretation',
        'آية النور تصف نوراً حسياً فقط',
        'الفهم الأولي',
        'IQRA_v1'
      );

      expect(id).toBeDefined();
    });

    it('يُسجّل نسخة ثانية محسّنة', () => {
      MicroMemory.recordKnowledgeVersion(
        'knowledge_nur',
        'interpretation',
        'آية النور تصف نوراً حسياً ومعنوياً — رنين مع فيزياء الضوء',
        'اكتشاف الرنين العلمي',
        'IQRA_v2'
      );
    });

    it('يُسجّل نسخة ثالثة أعمق', () => {
      MicroMemory.recordKnowledgeVersion(
        'knowledge_nur',
        'interpretation',
        'آية النور: تجويف رنين دلالي يشبه الليزر — بُعد فركتالي عالٍ',
        'اكتشاف التشابه مع تجويف الرنين الليزري',
        'IQRA_v3'
      );
    });
  });

  describe('getKnowledgeHistory() — تاريخ التطور', () => {
    it('يسترجع كل النسخ بالترتيب', () => {
      const history = MicroMemory.getKnowledgeHistory('knowledge_nur');

      expect(history.length).toBe(3);
      expect(history[0].version).toBe(1);
      expect(history[1].version).toBe(2);
      expect(history[2].version).toBe(3);
    });

    it('كل نسخة تحتوي على parent_version_id صحيح', () => {
      const history = MicroMemory.getKnowledgeHistory('knowledge_nur');

      expect(history[0].parent_version_id).toBeNull(); // الأولى لا أب لها
      expect(history[1].parent_version_id).toBe(history[0].id);
      expect(history[2].parent_version_id).toBe(history[1].id);
    });

    it('المحتوى يتطور عبر النسخ', () => {
      const history = MicroMemory.getKnowledgeHistory('knowledge_nur');
      expect(history[0].content).not.toBe(history[2].content);
    });
  });

  describe('getLatestVersion() — أحدث نسخة', () => {
    it('يُرجع النسخة الأحدث', () => {
      const latest = MicroMemory.getLatestVersion('knowledge_nur');

      expect(latest).not.toBeNull();
      expect(latest!.version).toBe(3);
      expect(latest!.content).toContain('ليزر');
    });

    it('يُرجع null لمعرفة غير موجودة', () => {
      const result = MicroMemory.getLatestVersion('nonexistent_knowledge');
      expect(result).toBeNull();
    });
  });

  describe('compareVersions() — مقارنة النسخ', () => {
    it('يُقارن نسختين ويكشف التطور', () => {
      const comparison = MicroMemory.compareVersions('knowledge_nur', 1, 3);

      expect(comparison.v1).not.toBeNull();
      expect(comparison.v2).not.toBeNull();
      expect(comparison.evolved).toBe(true);
      expect(comparison.v1!.content).not.toBe(comparison.v2!.content);
    });

    it('يكشف عدم التطور للنسخ المتطابقة', () => {
      // نسخة متطابقة
      MicroMemory.recordKnowledgeVersion(
        'stable_knowledge',
        'pattern',
        'محتوى ثابت',
        'لا تغيير',
      );
      MicroMemory.recordKnowledgeVersion(
        'stable_knowledge',
        'pattern',
        'محتوى ثابت',
        'نفس المحتوى',
      );

      const comparison = MicroMemory.compareVersions('stable_knowledge', 1, 2);
      expect(comparison.evolved).toBe(false);
    });
  });

  describe('تكامل Causal + Kumiho', () => {
    it('يربط تطور المعرفة بسببه', () => {
      // تسجيل سبب التطور
      const causeId = 'discovery_laser_resonance';
      MicroMemory.recordCausalEdge({
        cause_id: causeId,
        cause_type: 'discovery',
        effect_id: 'knowledge_nur',
        effect_type: 'pattern',
        relation: 'extended',
        strength: 0.92,
        explanation: 'اكتشاف رنين الليزر وسّع فهم آية النور',
      });

      // التحقق من الرابط
      const effects = MicroMemory.getCausalEffects(causeId);
      expect(effects.some(e => e.effect_id === 'knowledge_nur')).toBe(true);

      // التحقق من تطور المعرفة
      const latest = MicroMemory.getLatestVersion('knowledge_nur');
      expect(latest!.version).toBeGreaterThan(1);
    });
  });
});
