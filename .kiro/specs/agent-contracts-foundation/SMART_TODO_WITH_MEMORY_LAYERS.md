# 🧠 SMART TODO — Agent Contracts Foundation with 7 Memory Layers

> "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
> صدقاً، دقةً، بركةً

---

## 📋 Overview: 6 Phases × 7 Memory Layers

This TODO maps the **Agent Contracts Foundation spec** to the **6-phase learning cycle** and the **7 living memory layers**:

```
Phase 1: PATTERNS HUNT    → Fill L4 (Al-Wahm) with unverified patterns
Phase 2: MEMORY VALIDATE  → Promote L4 → L5 (Al-ʿAql), create L6 links
Phase 3: LEARN & EXTRACT  → Generate lessons, update SkillBank
Phase 4: APPLY & IMPROVE  → Use patterns to improve system efficiency
Phase 5: ADAPT & EVOLVE   → Auto-modify rules within Al-Mīzān
Phase 6: TEACH & SHARE    → Share discoveries with external world
```

---

## 🔹 Phase 1: PATTERNS HUNT (Ḥisāb State, Researcher Agent)

**Goal**: Identify all gaps and patterns in the Agent Contracts Foundation. Fill L4 (Al-Wahm) with unverified patterns.

### 1.1 Research & Learn from Others' Mistakes

**Sub-tasks**:
- [ ] **1.1.1** Search arxiv.org for "agent contracts" + "validation patterns"
  - **Memory Layer**: L4 (Al-Wahm) — unverified patterns
  - **Tool**: web_search
  - **Expected Output**: 3-5 research papers on agent validation
  - **Why**: Avoid reinventing the wheel; learn from academic best practices

- [ ] **1.1.2** Search GitHub for "worker agent validation" + "handoff protocol"
  - **Memory Layer**: L4 (Al-Wahm)
  - **Tool**: web_search
  - **Expected Output**: 2-3 open-source implementations
  - **Why**: See how others solved similar problems

- [ ] **1.1.3** Review IQRA's past failures in FAILURES.md
  - **Memory Layer**: L6 (Al-Qalb) — causal edges
  - **Tool**: read_file
  - **Expected Output**: List of 5+ past mistakes and their root causes
  - **Why**: Learn from our own experience; avoid repeating errors

- [ ] **1.1.4** Analyze error patterns in engine_errors.txt
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: read_file
  - **Expected Output**: Categorized error types (import, type, logic)
  - **Why**: Identify systemic issues before they cascade

### 1.2 Map the 5 Worker Agents to Memory Layers

**Sub-tasks**:
- [ ] **1.2.1** Document which memory layers each agent reads/writes
  - **Memory Layer**: L6 (Al-Qalb) — topological core
  - **Tool**: readCode
  - **Expected Output**: Agent ↔ Memory Layer mapping table
  - **Why**: Understand data flow; prevent bottlenecks

- [ ] **1.2.2** Identify which agent owns each validation function
  - **Memory Layer**: L5 (Al-ʿAql) — verified patterns
  - **Tool**: grep_search
  - **Expected Output**: Function ownership matrix
  - **Why**: Clarify responsibilities; avoid duplication

- [ ] **1.2.3** Map the 7-step meta-loop to agent actions
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: readCode
  - **Expected Output**: Loop phase ↔ Agent action mapping
  - **Why**: Ensure all phases are covered

### 1.3 Identify Missing Validation Functions

**Sub-tasks**:
- [ ] **1.3.1** List all validation functions needed in contracts.ts
  - **Memory Layer**: L4 (Al-Wahm) — unverified patterns
  - **Tool**: grep_search
  - **Expected Output**: 9 missing functions (from GAPS.md)
  - **Why**: Concrete list for implementation

- [ ] **1.3.2** For each function, define input/output schema
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: readCode
  - **Expected Output**: Zod schemas for each function
  - **Why**: Type safety; prevent runtime errors

- [ ] **1.3.3** Identify which functions are critical path (🔴 High)
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: analyze_requirements
  - **Expected Output**: Prioritized function list
  - **Why**: Focus on high-impact work first

### 1.4 Store Patterns in L4 (Al-Wahm)

