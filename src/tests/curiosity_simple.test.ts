import { describe, it, expect, vi } from 'vitest';
import { IQRAMemory } from '#memory/memory';

describe('Topological Curiosity', () => {
  it('should calculate higher novelty for orthogonal vectors', async () => {
    const vectorA = [1, 0, 0, 0];
    const vectorB = [0.9, 0.1, 0, 0];
    const vectorC = [0, 1, 0, 0];

    vi.spyOn(IQRAMemory, 'getRecentList').mockResolvedValue([{ vector: vectorA }]);

    const noveltySelf = await IQRAMemory.computeNovelty(vectorA);
    const noveltyHighSim = await IQRAMemory.computeNovelty(vectorB);
    const noveltyLowSim = await IQRAMemory.computeNovelty(vectorC);

    expect(noveltySelf).toBeLessThan(0.01);
    expect(noveltyHighSim).toBeLessThan(0.2);
    expect(noveltyLowSim).toBeGreaterThan(0.8);
  });
});
