import { SovereignWorker, WorkerResult, Handoff } from './protocol.ts';
import * as fs from 'fs';
import * as path from 'path';
import { IQRALogger } from '../logger.ts';

export class ResearchWorker extends SovereignWorker {
  id = 'ResearchWorker';

  async execute(input: any, context: any): Promise<WorkerResult> {
    this.report.workerId = this.id;
    this.report.timestamp = Date.now();

    try {
      // 1. Gather context from DISCOVERIES.md
      const discoveriesPath = path.join(process.cwd(), 'DISCOVERIES.md');
      let discoveries = '';
      if (fs.existsSync(discoveriesPath)) {
        discoveries = fs.readFileSync(discoveriesPath, 'utf-8');
        this.markImplemented('Gathered context from DISCOVERIES.md');
      } else {
        this.logIssue('DISCOVERIES.md not found.');
      }

      // 2. Gather context from REFLECTION.md
      const reflectionPath = path.join(process.cwd(), 'REFLECTION.md');
      let reflection = '';
      if (fs.existsSync(reflectionPath)) {
        reflection = fs.readFileSync(reflectionPath, 'utf-8');
        this.markImplemented('Gathered context from REFLECTION.md');
      }

      // 3. Synthesize Research
      const researchContext = {
        ...context.payload,
        research: {
          discoveries,
          reflection
        }
      };

      this.markImplemented('Synthesized internal research context with previous resonance data');
      this.report.proceduresFollowed = true;

      return {
        success: true,
        data: researchContext,
        report: this.report,
        nextHandoff: {
          from: this.id,
          to: 'ValidationWorker',
          payload: researchContext,
          context: 'Internal research phase complete. Context enriched for validation.'
        }
      };
    } catch (error: any) {
      this.logIssue(`ResearchWorker Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        report: this.report
      };
    }
  }
}
