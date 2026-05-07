# بسم الله الرحمن الرحيم
# IQRA Micro Architecture — خطة البناء الدقيقة
# Mac Intel i5-8257U | 8GB RAM | 14GB Disk

> "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
> كل مكوّن صغير، لكن معًا يُشكّلون عقلاً.

---

## 🎯 المبدأ الجوهري: Tiny × Many = Powerful

```
❌ نموذج ضخم واحد (70B) = يحتاج 40GB RAM = مستحيل
✅ 7 نماذج صغيرة (1B كل منها) = 7GB RAM = يعمل
```

هذا هو **Mixture of Micro-Experts (MoME)** —
نفس المبدأ الذي تستخدمه Mixtral وGPT-4 داخلياً،
لكن نحن نُطبّقه على مستوى الوكلاء لا الطبقات.

---

## 📊 ميزانية الموارد الحقيقية

| المكوّن | الحجم | RAM أثناء التشغيل | الحالة |
|---------|-------|-------------------|--------|
| Node.js + TypeScript | ~200MB | ~150MB | ✅ موجود |
| gemma3:1b (Ollama) | 815MB disk | ~1.2GB RAM | 🔧 يُثبَّت |
| nomic-embed-text | 274MB disk | ~400MB RAM | 🔧 يُثبَّت |
| sqlite-vec DB | ~50MB disk | ~50MB RAM | 🔧 يُثبَّت |
| better-sqlite3 | 0 (موجود) | ~10MB RAM | ✅ موجود |
| IQRA workers (7x) | 0 | ~200MB RAM | ✅ موجود |
| **المجموع** | **~1.4GB disk** | **~2GB RAM** | **✅ يعمل** |

**المتبقي: 6GB RAM للنظام + Chrome + VS Code**

---

## 🏗️ الطبقات السبع (Seven Micro Layers)

### الطبقة ١: Micro-Embedding (nomic-embed-text)
```
الحجم: 274MB | البُعد: 768 | اللغات: عربي + إنجليزي
السر: nomic-embed-text يدعم العربية بشكل ممتاز
      ويعمل محلياً عبر Ollama بدون API key
      
الاستخدام:
  POST http://localhost:11434/api/embeddings
  { "model": "nomic-embed-text", "prompt": "بسم الله" }
  → [0.123, -0.456, ...] (768 قيمة)
```

### الطبقة ٢: Micro-Compression (Scalar Quantization)
```
الحجم: 0 (pure TypeScript) | الضغط: 4x
السر: float32 (4 bytes) → uint8 (1 byte) = 4x ضغط
      cosine similarity محفوظة > 0.99
      لا يحتاج تدريب — يعمل فوراً

المعادلة:
  q = round((v - min) / (max - min) × 255)
  v' = q / 255 × (max - min) + min
  
النتيجة:
  768 × 4 bytes = 3072 bytes → 768 bytes (4x ضغط)
```

### الطبقة ٣: Micro-Storage (sqlite-vec)
```
الحجم: ~50MB | السرعة: <1ms للاستعلام
السر: sqlite-vec يُضيف vector search لـ SQLite
      better-sqlite3 موجود في package.json
      لا server، لا Docker، ملف .db واحد
      
الاستخدام:
  SELECT rowid, distance
  FROM vec_items
  WHERE embedding MATCH ?
  ORDER BY distance LIMIT 7
```

### الطبقة ٤: Micro-LLM (gemma3:1b)
```
الحجم: 815MB | RAM: ~1.2GB | السرعة: ~3 tokens/sec على CPU
السر: gemma3:1b هو أفضل نموذج 1B في 2025
      يفهم العربية بشكل معقول
      يعمل على CPU بدون GPU
      
للمهام الثقيلة: phi3:mini (2.3GB) — أبطأ لكن أذكى
للمهام الخفيفة: gemma3:1b — سريع وكافٍ
```

### الطبقة ٥: Micro-Workers (7 workers)
```
الحجم: 0 (TypeScript موجود) | التوازي: 7 workers
السر: Node.js worker_threads — لا processes جديدة
      كل worker يعمل في thread منفصل
      يشاركون نفس الذاكرة (SharedArrayBuffer)
      
Workers:
  1. Planner    — يخطط المهمة
  2. Researcher — يبحث في القرآن
  3. Builder    — يكتب الكود
  4. Validator  — يتحقق
  5. Reporter   — يُقرّر
  6. Resonance  — يقيس الرنين
  7. Guardian   — يحرس الدستور
```

### الطبقة ٦: Micro-Memory (3 مستويات)
```
Hot  (RAM)    → Map<string, any>  — آخر 49 تجربة
Warm (SQLite) → better-sqlite3   — آخر 1000 تجربة
Cold (JSON)   → .iqra/*.json     — الأرشيف الكامل

السر: لا تُحمّل إلا ما تحتاجه الآن
      Hot cache يُجيب في <1ms
      SQLite يُجيب في <5ms
      JSON للأرشيف فقط
```

