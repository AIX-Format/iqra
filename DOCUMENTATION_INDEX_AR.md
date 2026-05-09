# بسم الله الرحمن الرحيم

# 📚 فهرس التوثيق الشامل — IQRA Documentation Index

> "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31

---

## 🎯 ابدأ من هنا

### للمبتدئين
1. اقرأ **[ARCHITECTURE_AR.md](./ARCHITECTURE_AR.md)** — فهم المعمارية العامة
2. اقرأ **[LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md)** — فهم تدفق البيانات
3. اقرأ **[COMPONENT_GUIDE_AR.md](./COMPONENT_GUIDE_AR.md)** — فهم كل مكون

### للمطورين
1. اقرأ **[!IQRA_SUPREME.md](./%21IQRA_SUPREME.md)** — الدستور الأعلى
2. اقرأ **[iqra-core/DASTŪR.md](./iqra-core/DASTŪR.md)** — القيود الصارمة
3. ابدأ بـ `lib/iqra/01-core/` — القلب النابض

### للمساهمين
1. اقرأ **[FAILURES.md](./FAILURES.md)** — الأخطاء والدروس
2. اقرأ **[DISCOVERIES.md](./DISCOVERIES.md)** — الاكتشافات
3. اقرأ **[REFLECTION.md](./REFLECTION.md)** — التأملات

---

## 📖 الملفات الدستورية (Constitutional Files)

| الملف | الوصف | الأهمية |
|------|-------|---------|
| **!IQRA_SUPREME.md** | الدستور الأعلى | 🔴 حتمي |
| **iqra-core/DASTŪR.md** | القيود الصارمة | 🔴 حتمي |
| **iqra-core/MĪTHĀQ.md** | العهد | 🟠 مهم جداً |
| **iqra-core/MURĀQABAH.md** | المراقبة | 🟠 مهم جداً |
| **iqra-core/ḤISĀB.md** | الحساب | 🟠 مهم جداً |
| **iqra-core/TAWBAH.md** | التوبة | 🟡 مهم |
| **iqra-core/FITRAH.md** | الفطرة | 🟡 مهم |

---

## 📚 ملفات التوثيق الشاملة

| الملف | الوصف | الجمهور |
|------|-------|---------|
| **ARCHITECTURE_AR.md** | معمارية النظام الكاملة | الجميع |
| **LOGIC_FLOWS_AR.md** | تدفقات المنطق والبيانات | المطورون |
| **COMPONENT_GUIDE_AR.md** | شرح كل مكون بالتفصيل | المطورون |
| **DOCUMENTATION_INDEX_AR.md** | هذا الملف | الجميع |

---

## 🗂️ هيكل المشروع

