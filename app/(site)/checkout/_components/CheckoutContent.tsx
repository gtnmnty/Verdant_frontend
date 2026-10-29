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
    DELIVERY_OPTION_FEES,
    DELIVERY_OPTION_LABELS,
    type DeliveryOption,
} from "@/app/(site)/cart/_components/data";
import {
    EMPTY_SHIPPING_DETAILS,
    type CheckoutOrderItem,
    type CheckoutStep,
    type ShippingDetails,
} from "@/app/(site)/checkout/_components/data";

const SESSION_STORAGE_KEY = "verdant-luxe-checkout-items";

// Backend enum (common.graphql) -> the cart's option keys, for the fee and label tables.
const DELIVERY_FROM_BACKEND: Record<string, DeliveryOption> = {
    STANDARD: "standard",
    EXPRESS: "express",
    SAME_DAY: "next-day",
};

interface BackendCartItem {
    id: string;
    quantity: number;
    deliveryOption: string;
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

// What the backend says the placed order costs; used instead of the page's estimate from here on.
interface PlacedOrder {
    id: string;
    orderCode: string;
    total: number;
    walletAmountApplied: number | null;
    paymentStatus: string;
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
                deliveryOption
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

const WALLET_QUERY = `
    query CheckoutWallet {
        myWalletBalance
    }
`;

const PREVIEW_PROMO_QUERY = `
    query PreviewPromoCode($code: String!, $subtotal: BigDecimal!) {
        previewPromoCode(code: $code, subtotal: $subtotal) {
            discountAmount
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
            total
            walletAmountApplied
            paymentStatus
        }
    }
`;

const CREATE_PAYMENT_INTENT_MUTATION = `
    mutation CreatePaymentIntent($input: CreatePaymentInput!) {
        createPaymentIntent(input: $input) {
            clientSecret
            amount
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
        deliveryOption: item.deliveryOption,
    };
}

export function CheckoutContent() {
    const router = useRouter();

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [items, setItems] = useState<CheckoutOrderItem[] | null>(null);
    const [me, setMe] = useState<BackendMe | null>(null);

    const [shipping, setShipping] = useState<ShippingDetails>(EMPTY_SHIPPING_DETAILS);

    const [promoCode, setPromoCode] = useState("");
    // Set only after the backend accepted the code (previewPromoCode); sent with placeOrder.
    const [appliedPromo, setAppliedPromo] = useState<{code: string; discount: number} | null>(null);
    const [promoChecking, setPromoChecking] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
    const [payment, setPayment] = useState<{clientSecret: string; amount: number} | null>(null);
    const [completed, setCompleted] = useState(false);
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

        gqlRequest<{ myWalletBalance: number }>(WALLET_QUERY)
            .then((res) => { if (!cancelled) setWalletBalance(Number(res.myWalletBalance) || 0); })
            .catch(() => { /* no wallet: the option simply isn't shown */ });

        return () => { cancelled = true; };
    }, []);

    // Same rules as the backend (OrderService): total = subtotal - promo discount + delivery fee, where the
    // fee is the highest among the items' delivery options. No tax. The backend's own figures replace this
    // estimate once the order is placed.
    const subtotal = useMemo(
        () => (items ?? []).reduce((sum, item) =>
            sum + item.price * item.quantity, 0),
        [items],
    );
    const fastestDelivery: DeliveryOption = useMemo(() => {
        let fastest: DeliveryOption = "standard";
        for (const item of items ?? []) {
            const option = DELIVERY_FROM_BACKEND[item.deliveryOption] ?? "standard";
            if (DELIVERY_OPTION_FEES[option] > DELIVERY_OPTION_FEES[fastest]) fastest = option;
        }
        return fastest;
    }, [items]);
    const shippingFee = (items?.length ?? 0) === 0 ? 0 : DELIVERY_OPTION_FEES[fastestDelivery];
    const discount = appliedPromo?.discount ?? 0;
    const estimatedTotal = Math.max(0, subtotal - discount + shippingFee);
    const total = placedOrder ? Number(placedOrder.total) : estimatedTotal;
    const walletApplied = placedOrder
        ? Number(placedOrder.walletAmountApplied ?? 0)
        : useWallet ? Math.min(walletBalance, estimatedTotal) : 0;
    const amountDue = payment ? Number(payment.amount) : Math.max(0, total - walletApplied);

    function applyPromoCode() {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;
        setPromoChecking(true);
        setPromoError(null);
        gqlRequest<{ previewPromoCode: {discountAmount: number} }>(PREVIEW_PROMO_QUERY, {code, subtotal})
            .then((res) => {
                setAppliedPromo({code, discount: Number(res.previewPromoCode.discountAmount)});
                toast.success("Promotional code applied.");
            })
            .catch((err) => setPromoError(err instanceof Error ? err.message : "That code isn't valid."))
            .finally(() => setPromoChecking(false));
    }

    // Starts (or resumes) the Stripe payment for a placed order. createPaymentIntent hands back the same
    // intent if one exists, so retrying after a failure is safe.
    function startPayment(order: PlacedOrder) {
        setIsPlacingOrder(true);
        gqlRequest<{ createPaymentIntent: {clientSecret: string; amount: number} }>(
            CREATE_PAYMENT_INTENT_MUTATION, {input: {orderId: order.id}})
            .then((res) => {
                setPayment(res.createPaymentIntent);
                setStep("payment");
            })
            .catch((err) => toast.error(
                `Order ${order.orderCode} is placed, but payment couldn't start: ` +
                (err instanceof Error ? err.message : "please try again.")))
            .finally(() => setIsPlacingOrder(false));
    }

    // Flow: placeOrder (reserves stock, applies promo + wallet) -> fully covered by the wallet? done ->
    // otherwise createPaymentIntent -> Stripe payment step.
    function handlePlaceOrder() {
        if (!items || items.length === 0) return;
        if (placedOrder) {
            startPayment(placedOrder);  // order already placed: only the payment needs retrying
            return;
        }
        setIsPlacingOrder(true);

        gqlRequest<{ placeOrder: PlacedOrder }>(PLACE_ORDER_MUTATION, {
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
                paymentMethod: "card",
                promoCode: appliedPromo?.code,
                useWalletBalance: useWallet,
            },
        })
            .then((res) => {
                const order = res.placeOrder;
                setPlacedOrder(order);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
                if (order.paymentStatus === "PAID") {
                    setIsPlacingOrder(false);
                    setCompleted(true);
                    return;
                }
                startPayment(order);
            })
            .catch((err) => {
                setIsPlacingOrder(false);
                toast.error(err instanceof Error ? err.message : "Failed to place order.");
            });
    }

    // Flow: Update user profile with shipping address for future checkouts
    function handleSaveInformation() {
        gqlRequest(UPDATE_PROFILE_MUTATION, {
            input: {
                fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
                phone: shipping.phone,
                // Email left out on purpose: the checkout contact email isn't an account email change,
                // and changing that now needs the current password plus a confirmation code.
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

    if (items.length === 0 && !placedOrder) {
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
                            onContinue={() => setStep("review")}
                            onReturnToCart={() => router.push("/cart")}
                            wasPrefilled={Boolean(me?.shippingAddress)}
                        />
                    ) : null}

                    {step === "review" ? (
                        <ReviewStep
                            shipping={shipping}
                            deliveryLabel={DELIVERY_OPTION_LABELS[fastestDelivery]}
                            items={items}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            discount={discount}
                            total={total}
                            walletApplied={walletApplied}
                            amountDue={amountDue}
                            isPlacingOrder={isPlacingOrder}
                            // The order is fixed once placed; only its payment can still be retried.
                            onEditStep={(s) => { if (!placedOrder) setStep(s); }}
                            onBack={() => { if (!placedOrder) setStep("shipping"); }}
                            onPlaceOrder={handlePlaceOrder}
                        />
                    ) : null}

                    {step === "payment" && placedOrder && payment ? (
                        <PaymentStep
                            clientSecret={payment.clientSecret}
                            orderId={placedOrder.id}
                            orderCode={placedOrder.orderCode}
                            amountDue={Number(payment.amount)}
                            onPaid={() => setCompleted(true)}
                        />
                    ) : null}
                </div>

                <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    shipping={shippingFee}
                    tax={0}
                    discount={discount}
                    total={total}
                    promoCode={promoCode}
                    promoApplied={appliedPromo !== null}
                    promoChecking={promoChecking}
                    promoError={promoError}
                    onPromoCodeChange={(value) => {
                        setPromoCode(value);
                        setPromoError(null);
                    }}
                    onApplyPromoCode={applyPromoCode}
                    walletBalance={walletBalance}
                    useWallet={useWallet}
                    onUseWalletChange={setUseWallet}
                    walletApplied={walletApplied}
                    amountDue={amountDue}
                    locked={placedOrder !== null}
                />
            </div>

            <OrderConfirmationDialog
                open={completed && placedOrder !== null}
                onOpenChange={(open) => {
                    if (!open) router.push(`/orders/${placedOrder?.id}`);
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
