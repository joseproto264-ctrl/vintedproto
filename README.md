# AutoVinted AI

A dark, premium, responsive, local-first Next.js + TypeScript + Tailwind CSS dashboard for Vinted sellers.

## Install

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Main features

- Dark modern dashboard with gradient background, glassmorphism cards, laptop sidebar, and mobile bottom navigation.
- Overview, Create, Inventory, Ratings, Messages, and Connect Vinted pages.
- Camera/photo upload, product cards, Vinted-style listing preview, LocalStorage inventory, and Draft / Ready / Uploaded statuses.
- Rule-based local “AI Revision” for improved titles, professional descriptions, keywords, category suggestions, condition wording, and price range suggestions.
- Copy Mode fallback: copy title, description, price, full listing data, and open Vinted manually.
- Footer on every page: “Prompt by Marc”.

## Real unofficial Vinted connection flow

Vinted does not provide public OAuth for this app. The app therefore uses a backend-only full Cookie-header flow:

1. Click **Continue with Vinted**.
2. The real Vinted page opens at `https://www.vinted.es/member/signup/select_type?ref_url=%2F`.
3. Sign in directly on Vinted using Google, Apple, or email.
4. Open DevTools, go to Network, refresh Vinted, click a `vinted.es/api` request, and copy the full Request Header named `Cookie`.
5. Return to AutoVinted and paste the full Cookie header, not a single token value.
6. The backend sends it exactly as `Cookie: <pasted value>` with browser-like headers (`User-Agent`, `Accept`, `Accept-Language`, `Referer`, and `Origin`).
7. The cookie is never stored in LocalStorage and is never shown or logged back to the browser.
8. Only safe debug information is returned: cookie length, cookie-pair count, endpoint called, and status code.

## Backend routes

- `POST /api/vinted/connect-session`
- `GET /api/vinted/status`
- `POST /api/vinted/test`
- `GET /api/vinted/profile`
- `GET /api/vinted/products`
- `GET /api/vinted/ratings`
- `GET /api/vinted/messages`
- `POST /api/vinted/reply`
- `POST /api/vinted/upload-listing`
- `POST /api/vinted/disconnect`

## Selected unofficial integration approach

After reviewing GitHub options, the prior `Androz2091/vinted-api` package was removed because it is focused on public search, has open authentication/cookie issues, and can cause Node runtime compatibility problems such as `fetch is not a function` in some environments. The best cookie-supporting libraries found were primarily Python wrappers, so this Node app now uses a replaceable backend-only full-Cookie-header adapter built on modern Node/Next server `fetch`.

No fake data is generated. If Vinted blocks a request, changes an endpoint, or a feature is unsupported, the app returns the exact backend error and provides an **Open in Vinted** fallback.

## Supported and guarded features

- Profile: attempts `GET /api/v2/users/current` with the pasted full Cookie header, then falls back to equivalent current-user endpoints used by unofficial clients when the endpoint is missing.
- Products/listings: attempts user item endpoints after the profile user id is known.
- Sold listings: attempted when possible; otherwise the backend returns a clear unsupported/error object.
- Ratings/reviews: attempts user feedback endpoints.
- Conversations/messages: attempted, but may be blocked by Vinted session rules.
- Replying and upload listing: intentionally guarded with explicit unsupported errors unless a safer upload/reply-capable adapter is added.

## Security notes

- Do not put Vinted cookies, passwords, API keys, or session tokens in frontend code; paste the full Cookie header only into the runtime form.
- Do not prefix secrets with `NEXT_PUBLIC_`.
- `.env.example` documents only server-side settings.
- The current prototype stores the full Cookie header in server memory only; use a server-side encrypted secret store before production.

## Replacing the Vinted adapter

All Vinted-specific logic lives in `lib/marketplaces/vinted/client.ts`. Replace that adapter if a maintained upload-capable unofficial client becomes available, while keeping credentials and cookies backend-only and preserving the route contracts above.
