/**
 * 🛡️ SovereignError Protocol | بروتوكول الخطأ الصادق
 * 
 * "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ" — الإسراء: 36
 *
 * ══════════════════════════════════════════════════════════════
 * CANONICAL VERSION — النسخة المرجعية الوحيدة
 * ══════════════════════════════════════════════════════════════
 * - src/errors/sovereign_error.ts ← THIS FILE
 * - lib/iqra/06-security/security.ts SovereignError ← DEAD, do not use
 * - lib/iqra/01-core/sovereign_error.ts ← DELETED, merged here
 * ══════════════════════════════════════════════════════════════
 */

export enum SovereignErrorCode {
    HALLUCINATION_DETECTED = 'HALLUCINATION_DETECTED',
    TRUTH_ORACLE_MISMATCH = 'TRUTH_ORACLE_MISMATCH',
    CONNECTION_FAILURE = 'CONNECTION_FAILURE',
    MITHAQ_VIOLATION = 'MITHAQ_VIOLATION',
    HUMILITY_THRESHOLD_REACHED = 'HUMILITY_THRESHOLD_REACHED',
    // [TC] reason: merge retry/validation codes from 01-core copy | id: TC-unify-sovereign-error
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    MISSION_ABORTED = 'MISSION_ABORTED',
    MOCK_FORBIDDEN = 'MOCK_FORBIDDEN',
    INTEGRITY_ERR = 'INTEGRITY_ERR',
    MAX_CYCLES_REACHED = 'MAX_CYCLES_REACHED',
    RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
    WORKER_FAILURE = 'WORKER_FAILURE',
    RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
    DAMIR_BLOCK = 'DAMIR_BLOCK',
    // [TC] reason: add codes used by damir_kernel.ts | id: TC-damir-codes
    KERNEL_CRASH = 'KERNEL_CRASH',
    TAWBAH_HALT = 'TAWBAH_HALT',
    // [TC] reason: add codes used by qalbin_vm.ts | id: TC-qalbin-codes
    QALBIN_OVERFLOW = 'QALBIN_OVERFLOW',
    AMAN_VIOLATION = 'AMAN_VIOLATION',
}

export interface SovereignErrorMetadata {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: string;
    context?: any;
    recovery_strategy: 'RETRY' | 'HALT' | 'REFLECT' | 'ASK_HUMAN';
    // [TC] reason: support partial results and retry history from topological-loop | id: TC-unify-sovereign-error
    partialResults?: Record<string, unknown>;
    retryHistory?: RetryAttempt[];
    diagnostics?: Record<string, unknown>;
}

// [TC] reason: extracted from 01-core/sovereign_error.ts for retry tracking | id: TC-unify-sovereign-error
export interface RetryAttempt {
    attempt: number;
    timestamp: number;
    strategy: string;
    result: 'success' | 'failure';
    error?: string;
}

export class SovereignError extends Error {
    public code: SovereignErrorCode;
    public metadata: SovereignErrorMetadata;
    public timestamp: string;

    constructor(message: string, code: SovereignErrorCode, metadata: SovereignErrorMetadata) {
        super(message);
        this.name = 'SovereignError';
        this.code = code;
        this.metadata = metadata;
        this.timestamp = new Date().toISOString();

        // Ensure this error is logged to the IQRA log system
        this.logSovereignly();
    }

    private logSovereignly() {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'FAILURES.md');
        
        const entry = `
### ❌ [SOVEREIGN_FAILURE] | ${this.timestamp}
- **Code**: ${this.code}
- **Message**: ${this.message}
- **Severity**: ${this.metadata.severity}
- **Source**: ${this.metadata.source}
- **Recovery**: ${this.metadata.recovery_strategy}
${this.metadata.retryHistory ? `- **Retry History**: ${JSON.stringify(this.metadata.retryHistory)}` : ''}
${this.metadata.partialResults ? `- **Partial Results**: ${JSON.stringify(this.metadata.partialResults)}` : ''}
---
`;
        try {
            fs.appendFileSync(logPath, entry);
        } catch (e) {
            console.error('Failed to log to FAILURES.md:', e);
        }
        
        console.error(`🕋 [SOVEREIGN_ERROR] | ${this.code} | ${this.message}`);
    }

    /**
     * Log to TAWBAH.md (repentance log) with full context
     * [TC] reason: merged from 01-core/sovereign_error.ts | id: TC-unify-sovereign-error
     */
    async logToTawbah(): Promise<void> {
        const { logToIQRAFile } = await import('#security/security');
        
        const entry = `
### 🛑 [SOVEREIGN_ERROR] ${this.timestamp}
- **Code**: ${this.code}
- **Message**: ${this.message}
- **Severity**: ${this.metadata.severity}
- **Source**: ${this.metadata.source}
- **Recovery**: ${this.metadata.recovery_strategy}
${this.metadata.retryHistory ? `- **Retry History**: ${JSON.stringify(this.metadata.retryHistory)}` : ''}
${this.metadata.partialResults ? `- **Partial Results**: ${JSON.stringify(this.metadata.partialResults, null, 2)}` : ''}
---`;
        
        await logToIQRAFile('TAWBAH.md', entry);
    }
}

/**
 * Helper to check if an error is a SovereignError
 */
export function isSovereignError(error: unknown): error is SovereignError {
    return error instanceof SovereignError;
}

/**
 * Helper to extract partial results from any error
 */
export function extractPartialResults(error: unknown): Record<string, unknown> | undefined {
    if (isSovereignError(error)) {
        return error.metadata.partialResults;
    }
    return undefined;
}
