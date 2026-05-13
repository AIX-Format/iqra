#!/usr/bin/env npx tsx
/**
 * IQRA Backup Smart — الذاكرة طويلة الأمد
 *
 * نسخ احتياطي ذكي لروح IQRA: المنفست، قاعدة المعرفة، والتطور.
 * يضغط بصيغة tar.gz بدائية (header + content)، يختم بـ SHA-256،
 * وينظف الذكريات الأقدم من 30 يوم.
 *
 * بدون أي dependencies خارجية — Node stdlib فقط.
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - SOUL_DIRS هي "روح" IQRA — أضف لها عند نضوج طبقات جديدة (مثلاً 14-spiritual).
 *   - صيغة الـ tar مبسطة (header + size + content). لا تستبدلها بـ tar-stream
 *     لأن zero-dependency قرار سيادي.
 *   - .seal ملف SHA-256 — يستخدم للتحقق من سلامة الأرشيف لاحقاً.
 *   - النسخ في .iqra/memory/ مستثناة من git (محلية فقط).
 *   - الضغط والهاش يعملان تدفقياً (streams) لتجنّب OOM مع نمو المستودع.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const IQRA_BACKUP = '.iqra/memory/backups';
const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const MEMORY_RETENTION_DAYS = 30;

const SOUL_DIRS = [
  'src/lib/iqra/00-manifest',
  'src/lib/iqra/09-evolution',
  'src/knowledge_base',
];

function* walkSync(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkSync(fullPath);
    else yield fullPath;
  }
}

function readCycle(): string {
  if (!fs.existsSync(CYCLE_FILE)) return '1';
  return fs.readFileSync(CYCLE_FILE, 'utf-8').trim() || '1';
}

function appendPulse(action: string, meta: Record<string, unknown> = {}): void {
  const pulse = {
    timestamp: new Date().toISOString(),
    action,
    cycle: readCycle(),
    ...meta,
  };
  fs.appendFileSync(PULSES, JSON.stringify(pulse) + '\n');
}

/**
 * مولّد تدفقي ينتج (header + content) لكل ملف داخل soulDir.
 * نقرأ كل ملف عبر createReadStream لتجنّب تحميله بالكامل في الذاكرة.
 */
async function* streamSoulFiles(soulDir: string): AsyncGenerator<Buffer> {
  for (const memory of walkSync(soulDir)) {
    let size: number;
    try {
      size = fs.statSync(memory).size;
    } catch {
      continue; // ملف اختفى بين walk و stat
    }
    const relative = path.relative(soulDir, memory);
    yield Buffer.from(`🧠 ${relative}\0${size}\0`);

    const rs = fs.createReadStream(memory);
    try {
      for await (const chunk of rs) {
        yield chunk as Buffer;
      }
    } finally {
      rs.destroy();
    }
  }
}

/**
 * يضغط ويختم في تمريرة واحدة: input → gzip → [tee → sha256] → file.
 * الهاش يُحسَب تدفقياً على البايتات المضغوطة الخارجة.
 */
async function compressAndSeal(
  source: AsyncIterable<Buffer>,
  outPath: string
): Promise<{ hash: string; bytes: number }> {
  const hasher = crypto.createHash('sha256');
  const gzip = zlib.createGzip();
  const out = fs.createWriteStream(outPath);
  let bytes = 0;

  gzip.on('data', (chunk: Buffer) => {
    hasher.update(chunk);
    bytes += chunk.length;
  });

  await pipeline(Readable.from(source), gzip, out);
  return { hash: hasher.digest('hex'), bytes };
}

async function iqraBackup(): Promise<void> {
  fs.mkdirSync(IQRA_BACKUP, { recursive: true });
  fs.mkdirSync(path.dirname(PULSES), { recursive: true });

  const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const cycle = readCycle();
  const archived: string[] = [];

  for (const soulDir of SOUL_DIRS) {
    if (!fs.existsSync(soulDir)) {
      console.log(`⚠️  تم تخطي: ${soulDir} (غير موجود)`);
      continue;
    }

    // فحص أن المجلد غير فارغ (تجنّب إنشاء أرشيف فارغ)
    let hasFiles = false;
    for (const _ of walkSync(soulDir)) {
      hasFiles = true;
      break;
    }
    if (!hasFiles) continue;

    // .iqra.gz — صيغة داخلية مخصصة (header + size + content مضغوطة بـ gzip).
    // ليست tar حقيقياً، لذا الامتداد يعكس الواقع لا يدّعيه.
    const memoryPath = path.join(
      IQRA_BACKUP,
      `${soulDir.replace(/\//g, '_')}_cycle_${cycle}_${stamp}.iqra.gz`
    );

    try {
      const { hash, bytes } = await compressAndSeal(streamSoulFiles(soulDir), memoryPath);
      fs.writeFileSync(`${memoryPath}.seal`, hash);
      archived.push(memoryPath);
      console.log(`📦 ${path.basename(memoryPath)} — ${(bytes / 1024).toFixed(1)}KB`);
    } catch (err) {
      console.error(`❌ فشل أرشفة ${soulDir}:`, err instanceof Error ? err.message : err);
      // نظافة الأرشيف الفاسد
      try { fs.unlinkSync(memoryPath); } catch { /* ignore */ }
    }
  }

  // تنظيف الذكريات القديمة — يتسامح مع الملفات التي تختفي أثناء التنظيف
  const nowMs = Date.now();
  let cleaned = 0;
  let memoryEntries: string[] = [];
  try {
    memoryEntries = fs.readdirSync(IQRA_BACKUP);
  } catch {
    memoryEntries = [];
  }

  for (const memory of memoryEntries) {
    const memoryPath = path.join(IQRA_BACKUP, memory);
    let stats: fs.Stats;
    try {
      stats = fs.statSync(memoryPath);
    } catch {
      continue; // ملف اختفى بين readdir و stat (race condition)
    }
    if (!stats.isFile()) continue; // تجاهل المجلدات والـ symlinks
    if (nowMs - stats.mtimeMs > MEMORY_RETENTION_DAYS * 86400000) {
      try {
        fs.unlinkSync(memoryPath);
        cleaned++;
      } catch {
        // قد يكون حُذف بالفعل من عملية أخرى
      }
    }
  }

  appendPulse('backup-completed', {
    archives: archived.length,
    cleaned,
  });

  console.log(`✅ النسخ الاحتياطي اكتمل: ${archived.length} أرشيف, ${cleaned} منظف`);
}

iqraBackup().catch((err) => {
  console.error('❌ فشل النسخ الاحتياطي:', err);
  process.exit(1);
});
