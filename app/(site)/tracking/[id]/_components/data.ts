export const STAGES = ["Placed", "Preparing", "Shipped", "Out for Delivery", "Delivered"] as const;
export type Stage = (typeof STAGES)[number];

export interface TrackItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  courier: string;
  stage: Stage;
  note: string;
}

export const MOCK_ITEMS: TrackItem[] = [
  {
    id: "i1",
    name: "Repair & Restore Shampoo",
    price: 68,
    qty: 1,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80",
    courier: "DHL Express Delivery",
    stage: "Preparing",
    note: "Our Avenue Montaigne atelier is meticulously preparing your items.",
  },
  {
    id: "i2",
    name: "Rose Gold Serum",
    price: 145,
    qty: 1,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    courier: "DHL Express Delivery",
    stage: "Preparing",
    note: "Our Avenue Montaigne atelier is meticulously preparing your items.",
  },
];
