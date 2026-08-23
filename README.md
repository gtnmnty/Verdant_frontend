# Verdant Luxe — Next.js

Converted from the original TanStack Start / Vite project to **Next.js 15 (App Router)**, **Tailwind CSS v4**, and **shadcn/ui**.

## What's included so far

- **Header** — `src/components/layout/header.tsx`
  Sticky/blurred header, desktop nav + icon toolbar, and a fully responsive mobile menu built with the shadcn **Sheet** component (swap-in for the old custom drawer).
- **Footer** — `src/components/layout/footer.tsx`
  Newsletter signup (shadcn `Input` + `Button`), link columns, contact info, socials, back-to-top button.
- **Home page**, split into independent section components under `src/components/home/`:
  - `hero.tsx` — hero with a **circular** portrait (was rectangular) using a royalty-free Unsplash photo of a young woman.
  - `services-section.tsx`
  - `collection-section.tsx`
  - `philosophy-section.tsx`
  - `atmosphere-section.tsx`
  - `promo-banner.tsx`
  - `cta-section.tsx`
  - `reveal.tsx` — shared scroll-reveal animation + section label helpers.

All images use `next/image` (see `next.config.ts` → `images.remotePatterns` for `images.unsplash.com`), and every section uses fluid `clamp()` sizing plus Tailwind breakpoints (`sm`, `md`, `lg`) so it holds up from small phones to large desktops.

## Getting started

This project was generated in a sandbox without network access, so dependencies aren't installed yet. On your machine:

```bash
cd verdant-luxe-next
npm install
npm run dev
```

Then open http://localhost:3000.

## Notes / next steps

- The original project's admin dashboard, auth/session, notifications system, and other routes (appointments, orders, etc.) were **not** ported — this pass covers Header, Footer, and the Home page only, as requested. Let me know which page to convert next.
- The "Verdant Luxe" name is used consistently (the original had a mismatch — footer said "Verdant Luxe" while the home page's `<title>` said "Parfois"). Rename easily by searching for `Verdant Luxe` if you'd rather standardize on the other name.
- If you run `npx shadcn@latest add <component>` later, it will read `components.json` and drop new primitives into `src/components/ui/` automatically.
