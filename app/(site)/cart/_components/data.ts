export type DeliveryOption = "standard" | "express" | "next-day";

export const DELIVERY_OPTION_LABELS: Record<DeliveryOption, string> = {
  standard: "Standard Delivery",
  express: "Express Delivery",
  "next-day": "Next-Day Delivery",
};

// What the backend charges per delivery speed (shipping.fee.* in the backend's application.properties).
// An order pays the HIGHEST fee among its items' options, once, not per item. Keep these in sync: the cart
// and checkout show them, but the backend computes the order total itself.
export const DELIVERY_OPTION_FEES: Record<DeliveryOption, number> = {
  standard: 0,
  express: 5,
  "next-day": 10,
};

export interface CartProduct {
  id: string;
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

export const INITIAL_CART_ITEMS: CartProduct[] = [
  {
    id: "silk-elixir-restorative-oil",
    name: "Silk Elixir Restorative Oil",
    category: "Hair Care / 50ml",
    description:
      "Our signature blend of cold-pressed botanicals designed for weightless shine and deep hydration.",
    price: 82,
    image: "https://picsum.photos/seed/silk-elixir/400/400",
    quantity: 1,
    deliveryOption: "standard",
    selected: true,
  },
  {
    id: "ceramic-sculpt-styler",
    name: "Ceramic Sculpt Styler",
    category: "Tools / Matte Taupe",
    description:
      "Advanced ionic technology meets ergonomic design for salon-perfect waves and smooth finishes at home.",
    price: 245,
    image: "https://picsum.photos/seed/ceramic-sculpt/400/400",
    quantity: 1,
    deliveryOption: "standard",
    selected: true,
  },
  {
    id: "hydrating-clay-mask",
    name: "Hydrating Clay Mask",
    category: "Skin Care / 100ml",
    description:
      "A mineral-rich mask that draws out impurities while botanical oils replenish moisture in a single ritual.",
    price: 58,
    image: "https://picsum.photos/seed/clay-mask/400/400",
    quantity: 2,
    deliveryOption: "express",
    selected: false,
  },
];

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
