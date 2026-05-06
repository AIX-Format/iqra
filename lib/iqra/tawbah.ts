import fs from 'fs';
import path from 'path';
import { IQRALogger } from './logger';
import { iqraThink, IQRABrainMode } from './brain';

export class TAWBAH {
  private static FAILURES_PATH = path.join(process.cwd(), 'iqra-core/FAILURES.md');
  private static RULES_PATH = path.join(process.cwd(), 'iqra-core/RULES.md');

  /**
   * Perform Tawbah (Repentance/Correction)
   * Follows the 5-step protocol: Admission, Regret, Ceasing, Intention, Repair.
   */
  static async perform(errorContext?: string) {
    IQRALogger.info('🕋 [TAWBAH] Starting 5-step self-correction cycle...');
    
    if (!fs.existsSync(this.FAILURES_PATH)) return;

    const failures = fs.readFileSync(this.FAILURES_PATH, 'utf8');
    const recentFailures = failures.split('---').slice(-3).join('---');

    const protocolPrompt = `
      As the Judge (Antigravity), oversee the TAWBAH protocol for the following failure:
      ${errorContext || recentFailures}
      
      You MUST follow these 5 steps:
      1. Admission (I'tiraf): Acknowledge the specific deviation from Fitrah.
      2. Regret (Nadam): Express systemic remorse for the potential harm or falsehood.
      3. Ceasing (Iqla'): Confirm that this specific failing pattern has stopped.
      4. Intention (Azm): Formulate a commitment to avoid this specific error.
      5. Repair (Islah): Propose a concrete RULE to prevent this.
      
      Format your response with these headers. At the end, include:
      RULE: [description]
    `;

    try {
      const reflection = await iqraThink({ 
        input: protocolPrompt, 
        mode: IQRABrainMode.DEEP_THINKING 
      });

      IQRALogger.info('🕋 [TAWBAH] Protocol reflection complete.');
      
      const ruleMatch = reflection.match(/RULE: (.*)/);
      if (ruleMatch) {
        const newRule = ruleMatch[1].trim();
        this.applyRule(newRule);
        IQRALogger.info(`🕋 [TAWBAH] Islah complete. New rule applied: ${newRule}`);
      }
      
      // Log the full protocol execution
      this.logTawbah(reflection);

    } catch (err) {
      IQRALogger.error('🕋 [TAWBAH] Protocol failed:', err);
    }
  }

  private static logTawbah(reflection: string) {
    const timestamp = new Date().toISOString();
    const entry = `\n\n## 🕋 TAWBAH RECORD | ${timestamp}\n${reflection}\n---\n`;
    fs.appendFileSync(path.join(process.cwd(), 'iqra-core/TAWBAH_LOG.md'), entry);
  }

  private static applyRule(rule: string) {
    const timestamp = new Date().toISOString();
    const entry = `\n- [${timestamp}] ${rule}\n`;
    fs.appendFileSync(this.RULES_PATH, entry);
  }
}
