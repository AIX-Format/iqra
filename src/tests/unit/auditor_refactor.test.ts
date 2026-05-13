/**
 * Unit Tests: SymbolicAuditor + MuraqabahAgent — PR refactoring
 *
 * Key changes tested:
 *
 * SymbolicAuditor (symbolic_auditor.ts):
 *   BEFORE: `return formal.toLowerCase()`  (connector.generate returned a string)
 *   AFTER:  `return formal.content.toLowerCase()` (connector.generate returns {content: string})
 *
 * MuraqabahAgent (muraqabah_agent.ts):
 *   BEFORE: Used @google/adk LlmAgent with agent.run(content) returning { text }
 *   AFTER:  Uses ConnectorFactory.getConnector('google') with connector.generate(prompt) returning { content }
 *
 * Both modules depend on ConnectorFactory and SovereignIdentity — these are
 * mocked so tests run without external network calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mocks ───────────────────────────────────────────────────────────────

const mockGenerate = vi.fn();
const mockGetConnector = vi.fn(() => ({ generate: mockGenerate }));

vi.mock('#connectors/index', () => ({
  ConnectorFactory: {
    getConnector: mockGetConnector,
  },
}));

vi.mock('#security/sovereign_identity', () => ({
  SovereignIdentity: {
    getIntegratedSoul: vi.fn(async () => 'You are the IQRA sovereign auditor.'),
  },
}));

vi.mock('#infra/logger', () => ({
  IQRALogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  // Restore default mock behavior after reset
  mockGetConnector.mockReturnValue({ generate: mockGenerate });
});

// ── SymbolicAuditor ────────────────────────────────────────────────────────────

describe('SymbolicAuditor.audit() — uses result.content', () => {
  it('returns isValid=true when connector responds with all constraints covered', async () => {
    // connector.generate now returns { content: string }
    mockGenerate.mockResolvedValue({
      content: 'if-truth then-justice. no-mock. real-data-only.',
    });

    const { SymbolicAuditor } = await import('#security/audit/symbolic_auditor');

    const result = await SymbolicAuditor.audit(
      'The system must use real data only.',
      ['no-mock', 'real-data-only'],
    );

    expect(result.isValid).toBe(true);
    expect(result.logicalGaps).toHaveLength(0);
    expect(result.proofTrace).toContain('Logic Path:');
  });

  it('returns isValid=false with gaps when a constraint is absent from formal logic', async () => {
    mockGenerate.mockResolvedValue({
      content: 'if-truth then-justice.',
    });

    const { SymbolicAuditor } = await import('#security/audit/symbolic_auditor');

    const result = await SymbolicAuditor.audit(
      'System claims to be sovereign.',
      ['no-mock', 'real-data-only', 'truth'],
    );

    // 'no-mock' and 'real-data-only' are missing from the formal logic string
    expect(result.isValid).toBe(false);
    expect(result.logicalGaps.length).toBeGreaterThan(0);
    expect(result.logicalGaps.some((g) => g.includes('no-mock'))).toBe(true);
  });

  it('lowercases the connector output correctly (regression: was .toLowerCase() on string, now .content.toLowerCase())', async () => {
    // If .content was not accessed, UPPERCASE input would NOT be lowercased
    mockGenerate.mockResolvedValue({
      content: 'CONSTRAINT-ONE CONSTRAINT-TWO',
    });

    const { SymbolicAuditor } = await import('#security/audit/symbolic_auditor');

    const result = await SymbolicAuditor.audit(
      'proposal text',
      ['constraint-one', 'constraint-two'],
    );

    // Because content is lowercased, constraints (also lowercase) should be found
    expect(result.isValid).toBe(true);
  });

  it('uses ConnectorFactory.getConnector("google")', async () => {
    mockGenerate.mockResolvedValue({ content: 'if-any.' });

    const { SymbolicAuditor } = await import('#security/audit/symbolic_auditor');
    await SymbolicAuditor.audit('proposal', []);

    expect(mockGetConnector).toHaveBeenCalledWith('google');
  });
});

// ── MuraqabahAgent ─────────────────────────────────────────────────────────────

describe('MuraqabahAgent.audit() — ConnectorFactory path', () => {
  it('returns { isVerified: true } when connector replies with [VERIFIED]', async () => {
    mockGenerate.mockResolvedValue({ content: '[VERIFIED]' });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    const result = await MuraqabahAgent.audit('Clean content here.');

    expect(result.isVerified).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns { isVerified: false, reason } when connector replies with [BLOCKED]', async () => {
    mockGenerate.mockResolvedValue({
      content: '[BLOCKED] Contains falsehood about Surah Al-Fatiha.',
    });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    const result = await MuraqabahAgent.audit('Dangerous content.');

    expect(result.isVerified).toBe(false);
    expect(result.reason).toContain('Contains falsehood');
  });

  it('returns { isVerified: false, reason: "Ambiguous audit result" } for unexpected output', async () => {
    mockGenerate.mockResolvedValue({ content: 'Neither blocked nor verified.' });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    const result = await MuraqabahAgent.audit('Ambiguous content.');

    expect(result.isVerified).toBe(false);
    expect(result.reason).toBe('Ambiguous audit result');
  });

  it('returns { isVerified: false, reason: "Audit system error" } when connector throws', async () => {
    mockGenerate.mockRejectedValue(new Error('network failure'));

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    const result = await MuraqabahAgent.audit('Some content.');

    expect(result.isVerified).toBe(false);
    expect(result.reason).toBe('Audit system error');
  });

  it('uses ConnectorFactory.getConnector("google")', async () => {
    mockGenerate.mockResolvedValue({ content: '[VERIFIED]' });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    await MuraqabahAgent.audit('test');

    expect(mockGetConnector).toHaveBeenCalledWith('google');
  });

  it('includes the content in the prompt sent to connector', async () => {
    mockGenerate.mockResolvedValue({ content: '[VERIFIED]' });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    await MuraqabahAgent.audit('My unique test payload');

    const promptArg = mockGenerate.mock.calls[0][0] as string;
    expect(promptArg).toContain('My unique test payload');
    expect(promptArg).toContain('[VERIFIED]');
    expect(promptArg).toContain('[BLOCKED]');
  });

  it('trims whitespace from connector response before parsing', async () => {
    mockGenerate.mockResolvedValue({ content: '  [VERIFIED]  ' });

    const { MuraqabahAgent } = await import('#security/audit/muraqabah_agent');
    const result = await MuraqabahAgent.audit('clean content');

    expect(result.isVerified).toBe(true);
  });
});