/**
 * 🥧 Pi Network Domain Claim — sovereign verification for axiomid.app
 * 
 * Refactored to use @axiom/pi as the source of truth.
 */

// @ts-ignore - Local relative import for sandbox unification
import { AxiomPi } from '../../../../../aix-format/packages/pi-kyc/src/index';
import type { PiClaimArtifact as AxiomPiClaimArtifact } from '../../../../../aix-format/packages/pi-kyc/src/index';
import { toAxiomDID, AXIOM_AUTHORITY } from './did_translator';
import type { AxiomDID } from './types';
import naclUtil from 'tweetnacl-util';

export interface PiClaimManifest {
  domain: string;
  owner_did: AxiomDID;
  app_id: string;
  environment: 'sandbox' | 'production';
  issued_at: string;
  nonce: string;
  note?: string;
}

export interface PiClaimArtifact extends AxiomPiClaimArtifact {
  well_known_url: string;
}

export interface PiClaimInput {
  domain?: string;
  owner_id: string;
  app_id: string;
  environment: 'sandbox' | 'production';
  privateKey: Uint8Array;
  issued_at?: Date;
  nonce?: string;
  note?: string;
}

/**
 * Build and sign a Pi Network domain-claim artifact for the agent.
 */
export function createPiClaim(input: PiClaimInput): PiClaimArtifact {
  const domain = (input.domain ?? AXIOM_AUTHORITY).trim();
  const owner_did = toAxiomDID(input.owner_id);
  
  const privateKeyB64 = naclUtil.encodeBase64(input.privateKey);
  
  const artifact = AxiomPi.createClaim({
    domain,
    ownerDid: owner_did,
    environment: input.environment,
    nonce: input.nonce,
  }, privateKeyB64);

  return {
    ...artifact,
    well_known_url: `https://${domain}/.well-known/pi-claim.json`,
  };
}

/**
 * Verify an artifact fetched from a well-known URL.
 */
export function verifyPiClaim(artifact: PiClaimArtifact): { ok: true } | { ok: false; reason: string } {
  const isValid = AxiomPi.verifyClaim(artifact);
  
  if (!isValid) {
    return { ok: false, reason: 'BAD_SIGNATURE' };
  }

  const { domain, owner_did } = artifact.manifest;

  // Strict DID format check
  const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const STRICT_AXIOM_DID = new RegExp(`^did:axiom:${escapedDomain}:[a-zA-Z0-9._\\-]+$`);
  
  if (!STRICT_AXIOM_DID.test(owner_did)) {
    return { ok: false, reason: 'DID_DOMAIN_MISMATCH' };
  }

  return { ok: true };
}
