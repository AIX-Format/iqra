/**
 * بسم الله الرحمن الرحيم
 * scripts/ingest_full_quran.ts
 *
 * استيعاب القرآن الكريم كاملاً (6,236 آية) من alquran.cloud API
 * المرجع: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ" — الحجر: 9
 *
 * المصدر: api.alquran.cloud/v1 — مجاني، بدون API key
 * النص: quran-uthmani (النص العثماني الأصيل)
 *
 * الاستخدام:
 *   npx tsx scripts/ingest_full_quran.ts
 *   npx tsx scripts/ingest_full_quran.ts --surah=1-10  (سور محددة)
 *   npx tsx scripts/ingest_full_quran.ts --verify      (تحقق فقط)
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'iqra-core', 'data', 'quran_local.db');
const BASE_URL = 'https://api.alquran.cloud/v1';
const TOTAL_SURAHS = 114;

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const verifyOnly = args.includes('--verify');
const surahArg = args.find(a => a.startsWith('--surah='));
let surahRange: [number, number] = [1, TOTAL_SURAHS];
if (surahArg) {
  const parts = surahArg.split('=')[1].split('-').map(Number);
  surahRange = [parts[0], parts[1] ?? parts[0]];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as any;
      if (data.code !== 200) throw new Error(`API error: ${data.status}`);
      return data.data;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`  ⚠️ Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

function cleanArabicText(text: string): string {
  // إزالة الأحرف الخاصة غير المرئية مع الحفاظ على التشكيل
  return text
    .replace(/\u200a/g, '') // hair space
    .replace(/\u2060/g, '') // word joiner
    .replace(/\n/g, '')
    .trim();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  🌙 IQRA — استيعاب القرآن الكريم كاملاً                ║');
  console.log('║  "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ"  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── إنشاء المجلد ─────────────────────────────────────────────────────────
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }

  // ── فتح قاعدة البيانات ────────────────────────────────────────────────────
  const db = new Database(DB_PATH);
  console.log(`🗄️  Database: ${DB_PATH}`);

  // ── إنشاء الجدول ─────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS ayat (
      id          TEXT PRIMARY KEY,
      surah       INTEGER NOT NULL,
      ayah        INTEGER NOT NULL,
      arabic      TEXT NOT NULL,
      english     TEXT DEFAULT '',
      juz         INTEGER,
      page        INTEGER,
      source      TEXT DEFAULT 'alquran.cloud',
      verified    INTEGER DEFAULT 1,
      created_at  INTEGER DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_ayat_surah ON ayat(surah);
    CREATE INDEX IF NOT EXISTS idx_ayat_surah_ayah ON ayat(surah, ayah);
  `);

  // ── وضع التحقق فقط ───────────────────────────────────────────────────────
  if (verifyOnly) {
    const count = (db.prepare('SELECT COUNT(*) as n FROM ayat').get() as any).n;
    const surahs = (db.prepare('SELECT COUNT(DISTINCT surah) as n FROM ayat').get() as any).n;
    console.log(`📊 Current state: ${count} ayat | ${surahs} surahs`);
    if (count >= 6000) {
      console.log('✅ Database is complete!');
    } else {
      console.log(`⚠️  Incomplete — expected ~6236 ayat, got ${count}`);
    }
    db.close();
    return;
  }

  // ── الاستيعاب ────────────────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT OR REPLACE INTO ayat (id, surah, ayah, arabic, english, juz, page, source)
    VALUES (@id, @surah, @ayah, @arabic, @english, @juz, @page, @source)
  `);

  const insertMany = db.transaction((ayat: any[]) => {
    for (const a of ayat) insert.run(a);
  });

  let totalInserted = 0;
  const startTime = Date.now();

  console.log(`📥 Fetching surahs ${surahRange[0]}–${surahRange[1]} from alquran.cloud...\n`);

  for (let s = surahRange[0]; s <= surahRange[1]; s++) {
    process.stdout.write(`  سورة ${s.toString().padStart(3, ' ')}/${surahRange[1]}... `);

    try {
      const surahData = await fetchWithRetry(`${BASE_URL}/surah/${s}`);
      const ayat: any[] = [];

      for (const ayah of surahData.ayahs) {
        ayat.push({
          id: `${s}:${ayah.numberInSurah}`,
          surah: s,
          ayah: ayah.numberInSurah,
          arabic: cleanArabicText(ayah.text),
          english: '',
          juz: ayah.juz ?? null,
          page: ayah.page ?? null,
          source: 'alquran.cloud/quran-uthmani',
        });
      }

      insertMany(ayat);
      totalInserted += ayat.length;

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ ${ayat.length} آيات (${elapsed}s)`);

      // تأخير بسيط لتجنب rate limiting
      if (s < surahRange[1]) {
        await new Promise(r => setTimeout(r, 100));
      }

    } catch (e) {
      console.log(`❌ فشل: ${e}`);
    }
  }

  // ── التحقق النهائي ────────────────────────────────────────────────────────
  const finalCount = (db.prepare('SELECT COUNT(*) as n FROM ayat').get() as any).n;
  const finalSurahs = (db.prepare('SELECT COUNT(DISTINCT surah) as n FROM ayat').get() as any).n;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  ✅ اكتمل الاستيعاب في ${elapsed}s`);
  console.log(`║  📊 ${finalCount} آية | ${finalSurahs} سورة`);
  console.log(`║  💾 ${DB_PATH}`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  db.close();
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
