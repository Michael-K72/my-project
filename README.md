# Michael Kalachin — Digital Experiences

Flagship interactive site. The website itself is the portfolio: a persistent WebGL particle universe, a 3D name sculpture, cinematic scroll, and working commerce, booking, configurator, portal and lab systems.

## Stack

Next.js 16 · React 19 · TypeScript · Three.js / R3F · GSAP · next-intl (DE/EN/FR/IT/ES) · Zustand · Zod · Playwright

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run test:e2e
```

## Configuration

Identity, navigation, products, booking types and feature flags live in `src/config` and `src/data`. Copy `.env.example` to `.env.local` if you need a public site URL or later payment/email providers.

Checkout, booking and contact use **demo adapters** until production credentials exist. Prices are always revalidated on the server.

## Routes

`/` · `/configurator` · `/store` · `/book` · `/lab` · `/network` · `/portal` · `/contact` · `/legal/*`
