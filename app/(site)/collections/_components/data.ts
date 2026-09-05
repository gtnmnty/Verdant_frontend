export type Category = "Skincare" | "Haircare" | "Makeup";

export type Product = {
  id: string;
  name: string;
  category: Category;
  subLabel: string;
  price: number;
  image: string;
  createdAt: number;
};

export const CATEGORIES: Category[] = ["Skincare", "Haircare", "Makeup"];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Velvet Renewal Serum",
    category: "Skincare",
    subLabel: "30ml",
    price: 185,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    createdAt: 9,
  },
  {
    id: "p2",
    name: "Silk Lustre Oil",
    category: "Haircare",
    subLabel: "50ml",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?auto=format&fit=crop&w=900&q=80",
    createdAt: 8,
  },
  {
    id: "p3",
    name: "Nocturnal Rouge",
    category: "Makeup",
    subLabel: "Satin Finish",
    price: 62,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
    createdAt: 7,
  },
  {
    id: "p4",
    name: "Alpine Clay Mask",
    category: "Skincare",
    subLabel: "100ml",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    createdAt: 6,
  },
  {
    id: "p5",
    name: "Sculpting Brush Set",
    category: "Haircare",
    subLabel: "Professional",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80",
    createdAt: 5,
  },
  {
    id: "p6",
    name: "L'Heure Rose Parfum",
    category: "Makeup",
    subLabel: "50ml",
    price: 215,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
    createdAt: 4,
  },
  {
    id: "p7",
    name: "Hydra Glow Essence",
    category: "Skincare",
    subLabel: "50ml",
    price: 145,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    createdAt: 3,
  },
  {
    id: "p8",
    name: "Volume Crown Mousse",
    category: "Haircare",
    subLabel: "200ml",
    price: 78,
    image:
      "https://images.unsplash.com/photo-1631730486572-226d1f595b68?auto=format&fit=crop&w=900&q=80",
    createdAt: 2,
  },
  {
    id: "p9",
    name: "Gilded Eye Palette",
    category: "Makeup",
    subLabel: "12 Shades",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    createdAt: 1,
  },
];
