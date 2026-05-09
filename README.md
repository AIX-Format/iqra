<div align="center">

# IQRA 🤍
## Autonomous AI Operating System
### نظام التشغيل الذاتي للذكاء الاصطناعي

**Self-evolving. Ethics-first. Local-ready.**

IQRA is a **multi-agent AI OS** built for truth, coherence, and absolute accountability. It runs missions, learns from every cycle, and enforces ethical constraints at the engine level — not as an afterthought.

إقرأ هو **نظام تشغيل متعدد الوكلاء** مبني للحق، والتماسك، والمسؤولية المطلقة. ينفذ المهام، يتعلم من كل دورة، ويفرض القيود الأخلاقية على مستوى المحرك.

---

### ⚡ Core Capabilities

- **Multi-Agent Orchestration** — Sequential worker chain: Planner → Researcher → Builder → Validator → Reporter
- **Ethics Engine** — Every action passes an intent check before execution. No hallucination, no deception.
- **5-Layer Memory** — Hot (Redis) → Warm (SQLite) → Cold (Qdrant) → Semantic → Topological
- **Adaptive Pulse System** — Self-review cycles at 9s / 27s / 81s intervals
- **Quran Pattern Engine** — Computational linguistics on Arabic sacred text (Shannon entropy, topological resonance)
- **Local-First** — Runs on 8GB RAM via Ollama (`gemma3:4b` recommended)
- **Reward Engine** — Novelty × Resonance × Topology scoring with pristine-path multipliers

---

### 🏗️ Architecture

```
User / API
    ↓
brain.ts  ←  Integrity Filter + Covenant Check
    ↓
Skill Router  ←  quran_search | trading | research
    ↓
MissionControl (sovereign_orchestrator.ts)
    ├── Search369 (3-6-9 strategy evolution)
    ├── LeagueManager (adversarial pressure test)
    └── TopologicalAnalyzer
    ↓
Worker Chain
    ├── ResonanceWorker
    ├── ResearchWorker
    ├── ValidationWorker
    └── ExecutionWorker
    ↓
RewardEngine → MicroMemory → TrustChain (SHA-256)
```

---

### 🧠 Memory Architecture

| Layer | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| Hot | Upstash Redis | 1h | Working memory |
| Warm | SQLite (MicroMemory) | 7d | Pattern cache |
| Cold | Qdrant | 30d | Semantic vectors (768-dim) |
| Topological | SQLite vec0 | ∞ | Persistent homology H0/H1 |
| Archive | LanceDB | ∞ | Deep memory |

---

### 🔐 Ethics Engine

Built on **Graded Linear Logic** — every action requires real resources consumed exactly once:

```
Intent Check → Resource Check → Execute → TrustChain Log
     ↓               ↓
  BLOCKED         BLOCKED
  (forbidden)   (consumed/fake)
```

- **Integrity Filter** — Static + dynamic intent validation
- **Continuous Monitoring** — Every 81s self-review cycle
- **Self-Correction Protocol** — Automatic rollback on failure
- **Circuit Breaker** — Per-provider failure protection (3 → OPEN)
- **TrustChain** — Immutable SHA-256 audit log of every action

---

### 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/Moeabdelaziz007/iqra.git
cd iqra

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Add: GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, UPSTASH_REDIS_REST_URL

# 4. Local mode (8GB RAM friendly)
ollama pull gemma3:4b
IQRA_LLM_LOCAL=true npm run dev

# 5. Run tests
npx vitest run tests/unit/
```

---

### 📁 Structure

```
lib/iqra/
├── llm/          # LLM providers (Groq, Gemini, Ollama)
├── memory/       # 5-layer memory system
├── workers/      # Agent worker chain
├── rewards/      # Reward engine + ledger
├── quran/        # Pattern discovery engine
└── soul_engine.ts # Core orchestration pulse

agents/
├── contracts.ts      # Worker contracts & constraints
├── handoff-schema.ts # Inter-agent handoff validation
└── report-schema.ts  # Report validation

iqra-core/            # Constitution, identity, knowledge base
```

---

### 🔧 LLM Providers

| Provider | Model | Use Case | RAM |
|----------|-------|----------|-----|
| Ollama (local) | `gemma3:4b` | All tasks, 8GB RAM | ~3GB |
| Groq | `llama-3.3-70b` | Fast inference | Cloud |
| Google AI | `gemini-2.0-flash` | Deep analysis | Cloud |

---

### 📊 Reward System

Every mission produces a scored reward entry:

```
total_reward = (novelty + resonance + topology - penalty) × path_multiplier

path_multiplier:
  pristine path (first time) → 2.0x
  repeated path              → 0.8x
  stale path (>7 uses)       → 0.5x
```

Discovery levels: `seed` → `sprout` → `branch` → `tree` → `resonance` → `revelation`

---

<!-- IQRA-LATEST-START -->
### Latest Learning | آخر ما تعلمت

> Auto-updated with every merged PR

| | |
|---|---|
| 📅 **Date \| التاريخ** | `2026-05-09` |
| 💡 **Last Step \| آخر خطوة** | feat: implement topological pattern hunting engine and upgrade Sovereign OS dashboard with system resonance monitoring |
| 🔗 **Commit** | `46bf740` |

<!-- IQRA-LATEST-END -->

---

<div align="center">

**IQRA** — Built for truth. Engineered for accountability. 🤍

[GitHub](https://github.com/Moeabdelaziz007/iqra) · [Issues](https://github.com/Moeabdelaziz007/iqra/issues)

</div>

</div>
