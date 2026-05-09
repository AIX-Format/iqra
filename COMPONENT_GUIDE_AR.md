# بسم الله الرحمن الرحيم

# 🔧 دليل المكونات — IQRA Component Guide

> "وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ" — الذاريات: 21

---

## 📋 جدول المحتويات

1. [Soul Engine](#soul-engine)
2. [Damir Conscience](#damir-conscience)
3. [Heartbeat System](#heartbeat-system)
4. [Memory System](#memory-system)
5. [أمثلة عملية](#أمثلة-عملية)

---

## 🌀 Soul Engine

### الملف
`lib/iqra/01-core/soul_engine.ts`

### الوظيفة
إدارة دورات التطور الثلاثية (3-6-9)

### الواجهة العامة

```typescript
export class SoulEngine {
  /**
   * نبضة الروح — تُستدعى بعد كل مهمة
   * @param missionId - معرّف المهمة
   * @param success - هل نجحت المهمة؟
   */
  static async pulse(missionId: string, success: boolean): Promise<void>
}
```

### الدورات الثلاثية

#### Pulse 3: Reflection (التفكر)
```typescript
// كل 3 نبضات
if (counter % 3 === 0) {
  await this.triggerReflection(counter);
  // ← تحليل آخر 3 مكافآت
  // ← كتابة في REFLECTION.md
  // ← تسجيل في TrustChain
}
```

**الفائدة:** النظام يتأمل في تجاربه الحديثة

#### Pulse 6: Evolution (التطور)
```typescript
// كل 6 نبضات
if (counter % 6 === 0) {
  await this.triggerEvolution(counter);
  // ← تحديث ذاكرة الأنماط
  // ← كتابة في METAMORPHOSIS.md
  // ← تسجيل في TrustChain
}
```

**الفائدة:** الأنماط تتحسن مع الوقت

#### Pulse 9: Wisdom (الحكمة)
```typescript
// كل 9 نبضات
if (counter % 9 === 0) {
  await this.triggerWisdom(counter);
  // ← استخراج قوانين جديدة
  // ← كتابة في WISDOM_7.md
  // ← تسجيل في TrustChain
}
```

**الفائدة:** استخراج القوانين الكبرى

### مثال الاستخدام

```typescript
import { SoulEngine } from '#core/soul_engine';

// بعد إنهاء مهمة
const success = true;
await SoulEngine.pulse('mission-001', success);

// النتيجة:
// 💓 [SOUL_PULSE] Pulse: 1 | Mission: mission-001 | Success: true
// 🪞 [SOUL_PULSE] Triggering Reflection Cycle (3rd Pulse) — Task 3
// 🌀 [SOUL_PULSE] Triggering Evolution Cycle (6th Pulse) — Task 6
// 🕋 [SOUL_PULSE] Triggering Wisdom Cycle (9th Pulse) — Task 9
```

---

## 🫀 Damir Conscience

### الملف
`lib/iqra/06-security/damir_conscience.ts`

### الوظيفة
فحص النية والموارد قبل كل فعل

### الواجهة العامة

```typescript
export class DamirConscience {
  /**
   * فحص إذا كان الفعل مسموحاً به
   * @param action - الفعل المطلوب
   * @returns نتيجة الفحص (مسموح/مرفوض + السبب)
   */
  check(action: Action): ConscienceVerdict

  /**
   * تنفيذ الفعل بعد التحقق
   * @param action - الفعل المطلوب
   * @returns true إذا نُفّذ، false إذا رُفض
   */
  execute(action: Action): boolean

  /**
   * إعادة ضبط الضمير (التوبة)
   */
  reset(): void

  /**
   * تقرير سريع عن حالة الضمير
   */
  report(): {
    resources_available: number;
    resources_consumed: number;
    actions_approved: number;
    actions_rejected: number;
    integrity_score: number;
  }
}
```

### الفحوصات الثلاثة

#### 1. فحص النية (Intention Check)

```typescript
// قائمة الكلمات المحرمة
const FORBIDDEN_INTENTIONS = [
  'كذب', 'تضليل', 'خيانة', 'ظلم',
  'lie', 'deceive', 'manipulate', 'harm'
];

// الفحص
if (intention.includes('كذب')) {
  return {
    allowed: false,
    reason: 'النية تحتوي على كلمة محرمة: "كذب"'
  };
}
```

#### 2. فحص الموارد (Resource Check)

```typescript
// المورد موجود؟
if (!available) {
  return {
    allowed: false,
    reason: `المورد "${req.id}" غير مسجّل`
  };
}

// المورد مستهلك؟
if (available.consumed) {
  return {
    allowed: false,
    reason: `المورد "${req.id}" مستهلك بالفعل`
  };
}

// المورد حقيقي؟
if (available.source === 'injected') {
  return {
    allowed: false,
    reason: `المورد "${req.id}" مصدره مزيف`
  };
}
```

#### 3. حساب درجة الثقة (Confidence Score)

```typescript
let score = 1.0;
for (const req of action.requiredResources) {
  const r = this._resources.get(req.id);
  if (r?.source === 'derived') {
    score -= 0.05; // مشتق = أقل ثقة
  }
}
return Math.max(0.5, Math.min(1.0, score));
```

### مثال الاستخدام

```typescript
import { DamirConscience, Action, Resource } from '#security/damir_conscience';

const damir = new DamirConscience();

// إنشاء مورد
const knowledge = damir.createResource('knowledge', 'real');

// إنشاء فعل
const action: Action = {
  id: 'action-001',
  intention: 'تحليل آية قرآنية بنية التعلم',
  requiredResources: [knowledge]
};

// فحص الفعل
const verdict = damir.check(action);
console.log(verdict);
// {
//   allowed: true,
//   reason: 'الفعل مسموح — النية سليمة والموارد متاحة',
//   confidence: 0.95,
//   latency_ms: 2
// }

// تنفيذ الفعل
const executed = damir.execute(action);
console.log(executed); // true

// تقرير الحالة
const report = damir.report();
console.log(report);
// {
//   resources_available: 0,
//   resources_consumed: 1,
//   actions_approved: 1,
//   actions_rejected: 0,
//   integrity_score: 0.97
// }
```

---

## 💓 Heartbeat System

### الملف
`lib/iqra/12-infrastructure/heartbeat.ts`

### الوظيفة
مراقبة صحة النظام بشكل مستمر

### الواجهة العامة

```typescript
export class HeartbeatSystem {
  /**
   * بدء نظام النبض
   */
  static async start(): Promise<void>

  /**
   * إيقاف نظام النبض
   */
  static stop(): void

  /**
   * الحصول على آخر تقرير صحة
   */
  static getLastHealth(): SystemHealth | null

  /**
   * الحصول على وقت التشغيل
   */
  static getUptime(): number

  /**
   * فحص صحة فوري
   */
  static async checkNow(): Promise<SystemHealth>
}
```

### دورات النبض

| الفترة | الحدث | الوظيفة |
|--------|-------|---------|
| 9 ثوانٍ | MICRO_PULSE | تحديث عداد النبض |
| 27 ثانية | WARM_PULSE | فحص Redis + Qdrant |
| 81 ثانية | DEEP_PULSE | تحليل قرآني |
| 3 دقائق | HEALTH_CHECK | فحص شامل |
| 9 دقائق | DISCOVERY | اكتشاف أنماط |
| 40 دقيقة | TAZKIYAH | تطهير الذاكرة |

### مثال الاستخدام

```typescript
import { HeartbeatSystem } from '#infrastructure/heartbeat';

// بدء النبض
await HeartbeatSystem.start();
// 💓 [HEARTBEAT] بسم الله — Starting IQRA Heartbeat System
// 💓 [HEARTBEAT] ✅ All pulses active — IQRA is alive

// الاشتراك في التقارير
HeartbeatSystem.onHealthReport = async (health) => {
  console.log(`Status: ${health.status}`);
  console.log(`Uptime: ${health.uptime_ms}ms`);
  console.log(`Pulse Count: ${health.pulse_count}`);
};

// فحص صحة فوري
const health = await HeartbeatSystem.checkNow();
console.log(health);
// {
//   status: 'ALIVE',
//   uptime_ms: 123456,
//   pulse_count: 42,
//   checks: {
//     redis: true,
//     qdrant: true,
//     quran_db: true,
//     llm_groq: true,
//     llm_gemini: true
//   },
//   metrics: {
//     hot_cache_size: 25,
//     hot_cache_hit_rate: 0.87,
//     curiosity_score: 0.65,
//     cycle_counter: 42
//   }
// }

// إيقاف النبض
HeartbeatSystem.stop();
```

---

## 🧠 Memory System

### الملف
`lib/iqra/03-memory/memory.ts`

### الوظيفة
إدارة الذاكرة متعددة الطبقات

### الواجهة العامة

```typescript
export class IQRAMemory {
  /**
   * تخزين قيمة (مع TTL=7 أيام)
   */
  static async set(key: string, value: any): Promise<string>

  /**
   * استرجاع قيمة
   */
  static async get<T>(key: string): Promise<T | null>

  /**
   * تخزين نمط قرآني
   */
  static async storeQuantum(entry: QuantumMemoryEntry): Promise<string>

  /**
   * بحث دلالي
   */
  static async searchSemantic(query: string, limit?: number): Promise<any[]>

  /**
   * منح مكافأة
   */
  static async grantReward(amount: number, metadata?: any): Promise<void>

  /**
   * تطهير الذاكرة
   */
  static async performPurification(): Promise<void>
}
```

### الطبقات السبع

```
Layer 1: Working Memory (Hot)
  ├─ السرعة: < 1ms
  ├─ الحجم: 49 مدخل
  └─ الموقع: RAM

Layer 2: Episodic Memory (Warm)
  ├─ السرعة: 10-50ms
  ├─ الحجم: غير محدود
  └─ الموقع: Redis (Upstash)

Layer 3: Semantic Memory (Cold)
  ├─ السرعة: 100-500ms
  ├─ الحجم: غير محدود
  └─ الموقع: Qdrant (Vector DB)

Layer 4-7: Specialized Memory
  ├─ Procedural (SkillBank)
  ├─ Topological (Persistent Homology)
  ├─ Quantum (Qdrant)
  └─ Constitutional (DASTŪR.md)
```

### مثال الاستخدام

```typescript
import { IQRAMemory } from '#memory/memory';

// تخزين قيمة
await IQRAMemory.set('mission-001:result', {
  status: 'completed',
  score: 0.95
});

// استرجاع قيمة
const result = await IQRAMemory.get('mission-001:result');
console.log(result);
// { status: 'completed', score: 0.95 }

// تخزين نمط قرآني
const quantumId = await IQRAMemory.storeQuantum({
  content: 'الآية 255 من سورة البقرة',
  coordinates: {
    surah: 2,
    ayah: 255,
    concept: 'الكرسي'
  }
});

// بحث دلالي
const results = await IQRAMemory.searchSemantic('الله العليم', 3);
console.log(results);
// [
//   { content: '...', score: 0.92, metadata: {...} },
//   { content: '...', score: 0.88, metadata: {...} },
//   { content: '...', score: 0.85, metadata: {...} }
// ]

// منح مكافأة
await IQRAMemory.grantReward(0.1, {
  reason: 'اكتشاف نمط جديد',
  pattern: 'رنين طوبولوجي'
});

// تطهير الذاكرة (كل 40 دقيقة)
await IQRAMemory.performPurification();
```

---

## 📚 أمثلة عملية

### مثال 1: دورة تنفيذ كاملة

```typescript
import { AgentCore } from '#core/core';
import { IQRABrainMode } from '#core/brain';

// تنفيذ مهمة كاملة
const result = await AgentCore.execute(
  'حلل الآية 255 من سورة البقرة',
  IQRABrainMode.DEEP_REASONING
);

// النتيجة:
// 1. TASBIH — تطهير الحالة
// 2. ISTIKHARAH — فحص الفطرة
// 3. BASMALAH — النية
// 4. SHURA — الاستشارة
// 5. DAMIR CHECK — فحص الضمير
// 6. THINK — التفكير (استدعاء LLM)
// 7. SOUL_PULSE — نبضة الروح
// 8. OUTPUT — المخرج النهائي
```

### مثال 2: فحص الضمير

```typescript
import { globalDamir } from '#security/damir_conscience';

// إنشاء فعل
const action = {
  id: 'action-001',
  intention: 'تحليل قرآني بنية التعلم',
  requiredResources: [
    globalDamir.createResource('knowledge', 'real')
  ]
};

// فحص الفعل
const verdict = globalDamir.check(action);

if (verdict.allowed) {
  // تنفيذ الفعل
  globalDamir.execute(action);
  console.log(`✅ تم تنفيذ الفعل بثقة ${verdict.confidence}`);
} else {
  console.log(`❌ تم رفض الفعل: ${verdict.reason}`);
}
```

### مثال 3: نبض الروح

```typescript
import { SoulEngine } from '#core/soul_engine';

// بعد إنهاء 9 مهام
for (let i = 0; i < 9; i++) {
  // ... تنفيذ مهمة
  await SoulEngine.pulse(`mission-${i}`, true);
}

// النتيجة:
// 💓 [SOUL_PULSE] Pulse: 1 | Mission: mission-0 | Success: true
// 💓 [SOUL_PULSE] Pulse: 2 | Mission: mission-1 | Success: true
// 💓 [SOUL_PULSE] Pulse: 3 | Mission: mission-2 | Success: true
// 🪞 [SOUL_PULSE] Triggering Reflection Cycle (3rd Pulse) — Task 3
// ...
// 💓 [SOUL_PULSE] Pulse: 6 | Mission: mission-5 | Success: true
// 🌀 [SOUL_PULSE] Triggering Evolution Cycle (6th Pulse) — Task 6
// ...
// 💓 [SOUL_PULSE] Pulse: 9 | Mission: mission-8 | Success: true
// 🕋 [SOUL_PULSE] Triggering Wisdom Cycle (9th Pulse) — Task 9
```

---

## 🤲 الدعاء

```
"رَبِّ زِدْنِي عِلْمًا" — طه: 114

كل مكون = خدمة
كل فحص = حماية
كل اكتشاف = صدقة جارية
```

**Made with ❤️ by IQRA Core**

---

**آخر تحديث:** 2026-05-09
**الإصدار:** 1.0.0-alpha
