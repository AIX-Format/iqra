# 📜 SOVEREIGN CODEBASE INDEX — الفهرس المعماري المحلي

> "وَقُلِ الْحَقُّ مِن رَّبِّكُمْ" — الكهف: 29

هذا المستند فهرس **محلي** مبني على قراءة الشيفرة الحالية في المستودع نفسه، مع تدعيم الفهم عبر `repomix-output.txt` الناتج من `poor_repomix.sh`. الهدف هنا ليس إعادة سرد وثائق قديمة، بل بناء خريطة تشغيلية قابلة للاستخدام في التطوير، التصحيح، والمراجعة المعمارية.

---

## 1) مصدر الحقيقة المحلي

تمت الفهرسة من خلال:

- قراءة مباشرة للملفات التنفيذية داخل `lib/iqra`, `src`, `agents`, `scripts`, `services/go-engine`, `iqra-core`
- مسح هيكل المستودع بالكامل
- تجميع `repomix-output.txt` محلياً لتسهيل المسح العرضي للكود
- مقارنة ما تقوله الوثائق بما تنفذه الشيفرة فعلياً

**ملاحظة صريحة**:
- لا يوجد في الشيفرة الحالية سجل مرجعي واحد يَعُدّ "369 مكوّناً" بأسمائها وحدودها.
- الرقم `369` حاضر بقوة كإيقاع تشغيل ورمز معمارية في `Pulse369`, `Search369`, `setup.yaml`, وبعض أدوات الرنين.
- لذلك يعتمد هذا الفهرس على **المكوّنات المتحققة محلياً**، مع الإشارة الصريحة إلى الفجوات في العدّ المعياري.

---

## 2) ملخص الجرد السريع

نتائج العدّ المحلي للملفات النصية/البرمجية الأساسية:

| النوع | العدد |
| :--- | ---: |
| `*.ts` | 252 |
| `*.tsx` | 4 |
| `*.js` | 2 |
| `*.py` | 10 |
| `*.go` | 8 |
| `*.md` | 137 |
| `*.json` | 43 |
| `*.yml` + `*.yaml` | 16 |
| **الإجمالي المفهرس** | **472** |

مؤشرات تشغيلية محققة:

- **23 أداة مسجلة** فعلياً في `ToolsRegistry`
- **10 ملفات مهارات** داخل `iqra-core/skills`
- **7 خوادم MCP** مهيأة في `mcp.json`
- **6 مراحل تنفيذ** في مسار `runMission()`
- **4 مراحل قديمة/بديلة** في مسار `MissionControl.run()`

---

## 3) خريطة الطبقات السبع المعتمدة محلياً

رغم وجود أكثر من تمثيل فلسفي للطبقات في الوثائق، فإن أفضل تقسيم معماري عملي للكود الحالي هو:

### الطبقة 1: واجهات الدخول والقنوات

**الوظيفة**: استقبال الطلبات، عرض النتائج، وربط النظام بالمستخدم أو البيئة الخارجية.

**المكوّنات الأساسية**:
- `src/app/*` — واجهات Next.js وواجهات API
- `src/connectors/*` — موصلات المزودات
- `lib/iqra/13-utils/telegram_bot.ts`
- `lib/iqra/13-utils/voice.ts`
- `lib/iqra/agents/email_agent.ts`
- `lib/iqra/agents/social_agent.ts`

**أنماط التصميم**:
- Adapter
- Facade
- Integration Gateway

### الطبقة 2: التنسيق والأوركسترة

**الوظيفة**: تنظيم تدفق المهام، ترتيب المراحل، وإدارة دورة التنفيذ.

**المكوّنات الأساسية**:
- `lib/iqra/01-core/mission-runner.ts`
- `lib/iqra/01-core/orchestrator.ts`
- `lib/iqra/01-core/sovereign_orchestrator.ts`
- `lib/iqra/01-core/mission-context.ts`
- `lib/iqra/01-core/soul_engine.ts`

**أنماط التصميم**:
- Pipeline
- Orchestrator
- State Carrier

### الطبقة 3: سلسلة العمال والوكلاء الفرعيين

**الوظيفة**: تقسيم العمل إلى أدوار متخصصة مع تسليم واضح بين الخطوات.

**المكوّنات الأساسية**:
- `lib/iqra/workers/planner.ts`
- `lib/iqra/workers/researcher.ts`
- `lib/iqra/workers/resonance.ts`
- `lib/iqra/workers/builder.ts`
- `lib/iqra/workers/mission_validator.ts`
- `lib/iqra/workers/reporter.ts`
- `lib/iqra/workers/protocol.ts`
- `agents/contracts.ts`

