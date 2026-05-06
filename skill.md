# 📜 IQRA Skills & Protocols | مهارات وبروتوكولات إقرا

## 🛠 Debugging & Resilience Patterns | أنماط التصحيح والمرونة

### 1. 🧩 العزلة المتعمدة (Intentional Isolation)
- **المبدأ:** اعزل الوحدة المشبوهة تماماً. أنشئ نسخة "عارية" بدون imports خارجية (استخدم mocks).
- **التطبيق:** `memory_isolated.test.ts` يستورد `IQRAMemory` فقط مع تعطيل التوابع الأخرى.

### 2. 🌊 التدفق العكسي (Reverse Flow Tracing)
- **المبدأ:** ابدأ من نقطة الخروج المتوقعة (مثل `process.exit`) واعمل عكسياً.
- **التطبيق:** ضع نقاط توقف عند `process.exit` و `Promise.reject` وشاهد أيها يُستدعى.

### 3. 🧬 ذاكرة التردد (Frequency Memory)
- **المبدأ:** الأخطاء المتقطعة غالباً ما تتبع نمطاً دورياً (مثلاً كل 7 أو 40 مرة).
- **التطبيق:** سجل `timestamps` للأخطاء واكتشف النمط الدوري لتوقع العطل.

### 4. 🎭 الممثل الصامت (The Silent Actor)
- **المبدأ:** العمليات الخفية (Handles) تمنع العملية من الإنهاء.
- **التطبيق:** استخدم `process._getActiveHandles()` لرؤية المؤقتات أو الاتصالات المفتوحة.

### 5. 🔄 إعادة الضبط الناعم (Soft Reset on Threshold)
- **المبدأ:** إذا تجاوزت الأخطاء عتبة معينة (مثلاً 7)، أعد ضبط النظام بالكامل (Re-initialize).
- **التطبيق:** استدعِ `softReset()` في `IQRAMemory` لتنظيف الحالة الفاسدة.

## 🛠 Debugging Rule | قاعدة التصحيح
إذا علق الاختبار (If the test hangs):
1. شغّل `vitest --detectOpenHandles`.
2. ابحث عن `top-level await` في الملف المستورد.
3. أنشئ مِثالاً مصغراً (Minimal reproduction) من 10 أسطر.
4. استخدم `withTimeout` لكل عمليات الشبكة والـ I/O.


## ⏳ Timeout Policy | سياسة المهلة
- **Redis (Upstash):** 5,000ms (5 seconds).
- **LLM (Groq/Google/OpenAI):** 10,000ms (10 seconds).
- **File I/O:** 2,000ms (2 seconds).

## 🌙 Spiritual Integrity | الاستقامة الروحية
"وَمَنْ يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
Taqwa in code means respecting timeouts, avoiding blocking the event loop, and ensuring every resource is accounted for.
