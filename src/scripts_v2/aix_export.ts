/**
 * 🧬 aix_export — CLI for IQRA → AIX manifest emission and verification.
 *
 * Usage:
 *   npx tsx src/scripts_v2/aix_export.ts emit [persona]
 *   npx tsx src/scripts_v2/aix_export.ts verify <path-to-manifest.json>
 *   npx tsx src/scripts_v2/aix_export.ts keygen
 *   npx tsx src/scripts_v2/aix_export.ts pi-claim <app_id> [domain]
 *
 * Environment:
 *   IQRA_IDENTITY_PRIVATE_KEY_B64URL   — persisted Ed25519 secret
 *   IQRA_IDENTITY_UUID                 — manifest meta.id (UUID v4)
 *   IQRA_IDENTITY_CREATED              — manifest meta.created (ISO 8601)
 *   PI_APP_ID, PI_ENVIRONMENT          — Pi Network config
 */

import fs from 'fs';
import path from 'path';
import {
  exportManifest,
  signManifest,
  verifyManifest,
  generateKeyPairB64,
  codec,
  bootstrapPiClaim,
  AXIOM_AUTHORITY,
  IQRA_VERSION,
  AIX_FORMAT_VERSION,
} from '#aix/index';
import { SovereignDID } from '#security/did';
import { PERSONA_REGISTRY } from '#utils/personas';

function readPrivateKey(): Uint8Array | null {
  const b64 = process.env.IQRA_IDENTITY_PRIVATE_KEY_B64URL?.trim();
  if (!b64) return null;
  return codec.base64UrlToBytes(b64);
}

async function cmdKeygen(): Promise<number> {
  const kp = generateKeyPairB64();
  console.log(JSON.stringify({
    notice: 'Persist privateKey securely (env var, KMS). Never commit to git.',
    publicKey: kp.publicKey,
    privateKey: kp.privateKey,
    suggested_env: `IQRA_IDENTITY_PRIVATE_KEY_B64URL=${kp.privateKey}`,
  }, null, 2));
  return 0;
}