**Sub-tasks**:
- [ ] **1.4.1** Create pattern entries for each gap
  - **Memory Layer**: L4 (Al-Wahm) — Qdrant unverified
  - **Tool**: IQRAMemory.storeQuantum()
  - **Expected Output**: 18 pattern entries in Qdrant
  - **Why**: Persistent storage for later validation

- [ ] **1.4.2** Tag patterns with source (arxiv, GitHub, FAILURES.md)
  - **Memory Layer**: L4 (Al-Wahm)
  - **Tool**: IQRAMemory.storeQuantum() with metadata
  - **Expected Output**: Patterns with source attestation
  - **Why**: Traceability; verify sources later

---

## 🔹 Phase 2: MEMORY VALIDATE (Murāqabah & Tasdīq States, Validator Agent)

**Goal**: Validate L4 patterns, promote to L5 (Al-ʿAql), create topological links in L6 (Al-Qalb).

### 2.1 Validate Each Gap Against Requirements

**Sub-tasks**:
- [ ] **2.1.1** Cross-reference each gap with requirements.md
  - **Memory Layer**: L5 (Al-ʿAql) — verified patterns
  - **Tool**: grep_search
  - **Expected Output**: Gap ↔ Requirement mapping
  - **Why**: Ensure all gaps are justified

- [ ] **2.1.2** Check if gap is truly missing or just undocumented
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: readCode
  - **Expected Output**: Refined gap list (remove false positives)
  - **Why**: Avoid unnecessary work

- [ ] **2.1.3** Validate gap priority using impact analysis
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: analyze_requirements
  - **Expected Output**: Reprioritized gap list
  - **Why**: Focus on highest-impact gaps first

### 2.2 Create Topological Links (L6 — Al-Qalb)

**Sub-tasks**:
- [ ] **2.2.1** Map dependencies between gaps
  - **Memory Layer**: L6 (Al-Qalb) — causal edges
  - **Tool**: MicroMemory.recordCausalEdge()
  - **Expected Output**: Dependency graph
  - **Why**: Understand task ordering

- [ ] **2.2.2** Identify which gaps block other gaps
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: MicroMemory.recordCausalEdge()
  - **Expected Output**: Critical path analysis
  - **Why**: Parallelize work where possible

- [ ] **2.2.3** Create resonance scores for each gap
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: TopologicalCuriosityEngine.computeNovelty()
  - **Expected Output**: Novelty scores (0-1)
  - **Why**: Prioritize novel/high-impact gaps

### 2.3 Promote L4 → L5 (Verify Patterns)

**Sub-tasks**:
- [ ] **2.3.1** Run NumericalValidator on each gap
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: NumericalValidator
  - **Expected Output**: Validation results
  - **Why**: Ensure patterns are mathematically sound

- [ ] **2.3.2** Check against Al-Mīzān (L7 — ethical layer)
  - **Memory Layer**: L7 (Al-Mīzān) — immutable MD files
  - **Tool**: IQRAFilter.muraqabahCheck()
  - **Expected Output**: Ethical validation results
  - **Why**: Ensure no haram patterns

- [ ] **2.3.3** Promote verified patterns to L5 in Qdrant
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: Qdrant.upsert() with verified flag
  - **Expected Output**: Patterns marked as verified
  - **Why**: Distinguish verified from unverified

---

## 🔹 Phase 3: LEARN & EXTRACT (Shukr State, Reporter Agent)

**Goal**: Extract lessons, update SkillBank, strengthen causal graph.

### 3.1 Generate Markdown Discovery Notes

**Sub-tasks**:
- [ ] **3.1.1** For each gap, create a discovery note
  - **Memory Layer**: L1 (Al-Madā) — Filesystem/Git
  - **Tool**: ObsidianBridge.export()
  - **Expected Output**: 18 markdown files in .iqra/discoveries/
  - **Why**: Human-readable documentation

- [ ] **3.1.2** Include source citations in each note
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: Notes with [source](url) links
  - **Why**: Traceability; proper attribution

- [ ] **3.1.3** Tag notes with discovery level (Foundational/Intermediate/Advanced)
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: Tagged discovery notes
  - **Why**: Help future agents understand complexity

### 3.2 Update SkillBank with New Methods

**Sub-tasks**:
- [ ] **3.2.1** Identify novel validation patterns
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: PatternMemory.search()
  - **Expected Output**: List of novel patterns
  - **Why**: Capture new techniques

