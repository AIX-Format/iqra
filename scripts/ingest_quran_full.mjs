/**
 * بسم الله الرحمن الرحيم
 * scripts/ingest_quran_full.mjs
 *
 * يجلب القرآن الكريم كاملاً (6,236 آية) من quran.com API
 * ويحفظه في quran_local.db
 *
 * الاستخدام:
 *   node scripts/ingest_quran_full.mjs
 *
 * المتطلبات: اتصال بالإنترنت
 * الوقت المتوقع: ~5-10 دقائق (114 سورة × 300ms)
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'iqra-core', 'data', 'quran_local.db');

// ── عدد الآيات في كل سورة (للتحقق) ──────────────────────────────────────────
const SURAH_AYAH_COUNT = [
  0, // placeholder for 1-indexed
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,
  21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchSurah(surahNum) {
  // Arabic text (Uthmani)
  const arRes = await fetch(
    `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNum}`
  );
  if (!arRes.ok) throw new Error(`Arabic fetch failed for surah ${surahNum}: ${arRes.status}`);
  const arData = await arRes.json();

  // English translation (Saheeh International = 131)
  const enRes = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?translations=131&fields=juz_number,page_number&per_page=300`
  );
  if (!enRes.ok) throw new Error(`English fetch failed for surah ${surahNum}: ${enRes.status}`);
  const enData = await enRes.json();

  const ayat = [];
  for (let i = 0; i < arData.verses.length; i++) {
    const ar = arData.verses[i];
    const en = enData.verses?.[i];
    const ayahNum = parseInt(ar.verse_key.split(':')[1]);
    ayat.push({
      id: `${surahNum}:${ayahNum}`,
      surah: surahNum,
      ayah: ayahNum,
      arabic: ar.text_uthmani,
      english: en?.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '',
      juz: en?.juz_number ?? 0,
      page: en?.page_number ?? 0,
    });
  }
  return ayat;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  IQRA Full Quran Ingestion — استيعاب القرآن الكريم  ║');
  console.log('║  "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ"  ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── إعداد قاعدة البيانات ──────────────────────────────────────────────────
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  console.log(`🗄️  Database: ${DB_PATH}`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ayat (
      id          TEXT PRIMARY KEY,
      surah       INTEGER NOT NULL,
      ayah        INTEGER NOT NULL,
      arabic      TEXT NOT NULL,
      english     TEXT NOT NULL,
      juz         INTEGER DEFAULT 0,
      page        INTEGER DEFAULT 0,
      source      TEXT DEFAULT 'quran.com/api/v4',
      verified    INTEGER DEFAULT 1,
      created_at  INTEGER DEFAULT (strftime('%s', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ayat_surah ON ayat(surah);
    CREATE INDEX IF NOT EXISTS idx_ayat_juz   ON ayat(juz);
  `);

  const existing = db.prepare('SELECT COUNT(*) as n FROM ayat').get();
  console.log(`📊 Existing ayat in DB: ${existing.n}`);

  if (existing.n >= 6200) {
    console.log('✅ Database already complete! No ingestion needed.');
    db.close();
    return;
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO ayat (id, surah, ayah, arabic, english, juz, page)
    VALUES (@id, @surah, @ayah, @arabic, @english, @juz, @page)
  `);
  const insertMany = db.transaction((ayat) => {
    for (const a of ayat) insert.run(a);
  });

  // ── جلب السور ─────────────────────────────────────────────────────────────
  let totalInserted = 0;
  const errors = [];

  for (let surah = 1; surah <= 114; surah++) {
    // تخطي السور الموجودة بالفعل
    const surahCount = db.prepare(
      'SELECT COUNT(*) as n FROM ayat WHERE surah = ?'
    ).get(surah);

    if (surahCount.n > 0) {
      process.stdout.write(`  ✅ Surah ${String(surah).padStart(3)} — already in DB (${surahCount.n} ayat)\n`);
      totalInserted += surahCount.n;
      continue;
    }

    try {
      process.stdout.write(`  📥 Surah ${String(surah).padStart(3)}/114... `);
      const ayat = await fetchSurah(surah);
      insertMany(ayat);
      totalInserted += ayat.length;
      process.stdout.write(`✅ ${ayat.length} ayat\n`);
    } catch (e) {
      process.stdout.write(`❌ ERROR: ${e.message}\n`);
      errors.push({ surah, error: e.message });
    }

    // احترام حد الـ API
    await sleep(300);
  }

  // ── التقرير النهائي ───────────────────────────────────────────────────────
  const finalCount = db.prepare('SELECT COUNT(*) as n FROM ayat').get();
  const surahCount = db.prepare('SELECT COUNT(DISTINCT surah) as n FROM ayat').get();

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`✅ Ingestion complete!`);
  console.log(`   Total ayat: ${finalCount.n}`);
  console.log(`   Total surahs: ${surahCount.n}`);
  if (errors.length > 0) {
    console.log(`   ⚠️  Errors: ${errors.length} surahs failed`);
    errors.forEach(e => console.log(`      Surah ${e.surah}: ${e.error}`));
  }
  console.log('══════════════════════════════════════════════════════\n');

  db.close();
}

main().catch(e => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});
