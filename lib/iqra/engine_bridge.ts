import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { IQRALogger } from './logger.ts';

export class GoEngineBridge {
  private static ENGINE_PATH = path.join(process.cwd(), 'lib/iqra/quran/go-engine/main.go');

  static async calculateResonance(input: string) {
    try {
      // Execute Go tool directly
      const cmd = `go run "${this.ENGINE_PATH}" -mode resonance -input "${input.replace(/"/g, '\\"')}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const result = JSON.parse(output);
      return result.data;
    } catch (e) {
      IQRALogger.error('❌ [GO-BRIDGE] Execution failed:', e);
      return null;
    }
  }

  static async triggerEvolutionCycle() {
    try {
      const cmd = `go run "${this.ENGINE_PATH}" -mode evolve -input "trigger"`;
      execSync(cmd);
    } catch (e) {}
  }
}
