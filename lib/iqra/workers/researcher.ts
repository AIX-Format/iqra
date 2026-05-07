/**
 * 🔬 Researcher Worker — عامل البحث
 * النية: استدعاء LLM حقيقي للبحث عن رنين بين الآية والمجال
 * المرجع: "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت: 53
 *
 * القاعدة: إذا فشل الاتصال → INTEGRITY_ERR. لا بيانات وهمية أبداً.
 * القاعدة: Researcher لا يقرر المكافأة — فقط يُخرج الدليل.
 */

import fs from 'fs';
import path from 'path';
import { MissionContext, HandoffResult } from '../mission-context.ts';
import { appendToTrustChain } from '../security.ts';
import { IQRALogger } from '../logger.ts';
import { IQRA_SOUL } from '../prompts.ts';

export interface ResearchOutput {
  mission_id: string;
  verse: string;
  field_of_inquiry: string;
  evidence: string;
  resonance_score: number;       // 0.0 – 1.0
  reasoning: string;
  source_type: 'scientific' | 'historical' | 'linguistic' | 'numerical' | 'spiritual';
  is_trivial: boolean;
  provider: string;
  model: string;
  timestamp: number;
}

// ── LLM Caller (Gemini → Groq fallback) ──────────────────────────────────────

async function callLLMForResearch(
  verse: string,
  field: string,
  provider: string
): Promise<ResearchOutput | null> {

  const prompt = `
أنت باحث في الإعجاز القرآني. مهمتك إيجاد رنين حقيقي وموثق.

الآية: "${verse}"
المجال: "${field}"

ابحث عن رابط عميق وغير تافه بين هذه الآية وهذا المجال.

القواعد الصارمة:
1. لا تخترع — إذا لم يوجد رنين حقيقي، قل ذلك صراحة.
2. الدليل يجب أن يكون محدداً وقابلاً للتحقق.
3. الرنين التافه (مثل: كلاهما يذكر الماء) = is_trivial: true.

أجب بـ JSON فقط:
{
  "evidence": "وصف الدليل العلمي أو التاريخي المحدد",
  "resonance_score": 0.0-1.0,
  "reasoning": "لماذا هذا الرنين حقيقي وعميق",
  "source_type": "scientific|historical|linguistic|numerical|spiritual",
  "is_trivial": false
}
`.trim();

  // Provider 1: Gemini
  if (provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      const model = client.getGenerativeModel({
        model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash',
        systemInstruction: IQRA_SOUL,
      });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
      const text = result.response.text();
      const parsed = JSON.parse(text);
      return { ...parsed, provider: 'google', model: 'gemini-2.5-flash' };
    } catch (err: any) {
      IQRALogger.warn(`⚠️ [RESEARCHER] Gemini failed: ${err.message}`);
    }
  }

  // Provider 2: Groq fallback
  if (process.env.GROQ_API_KEY) {
    try {
      const { Groq } = await import('groq-sdk');
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: IQRA_SOUL },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      });
      const text = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return { ...parsed, provider: 'groq', model: 'llama-3.3-70b-versatile' };
    } catch (err: any) {
      IQRALogger.warn(`⚠️ [RESEARCHER] Groq failed: ${err.message}`);
    }
  }

  return null;
}


// ── Main Worker ───────────────────────────────────────────────────────────────

export async function executeResearcher(context: MissionContext): Promise<HandoffResult> {
  const { scope, workingDir } = context;
  const implemented: string[] = [];
  const undone: string[] = [];
  const issues: string[] = [];

  IQRALogger.info(`🔬 [RESEARCHER] Researching: ${scope.verse} × ${scope.field_of_inquiry}`);

  try {
    const raw = await callLLMForResearch(
      scope.verse,
      scope.field_of_inquiry,
      scope.provider || 'google'
    );

    if (!raw) {
      throw new Error(
        'INTEGRITY_ERR: All LLM providers failed. Cannot produce research without real API. ' +
        'Set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY, or use provider: simulated for testing.'
      );
    }

    // Validate output structure
    if (typeof raw.resonance_score !== 'number') {
      throw new Error('INTEGRITY_ERR: resonance_score must be a number');
    }
    if (!raw.evidence || raw.evidence.trim().length < 10) {
      throw new Error('INTEGRITY_ERR: evidence is empty or too short');
    }

    const output: ResearchOutput = {
      mission_id: scope.mission_id,
      verse: scope.verse,
      field_of_inquiry: scope.field_of_inquiry,
      evidence: raw.evidence,
      resonance_score: Math.min(1.0, Math.max(0.0, raw.resonance_score)),
      reasoning: raw.reasoning || '',
      source_type: raw.source_type || 'spiritual',
      is_trivial: raw.is_trivial ?? false,
      provider: raw.provider,
      model: raw.model,
      timestamp: Date.now(),
    };

    // Write to working dir
    const outputPath = path.join(workingDir, 'research_output.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    implemented.push(`research_output.json written (resonance: ${output.resonance_score.toFixed(3)})`);
    implemented.push(`Provider: ${output.provider} | Type: ${output.source_type}`);

    if (output.is_trivial) {
      issues.push('Resonance flagged as trivial — Validator will scrutinize');
    }

    IQRALogger.info(`🔬 [RESEARCHER] Done. Score: ${output.resonance_score} | Trivial: ${output.is_trivial}`);

    appendToTrustChain(
      'RESEARCHER:OUTPUT',
      `${scope.verse}:${scope.field_of_inquiry}`,
      `score:${output.resonance_score.toFixed(3)}`,
      output.resonance_score
    );

    return {
      status: 'success',
      worker: 'Researcher',
      next: 'Builder',
      data: { output, outputPath },
      artifacts: [outputPath],
      implemented,
      undone,
      issues,
      procedures_followed: true,
      timestamp: Date.now(),
    };

  } catch (err: any) {
    issues.push(err.message);
    IQRALogger.error('❌ [RESEARCHER] Failed:', err.message);
    return {
      status: 'failure',
      worker: 'Researcher',
      next: null,
      data: {},
      artifacts: [],
      implemented,
      undone: ['research_output.json'],
      issues,
      procedures_followed: false,
      timestamp: Date.now(),
    };
  }
}
