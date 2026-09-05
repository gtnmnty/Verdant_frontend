import type {DeliveryOption} from "@/app/(site)/cart/_components/data";

export type CheckoutStep = "shipping" | "payment" | "review";

export interface ShippingDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    deliveryOption: DeliveryOption;
}

export const EMPTY_SHIPPING_DETAILS: ShippingDetails = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "",
    deliveryOption: "standard",
};

export interface BillingAddress {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
}

// What the app is allowed to hold onto after the payment step. Deliberately
// excludes the PAN, expiry, and CVC — those live only inside the Payment
// step's local form state and are discarded once this summary is derived.
// A real integration swaps the whole step for Stripe Elements so raw card
// data never touches app code at all.
export interface PaymentSummary {
    cardholderName: string;
    brand: "Visa" | "Mastercard" | "Amex" | "Card";
    last4: string;
    billingSameAsShipping: boolean;
    billingAddress: BillingAddress | null;
}

export interface CheckoutOrderItem {
    id: string;
    name: string;
    category: string;
    image: string;
    price: number;
    quantity: number;
}

// TODO: replace with the authenticated user's saved address from a real
// backend once that endpoint exists.
export type SavedCustomerInfo = Omit<ShippingDetails, "deliveryOption">;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for developers to swap into MOCK_SAVED_CUSTOMER below to preview the "returning customer" state
const RETURNING_CUSTOMER: SavedCustomerInfo = {
    firstName: "Evelyn",
    lastName: "Sterling",
    email: "evelyn.sterling@example.com",
    phone: "+1 (555) 214-7788",
    streetAddress: "124 Luxury Lane, Suite 400",
    city: "Paris",
    postalCode: "75001",
    country: "France",
};

// Toggle between `null` (first-time checkout: empty form, save-info prompt
// shown after ordering) and `RETURNING_CUSTOMER` (auto-filled form, prompt
// skipped) to preview both states.
export const MOCK_SAVED_CUSTOMER: SavedCustomerInfo | null = null;

export const COUNTRY_OPTIONS = [
    "Philippines",
    "United States",
    "United Kingdom",
    "France",
    "Germany",
    "Canada",
    "Australia",
    "Singapore",
    "Japan",
    "United Arab Emirates",
] as const;