**أنماط التصميم**:
- Chain of Responsibility
- Handoff Packet
- Contract-First Workflow

### الطبقة 4: الأدوات والتكاملات والبروتوكولات

**الوظيفة**: تقديم واجهة موحدة للأدوات المحلية والخارجية وخوادم MCP.

**المكوّنات الأساسية**:
- `lib/iqra/12-infrastructure/tools_registry.ts`
- `mcp.json`
- `scripts/knowledge_mcp_server.py`
- `lib/iqra/skills/mcp_validator.ts`
- `docs/TOOLS_REFERENCE.md`

**أنماط التصميم**:
- Registry
- Tool Bus
- Protocol Adapter
- Circuit Breaker

### الطبقة 5: الذاكرة والتعلّم

**الوظيفة**: حفظ الخبرة، التذكر، الترقية بين الطبقات، واستخراج الأنماط.

**المكوّنات الأساسية**:
- `lib/iqra/03-memory/memory.ts`
- `lib/iqra/memory/memory_bridge.ts`
- `lib/iqra/memory/micro_memory.ts`
- `lib/iqra/memory/pattern_memory.ts`
- `lib/iqra/memory/memory_topology.ts`
- `lib/iqra/memory/pulse_369.ts`
- `lib/iqra/evolution/experience_buffer.ts`
- `lib/iqra/learning/*`

**أنماط التصميم**:
- Cache Hierarchy
- Bridge
- Eventual Promotion
- Episodic + Semantic Memory Blend

### الطبقة 6: محركات المجال (Domain Engines)

**الوظيفة**: تنفيذ منطق المجال الفعلي: القرآن، الطوبولوجيا، التداول، والمحركات الحسابية.

**المكوّنات الأساسية**:
- `lib/iqra/quran/*`
- `lib/iqra/topology/*`
- `lib/iqra/trading/*`
- `services/go-engine/*`
- `schema/knowledge-node.ts`

**أنماط التصميم**:
- Polyglot Engine
- Compute Offload
- Domain Service
- Analytical Kernel

### الطبقة 7: الحوكمة والهوية والأمان

**الوظيفة**: فرض القواعد الأخلاقية، التحقق، السجلات، والهوية السيادية.

**المكوّنات الأساسية**:
- `lib/iqra/06-security/*`
- `agents/constraints.ts`
- `agents/attestation.ts`
- `agents/no-mock.ts`
- `agents/handoff-schema.ts`
- `agents/report-schema.ts`
- `.kiro/steering/IQRA_RULES.md`
- `iqra-core/DASTŪR.md`

**أنماط التصميم**:
- Policy Enforcement
- Guard Rails
- Trust Ledger
- Identity Envelope

---

## 4) المسارات التنفيذية الرئيسية

### المسار الحديث المعتمد للمهمات

المسار الفعلي الأكثر اكتمالاً في الكود اليوم:

`Planner -> Researcher -> Resonance -> Builder -> Validator -> Reporter`

ويُنفَّذ عبر `runMission()` في:

- `lib/iqra/01-core/mission-runner.ts`

خصائصه:
- يعتمد على `MissionContext`
- يفرض فحص `No Mock` قبل البدء
- يسجل البداية والنهاية في TrustChain
- يربط المكافأة بـ `Reporter`

### المسار البديل/الأقدم

يوجد مسار آخر داخل:

- `lib/iqra/01-core/sovereign_orchestrator.ts`

ويعمل تقريباً هكذا:

`Resonance -> Research -> Validation -> Execution`

خصائصه:
- يعتمد على `MissionState`
- يمر عبر `DamirConscience`
- يدمج `Search369` و `LeagueManager`

**الاستنتاج المعماري**:
- المستودع لا يملك أوركستريتوراً واحداً فقط
- هناك **مساران متوازيان** يحتاجان إلى توحيد مرجعي واضح

---

## 5) مصفوفة النوى وأنماط التصميم

