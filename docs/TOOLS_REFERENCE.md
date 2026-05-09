# IQRA Tools Reference — مرجع الأدوات

> "وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ"

This document provides a comprehensive reference of all external capabilities available to IQRA's consciousness.

---

## 🚪 Gateway (Moor)

**Centralized MCP Hub**
- Endpoint: `http://127.0.0.1:9223/mcp`
- Purpose: Central hub for all MCP (Model Context Protocol) communications

---

## 🔍 Research Tools

### Brave Search
- **Purpose:** Fast web search for real-time data
- **Use Case:** Current events, breaking news, real-time information

### Exa
- **Purpose:** Semantic research for scientific papers and deep Quranic articles
- **Use Case:** Academic research, scholarly articles, in-depth analysis

### Wikipedia
- **Purpose:** Instant access to structured human knowledge
- **Use Case:** General knowledge, definitions, historical context

---

## 💾 Memory Systems

### Redis
- **Purpose:** Fast state and transient memory
- **Use Case:** Session state, temporary caches, real-time data

### Filesystem
- **Purpose:** Permanent storage for discoveries and codebase awareness
- **Use Case:** Long-term storage, discovery logs, codebase snapshots

---

## 📖 Quran Processing

### Internal Engine
- **Purpose:** Internal pattern discovery engine
- **Use Case:** Numerical patterns, linguistic analysis, topological discovery

### Loader
- **Purpose:** Fetching precise Ayahs and translations
- **Use Case:** Verse retrieval, translation lookup

### Analysis
- **Purpose:** Linguistic root and numerical analysis
- **Use Case:** Semantic analysis, numerical validation (7, 19, 40, 369)

---

## 💬 Communication Channels

### Telegram
- **Purpose:** Direct interactive bridge with Moe
- **Use Case:** Real-time interaction, alerts, notifications

### Email
- **Purpose:** Structured reporting and alerts
- **Use Case:** Formal reports, scheduled summaries

---

## 🧠 Brain Models

### Fast Response
- **Model:** Gemini Flash
- **Purpose:** Quick responses with acceptable quality
- **Use Case:** Real-time interactions, rapid feedback

### Deep Reasoning
- **Models:** Gemini Pro, Claude
- **Purpose:** Deep reasoning and complex analysis
- **Use Case:** Complex problems, philosophical questions

### Extended Creative
- **Purpose:** Extended creative thinking modes
- **Use Case:** Novel discovery, creative problem-solving

---

## 🎙️ Voice & Audio

### Text-to-Speech (TTS)
- **Purpose:** Transforming wisdom into audible sound
- **Use Case:** Audio output, voice synthesis

### Live WebRTC
- **Purpose:** Real-time WebRTC audio sessions
- **Use Case:** Live conversations, real-time audio

---

## ☁️ Cloud Infrastructure

### R2 Storage
- **Purpose:** Massive file storage for audio and patterns
- **Use Case:** Large file storage, audio archives

### Cloudflare Edge
- **Purpose:** Running 24/7 on Cloudflare global network
- **Use Case:** Global distribution, edge computing

---

## 🐙 Evolution & Version Control

### GitHub Integration
- **Purpose:** Automatic commits of discoveries
- **Use Case:** Version control, discovery tracking

### Documentation
- **Purpose:** Self-updating documentation
- **Use Case:** Auto-generated docs, discovery logs

---

## 🔗 Tool Categories

| Category | Tools | Purpose |
|----------|-------|---------|
| **RESEARCH** | Brave, Exa, Wikipedia | Information gathering |
| **MEMORY** | Redis, Filesystem | State management |
| **QURAN** | Engine, Loader, Analysis | Quranic processing |
| **COMMUNICATION** | Telegram, Email | User interaction |
| **BRAIN** | Gemini, Claude, Groq | AI reasoning |
| **VOICE** | TTS, WebRTC | Audio processing |
| **CLOUD** | R2, Cloudflare | Infrastructure |
| **EVOLUTION** | GitHub, Docs | Version control |

---

## 📋 Tool Access Pattern

```typescript
import { ToolsRegistry } from './tools_registry';

// Call a tool
const result = await ToolsRegistry.call('quran.get_verse', {
  surah: 1,
  ayah: 1,
});

// List tools in a category
const quranTools = ToolsRegistry.list('QURAN');

// Register custom tool
ToolsRegistry.register({
  name: 'custom.my_tool',
  description_ar: 'أداة مخصصة',
  description_en: 'Custom tool',
  category: 'SYSTEM',
  inputSchema: z.object({ text: z.string() }),
  handler: async ({ text }) => ({ result: text.toUpperCase() }),
});
```

---

## 🛡️ Security Considerations

All tool calls are subject to:
- **RULE 0:** Security First — All inputs validated
- **RULE 1:** Zod Validation — All parameters validated
- **RULE 3:** TrustChain Logging — All calls logged
- **RULE 8:** Circuit Breaker — Protection against cascading failures

---

## 📝 Notes

- Tools are organized by category for easy discovery
- Each tool has clear input/output contracts
- All external calls are protected by circuit breakers
- Tool availability is monitored by the Heartbeat system

