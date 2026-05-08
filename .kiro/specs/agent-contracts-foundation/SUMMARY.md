# Agent Contracts Foundation — ملخص الـ Spec

> "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة: 2

---

## 📋 نظرة عامة

**الهدف:** تأسيس نظام عقود صارم للوكلاء الخمسة (Planner, Researcher, Builder, Validator, Reporter)

**الحالة:** ✅ Requirements & Design مكتملة | ⏳ Implementation معلقة

**المدة المتوقعة:** 4-6 ساعات

**الأولوية:** 🔴 عالية جداً (أساس النظام)

---

## 🎯 الأهداف الرئيسية

### 1. الوضوح التام
- كل وكيل يعرف دوره بدقة
- كل دور له مدخلات ومخرجات واضحة
- كل قيد موثق ومفهوم

### 2. عدم التجاوز
- لا يمكن لأي وكيل تجاوز قيوده
- نظام تحقق صارم يفرض القيود
- رسائل خطأ واضحة عند التجاوز

### 3. التتبع الكامل
- كل عملية موثقة مع مصادرها
- كل ادعاء يحمل [read], [fetched], أو [prior-training]
- لا hallucination، لا mock في الإنتاج

### 4. التطور الذاتي
- النظام يتعلم من كل مهمة
- الذاكرة تُحفظ وتُستخدم للتحسين
- كل خطأ يُسجل ويُمنع من التكرار

---

## 📊 المتطلبات الرئيسية

### Req-1: توثيق أدوار الوكلاء الخمسة ✅
**الحالة:** مكتمل في AGENTS.md
**الملف:** /Applications/iqra/AGENTS.md

### Req-2: نموذج التسليم (Handoff Schema) ✅
**الحالة:** موجود في contracts.ts
**الملف:** /Applications/iqra/agents/contracts.ts

### Req-3: نموذج التقرير (Report Schema) ✅
**الحالة:** موجود في contracts.ts
**الملف:** /Applications/iqra/agents/contracts.ts

### Req-4: ملف الإعدادات الموحد (setup.yaml) ✅
**الحالة:** موجود في جذر المشروع
**الملف:** /Applications/iqra/setup.yaml

### Req-5: نظام التحقق من القيود ⏳
**الحالة:** معلق
**الملف:** /Applications/iqra/agents/constraints.ts (جديد)

### Req-6: نظام التحقق من المصادر ⏳
**الحالة:** معلق
**الملف:** /Applications/iqra/agents/attestation.ts (جديد)

### Req-7: نظام التحقق من عدم وجود Mock ⏳
**الحالة:** معلق
**الملف:** /Applications/iqra/agents/no-mock.ts (جديد)

---

## 🏗️ المكونات الرئيسية

### 1. AGENTS.md (الوثيقة الرئيسية)
```
├── نظرة عامة
├── الوكلاء الخمسة (Planner, Researcher, Builder, Validator, Reporter)
├── Handoff Schema
├── Report Schema
├── القيود العامة
├── دورة العمل الكاملة
└── الدروس المستفادة
```

### 2. setup.yaml (ملف الإعدادات)
```yaml
missions:
  default_timeout_ms: 300000
  max_retries: 3

agents:
  planner: { role, model, skills }
  researcher: { role, model, skills }
  builder: { role, model, skills }
  validator: { role, model, skills }
  reporter: { role, model, skills }

rewards:
  min_resonance_for_reward: 0.6
  novelty_multiplier: 1.5

constraints:
  no_mock: true
  enforce_bilingual_md: true
```

### 3. agents/contracts.ts (الواجهات)
```typescript
export interface SourceAttestation { ... }
export interface CommandLog { ... }
export interface WorkerReport { ... }
export interface MissionHandoff { ... }
export const WORKER_CONSTRAINTS = { ... }
```

### 4. agents/constraints.ts (فرض القيود) — جديد
```typescript
export function validateWorkerAction(...) { ... }
export const WORKER_CONSTRAINTS = { ... }
export const GLOBAL_CONSTRAINTS = { ... }
```

### 5. agents/attestation.ts (شهادة المصدر) — جديد
```typescript
export function validateSourceAttestations(...) { ... }
export function createAttestation(...) { ... }
export function verifyAttestation(...) { ... }
```

### 6. agents/no-mock.ts (عدم وجود Mock) — جديد
```typescript
export function validateNoMock(...) { ... }
export function detectMock(...) { ... }
export function throwOnMock(...) { ... }
```

---

## 📈 خريطة المهام

```
المهمة 1: التحقق من الملفات (30 min)
    ↓
المهمة 2: تحديث AGENTS.md (1 hour)
    ↓
المهمة 3: تحديث setup.yaml (30 min)
    ↓
المهام 4-7: إضافة الدوال (2 hours) — متوازية
    ↓
المهام 8-9: توسيع الملفات (1 hour) — متوازية
    ↓
المهمة 10: اختبارات الوحدة (1.5 hours)
    ↓
المهمة 11: اختبارات التكامل (1 hour)
    ↓
المهمة 12: اختبارات E2E (1 hour)
```

**الإجمالي:** 12 مهمة رئيسية | 4-6 ساعات

