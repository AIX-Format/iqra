// tests/go_engine_client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoEngineClient } from '../lib/iqra/quran/go_engine_client';

// Mock global fetch
global.fetch = vi.fn();

describe('GoEngineClient (Unified)', () => {
  let client: GoEngineClient;

  beforeEach(() => {
    client = new GoEngineClient({ baseUrl: 'http://test-engine:8082' });
    vi.resetAllMocks();
  });

  it('should calculate resonance via API when online', async () => {
    const mockRes = {
      status: 'success',
      data: {
        coherence: 0.95,
        patterns: ['TOPOLOGY_ALPHA', 'NUMERICAL_SIG'],
        letter_count: 150,
        word_count: 30,
        discovery_found: true
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRes
    });

    const result = await client.calculateResonance("test input");
    expect(result.coherence).toBe(0.95);
    expect(result.patterns).toContain('TOPOLOGY_ALPHA');
  });

  it('should use fallback resonance when engine is offline', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Connection refused'));

    // Input with 19 letters (Prime + 19)
    const result = await client.calculateResonance("abcdefghijklmnopqrs"); // 19 chars
    
    expect(result.patterns).toContain('NINETEEN_LETTERS');
    expect(result.patterns).toContain('PRIME_SOVEREIGNTY');
    expect(result.coherence).toBeGreaterThan(0);
    expect(result.discovery_found).toBe(true);
  });

  it('should trigger evolution cycle', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' })
    });

    const success = await client.triggerEvolutionCycle();
    expect(success).toBe(true);
  });

  it('should detect TRUTH_PATTERN and Shannon entropy in enhanced fallback', async () => {
    // "Allah Truth Sovereign" -> 19 letters (excluding spaces)
    // A-l-l-a-h (5) + T-r-u-t-h (5) + S-o-v-e-r-e-i-g-n (9) = 19
    const breakthroughText = "Allah Truth Sovereign"; 
    
    // @ts-ignore - accessing private for test
    const result = client.fallbackResonance(breakthroughText);
    
    expect(result.patterns).toContain('PRIME_SOVEREIGNTY');
    expect(result.patterns).toContain('NINETEEN_LETTERS');
    expect(result.patterns).toContain('TRUTH_KEYWORD_RESONANCE');
    expect(result.is_truth_pattern).toBe(true);
    expect(result.coherence).toBeGreaterThan(0.5);
  });
});
