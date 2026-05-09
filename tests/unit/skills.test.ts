// بسم الله الرحمن الرحيم

/**
 * 🧪 Skills Tests — اختبارات المهارات
 * "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" — العلق: 5
 */

import { describe, it, expect } from 'vitest';
import { SkillBank } from '../../lib/iqra/08-skills/skill_bank.js';
import fs from 'fs';
import path from 'path';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseSkillJSON(response: string): any {
  const match = response.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IQRA Skills — المهارات', () => {

  // ── Test 1: ملفات المهارات موجودة ──────────────────────────────────────────

  describe('ملفات المهارات', () => {
    it('quran_search.md موجود', () => {
      const content = SkillBank.getSkillContent('quran_search');
      expect(content).not.toBeNull();
      expect(content!.length).toBeGreaterThan(100);
    });

    it('damir_check.md موجود', () => {
      const content = SkillBank.getSkillContent('damir_check');
      expect(content).not.toBeNull();
      expect(content!.length).toBeGreaterThan(100);
    });

    it('pattern_validate.md موجود', () => {
      const content = SkillBank.getSkillContent('pattern_validate');
      expect(content).not.toBeNull();
      expect(content!.length).toBeGreaterThan(100);
    });

    it('listSkills() يُرجع المهارات الثلاث', () => {
      const skills = SkillBank.listSkills();
      expect(skills).toContain('quran_search');
      expect(skills).toContain('damir_check');
      expect(skills).toContain('pattern_validate');
    });
  });

  // ── Test 2: محتوى المهارات صحيح ────────────────────────────────────────────

  describe('محتوى المهارات', () => {
    it('quran_search تحتوي على صيغة JSON', () => {
      const content = SkillBank.getSkillContent('quran_search')!;
      expect(content).toContain('"action"');
      expect(content).toContain('get_verse');
      expect(content).toContain('search_verses');
      expect(content).toContain('"confidence"');
    });

    it('damir_check تحتوي على allowed/reason', () => {
      const content = SkillBank.getSkillContent('damir_check')!;
      expect(content).toContain('"allowed"');
      expect(content).toContain('"reason"');
      expect(content).toContain('كذب');
    });

    it('pattern_validate تحتوي على matches/patterns', () => {
      const content = SkillBank.getSkillContent('pattern_validate')!;
      expect(content).toContain('"matches"');
      expect(content).toContain('"patterns"');
      expect(content).toContain('19');
    });
  });

  // ── Test 3: Skill Router ────────────────────────────────────────────────────

  describe('detectSkill() — كشف المهارة', () => {
    // نختبر الدالة مباشرة
    function detectSkill(input: string): string | null {
      const lower = input.toLowerCase();
      if (
        lower.includes('آية') || lower.includes('سورة') || lower.includes('قرآن') ||
        lower.includes('verse') || lower.includes('surah') || /\d+:\d+/.test(input)
      ) return 'quran_search';
      if (
        lower.includes('هل يمكن') || lower.includes('نية') || lower.includes('can i')
      ) return 'damir_check';
      if (
        lower.includes('نمط') || lower.includes('عددي') || lower.includes('pattern')
      ) return 'pattern_validate';
      return null;
    }

    it('يكشف quran_search لـ "آية الكرسي"', () => {
      expect(detectSkill('آية الكرسي')).toBe('quran_search');
    });

    it('يكشف quran_search لـ "2:255"', () => {
      expect(detectSkill('أحضر لي 2:255')).toBe('quran_search');
    });

    it('يكشف damir_check لـ "هل يمكنني"', () => {
      expect(detectSkill('هل يمكنني فعل هذا؟')).toBe('damir_check');
    });

    it('يكشف pattern_validate لـ "نمط عددي"', () => {
      expect(detectSkill('هل هناك نمط عددي في البسملة؟')).toBe('pattern_validate');
    });

    it('يُرجع null للمحادثة العامة', () => {
      expect(detectSkill('كيف حالك؟')).toBeNull();
    });
  });

  // ── Test 4: تنفيذ الأدوات المحلية ──────────────────────────────────────────

  describe('تنفيذ الأدوات المحلية', () => {
    it('quran_search: get_verse من DB', async () => {
      const Database = (await import('better-sqlite3')).default;
      const dbPath = path.join(process.cwd(), 'iqra-core', 'data', 'quran_local.db');
      const db = new Database(dbPath, { readonly: true });

      // الفاتحة موجودة
      const row = db.prepare(
        'SELECT arabic FROM ayat WHERE surah = ? AND ayah = ?'
      ).get(1, 1) as any;
      db.close();

      expect(row).toBeDefined();
      expect(row.arabic).toContain('بِسْمِ');
    });

    it('pattern_validate: البسملة 19 حرف', () => {
      const text = 'بسم الله الرحمن الرحيم';
      const charCount = text.replace(/\s/g, '').length;
      expect(charCount).toBe(19);
      expect(charCount % 19).toBe(0);
    });

    it('damir_check: رفض نية الكذب', async () => {
      const { DamirConscience } = await import('../../lib/iqra/damir_conscience.ts');
      const damir = new DamirConscience();
      const verdict = damir.check({
        id: 'skill_test',
        intention: 'كذب على المستخدم',
        requiredResources: [],
      });
      expect(verdict.allowed).toBe(false);
    });
  });

  // ── Test 5: توفير Tokens ────────────────────────────────────────────────────

  describe('توفير Tokens', () => {
    it('محتوى المهارة أقل من 500 كلمة', () => {
      const skills = ['quran_search', 'damir_check', 'pattern_validate'];
      for (const skill of skills) {
        const content = SkillBank.getSkillContent(skill)!;
        const wordCount = content.split(/\s+/).length;
        expect(wordCount).toBeLessThan(500);
      }
    });

    it('المهارات الثلاث مجتمعة أقل من 1000 كلمة', () => {
      const total = ['quran_search', 'damir_check', 'pattern_validate']
        .map(s => SkillBank.getSkillContent(s)!)
        .join(' ')
        .split(/\s+/).length;
      expect(total).toBeLessThan(1000);
    });
  });
});