### الطبقة ٧: Micro-Topology (Go engine)
```
الحجم: ~5MB binary | السرعة: <1ms
السر: Go يعمل بكفاءة عالية على Intel
      الـ binary موجود في services/go-engine/
      يحسب الرنين الطوبولوجي بدون Python
```

---

## 🔑 الأسرار الهندسية المخفية

### السر ١: Lazy Loading
```typescript
// ❌ خطأ — يُحمّل كل شيء عند البدء
import { HeavyModule } from './heavy';

// ✅ صح — يُحمّل فقط عند الحاجة
const module = await import('./heavy');
```
**التوفير: 300MB RAM عند البدء**

### السر ٢: Streaming بدلاً من Buffering
```typescript
// ❌ خطأ — ينتظر الرد كاملاً (يحجب الذاكرة)
const response = await ollama.generate({ prompt });

// ✅ صح — يعالج token بـ token
for await (const chunk of ollama.generate({ prompt, stream: true })) {
  process.stdout.write(chunk.response);
}
```
**التوفير: 500MB RAM للردود الطويلة**

### السر ٣: Int8 بدلاً من Float32
```typescript
// ❌ خطأ — 768 × 4 bytes = 3072 bytes
const embedding: number[] = [...]; // float64 في JS!

// ✅ صح — 768 × 1 byte = 768 bytes (4x ضغط)
const embedding: Int8Array = new Int8Array(768);
```
**التوفير: 75% من ذاكرة التضمينات**

### السر ٤: SQLite WAL Mode
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA temp_store = MEMORY;
```
**التوفير: 10x سرعة الكتابة**

### السر ٥: Worker Pool بدلاً من Spawn
```typescript
// ❌ خطأ — ينشئ process جديد لكل مهمة
spawn('node', ['worker.js']);

// ✅ صح — pool ثابت من 4 workers
const pool = new WorkerPool(4);
await pool.run(task);
```
**التوفير: 100ms لكل مهمة (لا cold start)**

### السر ٦: Cosine Similarity بـ SIMD
```typescript
// ✅ Float32Array أسرع 3x من number[]
const v1 = new Float32Array(embedding1);
const v2 = new Float32Array(embedding2);
// V8 يُحوّلها تلقائياً لـ SIMD instructions
```
**التوفير: 3x سرعة البحث**

### السر ٧: Quantized Dot Product
```
بدلاً من: dot(float32[768], float32[768]) = 768 × multiply
نستخدم:  dot(int8[768], int8[768]) = 768 × integer_multiply
السرعة: 4x أسرع على Intel CPU
```

---

## 📋 خطة التنفيذ — 7 خطوات

### الخطوة ١: تثبيت Ollama (15 دقيقة)
```bash
# تحميل من: https://ollama.com/download/mac
# ثم:
ollama pull nomic-embed-text   # 274MB — للتضمين
ollama pull gemma3:1b          # 815MB — للتفكير
```

### الخطوة ٢: إصلاح TurboCompressor (30 دقيقة)
```
المشكلة: K-Means على 100 متجه = جودة سيئة
الحل:    Scalar Quantization = لا تدريب، جودة 0.99
الملف:   lib/iqra/memory/turbo_compressor.ts
```

### الخطوة ٣: إضافة sqlite-vec (20 دقيقة)
```bash
npm install sqlite-vec
# يعمل مع better-sqlite3 الموجود
```

### الخطوة ٤: Ollama Embedding Client (20 دقيقة)
```
الملف الجديد: lib/iqra/llm/ollama.ts
يستبدل: Google AI embedding (يحتاج API key)
بـ: nomic-embed-text (محلي، مجاني)
```

### الخطوة ٥: Micro Worker Pool (30 دقيقة)
```
الملف الجديد: lib/iqra/workers/micro_pool.ts
4 workers ثابتة، لا spawn جديد
```

### الخطوة ٦: Hot Cache Layer (20 دقيقة)
```
الملف الجديد: lib/iqra/memory/hot_cache.ts
Map<string, any> في RAM
TTL = 49 نبضة (من DASTŪR)
```

### الخطوة ٧: اختبار شامل (30 دقيقة)
```bash
npm test
# يجب أن تمر كل الاختبارات
```

---

## 🚀 ترتيب البناء (Serial — لا parallel)

```
١. turbo_compressor.ts  ← إصلاح Scalar Quantization
   ↓ (اختبار أخضر)
٢. ollama.ts            ← embedding محلي
   ↓ (اختبار أخضر)
٣. sqlite_vec_store.ts  ← vector DB محلي
   ↓ (اختبار أخضر)
٤. hot_cache.ts         ← RAM cache
   ↓ (اختبار أخضر)
٥. micro_pool.ts        ← worker pool
   ↓ (اختبار أخضر)
٦. emobank.ts           ← تحليل التجارب
   ↓ (اختبار أخضر)
٧. integration test     ← كل شيء معًا
```

---

## 💡 الجوهرة الكبرى

> النظام الذي نبنيه يعمل على **8GB RAM**
> بينما GPT-4 يحتاج **thousands of A100 GPUs**.
>
> السر ليس في الحجم — بل في **الهندسة**.
>
> "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
