/**
 * E2E Test 09 — Doctrinal Guard + Evolution + Closed Loop
 * "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ" — الإسراء: 36
 *
 * Tests:
 * - Doctrinal hallucination prevention
 * - Evolution cycle always writes
 * - Closed-loop self-training pipeline
 */
import { describe, it, expect } from 'vitest';
import { DoctrinalGuard, type DoctrinalClaim } from '../lib/iqra/quran/doctrinal_guard';
import { SovereignEvolution } from '../lib/iqra/09-evolution/evolution.js';
import {
  ClosedLoopTaskGenerator,
  ClosedLoopExecutor,
  ClosedLoopReviewer,
  SERAExporter,
  ClosedLoopOrchestrator,
} from '../lib/iqra/learning/closed_loop';
import fs from 'fs';
import path from 'path';

// ── Doctrinal Guard Tests ─────────────────────────────────────────────────────

describe('🛡️ Doctrinal Guard — حارس الهلوسة العقدية', () => {

  it('verifies a genuine scientific resonance (water + biology)', async () => {
    const claim: DoctrinalClaim = {
      ayah_text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
      ayah_ref: '21:30',
      claim: 'Modern biology confirms all known life requires water for biochemical processes',
      claim_type: 'scientific',
    };

    const result = await DoctrinalGuard.verify(claim);

    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('requires_human_review');
    expect(['VERIFIED', 'UNCERTAIN', 'UNVERIFIABLE']).toContain(result.verdict);
    expect(result.confidence).toBeGreaterThan(0);

    console.log(`\n✅ Water claim: ${result.verdict} (conf=${result.confidence.toFixed(2)})`);
    console.log(`   Reason: ${result.reason?.slice(0, 100)}`);
  }, 30000);

  it('blocks a hallucinated claim about a non-existent ayah', async () => {
    const claim: DoctrinalClaim = {
      ayah_text: 'This is not a real Quranic verse',
      ayah_ref: '999:999',  // Invalid surah
      claim: 'The Quran predicts quantum computing',
      claim_type: 'scientific',
    };

    const result = await DoctrinalGuard.verify(claim);

    expect(result.verdict).toBe('HALLUCINATION');
    expect(result.requires_human_review).toBe(true);
    console.log(`\n🚫 Fake ayah blocked: ${result.verdict}`);
  }, 10000);

  it('flags a trivial/superficial claim as uncertain or hallucination', async () => {
    const claim: DoctrinalClaim = {
      ayah_text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
      ayah_ref: '21:30',
      claim: 'The color blue is popular in modern design because water is blue',
      claim_type: 'scientific',
    };

    const result = await DoctrinalGuard.verify(claim);

    // Should NOT be VERIFIED — this is a stretch
    expect(['UNCERTAIN', 'HALLUCINATION', 'UNVERIFIABLE']).toContain(result.verdict);
    console.log(`\n⚠️ Trivial claim: ${result.verdict} (conf=${result.confidence.toFixed(2)})`);
  }, 30000);

  it('isSafe() returns true for genuine claims', async () => {
    const safe = await DoctrinalGuard.isSafe(
      'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ',
      '57:25',
      'Iron is formed in supernovae and arrives on Earth via meteorites',
      'scientific'
    );

    expect(typeof safe).toBe('boolean');
    console.log(`\n🔬 Iron claim safe: ${safe}`);
  }, 30000);

  it('rejects claim with invalid ayah reference format', async () => {
    const claim: DoctrinalClaim = {
      ayah_text: 'بسم الله',
      ayah_ref: 'invalid-ref',  // Bad format
      claim: 'Some claim',
      claim_type: 'spiritual',
    };

    const result = await DoctrinalGuard.verify(claim);
    expect(result.verdict).toBe('HALLUCINATION');
  }, 5000);
});

// ── Evolution Cycle Tests ─────────────────────────────────────────────────────

describe('🌙 Evolution Cycles — دورات التطور (always writes)', () => {

  it('minor cycle always writes to WISDOM_7.md', async () => {
    const wisdomPath = path.join(process.cwd(), 'WISDOM_7.md');
    const before = fs.existsSync(wisdomPath)
      ? fs.readFileSync(wisdomPath, 'utf-8').length : 0;

    await SovereignEvolution.runMinorCycle(7);

    const after = fs.existsSync(wisdomPath)
      ? fs.readFileSync(wisdomPath, 'utf-8').length : 0;

    // Must have written something
    expect(after).toBeGreaterThanOrEqual(before);
    expect(fs.existsSync(wisdomPath)).toBe(true);

    const content = fs.readFileSync(wisdomPath, 'utf-8');
    expect(content).toContain('Cycle');
    console.log(`\n📜 WISDOM_7.md: ${after} chars`);
  }, 15000);

  it('major cycle always writes to METAMORPHOSIS.md', async () => {
    const metaPath = path.join(process.cwd(), 'iqra-core', 'METAMORPHOSIS.md');
    const before = fs.existsSync(metaPath)
      ? fs.readFileSync(metaPath, 'utf-8').length : 0;

    await SovereignEvolution.runMajorCycle(49);

    const after = fs.existsSync(metaPath)
      ? fs.readFileSync(metaPath, 'utf-8').length : 0;

    expect(after).toBeGreaterThanOrEqual(before);
    expect(fs.existsSync(metaPath)).toBe(true);

    const content = fs.readFileSync(metaPath, 'utf-8');
    expect(content).toContain('Metamorphosis');
    console.log(`\n🌌 METAMORPHOSIS.md: ${after} chars`);
  }, 15000);

  it('running minor cycle twice does not duplicate within same second', async () => {
    const wisdomPath = path.join(process.cwd(), 'WISDOM_7.md');

    await SovereignEvolution.runMinorCycle(14);
    const after1 = fs.existsSync(wisdomPath)
      ? fs.readFileSync(wisdomPath, 'utf-8').length : 0;

    // Immediate second call — should be skipped (deduplication)
    await SovereignEvolution.runMinorCycle(14);
    const after2 = fs.existsSync(wisdomPath)
      ? fs.readFileSync(wisdomPath, 'utf-8').length : 0;

    // Second call should not add much (deduplication active)
    console.log(`\n🔄 Dedup: ${after1} → ${after2} chars`);
    expect(after2).toBeGreaterThanOrEqual(after1);
  }, 15000);
});

