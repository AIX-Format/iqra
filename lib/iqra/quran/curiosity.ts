/**
 * 🌀 Curiosity Engine | محرك الفضول
 * "وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ" — الذاريات: 21
 *
 * Proxy موحّد لـ TopologicalCuriosityEngine.
 * يدعم بيئتين:
 *   - Cloudflare Workers: عبر explore() مع VectorEngine
 *   - Node.js / Mission Pipeline: عبر discoverResonance() بدون env
 */

import {
  TopologicalCuriosityEngine,
  TopologicalCuriosity,
  type TopologicalResonance,
  type CuriosityDiscovery,
  type ResonanceType,
} from './topological_curiosity.ts';
import { VectorEngine } from './vector_engine.ts';
import { IQRAMemory } from '../memory.ts';
import { IQRALogger } from '../logger.ts';

export type { CuriosityDiscovery, TopologicalResonance, ResonanceType };

class IQRAMemoryAdapter {
  // TopologicalCuriosity expects IQRAMemory instance which might have specific methods.
  // We use this to bridge static IQRAMemory to expected instance behavior.
  async storeQuantum(entry: any) {
    return IQRAMemory.storeQuantum(entry);
  }
}

export class CuriosityEngine {
  // ── للاستخدام في Mission Pipeline (Node.js) ───────────────────────────────
  /**
   * يكتشف الرنين بين آية ومجال بحث.
   * لا يحتاج Cloudflare env — يعمل في Node.js مباشرة.
   */
  static async discoverResonance(
    verse: string,
    field: string,
    env?: any
  ): Promise<TopologicalResonance | null> {
    IQRALogger.info(`🌀 [CURIOSITY] discoverResonance: ${verse} × ${field}`);
    return TopologicalCuriosityEngine.discoverResonance(verse, field, env);
  }

  // ── للاستخدام في Cloudflare Workers ──────────────────────────────────────
  /**
   * يستكشف الرنين مع VectorEngine (يحتاج Cloudflare env).
   * IQRAMemory static → IQRAMemoryAdapter instance للتوافق مع TopologicalCuriosity.
   */
  static async explore(
    input: string,
    env: any,
    sessionId: string = 'global'
  ): Promise<CuriosityDiscovery | null> {
    IQRALogger.info(`🌀 [CURIOSITY] Session [${sessionId}] exploring: ${input.substring(0, 50)}...`);
    try {
      const vectorEngine = new VectorEngine(env);
      // We pass the static IQRAMemory class cast as any if the instance is required,
      // or use the adapter if specific instance behavior is needed.
      const engine = new TopologicalCuriosity(vectorEngine, IQRAMemory as any);
      return await engine.explore(input);
    } catch (err: any) {
      IQRALogger.warn(`⚠️ [CURIOSITY] Exploration failed: ${err.message}`);
      return null;
    }
  }
}
