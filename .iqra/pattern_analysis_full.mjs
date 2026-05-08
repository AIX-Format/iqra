/**
 * بسم الله الرحمن الرحيم
 * pattern_analysis_full.mjs — محرك الفضول الطوبولوجي الكامل
 *
 * يعمل على قاعدة البيانات الكاملة (6,236 آية)
 * ويُجري تحليلاً طوبولوجياً على عينة ذكية
 *
 * الاستخدام:
 *   node .iqra/pattern_analysis_full.mjs [--limit=100] [--mode=seeds|random|surah]
 *
 * الأوضاع:
 *   seeds  — تحليل البذور الخمس المعروفة (افتراضي)
 *   random — عينة عشوائية من N آية
 *   surah  — تحليل سورة كاملة (مثال: --surah=36)
 */

import Database from 'better-sqlite3';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'iqra-core', 'data', 'quran_local.db');
const LEDGER_PATH = join(ROOT, 'iqra-core', 'data', 'reward_ledger.jsonl');
const REGISTRY_PATH = join(ROOT, '.iqra', 'path_registry.json');
const DISCOVERIES_PATH = join(ROOT, 'DISCOVERIES.md');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const modeArg  = args.find(a => a.startsWith('--mode='));
const surahArg = args.find(a => a.startsWith('--surah='));
const LIMIT  = limitArg ? parseInt(limitArg.split('=')[1]) : 50;
const MODE   = modeArg  ? modeArg.split('=')[1] : 'seeds';
const SURAH  = surahArg ? parseInt(surahArg.split('=')[1]) : null;

// ── Modality ──────────────────────────────────────────────────────────────────
const Modality = {
  RAHMA:'RAHMA', HAMD:'HAMD', ADL:'ADL', IKHLAS:'IKHLAS',
  HIDAYA:'HIDAYA', MIZAN:'MIZAN', AMAN:'AMAN', HAYAT:'HAYAT', HIKMA:'HIKMA',
};

