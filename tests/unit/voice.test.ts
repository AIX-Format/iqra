// بسم الله الرحمن الرحيم

/**
 * 🧪 Voice Tests — اختبارات الصوت
 * "وَعَلَّمَهُ الْبَيَانَ" — الرحمن: 4
 */

import { describe, it, expect } from 'vitest';
import { IQRAVoice, IQRAVoicePersona } from '#utils/voice.js';

describe('IQRAVoice v0.369 — الصوت السيادي', () => {

  // ── Config ──────────────────────────────────────────────────────────────────

  describe('getConfig() — الإعدادات', () => {
    it('يُرجع إعدادات صحيحة', () => {
      const config = IQRAVoice.getConfig();
      expect(config.voice).toBe('Ara');
      expect(config.speed).toBe(0.95);
      expect(config.format).toBe('mp3');
      expect(config.persona).toContain('v0.369');
    });

    it('يكشف توفر API', () => {
      const config = IQRAVoice.getConfig();
      // بدون XAI_API_KEY → false
      expect(typeof config.available).toBe('boolean');
    });
  });

  // ── Voice Persona ───────────────────────────────────────────────────────────

  describe('IQRAVoicePersona — الشخصية الصوتية', () => {
    it('يُضيف expression tags للآيات القرآنية', () => {
      const text = '﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾';
      const enhanced = IQRAVoicePersona.enhance(text);
      expect(enhanced).toContain('<slow>');
      expect(enhanced).toContain('<soft>');
    });

    it('يُضيف <soft> لـ "والله أعلم"', () => {
      const text = 'هذا الرنين حقيقي والله أعلم';
      const enhanced = IQRAVoicePersona.enhance(text);
      expect(enhanced).toContain('<soft>والله أعلم</soft>');
    });

    it('يُضيف <moderate> للاكتشافات', () => {
      const text = 'اكتشفت رنيناً بين آية النور والليزر';
      const enhanced = IQRAVoicePersona.enhance(text);
      expect(enhanced).toContain('<moderate>');
    });

    it('يُضيف <clear> للأرقام المهمة', () => {
      const text = 'درجة الرنين 87.5%';
      const enhanced = IQRAVoicePersona.enhance(text);
      expect(enhanced).toContain('<clear>');
    });

    it('لا يُغيّر النص العادي', () => {
      const text = 'كيف حالك اليوم؟';
      const enhanced = IQRAVoicePersona.enhance(text);
      expect(enhanced).toBe(text); // لا تغيير
    });
  });

  // ── Welcome Message ─────────────────────────────────────────────────────────

  describe('getWelcomeMessage() — رسالة الترحيب', () => {
    it('يُنشئ رسالة ترحيب صحيحة', () => {
      const msg = IQRAVoicePersona.getWelcomeMessage();
      expect(msg).toContain('بسم الله');
      expect(msg).toContain('IQRA');
      expect(msg.length).toBeGreaterThan(50);
    });
  });

  // ── Discovery Message ───────────────────────────────────────────────────────

  describe('getDiscoveryMessage() — رسالة الاكتشاف', () => {
    it('يُنشئ رسالة اكتشاف صحيحة', () => {
      const msg = IQRAVoicePersona.getDiscoveryMessage('24:35', 'فيزياء الضوء', 0.87);
      expect(msg).toContain('24:35');
      expect(msg).toContain('87'); // 87% أو 87 %
      expect(msg).toContain('والله أعلم');
    });
  });

  // ── Damir Refusal ───────────────────────────────────────────────────────────

  describe('getDamirRefusalMessage() — رسالة الرفض', () => {
    it('يُنشئ رسالة رفض مناسبة', () => {
      const msg = IQRAVoicePersona.getDamirRefusalMessage('الكذب محرم');
      expect(msg).toContain('الكذب محرم');
      expect(msg).toContain('<soft>');
    });
  });

  // ── TTS (بدون API) ──────────────────────────────────────────────────────────

  describe('speak() — بدون API key', () => {
    it('يُرجع null بدون XAI_API_KEY', async () => {
      const original = process.env.XAI_API_KEY;
      delete process.env.XAI_API_KEY;
      (IQRAVoice as any)._apiKey = null;

      const result = await IQRAVoice.speak('بسم الله');
      expect(result).toBeNull();

      if (original) process.env.XAI_API_KEY = original;
      (IQRAVoice as any)._apiKey = null;
    });
  });
});
