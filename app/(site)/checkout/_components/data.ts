import type {DeliveryOption} from "@/app/(site)/cart/_components/data";

export type CheckoutStep = "shipping" | "payment" | "review";

export interface ShippingDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
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
    state: "",
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