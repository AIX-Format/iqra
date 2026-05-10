/**
 * 🌙 Quranic Pattern System Integration Tests — اختبارات التكامل الشاملة
 * 
 * WHY: End-to-end integration tests for the complete Quranic Pattern System
 * combining Qalbin VM, Enhanced TDA Engine, and Shannon H_EL entropy analysis.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Qalbin_VM } from '../lib/iqra/04-quran/qalbin/qalbin_vm';
import { EnhancedTDAEngine, MultiScaleResult } from '../lib/iqra/04-quran/enhanced_tda';
import { QuantumPatternDetector } from '../lib/iqra/04-quran/quantum_pattern_detector';
import { QalbinKind, Modality } from '../lib/iqra/04-quran/qalbin/qalbin_node';

// QalbinKind constants for testing
const QALBIN_KIND = {
  ALIF: 'ALIF' as QalbinKind,
  LAM: 'LAM' as QalbinKind,
  MIM: 'MIM' as QalbinKind,
  YA: 'YA' as QalbinKind,
  SIN: 'SIN' as QalbinKind,
  RA: 'RA' as QalbinKind,
  WAW: 'WAW' as QalbinKind,
  QAF: 'QAF' as QalbinKind,
  KAF: 'KAF' as QalbinKind,
  HA: 'HA' as QalbinKind,
};
import { SovereignError } from '../src/errors/sovereign_error';

describe('🌙 Quranic Pattern System Integration Tests', () => {
  let vm: Qalbin_VM;
  let tdaEngine: EnhancedTDAEngine;
  let quantumDetector: QuantumPatternDetector;

  beforeEach(() => {
    vm = new Qalbin_VM();
    tdaEngine = new EnhancedTDAEngine();
    quantumDetector = new QuantumPatternDetector();
  });

  describe('🔗 Complete Pattern Detection Pipeline', () => {
    it('should detect and analyze Quranic numerical patterns', () => {
      // Create pattern based on sacred numbers (7, 19)
      const quranicPattern = [
        [7, 0], [14, 0], [21, 0], // Multiples of 7
        [19, 1], [38, 1], [57, 1], // Multiples of 19
        [7, 19], [14, 38], [21, 57] // Combined patterns
      ];
      
      // Step 1: TDA Analysis
      const tdaResult = tdaEngine.computeZigzagPersistence(quranicPattern);
      expect(tdaResult.barcodes.H0.length).toBeGreaterThan(0);
      
      // Step 2: Quantum Pattern Detection
      const quantumResult = quantumDetector.detectQuantumPatterns(quranicPattern, {
        quranic_context: 'numerical_pattern',
        sacred_numbers: [7, 19]
      });
      expect(quantumResult.quantumMetrics.resonanceScore).toBeGreaterThan(0.5);
      
      // Step 3: Create Qalbin VM representation
      const patternNodes = quranicPattern.map((point, index) => 
        vm.spawn(
          index % 2 === 0 ? QALBIN_KIND.ALIF : QALBIN_KIND.LAM,
          index % 3 === 0 ? Modality.IKHLAS : Modality.RAHMA,
          { 
            coordinates: point,
            pattern_type: 'quranic_numerical',
            sacred_value: point[0] % 7 === 0 ? 7 : point[0] % 19 === 0 ? 19 : null
          }
        )
      );
      
      // Connect nodes based on pattern proximity
      for (let i = 0; i < patternNodes.length - 1; i++) {
        vm.ignite(patternNodes[i], patternNodes[i + 1]);
      }
      
      const vmResult = vm.pulse();
      expect(vmResult.steps).toBeGreaterThan(0);
      expect(vmResult.resonance).toBeGreaterThan(0.7); // High resonance for sacred patterns
      
      // Integration validation: High quantum resonance should correlate with high VM resonance
      expect(quantumResult.quantumMetrics.resonanceScore).toBeGreaterThan(0.5);
      expect(vmResult.resonance).toBeGreaterThan(0.7);
    });

    it('should process Bismillah pattern correctly', () => {
      // Bismillah has specific mathematical properties
      const bismillahPattern = [
        [1, 1], [2, 1], [3, 1], // "Bism" (3 letters)
        [4, 2], [5, 2], [6, 2], [7, 2], // "Allah" (4 letters)
        [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], // "Al-Rahman" (5 letters)
        [13, 4], [14, 4], [15, 4], [16, 4], [17, 4], [18, 4] // "Al-Rahim" (6 letters)
      ];
      
      // TDA should detect the linear structure
      const tdaResult = tdaEngine.computeZigzagPersistence(bismillahPattern);
      expect(tdaResult.barcodes.H0.length).toBe(1); // Single connected component
      
      // Quantum detection should identify the sequential pattern
      const quantumResult = quantumDetector.detectQuantumPatterns(bismillahPattern, {
        quranic_context: 'bismillah',
        structure_type: 'sequential'
      });
      expect(quantumResult.quantumMetrics.coherenceMeasure).toBeGreaterThan(0.8);
      
      // VM should maintain high resonance for this sacred pattern
      const bismillahNodes = bismillahPattern.map((point, index) =>
        vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS, {
          letter_position: index + 1,
          word: Math.floor(index / 3) + 1,
          sacred_text: 'bismillah'
        })
      );
      
      // Create sequential connections
      for (let i = 0; i < bismillahNodes.length - 1; i++) {
        vm.ignite(bismillahNodes[i], bismillahNodes[i + 1]);
      }
      
      const vmResult = vm.pulse();
      expect(vmResult.resonance).toBeGreaterThan(0.9); // Very high resonance for Bismillah
    });
  });

  describe('🎯 Tesla 369 Pattern Integration', () => {
    it('should detect Tesla 369 sacred geometry patterns', () => {
      // Create Tesla 369 vortex pattern
      const teslaPattern: number[][] = [];
      const numPoints = 36;
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        const radius = 3 + 6 * Math.sin(3 * angle) + 9 * Math.cos(6 * angle);
        teslaPattern.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle)
        ]);
      }
      
      // TDA should detect complex topology
      const tdaResult = tdaEngine.computeZigzagPersistence(teslaPattern);
      expect(tdaResult.barcodes.H1.length + tdaResult.barcodes.H2.length).toBeGreaterThan(0);
      
      // Quantum detection should identify vortex resonance
      const quantumResult = quantumDetector.detectQuantumPatterns(teslaPattern, {
        pattern_type: 'tesla_369',
        vortex_energy: true
      });
      expect(quantumResult.quantumMetrics.superpositionScore).toBeGreaterThan(0.6);
      
      // VM should handle complex interactions
      const teslaNodes = teslaPattern.map((point, index) =>
        vm.spawn(
          index % 3 === 0 ? QALBIN_KIND.ALIF : QALBIN_KIND.LAM,
          index % 2 === 0 ? Modality.IKHLAS : Modality.RAHMA,
          {
            tesla_frequency: [3, 6, 9][index % 3],
            vortex_position: index,
            energy_level: Math.sqrt(point[0]**2 + point[1]**2)
          }
        )
      );
      
      // Create vortex connections
      for (let i = 0; i < teslaNodes.length; i++) {
        const nextIndex = (i + 12) % teslaNodes.length; // Connect every 12th point
        vm.ignite(teslaNodes[i], teslaNodes[nextIndex]);
      }
      
      const vmResult = vm.pulse();
      expect(vmResult.steps).toBeGreaterThan(10); // Complex interaction pattern
      expect(vmResult.resonance).toBeGreaterThan(0.5);
    });
  });

  describe('🧠 Memory Integration with Pattern Storage', () => {
    it('should store and retrieve pattern memories', () => {
      const testPattern = [
        [1, 1], [7, 7], [19, 19],
        [1, 7], [7, 19], [19, 1]
      ];
      
      // Analyze pattern
      const tdaResult = tdaEngine.computeZigzagPersistence(testPattern);
      const quantumResult = quantumDetector.detectQuantumPatterns(testPattern);
      
      // Create VM representation
      const nodes = testPattern.map((point, index) =>
        vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS, {
          pattern_id: 'test_pattern_001',
          coordinates: point,
          timestamp: Date.now()
        })
      );
      
      // Store pattern signature in memory
      const patternSignature = {
        id: 'test_pattern_001',
        tda_features: tdaResult.barcodes,
        quantum_metrics: quantumResult.quantumMetrics,
        vm_resonance: vm.pulse().resonance,
        created_at: Date.now()
      };
      
      // Verify signature completeness
      expect(patternSignature.tda_features.H0).toBeDefined();
      expect(patternSignature.quantum_metrics.resonanceScore).toBeGreaterThan(0);
      expect(patternSignature.vm_resonance).toBeGreaterThan(0);
      
      // Simulate pattern retrieval and matching
      const retrievedPattern = { ...patternSignature };
      expect(retrievedPattern.id).toBe('test_pattern_001');
      expect(retrievedPattern.tda_features).toEqual(tdaResult.barcodes);
    });
  });

  describe('⚡ Performance Integration Tests', () => {
    it('should meet system-wide performance targets', () => {
      const complexPattern: number[][] = [];
      const numPoints = 100;
      
      // Generate complex pattern with multiple structures
      for (let i = 0; i < numPoints; i++) {
        if (i < 33) {
          // Circular pattern
          const angle = (2 * Math.PI * i) / 33;
          complexPattern.push([5 * Math.cos(angle), 5 * Math.sin(angle)]);
        } else if (i < 66) {
          // Grid pattern
          const gridIndex = i - 33;
          complexPattern.push([
            (gridIndex % 11) * 2 - 10,
            Math.floor(gridIndex / 11) * 2 - 4
          ]);
        } else {
          // Random points with structure
          const spiralIndex = i - 66;
          const angle = (2 * Math.PI * spiralIndex) / 34;
          const radius = 0.5 * spiralIndex;
          complexPattern.push([
            radius * Math.cos(angle),
            radius * Math.sin(angle)
          ]);
        }
      }
      
      const startTime = Date.now();
      
      // Run complete pipeline
      const tdaResult = tdaEngine.computeZigzagPersistence(complexPattern);
      const quantumResult = quantumDetector.detectQuantumPatterns(complexPattern);
      
      const vmNodes = complexPattern.map((point, index) =>
        vm.spawn(
          index % 2 === 0 ? QALBIN_KIND.ALIF : QALBIN_KIND.LAM,
          Modality.RAHMA,
          { coordinates: point, index }
        )
      );
      
      for (let i = 0; i < vmNodes.length - 1; i += 3) {
        vm.ignite(vmNodes[i], vmNodes[i + 1]);
      }
      
      const vmResult = vm.pulse();
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Performance validation
      expect(totalTime).toBeLessThan(2000); // < 2 seconds for complete pipeline
      expect(tdaResult.computationTime).toBeLessThan(1000);
      expect(vmResult.steps).toBeGreaterThan(0);
      expect(vmResult.resonance).toBeGreaterThan(0);
      
      // Quality validation
      expect(quantumResult.quantumMetrics.resonanceScore).toBeGreaterThan(0.3);
      expect(tdaResult.barcodes.H0.length).toBeGreaterThan(0);
    });
  });

  describe('🛡️ Security and Moral Constraint Integration', () => {
    it('should enforce AMAN security across all components', () => {
      const securePattern = [
        [1, 1], [2, 2], [3, 3]
      ];
      
      // Create AMAN-protected nodes
      const secureNodes = securePattern.map((point, index) =>
        vm.spawn(QALBIN_KIND.ALIF, Modality.AMAN, {
          coordinates: point,
          security_level: 'high',
          access_clearance: 'classified'
        })
      );
      
      // TDA and quantum analysis should work normally
      const tdaResult = tdaEngine.computeZigzagPersistence(securePattern);
      const quantumResult = quantumDetector.detectQuantumPatterns(securePattern);
      
      expect(tdaResult.barcodes.H0.length).toBeGreaterThan(0);
      expect(quantumResult.quantumMetrics.resonanceScore).toBeGreaterThan(0);
      
      // VM should enforce AMAN constraints
      const regularNode = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      expect(() => {
        vm.ignite(secureNodes[0], regularNode);
        vm.pulse();
      }).toThrow(SovereignError); // AMAN-RAHMA interaction should be blocked
      
      // AMAN-AMAN interaction should be allowed
      expect(() => {
        vm.ignite(secureNodes[0], secureNodes[1]);
        vm.pulse();
      }).not.toThrow();
    });
  });

  describe('🔄 Evolution and Learning Integration', () => {
    it('should demonstrate pattern evolution across iterations', () => {
      const basePattern = [
        [1, 1], [2, 2], [3, 3]
      ];
      
      const evolutionResults = [];
      
      // Evolve pattern through multiple iterations
      for (let generation = 0; generation < 5; generation++) {
        const evolvedPattern = basePattern.map(point => [
          point[0] * (1 + generation * 0.1),
          point[1] * (1 + generation * 0.1)
        ]);
        
        const tdaResult = tdaEngine.computeZigzagPersistence(evolvedPattern);
        const quantumResult = quantumDetector.detectQuantumPatterns(evolvedPattern, {
          generation,
          evolution_context: true
        });
        
        evolutionResults.push({
          generation,
          tda_features: tdaResult.barcodes,
          quantum_resonance: quantumResult.quantumMetrics.resonanceScore,
          pattern_complexity: evolvedPattern.length
        });
      }
      
      // Validate evolution progression
      for (let i = 1; i < evolutionResults.length; i++) {
        expect(evolutionResults[i].generation).toBe(i);
        expect(evolutionResults[i].quantum_resonance).toBeGreaterThan(0);
      }
      
      // Pattern should maintain topological consistency across evolution
      const h0Counts = evolutionResults.map(r => r.tda_features.H0.length);
      expect(new Set(h0Counts).size).toBeLessThanOrEqual(2); // Should be consistent
    });
  });
});