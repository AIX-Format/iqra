/**
 * 🌙 IQRA Agent Contracts — عقود الوكلاء
 * 
 * Defines strict interfaces for worker handoffs and reporting to ensure zero context loss.
 */

export interface CommandLog {
  command: string;
  exit_code: number;
  output?: string;
}

export interface WorkerReport {
  mission_id: string;
  worker_id: string;
  implemented: string[];
  undone: string[];
  commands_run: CommandLog[];
  issues_discovered: string[];
  skills_used: string[];
  procedures_followed: boolean;
  status: 'PASS' | 'FAIL';
  exit_code: number;
  serendipity?: { found: boolean; note: string };
  model_metadata?: {
    provider: string;
    model: string;
    temperature?: number;
    latency_ms?: number;
  };
  timestamp: number;
}

export interface MissionHandoff {
  schemaVersion: string;
  trace_id: string;
  mission_id: string;
  from_worker: string;
  to_worker: string;
  timestamp: number;
  summary?: string;
  artifacts: string[];
  pending_tasks: string[];
  known_issues: string[];
  validation_rules: string[];
  context_data: Record<string, any>;
  output_contract?: {
    next_required_fields: string[];
    quality_threshold: Record<string, any>;
  };
  error?: string | null;
}

/**
 * Structural Rules:
 * 1. Validator cannot modify implementation logic.
 * 2. Reporter cannot write or modify source code.
 * 3. Builder cannot self-approve or bypass validation.
 */
export const WORKER_CONSTRAINTS = {
  VALIDATOR_CAN_MODIFY: false,
  REPORTER_CAN_WRITE_CODE: false,
  BUILDER_CAN_SELF_APPROVE: false,
};
