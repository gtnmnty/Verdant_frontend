# Frontend Audit

Audit date: 2026-09-10

This report covers the current `frontend` codebase after the frontend-to-backend connection work. No application code was changed during the audit.

## Verification results

| Check | Result | Detail |
|---|---|---|
| TypeScript | Failed | `tsc --noEmit` reports **67 errors across 19 files**. |
| Source ESLint | Warnings | 9 warnings: five raw `<img>` usages, one unused import, two Hook dependency warnings, and one unused callback parameter. |
| `npm run lint` | Failed | ESLint scans generated `.next` output and reports generated-code errors. |
| `npm run build` | Failed | `next/font/google` cannot download Bodoni Moda, Geist, Geist Mono, and Hanken Grotesk during build. Type errors will also block a successful build after that is resolved. |

## Critical and high-priority issues

### 1. The frontend does not type-check

The following 67 errors must be resolved before this frontend can be safely built or deployed.

| Area | Error count | Root cause | Permanent fix |
|---|---:|---|---|
| `app/(site)/account/_components/ProfileSection.tsx` | 3 | Imports a nonexistent `SEED` export, uses `useEffect` without importing it, and has an implicit `any` callback parameter. | Replace seeded appointment data with the `myAppointments` API query, import `useEffect`, and type callback parameters. |
| `app/(site)/orders/[id]/page.tsx` | 11 | The server page uses the old `Order` UI type while reading backend fields such as `user`, `address`, and `subtotal`. | Replace the duplicate server implementation with `OrderDetailContent`, or use a dedicated backend `Order` DTO and forward authenticated cookies safely on the server. |
| `app/admin/_components/AdminSidebar.tsx` | 1 | Imports missing `components/ui/tooltip`. | Add and commit the tooltip primitive. |
| `app/admin/_components/DataTable.tsx` | 1 | Imports missing `components/ui/dropdown-menu`. | Add and commit the dropdown-menu primitive. |
| Admin product, service, and settings components | 9 | Import missing `components/ui/switch`. | Add and commit the switch primitive. |
| `app/admin/layout.tsx` | 1 | Imports `AdminProvider`, but `lib/admin/store.ts` does not export it. | Implement a context-backed `AdminProvider` and make `useAdmin` consume it, or remove this provider and migrate the remaining consumers to API state. |
| `app/admin/branches/[id]/_components/BranchDetailContent.tsx` | 3 | Loose branch values are typed as `unknown`. | Define an explicit branch view model matching `AdminBranchDto`; map API values once at the boundary. |
| Admin CMS pages: `PagesContent`, `PageFormDialog`, `PageDetailContent` | 23 | `PageRecord` fields resolve to `unknown`, making rendering and form bindings invalid. | Define a concrete `PageRecord` type, then replace local mock-state CRUD with an API-backed CMS model. |
| `app/admin/reviews/_components/ReviewFormDialog.tsx` | 7 | Review fields resolve to `unknown`. | Use a specific review draft/form type rather than generic indexed records. |
| Product, service, and settings forms | 8 | Callback arguments infer as `any`. | Type all input/switch/chip callbacks and reuse shared form types. |

### 2. Admin routes cannot reliably render or persist data

`lib/admin/store.ts` only creates local `useState` values per hook call. It has no `AdminProvider`, and each component using `useAdmin()` receives independent state. Branches and CMS Pages therefore do not share state reliably and do not persist to the backend.

**Permanent fix:** replace the temporary store with an API/data-query layer. Use the existing GraphQL backend for branches, and introduce CMS endpoints/schema before exposing Pages editing. Keep a provider only for cache/state coordination, not as the data source.

### 3. Order detail is duplicated and the active route is the wrong implementation

`app/(site)/orders/[id]/page.tsx` fetches GraphQL during server rendering. The API client relies on browser-held access-token state and cannot forward the authenticated client session to that server fetch. A separate `OrderDetailContent` client component already exists with a backend-shaped DTO, but the route does not use it.

