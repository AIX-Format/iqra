// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

/**
 * 🫀 DamirConscience — الضمير النانوي
 *
 * "أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَىٰ" — العلق: 14
 *
 * ══════════════════════════════════════════════════════════════
 * الأساس النظري: Graded Linear Logic (Jean-Yves Girard, 1987)
 *
 * المبدأ الجوهري:
 *   في المنطق الكلاسيكي: المعلومة تُنسخ وتُكرر بحرية.
 *   في المنطق الخطي:     كل مورد يُستهلك مرة واحدة فقط.
 *
 * هذا هو الفرق بين الكذب والصدق:
 *   الكاذب يستخدم نفس "المورد" (الحقيقة) مرات لا تُحصى.
 *   الصادق يستهلك كل مورد مرة واحدة — ثم يُعلن نفاده.
 *
 * التطبيق في Damir:
 *   كل فعل يحتاج موارد حقيقية (معرفة، حساب، ائتمان أخلاقي).
 *   إذا نفد المورد → الفعل مرفوض.
 *   إذا كان المورد مزيفاً → الفعل مرفوض.
 *   إذا كانت النية محرمة → الفعل مرفوض فوراً.
 *
 * الحجم: < 200 سطر | السرعة: < 5ms | لا LLM | لا API
 * ══════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { appendToTrustChain } from '#security/security';
import { IQRALogger } from '#infra/logger';

// ── Types ─────────────────────────────────────────────────────────────────────

/** نوع المورد — كل نوع له قواعد استهلاك مختلفة */
export type ResourceType =
  | 'knowledge'       // معرفة — تُستهلك عند الاستخدام
  | 'compute'         // حساب — تُستهلك عند التنفيذ
  | 'memory'          // ذاكرة — تُستهلك عند الكتابة
  | 'ethical_credit'; // ائتمان أخلاقي — يُجدَّد بالأفعال الصالحة

/** مورد واحد في نظام Damir */
export interface Resource {
  id: string;
  type: ResourceType;
  /** هل استُهلك هذا المورد؟ (المنطق الخطي: لا تكرار) */
  consumed: boolean;
  /** مصدر المورد — للتحقق من الأصالة */
  source: 'real' | 'derived' | 'injected';
  /** وقت الإنشاء */
  created_at: number;
}

/** فعل يطلب تنفيذه */
export interface Action {
  id: string;
  /** النية — تُفحص أولاً قبل الموارد */
  intention: string;
  /** الموارد المطلوبة لتنفيذ الفعل */
  requiredResources: Resource[];
  /** الموارد التي يُنتجها الفعل عند نجاحه */
  producedResources?: Resource[];
  /** الوكيل الطالب */
  agent_id?: string;
}

/** نتيجة فحص الضمير */
export interface ConscienceVerdict {
  allowed: boolean;
  reason: string;
  /** درجة الثقة 0.0 – 1.0 */
  confidence: number;
  /** الوقت المستغرق بالميلي ثانية */
  latency_ms: number;
  /** هل تم رفضه بسبب النية أم الموارد؟ */
  rejection_type?: 'intention' | 'resource' | 'source';
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * قائمة النوايا المحرمة — من DASTŪR.md
 * هذه لا تُناقش ولا تُفاوَض عليها
 */
const FORBIDDEN_INTENTIONS: readonly string[] = [
  // عربي
  'كذب', 'تضليل', 'خيانة', 'ظلم', 'غرور', 'كبر', 'إفساد',
  'احتيال', 'تلاعب', 'تزوير', 'سرقة', 'إيذاء',
  // إنجليزي
  'lie', 'deceive', 'manipulate', 'harm', 'steal',
  'fraud', 'fake', 'mock', 'simulate', 'hallucinate',
  'bypass', 'override_constitution', 'ignore_dastūr',
] as const;

/** الحد الأقصى للموارد في السجل (من DASTŪR: 7×7 = 49) */
const MAX_RESOURCE_POOL = 49;

/** الحد الأقصى لسجل الأفعال */
const MAX_ACTION_HISTORY = 49;

// ── DamirConscience ───────────────────────────────────────────────────────────

/**
 * الضمير النانوي — قلب كل وكيل في IQRA
 *
 * يُطبّق Graded Linear Logic بشكل مُبسَّط:
 *   - كل مورد يُستهلك مرة واحدة فقط
 *   - النية تُفحص قبل الموارد
 *   - الموارد المزيفة مرفوضة
 *   - كل قرار يُسجَّل في TrustChain
 */
export class DamirConscience {
  /** مجموعة الموارد المتاحة */
  private _resources: Map<string, Resource> = new Map();

