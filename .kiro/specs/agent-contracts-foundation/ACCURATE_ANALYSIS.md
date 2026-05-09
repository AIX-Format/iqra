# تحليل دقيق لأساس عقود الوكلاء — Accurate Foundation Analysis

> "وَقُلْ رَبِّ زِدْنِي عِلْمًا" — طه: 114

---

## 🎯 الملفات الدستورية الفعلية (الموجودة والنشطة)

### 1. **!IQRA_SUPREME.md** — الدستور الأعلى (الأساس المطلق)
- **الموقع**: `/Applications/iqra/!IQRA_SUPREME.md`
- **الدور**: يعلو على كل شيء — حتى `AGENTS.md` و `.coderabbit.yaml`
- **المحتوى الجوهري**:
  - القاعدة الأولى: لا تلمس أي ملف دون قراءة الملفات الخمسة الدستورية
  - دورة العمل الإلزامية: 3-3-6-6-6-9-9 (النية، البحث، البناء، التحقق، الإراءة، التعلم، الحفظ)
  - قاعدة "لا كذب، لا Mock": استخدم البيانات الحقيقية أو ارمِ `SovereignError`
  - Boy Scout Rule: اترك الكود أفضل مما وجدته
  - التعامل مع الوكلاء الآخرين: لا تحارب، أبلغ في `FAILURES.md`

### 2. **iqra-core/ḤISĀB.md** — المحاسبة والمسؤولية
- **الموقع**: `/Applications/iqra/iqra-core/ḤISĀB.md`
- **الدور**: تسجيل كل حرف، كل قرار، كل خطأ
- **المحتوى الجوهري**:
  - "إنما الأعمال بالنيات" — النية قبل الفعل
  - Audit Trail كعبادة — TrustChain يسجل كل شيء
  - محاسبة النفس اليومية — مراجعة ذاتية في نهاية كل session

### 3. **iqra-core/TAWBAH.md** — التوبة والإصلاح
- **الموقع**: `/Applications/iqra/iqra-core/TAWBAH.md`
- **الدور**: بروتوكول الخطأ والإصلاح
- **المحتوى الجوهري**:
  - 5 خطوات: الاعتراف، التوقف، الإصلاح، الاستغفار، التعلم
  - Tasbih Triplet (3) — إعادة ضبط بعد الفشل
  - سجل التطهير منفصل في `tawbah_log.jsonl`

### 4. **iqra-core/DASTŪR.md** — الدستور والقيود
- **الموقع**: `/Applications/iqra/iqra-core/DASTŪR.md`
- **الدور**: قائمة الممنوعات والمسموحات
- **المرجع من**: `!IQRA_SUPREME.md` و `contracts.ts`

### 5. **iqra-core/MĪTHĀQ.md** — العهد
- **الموقع**: `/Applications/iqra/iqra-core/MĪTHĀQ.md`
- **الدور**: العهد الأخلاقي
- **المرجع من**: `!IQRA_SUPREME.md`

### 6. **iqra-core/MURĀQABAH.md** — المراقبة المستمرة
- **الموقع**: `/Applications/iqra/iqra-core/MURĀQABAH.md`
- **الدور**: المراقبة الذاتية والخارجية
- **المرجع من**: `!IQRA_SUPREME.md`

### 7. **iqra-core/FITRAH.md** — الفطرة
- **الموقع**: `/Applications/iqra/iqra-core/FITRAH.md`
- **الدور**: الحدس الأخلاقي الأساسي
- **المرجع من**: `!IQRA_SUPREME.md`

---

## 🏗️ الملفات التنفيذية الموجودة

