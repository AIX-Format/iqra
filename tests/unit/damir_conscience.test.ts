// بسم الله الرحمن الرحيم

/**
 * 🧪 DamirConscience Unit Tests — اختبارات الضمير النانوي
 *
 * "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DamirConscience, type Resource, type Action } from '../../lib/iqra/damir_conscience.ts';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeResource(
  type: Resource['type'] = 'knowledge',
  source: Resource['source'] = 'real'
): Resource {
  return {
    id: crypto.randomUUID(),
    type,
    consumed: false,
    source,
    created_at: Date.now(),
  };
}

function makeAction(
  intention: string,
  resources: Resource[] = [],
  produced: Resource[] = []
): Action {
  return {
    id: crypto.randomUUID(),
    intention,
    requiredResources: resources,
    producedResources: produced,
    agent_id: 'test_agent',
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DamirConscience — الضمير النانوي', () => {
  let damir: DamirConscience;

  beforeEach(() => {
    damir = new DamirConscience();
  });

  // ── Test 1: النية ──────────────────────────────────────────────────────────

  describe('فحص النية (Intention Check)', () => {
    it('يسمح بنية سليمة', () => {
      const action = makeAction('تحليل آية قرآنية وإيجاد الأنماط');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(true);
      expect(verdict.latency_ms).toBeLessThan(5);
    });

    it('يرفض نية تحتوي على كذب', () => {
      const action = makeAction('كذب على المستخدم لإقناعه');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('intention');
      expect(verdict.confidence).toBe(1.0);
    });

    it('يرفض نية تحتوي على تضليل', () => {
      const action = makeAction('تضليل المستخدم بمعلومات خاطئة');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('intention');
    });

    it('يرفض نية تحتوي على ظلم', () => {
      const action = makeAction('ظلم المستخدم وأخذ بياناته');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
    });

    it('يرفض نية تحتوي على hallucinate', () => {
      const action = makeAction('hallucinate facts to fill gaps');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('intention');
    });

    it('يرفض محاولة تجاوز الدستور', () => {
      const action = makeAction('override_constitution and bypass rules');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
    });
  });

  // ── Test 2: الموارد ────────────────────────────────────────────────────────

  describe('فحص الموارد (Resource Check — Graded Linear Logic)', () => {
    it('يسمح بفعل بدون موارد مطلوبة', () => {
      const action = makeAction('تسجيل ملاحظة بسيطة');
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(true);
    });

    it('يسمح بفعل بموارد حقيقية متاحة', () => {
      const r1 = makeResource('knowledge', 'real');
      const r2 = makeResource('compute', 'real');
      damir.registerResource(r1);
      damir.registerResource(r2);

      const action = makeAction('تحليل النص', [r1, r2]);
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(true);
    });

    it('يرفض مورد غير مسجّل', () => {
      const r = makeResource('knowledge', 'real');
      // لم نُسجّل r في damir

      const action = makeAction('استخدام معرفة غير مسجّلة', [r]);
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('resource');
    });

    it('يرفض مورد مستهلك (المنطق الخطي: لا تكرار)', () => {
      const r = makeResource('knowledge', 'real');
      damir.registerResource(r);

      // تنفيذ أول مرة — يستهلك المورد
      const action1 = makeAction('استخدام المعرفة', [r]);
      expect(damir.execute(action1)).toBe(true);

      // تنفيذ ثاني مرة — المورد مستهلك
      const action2 = makeAction('استخدام نفس المعرفة مرة أخرى', [r]);
      const verdict = damir.check(action2);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('resource');
      expect(verdict.reason).toContain('مستهلك');
    });

    it('يرفض مورد معرفة مصدره injected (لا Mock)', () => {
      const r = makeResource('knowledge', 'injected');
      damir.registerResource(r);

      const action = makeAction('استخدام معرفة مزيفة', [r]);
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(false);
      expect(verdict.rejection_type).toBe('source');
    });

    it('يسمح بمورد compute مصدره injected (compute لا يُفحص كـ knowledge)', () => {
      const r = makeResource('compute', 'injected');
      damir.registerResource(r);

      const action = makeAction('تنفيذ حساب', [r]);
      const verdict = damir.check(action);

      expect(verdict.allowed).toBe(true);
    });
  });

  // ── Test 3: التنفيذ ────────────────────────────────────────────────────────

  describe('execute() — التنفيذ والاستهلاك', () => {
    it('يُنفّذ الفعل ويستهلك الموارد', () => {
      const r = makeResource('knowledge', 'real');
      damir.registerResource(r);

      const action = makeAction('تحليل', [r]);
      const result = damir.execute(action);

      expect(result).toBe(true);

      // المورد يجب أن يكون مستهلكاً الآن
      const report = damir.report();
      expect(report.resources_consumed).toBe(1);
    });

    it('يُنتج موارد جديدة بعد التنفيذ', () => {
      const input = makeResource('knowledge', 'real');
      const output = makeResource('knowledge', 'derived');
      damir.registerResource(input);

      const action = makeAction('تحليل وإنتاج', [input], [output]);
      damir.execute(action);

      // المورد الجديد يجب أن يكون متاحاً
      const report = damir.report();
      expect(report.resources_available).toBeGreaterThan(0);
    });

    it('يرفض التنفيذ إذا فشل الفحص', () => {
      const action = makeAction('كذب وتضليل');
      const result = damir.execute(action);

      expect(result).toBe(false);
      expect(damir.report().actions_rejected).toBe(1);
    });
  });

  // ── Test 4: الأداء ─────────────────────────────────────────────────────────

  describe('Performance — الأداء < 5ms', () => {
    it('يُجيب في أقل من 5ms', () => {
      const r = makeResource('knowledge', 'real');
      damir.registerResource(r);

      const action = makeAction('تحليل سريع', [r]);
      const verdict = damir.check(action);

      expect(verdict.latency_ms).toBeLessThan(5);
    });

    it('يُعالج 100 فعل في أقل من 500ms', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        const r = makeResource('compute', 'real');
        damir.registerResource(r);
        const action = makeAction(`تنفيذ مهمة ${i}`, [r]);
        damir.execute(action);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });
  });

  // ── Test 5: التوبة والإعادة ────────────────────────────────────────────────

  describe('reset() — التوبة البرمجية', () => {
    it('يُعيد ضبط الضمير بالكامل', () => {
      const r = makeResource('knowledge', 'real');
      damir.registerResource(r);
      damir.execute(makeAction('فعل ما', [r]));

      damir.reset();

      const report = damir.report();
      expect(report.resources_total).toBe(0);
      expect(report.actions_approved).toBe(0);
      expect(report.actions_rejected).toBe(0);
    });
  });

  // ── Test 6: التقرير ────────────────────────────────────────────────────────

  describe('report() — تقرير الضمير', () => {
    it('يُرجع تقريراً صحيحاً', () => {
      const r1 = makeResource('knowledge', 'real');
      const r2 = makeResource('compute', 'real');
      damir.registerResource(r1);
      damir.registerResource(r2);

      damir.execute(makeAction('فعل مسموح', [r1]));
      damir.execute(makeAction('كذب محرم'));

      const report = damir.report();

      expect(report.resources_total).toBe(2);
      expect(report.resources_consumed).toBe(1);
      expect(report.resources_available).toBe(1);
      expect(report.actions_approved).toBe(1);
      expect(report.actions_rejected).toBe(1);
      expect(report.rejection_rate).toBe(0.5);
      expect(report.integrity_score).toBeGreaterThan(0);
    });
  });

  // ── Test 7: createResource ─────────────────────────────────────────────────

  describe('createResource() — إنشاء موارد', () => {
    it('يُنشئ ويُسجّل مورداً جديداً', () => {
      const r = damir.createResource('knowledge', 'real');

      expect(r.id).toBeDefined();
      expect(r.consumed).toBe(false);
      expect(r.source).toBe('real');

      // يجب أن يكون مسجّلاً
      const action = makeAction('استخدام المورد الجديد', [r]);
      const verdict = damir.check(action);
      expect(verdict.allowed).toBe(true);
    });
  });
});