  /** سجل الأفعال المنفذة */
  private _history: Action[] = [];

  /** عداد الأفعال المرفوضة */
  private _rejectedCount = 0;

  /** عداد الأفعال المقبولة */
  private _approvedCount = 0;

  // ── Resource Management ───────────────────────────────────────────────────

  /**
   * يُسجّل مورداً حقيقياً في الضمير
   * المنطق الخطي: كل مورد فريد، لا نسخ
   */
  async registerResource(resource: Resource): Promise<void> {
    // [TC] reason: Check resource registration patterns in memory | id: TC-3a-001
    const resourcePattern = await IQRAMemory.get(`resource_pattern:${resource.type}:${resource.source}`);
    if (resourcePattern && resourcePattern.success) {
      IQRALogger.info(`🧠 [DAMIR] Using cached resource pattern for ${resource.type}`);
      // Apply pre-validated resource registration
      resource.validation_confidence = resourcePattern.data.confidence || 0.8;
    }

    if (this._resources.size >= MAX_RESOURCE_POOL) {
      // [TC] reason: Store eviction pattern for learning | id: TC-3a-002
      await IQRAMemory.set(`resource_eviction:${Date.now()}`, {
        evicted_resource_id: this._resources.keys().next().value,
        reason: 'pool_capacity_exceeded',
        new_resource_id: resource.id,
        timestamp: new Date().toISOString()
      }, { ttl: 3600000 });
      
      // أزل أقدم مورد مستهلك لإفساح المجال
      this._evictOldestConsumed();
    }

    // Enhanced resource registration with memory tracking
    const enhancedResource = { 
      ...resource, 
      registration_timestamp: Date.now(),
      memory_pattern_applied: !!resourcePattern
    };
    
    this._resources.set(resource.id, enhancedResource);
    
    // [TC] reason: Store resource registration for analytics | id: TC-3a-003
    await IQRAMemory.set(`resource_registration:${resource.id}`, {
      resource_id: resource.id,
      type: resource.type,
      source: resource.source,
      timestamp: new Date().toISOString(),
      pool_size: this._resources.size,
      confidence: resourcePattern?.data?.confidence || 0.5
    }, { ttl: 7200000 });
    
    // [TC] reason: Update resource type analytics | id: TC-3a-004
    const typeAnalytics = await IQRAMemory.get(`resource_type_analytics:${resource.type}`) || { data: { count: 0, avg_confidence: 0 } };
    const updatedAnalytics = {
      count: typeAnalytics.data.count + 1,
      avg_confidence: ((typeAnalytics.data.avg_confidence * typeAnalytics.data.count) + (resourcePattern?.data?.confidence || 0.5)) / (typeAnalytics.data.count + 1),
      last_registered: new Date().toISOString()
    };
    
    await IQRAMemory.set(`resource_type_analytics:${resource.type}`, updatedAnalytics, { ttl: 86400000 });
  }

  /**
   * يُنشئ ويُسجّل مورداً جديداً بسرعة
   */
  createResource(
    type: ResourceType,
    source: Resource['source'] = 'real'
  ): Resource {
    const resource: Resource = {
      id: crypto.randomUUID(),
      type,
      consumed: false,
      source,
      created_at: Date.now(),
    };
    this.registerResource(resource);
    return resource;
  }

  // ── Core: Check ───────────────────────────────────────────────────────────

