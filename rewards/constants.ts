/**
 * 🌙 IQRA Reward Constants — ثوابت المكافآت
 */

export const REWARD_WEIGHTS = {
  NOVELTY: 0.20,
  RESONANCE: 0.25,
  TOPOLOGY: 0.20,
  FRACTAL: 0.20,
  LID: 0.15,
};

export const REWARD_THRESHOLDS = {
  SEED: 0.1,
  SPROUT: 0.3,
  BRANCH: 0.5,
  TREE: 0.7,
  RESONANCE: 0.85,
  TRUTH: 0.95,
};

export const CLAMPS = {
  MIN_SCORE: 0.0,
  MAX_SCORE: 1.0,
  MIN_REWARD: 0.0,
  MAX_REWARD: 100.0, // Scaled for the ledger
};

export const PENALTIES = {
  HALLUCINATION_MULTIPLIER: 2.0, // Severe penalty for hallucinations
};
