/**
 * 🔬 Full Mission Loop E2E — كاشف الكذب
 * "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ" — الإسراء: 36
 *
 * يُثبت أن MissionRunner + العمال + محرك المكافأة يعملون معاً
 * وينتج عن ذلك زيادة حقيقية في ledger/rewards.jsonl
 * وإنشاء عقدة معرفة — دون أي تزييف.
 *
 * يعمل بـ provider: simulated لتجنب الحاجة لـ API في CI.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { config } from 'dotenv';
import { runMission } from '../../lib/iqra/mission-runner.ts';

config({ path: path.join(process.cwd(), '.env') });

// ── Constants ─────────────────────────────────────────────────────────────────

const LEDGER_PATH = path.join(process.cwd(), 'ledger', 'rewards.jsonl');
const FORBIDDEN_STRINGS = ['lorem ipsum', 'test data', 'fake', 'placeholder', 'foo bar'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function readLedger(): any[] {
  if (!fs.existsSync(LEDGER_PATH)) return [];
  return fs.readFileSync(LEDGER_PATH, 'utf-8')
    .trim().split('\n').filter(Boolean)
    .map(l => JSON.parse(l));
}

function containsForbidden(text: string): string | null {
  const lower = text.toLowerCase();
  for (const f of FORBIDDEN_STRINGS) {
    if (lower.includes(f)) return f;
  }
  return null;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('🔬 Full Mission Loop — كاشف الكذب', () => {

  let tmpDir: string;
  let missionPath: string;
  let result: Awaited<ReturnType<typeof runMission>>;
  let ledgerBefore: any[];

  // ── Setup ─────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    // Create isolated working directory
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iqra-e2e-'));

    // Build a simulated mission scope — uses real Quranic data, no API needed
    // Verse 24:35 — آية النور — known for its deep scientific resonance
    const testScope = {
      mission_id: `e2e_test_${Date.now()}`,
      version: '1.0.0',
      status: 'planned',
      objective: 'Discover resonance between Ayat Al-Nur (24:35) and quantum optics',
      verse: '24:35',
      field_of_inquiry: 'Quantum optics and the nature of light — photon behavior and wave-particle duality',
      provider: 'simulated',   // ← no API key needed
      allowed_tools: ['TopologicalCuriosity', 'RewardLedger'],
      validation_rules: [
        'Every resonance claim must include a Quranic ayah reference.',
        'No reward is final until validation_status == verified.',
      ],
      success_criteria: [
        'ledger/rewards.jsonl contains at least one new verified entry.',
        'knowledge/node-*.md is created with non-empty content.',
      ],
    };

    missionPath = path.join(tmpDir, 'mission-scope.yml');
    fs.writeFileSync(missionPath, yaml.dump(testScope), 'utf-8');

    // Record ledger state before
    ledgerBefore = readLedger();

    // Run the full mission
    result = await runMission(missionPath, tmpDir);
  }, 60_000);

  afterAll(() => {
    // Clean up tmp dir (comment out to inspect artifacts)
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  // ── Test 1: Mission completed ─────────────────────────────────────────────

  it('mission completes without INTEGRITY_ERR', () => {
    if (result.status === 'failed') {
      throw new Error(
        `Mission failed at step(s): ${result.steps_failed.join(', ')}\n` +
        `Error: ${result.error}\n` +
        `Completed steps: ${result.steps_completed.join(' → ')}`
      );
    }
    expect(result.status).toBe('completed');
    expect(result.steps_completed).toContain('Planner');
    expect(result.steps_completed).toContain('Researcher');
    expect(result.steps_completed).toContain('Builder');
    expect(result.steps_completed).toContain('Validator');
    expect(result.steps_completed).toContain('Reporter');
    console.log(`\n✅ Steps: ${result.steps_completed.join(' → ')}`);
    console.log(`   Duration: ${result.duration_ms}ms`);
  });

  // ── Test 2: Ledger grew ───────────────────────────────────────────────────

  it('ledger/rewards.jsonl grew by at least one entry', () => {
    const ledgerAfter = readLedger();
    expect(ledgerAfter.length).toBeGreaterThan(ledgerBefore.length);
    console.log(`\n📒 Ledger: ${ledgerBefore.length} → ${ledgerAfter.length} entries`);
  });

  // ── Test 3: Last entry is valid ───────────────────────────────────────────

  it('new ledger entry has reward > 0 and validation_status: verified', () => {
    const ledgerAfter = readLedger();
    const newEntries = ledgerAfter.slice(ledgerBefore.length);
    expect(newEntries.length).toBeGreaterThan(0);

    const last = newEntries[newEntries.length - 1];
    expect(last.total_reward).toBeGreaterThan(0);
    expect(last.validation_status).toBe('verified');
    expect(last.mission_id).toBeTruthy();
    expect(last.discovery_level).toBeTruthy();

    console.log(`\n💎 Reward: ${last.total_reward.toFixed(4)} | Level: ${last.discovery_level}`);
    console.log(`   Mission: ${last.mission_id}`);
  });

  // ── Test 4: Knowledge node created ───────────────────────────────────────

  it('knowledge/node-*.md was created with real content', () => {
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    expect(fs.existsSync(knowledgeDir)).toBe(true);

    const nodeFiles = fs.readdirSync(knowledgeDir)
      .filter(f => f.endsWith('.md') && f.includes(result.mission_id?.split('_')[0] || 'e2e'));

    // Also check tmpDir for node files
    const allArtifacts = result.all_artifacts;
    const nodePaths = allArtifacts.filter(a => a.endsWith('.md'));

    const nodeFile = nodePaths[0] || path.join(knowledgeDir, nodeFiles[0]);
    expect(nodeFile).toBeTruthy();
    expect(fs.existsSync(nodeFile)).toBe(true);

    const content = fs.readFileSync(nodeFile, 'utf-8');
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('resonance_candidate');
    expect(content).toContain('verse');
    expect(content).not.toContain('Lorem ipsum');

    console.log(`\n📄 Node: ${path.basename(nodeFile)} (${content.length} chars)`);
  });

  // ── Test 5: No forbidden strings anywhere ────────────────────────────────

  it('no forbidden strings in any artifact (no fake data)', () => {
    const artifactsToCheck = [
      path.join(tmpDir, 'research_output.json'),
      path.join(tmpDir, 'validation_report.json'),
      path.join(tmpDir, 'plan_output.yaml'),
    ];

    for (const filePath of artifactsToCheck) {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      const found = containsForbidden(content);
      if (found) {
        throw new Error(`Forbidden string "${found}" found in ${path.basename(filePath)}`);
      }
    }
    console.log('\n🛡️ No forbidden strings found in artifacts');
  });

  // ── Test 6: resonance_score is not suspiciously perfect ──────────────────

  it('resonance_score is not exactly 1.0 (no hardcoded perfection)', () => {
    const researchPath = path.join(tmpDir, 'research_output.json');
    if (!fs.existsSync(researchPath)) return; // skip if not found

    const research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    // 1.0 exactly from a non-simulated provider is suspicious
    if (research.provider !== 'simulated') {
      expect(research.resonance_score).not.toBe(1.0);
    }
    expect(research.resonance_score).toBeGreaterThan(0);
    expect(research.resonance_score).toBeLessThanOrEqual(1.0);
    console.log(`\n🔬 Resonance score: ${research.resonance_score}`);
  });

  // ── Test 7: mission-scope.yml updated to completed ───────────────────────

  it('mission-scope.yml status updated to completed', () => {
    if (!fs.existsSync(missionPath)) return;
    const scope = yaml.load(fs.readFileSync(missionPath, 'utf-8')) as any;
    expect(scope.status).toBe('completed');
    console.log(`\n📋 Mission status: ${scope.status}`);
  });

  // ── Test 8: Reward is deterministic (same inputs = same reward) ───────────

  it('RewardEngine is deterministic — same inputs produce same output', async () => {
    const { RewardEngine } = await import('../../rewards/engine.ts');
    const input = {
      mission_id: 'test',
      worker_id: 'test',
      novelty_score: 0.7,
      resonance_score: 0.8,
      topology_score: 0.9,
      hallucination_penalty: 0.0,
      timestamp: Date.now(),
    };
    const r1 = RewardEngine.computeTotalReward(input);
    const r2 = RewardEngine.computeTotalReward(input);
    expect(r1.total_reward).toBe(r2.total_reward);
    expect(r1.discovery_level).toBe(r2.discovery_level);
    console.log(`\n⚙️ Deterministic reward: ${r1.total_reward.toFixed(4)}`);
  });
});
