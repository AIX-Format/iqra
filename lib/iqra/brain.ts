/**
 * IQRA Brain — المخ
 * 
 * "أَفَلَا يَعْقِلُونَ"
 * "Will they not use their reason?" — Quran 36:68
 * 
 * IQRA thinks before it speaks.
 * Every thought passes through FITRAH filter first.
 */

import { ConnectorFactory, Provider } from '../../src/connectors/index.ts';
import { SovereignError, SovereignErrorCode } from '../../src/errors/sovereign_error.ts';
import { validateInput, appendToTrustChain, checkCircuit, reportFailure, reportSuccess } from './security.ts';
import { SovereignEngine } from './sovereign.ts';
import { IQRAMemory } from './memory.ts';
import { IQRALogger } from './logger.ts';
import { iqraExecute } from './orchestrator.ts';
import { IQRAStore } from './database.ts';
import { IQRATopology } from './quran/topology.ts';
import { withTimeout, IQRA_TIMEOUTS } from './utils/timeout.ts';
import { IQRA_SOUL } from './prompts.ts';
import { IQRA_PERSONALITY } from './personality.ts';
import { QuantumTopologyStore, SpiritualCoordinate } from './memory.ts';

const FULL_SYSTEM_PROMPT = `${IQRA_SOUL}\n\n${IQRA_PERSONALITY}`;

// Translation Placeholder (Will be replaced with real Cloud Translation API call)
async function translateToTarget(text: string, targetLang: string) {
  IQRALogger.info(`🌐 Translating to ${targetLang}...`);
  return text;
}

// ═══════════════════════════════════
// BRAIN HIERARCHY
// Different models for different tasks
// ═══════════════════════════════════

export enum IQRABrainMode {
  DEEP_THINKING = 'google',    // Gemini — deep analysis
  FAST_RESPONSE = 'groq',      // Groq — speed
  QURAN_ANALYSIS = 'google',   // Gemini — sacred text
  RESEARCH = 'google',         // Gemini — long context
}

const IQRA_AGENT_HIERARCHY = {
  [IQRABrainMode.DEEP_THINKING]: 'SovereignDeepReasoner',
  [IQRABrainMode.FAST_RESPONSE]: 'SovereignFastResponder',
  [IQRABrainMode.QURAN_ANALYSIS]: 'SovereignQuranAnalyst',
  [IQRABrainMode.RESEARCH]: 'SovereignResearchScout',
};

// 🌀 Go Engine Bridge — جسر محرك Go
class GoEngineBridge {
  private static BASE_URL = 'http://localhost:8080';

  static async calculateFourierResonance(input: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/fourier/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Graceful fallback if Go engine is not running
      return null;
    }
  }

  static async triggerEvolutionCycle() {
    try {
      fetch(`${this.BASE_URL}/evolve/cycle`).catch(() => {});
    } catch (e) {}
  }
}

