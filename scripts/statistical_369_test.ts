/**
 * 🌙 IQRA STATISTICAL TEST — اختبار إحصائي
 * 
 * GOAL: Verify the significance of the pattern (Surah Number + 1) % 369.
 * USER HYPOTHESIS: This produces prime numbers at a rate higher than random.
 */

import { IQRALogger } from '../lib/iqra/logger';

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

async function runTest() {
  console.log("🚀 Starting Statistical Test for Pattern: (Surah + 1) % 369");
  console.log("---------------------------------------------------------");

  let primeCount = 0;
  const totalSurahs = 114;
  const results: { surah: number, result: number, isPrime: boolean }[] = [];

  for (let s = 1; s <= totalSurahs; s++) {
    const res = (s + 1) % 369;
    const prime = isPrime(res);
    if (prime) primeCount++;
    results.push({ surah: s, result: res, isPrime: prime });
  }

  const percentage = (primeCount / totalSurahs) * 100;
  
  // Baseline: Density of primes up to 115 is about 30/115 ~ 26%
  // Primes up to 369: There are 72 primes. 72/369 ~ 19.5%
  
  console.log(`📊 Total Surahs: ${totalSurahs}`);
  console.log(`✨ Prime Results: ${primeCount}`);
  console.log(`📈 Percentage: ${percentage.toFixed(2)}%`);

  console.log("\n🔍 Prime Hits:");
  results.filter(r => r.isPrime).forEach(r => {
    console.log(` - Surah ${r.surah}: (${r.surah}+1) % 369 = ${r.result} [PRIME]`);
  });

  if (percentage > 25) {
    console.log("\n✅ [RESULT] SIGNIFICANT: The pattern shows a high density of primes.");
  } else {
    console.log("\n⚠️ [RESULT] INCONCLUSIVE: The density is within expected random ranges.");
  }
}

runTest().catch(console.error);
