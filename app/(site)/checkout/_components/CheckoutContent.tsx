"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {gqlRequest} from "@/utils/graphqlClient";
import {CheckoutStepper} from "@/app/(site)/checkout/_components/CheckoutStepper";
import {OrderSummary} from "@/app/(site)/checkout/_components/OrderSummary";
import {ShippingStep} from "@/app/(site)/checkout/_components/ShippingStep";
import {PaymentStep} from "@/app/(site)/checkout/_components/PaymentStep";
import {ReviewStep} from "@/app/(site)/checkout/_components/ReviewStep";
import {OrderConfirmationDialog} from "@/app/(site)/checkout/_components/OrderConfirmationDialog";
import {
    BASE_SHIPPING_FEE,
    DELIVERY_OPTION_FEES,
    FREE_SHIPPING_THRESHOLD,
    TAX_RATE,
} from "@/app/(site)/cart/_components/data";
import {
    EMPTY_SHIPPING_DETAILS,
    type CheckoutOrderItem,
    type CheckoutStep,
    type PaymentSummary,
    type ShippingDetails,
} from "@/app/(site)/checkout/_components/data";

const SESSION_STORAGE_KEY = "verdant-luxe-checkout-items";
const PROMO_CODES: Record<string, number> = {WELCOME10: 0.1};

interface BackendCartItem {
    id: string;
    quantity: number;
    product: {
        name: string;
        itemCatalog: string;
        price: number;
        salePrice: number | null;
        image: string | null;
    };
}

interface BackendMe {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    shippingAddress: {
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal: string;
        country: string;
    } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
    SKIN_CARE: "Skincare",
    HAIR_CARE: "Haircare",
    MAKE_UP: "Makeup",
};

// Flow: Query the backend cart using canonical fields matching cart.graphql (image, itemCatalog)
const MY_CART_QUERY = `
    query CheckoutCart {
        myCart {
            items {
                id
                quantity
                product {
                    name
                    itemCatalog
                    price
                    salePrice
                    image
                }
            }
        }
    }
`;

const ME_QUERY = `
    query CheckoutMe {
        me {
            id
            fullName
            email
            phone
            shippingAddress { line1 line2 city state postal country }
        }
    }
`;

const UPDATE_PROFILE_MUTATION = `
    mutation SaveCheckoutInfo($input: UpdateProfileInput!) {
        updateProfile(input: $input) { id }
    }
`;

const PLACE_ORDER_MUTATION = `
    mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
            id
            orderCode
        }
    }
`;

// Flow: Map backend Cart item fields into UI display format
function toOrderItem(item: BackendCartItem): CheckoutOrderItem {
    return {
        id: item.id,
        name: item.product.name,
        category: CATEGORY_LABELS[item.product.itemCatalog] ?? item.product.itemCatalog,
        image: item.product.image ?? "https://picsum.photos/seed/checkout-item/300/300",
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
    };
}

