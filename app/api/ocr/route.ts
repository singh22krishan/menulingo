import { NextResponse } from 'next/server';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OCR_API_KEY;
    const apiUrl = process.env.OCR_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'OCR service is not configured' }, { status: 503 });
    }

    const incoming = await req.formData();
    const document = incoming.get('document');
    if (!(document instanceof File)) {
      return NextResponse.json({ error: 'document file is required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(document.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, or PDF files are supported' }, { status: 415 });
    }
    if (document.size < 1 || document.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be between 1 byte and 5 MB' }, { status: 413 });
    }

    const form = new FormData();
    form.set('document', document, document.name.slice(0, 120));
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Token ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error('OCR provider returned status', response.status);
      return NextResponse.json({ error: 'OCR provider request failed' }, { status: 502 });
    }
    const result = await response.json();
    return NextResponse.json({ result });
  } catch (error) {
    console.error('OCR request failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
