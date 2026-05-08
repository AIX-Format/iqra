# بسم الله الرحمن الرحيم
# IQRA OPERATIONAL RULES — القواعد التشغيلية

> "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق: 1

---

## 🛡️ RULE 0: Security First — الأمان أولاً

**قبل أي feature أو loop — Security يجي أول حاجة**

```typescript
// كل دالة تبدأ بـ:
if (!validateSecurity(input)) {
  return ABORT;
}
```

**التطبيق:**
- كل input يمر عبر `validateInput()` من `security.ts`
- كل action يُسجَّل في `TrustChain` قبل التنفيذ
- كل LLM call يمر عبر `FITRAH_FILTER` أولاً
- لا استثناءات — حتى في الاختبارات

---

## ✅ RULE 1: Zod Validation — التحقق قبل المعالجة

**كل input → Zod validation قبل أي processing**

```typescript
import { z } from 'zod';

const InputSchema = z.object({
  verse: z.string().regex(/^\d+:\d+$/),
  field: z.string().min(1),
  resonance: z.number().min(0).max(1),
});

// في كل دالة عامة:
export function processPattern(input: unknown) {
  const validated = InputSchema.parse(input); // throws if invalid
  // ... المعالجة
}
```

**التطبيق:**
- كل API endpoint يبدأ بـ Zod schema
- كل user input يُتحقق منه قبل الاستخدام
- كل config file يُحلَّل عبر Zod
- الأخطاء تُرجع رسائل واضحة للمستخدم

---

## 🔐 RULE 2: Crypto Randomness — لا Math.random أبداً

**كل payment أو security token → crypto.randomBytes**

```typescript
import crypto from 'crypto';

// ❌ WRONG
const id = Math.random().toString(36);

// ✅ CORRECT
const id = crypto.randomUUID();
const token = crypto.randomBytes(32).toString('hex');
```

**التطبيق:**
- كل UUID عبر `crypto.randomUUID()`
- كل session token عبر `crypto.randomBytes()`
- كل salt عبر `crypto.randomBytes()`
- Math.random() محظور في production code

---

## 📝 RULE 3: TrustChain Logging — كل action موثّق

**كل action → TrustChain.append() + auditHash**

```typescript
import { appendToTrustChain } from './security';

export async function discoverPattern(verse: string) {
  // ... المعالجة
  
  appendToTrustChain(
    'PATTERN:DISCOVER',
    verse,
    `resonance=${score.toFixed(3)}`,
    score
  );
  
  return result;
}
```

**التطبيق:**
- كل اكتشاف قرآني يُسجَّل
- كل تغيير في الذاكرة يُسجَّل
- كل مكافأة تُسجَّل
- كل فشل يُسجَّل (للتعلم منه)

---

## 🔄 RULE 4: Self-Review — المراجعة الذاتية

**كل run() → AgentSelfReview.record() بعده (non-blocking)**

```typescript
export async function runMission(missionId: string) {
  const result = await executeMission(missionId);
  
  // Non-blocking self-review
  AgentSelfReview.record(missionId, result).catch(e => 
    IQRALogger.warn('Self-review failed:', e)
  );
  
  return result;
}
```

**التطبيق:**
- كل mission تُراجَع ذاتياً بعد الانتهاء
- المراجعة لا توقف التنفيذ (non-blocking)
- النتائج تُخزَّن في `self_reviews` في Upstash
- الدروس المستفادة تُضاف للذاكرة

---

## 🌀 RULE 5: Meta-Loop — 5 طبقات نشطة

**Meta-Loop يشتغل على 5 طبقات نشطة دايماً**

```
Layer 1: Working Memory (RAM — 49 مدخل)
Layer 2: Episodic Memory (SQLite experiences)
Layer 3: Semantic Memory (Qdrant vectors)
Layer 4: Procedural Memory (SkillBank)
Layer 5: Topological Memory (Persistent Homology)
```

**التطبيق:**
- `MemoryBridge` يُدير الطبقات تلقائياً
- Hot → Warm → Cold promotion كل 9/27/81 نبضة
- `Pulse369.tick()` يُشغَّل بعد كل عملية ذاكرة
- كل طبقة لها TTL محدد (ساعة/أسبوع/شهر)

---

## 🕸️ RULE 6: Quantum Topology — الأنماط العابرة

**Quantum Topology = cross-agent patterns في الـ background**

```typescript
// في الخلفية — لا يوقف التنفيذ
export class QuantumTopologyStore {
  static async storeQuantum(entry: QuantumMemoryEntry) {
    // تخزين في Qdrant + Redis
    // ربط بالأنماط المشابهة
    // حساب H0 و H1 (Persistent Homology)
  }
}
```

**التطبيق:**
- كل نمط قرآني يُخزَّن في `QuantumTopologyStore`
- الأنماط المتشابهة تُربط تلقائياً
- H0 = عدد المكونات المتصلة
- H1 = عدد الحلقات المستقلة
- الرنين يُحسب بين الأنماط المختلفة

---

## 🎯 RULE 7: Curiosity Engine — التغذية الذاتية

**CuriosityEngine يتغذّى من self_score بعد كل task**

```typescript
export async function completeTask(taskId: string, score: number) {
  // ... إنهاء المهمة
  
  // تحديث curiosity score
  const boost = score * 0.1;
  await IQRAMemory.grantReward(boost);
  
  IQRALogger.info(`✨ Curiosity boosted by ${boost.toFixed(4)}`);
}
```

**التطبيق:**
- كل task ناجح يرفع `curiosity_score`
- الاكتشافات الجديدة (novelty > 0.6) تُضاعف المكافأة
- الرنين العالي (> 0.9) يُسجَّل كـ "Divine Pattern"
- Curiosity score يُخزَّن في Upstash

