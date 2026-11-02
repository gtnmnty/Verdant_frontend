// Flow: Query the public product catalog + a single product's detail from the
// backend GraphQL endpoint. Matches the Product, ProductPage, and CollectionSort
// types defined in product.graphql.

export const PRODUCTS_QUERY = `
    query Products(
        $category: String,
        $search: String,
        $sort: CollectionSort,
        $page: Int,
        $pageSize: Int
    ) {
        products(
            category: $category, 
            search: $search, 
            sort: $sort, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                name
                catalog
                price
                salePrice
                badge
                tags
                primaryImage { url }
                isFavorited
            }
            page
            pageSize
            totalItems
            totalPages
        }
    }
`;

export const PRODUCT_BY_ID_QUERY = `
    query ProductDetail($id: ID!) {
        product(id: $id) {
            id
            name
            catalog
            price
            salePrice
            description
            reviewCount
            averageRating
            badge
            tags
            info
            images { url }
            primaryImage { url }
            isFavorited
            inStock
        }
    }
`;

export const TOGGLE_FAVORITE_PRODUCT_MUTATION = `
    mutation ToggleFavoriteProduct($targetId: ID!) {
        toggleFavoriteProduct(targetId: $targetId) { id }
    }
`;

export const CATEGORY_LABELS: Record<string, string> = {
    SKIN_CARE: "Skin Care",
    HAIR_CARE: "Hair Care",
    MAKE_UP: "Make Up",
};

// Same rule as Product.effectivePrice() on the backend: a sale price only counts when it is positive and below
// the regular price. A stored 0 (an empty sale-price field) used to display as "$0" while checkout charged
// the regular price.
export function activeSalePrice(price: number, salePrice: number | null): number | null {
    return salePrice !== null && salePrice > 0 && salePrice < price ? salePrice : null;
}

// Shape returned by PRODUCTS_QUERY's `items` — summary fields only.
export interface BackendProductSummary {
    id: string;
    name: string;
    catalog: string;
    price: number;
    salePrice: number | null;
    badge: string | null;
    tags: string[];
    primaryImage: {url: string} | null;
    isFavorited: boolean;
}

// Shape returned by PRODUCT_BY_ID_QUERY — full detail fields.
export interface BackendProduct {
    id: string;
    name: string;
    catalog: string;
    price: number;
    salePrice: number | null;
    description: string | null;
    reviewCount: number;
    averageRating: number;
    badge: string | null;
    tags: string[];
    info: string[];
    images: {url: string}[];
    primaryImage: {url: string} | null;
    isFavorited: boolean;
    inStock: boolean;
}
