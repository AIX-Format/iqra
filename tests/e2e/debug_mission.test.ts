
import { describe, it, expect } from 'vitest';
import { runMission } from '#01-core/mission-runner.js';
import fs from 'fs';
import path from 'path';

describe('Debug Mission', () => {
  it('should run mission and log output', async () => {
    const missionPath = path.join(process.cwd(), 'topology-mission-debug.yml');
    const missionYaml = `
mission_id: "topology_debug_001"
verse: "24:35"
field_of_inquiry: "Cosmology"
provider: "simulated"
status: "pending"
    `.trim();
    
    fs.writeFileSync(missionPath, missionYaml);
    
    console.log('Starting mission...');
    const result = await runMission(missionPath);
    console.log('Mission Result:', JSON.stringify(result, null, 2));
    
    expect(result.status).toBe('completed');
  });
});