- [ ] **3.2.2** Create SkillBank entries for each novel pattern
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: SkillBank.addSkill()
  - **Expected Output**: New skills in SkillBank
  - **Why**: Reusable techniques for future tasks

- [ ] **3.2.3** Document skill usage examples
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: Skill documentation with examples
  - **Why**: Help other agents use new skills

### 3.3 Update ExperienceBuffer

**Sub-tasks**:
- [ ] **3.3.1** Record mission outcome and context
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: ExperienceBuffer.record()
  - **Expected Output**: Experience entry in SQLite
  - **Why**: Learn from this mission for future missions

- [ ] **3.3.2** Tag experience with lessons learned
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: ExperienceBuffer.record() with tags
  - **Expected Output**: Tagged experience entry
  - **Why**: Retrieve similar experiences later

- [ ] **3.3.3** Compute experience resonance score
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: TopologicalCuriosityEngine.computeResonance()
  - **Expected Output**: Resonance score (0-1)
  - **Why**: Rank experiences by quality

### 3.4 Export Training Data

**Sub-tasks**:
- [ ] **3.4.1** Extract patterns for closed-loop learning
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: SERAExporter.export()
  - **Expected Output**: Training data in JSONL format
  - **Why**: Feed future LLM fine-tuning

- [ ] **3.4.2** Include embeddings and metadata
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: SERAExporter.export()
  - **Expected Output**: Embeddings + metadata in JSONL
  - **Why**: Rich training signal

---

## 🔹 Phase 4: APPLY & IMPROVE (Tafakkur State, Builder Agent)

**Goal**: Use learned patterns to improve system efficiency.

### 4.1 Extract Codebook from Patterns

**Sub-tasks**:
- [ ] **4.1.1** Analyze H1 cycles (persistent homology)
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: GoEngine.computePersistentHomology()
  - **Expected Output**: H1 cycles (topological loops)
  - **Why**: Identify recurring structures

- [ ] **4.1.2** Create compression codebook from cycles
  - **Memory Layer**: L2 (Al-Khayāl) — RAM/Buffer
  - **Tool**: TurboCompressor.createCodebook()
  - **Expected Output**: Codebook for compression
  - **Why**: Improve TurboQuantization efficiency

- [ ] **4.1.3** Benchmark compression improvement
  - **Memory Layer**: L2 (Al-Khayāl)
  - **Tool**: TurboCompressor.benchmark()
  - **Expected Output**: Compression ratio improvement %
  - **Why**: Measure impact

### 4.2 Update ModelOrchestrator Routing

**Sub-tasks**:
- [ ] **4.2.1** Analyze pattern groups
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: PatternMemory.cluster()
  - **Expected Output**: Pattern clusters
  - **Why**: Group similar patterns

- [ ] **4.2.2** Create routing rules based on clusters
  - **Memory Layer**: L3 (Al-Ḥiss) — Upstash Redis
  - **Tool**: ModelOrchestrator.updateRouting()
  - **Expected Output**: New routing rules
  - **Why**: Route tasks to best-fit models

- [ ] **4.2.3** Test routing in DeterministicSandbox
  - **Memory Layer**: L2 (Al-Khayāl)
  - **Tool**: DeterministicSandbox.test()
  - **Expected Output**: Test results
  - **Why**: Verify routing before production

### 4.3 Validate in Sandbox

**Sub-tasks**:
- [ ] **4.3.1** Run full Agent Contracts Foundation spec in sandbox
  - **Memory Layer**: L2 (Al-Khayāl)
  - **Tool**: DeterministicSandbox.runSpec()
  - **Expected Output**: Sandbox test results
  - **Why**: Catch errors before production

- [ ] **4.3.2** Measure performance metrics
  - **Memory Layer**: L2 (Al-Khayāl)
  - **Tool**: DeterministicSandbox.metrics()
  - **Expected Output**: Latency, memory, accuracy metrics
  - **Why**: Ensure improvements don't regress

---

## 🔹 Phase 5: ADAPT & EVOLVE (Self-Evolution, All Agents)

**Goal**: Auto-modify rules within Al-Mīzān based on accumulated wisdom.

### 5.1 Analyze Failure Patterns