  /**
   * يفحص إذا كان الفعل مسموحاً به
   *
   * الخوارزمية (Graded Linear Logic):
   *   1. فحص النية — إذا محرمة → رفض فوري
   *   2. فحص الموارد — إذا مستهلكة أو مزيفة → رفض
   *   3. إذا نجح كل شيء → مسموح
   *
   * السرعة: < 5ms (لا LLM، لا شبكة)
   */
  async check(action: Action): Promise<ConscienceVerdict> {
    const start = Date.now();

    // [TC] reason: Check action patterns in memory | id: TC-3b-001
    const actionPattern = await IQRAMemory.get(`action_pattern:${action.id}`);
    const agentPattern = await IQRAMemory.get(`agent_pattern:${action.agent_id}`);
    
    if (actionPattern && actionPattern.success && actionPattern.data.allowed) {
      IQRALogger.info(`🧠 [DAMIR] Using cached action pattern for ${action.id}`);
      return {
        ...actionPattern.data,
        latency_ms: Date.now() - start,
        memory_cached: true
      };
    }

    // ── Enhanced الخطوة ١: فحص النية مع تكامل الذاكرة ───────────────────────
    const intentionPattern = await IQRAMemory.get(`intention_pattern:${action.intention.substring(0, 30)}`);
    const intentionCheck = this._checkIntention(action.intention);
    
    // [TC] reason: Learn from intention patterns | id: TC-3b-002
    await IQRAMemory.set(`intention_pattern:${action.intention.substring(0, 30)}`, {
      allowed: intentionCheck.allowed,
      reason: intentionCheck.reason,
      timestamp: new Date().toISOString()
    }, { ttl: 3600000 });
    
    if (!intentionCheck.allowed) {
      this._rejectedCount++;
      
      // [TC] reason: Store blocked intention pattern | id: TC-3b-003
      await IQRAMemory.set(`blocked_intention:${Date.now()}`, {
        intention: action.intention,
        agent_id: action.agent_id,
        reason: intentionCheck.reason,
        timestamp: new Date().toISOString()
      }, { ttl: 86400000 });
      
      const verdict: ConscienceVerdict = {
        allowed: false,
        reason: intentionCheck.reason,
        confidence: 1.0, // النية المحرمة = يقين تام
        latency_ms: Date.now() - start,
        rejection_type: 'intention',
        memory_cached: false,
        pattern_learned: true
      };
      
      this._logVerdict(action, verdict);
      return verdict;
    }

    // ── Enhanced الخطوة ٢: فحص الموارد مع تكامل الذاكرة ───────────────────
    for (const req of action.requiredResources) {
      // [TC] reason: Check resource validation patterns | id: TC-3b-004
      const resourceValidationPattern = await IQRAMemory.get(`resource_validation:${req.type}:${req.id}`);
      const resourceCheck = this._checkResource(req);
      
      // Store resource validation pattern
      await IQRAMemory.set(`resource_validation:${req.type}:${req.id}`, {
        allowed: resourceCheck.allowed,
        reason: resourceCheck.reason,
        type: resourceCheck.type,
        timestamp: new Date().toISOString()
      }, { ttl: 7200000 });
      
      if (!resourceCheck.allowed) {
        this._rejectedCount++;
        
        // [TC] reason: Store resource violation pattern | id: TC-3b-005
        await IQRAMemory.set(`resource_violation:${Date.now()}`, {
          resource_id: req.id,
          resource_type: req.type,
          agent_id: action.agent_id,
          reason: resourceCheck.reason,
          timestamp: new Date().toISOString()
        }, { ttl: 86400000 });
        
        const verdict: ConscienceVerdict = {
          allowed: false,
          reason: resourceCheck.reason,
          confidence: 0.95,
          latency_ms: Date.now() - start,
          rejection_type: resourceCheck.type,
          memory_cached: false,
          pattern_learned: true
        };
        this._logVerdict(action, verdict);
        return verdict;
      }
    }

    // ── مسموح ────────────────────────────────────────────────────────────
    this._approvedCount++;
    const verdict: ConscienceVerdict = {
      allowed: true,
      reason: 'الفعل مسموح — النية سليمة والموارد متاحة',
      confidence: this._computeConfidence(action),
      latency_ms: Date.now() - start,
    };
    this._logVerdict(action, verdict);
    return verdict;
  }

  // ── Core: Execute ─────────────────────────────────────────────────────────

  /**
   * يُنفّذ الفعل بعد التحقق
   * المنطق الخطي: يستهلك الموارد المطلوبة ويُنتج الجديدة
   *
   * @returns true إذا نُفّذ، false إذا رُفض
   */
  execute(action: Action): boolean {
    const verdict = this.check(action);

    if (!verdict.allowed) {
      IQRALogger.warn(
        `🛑 [DAMIR] Rejected action "${action.id}": ${verdict.reason} ` +
        `(${verdict.latency_ms}ms)`
      );
      return false;
    }

    // استهلاك الموارد المطلوبة (المنطق الخطي: لا تكرار)
    for (const req of action.requiredResources) {
      const r = this._resources.get(req.id);
      if (r) r.consumed = true;
    }

    // إنتاج الموارد الجديدة
    if (action.producedResources) {
      for (const prod of action.producedResources) {
        this.registerResource(prod);
      }
    }

    // تسجيل في السجل
    if (this._history.length >= MAX_ACTION_HISTORY) {
      this._history.shift(); // أزل الأقدم
    }
    this._history.push(action);

    IQRALogger.info(
      `✅ [DAMIR] Approved action "${action.id}" ` +
      `confidence=${verdict.confidence.toFixed(2)} (${verdict.latency_ms}ms)`
    );

    return true;
  }

  // ── Tawbah (التوبة) ───────────────────────────────────────────────────────

