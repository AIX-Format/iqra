/**
 * ⚖️ Critic Module — الوحدة النقدية
 * 
 * Adversarial validator that scrutinizes execution results.
 * Prevents context drift and ensures logical consistency.
 */

import { IQRALogger } from '../lib/iqra/12-infrastructure/logger';

export interface ReflectionResult {
  insight: string;
  verdict: 'PASS' | 'FAIL' | 'WARNING';
  issues?: string[];
  risk_met: boolean;
}

export class Critic {
  /**
   * Critically analyzes the result of an action
   */
  public async analyze(plan: any, result: any): Promise<ReflectionResult> {
    IQRALogger.info(`⚖️ [CRITIC] Analyzing result for plan: ${plan.tool}`);

    const issues: string[] = [];
    let verdict: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';

    // 1. Consistency Check
    if (!result.success) {
      verdict = 'FAIL';
      issues.push("Execution reported failure.");
    }

    // 2. Truth Check (Simulated)
    if (plan.skill === 'GhostSearch' && (!result.data || !result.data.patterns)) {
      verdict = 'WARNING';
      issues.push("Research result missing patterns.");
    }

    // 3. Risk Assessment
    const risk_met = plan.risk === 'HIGH';

    return {
      insight: verdict === 'PASS' ? "Execution matches plan expectations." : "Discrepancy detected in execution.",
      verdict,
      issues: issues.length > 0 ? issues : undefined,
      risk_met
    };
  }
}
