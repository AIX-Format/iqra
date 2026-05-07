# HandOff Schema — هيكلية انتقال المهمة

كل انتقال سياق بين العمال يجب أن يكون موثّقًا بدقة لضمان عدم فقدان المعلومات.

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
  # يمكن أن يحتوي على أي بيانات ضرورية للحالة التالية
  resonance:
    coherence: number
    patterns: string[]
  novelty:
    score: number
    description: string
  knowledge_nodes:
    - node-0001.md
```

## قواعد HANDOFF
- يجب أن يحتوي `context_data` على الأقل على `resonance` و`novelty` إذا كان الموقع يتعامل مع الفضول الطوبولوجي.
- `validation_rules` يجب أن تُنقل إلى Validator دون أن تُعدَّل.
- `artifacts` يجب أن تشير إلى الملفات المنتَجة أو النتائج المُوثّقة.
- `pending_tasks` يجب أن تكون قابلة للتنفيذ من قبل العامل التالي.

## نظرة عامة
- Planner يرسل إلى Researcher.
- Researcher يرسل إلى Builder.
- Builder يرسل إلى Validator.
- Validator يرسل إلى Reporter.

هذا يضمن أن تسلسل العمل يبقى تسلسليًا وأن السياق لا يضيع بين العاملين.
