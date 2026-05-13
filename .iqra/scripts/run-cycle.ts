#!/usr/bin/env npx tsx
/**
 * IQRA Growth Engine — Cycle Runner (المنسق)
 *
 * يقرأ .iqra/cycle.txt، يحدد سكريبتات الدورة الحالية، ينفذها بالتسلسل،
 * ثم يحرّك الدورة (1 → 30 → 1).
 *
 * الأسبوع الأول (دورات 1-6): الأساسيات.
 * الأسابيع التالية ستضيف سكريبتاتها هنا حين تجهز.
 *
 * ─────────────────────────────────────────────────────────────────────
 * 🤖 NOTE TO FUTURE AI AGENTS (للوكلاء القادمين):
 *
 * هذا المنسق هو "قلب" المحرك. عند إضافة أسابيع جديدة:
 *   1. أضف السكريبت الجديد تحت .iqra/{hooks|intelligence|social|economics|innovation}/
 *   2. سجّله في CYCLE_MAP أدناه برقم الدورة المناسب (7-30).
 *   3. استخدم نفس بنية النبض (appendPulse) للحفاظ على وحدة السجل.
 *   4. لا تكسر contract الـ exit code: فشل سكريبت ≠ فشل الدورة (نسجل ونمضي).
 *   5. كل سكريبت يجب أن يكون zero-dependency (Node stdlib فقط) — هذا قرار سيادي.
 *
 * إذا أضفت فئة جديدة (مثلاً "spiritual" أو "philosophical")، حدّث:
 *   - .iqra/README.md (جدول الفئات)
 *   - .github/workflows/iqra-growth-engine.yml (إذا احتجت permissions جديدة)
 *
 * احترم "Ratchet Effect" في .husky/pre-commit: لا تُدخل أخطاء TS جديدة.
 * سكريبتات .iqra/ خارج tsconfig.include، فهي آمنة عملياً، لكن أبقها نظيفة.
 * ─────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const CYCLE_LENGTH = 30;

type Script = { name: string; path: string };

// الخريطة الدورية — كل دورة تطلق سكريبت أو أكثر.
// الدورات غير المُعرّفة تُعتبر "صمت" (no-op) حتى تكتمل الأسابيع التالية.
const CYCLE_MAP: Record<number, Script[]> = {
  1: [{ name: 'backup-smart', path: '.iqra/scripts/backup-smart.ts' }],
  2: [{ name: 'auto-indexer', path: '.iqra/scripts/auto-indexer.ts' }],
  3: [{ name: 'performance-analyzer', path: '.iqra/scripts/performance-analyzer.ts' }],
  4: [{ name: 'duplicate-cleaner', path: '.iqra/scripts/duplicate-cleaner.ts' }],
  5: [{ name: 'stats-generator', path: '.iqra/scripts/stats-generator.ts' }],
  6: [{ name: 'change-monitor', path: '.iqra/scripts/change-monitor.ts' }],
  // دورات 7-30 ستُعبّأ في الأسابيع التالية.
};

function readCycle(): number {
  if (!fs.existsSync(CYCLE_FILE)) return 1;
  const n = parseInt(fs.readFileSync(CYCLE_FILE, 'utf-8').trim(), 10);
  return Number.isFinite(n) && n >= 1 && n <= CYCLE_LENGTH ? n : 1;
}

function writeCycle(n: number): void {
  fs.mkdirSync(path.dirname(CYCLE_FILE), { recursive: true });
  fs.writeFileSync(CYCLE_FILE, `${n}\n`);
}

// 🤖 NOTE: cycleOverride ضروري عند تسجيل cycle-completed بعد writeCycle(next)،
// وإلا تسرّب الرقم الجديد إلى نبضة الدورة المنتهية.
function appendPulse(
  action: string,
  meta: Record<string, unknown> = {},
  cycleOverride?: number
): void {
  fs.mkdirSync(path.dirname(PULSES), { recursive: true });
  const pulse = {
    timestamp: new Date().toISOString(),
    action,
    cycle: cycleOverride ?? readCycle(),
    ...meta,
  };
  fs.appendFileSync(PULSES, JSON.stringify(pulse) + '\n');
}

function runScript(script: Script): boolean {
  console.log(`\n▶️  ${script.name} (${script.path})`);
  try {
    execSync(`npx tsx ${script.path}`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`❌ ${script.name} فشل:`, err instanceof Error ? err.message : err);
    return false;
  }
}

function main(): void {
  const cycle = readCycle();
  const scripts = CYCLE_MAP[cycle] || [];

  console.log(`\n🧠 IQRA Growth Engine — Cycle ${cycle} / ${CYCLE_LENGTH}`);
  console.log(`📋 سكريبتات مجدولة: ${scripts.length}`);

  appendPulse('cycle-started', { scriptCount: scripts.length }, cycle);

  const results: Array<{ name: string; ok: boolean }> = [];
  for (const script of scripts) {
    const ok = runScript(script);
    results.push({ name: script.name, ok });
  }

  const next = (cycle % CYCLE_LENGTH) + 1;
  writeCycle(next);

  // مرّر cycle الأصلي صراحةً — readCycle() الآن يعيد next.
  appendPulse(
    'cycle-completed',
    {
      completedCycle: cycle,
      nextCycle: next,
      results,
    },
    cycle
  );

  console.log(`\n✅ الدورة ${cycle} اكتملت. التالية: ${next}`);
  const failed = results.filter((r) => !r.ok).length;
  if (failed > 0) {
    console.warn(`⚠️  ${failed} سكريبت فشل في هذه الدورة`);
    process.exit(0); // لا نكسر الـ workflow — نسجل النبضة فقط
  }
}

main();
