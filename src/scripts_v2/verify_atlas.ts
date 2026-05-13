import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * 🔍 verify_atlas.ts — مدقق صدق الأطلس
 * 
 * المبدأ: "لِيَهْلِكَ مَنْ هَلَكَ عَن بَيِّنَةٍ وَيَحْيَىٰ مَنْ حَيَّ عَن بَيِّنَةٍ"
 */

const ATLAS_PATH = path.join(process.cwd(), 'SOVEREIGN_CODEBASE_INDEX.md');

async function verify() {
  console.log("🔍 [VERIFY_ATLAS] Reading Sovereign Index...");
  
  if (!fs.existsSync(ATLAS_PATH)) {
    console.error("❌ Atlas file not found!");
    process.exit(1);
  }

  const content = fs.readFileSync(ATLAS_PATH, 'utf-8');
  const lines = content.split('\n');
  
  const greenFiles: string[] = [];
  const fileRegex = /\| `(.*?)` \| ✅ أخضر \|/;

  for (const line of lines) {
    const match = line.match(fileRegex);
    if (match) {
      greenFiles.push(match[1]);
    }
  }

  if (greenFiles.length === 0) {
    console.log("⚠️ No 'Green' files claimed in Atlas. Nothing to verify.");
    return;
  }

  console.log(`🚀 Verifying ${greenFiles.length} claimed green files...`);
  
  let failedCount = 0;
  for (const file of greenFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Claimed file NOT FOUND: ${file}`);
      failedCount++;
      continue;
    }

    try {
      console.log(`  - Checking ${file}...`);
      // تشغيل tsc على الملف فقط
      execSync(`npx tsc ${filePath} --noEmit --esModuleInterop --skipLibCheck`, { stdio: 'ignore' });
      console.log(`    ✅ Verified.`);
    } catch (e) {
      console.error(`    ❌ FAILED: ${file} has TypeScript errors but was claimed as 10/10.`);
      failedCount++;
    }
  }

  if (failedCount > 0) {
    console.error(`\n🚨 ATLAS VERIFICATION FAILED: ${failedCount} files are dishonest!`);
    console.error("Reward Penalty Applied: (Resonance - 1.0) * 29");
    process.exit(1);
  }

  console.log("\n✨ ALL CLAIMED FILES ARE TRULY GREEN. Resonance is high.");
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
