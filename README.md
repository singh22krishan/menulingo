# MenuLingo

**MenuLingo** is a multilingual digital-menu platform that turns restaurant menu files into editable, translated, QR-accessible web menus.

## Portfolio Context

This repository is a standalone portfolio version maintained by **Krishan Singh**. The project was developed in an academic setting and shared for course work. This version replaces the generic starter-template documentation, removes incomplete wiring, and presents the application as a maintainable portfolio project.

## What It Does

1. Import a menu from CSV, TSV, TXT, or Excel.
2. Normalize menu rows into dish, description, and price fields.
3. Review/edit the data before publishing.
4. Translate dishes and descriptions into multiple languages using OpenAI.
5. Store the generated multilingual menu in Supabase.
6. Generate a QR code that opens the public menu URL.
7. Let customers switch languages directly on the menu page.
8. Optionally send uploaded menu documents to a configurable OCR service.

## Supported Translation Targets

English · French · Spanish · Chinese · Punjabi · Arabic · Tagalog · Italian · German · Urdu

## Architecture

```text
Next.js App Router
  |
  |-- /builder                 file import + editable preview + QR
  |-- /menu/[slug]             public multilingual menu
  |-- /api/translate           OpenAI translation + Supabase persistence
  |-- /api/ocr                 document OCR integration
  |
  +-- Supabase                 menu storage / application data
  +-- OpenAI                   structured menu translation
  +-- configurable OCR API     document extraction
```

## Tech Stack

**Next.js · TypeScript · React · Supabase · OpenAI API · Papa Parse · SheetJS/XLSX · QR Codes · REST APIs**

## Security

All external credentials are supplied through environment variables. No Supabase service keys, OpenAI keys, or OCR keys are committed.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` and go to `/builder`.

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OCR_API_KEY` (optional)
- `OCR_API_URL` (optional)

## Supabase Table

Create a `menus` table with at least:

- `slug` — text, unique
- `json_menu` — json/jsonb
- `languages` — text[]
- `created_at` — timestamp

## Improvements Made for the Portfolio Version

The original classroom source had a route mismatch between generated QR URLs and the public menu route, omitted a declared QR dependency, and referenced a translation endpoint that was not present in the visible source tree. This version fixes those issues and keeps configuration outside source code.