**Permanent fix:** have the route pass `id` into `OrderDetailContent`, then remove the duplicated page fetch/render code. If server rendering is required, implement a server-only client that forwards request cookies and validates access server-side.

### 4. Order-history data types do not match the backend

The backend can return `PLACED`, but the frontend `OrderStatus` and `STATUS_LABELS` omit it. `OrderCard` indexes `STATUS_LABELS[o.orderStatus]`, so a newly placed order can crash the UI. The frontend also declares nullable backend images as non-null and falls back to an order-item ID when product data is absent during “Buy Again.”

**Permanent fix:** generate or centrally maintain types from the GraphQL schema; include every backend enum value; normalize nullable fields before rendering; and disable “Buy Again” when the product has been deleted instead of using an order-item ID as a product ID.

### 5. Checkout does not process payments

The checkout page collects card number, expiry, and CVC in React state, discards them, and places an order using only a masked card string. Stripe configuration and a publishable key exist, but Stripe is not used by the frontend. Totals, taxes, delivery fees, and `WELCOME10` are calculated only in the browser.

**Permanent fix:**

1. Use Stripe Elements/Payment Element so raw card data never enters React state or this application.
2. Design an order/payment flow with the backend: create a pending order or checkout session, create a PaymentIntent, confirm it in Stripe, and let the Stripe webhook establish payment status.
3. Make the backend the sole authority for price, tax, delivery fee, stock, promotion validation, and final total.
4. Replace frontend-only promo codes with a backend promotion/quote model, or remove them from the UI.

### 6. Authentication refresh behavior can redirect public visitors

`AuthProvider` restores the session by calling `/auth/refresh` through `apiRequest`. On a 401, that wrapper tries to refresh again and redirects with `window.location.href = "/auth"`. A public page can therefore redirect when a refresh token is expired or invalid. The global callback configuration also means concurrent requests can issue multiple refresh calls.

**Permanent fix:** separate unauthenticated/auth calls from protected requests. Add an `autoRefresh: false` mode for login, refresh, signup, verification, and password reset requests. Put redirects in explicit protected-route logic, not in the generic API transport. Add a single-flight refresh promise so simultaneous 401s share one refresh operation.

### 7. Apple social login is not configured on the backend

The frontend links to `/oauth2/authorization/apple`, but backend configuration only defines Google OAuth credentials. Apple sign-in will fail.

**Permanent fix:** either remove/disable the Apple button until launch, or configure Apple OAuth registration, callback/success handling, account linking, and a frontend callback route.

### 8. Client-side admin roles are not authorization

The admin role is selected from localStorage and defaults to `manager`. This only controls what the UI displays; it is not an identity or permission system.

**Permanent fix:** derive permissions from the authenticated backend user/claims, show those permissions read-only in the frontend, and retain backend authorization as the enforcement layer. Never trust a localStorage role for authorization decisions.

### 9. Service booking loses the chosen branch and has no availability checks

The service-detail booking form displays static branch names but does not submit `branchId`. Time slots are static, availability is not checked, and users can select past dates.

**Permanent fix:** provide public branch and availability endpoints; submit backend branch IDs; prevent past dates client-side; and make the backend reserve the appointment slot atomically.

## Build, lint, and quality issues

### ESLint scans generated build output

The flat ESLint config does not ignore `.next`, so `npm run lint` inspects generated bundles and fails.

**Permanent fix:** add flat-config global ignores for `.next/**` and `node_modules/**`. Then fix the 9 source warnings:

- Replace five marketing-page `<img>` tags with `next/image` or documented exceptions.
- Remove the unused `toast` import in `SocialButtons`.
- Fix the missing `useMemo` dependency in `TopicSearch`.
- Fix the missing `useEffect` dependency and unused `row` argument in admin appointments.

### Fonts make production builds network-dependent

`app/layout.tsx` uses `next/font/google`, which requires Google Fonts during the build. The audit environment could not reach Google; the file also creates Geist twice.

