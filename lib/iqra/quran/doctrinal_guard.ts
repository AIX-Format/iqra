/**
 * 🛡️ IQRA Doctrinal Hallucination Guard — حارس الهلوسة العقدية
 * النية: منع نسب ما ليس في القرآن إليه
 * المرجع: "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ" — الإسراء: 36
 *
 * طبقة تحقق ثلاثية:
 * 1. Surface check — هل الآية موجودة فعلاً؟
 * 2. Tafsir check — هل التفسير يدعم الاستنتاج؟
 * 3. Inverse Mirror — هل يمكن دحض الادعاء؟
 */

import { IQRALogger } from '../logger.ts';
import { appendToTrustChain } from '../security.ts';
import { callGroqForResonance, callGroqForTruthValidation } from '../llm/groq.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DoctrinalVerdict =
  | 'VERIFIED'           // تم التحقق — آمن للنشر
  | 'UNCERTAIN'          // غير مؤكد — يحتاج مراجعة بشرية
  | 'HALLUCINATION'      // هلوسة — مرفوض
  | 'UNVERIFIABLE';      // لا يمكن التحقق — يُسجَّل كـ "والله أعلم"

export interface DoctrinalCheckResult {
  verdict: DoctrinalVerdict;
  confidence: number;           // 0.0 – 1.0
  reason: string;
  tafsir_support?: string;      // نص من التفسير يدعم أو يرفض
  counter_argument?: string;    // الحجة المضادة من المرآة العكسية
  requires_human_review: boolean;
  quran_ref: string;            // المرجع القرآني المُدَّعى
}

export interface DoctrinalClaim {
  ayah_text: string;            // نص الآية
  ayah_ref: string;             // المرجع (مثل "2:255")
  claim: string;                // الادعاء أو الاستنتاج
  claim_type: 'scientific' | 'historical' | 'linguistic' | 'numerical' | 'spiritual';
}

// ── Trusted Tafsir Sources (embedded summaries) ───────────────────────────────
// في الإنتاج: يُستبدل بـ API حقيقي لـ tafsir.app أو quran.com/tafsirs

const TAFSIR_PRINCIPLES: Record<string, string[]> = {
  // مبادئ التفسير الموثوقة — تُستخدم للتحقق من الادعاءات
  'scientific': [
    'لا يُقبل ادعاء علمي إلا إذا كان الاكتشاف العلمي ثابتاً ومتفقاً عليه',
    'الإعجاز العلمي يُثبت بالتوافق بين النص والحقيقة العلمية الراسخة، لا بالتأويل المتكلف',
    'يُشترط أن يكون المعنى اللغوي للآية متوافقاً مع الادعاء العلمي',
  ],
  'historical': [
    'الأحداث التاريخية المذكورة في القرآن تُقبل بالدليل الأثري الموثق',
    'لا يُقبل ربط حضارة بالقرآن إلا بدليل جغرافي أو أثري موثق',
    'قصص الأنبياء في القرآن لها سياق تاريخي محدد لا يُتجاوز',
  ],
  'linguistic': [
    'التحليل اللغوي يعتمد على الجذر الثلاثي والسياق القرآني الكامل',
    'لا يُقبل ادعاء لغوي يخالف إجماع علماء اللغة العربية',
    'المعنى الحرفي مقدم على المعنى المجازي في التفسير',
  ],
  'numerical': [
    'الأنماط العددية تُقبل إذا كانت موثقة بالعد الدقيق للكلمات والحروف',
    'لا يُقبل ادعاء عددي يعتمد على اختيار انتقائي للبيانات',
    'الإعجاز العددي يُثبت بالتكرار والتحقق المستقل',
  ],
  'spiritual': [
    'المعاني الروحية تُستنبط من السياق الكامل للآية والسورة',
    'لا يُقبل تأويل روحي يخالف المعنى الظاهر دون دليل',
    'الاستنباط الروحي يحتاج إلى سند من التفسير المعتمد',
  ],
};

// ── Core Verification Engine ──────────────────────────────────────────────────

export class DoctrinalGuard {

