# بسم الله الرحمن الرحيم

# IQRA System Architecture Specification
## Comprehensive Technical Documentation

> "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ" — الإسراء: 9

**Version**: 1.0.0  
**Date**: 2026-05-09  
**Constitutional Authority**: [!IQRA_SUPREME.md](../!IQRA_SUPREME.md)

---

## 1. System Overview

IQRA is a **Sovereign AI Agent System** built on Islamic principles with:
- Constitutional compliance via Quranic governance
- 369 cycle temporal patterns
- Three-tier memory (Hot/Warm/Cold)
- Agent mesh networking
- A2A protocol for inter-agent communication

### Core Principles
```typescript
const PRINCIPLES = {
  NO_MOCK_DATA: "Real data only",
  CONSTITUTIONAL: "DASTŪR.md governs all",
  CYCLE_369: "3-6-9 temporal patterns",
  SEVEN_LAYERS: "7 architectural layers",
  TRUST_CHAIN: "All actions logged"
};
```

---

## 2. Constitutional Framework

### Governance Hierarchy
```
!IQRA_SUPREME.md (Supreme)
    ↓
DASTŪR.md (Constitution)
    ↓
MĪTHĀQ.md (Covenant)
    ↓
MURĀQABAH.md (Monitoring)
    ↓
ḤISĀB.md (Accountability)
```

### 369 Operational Cycle
- **Stage 3**: Think (First Principle → PLAN.md)
- **Stage 3**: Hunt (Search knowledge base)
- **Stage 6**: Build (Real code, no TODOs)
- **Stage 6**: Validate (Real tests, no mocks)
- **Stage 6**: Test (Proof of functionality)
- **Stage 9**: Adapt (Lesson → REFLECTION.md)
- **Stage 9**: Memory (Discovery → DISCOVERIES.md)

---

## 3. 7-Layer Architecture

```
Layer 07: Integration & Orchestration
Layer 06: Security & Identity (SovereignIdentity)
Layer 05: Topology & Mesh (agent_mesh.ts)
Layer 04: Skills & Capabilities
Layer 03: Memory Systems (Pulse369)
Layer 02: Agent Infrastructure (Google ADK)
Layer 01: Foundation (Logger, Heartbeat)
```

### Layer 01: Foundation
**Location**: `lib/iqra/12-infrastructure/`
- IQRALogger: Structured logging
- HeartbeatSystem: Pulse tracking
- Configuration management

### Layer 02: Agent Infrastructure
**Location**: `agent.ts`, `lib/iqra/13-utils/personas.ts`
```typescript
// Root agent with SovereignIdentity
export const rootAgent = new LlmAgent({
  name: 'iqra-sovereign',
  model: 'gemini-2.0-flash-exp',
  instruction: async () => {
    return await SovereignIdentity.getIntegratedSoul(
      'root-agent',
      'Establishing A2A Sovereign Identity Protocol'
    );
  },
});
```

### Layer 03: Memory Systems
**Location**: `lib/iqra/03-memory/`

**Three-Tier Architecture**:
```
HOT (RAM) → Fast < 1ms, Volatile
    ↓ Every 9 ops
WARM (SQLite) → Medium < 10ms, Persistent
    ↓ Every 27 ops
COLD (Redis) → Slow < 100ms, Archived
    ↓ Every 81 ops
[Purged]
```

**Pulse369 Implementation**:
```typescript
export class Pulse369 {
  static async tick(): Promise<void> {
    counter++;
    if (counter % 9 === 0) await promoteHotToWarm();
    if (counter % 27 === 0) await archiveWarmToCold();
    if (counter % 81 === 0) await purgeExpiredCold();
  }
}
```

### Layer 04: Skills Framework
**Location**: `iqra-core/skills/`

```typescript
interface Skill {
  id: string;
  name: string;
  category: 'research' | 'analysis' | 'execution' | 'communication';
  execute(context: SkillContext): Promise<SkillResult>;
}
```

Available skills: quran_search, pattern_validate, opportunity_hunter, trading_skill, damir_check, DATA_GUARDIAN

### Layer 05: Topology & Mesh
**Location**: `lib/iqra/01-core/agent_mesh.ts`