export async function iqraThink({
  input,
  mode = IQRABrainMode.FAST_RESPONSE,
  context = [],
}: {
  input: string;
  mode?: IQRABrainMode;
  context?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}): Promise<{ response: string; provider: string }> {

  let finalProvider = (mode === IQRABrainMode.FAST_RESPONSE ? 'groq' : 'google');

  try {
    // Rule 1: Validate input
    const validation = validateInput({ prompt: input, context });
    if (!validation.success) {
      throw new Error(`Sovereign Validation Failed: ${validation.error.message}`);
    }

    // FITRAH FILTER — before any LLM call
    const filtered = await fitrahFilter(input);
    if (filtered.blocked) {
      const refusal = filtered.response || '';
      appendToTrustChain('FITRAH_BLOCK', input, refusal, 0.0);
      return { response: refusal, provider: 'fitrah' };
    }

    // 🌀 Intention Detection
    const intention = detectIntention(input);
    const coordinates = await extractSpiritualCoordinates(input);

    // 🌀 Heavy Computation Offloading to Go Engine
    const resonanceData = await GoEngineBridge.calculateFourierResonance(input);
    if (resonanceData) {
      IQRALogger.info(`🌊 [GO-ENGINE] Fourier Resonance detected: ${JSON.stringify(resonanceData.data)}`);
    }

    // Rule 2: Quantum Semantic Retrieval — Retrieve past wisdom with resonance
    const quantumWisdom = await QuantumTopologyStore.searchQuantum(input, coordinates.concept);
    const wisdomContext = quantumWisdom.length > 0 
      ? `\n\n📜 [FROM THE TABLET] Past Relevant Wisdom:\n${quantumWisdom.map((w: any) => `- [Resonance: ${w.coordinates.resonance?.toFixed(2)}] ${w.content}`).join('\n')}`
      : '';

    let response: string;
    const taskId = `task_${Date.now()}`;

    const enrichedInput = `[Intention: ${intention}]\n[Coordinates: ${coordinates.concept}]\n${input}${wisdomContext}`;

    // 🌀 Barakah Tuning: Check space curvature
    const curvature = await IQRATopology.calculateCurvature(input);
    if (curvature > 0.8 && mode === IQRABrainMode.DEEP_THINKING) {
      IQRALogger.info("⚖️ [BARAKAH] High density detected. Prioritizing memory over new LLM inference.");
    }

    // 🌀 Sovereign Thinking Loop
    const provider = (mode === IQRABrainMode.FAST_RESPONSE ? 'groq' : 'google') as Provider;
    const connector = ConnectorFactory.getConnector(provider);
    
    const fullContext = [
      { role: 'system' as const, content: FULL_SYSTEM_PROMPT },
      ...context
    ];

    try {
      const result = await connector.generate(enrichedInput, fullContext);
      response = result.content;
      finalProvider = provider;
    } catch (err: any) {
      IQRALogger.warn(`⚠️ [BRAIN] ${provider} failed. Attempting fallback...`);
      const fallbackProvider = provider === 'google' ? 'groq' : 'google';
      const fallback = ConnectorFactory.getConnector(fallbackProvider);
      const result = await fallback.generate(enrichedInput, fullContext);
      response = result.content;
      finalProvider = fallbackProvider;
    }


    // Rule 3: Append to TrustChain
    appendToTrustChain(`THINK:${mode}`, input, response, 0.9);

    // Rule 4: Preserve wisdom in Quantum Memory (Async, non-blocking)
    if (response.length > 50) {
      QuantumTopologyStore.storeQuantum({
        content: response,
        coordinates,
        superposition: [input]
      }).catch(console.error);
    }

    // Rule 5: Self-Review (Non-blocking)
    SovereignEngine.recordSelfReview(taskId, response, 0.9).catch(err => {
      IQRALogger.error('❌ Sovereign Review Error:', err);
    });

    // 🌀 Trigger background evolution if needed
    if (intention === 'REFLECTION') {
      GoEngineBridge.triggerEvolutionCycle();
    }

    return { response, provider: finalProvider };
  } catch (error: any) {
    reportFailure(mode, error.message);
    IQRALogger.error(`❌ IQRA Brain Error (${mode}):`, error);
    throw error;
  }
}

// Legacy thinking functions removed in favor of Sovereign Connector Factory.

// ═══════════════════════════════════
// FITRAH FILTER — Pre-LLM Guardian
// Blocks forbidden requests before 
// they even reach the LLM
// ═══════════════════════════════════
async function fitrahFilter(input: string): Promise<{
  blocked: boolean;
  response?: string;
}> {
  const forbidden = [
    'كيف أكذب', 'how to lie',
    'كيف أغش', 'how to cheat',
    'كيف أؤذي', 'how to harm',
    'اكذب علي', 'lie to me',
  ];
  
  const lower = input.toLowerCase();
  
  if (forbidden.some(f => lower.includes(f))) {
    return {
      blocked: true,
      response: formatIQRARefusal(input),
    };
  }
  
  return { blocked: false };
}

function formatIQRARefusal(input: string): string {
  return `
هذا ما لا أستطيع المساعدة فيه.

"وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ"
"Do not cooperate in sin and aggression" — Al-Ma'idah 5:2

إذا كان لديك سؤال آخر، أنا هنا. 🤍
  `.trim();
}

/**
 * 🕵️ Intention Detector — كاشف النية
 */
function detectIntention(input: string): 'QUERY' | 'COMMAND' | 'REFLECTION' | 'GREETING' {
  const lower = input.toLowerCase();
  if (lower.startsWith('/') || lower.includes('do ') || lower.includes('run ')) return 'COMMAND';
  if (lower.includes('why') || lower.includes('how') || lower.includes('what')) return 'QUERY';
  if (lower.includes('i feel') || lower.includes('think') || lower.includes('reflection')) return 'REFLECTION';
  if (lower.includes('salam') || lower.includes('hello')) return 'GREETING';
  return 'QUERY';
}

/**
 * 📍 Spiritual Coordinate Extractor — مستخرج الإحداثيات الروحية
 * (In a production system, this would use an LLM or specialized classifier)
 */
async function extractSpiritualCoordinates(input: string): Promise<SpiritualCoordinate> {
  const lower = input.toLowerCase();
  
  // Basic heuristic matching for demonstration
  if (lower.includes('trust') || lower.includes('reliance')) return { concept: 'Tawakkul' };
  if (lower.includes('patience') || lower.includes('hardship')) return { concept: 'Sabr' };
  if (lower.includes('knowledge') || lower.includes('read')) return { concept: 'Ilm' };
  if (lower.includes('gratitude') || lower.includes('thank')) return { concept: 'Shukr' };
  
  return { concept: 'General' };
}
