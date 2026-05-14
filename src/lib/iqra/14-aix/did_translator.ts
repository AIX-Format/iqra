/**
 * 🆔 DID Translator — IQRA ⇄ AIX
 *
 * IQRA is migrating to the sovereign method `did:axiom:axiomid.app:<id>`.
 * This is the single source of truth for identity in the Echo369 stack.
 *
 * This module ensures every agent identifier follows the sovereign format.
 */

import type { AxiomDID } from './types';

export const AXIOM_AUTHORITY = 'axiomid.app';

const AXIOM_PREFIX = `did:axiom:${AXIOM_AUTHORITY}:`;

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

/** 
 * DEPRECATED: Standardizing on did:axiom. 
 * This now returns the axiom format to ensure stack-wide compatibility.
 */
export function toWebDID(id: string): AxiomDID {
  return toAxiomDID(id);
}

/** Convert input to the sovereign form, preserving the id segment. */
export function translateDID(input: string): { axiom: AxiomDID; id: string } {
  let id: string;
  if (input.startsWith(AXIOM_PREFIX)) {
    id = input.slice(AXIOM_PREFIX.length);
  } else if (input.includes(':')) {
    // Extract the last part of any DID as the ID segment and rebind to axiom.
    const parts = input.split(':');
    id = parts[parts.length - 1] ?? '';
  } else {
    id = input; // Treat bare input as the ID.
  }
  assertValidId(id);
  return { axiom: toAxiomDID(id), id };
}

/** Quick predicate: is this string an `axiomid.app`-rooted DID? */
export function isAxiomRooted(value: string): boolean {
  return value.startsWith(AXIOM_PREFIX);
}

/** Extract the bare id segment without the method prefix. */
export function didId(input: string): string {
  return translateDID(input).id;
}

