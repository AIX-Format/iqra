/**
 * 🔢 Numerical Validation — التحقق العددي للأرقام المقدسة
 * 
 * WHY: Implements validation for sacred numerical patterns (7, 19, Tesla 369)
 * in Quranic patterns. This is essential for identifying divine mathematical
 * structures and sacred geometry in the text.
 */

export interface NumericalPattern {
  type: 'septenary' | 'tesla' | 'quranic' | 'fibonacci' | 'prime';
  base: number;
  sequence: number[];
  frequency: number;
  resonance: number;
  positions: number[];
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  patterns: NumericalPattern[];
  sacredGeometry: {
    detected: boolean;
    type: string;
    symmetry: number;
    goldenRatio?: number;
  };
  quranicSignificance: {
    verseReferences: string[];
    mathematicalProperties: string[];
    spiritualMeaning: string;
  };
  computationTime: number;
}

export interface SacredNumber {
  value: number;
  name: string;
  significance: string;
  quranicReferences: string[];
  mathematicalProperties: string[];
  spiritualAttributes: string[];
}

export class NumericalValidation {
  private readonly sacredNumbers: Map<number, SacredNumber> = new Map([
    [7, {
      value: 7,
      name: 'Septenary',
      significance: 'Divine perfection, creation cycles, spiritual completeness',
      quranicReferences: [
        '7 heavens (2:29)', '7 earths (65:12)', '7 rounds around Kaaba',
        '7 verses in Al-Fatihah', '7 gates of Hell', '7 layers of Earth'
      ],
      mathematicalProperties: [
        'Prime number', 'Mersenne prime exponent', 'Happy number',
        'Fibonacci number', 'Perfect number generator'
      ],
      spiritualAttributes: [
        'Spiritual perfection', 'Divine wisdom', 'Cosmic order',
        'Sacred cycles', 'Mystical completion'
      ]
    }],
    [19, {
      value: 19,
      name: 'Quranic Code',
      significance: 'Mathematical miracle of Quran, divine authentication',
      quranicReferences: [
        '19 angels (74:30)', '19-based structure throughout Quran',
        'Basmala has 19 letters', 'Quran initialed with 19 letters'
      ],
      mathematicalProperties: [
        'Prime number', 'Hexagonal number', 'Centered hexagonal',
        '19 × 19 = 361 (19²)', 'Sum of first 19 primes = 639'
      ],
      spiritualAttributes: [
        'Divine authentication', 'Mathematical precision',
        'Cosmic code', 'Sacred geometry'
      ]
    }],
    [3, {
      value: 3,
      name: 'Trinity',
      significance: 'Divine unity in multiplicity, holy trinity',
      quranicReferences: [
        '3 times divorce (2:229)', '3 sacred months', '3 groups of people',
        '3 types of soul'
      ],
      mathematicalProperties: [
        'Prime number', 'Triangular number', 'Fibonacci number',
        'First odd prime after 2'
      ],
      spiritualAttributes: [
        'Divine unity', 'Spiritual harmony', 'Cosmic balance'
      ]
    }],
    [6, {
      value: 6,
      name: 'Hexagonal',
      significance: 'Creation days, hexagonal symmetry in nature',
      quranicReferences: [
        '6 days of creation (7:54)', '6 directions', '6 articles of faith'
      ],
      mathematicalProperties: [
        'Perfect number', 'Triangular number', 'Hexagonal number',
        'Highly composite number'
      ],
      spiritualAttributes: [
        'Creation', 'Balance', 'Harmony', 'Perfection'
      ]
    }],
    [9, {
      value: 9,
      name: 'Ennead',
      significance: 'Spiritual completion, divine wisdom',
      quranicReferences: [
        '9 signs of Moses (17:101)', '9 miracles',
        '9 attributes of God'
      ],
      mathematicalProperties: [
        'Perfect square', 'Sum of first 3 cubes', 'Digital root',
        '9 × 9 = 81 (9²)'
      ],
      spiritualAttributes: [
        'Completion', 'Wisdom', 'Spiritual attainment'
      ]
    }]
  ]);

  private readonly teslaSequence = [3, 6, 9];
  private readonly fibonacciSequence = this.generateFibonacci(50);

