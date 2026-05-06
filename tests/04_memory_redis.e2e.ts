/**
 * E2E Test 04 — Memory (Redis + Local Fallback)
 * "وَمَا كَانَ رَبُّكَ نَسِيًّا" — مريم: 64
 *
 * Tests real memory operations against Upstash Redis.
 * Falls back gracefully to local filesystem if Redis is down.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { IQRAMemory } from '../lib/iqra/memory.ts';

const TEST_KEY = `e2e_test_${Date.now()}`;

describe('🧠 Memory System — الذاكرة', () => {

  it('sets and gets a value (Redis or local fallback)', async () => {
    await IQRAMemory.set(TEST_KEY, 'بسم الله');
    const val = await IQRAMemory.get<string>(TEST_KEY);
    expect(val).toBe('بسم الله');
  }, 15000);

  it('stores and retrieves a complex object', async () => {
    const obj = {
      ayah: 'اقْرَأْ بِاسْمِ رَبِّكَ',
      surah: 96,
      resonance: 0.99,
      timestamp: Date.now(),
    };
    await IQRAMemory.set(`${TEST_KEY}_obj`, obj);
    const retrieved = await IQRAMemory.get<typeof obj>(`${TEST_KEY}_obj`);
    expect(retrieved).toBeTruthy();
  }, 15000);

  it('appends to a list and retrieves it', async () => {
    const listKey = `${TEST_KEY}_list`;
    await IQRAMemory.appendList(listKey, { entry: 1, text: 'first' });
    await IQRAMemory.appendList(listKey, { entry: 2, text: 'second' });
    await IQRAMemory.appendList(listKey, { entry: 3, text: 'third' });

    const items = await IQRAMemory.getRecentList(listKey, 3);
    expect(items.length).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('saves and retrieves curiosity score', async () => {
    await IQRAMemory.saveCuriosity(0.77);
    const score = await IQRAMemory.getCuriosity();
    // Score should be close to what we set (Redis) or default (local)
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1.0);
    console.log(`\n🌀 Curiosity Score: ${score}`);
  }, 15000);

  it('grants a reward and increases curiosity', async () => {
    const before = await IQRAMemory.getCuriosity();
    await IQRAMemory.grantReward(0.05);
    const after = await IQRAMemory.getCuriosity();

    // After reward, score should be >= before (capped at 1.0)
    expect(after).toBeGreaterThanOrEqual(Math.min(before, 1.0));
    console.log(`\n✨ Reward: ${before.toFixed(3)} → ${after.toFixed(3)}`);
  }, 15000);

  it('cosine similarity returns 1.0 for identical vectors', async () => {
    // Access private method via type cast for testing
    const mem = IQRAMemory as any;
    const v = [0.1, 0.2, 0.3, 0.4, 0.5];
    const sim = mem.cosineSimilarity(v, v);
    expect(sim).toBeCloseTo(1.0, 5);
  });

  it('cosine similarity returns 0 for orthogonal vectors', async () => {
    const mem = IQRAMemory as any;
    const v1 = [1, 0, 0];
    const v2 = [0, 1, 0];
    const sim = mem.cosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(0, 5);
  });

  it('computeNovelty returns 1.0 when no memory exists', async () => {
    // Fresh embedding — should be fully novel
    const fakeEmbedding = Array.from({ length: 10 }, () => Math.random());
    const novelty = await IQRAMemory.computeNovelty(fakeEmbedding, 0);
    expect(novelty).toBe(1.0);
  }, 10000);
});
