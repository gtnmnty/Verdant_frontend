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