---

## ⚡ RULE 8: Circuit Breaker — حماية LLM

**Circuit Breaker يحمي كل LLM provider منفصل**

```typescript
export async function callLLM(provider: string, prompt: string) {
  const breaker = CircuitBreaker.get(provider);
  
  if (breaker.isOpen()) {
    throw new Error(`${provider} circuit is OPEN — too many failures`);
  }
  
  try {
    const result = await provider.call(prompt);
    breaker.recordSuccess();
    return result;
  } catch (e) {
    breaker.recordFailure();
    throw e;
  }
}
```

**التطبيق:**
- كل LLM provider له circuit breaker منفصل
- بعد 3 فشل متتالي → Circuit OPEN (5 دقائق)
- بعد 7 فشل → Circuit OPEN (30 دقيقة)
- بعد 9 فشل → طلب تدخل بشري
- النجاح يُعيد الـ circuit تدريجياً

---

## 🌟 RULE 9: Tinyminimicroterboquansimualgotoplogy

**Made with Moe Abdelaziz — المبادئ الأساسية**

### 🔬 البحث قبل التطبيق
- **قبل أي تطبيق** → ابحث في arxiv.org أو Google Scholar
- تعلم من أخطاء الآخرين — لا تكرر نفس الأخطاء
- اقرأ الأوراق العلمية الحديثة (2024-2026)
- استخدم web_search للتحقق من أفضل الممارسات

### 🧠 رسم الأنماط الجوهرية
- **map the core kernels** — حدد الأنماط الأساسية
- كل نمط له بصمة فريدة (Shannon H_EL، Tesla 369)
- الأنماط تُخزَّن في MicroMemory + Qdrant
- الرنين يُحسب بين الأنماط المختلفة

### ✅ TODO List الذكية
- كل مهمة كبيرة تُقسَّم لـ sub-tasks
- كل sub-task له acceptance criteria واضحة
- الأولوية للمهام ذات الأثر الأكبر
- التقدم يُسجَّل في `experiences` SQLite

### 🧹 كود نظيف — لا dead code
- **لا dead code** — كل سطر له هدف
- **لا duplicates** — DRY principle دائماً
- **واضح للبشر والـ AI** — تعليقات بالعربية والإنجليزية
- **التفاصيل الصغيرة مهمة** — كل فاصلة لها معنى

### 📊 الذاكرة الذاتية
- **تعلم من التجارب القديمة** — `experiences` في SQLite
- **تعرف على الأنماط** — `patterns` في MicroMemory
- **تذكر الدروس** — `lessons` في كل experience
- **تطور مع الوقت** — `knowledge_versions` (Kumiho)

### 🎯 الهدف النهائي
```
patterns hunt → memory → learn → apply → adapt → teach
```

**صدقاً، دقةً، بركةً**
"وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7

---

## 🔗 الربط مع الأدوات

### Upstash Redis
- `curiosity_score` — درجة الفضول الحالية
- `cycle_counter` — عداد الدورات (7، 40)
- `pulse369:interaction_counter` — عداد النبض
- `embeddings_history` — تاريخ التضمينات
- `reward_history` — سجل المكافآت

### Qdrant
- `iqra_wisdom` — الحكمة القرآنية (768-dim vectors)
- `iqra_quantum_topology` — الطوبولوجيا الكمومية
- `iqra_patterns` — الأنماط المكتشفة

### SQLite (MicroMemory)
- `patterns` — أنماط الرنين القرآني
- `experiences` — تجارب الوكلاء
- `reward_ledger` — سجل المكافآت
- `shannon_cache` — كاش إنتروبي Shannon
- `causal_edges` — الرسم السببي (MAGMA)
- `knowledge_versions` — تطور المعرفة (Kumiho)

### HuggingFace
- Embeddings للنصوص العربية
- Models للتحليل الدلالي
- Inference API للاستدلال السريع

---

## 🚀 التنفيذ العملي

### عند بدء أي مهمة:
1. ✅ Security check أولاً (RULE 0)
2. ✅ Zod validation للـ input (RULE 1)
3. ✅ TrustChain.append() قبل البدء (RULE 3)
4. 🔄 تنفيذ المهمة
5. ✅ TrustChain.append() بعد الانتهاء (RULE 3)
6. ✅ AgentSelfReview.record() (RULE 4)
7. ✅ Pulse369.tick() (RULE 5)
8. ✅ CuriosityEngine update (RULE 7)

### عند اكتشاف نمط قرآني:
1. 🔬 TopologicalCuriosityEngine.discoverResonance()
2. 📊 حساب Shannon H_EL
3. 🧮 حساب Tesla 369
4. 🕸️ حساب H0 و H1 (Persistent Homology)
5. 💾 تخزين في MicroMemory + Qdrant
6. 🎯 تحديث Curiosity score
7. 📝 كتابة في DISCOVERIES.md

---

## 🤲 الدعاء الختامي

```
"رَبِّ زِدْنِي عِلْمًا" — طه: 114

كل سطر كود = عبادة
كل اكتشاف = صدقة جارية
كل نمط = آية من آيات الله

اللهم اجعل هذا العمل خالصاً لوجهك الكريم
واجعله نافعاً للبشرية
وتقبله منا يا أرحم الراحمين
```

---

**Made with ❤️ by Moe Abdelaziz**
**Powered by: Upstash + Qdrant + HuggingFace + Groq**
**Architecture: tinyminimicroterboquansimualgotoplogy**

بسم الله، والصلاة والسلام على رسول الله، وعلى آله وصحبه ومن والاه
