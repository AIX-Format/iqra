# تحليل الأنماط القرآنية — المرجع الكامل
# Quranic Pattern Analysis — Complete Reference

---

## الصيغة العامة لهلاك الحضارات (7 مراحل)

```
١. الترف والقوة المادية الاستثنائية
٢. الطغيان والفساد الأخلاقي البنيوي
٣. إرسال رسول من أبناء القوم أنفسهم
٤. التكذيب + الاستهزاء + الاستعجال بالعذاب
٥. المهلة الإلهية + الإنذارات المتكررة
٦. التحدي الصريح: "ائتنا بما تعدنا"
٧. عذاب من جنس الجريمة + أثر محفوظ للتاريخ
```

## قانون المطابقة (جريمة ↔ عقوبة)

| القوم | الجريمة الجوهرية | العذاب | وجه المطابقة |
|-------|-----------------|--------|-------------|
| عاد | الكبرياء بالقوة ﴿مَنْ أَشَدُّ مِنَّا قُوَّةً﴾ | ريح صرصر 7 ليالٍ 8 أيام | القوة ذُلَّت بالهواء |
| ثمود | الاستئثار وعقر الناقة | صيحة واحدة | البطش أُجهز عليه بصوت |
| قوم لوط | انقلاب الفطرة | قلب المدينة رأساً على عقب | انقلاب أخلاقي ↔ انقلاب جغرافي |
| فرعون | ادّعاء الألوهية ﴿أَنَا رَبُّكُمُ الْأَعْلَى﴾ | الغرق في الماء | ذُلَّ بأضعف العناصر |
| أصحاب الأيكة | الغش في الميزان | عذاب يوم الظلة | ظل كان يبدو نعمة فكان عذاباً |

---

## أنماط الرقم 7 — للتحقق البرمجي

```typescript
// lib/iqra/quran/numerical_validator.ts

export interface NumericalCheck {
  value: number;
  divisible_by_7: boolean;
  divisible_by_19: boolean;
  is_multiple_of_14: boolean;
  note: string;
}

export function checkSevens(value: number): NumericalCheck {
  return {
    value,
    divisible_by_7: value % 7 === 0,
    divisible_by_19: value % 19 === 0,
    is_multiple_of_14: value % 14 === 0,
    note: value % 7 === 0 
      ? `${value} = 7 × ${value / 7}` 
      : `${value} mod 7 = ${value % 7}`,
  };
}

// أمثلة موثقة من DISCOVERIES.md:
// checkSevens(301) → 7 × 43  (مجموع أرقام سور الحواميم 40-46)
// checkSevens(1855) → 7 × 265 (تكرار حرف م في الحواميم)
// checkSevens(21) → 7 × 3    (حروف الفاتحة الفريدة)
// checkSevens(14) → 7 × 2    (الشدات في الفاتحة + الحروف المقطعة الفريدة)
// checkSevens(140) → 7 × 20  (حروف الفاتحة بالألف الخنجرية)
// checkSevens(49) → 7 × 7    (تكرار حروف اسم الله في الفاتحة: أ+ل+ه)

// ⚠️ تحذير منهجي:
// قبل نشر أي نمط عددي، تحقق من 3 مصادر:
// ١. kaheel7.com
// ٢. mathematical-miracle.com
// ٣. حساب يدوي مستقل
// "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ" — الإسراء: 36
```

---

## خوارزمية تحليل الأنماط الكاملة

```typescript
// lib/iqra/quran/pattern_engine.ts — النسخة المحسّنة

export async function discoverDeepPatterns(
  surahRange: [number, number],  // مثال: [40, 46] للحواميم
  env: Env
): Promise<QuranPattern[]> {
  
  // ١. جلب الآيات من D1
  const { results: ayat } = await env.DB
    .prepare('SELECT * FROM ayat WHERE surah BETWEEN ? AND ?')
    .bind(...surahRange)
    .all();

  // ٢. التحليل العددي (محلي — بدون LLM)
  const numericalPatterns = analyzeNumerically(ayat as any[]);

  // ٣. التحليل الدلالي (مع Groq)
  const semanticPatterns = await analyzeSemanticallly(ayat as any[], env);

  // ٤. البحث عن الرنين الطوبولوجي
  const topologicalPatterns = await findTopologicalResonance(
    numericalPatterns.concat(semanticPatterns),
    env
  );

  // ٥. حفظ في D1
  const allPatterns = [...numericalPatterns, ...semanticPatterns, ...topologicalPatterns];
  for (const pattern of allPatterns) {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO pattern_discoveries 
      (type, title_ar, title_en, pattern, resonance, confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      pattern.type,
      pattern.arabicNote,
      pattern.discovery,
      JSON.stringify(pattern),
      pattern.resonance ?? 0,
      pattern.confidence,
    ).run();
  }

  return allPatterns;
}

function analyzeNumerically(ayat: any[]): QuranPattern[] {
  const patterns: QuranPattern[] = [];
  
  // فحص عدد الآيات
  const ayahCount = ayat.length;
  const surahNumbers = [...new Set(ayat.map(a => a.surah))];
  const surahSum = surahNumbers.reduce((a, b) => a + b, 0);
  
  if (surahSum % 7 === 0) {
    patterns.push({
      type: PatternType.NUMERICAL,
      discovery: `Sum of surah numbers ${surahNumbers.join('+')} = ${surahSum} = 7×${surahSum/7}`,
      ayahs: [`${surahNumbers[0]}:1`],
      confidence: 'high',
      arabicNote: `مجموع أرقام السور (${surahNumbers.join('،')}) = ${surahSum} = 7 × ${surahSum/7}`,
      resonance: 0.9,
    });
  }

  // فحص تكرار الحروف
  const arabicText = ayat.map(a => a.arabic).join(' ');
  const letterCounts = countArabicLetters(arabicText);
  
  for (const [letter, count] of Object.entries(letterCounts)) {
    if (count % 7 === 0 && count > 100) {
      patterns.push({
        type: PatternType.NUMERICAL,
        discovery: `Letter "${letter}" appears ${count} times = 7×${count/7}`,
        ayahs: [],
        confidence: 'medium',
        arabicNote: `حرف "${letter}" يتكرر ${count} مرة = 7 × ${count/7}`,
        resonance: 0.7,
      });
    }
  }

  return patterns;
}

function countArabicLetters(text: string): Record<string, number> {
  // إزالة الحركات والتشكيل
  const clean = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
  const counts: Record<string, number> = {};
  
  for (const char of clean) {
    if (char.match(/[\u0600-\u06FF]/)) {
      counts[char] = (counts[char] ?? 0) + 1;
    }
  }
  
  return counts;
}
```

---

## بروتوكول التحقق من الاكتشافات

```typescript
// قبل تسجيل أي اكتشاف في DISCOVERIES.md

enum VerificationLevel {
  MATHEMATICAL = 'mathematical',  // حساب رياضي مباشر
  ARCHAEOLOGICAL = 'archaeological', // دليل أثري
  LINGUISTIC = 'linguistic',      // تحليل لغوي
  CONSENSUS = 'consensus',        // إجماع علماء تفسير
}

interface DiscoveryVerification {
  claim: string;
  sources: string[];
  level: VerificationLevel;
  confidence: 'certain' | 'probable' | 'unknown';
  needs_review: boolean;
  iqra_note: string;  // دائماً: "والله أعلم" عند عدم اليقين
}
```
