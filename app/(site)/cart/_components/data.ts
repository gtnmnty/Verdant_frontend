export type DeliveryOption = "standard" | "express" | "next-day";

export const DELIVERY_OPTION_LABELS: Record<DeliveryOption, string> = {
  standard: "Standard Delivery",
  express: "Express Delivery",
  "next-day": "Next-Day Delivery",
};

// What the backend charges per delivery speed (shipping.fee.* in the backend's application.properties).
// Keep these in sync: the cart and checkout show them, but the backend computes the order total itself.
export const DELIVERY_OPTION_FEES: Record<DeliveryOption, number> = {
  standard: 0,
  express: 5,
  "next-day": 10,
};

// One fee per distinct delivery option: items sharing an option ship together, each different option is its
// own shipment (express + next-day = $15). Same rule as the backend's ShippingService.calculateDeliveryFee.
export function deliveryFeeFor(options: DeliveryOption[]): number {
  return [...new Set(options)].reduce((sum, option) => sum + DELIVERY_OPTION_FEES[option], 0);
}

// Label for the order summary: one option, or the distinct options joined ("Express + Next-Day Delivery").
export function deliveryLabelFor(options: DeliveryOption[]): string {
  const distinct = [...new Set(options)];
  if (distinct.length === 0) return DELIVERY_OPTION_LABELS.standard;
  if (distinct.length === 1) return DELIVERY_OPTION_LABELS[distinct[0]];
  return distinct.map((o) => DELIVERY_OPTION_LABELS[o].replace(" Delivery", "")).join(" + ") + " Delivery";
}

export interface CartProduct {
  id: string;
  // Catalog product id (id above is the cart line): links the name to /collections/[productId].
  productId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  deliveryOption: DeliveryOption;
  selected: boolean;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

// Placeholder imagery via picsum.photos — swap for real product photography
// (e.g. Cloudinary asset URLs) once available.

export const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: "sculptural-boar-brush",
    name: "Sculptural Boar Brush",
    category: "Tools",
    price: 45,
    image: "https://picsum.photos/seed/boar-brush/400/400",
  },
  {
    id: "volume-bath",
    name: "Volume Bath",
    category: "Hair Care",
    price: 38,
    image: "https://picsum.photos/seed/volume-bath/400/400",
  },
  {
    id: "intense-recovery-mask",
    name: "Intense Recovery Mask",
    category: "Hair Care",
    price: 62,
    image: "https://picsum.photos/seed/recovery-mask/400/400",
  },
  {
    id: "tortoise-claw-clip",
    name: "Tortoise Claw Clip",
    category: "Accessories",
    price: 22,
    image: "https://picsum.photos/seed/claw-clip/400/400",
  },
];

// The backend charges no base shipping, no tax and no gift-packaging fee, so neither does the display.
// (Showing them made the cart and checkout total differ from what the order actually costs.)
export const FREE_SHIPPING_THRESHOLD = 0;
export const BASE_SHIPPING_FEE = 0;
export const TAX_RATE = 0;
export const GIFT_PACKAGING_FEE = 0;