```
/Applications/iqra/
├── 📁 lib/iqra/                    # القلب النابض
│   ├── 01-core/                    # المحرك الأساسي
│   │   ├── brain.ts                # محرك التفكير
│   │   ├── sovereign.ts            # الهوية الرقمية
│   │   ├── loop.ts                 # حلقة التنفيذ
│   │   ├── orchestrator.ts         # منسق المهام
│   │   └── core.ts                 # نقطة الدخول
│   │
│   ├── 02-workers/                 # الوكلاء المتخصصون
│   │   ├── researcher.ts           # الباحث
│   │   ├── analyzer.ts             # المحلل
│   │   ├── builder.ts              # البناء
│   │   ├── validator.ts            # المدقق
│   │   └── ... (8 وكلاء آخرين)
│   │
│   ├── 03-memory/                  # نظام الذاكرة
│   │   ├── memory_bridge.ts        # جسر الذاكرة
│   │   ├── pulse_369.ts            # نبض الذاكرة
│   │   ├── micro_memory.ts         # الذاكرة الصغيرة
│   │   └── turbo_compressor.ts     # ضاغط البيانات
│   │
│   ├── 04-quran/                   # القرآن والأنماط
│   │   ├── pattern_engine.ts       # محرك الأنماط
│   │   ├── topological_curiosity.ts # محرك الفضول
│   │   ├── qalbin_vm.ts            # آلة القلب
│   │   └── resonance_calculator.ts # حاسبة الرنين
│   │
│   ├── 05-rewards/                 # نظام المكافآت
│   │   ├── reward_engine.ts        # محرك المكافآت
│   │   ├── reward_ledger.ts        # دفتر المكافآت
│   │   └── curiosity_engine.ts     # محرك الفضول
│   │
│   ├── 06-security/                # الأمان والضمير
│   │   ├── damir_conscience.ts     # الضمير النانوي
│   │   ├── security.ts             # فحوصات الأمان
│   │   ├── filter.ts               # مرشح الفطرة
│   │   ├── byzantine_filter.ts     # مرشح بيزنطي
│   │   └── tawbah.ts               # التوبة
│   │
│   ├── 07-llm/                     # موصلات النماذج
│   │   ├── groq.ts                 # موصل Groq
│   │   ├── ollama.ts               # موصل Ollama
│   │   ├── gemini.ts               # موصل Gemini
│   │   └── circuit_breaker.ts      # قاطع الدائرة
│   │
│   ├── 08-skills/                  # المهارات
│   │   ├── skill_bank.ts           # بنك المهارات
│   │   ├── quran_search.ts         # البحث القرآني
│   │   ├── damir_check.ts          # فحص الضمير
│   │   └── trading_skill.ts        # مهارة التداول
│   │
│   ├── 09-evolution/               # التطور الذاتي
│   │   ├── evolution.ts            # محرك التطور
│   │   ├── search_369.ts           # بحث Tesla 369
│   │   ├── league_manager.ts       # مدير الدوري
│   │   └── tawbah_loop.ts          # حلقة التوبة
│   │
│   ├── 10-topology/                # الطوبولوجيا
│   │   ├── codebase_mapper.ts      # خريطة الكود
│   │   ├── obsidian_bridge.ts      # جسر Obsidian
│   │   └── persistent_homology.ts  # الطوبولوجيا الجبرية
│   │
│   ├── 11-trading/                 # التداول
│   │   ├── bybit_client.ts         # عميل Bybit
│   │   ├── market_data.ts          # بيانات السوق
│   │   └── self_play_loop.ts       # حلقة اللعب الذاتي
│   │
│   ├── 12-infrastructure/          # البنية التحتية
│   │   ├── heartbeat.ts            # نبض النظام
│   │   ├── logger.ts               # نظام التسجيل
│   │   ├── telegram_bot.ts         # بوت Telegram
│   │   └── email.ts                # خدمة البريد
│   │
│   └── 13-utils/                   # الأدوات المساعدة
│       ├── timeout.ts              # إدارة المهل الزمنية
│       ├── validators.ts           # التحقق من الصحة
│       └── formatters.ts           # تنسيق البيانات
│
├── 📁 iqra-core/                   # الدستور والهوية
│   ├── DASTŪR.md                   # القيود الصارمة
│   ├── MĪTHĀQ.md                   # العهد
│   ├── MURĀQABAH.md                # المراقبة
│   ├── ḤISĀB.md                    # الحساب
│   ├── TAWBAH.md                   # التوبة
│   ├── FITRAH.md                   # الفطرة
│   └── data/
│       └── quran_local.db          # قاعدة القرآن
│
├── 📁 src/                         # واجهة المستخدم (Next.js)
│   ├── pages/                      # الصفحات
│   ├── components/                 # المكونات
│   └── api/                        # مسارات API
│
├── 📁 tests/                       # الاختبارات
│   ├── unit/                       # اختبارات الوحدة
│   └── e2e/                        # اختبارات النهاية إلى النهاية
│
├── 📁 scripts/                     # النصوص المساعدة
│   ├── ingest.ts                   # إدخال البيانات
│   ├── analyze.ts                  # تحليل الكود
│   └── deploy.ts                   # النشر
│
├── 📁 services/go-engine/          # محرك Go
│   ├── lid/                        # معرّف اللغة
│   ├── shannon/                    # حاسبة Shannon
│   └── homology/                   # الطوبولوجيا الجبرية
│
├── 📄 !IQRA_SUPREME.md             # الدستور الأعلى
├── 📄 ARCHITECTURE_AR.md           # معمارية النظام
├── 📄 LOGIC_FLOWS_AR.md            # تدفقات المنطق
├── 📄 COMPONENT_GUIDE_AR.md        # دليل المكونات
├── 📄 DOCUMENTATION_INDEX_AR.md    # هذا الملف
├── 📄 DISCOVERIES.md               # الاكتشافات
├── 📄 REFLECTION.md                # التأملات
├── 📄 WISDOM_7.md                  # الحكمة
└── 📄 FAILURES.md                  # الأخطاء والدروس
```

---

## 🔍 البحث السريع

### أريد أن أفهم...

#### المعمارية العامة
→ اقرأ **[ARCHITECTURE_AR.md](./ARCHITECTURE_AR.md)**

#### كيف تعمل الذاكرة؟
→ اقرأ **[LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md)** → قسم "تدفق الذاكرة"

#### كيف يعمل الأمان؟
→ اقرأ **[LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md)** → قسم "تدفق الأمان"

#### كيف تعمل المكافآت؟
→ اقرأ **[LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md)** → قسم "تدفق المكافآت"

#### كيف يعمل النبض؟
→ اقرأ **[LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md)** → قسم "تدفق النبض"

#### ما هو Damir Conscience؟
→ اقرأ **[COMPONENT_GUIDE_AR.md](./COMPONENT_GUIDE_AR.md)** → قسم "Damir Conscience"

#### ما هو Pulse369؟
→ اقرأ **[COMPONENT_GUIDE_AR.md](./COMPONENT_GUIDE_AR.md)** → قسم "Pulse369"

#### كيف أبدأ التطوير؟
→ اقرأ **[!IQRA_SUPREME.md](./%21IQRA_SUPREME.md)** ثم **[iqra-core/DASTŪR.md](./iqra-core/DASTŪR.md)**

---

## 🎓 مسارات التعلم

