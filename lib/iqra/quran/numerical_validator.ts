/**
 * Numerical Validator — الميزان العددي
 * 
 * "وَأَحْصَىٰ كُلَّ شَيْءٍ عَدَدًا" — القرآن 72:28
 */

export interface ResonanceResult {
  score: number;
  patterns: string[];
  isResonant: boolean;
}

export class NumericalValidator {
  /**
   * Validates Quranic numerical patterns and calculates resonance score.
   */
  static validate(input: string): ResonanceResult {
    const patterns: string[] = [];
    let score = 0;

    // 1. Core Counts
    const cleanInput = input.replace(/\s+/g, ' ').trim();
    const charCount = cleanInput.replace(/\s/g, '').length;
    const wordCount = cleanInput.split(' ').length;

    // 2. The Law of Seven (Sab'iyyah)
    if (charCount > 0) {
      if (charCount % 7 === 0) {
        patterns.push(`Sab'iyyah_Char_Multiple_7 (${charCount})`);
        score += 0.3;
      }
      
      const charDigitalRoot = this.calculateDigitalRoot(charCount);
      if (charDigitalRoot === 7) {
        patterns.push(`Sab'iyyah_Char_DigitalRoot_7`);
        score += 0.25;
      }

      if (charCount % 19 === 0) {
        patterns.push(`Symmetry_19_Chars (${charCount})`);
        score += 0.2;
      }
    }

    if (wordCount > 0) {
      if (wordCount % 7 === 0) {
        patterns.push(`Sab'iyyah_Word_Multiple_7 (${wordCount})`);
        score += 0.2;
      }
      
      const wordDigitalRoot = this.calculateDigitalRoot(wordCount);
      if (wordDigitalRoot === 7) {
        patterns.push(`Sab'iyyah_Word_DigitalRoot_7`);
        score += 0.15;
      }
    }

    // 3. Sacred Terms presence
    const sacredTerms = ['الله', 'قرآن', 'حق', 'نور', 'أرض', 'سماوات', 'سبع'];
    sacredTerms.forEach(term => {
      if (cleanInput.includes(term)) {
        patterns.push(`Sacred_Term_${term}`);
        score += 0.1;
      }
    });

    // 4. Synergetic Check (Combination of 7s)
    const sevenCount = patterns.filter(p => p.includes('7') || p.includes('Sab\'iyyah')).length;
    if (sevenCount >= 3) {
      patterns.push(`High_Sab'iyyah_Resonance (${sevenCount} signals)`);
      score += 0.2;
    }

    return {
      score: Math.min(score, 1.0),
      patterns,
      isResonant: score >= 0.7 // Higher threshold for "Sovereign" resonance
    };
  }

  /**
   * Calculates the digital root (sum of digits until a single digit remains).
   */
  private static calculateDigitalRoot(n: number): number {
    if (n === 0) return 0;
    return 1 + ((n - 1) % 9);
  }

  /**
   * Validates a raw number against the system of seven.
   */
  static validateNumber(n: number): ResonanceResult {
    const patterns: string[] = [];
    let score = 0;

    if (n % 7 === 0) {
      patterns.push(`Multiple_of_7`);
      score += 0.5;
    }

    if (this.calculateDigitalRoot(n) === 7) {
      patterns.push(`Digital_Root_7`);
      score += 0.4;
    }

    return {
      score: Math.min(score, 1.0),
      patterns,
      isResonant: score >= 0.5
    };
  }
}
