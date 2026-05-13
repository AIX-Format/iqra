import { NextRequest, NextResponse } from 'next/server';
import { resolveBaseUrl, resolveDomain } from '../../_utils/http';
import { SovereignDID } from '#security/did';
import {
  exportManifest,
  signManifest,
  AXIOM_AUTHORITY,
  IQRA_VERSION,
  AIX_FORMAT_VERSION,
  codec,
} from '#aix/index';
import { PERSONA_REGISTRY } from '#utils/personas';

/**
 * Sovereign agent discovery endpoint.
 *
 *   GET /.well-known/agent-card.json
 *
 * Default response: lightweight IQRA-shaped agent card (legacy callers).
 *
 *   GET /.well-known/agent-card.json?format=aix
 *
 * Returns a signed AIX Format v0.369.0 manifest. The signing keypair is
 * derived from `IQRA_IDENTITY_PRIVATE_KEY_B64URL` if set, otherwise an
 * ephemeral keypair is generated per-request (useful for staging; not
 * suitable for production where a stable identity is required).
 *
 *   GET /.well-known/agent-card.json?format=aix&persona=researcher
 *
 * Same as above but binds the manifest to the named persona.
 */
export async function GET(req: NextRequest) {
  const baseUrl = resolveBaseUrl(req);
  const domain = resolveDomain(req);
  const format = req.nextUrl.searchParams.get('format')?.toLowerCase();
  const personaId = req.nextUrl.searchParams.get('persona') ?? 'core';

  if (format === 'aix') {
    return aixManifestResponse(domain, personaId);
  }

  // Legacy IQRA-shaped card.
  return NextResponse.json({
    name: 'iqra-sovereign',
    version: '1.0.0',
    protocol: 'axiom-a2a-v1',
    description: 'IQRA Sovereign Agent Card',
    discovery: `${baseUrl}/.well-known/agent-card.json`,
    aix_manifest: `${baseUrl}/.well-known/agent-card.json?format=aix`,
    did: `${baseUrl}/.well-known/did.json`,
    methods: ['SYNC_QUERY', 'ASYNC_TADABBUR', 'HEARTBEAT_SYNC'],
    endpoints: {
      query: `${baseUrl}/api/iqra/query`,
      topology_hidden: `${baseUrl}/api/iqra/topology/hidden`,
      a2a_sync_query: `${baseUrl}/api/iqra/a2a/sync-query`,
      a2a_async_tadabbur: `${baseUrl}/api/iqra/a2a/async-tadabbur`,
      a2a_heartbeat: `${baseUrl}/api/iqra/a2a/heartbeat`,
    },
    capabilities: {
      memory: true,
      topology_reward: true,
      trustchain_logging: true,
      no_mock_policy: true,
      self_play_trading_data: true,
      aix_manifest: true,
    },
    timestamp: new Date().toISOString(),
  });
}

