/**
 * Hierarchical Memory System - 3-Layer Memory Cache with IQRA 7-Layer Integration
 * Integrates with IQRA 7-Layer Architecture for intelligent memory management
 * 
 * "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 * 
 * Memory Hierarchy:
 * L0: nanosecond-level sacred constants (49 items, 1min TTL)
 * L1: microsecond-level pattern fingerprints (200 items, 5min TTL)
 * L2: millisecond-level topological features (1000 items, 30min TTL)
 * L3: second-level pattern relationships (5000 items, 2hr TTL)
 * L4: minute-level wisdom integration (unlimited, 24hr TTL)
 */

import { IQRASevenLayerArchitecture } from './IQRASevenLayerArchitecture';
import { TopologicalSignature } from './QalbinVM';
import { ShannonEntropyResult } from './ShannonHELEntropy';
import { QuantumPatternResult } from './QuantumPatternDetector';

// ── Core Types ────────────────────────────────────────────────────────────────

export interface MemoryLayer {
  /** Layer identifier */
  id: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  /** Access time in nanoseconds */
  access_time_ns: number;
  /** Maximum capacity */
  max_capacity: number;
  /** Current size */
  current_size: number;
  /** TTL in milliseconds */
  ttl_ms: number;
  /** Storage backend */
  backend: 'hot' | 'warm' | 'cold' | 'persistent';
}

export interface MemoryEntry {
  /** Unique identifier */
  id: string;
  /** Memory value */
  value: any;
  /** Creation timestamp */
  created_at: number;
  /** Last access timestamp */
  last_accessed: number;
  /** Access count */
  access_count: number;
  /** Memory layer */
  layer: MemoryLayer['id'];
  /** Priority score */
  priority: number;
  /** Tags for classification */
  tags: string[];
  /** Size in bytes */
  size_bytes: number;
}

export interface MemoryStats {
  /** Total entries across all layers */
  total_entries: number;
  /** Total memory usage */
  total_memory_mb: number;
  /** Hit rates per layer */
  hit_rates: Record<MemoryLayer['id'], number>;
  /** Average access time */
  avg_access_time_ns: number;
  /** Promotion statistics */
  promotions: {
    l0_to_l1: number;
    l1_to_l2: number;
    l2_to_l3: number;
    l3_to_l4: number;
  };
}

export interface WisdomIntegration {
  /** Integrated wisdom entries */
  wisdom_entries: Array<{
    id: string;
    wisdom: string;
    source_patterns: string[];
    confidence: number;
    created_at: number;
  }>;
  /** Pattern relationships */
  pattern_relationships: Array<{
    pattern1: string;
    pattern2: string;
    relationship_type: 'causal' | 'correlation' | 'hierarchical' | 'temporal';
    strength: number;
  }>;
  /** Learning insights */
  learning_insights: Array<{
    insight: string;
    evidence: string[];
    confidence: number;
  }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Memory layer configurations */
const MEMORY_LAYERS: Record<MemoryLayer['id'], MemoryLayer> = {
  L0: {
    id: 'L0',
    access_time_ns: 1, // 1 nanosecond
    max_capacity: 49,
    current_size: 0,
    ttl_ms: 60000, // 1 minute
    backend: 'hot'
  },
  L1: {
    id: 'L1',
    access_time_ns: 1000, // 1 microsecond
    max_capacity: 200,
    current_size: 0,
    ttl_ms: 300000, // 5 minutes
    backend: 'hot'
  },
  L2: {
    id: 'L2',
    access_time_ns: 1000000, // 1 millisecond
    max_capacity: 1000,
    current_size: 0,
    ttl_ms: 1800000, // 30 minutes
    backend: 'warm'
  },
  L3: {
    id: 'L3',
    access_time_ns: 1000000000, // 1 second
    max_capacity: 5000,
    current_size: 0,
    ttl_ms: 7200000, // 2 hours
    backend: 'cold'
  },
  L4: {
    id: 'L4',
    access_time_ns: 60000000000, // 1 minute
    max_capacity: Infinity,
    current_size: 0,
    ttl_ms: 86400000, // 24 hours
    backend: 'persistent'
  }
};

/** Sacred constants for L0 cache */
const SACRED_CONSTANTS = {
  SEVEN: 7,
  NINETEEN: 19,
  FORTY: 40,
  TESLA_SEQUENCE: [3, 6, 9],
  BISMALLAH: 'بسم الله الرحمن الرحيم',
  HAMMAD: 'الحمد لله رب العالمين'
};

/** Promotion thresholds */
const PROMOTION_THRESHOLDS = {
  L0_TO_L1: 10, // accesses
  L1_TO_L2: 25,
  L2_TO_L3: 50,
  L3_TO_L4: 100
};

// ── HierarchicalMemorySystem Class ─────────────────────────────────────────────

export class HierarchicalMemorySystem {
  private iqraArchitecture: IQRASevenLayerArchitecture;
  private memoryLayers: Map<MemoryLayer['id'], Map<string, MemoryEntry>>;
  private accessStats: Map<string, { count: number; last_access: number }>;
  private promotionStats: MemoryStats['promotions'];
  private wisdomIntegration: WisdomIntegration;

