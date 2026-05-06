const { IQRAMemory } = require('../lib/iqra/memory');
const { IQRALogger } = require('../lib/iqra/logger');

// The Silent Actor Pattern: Monitoring active handles
setInterval(() => {
  const handles = process._getActiveHandles();
  const requests = process._getActiveRequests();
  console.log('--- 🎭 Silent Actor Status ---');
  console.log('Active Handles:', handles.length);
  console.log('Active Requests:', requests.length);
  
  handles.forEach((h, i) => {
    console.log(`Handle [${i}]:`, h.constructor.name);
  });
}, 5000);

async function run() {
  console.log('🚀 Starting Silent Actor Trace...');
  try {
    // Try to trigger the hang
    console.log('Attempting Redis connection...');
    const result = await IQRAMemory.get('any_key');
    console.log('Result:', result);
    
    // Keep running to see if handles persist
    setTimeout(() => {
      console.log('🏁 Script finished its task, but waiting to see if handles clear...');
    }, 10000);
  } catch (err) {
    console.error('❌ Error in Silent Actor:', err);
  }
}

run();
