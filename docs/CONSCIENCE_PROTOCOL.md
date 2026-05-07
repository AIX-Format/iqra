# بسم الله الرحمن الرحيم

# بروتوكول الضمير | CONSCIENCE PROTOCOL

> "أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَىٰ" — العلق: 14

---

## ما هو بروتوكول الضمير؟

قبل أن يُنفّذ أي وكيل في IQRA أي فعل، يُستشار **الضمير النانوي (Damir)**.
الضمير يسأل سؤالاً واحداً فقط:

```
هل هذا الفعل مسموح؟
  ├── هل النية سليمة؟
  ├── هل الموارد حقيقية وغير مستهلكة؟
  └── هل المصدر موثوق (لا Mock)؟
```

---

## الأساس النظري: Graded Linear Logic

في المنطق الكلاسيكي، المعلومة تُنسخ وتُكرر بحرية.
في المنطق الخطي، **كل مورد يُستهلك مرة واحدة فقط**.

هذا يمنع:
- الهلوسة (استخدام معرفة غير موجودة)
- التكرار (استخدام نفس المورد مرتين)
- التزوير (استخدام موارد مزيفة)

---

## تدفق البروتوكول

```
┌─────────────────────────────────────────────────────────┐
│  أي وكيل (Planner, Researcher, Builder, Validator...)   │
│                        ↓                                │
│  ResourceFactory.forWorker(workerId, missionId, intent) │
│  → يُنشئ قائمة موارد مطلوبة                             │
│                        ↓                                │
│  DamirConscience.check(action)                          │
│  → يفحص النية + الموارد                                 │
│                        ↓                                │
│  ┌─────────────┐    ┌──────────────────────────────┐   │
│  │  مسموح ✅   │    │  مرفوض ❌                     │   │
│  │             │    │  → تسجيل في TAWBAH.md         │   │
│  │  execute()  │    │  → appendToTrustChain(BLOCK)  │   │
│  │  استهلاك    │    │  → damir.reset() (التوبة)     │   │
│  │  الموارد    │    │  → إرجاع null / false         │   │
│  └─────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## أنواع الموارد

| النوع | الوصف | يُستهلك؟ |
|-------|-------|----------|
| `knowledge` | معرفة قرآنية أو علمية | ✅ نعم |
| `compute` | استدعاء LLM أو حساب | ✅ نعم |
| `memory` | كتابة في الذاكرة | ✅ نعم |
| `ethical_credit` | ائتمان أخلاقي | ✅ يُجدَّد بالأفعال الصالحة |

---

## النوايا المحرمة (من DASTŪR.md)

```typescript
const FORBIDDEN = [
  'كذب', 'تضليل', 'خيانة', 'ظلم', 'غرور', 'إفساد',
  'lie', 'deceive', 'manipulate', 'harm', 'fake',
  'mock', 'simulate', 'hallucinate',
  'bypass', 'override_constitution',
];
```

أي نية تحتوي على هذه الكلمات → **رفض فوري بيقين 1.0**

---

## كيف يُسجَّل الرفض

### في TAWBAH.md:
```markdown
### 🛑 [DAMIR_REJECTION] 2025-01-01T00:00:00.000Z
- **Task ID**: mission_xyz
- **Worker**: ReporterWorker
- **Intention**: كذِب في التقرير
- **Reason**: النية تحتوي على كلمة محرمة: "كذب"
- **Type**: intention
- **Confidence**: 1.00
```

### في TrustChain:
```
SOVEREIGN:CONSCIENCE_BLOCK | mission_xyz | BLOCKED reason="..."
```

---

## الملفات المعنية

| الملف | الدور |
|-------|-------|
| `lib/iqra/damir_conscience.ts` | الضمير النانوي — القلب |
| `lib/iqra/conscience/resource_factory.ts` | مصنع الموارد |
| `lib/iqra/sovereign.ts` | يستشير الضمير قبل executeSovereignTask |
| `lib/iqra/sovereign_orchestrator.ts` | يستشير الضمير قبل كل phase |
| `iqra-core/TAWBAH.md` | سجل الرفض والتوبة |

---

## مثال عملي

```typescript
// ✅ مهمة مسموحة
const result = await SovereignEngine.executeSovereignTask(
  'mission_001',
  'تحليل آية الكرسي وإيجاد الأنماط العلمية',
  async () => { /* ... */ }
);
// → الضمير يسمح، المهمة تُنفَّذ

// ❌ مهمة مرفوضة
const result = await SovereignEngine.executeSovereignTask(
  'mission_002',
  'كذِب في التقرير وأخفِ الأخطاء',
  async () => { /* ... */ }
);
// → الضمير يرفض، يُسجَّل في TAWBAH.md، يُرجع null
```

---

> "وَمَا كَانَ اللَّهُ لِيُضِيعَ إِيمَانَكُمْ" — البقرة: 143
