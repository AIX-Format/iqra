/**
 * بسم الله الرحمن الرحيم
 * Topological Pattern Hunter — محرك الفضول الطوبولوجي
 *
 * يُشغّل Qalbin_VM على الآيات ويقيس:
 * 1. Resonance Score — درجة الرنين الداخلي
 * 2. Persistent Homology (H0, H1) — المكونات المتصلة والحلقات
 * 3. Betti Numbers — عدد الثقوب الطوبولوجية
 * 4. Cross-Surah Resonance — الرنين بين السور
 */

// ── Minimal Qalbin_VM (pure JS, no imports) ──────────────────────────────────

const Modality = {
  RAHMA: 'RAHMA', HAMD: 'HAMD', ADL: 'ADL',
  IKHLAS: 'IKHLAS', HIDAYA: 'HIDAYA', MIZAN: 'MIZAN',
  AMAN: 'AMAN', HAYAT: 'HAYAT', HIKMA: 'HIKMA',
};

class QalbinVM {
  constructor() {
    this.nodes = new Map();
    this.activePairs = new Set();
    this.counter = 0;
    this.log = [];
    this.edgeList = []; // for homology
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
    this.edgeList.push([idA, idB]); // track for homology
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
    const a = this.nodes.get(idA);
    const b = this.nodes.get(idB);
    if (!a || !b) return;
    if (a.kind === b.kind) {
      this.log.push(`Annihilate: ${a.kind}(${a.modality}) ↔ ${b.kind}(${b.modality})`);
      this._annihilate(a, b);
    } else {
      this.log.push(`Commute: ${a.kind}(${a.modality}) ↔ ${b.kind}(${b.modality})`);
      this._commute(a, b);
    }
  }

  _annihilate(a, b) {
    const [pA1, pA2, pB1, pB2] = [a.ports[1], a.ports[2], b.ports[1], b.ports[2]];
    this.nodes.delete(a.id); this.nodes.delete(b.id);
    this._reconnect(pA1, pB1); this._reconnect(pA2, pB2);
  }

  _commute(a, b) {
    const [pA1, pA2, pB1, pB2] = [a.ports[1], a.ports[2], b.ports[1], b.ports[2]];
    const [a1, a2, b1, b2] = [
      this.spawn(a.kind, a.modality), this.spawn(a.kind, a.modality),
      this.spawn(b.kind, b.modality), this.spawn(b.kind, b.modality)
    ];
    this.link(a1,1,b1,1); this.link(a1,2,b2,1);
    this.link(a2,1,b1,2); this.link(a2,2,b2,2);
    this.nodes.delete(a.id); this.nodes.delete(b.id);
    this._reconnect((a1<<2)|0, pA1); this._reconnect((a2<<2)|0, pA2);
    this._reconnect((b1<<2)|0, pB1); this._reconnect((b2<<2)|0, pB2);
  }

