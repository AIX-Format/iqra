/**
 * 📦 ABOM Builder — Agent Bill of Materials
 *
 * Collects what the agent runs on so consumers can audit supply chain:
 *   base_models        — LLMs registered in 07-llm + connector factory
 *   training_datasets  — datasets the agent has been trained/fine-tuned on
 *   plugins            — IQRA skills loaded at runtime
 *   saas_dependencies  — managed cloud services we call (Redis, Qdrant, ...)
 *
 * Inputs are explicit: this module never scans the filesystem or hits
 * the network. The caller provides the snapshot, the mapper just
 * normalizes it into AIX shape. Determinism > convenience.
 */

import type { AIXAbom, AIXAbomDependency } from './types';

export interface AbomInput {
  base_models?: Array<Partial<AIXAbomDependency> & { name: string }>;
  training_datasets?: Array<Partial<AIXAbomDependency> & { name: string }>;
  plugins?: Array<Partial<AIXAbomDependency> & { name: string }>;
  saas_dependencies?: Array<Partial<AIXAbomDependency> & { name: string }>;
}

function normalize(list: Array<Partial<AIXAbomDependency> & { name: string }> | undefined): AIXAbomDependency[] | undefined {
  if (!list || list.length === 0) return undefined;
  const seen = new Set<string>();
  const out: AIXAbomDependency[] = [];
  for (const item of list) {
    if (!item.name) continue;
    const key = `${item.name}@${item.version ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const dep: AIXAbomDependency = { name: item.name };
    if (item.version) dep.version = item.version;
    if (item.source) dep.source = item.source;
    if (item.license) dep.license = item.license;
    out.push(dep);
  }
  // Stable ordering for canonical hash stability.
  out.sort((a, b) => (a.name + '@' + (a.version ?? '')).localeCompare(b.name + '@' + (b.version ?? '')));
  return out;
}

export function buildAbom(input: AbomInput): AIXAbom {
  const out: AIXAbom = {};
  const bm = normalize(input.base_models);
  const td = normalize(input.training_datasets);
  const pl = normalize(input.plugins);
  const sa = normalize(input.saas_dependencies);
  if (bm) out.base_models = bm;
  if (td) out.training_datasets = td;
  if (pl) out.plugins = pl;
  if (sa) out.saas_dependencies = sa;
  return out;
}
