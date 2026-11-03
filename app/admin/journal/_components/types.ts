export const CATEGORY_OPTIONS = [
  { value: "COLOR", label: "Color" },
  { value: "CUT_AND_STYLE", label: "Cut & Style" },
  { value: "SPA_AND_SKIN", label: "Spa & Skin" },
  { value: "BRIDAL", label: "Bridal" },
  { value: "TEXTURE", label: "Texture" },
] as const;

export type JournalCategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];
export type JournalStatus = "DRAFT" | "PUBLISHED";

export interface AdminJournalProduct {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
}

export interface AdminJournalStory {
  id: string;
  clientName: string;
  quote: string;
  category: JournalCategoryValue;
  service: string;
  stylist: string;
  status: JournalStatus;
  resultImage: { url: string; width: number; height: number };
  serviceImageUrl: string | null;
  products: AdminJournalProduct[];
  publishedAt: string | null;
  createdAt: string | null;
}

export const categoryLabel = (c: JournalCategoryValue) =>
  CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;
