/**
 * 🏗️ Builder Worker — عامل البناء
 * النية: تحويل نتائج البحث إلى عقدة معرفة Markdown موثقة
 * المرجع: "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
 *
 * القاعدة: Builder لا يُقيّم نفسه — لا يضع resonance_score عالياً بلا دليل.
 * القاعدة: Builder لا يوافق على نتيجته — الـ Validator يفعل ذلك.
 */

import fs from 'fs';
import path from 'path';
import { MissionContext, HandoffResult } from '../mission-context.ts';
import { appendToTrustChain } from '../security.ts';
import { IQRALogger } from '../logger.ts';
import type { ResearchOutput } from './researcher.ts';

export async function executeBuilder(context: MissionContext): Promise<HandoffResult> {
  const { scope, workingDir, previousOutput } = context;
  const implemented: string[] = [];
  const undone: string[] = [];
  const issues: string[] = [];

  IQRALogger.info(`🏗️ [BUILDER] Building knowledge node for: ${scope.mission_id}`);

  try {
    // Read research output from previous worker
    const researchPath = previousOutput?.outputPath as string;
    if (!researchPath || !fs.existsSync(researchPath)) {
      throw new Error('INTEGRITY_ERR: research_output.json not found — Builder cannot proceed without Researcher output');
    }

    const research: ResearchOutput = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));

    // Validate we have real data — not empty
    if (!research.evidence || (research.evidence.includes('[SIMULATED]') === false && research.evidence.length < 20)) {
      issues.push('Evidence is suspiciously short');
    }

    // Ensure resonance_score exists
    const resonanceScore = research.resonance_score ?? 0.5;

    // Build the knowledge node
    const nodeId = scope.mission_id.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const nodePath = path.join(process.cwd(), 'knowledge', `node-${nodeId}.md`);

    // Ensure knowledge dir exists
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (!fs.existsSync(knowledgeDir)) {
      fs.mkdirSync(knowledgeDir, { recursive: true });
    }

    // YAML frontmatter + Markdown body
    const timestamp = new Date().toISOString();
    const nodeContent = `---
mission_id: "${scope.mission_id}"
verse: "${research.verse}"
field_of_inquiry: "${research.field_of_inquiry}"
resonance_candidate: ${resonanceScore.toFixed(4)}
source_type: "${research.source_type}"
is_trivial: ${research.is_trivial}
provider: "${research.provider}"
model: "${research.model}"
created_at: "${timestamp}"
validation_status: "pending"
---

# اكتشاف: رنين بين الآية والمجال

## الآية الكريمة
**[${research.verse}]**

## المجال
${research.field_of_inquiry}

## الدليل
${research.evidence}

## التفسير
${research.reasoning}

## درجة الرنين
${resonanceScore.toFixed(4)} / 1.0 — ${research.source_type}

---
*بُني هذا الاكتشاف بواسطة IQRA Builder في ${timestamp}*
*"وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7*
`;

    fs.writeFileSync(nodePath, nodeContent, 'utf-8');
    implemented.push(`knowledge node written: ${nodePath}`);
    implemented.push(`resonance_candidate: ${resonanceScore.toFixed(4)}`);
    implemented.push(`source_type: ${research.source_type}`);

    IQRALogger.info(`🏗️ [BUILDER] Node created: ${nodePath}`);

    appendToTrustChain(
      'BUILDER:NODE_CREATED',
      scope.mission_id,
      `node:${nodeId}:score:${resonanceScore.toFixed(3)}`,
      resonanceScore
    );

    return {
      status: 'success',
      worker: 'Builder',
      next: 'Validator',
      data: { nodePath, nodeId, resonance_score: research.resonance_score },
      artifacts: [nodePath],
      implemented,
      undone,
      issues,
      procedures_followed: true,
      timestamp: Date.now(),
    };

  } catch (err: any) {
    issues.push(err.message);
    IQRALogger.error('❌ [BUILDER] Failed:', err.message);
    return {
      status: 'failure',
      worker: 'Builder',
      next: null,
      data: {},
      artifacts: [],
      implemented,
      undone: ['knowledge node'],
      issues,
      procedures_followed: false,
      timestamp: Date.now(),
    };
  }
}
