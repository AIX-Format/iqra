/**
 * 🔄 Orchestrator — المنسق السيادي
 * 
 * Orchestrates the 7-loop cognitive cycle.
 */

import { Gatekeeper } from './gatekeeper';
import { MemoryEngine, MemoryType } from './memory-engine';
import { ToolRouter } from './tool-router';
import { Critic } from './critic';
import { IQRALogger } from '../lib/iqra/12-infrastructure/logger';

export class Orchestrator {
  private gatekeeper: Gatekeeper;
  private memory: MemoryEngine;
  private router: ToolRouter;
  private critic: Critic;

  constructor() {
    this.gatekeeper = new Gatekeeper();
    this.memory = new MemoryEngine();
    this.router = new ToolRouter();
    this.critic = new Critic();
  }

  public async runCycle(input: string, sessionId: string): Promise<any> {
    IQRALogger.info(`🔄 [ORCHESTRATOR] Starting cycle for session ${sessionId}`);

    // 1. OBSERVE
    const context = await this.observe(input);

    // 2. RETRIEVE
    const memories = await this.memory.retrieve(MemoryType.SEMANTIC, input);

    // 3. REASON
    const plan = await this.reason(input, memories, context);
    IQRALogger.info(`🧭 [ORCHESTRATOR] Reasoning complete. Skill: ${plan.skill}, Tool: ${plan.tool}`);

    // 4. VALIDATE (Gatekeeper)
    const validation = this.gatekeeper.validateAction(plan.skill, plan.tool);
    if (!validation.allowed) {
      IQRALogger.error(`❌ [ORCHESTRATOR] Validation failed: ${validation.reason}`);
      throw new Error(`Execution blocked: ${validation.reason}`);
    }

    // 5. EXECUTE (via Router)
    const result = await this.router.route(plan.skill, plan.tool, plan.params);

    // 6. REFLECT (via Critic)
    const reflection = await this.critic.analyze(plan, result);
    IQRALogger.info(`⚖️ [ORCHESTRATOR] Reflection complete. Verdict: ${reflection.verdict}`);

    // 7. SAVE
    await this.memory.save(MemoryType.EPISODIC, sessionId, { 
      input, 
      plan, 
      result, 
      reflection,
      timestamp: Date.now()
    }, ['7-loop-cycle', plan.skill]);

    return { result, reflection };
  }

  private async observe(input: string) { 
    return { 
      inputLength: input.length,
      isArabic: /[\u0600-\u06FF]/.test(input)
    }; 
  }

  private async reason(input: string, memories: any[], context: any) { 
    // Basic heuristic-based router (to be replaced by LLM call)
    if (input.includes('git') || input.includes('commit') || input.includes('push')) {
      return { 
        skill: 'GitSovereign', 
        tool: 'git_push', 
        params: { branch: 'main', message: 'Sovereign update' } 
      };
    }
    
    return { 
      skill: 'GhostSearch', 
      tool: 'search_web', 
      params: { query: input } 
    }; 
  }
}
