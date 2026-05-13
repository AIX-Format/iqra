/**
 * 🆔 DID Translator — IQRA ⇄ AIX
 *
 * IQRA historically uses `did:web:axiomid.app:<id>` (W3C standard,
 * resolvable via HTTPS at the well-known endpoint). AIX v0.369.0
 * adds a sovereign method `did:axiom:axiomid.app:<id>` that carries
 * the same root authority but lets AIX-aware resolvers skip the
 * web fetch and hit the Axiom registry directly.
 *
 * This module is a lossless translator between the two forms. The
 * `<id>` portion is preserved byte-for-byte, only the method prefix
 * swaps. Both forms resolve to the same underlying agent. Use this
 * when emitting manifests, never reimplement the regex elsewhere.
 */

import type { AxiomDID, DID } from './types';

export const AXIOM_AUTHORITY = 'axiomid.app';

const AXIOM_PREFIX = `did:axiom:${AXIOM_AUTHORITY}:`;
const WEB_PREFIX = `did:web:${AXIOM_AUTHORITY}:`;

// Permissible id chars (matches AIX schema and W3C generic DID grammar).
const ID_RE = /^[a-zA-Z0-9._\-]+$/;

function assertValidId(id: string): void {
  if (!ID_RE.test(id)) {
    throw new Error(`DID id contains illegal characters: ${id}`);
  }
}

/** Build a sovereign `did:axiom:axiomid.app:<id>` from a raw id. */
export function toAxiomDID(id: string): AxiomDID {
  assertValidId(id);
  return `${AXIOM_PREFIX}${id}` as AxiomDID;
}

/** Build a `did:web:axiomid.app:<id>` (resolvable via .well-known). */
export function toWebDID(id: string): DID {
  assertValidId(id);
  return `${WEB_PREFIX}${id}` as DID;
}

/** Convert between the two forms, preserving the id segment. */
export function translateDID(input: string): { axiom: AxiomDID; web: DID; id: string } {
  let id: string;
  if (input.startsWith(AXIOM_PREFIX)) {
    id = input.slice(AXIOM_PREFIX.length);
  } else if (input.startsWith(WEB_PREFIX)) {
    id = input.slice(WEB_PREFIX.length);
  } else if (input.startsWith('did:web:')) {
    // Tolerate other did:web authorities by rebinding to axiomid.app.
    const tail = input.slice('did:web:'.length);
    const parts = tail.split(':');
    id = parts[parts.length - 1] ?? '';
  } else {
    throw new Error(`Unsupported DID method for axiomid.app translation: ${input}`);
  }
  assertValidId(id);
  return { axiom: toAxiomDID(id), web: toWebDID(id), id };
}

/** Quick predicate: is this string an `axiomid.app`-rooted DID (either form)? */
export function isAxiomRooted(value: string): boolean {
  return value.startsWith(AXIOM_PREFIX) || value.startsWith(WEB_PREFIX);
}

/** Extract the bare id segment without the method prefix. */
export function didId(input: string): string {
  return translateDID(input).id;
}
