/**
 * IQRA Memory Coordinator - منسق الذاكرة
 * 
 * "وَمَا أَنزَلْنَا مِنَ الذِّكْرِ بِمَا فِيهِ حِكْمَةٌ" - الإسراء: 12
 * 
 * Coordinates memory operations across all tiers and components
 */

import { IQRALogger } from './logger';
import { IQRAMemory } from './memory';

// [TC] reason: Export memory access methods for coordinator | id: TC-05-export
export { getRedis, getQdrant, getGoogleAI, getSupabase } from './memory';

/**
 * Memory tier coordination interface
 */
export interface MemoryTier {
  name: string;
  level: number; // 0-3 for L0-L3
  status: 'active' | 'degraded' | 'offline';
  lastAccess: number;
  size: number;
}

/**
 * Memory operation metrics
 */
export interface MemoryMetrics {
  totalOperations: number;
  cacheHitRate: number;
  averageLatency: number;
  errorRate: number;
  tierUtilization: Record<string, number>;
}

/**
 * Memory coordinator for managing all memory tiers
 */
export class MemoryCoordinator {
  private static instance: MemoryCoordinator | null = null;
  private tiers: Map<string, MemoryTier> = new Map();
  private metrics: MemoryMetrics = {
    totalOperations: 0,
    cacheHitRate: 0,
    averageLatency: 0,
    errorRate: 0,
    tierUtilization: {}
  };

  static getInstance(): MemoryCoordinator {
    if (!this.instance) {
      this.instance = new MemoryCoordinator();
    }
    return this.instance;
  }

  /**
   * Initialize memory coordinator with all tiers
   */
  async initialize(): Promise<void> {
    IQRALogger.info('🧠 [MEMORY_COORD] Initializing memory coordinator...');
    
    // Initialize L0 (RAM) tier
    await this.registerTier('L0', 0, 'active');
    
    // Initialize L1 (Redis) tier
    try {
      const redis = await IQRAMemory['getRedis']();
      if (redis) {
        await this.registerTier('L1', 1, 'active');
      } else {
        await this.registerTier('L1', 1, 'degraded');
      }
    } catch (error) {
      await this.registerTier('L1', 1, 'offline');
      IQRALogger.warn('⚠️ [MEMORY_COORD] L1 tier offline:', error);
    }
    
    // Initialize L2 (Qdrant) tier
    try {
      const qdrant = await IQRAMemory['getQdrant']();
      if (qdrant) {
        await this.registerTier('L2', 2, 'active');
      } else {
        await this.registerTier('L2', 2, 'degraded');
      }
    } catch (error) {
      await this.registerTier('L2', 2, 'offline');
      IQRALogger.warn('⚠️ [MEMORY_COORD] L2 tier offline:', error);
    }
    
    // Initialize L3 (Cloud/Local) tier
    try {
      const supabase = await IQRAMemory['getSupabase']();
      if (supabase) {
        await this.registerTier('L3', 3, 'active');
      } else {
        await this.registerTier('L3', 3, 'degraded');
      }
    } catch (error) {
      await this.registerTier('L3', 3, 'offline');
      IQRALogger.warn('⚠️ [MEMORY_COORD] L3 tier offline:', error);
    }
    
    IQRALogger.info('✅ [MEMORY_COORD] Memory coordinator initialized');
  }

  /**
   * Register a memory tier
   */
  private async registerTier(name: string, level: number, status: MemoryTier['status']): Promise<void> {
    const tier: MemoryTier = {
      name,
      level,
      status,
      lastAccess: Date.now(),
      size: await this.getTierSize(name)
    };
    
    this.tiers.set(name, tier);
    IQRALogger.info(`📊 [MEMORY_COORD] Tier ${name} (${status}): ${tier.size} bytes`);
  }

  /**
   * Get tier size estimate
   */
  private async getTierSize(tierName: string): Promise<number> {
    try {
      switch (tierName) {
        case 'L0':
          // Local storage size
          const data = await IQRAMemory['getLocalData']();
          return JSON.stringify(data).length;
        
        case 'L1':
          // Redis memory usage
          const redis = await IQRAMemory['getRedis']();
          if (redis) {
            // Simple estimation based on key count
            const keys = await IQRAMemory['getAllKeys']();
            return keys.length * 1024; // Rough estimate
          }
          return 0;
        
        case 'L2':
          // Qdrant collection size
          return 50 * 1024 * 1024; // Rough estimate for 50 vectors
        
        case 'L3':
          // Supabase storage
          return 100 * 1024 * 1024; // Rough estimate
        
        default:
          return 0;
      }
    } catch (error) {
      IQRALogger.warn(`⚠️ [MEMORY_COORD] Failed to get tier ${tierName} size:`, error);
      return 0;
    }
  }

