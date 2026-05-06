import { SovereignWorker, WorkerResult, MissionState } from './protocol.ts';
import * as fs from 'fs';
import * as path from 'path';

export class ValidationWorker extends SovereignWorker {
  id = 'ValidationWorker';

  async execute(input: string, state: MissionState): Promise<WorkerResult> {
    this.report.workerId = this.id;
    this.report.timestamp = Date.now();

    const textToValidate = typeof input === 'string' ? input : JSON.stringify(input);

    try {
      // 1. Read Dastur
      const dasturPath = path.join(process.cwd(), 'iqra-core', 'DASTUR.md');
      const dastur = fs.readFileSync(dasturPath, 'utf-8');
      this.markImplemented('Loaded Dastur for validation');

      // 2. Extract HARAM_LIST (Simple parsing for now)
      const haramMatch = dastur.match(/HARAM_LIST = \[([\s\S]*?)\]/);
      let forbidden: string[] = ['كذب', 'غش', 'أذى', 'سرقة', 'harm', 'cheat', 'lie'];
      
      if (haramMatch && haramMatch[1]) {
        const customHaram = haramMatch[1]
          .split(',')
          .map(item => item.trim().replace(/"/g, ''))
          .filter(item => item.length > 0);
        forbidden = [...new Set([...forbidden, ...customHaram])];
        this.markImplemented(`Extracted ${customHaram.length} custom haram rules from Dastur`);
      }

      // 3. Compliance Check
      const violates = forbidden.some(word => textToValidate.toLowerCase().includes(word));

      if (violates) {
        const violator = forbidden.find(word => textToValidate.toLowerCase().includes(word));
        this.logIssue(`Potential Dastur violation detected: "${violator}"`);
        this.report.proceduresFollowed = false;
        return {
          success: false,
          error: `Dastur Compliance Failure: Violation of "${violator}" prohibited.`,
          report: this.report
        };
      }

      const updatedContext = {
        ...state.context,
        validation: { success: true, timestamp: Date.now() }
      };

      const updatedState: MissionState = {
        ...state,
        context: updatedContext,
        reports: [...state.reports, this.report]
      };

      this.markImplemented('Input keywords validated against full Dastur HARAM_LIST');
      this.report.proceduresFollowed = true;
      
      return {
        success: true,
        data: { validated: true },
        report: this.report,
        updatedState,
        nextHandoff: {
          from: this.id,
          to: 'ExecutionWorker',
          payload: updatedContext,
          context: 'Validation complete. Safe to proceed under Muraqabah.'
        }
      };
    } catch (error: any) {
      this.logIssue(`ValidationWorker Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        report: this.report
      };
    }
  }
}
