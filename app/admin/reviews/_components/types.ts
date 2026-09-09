export interface AdminReview {
    id: string;
    customer: string;
    rating: number;
    content: string;
    itemType: "product" | "service";
    itemName: string;
    reviewDate: string;
}
