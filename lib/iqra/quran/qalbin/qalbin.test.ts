import { describe, it, expect } from 'vitest';
import { Qalbin_VM } from './qalbin_vm';
import { Modality } from './qalbin_node';

describe('Qalbin VM - Conscience Interaction Engine', () => {
  it('should handle ALIF-ALIF annihilation correctly', () => {
    const vm = new Qalbin_VM();
    const a1 = vm.spawn('ALIF', Modality.IKHLAS);
    const a2 = vm.spawn('ALIF', Modality.IKHLAS);
    
    vm.ignite(a1, a2);
    const result = vm.pulse();
    
    expect(result.steps).toBeGreaterThan(0);
    expect(result.resonance).toBe(1.5); // (1.5 / 1) - wait, if nodes are deleted, resonance calculation needs to handle empty state
  });

  it('should handle ALIF-LAM commutation correctly', () => {
    const vm = new Qalbin_VM();
    const nA = vm.spawn('ALIF', Modality.ADL);
    const nL = vm.spawn('LAM', Modality.MIZAN);
    
    vm.ignite(nA, nL);
    const result = vm.pulse();
    
    expect(result.steps).toBeGreaterThan(0);
  });

  it('should throw error on AMAN modality violation', () => {
    const vm = new Qalbin_VM();
    const nSafety = vm.spawn('ALIF', Modality.AMAN);
    const nDanger = vm.spawn('ALIF', Modality.RAHMA);
    
    (vm as any).nodes.get(nSafety).metadata['risk_score'] = 0.95;
    vm.ignite(nSafety, nDanger);
    
    expect(() => vm.pulse()).toThrow('AMAN_VIOLATION');
  });
});
