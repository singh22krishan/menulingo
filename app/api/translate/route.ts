import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { serverSupabase } from '@/lib/supabase';
import crypto from 'node:crypto';

const LANGUAGE_CODES: Record<string, string> = {
  english: 'en', en: 'en',
  french: 'fr', fr: 'fr',
  spanish: 'es', es: 'es',
  chinese: 'zh', zh: 'zh',
  punjabi: 'pa', pa: 'pa',
  arabic: 'ar', ar: 'ar',
  tagalog: 'tl', tl: 'tl',
  italian: 'it', it: 'it',
  german: 'de', de: 'de',
  urdu: 'ur', ur: 'ur',
};
const MAX_ITEMS = 50;
const MAX_LANGUAGES = 10;
const MAX_TEXT = 500;

function cleanText(value: unknown, max = MAX_TEXT) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Translation service is not configured' }, { status: 503 });
    }

    const body = await req.json();
    const items = body?.items;
    const languages = body?.languages;
    if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS) {
      return NextResponse.json({ error: `items must contain between 1 and ${MAX_ITEMS} entries` }, { status: 400 });
    }
    if (!Array.isArray(languages) || languages.length < 1 || languages.length > MAX_LANGUAGES) {
      return NextResponse.json({ error: `languages must contain between 1 and ${MAX_LANGUAGES} values` }, { status: 400 });
    }

    const languageCodes = [...new Set(languages.map((value) => LANGUAGE_CODES[cleanText(value, 20).toLowerCase()]))];
    if (languageCodes.some((code) => !code)) {
      return NextResponse.json({ error: 'One or more requested languages are unsupported' }, { status: 400 });
    }

    const safeItems = items.map((item) => ({
      dish: cleanText(item?.dish),
      desc: cleanText(item?.desc),
      price: cleanText(item?.price, 40),
    }));
    if (safeItems.some((item) => !item.dish)) {
      return NextResponse.json({ error: 'Each item requires a dish name' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: 'Translate restaurant menu dish and description text. Preserve prices exactly. Return valid JSON only.' },
        { role: 'user', content: `Languages: ${languageCodes.join(', ')}. Return an object keyed by language code; each value must preserve input order with dish, desc, and price. Input: ${JSON.stringify(safeItems)}` },
      ],
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error('empty provider response');
    const jsonMenu = JSON.parse(text);
    const returnedCodes = Object.keys(jsonMenu).filter((code) => languageCodes.includes(code));
    if (!returnedCodes.length) throw new Error('invalid provider response');

    const slug = crypto.randomBytes(12).toString('hex');
    const { error } = await serverSupabase().from('menus').insert({
      slug,
      json_menu: jsonMenu,
      languages: returnedCodes,
    });
    if (error) throw new Error('storage failed');

    return NextResponse.json({ slug, languages: returnedCodes });
  } catch (error) {
    console.error('Translation request failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Translation request failed' }, { status: 500 });
  }
}
