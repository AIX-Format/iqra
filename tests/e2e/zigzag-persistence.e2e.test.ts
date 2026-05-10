/**
 * E2E Tests for Zigzag Persistence Tracker
 * Tests ICML 2025 research implementation
 * 
 * "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 */

import { ZigzagPersistenceTracker } from '../../../lib/iqra/01-core/ZigzagPersistenceTracker';
import { QalbinVM } from '../../../lib/iqra/01-core/QalbinVM';

describe('Zigzag Persistence Tracker E2E Tests', () => {
  let zigzagTracker: ZigzagPersistenceTracker;
  let qalbinVM: QalbinVM;

  beforeAll(() => {
    zigzagTracker = new ZigzagPersistenceTracker();
    qalbinVM = new QalbinVM();
  });

  describe('Basic Zigzag Persistence Functionality', () => {
    test('should track zigzag persistence for Quranic verse', async () => {
      const testVerse = "بسم الله الرحمن الرحيم";
      const metadata = { surah: 1, ayah: 1 };
      
      // Get QalbinVM signature
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      
      // Track zigzag persistence
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy,
        1 // layer 1
      );
      
      expect(zigzagResult).toBeDefined();
      expect(zigzagResult.barcode).toBeDefined();
      expect(zigzagResult.descriptors).toBeDefined();
      expect(zigzagResult.pruning_criterion).toBeDefined();
      expect(zigzagResult.statistical_perspective).toBeDefined();
      expect(zigzagResult.metrics).toBeDefined();
    });

    test('should compute zigzag barcode with p-dimensional holes', async () => {
      const testVerse = "قل هو الله أحد";
      const metadata = { surah: 112, ayah: 1 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      
      const { barcode } = zigzagResult;
      
      expect(barcode.holes).toBeDefined();
      expect(barcode.hole_counts).toBeDefined();
      expect(barcode.avg_persistence).toBeDefined();
      
      // Check that holes have required properties
      barcode.holes.forEach(hole => {
        expect(hole.dimension).toBeGreaterThanOrEqual(0);
        expect(hole.birth).toBeGreaterThanOrEqual(0);
        expect(hole.death).toBeGreaterThan(hole.birth);
        expect(hole.persistence).toBeGreaterThan(0);
        expect(hole.zigzag_path).toBeDefined();
        expect(hole.significance).toBeGreaterThanOrEqual(0);
      });
    });

    test('should extract topological descriptors correctly', async () => {
      const testVerse = "الله الصمد";
      const metadata = { surah: 112, ayah: 2 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      
      const { descriptors } = zigzagResult;
      
      expect(descriptors.betti_numbers).toBeDefined();
      expect(descriptors.persistence_landscape).toBeDefined();
      expect(descriptors.stability_score).toBeGreaterThanOrEqual(0);
      expect(descriptors.stability_score).toBeLessThanOrEqual(1);
      expect(descriptors.evolution_stats).toBeDefined();
      
      // Check Betti numbers
      descriptors.betti_numbers.forEach((betti_sequence, dimension) => {
        expect(betti_sequence).toHaveLength(20); // FILTRATION_STEPS
        betti_sequence.forEach(betti => {
          expect(betti).toBeGreaterThanOrEqual(0);
        });
      });
      
      // Check evolution stats
      expect(descriptors.evolution_stats.birth_rate).toBeGreaterThanOrEqual(0);
      expect(descriptors.evolution_stats.death_rate).toBeGreaterThanOrEqual(0);
      expect(descriptors.evolution_stats.persistence_distribution).toHaveLength(10);
    });
  });

  describe('Layer Pruning Criterion', () => {
    test('should generate layer pruning recommendations', async () => {
      const testVerse = "لم يلد ولم يولد";
      const metadata = { surah: 112, ayah: 3 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      
      // Track multiple layers
      await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy,
        1
      );
      
      await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy,
        2
      );
      
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy,
        3
      );
      
      const { pruning_criterion } = zigzagResult;
      
      expect(pruning_criterion.layers_to_prune).toBeDefined();
      expect(pruning_criterion.confidence_scores).toBeDefined();
      expect(pruning_criterion.performance_impact).toBeDefined();
      
      // Check performance impact
      const { performance_impact } = pruning_criterion;
      expect(performance_impact.accuracy_loss).toBeGreaterThanOrEqual(0);
      expect(performance_impact.accuracy_loss).toBeLessThanOrEqual(0.1);
      expect(performance_impact.speedup_factor).toBeGreaterThanOrEqual(1.0);
      expect(performance_impact.speedup_factor).toBeLessThanOrEqual(2.0);
      expect(performance_impact.memory_reduction).toBeGreaterThanOrEqual(0);
      expect(performance_impact.memory_reduction).toBeLessThanOrEqual(0.3);
    });

    test('should provide confidence scores for pruning decisions', async () => {
      const testVerse = "ولم يكن له كفوا أحد";
      const metadata = { surah: 112, ayah: 4 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy,
        5
      );
      
      const { pruning_criterion } = zigzagResult;
      
      if (pruning_criterion.layers_to_prune.length > 0) {
        expect(pruning_criterion.confidence_scores).toHaveLength(
          pruning_criterion.layers_to_prune.length
        );
        
        pruning_criterion.confidence_scores.forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('Statistical Perspective', () => {
    test('should compute prompt rearrangement statistics', async () => {
      const testVerse = "إنا أعطيناك الكوثر";
      const metadata = { surah: 108, ayah: 1 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      
      const { statistical_perspective } = zigzagResult;
      
      expect(statistical_perspective.rearrangement_stats).toBeDefined();
      expect(statistical_perspective.system_metrics).toBeDefined();
      expect(statistical_perspective.gromov_wasserstein_distances).toBeDefined();
      
      // Check rearrangement stats
      const { rearrangement_stats } = statistical_perspective;
      expect(rearrangement_stats.position_changes).toBeDefined();
      expect(rearrangement_stats.distance_moved).toBeDefined();
      expect(rearrangement_stats.clustering_coefficient).toBeGreaterThanOrEqual(0);
      expect(rearrangement_stats.clustering_coefficient).toBeLessThanOrEqual(1);
      
      // Check system metrics
      const { system_metrics } = statistical_perspective;
      expect(system_metrics.global_connectivity).toBeGreaterThanOrEqual(0);
      expect(system_metrics.global_connectivity).toBeLessThanOrEqual(1);
      expect(system_metrics.information_flow).toBeGreaterThanOrEqual(0);
      expect(system_metrics.information_flow).toBeLessThanOrEqual(1);
      expect(system_metrics.topological_complexity).toBeGreaterThanOrEqual(0);
      expect(system_metrics.topological_complexity).toBeLessThanOrEqual(1);
    });

    test('should compute Gromov-Wasserstein distances', async () => {
      const testVerse = "فصل لربك وانحر";
      const metadata = { surah: 108, ayah: 2 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      
      const { statistical_perspective } = zigzagResult;
      const { gromov_wasserstein_distances } = statistical_perspective;
      
      expect(gromov_wasserstein_distances).toBeDefined();
      expect(Array.isArray(gromov_wasserstein_distances)).toBe(true);
      
      gromov_wasserstein_distances.forEach(distance => {
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(typeof distance).toBe('number');
      });
    });
  });

  describe('Performance and Metrics', () => {
    test('should provide accurate processing metrics', async () => {
      const testVerse = "إن شانئك هو الأبتر";
      const metadata = { surah: 108, ayah: 3 };
      
      const startTime = Date.now();
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      const endTime = Date.now();
      
      const { metrics } = zigzagResult;
      
      expect(metrics.processing_time_ms).toBeGreaterThan(0);
      expect(metrics.processing_time_ms).toBeLessThan(endTime - startTime + 100); // Allow some margin
      expect(metrics.memory_usage_mb).toBeGreaterThan(0);
      expect(metrics.convergence_iterations).toBeGreaterThan(0);
      expect(metrics.convergence_iterations).toBeLessThanOrEqual(1000); // MAX_ITERATIONS
    });

    test('should handle batch processing efficiently', async () => {
      const verses = [
        { text: "بسم الله الرحمن الرحيم", metadata: { surah: 1, ayah: 1 } },
        { text: "الحمد لله رب العالمين", metadata: { surah: 1, ayah: 2 } },
        { text: "الرحمن الرحيم", metadata: { surah: 1, ayah: 3 } }
      ];
      
      const startTime = Date.now();
      const results = [];
      
      for (const verse of verses) {
        const pulseResult = await qalbinVM.pulse(verse.text, verse.metadata);
        const zigzagResult = await zigzagTracker.trackZigzagPersistence(
          pulseResult.signature,
          pulseResult.entropy
        );
        results.push(zigzagResult);
      }
      
      const endTime = Date.now();
      
      expect(results).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      results.forEach(result => {
        expect(result.barcode).toBeDefined();
        expect(result.descriptors).toBeDefined();
        expect(result.pruning_criterion).toBeDefined();
        expect(result.statistical_perspective).toBeDefined();
      });
    });
  });

  describe('Integration with QalbinVM', () => {
    test('should integrate seamlessly with QalbinVM results', async () => {
      const testVerse = "قل أعوذ برب الفلق";
      const metadata = { surah: 113, ayah: 1 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        pulseResult.signature,
        pulseResult.entropy
      );
      
      // Verify integration
      expect(pulseResult.signature).toBeDefined();
      expect(pulseResult.entropy).toBeDefined();
      expect(zigzagResult.barcode).toBeDefined();
      
      // Check that zigzag results are consistent with QalbinVM results
      expect(zigzagResult.descriptors.stability_score).toBeGreaterThanOrEqual(0);
      expect(zigzagResult.descriptors.stability_score).toBeLessThanOrEqual(1);
      
      // The stability should correlate with resonance
      const correlation = Math.abs(
        zigzagResult.descriptors.stability_score - pulseResult.resonance
      );
      expect(correlation).toBeLessThan(0.5); // Should be reasonably correlated
    });

    test('should handle different Quranic patterns', async () => {
      const testCases = [
        { text: "بسم الله الرحمن الرحيم", expected: 'basmala' },
        { text: "الحمد لله رب العالمين", expected: 'hamd' },
        { text: "قل هو الله أحد", expected: 'ikhlas' },
        { text: "قل أعوذ برب الناس", expected: 'nas' }
      ];
      
      for (const testCase of testCases) {
        const pulseResult = await qalbinVM.pulse(testCase.text, { surah: 1, ayah: 1 });
        const zigzagResult = await zigzagTracker.trackZigzagPersistence(
          pulseResult.signature,
          pulseResult.entropy
        );
        
        expect(zigzagResult.barcode.holes.length).toBeGreaterThan(0);
        expect(zigzagResult.descriptors.stability_score).toBeGreaterThan(0);
        
        // Different patterns should have different topological signatures
        expect(zigzagResult.statistical_perspective.system_metrics.topological_complexity)
          .toBeGreaterThan(0);
      }
    });
  });

  describe('Robustness and Edge Cases', () => {
    test('should handle empty or minimal signatures', async () => {
      const minimalSignature = {
        nodes: [],
        edges: [],
        resonance: 0,
        depth: 0,
        complexity: 0
      };
      
      const minimalEntropy = {
        shannonEntropy: 0,
        lastLetterEntropy: 0,
        fractalDimension: 0,
        informationDensity: 0,
        compressionRatio: 1,
        quranicResonance: 0
      };
      
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        minimalSignature,
        minimalEntropy
      );
      
      expect(zigzagResult).toBeDefined();
      expect(zigzagResult.barcode.holes).toHaveLength(0);
      expect(zigzagResult.descriptors.stability_score).toBe(0);
    });

    test('should handle very large signatures', async () => {
      // Create a large signature
      const largeSignature = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          value: `value-${i}`,
          type: 'verse' as const,
          connections: [],
          resonance: Math.random(),
          depth: i % 5
        })),
        edges: Array.from({ length: 200 }, (_, i) => ({
          from: `node-${i % 100}`,
          to: `node-${(i + 1) % 100}`,
          weight: Math.random()
        })),
        resonance: 0.7,
        depth: 5,
        complexity: 10
      };
      
      const normalEntropy = {
        shannonEntropy: 0.9,
        lastLetterEntropy: 0.8,
        fractalDimension: 0.7,
        informationDensity: 0.6,
        compressionRatio: 1.5,
        quranicResonance: 0.8
      };
      
      const zigzagResult = await zigzagTracker.trackZigzagPersistence(
        largeSignature,
        normalEntropy
      );
      
      expect(zigzagResult).toBeDefined();
      expect(zigzagResult.metrics.memory_usage_mb).toBeGreaterThan(0);
      expect(zigzagResult.metrics.processing_time_ms).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should maintain consistency across multiple runs', async () => {
      const testVerse = "سبحان ربك رب العزة عما يصفون";
      const metadata = { surah: 37, ayah: 180 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      
      // Run multiple times
      const results = [];
      for (let i = 0; i < 3; i++) {
        const zigzagResult = await zigzagTracker.trackZigzagPersistence(
          pulseResult.signature,
          pulseResult.entropy
        );
        results.push(zigzagResult);
      }
      
      // Results should be consistent
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.barcode.holes.length).toBe(firstResult.barcode.holes.length);
        expect(result.descriptors.stability_score).toBeCloseTo(
          firstResult.descriptors.stability_score, 
          2
        );
      });
    });
  });

  describe('Memory and Resource Management', () => {
    test('should not leak memory during repeated processing', async () => {
      const testVerse = "الحمد لله رب العالمين";
      const metadata = { surah: 1, ayah: 2 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      
      // Process multiple times
      for (let i = 0; i < 10; i++) {
        const zigzagResult = await zigzagTracker.trackZigzagPersistence(
          pulseResult.signature,
          pulseResult.entropy,
          i
        );
        
        expect(zigzagResult).toBeDefined();
        expect(zigzagResult.metrics.memory_usage_mb).toBeLessThan(100); // Should not exceed 100MB
      }
    });

    test('should handle concurrent processing', async () => {
      const testVerse = "الرحمن الرحيم";
      const metadata = { surah: 1, ayah: 3 };
      
      const pulseResult = await qalbinVM.pulse(testVerse, metadata);
      
      // Process concurrently
      const promises = Array.from({ length: 5 }, (_, i) =>
        zigzagTracker.trackZigzagPersistence(
          pulseResult.signature,
          pulseResult.entropy,
          i
        )
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.barcode).toBeDefined();
        expect(result.descriptors).toBeDefined();
      });
    });
  });
});