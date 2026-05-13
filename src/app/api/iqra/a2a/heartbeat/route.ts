import { NextRequest, NextResponse } from 'next/server';
import { appendToTrustChain } from '#security/security';
import { HeartbeatSystem } from '#infra/heartbeat';

/**
 * A2A: HEARTBEAT_SYNC
 *
 * Returns a small, immutable snapshot of liveness data so a peer
 * sovereign can decide whether IQRA is alive, degraded, or dead before
 * issuing an expensive SYNC_QUERY.
 *
 * No request body required. Every call appends a TrustChain entry so
 * we always have an audit trail of who probed us.
 */
export async function GET(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? 'unknown';
  appendToTrustChain('A2A:HEARTBEAT_SYNC', ua, 'peer probed liveness', 1.0);
  const pulse = (HeartbeatSystem as any).getPulseCount?.() ?? 0;
  return NextResponse.json({
    method: 'HEARTBEAT_SYNC',
    status: 'ALIVE',
    pulse,
    timestamp: new Date().toISOString(),
  });
}
