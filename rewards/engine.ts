import { RewardInput, RewardOutput, DiscoveryLevel, RewardVector } from './types';
import { REWARD_WEIGHTS, REWARD_THRESHOLDS, CLAMPS, PENALTIES } from './constants';

/**
 * 🌙 IQRA Reward Engine — محرك المكافآت
 * 
 * Enhanced deterministic functions for computing topological curiosity rewards
 * with adaptive weighting, temporal decay, and anomaly detection.
 */

export interface RewardMetrics {
  total_processed: number;
  average_reward: number;
  discovery_distribution: Record<DiscoveryLevel, number>;
  last_updated: number;
}

export interface RewardHistory {
  entries: Array<{
    timestamp: number;
    reward: number;
    level: DiscoveryLevel;
    confidence: number;
  }>;
  max_entries: number;
}

export class RewardEngine {
  private static metrics: RewardMetrics = {
    total_processed: 0,
    average_reward: 0,
    discovery_distribution: {
      [DiscoveryLevel.SEED]: 0,
      [DiscoveryLevel.SPROUT]: 0,
      [DiscoveryLevel.BRANCH]: 0,
      [DiscoveryLevel.TREE]: 0,
      [DiscoveryLevel.RESONANCE]: 0
    },
    last_updated: Date.now()
  };

  private static history: RewardHistory = {
    entries: [],
    max_entries: 1000
  };

  static computeNoveltyReward(score: number, temporal_factor: number = 1.0): number {
    const clamped = this.clamp(score);
    const adaptive_weight = REWARD_WEIGHTS.NOVELTY * this.getAdaptiveWeight('novelty');
    return clamped * adaptive_weight * temporal_factor;
  }

  static computeResonanceReward(score: number, temporal_factor: number = 1.0): number {
    const clamped = this.clamp(score);
    const adaptive_weight = REWARD_WEIGHTS.RESONANCE * this.getAdaptiveWeight('resonance');
    return clamped * adaptive_weight * temporal_factor;
  }

  static computeTopologyReward(score: number, temporal_factor: number = 1.0): number {
    const clamped = this.clamp(score);
    const adaptive_weight = REWARD_WEIGHTS.TOPOLOGY * this.getAdaptiveWeight('topology');
    return clamped * adaptive_weight * temporal_factor;
  }

  static computePenalty(penalty: number, severity_multiplier: number = 1.0): number {
    const clamped = this.clamp(penalty);
    const base_penalty = clamped * PENALTIES.HALLUCINATION_MULTIPLIER;
    return base_penalty * severity_multiplier;
  }

  static computeTotalReward(input: RewardInput): RewardOutput {
    // 1. Enhanced validation
    this.validateInput(input);

    // 2. Compute temporal factors
    const temporal_factors = this.computeTemporalFactors(input.timestamp);

    // 3. Component rewards with adaptive weighting
    const novelty = this.computeNoveltyReward(input.novelty_score, temporal_factors.novelty);
    const resonance = this.computeResonanceReward(input.resonance_score, temporal_factors.resonance);
    const topology = this.computeTopologyReward(input.topology_score, temporal_factors.topology);
    
    // 4. Enhanced penalty calculation
    const severity_multiplier = this.calculatePenaltySeverity(input.hallucination_penalty);
    const penalty = this.computePenalty(input.hallucination_penalty, severity_multiplier);

    // 5. Total calculation with anomaly detection
    let total = (novelty + resonance + topology) - penalty;
    total = Math.max(CLAMPS.MIN_REWARD, total);
    
    // 6. Apply temporal decay for recent rewards
    total = this.applyTemporalDecay(total, input.timestamp);

    // 7. Enhanced discovery level determination
    const level = this.determineDiscoveryLevel(total);

    // 8. Advanced confidence calculation
    const confidence = this.calculateConfidence(input, total);

    // 9. Update metrics and history
    this.updateMetrics(total, level, confidence);

    return {
      total_reward: total,
      discovery_level: level,
      confidence,
      reward_vector: {
        novelty,
        resonance,
        topology,
        penalty
      },
      temporal_factors,
      anomaly_detected: this.detectAnomaly(total)
    };
  }

  static determineDiscoveryLevel(score: number): DiscoveryLevel {
    // Dynamic threshold adjustment based on historical performance
    const adjusted_thresholds = this.getAdjustedThresholds();
    
    if (score >= adjusted_thresholds.RESONANCE) return DiscoveryLevel.RESONANCE;
    if (score >= adjusted_thresholds.TREE) return DiscoveryLevel.TREE;
    if (score >= adjusted_thresholds.BRANCH) return DiscoveryLevel.BRANCH;
    if (score >= adjusted_thresholds.SPROUT) return DiscoveryLevel.SPROUT;
    return DiscoveryLevel.SEED;
  }

  static getMetrics(): RewardMetrics {
    return { ...this.metrics };
  }

  static getRecentHistory(count: number = 10): RewardHistory['entries'] {
    return this.history.entries.slice(-count);
  }

  static resetMetrics(): void {
    this.metrics = {
      total_processed: 0,
      average_reward: 0,
      discovery_distribution: {
        [DiscoveryLevel.SEED]: 0,
        [DiscoveryLevel.SPROUT]: 0,
        [DiscoveryLevel.BRANCH]: 0,
        [DiscoveryLevel.TREE]: 0,
        [DiscoveryLevel.RESONANCE]: 0
      },
      last_updated: Date.now()
    };
    this.history.entries = [];
  }

