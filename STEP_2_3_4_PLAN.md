# الخطوات 2-4: إصلاح tsconfig + إنشاء الهيكل + نقل الملفات

**الحالة:** ✅ الخطوة 2 مكتملة | ⏳ الخطوات 3-4 قادمة

---

## ✅ الخطوة 2: إصلاح tsconfig.json — مكتملة

### التحديثات المطبقة:
```json
"paths": {
  "@/*": ["./src/*"],
  "#core/*": ["./lib/iqra/01-core/*"],
  "#workers/*": ["./lib/iqra/02-workers/*"],
  "#memory/*": ["./lib/iqra/03-memory/*"],
  "#quran/*": ["./lib/iqra/04-quran/*"],
  "#rewards/*": ["./lib/iqra/05-rewards/*"],
  "#security/*": ["./lib/iqra/06-security/*"],
  "#llm/*": ["./lib/iqra/07-llm/*"],
  "#skills/*": ["./lib/iqra/08-skills/*"],
  "#evolution/*": ["./lib/iqra/09-evolution/*"],
  "#topology/*": ["./lib/iqra/10-topology/*"],
  "#trading/*": ["./lib/iqra/11-trading/*"]
}
```

**الفائدة:** الآن يمكن استخدام `import { X } from '#core/...'` بدلاً من `'./01-core/...'`

---

## ⏳ الخطوة 3: إنشاء الهيكل 01-11

### المجلدات الموجودة بالفعل:
```
✅ lib/iqra/01-core/          (يحتوي على constants.ts)
✅ lib/iqra/02-workers/       (فارغ)
✅ lib/iqra/03-memory/        (فارغ)
✅ lib/iqra/04-quran/         (فارغ)
✅ lib/iqra/05-rewards/       (فارغ)
✅ lib/iqra/06-security/      (فارغ)
✅ lib/iqra/07-llm/           (فارغ)
✅ lib/iqra/08-skills/        (فارغ)
✅ lib/iqra/09-evolution/     (فارغ)
✅ lib/iqra/10-topology/      (فارغ)
✅ lib/iqra/11-trading/       (فارغ)
```

**الملاحظة:** جميع المجلدات موجودة بالفعل! لا حاجة لإنشاء مجلدات جديدة.

---

## ⏳ الخطوة 4: نقل الملفات

### خطة النقل:

#### 01-core (الأساس)
```
المصدر → الوجهة
lib/iqra/brain.ts → lib/iqra/01-core/brain.ts
lib/iqra/sovereign.ts → lib/iqra/01-core/sovereign.ts
lib/iqra/loop.ts → lib/iqra/01-core/loop.ts
lib/iqra/sovereign_orchestrator.ts → lib/iqra/01-core/sovereign_orchestrator.ts
lib/iqra/core.ts → lib/iqra/01-core/core.ts
lib/iqra/constants.ts → lib/iqra/01-core/constants.ts (موجود بالفعل)
```

#### 02-workers (العمال)
```
lib/iqra/workers/ → lib/iqra/02-workers/
```

#### 03-memory (الذاكرة)
```
lib/iqra/memory/ → lib/iqra/03-memory/
lib/iqra/memory.ts → lib/iqra/03-memory/memory.ts
```

#### 04-quran (القرآن)
```
lib/iqra/quran/ → lib/iqra/04-quran/
```

#### 05-rewards (المكافآت)
```
lib/iqra/rewards/ → lib/iqra/05-rewards/
```

#### 06-security (الأمان)
```
lib/iqra/damir_conscience.ts → lib/iqra/06-security/damir_conscience.ts
lib/iqra/security.ts → lib/iqra/06-security/security.ts
lib/iqra/filter.ts → lib/iqra/06-security/filter.ts
lib/iqra/conscience/ → lib/iqra/06-security/conscience/
```

#### 07-llm (نماذج اللغة)
```
lib/iqra/llm/ → lib/iqra/07-llm/
```

#### 08-skills (المهارات)
```
lib/iqra/skills/ → lib/iqra/08-skills/
lib/iqra/skill_bank.ts → lib/iqra/08-skills/skill_bank.ts
```

#### 09-evolution (التطور)
```
lib/iqra/evolution/ → lib/iqra/09-evolution/
lib/iqra/evolution.ts → lib/iqra/09-evolution/evolution.ts
```

