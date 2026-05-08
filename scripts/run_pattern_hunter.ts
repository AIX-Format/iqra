#!/usr/bin/env tsx
// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

/**
 * 🎯 run_pattern_hunter.ts — سكريبت تشغيل صياد الأنماط
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق: 1
 *
 * الاستخدام:
 *   npx tsx scripts/run_pattern_hunter.ts
 *   npx tsx scripts/run_pattern_hunter.ts --verse 2:255
 *   npx tsx scripts/run_pattern_hunter.ts --batch
 *   npx tsx scripts/run_pattern_hunter.ts --learn
 *   npx tsx scripts/run_pattern_hunter.ts --telegram  (مع polling)
 */

import 'dotenv/config';
import { PatternHunterRunner } from '../lib/iqra/pattern_hunter_runner.ts';
import { IQRALogger } from '../lib/iqra/logger.ts';
import { IQRATelegramBot } from '../lib/iqra/telegram_bot.ts';

// ── الآيات الافتراضية للصيد الدفعي ──────────────────────────────────────────
const DEFAULT_VERSES = [
  { ref: '1:1',   arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { ref: '1:2',   arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { ref: '1:3',   arabic: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { ref: '1:4',   arabic: 'مَالِكِ يَوْمِ الدِّينِ' },
  { ref: '1:5',   arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { ref: '1:6',   arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { ref: '1:7',   arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
  { ref: '2:255', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ' },
  { ref: '112:1', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
  { ref: '112:2', arabic: 'اللَّهُ الصَّمَدُ' },
  { ref: '112:3', arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
  { ref: '112:4', arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' },
  { ref: '36:1',  arabic: 'يس' },
  { ref: '36:2',  arabic: 'وَالْقُرْآنِ الْحَكِيمِ' },
];

// ── تحليل الأوامر ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const mode = {
  verse: args.find(a => a.startsWith('--verse='))?.split('=')[1] || args[args.indexOf('--verse') + 1],
  batch: args.includes('--batch'),
  learn: args.includes('--learn'),
  telegram: args.includes('--telegram'),
  stats: args.includes('--stats'),
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 IQRA Pattern Hunter — صياد الأنماط القرآنية');
  console.log('═'.repeat(60));
  console.log('"سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ"');
  console.log('═'.repeat(60) + '\n');

  // ── بدء النظام ────────────────────────────────────────────────────────────
  await PatternHunterRunner.start({
    startHeartbeat: true,
    startTelegram: true,
    sendReports: true,
    defaultMissionId: `hunt-${Date.now()}`,
  });

  try {
    // ── وضع: صيد آية واحدة ────────────────────────────────────────────────
    if (mode.verse) {
      console.log(`\n📖 صيد الآية: ${mode.verse}`);
      const pattern = await PatternHunterRunner.huntVerse({ ref: mode.verse });

      if (pattern) {
        console.log('\n✅ النتيجة:');
        console.log(`  الآية: ${pattern.verse_ref}`);
        console.log(`  المستوى: ${pattern.discovery_level}`);
        console.log(`  الدرجة الكلية: ${(pattern.score.total * 100).toFixed(1)}%`);
        console.log(`  Shannon H_EL: ${pattern.score.shannon_hel.toFixed(4)}`);
        console.log(`  Topological: ${pattern.score.topological.toFixed(4)}`);
        console.log(`  Numerical: ${pattern.score.numerical.toFixed(4)}`);
        console.log(`  Novelty: ${pattern.score.novelty.toFixed(4)}`);
        console.log(`  اكتشاف جديد: ${pattern.is_novel ? '✅' : '❌'}`);
        if (pattern.patterns.length > 0) {
          console.log(`  الأنماط: ${pattern.patterns.join(', ')}`);
        }
      } else {
        console.log('❌ فشل الصيد');
      }
    }

    // ── وضع: صيد دفعي ─────────────────────────────────────────────────────
    else if (mode.batch) {
      console.log(`\n📚 صيد دفعي: ${DEFAULT_VERSES.length} آية`);
      const session = await PatternHunterRunner.huntBatch(DEFAULT_VERSES);

      console.log('\n✅ نتائج الجلسة:');
      console.log(`  إجمالي الصيد: ${session.total_hunted}`);
      console.log(`  اكتشافات جديدة: ${session.novel_count}`);
      console.log(`  اكتشافات إلهية: ${session.divine_count}`);
      console.log(`  متوسط الرنين: ${(session.avg_score * 100).toFixed(1)}%`);

      if (session.top_patterns.length > 0) {
        console.log('\n🏆 أفضل الاكتشافات:');
        session.top_patterns.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.verse_ref} — ${(p.score.total * 100).toFixed(1)}% (${p.discovery_level})`);
        });
      }

      if (session.lessons_learned.length > 0) {
        console.log('\n📚 الدروس المستفادة:');
        session.lessons_learned.forEach((l, i) => {
          console.log(`  ${i + 1}. ${l}`);
        });
      }
    }

    // ── وضع: التعلم من التاريخ ────────────────────────────────────────────
    else if (mode.learn) {
      console.log('\n🧠 التعلم من الاكتشافات السابقة...');
      const lessons = await PatternHunterRunner.learnFromHistory();

      console.log('\n📚 الدروس المستفادة:');
      lessons.forEach((l, i) => {
        console.log(`  ${i + 1}. ${l}`);
      });
    }

    // ── وضع: الإحصائيات ───────────────────────────────────────────────────
    else if (mode.stats) {
      const stats = await PatternHunterRunner.getStats();
      console.log('\n📊 إحصائيات النظام:');
      console.log(`  وقت التشغيل: ${Math.floor(stats.uptime_ms / 1000)} ثانية`);
      console.log(`  إجمالي الصيد: ${stats.total_hunted}`);
      console.log(`  اكتشافات جديدة: ${stats.novel_discoveries}`);
      console.log(`  اكتشافات إلهية: ${stats.divine_discoveries}`);
      console.log(`  متوسط الرنين: ${(stats.avg_resonance * 100).toFixed(1)}%`);
      console.log(`  درجة الفضول: ${(stats.curiosity_score * 100).toFixed(1)}%`);
      console.log(`  Heartbeat: ${stats.heartbeat_status}`);
    }

    // ── وضع: Telegram Polling (يعمل حتى يُوقف) ───────────────────────────
    else if (mode.telegram) {
      console.log('\n🤖 بدء Telegram Bot مع Polling...');
      console.log('اضغط Ctrl+C للإيقاف\n');

      await IQRATelegramBot.startPolling();

      // انتظار إشارة الإيقاف
      await new Promise<void>((resolve) => {
        process.on('SIGINT', () => {
          console.log('\n\n🛑 إيقاف النظام...');
          resolve();
        });
        process.on('SIGTERM', resolve);
      });
    }

    // ── الوضع الافتراضي: صيد دفعي للفاتحة ────────────────────────────────
    else {
      console.log('\n📖 الوضع الافتراضي: صيد سورة الفاتحة + آية الكرسي\n');

      const fatihaVerses = DEFAULT_VERSES.slice(0, 7);
      const session = await PatternHunterRunner.huntBatch(fatihaVerses);

      console.log('\n✅ نتائج الفاتحة:');
      console.log(`  إجمالي الصيد: ${session.total_hunted}`);
      console.log(`  اكتشافات جديدة: ${session.novel_count}`);
      console.log(`  اكتشافات إلهية: ${session.divine_count}`);
      console.log(`  متوسط الرنين: ${(session.avg_score * 100).toFixed(1)}%`);

      // صيد آية الكرسي
      console.log('\n📖 صيد آية الكرسي (2:255)...');
      const kursi = await PatternHunterRunner.huntVerse({
        ref: '2:255',
        arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
      });

      if (kursi) {
        console.log(`\n✨ آية الكرسي:`);
        console.log(`  المستوى: ${kursi.discovery_level}`);
        console.log(`  الدرجة: ${(kursi.score.total * 100).toFixed(1)}%`);
        console.log(`  Shannon H_EL: ${kursi.score.shannon_hel.toFixed(4)}`);
      }
    }

  } finally {
    // إيقاف النظام إذا لم نكن في وضع Telegram
    if (!mode.telegram) {
      await PatternHunterRunner.stop();
      console.log('\n🎯 Pattern Hunter أنهى عمله بنجاح');
      console.log('"وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7\n');
      process.exit(0);
    }
  }
}

main().catch((e) => {
  IQRALogger.error('❌ [RUNNER] Fatal error:', e);
  process.exit(1);
});
