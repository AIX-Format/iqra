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
   * Includes Letter Frequency Analysis (Sab'iyyah/19).
   */
  static validate(input: string): ResonanceResult {
    const patterns: string[] = [];
    let score = 0;

    // 1. Core Counts (Tiny/Micro Base)
    const cleanInput = input.replace(/\s+/g, ' ').trim();
    const charCount = cleanInput.replace(/\s/g, '').length;
    const wordCount = cleanInput.split(' ').length;

    // 2. The Law of Seven (Sab'iyyah) & Symmetry 19
    if (charCount > 0) {
      if (charCount % 7 === 0) {
        patterns.push(`Sab'iyyah_Char_Multiple_7 (${charCount})`);
        score += 0.2;
      }
      if (charCount % 19 === 0) {
        patterns.push(`Symmetry_19_Chars (${charCount})`);
        score += 0.2;
      }
    }

    if (wordCount > 0) {
      if (wordCount % 7 === 0) {
        patterns.push(`Sab'iyyah_Word_Multiple_7 (${wordCount})`);
        score += 0.15;
      }
    }

    // 3. Deep Letter Analysis (Algo-Quantum)
    // Checking for specific disjointed letters if present
    const targetLetters = ['ي', 'س', 'ا', 'ل', 'م', 'ر', 'ق', 'ن'];
    targetLetters.forEach(char => {
      const count = (input.match(new RegExp(char, 'g')) || []).length;
      if (count > 0) {
        if (count % 7 === 0) {
          patterns.push(`Letter_Resonance_7_${char} (Count: ${count})`);
          score += 0.25;
        }
        if (count % 19 === 0) {
          patterns.push(`Letter_Resonance_19_${char} (Count: ${count})`);
          score += 0.25;
        }
      }
    });

    // 4. Positional Geometry (Digital Root Resonance)
    const charDR = this.calculateDigitalRoot(charCount);
    const wordDR = this.calculateDigitalRoot(wordCount);
    if (charDR === 7 || wordDR === 7) {
      patterns.push(`Geometric_DigitalRoot_7 (CharDR: ${charDR}, WordDR: ${wordDR})`);
      score += 0.1;
    }

    // 5. Sacred Terms Presence
    const sacredTerms = ['الله', 'قرآن', 'حق', 'نور', 'حق', 'صراط', 'مستقيم'];
    sacredTerms.forEach(term => {
      if (cleanInput.includes(term)) {
        patterns.push(`Sacred_Term_${term}`);
        score += 0.05;
      }
    });

    return {
      score: Math.min(score, 1.0),
      patterns,
      isResonant: score >= 0.6 // Tuned for high-precision discovery
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
