/**
 * 🌙 IQRA Report Schema — مخطط تقرير العامل
 * النية: ضمان أن كل تقرير صادق وكامل وموثق
 * المرجع: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 *
 * القاعدة: لا Mock ولا Fake. كل شيء حقيقي.
 * القاعدة: إذا FAIL، يجب أن يكون هناك تفسير.
 * القاعدة: كل ادعاء يحتاج مصدر.
 */

import type { WorkerReport } from './contracts';

// ── Validation Result ─────────────────────────────────────────────────────────

export interface ReportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── validateReport ────────────────────────────────────────────────────────────

/**
 * يتحقق من صحة تقرير العامل.
 * يُرجع { valid, errors, warnings } بدلاً من boolean بسيط.
 */
export function validateReport(report: WorkerReport): ReportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── ١. الحقول الأساسية ────────────────────────────────────────────────────
  if (!report.mission_id?.trim()) errors.push('mission_id is required');
  if (!report.worker_id?.trim())  errors.push('worker_id is required');
  if (!report.timestamp)          errors.push('timestamp is required');

  // ── ٢. الحالة النهائية ────────────────────────────────────────────────────
  if (report.status !== 'PASS' && report.status !== 'FAIL') {
    errors.push(`Invalid status: "${report.status}". Must be PASS or FAIL`);
  }

  // ── ٣. قائمة الأوامر (Commands Run) ──────────────────────────────────────
  if (!Array.isArray(report.commands_run)) {
    errors.push('commands_run must be an array');
  } else {
    for (const cmd of report.commands_run) {
      if (!cmd.command?.trim()) {
        errors.push('Each command must have a non-empty command string');
      }
      if (typeof cmd.exit_code !== 'number') {
        errors.push(`Command "${cmd.command}" has invalid exit_code (must be number)`);
      }
    }
  }

  // ── ٤. ما تم تنفيذه وما لم يتم ──────────────────────────────────────────
  if (!Array.isArray(report.implemented)) {
    errors.push('implemented must be an array');
  }
  if (!Array.isArray(report.undone)) {
    errors.push('undone must be an array');
  }

  // ── ٥. إثبات المصادر (Source Attestations) — القاعدة ٣ ──────────────────
  if (!Array.isArray(report.source_attestations)) {
    errors.push('source_attestations must be an array');
  } else if (report.source_attestations.length === 0) {
    // PASS يتطلب مصدراً واحداً على الأقل
    if (report.status === 'PASS') {
      errors.push('PASS report must have at least one source_attestation');
    } else {
      warnings.push('source_attestations is empty — consider documenting sources even on FAIL');
    }
  } else {
    for (const att of report.source_attestations) {
      if (!att.claim?.trim()) {
        errors.push('Each source_attestation must have a non-empty claim');
      }
      if (!['[read]', '[fetched]', '[prior-training]'].includes(att.tag)) {
        errors.push(`Invalid source tag: "${att.tag}". Must be [read], [fetched], or [prior-training]`);
      }
    }
  }

  // ── ٦. No-Mock Verification — القاعدة ٢ ──────────────────────────────────
  if (report.status === 'PASS' && !report.no_mock_verified) {
    errors.push('PASS report must have no_mock_verified = true');
  }

  // ── ٧. إذا FAIL، يجب أن يكون هناك مشاكل موثقة ───────────────────────────
  if (report.status === 'FAIL') {
    if (!Array.isArray(report.issues_discovered) || report.issues_discovered.length === 0) {
      errors.push('FAIL report must have at least one issue_discovered');
    }
    if (report.exit_code === 0) {
      warnings.push('FAIL report has exit_code 0 — consider using non-zero exit code');
    }
  }

  // ── ٨. التحقق من الـ timestamp ────────────────────────────────────────────
  const ageMs = Date.now() - report.timestamp;
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (ageMs > oneDayMs) {
    warnings.push(`Report timestamp is ${Math.round(ageMs / 3600000)}h old — may be stale`);
  }

  // ── ٩. المهارات المستخدمة ─────────────────────────────────────────────────
  if (!Array.isArray(report.skills_used)) {
    errors.push('skills_used must be an array');
  } else if (report.skills_used.length === 0 && report.status === 'PASS') {
    warnings.push('skills_used is empty — consider documenting which skills were applied');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── assertValidReport — throws on invalid ────────────────────────────────────

/**
 * يُطلق خطأ فورياً إذا كان التقرير غير صالح.
 * استخدمه في Reporter قبل حفظ التقرير النهائي.
 */
export function assertValidReport(report: WorkerReport): void {
  const result = validateReport(report);
  if (!result.valid) {
    throw new Error(
      `REPORT_ERR [${report.mission_id}/${report.worker_id}]: ` +
      result.errors.join(' | ')
    );
  }
}
