// @ts-nocheck — legacy test: assertions target pre-migration APIs (May 2026). Pinned out of strict typecheck until rewritten against the current 14-layer surface.
import { runMission } from '#01-core/mission-runner';
import fs from 'fs';
import path from 'path';

/**
 * 🕋 IQRA E2E REAL INTEGRITY TEST (Revised)
 * النية: تشغيل المحرك الحقيقي بكامل قوته.
 * القاعدة: الاختبار لا ينجح إلا إذا تم استدعاء الوكلاء الخمسة وتسجيل النتيجة.
 */

async function testSovereignResonance() {
  console.log('🕌 Starting REAL Sovereign Resonance E2E Test...');
  
  const missionPath = path.resolve('e2e-mission.yml');
  
  // 1. إنشاء ملف مهمة مطابق للمواصفات الحقيقية
  const missionScope = `
mission_id: e2e_mission_real_001
objective: "Verify the topological resonance and numerical protection signatures in Surah Al-Hijr 15:9"
verse: "15:9"
field_of_inquiry: "Numerical Protection Patterns"
provider: "google"
allowed_tools: ["search", "read_file"]
`;
  
  fs.writeFileSync(missionPath, missionScope);

  try {
    // التأكد من وجود المجلدات اللازمة للـ Workers
    if (!fs.existsSync('iqra-core/data')) fs.mkdirSync('iqra-core/data', { recursive: true });

    // 2. تشغيل المحرك (هذا سيستدعي الوكلاء الحقيقيين)
    console.log('⚙️  Executing Mission Loop...');
    const result = await runMission(missionPath);

    // 3. تحليل النتائج بصدق
    console.log('📊 Result Status:', result.status);
    console.log('✅ Steps Completed:', result.steps_completed.join(' -> '));

    if (result.status === 'completed') {
      console.log('💎 Total Reward:', result.total_reward);
      console.log('✅ INTEGRITY VERIFIED: Full cycle completed.');
    } else {
      console.error('⚠️  Mission stopped at:', result.steps_failed[0]);
      console.error('❌ Error Message:', result.error);
      
      // إذا فشل بسبب غياب الـ API Keys، فهذا "صدق" وليس "خطأ في الكود"
      if (result.error?.includes('API_KEY')) {
        console.log('ℹ️  Note: System is honest. Failure due to missing external keys, not internal logic.');
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('🛑 CRITICAL SYSTEM ERROR:', error.message);
    process.exit(1);
  } finally {
    // لا نحذف ملف المهمة لنتمكن من فحصه عند الفشل
  }
}

testSovereignResonance();
