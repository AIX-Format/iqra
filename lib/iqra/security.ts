/**
 * IQRA Sovereign Security Layer — الحارس
 * 
 * "وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا" — الإسراء: 80
 * 
 * Rule 0: Security first.
 * Rule 1: Zod validation.
 * Rule 2: Crypto randomness.
 * Rule 3: TrustChain.
 * Rule 8: Circuit Breaker.
 */

import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';

// ═══════════════════════════════════
// TRUSTCHAIN — سجل الثقة
// ═══════════════════════════════════

export interface TrustChainEntry {
  timestamp: number;
  action: string;
  inputHash: string;
  outputHash: string;
  auditHash: string;
  safetyScore: number;
}

let trustChain: TrustChainEntry[] = [];

/**
 * Append to TrustChain with audit hash verification
 */
export function appendToTrustChain(
  action: string, 
  input: string, 
  output: string,
  safetyScore: number
): string {
  const inputHash = createHash('sha256').update(input).digest('hex');
  const outputHash = createHash('sha256').update(output).digest('hex');
  const prevHash = trustChain.length > 0 ? trustChain[trustChain.length - 1].auditHash : 'SOVEREIGN_GENESIS';
  
  const auditHash = createHash('sha256')
    .update(prevHash + action + inputHash + outputHash)
    .digest('hex');

  const entry: TrustChainEntry = {
    timestamp: Date.now(),
    action,
    inputHash,
    outputHash,
    auditHash,
    safetyScore
  };

  trustChain.push(entry);
  return auditHash;
}

// ═══════════════════════════════════
// SECURE RANDOMNESS (Rule 2)
// ═══════════════════════════════════

export function secureRandomId(length: number = 16): string {
  return randomBytes(length).toString('hex');
}

// ═══════════════════════════════════
// CIRCUIT BREAKER (Rule 8)
// ═══════════════════════════════════

interface CircuitState {
  failures: number;
  lastFailure: number;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const circuitBreakers: Record<string, CircuitState> = {};

export function checkCircuit(provider: string): boolean {
  const state = circuitBreakers[provider] || { failures: 0, lastFailure: 0, status: 'CLOSED' };
  
  if (state.status === 'OPEN') {
    const now = Date.now();
    if (now - state.lastFailure > 60000) { // 1 min cool down
      state.status = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  return true;
}

export function reportFailure(provider: string) {
  if (!circuitBreakers[provider]) {
    circuitBreakers[provider] = { failures: 0, lastFailure: 0, status: 'CLOSED' };
  }
  const state = circuitBreakers[provider];
  state.failures++;
  state.lastFailure = Date.now();
  if (state.failures >= 3) {
    state.status = 'OPEN';
    console.warn(`⚠️ CIRCUIT BREAKER OPEN: ${provider}`);
  }
}

export function reportSuccess(provider: string) {
  if (circuitBreakers[provider]) {
    circuitBreakers[provider].failures = 0;
    circuitBreakers[provider].status = 'CLOSED';
  }
}

// ═══════════════════════════════════
// INPUT VALIDATION (Rule 1)
// ═══════════════════════════════════

export const SovereignInputSchema = z.object({
  prompt: z.string().min(1).max(5000),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

export function validateInput(input: any) {
  return SovereignInputSchema.safeParse(input);
}