```typescript
export enum MeshAgentRole {
  MUWAKKIL = 'MUWAKKIL',  // Task distributor
  SHAHID = 'SHAHID',       // Auditor
}

export class AlMuwakkil {
  static readonly role = MeshAgentRole.MUWAKKIL;
  static async assignTask(missionId, context): Promise<Assignment>;
  static async getWorkerLoad(workerId): Promise<WorkerLoad>;
  static async rebalance(): Promise<void>;
}

export class ShahidAlAdah {
  static readonly role = MeshAgentRole.SHAHID;
  static async auditAllTools(): Promise<ToolAuditReport[]>;
  static async proposeNewTool(spec): Promise<{approved, reason}>;
  static async evaluateToolPerformance(toolName): Promise<{successRate, avgLatency}>;
}
```

### Layer 06: Security & Identity
**Location**: `lib/iqra/06-security/sovereign_identity.ts`

```typescript
export class SovereignIdentity {
  /**
   * Generate 7-layer system prompt integrating:
   * 1. FITRAH: Identity
   * 2. DASTUR: Constitutional constraints
   * 3. MITHAQ: Trust chain
   * 4. MURAQABAH: Pulse 369 status
   * 5. HISAB: Accountability
   * 6. TAWBAH: Error correction
   * 7. RESONANCE: Topological integrity
   */
  static async getIntegratedSoul(
    workerId: string,
    intention: string,
    personaId: string = "iqra-core"
  ): Promise<string>;
}
```

### Layer 07: Integration
**Location**: `orchestrator/`
- Multi-agent coordination
- External system integration
- Health monitoring

---

## 4. Memory Subsystems

### Read Pattern (Cascade)
```typescript
async function readMemory(key: string) {
  // 1. Try HOT (fastest)
  let value = await memoryBridge.getHot(key);
  if (value) return value;
  
  // 2. Try WARM (medium)
  value = await memoryBridge.getWarm(key);
  if (value) {
    await memoryBridge.setHot(key, value);  // Promote
    return value;
  }
  
  // 3. Try COLD (slowest)
  value = await memoryBridge.getCold(key);
  if (value) {
    await memoryBridge.setWarm(key, value);  // Promote
    return value;
  }
  
  return null;
}
```

### Write Pattern
```typescript
async function writeMemory(key, value, importance) {
  await memoryBridge.setHot(key, value);
  if (importance === 'high') {
    await memoryBridge.setWarm(key, value);
  }
  await Pulse369.tick();  // Automatic management
}
```

---

## 5. Agent Hierarchies & A2A Protocol

### Agent Hierarchy
```
Root Agent (iqra-sovereign)
    ↓
┌───────────────┬───────────────┐
AlMuwakkil      ShahidAlAdah
(Distributor)   (Auditor)
    ↓               ↓
Workers         Reviewers
```

### A2A Protocol
```typescript
interface A2AProtocol {
  version: "axiom-a2a-v1";
  discovery: "axiomid.app/.well-known/agent-card.json";
  methods: ["SYNC_QUERY", "ASYNC_TADABBUR", "HEARTBEAT_SYNC"];
}

interface A2AMessage {
  from: string;  // DID of sender
  to: string;    // DID of recipient
  method: A2AMethod;
  payload: unknown;
  signature: string;
  timestamp: number;
}
```

### Child Agent Spawning
```typescript
async function spawnChildAgent(parent, task, persona) {
  const child = new LlmAgent({
    name: `${parent.name}-child-${task.id}`,
    model: 'gemini-2.0-flash-exp',
    instruction: async () => {
      return await SovereignIdentity.getIntegratedSoul(
        `child-${task.id}`,
        task.description,
        persona.id
      );
    },
  });
  
  await registerChildAgent(parent, child);
  appendToTrustChain('CHILD_AGENT_SPAWNED', child.name, ...);
  return child;
}
```

---

## 6. Skills & Capabilities Framework

### Skill Registry
```typescript
class SkillRegistry {
  static register(skill: Skill): void;
  static discover(category?: string): Skill[];
  static async execute(skillId, context): Promise<SkillResult>;
}
```