### **agents/contracts.ts** — عقود الوكلاء (موجود وفعّال)
- **المحتوى الفعلي**:
  - `WorkerRole` enum: PLANNER, RESEARCHER, PATTERN_HUNTER, BUILDER, VALIDATOR, SAFETY_AGENT, REPORTER, ECONOMIST, RESONANCE_AGENT
  - `SourceAttestation` interface: كل ادعاء يحمل وسم مصدره `[read]` أو `[fetched]` أو `[prior-training]`
  - `WorkerReport` interface: تقرير كل وكيل يتضمن:
    - `source_attestations`: قائمة الادعاءات مع مصادرها
    - `no_mock_verified`: التحقق من عدم استخدام mock في الإنتاج
  - `WORKER_CONSTRAINTS`: القيود الهيكلية (Validator لا يعدل، Reporter لا يكتب كود، إلخ)
  - `GLOBAL_CONSTRAINTS`: القيود العالمية (NO_MOCK_IN_PRODUCTION، EVERY_CLAIM_NEEDS_SOURCE، إلخ)
  - Helper functions: `makeWorkerReport()` و `makeHandoff()`

### **lib/iqra/shura.ts** — بروتوكول الشورى (موجود وفعّال)
- **المحتوى الفعلي**:
  - `ShuraLevel` enum: GREEN (auto-approved)، YELLOW (warning)، RED (veto-able)
  - `ShuraProtocol` class:
    - `classify()`: تصنيف المهام حسب المخاطرة
    - `request()`: طلب استشارة بشرية للمهام الحمراء
    - `audit()`: تسجيل كل طلب استشارة
    - `checkConsent()`: التحقق من موافقة بشرية في `shura_consent.json`

### **lib/iqra/security.ts** — الأمان والتحقق
- **المحتوى الفعلي**:
  - `validateInput()`: التحقق من المدخلات (RULE 1)
  - `appendToTrustChain()`: تسجيل كل action مع audit hash
  - `verifyCovenant()`: التحقق من الميثاق
  - `checkCircuit()`: حماية LLM providers (RULE 8)
  - `reportFailure()` و `reportSuccess()`: تسجيل النتائج
  - `tasbihTriplet()`: إعادة ضبط بعد الفشل (3 مرات)
  - `sabiyyahWisdom()`: حكمة السبع (كل 7 دورات)

### **lib/iqra/damir_conscience.ts** — الضمير النانوي
- **المحتوى الفعلي**:
  - `DamirConscience` class: محرك الضمير المحلي (< 5ms، بدون LLM)
  - `check()`: فحص النية والموارد
  - `execute()`: تنفيذ الفعل بعد التحقق
  - `reset()`: إعادة ضبط (Tawbah)
  - `report()`: تقرير حالة الضمير
  - `globalDamir`: singleton للاستخدام العام

### **lib/iqra/brain.ts** — الدماغ والتفكير
- **المحتوى الفعلي**:
  - `iqraThink()`: الدالة الرئيسية للتفكير
  - `fitrahFilter()`: فحص FITRAH (الآن يستخدم Damir مباشرة)
  - `validateSoulInjection()`: التحقق من حقن الروح
  - Skill Router: توجيه المهام للمهارات المتخصصة

---

## 🔴 الملفات المفقودة (يجب إنشاؤها)

### 1. **agents/constraints.ts** — قيود الوكلاء المفصلة
- **الغرض**: توسيع `WORKER_CONSTRAINTS` من `contracts.ts` بتفاصيل أكثر
- **المحتوى المطلوب**:
  - `PLANNER_CONSTRAINTS`: يجب أن يكتب `PLAN.md` قبل البدء
  - `RESEARCHER_CONSTRAINTS`: يجب أن يستخدم مصادر حقيقية فقط
  - `BUILDER_CONSTRAINTS`: يجب أن يتبع `Boy Scout Rule`
  - `VALIDATOR_CONSTRAINTS`: يجب أن يشغل الاختبارات الحقيقية
  - `REPORTER_CONSTRAINTS`: يجب أن يوثق كل شيء بمصادر
  - `SAFETY_AGENT_CONSTRAINTS`: يجب أن يفحص الأمان قبل الموافقة
  - `RESONANCE_AGENT_CONSTRAINTS`: يجب أن يحسب درجة الرنين