#### 10-topology (الطوبولوجيا)
```
lib/iqra/topology/ → lib/iqra/10-topology/
lib/iqra/topology.ts → lib/iqra/10-topology/topology.ts
```

#### 11-trading (التداول)
```
lib/iqra/trading/ → lib/iqra/11-trading/
```

#### 12-infrastructure (البنية التحتية)
```
lib/iqra/infrastructure/ → lib/iqra/12-infrastructure/
lib/iqra/heartbeat.ts → lib/iqra/12-infrastructure/heartbeat.ts
lib/iqra/logger.ts → lib/iqra/12-infrastructure/logger.ts
lib/iqra/database.ts → lib/iqra/12-infrastructure/database.ts
lib/iqra/qdrant.ts → lib/iqra/12-infrastructure/qdrant.ts
lib/iqra/r2_storage.ts → lib/iqra/12-infrastructure/r2_storage.ts
lib/iqra/resource_monitor.ts → lib/iqra/12-infrastructure/resource_monitor.ts
```

#### 13-utils (الأدوات المساعدة)
```
lib/iqra/utils/ → lib/iqra/13-utils/
lib/iqra/style.ts → lib/iqra/13-utils/style.ts
lib/iqra/prompts.ts → lib/iqra/13-utils/prompts.ts
lib/iqra/logger.ts → lib/iqra/13-utils/logger.ts (إذا لم يكن في 12)
```

---

## 🔄 الملفات المتبقية (لم تُصنف بعد)

```
lib/iqra/browser_manager.ts
lib/iqra/bybit.ts
lib/iqra/byzantine_filter.ts
lib/iqra/commands.ts
lib/iqra/consciousness.ts
lib/iqra/damir_kernel.ts
lib/iqra/did.ts
lib/iqra/e2e_runner.ts
lib/iqra/email.ts
lib/iqra/git-ops.ts
lib/iqra/index.ts
lib/iqra/mission-context.ts
lib/iqra/mission-runner.ts
lib/iqra/orchestrator.ts
lib/iqra/pattern_hunter_runner.ts
lib/iqra/personality.ts
lib/iqra/personas.ts
lib/iqra/quran_kernel.json
lib/iqra/run_evolution.ts
lib/iqra/shura.ts
lib/iqra/soul_engine.ts
lib/iqra/sovereign_identity.ts
lib/iqra/storyteller.ts
lib/iqra/tawbah.ts
lib/iqra/telegram_bot.ts
lib/iqra/telegram.ts
lib/iqra/tools_registry.ts
lib/iqra/turboquant.ts
lib/iqra/voice.ts
```

---

## ⚠️ ملاحظات مهمة

1. **الاستيرادات:** بعد النقل، يجب تحديث جميع الاستيرادات
   - من: `import { X } from './brain'`
   - إلى: `import { X } from '#core/brain'`

2. **المسارات النسبية:** قد تحتاج إلى تحديث المسارات النسبية
   - من: `import { Y } from '../memory'`
   - إلى: `import { Y } from '#memory/...'`

3. **الملفات المشتركة:** بعض الملفات قد تُستخدم من عدة أماكن
   - يجب التحقق من جميع الاستيرادات قبل النقل

4. **الملفات الرئيسية:** 
   - `index.ts` يجب أن يبقى في `lib/iqra/` (نقطة الدخول الرئيسية)
   - `tools_registry.ts` قد يكون في `12-infrastructure/`

---

## 🚀 الخطوات التالية

1. **الخطوة 4a:** نقل ملفات 01-core
2. **الخطوة 4b:** نقل ملفات 02-workers
3. **الخطوة 4c:** نقل ملفات 03-memory
4. **... وهكذا لكل مجلد**
5. **الخطوة 5:** توحيد Damir
6. **الخطوة 6:** تحديث TrustChain
7. **الخطوة 7:** اختبار شامل

---

## 📝 ملاحظات تقنية

- استخدام `git mv` بدلاً من `cp` للحفاظ على التاريخ
- تحديث الاستيرادات تدريجياً (ملف تلو الآخر)
- اختبار البناء بعد كل مجموعة من النقلات
- التحقق من عدم وجود أخطاء استيراد

