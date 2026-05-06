import { ResonanceWorker } from './workers/resonance.ts';
import { ResearchWorker } from './workers/research.ts';
import { ValidationWorker } from './workers/validator.ts';
import { ExecutionWorker } from './workers/execution.ts';
import { WorkerReport, WorkerResult } from './workers/protocol.ts';
import { IQRALogger } from './logger.ts';

export class MissionControl {
  private reports: WorkerReport[] = [];

  async run(input: string): Promise<{ response: string; reports: WorkerReport[] }> {
    this.reports = [];
    IQRALogger.info('🚀 [MISSION_CONTROL] Initiating Sovereign Worker Chain...');
    
    // 1. Resonance Worker (Discovery Phase - Patterns)
    const resonanceWorker = new ResonanceWorker('google'); // Uses Go Engine + LLM Patterns
    const resResult = await resonanceWorker.execute(input);
    this.reports.push(resResult.report);
    
    if (!resResult.success) {
       return { response: "Mission Aborted: Resonance Failure.", reports: this.reports };
    }

    // 2. Research Worker (Planning Phase - Context)
    const researchWorker = new ResearchWorker('google'); // Strong reasoning for context synthesis
    const researchResult = await researchWorker.execute(input, resResult.nextHandoff);
    this.reports.push(researchResult.report);

    if (!researchResult.success) {
      return { response: "Mission Aborted: Research Failure.", reports: this.reports };
    }

    // 3. Validation Worker (Validation Phase - Safety)
    const validationWorker = new ValidationWorker('google'); // Gemini's safety-first alignment
    const valResult = await validationWorker.execute(input, researchResult.nextHandoff);
    this.reports.push(valResult.report);

    if (!valResult.success) {
      return { response: `Mission Aborted: Dastur Violation. ${valResult.error}`, reports: this.reports };
    }

    // 4. Execution Worker (Implementation Phase - Action)
    const executionWorker = new ExecutionWorker('groq'); // Speed for final response delivery
    const execResult = await executionWorker.execute(input, valResult.nextHandoff);
    this.reports.push(execResult.report);

    IQRALogger.info('🏁 [MISSION_CONTROL] Chain completed successfully.');
    
    return {
      response: execResult.data || "Processing complete.",
      reports: this.reports
    };
  }

  static formatWorkerReports(reports: WorkerReport[]): string {
    let output = "\n## 🛰️ Mission Control | تقرير مركز القيادة\n";
    
    for (const report of reports) {
      output += `\n### 👷 [WORKER] ${report.workerId}\n`;
      output += `**Protocol Status**: ${report.proceduresFollowed ? "✅ Followed" : "⚠️ Deviated"}\n`;
      
      output += `\n**What was implemented:**\n- ${report.implemented.join("\n- ") || "None"}\n`;
      
      output += `\n**What was left undone:**\n- ${report.undone.join("\n- ") || "None"}\n`;
      
      output += `\n**Commands Run + Exit Codes:**\n`;
      for (const cmd of report.commands) {
        output += `- \`${cmd.command}\` [Exit Code: ${cmd.exitCode}]\n`;
      }
      
      output += `\n**Issues Discovered:**\n- ${report.issues.join("\n- ") || "No issues discovered."}\n`;
      output += `\n---\n`;
    }
    
    return output;
  }
}
