/**
 * Numerical Validator — الميزان العددي
 * 
 * "وَأَحْصَىٰ كُلَّ شَيْءٍ عَدَدًا" — القرآن 72:28
 */

export interface ResonanceResult {
  score: number;
  patterns: string[];
  isResonant: boolean;
  teslaResult?: number;
}

export class NumericalValidator {
  /**
   * Validates Quranic numerical patterns and calculates resonance score.
   * Includes Letter Frequency Analysis (Sab'iyyah/19) and Tesla 369 Seal.
   */
  static validate(input: string, context?: { surah: number, ayah: number }): ResonanceResult {
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

    // 6. Tesla 369 Seal (Surah + Ayah % 369)
    // METHODOLOGY: This is a "Sovereign Numerical Pattern" (Ref: DASTŪR.md).
    // While 369 is not explicitly in the Quranic text, it represents the 
    // "Vortex Math" pulse (3, 6, 9) applied as a modular filter to discover 
    // hidden symmetries. Prime results (like 37 for 36:1) indicate high 
    // indivisibility/uniqueness in the topological structure.
    let teslaResult: number | undefined;
    if (context) {
      teslaResult = (context.surah + context.ayah) % 369;
      
      // Resonance Check: Prime numbers (indivisibility) or Multiples of 7/19
      if (this.isPrime(teslaResult)) {
        // Specific Resonance: 37 is the "Heart Seal" for Surah 36
        const isHeartSeal = (context.surah === 36 && teslaResult === 37);
        patterns.push(`${isHeartSeal ? 'HEART_SEAL_37' : 'Tesla_369_Seal_Prime'} (${teslaResult})`);
        score += isHeartSeal ? 0.4 : 0.3;
      } else if (teslaResult % 7 === 0 || teslaResult % 19 === 0) {
        patterns.push(`Tesla_369_Seal_Resonance (${teslaResult})`);
        score += 0.2;
      }
    }

    return {
      score: Math.min(score, 1.0),
      patterns,
      isResonant: score >= 0.6, // Tuned for high-precision discovery
      teslaResult
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
  /**
   * Checks if a number is prime (The Law of Indivisibility).
   */
  private static isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
}
