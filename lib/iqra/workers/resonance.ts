import { SovereignWorker, WorkerResult, Handoff } from './protocol.ts';
import { GoEngineBridge } from '../engine_bridge.ts';
import { IQRAMemory, QuantumTopologyStore } from '../memory.ts';
import { IQRALogger } from '../logger.ts';

export class ResonanceWorker extends SovereignWorker {
  id = 'ResonanceWorker';

  async execute(input: string, context: any): Promise<WorkerResult> {
    this.report.workerId = this.id;
    this.report.timestamp = Date.now();

    try {
      // 1. Calculate Resonance
      const resonanceData = await GoEngineBridge.calculateResonance(input);
      const cmdStr = `go run main.go -mode resonance -input "..."`;
      this.logCommand(cmdStr, resonanceData ? 0 : 1);
      
      if (!resonanceData) {
        this.logIssue('Go Engine resonance calculation returned null.');
        this.markUndone('Detailed pattern analysis');
      } else {
        this.markImplemented('Resonance calculation');
        this.markImplemented(`Patterns found: ${resonanceData.patterns.join(', ')}`);
      }

      // 2. Calculate Novelty & Reward
      const embedding = await (QuantumTopologyStore as any).generateEmbedding(input);
      const novelty = await IQRAMemory.computeNovelty(embedding);
      this.markImplemented(`Novelty score: ${novelty.toFixed(2)}`);

      const coherence = resonanceData?.coherence || 0.5;
      const reward = (coherence * 0.1) * (1.0 + novelty);
      await IQRAMemory.grantReward(reward);
      this.markImplemented(`Reward granted: ${reward.toFixed(4)}`);

      const handoff: Handoff = {
        from: this.id,
        to: 'ResearchWorker',
        payload: {
          input,
          resonance: resonanceData,
          novelty,
          reward
        },
        context: 'Topological resonance analysis complete. Patterns discovered.'
      };

      this.markImplemented('Topological curiosity reward granted');
      this.report.proceduresFollowed = true;

      return {
        success: true,
        data: resonanceData,
        report: this.report,
        nextHandoff: handoff
      };
    } catch (error: any) {
      this.logIssue(`ResonanceWorker Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        report: this.report
      };
    }
  }
}