  constructor() {
    this.iqraArchitecture = new IQRASevenLayerArchitecture();
    this.memoryLayers = new Map();
    this.accessStats = new Map();
    this.promotionStats = {
      l0_to_l1: 0,
      l1_to_l2: 0,
      l2_to_l3: 0,
      l3_to_l4: 0
    };
    this.wisdomIntegration = {
      wisdom_entries: [],
      pattern_relationships: [],
      learning_insights: []
    };

    this.initializeMemoryLayers();
  }

  /**
   * Initialize all memory layers
   */
  private initializeMemoryLayers(): void {
    console.log('🧠 Initializing hierarchical memory system...');
    
    Object.values(MEMORY_LAYERS).forEach(layer => {
      this.memoryLayers.set(layer.id, new Map());
      console.log(`📝 Initialized ${layer.id}: ${layer.max_capacity} items, ${layer.access_time_ns}ns access time`);
    });

    // Pre-populate L0 with sacred constants
    this.populateL0WithSacredConstants();
    
    console.log('✅ Hierarchical memory system initialized');
  }

  /**
   * Store data in appropriate memory layer
   */
  async store(
    key: string,
    value: any,
    options: {
      priority?: number;
      tags?: string[];
      preferred_layer?: MemoryLayer['id'];
    } = {}
  ): Promise<MemoryLayer['id']> {
    const startTime = Date.now();
    
    // Determine target layer
    const targetLayer = this.determineTargetLayer(key, value, options);
    
    // Create memory entry
    const entry: MemoryEntry = {
      id: key,
      value,
      created_at: startTime,
      last_accessed: startTime,
      access_count: 1,
      layer: targetLayer,
      priority: options.priority || this.calculatePriority(key, value),
      tags: options.tags || [],
      size_bytes: this.calculateSize(value)
    };

    // Store in target layer
    const layer = this.memoryLayers.get(targetLayer);
    if (!layer) {
      throw new Error(`Memory layer ${targetLayer} not found`);
    }

    // Check capacity and evict if necessary
    await this.ensureCapacity(targetLayer, entry.size_bytes);

    // Store entry
    layer.set(key, entry);
    MEMORY_LAYERS[targetLayer].current_size = layer.size;

    // Update access stats
    this.updateAccessStats(key);

    console.log(`💾 Stored in ${targetLayer}: ${key} (${entry.size_bytes} bytes)`);
    
    return targetLayer;
  }

  /**
   * Retrieve data from memory hierarchy
   */
  async retrieve(key: string): Promise<{ value: any; layer: MemoryLayer['id']; access_time_ns: number } | null> {
    const startTime = Date.now();
    
    // Try each layer from fastest to slowest
    for (const layerId of ['L0', 'L1', 'L2', 'L3', 'L4'] as const) {
      const layer = this.memoryLayers.get(layerId);
      if (!layer) continue;

      const entry = layer.get(key);
      if (entry) {
        // Check TTL
        if (this.isExpired(entry)) {
          layer.delete(key);
          MEMORY_LAYERS[layerId].current_size = layer.size;
          continue;
        }

        // Update access stats
        entry.last_accessed = startTime;
        entry.access_count++;
        this.updateAccessStats(key);

        // Check for promotion
        await this.checkPromotion(entry);

        const accessTime = MEMORY_LAYERS[layerId].access_time_ns;
        console.log(`📖 Retrieved from ${layerId}: ${key} (${accessTime}ns)`);

        return {
          value: entry.value,
          layer: layerId,
          access_time_ns: accessTime
        };
      }
    }

    console.log(`❌ Not found in memory: ${key}`);
    return null;
  }

