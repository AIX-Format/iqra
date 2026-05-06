import { SovereignWorker, WorkerResult } from './protocol.ts';
import { ConnectorFactory, Provider } from '../../src/connectors/index.ts';
import { FULL_SYSTEM_PROMPT } from '../brain.ts'; // We might need to export this
import { IQRAMemory } from '../memory.ts';

export class ExecutionWorker extends SovereignWorker {
  id = 'ExecutionWorker';

  async execute(input: any, context: any): Promise<WorkerResult> {
    this.report.workerId = this.id;
    this.report.timestamp = Date.now();

    try {
      const { input: rawInput, resonance, novelty, reward, research } = context.payload;
      
      const curiosity = await IQRAMemory.getCuriosity();
      
      let enrichedInput = `[Curiosity: ${curiosity.toFixed(2)}][Resonance: ${resonance?.coherence?.toFixed(2)}][Novelty: ${novelty?.toFixed(2)}]\n`;
      
      if (research) {
        enrichedInput += `[RESEARCH_CONTEXT]: ${research.discoveries.substring(0, 300)}...\n`;
      }
      
      enrichedInput += `[PROMPT]: ${rawInput}`;

      const connector = ConnectorFactory.getConnector(this.provider); 
      const messages = [
        { role: 'system' as const, content: FULL_SYSTEM_PROMPT },
        { role: 'user' as const, content: enrichedInput }
      ];

      const result = await connector.generate(enrichedInput, messages);
      this.markImplemented('Final response generation with enriched serial context');
      this.markImplemented(`Model specialized: ${this.provider} (Execution Optimization)`);
      this.report.proceduresFollowed = true;

      return {
        success: true,
        data: result.content,
        report: this.report
      };
    } catch (error: any) {
      this.logIssue(`ExecutionWorker Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        report: this.report
      };
    }
  }
}
