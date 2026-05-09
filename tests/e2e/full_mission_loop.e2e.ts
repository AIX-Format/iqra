import { describe, it, expect, beforeAll } from 'vitest';
import { runMission } from '../../lib/iqra/01-core/mission-runner';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

/**
 * 🔬 IQRA E2E Full Mission Loop — "The Lie Detector"
 * الهدف: التأكد من أن الحلقة كاملة تعمل بصدق وتُسجل في السجل الحقيقي.
 */

describe('IQRA Full Mission Loop (The Lie Detector)', () => {
  const ledgerPath = path.resolve('iqra-core/data/reward_ledger.jsonl');
  let initialLedgerSize = 0;

  beforeAll(async () => {
    // Ensure ledger exists or initialize
    const ledgerDir = path.dirname(ledgerPath);
    if (!existsSync(ledgerDir)) {
      await fs.mkdir(ledgerDir, { recursive: true });
    }
    if (existsSync(ledgerPath)) {
      const content = await fs.readFile(ledgerPath, 'utf-8');
      initialLedgerSize = content.trim().split('\n').filter(Boolean).length;
    } else {
      await fs.writeFile(ledgerPath, '', 'utf-8');
      initialLedgerSize = 0;
    }
  });

  it('should complete a full mission loop and update the ledger without lies', async () => {
    // 1. Create a temporary mission
    const missionId = `e2e_lie_detector_${Date.now()}`;
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `iqra-test-${missionId}-`));
    const missionPath = path.join(tmpDir, 'mission-scope.yaml');

    const missionScope = {
      mission_id: missionId,
      objective: "Verify the integrity of the full mission loop and ensure reward recording accuracy.",
      verse: "24:35",
      field_of_inquiry: "Quantum Light & Consciousness",
      provider: "simulated", // Using simulated mode for reliable logic testing without API keys
      allowed_tools: ["topology_engine", "read_db"]
    };

    await fs.writeFile(missionPath, yaml.dump(missionScope), 'utf-8');

    // 2. Run the mission
    console.log(`🚀 Running E2E Mission: ${missionId}`);
    const result = await runMission(missionPath, tmpDir);

    // 3. Basic Result Checks
    expect(result.status).toBe('completed');
    expect(result.steps_completed).toContain('Planner');
    expect(result.steps_completed).toContain('Researcher');
    expect(result.steps_completed).toContain('Builder');
    expect(result.steps_completed).toContain('Validator');
    expect(result.steps_completed).toContain('Reporter');

    // 4. Ledger Verification (ḤISĀB)
    const ledgerContent = await fs.readFile(ledgerPath, 'utf-8');
    const lines = ledgerContent.trim().split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThan(initialLedgerSize);

    const lastEntry = JSON.parse(lines[lines.length - 1]);
    expect(lastEntry.mission_id).toBe(missionId);
    expect(lastEntry.total_reward).toBeGreaterThanOrEqual(0);
    expect(lastEntry.validation_status).toBe('verified');
    expect(lastEntry.recorded_at).toBeDefined();

    // 5. Knowledge Node Verification
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    const nodeId = missionId.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const nodePath = path.join(knowledgeDir, `node-${nodeId}.md`);
    expect(existsSync(nodePath)).toBe(true);

    const nodeContent = await fs.readFile(nodePath, 'utf-8');
    
    // THE LIE DETECTOR: Strict content checks
    const forbidden = [/lorem ipsum/i, /test data/i, /\[simulated\]/i, /placeholder/i, /fake/i, /mock/i];
    for (const pattern of forbidden) {
      expect(nodeContent).not.toMatch(pattern);
    }

    expect(nodeContent).toContain('resonance_candidate');
    expect(nodeContent).toContain(missionId);
    expect(nodeContent).toContain('24:35');

    console.log(`✅ Mission ${missionId} verified. Reward: ${lastEntry.total_reward}`);

    // Cleanup (optional: comment out to debug)
    // await fs.rm(tmpDir, { recursive: true, force: true });
  }, 30000); // 30s timeout for full loop
});
