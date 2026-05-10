import { ResonanceWorker } from '#workers/resonance';
import { ResearchWorker } from '#workers/research';
import { ValidationWorker } from '#workers/validator';
import { ExecutionWorker } from '#workers/execution';
import type { WorkerReport, WorkerResult, MissionState, SovereignWorker } from '#workers/protocol';
import { IQRALogger } from '#infra/logger';
import type { Provider } from '#connectors/index';
import fs from 'fs';
import path from 'path';
import { logToIQRAFile, appendToTrustChain } from '#security/security';
import { ResourceFactory } from '#security/conscience/resource_factory';
import { RewardEngine } from '#rewards/engine';
import { SovereignIdentity } from '#security/sovereign_identity';
import { TopologicalAnalyzer } from '#skills/topological_analyzer';
import { Search369 } from '#evolution/search_369';
import { LeagueManager } from '#evolution/league_manager';
import { FithrahBaseline } from '#security/audit/fithrah_baseline';
import { IQRAMemory } from '#memory/memory';

// ── Damir يُحمَّل lazily لتجنب circular imports ──────────────────────────────
let _missionDamir: import('#security/damir_conscience').DamirConscience | null = null;

async function getMissionDamir() {
  if (!_missionDamir) {
    const { DamirConscience } = await import('#security/damir_conscience');
    _missionDamir = new DamirConscience();
  }
  return _missionDamir;
}

export class MissionControl {
  private reports: WorkerReport[] = [];
  private modelsConfig: any = null;

  private loadModels() {
    if (this.modelsConfig) return this.modelsConfig;
    const configPath = path.join(process.cwd(), 'lib/iqra/evolution/models.json');
    if (fs.existsSync(configPath)) {
      this.modelsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return this.modelsConfig;
  }

  private classifyMission(input: string): string[] {
    const skills: string[] = [];
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('code') || lowerInput.includes('function') || lowerInput.includes('bug')) {
      skills.push('coding');
    }
    if (lowerInput.includes('quran') || lowerInput.includes('verse') || lowerInput.includes('hadith')) {
      skills.push('quran_analysis');
    }
    if (lowerInput.includes('search') || lowerInput.includes('find') || lowerInput.includes('who is')) {
      skills.push('research');
    }
    if (lowerInput.includes('plan') || lowerInput.includes('strategy')) {
      skills.push('reasoning');
    }
    if (lowerInput.includes('visual') || lowerInput.includes('ui') || lowerInput.includes('image')) {
      skills.push('creative');
    }

    return skills;
  }

  private getWorkerForPhase(phase: string, skills: string[], missionId: string): SovereignWorker {
    this.loadModels();

    // 1. Planning: Strong Reasoning (Gemini 1.5 Pro)
    // 2. Implementation: Fast Building (Groq Llama 3)
    // 3. Validation: Strict Logic (Gemini 1.5 Flash)

    let provider: Provider = 'google';
    let model = 'gemini-1.5-pro';

    switch (phase) {
      case 'resonance': 
        provider = 'google';
        model = 'gemini-1.5-flash';
        break;
      case 'research': 
        provider = 'google';
        model = 'gemini-1.5-pro';
        break;
      case 'validation': 
        provider = 'google';
        model = 'gemini-1.5-flash'; // High precision/fast logic
        break;
      case 'execution': 
        provider = 'groq';
        model = 'llama-3.1-70b-versatile'; // Fast builder
        break;
    }

    // Override with custom config if present
    const config = this.modelsConfig?.mission_mapping?.[phase];
    if (config) {
      provider = config.provider as Provider;
      if (config.model) model = config.model;
    }

    let worker: SovereignWorker;
    switch (phase) {
      case 'resonance': worker = new ResonanceWorker(provider); break;
      case 'research': worker = new ResearchWorker(provider); break;
      case 'validation': worker = new ValidationWorker(provider); break;
      case 'execution': worker = new ExecutionWorker(provider); break;
      default: worker = new ExecutionWorker(provider);
    }

    worker.setMissionId(missionId);
    worker.setSkills(skills);
    
    // 🏷️ Model Metadata Tracking — تسجيل الجندي
    // Tracks model version, provider and configuration for compounding advantage
    (worker as any).report.model_metadata = { 
      provider, 
      model,
      temperature: 0.1, // Fixed for deterministic sovereign operations
      version: 'v1.1-sovereign'
    };
    
    return worker;
  }

