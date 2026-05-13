/**
 * 🌱 Evolution Section Builder — IQRA ExperienceBuffer → AIX evolution
 *
 * IQRA's ExperienceBuffer holds 1000 trust-tagged experiences with
 * Ebbinghaus decay. AIX's `evolution` is a much smaller summary
 * intended for portability:
 *
 *   loops_completed   — integer, total meta-loops finished
 *   last_improved     — ISO timestamp of the latest verified gain
 *   lessons[]         — short, distilled lessons, max 100
 *   trust_delta       — signed score change over the window (-10..10)
 *   version_lineage[] — version IDs traversed by this agent
 *
 * This module compresses the buffer in a deterministic way (no LLM,
 * no randomness) so two exports of the same buffer produce the same
 * bytes after canonicalization.
 */

import type { AIXEvolution } from './types';

/** Minimal shape we need from the IQRA experience buffer. */
export interface IQRAExperienceSnapshot {
  /** Total finished cycles. */
  loops_completed?: number;

  /** Per-experience entries, newest first or oldest first — the mapper
   *  sorts internally by `timestamp` ascending to be order-stable. */
  experiences?: Array<{
    timestamp?: number;
    lesson?: string;
    trust_delta?: number;
    verified?: boolean;
    version?: string;
  }>;

  /** Optional: existing version lineage, used as-is when supplied. */
  version_lineage?: string[];
}

const MAX_LESSONS = 100;

function dedupePreserveOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

function clampDelta(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n > 10) return 10;
  if (n < -10) return -10;
  return Number(n.toFixed(3));
}

export function buildEvolutionSection(snapshot: IQRAExperienceSnapshot): AIXEvolution {
  const experiences = (snapshot.experiences ?? [])
    .slice()
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  // last_improved = newest verified experience's timestamp
  let lastImprovedTs: number | undefined;
  for (let i = experiences.length - 1; i >= 0; i--) {
    if (experiences[i].verified && typeof experiences[i].timestamp === 'number') {
      lastImprovedTs = experiences[i].timestamp as number;
      break;
    }
  }

  // lessons: take verified ones only, dedupe, cap at 100, newest first.
  const lessons = dedupePreserveOrder(
    experiences
      .filter((e) => e.verified && typeof e.lesson === 'string' && e.lesson!.trim().length > 0)
      .slice()
      .reverse()
      .map((e) => e.lesson!.trim()),
  ).slice(0, MAX_LESSONS);

  // trust_delta: sum across the window, clamped per schema (-10..10).
  const trustDelta = clampDelta(
    experiences.reduce((acc, e) => acc + (typeof e.trust_delta === 'number' ? e.trust_delta : 0), 0),
  );

  // version_lineage: prefer explicit input; otherwise harvest distinct
  // versions in chronological order.
  let versionLineage: string[] | undefined = snapshot.version_lineage;
  if (!versionLineage) {
    const versions = experiences
      .map((e) => e.version)
      .filter((v): v is string => typeof v === 'string' && v.length > 0);
    versionLineage = dedupePreserveOrder(versions);
  }

  const out: AIXEvolution = {};
  if (typeof snapshot.loops_completed === 'number') {
    out.loops_completed = Math.max(0, Math.trunc(snapshot.loops_completed));
  }
  if (typeof lastImprovedTs === 'number') {
    out.last_improved = new Date(lastImprovedTs).toISOString();
  }
  if (lessons.length > 0) out.lessons = lessons;
  if (trustDelta !== 0) out.trust_delta = trustDelta;
  if (versionLineage && versionLineage.length > 0) out.version_lineage = versionLineage;
  return out;
}
