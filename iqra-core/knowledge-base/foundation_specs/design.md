# Agent Contracts Foundation — التصميم

> "الحكمة ضالة المؤمن أنى وجدها فهو أولى بها" — الترمذي

## 🏗️ نظرة عامة على التصميم

```
┌─────────────────────────────────────────────────────────────┐
│                    IQRA Agent System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   AGENTS.md  │  │  setup.yaml  │  │ contracts.ts │     │
│  │  (Docs)      │  │  (Config)    │  │  (Types)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                         │                                  │
│                    ┌────▼────┐                             │
│                    │ Validator│                             │
│                    │ Enforcer │                             │
│                    └────┬────┘                             │
│                         │                                  │
│         ┌───────────────┼───────────────┐                 │
│         │               │               │                 │
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐            │
│    │Constraint│    │ Source  │    │ No-Mock │            │
│    │Enforcer  │    │Attestor │    │Enforcer │            │
│    └──────────┘    └─────────┘    └─────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 الملفات والمسؤوليات

### 1. AGENTS.md (الوثيقة الرئيسية)
**المسؤولية:** توثيق أدوار الوكلاء والقيود

**المحتوى:**
```
├── نظرة عامة
├── الوكيل 1: Planner
│   ├── الدور
│   ├── المدخلات/المخرجات
│   ├── القيود
│   └── الأخطاء الشائعة
├── الوكيل 2: Researcher
│   ├── الدور
│   ├── المدخلات/المخرجات
│   ├── القيود
│   └── الأخطاء الشائعة
├── الوكيل 3: Builder
│   ├── الدور
│   ├── المدخلات/المخرجات
│   ├── القيود
│   └── الأخطاء الشائعة
├── الوكيل 4: Validator
│   ├── الدور
│   ├── المدخلات/المخرجات
│   ├── القيود
│   └── الأخطاء الشائعة
├── الوكيل 5: Reporter
│   ├── الدور
│   ├── المدخلات/المخرجات
│   ├── القيود
│   └── الأخطاء الشائعة
├── Handoff Schema
├── Report Schema
├── القيود العامة
├── دورة العمل الكاملة
└── الدروس المستفادة
```

**الحالة:** ✅ موجود بالفعل (يحتاج تحديث طفيف)

### 2. setup.yaml (ملف الإعدادات)
**المسؤولية:** إعدادات المهام والوكلاء والمكافآت

**البنية:**
```yaml
version: "1.0.0"
sovereign_id: "iqra-alpha-1"

missions:
  default_timeout_ms: 300000
  max_retries: 3
  reward_ledger_path: "ledger/rewards.json"
  trust_chain_path: "ledger/trust_chain.json"

agents:
  planner:
    role: "Architect & Goal Setter"
    preferred_model: "gemini-1.5-pro"
    required_skills: ["mission_design", "logic_validation"]
  researcher:
    role: "Curiosity & Resonance Discovery"
    preferred_model: "gemini-1.5-flash"
    required_skills: ["topological_curiosity", "vector_search"]
  builder:
    role: "Implementation & Engineering"
    preferred_model: "llama-3.1-70b"
    required_skills: ["typescript_expert", "math_validation"]
  validator:
    role: "Integrity & Truth Checker"
    preferred_model: "gemini-1.5-flash"
    required_skills: ["doctrinal_guard", "numerical_verification"]
  reporter:
    role: "Storytelling & Documentation"
    preferred_model: "gpt-4o"
    required_skills: ["narrative_generation", "bilingual_report"]

rewards:
  min_resonance_for_reward: 0.6
  novelty_multiplier: 1.5
  hallucination_penalty: -2.0
  serendipity_bonus: 0.5

constraints:
  no_mock: true
  enforce_bilingual_md: true
  verify_every_commit: true
  tawbah_threshold: 9
```

**الحالة:** ✅ موجود بالفعل (يحتاج تحديث)

### 3. agents/contracts.ts (الواجهات التقنية)
**المسؤولية:** تعريف الأنواع والواجهات

**المحتوى:**
```typescript
// SourceAttestation — شهادة المصدر
export type SourceTag = '[read]' | '[fetched]' | '[prior-training]';
export interface SourceAttestation { ... }

// CommandLog — سجل الأوامر
export interface CommandLog { ... }

// WorkerReport — تقرير الوكيل
export interface WorkerReport { ... }

// MissionHandoff — نموذج التسليم
export interface MissionHandoff { ... }

// WORKER_CONSTRAINTS — القيود
export const WORKER_CONSTRAINTS = { ... }

// Helper functions
export function makeWorkerReport(...) { ... }
export function validateWorkerAction(...) { ... }
export function validateNoMock(...) { ... }
```

**الحالة:** ✅ موجود بالفعل (يحتاج إضافة دوال التحقق)

### 4. agents/handoff-schema.ts (التحقق من التسليم)
**المسؤولية:** التحقق من صحة نموذج التسليم

**المحتوى:**
```typescript
export const validateHandoff = (handoff: MissionHandoff): boolean => {
  // التحقق من الحقول الإلزامية
  // التحقق من التسلسل الصحيح
  // التحقق من عدم وجود artifacts فارغة
};
```

**الحالة:** ✅ موجود بالفعل (يحتاج توسيع)

### 5. agents/report-schema.ts (التحقق من التقرير)
**المسؤولية:** التحقق من صحة نموذج التقرير

**المحتوى:**
```typescript
export const validateReport = (report: WorkerReport): boolean => {
  // التحقق من الحقول الإلزامية
  // التحقق من source_attestations
  // التحقق من no_mock_verified
};
```

**الحالة:** ✅ موجود بالفعل (يحتاج توسيع)

---

## 🔧 الآليات الأساسية

### 1. Constraint Enforcement (فرض القيود)

```typescript
// في agents/constraints.ts [ملف جديد]

