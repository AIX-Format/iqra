/**
 * ⚖️ Gatekeeper — حارس السيادة
 * 
 * Final arbiter of actions. Validates tools against manifests and risk levels.
 */

import { RiskLevel } from '../lib/iqra/00-manifest/runtime_manifest';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  risk?: RiskLevel;
}

export class Gatekeeper {
  private manifest: any;

  constructor(manifestPath: string = '.iqra/manifest.yaml') {
    try {
      const fileContents = fs.readFileSync(manifestPath, 'utf8');
      this.manifest = yaml.load(fileContents);
    } catch (e) {
      console.error('Failed to load manifest', e);
    }
  }

  /**
   * Validates if a skill can use a specific tool
   */
  public validateAction(skillName: string, toolName: string): ValidationResult {
    const skill = this.manifest?.skills?.find((s: any) => s.name === skillName);
    
    if (!skill) {
      return { allowed: false, reason: `Skill '${skillName}' not found in manifest.` };
    }

    const toolAllowed = skill.tools.includes(toolName) || skill.tools.includes("*");
    
    if (!toolAllowed) {
      return { 
        allowed: false, 
        reason: `Tool '${toolName}' is forbidden for skill '${skillName}'.`,
        risk: skill.risk
      };
    }

    return { allowed: true, risk: skill.risk };
  }

  /**
   * Checks if an action is in the forbidden list
   */
  public isHaram(action: string): boolean {
    const haramList = ['hallucination', 'unvalidated_exec', 'unauthorized_deletion'];
    return haramList.includes(action.toLowerCase());
  }
}