export function CheckoutContent() {
    const router = useRouter();

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [items, setItems] = useState<CheckoutOrderItem[] | null>(null);
    const [me, setMe] = useState<BackendMe | null>(null);

    const [shipping, setShipping] = useState<ShippingDetails>(EMPTY_SHIPPING_DETAILS);
    const [payment, setPayment] = useState<PaymentSummary | null>(null);

    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<{id: string; orderCode: string} | null>(null);
    const [hasSavedInfo, setHasSavedInfo] = useState(false);
    const [hasRespondedToSavePrompt, setHasRespondedToSavePrompt] = useState(false);

    useEffect(() => {
        let cancelled = false;

        gqlRequest<{ myCart: {items: BackendCartItem[]} }>(MY_CART_QUERY)
            .then((res) => {
                if (cancelled) return;
                let raw: string[] = [];
                try {
                    raw = typeof window !== "undefined"
                        ? JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "[]")
                        : [];
                } catch {
                    raw = [];
                }
                const selected = raw.length > 0
                    ? res.myCart.items.filter((i) => raw.includes(i.id))
                    : res.myCart.items; // fallback: direct navigation to /checkout
                setItems(selected.map(toOrderItem));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load your bag.");
                if (!cancelled) setItems([]);
            });

        gqlRequest<{ me: BackendMe }>(ME_QUERY)
            .then((res) => {
                if (cancelled) return;
                setMe(res.me);
                const [firstName, ...rest] = res.me.fullName.split(" ");
                // Flow: Prefill checkout fields from authenticated user profile and saved address
                setShipping((prev) => ({
                    ...prev,
                    firstName: firstName ?? "",
                    lastName: rest.join(" "),
                    email: res.me.email,
                    phone: res.me.phone ?? "",
                    streetAddress: res.me.shippingAddress?.line1 ?? "",
                    city: res.me.shippingAddress?.city ?? "",
                    state: res.me.shippingAddress?.state ?? "",
                    postalCode: res.me.shippingAddress?.postal ?? "",
                    country: res.me.shippingAddress?.country ?? "",
                }));
                setHasSavedInfo(Boolean(res.me.shippingAddress));
            })
            .catch(() => { /* not logged in — leave the form empty */ });

        return () => { cancelled = true; };
    }, []);

    const subtotal = useMemo(
        () => (items ?? []).reduce((sum, item) =>
            sum + item.price * item.quantity, 0),
        [items],
    );
    // This dropdown only drives the frontend's shipping-fee *estimate* — the
    // backend derives each order item's real deliveryOption from what was
    // already chosen in the cart, and placeOrder has no field to override it.
    const deliverySurcharge = DELIVERY_OPTION_FEES[shipping.deliveryOption];
    const shippingFee =
        (items?.length ?? 0) === 0
            ? 0
            : deliverySurcharge + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE);
    const tax = subtotal * TAX_RATE;
    const discount = promoApplied ? subtotal * (PROMO_CODES[promoCode.toUpperCase()] ?? 0) : 0;
    const total = subtotal + shippingFee + tax - discount;

    function applyPromoCode() {
        // No backend concept of promo codes — this stays a frontend-only demo.
        const rate = PROMO_CODES[promoCode.trim().toUpperCase()];
        if (rate) {
            setPromoApplied(true);
            setPromoError(null);
            toast.success("Promotional code applied.");
        } else {
            setPromoError("That code isn't valid.");
        }
    }

    // Flow: Execute placeOrder mutation sending the required AddressInput fields
    function handlePlaceOrder() {
        if (!items || items.length === 0 || !payment) return;
        setIsPlacingOrder(true);

        gqlRequest<{ placeOrder: {id: string; orderCode: string} }>(PLACE_ORDER_MUTATION, {
            input: {
                cartItemIds: items.map((i) => i.id),
                shippingAddress: {
                    line1: shipping.streetAddress,
                    line2: undefined,
                    city: shipping.city,
                    state: shipping.state,
                    postal: shipping.postalCode,
                    country: shipping.country,
                },
                paymentMethod: `${payment.brand} •••• ${payment.last4}`,
            },
        })
            .then((res) => {
                setPlacedOrder(res.placeOrder);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message :
                    "Failed to place order.");
            })
            .finally(() => setIsPlacingOrder(false));
    }

    // Flow: Update user profile with shipping address for future checkouts
    function handleSaveInformation() {
        gqlRequest(UPDATE_PROFILE_MUTATION, {
            input: {
                fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
                phone: shipping.phone,
                email: shipping.email,
                shippingAddress: {
                    line1: shipping.streetAddress,
                    line2: undefined,
                    city: shipping.city,
                    state: shipping.state,
                    postal: shipping.postalCode,
                    country: shipping.country,
                },
            },
        })
            .then(() => {
                setHasSavedInfo(true);
                setHasRespondedToSavePrompt(true);
                toast.success("Your information has been saved.");
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message :
                    "Failed to save your information.");
            });
    }

    const showSavePrompt = !hasSavedInfo;

    if (items === null) {
        return <div className="mx-auto w-[min(92vw,1400px)] pb-24"/>;
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto w-[min(92vw,1400px)] pb-24">
                <div className="flex flex-col items-center rounded-xl
                 bg-surface-low px-6 py-20 text-center">
                    <h1 className="font-display text-2xl text-on-surface">
                        Your bag is empty
                    </h1>
                    <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
                        Add a few favorites to your bag before heading to checkout.
                    </p>
                    <Button className="mt-6 uppercase tracking-[0.14em]"
                            onClick={() => router.push("/cart")}>
                        Return to Cart
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-[min(92vw,1400px)] pb-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)]
                 text-primary">
                    Checkout
                </h1>
                <div
                    className="flex items-center gap-1.5 text-[11px]
                                    font-semibold uppercase tracking-[0.14em]
                                    text-on-surface-variant">
                    <ShieldCheck className="h-4 w-4 text-champagne-gold"/>
                    Secure Checkout
                </div>
            </div>

            <div className="mt-8">
                <CheckoutStepper current={step}/>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]
                 lg:items-start">
                <div className="min-w-0 rounded-xl border border-blush/40 p-6
                 sm:p-8">
                    {step === "shipping" ? (
                        <ShippingStep
                            value={shipping}
                            onChange={(patch) => setShipping(
                                (prev) => ({...prev, ...patch}))}
                            onContinue={() => setStep("payment")}
                            onReturnToCart={() => router.push("/cart")}
                            wasPrefilled={Boolean(me?.shippingAddress)}
                        />
                    ) : null}

                    {step === "payment" ? (
                        <PaymentStep
                            defaultCardholderName={`${shipping.firstName} ${shipping.lastName}`.trim()}
                            onBack={() => setStep("shipping")}
                            onContinue={(summary) => {
                                setPayment(summary);
                                setStep("review");
                            }}
                        />
                    ) : null}

                    {step === "review" && payment ? (
                        <ReviewStep
                            shipping={shipping}
                            payment={payment}
                            items={items}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            tax={tax}
                            discount={discount}
                            total={total}
                            isPlacingOrder={isPlacingOrder}
                            onEditStep={setStep}
                            onBack={() => setStep("payment")}
                            onPlaceOrder={handlePlaceOrder}
                        />
                    ) : null}
                </div>

                <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    shipping={shippingFee}
                    tax={tax}
                    discount={discount}
                    total={total}
                    promoCode={promoCode}
                    promoApplied={promoApplied}
                    promoError={promoError}
                    onPromoCodeChange={(value) => {
                        setPromoCode(value);
                        setPromoError(null);
                    }}
                    onApplyPromoCode={applyPromoCode}
                />
            </div>

            <OrderConfirmationDialog
                open={placedOrder !== null}
                onOpenChange={(open) => {
                    if (!open) setPlacedOrder(null);
                }}
                orderNumber={placedOrder?.orderCode ?? ""}
                email={shipping.email}
                showSavePrompt={showSavePrompt}
                hasRespondedToSavePrompt={hasRespondedToSavePrompt}
                onSaveInformation={handleSaveInformation}
                onDismissSavePrompt={() => setHasRespondedToSavePrompt(true)}
                onViewOrder={() => router.push(`/orders/${placedOrder?.id}`)}
                onTrackOrder={() => router.push(`/tracking/${placedOrder?.id}`)}
                onContinueShopping={() => router.push("/collections")}
            />
        </div>
    );
}