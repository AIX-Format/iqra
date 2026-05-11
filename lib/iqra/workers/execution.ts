import { SovereignWorker } from './protocol';
import type { WorkerResult, MissionState } from './protocol';
import { ConnectorFactory, Provider } from '../../../src/connectors/index';
import { FULL_SYSTEM_PROMPT } from '../prompts';
import { IQRAMemory } from '../memory';

export class ExecutionWorker extends SovereignWorker {
  id = 'ExecutionWorker';

  async execute(input: string, state: MissionState): Promise<WorkerResult> {
    this.report.worker_id = this.id;
    this.report.timestamp = Date.now();

    try {
      // Enhanced context gathering with validation
      const { resonance, novelty, research } = state.context;
      
      // Get curiosity with fallback
      let curiosity = 0.5;
      try {
        curiosity = await IQRAMemory.getCuriosity();
      } catch (e) {
        this.logIssue(`Failed to get curiosity: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      // Enhanced input enrichment with metadata
      let enrichedInput = `[EXECUTION_PHASE: FINAL]\n`;
      enrichedInput += `[Curiosity: ${curiosity.toFixed(2)}][Resonance: ${resonance?.coherence?.toFixed(2) || 'N/A'}][Novelty: ${novelty?.toFixed(2) || 'N/A'}]\n`;
      enrichedInput += `[Mission_ID: ${state.metadata.mission_id}][Worker: ${this.id}][Timestamp: ${Date.now()}]\n`;
      
      if (research) {
        enrichedInput += `[RESEARCH_CONTEXT]: ${research.discoveries.substring(0, 500)}...\n`;
        if (research.reflection) {
          enrichedInput += `[REFLECTION_CONTEXT]: ${research.reflection.substring(0, 300)}...\n`;
        }
      }
      
      // Add validation context if available
      if (state.context.validation) {
        enrichedInput += `[VALIDATION_STATUS: ${state.context.validation.success ? 'PASSED' : 'FAILED'}]\n`;
        if (state.context.validation.violations_count > 0) {
          enrichedInput += `[VALIDATION_WARNINGS: ${state.context.validation.violations_count} violations detected]\n`;
        }
      }
      
      enrichedInput += `[PROMPT]: ${input}`;

      // Enhanced connector selection with fallback
      let connector;
      try {
        connector = ConnectorFactory.getConnector(this.provider);
      } catch (e) {
        this.logIssue(`Failed to get connector for ${this.provider}: ${e instanceof Error ? e.message : String(e)}`);
        // Fallback to google
        connector = ConnectorFactory.getConnector('google');
        this.provider = 'google';
      }
      
      const messages = [
        { role: 'system' as const, content: FULL_SYSTEM_PROMPT },
        { role: 'user' as const, content: enrichedInput }
      ];

      // Enhanced generation with timeout and retry
      let result;
      try {
        result = await connector.generate(enrichedInput, messages);
      } catch (e) {
        this.logIssue(`Generation failed with ${this.provider}: ${e instanceof Error ? e.message : String(e)}`);
        // Retry with fallback provider if different
        if (this.provider !== 'google') {
          this.provider = 'google';
          connector = ConnectorFactory.getConnector('google');
          result = await connector.generate(enrichedInput, messages);
          this.markImplemented('Retried generation with fallback provider');
        } else {
          throw e;
        }
      }
      
      this.markImplemented('Final response generation with enhanced context');
      this.markImplemented(`Model specialized: ${this.provider} (Execution Optimization)`);
      this.markImplemented(`Response length: ${result.content?.length || 0} characters`);
      
      // Validate response quality
      if (!result.content || result.content.length < 10) {
        this.logIssue('Generated response is too short or empty');
        this.report.procedures_followed = false;
        this.report.status = 'FAIL';
        this.report.exit_code = 1;
        return {
          success: false,
          error: 'Generated response insufficient',
          report: this.report
        };
      }
      
      this.report.procedures_followed = true;
      this.report.status = 'PASS';
      this.report.exit_code = 0;

      // Enhanced state update with execution metadata
      const updatedContext = {
        ...state.context,
        execution: {
          provider_used: this.provider,
          response_length: result.content.length,
          timestamp: Date.now(),
          curiosity_at_execution: curiosity
        }
      };

      const updatedState: MissionState = {
        ...state,
        context: updatedContext,
        reports: [...state.reports, this.report]
      };

      return {
        success: true,
        data: result.content,
        report: this.report,
        updated_state: updatedState
      };
    } catch (error: any) {
      this.logIssue(`ExecutionWorker Error: ${error.message}`);
      this.report.procedures_followed = false;
      this.report.status = 'FAIL';
      this.report.exit_code = 2;
      return {
        success: false,
        error: `Execution failed: ${error.message}`,
        report: this.report
      };
    }
  }
}
