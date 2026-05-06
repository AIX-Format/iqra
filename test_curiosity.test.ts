import { it, expect, describe, vi } from 'vitest';
import { IQRAMemory } from './lib/iqra/memory';

describe('Topological Curiosity Test (E2E Wrapper)', () => {
  it('should correctly scale novelty based on vector distance', async () => {
    // Mock data: Three vectors
    const vectorA = [1, 0, 0, 0];
    const vectorB = [0.9, 0.1, 0, 0]; // High similarity to A
    const vectorC = [0, 1, 0, 0];   // Low similarity to A (Orthogonal)

    // Mock IQRAMemory.getRecentList
    const getRecentListSpy = vi.spyOn(IQRAMemory, 'getRecentList').mockImplementation(async () => {
        return [{ vector: vectorA }] as any[];
    });

    try {
        // Test 1: Similarity with self (should be ~0 novelty)
        const noveltySelf = await IQRAMemory.computeNovelty(vectorA);
        console.log(`Test 1 (Self): Novelty = ${noveltySelf.toFixed(4)}`);
        expect(noveltySelf).toBeLessThan(0.01);

        // Test 2: High similarity (should be low novelty)
        const noveltyHighSim = await IQRAMemory.computeNovelty(vectorB);
        console.log(`Test 2 (High Sim): Novelty = ${noveltyHighSim.toFixed(4)}`);

        // Test 3: Low similarity (should be high novelty)
        const noveltyLowSim = await IQRAMemory.computeNovelty(vectorC);
        console.log(`Test 3 (Low Sim): Novelty = ${noveltyLowSim.toFixed(4)}`);

        // Assertions
        expect(noveltyLowSim).toBeGreaterThan(noveltyHighSim);
        expect(noveltyHighSim).toBeGreaterThan(-0.01);
        
        console.log("✅ Curiosity logic verified via Vitest.");
    } finally {
        getRecentListSpy.mockRestore();
    }
  });
});
