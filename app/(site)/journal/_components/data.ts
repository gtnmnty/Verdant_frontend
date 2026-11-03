import {gqlRequest} from "@/utils/graphqlClient";

export interface JournalProduct {
    id: string;
    name: string;
    price: number;
    image: string;
}

export const CATEGORY_LABELS = {
    COLOR: "Color",
    CUT_AND_STYLE: "Cut & Style",
    SPA_AND_SKIN: "Spa & Skin",
    BRIDAL: "Bridal",
    TEXTURE: "Texture",
} as const;

export type JournalCategoryKey = keyof typeof CATEGORY_LABELS;
export type JournalCategory = (typeof CATEGORY_LABELS)[JournalCategoryKey];

export interface JournalStory {
    id: string;
    clientName: string;
    quote: string;
    resultImage: string;
    resultImageWidth: number;
    resultImageHeight: number;
    // Primary image of the featured product or service (shown as the inset photo).
    productImage: string | null;
    // True when the story features a product rather than a service (so there is nothing to book).
    isProductStory: boolean;
    service: string;
    category: JournalCategory;
    stylist: string;
    products: JournalProduct[];
}

export const JOURNAL_CATEGORIES = Object.values(CATEGORY_LABELS);

interface ApiImage {
    url: string;
    width: number;
    height: number;
}

interface ApiStory {
    id: string;
    clientName: string;
    quote: string;
    category: JournalCategoryKey;
    service: string;
    stylist: string;
    resultImage: ApiImage;
    productImage: ApiImage | null;
    serviceImageUrl: string | null;
    products: {
        id: string;
        name: string;
        price: number;
        salePrice: number | null;
        imageUrl: string | null;
    }[];
}

const STORIES_QUERY = `
    query JournalStories($category: JournalCategory, $search: String, $page: Int, $pageSize: Int) {
        journalStories(category: $category, search: $search, page: $page, pageSize: $pageSize) {
            items {
                id clientName quote category service stylist
                resultImage { url width height }
                productImage { url width height }
                serviceImageUrl
                products { id name price salePrice imageUrl }
            }
            totalPages
        }
    }
`;

function toStory(s: ApiStory): JournalStory {
    return {
        id: s.id,
        clientName: s.clientName,
        quote: s.quote,
        resultImage: s.resultImage.url,
        resultImageWidth: s.resultImage.width,
        resultImageHeight: s.resultImage.height,
        productImage: s.products[0]?.imageUrl ?? s.serviceImageUrl ?? s.productImage?.url ?? null,
        isProductStory: s.products.length > 0,
        service: s.service,
        category: CATEGORY_LABELS[s.category],
        stylist: s.stylist,
        products: s.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.salePrice ?? p.price),
            image: p.imageUrl ?? "",
        })),
    };
}

// Fetches every published story (the public page filters client-side across the full set).
export async function fetchJournalStories(): Promise<JournalStory[]> {
    const stories: JournalStory[] = [];
    let page = 1;
    let totalPages = 1;
    do {
        const res = await gqlRequest<{ journalStories: { items: ApiStory[]; totalPages: number } }>(
            STORIES_QUERY, {page, pageSize: 50});
        stories.push(...res.journalStories.items.map(toStory));
        totalPages = res.journalStories.totalPages;
        page += 1;
    } while (page <= totalPages);
    return stories;
}