  /**
   * Store Quranic pattern with quantum analysis
   */
  async storeQuranicPattern(
    pattern: {
      signature: TopologicalSignature;
      entropy: ShannonEntropyResult;
      quantum: QuantumPatternResult;
    },
    metadata: {
      surah: number;
      ayah: number;
      tags?: string[];
    }
  ): Promise<MemoryLayer['id']> {
    const key = `quranic:${metadata.surah}:${metadata.ayah}`;
    
    // Calculate priority based on quantum confidence
    const priority = pattern.quantum.pattern_classification.quranic_confidence;
    
    // Extract wisdom from pattern
    const wisdom = this.extractWisdomFromPattern(pattern);
    
    const value = {
      ...pattern,
      metadata,
      wisdom,
      stored_at: Date.now()
    };

    // Store with high priority and appropriate tags
    return await this.store(key, value, {
      priority,
      tags: ['quranic', 'pattern', 'quantum', ...(metadata.tags || [])],
      preferred_layer: priority > 0.9 ? 'L1' : priority > 0.7 ? 'L2' : 'L3'
    });
  }

  /**
   * Integrate wisdom from multiple patterns
   */
  async integrateWisdom(patterns: Array<{
    signature: TopologicalSignature;
    entropy: ShannonEntropyResult;
    quantum: QuantumPatternResult;
  }>): Promise<void> {
    console.log('🧠 Integrating wisdom from patterns...');

    // Extract wisdom from each pattern
    const wisdomEntries = patterns.map((pattern, index) => ({
      id: `wisdom:${Date.now()}:${index}`,
      wisdom: this.extractWisdomFromPattern(pattern),
      source_patterns: this.generatePatternSignature(pattern),
      confidence: pattern.quantum.pattern_classification.quranic_confidence,
      created_at: Date.now()
    }));

    // Find pattern relationships
    const patternRelationships = this.findPatternRelationships(patterns);

    // Generate learning insights
    const learningInsights = this.generateLearningInsights(patterns, wisdomEntries);

    // Store in L4 (wisdom integration)
    this.wisdomIntegration.wisdom_entries.push(...wisdomEntries);
    this.wisdomIntegration.pattern_relationships.push(...patternRelationships);
    this.wisdomIntegration.learning_insights.push(...learningInsights);

    // Store wisdom integration in L4
    await this.store('wisdom_integration', this.wisdomIntegration, {
      priority: 1.0,
      tags: ['wisdom', 'integration', 'learning'],
      preferred_layer: 'L4'
    });

    console.log(`✅ Integrated wisdom from ${patterns.length} patterns`);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): MemoryStats {
    const totalEntries = Array.from(this.memoryLayers.values())
      .reduce((sum, layer) => sum + layer.size, 0);

    const totalMemoryMB = Array.from(this.memoryLayers.values())
      .reduce((sum, layer) => {
        return sum + Array.from(layer.values())
          .reduce((layerSum, entry) => layerSum + entry.size_bytes, 0);
      }, 0) / (1024 * 1024);

    const hitRates: Record<MemoryLayer['id'], number> = {} as any;
    let totalAccesses = 0;
    let totalHits = 0;

    for (const [key, stats] of this.accessStats) {
      totalAccesses += stats.count;
      if (this.isInMemory(key)) {
        totalHits++;
      }
    }

    // Calculate hit rates per layer
    for (const [layerId, layer] of this.memoryLayers) {
      const layerHits = Array.from(layer.keys()).filter(key => 
        this.accessStats.has(key)
      ).length;
      hitRates[layerId] = layerHits / Math.max(layer.size, 1);
    }

    // Calculate average access time
    const avgAccessTimeNs = this.calculateAverageAccessTime();

    return {
      total_entries: totalEntries,
      total_memory_mb: totalMemoryMB,
      hit_rates: hitRates,
      avg_access_time_ns: avgAccessTimeNs,
      promotions: this.promotionStats
    };
  }

  /**
   * Promote entries between layers
   */
  async promoteEntries(): Promise<void> {
    console.log('🔄 Running promotion cycle...');

    // Promote from L0 to L1
    await this.promoteFromLayer('L0', 'L1', PROMOTION_THRESHOLDS.L0_TO_L1);

    // Promote from L1 to L2
    await this.promoteFromLayer('L1', 'L2', PROMOTION_THRESHOLDS.L1_TO_L2);

    // Promote from L2 to L3
    await this.promoteFromLayer('L2', 'L3', PROMOTION_THRESHOLDS.L2_TO_L3);

    // Promote from L3 to L4
    await this.promoteFromLayer('L3', 'L4', PROMOTION_THRESHOLDS.L3_TO_L4);

    console.log('✅ Promotion cycle completed');
  }

  // Private helper methods

