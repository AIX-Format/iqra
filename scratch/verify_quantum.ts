import { QuantumTopologyStore } from '../lib/iqra/memory.ts';
import { iqraThink, IQRABrainMode } from '../lib/iqra/brain.ts';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

async function testQuantumMemory() {
  console.log('🌀 Testing Quantum Topological Memory...');

  try {
    // 1. Store a test memory
    console.log('📥 Storing memory: "Patience is a light that never fades."');
    const id = await QuantumTopologyStore.storeQuantum({
      content: 'Patience is a light that never fades.',
      coordinates: { concept: 'Sabr' },
      superposition: ['What is the virtue of patience?']
    });
    console.log(`✅ Stored with ID: ${id}`);

    // 2. Search with resonance
    console.log('🔍 Searching for "hardship" with Sabr resonance...');
    const results = await QuantumTopologyStore.searchQuantum('hardship', 'Sabr');
    console.log('Results:', JSON.stringify(results, null, 2));

    // 3. Test Brain integration
    console.log('🧠 Testing Brain iqraThink...');
    const { response, provider } = await iqraThink({
      input: 'I am going through a difficult time, need some wisdom on patience.',
      mode: IQRABrainMode.FAST_RESPONSE
    });
    console.log(`📡 Provider: ${provider}`);
    console.log(`📖 Response: ${response.slice(0, 100)}...`);
    
    if (response.includes('[FROM THE TABLET]')) {
      console.log('✨ Success: Wisdom retrieved from historical memory!');
    } else {
      console.log('⚠️ Note: Historical memory not triggered (expected if first run).');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testQuantumMemory();
