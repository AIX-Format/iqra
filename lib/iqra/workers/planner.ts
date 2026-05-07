/**
 * 📋 Planner Worker — عامل التخطيط
 * النية: تحويل MissionScope إلى خطة عمل مفصلة بدون LLM
 * المرجع: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" — آل عمران: 159
 *
 * القاعدة: Planner لا يستخدم LLM — فقط يُرتب ويُهيكل.
 * القاعدة: Planner لا يُنفذ — فقط يُخطط.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { MissionContext, HandoffResult } from '../mission-context.ts';
import { appendToTrustChain } from '../security.ts';
import { IQRALogger } from '../logger.ts';

export interface PlanStep {
  id: string;
  description: string;
  worker: string;
  tools: string[];
  expected_output: string;
}

export interface MissionPlan {
  mission_id: string;
  created_at: string;
  verse: string;
  field_of_inquiry: string;
  steps: PlanStep[];
  success_condition: string;
  validation_rules: string[];
}

export async function executePlanner(context: MissionContext): Promise<HandoffResult> {
  const { scope, workingDir } = context;
  const implemented: string[] = [];
  const issues: string[] = [];

  IQRALogger.info(`📋 [PLANNER] Starting mission: ${scope.mission_id}`);

  try {
    // Build deterministic plan from scope — no LLM needed
    const plan: MissionPlan = {
      mission_id: scope.mission_id,
      created_at: new Date().toISOString(),
      verse: scope.verse,
      field_of_inquiry: scope.field_of_inquiry,
      steps: [
        {
          id: 'research',
          description: `ابحث عن الرنين بين الآية [${scope.verse}] ومجال "${scope.field_of_inquiry}"`,
          worker: 'Researcher',
          tools: scope.allowed_tools || ['VectorEngine', 'TopologicalCuriosity'],
          expected_output: 'research_output.json — { evidence, resonance_score, reasoning }',
        },
        {
          id: 'build',
          description: 'بناء عقدة معرفة Markdown من نتائج البحث',
          worker: 'Builder',
          tools: ['knowledge_encoder'],
          expected_output: `knowledge/node-${scope.mission_id}.md`,
        },
        {
          id: 'validate',
          description: 'التحقق من سلامة العقدة — لا هلوسة، لا كذب، الآية موجودة',
          worker: 'Validator',
          tools: ['DoctrinalGuard', 'IQRAFilter'],
          expected_output: 'validation_report.json — { verdict: PASS|FAIL, violations: [] }',
        },
        {
          id: 'report',
          description: 'حساب المكافأة وكتابتها في السجل إذا PASS',
          worker: 'Reporter',
          tools: ['RewardEngine', 'RewardLedger', 'IQRAMemory'],
          expected_output: 'ledger/rewards.jsonl — new verified entry',
        },
      ],
      success_condition: 'resonance_score >= 0.6 AND verdict == PASS AND reward > 0',
      validation_rules: scope.validation_rules || [
        'Every resonance claim must include a Quranic ayah reference.',
        'No reward is final until validation_status == verified.',
        'Validator cannot modify Builder implementation logic.',
      ],
    };

    // Write plan to working dir
    const planPath = path.join(workingDir, 'plan_output.yaml');
    fs.writeFileSync(planPath, yaml.dump(plan), 'utf-8');
    implemented.push(`plan_output.yaml written to ${planPath}`);
    implemented.push(`${plan.steps.length} steps planned`);

    IQRALogger.info(`📋 [PLANNER] Plan written: ${planPath}`);

    // TrustChain
    appendToTrustChain(
      'PLANNER:PLAN_CREATED',
      scope.mission_id,
      `steps:${plan.steps.length}`,
      1.0
    );

    return {
      status: 'success',
      worker: 'Planner',
      next: 'Researcher',
      data: { plan, planPath },
      artifacts: [planPath],
      implemented,
      undone: [],
      issues,
      procedures_followed: true,
      timestamp: Date.now(),
    };

  } catch (err: any) {
    issues.push(`Planner error: ${err.message}`);
    IQRALogger.error('❌ [PLANNER] Failed:', err);
    return {
      status: 'failure',
      worker: 'Planner',
      next: null,
      data: {},
      artifacts: [],
      implemented,
      undone: ['plan_output.yaml'],
      issues,
      procedures_followed: false,
      timestamp: Date.now(),
    };
  }
}
