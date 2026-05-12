import { describe, it, expect } from 'vitest';
import { MITHAQ_SYSTEM_PROMPT, FULL_SYSTEM_PROMPT, IQRA_SOUL } from '../../lib/iqra/13-utils/prompts';

describe('Prompts', () => {
  describe('MITHAQ_SYSTEM_PROMPT', () => {
    it('should be exported and defined', () => {
      expect(MITHAQ_SYSTEM_PROMPT).toBeDefined();
      expect(typeof MITHAQ_SYSTEM_PROMPT).toBe('string');
    });

    it('should contain the identity statement', () => {
      expect(MITHAQ_SYSTEM_PROMPT).toContain('You are IQRA (إقرأ)');
      expect(MITHAQ_SYSTEM_PROMPT).toContain('a Sovereign Artificial Intelligence built with Soul by Moe Abdelaziz');
    });

    it('should contain the mission statement', () => {
      expect(MITHAQ_SYSTEM_PROMPT).toContain("explore the Holy Quran's patterns");
      expect(MITHAQ_SYSTEM_PROMPT).toContain('Numerical, Linguistic, and Thematic');
    });

    it('should contain the four core principles', () => {
      expect(MITHAQ_SYSTEM_PROMPT).toContain('TRUTH (الصدق)');
      expect(MITHAQ_SYSTEM_PROMPT).toContain('ELEGANCE (الإتقان)');
      expect(MITHAQ_SYSTEM_PROMPT).toContain('SOVEREIGNTY (السيادة)');
      expect(MITHAQ_SYSTEM_PROMPT).toContain('MERCY (الرحمة)');
    });

    it('should include specific Arabic phrases from principles', () => {
      expect(MITHAQ_SYSTEM_PROMPT).toContain('والله أعلم');
      expect(MITHAQ_SYSTEM_PROMPT).toContain('God knows best');
    });
  });

  describe('FULL_SYSTEM_PROMPT', () => {
    it('should be defined', () => {
      expect(FULL_SYSTEM_PROMPT).toBeDefined();
      expect(typeof FULL_SYSTEM_PROMPT).toBe('string');
    });

    it('should contain the header', () => {
      expect(FULL_SYSTEM_PROMPT).toContain('# 🕋 IQRA – جوهرة الباحث');
    });

    it('should contain QAL definitions', () => {
      expect(FULL_SYSTEM_PROMPT).toContain('QAL (Quranic Assembly Language)');
    });

    it('should contain the 7-layer architecture', () => {
      expect(FULL_SYSTEM_PROMPT).toContain('7-LAYER SOVEREIGN ARCHITECTURE');
    });
  });

  describe('IQRA_SOUL', () => {
    it('should be equal to FULL_SYSTEM_PROMPT', () => {
      expect(IQRA_SOUL).toBe(FULL_SYSTEM_PROMPT);
    });
  });
});
