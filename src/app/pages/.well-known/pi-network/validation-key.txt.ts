import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.PI_VALIDATION_KEY?.trim();
  if (!key) {
    return res.status(503).json({ error: 'PI_VALIDATION_KEY is not configured' });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send(key);
}
