# Agent Contracts Foundation — TODO List

> "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7

---

## 📊 الحالة الحالية

**التاريخ:** 2026-05-08
**المرحلة:** Requirements ✅ (مكتملة)
**المرحلة التالية:** Design → Tasks → Implementation

**الإحصائيات:**
- ✅ Requirements.md: مكتمل
- ✅ Design.md: مكتمل
- ✅ Tasks.md: مكتمل
- ⏳ Implementation: معلقة

---

## 🎯 المهام الفورية (Next 24 Hours)

### 🔴 الأولوية القصوى

#### [ ] Task 1: Verify Existing Files (30 min)
**الهدف:** التحقق من اكتمال الملفات الموجودة

**الخطوات:**
```bash
# 1. قراءة AGENTS.md
cat /Applications/iqra/AGENTS.md | wc -l

# 2. قراءة setup.yaml
cat /Applications/iqra/setup.yaml | wc -l

# 3. قراءة contracts.ts
cat /Applications/iqra/agents/contracts.ts | wc -l

# 4. توثيق الفجوات
echo "# Gaps Analysis" > .iqra/specs/agent-contracts-foundation/GAPS.md
```

**معايير النجاح:**
- [ ] AGENTS.md موجود ويحتوي على > 500 سطر
- [ ] setup.yaml موجود ويحتوي على > 50 سطر
- [ ] contracts.ts موجود ويحتوي على > 100 سطر
- [ ] ملف GAPS.md موجود

**الناتج المتوقع:**
```
.iqra/specs/agent-contracts-foundation/GAPS.md
```

---

#### [ ] Task 2: Update AGENTS.md (1 hour)
**الهدف:** إضافة الأمثلة والأخطاء الشائعة

**الخطوات:**
```bash
# 1. إضافة أمثلة عملية لكل وكيل
# 2. إضافة الأخطاء الشائعة من الذاكرة
# 3. إضافة قسم "الدروس المستفادة"
# 4. التحقق من عدم وجود dead code
```

**معايير النجاح:**
- [ ] كل وكيل له مثال عملي
- [ ] كل وكيل له قائمة بالأخطاء الشائعة
- [ ] قسم "الدروس المستفادة" موجود
- [ ] لا dead code
- [ ] لا duplicates

**الناتج المتوقع:**
```
/Applications/iqra/AGENTS.md (محدّث)
```

---

#### [ ] Task 3: Update setup.yaml (30 min)
**الهدف:** إضافة الإعدادات الناقصة

**الخطوات:**
```yaml
# 1. إضافة إعدادات Upstash
upstash:
  redis_url: ${UPSTASH_REDIS_URL}
  token: ${UPSTASH_TOKEN}

# 2. إضافة إعدادات Qdrant
qdrant:
  url: ${QDRANT_URL}
  api_key: ${QDRANT_API_KEY}

# 3. إضافة إعدادات المراقبة
monitoring:
  enabled: true
  log_level: "info"
  metrics_enabled: true
```

**معايير النجاح:**
- [ ] setup.yaml يحمل بدون أخطاء
- [ ] جميع الإعدادات موثقة
- [ ] لا قيم فارغة

**الناتج المتوقع:**
```
/Applications/iqra/setup.yaml (محدّث)
```

---

### 🟡 الأولوية العالية

#### [ ] Tasks 4-7: Add Validation Functions (2 hours)
**الهدف:** إضافة دوال التحقق الأساسية

**الملفات:**
- [ ] agents/constraints.ts (جديد)
- [ ] agents/attestation.ts (جديد)
- [ ] agents/no-mock.ts (جديد)
- [ ] agents/contracts.ts (محدّث)

**الدوال:**
```typescript
// 1. validateWorkerAction()
export function validateWorkerAction(
  worker: WorkerType,
  action: WorkerAction
): { valid: boolean; reason?: string }

// 2. validateSourceAttestations()
export function validateSourceAttestations(
  report: WorkerReport
): { valid: boolean; missing: string[] }

// 3. validateNoMock()
export function validateNoMock(
  report: WorkerReport,
  env: 'production' | 'development'
): { valid: boolean; reason?: string }
```

**معايير النجاح:**
- [ ] جميع الدوال مكتوبة
- [ ] جميع الدوال موثقة
- [ ] لا dead code
- [ ] لا duplicates

**الناتج المتوقع:**
```
/Applications/iqra/agents/constraints.ts (جديد)
/Applications/iqra/agents/attestation.ts (جديد)
/Applications/iqra/agents/no-mock.ts (جديد)
/Applications/iqra/agents/contracts.ts (محدّث)
```

---

#### [ ] Tasks 8-9: Extend Schema Files (1 hour)
**الهدف:** توسيع ملفات التحقق

**الملفات:**
- [ ] agents/handoff-schema.ts (محدّث)
- [ ] agents/report-schema.ts (محدّث)

