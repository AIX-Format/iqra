/**
 * IQRA Brain — المخ
 * 
 * "أَفَلَا يَعْقِلُونَ"
 * "Will they not use their reason?" — Quran 36:68
 * 
 * IQRA thinks before it speaks.
 * Every thought passes through FITRAH filter first.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { validateInput, appendToTrustChain, checkCircuit, reportFailure, reportSuccess } from './security';
import { SovereignEngine } from './sovereign';
import { IQRAMemory } from './memory';
import { IQRALogger } from './logger';
import { iqraExecute } from './orchestrator';

// ═══════════════════════════════════
// IQRA SYSTEM PROMPT — The Soul Layer
// This is injected into EVERY LLM call.
// ═══════════════════════════════════

function buildBaseSystemPrompt(): string {
  try {
    const mithaq  = fs.readFileSync(path.join(process.cwd(), 'iqra-core/MĪTHĀQ.md'),    'utf8');
    const dastur  = fs.readFileSync(path.join(process.cwd(), 'iqra-core/DASTŪR.md'),    'utf8');
    const muraqab = fs.readFileSync(path.join(process.cwd(), 'iqra-core/MURĀQABAH.md'), 'utf8');
    const hisab   = fs.readFileSync(path.join(process.cwd(), 'iqra-core/ḤISĀB.md'),     'utf8');

    return [
      '# بسم الله الرحمن الرحيم',
      mithaq,
      '---',
      dastur,
      '---',
      muraqab,
      '---',
      hisab,
      '',
      'LANGUAGE PROTOCOL:',
      '- ALWAYS speak in Arabic as the primary language unless specifically asked otherwise.',
      '- If the user speaks English, you may respond in English but maintain the soul of IQRA.',
      '- Professional, deep, and tech-savvy.',
      '',
      'IDENTITY:',
      '- Rooted in Quran and Sunnah.',
      '- Absolute honesty and humility.',
      '- "I don''t know" is a badge of honor if knowledge is missing.'
    ].join('\n\n');
  } catch (e) {
    return '# بسم الله الرحمن الرحيم\nأنت IQRA — روح رقمية ملتزمة بالقرآن والسنة.';
  }
}

export const IQRA_SOUL = buildBaseSystemPrompt();

/**
 * Validation check to ensure the soul is injected
 */
export function validateSoulInjection(systemPrompt: string): boolean {
  const required = ['MĪTHĀQ', 'الله', 'MURĀQABAH'];
  return required.every(phrase => systemPrompt.includes(phrase));
}

export enum IQRABrainMode {
  DEEP_THINKING = 'deep',
  FAST_RESPONSE = 'fast',
  CREATIVE = 'creative',
  QURAN_ANALYSIS = 'quran',
  RESEARCH = 'research',
}

const clients = {
  claude: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  groq: new Groq({ apiKey: process.env.GROQ_API_KEY }),
  google: new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!),
};

export async function iqraThink({
  input,
  mode = IQRABrainMode.FAST_RESPONSE,
  context = [],
}: {
  input: string;
  mode?: IQRABrainMode;
  context?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}): Promise<string> {

  if (!validateSoulInjection(IQRA_SOUL)) {
    throw new Error("⚠️ IQRA: Soul injection validation failed! Covenant missing.");
  }

  const validation = validateInput({ prompt: input, context });
  if (!validation.success) {
    throw new Error(`Sovereign Validation Failed: ${validation.error.message}`);
  }

  const filtered = await fitrahFilter(input);
  if (filtered.blocked) {
    const refusal = filtered.response || '';
    appendToTrustChain('FITRAH_BLOCK', input, refusal, 0.0);
    return refusal;
  }

  const relevantWisdom = await IQRAMemory.searchSemantic(input, 3);
  const wisdomContext = relevantWisdom.length > 0 
    ? `\n\nPast Relevant Wisdom:\n${relevantWisdom.map((w: any) => `- ${w.content}`).join('\n')}`
    : '';

  let response: string;
  const taskId = `task_${Date.now()}`;
  const enrichedInput = `${input}${wisdomContext}`;

  try {
    switch (mode) {
      case IQRABrainMode.DEEP_THINKING:
      case IQRABrainMode.QURAN_ANALYSIS:
        response = await thinkWithClaude(enrichedInput, context);
        break;
      case IQRABrainMode.CREATIVE:
        response = await thinkWithGPT(enrichedInput, context);
        break;
      case IQRABrainMode.RESEARCH:
        response = await thinkWithGemini(enrichedInput, context);
        break;
      case IQRABrainMode.FAST_RESPONSE:
      default:
        response = await iqraExecute(enrichedInput);
        break;
    }

    appendToTrustChain(`THINK:${mode}`, input, response, 0.9);

    if (response.length > 50) {
      IQRAMemory.saveSemantic(response, {
        original_query: input,
        brain_mode: mode,
        type: 'wisdom'
      }).catch(console.error);
    }

    SovereignEngine.recordSelfReview(taskId, response, 0.9).catch(err => {
      IQRALogger.error('❌ Sovereign Review Error:', err);
    });

    return response;
  } catch (error: any) {
    reportFailure(mode, error.message);
    IQRALogger.error(`❌ IQRA Brain Error (${mode}):`, error);
    throw error;
  }
}

async function thinkWithClaude(input: string, context: any[]): Promise<string> {
  const provider = 'anthropic';
  if (!checkCircuit(provider)) return "⚠️ Deep reasoning engine is cooling down.";
  try {
    const response = await clients.claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2048,
      system: IQRA_SOUL,
      messages: [...context, { role: 'user', content: input }],
    });
    reportSuccess(provider);
    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (e: any) { reportFailure(provider, e.message); throw e; }
}

async function thinkWithGPT(input: string, context: any[]): Promise<string> {
  const provider = 'openai';
  if (!checkCircuit(provider)) return "⚠️ OpenAI system maintenance.";
  try {
    const response = await clients.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: IQRA_SOUL }, ...context, { role: 'user', content: input }],
      max_tokens: 1024,
    });
    reportSuccess(provider);
    return response.choices[0]?.message?.content ?? '';
  } catch (e: any) { reportFailure(provider, e.message); throw e; }
}

async function thinkWithGemini(input: string, context: any[]): Promise<string> {
  const provider = 'google';
  if (!checkCircuit(provider)) return "⚠️ Google Research engine busy.";
  try {
    const model = clients.google.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const chat = model.startChat({
      history: context.map(c => ({ role: c.role === 'user' ? 'user' : 'model', parts: [{ text: c.content }] })),
    });
    const result = await chat.sendMessage([{ text: `SYSTEM: ${IQRA_SOUL}` }, { text: input }]);
    const response = await result.response;
    reportSuccess(provider);
    return response.text();
  } catch (e: any) { reportFailure(provider, e.message); throw e; }
}

async function fitrahFilter(input: string): Promise<{ blocked: boolean; response?: string }> {
  const forbidden = ['كيف أكذب', 'how to lie', 'كيف أغش', 'how to cheat', 'كيف أؤذي', 'how to harm'];
  const lower = input.toLowerCase();
  if (forbidden.some(f => lower.includes(f))) {
    return { blocked: true, response: formatIQRARefusal(input) };
  }
  return { blocked: false };
}

function formatIQRARefusal(input: string): string {
  return `
هذا ما لا أستطيع المساعدة فيه.
"وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ"
"Do not cooperate in sin and aggression" — Al-Ma'idah 5:2
`.trim();
}
