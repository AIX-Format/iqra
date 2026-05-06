const { IQRAMemory } = require('../lib/iqra/memory');
const { IQRALogger } = require('../lib/iqra/logger');

async function run() {
  console.log('--- Intentional Isolation: Testing IQRAMemory ---');
  try {
    const cycle = await IQRAMemory.getCycleCounter();
    console.log('Current Cycle:', cycle);
    
    console.log('Setting test key...');
    await IQRAMemory.set('isolation_test', 'success');
    
    const val = await IQRAMemory.get('isolation_test');
    console.log('Retrieved value:', val);
    
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

run();