  /**
   * Validate numerical patterns in data
   */
  validateNumericalPatterns(data: number[], options: {
    includeTesla?: boolean;
    includeQuranic?: boolean;
    includeFibonacci?: boolean;
    threshold?: number;
  } = {}): ValidationResult {
    const startTime = Date.now();
    const {
      includeTesla = true,
      includeQuranic = true,
      includeFibonacci = true,
      threshold = 0.7
    } = options;

    const patterns: NumericalPattern[] = [];
    
    // Check for sacred number patterns
    if (includeQuranic) {
      patterns.push(...this.detectSacredNumberPatterns(data));
    }
    
    // Check for Tesla 369 patterns
    if (includeTesla) {
      patterns.push(...this.detectTeslaPatterns(data));
    }
    
    // Check for Fibonacci patterns
    if (includeFibonacci) {
      patterns.push(...this.detectFibonacciPatterns(data));
    }
    
    // Analyze sacred geometry
    const sacredGeometry = this.analyzeSacredGeometry(data);
    
    // Determine Quranic significance
    const quranicSignificance = this.determineQuranicSignificance(patterns);
    
    // Calculate overall validity and confidence
    const { isValid, confidence } = this.calculateValidationScore(patterns, threshold);
    
    const endTime = Date.now();
    
    return {
      isValid,
      confidence,
      patterns,
      sacredGeometry,
      quranicSignificance,
      computationTime: endTime - startTime
    };
  }

  /**
   * Detect sacred number patterns (7, 19, etc.)
   */
  private detectSacredNumberPatterns(data: number[]): NumericalPattern[] {
    const patterns: NumericalPattern[] = [];
    
    this.sacredNumbers.forEach((sacredInfo, value) => {
      const pattern = this.detectNumberPattern(data, value, sacredInfo);
      if (pattern) {
        patterns.push(pattern);
      }
    });
    
    return patterns;
  }

  /**
   * Detect specific number pattern
   */
  private detectNumberPattern(data: number[], value: number, sacredInfo: SacredNumber): NumericalPattern | null {
    const positions: number[] = [];
    const sequence: number[] = [];
    
    // Find occurrences and sequences
    for (let i = 0; i < data.length; i++) {
      if (this.isRelatedToNumber(data[i], value)) {
        positions.push(i);
        sequence.push(data[i]);
      }
    }
    
    if (positions.length === 0) return null;
    
    // Calculate frequency and resonance
    const frequency = positions.length / data.length;
    const resonance = this.calculateResonance(sequence, value);
    
    // Determine pattern type
    let type: NumericalPattern['type'] = 'quranic';
    if (value === 7) type = 'septenary';
    if (this.isPrime(value)) type = 'prime';
    
    return {
      type,
      base: value,
      sequence,
      frequency,
      resonance,
      positions,
      metadata: {
        sacredInfo,
        digitalRoot: this.calculateDigitalRoot(value),
        factors: this.getFactors(value)
      }
    };
  }

  /**
   * Detect Tesla 369 patterns
   */
  private detectTeslaPatterns(data: number[]): NumericalPattern[] {
    const patterns: NumericalPattern[] = [];
    
    // Check for 3-6-9 sequences
    const teslaPositions: number[] = [];
    const teslaSequence: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const digitalRoot = this.calculateDigitalRoot(Math.abs(data[i]));
      if (digitalRoot === 3 || digitalRoot === 6 || digitalRoot === 9) {
        teslaPositions.push(i);
        teslaSequence.push(data[i]);
      }
    }
    
    if (teslaPositions.length > 0) {
      const frequency = teslaPositions.length / data.length;
      const resonance = this.calculateTeslaResonance(teslaSequence);
      
      patterns.push({
        type: 'tesla',
        base: 369,
        sequence: teslaSequence,
        frequency,
        resonance,
        positions: teslaPositions,
        metadata: {
          pattern: '3-6-9',
          vortexEnergy: this.calculateVortexEnergy(teslaSequence),
          dimensionalHarmony: this.calculateDimensionalHarmony(teslaSequence)
        }
      });
    }
    
