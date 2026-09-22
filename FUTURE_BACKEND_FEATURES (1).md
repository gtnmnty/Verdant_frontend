# Future Backend Features

Running list of things the frontend can't fully connect to yet because the
backend has no schema/endpoint for them. Collected while wiring up the
`(site)` routes.

## Branches
- No public `branches` query — only `adminBranches` (role-gated).
- Needed for: branch pickers in the service-detail booking form and the
  `/book` page. Both currently fall back to a static list
  (`BRANCHES` in each route's `data.ts`).

## Gift Cards
- No gift-card model at all (no type, no queries/mutations).
- Needed for: `account` → `GiftCardsSection.tsx`, currently fully static.
- You mentioned you'll add this.

## Support Tickets
- No support-ticket model at all.
- Needed for: `account` → `SupportSection.tsx`, currently fully static.

## Help & Support Page
- No FAQ/help-articles table — `TopicSearch.tsx`'s topics are a hardcoded
  array filtered client-side.
- No newsletter/subscribers endpoint — `StayInspired.tsx`'s email signup is
  a toast only.
- No live-chat or ticketing integration — `ConciergeChannels.tsx`'s
  "Start Chat" button is a toast only.
- (`mailto:`/`tel:` links on this page are already "real" — no backend
  needed for those.)

## Journal
- No CMS-backed content model — entire route is static.
- You mentioned you'll add a table for this.

## Per-Item Order/Delivery Tracking
- `OrderItem` has no per-item status field — only one `orderStatus` per
  `Order`.
- No courier, tracking number, or ETA fields anywhere in the schema.
- Needed for: `tracking/[id]` page to show real per-item progress instead
  of one shared stage derived from the order-level status.

## Real Shipping-Rate Calculation
- `Order.deliveryFee` is computed server-side at `placeOrder` time, but
  there's no query exposing the actual rate logic to the frontend.
- Cart/checkout currently estimate shipping with frontend-only constants
  (`BASE_SHIPPING_FEE`, `DELIVERY_OPTION_FEES`, `FREE_SHIPPING_THRESHOLD`),
  which may not match what actually gets charged.

## Product Variants
- `Product` has a single `price`/`salePrice`/`sku` — no shade, size, or
  other variant model.
- Needed for: `collections/[id]` product detail page (shade/size selector
  was dropped since there's nothing to wire it to).

## Address `state`/Region Field
- `AddressInput.state` is required by the backend, but none of the
  frontend address forms (service-detail booking, `/book`, checkout)
  collect a state/region — sent as `""` for now.

## Promo Codes / Discounts
- No backend concept of promo/discount codes.
- Checkout's promo code field (`WELCOME10`) is a frontend-only demo.

## Delete Account
- No `deleteAccount` mutation.
- `account` → `SideNav.tsx` delete action is a demo toast only.

## Rebooking / Reordering
- No dedicated "rebook this appointment" or "buy this order again"
  mutation.
- `appointments` "Book Again" re-enters the `/book` flow with the service
  pre-selected instead of duplicating the record.
- `tracking/[id]` "Buy Again" action is a toast only.

## Review Star Filter
- The `reviews` query has a `filter` param that wasn't wired in — the
  service/product review sections dropped the star-rating filter UI that
  existed in the original mock design.

## Admin Review Moderation
- `adminReviews`/`adminReview` are read-only. `upsertReview` only writes
  the CURRENTLY AUTHENTICATED user's own review for a target (no review-id
  param), so an admin can't edit or delete an arbitrary customer's review.
  No delete/moderate/flag mutation exists at all.
- `AdminReviewDto` also has no `itemId` field (only `itemName`), so the
  admin review detail page can't cross-link to the reviewed product/
  service's real record (image, price, etc.).

## Duplicate-Service Endpoint
- No dedicated "duplicate" mutation for services — admin Services page
  recreates a copy client-side by re-sending the source service's fields
  to `createService`.

## Manager Branch Scoping
- No backend concept of a manager account being scoped to a single branch.
  The admin Branches page's "manager only sees their branch" restriction
  is enforced entirely client-side.

## Admin Order Line Items
- `AdminUpdateOrderInput.items` requires the full item list resent with a
  real `productId` per line — there's no add/remove-line UI yet in the
  admin order edit dialog, only editing quantity/delivery option on
  existing lines. An item with no linked product blocks saving.

## Approve Appointment (Pending → Upcoming)
- No mutation exists to move a PENDING appointment to UPCOMING without
  also completing or cancelling it. Only `completeAppointment`,
  `cancelAppointment(s)`, `rescheduleAppointment`, and
  `updateAppointmentRequest` exist, and none of them touch status in that
  direction. The admin Appointments "Approve" action was dropped as a
  result.

## Appointment Branch as a Reference
- `AdminAppointmentDto.branch` is a plain `String` (just the branch name),
  not a `Branch` reference — so editing an appointment has to best-effort
  match that name back to a real branch id from `adminBranches` to
  pre-select the branch picker.

## Stylist Working Hours / Specialties
- `Stylist`/`AdminStylistsDto` has no working-hours or specialties field
  at all (only bio/email/phone/status/avatarUrl/branch/services) — dropped
  from the admin Stylists create/edit form and detail page.

## Stylist ↔ Service Assignment on Read
- `AdminStylistsDto` has no `services` field (only the customer-facing
  `Stylist` type does), so "offered services" on both the admin Stylists
  list-detail page and the edit form has to be derived by fetching all
  `adminServices` and filtering for ones whose `stylists` array contains
  the given stylist id, rather than reading it directly.

## Admin Store Settings
- No `StoreSettings`-type model exists: store identity (name/tagline/
  contact/logo), currency, tax rate/inclusivity, enabled payment methods,
  maintenance-mode flag. Currently a `localStorage`-backed stopgap in the
  admin Settings → Store tab.

## Admin Booking Policy
- No global booking-policy model exists: business hours/operating days,
  holidays, booking window (min/max advance), cancellation/reschedule
  windows, buffer time, daily capacity. (Per-branch operating hours already
  exist and are wired via the Branches route — this is a separate,
  site-wide policy concept.) Currently a `localStorage`-backed stopgap in
  the admin Settings → Booking tab.

## Admin Notification Preferences
- No notification-preferences model exists: per-event email/SMS channel
  toggles for booking/order/review/stock events. (The real
  `notification.graphql` is for the account activity feed — a different
  concept entirely.) Currently a `localStorage`-backed stopgap in the
  admin Settings → Notifications tab.

## Admin Pages (CMS)
- No pages/CMS schema exists at all — same situation as Journal/Help &
  Support on the customer side. Not yet looked at in detail.
