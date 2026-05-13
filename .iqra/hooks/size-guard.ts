#!/usr/bin/env npx tsx
/**
 * IQRA Size Guard — حارس الأحجام
 *
 * يمنع إضافة ملفات أكبر من حدود معقولة (يحمي تاريخ git من التورّم).
 * يدير حدّين:
 *   - تحذير: 1 MB (يبلّغ ولا يمنع)
 *   - منع: 10 MB (يفشل ويوقف commit)
 *
 * Exit code:
 *   0 — لا انتهاكات
 *   1 — ملف ≥ HARD_LIMIT
 *
 * Usage:
 *   npx tsx .iqra/hooks/size-guard.ts [file1 file2 ...]
 *   إذا لم تُمرَّر ملفات، يفحص staged.
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - للملفات الكبيرة الشرعية (datasets, models): استخدم Git LFS أو .iqra/memory/.
 *   - الحدود قابلة للضبط عبر env vars: IQRA_SIZE_SOFT_MB, IQRA_SIZE_HARD_MB.
 *   - .iqra/memory/ مستثنى ضمناً (محلي فقط).
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const CYCLE_LENGTH = 30;

const SOFT_LIMIT_MB = Number.parseFloat(process.env.IQRA_SIZE_SOFT_MB || '1');
const HARD_LIMIT_MB = Number.parseFloat(process.env.IQRA_SIZE_HARD_MB || '10');
const SOFT = SOFT_LIMIT_MB * 1024 * 1024;
const HARD = HARD_LIMIT_MB * 1024 * 1024;

const SKIP_PATTERNS = ['.iqra/memory/', 'node_modules/', '.git/'];

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

function getStagedFiles(): string[] {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=AM', {
      encoding: 'utf-8',
    });
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function getAllRepoFiles(): string[] {
  try {
    const out = execSync('git ls-files -z', { encoding: 'utf-8' });
    return out.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

function shouldSkip(file: string): boolean {
  const norm = file.split(path.sep).join('/');
  return SKIP_PATTERNS.some((p) => norm.includes(p));
}

type Violation = { file: string; sizeMB: number; level: 'soft' | 'hard' };

function main(): void {
  const args = process.argv.slice(2);
  const scanAll = args.includes('--all');
  const argFiles = args.filter((a) => !a.startsWith('--'));
  let files: string[];
  if (argFiles.length > 0) {
    files = argFiles;
  } else if (scanAll) {
    files = getAllRepoFiles();
  } else {
    files = getStagedFiles();
  }

  if (files.length === 0) {
    console.log('💤 لا ملفات للفحص');
    process.exit(0);
  }

  const violations: Violation[] = [];
  let checked = 0;

  for (const file of files) {
    if (shouldSkip(file)) continue;
    if (!fs.existsSync(file)) continue;
    let size: number;
    try {
      size = fs.statSync(file).size;
    } catch {
      continue;
    }
    checked++;
    const sizeMB = +(size / 1024 / 1024).toFixed(2);
    if (size >= HARD) {
      violations.push({ file, sizeMB, level: 'hard' });
    } else if (size >= SOFT) {
      violations.push({ file, sizeMB, level: 'soft' });
    }
  }

  const hardCount = violations.filter((v) => v.level === 'hard').length;
  const softCount = violations.filter((v) => v.level === 'soft').length;

  appendPulse('size-guarded', { checked, soft: softCount, hard: hardCount });

  if (violations.length === 0) {
    console.log(`✅ كل الأحجام ضمن الحدود (${checked} ملف، soft=${SOFT_LIMIT_MB}MB، hard=${HARD_LIMIT_MB}MB)`);
    process.exit(0);
  }

  if (softCount > 0) {
    console.warn(`⚠️ ${softCount} ملف بين ${SOFT_LIMIT_MB}MB و ${HARD_LIMIT_MB}MB:`);
    for (const v of violations.filter((x) => x.level === 'soft')) {
      console.warn(`   ${v.file} — ${v.sizeMB} MB`);
    }
  }

  if (hardCount > 0) {
    console.error(`\n❌ ${hardCount} ملف ≥ ${HARD_LIMIT_MB}MB — مرفوض:`);
    for (const v of violations.filter((x) => x.level === 'hard')) {
      console.error(`   ${v.file} — ${v.sizeMB} MB`);
    }
    console.error(`\n💡 استخدم Git LFS أو ضع الملفات في .iqra/memory/ (محلي فقط).`);
    process.exit(1);
  }

  // soft فقط — تحذير لا يمنع
  process.exit(0);
}

main();
