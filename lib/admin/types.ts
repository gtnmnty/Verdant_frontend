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
export interface Stylist {
  id: string;
  fullName: string;
  branchId?: string;
  photo?: string;
  workingHours?: string;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Service {
  id: string;
  name: string;
  [key: string]: unknown;
}
export type Order = { id: string; [key: string]: unknown };
export type OrderStatus = string;
export type Account = { id: string; [key: string]: unknown };
export interface Review {
  id: string;
  customer: string;
  customerAvatar: string;
  rating: number;
  content: string;
  itemType: "service" | "product";
  itemId: string;
  itemName: string;
  serviceName: string;
  featured: boolean;
  approval: string;
  reviewDate: string;
  createdAt: string;
  [key: string]: unknown;
}
export type Appointment = { id: string; [key: string]: unknown };
export type AppointmentStatus = string;
export interface PageRecord {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  metaTitle: string;
  metaDescription: string;
  content: string;
  updatedAt: string;
}