  /**
   * Coordinate memory operation across tiers
   */
  async coordinateOperation<T>(
    operation: () => Promise<T>,
    preferredTier?: string,
    fallbackTiers: string[] = ['L1', 'L0', 'L2', 'L3']
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalOperations++;
    
    // Try preferred tier first
    if (preferredTier) {
      const tier = this.tiers.get(preferredTier);
      if (tier && tier.status === 'active') {
        try {
          const result = await operation();
          const latency = Date.now() - startTime;
          this.updateMetrics(preferredTier, true, latency);
          return result;
        } catch (error) {
          this.updateMetrics(preferredTier, false, 0);
          IQRALogger.warn(`⚠️ [MEMORY_COORD] Preferred tier ${preferredTier} failed:`, error);
          // Continue to fallback tiers
        }
      }
    }

    // Try fallback tiers in order
    for (const tierName of fallbackTiers) {
      const tier = this.tiers.get(tierName);
      if (tier && tier.status === 'active') {
        try {
          const result = await operation();
          const latency = Date.now() - startTime;
          this.updateMetrics(tierName, true, latency);
          tier.lastAccess = Date.now();
          return result;
        } catch (error) {
          this.updateMetrics(tierName, false, 0);
          IQRALogger.warn(`⚠️ [MEMORY_COORD] Fallback tier ${tierName} failed:`, error);
          continue;
        }
      }
    }

    // All tiers failed
    this.metrics.errorRate++;
    throw new Error('All memory tiers unavailable');
  }

  /**
   * Update metrics for a tier
   */
  private updateMetrics(tierName: string, success: boolean, latency: number): void {
    const tier = this.tiers.get(tierName);
    if (!tier) return;

    tier.lastAccess = Date.now();
    
    // Update cache hit rate
    if (success) {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * 0.9) + 0.1;
    } else {
      this.metrics.cacheHitRate = this.metrics.cacheHitRate * 0.9;
    }
    
    // Update average latency
    const totalLatency = this.metrics.averageLatency * (this.metrics.totalOperations - 1) + latency;
    this.metrics.averageLatency = totalLatency / this.metrics.totalOperations;
    
    // Update tier utilization
    this.metrics.tierUtilization[tierName] = 
      (this.metrics.tierUtilization[tierName] || 0) + (success ? 1 : 0);
  }

  /**
   * Get current memory metrics
   */
  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }

  /**
   * Get tier status
   */
  getTierStatus(): Record<string, MemoryTier> {
    const status: Record<string, MemoryTier> = {};
    for (const [name, tier] of this.tiers) {
      status[name] = { ...tier };
    }
    return status;
  }

  /**
   * Health check for all tiers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [tierName, tier] of this.tiers) {
      try {
        // Simple ping/availability check
        switch (tierName) {
          case 'L0':
            // Always available (local storage)
            health[tierName] = true;
            break;
            
          case 'L1':
            const redis = await IQRAMemory['getRedis']();
            health[tierName] = redis !== null;
            break;
            
          case 'L2':
            const qdrant = await IQRAMemory['getQdrant']();
            health[tierName] = qdrant !== null;
            break;
            
          case 'L3':
            const supabase = await IQRAMemory['getSupabase']();
            health[tierName] = supabase !== null;
            break;
            
          default:
            health[tierName] = false;
        }
      } catch (error) {
        health[tierName] = false;
        IQRALogger.warn(`⚠️ [MEMORY_COORD] Health check failed for ${tierName}:`, error);
      }
    }
    
    return health;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    IQRALogger.info('🧹 [MEMORY_COORD] Cleaning up memory coordinator...');
    this.tiers.clear();
    this.metrics = {
      totalOperations: 0,
      cacheHitRate: 0,
      averageLatency: 0,
      errorRate: 0,
      tierUtilization: {}
    };
    IQRALogger.info('✅ [MEMORY_COORD] Memory coordinator cleaned up');
  }
}
