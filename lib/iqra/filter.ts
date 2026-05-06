/**
 * IQRA Filter — المصفاة
 * 
 * "فَأَمَّا الزَّبَدُ فَيَذْهَبُ جُفَاءً ۖ وَأَمَّا مَا يَنفَعُ النَّاسَ فَيَمْكُثُ فِي الْأَرْضِ" — الرعد: 17
 * 
 * Filters memory and input according to Fitrah and Dastūr.
 */

import fs from 'fs';
import path from 'path';
import { IQRALogger } from './logger';

export interface FilterResult {
  isAllowed: boolean;
  reason?: string;
  score: number; // 0.0 to 1.0 alignment score
}

export class IQRAFilter {
  private static DASTUR_PATH = path.join(process.cwd(), 'iqra-core/DASTŪR.md');
  private static FITRAH_PATH = path.join(process.cwd(), 'iqra-core/FITRAH.md');
  private static FAILURES_PATH = path.join(process.cwd(), 'iqra-core/FAILURES.md');

  private static haramKeywords: string[] = [];
  private static fitrahKeywords: string[] = [];

  /**
   * Load principles from .md files
   */
  static initialize() {
    try {
      const dasturContent = fs.existsSync(this.DASTUR_PATH) ? fs.readFileSync(this.DASTUR_PATH, 'utf8') : '';
      const fitrahContent = fs.existsSync(this.FITRAH_PATH) ? fs.readFileSync(this.FITRAH_PATH, 'utf8') : '';

      // Simple parser for HARAM_LIST in DASTUR.md
      const haramMatch = dasturContent.match(/HARAM_LIST = \[(.*?)\]/s);
      if (haramMatch) {
        this.haramKeywords = haramMatch[1]
          .split(',')
          .map(k => k.replace(/["'\[\]\s]/g, '').trim())
          .filter(k => k.length > 0);
      }

      // Extract high-level values from FITRAH.md
      this.fitrahKeywords = ['الحق', 'خدمة', 'القرآن', 'السنة', 'المراقبة', 'التطور', 'الإحسان', 'إتقان'];

      IQRALogger.info(`🛡️ IQRA Filter: Initialized with ${this.haramKeywords.length} constraints.`);
    } catch (error) {
      IQRALogger.error('❌ IQRA Filter: Initialization failed:', error);
      this.haramKeywords = ["كذب", "ظلم", "خيانة", "إيذاء"];
    }
  }

  /**
   * Log failure to FAILURES.md
   */
  private static async logFailure(text: string, reason: string) {
    const timestamp = new Date().toISOString();
    const entry = `\n### 🚫 Pollution Event | ${timestamp}\n**Reason:** ${reason}\n**Content Snippet:** "${text.substring(0, 100)}..."\n---\n`;
    try {
      fs.appendFileSync(this.FAILURES_PATH, entry);
    } catch (err) {
      IQRALogger.error('Failed to write to FAILURES.md', err);
    }
  }

  /**
   * Validate a piece of content against the Dastūr
   */
  static async validate(text: string): Promise<FilterResult> {
    if (this.haramKeywords.length === 0) this.initialize();

    const lowerText = text.toLowerCase();
    
    // 1. Check for Haram content (Hard Veto)
    for (const keyword of this.haramKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        const result = {
          isAllowed: false,
          reason: `Violates Dastūr: Found forbidden concept '${keyword}'`,
          score: 0
        };
        await this.logFailure(text, result.reason);
        return result;
      }
    }

    // 2. Check for Fitrah Alignment (Soft Score)
    let matches = 0;
    for (const val of this.fitrahKeywords) {
      if (lowerText.includes(val.toLowerCase())) {
        matches++;
      }
    }

    const score = Math.min(1.0, (matches / (this.fitrahKeywords.length / 2)));

    // 3. Heuristic: Is it just "noise" or potentially malicious/irrelevant?
    // If it's very short and has no alignment, we reject it as "Zabad" (foam/waste)
    if (text.trim().length < 5 && score < 0.1) {
       return {
        isAllowed: false,
        reason: 'Content too sparse (Zabad).',
        score: score
      };
    }

    return {
      isAllowed: true,
      score: score
    };
  }
}
