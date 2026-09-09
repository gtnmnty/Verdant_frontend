export interface AdminServiceStylist {
  id: string;
  fullName: string;
  bio: string;
  photo: string;
}

export interface AdminService {
  id: string;
  name: string;
  subName: string;
  description: string;
  category: string; // display label, e.g. "Skincare"
  duration: number;
  price: number;
  stylists: AdminServiceStylist[];
  image: string;
  active: boolean;
  homeService: boolean;
  featured: boolean;
  badge: string | null;
  tags: string[];
  info: string[];
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_TO_BACKEND: Record<string, string> = {
  Skincare: "SKIN_CARE",
  Haircare: "HAIR_CARE",
  Makeup: "MAKE_UP",
};

export const CATEGORY_FROM_BACKEND: Record<string, string> = {
  SKIN_CARE: "Skincare",
  HAIR_CARE: "Haircare",
  MAKE_UP: "Makeup",
};
