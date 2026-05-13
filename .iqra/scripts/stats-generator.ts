#!/usr/bin/env npx tsx
/**
 * IQRA Stats Generator — مولد الإحصائيات
 *
 * عداد للملفات والأسطر حسب النوع.
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - أبقِ هذا السكريبت بسيطاً جداً (KISS). إذا احتجت تحليلاً عميقاً،
 *     أنشئ سكريبت منفصل في .iqra/intelligence/ بدلاً من نفخ هذا.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const OUTPUT = '.iqra/performance/stats.md';
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', '.iqra']);
const TRACKED = ['.ts', '.tsx', '.js', '.md', '.py', '.go', '.yml', '.yaml', '.json'];

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else if (TRACKED.some((e) => entry.name.endsWith(e))) yield fullPath;
  }
}

const CYCLE_LENGTH = 30;

function readCycle(): string {
  if (!fs.existsSync(CYCLE_FILE)) return '1';
  const raw = fs.readFileSync(CYCLE_FILE, 'utf-8').trim();
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n >= 1 && n <= CYCLE_LENGTH ? String(n) : '1';
}

function appendPulse(action: string, meta: Record<string, unknown> = {}): void {
  fs.mkdirSync(path.dirname(PULSES), { recursive: true });
  const pulse = { timestamp: new Date().toISOString(), action, cycle: readCycle(), ...meta };
  fs.appendFileSync(PULSES, JSON.stringify(pulse) + '\n');
}

/**
 * عدّ الأسطر تدفقياً بـ readline — لا يحمّل الملف بالكامل في الذاكرة.
 * 🤖 NOTE: يحمي من ملفات ضخمة (lock files, logs, db dumps) بدون تأثير على الذاكرة.
 */
async function countLines(file: string): Promise<number> {
  return new Promise((resolve) => {
    let count = 0;
    const stream = fs.createReadStream(file);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', () => count++);
    rl.on('close', () => resolve(count));
    rl.on('error', () => resolve(0));
    stream.on('error', () => resolve(0));
  });
}

async function generateStats(): Promise<void> {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const byExt: Record<string, { files: number; lines: number }> = {};
  let totalFiles = 0;
  let totalLines = 0;

  for (const file of walk('.')) {
    const ext = path.extname(file);
    const lines = await countLines(file);
    byExt[ext] = byExt[ext] || { files: 0, lines: 0 };
    byExt[ext].files++;
    byExt[ext].lines += lines;
    totalFiles++;
    totalLines += lines;
  }

  let report = `# 📐 إحصائيات IQRA\n\n`;
  report += `_الدورة ${readCycle()} — ${new Date().toISOString()}_\n\n`;
  report += `## الإجمالي\n\n`;
  report += `- **الملفات:** ${totalFiles}\n`;
  report += `- **الأسطر:** ${totalLines.toLocaleString()}\n\n`;
  report += `## حسب النوع\n\n`;
  report += `| الامتداد | الملفات | الأسطر |\n|----------|---------|--------|\n`;
  for (const [ext, { files, lines }] of Object.entries(byExt).sort((a, b) => b[1].lines - a[1].lines)) {
    report += `| ${ext} | ${files} | ${lines.toLocaleString()} |\n`;
  }

  fs.writeFileSync(OUTPUT, report);
  appendPulse('stats-generated', { totalFiles, totalLines });
  console.log(`📐 ${OUTPUT} — ${totalFiles} ملف, ${totalLines} سطر`);
}

generateStats().catch((err) => {
  console.error('❌ فشل توليد الإحصائيات:', err);
  process.exit(1);
});