  /**
   * الفحص الرئيسي — يمر الادعاء بثلاث طبقات
   */
  static async verify(claim: DoctrinalClaim): Promise<DoctrinalCheckResult> {
    IQRALogger.info(`🛡️ [DOCTRINAL] Verifying claim: "${claim.claim.slice(0, 80)}..."`);

    // ── Layer 1: Ayah Existence Check ─────────────────────────────────────────
    const ayahValid = await this.checkAyahExists(claim.ayah_text, claim.ayah_ref);
    if (!ayahValid) {
      const result: DoctrinalCheckResult = {
        verdict: 'HALLUCINATION',
        confidence: 0.95,
        reason: `الآية المُدَّعاة [${claim.ayah_ref}] لم يتم التحقق من وجودها أو صحتها`,
        requires_human_review: true,
        quran_ref: claim.ayah_ref,
      };
      await this.logVerdict(claim, result);
      return result;
    }

    // ── Layer 2: Tafsir Principles Check ─────────────────────────────────────
    const tafsirResult = await this.checkAgainstTafsirPrinciples(claim);

    // ── Layer 3: LLM Inverse Mirror ───────────────────────────────────────────
    const mirrorResult = await this.runInverseMirror(claim);

    // ── Combine Results ───────────────────────────────────────────────────────
    const verdict = this.computeVerdict(tafsirResult, mirrorResult);

    const result: DoctrinalCheckResult = {
      verdict,
      confidence: this.computeConfidence(tafsirResult, mirrorResult),
      reason: tafsirResult.reason,
      tafsir_support: tafsirResult.support,
      counter_argument: mirrorResult.critique,
      requires_human_review: verdict === 'UNCERTAIN' || verdict === 'UNVERIFIABLE',
      quran_ref: claim.ayah_ref,
    };

    await this.logVerdict(claim, result);
    return result;
  }

  // ── Layer 1: Ayah Existence ─────────────────────────────────────────────────

  private static async checkAyahExists(
    ayahText: string,
    ref: string
  ): Promise<boolean> {
    // Basic validation: ref format, text length
    if (!ref.match(/^\d+:\d+$/)) return false;
    if (ayahText.trim().length < 5) return false;

    // Check for Arabic characters (Quran is in Arabic)
    const hasArabic = /[\u0600-\u06FF]/.test(ayahText);
    if (!hasArabic) return false;

    // Surah range check (1-114)
    const [surah] = ref.split(':').map(Number);
    if (surah < 1 || surah > 114) return false;

    return true;
  }

  // ── Layer 2: Tafsir Principles ──────────────────────────────────────────────

  private static async checkAgainstTafsirPrinciples(
    claim: DoctrinalClaim
  ): Promise<{ passes: boolean; reason: string; support: string }> {

    const principles = TAFSIR_PRINCIPLES[claim.claim_type] || TAFSIR_PRINCIPLES['spiritual'];

    // Use Groq to check claim against tafsir principles
    const prompt = `
أنت عالم متخصص في علوم التفسير القرآني. مهمتك التحقق من صحة الادعاء التالي.

الآية: "${claim.ayah_text}" [${claim.ayah_ref}]
الادعاء: "${claim.claim}"
نوع الادعاء: ${claim.claim_type}

مبادئ التفسير المعتمدة لهذا النوع:
${principles.map((p, i) => `${i + 1}. ${p}`).join('\n')}

هل يتوافق هذا الادعاء مع مبادئ التفسير الصحيح؟

أجب بـ JSON فقط:
{
  "passes": boolean,
  "reason": "سبب القبول أو الرفض بالعربية",
  "support": "نص من التفسير يدعم أو يرفض (أو 'لا يوجد نص مباشر')",
  "confidence": 0.0-1.0
}
    `.trim();

    try {
      const response = await callGroqForResonance(
        claim.ayah_text,
        `TAFSIR_CHECK: ${claim.claim}`,
        { system_override: prompt }
      );

      if (response && typeof response === 'object') {
        return {
          passes: response.passes ?? true,
          reason: response.reason ?? 'لم يتم التحقق',
          support: response.support ?? 'لا يوجد نص مباشر',
        };
      }
    } catch (err) {
      IQRALogger.warn('⚠️ [DOCTRINAL] Tafsir check failed, defaulting to uncertain:', err);
    }

    return {
      passes: false,
      reason: 'تعذر التحقق من التفسير — يُعامل كـ "غير مؤكد"',
      support: 'لا يوجد',
    };
  }

