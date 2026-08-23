// Minimal cross-page cart bridge used until a shared CartContext (or a real
// backend-backed cart) exists. The Cart page currently owns its own local
// state seeded from mock data; this just gives other pages — like Journal —
// a working, persisted way to add products in the meantime.
//
// TODO: replace with a proper CartContext/provider (or a real backend cart)
// once available, and have the Cart page hydrate from it.

const CART_STORAGE_KEY = "verdant-luxe-cart";

export interface StoredCartLine {
  productId: string;
  quantity: number;
}

function readCart(): StoredCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCartLine[]) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: StoredCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

export function addToCart(productId: string, quantity = 1) {
  const lines = readCart();
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({ productId, quantity });
  }
  writeCart(lines);
}

export function addManyToCart(productIds: string[]) {
  const lines = readCart();
  for (const productId of productIds) {
    const existing = lines.find((line) => line.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      lines.push({ productId, quantity: 1 });
    }
  }
  writeCart(lines);
}
