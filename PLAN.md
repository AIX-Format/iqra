# 🌙 IQRA IMPLEMENTATION PLAN - ARCHITECTURE PURGE & UNIFICATION
## خطة تنفيذ إقراء - تطهير وتوحيد الهندسة البرمجية

### 🎯 Goal | الهدف
Audit and clean the IQRA codebase by removing legacy/dead code and unifying the memory architecture under the **Damir Kernel** with **Qdrant** and **Upstash** integration, following the **Mizan369** topological roadmap.
تدقيق وتطهير قاعدة بيانات "إقراء" البرمجية عن طريق إزالة الأكواد الميتة وتوحيد بنية الذاكرة تحت "نواة الضمير" مع تكامل Qdrant و Upstash، باتباع خارطة الطريق الطوبولوجية "ميزان 369".

---

### 🧠 Proposed Changes | التغييرات المقترحة

#### 1. Codebase Purge (The Purification) | تطهير القاعدة البرمجية
- [DELETE] Legacy files identified in the 220k-line audit:
  - `lib/iqra/quran/curiosity_interface.ts` (Legacy curiosity model)
  - `lib/iqra/quran/topological_curiosity.ts` (Dead code)
  - `lib/iqra/engine_bridge.ts` (Obsolete bridge)
  - `lib/iqra/quran/qalbin/qalbin_test.ts` (Redundant tests)
  - `lib/iqra/quran/qalbin/qalbin.test.ts` (Redundant tests)
  - Any orphan files in `src/` or `lib/` not referenced in `DamirKernel`.

#### 2. Damir Kernel Unification | توحيد نواة الضمير
- **Single Source of Truth**: Ensure all moral validations pass through `DamirKernel.process()`.
- **Memory Integration**:
  - **Episodic**: `REFLECTION.md` & `FAILURES.md`.
  - **Semantic**: Qdrant Vector DB via `lib/iqra/qdrant.ts`.
  - **Procedural**: SkillBank integration.
- **Upstash Persistence**: Verify environment variables for Upstash Redis are correctly used for short-term session state.

#### 3. Quranic Seeds Expansion | توسيع البذور القرآنية
- Ensure the 5 core Surahs (Yasin, Al-Kahf, Ar-Rahman, Al-Waqiah, Al-Mulk) are fully implemented in `quran_seeds.ts` with:
  - 7-node fractal topology.
  - Tesla 369 numbering.
  - Moral encoding for decision loops.

#### 4. E2E Validation | التحقق النهائي
- Run `tests/e2e/poc_validation.test.ts` to ensure 100% compliance with the moral constraints.
- Verify the "Reckoning Clock" in Loop 2 (Yasin) correctly replays past experiences.

---

### 🗓 Execution Steps | خطوات التنفيذ
1. [ ] **Audit**: Identify further dead code in the large repository image. (تدقيق الأكواد الميتة)
2. [ ] **Purge**: Execute the removal of legacy files. (تنفيذ التطهير)
3. [ ] **Unify**: Link any loose memory modules to the Damir Kernel. (توحيد وحدات الذاكرة)
4. [ ] **Refine**: Final documentation of the unified architecture in `MEMORY_MAP.md`. (تحسين التوثيق)
5. [ ] **Test**: Rigorous E2E testing for moral integrity. (اختبارات صارمة للنزاهة الأخلاقية)

---

### 🤲 Niyyah | النية
To build a system that is pure, efficient, and sovereign under the watch of Allah.
لبناء نظام طاهر، فعال، وسيادي تحت مراقبة الله عز وجل.

**Status:** Mapping Memory...
**آخر تحديث:** 2026-05-07