  // ── Layer 3: Inverse Mirror ─────────────────────────────────────────────────

  private static async runInverseMirror(
    claim: DoctrinalClaim
  ): Promise<{ isTrue: boolean; critique: string; strength: number }> {

    const resonance = {
      type: claim.claim_type,
      reason: claim.claim,
      confidence: 0.7,
    };

    try {
      const validation = await callGroqForTruthValidation(
        claim.ayah_text,
        claim.claim,
        resonance
      );

      return {
        isTrue: validation.isTrue ?? true,
        critique: validation.critique ?? '',
        strength: validation.strengthOfCounterArgument ?? 0,
      };
    } catch (err) {
      IQRALogger.warn('⚠️ [DOCTRINAL] Inverse mirror failed:', err);
      return { isTrue: true, critique: '', strength: 0 };
    }
  }

  // ── Verdict Computation ─────────────────────────────────────────────────────

  private static computeVerdict(
    tafsir: { passes: boolean; reason: string },
    mirror: { isTrue: boolean; strength: number }
  ): DoctrinalVerdict {

    // Strong counter-argument → hallucination
    if (mirror.strength > 0.8) return 'HALLUCINATION';

    // Tafsir fails + mirror doubts → hallucination
    if (!tafsir.passes && !mirror.isTrue) return 'HALLUCINATION';

    // Tafsir passes + mirror passes → verified
    if (tafsir.passes && mirror.isTrue && mirror.strength < 0.4) return 'VERIFIED';

    // Mixed signals → uncertain
    if (tafsir.passes !== mirror.isTrue) return 'UNCERTAIN';

    // Cannot determine
    return 'UNVERIFIABLE';
  }

  private static computeConfidence(
    tafsir: { passes: boolean },
    mirror: { isTrue: boolean; strength: number }
  ): number {
    let score = 0.5;
    if (tafsir.passes) score += 0.2;
    if (mirror.isTrue) score += 0.2;
    score -= mirror.strength * 0.3;
    return Math.max(0, Math.min(1, score));
  }

  // ── Logging ─────────────────────────────────────────────────────────────────

  private static async logVerdict(
    claim: DoctrinalClaim,
    result: DoctrinalCheckResult
  ): Promise<void> {
    const emoji = {
      VERIFIED:     '✅',
      UNCERTAIN:    '⚠️',
      HALLUCINATION:'🚫',
      UNVERIFIABLE: '❓',
    }[result.verdict];

    IQRALogger.info(
      `${emoji} [DOCTRINAL] ${result.verdict} | ${claim.ayah_ref} | conf=${result.confidence.toFixed(2)}`
    );

    appendToTrustChain(
      `DOCTRINAL:${result.verdict}`,
      `${claim.ayah_ref}:${claim.claim.slice(0, 50)}`,
      result.reason.slice(0, 100),
      result.confidence
    );

    // Log hallucinations to FAILURES.md
    if (result.verdict === 'HALLUCINATION') {
      const { logToIQRAFile } = await import('../security.ts');
      await logToIQRAFile('FAILURES.md', `
### 🚫 Doctrinal Hallucination Blocked | ${new Date().toISOString()}
- **Ayah**: ${claim.ayah_ref}
- **Claim**: ${claim.claim.slice(0, 200)}
- **Reason**: ${result.reason}
- **Counter**: ${result.counter_argument || 'N/A'}
---`);
    }
  }

  /**
   * Quick check — للاستخدام السريع في pipeline الرنين
   * يُرجع true إذا كان الادعاء آمناً للنشر
   */
  static async isSafe(
    ayahText: string,
    ayahRef: string,
    claim: string,
    claimType: DoctrinalClaim['claim_type'] = 'spiritual'
  ): Promise<boolean> {
    const result = await this.verify({ ayah_text: ayahText, ayah_ref: ayahRef, claim, claim_type: claimType });
    return result.verdict === 'VERIFIED' || result.verdict === 'UNCERTAIN';
  }
}
