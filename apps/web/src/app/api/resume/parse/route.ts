// import { NextRequest, NextResponse } from 'next/server';

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// export async function POST(req: NextRequest) {
//   try {
//     const form = await req.formData();
//     const file = form.get('file');
//     if (!file || !(file instanceof File)) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }
//     const backendUrl = `${API_BASE.replace(/\/$/,'')}/resume/parse`;
//     const fd = new FormData();
//     fd.append('file', file, file.name);
//     const res = await fetch(backendUrl, { method: 'POST', body: fd });
//     const json = await res.json();
//     return NextResponse.json(json, { status: res.status });
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : String(e);
//     return NextResponse.json({ error: 'Proxy failed', detail: msg }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function respond(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch (e: unknown) {
      const detail = e instanceof Error ? e.message : String(e);
      return respond(400, {
        ok: false,
        error: 'Invalid multipart form data',
        detail,
      });
    }

    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return respond(400, {
        ok: false,
        error: 'No file provided (expected field "file")',
      });
    }

    const backendUrl = `${API_BASE.replace(/\/$/, '')}/resume/parse`;
    const fd = new FormData();
    fd.append('file', file, file.name);

    const auth = req.headers.get('authorization') || '';

    const fetchOpts: RequestInit = {
      method: 'POST',
      body: fd,
      headers: auth ? { Authorization: auth } : undefined,
    };

    const started = Date.now();
    const res = await fetch(backendUrl, fetchOpts).catch((err: unknown) => {
      const msg =
        err instanceof Error ? err.message : `Unknown error: ${String(err)}`;
      throw new Error(`Upstream fetch failed: ${msg}`);
    });

    const raw = await res.text();
    const parsed = raw ? safeJsonParse(raw) : null;

    console.log('[proxy /resume/parse]', {
      backendUrl,
      status: res.status,
      tookMs: Date.now() - started,
      hasJson: parsed !== null,
      rawPreview: raw.slice(0, 200),
    });

    if (!res.ok) {
      return respond(res.status, {
        ok: false,
        error: 'Upstream error',
        status: res.status,
        upstream: parsed ?? raw,
      });
    }

    return respond(
      res.status,
      (parsed as Record<string, unknown>) ?? { ok: true },
    );
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[proxy /resume/parse] fatal', err);
    return respond(500, {
      ok: false,
      error: 'Proxy failed',
      detail: err.message,
    });
  }
}
