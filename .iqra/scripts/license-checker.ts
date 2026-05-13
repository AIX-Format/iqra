#!/usr/bin/env npx tsx
/**
 * IQRA License Checker — حارس التراخيص
 *
 * يفحص وجود LICENSE في الجذر ويبلّغ إن كان مفقوداً.
 * لا ينشئ شيئاً تلقائياً — قرار الترخيص سيادي يحتاج وعي إنساني.
 *
 * 🤖 NOTE TO FUTURE AI AGENTS:
 *   - لا تفعّل الإنشاء التلقائي لـ LICENSE. الترخيص قرار قانوني، ليس routine.
 *   - يمكن توسعة الفحص ليشمل headers في الملفات (SPDX-License-Identifier).
 *   - الملاحظات تُكتب في .iqra/performance/license-report.md.
 */

import * as fs from 'fs';
import * as path from 'path';

const PULSES = '.iqra/pulses.jsonl';
const CYCLE_FILE = '.iqra/cycle.txt';
const OUTPUT = '.iqra/performance/license-report.md';
const CYCLE_LENGTH = 30;

const LICENSE_VARIANTS = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'];
const KNOWN_LICENSES = ['MIT', 'Apache', 'GPL', 'BSD', 'ISC', 'MPL', 'Unlicense'];

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

function detectLicenseType(content: string): string {
  const upper = content.toUpperCase();
  for (const license of KNOWN_LICENSES) {
    if (upper.includes(license.toUpperCase())) return license;
  }
  return 'unknown';
}

function checkLicense(): void {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const foundFiles = LICENSE_VARIANTS.filter((f) => fs.existsSync(f));
  let report = `# 📜 تقرير الترخيص\n\n`;
  report += `_الدورة ${readCycle()} — ${new Date().toISOString()}_\n\n`;

  if (foundFiles.length === 0) {
    report += `## ❌ لا يوجد ملف ترخيص\n\n`;
    report += `لم يُعثر على أي من: ${LICENSE_VARIANTS.join(', ')}.\n\n`;
    report += `**التوصية**: أضف ترخيصاً صريحاً (MIT، Apache 2.0، إلخ). بدون ترخيص، حقوق المساهمين غامضة.\n`;
    report += `راجع https://choosealicense.com للاختيار.\n`;

    appendPulse('license-missing', {});
    console.warn(`⚠️ لا يوجد ملف ترخيص — راجع ${OUTPUT}`);
  } else {
    report += `## ✅ ملف ترخيص موجود\n\n`;
    for (const file of foundFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const type = detectLicenseType(content);
      const size = content.length;
      report += `- \`${file}\` — نوع: **${type}** (${size} حرف)\n`;
    }
    report += `\n`;

    // فحص package.json
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        if (pkg.license) {
          report += `## 📦 package.json\n\n`;
          report += `- \`license\`: **${pkg.license}**\n`;
        } else {
          report += `## ⚠️ package.json\n\n`;
          report += `- حقل \`license\` مفقود. أضفه ليطابق LICENSE.\n`;
        }
      } catch {
        // ignore
      }
    }

    appendPulse('license-ok', { files: foundFiles });
    console.log(`📜 ترخيص موجود (${foundFiles.length} ملف)`);
  }

  fs.writeFileSync(OUTPUT, report);
}

checkLicense();
