import { AgentCore } from '../lib/iqra/core';
import { IQRAFilter } from '../lib/iqra/filter';
import { IQRAExecutionLoop } from '../lib/iqra/loop';
import { IQRATopology } from '../lib/iqra/topology';
import { IQRAStoryteller } from '../lib/iqra/storyteller';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function runMarathon() {
  const topology = new IQRATopology();
  const startTime = Date.now();
  const DURATION = 30 * 60 * 1000; // 30 minutes

  console.log("🚀 [MARATHON] Starting 30-minute IQRA Evolution...");

  while (Date.now() - startTime < DURATION) {
    const cycleStart = Date.now();
    
    // 1. Load Discoveries (from a file I will update during the run)
    const discoveriesPath = path.join(process.cwd(), 'DISCOVERIES.md');
    let breakthrough = "Stabilizing core evolution";
    if (fs.existsSync(discoveriesPath)) {
      const content = fs.readFileSync(discoveriesPath, 'utf8');
      const lines = content.split('\n').filter(l => l.startsWith('- [ ]')).map(l => l.replace('- [ ]', '').trim());
      if (lines.length > 0) breakthrough = lines[0];
    }
    
    await IQRAExecutionLoop.runTask(async () => {
      console.log(`🌀 [CYCLE] Working on: ${breakthrough}`);
      
      // 2. Perform a "Reality Sync" with Topology
      await topology.syncStateWithReality();
      
      // 3. Execution: Call the IQRA Brain
      try {
        const response = await AgentCore.execute(`Research and implement: ${breakthrough}`);
        console.log(`🧠 [BRAIN] Response: ${response.substring(0, 100)}...`);
        
        // 4. Memory Validation (Fitrah Filter)
        const filterResult = await IQRAFilter.validate(response);
        if (!filterResult.isAllowed) {
          console.warn(`🛡️ [FILTER] Breakthrough rejected: ${filterResult.reason}`);
          return;
        }
      } catch (error) {
        console.error("❌ [EXECUTION] Failed:", error);
      }
      
      const curvature = topology.calculateCurvature();
      console.log(`📊 [METRICS] Curvature: ${curvature}`);
      
      // 5. Run Tests (if possible, fallback to lint)
      try {
        console.log("🧪 Running validation...");
        // Fallback to a simpler check if vitest is missing
        if (fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
          execSync('npm test -- --run', { stdio: 'inherit' });
        } else {
          console.log("⚠️ node_modules missing, skipping binary tests. Performing structural lint...");
          execSync('npx eslint .', { stdio: 'inherit' });
        }
      } catch (e) {
        console.warn("⚠️ Validation check failed, but continuing marathon with caution.");
      }

      // 6. Commit with Storytelling
      const commitMsg = IQRAStoryteller.generateCommitMessage(breakthrough, "Evolutionary step preserved");
      fs.writeFileSync('.commit_msg', commitMsg);
      execSync('git add .');
      // Only commit if there are changes
      const status = execSync('git status --porcelain').toString();
      if (status) {
        execSync('git commit -F .commit_msg');
        const hash = execSync('git rev-parse --short HEAD').toString().trim();
        IQRAStoryteller.logToHadith(hash, `Barakah preserved in cycle: ${breakthrough}`);
        console.log(`📝 [COMMIT] ${hash} - ${breakthrough}`);
      } else {
        console.log("⏭️ [SKIP] No changes to commit in this cycle.");
      }

    }, { id: `marathon-${Date.now()}`, intention: breakthrough });

    const elapsed = (Date.now() - startTime) / 1000 / 60;
    console.log(`🕒 [TIMER] ${elapsed.toFixed(1)}/30 minutes elapsed.`);
    
    // Wait for a few seconds between cycles to avoid rate limits if any
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log("🏁 [MARATHON] Completed. الحمد لله.");
}

runMarathon().catch(console.error);