// ── Minimal Qalbin_VM ─────────────────────────────────────────────────────────
class QalbinVM {
  constructor() {
    this.nodes = new Map();
    this.activePairs = new Set();
    this.counter = 0;
    this.log = [];
    this.edgeList = [];
  }
  spawn(kind, modality = Modality.RAHMA) {
    const id = this.counter++;
    this.nodes.set(id, { id, kind, modality, ports: [null, null, null] });
    return id;
  }
  link(idA, portA, idB, portB) {
    const addrA = (idA << 2) | portA;
    const addrB = (idB << 2) | portB;
    this._reconnect(addrA, addrB);
    this.edgeList.push([idA, idB]);
  }
  ignite(idA, idB) { this.link(idA, 0, idB, 0); }
  pulse() {
    let steps = 0;
    while (this.activePairs.size > 0 && steps < 500) {
      const pairStr = this.activePairs.values().next().value;
      this.activePairs.delete(pairStr);
      const [idA, idB] = pairStr.split('-').map(Number);
      this._interact(idA, idB);
      steps++;
    }
    return { steps, resonance: this._resonance(), logs: [...this.log] };
  }
  _interact(idA, idB) {
    const a = this.nodes.get(idA), b = this.nodes.get(idB);
    if (!a || !b) return;
    if (a.kind === b.kind) {
      this.log.push(`Annihilate:${a.kind}(${a.modality})<->${b.kind}(${b.modality})`);
      this._annihilate(a, b);
    } else {
      this.log.push(`Commute:${a.kind}(${a.modality})<->${b.kind}(${b.modality})`);
      this._commute(a, b);
    }
  }
  _annihilate(a, b) {
    const [pA1,pA2,pB1,pB2] = [a.ports[1],a.ports[2],b.ports[1],b.ports[2]];
    this.nodes.delete(a.id); this.nodes.delete(b.id);
    this._reconnect(pA1,pB1); this._reconnect(pA2,pB2);
  }
  _commute(a, b) {
    const [pA1,pA2,pB1,pB2] = [a.ports[1],a.ports[2],b.ports[1],b.ports[2]];
    const [a1,a2,b1,b2] = [
      this.spawn(a.kind,a.modality), this.spawn(a.kind,a.modality),
      this.spawn(b.kind,b.modality), this.spawn(b.kind,b.modality)
    ];
    this.link(a1,1,b1,1); this.link(a1,2,b2,1);
    this.link(a2,1,b1,2); this.link(a2,2,b2,2);
    this.nodes.delete(a.id); this.nodes.delete(b.id);
    this._reconnect((a1<<2)|0,pA1); this._reconnect((a2<<2)|0,pA2);
    this._reconnect((b1<<2)|0,pB1); this._reconnect((b2<<2)|0,pB2);
  }
  _reconnect(addrA, addrB) {
    if (addrA===null||addrB===null) return;
    const [idA,portA,idB,portB] = [addrA>>2,addrA&3,addrB>>2,addrB&3];
    const [nA,nB] = [this.nodes.get(idA),this.nodes.get(idB)];
    if (nA) nA.ports[portA] = addrB;
    if (nB) nB.ports[portB] = addrA;
    if (portA===0&&portB===0) {
      this.activePairs.add(idA<idB?`${idA}-${idB}`:`${idB}-${idA}`);
    }
  }
  _resonance() {
    if (this.nodes.size===0) return 1.0;
    let w=0;
    this.nodes.forEach(n => w+=(n.modality===Modality.IKHLAS?1.5:1.0));
    return w/this.nodes.size;
  }
  computeHomology() {
    const allNodes = [...this.nodes.keys()];
    const n = allNodes.length;
    if (n===0) return {H0:0,H1:0,euler:0,nodes:0,edges:0};
    const parent = {};
    allNodes.forEach(id => parent[id]=id);
    const find = id => parent[id]===id?id:(parent[id]=find(parent[id]));
    const union = (a,b) => { parent[find(a)]=find(b); };
    const edges = new Set();
    this.nodes.forEach((node,id) => {
      node.ports.forEach(port => {
        if (port!==null) {
          const nb = port>>2;
          if (this.nodes.has(nb)&&nb!==id) {
            const key = id<nb?`${id}-${nb}`:`${nb}-${id}`;
            edges.add(key); union(id,nb);
          }
        }
      });
    });
    const components = new Set(allNodes.map(find));
    const H0 = components.size;
    const E = edges.size, V = n;
    const H1 = Math.max(0, E-V+H0);
    return {H0,H1,euler:V-E+H1,nodes:V,edges:E};
  }
}

