/**
 * IQRA Handoff Validator — مدقق التسليم
 * 
 * Validates and repairs handoff payloads with retry logic.
 */

import type { MissionHandoff } from '../../../agents/contracts';
import { IQRALogger } from '../logger';
import { randomUUID } from 'crypto';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  repaired?: MissionHandoff;
}

export class HandoffValidator {
  private static readonly CURRENT_SCHEMA_VERSION = '1.0.0';
  private static readonly MAX_RETRIES = 3;

  /**
   * Validates a handoff payload and attempts repairs
   */
  static async validateAndRepair(handoff: MissionHandoff): Promise<ValidationResult> {
    const errors: string[] = [];
    let repaired = { ...handoff };

    // 1. Schema version validation
    if (!repaired.schemaVersion) {
      repaired.schemaVersion = this.CURRENT_SCHEMA_VERSION;
      errors.push('Added missing schemaVersion');
    }

    // 2. Trace ID validation
    if (!repaired.trace_id) {
      repaired.trace_id = this.generateTraceId();
      errors.push('Generated missing trace_id');
    }

    // 3. Required fields validation
    const requiredFields = ['mission_id', 'from_worker', 'to_worker', 'timestamp'];
    for (const field of requiredFields) {
      if (!repaired[field as keyof MissionHandoff]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // 4. Timestamp validation
    if (repaired.timestamp && (repaired.timestamp < 0 || repaired.timestamp > Date.now() + 86400000)) {
      errors.push('Invalid timestamp');
    }

    // 5. Array fields validation
    const arrayFields = ['artifacts', 'pending_tasks', 'known_issues', 'validation_rules'];
    for (const field of arrayFields) {
      if (!Array.isArray(repaired[field as keyof MissionHandoff])) {
        (repaired as any)[field] = [];
        errors.push(`Fixed non-array field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      repaired: errors.length > 0 ? repaired : undefined
    };
  }

  /**
   * Validates handoff with retry logic
   */
  static async validateWithRetry(handoff: MissionHandoff): Promise<{ success: boolean; handoff: MissionHandoff; attempts: number }> {
    let currentHandoff = { ...handoff };
    let attempts = 0;

    for (attempts = 1; attempts <= this.MAX_RETRIES; attempts++) {
      const result = await this.validateAndRepair(currentHandoff);
      
      if (result.valid) {
        IQRALogger.info(`✅ [HANDOFF] Validation passed on attempt ${attempts}`);
        return { success: true, handoff: currentHandoff, attempts };
      }

      if (result.repaired) {
        currentHandoff = result.repaired;
        IQRALogger.warn(`⚠️ [HANDOFF] Validation failed, attempt ${attempts}, repaired: ${result.errors.join(', ')}`);
      } else {
        IQRALogger.error(`❌ [HANDOFF] Validation failed, attempt ${attempts}, errors: ${result.errors.join(', ')}`);
        break;
      }
    }

    // Fail closed after max retries
    IQRALogger.error(`🚫 [HANDOFF] Validation failed after ${this.MAX_RETRIES} attempts`);
    return { success: false, handoff: currentHandoff, attempts };
  }

  /**
   * Generates a unique trace ID
   */
  private static generateTraceId(): string {
    return randomUUID();
  }

  /**
   * Validates handoff compatibility between versions
   */
  static validateVersionCompatibility(fromVersion: string, toVersion: string): boolean {
    const fromParts = fromVersion.split('.').map(Number);
    const toParts = toVersion.split('.').map(Number);

    // Major version must match
    if (fromParts[0] !== toParts[0]) {
      return false;
    }

    // Minor version can be higher in receiver
    if (toParts[1] < fromParts[1]) {
      return false;
    }

    return true;
  }

  /**
   * Logs forensic data for failed handoffs
   */
  static logForensicData(handoff: MissionHandoff, errors: string[]): void {
    const forensicData = {
      timestamp: Date.now(),
      handoff,
      errors,
      stackTrace: new Error().stack
    };

    IQRALogger.error('🔍 [HANDOFF] Forensic data:', JSON.stringify(forensicData, null, 2));
  }
}
