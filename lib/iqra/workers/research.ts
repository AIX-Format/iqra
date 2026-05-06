import { SovereignWorker, WorkerResult, MissionState } from './protocol.ts';
import { MissionHandoff } from '../../../agents/contracts.ts';
import * as fs from 'fs';
import * as path from 'path';
import { IQRALogger } from '../logger.ts';

export class ResearchWorker extends SovereignWorker {
  id = 'ResearchWorker';

  async execute(input: string, state: MissionState): Promise<WorkerResult> {
    this.report.worker_id = this.id;
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
      const updatedContext = {
        ...state.context,
        research: {
          discoveries: discoveries.substring(0, 1000), // Safety limit
          reflection: reflection.substring(0, 1000)
        }
      };

      const updatedState: MissionState = {
        ...state,
        context: updatedContext,
        reports: [...state.reports, this.report]
      };

      this.markImplemented('Synthesized internal research context with previous resonance data');
      this.report.procedures_followed = true;

      return {
        success: true,
        data: updatedContext,
        report: this.report,
        updatedState,
      const handoff: MissionHandoff = {
        mission_id: state.metadata.missionId,
        from_worker: this.id,
        to_worker: 'ValidationWorker',
        timestamp: Date.now(),
        artifacts: [],
        pending_tasks: ['Dastur compliance check'],
        known_issues: this.report.issues_discovered,
        validation_rules: ['HARAM_LIST compliance'],
        context_data: updatedContext
      };
      
      return {
        success: true,
        data: updatedContext,
        report: this.report,
        updatedState,
        nextHandoff: handoff
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
