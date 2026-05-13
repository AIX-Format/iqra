#!/usr/bin/env npx tsx
/**
 * IQRA Duplicate Cleaner — منقّي التكرار
 *
 * يحسب SHA-256 لكل ملف .md ويبلّغ عن التكرارات.
 * لا يحذف أي ملف — يقترح فقط.
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - الاسم فيه "Cleaner" لكن السلوك "Reporter" — هذا متعمد.
 *     الحذف التلقائي قرار سيادي يحتاج موافقة بشرية.
 *   - إذا أردت توسعة الكاشف لتشمل .ts أو .py، أضف الامتدادات في walkMd().
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { pipeline } from 'stream/promises';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const OUTPUT = '.iqra/performance/duplicates.md';
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', '.iqra']);

function* walkMd(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMd(fullPath);
    else if (entry.name.endsWith('.md')) yield fullPath;
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

/**
 * يحسب SHA-256 تدفقياً بدون تحميل الملف كاملاً في الذاكرة.
 * 🤖 NOTE: هذا حماية من ملفات .md الضخمة (لقطات، logs، إلخ).
 */
async function streamHash(file: string): Promise<string | null> {
  const hasher = crypto.createHash('sha256');
  try {
    const rs = fs.createReadStream(file);
    await pipeline(rs, hasher);
    return hasher.digest('hex');
  } catch {
    return null; // ملف اختفى أو غير قابل للقراءة
  }
}

async function findDuplicates(): Promise<void> {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const hashes: Record<string, string[]> = {};
  let scanned = 0;

  for (const file of walkMd('.')) {
    const hash = await streamHash(file);
    if (!hash) continue;
    hashes[hash] = hashes[hash] || [];
    hashes[hash].push(file);
    scanned++;
  }

  const dupes = Object.entries(hashes).filter(([, files]) => files.length > 1);

  let report = `# 🔍 تقرير التكرارات\n\n`;
  report += `_تحليل ${scanned} ملف .md — الدورة ${readCycle()}_\n\n`;
  report += `_${new Date().toISOString()}_\n\n`;

  if (dupes.length === 0) {
    report += `## ✅ لا توجد تكرارات\n\nجميع ملفات .md فريدة المحتوى.\n`;
  } else {
    report += `## ⚠️ تم اكتشاف ${dupes.length} مجموعة تكرار\n\n`;
    report += `> هذه اقتراحات للمراجعة — **لم يُحذف أي ملف تلقائياً**.\n\n`;
    for (const [hash, files] of dupes) {
      report += `### مجموعة \`${hash.slice(0, 12)}\` (${files.length} ملفات)\n\n`;
      for (const file of files) {
        report += `- \`${file}\`\n`;
      }
      report += `\n`;
    }
  }

  fs.writeFileSync(OUTPUT, report);
  appendPulse('duplicates-scanned', { scanned, groups: dupes.length });
  console.log(`🔍 ${OUTPUT} — ${dupes.length} مجموعة تكرار من ${scanned} ملف`);
}

findDuplicates().catch((err) => {
  console.error('❌ فشل كشف التكرارات:', err);
  process.exit(1);
});
