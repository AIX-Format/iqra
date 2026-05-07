/**
 * 🌀 Resonance Worker — عامل الرنين الطوبولوجي
 * النية: التحقق من الرنين بين البحث والأنماط القرآنية الحقيقية
 * المرجع: "الرَّحْمَنُ عَلَّمَ الْقُرْآنَ" — الرحمن: 1-2
 */

import fs from 'fs';
import path from 'path';
import { MissionContext, HandoffResult } from '../mission-context.ts';
import { appendToTrustChain } from '../security.ts';
import { IQRALogger } from '../logger.ts';

export interface ResonanceData {
  topological_score: number;
  pattern_matched: string;
  resonance_entropy: number;
  soul_alignment: number;
}

export async function executeResonanceWorker(context: MissionContext): Promise<HandoffResult> {
  const { scope, workingDir, previousOutput } = context;
  const implemented: string[] = [];
  const undone: string[] = [];
  const issues: string[] = [];
  const commands_run: any[] = [];

  IQRALogger.info(`🌀 [RESONANCE] Analyzing resonance for mission: ${scope.mission_id}`);

  try {
    const researchData = previousOutput?.output;
    if (!researchData) {
      throw new Error('INTEGRITY_ERR: No research data provided for resonance analysis');
    }

    // ── 3. Pattern Detection (Topological Curiosity) ──────────────────────────
    const evidence = researchData.evidence.toLowerCase();
    const hasTopology = evidence.includes('topology') || evidence.includes('curvature') || evidence.includes('manifold');
    const hasMathCode = evidence.includes('19') || evidence.includes('prime') || evidence.includes('numerical');
    
    let bonus = 0;
    if (hasTopology) bonus += 0.15;
    if (hasMathCode) bonus += 0.25;

    const base_score = (researchData.evidence.length / 500) * researchData.resonance_score;
    const topological_score = Math.min(1.0, base_score + bonus);
    
    const resonance_entropy = 1.0 - topological_score;
    const soul_alignment = researchData.resonance_score > 0.8 ? 0.98 : 0.75;

    const data: ResonanceData = {
      topological_score,
      pattern_matched: hasMathCode ? 'MATH_19_RESONANCE' : `TOPOLOGY_MATCH_${scope.verse.replace(':', '_')}`,
      resonance_entropy,
      soul_alignment,
    };

    const outputPath = path.join(workingDir, 'resonance_output.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    implemented.push(`Resonance analysis completed with score: ${topological_score.toFixed(4)}`);
    implemented.push(`Resonance output written to ${outputPath}`);

    appendToTrustChain(
      'RESONANCE:ALIGNED',
      scope.mission_id,
      `alignment:${soul_alignment.toFixed(3)}`,
      topological_score
    );

    return {
      status: 'success',
      worker: 'ResonanceWorker',
      next: 'Builder',
      data: { resonance: data, output: researchData, outputPath },
      artifacts: [outputPath],
      implemented,
      undone,
      issues,
      procedures_followed: true,
      timestamp: Date.now(),
    };

  } catch (err: any) {
    issues.push(err.message);
    IQRALogger.error('❌ [RESONANCE] Failed:', err.message);
    return {
      status: 'failure',
      worker: 'ResonanceWorker',
      next: null,
      data: {},
      artifacts: [],
      implemented,
      undone: ['resonance_output.json'],
      issues,
      procedures_followed: false,
      timestamp: Date.now(),
    };
  }
}