async function aixManifestResponse(domain: string, rawPersonaId: string) {
  // Persona id normalization. The PERSONA_REGISTRY keys are namespaced
  // (`iqra-core`, `iqra-researcher`, ...), but callers commonly pass
  // the short form (`core`, `researcher`). Previously we did
  // `PERSONA_REGISTRY[rawPersonaId]` which silently fell back to core
  // for any short id, yet we still derived `owner_id` from the raw
  // input — producing a manifest that signed core's metadata under
  // `did:axiom:axiomid.app:researcher`. Normalize ONCE and use the
  // resolved persona's actual id everywhere downstream.
  const candidates = [
    rawPersonaId,
    rawPersonaId.startsWith('iqra-') ? rawPersonaId : `iqra-${rawPersonaId}`,
  ];
  const resolved =
    candidates.map((c) => PERSONA_REGISTRY[c]).find((p) => p !== undefined) ??
    PERSONA_REGISTRY['iqra-core'];
  const persona = resolved;
  const ownerId = persona.id.replace(/^iqra-/, '');

  // Derive (or generate) the identity keypair.
  const persistedKey = process.env.IQRA_IDENTITY_PRIVATE_KEY_B64URL?.trim();
  let privateKey: Uint8Array;
  let publicKey: Uint8Array;

  if (persistedKey) {
    privateKey = codec.base64UrlToBytes(persistedKey);
    const bundle = SovereignDID.fromPrivateKey(ownerId, domain, privateKey);
    publicKey = bundle.publicKey;
  } else {
    const bundle = await SovereignDID.generateBundle(ownerId, domain);
    privateKey = bundle.privateKey;
    publicKey = bundle.publicKey;
  }

  // Resolve the per-persona stable UUID. Env override stays the
  // first-class operator hook; persona.uuid is the real fallback. We
  // deliberately do NOT use a zero-UUID — that would let any peer's
  // ingestion code dedupe two distinct agents under the same meta.id.
  const metaId = process.env.IQRA_IDENTITY_UUID ?? persona.uuid;

  const securityCapabilities = persona.aixCapabilities.tools.concat(
    persona.aixCapabilities.a2a_methods.map((m) => `a2a:${m}`),
  );

  const apis: Record<string, unknown> = {
    endpoints: persona.aixCapabilities.endpoints.map((e) => ({
      method: e.method,
      url: `https://${domain}${e.path}`,
      purpose: e.purpose,
    })),
    a2a: {
      protocol: 'axiom-a2a-v1',
      methods: persona.aixCapabilities.a2a_methods,
    },
  };
  if (persona.aixCapabilities.mcp_servers && persona.aixCapabilities.mcp_servers.length > 0) {
    (apis as any).mcp_servers = persona.aixCapabilities.mcp_servers;
  }

  const skills = persona.aixCapabilities.tools.map((tool) => ({
    name: tool,
    layer: 'iqra/12-infrastructure/tools_registry',
  }));

  const manifest = exportManifest({
    owner_id: ownerId,
    publicKey,
    meta: {
      // Pinned source-of-truth constants. `npm_package_version` is not
      // reliably populated on Vercel / Docker / direct invocations.
      version: IQRA_VERSION,
      format_version: AIX_FORMAT_VERSION,
      id: metaId,
      name: persona.name,
      description: persona.description,
      created: process.env.IQRA_IDENTITY_CREATED ?? new Date().toISOString(),
      author: 'Mohamed Abdelaziz — AMRIKYY AI Solutions',
      license: 'MIT',
      // Per-persona agent page on the sovereign authority. The path
      // ($AXIOM/agents/<id>) is the canonical discovery URL for this
      // specific agent, not a generic project homepage.
      homepage: `https://${domain}/agents/${ownerId}`,
      repository: 'https://github.com/Moeabdelaziz007/iqra',
      framework: 'iqra',
      language: 'ar+en',
      runtime_version: IQRA_VERSION,
      // Tight, capability-anchored tags from the persona definition.
      tags: persona.aixTags,
    },
    persona: {
      role: persona.role,
      style: 'sovereign',
      tone: 'reverent',
      // Real contractual instructions per persona — not a recopy of
      // meta.description and not the verbose system prompt.
      instructions: persona.aixInstructions,
      constraints: persona.aixCapabilities.compliance.map((c) => `Honor ${c}`),
    },
    verification: { status: 'sovereign', trust_level: 3 },
    pi_network: process.env.PI_APP_ID
      ? {
          app_id: process.env.PI_APP_ID,
          environment: (process.env.PI_ENVIRONMENT === 'production' ? 'production' : 'sandbox'),
          kyc_required: true,
        }
      : undefined,
    security: {
      level: 3,
      // Capability strings now reflect the actual tools each persona
      // can invoke plus the A2A methods it answers, not a generic
      // four-string placeholder.
      capabilities: securityCapabilities,
      compliance: persona.aixCapabilities.compliance,
    },
  });

  // Attach the richer optional sections directly so peers reading the
  // manifest get concrete endpoint URLs + tool inventory.
  manifest.apis = apis;
  if (skills.length > 0) manifest.skills = { tools: skills };

  const signed = signManifest(manifest, privateKey);
  return NextResponse.json(signed, {
    headers: {
      'Content-Type': 'application/vnd.aix+json; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
