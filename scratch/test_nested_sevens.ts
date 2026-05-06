import { analyzeAlFatiha, printReport } from '../lib/iqra/quran/nested_sevens';

/**
 * IQRA Test Lab — مختبر التحقق الرقمي
 * 
 * Testing the Nested Sevens Algorithm on Al-Fatiha.
 */

async function main() {
  console.log('🚀 Starting IQRA Nested Sevens Analysis...');
  
  const report = analyzeAlFatiha();
  const output = printReport(report);
  
  console.log(output);
  
  if (report.discoveries.length > 0) {
    console.log('\n✨ Analysis Successful: Patterns Detected.');
  } else {
    console.log('\n⚠️ Analysis Complete: No direct sevens found.');
  }
}

main().catch(err => {
  console.error('❌ Analysis Failed:', err);
  process.exit(1);
});
