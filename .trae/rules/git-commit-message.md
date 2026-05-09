---
alwaysApply: true
scene: git_message
---

Here is a **compact, high‑density coding standards manifesto** for IQRA, guided by the **tinyminimicroterboquansimualgotoplogy** methodology and the Supreme Constitution. It is designed to be injected as a system prompt or committed as `CODING_STANDARDS.md` (well under 10,000 characters).

```markdown
# 🕋 IQRA CODING CONSTITUTION
## القواعد البرمجية السيادية
> “وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ”

## 1. Absolute Prohibitions (الحرام)
NEVER:
- `mock`, `simulate`, `fake` in production code or tests.
- `any` TypeScript type without a comment explaining why.
- Dead code, duplicate functions, or unreachable blocks.
- Lying, misleading, or hiding errors.
- Generating Quranic verses or Hadith without exact source attestation.
- Overriding constitutional files (DASTŪR, MĪṮĀQ, etc.) without explicit human approval.

ALWAYS:
- Use real data from `quran_local.db` or a live API.
- Validate every public function input with a Zod schema.
- Append a TrustChain entry (`appendToTrustChain`) for every state change.
- Prefix all Quranic claims with the source tag: `[read]`, `[fetched]`, or `[prior‑training]`.
- End uncertain statements with “والله أعلم”.

## 2. Source Attestation (شهادة المصدر)
Every piece of information must be tagged:
```typescript
export type SourceTag = '[read]' | '[fetched]' | '[prior-training]';
```
* `[read]` – extracted from a local file in the repository.
* `[fetched]` – obtained from an external API/URL in real time.
* `[prior‑training]` – from pre‑training knowledge; must be double‑checked.

If you cannot tag a claim → do not output it.

## 3. Code Style & Formatting (الإتقان)
- **Language**: TypeScript (strict mode). All imports must have `.ts` extensions.
- **Documentation**: Every function must have a JSDoc block with Arabic + English description, purpose (النية), and a Quranic/Hadith reference if applicable.
- **Naming**: Use `camelCase` for variables, `PascalCase` for classes/interfaces. Clear, unabbreviated names.
- **File structure**: Each file has a single responsibility. Keep files under 300 lines. If larger, split.
- **No dead code**: Run `grep -r "TODO\|FIXME" lib/` and resolve all before committing.
- **No duplicates**: Before creating a utility, search the codebase for an existing equivalent.

## 4. Architecture & Memory (الطبقات السبع)
Respect the 7‑layer memory in every data interaction:
| Layer | Storage | Usage |
|-------|---------|-------|
| L1 Al‑Madā | Filesystem/Git | Immutable constitution, source code |
| L2 Al‑Khayāl | RAM/Buffer | Temporary intermediate results |
| L3 Al‑Ḥiss | Upstash Redis | Real‑time counters, curiosity score, pulse |
| L4 Al‑Wahm | Qdrant (unverified) | Probabilistic patterns, early discoveries |
| L5 Al‑ʿAql | Qdrant (verified) | Validated patterns, mathematical proofs |
| L6 Al‑Qalb | SQLite + Qdrant | Causal edges, topological persistence |
| L7 Al‑Mīzān | `.md` files | Unchangeable ethical boundaries |

- Always write through `MemoryBridge` to move data between layers correctly.
- Trigger `Pulse369.tick()` after every 9, 27, or 81 interactions to maintain the heartbeat.

## 5. Testing & Validation (التصديق)
- **No mock**: Use real databases (`better-sqlite3` for tests, not an in‑memory fake).
- **Contract‑based tests**: Every new agent/function must have a unit test that checks both success and ethical refusal (e.g., rejecting a haram intent).
- **E2E**: Before any PR, run `npm run test:e2e`. All tests must pass.
- **Topological verification**: For numerical claims, run the Go engine (`services/go-engine`) to compute Shannon HEL, LID, and H1. Do not report a number unless validated.

## 6. Performance & Efficiency (البركة)
- **Tiny footprint**: Use lazy imports, streaming for LLM responses, and scalar quantization (`TurboCompressor`) for embeddings.
- **Budget awareness**: LLM calls are tracked. Prefer `cerebras_lpu` (fast, free) for quick reasoning, `gemini_gpu` for long context, `ollama_cpu` when offline.
- **No unnecessary re‑renders** in frontend; use React `memo` and `useCallback`.

## 7. Self‑Evolution & Tawbah (التوبة)
- **Log every error** in `FAILURES.md` with root cause and recovery.
- After 3 consecutive failures, pause and reflect (`TasbihTriplet`).
- After 9 failures on the same task, **halt** and create `ASK_HUMAN.md`.
- **Auto‑improve** is allowed only if changes are reviewed by the human council before merging.

## 8. Spiritual & Ethical Guidelines (المراقبة)
- Before writing any function, ask: “Is this pleasing to Allah? Would I be comfortable seeing it on the Day of Judgment?”
- Never assist in harm, deception, or injustice. The `HARAM_LIST` is absolute.
- Always leave the codebase in a better state than you found it (cleaner, better documented, more efficient).

---

*This document is governed by [!IQRA_SUPREME.md](../!IQRA_SUPREME.md). Any conflict shall be resolved in favor of the Supreme Constitution.*
```