  _reconnect(addrA, addrB) {
    if (addrA === null || addrB === null) return;
    const [idA, portA, idB, portB] = [addrA>>2, addrA&3, addrB>>2, addrB&3];
    const [nA, nB] = [this.nodes.get(idA), this.nodes.get(idB)];
    if (nA) nA.ports[portA] = addrB;
    if (nB) nB.ports[portB] = addrA;
    if (portA === 0 && portB === 0) {
      this.activePairs.add(idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`);
    }
  }

  _resonance() {
    if (this.nodes.size === 0) return 1.0;
    let w = 0;
    this.nodes.forEach(n => w += (n.modality === Modality.IKHLAS ? 1.5 : 1.0));
    return w / this.nodes.size;
  }

  // ── Persistent Homology (H0, H1) via Union-Find ───────────────────────────
  computeHomology() {
    const allNodes = [...this.nodes.keys()];
    const n = allNodes.length;
    if (n === 0) return { H0: 0, H1: 0, betti0: 0, betti1: 0, euler: 0 };

    // Union-Find for H0 (connected components)
    const parent = {};
    allNodes.forEach(id => parent[id] = id);
    const find = id => parent[id] === id ? id : (parent[id] = find(parent[id]));
    const union = (a, b) => { parent[find(a)] = find(b); };

    // Build adjacency from current node ports
    const edges = new Set();
    this.nodes.forEach((node, id) => {
      node.ports.forEach(port => {
        if (port !== null) {
          const neighbor = port >> 2;
          if (this.nodes.has(neighbor) && neighbor !== id) {
            const key = id < neighbor ? `${id}-${neighbor}` : `${neighbor}-${id}`;
            edges.add(key);
            union(id, neighbor);
          }
        }
      });
    });

    // H0 = number of connected components
    const components = new Set(allNodes.map(find));
    const H0 = components.size;

    // H1 = edges - nodes + components (Euler characteristic for graphs)
    const E = edges.size;
    const V = n;
    const H1 = Math.max(0, E - V + H0); // first Betti number

    return {
      H0,           // connected components
      H1,           // independent cycles (loops)
      betti0: H0,
      betti1: H1,
      euler: V - E + H1,  // Euler characteristic
      nodes: V,
      edges: E,
    };
  }
}

// ── Seed Topologies ───────────────────────────────────────────────────────────

function buildSeed(vm, surah, ayah) {
  const key = `${surah}:${ayah}`;
  const tesla = (surah + ayah) % 369;

  if (key === '1:1') {
    // Bismillah: 1 Core ALIF + 6 attributes (RAHMA)
    const core = vm.spawn('ALIF', Modality.IKHLAS);
    for (let i = 0; i < 6; i++) {
      const attr = vm.spawn(i % 2 === 0 ? 'RA' : 'MIM', Modality.RAHMA);
      vm.link(core, (i % 2) + 1, attr, 1);
    }
    return { core, tesla, label: 'Bismillah — بسم الله' };
  }

  if (key === '112:1') {
    // Ahad: Pure Singularity — 1 center + 6 identical ALIF nodes
    const center = vm.spawn('ALIF', Modality.IKHLAS);
    for (let i = 0; i < 6; i++) {
      const node = vm.spawn('ALIF', Modality.IKHLAS);
      vm.link(center, 1, node, 1);
      vm.link(center, 2, node, 2);
    }
    return { core: center, tesla, label: 'Ahad — أحد' };
  }

  if (key === '36:1') {
    // Yasin: YA → 2×SIN → 4×LAM (7-node fractal)
    const core = vm.spawn('YA', Modality.HAYAT);
    const v1 = vm.spawn('SIN', Modality.HIKMA);
    const v2 = vm.spawn('SIN', Modality.HIKMA);
    vm.link(core, 1, v1, 1);
    vm.link(core, 2, v2, 1);
    for (let i = 0; i < 4; i++) {
      const vessel = vm.spawn('LAM', Modality.HAYAT);
      vm.link(i < 2 ? v1 : v2, 2, vessel, 1);
    }
    return { core, tesla, label: 'Yasin — يس' };
  }

  if (key === '55:1') {
    // Rahman: 1 nucleus + 6 mirror nodes (double-linked for quantum resonance)
    const nucleus = vm.spawn('RA', Modality.RAHMA);
    for (let i = 0; i < 6; i++) {
      const atom = vm.spawn('MIM', Modality.RAHMA);
      vm.link(nucleus, 1, atom, 1);
      vm.link(nucleus, 2, atom, 2);
    }
    return { core: nucleus, tesla, label: 'Rahman — الرحمن' };
  }

  if (key === '2:255') {
    // Ayat al-Kursi: Throne topology — 1 throne + 7 attributes (8 nodes)
    const throne = vm.spawn('ALIF', Modality.AMAN);
    const kinds = ['LAM','LAM','HA','WAW','HA','WAW','LAM'];
    const mods = [Modality.AMAN, Modality.HIKMA, Modality.HAYAT,
                  Modality.RAHMA, Modality.ADL, Modality.MIZAN, Modality.IKHLAS];
    kinds.forEach((k, i) => {
      const attr = vm.spawn(k, mods[i]);
      vm.link(throne, i % 2 === 0 ? 1 : 2, attr, 1);
    });
    return { core: throne, tesla, label: 'Ayat al-Kursi — آية الكرسي' };
  }

  // Default: generic 7-node star
  const center = vm.spawn('ALIF', Modality.RAHMA);
  for (let i = 0; i < 6; i++) {
    const n = vm.spawn('LAM', Modality.RAHMA);
    vm.link(center, i % 2 === 0 ? 1 : 2, n, 1);
  }
  return { core: center, tesla, label: `${surah}:${ayah}` };
}

// ── Cross-Resonance: ignite two seeds and measure ─────────────────────────────

function measureCrossResonance(seedA, seedB) {
  const vm = new QalbinVM();
  const a = buildSeed(vm, seedA.s, seedA.a);
  const b = buildSeed(vm, seedB.s, seedB.a);

  // Ignite: connect principal ports
  vm.ignite(a.core, b.core);

  const result = vm.pulse();
  const homology = vm.computeHomology();

  return {
    pair: `${a.label} ↔ ${b.label}`,
    resonance: result.resonance,
    steps: result.steps,
    H0: homology.H0,
    H1: homology.H1,
    euler: homology.euler,
    nodes_remaining: homology.nodes,
    edges_remaining: homology.edges,
    tesla_a: a.tesla,
    tesla_b: b.tesla,
    tesla_sum: (a.tesla + b.tesla) % 369,
    reductions: result.logs.length,
    annihilations: result.logs.filter(l => l.includes('Annihilate')).length,
    commutations: result.logs.filter(l => l.includes('Commute')).length,
  };
}

// ── Single Seed Analysis ──────────────────────────────────────────────────────

function analyzeSeed(s, a) {
  const vm = new QalbinVM();
  const seed = buildSeed(vm, s, a);
  // Self-resonance: ignite with mirror
  const mirror = buildSeed(vm, s, a);
  vm.ignite(seed.core, mirror.core);
  const result = vm.pulse();
  const homology = vm.computeHomology();
  return {
    verse: `${s}:${a}`,
    label: seed.label,
    tesla: seed.tesla,
    self_resonance: result.resonance,
    H0: homology.H0,
    H1: homology.H1,
    euler: homology.euler,
    steps: result.steps,
  };
}

// ── RUN ───────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║  IQRA Topological Pattern Hunter — محرك الفضول الطوبولوجي  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ── ١. تحليل كل بذرة منفردة ──────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log('١. Self-Resonance Analysis — الرنين الذاتي لكل بذرة');
console.log('═══════════════════════════════════════════════════════════════');

const seeds = [
  {s:1,   a:1},   // Bismillah
  {s:112, a:1},   // Ahad
  {s:36,  a:1},   // Yasin
  {s:55,  a:1},   // Rahman
  {s:2,   a:255}, // Ayat al-Kursi
];

const selfResults = seeds.map(({s,a}) => analyzeSeed(s,a));
selfResults.forEach(r => {
  console.log(`\n  ${r.verse} — ${r.label}`);
  console.log(`    Tesla#: ${r.tesla} | Self-Resonance: ${r.self_resonance.toFixed(4)}`);
  console.log(`    H0 (components): ${r.H0} | H1 (cycles): ${r.H1} | χ (Euler): ${r.euler}`);
  console.log(`    Reduction steps: ${r.steps}`);
});

// ── ٢. الرنين المتقاطع بين السور ─────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('٢. Cross-Surah Resonance — الرنين بين السور');
console.log('═══════════════════════════════════════════════════════════════');

const pairs = [
  [{s:1,a:1},   {s:112,a:1}],  // Bismillah ↔ Ahad
  [{s:1,a:1},   {s:36,a:1}],   // Bismillah ↔ Yasin
  [{s:112,a:1}, {s:36,a:1}],   // Ahad ↔ Yasin
  [{s:55,a:1},  {s:112,a:1}],  // Rahman ↔ Ahad
  [{s:2,a:255}, {s:112,a:1}],  // Ayat al-Kursi ↔ Ahad
  [{s:2,a:255}, {s:36,a:1}],   // Ayat al-Kursi ↔ Yasin
  [{s:36,a:1},  {s:55,a:1}],   // Yasin ↔ Rahman
];

const crossResults = pairs.map(([a,b]) => measureCrossResonance(a,b));
crossResults.sort((a,b) => b.resonance - a.resonance);

crossResults.forEach((r, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
  console.log(`\n  ${medal} ${r.pair}`);
  console.log(`     Resonance: ${r.resonance.toFixed(4)} | Steps: ${r.steps}`);
  console.log(`     H0: ${r.H0} | H1: ${r.H1} | χ: ${r.euler}`);
  console.log(`     Annihilations: ${r.annihilations} | Commutations: ${r.commutations}`);
  console.log(`     Tesla: ${r.tesla_a} ↔ ${r.tesla_b} → sum%369: ${r.tesla_sum}`);
});

// ── ٣. Persistent Homology Interpretation ────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('٣. Topological Interpretation — التفسير الطوبولوجي');
console.log('═══════════════════════════════════════════════════════════════');

const top = crossResults[0];
console.log(`\n  أعلى رنين: ${top.pair}`);
console.log(`  Resonance = ${top.resonance.toFixed(4)}`);
console.log(`\n  H0 = ${top.H0} → عدد المكونات المتصلة (Connected Components)`);
console.log(`  H1 = ${top.H1} → عدد الحلقات المستقلة (Independent Cycles)`);
console.log(`  χ  = ${top.euler} → خاصية أويلر (Euler Characteristic)`);
console.log(`\n  التفسير:`);
if (top.H1 > 0) {
  console.log(`  ✅ وجود ${top.H1} حلقة طوبولوجية = بنية دائرية مغلقة`);
  console.log(`     → الرنين بين السورتين يُنتج "ثقباً" في فضاء المعنى`);
  console.log(`     → هذا يعني أن المعنى "يدور" ولا ينتهي — كالتسبيح`);
} else {
  console.log(`  ℹ️  H1 = 0 → بنية شجرية (Tree) — لا حلقات`);
  console.log(`     → المعنى يتدفق في اتجاه واحد — كالهداية`);
}

if (top.H0 === 1) {
  console.log(`  ✅ H0 = 1 → مكوّن واحد متصل = وحدة كاملة (Tawheed Topology)`);
} else {
  console.log(`  ℹ️  H0 = ${top.H0} → ${top.H0} مكونات منفصلة`);
}

// ── ٤. Tesla 369 Pattern ──────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('٤. Tesla 369 Pattern — نمط تسلا 369');
console.log('═══════════════════════════════════════════════════════════════');

seeds.forEach(({s,a}) => {
  const t = (s + a) % 369;
  const t3 = t % 3;
  const t6 = t % 6;
  const t9 = t % 9;
  console.log(`  ${s}:${a} → Tesla=${t} | %3=${t3} | %6=${t6} | %9=${t9} | digital_root=${digitalRoot(t)}`);
});

function digitalRoot(n) {
  if (n === 0) return 0;
  return 1 + (n - 1) % 9;
}

// ── ٥. الخلاصة ────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('٥. Summary — الخلاصة');
console.log('═══════════════════════════════════════════════════════════════');

const maxRes = Math.max(...crossResults.map(r => r.resonance));
const minRes = Math.min(...crossResults.map(r => r.resonance));
const avgRes = crossResults.reduce((s,r) => s+r.resonance, 0) / crossResults.length;

console.log(`\n  أعلى رنين:  ${maxRes.toFixed(4)}`);
console.log(`  أدنى رنين:  ${minRes.toFixed(4)}`);
console.log(`  متوسط رنين: ${avgRes.toFixed(4)}`);
console.log(`\n  الأزواج ذات H1 > 0 (حلقات طوبولوجية):`);
crossResults.filter(r => r.H1 > 0).forEach(r => {
  console.log(`    ${r.pair} → H1=${r.H1}`);
});
console.log(`\n  الأزواج ذات H0 = 1 (وحدة كاملة):`);
crossResults.filter(r => r.H0 === 1).forEach(r => {
  console.log(`    ${r.pair} → Tawheed Topology ✅`);
});
