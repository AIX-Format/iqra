import { describe, it, expect, vi } from 'vitest';
import { SovereignError, SovereignErrorCode } from '../src/errors/sovereign_error';

describe('SovereignError Protocol', () => {
    it('should initialize with correct code and metadata', () => {
        const error = new SovereignError(
            'Test Failure',
            SovereignErrorCode.CONNECTION_FAILURE,
            {
                severity: 'HIGH',
                source: 'TEST_UNIT',
                recovery_strategy: 'RETRY'
            }
        );

        expect(error.message).toBe('Test Failure');
        expect(error.code).toBe(SovereignErrorCode.CONNECTION_FAILURE);
        expect(error.metadata.severity).toBe('HIGH');
        expect(error.timestamp).toBeDefined();
    });

    it('should log the error to the console sovereignly', () => {
        const consoleSpy = vi.spyOn(console, 'error');
        
        new SovereignError(
            'Hallucination in Surah analysis',
            SovereignErrorCode.HALLUCINATION_DETECTED,
            {
                severity: 'CRITICAL',
                source: 'ORACLE_CHECK',
                recovery_strategy: 'HALT'
            }
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('🕋 [SOVEREIGN_ERROR] | HALLUCINATION_DETECTED')
        );
        
        consoleSpy.mockRestore();
    });

    it('should handle MITHAQ violations with high severity', () => {
        const error = new SovereignError(
            'Mock data detected in core logic',
            SovereignErrorCode.MITHAQ_VIOLATION,
            {
                severity: 'CRITICAL',
                source: 'INTEGRITY_SCAN',
                recovery_strategy: 'HALT'
            }
        );

        expect(error.code).toBe(SovereignErrorCode.MITHAQ_VIOLATION);
        expect(error.metadata.severity).toBe('CRITICAL');
    });
});
