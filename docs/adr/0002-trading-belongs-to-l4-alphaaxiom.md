# ADR 0002: Trading belongs to L4 (AlphaAxiom), not L2 (iqra)

- **Status**: Proposed (pending maintainer ratification)
- **Date**: 2026-05-13
- **Deciders**: Repository owner via the cross-stack hygiene
  conversation that produced #71
- **Relates to**: ADR 0001 (memory stores); the Sovereign Stack role
  separation documented in the profile README at
  `Moeabdelaziz007/moeabdelaziz007#02-sovereign-core` and
  `#03-extended-ecosystem`.

## Context

The Sovereign Stack explicitly assigns trading to L4:

> **L4 . AlphaAxiom** — Satellite . Trading. Autonomous quant-trading
> engine using Monte Carlo Tree Search, World Models, and a Gemini
> brain. MT5 / Bybit / EVM adapters. Skill plugin runtime that buys
> MCTS variants from L3.
> ─ profile README, section 03

L2 iqra is the **sovereign runtime**, not a trading engine. Yet iqra
currently ships a full trading subsystem that duplicates AlphaAxiom's
remit:

| iqra path | LOC | Purpose | L4 equivalent |
|-----------|-----|---------|---------------|
| `src/lib/iqra/11-trading/bybit.ts` | 95 | Bybit REST wrapper | `engine/adapters/` (paper, mt5, evm) |
| `src/lib/iqra/11-trading/bybit_client.ts` | 203 | Bybit client | same |
| `src/lib/iqra/11-trading/market_analyzer.ts` | 170 | Signal extraction | `engine/signal_generator.py`, `signal_pipeline.py` |
| `src/lib/iqra/11-trading/market_data.ts` | 68 | OHLCV fetch | `engine/market_data/binance_client.py`, `service.py` |
| `src/lib/iqra/11-trading/self_play_loop.ts` | 141 | Self-play training loop | `engine/rl/env.py` + backtest harness |
| **`11-trading/` total** | **677** | | |
| `src/lib/iqra/02-workers/trading_agent.ts` | — | Worker that calls into 11-trading | covered by AlphaAxiom's `engine/trading_core.py` |
| `src/scripts_v2/trading_pulse.ts` | — | Live trading script | covered by AlphaAxiom CLI |
| `src/tests/e2e/market_analyzer.e2e.ts` | — | Market e2e | covered by AlphaAxiom backtest |
| `src/tests/e2e/trading_system.e2e.ts` | — | Trading e2e | same |

The duplication is not pretend overlap. AlphaAxiom already implements
the production-grade version of every iqra trading file, with
properly tested backtests, slippage modelling, commission accounting,
and look-ahead-bias prevention (see `money-machine/src-python/engine/backtest.py`,
covered by `tests/test_backtest.py`). iqra's trading code carries
none of those guarantees and is not invoked in any of iqra's
sovereign loops (planning / verification / evolution).

## Decision

**Remove the trading subsystem from iqra. AlphaAxiom is the single
owner of trading logic in the Sovereign Stack.**

This is the same role-discipline the stack already applies to:

- Identity primitives (owned by L1 `aix-format`, not vendored elsewhere).
- Skill catalog (owned by L3 `aix-agent-skills`, consumed by satellites
  via x402).
- Voice agents (owned by L6 `GemClaw`, not vendored elsewhere).

iqra retains the **TrustChain interface** so AlphaAxiom can write
trade-execution audit entries into the central trust ledger; that is
explicitly what L2 is for. iqra does NOT retain any logic that
fetches market data, generates signals, executes orders, or trains
trading models. Those are L4's job.

## Consequences

### Positive

- Resolves the L2 vs L4 role conflict that the profile README's
  architecture diagram declares but the code violates.
- Removes ~677 LOC of unmaintained trading code from iqra plus the
  trading_agent worker and the two e2e tests.
- Sharpens iqra's identity. The sovereign runtime stops pretending
  to be a trading platform; AlphaAxiom stops competing with a
  weaker in-repo cousin.
- Cuts iqra's surface for the Bybit API (one less external integration
  for the L2 maintainer to track).

### Negative / risks

- Anyone who is running iqra today and depending on
  `02-workers/trading_agent` or `scripts_v2/trading_pulse` loses
  that path. Mitigation: the migration is staged across four small
  PRs (see plan below) so each removal lands with a clear deprecation
  window.
- AlphaAxiom takes on the obligation to publish a stable wire
  contract (gRPC / HTTP / event bus) that iqra can call when it
  needs trade-related context for missions, in lieu of the deleted
  local code. The MVP is "AlphaAxiom writes to trust-chain;
  iqra reads"; nothing more is required for the initial cut.

## Migration plan

Each phase ships as its own PR per the scope discipline in `AGENTS.md`.

1. **ADR ratification** (this PR). No code changes; the ADR records
   the decision and locks in the migration plan.
2. **Remove the scripts and e2e tests** that drive the trading
   subsystem from the outside: `src/scripts_v2/trading_pulse.ts`,
   `src/tests/e2e/market_analyzer.e2e.ts`,
   `src/tests/e2e/trading_system.e2e.ts`. These are entry points and
   have no callers inside the engine itself, so deleting them is
   self-contained.
3. **Patch `01-core/sovereign.ts`** to stop instantiating
   `trading_agent`. The orchestrator routes trading missions to L4
   via TrustChain (interface defined in this PR; concrete RPC plug
   lands in a follow-up).
4. **Delete `02-workers/trading_agent.ts`** and the trading-related
   assertions in `src/tests/unit/sovereign-logger.test.ts`.
5. **Delete `src/lib/iqra/11-trading/` and remove the `#trading/*`
   path mapping** from `package.json` and `tsconfig.json`. After
   this PR, iqra contains no trading code.
6. **Update AlphaAxiom** to expose the minimum surface iqra needs
   (start with a `pnpm workspaces`-published TrustChain client or a
   gRPC stub). Lands in the AlphaAxiom repo, references this ADR.

## Alternatives considered

- **Keep iqra's trading and let it compete with AlphaAxiom**.
  Rejected because the stack's value comes from clear role
  boundaries; duplicating logic across L2 and L4 means contributors
  end up patching one and silently drifting from the other.
- **Move iqra's trading into AlphaAxiom**. Tempting, but iqra's
  trading is materially weaker (no backtest harness, no slippage
  model). Importing it would import bugs. AlphaAxiom's existing
  implementation is the canonical one; iqra's gets retired.
- **Carve trading out of iqra into a new shared package**. Rejected
  because the stack already has the package: AlphaAxiom is it.
  Inventing a third home (e.g. `@axiom/trading`) duplicates the
  decision the profile README already made.
