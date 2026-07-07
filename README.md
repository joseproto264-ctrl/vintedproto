# AutoVinted AI

A premium, responsive, local-first Next.js + TypeScript + Tailwind CSS listing studio for Vinted sellers.

## Install

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- Responsive desktop sidebar and mobile bottom navigation.
- Camera/photo upload, Vinted-style preview, LocalStorage inventory.
- Create, edit, delete, duplicate, Draft / Ready / Uploaded statuses.
- Rule-based local “AI Revision” for titles, grammar-style description polish, keywords, category, condition wording, and price range.
- Copy Mode fallback: copy title, description, price, all listing JSON, and open Vinted manually.
- Footer on every page: “Prompt by Marc”.

## Vinted integration

The integration is intentionally backend-only under `lib/marketplaces/vinted` and is accessed through:

- `POST /api/vinted/connect`
- `GET /api/vinted/status`
- `POST /api/vinted/test`
- `POST /api/vinted/upload-listing`
- `POST /api/vinted/disconnect`

Credentials are posted only to backend API routes. They are never written to LocalStorage and should never be exposed with `NEXT_PUBLIC_` variables.

## Selected unofficial library

I reviewed unofficial GitHub options and selected `Androz2091/vinted-api` / npm `vinted-api` for this prototype because it is Node.js-compatible, has the strongest star count among focused Node wrappers found, has simple documentation and usage examples, and avoids putting credentials in frontend code. Its limitation is important: it mainly supports public/search-style API access and does not safely document listing creation. Therefore upload is guarded by `VINTED_ENABLE_EXPERIMENTAL_UPLOAD=false` and returns an exact backend error with Copy Mode available.

## Warning

Vinted unofficial APIs can break without notice and may violate platform expectations if used carelessly. Use this app for experimentation only. Prefer official Vinted Pro Integrations if you qualify.

## Replacing the Vinted client

All Vinted-specific logic lives in `lib/marketplaces/vinted/client.ts`. Replace that adapter with another maintained backend-only client while keeping the API route contract stable. Do not move credentials, cookies, API keys, or session tokens into React components or LocalStorage.

## Future architecture

The app is prepared for later additions: real AI API, Supabase database, login system, eBay, Wallapop, and Depop adapters.
