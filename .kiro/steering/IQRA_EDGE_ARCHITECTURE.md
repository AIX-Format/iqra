# بسم الله الرحمن الرحيم
# IQRA Edge Architecture — المعمارية القرآنية للحافة

> "وَلَقَدۡ ءَاتَیۡنَـٰكَ سَبۡعࣰا مِّنَ ٱلۡمَثَانِي وَٱلۡقُرۡءَانَ ٱلۡعَظِیمَ" — الحجر:87

---

## 🌌 الأرقام القرآنية في الكود

| الرقم | الآية | التطبيق في الكود |
|-------|-------|-----------------|
| **7** | الملك:3 — سبع سماوات طباقاً | 7 خبراء، 7 طبقات ذاكرة، 7×7=49 Working Memory |
| **19** | المدثر:30 — عليها تسعة عشر | كل 19 استدعاء → فحص أمني، TrustChain hash |
| **3** | الزمر:6 — ظلمات ثلاث | 3 طبقات ذاكرة (Hot/Warm/Cold) |
| **9** | الفجر:3 — الشفع والوتر | Pulse369: كل 9 → ترقية |
| **40** | — | كل 40 دورة → Tazkiyah تطهير |
| **1** | الوتر | نموذج واحد نشط في كل وقت |

---

## 🏗️ الملفات الجديدة

```
lib/iqra/edge/
├── ARCHITECTURE.md        ← التصميم الكامل
├── task_classifier.ts     ← الموجّه الذكي (< 1ms، بدون LLM)
└── model_orchestrator.ts  ← المنسق (تحميل/تفريغ النماذج)
```

---

## 🧭 الاستخدام

```typescript
import { globalClassifier } from './edge/task_classifier';
import { globalOrchestrator } from './edge/model_orchestrator';

// 1. تصنيف المهمة
const task = globalClassifier.classify(userInput);
// → { type: 'topology', confidence: 0.88, entities: { verse_ref: '2:255' } }

// 2. توجيه للنموذج المناسب
const result = await globalOrchestrator.route(task, userInput, async (modelName, input) => {
  // استدعاء Ollama بالنموذج المحدد
  return await callOllama(modelName, input);
});
```

---

## ⚡ قاعدة الوتر والشفع

```typescript
// ﴿وَٱلشَّفۡعِ وَٱلۡوَتۡرِ﴾ — الفجر:3
const PERMANENT = ['memory_operation', 'conscience_check']; // الشفع — دائم
const ACTIVE_LIMIT = 1;                                      // الوتر — واحد فقط
```

---

## 📊 النماذج السبعة

| # | الاسم | النموذج | RAM | الحالة |
|---|-------|---------|-----|--------|
| 1 | الكاتب | gemma3:4b | 3.2GB | متغير |
| 2 | القارئ | qwen2.5:7b | 4.8GB | متغير |
| 3 | البصيرة | moondream:1.8b | 1.1GB | متغير |
| 4 | السمع | whisper-small | 1.5GB | متغير |
| 5 | الطوبولوجي | liquid/lfm2:1.2b | 750MB | متغير |
| 6 | الذاكرة | nomic-embed-text | 300MB | **دائم** |
| 7 | الضمير | كود فقط | <10MB | **دائم** |

---

## 🤲 الدعاء

```
"رَبِّ زِدۡنِی عِلۡمًا" — طه:114

كل نموذج = خبير متخصص
كل توجيه = حكمة
كل اكتشاف = آية من آيات الله
```

**Made with ❤️ by Moe Abdelaziz**