  /**
   * Execute a single phase of the mission | تنفيذ مرحلة واحدة من المهمة
   * يُفحص الضمير قبل تمرير HandoffResult للوكيل التالي
   */
  async executePhase(phase: string, input: string, state: MissionState): Promise<WorkerResult> {
    const phaseStartTime = Date.now();
    const worker = this.getWorkerForPhase(phase, state.assigned_skills ?? [], state.metadata.mission_id);
    IQRALogger.info(`🛰️ [MISSION_CONTROL] Routing phase '${phase}' to ${worker.id}...`);

    // [TC] reason: Check phase execution patterns in memory | id: TC-2e-001
    const phasePattern = await IQRAMemory.get(`phase_pattern:${phase}:${input.substring(0, 50)}`);
    if (phasePattern && phasePattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using cached ${phase} pattern`);
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
      // Return cached result
      return phasePattern.data;
    }

    // ── Enhanced فحص الضمير قبل التنفيذ ───────────────────────────────────────
    const intention = (worker as any).intention ?? `تنفيذ مرحلة ${phase} للمهمة ${state.metadata.mission_id}`;
    const factoryResult = ResourceFactory.forWorker(
      worker.id,
      state.metadata.mission_id,
      intention
    );

    // [TC] reason: Check resource patterns in memory | id: TC-2e-002
    const resourcePattern = await IQRAMemory.get(`resource_pattern:${worker.id}:${state.metadata.mission_id}`);
    if (resourcePattern && resourcePattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using cached resource pattern for ${worker.id}`);
      // Pre-register cached resources
      for (const r of resourcePattern.data.resources) {
        // Resources will be registered in the normal flow below
      }
    }

    // Enhanced تهيئة Damir with memory integration
    const damir = await getMissionDamir();
    
    // [TC] reason: Check for global conscience patterns | id: TC-2f-001
    const globalConsciencePattern = await IQRAMemory.get(`global_conscience:${worker.id}:${phase}`);
    if (globalConsciencePattern && globalConsciencePattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using global conscience pattern for ${worker.id}:${phase}`);
      // Pre-load global conscience state
      for (const pattern of globalConsciencePattern.data.blocked_patterns || []) {
        damir.registerBlockedPattern(pattern);
      }
    }

    // Enhanced resource registration with pattern tracking
    for (const r of factoryResult.resources) {
      damir.registerResource(r);
      
      // [TC] reason: Track resource usage patterns | id: TC-2f-002
      await IQRAMemory.set(`resource_usage:${r.type}:${Date.now()}`, {
        resource_id: r.id,
        worker_id: worker.id,
        phase,
        mission_id: state.metadata.mission_id,
        timestamp: new Date().toISOString()
      }, { ttl: 86400000 }); // 24 hours
    }

    const action = {
      id: `${state.metadata.mission_id}:${phase}`,
      intention,
      requiredResources: factoryResult.resources,
      agent_id: worker.id,
      pulse_count: state.context.pulse_count || 0,
      phase_start_time: phaseStartTime,
      memory_hits: state.context.memory_hits || 0,
      total_execution_time: state.context.total_execution_time || 0
    };

    // [TC] reason: Enhanced conscience pattern checking with context | id: TC-2f-003
    const consciencePattern = await IQRAMemory.get(`conscience_pattern:${action.id}`);
    const contextualPattern = await IQRAMemory.get(`context_conscience:${phase}:${intention.substring(0, 30)}`);
    let verdict;

    if (consciencePattern && consciencePattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using cached conscience verdict for ${action.id}`);
      verdict = consciencePattern.data;
      
