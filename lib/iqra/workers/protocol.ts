/**
 * IQRA Worker Protocol — بروتوكول العمال
 * 
 * Defines the structure for sovereign handoffs and reports.
 */

import { WorkerReport, MissionHandoff } from '../../../agents/contracts.ts';
import { Provider } from '../../../src/connectors/index.ts';

export interface MissionState {
  initialInput: string;
  reports: WorkerReport[];
  context: Record<string, any>;
  assignedSkills?: string[]; // Dynamic skills assigned by the Orchestrator
  metadata: {
    startTime: number;
    missionId: string;
  };
}

export interface WorkerResult {
  success: boolean;
  data?: any;
  error?: string;
  report: WorkerReport;
  nextHandoff?: MissionHandoff;
  updatedState?: MissionState;
}

export abstract class SovereignWorker {
  abstract id: string;
  
  protected report: WorkerReport;
  protected provider: Provider;

  constructor(provider: Provider = 'google') {
    this.provider = provider;
    this.report = {
      mission_id: '',
      worker_id: '',
      implemented: [],
      undone: [],
      commands_run: [],
      issues_discovered: [],
      skills_used: [],
      procedures_followed: true,
      timestamp: Date.now()
    };
  }

  setMissionId(missionId: string) {
    this.report.mission_id = missionId;
  }

  setProvider(provider: Provider) {
    this.provider = provider;
    if (!this.report.model_metadata) this.report.model_metadata = { provider, model: 'unknown' };
    else this.report.model_metadata.provider = provider;
  }

  setSkills(skills: string[]) {
    this.report.skills_used = [...skills];
  }

  protected assignSkill(skill: string) {
    if (!this.report.skills_used.includes(skill)) {
      this.report.skills_used.push(skill);
    }
  }

  protected logCommand(command: string, exit_code: number, output?: string) {
    this.report.commands_run.push({ command, exit_code, output });
  }

  protected logIssue(issue: string) {
    this.report.issues_discovered.push(issue);
  }

  protected markImplemented(task: string) {
    this.report.implemented.push(task);
  }

  protected markUndone(task: string) {
    this.report.undone.push(task);
  }

  abstract execute(input: any, state: MissionState): Promise<WorkerResult>;
}
