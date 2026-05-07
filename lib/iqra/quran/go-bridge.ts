/**
 * 🌀 Go Engine Bridge — جسر محرك Go
 * "عَلَّمَ بِالْقَلَمِ" — Quran 96:4
 */

import { execSync } from 'child_process';
import path from 'path';
import { IQRALogger } from '../logger';

export class GoEngineBridge {
  private static ENGINE_PATH = path.join(process.cwd(), 'lib/iqra/quran/go-engine/main.go');

  /**
   * Calculate structural resonance (Entropy, LID, Fractal Depth)
   */
  static async calculateResonance(input: string) {
    try {
      const escapedInput = input.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const cmd = `go run "${this.ENGINE_PATH}" -mode resonance -input "${escapedInput}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const result = JSON.parse(output);
      return result.data;
    } catch (e) {
      IQRALogger.error('❌ [GO-BRIDGE] Resonance calculation failed:', e);
      return null;
    }
  }

  /**
   * Catch structural patterns based on core harness mappings
   */
  static async calculateCatch(input: string) {
    try {
      const escapedInput = input.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const cmd = `go run "${this.ENGINE_PATH}" -mode catch -input "${escapedInput}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const result = JSON.parse(output);
      return result.data; // Array of "CATCH:CONCEPT:PATTERN:MATCHES:X"
    } catch (e) {
      IQRALogger.error('❌ [GO-BRIDGE] Pattern catch failed:', e);
      return [];
    }
  }

  /**
   * Trigger the self-evolution cycle
   */
  static async triggerEvolutionCycle() {
    try {
      const cmd = `go run "${this.ENGINE_PATH}" -mode evolve -input "trigger"`;
      execSync(cmd);
      IQRALogger.info('🌀 [GO-BRIDGE] Evolution cycle triggered');
    } catch (e) {
      IQRALogger.error('❌ [GO-BRIDGE] Evolution trigger failed:', e);
    }
  }
}
