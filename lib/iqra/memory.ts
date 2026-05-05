/**
 * IQRA Memory — الذاكرة
 * 
 * "وَمَا كَانَ رَبُّكَ نَسِيًّا" — مريم: 64
 * 
 * Powered by Upstash Redis.
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class IQRAMemory {
  /**
   * Save a key-value pair
   */
  static async set(key: string, value: any) {
    return await redis.set(`iqra:${key}`, value);
  }

  /**
   * Get a value by key
   */
  static async get<T>(key: string): Promise<T | null> {
    return await redis.get<T>(`iqra:${key}`);
  }

  /**
   * Append to a list (for TrustChain)
   */
  static async appendList(key: string, value: any) {
    return await redis.rpush(`iqra:list:${key}`, value);
  }

  /**
   * Save curiosity score
   */
  static async saveCuriosity(score: number) {
    await redis.set('iqra:curiosity_score', score);
    await redis.rpush('iqra:curiosity_history', {
      timestamp: Date.now(),
      score
    });
  }

  /**
   * Get current curiosity score
   */
  static async getCuriosity(): Promise<number> {
    return (await redis.get<number>('iqra:curiosity_score')) || 0.5;
  }
}
