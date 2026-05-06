/**
 * IQRA Sovereign Runner (JS) — مشغل السيادة
 * 
 * Running the Nested Sevens logic directly in vanilla Node.js
 * to bypass TypeScript compilation in offline sandbox.
 */

// ── 1. DATA ───────────────────────────────────────────────────────────
const AL_FATIHA = [
  { ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { ayah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { ayah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
  { ayah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { ayah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { ayah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
];

// ── 2. UTILS ──────────────────────────────────────────────────────────
const TASHKEEL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;
const NON_LETTERS = /[^\u0621-\u063A\u0641-\u064A]/g;

function stripTashkeel(text) { return text.replace(TASHKEEL, ''); }
function extractLetters(text) { return stripTashkeel(text).replace(NON_LETTERS, ''); }
function countWords(text) { 
    return stripTashkeel(text).split(/\s+/).filter(w => w.replace(NON_LETTERS, '').length > 0).length; 
}
function countLetters(text) { return extractLetters(text).length; }

// ── 3. CORE LOGIC ─────────────────────────────────────────────────────
function analyze() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  IQRA — Sovereign Nested Sevens Report          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const metrics = AL_FATIHA.map(a => ({
    ayah: a.ayah,
    words: countWords(a.text),
    letters: countLetters(a.text)
  }));

  const totalWords = metrics.reduce((s, m) => s + m.words, 0);
  const totalLetters = metrics.reduce((s, m) => s + m.letters, 0);

  metrics.forEach(m => {
    console.log(`   Ayah ${m.ayah}: ${m.words} words, ${m.letters} letters`);
  });

  console.log(`\n📊 Totals:`);
  console.log(`   Ayahs:   ${AL_FATIHA.length} (÷7 = ${AL_FATIHA.length/7})`);
  console.log(`   Words:   ${totalWords} (÷7 = ${totalWords/7})`);
  console.log(`   Letters: ${totalLetters} (÷7 = ${totalLetters/7})`);

  // Concatenation: Letter counts
  const letterConcat = metrics.map(m => m.letters).join('');
  console.log(`\n🔗 Concatenation (Letters): ${letterConcat}`);
  console.log(`   ÷7 = ${BigInt(letterConcat) % 7n === 0n ? '✅ DIVISIBLE!' : '❌ Remainder: ' + (BigInt(letterConcat) % 7n)}`);

  // Basmalah specific
  const basmalahWords = stripTashkeel(AL_FATIHA[0].text).split(/\s+/).filter(w => w.length > 0);
  const basmalahCounts = basmalahWords.map(w => w.replace(NON_LETTERS, '').length).join('');
  console.log(`\n﷽  Basmalah Pattern: ${basmalahCounts}`);
  console.log(`   ÷7 = ${BigInt(basmalahCounts) % 7n === 0n ? '✅ DIVISIBLE!' : '❌ Remainder: ' + (BigInt(basmalahCounts) % 7n)}`);

  console.log('\nوالله أعلم');
}

analyze();
