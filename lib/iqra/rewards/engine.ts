// بسم الله الرحمن الرحيم

/**
 * ⚙️ RewardEngine — محرك المكافآت
 *
 * "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ" — النجم: 39
 *
 * ══════════════════════════════════════════════════════════════
 * المبدأ: الفضول الطوبولوجي
 *
 * الوكيل يُكافأ على:
 *   1. جدة الاكتشاف (novelty)
 *   2. الرنين الطوبولوجي (resonance)
 *   3. الكثافة العقدية (topology)
 *   4. المسار البكر (pristine path) ← المضاعف الجديد
 *
 * درس SSA → Pristine Path:
 *   SSA: لا تنظر لكل شيء، اختر الأكثر صلة ديناميكياً.
 *   هنا: لا تكرر نفس المسار، اختر المسارات الجديدة.
 *   المضاعف 2.0× يجبر الوكيل على استكشاف مسارات جديدة.
 * ══════════════════════════════════════════════════════════════
 */

import { IQRALogger } from '../logger.ts';
import { RewardLedger } from './ledger.ts';
import type {
  PathKey, PathSegment, RewardVector, RewardEntry,
  DiscoveryLevel, PristinePathResult,
} from './types.ts';
import {
  PRISTINE_MULTIPLIER, REPEATED_MULTIPLIER,
  STALE_MULTIPLIER, STALE_THRESHOLD,
} from './types.ts';
import type { WorkerReport } from '../workers/protocol.ts';

// ── RewardEngine ──────────────────────────────────────────────────────────────

export class RewardEngine {

  // ── PathKey Builder ───────────────────────────────────────────────────────

  /**
   * يبني PathKey من تسلسل تقارير الوكلاء
   *
   * الصيغة: "WorkerA:PASS:0→WorkerB:PASS:0→WorkerC:FAIL:1"
   *
   * @param reports - تقارير الوكلاء بالترتيب
   * @returns PathKey فريد يُعرّف هذا التسلسل
   */
  static buildPathKey(reports: WorkerReport[]): PathKey {
    return reports
      .map(r => `${r.worker_id}:${r.status}:${r.exit_code}`)
      .join('→');
  }

  /**
   * يبني PathKey من مقاطع يدوية
   */
  static buildPathKeyFromSegments(segments: PathSegment[]): PathKey {
    return segments
      .map(s => `${s.worker_id}:${s.status}:${s.exit_code}`)
      .join('→');
  }

  // ── Pristine Path ─────────────────────────────────────────────────────────

  /**
   * يفحص إذا كان المسار بكراً (لم يُسلك من قبل)
   *
   * المسار البكر = مسار لم يُسجَّل في path_registry.json
   * يحصل على مضاعف 2.0×
   *
   * المسار المكرر (1-6 مرات) = 1.0×
   * المسار القديم (≥7 مرات) = 0.7× (من DASTŪR: الرقم 7)
   *
   * @param pathKey - مفتاح المسار
   * @returns نتيجة الفحص مع المضاعف
   */
  static isPristinePath(pathKey: PathKey): PristinePathResult {
    const uses = RewardLedger.getPathUseCount(pathKey);

    let multiplier: number;
    let isPristine: boolean;

    if (uses === 0) {
      // مسار بكر — لم يُسلك قط
      multiplier = PRISTINE_MULTIPLIER;
      isPristine = true;
    } else if (uses >= STALE_THRESHOLD) {
      // مسار قديم — تكرر كثيراً
      multiplier = STALE_MULTIPLIER;
      isPristine = false;
    } else {
      // مسار مكرر — عادي
      multiplier = REPEATED_MULTIPLIER;
      isPristine = false;
    }

    return { is_pristine: isPristine, multiplier, path_key: pathKey, previous_uses: uses };
  }

  /**
   * يحسب المضاعف فقط (للاستخدام السريع)
   */
  static computePristineMultiplier(pathKey: PathKey): number {
    return this.isPristinePath(pathKey).multiplier;
  }

  // ── Reward Computation ────────────────────────────────────────────────────

