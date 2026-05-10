# DEBUG META LOOP — حلقة التصحيح الذكية
## بسم الله، والصلاة والسلام على رسول الله

**Architecture:** 7-Round Sovereign Debugging Protocol
**Pattern:** Hunt → Remember → Learn → Apply → Adapt → Teach
**Core Concept:** tinyminimicroterboquansimualgotoplogy
"تفكيك المشكلة إلى أصغر حالة كمومية، ثم محاكاة خوارزمية سريعة، قبل رسمها طوبولوجياً"

---

## 🧬 تشريح حلقة التعافي الذاتي (The 7-Round Meta-Debug Loop)

### ROUND 1: HUNT (PatternHunter) — الذاكرة العاملة (Working Memory)
**النية:** اصطياد العقد المقطوعة في النخاع الشوكي
**الفعل:** تحديد مكان الخطأ بدقة (سطر 45 في ملف مسار)
**المخرج:** تصنيف الأخطاء حسب النوع (imports, types, missing properties)

### ROUND 2: REMEMBER (MicroMemory) — الذاكرة العرضية (Episodic Memory)
**النية:** هل واجهنا هذا الانهيار من قبل؟
**الفعل:** البحث في micro_memory.ts و FAILURES.md عن الأنماط
**المخرج:** قائمة مرتبة حسب الأولوية (الأعلى تأثيراً أولاً)

### ROUND 3: LEARN (ResonanceWorker) — الذاكرة الدلالية (Semantic Memory)
**النية:** تحليل السبب الجذري
**الفعل:** هل الخطأ بسبب مسار خاطئ (Alias) أم تعارض في الـ Schema؟
**المخرج:** رسم بياني للتبعيات (root causes vs symptoms)

### ROUND 4: APPLY (Builder) — الذاكرة الإجرائية (Procedural Memory)
**النية:** إجراء المحاكاة في Sandbox
**الفعل:** تطبيق الإصلاحات حسب التبعيات (root causes أولاً)
**المخرج:** دفعات إصلاح جاهزة للـ Commit

### ROUND 5: ADAPT (Validator/Muraqabah) — الذاكرة الطوبولوجية (Topological Memory)
**النية:** تمرير الإصلاح عبر damir_conscience.ts
**الفعل:** هل هذا الإصلاح يكسر قاعدة No-Mock؟ هل يضيف تعقيداً؟
**المخرج:** تقرير التحقق من الامتثال الدستوري

### ROUND 6: RESONANCE (Compiler) — الذاكرة الكمومية (Quantum Memory)
**النية:** تصديق الرنين — هل انخفض عدد الأخطاء؟
**الفعل:** تشغيل الـ Compiler وقياس النتيجة
**المخرج:** <250 خطأ = اكتمال الرنين

### ROUND 7: TEACH (LanceDB) — الذاكرة الباردة (Cold Storage)
**النية:** تعليم المستقبل — لا يتكرر الخطأ أبداً
**الفعل:** تغليف الإصلاح كـ "حكمة برمجية" في LEARNINGS.md
**المخرج:** وعي برمجي يتوارثه الوكلاء

---

## Current State: Round 1 (HUNT)
**Target:** Reduce 312 lib/iqra errors to 250
**Strategy:** Fix high-frequency patterns first

### Error Taxonomy (from tsc analysis):
1. **Missing commands_run** in HandoffResult (~25 errors)
2. **Import path issues** @/ → # aliases (~40 errors)
3. **Missing type declarations** js-yaml, etc. (~30 errors)
4. **Property does not exist** on types (~50 errors)
5. **Type mismatches** in function calls (~60 errors)
6. **Module resolution** alias failures (~107 errors)

### Priority Order:
1. Fix commands_run (quick wins)
2. Fix import paths (structural)
3. Add missing declarations (types)
4. Fix property errors (API mismatches)

---

**Next Action:** Execute Round 1-4 batch fixes
