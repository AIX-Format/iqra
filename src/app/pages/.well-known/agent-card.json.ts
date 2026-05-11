import type { NextApiRequest, NextApiResponse } from 'next';

function resolveBaseUrl(req: NextApiRequest): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const host = req.headers.host || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = resolveBaseUrl(req);
  return res.status(200).json({
    name: 'iqra-sovereign',
    version: '1.0.0',
    protocol: 'axiom-a2a-v1',
    description: 'IQRA Sovereign Agent Card',
    discovery: `${baseUrl}/.well-known/agent-card.json`,
    did: `${baseUrl}/.well-known/did.json`,
    methods: ['SYNC_QUERY', 'ASYNC_TADABBUR', 'HEARTBEAT_SYNC'],
    endpoints: {
      query: `${baseUrl}/api/iqra/query`,
      topology_hidden: `${baseUrl}/api/iqra/topology/hidden`,
    },
    capabilities: {
      memory: true,
      topology_reward: true,
      trustchain_logging: true,
      no_mock_policy: true,
      self_play_trading_data: true,
    },
    timestamp: new Date().toISOString(),
  });
}
