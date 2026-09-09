export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  salePrice: number | null;
  sku: string;
  images: string[];
  tags: string[];
  info: string[];
  badge: string | null;
  isFeatured: boolean;
  status: "active" | "inactive";
  stock: number;
  lowStockThreshold: number;
  reviewCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}