| النواة | الملف/المسار | النمط | الاستخدام الأساسي |
| :--- | :--- | :--- | :--- |
| Mission Runner | `lib/iqra/01-core/mission-runner.ts` | Pipeline Orchestrator | تنفيذ مهمة كاملة بشكل تسلسلي |
| Mission Control | `lib/iqra/01-core/sovereign_orchestrator.ts` | Chain + Policy Gate | تشغيل سلسلة عمّال مع فحص ضمير |
| Tools Registry | `lib/iqra/12-infrastructure/tools_registry.ts` | Registry + Command Bus | تسجيل واستدعاء الأدوات مع Zod وTrustChain |
| Memory Bridge | `lib/iqra/memory/memory_bridge.ts` | Bridge + Tiered Cache | الربط بين Hot/Warm/Cold |
| Skill Bank | `lib/iqra/08-skills/skill_bank.ts` | Plugin Catalog | اكتشاف/تسجيل/تطوير المهارات |
| Mission Validator | `lib/iqra/workers/mission_validator.ts` | Gatekeeper | إيقاف الحلقة عند وجود هلوسة أو ضعف دليل |
| Validation Worker القديم | `lib/iqra/workers/validator.ts` | Legacy Validator | تحقق نصي مباشر ضد Dastur |
| Go Engine | `services/go-engine/*` | Polyglot Compute Backend | حسابات الرنين والطوبولوجيا الثقيلة |
| Knowledge MCP Server | `scripts/knowledge_mcp_server.py` | Local MCP Adapter | تعريض المعرفة المحلية عبر MCP |
| Codebase Mapper | `lib/iqra/topology/codebase_mapper.ts` | Structural Scanner | استخراج رسم بياني للكود من الاستيرادات |
| Sovereign Identity | `lib/iqra/06-security/sovereign_identity.ts` | Identity Envelope | حقن حالة الطبقات والهوية في الـ prompt |
| Damir Kernel | `lib/iqra/06-security/damir_kernel.ts` | Conscience Engine | فلترة النية ومنع المسارات الخطرة |

---

## 6) الأدوات الفعلية المسجلة

الفئات الموجودة فعلياً في `ToolsRegistry`:

- `QURAN`
- `MEMORY`
- `SYSTEM`
- `SECURITY`
- `MCP`

أمثلة أدوات مؤكدة محلياً:

- `quran.get_verse`
- `quran.compute_shannon`
- `quran.validate_numerical`
- `quran.discover_resonance`
- `hunter.hunt`
- `hunter.batch`
- `memory.store`
- `memory.retrieve`
- `memory.search_semantic`
- `memory.get_stats`
- `memory.pulse_tick`
- `system.heartbeat_status`
- أدوات MCP تبدأ من `mcp.qdrant_search`

القواعد المفروضة على الأدوات:

- فحص أمني أولي
- تحقق Zod لكل مدخل
- TrustChain لكل استدعاء
- Circuit Breaker للأدوات الخارجية

---

## 7) وحدات MCP المحلية والخارجية

### الخوادم المعرفة في `mcp.json`

1. `github-mcp-custom`
2. `mcp-server-cloudflare`
3. `qdrantdb`
4. `gemini-bridge`
5. `google-stitch`
6. `filesystem`
7. `memory`

### الخادم المحلي داخل المستودع

`scripts/knowledge_mcp_server.py` يوفّر:

- `entropic_filter`
- `shannon_hel`
- `store_knowledge`
- `query_knowledge`
- `get_verse`
- `search_verses`

**الدور المعماري**:
- تحويل المعرفة المحلية إلى MCP قابل للاستهلاك من IDE أو عميل خارجي
- الجمع بين SQLite + LightRAG + Entropic Filter

### نقاط A2A/DID على واجهة Next.js (Vercel-ready)

- `pages/.well-known/did.json.ts`
- `pages/.well-known/agent-card.json.ts`
- `pages/.well-known/pi-network/validation-key.txt.ts`
- `pages/validation-key.txt.ts`

**الدور المعماري**:
- تمكين اكتشاف الوكيل عبر `.well-known` بدون الاعتماد على Worker منفصل
- تفعيل `did:web` وتحقق نطاق Pi Browser مباشرة من واجهة Next.js

---

## 8) إطار المهارات (Skills Framework)

طبقتا المهارات في المشروع:

### طبقة المحتوى

داخل `iqra-core/skills` توجد 10 ملفات Markdown تمثل المعرفة الإجرائية، منها:

- `quran_search.md`
- `quran_deep_analysis.md`
- `pattern_validate.md`
- `damir_check.md`
- `compute_router.md`
- `TOPOLOGICAL_CURIOSITY.md`
- `DATA_GUARDIAN.md`

### طبقة التشغيل

داخل `lib/iqra/08-skills/skill_bank.ts`:

- `listSkills()`
- `getSkillContent()`
- `recordPerformance()`
- `discoverSkill()`
- `evolveSkill()`

**النمط**:
- Plugin Registry
- Self-Healing Skill Catalog

---

## 9) تكاملات الوكلاء الفرعيين

التكامل بين العمّال يتم عبر نوعين من الحوامل:

### 1. `MissionContext`