    return patterns;
  }

  /**
   * Detect Fibonacci patterns
   */
  private detectFibonacciPatterns(data: number[]): NumericalPattern[] {
    const patterns: NumericalPattern[] = [];
    
    // Find Fibonacci numbers in the data
    const fibPositions: number[] = [];
    const fibSequence: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (this.isFibonacciNumber(Math.abs(data[i]))) {
        fibPositions.push(i);
        fibSequence.push(data[i]);
      }
    }
    
    if (fibPositions.length > 0) {
      const frequency = fibPositions.length / data.length;
      const resonance = this.calculateFibonacciResonance(fibSequence);
      
      patterns.push({
        type: 'fibonacci',
        base: 1.618, // Golden ratio
        sequence: fibSequence,
        frequency,
        resonance,
        positions: fibPositions,
        metadata: {
          goldenRatio: this.calculateGoldenRatio(fibSequence),
          spiralGrowth: this.calculateSpiralGrowth(fibSequence)
        }
      });
    }
    
    return patterns;
  }

  /**
   * Analyze sacred geometry in the data
   */
  private analyzeSacredGeometry(data: number[]): ValidationResult['sacredGeometry'] {
    const result = {
      detected: false,
      type: '',
      symmetry: 0,
      goldenRatio: undefined as number | undefined
    };
    
    // Check for symmetry
    const symmetry = this.calculateSymmetry(data);
    result.symmetry = symmetry;
    
    // Check for golden ratio
    const goldenRatio = this.findGoldenRatio(data);
    if (goldenRatio) {
      result.goldenRatio = goldenRatio;
      result.detected = true;
      result.type = 'golden_ratio';
    }
    
    // Check for other sacred geometries
    if (this.hasHexagonalSymmetry(data)) {
      result.detected = true;
      result.type = 'hexagonal';
    }
    
    if (this.hasTriangularSymmetry(data)) {
      result.detected = true;
      result.type = 'triangular';
    }
    
    return result;
  }

  /**
   * Determine Quranic significance
   */
  private determineQuranicSignificance(patterns: NumericalPattern[]): ValidationResult['quranicSignificance'] {
    const verseReferences: string[] = [];
    const mathematicalProperties: string[] = [];
    const spiritualMeanings: string[] = [];
    
    patterns.forEach(pattern => {
      if (pattern.metadata?.sacredInfo) {
        const sacredInfo = pattern.metadata.sacredInfo as SacredNumber;
        verseReferences.push(...sacredInfo.quranicReferences);
        mathematicalProperties.push(...sacredInfo.mathematicalProperties);
        spiritualMeanings.push(...sacredInfo.spiritualAttributes);
      }
    });
    
    // Remove duplicates
    const uniqueVerses = [...new Set(verseReferences)];
    const uniqueProperties = [...new Set(mathematicalProperties)];
    const uniqueMeanings = [...new Set(spiritualMeanings)];
    
    return {
      verseReferences: uniqueVerses,
      mathematicalProperties: uniqueProperties,
      spiritualMeaning: uniqueMeanings.join('; ')
    };
  }

  /**
   * Calculate validation score
   */
  private calculateValidationScore(patterns: NumericalPattern[], threshold: number): {
    isValid: boolean;
    confidence: number;
  } {
    if (patterns.length === 0) {
      return { isValid: false, confidence: 0 };
    }
    
    // Calculate weighted confidence based on pattern types and resonance
    let totalWeight = 0;
    let weightedScore = 0;
    
    patterns.forEach(pattern => {
      const weight = this.getPatternWeight(pattern);
      const score = pattern.resonance * pattern.frequency;
      
      totalWeight += weight;
      weightedScore += weight * score;
    });
    
    const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const isValid = confidence >= threshold;
    
    return { isValid, confidence };
  }

  /**
   * Helper methods
   */
  private isRelatedToNumber(num: number, target: number): boolean {
    const absNum = Math.abs(num);
    return absNum === target || 
           absNum % target === 0 || 
           this.calculateDigitalRoot(absNum) === this.calculateDigitalRoot(target);
  }

  private calculateDigitalRoot(num: number): number {
    if (num === 0) return 0;
    let n = Math.abs(num);
    while (n >= 10) {
      n = Math.floor(n / 10) + (n % 10);
    }
    return n;
  }

  private calculateResonance(sequence: number[], base: number): number {
    if (sequence.length === 0) return 0;
    
    const avgDeviation = sequence.reduce((sum, num) => {
      return sum + Math.abs(num - base);
    }, 0) / sequence.length;
    
    const maxDeviation = base;
    const resonance = Math.max(0, 1 - (avgDeviation / maxDeviation));
    
    return resonance;
  }

  private calculateTeslaResonance(sequence: number[]): number {
    if (sequence.length === 0) return 0;
    
    const digitalRoots = sequence.map(num => this.calculateDigitalRoot(Math.abs(num)));
    const teslaCount = digitalRoots.filter(dr => dr === 3 || dr === 6 || dr === 9).length;
    
    return teslaCount / sequence.length;
  }

  private calculateFibonacciResonance(sequence: number[]): number {
    if (sequence.length === 0) return 0;
    
    const fibCount = sequence.filter(num => this.isFibonacciNumber(Math.abs(num))).length;
    return fibCount / sequence.length;
  }

  private isFibonacciNumber(num: number): boolean {
    if (num < 0) return false;
    
    // A number is Fibonacci if and only if one or both of (5*n^2 + 4) or (5*n^2 - 4) is a perfect square
    const test1 = 5 * num * num + 4;
    const test2 = 5 * num * num - 4;
    
    return this.isPerfectSquare(test1) || this.isPerfectSquare(test2);
  }

  private isPerfectSquare(num: number): boolean {
    const sqrt = Math.sqrt(num);
    return sqrt === Math.floor(sqrt);
  }

  private isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
  }

  private getFactors(num: number): number[] {
    const factors: number[] = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push(i);
        if (i !== num / i) {
          factors.push(num / i);
        }
      }
    }
    return factors.sort((a, b) => a - b);
  }

  private generateFibonacci(count: number): number[] {
    const fib = [0, 1];
    for (let i = 2; i < count; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }
    return fib;
  }

  private calculateVortexEnergy(sequence: number[]): number {
    // Simplified vortex energy calculation
    return sequence.reduce((sum, num) => sum + Math.abs(num), 0) / sequence.length;
  }

  private calculateDimensionalHarmony(sequence: number[]): number {
    // Simplified dimensional harmony calculation
    const digitalRoots = sequence.map(num => this.calculateDigitalRoot(Math.abs(num)));
    const uniqueRoots = new Set(digitalRoots);
    return uniqueRoots.size / 9; // Normalize by number of possible digital roots
  }

  private calculateGoldenRatio(sequence: number[]): number {
    if (sequence.length < 2) return 0;
    
    const ratios: number[] = [];
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i - 1] !== 0) {
        ratios.push(sequence[i] / sequence[i - 1]);
      }
    }
    
    return ratios.length > 0 ? ratios.reduce((sum, r) => sum + r, 0) / ratios.length : 0;
  }

  private calculateSpiralGrowth(sequence: number[]): number {
    // Simplified spiral growth calculation
    return sequence.length > 1 ? Math.log(sequence[sequence.length - 1] / sequence[0]) : 0;
  }

  private calculateSymmetry(data: number[]): number {
    const n = data.length;
    let symmetryScore = 0;
    
    for (let i = 0; i < n / 2; i++) {
      if (data[i] === data[n - 1 - i]) {
        symmetryScore++;
      }
    }
    
    return symmetryScore / (n / 2);
  }

  private findGoldenRatio(data: number[]): number | null {
    const goldenRatio = 1.618033988749895;
    const tolerance = 0.01;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] !== 0) {
        const ratio = Math.abs(data[i] / data[i - 1]);
        if (Math.abs(ratio - goldenRatio) < tolerance) {
          return ratio;
        }
      }
    }
    
    return null;
  }

  private hasHexagonalSymmetry(data: number[]): boolean {
    // Simplified hexagonal symmetry check
    return data.length % 6 === 0;
  }

  private hasTriangularSymmetry(data: number[]): boolean {
    // Simplified triangular symmetry check
    return data.length % 3 === 0;
  }

  private getPatternWeight(pattern: NumericalPattern): number {
    const weights = {
      'septenary': 2.0,
      'tesla': 1.8,
      'quranic': 1.5,
      'fibonacci': 1.3,
      'prime': 1.2
    };
    
    return weights[pattern.type] || 1.0;
  }
}