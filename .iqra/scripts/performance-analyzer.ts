#!/usr/bin/env npx tsx
/**
 * IQRA Performance Analyzer — قياس الأداء
 *
 * يحلل أحجام الملفات (.ts/.md/.py) ويرصد الملفات الثقيلة (> 50KB).
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - HEAVY_THRESHOLD = 50KB حد ناعم. عدّله حسب وعي المستودع.
 *   - الناتج .iqra/performance/weekly-report.md — مُتعقّب في git.
 *   - لا تحوّل هذا السكريبت إلى أداة حذف تلقائي. اقتراح فقط.
 */

import * as fs from 'fs';
import * as path from 'path';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const OUTPUT = '.iqra/performance/weekly-report.md';
const HEAVY_THRESHOLD = 50_000; // 50KB
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', '.iqra']);
const EXTS = ['.ts', '.tsx', '.md', '.py', '.js'];

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else if (EXTS.some((e) => entry.name.endsWith(e))) yield fullPath;
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

function analyzeIqraPerformance(): void {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  let report = `# 📊 تقرير أداء IQRA\n\n`;
  report += `_تحليل الأداء — الدورة ${readCycle()}_\n\n`;
  report += `_${new Date().toISOString()}_\n\n`;

  const byExt: Record<string, { count: number; bytes: number }> = {};
  const heavyFiles: Array<{ file: string; kb: number }> = [];
  let totalSize = 0;
  let totalFiles = 0;

  for (const file of walk('.')) {
    const ext = path.extname(file);
    let size: number;
    try {
      size = fs.statSync(file).size;
    } catch {
      continue; // الملف اختفى بين walk و stat (race condition)
    }
    totalSize += size;
    totalFiles++;
    byExt[ext] = byExt[ext] || { count: 0, bytes: 0 };
    byExt[ext].count++;
    byExt[ext].bytes += size;
    if (size > HEAVY_THRESHOLD) {
      heavyFiles.push({ file, kb: +(size / 1024).toFixed(1) });
    }
  }

  report += `## 📈 الإحصائيات العامة\n\n`;
  report += `- **إجمالي الملفات:** ${totalFiles}\n`;
  report += `- **الحجم الكلي:** ${(totalSize / 1024).toFixed(1)}KB\n`;
  report += `- **متوسط الحجم:** ${totalFiles ? (totalSize / totalFiles / 1024).toFixed(2) : 0}KB\n\n`;

  report += `## 🗂️ توزيع حسب النوع\n\n`;
  report += `| النوع | عدد الملفات | الحجم (KB) |\n|------|-------------|------------|\n`;
  for (const [ext, { count, bytes }] of Object.entries(byExt).sort((a, b) => b[1].bytes - a[1].bytes)) {
    report += `| ${ext} | ${count} | ${(bytes / 1024).toFixed(1)} |\n`;
  }
  report += `\n`;

  if (heavyFiles.length > 0) {
    report += `## ⚠️ الملفات الثقيلة (> ${HEAVY_THRESHOLD / 1000}KB)\n\n`;
    heavyFiles.sort((a, b) => b.kb - a.kb);
    for (const { file, kb } of heavyFiles.slice(0, 30)) {
      report += `- \`${file}\` — **${kb}KB**\n`;
    }
    if (heavyFiles.length > 30) {
      report += `\n_... و ${heavyFiles.length - 30} ملف ثقيل آخر_\n`;
    }
  } else {
    report += `## ✅ لا توجد ملفات ثقيلة\n`;
  }

  fs.writeFileSync(OUTPUT, report);
  appendPulse('performance-analyzed', {
    totalFiles,
    totalBytes: totalSize,
    heavyCount: heavyFiles.length,
  });

  console.log(`📊 ${OUTPUT} تم توليده — ${totalFiles} ملف, ${heavyFiles.length} ثقيل`);
}

analyzeIqraPerformance();
