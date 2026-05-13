/**
 * IQRA R2 Storage Layer — مخزن إقرأ الرقمي
 * 
 * Uses Cloudflare R2 for zero-cost egress storage.
 * Stores Quranic patterns, Voice notes, and LTM (Long Term Memory).
 */

// Minimal local type for the Cloudflare R2 bucket binding so we don't pull
// the full @cloudflare/workers-types dependency. The full typings live in
// the Workers runtime; we only need the subset we actually call.
export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | null,
    options?: { httpMetadata?: { contentType?: string } } & Record<string, unknown>,
  ): Promise<unknown>;
  get(key: string): Promise<{
    body?: ReadableStream;
    text(): Promise<string>;
    json<T = unknown>(): Promise<T>;
    arrayBuffer(): Promise<ArrayBuffer>;
  } | null>;
  delete(key: string): Promise<void>;
  list(options?: Record<string, unknown>): Promise<{ objects: Array<{ key: string }> }>;
}

export interface R2Env {
  IQRA_BUCKET: R2Bucket;
}

export class IQRAStorage {
  /**
   * Upload discoveries or files to R2
   */
  static async upload(env: R2Env, path: string, data: any, contentType: string = 'application/json') {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    
    await env.IQRA_BUCKET.put(path, body, {
      httpMetadata: { contentType }
    });
    
    console.log(`📦 File uploaded to R2: ${path}`);
  }

  /**
   * Retrieve files from R2
   */
  static async get(env: R2Env, path: string) {
    const object = await env.IQRA_BUCKET.get(path);
    if (!object) return null;
    
    if (path.endsWith('.json')) {
      return await object.json();
    }
    return await object.arrayBuffer();
  }
}