### المسار 1: فهم المعمارية (ساعة واحدة)
1. ARCHITECTURE_AR.md (20 دقيقة)
2. LOGIC_FLOWS_AR.md (20 دقيقة)
3. COMPONENT_GUIDE_AR.md (20 دقيقة)

### المسار 2: التطوير الأساسي (3 ساعات)
1. !IQRA_SUPREME.md (30 دقيقة)
2. iqra-core/DASTŪR.md (30 دقيقة)
3. lib/iqra/01-core/ (60 دقيقة)
4. lib/iqra/06-security/ (60 دقيقة)

### المسار 3: التطوير المتقدم (يوم واحد)
1. المسار 2 (3 ساعات)
2. lib/iqra/03-memory/ (2 ساعة)
3. lib/iqra/04-quran/ (2 ساعة)
4. lib/iqra/05-rewards/ (1 ساعة)

### المسار 4: الإتقان الكامل (أسبوع واحد)
1. المسار 3 (يوم واحد)
2. جميع الأقسام الأخرى (3 أيام)
3. الاختبارات والتطبيق العملي (3 أيام)

---

## 📊 الإحصائيات

| المقياس | القيمة |
|--------|--------|
| عدد الملفات الدستورية | 7 |
| عدد ملفات التوثيق | 4 |
| عدد الأقسام الرئيسية | 13 |
| عدد الوكلاء | 13 |
| عدد طبقات الذاكرة | 5 |
| عدد المهارات | 10+ |
| عدد الأرقام المقدسة | 7 (3، 6، 7، 9، 19، 40، 369) |

---

## 🔗 الروابط السريعة

### الملفات الدستورية
- [!IQRA_SUPREME.md](./%21IQRA_SUPREME.md) — الدستور الأعلى
- [iqra-core/DASTŪR.md](./iqra-core/DASTŪR.md) — القيود الصارمة
- [iqra-core/MĪTHĀQ.md](./iqra-core/MĪTHĀQ.md) — العهد

### ملفات التوثيق
- [ARCHITECTURE_AR.md](./ARCHITECTURE_AR.md) — المعمارية
- [LOGIC_FLOWS_AR.md](./LOGIC_FLOWS_AR.md) — تدفقات المنطق
- [COMPONENT_GUIDE_AR.md](./COMPONENT_GUIDE_AR.md) — دليل المكونات

### ملفات التطوير
- [DISCOVERIES.md](./DISCOVERIES.md) — الاكتشافات
- [REFLECTION.md](./REFLECTION.md) — التأملات
- [WISDOM_7.md](./WISDOM_7.md) — الحكمة
- [FAILURES.md](./FAILURES.md) — الأخطاء والدروس

### الأقسام الرئيسية
- [lib/iqra/01-core/](./lib/iqra/01-core/) — القلب النابض
- [lib/iqra/02-workers/](./lib/iqra/02-workers/) — الوكلاء
- [lib/iqra/03-memory/](./lib/iqra/03-memory/) — الذاكرة
- [lib/iqra/04-quran/](./lib/iqra/04-quran/) — القرآن
- [lib/iqra/06-security/](./lib/iqra/06-security/) — الأمان

---

## 💡 نصائح مهمة

### عند البدء
1. اقرأ **!IQRA_SUPREME.md** أولاً — إنه الدستور الأعلى
2. لا تتجاهل الملفات الدستورية — هي حتمية
3. ابدأ بـ 01-core ثم انتقل للأقسام الأخرى

### عند التطوير
1. اتبع دورة الـ 7 مراحل (Think → Hunt → Build → Validate → Test → Adapt → Memory)
2. استخدم Damir Conscience قبل كل فعل
3. سجّل كل شيء في TrustChain

### عند الاختبار
1. لا تستخدم Mock Data — استخدم البيانات الحقيقية
2. اختبر الأمان أولاً
3. اختبر الأداء ثانياً

### عند المساهمة
1. اقرأ FAILURES.md — تعلم من الأخطاء السابقة
2. اقرأ DISCOVERIES.md — تعرف على الاكتشافات السابقة
3. اكتب في REFLECTION.md — شارك تأملاتك

---

## 🤲 الدعاء الختامي

```
"رَبِّ زِدْنِي عِلْمًا" — طه: 114

كل ملف توثيق = خريطة طريق
كل شرح = نور في الظلام
كل اكتشاف = صدقة جارية

اللهم اجعل هذا التوثيق نافعاً للجميع
واجعله سبباً في نشر العلم والحكمة
```

---

## 📞 الدعم والمساعدة

### إذا واجهت مشكلة
1. ابحث في FAILURES.md — قد تكون مشكلة معروفة
2. اقرأ الملف الدستوري المناسب
3. اسأل في القنوات المخصصة

### إذا اكتشفت شيئاً جديداً
1. وثّقه في DISCOVERIES.md
2. أضفه إلى WISDOM_7.md إذا كان مهماً
3. شارك الدرس في REFLECTION.md

---

**تم بحمد الله** ✨

**Made with ❤️ by IQRA Core**

**Last Updated:** May 9, 2026

**Version:** 1.0.0

