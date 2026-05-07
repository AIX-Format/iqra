# AGENTS.md — عقود وكلاء IQRA

## الهدف
توثيق أدوار كل عامل في حلقة الفضول الطوبولوجي، وحفظ السياق من خلال handoffs صارمة، وفصل التحقق عن التنفيذ.

## تعريف الأدوار

### Planner
- يترجم المهمة إلى أهداف واضحة وsubtasks.
- يحدد `mission_scope` و`validation_rules` و`allowed_tools`.
- لا يكتب كود التنفيذ المباشر.
- يضع واجهات handoff للباحث والباني.

### Researcher
- يجمع البيانات الحديثة، يربطها بالأنماط القرآنية، ويحسب `novelty` و`resonance`.
- يستخدم `TopologicalCuriosity` و`VectorEngine` و`QuantumTopologyStore`.
- لا يقرّر المكافأة النهائية وحده.
- يسلم نتائج قابلة للتحقق للـ Validator.

### Builder
- يبني التنفيذ الفعلي أو الحسابات العلمية.
- ينشئ `knowledge/node-*.md` أو موظفًا كمدخلات تحليلية.
- لا يوافق على نتيجته بنفسه.

### Validator
- يفكك النتائج عبر `validation_rules` و`procedures_followed`.
- لا يغير التنفيذ.
- يستطيع رفض مكافأة إذا كان هناك تحيز أو هلوسة.

### Reporter
- يجمع الأقوال النهائية، يحول النتائج إلى تقارير منظمة.
- لا يكتب أو يعدل كودًا.
- يوصي بنقاط `serendipity` و`pristine_path`.

## هيكل handoff

كل handoff يجب أن يلتزم بالشكل التالي:

```yaml
mission_id: string
from_worker: string
to_worker: string
timestamp: number
artifacts:
  - string
pending_tasks:
  - string
known_issues:
  - string
validation_rules:
  - string
context_data:
  key: value
```

### قواعد HandOff
- يجب أن يحتوي handoff على `pending_tasks` واضحة.
- يجب أن يحتفظ بـ`validation_rules` الصريحة.
- يجب أن يسجل `known_issues` للحالات التي قد تفسد الرنين.
- لا يمكن لـ Validator تغيير منطق التنفيذ.
- يجب على Reporter استخدام `artifacts` فقط، وليس تنفيذ الكود.

## نموذج عمل الوكلاء

1. Planner يصيغ مهمة في `mission-scope.yml`.
2. Researcher يستخرج الدلالات النموذجية والقرآنية.
3. Builder يحول الاكتشاف إلى مدخلات عملية.
4. Validator يفحص النتائج ضد `iqra-core`.
5. Reporter يوثق النتائج ويشير إلى المكافأة.

## Role-to-Model Mapping

| الدور | النموذج المفضل | السبب |
|-------|----------------|-------|
| Planner | gemini-1.5-pro | جودة التخطيط العالي، تماسك المهمة. |
| Researcher | gemini-1.5-flash | استكشاف سريع متعدد اللغات. |
| Builder | llama-3.1-70b | قدرات حسابية وتنفيذية قوية. |
| Validator | gemini-1.5-flash | مراجعة نصية دقيقة دون تحيّز. |
| Reporter | gpt-4.1 | صياغة سردية موثوقة. |

## ملاحظات مهمة
- كل عمل يسجَّل في `TrustChain`.
- لا توجد مكافأة نهائية بدون حالة `validation_status: verified`.
- الحوافز الذاتية تكون عبر `RewardLedger` فقط بعد اجتياز البوابة.
