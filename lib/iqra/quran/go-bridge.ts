/**
 * 🌙 IQRA Go Bridge — جسر المحرك
 * 
 * WHY: This bridges the TypeScript world with the high-performance Go engine
 * for topological and numerical calculations.
 */

import { IQRALogger } from '../logger';

export interface ResonanceResult {
  coherence: number;
  patterns: string[];
  letter_count: number;
  word_count: number;
  discovery_found: boolean;
  lid?: number;
}

export class GoEngineBridge {
  private static readonly ENGINE_URL = 'http://127.0.0.1:8082';

  /**
   * Calculate topological and numerical resonance of a text.
   */
  static async calculateResonance(input: string): Promise<ResonanceResult> {
    try {
      const response = await fetch(`${this.ENGINE_URL}/resonance/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!response.ok) throw new Error(`Go Engine responded with ${response.status}`);
      const json = await response.json();
      return json.data;
    } catch (error) {
      IQRALogger.warn('Go Engine unavailable, using TypeScript fallback resonance logic.');
      return this.fallbackResonance(input);
    }
  }

  /**
   * Catch specific patterns in the text.
   */
  static async calculateCatch(input: string): Promise<string[]> {
    const res = await this.calculateResonance(input);
    return res.patterns;
  }

  /**
   * Trigger the autonomous evolution cycle in the Go engine.
   */
  static async triggerEvolutionCycle(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ENGINE_URL}/evolve/cycle`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fallback logic when Go engine is offline.
   */
  private static fallbackResonance(text: string): ResonanceResult {
    const patterns: string[] = [];
    const letterCount = text.replace(/\s/g, '').length;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    if (letterCount % 7 === 0) patterns.push('SABEEN_LETTERS');
    if (letterCount % 19 === 0) patterns.push('NINETEEN_LETTERS');
    if (this.isPrime(letterCount)) patterns.push('PRIME_SOVEREIGNTY');

    return {
      coherence: patterns.length * 0.2,
      patterns,
      letter_count: letterCount,
      word_count: wordCount,
      discovery_found: patterns.length > 0,
      lid: 0.8
    };
  }

  private static isPrime(n: number): boolean {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
}