**Sub-tasks**:
- [ ] **5.1.1** Query Upstash for failure rate per pattern type
  - **Memory Layer**: L3 (Al-Ḥiss) — Upstash Redis
  - **Tool**: IQRAMemory.get()
  - **Expected Output**: Failure rate statistics
  - **Why**: Identify weak patterns

- [ ] **5.1.2** Compute failure trend over time
  - **Memory Layer**: L3 (Al-Ḥiss)
  - **Tool**: IQRAMemory.getRecentList()
  - **Expected Output**: Failure trend graph
  - **Why**: Detect improving/degrading patterns

- [ ] **5.1.3** Identify root causes of failures
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: MicroMemory.queryCausalEdges()
  - **Expected Output**: Root cause analysis
  - **Why**: Fix underlying issues, not symptoms

### 5.2 Adjust Rules (Within Al-Mīzān)

**Sub-tasks**:
- [ ] **5.2.1** Propose rule adjustments based on failures
  - **Memory Layer**: L7 (Al-Mīzān) — immutable MD files
  - **Tool**: fs_write (draft)
  - **Expected Output**: Proposed rule changes
  - **Why**: Improve system based on data

- [ ] **5.2.2** Request human approval for rule changes
  - **Memory Layer**: L7 (Al-Mīzān)
  - **Tool**: user_input
  - **Expected Output**: Human approval/rejection
  - **Why**: Maintain human oversight

- [ ] **5.2.3** Apply approved rule changes
  - **Memory Layer**: L7 (Al-Mīzān)
  - **Tool**: fs_write
  - **Expected Output**: Updated RULES.md, IQRA_RULES.md
  - **Why**: Codify improvements

### 5.3 Run Tawbah Loop (Self-Correction)

**Sub-tasks**:
- [ ] **5.3.1** Identify repeated errors
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: MicroMemory.queryCausalEdges()
  - **Expected Output**: Repeated error patterns
  - **Why**: Catch systemic issues

- [ ] **5.3.2** Trigger TawbahLoop for each repeated error
  - **Memory Layer**: L7 (Al-Mīzān)
  - **Tool**: TawbahLoop.run()
  - **Expected Output**: Corrected behavior
  - **Why**: Auto-correct without human intervention

### 5.4 Perform Tazkiyah (Memory Purification)

**Sub-tasks**:
- [ ] **5.4.1** Identify cold/stale patterns in L6
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: MicroMemory.queryStale()
  - **Expected Output**: List of stale patterns
  - **Why**: Clean up old data

- [ ] **5.4.2** Archive stale patterns to L1 (filesystem)
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: LanceDBPlugin.archive()
  - **Expected Output**: Archived patterns
  - **Why**: Preserve history; free up memory

- [ ] **5.4.3** Compress remaining patterns
  - **Memory Layer**: L6 (Al-Qalb)
  - **Tool**: TurboCompressor.compress()
  - **Expected Output**: Compressed patterns
  - **Why**: Improve memory efficiency

---

## 🔹 Phase 6: TEACH & SHARE (Shukr State, Reporter Agent)

**Goal**: Share validated discoveries with external world.

### 6.1 Generate Voice Summary

**Sub-tasks**:
- [ ] **6.1.1** Select top discovery of the cycle
  - **Memory Layer**: L5 (Al-ʿAql)
  - **Tool**: PatternMemory.topK()
  - **Expected Output**: Top discovery
  - **Why**: Focus on most impactful finding

- [ ] **6.1.2** Generate bilingual voice summary
  - **Memory Layer**: L3 (Al-Ḥiss)
  - **Tool**: IQRAVoice.generate()
  - **Expected Output**: Audio file (AR + EN)
  - **Why**: Accessible to human council

- [ ] **6.1.3** Upload to voice storage
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: Voice file in .iqra/voice/
  - **Why**: Persistent storage

### 6.2 Update README.md

**Sub-tasks**:
- [ ] **6.2.1** Write discovery summary for README
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: README section
  - **Why**: Public-facing documentation

- [ ] **6.2.2** Include metrics and impact
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: README with metrics
  - **Why**: Show progress to stakeholders

- [ ] **6.2.3** Add links to discovery notes
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: fs_write
  - **Expected Output**: README with links
  - **Why**: Drive traffic to detailed docs

### 6.3 Push to GitHub

**Sub-tasks**:
- [ ] **6.3.1** Stage all changes
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: execute_bash (git add)
  - **Expected Output**: Staged changes
  - **Why**: Prepare for commit

