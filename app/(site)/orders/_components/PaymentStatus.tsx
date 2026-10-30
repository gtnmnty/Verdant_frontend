"use client";

import {useState} from "react";
import {CreditCard, Loader2} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {gqlRequest} from "@/utils/graphqlClient";
import {PaymentStep} from "@/app/(site)/checkout/_components/PaymentStep";

// Customer-facing label per backend PaymentStatus. PAID gets no badge (it's the normal case), and a cancelled
// order's payment needs none: the order status already says "Cancelled".
const PAYMENT_BADGES: Record<string, { label: string; className: string }> = {
    PENDING: {label: "Awaiting payment", className: "border-amber-500/30 bg-amber-500/10 text-amber-800"},
    REQUIRES_ACTION: {label: "Awaiting payment", className: "border-amber-500/30 bg-amber-500/10 text-amber-800"},
    FAILED: {label: "Payment failed", className: "border-rose-500/30 bg-rose-500/10 text-rose-700"},
    PROCESSED: {label: "Payment processing", className: "border-sky-500/30 bg-sky-500/10 text-sky-800"},
    PARTIALLY_REFUNDED: {label: "Partially refunded", className: "border-violet-500/30 bg-violet-500/10 text-violet-800"},
    REFUNDED: {label: "Refunded", className: "border-violet-500/30 bg-violet-500/10 text-violet-800"},
};

// Payment statuses from which the customer can still pay: never paid, or the last attempt failed / needs
// another step (3-D Secure). The backend re-checks (PaymentService.requirePayable) and refuses dead orders.
const PAYABLE_STATUSES = new Set(["PENDING", "REQUIRES_ACTION", "FAILED"]);

export function isAwaitingPayment(orderStatus: string, paymentStatus?: string | null): boolean {
    return orderStatus !== "CANCELLED" && !!paymentStatus && PAYABLE_STATUSES.has(paymentStatus);
}

export function PaymentStatusBadge({
    orderStatus,
    paymentStatus,
}: {
    orderStatus: string;
    paymentStatus?: string | null;
}) {
    if (!paymentStatus || orderStatus === "CANCELLED") return null;
    const badge = PAYMENT_BADGES[paymentStatus];
    if (!badge) return null;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px]
                font-semibold uppercase tracking-[0.12em] ${badge.className}`}
        >
            {badge.label}
        </span>
    );
}

const CREATE_PAYMENT_INTENT_MUTATION = `
    mutation ResumePayment($input: CreatePaymentInput!) {
        createPaymentIntent(input: $input) {
            clientSecret
            amount
        }
    }
`;

// Lets a customer pay for an order they placed but didn't pay (left at the checkout's payment step, or the
// card failed). createPaymentIntent hands back the order's existing intent, so this never double-charges;
// unpaid orders are cancelled after 60 minutes (UnpaidOrderExpiryJob), after which the backend refuses.
export function CompletePaymentButton({
    orderId,
    orderCode,
    onPaid,
    size = "sm",
}: {
    orderId: string;
    orderCode: string;
    // Stripe accepted the payment; the webhook marks the order PAID a moment later.
    onPaid: () => void;
    size?: "sm" | "default";
}) {
    const [open, setOpen] = useState(false);
    const [starting, setStarting] = useState(false);
    const [payment, setPayment] = useState<{ clientSecret: string; amount: number } | null>(null);

    function start() {
        setStarting(true);
        gqlRequest<{ createPaymentIntent: { clientSecret: string; amount: number } }>(
            CREATE_PAYMENT_INTENT_MUTATION, {input: {orderId}})
            .then((res) => {
                setPayment(res.createPaymentIntent);
                setOpen(true);
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Payment couldn't be started."))
            .finally(() => setStarting(false));
    }

    return (
        <>
            <Button onClick={start} size={size} disabled={starting} className="gap-1.5">
                {starting ? <Loader2 className="h-4 w-4 animate-spin"/> : <CreditCard className="h-4 w-4"/>}
                Complete Payment
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="sr-only">Complete payment for order {orderCode}</DialogTitle>
                    </DialogHeader>
                    {payment ? (
                        <PaymentStep
                            clientSecret={payment.clientSecret}
                            orderId={orderId}
                            orderCode={orderCode}
                            amountDue={Number(payment.amount)}
                            onPaid={() => {
                                setOpen(false);
                                toast.success("Payment received. Your order will update in a moment.");
                                onPaid();
                            }}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
