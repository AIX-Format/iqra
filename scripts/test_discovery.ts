import { TadabburLoop } from '#quran/discovery_loop';

async function main() {
  console.log("🚀 Starting Verification Mission: Surah Ya-Sin (36)...");
  await TadabburLoop.run(36, "1-7");
  console.log("🏁 Mission Complete. Check DISCOVERIES.md for the trace.");
}

main().catch(console.error);