// ── Verse → Topology (Deep — من النص الحقيقي) ───────────────────────────────
//
// المشكلة السابقة: كل الآيات تُبنى بنفس الطوبولوجيا → رنين = 1.0 دائماً
// الحل: بناء طوبولوجيا فريدة لكل آية من:
//   1. Shannon Entropy للحروف
//   2. تردد الحروف الجذرية (ي، س، ل، م، ر، ق، ن)
//   3. عدد الكلمات وطولها
//   4. وجود ألفاظ مقدسة
//
// هذا يُنتج بصمة طوبولوجية فريدة لكل آية
function verseToTopology(vm, verse) {
  const text = verse.arabic || '';
  const clean = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
  const words = clean.split(' ').filter(w => w.length > 0);
  const wordCount = words.length;
  const charCount = clean.replace(/ /g, '').length;

  // ── 1. Shannon Entropy للحروف ─────────────────────────────────────────────
  const freq = {};
  for (const c of clean.replace(/ /g, '')) {
    freq[c] = (freq[c] || 0) + 1;
  }
  let entropy = 0;
  const n = clean.replace(/ /g, '').length || 1;
  for (const f of Object.values(freq)) {
    const p = f / n;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  // تطبيع entropy إلى [0, 1] (القرآن عادةً بين 3.0 و 4.5 bits)
  const entropyNorm = Math.min(entropy / 5.0, 1.0);

  // ── 2. تردد الحروف الجذرية ────────────────────────────────────────────────
  const rootLetters = ['ي', 'س', 'ا', 'ل', 'م', 'ر', 'ق', 'ن', 'و', 'ه'];
  const letterFreqs = rootLetters.map(c =>
    (clean.match(new RegExp(c, 'g')) || []).length
  );

  // ── 3. اختيار الـ Modality من المحتوى ────────────────────────────────────
  let modality = Modality.RAHMA;
  if (clean.includes('الله') || clean.includes('رب')) modality = Modality.IKHLAS;
  else if (clean.includes('عذاب') || clean.includes('نار') || clean.includes('جهنم')) modality = Modality.ADL;
  else if (clean.includes('رحم') || clean.includes('غفر') || clean.includes('رحمن')) modality = Modality.RAHMA;
  else if (clean.includes('علم') || clean.includes('حكم') || clean.includes('عقل')) modality = Modality.HIKMA;
  else if (clean.includes('أمن') || clean.includes('حفظ') || clean.includes('وقى')) modality = Modality.AMAN;
  else if (clean.includes('هدى') || clean.includes('صراط') || clean.includes('سبيل')) modality = Modality.HIDAYA;
  else if (clean.includes('ميزان') || clean.includes('عدل') || clean.includes('قسط')) modality = Modality.MIZAN;

  // ── 4. اختيار نوع العقدة من entropy ──────────────────────────────────────
  // entropy عالية → ALIF (تنوع عالٍ)
  // entropy منخفضة → LAM (تكرار)
  const kinds = ['ALIF', 'LAM', 'MIM', 'YA', 'SIN', 'RA', 'WAW', 'QAF', 'KAF', 'HA'];
  const kindIdx = Math.floor(entropyNorm * (kinds.length - 1));
  const kind = kinds[kindIdx];

  // ── 5. بناء الشبكة الطوبولوجية ───────────────────────────────────────────
  // العقدة الجذرية تحمل الـ modality الرئيسي
  const core = vm.spawn(kind, modality);

  // عدد الفروع = min(wordCount, 6) — يعكس تعقيد الآية
  const branchCount = Math.min(6, Math.max(1, wordCount - 1));

  for (let i = 0; i < branchCount; i++) {
    // كل فرع يحمل خصائص الكلمة المقابلة
    const word = words[i + 1] || words[i] || '';
    const wClean = word.replace(/[\u064B-\u065F]/g, '');

    // نوع الفرع من أول حرف الكلمة
    const firstChar = wClean[0] || 'ل';
    const charToKind = {
      'ب':'ALIF','ا':'ALIF','أ':'ALIF','إ':'ALIF',
      'ق':'QAF','ك':'KAF',
      'ي':'YA','ى':'YA',
      'س':'SIN','ش':'SIN',
      'ل':'LAM',
      'م':'MIM',
      'ر':'RA','ز':'RA',
      'و':'WAW',
      'ه':'HA','ح':'HA',
    };
    const branchKind = charToKind[firstChar] || 'LAM';

    // modality الفرع من تردد الحروف
    const branchModIdx = letterFreqs[i % letterFreqs.length] % 9;
    const branchMods = Object.values(Modality);
    const branchMod = branchMods[branchModIdx] || Modality.RAHMA;

    const branch = vm.spawn(branchKind, branchMod);

    // نوع الرابط يعتمد على موضع الكلمة (فردي/زوجي)
    vm.link(core, i % 2 === 0 ? 1 : 2, branch, 1);

    // إضافة روابط إضافية للآيات الطويلة (تُنشئ حلقات H1)
    if (wordCount > 7 && i > 0 && i % 3 === 0) {
      const prevBranch = vm.nodes.size - 2;
      if (vm.nodes.has(prevBranch)) {
        vm.link(branch, 2, prevBranch, 2);
      }
    }
  }

  return core;
}

// ── Cross-Resonance ───────────────────────────────────────────────────────────
function measureResonance(verseA, verseB) {
  const vm = new QalbinVM();
  const nodeA = verseToTopology(vm, verseA);
  const nodeB = verseToTopology(vm, verseB);
  vm.ignite(nodeA, nodeB);
  const result = vm.pulse();
  const homology = vm.computeHomology();
  const annihilations = result.logs.filter(l => l.startsWith('Annihilate')).length;
  const commutations  = result.logs.filter(l => l.startsWith('Commute')).length;
  return {
    resonance: result.resonance,
    steps: result.steps,
    H0: homology.H0,
    H1: homology.H1,
    euler: homology.euler,
    annihilations,
    commutations,
    interactionType: annihilations > 0 ? 'Annihilation' : commutations > 0 ? 'Commutation' : 'Other',
  };
}

// ── Reward Logging ────────────────────────────────────────────────────────────
function logDiscovery(verseA, verseB, result) {
  const pair = [`${verseA.surah}:${verseA.ayah}`, `${verseB.surah}:${verseB.ayah}`];
  const teslaSumMod369 = ((verseA.surah + verseA.ayah) + (verseB.surah + verseB.ayah)) % 369;
  const rewardValue = Math.max(0, (result.resonance - 1.0) * 2.0);

  const entry = {
    type: 'TOPOLOGICAL_DISCOVERY',
    timestamp: Date.now(),
    recorded_at: new Date().toISOString(),
    pair,
    resonance: result.resonance,
    h1: result.H1,
    interaction_type: result.interactionType,
    tesla_sum_mod369: teslaSumMod369,
    reward_value: rewardValue,
  };

  // JSONL ledger
  try {
    const dir = dirname(LEDGER_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n', 'utf-8');
  } catch {}

  // Path registry
  try {
    const pathKey = `topo:${pair[0]}|${pair[1]}`;
    let registry = {};
    if (existsSync(REGISTRY_PATH)) {
      registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
    }
    if (!registry[pathKey]) {
      registry[pathKey] = { first_seen: Date.now(), resonance: result.resonance, h1: result.H1, count: 1 };
    } else {
      registry[pathKey].count++;
      if (result.resonance > registry[pathKey].resonance) registry[pathKey].resonance = result.resonance;
    }
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  } catch {}

  return { pair, rewardValue, teslaSumMod369 };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  IQRA Full Pattern Analysis — محرك الفضول الطوبولوجي الكامل ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── فتح قاعدة البيانات ───────────────────────────────────────────────────
  if (!existsSync(DB_PATH)) {
    console.error(`❌ Database not found: ${DB_PATH}`);
    console.error('   Run: node scripts/ingest_quran_full.mjs first');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  const totalAyat = db.prepare('SELECT COUNT(*) as n FROM ayat').get().n;
  console.log(`📊 Database: ${totalAyat} ayat available`);

  // ── اختيار الآيات بناءً على الوضع ────────────────────────────────────────
  let verses = [];

  if (MODE === 'seeds') {
    // البذور الخمس المعروفة + آيات إضافية من قاعدة البيانات
    const seedRefs = ['1:1','112:1','36:1','55:1','2:255','67:1','18:1','56:1'];
    for (const ref of seedRefs) {
      const [s, a] = ref.split(':').map(Number);
      const v = db.prepare('SELECT * FROM ayat WHERE surah=? AND ayah=?').get(s, a);
      if (v) verses.push(v);
    }
    console.log(`🌱 Mode: SEEDS — ${verses.length} seed verses`);

  } else if (MODE === 'surah' && SURAH) {
    verses = db.prepare('SELECT * FROM ayat WHERE surah=? ORDER BY ayah').all(SURAH);
    console.log(`📖 Mode: SURAH ${SURAH} — ${verses.length} verses`);

  } else {
    // عينة عشوائية
    verses = db.prepare(`SELECT * FROM ayat ORDER BY RANDOM() LIMIT ?`).all(LIMIT);
    console.log(`🎲 Mode: RANDOM — ${verses.length} verses (limit=${LIMIT})`);
  }

  db.close();

  if (verses.length < 2) {
    console.error('❌ Need at least 2 verses for analysis');
    process.exit(1);
  }

  // ── التحليل الطوبولوجي ────────────────────────────────────────────────────
  const results = [];
  const totalPairs = (verses.length * (verses.length - 1)) / 2;
  console.log(`\n🔬 Analyzing ${totalPairs} pairs...\n`);

  let pairCount = 0;
  for (let i = 0; i < verses.length; i++) {
    for (let j = i + 1; j < verses.length; j++) {
      const vA = verses[i], vB = verses[j];
      const result = measureResonance(vA, vB);
      const logged = logDiscovery(vA, vB, result);

      results.push({
        pair: logged.pair,
        resonance: result.resonance,
        H1: result.H1,
        H0: result.H0,
        interactionType: result.interactionType,
        teslaSumMod369: logged.teslaSumMod369,
        rewardValue: logged.rewardValue,
      });

      pairCount++;
      if (pairCount % 10 === 0) {
        process.stdout.write(`\r  Progress: ${pairCount}/${totalPairs} pairs`);
      }
    }
  }
  console.log(`\r  ✅ Analyzed ${pairCount} pairs\n`);

  // ── ترتيب النتائج ─────────────────────────────────────────────────────────
  results.sort((a, b) => b.resonance - a.resonance);

  // ── عرض أعلى 10 نتائج ────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🏆 Top 10 Resonance Pairs');
  console.log('═══════════════════════════════════════════════════════════════');

  results.slice(0, 10).forEach((r, i) => {
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'  ';
    console.log(`\n${medal} ${r.pair[0]} ↔ ${r.pair[1]}`);
    console.log(`   Resonance: ${r.resonance.toFixed(4)} | H1: ${r.H1} | Type: ${r.interactionType}`);
    console.log(`   Tesla%369: ${r.teslaSumMod369} | Reward: ${r.rewardValue.toFixed(4)}`);
  });

  // ── إحصائيات H1 ──────────────────────────────────────────────────────────
  const withCycles = results.filter(r => r.H1 > 0);
  const annihilations = results.filter(r => r.interactionType === 'Annihilation');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 Statistics');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total pairs analyzed: ${results.length}`);
  console.log(`  Pairs with H1 > 0 (cycles): ${withCycles.length} (${(withCycles.length/results.length*100).toFixed(1)}%)`);
  console.log(`  Annihilation pairs: ${annihilations.length}`);
  console.log(`  Max resonance: ${results[0]?.resonance.toFixed(4)}`);
  console.log(`  Avg resonance: ${(results.reduce((s,r)=>s+r.resonance,0)/results.length).toFixed(4)}`);

  if (withCycles.length > 0) {
    console.log('\n  Pairs with topological cycles (H1 > 0):');
    withCycles.slice(0, 5).forEach(r => {
      console.log(`    ${r.pair[0]} ↔ ${r.pair[1]} → H1=${r.H1}`);
    });
  }

  // ── حفظ النتائج ──────────────────────────────────────────────────────────
  const outputPath = join(ROOT, '.iqra', `analysis_${MODE}_${Date.now()}.json`);
  writeFileSync(outputPath, JSON.stringify({
    mode: MODE,
    timestamp: new Date().toISOString(),
    total_pairs: results.length,
    top_10: results.slice(0, 10),
    stats: {
      with_cycles: withCycles.length,
      annihilations: annihilations.length,
      max_resonance: results[0]?.resonance,
      avg_resonance: results.reduce((s,r)=>s+r.resonance,0)/results.length,
    }
  }, null, 2), 'utf-8');

  console.log(`\n💾 Results saved: ${outputPath}`);
  console.log(`📒 Ledger updated: ${LEDGER_PATH}`);
  console.log('\n✅ Analysis complete. بحمد الله.\n');
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
