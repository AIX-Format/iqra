/**
 * 🏦 IQRA SkillBank — بنك المهارات
 * 
 * "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" — العلق: 5
 * 
 * Central registry for all IQRA skills.
 * Wraps SkillLoader to provide a consistent interface for workers and tests.
 */

import { SkillLoader } from './loader';

export class SkillBank {
  /**
   * Get the markdown content of a specific skill
   */
  public static getSkillContent(skillName: string): string | null {
    return SkillLoader.getSkillContent(skillName);
  }

  /**
   * List all available skills registered in the marketplace manifest
   */
  public static listSkills(): string[] {
    return SkillLoader.listSkills();
  }
}