  private static getAdaptiveWeight(component: 'novelty' | 'resonance' | 'topology'): number {
    // Adaptive weighting based on recent performance
    const recent_entries = this.getRecentHistory(50);
    if (recent_entries.length < 10) return 1.0; // Not enough data

    const component_performance = this.calculateComponentPerformance(component, recent_entries);
    return 0.8 + (component_performance * 0.4); // Range: 0.8 to 1.2
  }

  private static computeTemporalFactors(timestamp: number): Record<string, number> {
    const now = Date.now();
    const age_hours = (now - timestamp) / (1000 * 60 * 60);
    
    // Novelty decays faster than resonance and topology
    return {
      novelty: Math.exp(-age_hours / 24), // 24-hour half-life
      resonance: Math.exp(-age_hours / 72), // 3-day half-life
      topology: Math.exp(-age_hours / 168) // 1-week half-life
    };
  }

  private static calculatePenaltySeverity(penalty: number): number {
    // Exponential scaling for severe penalties
    if (penalty > 0.8) return 2.0;
    if (penalty > 0.6) return 1.5;
    if (penalty > 0.4) return 1.2;
    return 1.0;
  }

  private static applyTemporalDecay(reward: number, timestamp: number): number {
    const age_hours = (Date.now() - timestamp) / (1000 * 60 * 60);
    const decay_factor = Math.exp(-age_hours / 168); // 1-week decay
    return reward * decay_factor;
  }

  private static calculateConfidence(input: RewardInput, total_reward: number): number {
    // Base confidence from hallucination penalty
    let confidence = 1.0 - (input.hallucination_penalty * 0.5);
    
    // Adjust based on reward consistency
    const recent_rewards = this.getRecentHistory(20).map(e => e.reward);
    if (recent_rewards.length >= 5) {
      const variance = this.calculateVariance(recent_rewards);
      const consistency_bonus = Math.max(0, 1.0 - variance);
      confidence = confidence * 0.7 + consistency_bonus * 0.3;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squared_diffs = values.map(x => Math.pow(x - mean, 2));
    return squared_diffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private static calculateComponentPerformance(component: string, entries: any[]): number {
    // Simplified component performance calculation
    // In a real implementation, this would analyze the specific component contributions
    return 0.5; // Neutral value for now
  }

  private static getAdjustedThresholds(): typeof REWARD_THRESHOLDS {
    // Adjust thresholds based on historical performance
    const avg_reward = this.metrics.average_reward;
    const adjustment = avg_reward > 0.5 ? 0.05 : -0.05; // Shift thresholds up or down
    
    return {
      SEED: REWARD_THRESHOLDS.SEED + adjustment,
      SPROUT: REWARD_THRESHOLDS.SPROUT + adjustment,
      BRANCH: REWARD_THRESHOLDS.BRANCH + adjustment,
      TREE: REWARD_THRESHOLDS.TREE + adjustment,
      RESONANCE: REWARD_THRESHOLDS.RESONANCE + adjustment
    };
  }

  private static detectAnomaly(reward: number): boolean {
    if (this.history.entries.length < 20) return false;
    
    const recent_rewards = this.getRecentHistory(20).map(e => e.reward);
    const mean = recent_rewards.reduce((a, b) => a + b, 0) / recent_rewards.length;
    const std_dev = Math.sqrt(this.calculateVariance(recent_rewards));
    
    // Flag as anomaly if more than 2 standard deviations from mean
    return Math.abs(reward - mean) > 2 * std_dev;
  }

  private static updateMetrics(reward: number, level: DiscoveryLevel, confidence: number): void {
    // Update running average
    const total = this.metrics.total_processed;
    this.metrics.average_reward = (this.metrics.average_reward * total + reward) / (total + 1);
    this.metrics.total_processed++;
    
    // Update discovery distribution
    this.metrics.discovery_distribution[level]++;
    
    // Update history
    this.history.entries.push({
      timestamp: Date.now(),
      reward,
      level,
      confidence
    });
    
    // Trim history if too long
    if (this.history.entries.length > this.history.max_entries) {
      this.history.entries = this.history.entries.slice(-this.history.max_entries);
    }
    
    this.metrics.last_updated = Date.now();
  }

  private static clamp(val: number): number {
    if (isNaN(val) || !isFinite(val)) return CLAMPS.MIN_SCORE;
    return Math.min(Math.max(val, CLAMPS.MIN_SCORE), CLAMPS.MAX_SCORE);
  }

  private static validateInput(input: RewardInput): void {
    if (!input.mission_id || !input.worker_id) {
      throw new Error('Invalid input: mission_id and worker_id are required.');
    }
    
    const scores = [input.novelty_score, input.resonance_score, input.topology_score, input.hallucination_penalty];
    if (scores.some(s => isNaN(s) || s === undefined || !isFinite(s))) {
      throw new Error('Invalid input: scores must be numeric, defined, and finite.');
    }
    
    if (input.timestamp <= 0 || input.timestamp > Date.now() + 86400000) { // Allow 1 day future
      throw new Error('Invalid input: timestamp must be reasonable.');
    }
  }
}