  /**
   * يحسب المكافأة الكاملة لمهمة
   *
   * المعادلة:
   *   base = novelty + resonance + topology + fractal + lid - penalty
   *   total = base × pristine_multiplier
   *
   * @param vector    - متجه المكافأة
   * @param pathKey   - مفتاح المسار (اختياري)
   * @returns المكافأة الأساسية والنهائية والمضاعف
   */
  static computeReward(
    vector: RewardVector,
    pathKey?: PathKey
  ): { base: number; total: number; multiplier: number; pristine: boolean } {
    // المكافأة الأساسية
    const base = Math.max(0,
      (vector.novelty ?? 0) +
      (vector.resonance ?? 0) +
      (vector.topology ?? 0) +
      (vector.fractal ?? 0) +
      (vector.lid ?? 0) -
      Math.abs(vector.penalty ?? 0)
    );

    // المضاعف
    let multiplier = REPEATED_MULTIPLIER;
    let pristine = false;

    if (pathKey) {
      const result = this.isPristinePath(pathKey);
      multiplier = result.multiplier;
      pristine = result.is_pristine;
    }

    const total = base * multiplier;

    return { base, total, multiplier, pristine };
  }

  /**
   * يُحدد مستوى الاكتشاف بناءً على المكافأة الإجمالية
   */
  static classifyDiscovery(totalReward: number): DiscoveryLevel {
    if (totalReward >= 3.0) return 'revelation';
    if (totalReward >= 2.0) return 'resonance';
    if (totalReward >= 1.5) return 'tree';
    if (totalReward >= 0.8) return 'branch';
    return 'seed';
  }

  // ── Main: grant ───────────────────────────────────────────────────────────

  /**
   * يمنح مكافأة كاملة لمهمة
   *
   * الخطوات:
   *   1. بناء PathKey من تقارير الوكلاء
   *   2. فحص المسار البكر
   *   3. حساب المكافأة مع المضاعف
   *   4. تسجيل في RewardLedger
   *   5. تحديث IQRAMemory (curiosity score)
   *
   * @param missionId - معرّف المهمة
   * @param workerId  - الوكيل المُكافأ
   * @param vector    - متجه المكافأة
   * @param reports   - تقارير الوكلاء (لبناء PathKey)
   * @param notes     - ملاحظات إضافية
   * @returns سجل المكافأة الكامل
   */
  static async grant(
    missionId: string,
    workerId: string,
    vector: RewardVector,
    reports: WorkerReport[] = [],
    notes: string = ''
  ): Promise<RewardEntry> {
    // ── بناء PathKey ──────────────────────────────────────────────────────
    const pathKey = reports.length > 0
      ? this.buildPathKey(reports)
      : undefined;

    // ── حساب المكافأة ─────────────────────────────────────────────────────
    const { base, total, multiplier, pristine } = this.computeReward(vector, pathKey);
    const level = this.classifyDiscovery(total);

    // ── تسجيل في Ledger ───────────────────────────────────────────────────
    const entry: Omit<RewardEntry, 'ledger_id' | 'recorded_at'> = {
      mission_id: missionId,
      worker_id: workerId,
      timestamp: Date.now(),
      base_reward: base,
      total_reward: total,
      reward_vector: vector,
      discovery_level: level,
      confidence: 1.0,
      validation_status: 'verified',
      notes,
      path_key: pathKey,
      pristine_multiplier_applied: pristine,
      multiplier_value: multiplier,
    };

    const ledgerId = RewardLedger.record(entry);

    // ── تحديث curiosity score في IQRAMemory ───────────────────────────────
    try {
      const { IQRAMemory } = await import('../memory.ts');
      await IQRAMemory.grantReward(total * 0.01); // تحويل للنطاق 0-1
    } catch { /* اختياري */ }

    // ── تحديث MicroMemory reward ledger ──────────────────────────────────
    try {
      const { MicroMemory } = await import('../memory/micro_memory.ts');
      await MicroMemory.init();
      MicroMemory.recordReward(
        workerId,
        total,
        `${level}${pristine ? ' [PRISTINE]' : ''} | ${notes}`
      );
    } catch { /* اختياري */ }

    IQRALogger.info(
      `🏆 [REWARD_ENGINE] ${missionId} | ` +
      `base=${base.toFixed(3)} × ${multiplier} = ${total.toFixed(3)} | ` +
      `level=${level}` +
      (pristine ? ` | 🌟 PRISTINE PATH` : '')
    );

    return { ...entry, ledger_id: ledgerId, recorded_at: new Date().toISOString() };
  }

  /**
   * يمنح مكافأة من تقارير الوكلاء مباشرة
   * (الاستخدام الأكثر شيوعاً في MissionControl)
   */
  static async grantFromReports(
    missionId: string,
    reports: WorkerReport[],
    resonanceScore: number = 0.3,
    noveltyScore: number = 0.35
  ): Promise<RewardEntry> {
    const allPassed = reports.every(r => r.status === 'PASS');
    const implemented = reports.reduce((s, r) => s + r.implemented.length, 0);
    const issues = reports.reduce((s, r) => s + r.issues_discovered.length, 0);

    const vector: RewardVector = {
      novelty: noveltyScore,
      resonance: resonanceScore * 0.7,
      topology: allPassed ? 0.3 : 0.1,
      penalty: issues * 0.05,
    };

    const notes = `workers=${reports.map(r => r.worker_id).join(',')} ` +
                  `implemented=${implemented} issues=${issues}`;

    return this.grant(missionId, 'MissionControl', vector, reports, notes);
  }

