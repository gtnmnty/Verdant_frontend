export const STAGES = ["Placed", "Preparing", "Shipped", "Out for Delivery", "Delivered"] as const;
export type Stage = (typeof STAGES)[number];

export type DeliveryOption = "STANDARD" | "EXPRESS" | "SAME_DAY";

export interface TrackItem {
  id: string;
  // null when the product was deleted after the order was placed (can't be bought again).
  productId: string | null;
  name: string;
  price: number;
  qty: number;
  image: string;
  deliveryOption: DeliveryOption;
  courier: string;
  stage: Stage;
  // Badge text; matches the order status shown on /orders, except "Out for Delivery" per item.
  statusLabel: string;
  cancelled: boolean;
  // e.g. "Nov 5 – Nov 7"; null when the backend gave no estimate.
  eta: string | null;
  note: string;
}
