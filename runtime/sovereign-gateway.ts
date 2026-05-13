/**
 * 🛰️ Sovereign Gateway — البوابة السيادية
 *
 * The primary constitutional entry point for the IQRA Sovereign Runtime.
 * Enforces the Supreme Constitution and orchestrates the 7-loop cognitive cycle
 * by leveraging the core MissionControl engine.
 */

import { ConstitutionalGuard } from './constitutional-guard';
import { TopologicalMemoryBridge } from './topological-memory-bridge';
import { MissionControl } from '#core/sovereign_orchestrator';
import { IQRALogger } from '#infra/logger';
import { DamirConscience } from '#security/damir_conscience';

export class SovereignGateway {
  private guard: ConstitutionalGuard;
  private memory: TopologicalMemoryBridge;
  private missionControl: MissionControl;
  private damir: DamirConscience;

  constructor() {
    this.guard = new ConstitutionalGuard();
    this.memory = new TopologicalMemoryBridge();
    this.missionControl = new MissionControl();
    this.damir = new DamirConscience();
  }

  /**
   * Run a complete Sovereign Cognitive Cycle | تشغيل دورة المعرفة السيادية الكاملة
   */
  public async runCycle(input: string, sessionId: string): Promise<any> {
    IQRALogger.info(`🛰️ [GATEWAY] Initiating cycle for session: ${sessionId}`);

    // 1. OBSERVE & CONSTITUTIONAL CHECK (Gatekeeper)
    // ────────────── فحص الدستور ────────────────
    const validation = await this.guard.validateInput(input);
    if (!validation.allowed) {
      IQRALogger.error(`🚫 [GATEWAY] Constitutional Block: ${validation.reason}`);
      throw new Error(`Execution Blocked: ${validation.reason}`);
    }

    // 2. RETRIEVE (Topological Memory)
    // ────────────── استرجاع الذاكرة ──────────────
    const context = await this.memory.retrieveContext(input);

    // 3. REASON & EXECUTE (Mission Control Worker Chain)
    // ────────────── التنفيذ السيادي ──────────────
    // The MissionControl handles the Reason, Validate, and Execute loops (3, 4, 5)
    const missionResult = await this.missionControl.run(input);

    // 4. REFLECT (Constitutional Audit)
    // ────────────── التدقيق والمراجعة ─────────────
    const audit = await this.guard.auditResult(missionResult.response);

    // 5. SAVE (Episodic Persistence)
    // ────────────── حفظ التجربة ────────────────
    await this.memory.persistCycle(sessionId, {
      input,
      result: missionResult,
      audit,
      timestamp: Date.now()
    });

    return {
      response: missionResult.response,
      reports: missionResult.reports,
      context: missionResult.context,
      audit
    };
  }
}
