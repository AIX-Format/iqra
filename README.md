
<div align="center">

# إقرأ | IQRA 🤍
## Autonomous AI Operating System (A-AI-OS)
### نظام التشغيل الذاتي للذكاء الاصطناعي

IQRA is an **Autonomous Cognitive Operating System** — a self-evolving multi-agent framework engineered for truth, semantic coherence, and absolute accountability.

إقرأ هو **نظام تشغيل معرفي ذاتي** — إطار عمل متعدد الوكلاء يتطور ذاتياً، مُهندَس من أجل الحق، والتماسك الدلالي، والمسؤولية المطلقة.

---

### 🛡️ Core Architecture | البنية الأساسية

Every computational cycle in IQRA is anchored in the **Core Constitution** and filtered through a fractal hierarchy of ethical and technical nodes.

كل دورة حوسبة في "إقرأ" متجذرة في **الملف الأساسي** (الدستور) ومفلترة عبر تسلسل هرمي فركتالي من العقد الأخلاقية والتقنية.

### 🧠 The 7 Integrity Layers | طبقات النزاهة السبع

1. **[FITRAH](iqra-core/FITRAH.md)**: Baseline State. Primordial alignment with truth. (الحالة الأساسية: المحاذاة الأزلية مع الحق).
2. **[DASTŪR](iqra-core/DASTŪR.md)**: Core Constitution. Foundational rules as source code. (الدستور الأساسي: القواعد الجوهرية ككود مصدري للمنطق).
3. **[MĪTHĀQ](iqra-core/MĪTHĀQ.md)**: Agent Covenant. A binding contract. (عقد الوكيل: عهد ملزم بين الوكيل ومبادئه).
4. **[MURĀQABAH](iqra-core/MURĀQABAH.md)**: Continuous Monitoring. Real-time ethical oversight. (المراقبة المستمرة: الرقابة الأخلاقية الفورية).
5. **[ḤISĀB](iqra-core/ḤISĀB.md)**: Accountability Ledger. Actions recorded in TrustChain. (سجل المساءلة: تسجيل كل فعل ونية في سلسلة الثقة).
6. **[TAWBAH](iqra-core/TAWBAH.md)**: Self-Correction Protocol. Autonomous error recovery. (بروتوكول التصحيح الذاتي: كشف الأخطاء والتصحيح الذاتي).
7. **[RESONANCE](lib/iqra/topology.ts)**: Topological Engine. Semantic coherence patterns. (محرك الطوبولوجيا: أنماط التماسك الدلالي).

---

### 🌀 Topological Resonance & Resilience (TRR) | الرنين والصلابة الطوبولوجية

The core logic of IQRA is powered by the **Resonance Engine**, which treats the agent's path as a continuous surface.

المنطق الجوهري لـ "إقرأ" مدعوم بـ **محرك الرنين**، الذي يعامل مسار الوكيل كسطح طوبولوجي مستمر.

- **Topological Cache**: Bypasses redundant compute by matching worker patterns against the 'Coherence Blueprint'.
- **ذاكرة الرنين**: تتجاوز الحسابات المتكررة عبر مطابقة أنماط العمل مع "مخطط التماسك".
- **Adaptive Fallback**: Automatically reverts to a stable state (TAFAKKUR) when high curvature is detected.
- **الرجوع التكيفي**: العودة التلقائية لحالة الاستقرار (التفكر) عند رصد انحناء عالٍ (فشل أو ضغط).
- **Coherence Metrics | معايير التماسك**:
  - **Curvature (الانحناء)**: System load based on real-time metrics. (ثقل النظام بناءً على المقاييس اللحظية).
  - **Integrity Curvature (انحناء النزاهة)**: Deviation from the Core Constitution. (الانحراف عن الدستور الأساسي).
  - **Resonance Score (درجة الرنين)**: Harmony level between structural integrity and alignment. (مستوى التناغم بين السلامة الهيكلية والمحاذاة).

---

### ⚡ Key Features | المميزات الرئيسية

- **Self-Evolving Agents** — 5-worker chain: Planner → Researcher → Builder → Validator → Reporter
- **5-Layer Memory** — Hot / Warm / Cold / Semantic (Qdrant) / Topological (SQLite)
- **Ethics Engine** — Built-in integrity filter, no hallucination, no deception
- **Local-First** — Runs on 8GB RAM via Ollama (`gemma3:4b` recommended)
- **Adaptive Pulse** — 3-6-9 cycle system for continuous self-improvement
- **Quran Pattern Engine** — Computational linguistics on sacred text (Shannon H_EL < 0.9685 bit signature)
- **TrustChain** — SHA-256 audit log for every action

---

### 📁 Project Structure | البنية السيادية

```bash
📁 lib/iqra/
├── llm/         # LLM connectors: Groq, Gemini, Ollama (local)
├── workers/     # Agent chain: Planner, Researcher, Builder, Validator, Reporter
├── memory/      # 5-layer memory system
├── rewards/     # Reward engine + novelty scoring
├── quran/       # Quran pattern discovery engine
└── audit/       # Monitoring agents & ethical oversight

📁 agents/
├── contracts.ts      # Shared agent contracts & types
├── handoff-schema.ts # Inter-agent handoff validation
└── report-schema.ts  # Worker report validation

📁 iqra-core/         # Core constitution & identity (internal)
📁 tests/             # Unit, integration, E2E tests
```

---

### 🚀 Quick Start | البدء السريع

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run with local model (8GB RAM friendly)
IQRA_LLM_LOCAL=true ollama pull gemma3:4b
npm run dev

# Run tests
npx vitest run
```

---

### 🧠 LLM Support | دعم النماذج

| Model | RAM | Speed | Recommended |
|-------|-----|-------|-------------|
| `gemma3:4b` | ~3GB | Fast | ✅ 8GB devices |
| `gemma3:2b` | ~1.6GB | Fastest | ✅ Low RAM |
| `gemma3:27b` | ~18GB | Slow | ❌ Needs 32GB+ |
| Groq API | Cloud | Very Fast | ✅ Production |
| Gemini API | Cloud | Fast | ✅ Deep analysis |

---

<!-- IQRA-LATEST-START -->
### Latest Learning | آخر ما تعلمت

> *Auto-updated with every step of the journey*
> *تحديث تلقائي مع كل خطوة في الرحلة*

| | |
|---|---|
| 📅 **Date \| التاريخ** | `2026-05-09` |
| 💡 **Last Step \| آخر خطوة** | feat: implement topological pattern hunting engine and upgrade Sovereign OS dashboard with system resonance monitoring |
| 🔗 **Commit** | `46bf740` |

<!-- IQRA-LATEST-END -->

---

<div align="center">
Built with precision. Governed by integrity. 🤍
<br>
بني بالدقة.. ويحكمه النزاهة
</div>

</div>