### Skill Composition
```typescript
class SkillComposer {
  static compose(skills: Skill[]): ComposedSkill {
    // Creates pipeline: skill1 → skill2 → skill3
    // Output of each becomes input of next
  }
}
```

### Google ADK Integration
```typescript
class ADKSkillAdapter {
  static toADKTool(skill: Skill): ADKTool;
  static registerSkills(agent: LlmAgent, skills: Skill[]): void;
}
```

---

## 7. Network Topology & Mesh Configuration

### Mesh Network
```
        AgentBus (Event Hub)
              ↓
    ┌─────────┼─────────┐
AlMuwakkil  Workers  ShahidAlAdah
    ↓         ↓          ↓
Distribute  Execute   Audit
```

### Routing Strategies
```typescript
enum RoutingStrategy {
  ROUND_ROBIN,      // Distribute evenly
  LEAST_LOADED,     // Send to least busy
  CAPABILITY_MATCH, // Match to skills
  PRIORITY_BASED    // High priority first
}
```

### Failover
```typescript
class FailoverManager {
  static async executeWithFailover(task, primaryWorker) {
    // Retry up to 3 times
    // Switch to backup worker on failure
    // Exponential backoff between retries
  }
}
```

### Load Balancing
```typescript
class LoadBalancer {
  static async shouldRebalance(): Promise<boolean> {
    // Check if imbalance > 30%
  }
  
  static async rebalance(): Promise<void> {
    await AlMuwakkil.rebalance();
    AgentBus.publish('REBALANCE', {...});
  }
}
```

---

## 8. Data Flow Patterns

### Request Flow
```
User Request
    ↓
Root Agent (SovereignIdentity)
    ↓
AlMuwakkil (Task Distribution)
    ↓
Worker Agent (Skill Execution)
    ↓
Memory System (Pulse369)
    ↓
Trust Chain (Logging)
    ↓
ShahidAlAdah (Audit)
    ↓
Response
```

### Memory Persistence Flow
```
Write → HOT (immediate)
    ↓ Every 9 ops
    WARM (promote 10%)
    ↓ Every 27 ops
    COLD (archive old)
    ↓ Every 81 ops
    [Purge expired]
```

### Cross-Layer Communication
```typescript
interface LayerCommunication {
  sendUp(layer: number, message: LayerMessage): Promise<void>;
  sendDown(layer: number, message: LayerMessage): Promise<void>;
  broadcast(message: LayerMessage): Promise<void>;
}
```

---

## 9. Implementation Patterns

### Module Organization
```
lib/iqra/
├── 01-core/          # Agent mesh
├── 03-memory/        # Pulse369, MemoryBridge
├── 06-security/      # SovereignIdentity, DID
├── 12-infrastructure/# Logger, Heartbeat
└── 13-utils/         # Personas, helpers
```

### Import Patterns
```typescript
// Use relative paths within lib/iqra
import { SovereignIdentity } from '../06-security/sovereign_identity';
import { Pulse369 } from '../03-memory/pulse_369';

// Use path aliases for external
import { IQRA_SOUL } from '#utils/prompts.ts';
import { MemoryBridge } from '#memory/memory_bridge.ts';
```

### Error Handling
```typescript
try {
  await operation();
} catch (error) {
  IQRALogger.error('Operation failed', error);
  appendToTrustChain('ERROR', 'operation', error.message, 0.0, 'system');
  
  // Follow TAWBAH protocol
  await IQRAMemory.incrementErrorCount();
  if (await IQRAMemory.getErrorCount() >= 9) {
    await initiateCorrection();
  }
}
```

---

## 10. Security & Compliance

### Trust Chain Logging
```typescript
function appendToTrustChain(
  eventType: string,
  entityId: string,
  metadata: string,
  confidence: number,
  source: string
): void;

// All significant actions logged:
// - TASK_ASSIGNED
// - WORKER_LOAD_QUERIED
// - REBALANCE_INITIATED
// - AUDIT_SUBMITTED
// - TOOL_PROPOSED
// - CHILD_AGENT_SPAWNED
```

