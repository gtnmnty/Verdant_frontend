// This file was imported everywhere under `@/lib/admin/types` but never
// existed in the repo, so the entire /admin section failed to build. Branch
// below is the real, deliberate shape used by the now-connected `branches`
// route. Everything else is a loose placeholder — just enough for the
// still-unconnected admin routes (products, services, orders, stylists,
// accounts, reviews, appointments, pages) to type-check against their
// existing mock UI. Tighten each one up to match its real GraphQL DTO as
// that route gets wired, the same way Branch should eventually be replaced
// entirely once nothing needs a client-side mirror of it anymore.

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  mapsUrl: string;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

// --- placeholders below (not yet wired to the backend) ---
export type Stylist = { id: string; [key: string]: unknown };
export type Product = { id: string; [key: string]: unknown };
export type Service = { id: string; [key: string]: unknown };
export type Order = { id: string; [key: string]: unknown };
export type OrderStatus = string;
export type Account = { id: string; [key: string]: unknown };
export type Review = { id: string; [key: string]: unknown };
export type Appointment = { id: string; [key: string]: unknown };
export type AppointmentStatus = string;
export type PageRecord = { id: string; [key: string]: unknown };
