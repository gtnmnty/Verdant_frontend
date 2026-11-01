"use client";

import React, {useState, type FormEvent} from "react";
import {Loader2, Lock} from "lucide-react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Button} from "@/components/ui/button";

// Loaded once per page load. Card details are typed into Stripe's own iframe (the Payment Element), so they
// never pass through this app's code or the backend.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PaymentStepProps {
    // From placeOrder / adminStartOrderPayment: ties this form to the checkout's PaymentIntent (its amount is
    // fixed by the backend). No order exists yet.
    clientSecret: string;
    amountDue: number;
    // Called once Stripe has taken the payment. Should create the order (finalizeCheckout) and throw an Error
    // with a message for the customer if it can't; this form shows the message and lets them retry.
    onPaid: (paymentIntentId: string) => Promise<void>;
    // Where Stripe sends the browser if a payment method has to leave the site (card normally never does).
    returnUrl?: string;
    description?: string;
    // Shown above the card form, e.g. how the total splits between promo, gift card and card.
    summary?: React.ReactNode;
}

// Flow: placeOrder (review step) -> this form -> stripe.confirmPayment -> finalizeCheckout, which checks the
// payment with Stripe and creates the order. If this tab closes after paying, the Stripe webhook creates the
// order instead. The page doesn't decide anything is paid itself; it only reports what Stripe answered.
export function PaymentStep(props: PaymentStepProps) {
    if (!stripePromise) {
        return (
            <div>
                <h2 className="font-display text-2xl text-on-surface sm:text-3xl">Payment</h2>
                <p className="mt-4 text-sm text-destructive">
                    Payments aren&apos;t configured: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.
                </p>
            </div>
        );
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{clientSecret: props.clientSecret, appearance: {theme: "stripe"}}}
        >
            <PaymentForm {...props}/>
        </Elements>
    );
}

function PaymentForm({amountDue, onPaid, returnUrl, description, summary}: PaymentStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Set once Stripe has taken the money. A retry after that only repeats the order creation: confirming the
    // same payment again would fail.
    const [paidIntentId, setPaidIntentId] = useState<string | null>(null);

    async function finish(intentId: string) {
        try {
            await onPaid(intentId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "We couldn't finish your order. Please try again.");
            setSubmitting(false);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements) return;
        setSubmitting(true);
        setError(null);

        if (paidIntentId) {
            await finish(paidIntentId);
            return;
        }

        // redirect: "if_required" keeps card payments on this page; methods that must leave the site
        // (some banks, 3-D Secure fallbacks) come back to the return URL.
        const {error: stripeError, paymentIntent} = await stripe.confirmPayment({
            elements,
            confirmParams: {return_url: returnUrl ?? `${window.location.origin}/orders`},
            redirect: "if_required",
        });

        if (stripeError) {
            // Card declined, incomplete fields, ... Nothing was charged and the form can be retried.
            setError(stripeError.message ?? "The payment couldn't be completed.");
            setSubmitting(false);
            return;
        }
        if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            setPaidIntentId(paymentIntent.id);
            await finish(paymentIntent.id);
            return;
        }
        setError("The payment wasn't completed. Please try again.");
        setSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2 className="font-display text-2xl text-on-surface sm:text-3xl">Payment</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Lock className="h-3.5 w-3.5 text-champagne-gold"/>
                {description ??
                    "Your order is created as soon as the payment goes through. Payments are processed securely by Stripe; card details never reach our servers."}
            </p>

            {summary ? (
                <div className="mt-6 rounded-lg border border-blush/40 p-5">{summary}</div>
            ) : null}

            <div className="mt-8">
                <PaymentElement/>
            </div>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

            <div className="mt-10 flex flex-wrap items-center justify-end gap-4">
                <Button
                    type="submit"
                    size="lg"
                    disabled={!stripe || !elements || submitting}
                    className="gap-2 uppercase tracking-[0.14em]"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Processing…
                        </>
                    ) : paidIntentId ? (
                        "Finish order"
                    ) : (
                        `Pay $${amountDue.toFixed(2)}`
                    )}
                </Button>
            </div>
        </form>
    );
}
