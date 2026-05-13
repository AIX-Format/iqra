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

function readCycle(): string {
  return fs.existsSync(CYCLE_FILE) ? fs.readFileSync(CYCLE_FILE, 'utf-8').trim() : '1';
}

function appendPulse(action: string, meta: Record<string, unknown> = {}): void {
  fs.mkdirSync(path.dirname(PULSES), { recursive: true });
  const pulse = { timestamp: new Date().toISOString(), action, cycle: readCycle(), ...meta };
  fs.appendFileSync(PULSES, JSON.stringify(pulse) + '\n');
}

function generateStats(): void {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const byExt: Record<string, { files: number; lines: number }> = {};
  let totalFiles = 0;
  let totalLines = 0;

  for (const file of walk('.')) {
    const ext = path.extname(file);
    const lines = fs.readFileSync(file, 'utf-8').split('\n').length;
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

generateStats();