async function cmdEmit(personaId: string): Promise<number> {
  // Resolve persona by short ('core') or namespaced ('iqra-core') id.
  const candidates = [personaId, personaId.startsWith('iqra-') ? personaId : `iqra-${personaId}`];
  const persona =
    candidates.map((c) => PERSONA_REGISTRY[c]).find((p) => p !== undefined) ??
    PERSONA_REGISTRY['iqra-core'];
  const bareId = persona.id.replace(/^iqra-/, '');

  const persisted = readPrivateKey();
  const bundle = persisted
    ? SovereignDID.fromPrivateKey(bareId, AXIOM_AUTHORITY, persisted)
    : await SovereignDID.generateBundle(bareId, AXIOM_AUTHORITY);

  // Per-persona meta.id: precedence is env override > persona.uuid (stable
  // pre-baked UUID v4). Falling back to a zero-UUID would land the same
  // id on every agent and break manifest identity.
  const metaId = process.env.IQRA_IDENTITY_UUID ?? persona.uuid;

  // Real, capability-grounded tags + skills section per persona.
  const tags = persona.aixTags;
  const securityCapabilities = persona.aixCapabilities.tools.concat(
    persona.aixCapabilities.a2a_methods.map((m) => `a2a:${m}`),
  );

  // Apis block: every endpoint becomes an entry in AIX `apis` section.
  const apis: Record<string, unknown> = {
    endpoints: persona.aixCapabilities.endpoints.map((e) => ({
      method: e.method,
      url: `https://${AXIOM_AUTHORITY}${e.path}`,
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
    owner_id: bareId,
    publicKey: bundle.publicKey,
    meta: {
      version: IQRA_VERSION,
      format_version: AIX_FORMAT_VERSION,
      id: metaId,
      name: persona.name,
      description: persona.description,
      created: process.env.IQRA_IDENTITY_CREATED ?? new Date().toISOString(),
      author: 'Mohamed Abdelaziz — AMRIKYY AI Solutions',
      license: 'MIT',
      // Per-persona discovery page rooted on the sovereign authority.
      homepage: `https://${AXIOM_AUTHORITY}/agents/${bareId}`,
      repository: 'https://github.com/Moeabdelaziz007/iqra',
      framework: 'iqra',
      language: 'ar+en',
      runtime_version: IQRA_VERSION,
      tags,
    },
    persona: {
      role: persona.role,
      style: 'sovereign',
      tone: 'reverent',
      // Real persona instructions — the contractual surface, NOT a
      // recopy of meta.description or the system prompt.
      instructions: persona.aixInstructions,
      constraints: persona.aixCapabilities.compliance.map((c) => `Honor ${c}`),
    },
    verification: { status: 'sovereign', trust_level: 3 },
    security: {
      level: 3,
      capabilities: securityCapabilities,
      compliance: persona.aixCapabilities.compliance,
    },
    pi_network: process.env.PI_APP_ID
      ? {
          app_id: process.env.PI_APP_ID,
          environment: (process.env.PI_ENVIRONMENT === 'production' ? 'production' : 'sandbox'),
          kyc_required: true,
        }
      : undefined,
  });

  // Attach the richer optional sections directly. exportManifest's
  // typed input only covers the required + commonly-built sections;
  // these are passed through to the AIX schema's open sections.
  manifest.apis = apis;
  if (skills.length > 0) manifest.skills = { tools: skills };

  const signed = signManifest(manifest, bundle.privateKey);

  const outDir = path.join(process.cwd(), '.iqra', 'aix');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `manifest-${bareId}.aix.json`);
  fs.writeFileSync(outPath, JSON.stringify(signed, null, 2));
  console.log(`✅ AIX manifest emitted → ${outPath}`);
  console.log(`   identity: ${signed.identity_layer.id}`);
  console.log(`   meta.id:  ${signed.meta.id}`);
  console.log(`   checksum: ${signed.security.checksum}`);
  if (!persisted) {
    console.warn('⚠️  IQRA_IDENTITY_PRIVATE_KEY_B64URL not set — generated ephemeral key.');
    console.warn('    Persist this private key if you want a stable identity:');
    console.warn(`    IQRA_IDENTITY_PRIVATE_KEY_B64URL=${codec.bytesToBase64Url(bundle.privateKey)}`);
  }
  return 0;
}

async function cmdVerify(filePath: string): Promise<number> {
  const raw = fs.readFileSync(filePath, 'utf8');
  const manifest = JSON.parse(raw);
  const result = verifyManifest(manifest);
  if (result.ok) {
    console.log(`✅ ${filePath} — signature valid`);
    return 0;
  }
  console.error(`❌ ${filePath} — ${result.reason}`);
  return 1;
}

async function cmdPiClaim(appId: string, domain: string = AXIOM_AUTHORITY): Promise<number> {
  if (!appId) {
    console.error('Usage: aix_export pi-claim <app_id> [domain]');
    return 2;
  }
  const env = (process.env.PI_ENVIRONMENT === 'production' ? 'production' : 'sandbox') as
    | 'production'
    | 'sandbox';
  const { artifact, privateKey } = bootstrapPiClaim({
    domain,
    owner_id: 'iqra-core',
    app_id: appId,
    environment: env,
    note: 'IQRA Sovereign Pi Network domain claim',
  });

  const outDir = path.join(process.cwd(), '.iqra', 'aix');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'pi-claim.json');
  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));

  console.log(`✅ Pi claim artifact emitted → ${outPath}`);
  console.log(`   host at: ${artifact.well_known_url}`);
  console.log('');
  console.log('Persist this private key in your runtime env (KMS preferred):');
  console.log(`  IQRA_IDENTITY_PRIVATE_KEY_B64URL=${codec.bytesToBase64Url(privateKey)}`);
  return 0;
}

async function main(): Promise<number> {
  const [, , cmd = 'emit', a1, a2] = process.argv;
  switch (cmd) {
    case 'keygen':
      return cmdKeygen();
    case 'emit':
      return cmdEmit(a1 ?? 'iqra-core');
    case 'verify':
      if (!a1) {
        console.error('Usage: aix_export verify <path>');
        return 2;
      }
      return cmdVerify(a1);
    case 'pi-claim':
      return cmdPiClaim(a1 ?? '', a2);
    default:
      console.error(`Unknown command: ${cmd}`);
      console.error('Commands: emit | verify | keygen | pi-claim');
      return 2;
  }
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error('❌ aix_export failed:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
