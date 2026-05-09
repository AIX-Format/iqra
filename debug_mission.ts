
import { runMission } from './lib/iqra/01-core/mission-runner.js';
import fs from 'fs';
import path from 'path';

async function test() {
  const missionPath = path.join(process.cwd(), 'topology-mission.yml');
  const missionYaml = `
mission_id: "topology_debug_001"
verse: "24:35"
field_of_inquiry: "Cosmology"
provider: "simulated"
status: "pending"
  `.trim();
  
  fs.writeFileSync(missionPath, missionYaml);
  
  try {
    console.log('Starting mission...');
    const result = await runMission(missionPath);
    console.log('Mission Result:', JSON.stringify(result, null, 2));
    if (result.status === 'failed') {
      console.error('Error:', result.error);
    }
  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

test();