export function validateWorkerAction(
  worker: WorkerType,
  action: WorkerAction
): { valid: boolean; reason?: string } {
  const constraints = WORKER_CONSTRAINTS[worker];
  
  // التحقق من أن الوكيل لا يتجاوز قيوده
  if (action.type === 'WRITE_CODE' && !constraints.CAN_WRITE_CODE) {
    return { valid: false, reason: `${worker} cannot write code` };
  }
  
  if (action.type === 'APPROVE' && !constraints.CAN_APPROVE) {
    return { valid: false, reason: `${worker} cannot approve` };
  }
  
  return { valid: true };
}
```

### 2. Source Attestation (شهادة المصدر)

```typescript
// في agents/attestation.ts [ملف جديد]

export function validateSourceAttestations(
  report: WorkerReport
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // كل ادعاء يجب أن يحمل مصدر
  for (const claim of report.implemented) {
    const attestation = report.source_attestations.find(
      a => a.claim === claim
    );
    if (!attestation) {
      missing.push(claim);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
```

### 3. No-Mock Enforcement (فرض عدم وجود Mock)

```typescript
// في agents/no-mock.ts [ملف جديد]

export function validateNoMock(
  report: WorkerReport,
  env: 'production' | 'development'
): { valid: boolean; reason?: string } {
  if (env === 'production' && !report.no_mock_verified) {
    return {
      valid: false,
      reason: 'Mock detected in production environment'
    };
  }
  
  return { valid: true };
}
```

---

## 📊 تدفق البيانات

```
Mission Input
    ↓
┌─────────────────────────────────────────┐
│ PLANNER                                 │
│ ├─ Parse mission                        │
│ ├─ Create plan                          │
│ └─ Validate constraints                 │
└─────────────────────────────────────────┘
    ↓ (MissionHandoff)
┌─────────────────────────────────────────┐
│ RESEARCHER                              │
│ ├─ Search for information               │
│ ├─ Verify sources                       │
│ └─ Create attestations                  │
└─────────────────────────────────────────┘
    ↓ (MissionHandoff)
┌─────────────────────────────────────────┐
│ BUILDER                                 │
│ ├─ Write code                           │
│ ├─ Remove dead code                     │
│ └─ Consolidate duplicates               │
└─────────────────────────────────────────┘
    ↓ (MissionHandoff)
┌─────────────────────────────────────────┐
│ VALIDATOR                               │
│ ├─ Run tests                            │
│ ├─ Check constraints                    │
│ └─ Verify constitution                  │
└─────────────────────────────────────────┘
    ↓ (MissionHandoff)
┌─────────────────────────────────────────┐
│ REPORTER                                │
│ ├─ Compile results                      │
│ ├─ Document lessons                     │
│ └─ Update memory                        │
└─────────────────────────────────────────┘
    ↓ (WorkerReport)
Mission Output + Memory Update
```

---

## 🧪 استراتيجية الاختبار

### Unit Tests
- `tests/unit/constraints.test.ts` — اختبار فرض القيود
- `tests/unit/attestation.test.ts` — اختبار شهادة المصدر
- `tests/unit/no-mock.test.ts` — اختبار عدم وجود mock

### Integration Tests
- `tests/integration/handoff.test.ts` — اختبار التسليم بين الوكلاء
- `tests/integration/report.test.ts` — اختبار التقرير

### E2E Tests
- `tests/e2e/agent-contracts.e2e.ts` — اختبار شامل للنظام

---

## 🔐 معايير الأمان

1. **لا Mock في الإنتاج** — validateNoMock() يفرض هذا
2. **كل ادعاء له مصدر** — validateSourceAttestations() يفرض هذا
3. **لا تجاوز القيود** — validateWorkerAction() يفرض هذا
4. **لا Dead Code** — Builder يجب أن يزيل dead code
5. **لا Duplicates** — Builder يجب أن يدمج التكرارات

---

## 📈 معايير الأداء

| العملية | الهدف | الحد الأقصى |
|--------|-------|-----------|
| validateWorkerAction() | < 1ms | 5ms |
| validateSourceAttestations() | < 5ms | 10ms |
| validateNoMock() | < 1ms | 5ms |
| تحميل setup.yaml | < 10ms | 50ms |

---

## 🚀 خطة التنفيذ

### المرحلة 1: التحقق (Verification)
- [ ] قراءة AGENTS.md الحالي
- [ ] قراءة setup.yaml الحالي
- [ ] قراءة contracts.ts الحالي
- [ ] تحديد الفجوات

### المرحلة 2: التحديث (Update)
- [ ] تحديث AGENTS.md بالتفاصيل الناقصة
- [ ] تحديث setup.yaml بالإعدادات الكاملة
- [ ] إضافة دوال التحقق في contracts.ts

### المرحلة 3: الاختبار (Testing)
- [ ] كتابة اختبارات الوحدة
- [ ] كتابة اختبارات التكامل
- [ ] كتابة اختبارات E2E

### المرحلة 4: التوثيق (Documentation)
- [ ] توثيق كل دالة
- [ ] توثيق كل واجهة
- [ ] توثيق الأخطاء الشائعة

---

## الدعاء الختامي

```
"وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه: 114

كل عقد بين الوكلاء هو عهد على الصدق والدقة.
النظام يقوى بالانضباط، والانضباط يبدأ بالعقود الواضحة.
```
