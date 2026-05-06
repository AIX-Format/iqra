/**
 * 🔍 Logic Verification Script | التحقق من المنطق
 * 
 * Verifies CuriosityEngine logic without the overhead of a test runner.
 */

import { CuriosityEngine, ResonanceType } from '../lib/iqra/quran/curiosity';
import { IQRAMemory } from '../lib/iqra/memory';
import { IQRALogger } from '../lib/iqra/logger';
import * as groqModule from '../lib/iqra/llm/groq';

// Mocking directly on the imports if possible, or using a simple wrapper
async function runVerification() {
    IQRALogger.info("🚀 Starting Logic Verification...");

    // 1. Mock Reward Granting to avoid Redis/Supabase
    (IQRAMemory as any).grantReward = async (amt: number) => {
        IQRALogger.info(`[MOCK REWARD] Granted: ${amt}`);
    };
    (IQRAMemory as any).getCuriosity = async () => 0.6;

    // 2. Test Case: Valid Scientific Resonance
    IQRALogger.info("\n--- Test Case 1: Valid Scientific Resonance ---");
    const validResonance = {
        type: ResonanceType.SCIENTIFIC,
        reason: "This is a long enough scientific reason that should pass truth validation.",
        confidence: 0.9,
        isTrivial: false
    };

    // We can't easily mock Groq call inside the static method without a real mock library 
    // unless we change the code to take a provider, but we can just test the validation methods.
    
    const result1 = await (CuriosityEngine as any).validateTruth("ayah", "data", validResonance);
    IQRALogger.info(`Result 1 (Should be true): ${result1}`);

    // 3. Test Case: Invalid (Short) Scientific Resonance
    IQRALogger.info("\n--- Test Case 2: Invalid (Short) Scientific Resonance ---");
    const invalidResonance = {
        type: ResonanceType.SCIENTIFIC,
        reason: "Too short.",
        confidence: 0.9,
        isTrivial: false
    };
    const result2 = await (CuriosityEngine as any).validateTruth("ayah", "data", invalidResonance);
    IQRALogger.info(`Result 2 (Should be false): ${result2}`);

    IQRALogger.info("\n✅ Logic Verification Complete.");
}

runVerification().catch(err => {
    console.error(err);
    process.exit(1);
});
