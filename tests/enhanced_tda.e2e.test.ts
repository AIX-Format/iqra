/**
 * 🔬 Enhanced TDA Engine E2E Tests — اختبارات محرك التحليل الطوبولوجي المحسن
 * 
 * WHY: Real end-to-end tests for the Enhanced TDA Engine with zigzag persistence
 * and multi-scale persistent homology computation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedTDAEngine, MultiScaleResult } from '../lib/iqra/04-quran/enhanced_tda';
import { QuantumPatternDetector } from '../lib/iqra/04-quran/quantum_pattern_detector';
import { SovereignError } from '../src/errors/sovereign_error';

describe('🔬 Enhanced TDA Engine E2E Tests', () => {
  let tdaEngine: EnhancedTDAEngine;
  let quantumDetector: QuantumPatternDetector;

  beforeEach(() => {
    tdaEngine = new EnhancedTDAEngine();
    quantumDetector = new QuantumPatternDetector();
  });

  describe('📊 Zigzag Persistence', () => {
    it('should compute zigzag persistence for simple point cloud', () => {
      const pointCloud = [
        [0, 0], [1, 0], [0, 1], [1, 1] // Square
      ];
      
      const result = tdaEngine.computeZigzagPersistence(pointCloud);
      
      expect(result).toBeDefined();
      expect(result.barcodes).toBeDefined();
      expect(result.barcodes.H0).toBeDefined();
      expect(result.barcodes.H1).toBeDefined();
      expect(result.computationTime).toBeLessThan(1000); // < 1 second
    });

    it('should handle circular patterns correctly', () => {
      const circlePoints: number[][] = [];
      const radius = 5;
      const numPoints = 20;
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        circlePoints.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle)
        ]);
      }
      
      const result = tdaEngine.computeZigzagPersistence(circlePoints);
      
      // Circle should have 1 H0 component and 1 H1 component (the hole)
      expect(result.barcodes.H0.length).toBe(1);
      expect(result.barcodes.H1.length).toBe(1);
      expect(result.barcodes.H1[0].death - result.barcodes.H1[0].birth).toBeGreaterThan(0.1);
    });

    it('should detect topological changes in dynamic data', () => {
      // Create two separate clusters
      const cluster1 = [[0, 0], [0.1, 0], [0.05, 0.1]];
      const cluster2 = [[2, 0], [2.1, 0], [2.05, 0.1]];
      
      const result1 = tdaEngine.computeZigzagPersistence([...cluster1, ...cluster2]);
      
      // Should have 2 H0 components (2 clusters)
      expect(result1.barcodes.H0.length).toBe(2);
      
      // Add bridge between clusters
      const bridge = [[1, 0]];
      const result2 = tdaEngine.computeZigzagPersistence([...cluster1, ...bridge, ...cluster2]);
      
      // Should now have 1 H0 component (connected)
      expect(result2.barcodes.H0.length).toBe(1);
    });
  });

  describe('🎯 Multi-Scale Persistent Homology', () => {
    it('should compute PH at multiple scales', () => {
      const pointCloud = [
        [0, 0], [1, 0], [0.5, 0.866], // Triangle
        [2, 0], [3, 0], [2.5, 0.866]  // Another triangle
      ];
      
      const scales = [0.5, 1.0, 1.5, 2.0];
      const results = tdaEngine.computeMultiScalePH(pointCloud, scales);
      
      expect(results).toHaveLength(4);
      results.forEach((result: MultiScaleResult, index: number) => {
        expect(result.scale).toBe(scales[index]);
        expect(result.barcodes).toBeDefined();
        expect(result.computationTime).toBeLessThan(500);
      });
    });

    it('should identify optimal scale for pattern detection', () => {
      // Create a pattern with clear structure at specific scale
      const pattern: number[][] = [];
      const gridSize = 5;
      const spacing = 1.0;
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          pattern.push([i * spacing, j * spacing]);
        }
      }
      
      const optimalScale = tdaEngine.findOptimalScale(pattern);
      
      expect(optimalScale).toBeGreaterThan(0);
      expect(optimalScale).toBeLessThan(spacing * 2);
    });
  });

  describe('⚛️ Quantum Pattern Detection', () => {
    it('should detect quantum resonance patterns', () => {
      const testData = {
        points: [[0, 0], [1, 0], [0, 1], [1, 1]],
        metadata: {
          quranic_context: 'verse_pattern',
          resonance_frequency: 19,
          sacred_geometry: true
        }
      };
      
      const result = quantumDetector.detectQuantumPatterns(testData.points, testData.metadata);
      
      expect(result).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.quantumMetrics).toBeDefined();
      expect(result.quantumMetrics.superpositionScore).toBeGreaterThanOrEqual(0);
      expect(result.quantumMetrics.entanglementDegree).toBeGreaterThanOrEqual(0);
      expect(result.quantumMetrics.coherenceMeasure).toBeGreaterThanOrEqual(0);
    });

    it('should calculate quantum resonance metrics accurately', () => {
      const points = [
        [0, 0], [1, 1], [2, 2], [3, 3], // Linear pattern
        [1, 0], [2, 1], [3, 2], [4, 3]  // Parallel line
      ];
      
      const metrics = quantumDetector.calculateQuantumResonance(points);
      
      expect(metrics.resonanceScore).toBeGreaterThan(0);
      expect(metrics.resonanceScore).toBeLessThanOrEqual(1);
      expect(metrics.frequency).toBeGreaterThan(0);
      expect(metrics.phase).toBeGreaterThanOrEqual(0);
      expect(metrics.phase).toBeLessThan(2 * Math.PI);
    });

    it('should detect superposition in overlapping patterns', () => {
      // Create overlapping circular patterns
      const pattern1: number[][] = [];
      const pattern2: number[][] = [];
      
      for (let i = 0; i < 10; i++) {
        const angle = (2 * Math.PI * i) / 10;
        pattern1.push([Math.cos(angle), Math.sin(angle)]);
        pattern2.push([Math.cos(angle) + 0.5, Math.sin(angle)]);
      }
      
      const combined = [...pattern1, ...pattern2];
      const result = quantumDetector.detectQuantumPatterns(combined);
      
      expect(result.quantumMetrics.superpositionScore).toBeGreaterThan(0.3);
      expect(result.patterns.some((p: any) => p.type === 'superposition')).toBe(true);
    });
  });

  describe('🔗 Integration Tests', () => {
    it('should integrate TDA with quantum detection seamlessly', () => {
      const quranicPattern = [
        [1, 1], [7, 1], [19, 1], // Sacred numbers
        [1, 7], [7, 7], [19, 7],
        [1, 19], [7, 19], [19, 19]
      ];
      
      // First compute TDA
      const tdaResult = tdaEngine.computeZigzagPersistence(quranicPattern);
      
      // Then detect quantum patterns
      const quantumResult = quantumDetector.detectQuantumPatterns(quranicPattern, {
        quranic_context: 'sacred_numbers',
        numerical_pattern: [7, 19]
      });
      
      // Results should be consistent
      expect(tdaResult.barcodes.H0.length).toBeGreaterThan(0);
      expect(quantumResult.quantumMetrics.resonanceScore).toBeGreaterThan(0);
      
      // High resonance should correlate with interesting topology
      if (quantumResult.quantumMetrics.resonanceScore > 0.7) {
        expect(tdaResult.barcodes.H1.length + tdaResult.barcodes.H2.length).toBeGreaterThan(0);
      }
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset: number[][] = [];
      const numPoints = 1000;
      
      // Generate random points with some structure
      for (let i = 0; i < numPoints; i++) {
        if (i % 3 === 0) {
          // Points on circle
          const angle = (2 * Math.PI * i) / (numPoints / 3);
          largeDataset.push([10 * Math.cos(angle), 10 * Math.sin(angle)]);
        } else {
          // Random points
          largeDataset.push([
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
          ]);
        }
      }
      
      const startTime = Date.now();
      const result = tdaEngine.computeZigzagPersistence(largeDataset);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // < 5 seconds
      expect(result.barcodes).toBeDefined();
      expect(result.computationTime).toBeLessThan(5000);
    });
  });

  describe('🛡️ Error Handling & Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      expect(() => tdaEngine.computeZigzagPersistence([])).not.toThrow();
      const result = tdaEngine.computeZigzagPersistence([]);
      expect(result.barcodes.H0.length).toBe(0);
    });

    it('should handle single point correctly', () => {
      const singlePoint = [[0, 0]];
      const result = tdaEngine.computeZigzagPersistence(singlePoint);
      
      expect(result.barcodes.H0.length).toBe(1);
      expect(result.barcodes.H1.length).toBe(0);
      expect(result.barcodes.H2.length).toBe(0);
    });

    it('should handle degenerate cases', () => {
      // All points at same location
      const degenerate = [[0, 0], [0, 0], [0, 0], [0, 0]];
      const result = tdaEngine.computeZigzagPersistence(degenerate);
      
      expect(result.barcodes.H0.length).toBe(1); // Should collapse to single component
    });

    it('should validate input dimensions', () => {
      const invalidData = [[1], [1, 2, 3], [1, 2]]; // Inconsistent dimensions
      
      expect(() => tdaEngine.computeZigzagPersistence(invalidData)).not.toThrow();
      // Should handle gracefully, possibly by padding or truncating
    });
  });

  describe('📈 Performance Benchmarks', () => {
    it('should meet performance targets for small datasets', () => {
      const smallDataset: number[][] = [];
      for (let i = 0; i < 50; i++) {
        smallDataset.push([Math.random() * 10, Math.random() * 10]);
      }
      
      const result = tdaEngine.computeZigzagPersistence(smallDataset);
      
      expect(result.computationTime).toBeLessThan(100); // < 100ms for small datasets
      expect(result.accuracy).toBeGreaterThan(0.95);
    });

    it('should maintain accuracy across different scales', () => {
      const testPattern = [
        [0, 0], [1, 0], [0.5, Math.sqrt(3)/2] // Equilateral triangle
      ];
      
      const scales = [0.1, 0.5, 1.0, 2.0, 5.0];
      const results = scales.map(scale => 
        tdaEngine.computeMultiScalePH(testPattern, [scale])[0]
      );
      
      // Topological features should be consistent across scales
      const h0Counts = results.map(r => r.barcodes.H0.length);
      const h1Counts = results.map(r => r.barcodes.H1.length);
      
      expect(new Set(h0Counts).size).toBeLessThanOrEqual(2); // Should be consistent
      expect(new Set(h1Counts).size).toBeLessThanOrEqual(2);
    });
  });
});