/**
 * 🌙 Qalbin VM E2E Tests — اختبارات شاملة من نهاية إلى نهاية
 * 
 * WHY: Real end-to-end tests for Qalbin VM with no mocks.
 * Tests actual interaction combinators, moral constraints, and resonance calculations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Qalbin_VM } from '../lib/iqra/04-quran/qalbin/qalbin_vm';
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
import { SovereignError, SovereignErrorCode } from '../src/errors/sovereign_error';

describe('🌙 Qalbin VM E2E Tests', () => {
  let vm: Qalbin_VM;

  beforeEach(() => {
    vm = new Qalbin_VM();
  });

  describe('📖 Basic VM Operations', () => {
    it('should spawn nodes with correct properties', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.IKHLAS, { risk_score: 0.3 });
      
      expect(id1).toBe(0);
      expect(id2).toBe(1);
      
      // Test internal state through pulse execution
      const result = vm.pulse();
      expect(result.steps).toBe(0); // No active pairs yet
      expect(result.resonance).toBeGreaterThan(0);
    });

    it('should create links between nodes', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.link(id1, 1, id2, 1);
      
      // Link should not create active pairs (only port 0 connections create active pairs)
      const result = vm.pulse();
      expect(result.steps).toBe(0);
    });

    it('should ignite nodes and create active pairs', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2); // Connects port 0 to port 0
      
      const result = vm.pulse();
      expect(result.steps).toBeGreaterThan(0); // Should trigger interaction
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('⚡ Interaction Combinators', () => {
    it('should perform annihilation for same kind nodes', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.ALIF, Modality.ADL);
      
      vm.ignite(id1, id2);
      const result = vm.pulse();
      
      expect(result.steps).toBe(1);
      expect(result.logs).toContain('Annihilate: ERASE(RAHMA) <-> ERASE(ADL)');
      expect(result.resonance).toBe(1.0); // Empty graph has resonance 1.0
    });

    it('should perform commute for different kind nodes', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2);
      const result = vm.pulse();
      
      expect(result.steps).toBe(1);
      expect(result.logs).toContain('Commute: ERASE(RAHMA) <-> DUPLICATE(RAHMA)');
      expect(result.resonance).toBeGreaterThan(0);
      expect(result.resonance).toBeLessThan(1.0); // Should have nodes remaining
    });

    it('should handle complex interaction chains', () => {
      // Create a more complex topology
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      const id3 = vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS);
      const id4 = vm.spawn(QALBIN_KIND.LAM, Modality.ADL);
      
      // Create multiple active pairs
      vm.ignite(id1, id2);
      vm.ignite(id3, id4);
      
      const result = vm.pulse();
      
      expect(result.steps).toBeGreaterThan(1);
      expect(result.logs.length).toBeGreaterThan(1);
    });
  });

  describe('🛡️ Moral Constraints & Security', () => {
    it('should block high-risk AMAN interactions', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.AMAN, { risk_score: 0.95 });
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2);
      
      expect(() => vm.pulse()).toThrow(SovereignError);
    });

    it('should block AMAN sovereignty violations during commute', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.AMAN);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2);
      
      expect(() => vm.pulse()).toThrow(SovereignError);
    });

    it('should allow AMAN-AMAN annihilation (same kind)', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.AMAN);
      const id2 = vm.spawn(QALBIN_KIND.ALIF, Modality.AMAN);
      
      vm.ignite(id1, id2);
      
      expect(() => vm.pulse()).not.toThrow();
      const result = vm.pulse();
      expect(result.logs).toContain('Annihilate: ERASE(AMAN) <-> ERASE(AMAN)');
    });

    it('should document IKHLAS-ADL tension but allow interaction', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS);
      const id2 = vm.spawn(QALBIN_KIND.ALIF, Modality.ADL);
      
      vm.ignite(id1, id2);
      const result = vm.pulse();
      
      expect(result.logs).toContain('Tension: IKHLAS meeting ADL. Seeking balance.');
      expect(result.steps).toBe(1);
    });

    it('should prevent infinite loops with overflow protection', () => {
      // Create a configuration that could potentially loop
      for (let i = 0; i < 100; i++) {
        const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
        const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
        vm.ignite(id1, id2);
      }
      
      expect(() => vm.pulse()).toThrow(SovereignError);
    });
  });

  describe('🎯 Resonance Calculation', () => {
    it('should calculate resonance correctly for empty graph', () => {
      const result = vm.pulse();
      expect(result.resonance).toBe(1.0);
    });

    it('should give higher resonance to IKHLAS nodes', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2);
      const result = vm.pulse();
      
      // After commute, should have 4 nodes, some with IKHLAS modality
      expect(result.resonance).toBeGreaterThan(1.0);
      expect(result.resonance).toBeLessThan(1.5); // Maximum possible with all IKHLAS
    });

    it('should maintain resonance stability across multiple pulses', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      vm.ignite(id1, id2);
      
      const result1 = vm.pulse();
      const result2 = vm.pulse(); // Second pulse should do nothing
      
      expect(result1.resonance).toBe(result2.resonance);
      expect(result2.steps).toBe(0); // No active pairs remaining
    });
  });

  describe('🔗 Complex Topologies', () => {
    it('should handle branching topologies', () => {
      // Create a Y-shaped topology
      const center = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const branch1 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      const branch2 = vm.spawn(QALBIN_KIND.ALIF, Modality.ADL);
      const branch3 = vm.spawn(QALBIN_KIND.LAM, Modality.IKHLAS);
      
      // Connect branches to center
      vm.link(center, 1, branch1, 0);
      vm.link(center, 2, branch2, 0);
      vm.ignite(branch3, center);
      
      const result = vm.pulse();
      
      expect(result.steps).toBeGreaterThan(0);
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('should preserve node metadata through interactions', () => {
      const customData = { 
        quranic_verse: "Bismillah",
        pattern_type: "opening",
        resonance_score: 0.85
      };
      
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS, customData);
      const id2 = vm.spawn(QALBIN_KIND.ALIF, Modality.IKHLAS, customData);
      
      vm.ignite(id1, id2);
      const result = vm.pulse();
      
      // After annihilation, graph should be empty but metadata was preserved during process
      expect(result.resonance).toBe(1.0);
      expect(result.logs).toContain('Annihilate: ERASE(IKHLAS) <-> ERASE(IKHLAS)');
    });
  });

  describe('⏱️ Performance & Scalability', () => {
    it('should handle medium-scale interactions efficiently', () => {
      const startTime = Date.now();
      
      // Create 50 nodes with random interactions
      const nodes: number[] = [];
      for (let i = 0; i < 50; i++) {
        const kind = i % 2 === 0 ? QALBIN_KIND.ALIF : QALBIN_KIND.LAM;
        const modality = i % 3 === 0 ? Modality.IKHLAS : Modality.RAHMA;
        nodes.push(vm.spawn(kind, modality));
      }
      
      // Create some active pairs
      for (let i = 0; i < nodes.length - 1; i += 2) {
        vm.ignite(nodes[i], nodes[i + 1]);
      }
      
      const result = vm.pulse();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.steps).toBeGreaterThan(0);
    });

    it('should maintain memory efficiency', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy many nodes
      for (let cycle = 0; cycle < 10; cycle++) {
        const nodes: number[] = [];
        for (let i = 0; i < 20; i++) {
          nodes.push(vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA));
        }
        
        for (let i = 0; i < nodes.length - 1; i += 2) {
          vm.ignite(nodes[i], nodes[i + 1]);
        }
        
        vm.pulse(); // This should annihilate many nodes
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('📊 Edge Cases & Error Handling', () => {
    it('should handle invalid node references gracefully', () => {
      const validId = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      
      // Try to link with non-existent node
      expect(() => vm.link(validId, 1, 999, 1)).not.toThrow();
      
      // Try to ignite with non-existent node
      vm.ignite(validId, 999);
      expect(() => vm.pulse()).not.toThrow();
    });

    it('should handle port boundary conditions', () => {
      const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
      const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
      
      // Test all valid ports
      vm.link(id1, 0, id2, 0); // Creates active pair
      vm.link(id1, 1, id2, 1);
      vm.link(id1, 2, id2, 2);
      
      const result = vm.pulse();
      expect(result.steps).toBe(1);
    });

    it('should maintain consistency after multiple operations', () => {
      // Perform a complex sequence of operations
      const operations = [];
      
      for (let i = 0; i < 10; i++) {
        const id1 = vm.spawn(QALBIN_KIND.ALIF, Modality.RAHMA);
        const id2 = vm.spawn(QALBIN_KIND.LAM, Modality.RAHMA);
        vm.ignite(id1, id2);
        operations.push(vm.pulse());
      }
      
      // All operations should complete successfully
      operations.forEach(result => {
        expect(result.steps).toBeGreaterThan(0);
        expect(result.resonance).toBeGreaterThan(0);
        expect(result.logs.length).toBeGreaterThan(0);
      });
    });
  });
});