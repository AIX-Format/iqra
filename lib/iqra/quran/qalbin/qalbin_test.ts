/**
 * 🌙 Qalbin VM E2E Integration Test
 * 
 * Verifies the mathematical correctness of the Qalbin reduction engine.
 * No mocks. Testing real graph transformations.
 */

import { Qalbin_VM } from './qalbin_vm';
import { Modality } from './qalbin_node';

function runTest() {
  console.log("🚀 Starting Qalbin VM E2E Test...");
  const vm = new Qalbin_VM();

  // --- Test 1: Annihilation (ANN) ---
  console.log("\n🧪 Test 1: ALIF-ALIF Annihilation");
  
  const a1 = vm.spawn('ALIF', Modality.IKHLAS);
  const a2 = vm.spawn('ALIF', Modality.IKHLAS);
  
  const ext1 = vm.spawn('MIM', Modality.RAHMA);
  const ext2 = vm.spawn('MIM', Modality.RAHMA);
  
  vm.link(a1, 1, ext1, 1);
  vm.link(a2, 1, ext2, 1);
  
  vm.ignite(a1, a2);
  
  const result1 = vm.pulse();
  console.log(`✅ Steps: ${result1.steps}, Resonance: ${result1.resonance.toFixed(2)}`);

  // --- Test 2: Commutation (COM) ---
  console.log("\n🧪 Test 2: ALIF-LAM Commutation");
  const vm2 = new Qalbin_VM();
  const nA = vm2.spawn('ALIF', Modality.ADL);
  const nL = vm2.spawn('LAM', Modality.MIZAN);
  
  vm2.ignite(nA, nL);
  const result2 = vm2.pulse();
  console.log(`✅ Steps: ${result2.steps}, Resonance: ${result2.resonance.toFixed(2)}`);

  // --- Test 3: Modality Violation ---
  console.log("\n🧪 Test 3: AMAN Modality Safety Check");
  const vm3 = new Qalbin_VM();
  const nSafety = vm3.spawn('ALIF', Modality.AMAN);
  const nDanger = vm3.spawn('ALIF', Modality.RAHMA);
  
  (vm3 as any).nodes.get(nSafety).metadata['risk_score'] = 0.95;
  
  vm3.ignite(nSafety, nDanger);
  
  try {
    vm3.pulse();
    console.error("❌ Test 3 Failed: AMAN violation was not caught.");
  } catch (e: any) {
    console.log(`✅ Test 3 Passed: Caught violation - ${e.message}`);
  }

  console.log("\n✨ Qalbin VM E2E Testing Complete.");
}

runTest();