  private populateL0WithSacredConstants(): void {
    console.log('🕌 Populating L0 with sacred constants...');
    
    const l0Layer = this.memoryLayers.get('L0')!;
    
    // Store sacred constants
    Object.entries(SACRED_CONSTANTS).forEach(([key, value]) => {
      const entry: MemoryEntry = {
        id: `sacred:${key}`,
        value,
        created_at: Date.now(),
        last_accessed: Date.now(),
        access_count: 1,
        layer: 'L0',
        priority: 1.0,
        tags: ['sacred', 'constant', 'quranic'],
        size_bytes: this.calculateSize(value)
      };
      
      l0Layer.set(entry.id, entry);
    });

    MEMORY_LAYERS.L0.current_size = l0Layer.size;
    console.log(`✅ L0 populated with ${l0Layer.size} sacred constants`);
  }

  private determineTargetLayer(
    key: string,
    value: any,
    options: { priority?: number; preferred_layer?: MemoryLayer['id'] }
  ): MemoryLayer['id'] {
    // Use preferred layer if specified
    if (options.preferred_layer) {
      return options.preferred_layer;
    }

    // Determine based on priority
    const priority = options.priority || this.calculatePriority(key, value);

    if (priority >= 0.9) return 'L1';
    if (priority >= 0.7) return 'L2';
    if (priority >= 0.5) return 'L3';
    return 'L4';
  }

  private calculatePriority(key: string, value: any): number {
    let priority = 0.5; // Base priority

    // Higher priority for Quranic content
    if (key.includes('quranic') || key.includes('pattern')) {
      priority += 0.3;
    }

    // Higher priority for sacred constants
    if (key.includes('sacred')) {
      priority += 0.4;
    }

    // Higher priority for quantum results
    if (key.includes('quantum')) {
      priority += 0.2;
    }

    return Math.min(priority, 1.0);
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    return 8; // Default for primitives
  }

  private async ensureCapacity(layerId: MemoryLayer['id'], requiredBytes: number): Promise<void> {
    const layer = this.memoryLayers.get(layerId);
    if (!layer) return;

    const layerConfig = MEMORY_LAYERS[layerId];
    
    // If infinite capacity, no need to evict
    if (layerConfig.max_capacity === Infinity) return;

    // Evict least recently used entries if needed
    while (layer.size >= layerConfig.max_capacity) {
      const lruEntry = this.findLRUEntry(layer);
      if (lruEntry) {
        layer.delete(lruEntry.id);
        console.log(`🗑️  Evicted from ${layerId}: ${lruEntry.id}`);
      } else {
        break;
      }
    }
  }

  private findLRUEntry(layer: Map<string, MemoryEntry>): MemoryEntry | null {
    let lruEntry: MemoryEntry | null = null;
    let oldestAccess = Date.now();

    for (const entry of layer.values()) {
      if (entry.last_accessed < oldestAccess) {
        oldestAccess = entry.last_accessed;
        lruEntry = entry;
      }
    }

    return lruEntry;
  }

  private isExpired(entry: MemoryEntry): boolean {
    const layerConfig = MEMORY_LAYERS[entry.layer];
    const age = Date.now() - entry.created_at;
    return age > layerConfig.ttl_ms;
  }

  private isInMemory(key: string): boolean {
    for (const layer of this.memoryLayers.values()) {
      if (layer.has(key)) return true;
    }
    return false;
  }

  private updateAccessStats(key: string): void {
    const current = this.accessStats.get(key) || { count: 0, last_access: 0 };
    current.count++;
    current.last_access = Date.now();
    this.accessStats.set(key, current);
  }

  private async checkPromotion(entry: MemoryEntry): Promise<void> {
    const thresholds = {
      'L0': PROMOTION_THRESHOLDS.L0_TO_L1,
      'L1': PROMOTION_THRESHOLDS.L1_TO_L2,
      'L2': PROMOTION_THRESHOLDS.L2_TO_L3,
      'L3': PROMOTION_THRESHOLDS.L3_TO_L4
    };

    const threshold = thresholds[entry.layer as keyof typeof thresholds];
    if (!threshold) return;

    if (entry.access_count >= threshold) {
      await this.promoteEntry(entry);
    }
  }

  private async promoteEntry(entry: MemoryEntry): Promise<void> {
    const targetLayers = {
      'L0': 'L1',
      'L1': 'L2',
      'L2': 'L3',
      'L3': 'L4'
    };

    const targetLayerId = targetLayers[entry.layer as keyof typeof targetLayers];
    if (!targetLayerId) return;

    // Remove from current layer
    const currentLayer = this.memoryLayers.get(entry.layer);
    if (currentLayer) {
      currentLayer.delete(entry.id);
      MEMORY_LAYERS[entry.layer].current_size = currentLayer.size;
    }

    // Add to target layer
    const targetLayer = this.memoryLayers.get(targetLayerId);
    if (targetLayer) {
      entry.layer = targetLayerId as MemoryLayer['id'];
      targetLayer.set(entry.id, entry);
      MEMORY_LAYERS[targetLayerId].current_size = targetLayer.size;

      // Update promotion stats
      this.promotionStats[`l${entry.layer.slice(1)}_to_${targetLayerId.toLowerCase()}` as keyof typeof this.promotionStats]++;

      console.log(`📈 Promoted: ${entry.id} from ${entry.layer} to ${targetLayerId}`);
    }
  }

