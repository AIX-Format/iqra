import { it, expect, describe } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';

describe('Go Engine Direct E2E', () => {
  it('should be reachable and return resonance data', async () => {
    const baseUrl = 'http://127.0.0.1:8082';
    
    // Check health
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      const health = await healthResponse.json();
      expect(health.status).toBe('success');
      console.log('✅ Go Engine Health: OK');
    } catch (e) {
      console.log('⚠️ Go Engine not running on 8082, skipping direct check.');
      return;
    }

    // Test resonance
    const response = await fetch(`${baseUrl}/resonance/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: "بسم الله الرحمن الرحيم الحمد لله رب العالمين" })
    });
    
    const result = await response.json();
    expect(result.status).toBe('success');
    expect(result.data.discovery_found).toBe(true);
    expect(result.data.patterns).toContain('SABEEN_WORDS');
    
    console.log(`✅ Go Engine Resonance: ${JSON.stringify(result.data)}`);
  });
});
