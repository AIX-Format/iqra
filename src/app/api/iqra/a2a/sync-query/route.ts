import { NextRequest, NextResponse } from 'next/server';
import { appendToTrustChain } from '#security/security';
import { iqraThink, IQRABrainMode } from '#core/brain';

interface SyncQueryBody {
  intent?: string;
  input?: string;
  persona?: string;
  mode?: keyof typeof IQRABrainMode;
}

/**
 * A2A: SYNC_QUERY
 *
 * The blocking peer-to-peer query. Routes the input through
 * `iqraThink` (the FITRAH-filtered brain entry point) and returns a
 * structured response with a TrustChain receipt hash. Use this for
 * short, time-bounded questions; for long reflective tasks, use
 * ASYNC_TADABBUR.
 */
export async function POST(req: NextRequest) {
  let body: SyncQueryBody = {};
  try {
    body = (await req.json()) as SyncQueryBody;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const input = (body.input ?? body.intent ?? '').toString().trim();
  if (!input) {
    return NextResponse.json({ error: 'missing input or intent' }, { status: 400 });
  }

  const mode = (body.mode && IQRABrainMode[body.mode]) || IQRABrainMode.FAST_RESPONSE;

  appendToTrustChain('A2A:SYNC_QUERY:RECV', input.slice(0, 80), 'queued', 1.0);

  let response = '';
  let provider = 'fallback';
  try {
    const result = await iqraThink({ input, mode });
    response = result.response;
    provider = (result as any).provider ?? 'unknown';
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    appendToTrustChain('A2A:SYNC_QUERY:FAIL', input.slice(0, 80), msg.slice(0, 200), 0.0);
    return NextResponse.json({ error: 'sovereign brain unavailable', detail: msg }, { status: 503 });
  }

  appendToTrustChain('A2A:SYNC_QUERY:DONE', input.slice(0, 80), response.slice(0, 200), 1.0);
  return NextResponse.json({
    method: 'SYNC_QUERY',
    response,
    provider,
    timestamp: new Date().toISOString(),
  });
}