  private async promoteFromLayer(
    fromLayer: MemoryLayer['id'],
    toLayer: MemoryLayer['id'],
    threshold: number
  ): Promise<void> {
    const sourceLayer = this.memoryLayers.get(fromLayer);
    const targetLayer = this.memoryLayers.get(toLayer);
    
    if (!sourceLayer || !targetLayer) return;

    const entriesToPromote: MemoryEntry[] = [];
    
    for (const entry of sourceLayer.values()) {
      if (entry.access_count >= threshold) {
        entriesToPromote.push(entry);
      }
    }

    for (const entry of entriesToPromote) {
      await this.promoteEntry(entry);
    }

    if (entriesToPromote.length > 0) {
      console.log(`📈 Promoted ${entriesToPromote.length} entries from ${fromLayer} to ${toLayer}`);
    }
  }

  private extractWisdomFromPattern(pattern: {
    signature: TopologicalSignature;
    entropy: ShannonEntropyResult;
    quantum: QuantumPatternResult;
  }): string {
    const insights: string[] = [];

    // Extract wisdom from quantum classification
    if (pattern.quantum.pattern_classification.quranic_confidence > 0.9) {
      insights.push(`Divine pattern detected: ${pattern.quantum.pattern_classification.pattern_type}`);
    }

    // Extract wisdom from entropy
    if (pattern.entropy.quranicResonance > 0.95) {
      insights.push('High Quranic resonance indicates sacred structure');
    }

    // Extract wisdom from topology
    if (pattern.signature.complexity > 0.8) {
      insights.push('Complex topological structure suggests deep meaning');
    }

    return insights.join('; ');
  }

  private generatePatternSignature(pattern: {
    signature: TopologicalSignature;
    entropy: ShannonEntropyResult;
    quantum: QuantumPatternResult;
  }): string {
    return `${pattern.quantum.pattern_classification.quantum_signature}-${pattern.entropy.quranicResonance.toFixed(3)}-${pattern.signature.complexity.toFixed(3)}`;
  }

  private findPatternRelationships(patterns: any[]): WisdomIntegration['pattern_relationships'] {
    const relationships: WisdomIntegration['pattern_relationships'] = [];

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const pattern1 = patterns[i];
        const pattern2 = patterns[j];

        // Calculate correlation based on quantum signatures
        const correlation = this.calculatePatternCorrelation(pattern1, pattern2);

        if (correlation > 0.7) {
          relationships.push({
            pattern1: this.generatePatternSignature(pattern1),
            pattern2: this.generatePatternSignature(pattern2),
            relationship_type: 'correlation',
            strength: correlation
          });
        }
      }
    }

    return relationships;
  }

  private generateLearningInsights(
    patterns: any[],
    wisdomEntries: WisdomIntegration['wisdom_entries']
  ): WisdomIntegration['learning_insights'] {
    const insights: WisdomIntegration['learning_insights'] = [];

    // Analyze patterns for common themes
    const highConfidencePatterns = patterns.filter(p => 
      p.quantum.pattern_classification.quranic_confidence > 0.8
    );

    if (highConfidencePatterns.length > patterns.length * 0.5) {
      insights.push({
        insight: 'Majority of patterns show high Quranic confidence',
        evidence: highConfidencePatterns.map(p => this.generatePatternSignature(p)),
        confidence: 0.9
      });
    }

    return insights;
  }

  private calculatePatternCorrelation(pattern1: any, pattern2: any): number {
    // Simplified correlation calculation based on quantum signatures
    const sig1 = pattern1.quantum.pattern_classification.quantum_signature;
    const sig2 = pattern2.quantum.pattern_classification.quantum_signature;

    // Simple string similarity for demonstration
    const commonChars = sig1.split('').filter(char => sig2.includes(char)).length;
    const maxLength = Math.max(sig1.length, sig2.length);

    return commonChars / maxLength;
  }

  private calculateAverageAccessTime(): number {
    let totalTime = 0;
    let totalAccesses = 0;

    for (const [key, stats] of this.accessStats) {
      totalTime += stats.last_access;
      totalAccesses += stats.count;
    }

    return totalAccesses > 0 ? totalTime / totalAccesses : 0;
  }
}