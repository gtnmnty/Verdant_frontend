// Order of the steps: the order is placed at "review", then paid at "payment" (Stripe needs the order's
// PaymentIntent before it can show the payment form).
export type CheckoutStep = "shipping" | "review" | "payment";

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
};

export interface CheckoutOrderItem {
    id: string;
    name: string;
    category: string;
    image: string;
    price: number;
    quantity: number;
    // Delivery speed chosen in the cart (backend enum: STANDARD | EXPRESS | SAME_DAY).
    deliveryOption: string;
}

// The backend stores ISO 3166-1 alpha-2 codes (AddressInput: ^[A-Z]{2}$), so the select's value is the code
// and only the name is shown. Sending the name failed with "Country must be a 2-letter ISO code".
export const COUNTRY_OPTIONS = [
    {code: "PH", name: "Philippines"},
    {code: "US", name: "United States"},
    {code: "GB", name: "United Kingdom"},
    {code: "FR", name: "France"},
    {code: "DE", name: "Germany"},
    {code: "CA", name: "Canada"},
    {code: "AU", name: "Australia"},
    {code: "SG", name: "Singapore"},
    {code: "JP", name: "Japan"},
    {code: "AE", name: "United Arab Emirates"},
] as const;

export function countryName(code: string): string {
    return COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? code;
}