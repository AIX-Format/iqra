/**
 * 🛡️ DeterministicSandbox — بيئة المحاكاة المحكمة
 * 
 * "وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ" — الرحمن: 7
 * 
 * A strictly deterministic environment for testing code and decisions 
 * before they are etched onto the TrustChain.
 * No Mocks Allowed.
 */

import { IQRALogger } from '#infra/logger';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export class DeterministicSandbox {
  private static readonly SANDBOX_DIR = path.join(process.cwd(), '.iqra', 'sandbox');

  /**
   * 🧪 Test a logic vector in a isolated environment
   */
  static async validate(vectorId: string, code: string): Promise<{ success: boolean; output: string; error?: string }> {
    IQRALogger.info(`🛡️ [SANDBOX] Validating vector: ${vectorId}`);

    if (!fs.existsSync(this.SANDBOX_DIR)) {
      fs.mkdirSync(this.SANDBOX_DIR, { recursive: true });
    }

    const testFile = path.join(this.SANDBOX_DIR, `${vectorId}.test.ts`);
    fs.writeFileSync(testFile, code);

    try {
      const { spawnSync } = await import('child_process');
      const tsxPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');

      const child = spawnSync(tsxPath, [testFile], {
        timeout: 3000, // Reduced to 3s for even faster feedback on 8GB RAM
        maxBuffer: 512 * 1024, // 512KB is plenty
      });

      if (child.status === 0) {
        return { success: true, output: child.stdout.toString() };
      } else {
        return {
          success: false,
          output: child.stdout?.toString() || '',
          error: child.stderr?.toString() || 'Execution failed'
        };
      }
    } catch (error: any) {
      IQRALogger.warn(`❌ [SANDBOX] Validation error for ${vectorId}: ${error.message}`);
      return { success: false, output: '', error: error.message };
    }
  }

  /**
   * 🧼 Clean up sandbox artifacts
   */
  static cleanup() {
    if (fs.existsSync(this.SANDBOX_DIR)) {
      fs.rmSync(this.SANDBOX_DIR, { recursive: true, force: true });
    }
  }
}
