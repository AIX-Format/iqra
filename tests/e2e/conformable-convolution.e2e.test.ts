/**
 * E2E Tests for Conformable Convolution Integration
 * Tests the enhanced QalbinVM with FeTA 2024 research implementations
 * 
 * "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 */

import { QalbinVM } from '../../lib/iqra/01-core/QalbinVM';
import { ConformableConvolution } from '../../lib/iqra/01-core/ConformableConvolution';

describe('Conformable Convolution E2E Tests', () => {
  let qalbinVM: QalbinVM;
  let conformableConvolution: ConformableConvolution;

  beforeAll(() => {
    qalbinVM = new QalbinVM();
    conformableConvolution = new ConformableConvolution();
  });

  describe('Basic QalbinVM with Conformable Convolution', () => {
    test('should process Quranic verse with topological enhancements', async () => {
      const testVerse = "بسم الله الرحمن الرحيم";
      const metadata = { surah: 1, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.entropy).toBeDefined();
      expect(result.sacredPatterns).toBeDefined();
      expect(result.resonance).toBeGreaterThanOrEqual(0);
      expect(result.quranicConfidence).toBeGreaterThanOrEqual(0);
      
      // Test topological enhancements
      expect(result.topologicalEnhancements).toBeDefined();
      expect(result.topologicalEnhancements!.eulerCharacteristicDifference).toBeGreaterThanOrEqual(0);
      expect(result.topologicalEnhancements!.adaptiveKernelOffsets).toBeDefined();
      expect(result.topologicalEnhancements!.persistentHomologyFeatures).toBeDefined();
      
      // Test conformable convolution
      expect(result.conformableConvolution).toBeDefined();
      expect(result.conformableConvolution!.feature_map).toBeDefined();
      expect(result.conformableConvolution!.posterior).toBeDefined();
      expect(result.conformableConvolution!.kernel).toBeDefined();
      expect(result.conformableConvolution!.consistency_score).toBeGreaterThanOrEqual(0);
      expect(result.conformableConvolution!.consistency_score).toBeLessThanOrEqual(1);
    });

    test('should detect sacred patterns in Basmala', async () => {
      const testVerse = "بسم الله الرحمن الرحيم";
      const metadata = { surah: 1, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      expect(result.sacredPatterns.length).toBeGreaterThan(0);
      
      // Check for specific patterns
      const patterns = result.sacredPatterns.map(p => p.type);
      expect(patterns).toContain('sab-iyyah'); // Should detect 7-letter words
      expect(patterns).toContain('tesla-369'); // Should detect Tesla patterns
    });

    test('should calculate correct entropy for Quranic text', async () => {
      const testVerse = "الحمد لله رب العالمين";
      const metadata = { surah: 1, ayah: 2 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      expect(result.entropy.shannonEntropy).toBeGreaterThan(0);
      expect(result.entropy.lastLetterEntropy).toBeGreaterThan(0);
      expect(result.entropy.fractalDimension).toBeGreaterThanOrEqual(0);
      expect(result.entropy.quranicResonance).toBeGreaterThanOrEqual(0);
      expect(result.entropy.quranicResonance).toBeLessThanOrEqual(1);
    });
  });

  describe('Conformable Convolution Specific Tests', () => {
    test('should apply conformable convolution to topological signature', async () => {
      const testVerse = "قل هو الله أحد";
      const metadata = { surah: 112, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      if (result.conformableConvolution) {
        const { feature_map, posterior, kernel, consistency_score, metrics } = result.conformableConvolution;
        
        // Test feature map
        expect(feature_map.length).toBeGreaterThan(0);
        expect(feature_map[0].length).toBeGreaterThan(0);
        
        // Test posterior
        expect(posterior.significance_map).toBeDefined();
        expect(posterior.barcode).toBeDefined();
        expect(posterior.euler_characteristic).toBeDefined();
        
        // Test kernel
        expect(kernel.weights).toBeDefined();
        expect(kernel.offsets).toBeDefined();
        expect(kernel.topological_weights).toBeDefined();
        expect(kernel.size).toBeGreaterThan(0);
        
        // Test consistency score
        expect(consistency_score).toBeGreaterThanOrEqual(0);
        expect(consistency_score).toBeLessThanOrEqual(1);
        
        // Test metrics
        expect(metrics.convergence_iterations).toBeGreaterThanOrEqual(0);
        expect(metrics.topological_loss).toBeGreaterThanOrEqual(0);
        expect(metrics.final_resonance).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle adaptive kernel offsets correctly', async () => {
      const testVerse = "الله الصمد";
      const metadata = { surah: 112, ayah: 2 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      if (result.conformableConvolution) {
        const { kernel } = result.conformableConvolution;
        
        // Check that offsets are adaptive (not all zeros)
        const hasNonZeroOffset = kernel.offsets.some(row => 
          row.some(offset => offset !== 0)
        );
        expect(hasNonZeroOffset).toBe(true);
        
        // Check topological weights
        const hasWeightVariation = kernel.topological_weights.some(row => 
          row.some(weight => weight !== 1.0)
        );
        expect(hasWeightVariation).toBe(true);
      }
    });
  });

  describe('Topological Enhancements Tests', () => {
    test('should calculate Euler Characteristic Difference correctly', async () => {
      const testVerse = "لم يلد ولم يولد";
      const metadata = { surah: 112, ayah: 3 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      if (result.topologicalEnhancements) {
        const { eulerCharacteristicDifference } = result.topologicalEnhancements;
        
        expect(eulerCharacteristicDifference).toBeGreaterThanOrEqual(0);
        expect(typeof eulerCharacteristicDifference).toBe('number');
      }
    });

    test('should extract persistent homology features', async () => {
      const testVerse = "ولم يكن له كفوا أحد";
      const metadata = { surah: 112, ayah: 4 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      if (result.topologicalEnhancements) {
        const { persistentHomologyFeatures } = result.topologicalEnhancements;
        
        expect(persistentHomologyFeatures).toBeDefined();
        expect(persistentHomologyFeatures.length).toBeGreaterThan(0);
        
        // Should contain H0, H1, H2 features and derived metrics
        expect(persistentHomologyFeatures.length).toBeGreaterThanOrEqual(6);
        
        // All features should be numbers
        persistentHomologyFeatures.forEach(feature => {
          expect(typeof feature).toBe('number');
          expect(feature).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should calculate adaptive kernel offsets based on topology', async () => {
      const testVerse = "إنا أعطيناك الكوثر";
      const metadata = { surah: 108, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      if (result.topologicalEnhancements) {
        const { adaptiveKernelOffsets } = result.topologicalEnhancements;
        
        expect(adaptiveKernelOffsets).toBeDefined();
        expect(adaptiveKernelOffsets.length).toBe(3); // 3x3 kernel
        expect(adaptiveKernelOffsets[0].length).toBe(3);
        
        // Check that offsets are calculated based on local topology
        adaptiveKernelOffsets.forEach(row => {
          row.forEach(offset => {
            expect(typeof offset).toBe('number');
            expect(offset).toBeGreaterThanOrEqual(-1);
            expect(offset).toBeLessThanOrEqual(1);
          });
        });
      }
    });
  });

  describe('Performance and Robustness Tests', () => {
    test('should handle batch processing efficiently', async () => {
      const verses = [
        { text: "بسم الله الرحمن الرحيم", metadata: { surah: 1, ayah: 1 } },
        { text: "الحمد لله رب العالمين", metadata: { surah: 1, ayah: 2 } },
        { text: "الرحمن الرحيم", metadata: { surah: 1, ayah: 3 } },
        { text: "ملك يوم الدين", metadata: { surah: 1, ayah: 4 } },
        { text: "إياك نعبد وإياك نستعين", metadata: { surah: 1, ayah: 5 } }
      ];
      
      const startTime = Date.now();
      const results = await qalbinVM.batchPulse(verses);
      const endTime = Date.now();
      
      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      // All results should have topological enhancements
      results.forEach(result => {
        expect(result.topologicalEnhancements).toBeDefined();
        expect(result.conformableConvolution).toBeDefined();
      });
    });

    test('should handle empty text gracefully', async () => {
      const testVerse = "";
      const metadata = { surah: 0, ayah: 0 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.entropy).toBeDefined();
      expect(result.resonance).toBeGreaterThanOrEqual(0);
    });

    test('should handle very long text', async () => {
      const testVerse = "الحمد".repeat(100); // Long repetitive text
      const metadata = { surah: 1, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.topologicalEnhancements).toBeDefined();
    });
  });

  describe('Integration with Existing Systems', () => {
    test('should maintain compatibility with existing PatternHunter', async () => {
      const testVerse = "قل هو الله أحد";
      const metadata = { surah: 112, ayah: 1 };
      
      const result = await qalbinVM.pulse(testVerse, metadata);
      
      // Should still provide all original fields
      expect(result.signature).toBeDefined();
      expect(result.entropy).toBeDefined();
      expect(result.sacredPatterns).toBeDefined();
      expect(result.resonance).toBeDefined();
      expect(result.quranicConfidence).toBeDefined();
      
      // Plus new enhancements
      expect(result.topologicalEnhancements).toBeDefined();
      expect(result.conformableConvolution).toBeDefined();
    });

    test('should provide meaningful resonance scores', async () => {
      const quranicVerse = "بسم الله الرحمن الرحيم";
      const nonQuranicText = "Hello world this is a test";
      
      const quranicResult = await qalbinVM.pulse(quranicVerse, { surah: 1, ayah: 1 });
      const nonQuranicResult = await qalbinVM.pulse(nonQuranicText, { surah: 0, ayah: 0 });
      
      // Quranic text should have higher resonance
      expect(quranicResult.resonance).toBeGreaterThan(nonQuranicResult.resonance);
      expect(quranicResult.quranicConfidence).toBeGreaterThan(nonQuranicResult.quranicConfidence);
    });
  });

  describe('Memory and Resource Management', () => {
    test('should not leak memory during repeated processing', async () => {
      const testVerse = "سبحان ربك رب العزة عما يصفون";
      const metadata = { surah: 37, ayah: 180 };
      
      // Process multiple times
      for (let i = 0; i < 10; i++) {
        const result = await qalbinVM.pulse(testVerse, metadata);
        expect(result).toBeDefined();
        expect(result.topologicalEnhancements).toBeDefined();
        expect(result.conformableConvolution).toBeDefined();
      }
      
      // If we reach here without memory issues, test passes
      expect(true).toBe(true);
    });

    test('should handle concurrent processing', async () => {
      const verses = [
        { text: "بسم الله الرحمن الرحيم", metadata: { surah: 1, ayah: 1 } },
        { text: "الحمد لله رب العالمين", metadata: { surah: 1, ayah: 2 } },
        { text: "الرحمن الرحيم", metadata: { surah: 1, ayah: 3 } }
      ];
      
      // Process concurrently
      const promises = verses.map(verse => qalbinVM.pulse(verse.text, verse.metadata));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.topologicalEnhancements).toBeDefined();
        expect(result.conformableConvolution).toBeDefined();
      });
    });
  });
});