**Permanent fix:** self-host the font files with `next/font/local` for deterministic builds, or guarantee build-network access. Keep one Geist declaration and remove the duplicate initialization.

### Environment/configuration drift

`.env` declares `NEXT_PUBLIC_GRAPHQL_URL` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, but GraphQL requests are formed from `NEXT_PUBLIC_API_URL + "/graphql"`, and Stripe is unused.

**Permanent fix:** either use dedicated configuration variables consistently or remove unused variables. Validate required public URLs during startup/build and document the deployment URL/CORS/cookie configuration.

### Cross-site session caveat

The backend refresh cookie uses `SameSite=Lax`. This works for localhost ports, but browser fetches will not include the cookie if the frontend and API are deployed on unrelated sites.

**Permanent fix:** serve the API from the same site/reverse proxy where possible. If cross-site cookies are required, use HTTPS with `SameSite=None; Secure`, explicit CORS origins, and a reviewed CSRF strategy.

## Static or demo-only features

The following are currently non-persistent, placeholder, or backend-incomplete. They should be labelled clearly in non-production environments or hidden until supported.

### Account

- **Gift cards:** balances, redemption, purchase, and transaction history use local state seeded from `account/_components/data.ts`; no persistence, redemption validation, email delivery, or payment exists.
- **Support tickets and account FAQs:** seeded content only; creating support activity does not create a backend ticket.
- **Change password page:** `/change-password` simulates sending and verifying a code, then simulates success. It does not call the real `PUT /v1/users/change-password` endpoint.
- **Profile next appointment:** currently references a missing seeded appointment export rather than loading the customer’s real appointment data.

### Booking and services

- **`/book` concierge reservation:** validates locally and succeeds after `setTimeout`; it does not create an appointment.
- **Service booking branches and time slots:** static values; branch selection is not submitted and slots are not availability-aware.
- **Service FAQs, inclusions/details, and several tab values:** static because the backend has no model for this editorial content.

### Commerce

- **Payment processing:** simulated as described above; no Stripe Elements/payment confirmation flow exists.
- **Promo code `WELCOME10`:** frontend-only demo value.
- **Cart recommendations:** local sample product data.
- **Customer invoice download:** generated as a text file in the browser, not retrieved from a backend invoice service.
- **Product/service galleries, ingredients, policies, and fallback imagery:** partly static; many fallbacks use `picsum.photos`.
- **Tracking:** the order query is live, but courier, tracking number, ETA, shipment notes, and per-item shipment state are placeholders because the backend has no shipment/tracking model.

### Journal and marketing

- **Journal:** stories, categories, products, images, filters, and article dialogs are local data. “Add to cart” can fail if journal sample product IDs do not exist in the database.
- **Homepage CTA/newsletter and footer newsletter:** simulated submissions only.
- **Help center:** topics/search content is static; help subscription is simulated.
- **Footer legal links and shipping/returns links:** use `#` placeholders.
- **Live chat:** displays a “coming soon” toast only.

### Admin

- **Dashboard:** appointment totals, revenue, activity, charts, low-stock alerts, and upcoming appointments are hardcoded.
- **Store, Booking, and Notification settings:** save only in localStorage and do not affect backend behavior.
- **CMS Pages:** local-state CRUD only; there is no backend CMS model or persistence.
- **Branches:** still uses local temporary state despite backend branch GraphQL endpoints being available.
- **Admin data exports:** product/order export actions are demo toasts because no export endpoint exists.

## Recommended implementation order

1. Restore a green type-check: add missing UI components, fix `AdminProvider`, and correct explicit admin types.
2. Replace the active order-detail server page with the existing client implementation and align all order types/enums with GraphQL.
3. Repair the auth transport/refresh behavior and use backend-derived roles.
4. Implement Stripe-backed checkout with server-owned totals and promotions.
5. Convert static booking, gifts, support, CMS, settings, tracking, and journal capabilities to backend-backed features—or label/hide them until their APIs exist.
6. Make lint/build deterministic by ignoring `.next`, resolving source warnings, and self-hosting fonts.
