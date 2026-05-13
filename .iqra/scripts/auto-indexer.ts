#!/usr/bin/env npx tsx
/**
 * IQRA Auto Indexer — الفهرس الموحد
 *
 * يولّد IQRA_INDEX.md من جميع ملفات .md في:
 *  - src/lib/iqra/ (الطبقات 14)
 *  - src/knowledge_base/
 *  - الجذر (روائز التعريف)
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - SCAN_DIRS و ROOT_MARKERS قابلة للتوسعة بحرية.
 *   - دالة classify() تصنّف الملفات حسب موقعها. أضف فئات إذا ظهرت طبقات
 *     جديدة في src/lib/iqra/ (مثلاً 14-spiritual أو 15-quantum).
 *   - الناتج IQRA_INDEX.md في الجذر — لا تنقله بدون تحديث README الرئيسي.
 */

import * as fs from 'fs';
import * as path from 'path';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const OUTPUT = 'IQRA_INDEX.md';

const SCAN_DIRS = ['src/lib/iqra', 'src/knowledge_base'];
const ROOT_MARKERS = ['README.md', 'SOVEREIGN_ROADMAP.md', 'WISDOM_7.md', 'REFLECTION.md'];

function* walkMd(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      yield* walkMd(fullPath);
    } else if (entry.name.endsWith('.md')) {
      yield fullPath;
    }
  }
}

function readCycle(): string {
  return fs.existsSync(CYCLE_FILE) ? fs.readFileSync(CYCLE_FILE, 'utf-8').trim() : '1';
}

function appendPulse(action: string, meta: Record<string, unknown> = {}): void {
  fs.mkdirSync(path.dirname(PULSES), { recursive: true });
  const pulse = { timestamp: new Date().toISOString(), action, cycle: readCycle(), ...meta };
  fs.appendFileSync(PULSES, JSON.stringify(pulse) + '\n');
}

function classify(file: string): 'manifest' | 'knowledge' | 'skill' | 'layer' | 'root' {
  if (file.includes('00-manifest')) return 'manifest';
  if (file.includes('knowledge_base')) return 'knowledge';
  if (file.includes('08-skills') || file.includes('08-cognitive')) return 'skill';
  if (file.startsWith('src/lib/iqra/')) return 'layer';
  return 'root';
}

function generateIqraIndex(): void {
  const all: string[] = [];
  for (const dir of SCAN_DIRS) {
    for (const md of walkMd(dir)) all.push(md);
  }
  for (const marker of ROOT_MARKERS) {
    if (fs.existsSync(marker)) all.push(marker);
  }

  const grouped: Record<string, string[]> = {
    manifest: [],
    knowledge: [],
    skill: [],
    layer: [],
    root: [],
  };
  for (const file of all) grouped[classify(file)].push(file);

  const stamp = new Date().toISOString().slice(0, 10);
  let index = `# 📚 فهرس معرفة IQRA\n\n`;
  index += `_تولد تلقائياً بواسطة IQRA Growth Engine — ${stamp}_\n\n`;
  index += `_الدورة الحالية: ${readCycle()} / 30_\n\n`;
  index += `---\n\n`;

  const sections: Array<[string, string, keyof typeof grouped]> = [
    ['🌟', 'المنفست (Manifest)', 'manifest'],
    ['🧠', 'المهارات (Skills)', 'skill'],
    ['🏛️', 'الطبقات (Architecture Layers)', 'layer'],
    ['📖', 'قاعدة المعرفة (Knowledge Base)', 'knowledge'],
    ['🪪', 'وثائق الجذر (Root Docs)', 'root'],
  ];

  let totalCount = 0;
  for (const [icon, title, key] of sections) {
    const files = grouped[key].sort();
    if (files.length === 0) continue;
    index += `## ${icon} ${title} (${files.length})\n\n`;
    for (const file of files) {
      const name = path.basename(file, '.md');
      index += `- [${name}](./${file})\n`;
    }
    index += `\n`;
    totalCount += files.length;
  }

  index += `---\n\n`;
  index += `**إجمالي الملفات المفهرسة:** ${totalCount}\n`;

  fs.writeFileSync(OUTPUT, index);
  appendPulse('index-generated', { files: totalCount });
  console.log(`📚 ${OUTPUT} تم توليده — ${totalCount} ملف`);
}

generateIqraIndex();
