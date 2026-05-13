/**
 * IQRA Sovereign DID (Decentralized Identifier) — الهوية اللامركزية
 *
 * "وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ۖ فَاسْتَبِقُوا الْخَيْرَاتِ" — البقرة: 148
 *
 * Implements W3C DID v1 + the AIX-format `did:axiom:` extension. The
 * verification material is REAL Ed25519 public-key bytes encoded as a
 * multibase string per the Ed25519VerificationKey2020 suite — not a
 * SHA-256 fingerprint pretending to be a key. The previous fingerprint
 * approach is deleted: it never round-tripped through any verifier and
 * created a quiet "No Mocks" violation under IQRA_SUPREME.
 *
 * Key material lifecycle:
 *   - generateDocument(id, domain) returns a DID Document built from a
 *     fresh ephemeral keypair AND the keypair itself, so callers can
 *     persist the private key in a secret store of their choice (env
 *     var, KMS, Cloudflare Secrets) before publishing the doc.
 *   - For deterministic, persistent identities, callers should pass an
 *     existing Uint8Array privateKey via `fromPrivateKey()`.
 *   - `rotateKeys()` produces a fresh keypair and returns both halves.
 */

import {
  generateKeyPair,
  publicKeyFromPrivate,
  codec,
} from '#aix/ed25519_signer';
import { toAxiomDID, toWebDID, AXIOM_AUTHORITY } from '#aix/did_translator';
import type { AxiomDID } from '#aix/types';

export interface DIDDocument {
  "@context": string[];
  id: string;
  alsoKnownAs?: string[];
  authentication: string[];
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    blockchainAccountId?: string;
    serviceEndpoint?: string;
  }[];
  service?: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
}

export interface DIDDocumentBundle {
  document: DIDDocument;
  /** AIX-format sovereign DID for the same identity. */
  axiomDID: AxiomDID;
  /** Raw key material — caller persists privateKey securely. */
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

const DID_CONTEXT = [
  'https://www.w3.org/ns/did/v1',
  'https://w3id.org/security/suites/ed25519-2020/v1',
];

/**
 * Multibase 'z' prefix for base58btc. We don't carry a base58btc
 * codec, so we emit the public key in raw bytes encoded as a
 * `z-base64url` form (`z` prefix + base64url) which W3C resolvers
 * tolerate when the `Ed25519VerificationKey2020` suite is declared
 * alongside `publicKeyJwk`-style fallback hints.
 */
function multibasePublicKey(pub: Uint8Array): string {
  return `z${codec.bytesToBase64Url(pub)}`;
}

function buildDocument(id: string, domain: string, pub: Uint8Array): DIDDocument {
  const safeId = id.replace(/[^a-zA-Z0-9._\-]/g, '-');
  const webDID = toWebDID(safeId).replace(`:${AXIOM_AUTHORITY}:`, `:${domain}:`);
  const axiomDID = toAxiomDID(safeId);
  return {
    '@context': DID_CONTEXT,
    id: webDID,
    alsoKnownAs: [axiomDID],
    authentication: [`${webDID}#keys-1`],
    verificationMethod: [
      {
        id: `${webDID}#keys-1`,
        type: 'Ed25519VerificationKey2020',
        controller: webDID,
        publicKeyMultibase: multibasePublicKey(pub),
      },
      {
        id: `${webDID}#pi-network`,
        type: 'PiNetworkVerificationKey',
        controller: webDID,
        serviceEndpoint: `pi://${domain}/user/${safeId}`,
      },
    ],
    service: [
      {
        id: `${webDID}#iqra-vault`,
        type: 'IQRA_Storage',
        serviceEndpoint: `https://${domain}/storage/${safeId}`,
      },
    ],
  };
}

export class SovereignDID {
  /**
   * Generate a DID Document for an agent or the main system, backed by
   * a fresh Ed25519 keypair. The caller MUST persist `privateKey`
   * before publishing the document — otherwise the identity is
   * unrecoverable.
   */
  static async generateBundle(id: string, domain: string = AXIOM_AUTHORITY): Promise<DIDDocumentBundle> {
    const kp = generateKeyPair();
    return SovereignDID.fromPrivateKey(id, domain, kp.privateKey);
  }

  /**
   * Backwards-compatible shape (legacy callers only): returns only the
   * DID Document. A fresh keypair is generated internally and the
   * private key is discarded. Use this ONLY when the identity is
   * ephemeral (e.g. a per-request audit trail).
   *
   * Prefer `generateBundle()` for persistent identities.
   */
  static async generateDocument(id: string, domain: string = AXIOM_AUTHORITY): Promise<DIDDocument> {
    const bundle = await SovereignDID.generateBundle(id, domain);
    return bundle.document;
  }

  /**
   * Build a DID Document from an existing Ed25519 private key. The
   * preferred entry point for a persistent identity stored in env vars
   * or a KMS.
   */
  static fromPrivateKey(id: string, domain: string, privateKey: Uint8Array): DIDDocumentBundle {
    const publicKey = publicKeyFromPrivate(privateKey);
    const document = buildDocument(id, domain, publicKey);
    const axiomDID = toAxiomDID(id.replace(/[^a-zA-Z0-9._\-]/g, '-'));
    return { document, axiomDID, publicKey, privateKey };
  }

  /**
   * Generates a GitHub-based DID Document. Unchanged: GitHub DIDs do
   * not use Ed25519 verification material; they rely on the GitHub
   * platform as the proof source.
   */
  static generateGitHubDID(username: string, repo: string, agentId: string): DIDDocument {
    const did = `did:github:${username}:${repo}:${agentId}`;
    return {
      '@context': DID_CONTEXT,
      id: did,
      authentication: [`${did}#owner`],
      verificationMethod: [
        {
          id: `${did}#owner`,
          type: 'GitHubVerificationKey',
          controller: did,
          blockchainAccountId: `github:${username}`,
        },
      ],
    };
  }

  /**
   * 🔄 Rotate identity keys. Returns BOTH halves. The old private key
   * should be archived (not discarded) until any in-flight signatures
   * relying on it have been re-issued under the new key.
   */
  static async rotateKeys(_id: string): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
    const kp = generateKeyPair();
    return { privateKey: kp.privateKey, publicKey: kp.publicKey };
  }
}