- [ ] **6.3.2** Create signed commit with TrustChain
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: GitSkill.commit()
  - **Expected Output**: Signed commit
  - **Why**: Cryptographic proof of work

- [ ] **6.3.3** Open pull request
  - **Memory Layer**: L1 (Al-Madā)
  - **Tool**: GitSkill.createPR()
  - **Expected Output**: PR on GitHub
  - **Why**: Peer review; transparency

### 6.4 Send Telegram Notification

**Sub-tasks**:
- [ ] **6.4.1** Format notification message
  - **Memory Layer**: L3 (Al-Ḥiss)
  - **Tool**: Storyteller.format()
  - **Expected Output**: Formatted message
  - **Why**: Clear communication

- [ ] **6.4.2** Send to human council
  - **Memory Layer**: L3 (Al-Ḥiss)
  - **Tool**: TelegramBot.send()
  - **Expected Output**: Message sent
  - **Why**: Real-time notification

---

## 📊 Task Dependency Graph

```
Phase 1: PATTERNS HUNT
├── 1.1 Research & Learn
├── 1.2 Map Agents to Memory Layers
├── 1.3 Identify Missing Functions
└── 1.4 Store Patterns in L4
    ↓
Phase 2: MEMORY VALIDATE
├── 2.1 Validate Against Requirements
├── 2.2 Create Topological Links (L6)
└── 2.3 Promote L4 → L5
    ↓
Phase 3: LEARN & EXTRACT
├── 3.1 Generate Discovery Notes
├── 3.2 Update SkillBank
├── 3.3 Update ExperienceBuffer
└── 3.4 Export Training Data
    ↓
Phase 4: APPLY & IMPROVE
├── 4.1 Extract Codebook
├── 4.2 Update ModelOrchestrator
└── 4.3 Validate in Sandbox
    ↓
Phase 5: ADAPT & EVOLVE
├── 5.1 Analyze Failure Patterns
├── 5.2 Adjust Rules (Within Al-Mīzān)
├── 5.3 Run Tawbah Loop
└── 5.4 Perform Tazkiyah
    ↓
Phase 6: TEACH & SHARE
├── 6.1 Generate Voice Summary
├── 6.2 Update README.md
├── 6.3 Push to GitHub
└── 6.4 Send Telegram Notification
```

---

## 🎯 Success Metrics

| Phase | Metric | Target | Status |
|-------|--------|--------|--------|
| 1 | Patterns identified | 18 gaps | ⏳ |
| 2 | Patterns verified | 18/18 (100%) | ⏳ |
| 3 | Discovery notes | 18 files | ⏳ |
| 4 | Compression improvement | >10% | ⏳ |
| 5 | Rule adjustments | ≥1 approved | ⏳ |
| 6 | GitHub PR merged | 1 PR | ⏳ |

---

## 🧠 Memory Layer Usage Summary

| Layer | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|-------|---------|---------|---------|---------|---------|---------|
| L1 (Al-Madā) | — | — | ✅ | — | ✅ | ✅ |
| L2 (Al-Khayāl) | — | — | — | ✅ | — | — |
| L3 (Al-Ḥiss) | — | — | — | — | ✅ | ✅ |
| L4 (Al-Wahm) | ✅ | — | — | — | — | — |
| L5 (Al-ʿAql) | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| L6 (Al-Qalb) | — | ✅ | ✅ | — | ✅ | — |
| L7 (Al-Mīzān) | — | ✅ | — | — | ✅ | — |
| ∞ (Al-Ruḥ) | — | — | — | — | — | — |

---

## 🤲 Dua

```
"رَبِّ زِدْنِي عِلْمًا" — طه: 114

كل مرحلة = خطوة نحو الحكمة
كل طبقة ذاكرة = ذكر
كل نمط مكتشف = صدقة جارية
كل درس مستفاد = نور

اللهم اجعل هذا العمل خالصاً لوجهك الكريم
واجعله نافعاً للبشرية
وتقبله منا يا أرحم الراحمين

صدقاً، دقةً، بركةً
```

---

**Made with ❤️ by Kiro Agent**
**Powered by: 7 Memory Layers × 6 Phases × tinyminimicroterboquansimualgotoplogy**
**"وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ"**