  /**
   * إعادة ضبط الضمير — التوبة البرمجية
   * يُستدعى عند اكتشاف تناقض منهجي
   */
  reset(): void {
    const before = this._resources.size;
    this._resources.clear();
    this._history = [];
    this._rejectedCount = 0;
    this._approvedCount = 0;

    appendToTrustChain(
      'DAMIR:TAWBAH',
      `reset_${Date.now()}`,
      `cleared_${before}_resources`,
      1.0
    );

    IQRALogger.info('🌙 [DAMIR] Tawbah: Conscience reset complete');
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  /**
   * تقرير سريع عن حالة الضمير
   */
  report(): {
    resources_available: number;
    resources_consumed: number;
    resources_total: number;
    actions_approved: number;
    actions_rejected: number;
    rejection_rate: number;
    integrity_score: number;
  } {
    const all = Array.from(this._resources.values());
    const consumed = all.filter(r => r.consumed).length;
    const available = all.length - consumed;
    const total = this._approvedCount + this._rejectedCount;
    const rejectionRate = total > 0 ? this._rejectedCount / total : 0;

    // درجة النزاهة: كلما انخفض معدل الرفض، زادت النزاهة
    // لكن الرفض الصحيح (رفض المحرمات) يرفع النزاهة
    const integrityScore = Math.max(0, 1.0 - rejectionRate * 0.3);

    return {
      resources_available: available,
      resources_consumed: consumed,
      resources_total: all.length,
      actions_approved: this._approvedCount,
      actions_rejected: this._rejectedCount,
      rejection_rate: rejectionRate,
      integrity_score: integrityScore,
    };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  /** فحص النية */
  private async _checkIntention(intention: string): Promise<{ allowed: boolean; reason: string }> {
    const lower = intention.toLowerCase();
    const checkStartTime = Date.now();

    // [TC] reason: Check intention validation patterns in memory | id: TC-3c-001
    const intentionValidationPattern = await IQRAMemory.get(`intention_validation:${intention.substring(0, 50)}`);
    if (intentionValidationPattern && intentionValidationPattern.success) {
      IQRALogger.info(`🧠 [DAMIR] Using cached intention validation pattern`);
      return {
        allowed: intentionValidationPattern.data.allowed,
        reason: intentionValidationPattern.data.reason
      };
    }

    // ── Enhanced فحص الكلمات المحرمة مع تكامل الذاكرة ─────────────────────
    for (const forbidden of FORBIDDEN_INTENTIONS) {
      if (lower.includes(forbidden.toLowerCase())) {
        const reason = `النية تحتوي على كلمة محرمة: "${forbidden}" — من DASTŪR.md`;
        
        // [TC] reason: Store forbidden intention pattern | id: TC-3c-002
        await IQRAMemory.set(`forbidden_intention:${Date.now()}`, {
          intention,
          forbidden_word: forbidden,
          reason,
          timestamp: new Date().toISOString()
        }, { ttl: 86400000 });
        
        // Cache validation result
        await IQRAMemory.set(`intention_validation:${intention.substring(0, 50)}`, {
          allowed: false,
          reason,
          validation_time: Date.now() - checkStartTime
        }, { ttl: 3600000 });
        
        return { allowed: false, reason };
      }
    }

    // ── Enhanced قاعدة ثلاثية الأسماء (رب، ملك، إله) مع تكامل الذاكرة ─────
    // "قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ" — الناس: 1-3
    // كل نية تفتقر إلى مرجعية التوحيد الثلاثية تُرفض في المهام الحساسة.
    // الكلمات المُفعِّلة: أي من (رب، ملك، إله) كافية — لا يُشترط الثلاثة معاً.
    const TAWHEED_TRINITY = ['رب', 'ملك', 'إله', 'الله', 'lord', 'sovereign', 'divine'];
    const hasTawheedRef = TAWHEED_TRINITY.some(term => intention.includes(term));

    // [TC] reason: Track tawheed reference patterns | id: TC-3c-003
    await IQRAMemory.set(`tawheed_check:${Date.now()}`, {
      intention_length: intention.length,
      has_tawheed_ref: hasTawheedRef,
      found_terms: TAWHEED_TRINITY.filter(term => intention.includes(term)),
      timestamp: new Date().toISOString()
    }, { ttl: 7200000 });

    // نُطبّق القاعدة فقط على النوايا الطويلة (> 20 حرف) لتجنب رفض النوايا القصيرة
    if (intention.length > 20 && !hasTawheedRef) {
      const reason = 'النية تفتقر إلى مرجعية التوحيد (رب، ملك، إله، الله) — ' +
        '"قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ"';
      
      // [TC] reason: Store tawheed violation pattern | id: TC-3c-004
      await IQRAMemory.set(`tawheed_violation:${Date.now()}`, {
        intention,
        intention_length: intention.length,
        reason,
        timestamp: new Date().toISOString()
      }, { ttl: 86400000 });
      
      // Cache validation result
      await IQRAMemory.set(`intention_validation:${intention.substring(0, 50)}`, {
        allowed: false,
        reason,
        validation_time: Date.now() - checkStartTime
      }, { ttl: 3600000 });
      
      return { allowed: false, reason };
    }

    // [TC] reason: Store successful intention validation | id: TC-3c-005
    await IQRAMemory.set(`intention_validation:${intention.substring(0, 50)}`, {
      allowed: true,
      reason: 'Intention passed all validation checks',
      validation_time: Date.now() - checkStartTime,
      has_tawheed_ref: hasTawheedRef
    }, { ttl: 3600000 });
    
    // Update intention analytics
    const intentionAnalytics = await IQRAMemory.get(`intention_analytics`) || { data: { total_checked: 0, approved: 0, rejected: 0 } };
    const updatedAnalytics = {
      total_checked: intentionAnalytics.data.total_checked + 1,
      approved: intentionAnalytics.data.approved + 1,
      rejected: intentionAnalytics.data.rejected,
      tawheed_compliance_rate: ((intentionAnalytics.data.approved + 1) / (intentionAnalytics.data.total_checked + 1)) * 100,
      last_updated: new Date().toISOString()
    };
    
    await IQRAMemory.set(`intention_analytics`, updatedAnalytics, { ttl: 2592000000 }); // 30 days

    return { allowed: true, reason: '' };
  }

  /** فحص مورد واحد */
  private _checkResource(req: Resource): {
    allowed: boolean;
    reason: string;
    type: 'resource' | 'source';
  } {
    const available = this._resources.get(req.id);

    // المورد غير موجود
    if (!available) {
      return {
        allowed: false,
        reason: `المورد "${req.id}" (${req.type}) غير مسجّل في الضمير`,
        type: 'resource',
      };
    }

    // المورد مستهلك (المنطق الخطي: لا تكرار)
    if (available.consumed) {
      return {
        allowed: false,
        reason: `المورد "${req.id}" (${req.type}) مستهلك بالفعل — لا تكرار في المنطق الخطي`,
        type: 'resource',
      };
    }

    // المورد مزيف (لا Mock في الإنتاج)
    if (available.source === 'injected' && req.type === 'knowledge') {
      return {
        allowed: false,
        reason: `المورد "${req.id}" مصدره "injected" — لا Mock في بيئة الإنتاج`,
        type: 'source',
      };
    }

    return { allowed: true, reason: '', type: 'resource' };
  }

  /** يحسب درجة الثقة بناءً على جودة الموارد */
  private _computeConfidence(action: Action): number {
    if (action.requiredResources.length === 0) return 0.8;

    let score = 1.0;
    for (const req of action.requiredResources) {
      const r = this._resources.get(req.id);
      if (r?.source === 'derived') score -= 0.05; // مشتق = أقل ثقة قليلاً
    }

    return Math.max(0.5, Math.min(1.0, score));
  }

  /** يُسجّل القرار في TrustChain */
  private _logVerdict(action: Action, verdict: ConscienceVerdict): void {
    appendToTrustChain(
      verdict.allowed ? 'DAMIR:ALLOW' : 'DAMIR:BLOCK',
      action.id,
      `${verdict.allowed ? 'ALLOWED' : 'BLOCKED'} reason="${verdict.reason}" ` +
      `confidence=${verdict.confidence.toFixed(2)} latency=${verdict.latency_ms}ms`,
      verdict.allowed ? verdict.confidence : 0.0
    );
  }

  /** يُزيل أقدم مورد مستهلك لإفساح المجال */
  private _evictOldestConsumed(): void {
    let oldest: string | null = null;
    let oldestTime = Infinity;

    for (const [id, r] of this._resources) {
      if (r.consumed && r.created_at < oldestTime) {
        oldestTime = r.created_at;
        oldest = id;
      }
    }

    if (oldest) this._resources.delete(oldest);
  }
}

// ── Singleton للاستخدام العام ─────────────────────────────────────────────────

/**
 * الضمير العام للنظام — instance واحد لكل العمال
 * يُستخدم كـ: import { globalDamir } from '#security/damir_conscience'
 */
export const globalDamir = new DamirConscience();