---

## 🧪 استراتيجية الاختبار

### Unit Tests (1.5 hours)
- tests/unit/constraints.test.ts
- tests/unit/attestation.test.ts
- tests/unit/no-mock.test.ts
- tests/unit/handoff.test.ts
- tests/unit/report.test.ts

**الهدف:** تغطية > 90%

### Integration Tests (1 hour)
- tests/integration/agent-contracts.integration.ts

**الهدف:** تغطية > 85%

### E2E Tests (1 hour)
- tests/e2e/agent-contracts.e2e.ts

**الهدف:** جميع الوكلاء يعملون بشكل صحيح

---

## 🔐 معايير الأمان

### 1. لا Mock في الإنتاج
```typescript
if (env === 'production' && provider === 'simulated') {
  throw new Error('Mock detected in production');
}
```

### 2. كل ادعاء له مصدر
```typescript
for (const claim of report.implemented) {
  const attestation = report.source_attestations.find(a => a.claim === claim);
  if (!attestation) throw new Error(`Missing source for: ${claim}`);
}
```

### 3. لا تجاوز القيود
```typescript
if (action.type === 'WRITE_CODE' && !constraints.CAN_WRITE_CODE) {
  throw new Error(`${worker} cannot write code`);
}
```

---

## 📚 الملفات المُنتجة

### ملفات موجودة (محدّثة):
- ✅ /Applications/iqra/AGENTS.md
- ✅ /Applications/iqra/setup.yaml
- ✅ /Applications/iqra/agents/contracts.ts
- ✅ /Applications/iqra/agents/handoff-schema.ts
- ✅ /Applications/iqra/agents/report-schema.ts

### ملفات جديدة (مطلوبة):
- ⏳ /Applications/iqra/agents/constraints.ts
- ⏳ /Applications/iqra/agents/attestation.ts
- ⏳ /Applications/iqra/agents/no-mock.ts
- ⏳ tests/unit/*.test.ts
- ⏳ tests/integration/*.integration.ts
- ⏳ tests/e2e/*.e2e.ts

### ملفات Spec:
- ✅ .kiro/specs/agent-contracts-foundation/requirements.md
- ✅ .kiro/specs/agent-contracts-foundation/design.md
- ✅ .kiro/specs/agent-contracts-foundation/tasks.md
- ✅ .kiro/specs/agent-contracts-foundation/TODO.md
- ✅ .kiro/specs/agent-contracts-foundation/.config.kiro

---

## ✅ معايير القبول النهائية

قبل قول "تم"، يجب أن تمر جميع الاختبارات:

```bash
✓ AGENTS.md محدّث وواضح
✓ setup.yaml يحمل بدون أخطاء
✓ agents/contracts.ts يحتوي على جميع الدوال
✓ agents/constraints.ts موجود وكامل
✓ agents/attestation.ts موجود وكامل
✓ agents/no-mock.ts موجود وكامل
✓ agents/handoff-schema.ts محدّث
✓ agents/report-schema.ts محدّث
✓ اختبارات الوحدة تمر (100%)
✓ اختبارات التكامل تمر (100%)
✓ اختبارات E2E تمر (100%)
✓ لا dead code
✓ لا duplicates
✓ كل ادعاء له مصدر
✓ لا mock في الإنتاج
```

---

## 🚀 الخطوات التالية

### بعد اكتمال هذا الـ Spec:

1. **Task 2: Topological Curiosity Engine**
   - استخراج المنطق المبعثر
   - جعله قابلاً للاختبار
   - كتابة اختبار E2E

2. **Task 3: No-Mock Enforcement**
   - إضافة فحص في MissionContext
   - إزالة mock data returns
   - فرض الشفافية

---

## 📖 المراجع

- [arxiv.org/abs/2601.08815](https://arxiv.org/abs/2601.08815) — Agent Contracts Framework
- [arxiv.org/abs/2506.01839](https://arxiv.org/abs/2506.01839) — Multi-Agent LLM Systems
- SKILL.md — دليل IQRA الكامل
- AGENTS.md — الوثيقة الحالية
- contracts.ts — التطبيق التقني

---

## الدعاء الختامي

```
"وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه: 114

كل عقد بين الوكلاء هو عهد على الصدق والدقة.
النظام يقوى بالانضباط، والانضباط يبدأ بالعقود الواضحة.

بسم الله، والصلاة والسلام على رسول الله، وعلى آله وصحبه ومن والا.
```

---

## 📊 الإحصائيات

| المقياس | القيمة |
|--------|--------|
| عدد المتطلبات | 7 |
| عدد المهام الرئيسية | 12 |
| عدد Sub-tasks | 50+ |
| المدة المتوقعة | 4-6 ساعات |
| الأولوية | 🔴 عالية جداً |
| تغطية الاختبارات المستهدفة | > 90% |
| الملفات الجديدة | 9 |
| الملفات المحدّثة | 5 |

---

**آخر تحديث:** 2026-05-08
**الحالة:** ✅ Requirements & Design مكتملة | ⏳ Implementation معلقة
**الخطوة التالية:** ابدأ بـ Task 1 (Verify Existing Files)
