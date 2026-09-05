"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
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
    INITIAL_CART_ITEMS,
    TAX_RATE,
} from "@/app/(site)/cart/_components/data";
import {
    EMPTY_SHIPPING_DETAILS,
    MOCK_SAVED_CUSTOMER,
    type CheckoutOrderItem,
    type CheckoutStep,
    type PaymentSummary,
    type ShippingDetails,
} from "@/app/(site)/checkout/_components/data";

const SESSION_STORAGE_KEY = "verdant-luxe-checkout-items";
const PROMO_CODES: Record<string, number> = {WELCOME10: 0.1};

function readCheckoutItems(): CheckoutOrderItem[] {
    const toOrderItem = (
        item: (typeof INITIAL_CART_ITEMS)[number],
    ): CheckoutOrderItem => ({
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
    });

    if (typeof window !== "undefined") {
        try {
            const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (raw) {
                const ids: string[] = JSON.parse(raw);
                const matched = INITIAL_CART_ITEMS.filter((item) => ids.includes(item.id));
                if (matched.length > 0) return matched.map(toOrderItem);
            }
        } catch {
            // fall through to default below
        }
    }

    // Fallback for direct navigation to /checkout without a cart handoff —
    // mirrors the items the cart page marks as selected by default.
    return INITIAL_CART_ITEMS.filter((item) => item.selected).map(toOrderItem);
}

export function CheckoutContent() {
    const router = useRouter();

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [items, setItems] = useState<CheckoutOrderItem[] | null>(null);

    const [shipping, setShipping] = useState<ShippingDetails>(
        MOCK_SAVED_CUSTOMER
            ? {...MOCK_SAVED_CUSTOMER, deliveryOption: "standard"}
            : EMPTY_SHIPPING_DETAILS,
    );
    const [payment, setPayment] = useState<PaymentSummary | null>(null);

    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [hasSavedInfo, setHasSavedInfo] = useState(Boolean(MOCK_SAVED_CUSTOMER));
    const [hasRespondedToSavePrompt, setHasRespondedToSavePrompt] = useState(false);

    useEffect(() => {
        setItems(readCheckoutItems());
    }, []);

    const subtotal = useMemo(
        () => (items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items],
    );
    const deliverySurcharge = DELIVERY_OPTION_FEES[shipping.deliveryOption];
    const shippingFee =
        (items?.length ?? 0) === 0
            ? 0
            : deliverySurcharge + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE);
    const tax = subtotal * TAX_RATE;
    const discount = promoApplied ? subtotal * (PROMO_CODES[promoCode.toUpperCase()] ?? 0) : 0;
    const total = subtotal + shippingFee + tax - discount;

    function applyPromoCode() {
        const rate = PROMO_CODES[promoCode.trim().toUpperCase()];
        if (rate) {
            setPromoApplied(true);
            setPromoError(null);
            toast.success("Promotional code applied.");
        } else {
            setPromoError("That code isn't valid.");
        }
    }

    function handlePlaceOrder() {
        setIsPlacingOrder(true);
        // Simulated order creation — replace with a real order/payment API call
        // once a backend exists.
        setTimeout(() => {
            const newOrderNumber = `VL-${Date.now().toString().slice(-6)}`;
            setOrderNumber(newOrderNumber);
            setIsPlacingOrder(false);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }, 900);
    }

    function handleSaveInformation() {
        setHasSavedInfo(true);
        setHasRespondedToSavePrompt(true);
        toast.success("Your information has been saved.");
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
                    <Button className="mt-6 uppercase tracking-[0.14em]" onClick={() => router.push("/cart")}>
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
                            onChange={(patch) => setShipping((prev) => ({...prev, ...patch}))}
                            onContinue={() => setStep("payment")}
                            onReturnToCart={() => router.push("/cart")}
                            wasPrefilled={Boolean(MOCK_SAVED_CUSTOMER)}
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
                open={orderNumber !== null}
                onOpenChange={(open) => {
                    if (!open) setOrderNumber(null);
                }}
                orderNumber={orderNumber ?? ""}
                email={shipping.email}
                showSavePrompt={showSavePrompt}
                hasRespondedToSavePrompt={hasRespondedToSavePrompt}
                onSaveInformation={handleSaveInformation}
                onDismissSavePrompt={() => setHasRespondedToSavePrompt(true)}
                onViewOrder={() => router.push(`/orders/${orderNumber}`)}
                onTrackOrder={() => router.push(`/tracking/${orderNumber}`)}
                onContinueShopping={() => router.push("/collections")}
            />
        </div>
    );
}
