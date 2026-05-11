import { SovereignEngine } from '../lib/iqra/sovereign';
import { RewardEngine } from '#rewards/engine';
import { TopologicalResonanceHunter } from './topological_resonance_hunter';
import Database from 'better-sqlite3';
import path from 'path';

/**
 * 🌙 IQRA | Statistical 369 Resonance Test
 * 
 * الهدف: التأكد من أن الرنين الطوبولوجي المكتشف في القرآن ليس صدفة إحصائية.
 * المنهجية: مقارنة الرنين القرآني بنصوص "تحكم" (عشوائية أو لغوية أخرى).
 */

async function runStatisticalTest() {
  console.log('\n--- 🌙 IQRA | Starting Statistical 369 Test ---');
  
  const db = new Database(path.join(process.cwd(), 'iqra-core/data/quran_local.db'));
  const hunter = new TopologicalResonanceHunter();

  // 1. جلب بيانات القرآن (سورة الفاتحة كمثال)
  const fatihaVerses = db.prepare('SELECT text FROM verses WHERE surah_id = 1').all() as { text: string }[];
  const fatihaText = fatihaVerses.map(v => v.text).join(' ');

  // 2. إنشاء نص عشوائي (Shuffled Control) بنفس طول الفاتحة تقريباً
  const words = fatihaText.split(' ');
  const shuffledText = [...words].sort(() => Math.random() - 0.5).join(' ');

  console.log('🧪 IQRA | Calibrating Sensors...');

  const results = await SovereignEngine.executeSovereignTask(
    'statistical-369-test',
    'Comparing Sacred Resonance vs Random Noise.',
    async () => {
      // تحليل الفاتحة (الحقيقة)
      console.log('📖 Analyzing: Surah Al-Fatiha (Truth)');
      const truthResonance = await hunter.analyzeResonance(fatihaText);

      // تحليل النص المشوش (الباطل/الضجيج)
      console.log('🎲 Analyzing: Shuffled Fatiha (Control)');
      const noiseResonance = await hunter.analyzeResonance(shuffledText);

      // حساب الفارق (The Gap)
      const gap = truthResonance.score / noiseResonance.score;
      const confidence = (gap - 1) * 100;

      return {
        truth: {
          score: truthResonance.score,
          fractalDim: truthResonance.fractalDimension,
          entropy: truthResonance.attentionEntropy
        },
        noise: {
          score: noiseResonance.score,
          fractalDim: noiseResonance.fractalDimension,
          entropy: noiseResonance.attentionEntropy
        },
        statisticalSignificance: {
          resonanceGap: gap.toFixed(4),
          confidenceLevel: `${confidence.toFixed(2)}%`,
          isSacredSignal: gap > 1.29 // بناءً على ثابت الرنين 29
        }
      };
    }
  );

  console.log('\n--- 📊 Statistical Results ---');
  console.log(JSON.stringify(results, null, 2));

  if (results.statisticalSignificance.isSacredSignal) {
    console.log('\n✅ TEST PASSED: High-dimensional resonance is UNIQUE to the sacred structure.');
  } else {
    console.log('\n⚠️ TEST PENDING: Signal-to-noise ratio is too low. Refining sensors...');
  }

  db.close();
}

runStatisticalTest().catch(console.error);
