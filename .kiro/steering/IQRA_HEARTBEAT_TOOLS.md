# بسم الله الرحمن الرحيم
# IQRA HEARTBEAT & TOOLS — النبض والأدوات

> "وَهُوَ الَّذِي يُحْيِي وَيُمِيتُ" — يونس: 56
> "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31

---

## 💓 Heartbeat — نبض الحياة

### الملف
`lib/iqra/heartbeat.ts` → `IQRAHeartbeat`

### الاستخدام
```typescript
import { IQRAHeartbeat } from './heartbeat';

// بدء النبض
await IQRAHeartbeat.start('mission-001');

// الاشتراك في التقارير
const unsubscribe = IQRAHeartbeat.onBeat((report) => {
  console.log(`Status: ${report.status} | Beats: ${report.beat_count}`);
});

// فحص الحالة
const status = IQRAHeartbeat.getStatus(); // 'ALIVE' | 'DEGRADED' | 'CRITICAL'

// طباعة تقرير جميل
IQRAHeartbeat.printStatus();

// إيقاف النبض
IQRAHeartbeat.stop();
```

### دورات النبض
| الفترة | الحدث |
|--------|-------|
| كل 9 ثانية | health check (Redis + Qdrant + QuranDB + GoEngine) |
| كل 27 ثانية | Pulse369.tick() + memory stats |
| كل 81 ثانية | self-review + curiosity update |
| كل ~369 ثانية | deep pattern analysis + Obsidian sync |

### حالات النظام
- `ALIVE` → كل الخدمات تعمل ✅
- `DEGRADED` → بعض الخدمات غير متاحة ⚠️
- `CRITICAL` → كل الخدمات معطلة 🚨
- `STOPPED` → النبض متوقف ⛔

---

## 🛠️ Tools Registry — سجل الأدوات

### الملف
`lib/iqra/tools_registry.ts` → `ToolsRegistry`

### الاستخدام
```typescript
import { ToolsRegistry } from './tools_registry';

// استدعاء أداة
const result = await ToolsRegistry.call('quran.get_verse', {
  surah: 1,
  ayah: 1,
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// قائمة الأدوات
const quranTools = ToolsRegistry.list('QURAN');

// تسجيل أداة مخصصة
ToolsRegistry.register({
  name: 'custom.my_tool',
  description_ar: 'أداة مخصصة',
  description_en: 'Custom tool',
  category: 'SYSTEM',
  inputSchema: z.object({ text: z.string() }),
  handler: async ({ text }) => ({ result: text.toUpperCase() }),
});
```

### الأدوات المتاحة

#### 📖 QURAN
| الأداة | الوصف |
|--------|-------|
| `quran.get_verse` | جلب آية بالسورة والآية |
| `quran.search` | بحث في القرآن بكلمة |
| `quran.analyze_pattern` | تحليل نمط رياضي/دلالي |
| `quran.compute_shannon` | حساب Shannon H_EL |
| `quran.discover_resonance` | اكتشاف الرنين بين آيات |
| `quran.validate_numerical` | التحقق من الأنماط الرقمية (7، 19، 40، 369) |

#### 🧠 MEMORY
| الأداة | الوصف |
|--------|-------|
| `memory.store` | تخزين قيمة (hot/warm/cold) |
| `memory.retrieve` | استرجاع قيمة |
| `memory.search_semantic` | بحث دلالي عبر Qdrant |
| `memory.store_pattern` | تخزين نمط قرآني |
| `memory.get_stats` | إحصائيات الذاكرة |
| `memory.pulse_tick` | نبضة Pulse369 يدوية |
| `memory.grant_reward` | منح مكافأة للفضول |

#### ⚙️ SYSTEM
| الأداة | الوصف |
|--------|-------|
| `system.heartbeat_status` | حالة النبض |
| `system.start_heartbeat` | بدء النبض |
| `system.stop_heartbeat` | إيقاف النبض |
| `system.list_tools` | قائمة الأدوات |
| `system.get_tool_stats` | إحصائيات الاستدعاءات |

#### 🔐 SECURITY
| الأداة | الوصف |
|--------|-------|
| `security.validate_input` | التحقق من المدخلات (RULE 1) |
| `security.check_circuit` | فحص circuit breaker |
| `security.get_trust_chain_length` | طول سجل الثقة |

#### 🔌 MCP
| الأداة | الوصف |
|--------|-------|
| `mcp.qdrant_search` | بحث في Qdrant عبر MCP |
| `mcp.filesystem_read` | قراءة ملف عبر MCP |
| `mcp.memory_store` | تخزين في MCP memory |

---

## 🔄 دورة الحياة الكاملة

```
بدء التشغيل
    ↓
ToolsRegistry.init()  ← تلقائي عند الاستيراد
    ↓
IQRAHeartbeat.start()
    ↓
كل 9 ثانية:
  ├─ checkRedis()
  ├─ checkQdrant()
  ├─ checkQuranDB()
  └─ checkGoEngine()
    ↓
كل 27 ثانية:
  └─ Pulse369.tick()
       ├─ promoteHotToWarm()
       └─ triggerDeepAnalysis()
    ↓
كل 81 ثانية:
  └─ selfReview()
       └─ updateCuriosity()
    ↓
كل 369 ثانية:
  └─ deepAnalysisPipeline()
       ├─ analyzePatterns()
       ├─ writeObsidian()
       └─ triggerInfraNodus()
```

---

## 📋 القواعد المطبّقة

| القاعدة | التطبيق |
|---------|---------|
| RULE 0: Security | كل استدعاء يمر عبر security check |
| RULE 1: Zod | كل مدخل يُتحقق منه بـ Zod schema |
| RULE 3: TrustChain | كل نبضة وكل استدعاء أداة يُسجَّل |
| RULE 4: Self-Review | كل 81 ثانية مراجعة ذاتية |
| RULE 5: Meta-Loop | Pulse369 يُشغَّل كل 27 ثانية |
| RULE 7: Curiosity | تحديث curiosity score كل 81 ثانية |
| RULE 8: Circuit Breaker | كل أداة خارجية محمية بـ circuit breaker |

---

## 🤲 الدعاء

```
"رَبِّ زِدْنِي عِلْمًا" — طه: 114

كل نبضة = ذكر
كل أداة = خدمة
كل اكتشاف = صدقة جارية
```

**Made with ❤️ by Moe Abdelaziz**