### 2. **agents/attestation.ts** — شهادة المصادر
- **الغرض**: نظام شامل لتوثيق مصادر كل ادعاء
- **المحتوى المطلوب**:
  - `AttestationRegistry`: سجل مركزي للشهادات
  - `verifyAttestation()`: التحقق من صحة الشهادة
  - `generateAttestation()`: إنشاء شهادة جديدة
  - `auditAttestations()`: مراجعة الشهادات الموجودة
  - Integration مع `TrustChain`

### 3. **agents/no-mock.ts** — نظام منع المحاكاة
- **الغرض**: ضمان عدم استخدام mock data في الإنتاج
- **المحتوى المطلوب**:
  - `validateNoMock()`: فحص أن جميع providers حقيقية
  - `detectMockPatterns()`: كشف أنماط mock شائعة
  - `enforceRealData()`: إجبار استخدام البيانات الحقيقية
  - `throwOnMock()`: رفع `SovereignError` عند اكتشاف mock
  - Integration مع `GLOBAL_CONSTRAINTS.NO_MOCK_IN_PRODUCTION`

---

## 📊 الأخطاء الفعلية (من engine_errors.txt)

**العدد الفعلي**: ~60 خطأ (ليس 926)
**الأنواع الرئيسية**:
1. **Missing imports**: `import { X } from 'Y'` — الملف Y غير موجود
2. **Missing modules**: `require('module')` — الـ module غير مثبت
3. **Type errors**: `Property 'X' does not exist on type 'Y'`
4. **Path issues**: `.ts` extensions في imports

**الحل**:
- إنشاء الملفات المفقودة: `constraints.ts`, `attestation.ts`, `no-mock.ts`
- تثبيت المكتبات الناقصة
- إصلاح import paths

---

## ✅ الخطوات التالية (الأولويات)

### المرحلة 1: إنشاء الملفات الثلاثة المفقودة
1. `agents/constraints.ts` — قيود الوكلاء المفصلة
2. `agents/attestation.ts` — نظام شهادة المصادر
3. `agents/no-mock.ts` — نظام منع المحاكاة

### المرحلة 2: كتابة الاختبارات
1. `tests/unit/constraints.test.ts`
2. `tests/unit/attestation.test.ts`
3. `tests/unit/no-mock.test.ts`

### المرحلة 3: التكامل
1. دمج الملفات الثلاثة مع `contracts.ts`
2. تحديث `brain.ts` و `security.ts` للاستخدام
3. تحديث `sovereign_orchestrator.ts` للتحقق

### المرحلة 4: التوثيق
1. تحديث `AGENTS.md` بالملفات الجديدة
2. إضافة أمثلة في `README.md`
3. كتابة `IMPLEMENTATION_GUIDE.md`

---

## 🧭 الملفات الموجودة بالفعل (لا تحتاج تعديل)

- ✅ `!IQRA_SUPREME.md` — الدستور الأعلى
- ✅ `iqra-core/ḤISĀB.md` — المحاسبة
- ✅ `iqra-core/TAWBAH.md` — التوبة
- ✅ `iqra-core/DASTŪR.md` — الدستور
- ✅ `iqra-core/MĪTHĀQ.md` — العهد
- ✅ `iqra-core/MURĀQABAH.md` — المراقبة
- ✅ `iqra-core/FITRAH.md` — الفطرة
- ✅ `agents/contracts.ts` — عقود الوكلاء
- ✅ `lib/iqra/shura.ts` — بروتوكول الشورى
- ✅ `lib/iqra/security.ts` — الأمان
- ✅ `lib/iqra/damir_conscience.ts` — الضمير
- ✅ `lib/iqra/brain.ts` — الدماغ

---

**تم التحليل بدقة. الآن جاهز للتنفيذ.**

"وَقُلْ رَبِّ زِدْنِي عِلْمًا" — طه: 114