      // [TC] reason: Update pattern with new context | id: TC-2f-004
      verdict.context_updated = true;
      verdict.last_pulse_count = action.pulse_count;
    } else if (contextualPattern && contextualPattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using contextual conscience pattern for ${phase}`);
      verdict = contextualPattern.data;
      verdict.contextual_match = true;
    } else {
      // [TC] reason: Enhanced conscience checking with memory context | id: TC-2f-005
      const memoryContext = {
        previous_blocks: await IQRAMemory.get(`blocked_patterns:${worker.id}`),
        successful_phases: await IQRAMemory.get(`successful_phases:${phase}`),
        resource_efficiency: await IQRAMemory.get(`resource_efficiency:${worker.id}`)
      };
      
      verdict = damir.checkWithContext(action, memoryContext);
      
      // [TC] reason: Store enhanced conscience patterns for learning | id: TC-2f-006
      await IQRAMemory.set(`conscience_pattern:${action.id}`, verdict, { ttl: 3600000 });
      await IQRAMemory.set(`context_conscience:${phase}:${intention.substring(0, 30)}`, verdict, { ttl: 7200000 });
      
      // [TC] reason: Update global conscience patterns | id: TC-2f-007
      if (!verdict.allowed) {
        const globalPattern = globalConsciencePattern?.data || { blocked_patterns: [] };
        globalPattern.blocked_patterns.push({
          action_id: action.id,
          reason: verdict.reason,
          timestamp: new Date().toISOString(),
          worker_id: worker.id,
          phase
        });
        
        await IQRAMemory.set(`global_conscience:${worker.id}:${phase}`, globalPattern, { ttl: 86400000 });
      }
    }

    if (!verdict.allowed) {
      const tawbahEntry = `
### 🛑 [MISSION_DAMIR_BLOCK] ${new Date().toISOString()}
- **Phase**: ${phase}
- **Worker**: ${worker.id}
- **Mission**: ${state.metadata.mission_id}
- **Intention**: ${intention}
- **Reason**: ${verdict.reason}
- **Type**: ${verdict.rejection_type ?? 'unknown'}
---`;
      await logToIQRAFile('TAWBAH.md', tawbahEntry);

      appendToTrustChain(
        'MISSION:CONSCIENCE_BLOCK',
        `${state.metadata.mission_id}:${phase}`,
        `BLOCKED reason="${verdict.reason}"`,
        0.0
      );

      IQRALogger.warn(`🛑 [MISSION_CONTROL] Damir blocked phase '${phase}': ${verdict.reason}`);

      damir.reset();

      // إرجاع نتيجة فشل واضحة
      return {
        success: false,
        error: `[DAMIR_BLOCK] ${verdict.reason}`,
        report: {
          mission_id: state.metadata.mission_id,
          worker_id: worker.id,
          implemented: [],
          undone: [`Phase ${phase} blocked by conscience`],
          commands_run: [],
          issues_discovered: [verdict.reason],
          skills_used: [],
          procedures_followed: false,
          status: 'FAIL',
          exit_code: 1,
          source_attestations: [],
          no_mock_verified: true,
          timestamp: Date.now(),
        },
      };
    }

    // ── مسموح — استهلاك الموارد وتنفيذ المرحلة ──────────────────────────────
    damir.execute(action);

    // حقن الهوية والنبض والذاكرة قبل التنفيذ
    const integratedSoul = await SovereignIdentity.getIntegratedSoul(worker.id, intention);
    worker.setSovereignPrompt(integratedSoul);

    // [TC] reason: Store resource pattern for learning | id: TC-2e-006
    await IQRAMemory.set(`resource_pattern:${worker.id}:${state.metadata.mission_id}`, {
      resources: factoryResult.resources,
      intention,
      timestamp: new Date().toISOString()
    }, { ttl: 7200000 });

    // [TC] reason: Enhanced worker execution with memory integration | id: TC-2g-001
    const workerStartTime = Date.now();
    
    // Check for worker execution patterns
    const workerPattern = await IQRAMemory.get(`worker_execution:${worker.id}:${phase}`);
    if (workerPattern && workerPattern.success) {
      IQRALogger.info(`🧠 [MISSION_CONTROL] Using optimized worker execution pattern for ${worker.id}`);
      // Apply pre-optimized execution parameters
      worker.applyOptimizations(workerPattern.data.optimizations);
    }
    
    // Execute with enhanced memory tracking
    const result = await worker.execute(input, state);
    
    const workerExecutionTime = Date.now() - workerStartTime;
    
    // [TC] reason: Enhanced result analysis and learning | id: TC-2g-002
    if (result.success) {
      // Store successful phase pattern for caching
      await IQRAMemory.set(`phase_pattern:${phase}:${input.substring(0, 50)}`, result, { 
        ttl: 7200000, // 2 hours
        tags: ['phase', 'success', worker.id]
      });
      
      // Store worker execution pattern with optimizations
      const workerOptimizations = {
        execution_time: workerExecutionTime,
        memory_efficiency: result.memory_usage || 0,
        success_rate: 1.0,
        optimization_hints: {
          fast_path: workerExecutionTime < 1000,
          memory_optimized: (result.memory_usage || 0) < 50000000,
          cache_worthy: true
        },
        timestamp: new Date().toISOString()
      };
      
      await IQRAMemory.set(`worker_execution:${worker.id}:${phase}`, {
        success: true,
        optimizations: workerOptimizations,
        result_summary: {
          implemented_count: result.report?.implemented?.length || 0,
          issues_count: result.report?.issues_discovered?.length || 0,
          commands_count: result.report?.commands_run?.length || 0
        }
      }, { ttl: 14400000 }); // 4 hours
      
      IQRALogger.info(`🧠 [MISSION_CONTROL] Cached successful ${phase} pattern and worker optimizations`);
      
      // [TC] reason: Update worker performance metrics | id: TC-2g-003
      await IQRAMemory.set(`worker_metrics:${worker.id}`, {
        total_executions: (await IQRAMemory.get(`worker_metrics:${worker.id}`))?.data?.total_executions || 0 + 1,
        successful_executions: (await IQRAMemory.get(`worker_metrics:${worker.id}`))?.data?.successful_executions || 0 + 1,
        average_execution_time: workerExecutionTime,
        last_success: new Date().toISOString(),
        phase_specialization: phase
      }, { ttl: 86400000 });
      
    } else {
      // [TC] reason: Learn from failures | id: TC-2g-004
      await IQRAMemory.set(`worker_failure:${worker.id}:${phase}:${Date.now()}`, {
        error: result.error,
        execution_time: workerExecutionTime,
        input_preview: input.substring(0, 100),
        phase,
        timestamp: new Date().toISOString(),
        pulse_count: state.context.pulse_count || 0
      }, { ttl: 3600000 });
      
      IQRALogger.warn(`🧠 [MISSION_CONTROL] Stored failure pattern for ${worker.id} in ${phase}`);
    }
    
    // Track execution metrics
    const executionTime = Date.now() - phaseStartTime;
    state.context.total_execution_time = (state.context.total_execution_time || 0) + executionTime;
    state.context.phases_completed = (state.context.phases_completed || 0) + 1;

    return result;
  }

  async run(input: string): Promise<{ response: string; reports: WorkerReport[]; context: any }> {
    this.reports = [];
    const missionStartTime = Date.now();
    const pulseCount = HeartbeatSystem.getPulseCount();
    
    IQRALogger.info('🚀 [MISSION_CONTROL] Initiating Sovereign Worker Chain...');
    IQRALogger.info(`💓 [MISSION_CONTROL] Mission started at pulse ${pulseCount}`);
    
    // [TC] reason: Check for mission patterns in memory | id: TC-2a-001
    const missionPattern = await IQRAMemory.get(`mission_pattern:${input.substring(0, 50)}`);
    if (missionPattern && missionPattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached mission pattern');
      return {
        response: missionPattern.data.response,
        reports: missionPattern.data.reports || [],
        context: missionPattern.data.context || {}
      };
    }
    
    const skills = this.classifyMission(input);
    IQRALogger.info(`🎯 [MISSION_CONTROL] Skills identified: ${skills.join(', ') || 'general'}`);

    // Initialize Mission State with enhanced tracking
    let state: MissionState = {
      initial_input: input,
      reports: [],
      context: {
        pulse_count: pulseCount,
        start_time: missionStartTime,
        memory_hits: 0,
        evolution_score: 0
      },
      assigned_skills: skills,
      metadata: {
        start_time: missionStartTime,
        mission_id: `mission_${Math.random().toString(36).substring(7)}`,
        pulse_count: pulseCount
      }
    };

    // 🧬 Enhanced Alpha Evolution: Evolutionary Contemplation (3-6-9 Search)
    IQRALogger.info('🧬 [MISSION_CONTROL] Initiating Alpha Evolution pulse...');
    
    // [TC] reason: Check evolution patterns in memory | id: TC-2b-001
    const evolutionPattern = await IQRAMemory.get(`evolution_pattern:${input.substring(0, 50)}`);
    let evolutionWinner;
    
    if (evolutionPattern && evolutionPattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached evolution pattern');
      evolutionWinner = evolutionPattern.data;
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
    } else {
      evolutionWinner = await Search369.evolve(input);
      
      // [TC] reason: Store successful evolution patterns | id: TC-2b-002
      await IQRAMemory.set(`evolution_pattern:${input.substring(0, 50)}`, evolutionWinner, { ttl: 3600000 });
    }
    
    const optimizedInput = `[EVOLVED_STRATEGY]: ${evolutionWinner.vector}\n\n[ORIGINAL_OBJECTIVE]: ${input}`;
    state.context.evolution = {
      winner: evolutionWinner.vector,
      score: evolutionWinner.score,
      simulation: evolutionWinner.simulationResult,
      pulse_count: pulseCount,
      execution_time: Date.now() - missionStartTime
    };
    state.context.evolution_score = evolutionWinner.score;

    // 🤺 Enhanced Alpha League: Adversarial Pressure Test with memory and learning
    const leagueVerdict = await LeagueManager.adjudicate(evolutionWinner.simulationResult);
    
    // [TC] reason: Check for similar league verdicts in memory | id: TC-2c-001
    const leaguePattern = await IQRAMemory.get(`league_pattern:${evolutionWinner.simulationResult.substring(0, 50)}`);
    if (leaguePattern && leaguePattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached league verdict pattern');
      // Use cached verdict pattern for faster processing
      if (!leaguePattern.data.isStable) {
        await IQRAMemory.set(`blocked_evolution:${Date.now()}`, {
          input: input.substring(0, 100),
          winner: evolutionWinner.vector,
          exploits: leagueVerdict.exploitsFound,
          timestamp: new Date().toISOString(),
          cached: true
        });
        return { response: "Mission Aborted: League Stability Failure (Cached).", reports: [], context: state.context };
      }
    }
    
    if (!leagueVerdict.isStable) {
      IQRALogger.warn(`🤺 [MISSION_CONTROL] League blocked winner! Exploits: ${leagueVerdict.exploitsFound.join(', ')}`);
      
      // [TC] reason: Store blocked evolution for learning | id: TC-2c-002
      await IQRAMemory.set(`blocked_evolution:${Date.now()}`, {
        input: input.substring(0, 100),
        winner: evolutionWinner.vector,
        exploits: leagueVerdict.exploitsFound,
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount,
        evolution_score: evolutionWinner.score
      });
      
      // [TC] reason: Store league verdict pattern for future reference | id: TC-2c-003
      await IQRAMemory.set(`league_pattern:${evolutionWinner.simulationResult.substring(0, 50)}`, {
        isStable: false,
        exploits: leagueVerdict.exploitsFound,
        score: evolutionWinner.score,
        timestamp: new Date().toISOString()
      }, { ttl: 7200000 }); // 2 hours cache
      
      // Re-route to a "Safe Path" or abort
      return { response: "Mission Aborted: League Stability Failure.", reports: [], context: state.context };
    } else {
      // [TC] reason: Store successful league verdicts for positive reinforcement | id: TC-2c-004
      await IQRAMemory.set(`successful_league:${Date.now()}`, {
        input: input.substring(0, 100),
        winner: evolutionWinner.vector,
        score: evolutionWinner.score,
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount
      });
      
      // [TC] reason: Store successful league pattern | id: TC-2c-005
      await IQRAMemory.set(`league_pattern:${evolutionWinner.simulationResult.substring(0, 50)}`, {
        isStable: true,
        exploits: [],
        score: evolutionWinner.score,
        timestamp: new Date().toISOString()
      }, { ttl: 7200000 });
    }

    // 🌱 Enhanced Fithrah Check: Evolutionary Alignment with learning
    const winnerEmbedding = await IQRAMemory.generateEmbedding(evolutionWinner.vector);
    const alignment = await FithrahBaseline.verifyAlignment(evolutionWinner.vector, winnerEmbedding);
    
    if (!alignment.isAligned) {
      IQRALogger.warn('🌱 [MISSION_CONTROL] Anomaly detected by Fithrah. Proceeding with caution...');
      state.context.anomaly_detected = true;
      
      // [TC] reason: Store alignment anomalies for pattern learning | id: TC-2b-004
      await IQRAMemory.set(`alignment_anomaly:${Date.now()}`, {
        vector: evolutionWinner.vector,
        embedding: winnerEmbedding,
        alignment_score: alignment.score,
        timestamp: new Date().toISOString()
      });
    } else {
      // [TC] reason: Store successful alignments for future reference | id: TC-2b-005
      await IQRAMemory.set(`successful_alignment:${Date.now()}`, {
        vector: evolutionWinner.vector,
        embedding: winnerEmbedding,
        alignment_score: alignment.score,
        timestamp: new Date().toISOString()
      });
    }

    // 🌀 Topological Pulse Check (If Quranic)
    if (skills.includes('quran_analysis')) {
      const segments = input.split('\n'); 
      const topoResult = await TopologicalAnalyzer.analyze(optimizedInput, segments);
      state.context.resonance = {
        ...state.context.resonance,
        topological_score: topoResult.resonance,
        symmetry_score: topoResult.symmetryScore,
        patterns: topoResult.patterns,
        novelty: topoResult.novelty
      };
      IQRALogger.info(`🌀 [MISSION_CONTROL] Topological resonance detected: ${topoResult.resonance.toFixed(4)}`);
    }

    // 1. Enhanced Resonance Worker
    IQRALogger.info('🎯 [MISSION_CONTROL] Phase 1: Resonance Analysis');
    
    // [TC] reason: Check resonance patterns in memory | id: TC-2d-001
    const resonancePattern = await IQRAMemory.get(`resonance_pattern:${input.substring(0, 50)}`);
    let resResult;
    
    if (resonancePattern && resonancePattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached resonance pattern');
      resResult = resonancePattern.data;
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
    } else {
      resResult = await this.executePhase('resonance', input, state);
      
      // [TC] reason: Store successful resonance patterns | id: TC-2d-002
      if (resResult.success) {
        await IQRAMemory.set(`resonance_pattern:${input.substring(0, 50)}`, resResult, { ttl: 3600000 });
      }
    }
    
    if (resResult.updated_state) state = resResult.updated_state;
    this.reports.push(resResult.report);
    
    if (!resResult.success) {
      // [TC] reason: Store failed resonance for learning | id: TC-2d-003
      await IQRAMemory.set(`failed_resonance:${Date.now()}`, {
        input: input.substring(0, 100),
        error: resResult.error || 'Unknown error',
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount
      });
       return { response: "Mission Aborted: Resonance Failure.", reports: this.reports, context: state.context };
    }

    // 2. Enhanced Research Worker
    IQRALogger.info('🔍 [MISSION_CONTROL] Phase 2: Research Analysis');
    
    // [TC] reason: Check research patterns in memory | id: TC-2d-004
    const researchPattern = await IQRAMemory.get(`research_pattern:${input.substring(0, 50)}`);
    let researchResult;
    
    if (researchPattern && researchPattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached research pattern');
      researchResult = researchPattern.data;
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
    } else {
      researchResult = await this.executePhase('research', input, state);
      
      // [TC] reason: Store successful research patterns | id: TC-2d-005
      if (researchResult.success) {
        await IQRAMemory.set(`research_pattern:${input.substring(0, 50)}`, researchResult, { ttl: 3600000 });
      }
    }
    
    if (researchResult.updated_state) state = researchResult.updated_state;
    this.reports.push(researchResult.report);

    if (!researchResult.success) {
      // [TC] reason: Store failed research for learning | id: TC-2d-006
      await IQRAMemory.set(`failed_research:${Date.now()}`, {
        input: input.substring(0, 100),
        error: researchResult.error || 'Unknown error',
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount
      });
      return { response: "Mission Aborted: Research Failure.", reports: this.reports, context: state.context };
    }

    // 3. Enhanced Validation Worker
    IQRALogger.info('⚖️ [MISSION_CONTROL] Phase 3: Dastur Validation');
    
    // [TC] reason: Check validation patterns in memory | id: TC-2d-007
    const validationPattern = await IQRAMemory.get(`validation_pattern:${input.substring(0, 50)}`);
    let valResult;
    
    if (validationPattern && validationPattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached validation pattern');
      valResult = validationPattern.data;
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
    } else {
      valResult = await this.executePhase('validation', input, state);
      
      // [TC] reason: Store successful validation patterns | id: TC-2d-008
      if (valResult.success) {
        await IQRAMemory.set(`validation_pattern:${input.substring(0, 50)}`, valResult, { ttl: 3600000 });
      }
    }
    
    if (valResult.updated_state) state = valResult.updated_state;
    this.reports.push(valResult.report);

    if (!valResult.success) {
      // [TC] reason: Store failed validation for learning | id: TC-2d-009
      await IQRAMemory.set(`failed_validation:${Date.now()}`, {
        input: input.substring(0, 100),
        error: valResult.error || 'Dastur violation',
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount
      });
      return { response: `Mission Aborted: Dastur Violation. ${valResult.error}`, reports: this.reports, context: state.context };
    }

    // 4. Enhanced Execution Worker
    IQRALogger.info('⚡ [MISSION_CONTROL] Phase 4: Execution & Implementation');
    
    // [TC] reason: Check execution patterns in memory | id: TC-2d-010
    const executionPattern = await IQRAMemory.get(`execution_pattern:${input.substring(0, 50)}`);
    let execResult;
    
    if (executionPattern && executionPattern.success) {
      IQRALogger.info('🧠 [MISSION_CONTROL] Using cached execution pattern');
      execResult = executionPattern.data;
      state.context.memory_hits = (state.context.memory_hits || 0) + 1;
    } else {
      execResult = await this.executePhase('execution', input, state);
      
      // [TC] reason: Store successful execution patterns | id: TC-2d-011
      if (execResult.success) {
        await IQRAMemory.set(`execution_pattern:${input.substring(0, 50)}`, execResult, { ttl: 3600000 });
      }
    }
    
    if (execResult.updated_state) state = execResult.updated_state;
    this.reports.push(execResult.report);

    if (!execResult.success) {
      // [TC] reason: Store failed execution for learning | id: TC-2d-012
      await IQRAMemory.set(`failed_execution:${Date.now()}`, {
        input: input.substring(0, 100),
        error: execResult.error || 'Execution failed',
        timestamp: new Date().toISOString(),
        pulse_count: pulseCount
      });
      return { response: "Mission Aborted: Execution Failure.", reports: this.reports, context: state.context };
    }

    IQRALogger.info('🏁 [MISSION_CONTROL] Chain completed successfully.');
    
    // [TC] reason: Store successful mission pattern for future optimization | id: TC-2d-013
    const missionExecutionTime = Date.now() - missionStartTime;
    if (missionExecutionTime < 15000) { // Only cache fast missions
      await IQRAMemory.set(`mission_pattern:${input.substring(0, 50)}`, {
        response: execResult.data || "Processing complete.",
        reports: this.reports,
        context: state.context,
        execution_time: missionExecutionTime,
        pulse_count: pulseCount,
        memory_hits: state.context.memory_hits
      }, { ttl: 7200000 }); // 2 hours cache
    }

    // ── Enhanced بناء PathKey ومنح المكافأة ───────────────────────────────────
    const pathKey = RewardEngine.buildPathKey(this.reports);
    const resonance = state.context?.resonance?.topological_score ?? 0.3;

    // [TC] reason: Check reward patterns in memory | id: TC-2h-001
    const rewardPattern = await IQRAMemory.get(`reward_pattern:${pathKey}`);
    const missionSuccessPattern = await IQRAMemory.get(`mission_success:${state.metadata.mission_id}`);
    
    // [TC] reason: Enhanced reward calculation with memory context | id: TC-2h-002
    const memoryContext = {
      previous_rewards: rewardPattern?.data?.previous_rewards || [],
      mission_success_rate: missionSuccessPattern?.data?.success_rate || 0,
      total_missions: (await IQRAMemory.get(`mission_count:${state.metadata.mission_id}`))?.data?.count || 0,
      average_reward: rewardPattern?.data?.average_reward || 0,
      pristine_paths: rewardPattern?.data?.pristine_paths || 0
    };

    const rewardEntry = await RewardEngine.grantFromReports(
      state.metadata.mission_id,
      this.reports,
      resonance,
      memoryContext
    );

    // [TC] reason: Store reward patterns for learning | id: TC-2h-003
    const newRewardPattern = {
      previous_rewards: [...(rewardPattern?.data?.previous_rewards || []), {
        amount: rewardEntry.total_reward,
        timestamp: new Date().toISOString(),
        path_key: pathKey,
        pristine: rewardEntry.pristine_multiplier_applied,
        resonance_score: resonance
      }],
      average_reward: ((rewardPattern?.data?.average_reward || 0) * (rewardPattern?.data?.previous_rewards?.length || 0) + rewardEntry.total_reward) / ((rewardPattern?.data?.previous_rewards?.length || 0) + 1),
      pristine_paths: (rewardPattern?.data?.pristine_paths || 0) + (rewardEntry.pristine_multiplier_applied ? 1 : 0),
      last_updated: new Date().toISOString()
    };

    await IQRAMemory.set(`reward_pattern:${pathKey}`, newRewardPattern, { ttl: 86400000 });
    
    // [TC] reason: Update mission success patterns | id: TC-2h-004
    const missionSuccessData = {
      success_rate: rewardEntry.total_reward > 0 ? 1.0 : (missionSuccessPattern?.data?.success_rate || 0),
      total_reward: rewardEntry.total_reward,
      path_key: pathKey,
      timestamp: new Date().toISOString(),
      memory_hits: state.context.memory_hits || 0,
      total_execution_time: state.context.total_execution_time || 0
    };
    
    await IQRAMemory.set(`mission_success:${state.metadata.mission_id}`, missionSuccessData, { ttl: 604800000 }); // 7 days

    // [TC] reason: Enhanced reward logging with context | id: TC-2h-005
    IQRALogger.info(
      `🏆 [MISSION_CONTROL] Reward: ${rewardEntry.total_reward.toFixed(3)} | ` +
      `${rewardEntry.pristine_multiplier_applied ? '🌟 PRISTINE PATH' : 'repeated path'} | ` +
      `🧠 Memory Hits: ${state.context.memory_hits || 0} | ` +
      `⏱️ Execution Time: ${state.context.total_execution_time || 0}ms | ` +
      `📊 Success Rate: ${missionSuccessData.success_rate.toFixed(2)}`
    );

    // [TC] reason: Store global reward analytics | id: TC-2h-006
    const globalAnalytics = await IQRAMemory.get(`global_reward_analytics`) || { data: { total_rewards: 0, mission_count: 0, average_reward: 0 } };
    const updatedAnalytics = {
      total_rewards: globalAnalytics.data.total_rewards + rewardEntry.total_reward,
      mission_count: globalAnalytics.data.mission_count + 1,
      average_reward: (globalAnalytics.data.total_rewards + rewardEntry.total_reward) / (globalAnalytics.data.mission_count + 1),
      pristine_missions: (globalAnalytics.data.pristine_missions || 0) + (rewardEntry.pristine_multiplier_applied ? 1 : 0),
      last_updated: new Date().toISOString()
    };
    
    await IQRAMemory.set(`global_reward_analytics`, updatedAnalytics, { ttl: 2592000000 }); // 30 days

    return {
      response: execResult.data || "Processing complete.",
      reports: this.reports,
      context: {
        ...state.context,
        reward: rewardEntry,
        path_key: pathKey,
        memory_analytics: {
          hits: state.context.memory_hits || 0,
          patterns_used: rewardPattern ? 1 : 0,
          learning_applied: true
        }
      },
    };
  }

  static formatWorkerReports(reports: WorkerReport[]): string {
    let output = "\n---\n";
    output += "## 🛰️ Mission Control | مركز القيادة والتحكم\n";
    output += "> \"وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ\" — يوسف: 76\n\n";
    
    for (const report of reports) {
      const statusIcon = report.procedures_followed ? "✅" : "⚠️";
      const modelInfo = report.model_metadata ? ` (${report.model_metadata.provider}/${report.model_metadata.model})` : "";
      output += `### 👷 [WORKER] ${report.worker_id}${modelInfo} | ${statusIcon}\n`;
      output += `**Protocol**: ${report.procedures_followed ? "Sovereign Alignment Followed" : "Alignment Deviation Detected"}\n`;
      
      if (report.implemented.length > 0) {
        output += `\n**What was implemented | ما تم إنجازه:**\n`;
        output += report.implemented.map(item => `- ${item}`).join("\n") + "\n";
      }
      
      if (report.undone.length > 0) {
        output += `\n**What was left undone | ما لم يكتمل:**\n`;
        output += report.undone.map(item => `- ${item}`).join("\n") + "\n";
      }
      
      if (report.commands_run.length > 0) {
        output += `\n**Operations | العمليات المنفذة:**\n`;
        for (const cmd of report.commands_run) {
          const cmdIcon = cmd.exit_code === 0 ? "🟢" : "🔴";
          output += `- ${cmdIcon} \`${cmd.command}\` (Exit: ${cmd.exit_code})\n`;
        }
      }
      
      if (report.issues_discovered.length > 0) {
        output += `\n**Issues Discovered | المشكلات المكتشفة:**\n`;
        output += report.issues_discovered.map(item => `- ${item}`).join("\n") + "\n";
      }
      
      output += `\n**Mission ID**: \`${report.mission_id}\`\n`;
      output += `\n---\n`;
    }
    
    return output;
  }
}