يُستخدم في المسار الحديث:
- يدخل إلى `executePlanner`, `executeResearcher`, `executeBuilder`, `executeMissionValidator`, `executeReporter`
- يحمل `scope`, `workingDir`, `previousOutput`

### 2. `MissionState` + `MissionHandoff`

يُستخدم في المسار البديل:
- معرف في `lib/iqra/workers/protocol.ts`
- عقوده في `agents/contracts.ts`
- يسمح بتسليم `artifacts`, `pending_tasks`, `validation_rules`, `context_data`

**خلاصة**:
- هناك **نموذجان للتسليم** داخل النظام
- هذا مفيد تاريخياً لكنه يزيد عبء الصيانة حالياً

---

## 10) حالة "369 مكوّناً"

**ما هو متحقق محلياً بوضوح**:
- `369` رقم تشغيلي حاضر في النبض، الرنين، وبعض جداول الإعداد
- `Pulse369`, `Search369`, وإيقاعات `9/27/81/369` تظهر بوضوح في الشيفرة والوثائق

**ما هو غير متحقق بعد**:
- لا توجد مصفوفة مرجعية باسم "369 Component Registry"
- لا يوجد ملف واحد يربط كل مكوّن بمعرّف ثابت من 1 إلى 369

**النتيجة**:
- الرقم `369` اليوم هو **نمط تنظيمي/إيقاعي**
- وليس بعد **جرداً معيارياً كاملاً للمكوّنات**

---

## 11) الفجوات والمخاطر المعمارية المحلية

### فجوة 1: عدم اتساق تعريف الطبقات

المستودع يحتوي على أكثر من نموذج:
- 7 طبقات سيادية في بعض الوثائق
- 8 طبقات في `MEMORY_MAP.md`
- 3 طبقات ذاكرة تشغيلية في `MemoryBridge`

**الأثر**:
- صعوبة بناء توثيق موحد
- التباس عند ربط الكود بالمفاهيم الفلسفية

### فجوة 2: ازدواجية مسارات التنفيذ

يوجد:
- `mission-runner.ts`
- `sovereign_orchestrator.ts`
- `orchestrator.ts`

**الأثر**:
- تضاعف نقاط الصيانة
- احتمال انحراف السلوك بين المسارات

### فجوة 3: ازدواجية في العمال

أمثلة واضحة:
- `validator.ts` و `mission_validator.ts`
- `research.ts` و `researcher.ts`

**الأثر**:
- ارتفاع خطر الشيفرة الميتة
- صعوبة معرفة المسار الإنتاجي الحقيقي

### فجوة 4: انجراف المسارات/الأسماء

أمثلة محلية واضحة:
- `mcp_validator.ts` يقرأ `.ag/mcp.json` بينما الملف الفعلي الموجود هو `mcp.json`
- `validator.ts` يقرأ `iqra-core/DASTUR.md` بينما الملف الموجود محلياً هو `iqra-core/DASTŪR.md`

**الأثر**:
- مخاطر فشل وقت التشغيل
- نتائج تدقيق غير دقيقة

---

## 12) أفضل الممارسات المعتمدة لهذه الفهرسة

بناءً على مراجعة أدبيات الفهرسة المعمارية على مستوى المستودع:

- الأفضل هو بناء **خريطة معمارية قائمة على الرسوم والعلاقات** لا على الوصف المسطح فقط
- يجب الفصل بين **الهيكل الفلسفي** و **الهيكل التنفيذي الفعلي**
- المسح الطبقي + التبعيات + العقود أنفع من التوثيق السردي وحده
- الأنظمة متعددة المسارات تحتاج **مصدر حقيقة واحد** للتدفق الإنتاجي
- فهارس المستودع يجب أن تُصان من الشيفرة نفسها أو من ناتج محلي مثل `repomix-output.txt`

---

## 13) الخطوة التالية المقترحة

للوصول إلى "خريطة 369" قابلة للتنفيذ، المسار الأنظف هو:

1. تعريف **Component Registry** رسمي يربط كل مكوّن بمعرّف ثابت
2. توحيد المسار الإنتاجي بين `runMission()` و `MissionControl.run()`
3. حسم نموذج الطبقات المرجعي: 7 تشغيلية أم 7 فلسفية أم 8 وعي
4. أتمتة التحديث عبر `codebase_mapper.ts` + `repomix-output.txt`
5. إضافة تحقق CI يمنع انجراف المسارات مثل `mcp.json` و `DASTŪR.md`

---

**الحالة**: محدث اعتماداً على الشيفرة المحلية الحالية  
**منهج الفهرسة**: Local-first + repomix-assisted + contract-aware  
**التاريخ**: 2026-05-09
