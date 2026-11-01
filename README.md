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

The API accepts either these language names or their short language codes and stores the returned menu by language code.

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

**Next.js · TypeScript · React · Supabase · OpenAI API · Papa Parse · SheetJS/XLSX · QR Codes · REST APIs · GitHub Actions**

## Security / Reliability Improvements

- All service credentials are supplied through environment variables; none are committed.
- Translation requests are limited to 50 menu items, 10 supported languages, and bounded text lengths.
- Dish names are validated before external API calls.
- OCR uploads are limited to 5 MB and restricted to JPEG, PNG, or PDF MIME types.
- OCR provider calls use a 30-second timeout.
- Provider response details and internal exception messages are not returned to clients.
- Published menu slugs use 12 random bytes for stronger URL unpredictability.
- GitHub Actions verifies that a fresh dependency install and Next.js production build succeed.

These application-level limits reduce accidental abuse, but a public deployment should still add platform-level authentication and/or rate limiting for cost-generating translation/OCR endpoints.

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

## Build Verification

```bash
npm install
npm run build
```

A GitHub Actions workflow runs the same production build on pushes and pull requests using placeholder configuration values only.

## Improvements Made for the Portfolio Version

The original classroom source had a route mismatch between generated QR URLs and the public menu route, omitted a declared QR dependency, and referenced a translation endpoint that was not present in the visible source tree. This version fixes those issues, keeps configuration outside source code, validates external-service inputs, and includes reproducible build verification.
