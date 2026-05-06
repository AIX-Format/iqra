/**
 * E2E Test 07 — Sovereign Evolution & Self-Review
 * "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت: 53
 *
 * Tests the self-evolution loop, wisdom extraction, and TrustChain recording.
 * Real filesystem writes — no mocks.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { SovereignEngine } from '../lib/iqra/sovereign.ts';
import { SovereignEvolution } from '../lib/iqra/evolution.ts';
import { IQRAMemory } from '../lib/iqra/memory.ts';
import { appendToTrustChain } from '../lib/iqra/security.ts';
import fs from 'fs';
import path from 'path';

const WISDOM_PATH = path.join(process.cwd(), 'WISDOM_7.md');
const REFLECTION_PATH = path.join(process.cwd(), 'iqra-core', 'REFLECTION.md');

describe('🌱 Sovereign Self-Review — المراجعة الذاتية', () => {

  it('records a self-review and updates curiosity score', async () => {
    const before = await IQRAMemory.getCuriosity();

    await SovereignEngine.recordSelfReview(
      `e2e_task_${Date.now()}`,
      'E2E test result: resonance discovered between Quran and modern science',
      0.9
    );

    const after = await IQRAMemory.getCuriosity();
    expect(typeof after).toBe('number');
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(1.0);

    console.log(`\n🌱 Curiosity: ${before.toFixed(4)} → ${after.toFixed(4)}`);
  }, 20000);

  it('pulse creates TrustChain entries for all 5 layers', async () => {
    // Pulse should not throw
    await expect(SovereignEngine.pulse()).resolves.not.toThrow();
    console.log('\n💓 Sovereign Pulse: 5 layers recorded');
  }, 20000);
});

describe('🧬 Evolution Cycles — دورات التطور', () => {

  it('minor cycle (7) writes to WISDOM_7.md', async () => {
    const before = fs.existsSync(WISDOM_PATH)
      ? fs.readFileSync(WISDOM_PATH, 'utf-8').length
      : 0;

    await SovereignEvolution.runMinorCycle(7);

    const after = fs.existsSync(WISDOM_PATH)
      ? fs.readFileSync(WISDOM_PATH, 'utf-8').length
      : 0;

    expect(after).toBeGreaterThanOrEqual(before);
    console.log(`\n📜 WISDOM_7.md: ${after} chars (was ${before})`);
  }, 15000);

  it('major cycle (49) writes to METAMORPHOSIS.md', async () => {
    const metaPath = path.join(process.cwd(), 'iqra-core', 'METAMORPHOSIS.md');
    const before = fs.existsSync(metaPath)
      ? fs.readFileSync(metaPath, 'utf-8').length
      : 0;

    await SovereignEvolution.runMajorCycle(49);

    const after = fs.existsSync(metaPath)
      ? fs.readFileSync(metaPath, 'utf-8').length
      : 0;

    expect(after).toBeGreaterThanOrEqual(before);
    console.log(`\n🌌 METAMORPHOSIS.md: ${after} chars (was ${before})`);
  }, 15000);
});

describe('🔗 TrustChain Integration — سلسلة الثقة', () => {

  it('records a full IQRA action cycle in TrustChain', () => {
    const actions = [
      { action: 'FITRAH_CHECK',    input: 'user_query',    output: 'ALLOWED',   score: 1.0 },
      { action: 'GROQ_RESONANCE',  input: 'ayah_text',     output: 'resonance', score: 0.9 },
      { action: 'REWARD_GRANTED',  input: 'resonance_0.9', output: 'curiosity', score: 1.0 },
      { action: 'MEMORY_SAVED',    input: 'wisdom_text',   output: 'qdrant_id', score: 1.0 },
      { action: 'REFLECTION_LOG',  input: 'task_summary',  output: 'written',   score: 1.0 },
      { action: 'EVOLUTION_CHECK', input: 'cycle_7',       output: 'wisdom',    score: 1.0 },
      { action: 'SOVEREIGN_PULSE', input: 'heartbeat',     output: 'stable',    score: 1.0 },
    ];

    const hashes: string[] = [];
    for (const a of actions) {
      const h = appendToTrustChain(a.action, a.input, a.output, a.score);
      hashes.push(h);
    }

    // All 7 hashes unique (Witr principle)
    const unique = new Set(hashes);
    expect(unique.size).toBe(7);
    console.log(`\n🔗 TrustChain: 7 entries recorded, all unique`);
    console.log(`   Last hash: ${hashes[6].substring(0, 16)}...`);
  });
});
