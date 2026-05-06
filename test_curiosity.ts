import { IQRAMemory } from './lib/iqra/memory';

/**
 * 🧪 IQRA | Curiosity Test
 * 
 * Verifies that the Topological Curiosity (Novelty) reward works as expected.
 */
async function testCuriosity() {
  console.log("🚀 Starting Topological Curiosity Test...");

  // Mock data: Three vectors
  const vectorA = [1, 0, 0, 0];
  const vectorB = [0.9, 0.1, 0, 0]; // High similarity to A
  const vectorC = [0, 1, 0, 0];   // Low similarity to A (Orthogonal)

  // We will mock IQRAMemory.getRecentList to return vectorA
  const originalGetRecentList = IQRAMemory.getRecentList;
  
  try {
    // Test 1: Similarity with self (should be ~0 novelty)
    (IQRAMemory as any).getRecentList = async () => [{ vector: vectorA }];
    const noveltySelf = await IQRAMemory.computeNovelty(vectorA);
    console.log(`Test 1 (Self): Novelty = ${noveltySelf.toFixed(4)} (Expected ~0)`);

    // Test 2: High similarity (should be low novelty)
    const noveltyHighSim = await IQRAMemory.computeNovelty(vectorB);
    console.log(`Test 2 (High Sim): Novelty = ${noveltyHighSim.toFixed(4)} (Expected low)`);

    // Test 3: Low similarity (should be high novelty)
    const noveltyLowSim = await IQRAMemory.computeNovelty(vectorC);
    console.log(`Test 3 (Low Sim): Novelty = ${noveltyLowSim.toFixed(4)} (Expected high)`);

    // Validation
    if (noveltyLowSim > noveltyHighSim && noveltyHighSim > -0.01) {
      console.log("✅ [GREEN] Curiosity logic verified: Novelty correctly scales with distance.");
      console.log(`📊 Rewards range: [${noveltySelf.toFixed(2)}, ${noveltyLowSim.toFixed(2)}]`);
    } else {
      throw new Error("❌ Test Failed: Novelty scores do not follow the expected hierarchy.");
    }

  } catch (error) {
    console.error("❌ Test Error:", error);
    process.exit(1);
  } finally {
    (IQRAMemory as any).getRecentList = originalGetRecentList;
  }
}

testCuriosity();