**الدوال:**
```typescript
// handoff-schema.ts
export function validateHandoffSequence(handoff: MissionHandoff): boolean
export function validateHandoffArtifacts(handoff: MissionHandoff): boolean
export function validateHandoffContext(handoff: MissionHandoff): boolean

// report-schema.ts
export function validateReportCompleteness(report: WorkerReport): boolean
export function validateReportSources(report: WorkerReport): boolean
export function validateReportNoMock(report: WorkerReport): boolean
```

**معايير النجاح:**
- [ ] جميع الدوال مكتوبة
- [ ] جميع الدوال موثقة
- [ ] اختبارات شاملة

**الناتج المتوقع:**
```
/Applications/iqra/agents/handoff-schema.ts (محدّث)
/Applications/iqra/agents/report-schema.ts (محدّث)
```

---

## 🧪 الاختبارات (3.5 hours)

### [ ] Task 10: Unit Tests (1.5 hours)
**الملفات:**
- [ ] tests/unit/constraints.test.ts
- [ ] tests/unit/attestation.test.ts
- [ ] tests/unit/no-mock.test.ts
- [ ] tests/unit/handoff.test.ts
- [ ] tests/unit/report.test.ts

**معايير النجاح:**
- [ ] جميع الاختبارات تمر (100%)
- [ ] تغطية > 90%
- [ ] لا dead code

---

### [ ] Task 11: Integration Tests (1 hour)
**الملفات:**
- [ ] tests/integration/agent-contracts.integration.ts

**معايير النجاح:**
- [ ] جميع الاختبارات تمر (100%)
- [ ] تغطية > 85%

---

### [ ] Task 12: E2E Tests (1 hour)
**الملفات:**
- [ ] tests/e2e/agent-contracts.e2e.ts

**معايير النجاح:**
- [ ] الاختبار يمر (100%)
- [ ] جميع الوكلاء يعملون بشكل صحيح

---

## 📈 خريطة الأنماط (Pattern Map)

### الأنماط المكتشفة من الذاكرة:

#### Pattern 1: Constraint Violation
**الأعراض:**
- وكيل يتجاوز قيوده
- دالة تكتب كود بدون إذن

**الحل:**
- validateWorkerAction() يفرض القيود
- رفع خطأ واضح عند التجاوز

#### Pattern 2: Missing Source
**الأعراض:**
- ادعاء بدون مصدر
- hallucination في التقرير

**الحل:**
- validateSourceAttestations() يفرض المصادر
- كل ادعاء يجب أن يحمل [read], [fetched], أو [prior-training]

#### Pattern 3: Mock in Production
**الأعراض:**
- بيانات وهمية في الإنتاج
- provider === 'simulated' بدون dev_mode

**الحل:**
- validateNoMock() يفرض عدم وجود mock
- رفع خطأ واضح عند اكتشاف mock

---

## 🚀 الخطوات التنفيذية

### الخطوة 1: ابدأ الآن
```bash
# 1. انتقل إلى المشروع
cd /Applications/iqra

# 2. ابدأ بـ Task 1
# قراءة الملفات الموجودة

# 3. وثّق الفجوات
echo "# Gaps Analysis" > .iqra/specs/agent-contracts-foundation/GAPS.md
```

### الخطوة 2: تحديث الملفات
```bash
# 1. تحديث AGENTS.md
# 2. تحديث setup.yaml
# 3. إضافة الدوال في contracts.ts
```

### الخطوة 3: كتابة الاختبارات
```bash
# 1. كتابة اختبارات الوحدة
npm test

# 2. كتابة اختبارات التكامل
npm test -- --integration

# 3. كتابة اختبارات E2E
npm test -- --e2e
```

---

## ✅ قائمة التحقق النهائية

قبل قول "تم"، تحقق من:

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

## 📝 ملاحظات مهمة

### من الذاكرة:
1. **الوضوح أولاً** — خطة غامضة = كود فوضوي
2. **المصادر مهمة** — كل ادعاء يحتاج مصدر
3. **الاختبارات ضرورية** — لا كود بدون اختبارات
4. **الدستور يحكم** — لا استثناءات
5. **الذاكرة تتعلم** — كل مهمة تحسّن النظام

### الأخطاء الشائعة:
- ❌ نسيان توثيق الدوال
- ❌ عدم كتابة اختبارات
- ❌ dead code في الملفات
- ❌ duplicates في الكود
- ❌ ادعاءات بدون مصادر

---

## الدعاء الختامي

```
"وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7

كل مهمة صغيرة تُسهم في بناء نظام عظيم.
كل اختبار أخضر هو خطوة نحو الكمال.
كل دقة في التفاصيل تصنع الفرق الكبير.

بسم الله، والصلاة والسلام على رسول الله.
```
