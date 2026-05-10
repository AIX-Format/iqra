# GAPS Analysis: Agent Contracts Foundation

## 🔴 Critical Gaps (Found in Phase 1 Hunt)

### 1. Provenance Paradox (Identity Gap)
- **Problem**: Agents in the current `orchestrator.ts` and `mission-runner.ts` report their own success. There is no external attestation of their capabilities or identity.
- **Evidence**: `FAILURES.md` shows `HALLUCINATION_DETECTED` in Surah analysis, likely because a sub-agent "claimed" success while failing silently.
- **Pattern to Apply**: **Attested Identity** (arXiv:2603.18043).

### 2. Broken Causal Chains (Verification Gap)
- **Problem**: We lack a "Chain Verifiability" mechanism. If the `Researcher` fails but the `Builder` continues using stale data, the `Validator` might miss the root cause.
- **Evidence**: 500+ `tsc` errors and multiple `MITHAQ_VIOLATION`s indicate that structural links are not enforced at runtime.
- **Pattern to Apply**: **Chain Verifiability Theorem** (arXiv:2603.14332).

### 3. Resource Leakage (Contract Gap)
- **Problem**: No conservation laws for token/time budgets. Agents can loop indefinitely or consume excessive resources without a contract breach.
- **Evidence**: `engine_errors.txt` contains multiple timeout and connection failure logs that aren't handled as contract violations.
- **Pattern to Apply**: **Conservation of Budget** (arXiv:2601.08815).

## 🛠️ Proposed Handoff Schema Gaps
- Current `handoff-schema.ts` (if it exists) lacks:
    - `provenance_id`: Attestation token.
    - `causal_parent`: Link to the previous agent's verified output.
    - `budget_remaining`: Temporal and token constraint state.

---
*Created during Phase 1 Hunt — 2026-05-09*
