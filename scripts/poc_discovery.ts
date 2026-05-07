/**
 * 🌙 IQRA | POC: Rigorous Pattern Discovery Journey
 * 
 * Target: Surah Yasin (36:1-4)
 * Methodology: Intuition (LLM) -> Proof (Qalbin) -> Seal (Numerical)
 */

import { discover, PatternType } from '../lib/iqra/quran/pattern_engine';

async function runPoC() {
  console.log(" بسم الله الرحمن الرحيم ");
  console.log("🌙 Starting Rigorous Tadabbur Journey...");

  const yasinAyahs = [
    { 
      reference: "36:1", 
      arabic: "يس", 
      english: "Ya-Sin" 
    },
    { 
      reference: "36:2", 
      arabic: "وَالْقُرْآنِ الْحَكِيمِ", 
      english: "By the wise Quran" 
    },
    { 
      reference: "36:3", 
      arabic: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", 
      english: "Indeed, you are of the messengers" 
    },
    { 
      reference: "36:4", 
      arabic: "عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ", 
      english: "On a straight path" 
    }
  ];

  console.log("\n[1] Analyzing Yasin 36:1-4...");
  
  const results = await discover(yasinAyahs, PatternType.NUMERICAL);

  if (results.length === 0) {
    console.log("❌ No high-confidence patterns verified in this cycle.");
  } else {
    console.log(`\n✅ Verified ${results.length} Sacred Patterns:`);
    results.forEach((r, i) => {
      console.log(`\n--- Pattern #${i + 1} ---`);
      console.log(`Type: ${r.type}`);
      console.log(`Discovery: ${r.discovery}`);
      console.log(`Note (Ar): ${r.arabicNote}`);
      console.log(`Verification: ${r.scientificLink}`);
    });
  }

  console.log("\n🌙 Journey complete. Glory be to Allah.");
}

runPoC().catch(console.error);
