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
    // From createPaymentIntent: ties this form to the order's PaymentIntent (its amount is fixed by the backend).
    clientSecret: string;
    orderId: string;
    orderCode: string;
    amountDue: number;
    onPaid: () => void;
}

// Flow: placeOrder (review step) -> createPaymentIntent -> this form -> stripe.confirmPayment -> Stripe sends
// payment_intent.succeeded to the backend webhook, which marks the order PAID. The page doesn't mark anything
// paid itself; it only reports what Stripe answered.
export function PaymentStep(props: PaymentStepProps) {
    if (!stripePromise) {
        return (
            <div>
                <h2 className="font-display text-2xl text-on-surface sm:text-3xl">Payment</h2>
                <p className="mt-4 text-sm text-destructive">
                    Payments aren&apos;t configured: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing. Your order{" "}
                    {props.orderCode} was placed and is waiting for payment.
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

function PaymentForm({orderId, orderCode, amountDue, onPaid}: PaymentStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements) return;
        setSubmitting(true);
        setError(null);

        // redirect: "if_required" keeps card payments on this page; methods that must leave the site
        // (some banks, 3-D Secure fallbacks) come back to the order page.
        const {error: stripeError, paymentIntent} = await stripe.confirmPayment({
            elements,
            confirmParams: {return_url: `${window.location.origin}/orders/${orderId}`},
            redirect: "if_required",
        });

        if (stripeError) {
            // Card declined, incomplete fields, ... The order stays unpaid and the form can be retried.
            setError(stripeError.message ?? "The payment couldn't be completed.");
            setSubmitting(false);
            return;
        }
        if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            onPaid();
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
                Order {orderCode} is reserved for you. Payments are processed securely by Stripe; card details
                never reach our servers.
            </p>

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
                    ) : (
                        `Pay $${amountDue.toFixed(2)}`
                    )}
                </Button>
            </div>
        </form>
    );
}
