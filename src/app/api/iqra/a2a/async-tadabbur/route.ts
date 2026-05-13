import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { appendToTrustChain } from '#security/security';

interface AsyncTadabburBody {
  intent?: string;
  context?: string;
  surah?: number;
  ayah?: string;
  callback_url?: string;
}

/**
 * A2A: ASYNC_TADABBUR
 *
 * The non-blocking reflective method. A peer submits an intent for
 * deep tadabbur (contemplation over the Qur'anic structure of an
 * input). IQRA queues the request, returns a `tadabbur_id` immediately,
 * and resolves the work in background via the closed-loop trainer.
 *
 * This endpoint deliberately does NOT block on the cognitive engine.
 * It records the intent in the TrustChain and persists a request
 * envelope to `.iqra/tadabbur_queue.jsonl`. The background worker
 * (run_evolution / closed_loop) is responsible for picking up the
 * envelope and emitting a result that the peer can poll later via
 * `GET /api/iqra/a2a/async-tadabbur/<tadabbur_id>` (route to be added).
 */
export async function POST(req: NextRequest) {
  let body: AsyncTadabburBody = {};
  try {
    body = (await req.json()) as AsyncTadabburBody;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const intent = (body.intent ?? '').toString().trim();
  if (!intent) {
    return NextResponse.json({ error: 'missing intent' }, { status: 400 });
  }

  const tadabbur_id = crypto.randomUUID();
  const envelope = {
    tadabbur_id,
    intent,
    context: body.context ?? '',
    surah: body.surah ?? null,
    ayah: body.ayah ?? null,
    callback_url: body.callback_url ?? null,
    submitted_at: new Date().toISOString(),
    status: 'queued' as const,
  };

  // Best-effort persistence; failure to persist is itself a TrustChain
  // event but we still return the id so the peer can retry.
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(), '.iqra');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'tadabbur_queue.jsonl'), JSON.stringify(envelope) + '\n');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    appendToTrustChain('A2A:ASYNC_TADABBUR:PERSIST_FAIL', tadabbur_id, msg.slice(0, 200), 0.2);
  }

  appendToTrustChain('A2A:ASYNC_TADABBUR:QUEUED', tadabbur_id, intent.slice(0, 200), 1.0);

  return NextResponse.json({
    method: 'ASYNC_TADABBUR',
    tadabbur_id,
    status: 'queued',
    poll_after_seconds: 7,
    timestamp: new Date().toISOString(),
  }, { status: 202 });
}
