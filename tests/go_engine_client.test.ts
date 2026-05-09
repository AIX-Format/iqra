import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoEngineClient } from '../lib/iqra/quran/go_engine_client';

// Mocking fetch globally
global.fetch = vi.fn();

describe('GoEngineClient Unification Test', () => {
  let client: GoEngineClient;

  beforeEach(() => {
    client = new GoEngineClient({ baseUrl: 'http://mock-engine:8082' });
    vi.clearAllMocks();
  });

  it('should successfully calculate resonance via Go Engine', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        coherence: 0.95,
        patterns: ['SABEEN_LETTERS'],
        letter_count: 7,
        word_count: 1,
        discovery_found: true
      }
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await client.calculateResonance('بسم الله');
    
    expect(result.coherence).toBe(0.95);
    expect(result.patterns).toContain('SABEEN_LETTERS');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/resonance/evaluate'), expect.any(Object));
  });

  it('should trigger fallback logic when Go Engine is offline', async () => {
    // Mock a network error or 500
    (fetch as any).mockRejectedValue(new Error('Connection Refused'));

    // "بسم" (B-S-M) has 3 letters. Not a multiple of 7 or 19.
    // Let's use a text that triggers prime fallback. 
    // "الله" (A-L-L-H) has 4 letters. Not prime.
    // "الحق" (A-L-H-Q) has 4 letters.
    // Text with 7 letters: "الحمد لله" -> A-L-H-M-D-L-L-H = 9 letters.
    // Text with 7 letters: "هو الله" -> H-W-A-L-L-H = 6 letters.
    // Let's use a text that definitely has 7 letters to test the fallback math.
    const textWith7Letters = "المص كتاب"; // A-L-M-S-K-T-A-B = 8 letters?
    // Arabic: الم (3) + كتاب (4) = 7.
    
    const result = await client.calculateResonance("الم كتاب");
    
    expect(result.discovery_found).toBe(true);
    expect(result.patterns).toContain('SABEEN_LETTERS');
    expect(result.coherence).toBeGreaterThan(0);
  });

  it('should trigger evolution cycle successfully', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'success' }),
    });

    const success = await client.triggerEvolutionCycle();
    expect(success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/evolve/cycle'), expect.any(Object));
  });
});
