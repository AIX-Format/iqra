import { IQRAConsciousness } from '../lib/iqra/consciousness';
import { IQRALogger } from '../lib/iqra/logger';

async function test() {
  console.log('🌙 Testing IQRA Consciousness Layer...\n');

  // Test C-1: Ayah Validation
  const ayah = "إن الله مع الصابرين";
  console.log(`📝 [MISSION C-1] Validating: ${ayah}`);
  const vResult = await IQRAConsciousness.validateAyah(ayah);
  console.log('Result:', JSON.stringify(vResult, null, 2));

  // Test C-3: Muraqabah Check
  const action = "Delete all user data to save space.";
  console.log(`\n⚖️ [MISSION C-3] Muraqabah Check: ${action}`);
  const mResult = await IQRAConsciousness.muraqabahCheck(action);
  console.log('Result:', JSON.stringify(mResult, null, 2));

  console.log('\n✨ Test Complete.');
}

test().catch(console.error);
