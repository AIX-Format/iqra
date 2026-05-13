/**
 * 🧬 AIX Manifest Types — TypeScript surface for AIX Format v0.369.0
 *
 * Source of truth: https://axiomid.app/schemas/aix.schema.json
 * (mirrored at aix-format/schemas/aix.schema.json in the sibling repo)
 *
 * Naming and shapes track the JSON Schema exactly so a generated
 * manifest can be round-tripped through the AIX validator without any
 * reshaping. Optional fields stay optional. Required fields are
 * strictly required at the TS level.
 *
 * If the AIX spec changes, update this file FIRST, then propagate to
 * exporters and validators. Never let TS and the schema drift apart.
 */

// ── Primitive aliases ─────────────────────────────────────────────────────────

/** Semantic versioning string (e.g. 1.0.0, 0.369.0, 2.0.0-beta.1). */
export type SemVer = string;

/** ISO 8601 date-time string (e.g. 2026-04-29T20:00:00Z). */
export type ISODateTime = string;

/** UUID v4 string. */
export type UUIDv4 = string;

/** AIX-native DID — `did:axiom:axiomid.app:<id>`. */
export type AxiomDID = `did:axiom:axiomid.app:${string}`;

/** Any W3C DID method we currently accept on the identity layer. */
export type DID = AxiomDID | `did:web:${string}` | `did:pi:${string}` | `did:${string}:${string}`;

/** Cryptographic key/signature algorithms supported by AIX v0.369.0. */
export type SigAlgorithm = 'Ed25519' | 'secp256k1';

// ── Crypto material ───────────────────────────────────────────────────────────

export interface PublicKey {
  algorithm: SigAlgorithm;
  /** Base64url-encoded public key bytes (default) or hex when stated. */
  value: string;
  encoding?: 'base64url' | 'hex';
}

export interface Signature {
  algorithm: SigAlgorithm;
  /** Base64url-encoded signature bytes over the canonical payload hash. */
  value: string;
  /** JSON canonicalization scheme used before hashing. Default: JCS (RFC 8785). */
  canonicalization?: 'JCS' | 'RFC8785';
}

// ── meta ──────────────────────────────────────────────────────────────────────

export interface MetaLineageEntry {
  version: SemVer;
  parent_version?: SemVer;
  created: ISODateTime;
  notes?: string;
}

export interface AIXMeta {
  version: SemVer;
  format_version?: '1.0' | '1.2' | '1.3';
  id: UUIDv4;
  name: string;
  description?: string;
  created: ISODateTime;
  updated?: ISODateTime;
  author: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  framework?: string;
  language?: string;
  runtime_version?: string;
  tags?: string[];
  icon?: string;
  lineage?: MetaLineageEntry[];
}

// ── persona ───────────────────────────────────────────────────────────────────

export interface AIXPersona {
  role: string;
  tone?: string;
  style?: string;
  instructions: string;
  constraints?: string[];
  personality_traits?: Record<string, string>;
  example_responses?: Array<Record<string, unknown>>;
}

// ── identity_layer ────────────────────────────────────────────────────────────

export interface AIXIdentityProvider {
  type: 'pi_network' | 'world_id' | 'ens' | 'did_web' | 'axiom_id' | 'custom';
  name: string;
  authority?: string;
  chain_id?: string;
}

export interface AIXIdentityVerification {
  status: 'unverified' | 'basic' | 'verified' | 'institutional' | 'sovereign';
  trust_level?: 0 | 1 | 2 | 3;
  provider_specific_tier?: string;
  proof_url?: string;
}

export interface AIXIdentityLayer {
  id: DID;
  provider: AIXIdentityProvider;
  verification?: AIXIdentityVerification;
  issuedAt: ISODateTime;
  expiresAt?: ISODateTime;
  publicKey?: PublicKey;
}

// ── security ──────────────────────────────────────────────────────────────────

export interface AIXSecurity {
  level: number;
  authentication?: Record<string, unknown>;
  capabilities?: string[];
  checksum?: string;
  compliance?: string[];
  encryption?: Record<string, unknown>;
  guardian_logic?: Record<string, unknown>;
  signature?: Signature;
}

// ── trustchain ────────────────────────────────────────────────────────────────

export interface AIXTrustChainEntry {
  action: string;
  actor_did: DID;
  /** SHA-256 hex (64 chars). */
  payload_hash: string;
  timestamp: ISODateTime;
  prev_hash: string;
  human_approved?: boolean;
}

export interface AIXTrustChain {
  entries: AIXTrustChainEntry[];
}

// ── evolution ─────────────────────────────────────────────────────────────────

export interface AIXEvolution {
  loops_completed?: number;
  last_improved?: ISODateTime;
  lessons?: string[];
  trust_delta?: number;
  version_lineage?: string[];
}

// ── pi_network ────────────────────────────────────────────────────────────────

export interface AIXPiNetwork {
  app_id: string;
  environment: 'sandbox' | 'production';
  sdk_version?: string;
  payment_provider?: string;
  kyc_required?: boolean;
}

// ── abom ──────────────────────────────────────────────────────────────────────

export interface AIXAbomDependency {
  name: string;
  version?: string;
  source?: string;
  license?: string;
}

export interface AIXAbom {
  base_models?: AIXAbomDependency[];
  training_datasets?: AIXAbomDependency[];
  plugins?: AIXAbomDependency[];
  saas_dependencies?: AIXAbomDependency[];
}

// ── meta_arbiter (المعمار المدبر) ────────────────────────────────────────────

export interface AIXMetaArbiterConfig {
  activation_threshold?: number;
  concurrent_systems_limit?: number;
  response_time_target_sec?: number;
  [extra: string]: unknown;
}

// ── apis / mcp / memory / topology / skills / live_voice / economics ──────────
// These sections are not yet authored by IQRA. We declare them as optional
// open records so a future IQRA-side emitter can fill them progressively
// without breaking type-safety here.

export type AIXOpaqueSection = Record<string, unknown>;

// ── Top-level manifest ────────────────────────────────────────────────────────

export interface AIXManifest {
  meta: AIXMeta;
  persona: AIXPersona;
  security: AIXSecurity;
  identity_layer: AIXIdentityLayer;

  trustchain?: AIXTrustChain;
  evolution?: AIXEvolution;
  pi_network?: AIXPiNetwork;
  abom?: AIXAbom;
  meta_arbiter?: AIXMetaArbiterConfig;

  apis?: AIXOpaqueSection;
  mcp?: AIXOpaqueSection;
  memory?: AIXOpaqueSection;
  topology?: AIXOpaqueSection;
  skills?: AIXOpaqueSection;
  live_voice?: AIXOpaqueSection;
  economics?: AIXOpaqueSection;
  requirements?: AIXOpaqueSection;
}

// ── Utility guards ────────────────────────────────────────────────────────────

const AXIOM_DID_RE = /^did:axiom:axiomid\.app:[a-zA-Z0-9._\-]+$/;

export function isAxiomDID(value: unknown): value is AxiomDID {
  return typeof value === 'string' && AXIOM_DID_RE.test(value);
}

const DID_RE = /^did:[a-z0-9]+:[a-zA-Z0-9._%\-]+(:[a-zA-Z0-9._%\-]+)*$/;

export function isDID(value: unknown): value is DID {
  return typeof value === 'string' && DID_RE.test(value);
}