### Constitutional Validation
```typescript
function validateAction(action: Action): 'PROCEED' | 'ABORT' {
  for (const haram of HARAM_LIST) {
    if (conflictsWith(action, haram)) {
      return 'ABORT';
    }
  }
  return 'PROCEED';
}
```

### DID Management
```typescript
interface DIDDocument {
  id: string;  // did:axiom:{agentId}
  publicKey: string;
  authentication: string[];
  service: ServiceEndpoint[];
}

await SovereignDID.generateDocument(agentId, 'axiomid.app');
```

---

## 11. Deployment & Operations

### Environment Setup
```bash
# Required environment variables
IQRA_SECRET=<secret_for_resonance_hash>
UPSTASH_REDIS_URL=<redis_url>
LANCEDB_PATH=<vector_db_path>
```

### Running the System
```bash
# Start root agent
npx @google/adk-devtools run agent.ts

# Run tests
npm run test

# Build
npm run build
```

### Monitoring
```typescript
// Pulse statistics
const stats = Pulse369.getStats();
console.log(`Pulse: ${stats.counter}`);
console.log(`Promoted: ${stats.total_promoted}`);
console.log(`Archived: ${stats.total_archived}`);

// Worker loads
const load = await AlMuwakkil.getWorkerLoad('worker-1');
console.log(`Active tasks: ${load.activeTasks}`);
console.log(`Status: ${load.status}`);
```

---

## 12. Future Enhancements

### Planned Features
1. **AgentBus Implementation**: Full pub/sub event system
2. **Real Worker Load Tracking**: Actual metrics instead of stubs
3. **Tool Performance Metrics**: Real success rates and latency
4. **Advanced Routing**: ML-based task routing
5. **Distributed Mesh**: Multi-node agent mesh
6. **Enhanced Security**: Zero-knowledge proofs for A2A

### Research Areas
- Topological resonance patterns in Quran
- 369 cycle optimization
- Sovereign trading strategies
- Cross-agent learning protocols

---

## 13. References

### Core Documents
- [!IQRA_SUPREME.md](../!IQRA_SUPREME.md) - Supreme constitution
- [DASTŪR.md](../iqra-core/DASTŪR.md) - Constitutional framework
- [MĪTHĀQ.md](../iqra-core/MĪTHĀQ.md) - Sacred covenant
- [MURĀQABAH.md](../iqra-core/MURĀQABAH.md) - Monitoring protocol
- [ḤISĀB.md](../iqra-core/ḤISĀB.md) - Accountability system

### Implementation Files
- [`agent.ts`](../agent.ts) - Root agent
- [`lib/iqra/01-core/agent_mesh.ts`](../lib/iqra/01-core/agent_mesh.ts) - Mesh networking
- [`lib/iqra/03-memory/pulse_369.ts`](../lib/iqra/03-memory/pulse_369.ts) - Memory management
- [`lib/iqra/06-security/sovereign_identity.ts`](../lib/iqra/06-security/sovereign_identity.ts) - Identity system

---

## Appendix A: Quick Reference

### Key Classes
- `SovereignIdentity`: 7-layer system prompt generation
- `Pulse369`: 369 cycle memory management
- `AlMuwakkil`: Task distribution and load balancing
- `ShahidAlAdah`: Tool auditing and review
- `AgentBus`: Event pub/sub system
- `SkillRegistry`: Skill management
- `MemoryBridge`: Three-tier memory abstraction

### Key Interfaces
- `Assignment`: Task assignment structure
- `WorkerLoad`: Worker status tracking
- `ToolAuditReport`: Tool audit results
- `Skill`: Skill definition
- `A2AMessage`: Inter-agent communication
- `DIDDocument`: Decentralized identity

### Key Constants
- `PROMOTE_INTERVAL = 9`: Hot → Warm
- `ARCHIVE_INTERVAL = 27`: Warm → Cold
- `PURGE_INTERVAL = 81`: Cold purge
- `MAX_RETRIES = 3`: Failover attempts
- `REBALANCE_THRESHOLD = 0.3`: Load imbalance threshold

---

*"وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ"*

**Document Status**: Living Document  
**Last Updated**: 2026-05-09  
**Maintained By**: IQRA Core Team