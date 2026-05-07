// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

import fs from 'fs';
import path from 'path';
import { IQRALogger } from './logger.ts';
import { appendToTrustChain } from './security.ts';

export interface SkillPerformance {
  success_count: number;
  failure_count: number;
  last_used: number;
  last_result: 'success' | 'failure';
}

/**
 * 🛠️ IQRA Skill Bank — بنك المهارات
 * "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" — العلق: 5
 * 
 * Manages the evolution and execution of IQRA's specialized skills.
 * Skills are stored as Markdown documents that can be updated by the Meta-Agent.
 */
export class SkillBank {
  private static readonly SKILLS_DIR = path.join(process.cwd(), 'iqra-core', 'skills');
  private static readonly LEDGER_PATH = path.join(this.SKILLS_DIR, 'SKILLS_LEDGER.json');

  /**
   * Load the skill ledger
   */
  private static getLedger(): Record<string, SkillPerformance> {
    try {
      if (!fs.existsSync(this.LEDGER_PATH)) return {};
      return JSON.parse(fs.readFileSync(this.LEDGER_PATH, 'utf-8'));
    } catch {
      return {};
    }
  }

  /**
   * Save the skill ledger
   */
  private static saveLedger(ledger: Record<string, SkillPerformance>): void {
    try {
      if (!fs.existsSync(this.SKILLS_DIR)) fs.mkdirSync(this.SKILLS_DIR, { recursive: true });
      fs.writeFileSync(this.LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf-8');
    } catch (err) {
      IQRALogger.error('❌ [SKILL_BANK] Failed to save ledger:', err);
    }
  }

  /**
   * Register or update performance of a skill
   */
  static async recordPerformance(skillName: string, success: boolean): Promise<void> {
    const ledger = this.getLedger();
    const current = ledger[skillName] || {
      success_count: 0,
      failure_count: 0,
      last_used: 0,
      last_result: 'success'
    };

    if (success) {
      current.success_count++;
      current.last_result = 'success';
    } else {
      current.failure_count++;
      current.last_result = 'failure';
    }

    current.last_used = Date.now();
    ledger[skillName] = current;
    this.saveLedger(ledger);

    IQRALogger.info(`🛠️ [SKILL_BANK] Performance recorded for "${skillName}": ${success ? '✅' : '❌'}`);

    // If failure rate is high, trigger evolution/tawbah for this skill
    if (!success && current.failure_count > 3) {
      await this.evolveSkill(skillName);
    }
  }

  /**
   * Trigger the evolution of a skill (Self-Healing)
   */
  private static async evolveSkill(skillName: string): Promise<void> {
    IQRALogger.warn(`🌀 [SKILL_BANK] Skill "${skillName}" has failed multiple times. Triggering evolution...`);
    
    const skillPath = path.join(this.SKILLS_DIR, `${skillName}.md`);
    if (!fs.existsSync(skillPath)) return;

    const content = fs.readFileSync(skillPath, 'utf-8');
    const timestamp = new Date().toISOString();
    
    // In a real scenario, this would involve an LLM call to rewrite the skill logic.
    // For now, we append an evolution request.
    const evolutionRequest = `\n\n### 🌀 Evolution Request | ${timestamp}
- **Status**: UNDER_REVISION
- **Reason**: Multiple failures detected in pulse cycles.
- **Goal**: Re-align with DASTŪR.md and optimize for current environment.
`;

    fs.appendFileSync(skillPath, evolutionRequest, 'utf-8');
    appendToTrustChain('SKILL:EVOLVE', skillName, 'Evolution requested due to failures', 0.5);
  }

  /**
   * Get the content of a skill for the Planner
   */
  static getSkillContent(skillName: string): string | null {
    const skillPath = path.join(this.SKILLS_DIR, `${skillName}.md`);
    if (!fs.existsSync(skillPath)) return null;
    return fs.readFileSync(skillPath, 'utf-8');
  }

  /**
   * List all available skills
   */
  static listSkills(): string[] {
    if (!fs.existsSync(this.SKILLS_DIR)) return [];
    return fs.readdirSync(this.SKILLS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  }
}