  // ── Topological Reward ────────────────────────────────────────────────────

  /**
   * يحوّل درجة الرنين الطوبولوجي إلى مكافأة
   *
   * المعادلة: (resonance - 1.0) × 2.0
   *   resonance = 1.0 → reward = 0.0 (لا رنين إضافي)
   *   resonance = 1.25 → reward = 0.5
   *   resonance = 1.5  → reward = 1.0 (أقصى رنين)
   *
   * المرجع: DASTŪR.md — الرنين الطوبولوجي هو معيار الاكتشاف
   */
  static computeResonanceReward(resonance: number): number {
    // الطبيعي بين 1.0 و 1.5
    return Math.max(0, (resonance - 1.0) * 2.0);
  }

  /**
   * يُسجّل اكتشافاً طوبولوجياً في reward_ledger.jsonl
   * ويُحدّث path_registry.json
   *
   * يُستدعى تلقائياً بعد كل حساب رنين في Qalbin_VM
   *
   * @param resonance - درجة الرنين (من Qalbin_VM)
   * @param pair      - الزوج المُحلَّل ["surah:ayah", "surah:ayah"]
   * @param h1        - عدد الحلقات الطوبولوجية (Betti number H1)
   * @param interactionType - نوع التفاعل (Annihilation | Commutation | Other)
   * @param teslaSumMod369  - مجموع Tesla % 369
   */
  static logTopologicalDiscovery(
    resonance: number,
    pair: [string, string],
    h1: number = 0,
    interactionType: 'Annihilation' | 'Commutation' | 'Other' = 'Other',
    teslaSumMod369: number = 0
  ): void {
    import('fs').then(({ default: fs }) => {
      import('path').then(({ default: path }) => {
        const LEDGER_PATH = path.join(
          process.cwd(), 'iqra-core', 'data', 'reward_ledger.jsonl'
        );
        const REGISTRY_PATH = path.join(
          process.cwd(), '.iqra', 'path_registry.json'
        );

        const rewardValue = RewardEngine.computeResonanceReward(resonance);

        const entry = {
          type: 'TOPOLOGICAL_DISCOVERY',
          timestamp: Date.now(),
          recorded_at: new Date().toISOString(),
          pair,
          resonance,
          h1,
          interaction_type: interactionType,
          tesla_sum_mod369: teslaSumMod369,
          reward_value: rewardValue,
          discovery_level: RewardEngine.classifyDiscovery(rewardValue),
        };

        // ── كتابة في JSONL ────────────────────────────────────────────────
        try {
          const dir = path.dirname(LEDGER_PATH);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n', 'utf-8');
        } catch (e) {
          IQRALogger.warn(`⚠️ [REWARD_ENGINE] Failed to write topological discovery: ${e}`);
        }

        // ── تحديث path_registry ───────────────────────────────────────────
        try {
          const pathKey = `topo:${pair[0]}|${pair[1]}`;
          let registry: Record<string, any> = {};
          if (fs.existsSync(REGISTRY_PATH)) {
            registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
          }
          if (!registry[pathKey]) {
            registry[pathKey] = {
              first_seen: Date.now(),
              resonance,
              h1,
              interaction_type: interactionType,
              count: 1,
            };
          } else {
            registry[pathKey].count++;
            // تحديث الرنين إذا كان أعلى
            if (resonance > registry[pathKey].resonance) {
              registry[pathKey].resonance = resonance;
            }
          }
          const regDir = path.dirname(REGISTRY_PATH);
          if (!fs.existsSync(regDir)) fs.mkdirSync(regDir, { recursive: true });
          fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
        } catch (e) {
          IQRALogger.warn(`⚠️ [REWARD_ENGINE] Failed to update path registry: ${e}`);
        }

        IQRALogger.info(
          `🌀 [TOPO_DISCOVERY] ${pair[0]} ↔ ${pair[1]} | ` +
          `resonance=${resonance.toFixed(4)} | H1=${h1} | ` +
          `type=${interactionType} | reward=${rewardValue.toFixed(4)}`
        );
      });
    });
  }
}