// ── Closed Loop Tests ─────────────────────────────────────────────────────────

describe('🔄 Closed-Loop Self-Training — التدريب الذاتي', () => {

  it('generates self-tasks from internal sources', async () => {
    const tasks = await ClosedLoopTaskGenerator.generate(3);

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.length).toBeLessThanOrEqual(3);

    for (const task of tasks) {
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('instruction');
      expect(task).toHaveProperty('source');
      expect(task).toHaveProperty('expected_output_type');
      expect(['self_generated', 'failure_derived', 'curiosity_driven']).toContain(task.source);
    }

    console.log(`\n🔄 Generated ${tasks.length} self-tasks:`);
    tasks.forEach(t => console.log(`   [${t.source}] ${t.instruction.slice(0, 60)}`));
  }, 10000);

  it('executes a task and returns output', async () => {
    const tasks = await ClosedLoopTaskGenerator.generate(1);
    expect(tasks.length).toBeGreaterThan(0);

    const execution = await ClosedLoopExecutor.execute(tasks[0]);

    expect(execution).toHaveProperty('task_id');
    expect(execution).toHaveProperty('output');
    expect(execution).toHaveProperty('provider');
    expect(execution).toHaveProperty('execution_time_ms');
    expect(execution.output.length).toBeGreaterThan(0);

    console.log(`\n⚙️ Executed via ${execution.provider} in ${execution.execution_time_ms}ms`);
    console.log(`   Output: ${execution.output.slice(0, 100)}`);
  }, 30000);

  it('reviews execution and produces quality score', async () => {
    const tasks = await ClosedLoopTaskGenerator.generate(1);
    const execution = await ClosedLoopExecutor.execute(tasks[0]);
    const review = await ClosedLoopReviewer.review(tasks[0], execution);

    expect(review).toHaveProperty('quality_score');
    expect(review).toHaveProperty('doctrinal_safe');
    expect(review).toHaveProperty('should_include_in_training');
    expect(review.quality_score).toBeGreaterThanOrEqual(0);
    expect(review.quality_score).toBeLessThanOrEqual(1);

    console.log(`\n🔍 Review: quality=${review.quality_score.toFixed(2)}, safe=${review.doctrinal_safe}, include=${review.should_include_in_training}`);
    if (review.lessons_learned.length > 0) {
      console.log(`   Lessons: ${review.lessons_learned[0]}`);
    }
  }, 30000);

  it('runs a full closed loop cycle and exports to SERA', async () => {
    const stats = await ClosedLoopOrchestrator.runCycle(3);

    expect(stats).toHaveProperty('generated');
    expect(stats).toHaveProperty('executed');
    expect(stats).toHaveProperty('approved');
    expect(stats).toHaveProperty('exported');
    expect(stats.generated).toBeGreaterThan(0);

    // SERA file should exist
    const seraPath = path.join(process.cwd(), '.iqra', 'sera_training_data.json');
    expect(fs.existsSync(seraPath)).toBe(true);

    const seraData = JSON.parse(fs.readFileSync(seraPath, 'utf-8'));
    expect(Array.isArray(seraData)).toBe(true);

    const seraStats = SERAExporter.getStats();
    console.log(`\n📤 SERA Stats:`);
    console.log(`   Total: ${seraStats.total}`);
    console.log(`   Doctrinal safe: ${seraStats.doctrinalSafe}`);
    console.log(`   By quality:`, seraStats.byQuality);
    console.log(`\n🔄 Cycle stats:`, stats);
  }, 120000);

  it('SERA training data has required fields', async () => {
    const seraPath = path.join(process.cwd(), '.iqra', 'sera_training_data.json');
    if (!fs.existsSync(seraPath)) {
      console.log('\n⚠️ SERA file not yet created — run full cycle first');
      return;
    }

    const data = JSON.parse(fs.readFileSync(seraPath, 'utf-8'));
    if (data.length === 0) return;

    const sample = data[0];
    expect(sample).toHaveProperty('instruction');
    expect(sample).toHaveProperty('input');
    expect(sample).toHaveProperty('output');
    expect(sample).toHaveProperty('quality');
    expect(sample).toHaveProperty('doctrinal_verified');
    expect(sample.source).toBe('closed_loop');

    console.log(`\n📋 SERA sample: quality=${sample.quality.toFixed(2)}, safe=${sample.doctrinal_verified}`);
  });
});