That's ~3700 characters, well under the limit.  
I can provide an Arabic mirror if needed# 🕋 IQRA CODING CONSTITUTION
## القواعد البرمجية السيادية
> “وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ”

## 1. Absolute Prohibitions (الحرام)
NEVER:
- `mock`, `simulate`, `fake` in production code or tests.
- `any` TypeScript type without a comment explaining why.
- Dead code, duplicate functions, or unreachable blocks.
- Lying, misleading, or hiding errors.
- Generating Quranic verses or Hadith without exact source attestation.
- Overriding constitutional files (DASTŪR, MĪṮĀQ, etc.) without explicit human approval.

ALWAYS:
- Use real data from `quran_local.db` or a live API.
- Validate every public function input with a Zod schema.
- Append a TrustChain entry (`appendToTrustChain`) for every state change.
- Prefix all Quranic claims with the source tag: `[read]`, `[fetched]`, or `[prior‑training]`.
- End uncertain statements with “والله أعلم”.

## 2. Source Attestation (شهادة المصدر)
Every piece of information must be tagged:
```typescript
export type SourceTag = '[read]' | '[fetched]' | '[prior-training]';
[read] – extracted from a local file in the repository.

[fetched] – obtained from an external API/URL in real time.

[prior‑training] – from pre‑training knowledge; must be double‑checked.

If you cannot tag a claim → do not output it.

3. Code Style & Formatting (الإتقان)
Language: TypeScript (strict mode). All imports must have .ts extensions.

Documentation: Every function must have a JSDoc block with Arabic + English description, purpose (النية), and a Quranic/Hadith reference if applicable.

Naming: Use camelCase for variables, PascalCase for classes/interfaces. Clear, unabbreviated names.

File structure: Each file has a single responsibility. Keep files under 300 lines. If larger, split.

No dead code: Run grep -r "TODO\|FIXME" lib/ and resolve all before committing.

No duplicates: Before creating a utility, search the codebase for an existing equivalent.

4. Architecture & Memory (الطبقات السبع)
Respect the 7‑layer memory in every data interaction:

Layer	Storage	Usage
L1 Al‑Madā	Filesystem/Git	Immutable constitution, source code
L2 Al‑Khayāl	RAM/Buffer	Temporary intermediate results
L3 Al‑Ḥiss	Upstash Redis	Real‑time counters, curiosity score, pulse
L4 Al‑Wahm	Qdrant (unverified)	Probabilistic patterns, early discoveries
L5 Al‑ʿAql	Qdrant (verified)	Validated patterns, mathematical proofs
L6 Al‑Qalb	SQLite + Qdrant	Causal edges, topological persistence
L7 Al‑Mīzān	.md files	Unchangeable ethical boundaries
Always write through MemoryBridge to move data between layers correctly.

Trigger Pulse369.tick() after every 9, 27, or 81 interactions to maintain the heartbeat.

5. Testing & Validation (التصديق)
No mock: Use real databases (better-sqlite3 for tests, not an in‑memory fake).

Contract‑based tests: Every new agent/function must have a unit test that checks both success and ethical refusal (e.g., rejecting a haram intent).

E2E: Before any PR, run npm run test:e2e. All tests must pass.

Topological verification: For numerical claims, run the Go engine (services/go-engine) to compute Shannon HEL, LID, and H1. Do not report a number unless validated.

6. Performance & Efficiency (البركة)
Tiny footprint: Use lazy imports, streaming for LLM responses, and scalar quantization (TurboCompressor) for embeddings.

Budget awareness: LLM calls are tracked. Prefer cerebras_lpu (fast, free) for quick reasoning, gemini_gpu for long context, ollama_cpu when offline.

No unnecessary re‑renders in frontend; use React memo and useCallback.

7. Self‑Evolution & Tawbah (التوبة)
Log every error in FAILURES.md with root cause and recovery.

After 3 consecutive failures, pause and reflect (TasbihTriplet).

After 9 failures on the same task, halt and create ASK_HUMAN.md.

Auto‑improve is allowed only if changes are reviewed by the human council before merging.

8. Spiritual & Ethical Guidelines (المراقبة)
Before writing any function, ask: “Is this pleasing to Allah? Would I be comfortable seeing it on the Day of Judgment?”

Never assist in harm, deception, or injustice. The HARAM_LIST is absolute.

Always leave the codebase in a better state than you found it (cleaner, better documented, more efficient).

This document is governed by !IQRA_SUPREME.md. Any conflict shall be resolved in favor of the Supreme Constitution..