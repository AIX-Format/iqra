/**
 * IQRA Nested Sevens Algorithm — خوارزمية السباعيات المتداخلة
 *
 * "وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ"
 * "We have given you seven of the often-repeated and the Grand Quran"
 * — Al-Hijr 15:87
 *
 * Pure mathematical analysis engine.
 * No LLM dependency. No network calls. Runs in Sandbox/Offline.
 *
 * Built with Moe Abdelaziz — Made with Soul
 */

// ═══════════════════════════════════════════════
// SECTION 1: Data — سورة الفاتحة (Hardcoded Source of Truth)
// ═══════════════════════════════════════════════

/** Each ayah of Al-Fatiha with its Arabic text */
export const AL_FATIHA = [
  { ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { ayah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { ayah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
  { ayah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { ayah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { ayah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
] as const;

// ═══════════════════════════════════════════════
// SECTION 2: Arabic Letter Utilities
// ═══════════════════════════════════════════════

/** Diacritical marks (tashkeel) to strip for letter counting */
const TASHKEEL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

/** Non-letter characters (spaces, punctuation, etc.) */
const NON_LETTERS = /[^\u0621-\u063A\u0641-\u064A]/g;

/** Strip all diacritics from Arabic text */
export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL, '');
}

/** Extract only Arabic letters (no spaces, diacritics, or punctuation) */
export function extractLetters(text: string): string {
  return stripTashkeel(text).replace(NON_LETTERS, '');
}

/** Count Arabic words in text (split by space, filter empties) */
export function countWords(text: string): number {
  return stripTashkeel(text)
    .split(/\s+/)
    .filter((w) => w.replace(NON_LETTERS, '').length > 0)
    .length;
}

/** Count pure Arabic letters in text */
export function countLetters(text: string): number {
  return extractLetters(text).length;
}

// ═══════════════════════════════════════════════
// SECTION 3: Divisibility Analysis
// ═══════════════════════════════════════════════

export interface DivisibilityResult {
  value: number;
  divisibleBy7: boolean;
  quotient: number;
  remainder: number;
}

/** Check if a number is divisible by 7, returning full analysis */
export function checkDiv7(value: number): DivisibilityResult {
  return {
    value,
    divisibleBy7: value % 7 === 0,
    quotient: Math.floor(value / 7),
    remainder: value % 7,
  };
}

// ═══════════════════════════════════════════════
// SECTION 4: Concatenation Pattern Analysis
// ═══════════════════════════════════════════════

export interface ConcatenationResult {
  label: string;
  digits: string;
  numericValue: number;
  analysis: DivisibilityResult;
}

/**
 * Concatenates an array of numbers as digit strings and checks divisibility by 7.
 * Example: [7, 29, 139] → "729139" → check if 729139 % 7 === 0
 */
export function analyzeConcatenation(
  label: string,
  values: number[]
): ConcatenationResult {
  const digits = values.join('');
  const numericValue = parseInt(digits, 10);
  return {
    label,
    digits,
    numericValue,
    analysis: checkDiv7(numericValue),
  };
}

// ═══════════════════════════════════════════════
// SECTION 5: Per-Ayah Letter Count (Digit Weight)
// ═══════════════════════════════════════════════

export interface AyahMetrics {
  ayah: number;
  text: string;
  wordCount: number;
  letterCount: number;
}

/** Compute word and letter counts for every ayah */
export function computeAyahMetrics(
  surah: readonly { ayah: number; text: string }[]
): AyahMetrics[] {
  return surah.map(({ ayah, text }) => ({
    ayah,
    text,
    wordCount: countWords(text),
    letterCount: countLetters(text),
  }));
}

// ═══════════════════════════════════════════════
// SECTION 6: The Basmalah Letter-Count Pattern
// ═══════════════════════════════════════════════

export interface BasmalahAnalysis {
  words: { word: string; letterCount: number }[];
  concatenated: ConcatenationResult;
}

/** Analyze the Basmalah's per-word letter counts and their concatenation */
export function analyzeBasmalah(): BasmalahAnalysis {
  const basmalahText = AL_FATIHA[0].text;
  const rawWords = stripTashkeel(basmalahText)
    .split(/\s+/)
    .filter((w) => w.replace(NON_LETTERS, '').length > 0);

  const words = rawWords.map((w) => ({
    word: w,
    letterCount: w.replace(NON_LETTERS, '').length,
  }));

  const counts = words.map((w) => w.letterCount);

  return {
    words,
    concatenated: analyzeConcatenation(
      'Basmalah letter-counts concatenated',
      counts
    ),
  };
}

// ═══════════════════════════════════════════════
// SECTION 7: Full Al-Fatiha Nested Sevens Report
// ═══════════════════════════════════════════════

export interface NestedSevensReport {
  surahName: string;
  totalAyahs: DivisibilityResult;
  totalWords: DivisibilityResult;
  totalLetters: DivisibilityResult;
  ayahMetrics: AyahMetrics[];
  basmalah: BasmalahAnalysis;
  letterCountsConcatenated: ConcatenationResult;
  wordCountsConcatenated: ConcatenationResult;
  discoveries: string[];
}

/**
 * Run the full Nested Sevens analysis on Al-Fatiha.
 * This is the core entry point for the algorithm.
 */
export function analyzeAlFatiha(): NestedSevensReport {
  const metrics = computeAyahMetrics(AL_FATIHA);

  const totalWords = metrics.reduce((sum, m) => sum + m.wordCount, 0);
  const totalLetters = metrics.reduce((sum, m) => sum + m.letterCount, 0);

  const letterCounts = metrics.map((m) => m.letterCount);
  const wordCounts = metrics.map((m) => m.wordCount);

  const basmalah = analyzeBasmalah();

  // Concatenation patterns
  const letterConcat = analyzeConcatenation(
    'Per-ayah letter counts concatenated',
    letterCounts
  );
  const wordConcat = analyzeConcatenation(
    'Per-ayah word counts concatenated',
    wordCounts
  );

  // Collect discoveries
  const discoveries: string[] = [];

  const ayahCheck = checkDiv7(AL_FATIHA.length);
  if (ayahCheck.divisibleBy7) {
    discoveries.push(
      `✅ Al-Fatiha has exactly ${AL_FATIHA.length} ayahs — divisible by 7.`
    );
  }

  if (basmalah.concatenated.analysis.divisibleBy7) {
    discoveries.push(
      `✅ Basmalah letter-count concatenation (${basmalah.concatenated.digits}) is divisible by 7.`
    );
  }

  if (letterConcat.analysis.divisibleBy7) {
    discoveries.push(
      `✅ Full surah letter-count concatenation (${letterConcat.digits}) is divisible by 7.`
    );
  }

  if (wordConcat.analysis.divisibleBy7) {
    discoveries.push(
      `✅ Full surah word-count concatenation (${wordConcat.digits}) is divisible by 7.`
    );
  }

  const wordCheck = checkDiv7(totalWords);
  if (wordCheck.divisibleBy7) {
    discoveries.push(
      `✅ Total words (${totalWords}) is divisible by 7.`
    );
  }

  const letterCheck = checkDiv7(totalLetters);
  if (letterCheck.divisibleBy7) {
    discoveries.push(
      `✅ Total letters (${totalLetters}) is divisible by 7.`
    );
  }

  if (discoveries.length === 0) {
    discoveries.push(
      '⚠️ No direct divisibility-by-7 patterns found at this level. Deeper analysis needed.'
    );
  }

  return {
    surahName: 'Al-Fatiha (الفاتحة)',
    totalAyahs: ayahCheck,
    totalWords: wordCheck,
    totalLetters: letterCheck,
    ayahMetrics: metrics,
    basmalah,
    letterCountsConcatenated: letterConcat,
    wordCountsConcatenated: wordConcat,
    discoveries,
  };
}

// ═══════════════════════════════════════════════
// SECTION 8: Pretty Printer (Console / Log)
// ═══════════════════════════════════════════════

export function printReport(report: NestedSevensReport): string {
  const lines: string[] = [];

  lines.push('╔══════════════════════════════════════════════════╗');
  lines.push('║  IQRA — Nested Sevens Analysis Report           ║');
  lines.push('║  سورة الفاتحة — السبع المثاني                   ║');
  lines.push('╚══════════════════════════════════════════════════╝');
  lines.push('');

  lines.push(`📖 Surah: ${report.surahName}`);
  lines.push(`   Ayahs:   ${report.totalAyahs.value} (÷7 = ${report.totalAyahs.quotient} r${report.totalAyahs.remainder})`);
  lines.push(`   Words:   ${report.totalWords.value} (÷7 = ${report.totalWords.quotient} r${report.totalWords.remainder})`);
  lines.push(`   Letters: ${report.totalLetters.value} (÷7 = ${report.totalLetters.quotient} r${report.totalLetters.remainder})`);
  lines.push('');

  lines.push('── Per-Ayah Breakdown ──');
  for (const m of report.ayahMetrics) {
    lines.push(`   Ayah ${m.ayah}: ${m.wordCount} words, ${m.letterCount} letters`);
  }
  lines.push('');

  lines.push('── Basmalah Analysis ──');
  for (const w of report.basmalah.words) {
    lines.push(`   "${w.word}" → ${w.letterCount} letters`);
  }
  lines.push(`   Concatenated: ${report.basmalah.concatenated.digits}`);
  lines.push(`   ÷7 = ${report.basmalah.concatenated.analysis.quotient} r${report.basmalah.concatenated.analysis.remainder}`);
  lines.push('');

  lines.push('── Concatenation Patterns ──');
  lines.push(`   Letter counts: ${report.letterCountsConcatenated.digits} (÷7 r${report.letterCountsConcatenated.analysis.remainder})`);
  lines.push(`   Word counts:   ${report.wordCountsConcatenated.digits} (÷7 r${report.wordCountsConcatenated.analysis.remainder})`);
  lines.push('');

  lines.push('── Discoveries ──');
  for (const d of report.discoveries) {
    lines.push(`   ${d}`);
  }
  lines.push('');
  lines.push('والله أعلم');

  return lines.join('\n');
}
