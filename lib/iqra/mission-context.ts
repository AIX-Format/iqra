/**
 * 🌙 IQRA Mission Context — سياق المهمة
 * النية: تعريف العقود المشتركة بين جميع العمال
 * المرجع: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ" — الشورى: 38
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// ── MissionScope — ما يُقرأ من mission-scope.yml ──────────────────────────────

export interface MissionScope {
  mission_id: string;
  version?: string;
  objective: string;
  verse: string;                          // e.g. "2:255"
  field_of_inquiry: string;
  provider?: 'google' | 'groq' | 'simulated';
  model?: string;
  allowed_tools?: string[];
  validation_rules?: string[];
  success_criteria?: string[];
  status: 'planned' | 'running' | 'completed' | 'failed';
  workers?: Array<{ id: string; role: string; skills: string[] }>;
}

// ── MissionContext — يُمرَّر بين العمال ──────────────────────────────────────

export interface MissionContext {
  missionId: string;
  scope: MissionScope;
  workingDir: string;                     // temp dir for artifacts
  previousOutput: Record<string, any> | null;
  startTime: number;
}

// ── HandoffResult — ما يُعيده كل عامل ────────────────────────────────────────

export interface HandoffResult {
  status: 'success' | 'failure';
  worker: string;
  next: string | null;
  data: Record<string, any>;
  artifacts: string[];                    // file paths created
  implemented: string[];
  undone: string[];
  issues: string[];
  procedures_followed: boolean;
  timestamp: number;
}

// ── Parser ────────────────────────────────────────────────────────────────────

export function parseMissionScope(scopePath: string): MissionScope {
  if (!fs.existsSync(scopePath)) {
    throw new Error(`INTEGRITY_ERR: mission-scope.yml not found at ${scopePath}`);
  }

  const raw = fs.readFileSync(scopePath, 'utf-8');
  const parsed = yaml.load(raw) as MissionScope;

  // Validate required fields
  if (!parsed.mission_id) throw new Error('INTEGRITY_ERR: mission_id is required');
  if (!parsed.objective)  throw new Error('INTEGRITY_ERR: objective is required');
  if (!parsed.verse)      throw new Error('INTEGRITY_ERR: verse is required');

  return {
    ...parsed,
    status: parsed.status || 'planned',
    provider: parsed.provider || 'google',
  };
}

export function updateMissionStatus(
  scopePath: string,
  scope: MissionScope,
  status: MissionScope['status']
): void {
  const updated = { ...scope, status };
  fs.writeFileSync(scopePath, yaml.dump(updated), 'utf-8');
}
