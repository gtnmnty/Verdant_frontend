"use client";

import {useCallback, useEffect, useState, type FormEvent, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Gift, Loader2, Plus} from "lucide-react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {gqlRequest} from "@/utils/graphqlClient";
import {EmptyBlock, PageIntro, SectionTitle} from "@/app/(site)/account/_components/shared";

// Same lazy Stripe instance pattern as checkout's PaymentStep: card details stay inside Stripe's iframe.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type GiftCardStatus = "ACTIVE" | "REDEEMED" | "DEPLETED" | "EXPIRED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

interface GiftCard {
    id: string;
    code: string;
    balance: number;
    initialAmount: number;
    status: GiftCardStatus;
    paymentStatus: PaymentStatus;
    recipientName: string | null;
    recipientEmail: string | null;
    expiresAt: string | null;
    createdAt: string;
}

interface GiftCardTransaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
}

const GIFT_CARD_FIELDS = `
    id
    code
    balance
    initialAmount
    status
    paymentStatus
    recipientName
    recipientEmail
    expiresAt
    createdAt
`;

const GIFT_CARDS_QUERY = `
    query MyGiftCards {
        myWalletBalance
        myGiftCards { ${GIFT_CARD_FIELDS} }
        mySentGiftCards { ${GIFT_CARD_FIELDS} }
        myGiftCardTransactions { id type amount description createdAt }
    }
`;

const REDEEM_GIFT_CARD_MUTATION = `
    mutation RedeemGiftCard($code: String!) {
        redeemGiftCard(code: $code) { ${GIFT_CARD_FIELDS} }
    }
`;

const PURCHASE_GIFT_CARD_MUTATION = `
    mutation PurchaseGiftCard($input: PurchaseGiftCardInput!) {
        purchaseGiftCard(input: $input) {
            clientSecret
            giftCard { id }
        }
    }
`;

const AMOUNTS = ["50", "100", "250", "500", "1000"];
const EMPTY_PURCHASE = {amount: "100", recipient: "", email: "", note: ""};

function formatDate(iso: string | null, withDay = true) {
    if (!iso) return "No expiry";
    return new Date(iso).toLocaleDateString("en-US", withDay
        ? {month: "short", day: "2-digit", year: "numeric"}
        : {month: "short", year: "numeric"});
}

function sentStatusLabel(c: GiftCard) {
    if (c.paymentStatus === "PENDING") return "Awaiting payment";
    if (c.paymentStatus === "FAILED") return "Payment failed";
    if (c.paymentStatus === "REFUNDED") return "Refunded";
    if (c.status === "REDEEMED") return "Redeemed";
    return "Delivered";
}

export function GiftCardsSection() {
    const [balance, setBalance] = useState(0);
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [sent, setSent] = useState<GiftCard[]>([]);
    const [tx, setTx] = useState<GiftCardTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [redeemOpen, setRedeemOpen] = useState(false);
    const [redeemCode, setRedeemCode] = useState("");
    const [redeeming, setRedeeming] = useState(false);

    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [purchase, setPurchase] = useState(EMPTY_PURCHASE);
    const [purchasing, setPurchasing] = useState(false);
    // Set once purchaseGiftCard created the PaymentIntent: the dialog switches to the card form.
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await gqlRequest<{
                myWalletBalance: number;
                myGiftCards: GiftCard[];
                mySentGiftCards: GiftCard[];
                myGiftCardTransactions: GiftCardTransaction[];
            }>(GIFT_CARDS_QUERY);
            setBalance(Number(res.myWalletBalance) || 0);
            setCards(res.myGiftCards);
            setSent(res.mySentGiftCards);
            setTx(res.myGiftCardTransactions);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load gift cards.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const activeCards = cards.filter((c) => c.status === "REDEEMED" && Number(c.balance) > 0);

    const redeem = async (e: SubmitEvent) => {
        e.preventDefault();
        const code = redeemCode.trim();
        if (!code) return;
        setRedeeming(true);
        try {
            // The backend validates the code; an unknown or used one is rejected, nothing is added locally.
            const res = await gqlRequest<{ redeemGiftCard: GiftCard }>(REDEEM_GIFT_CARD_MUTATION, {code});
            setRedeemCode("");
            setRedeemOpen(false);
            toast.success(`Gift card redeemed: $${Number(res.redeemGiftCard.balance).toFixed(2)} added to your wallet.`);
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "This gift card code couldn't be redeemed.");
        } finally {
            setRedeeming(false);
        }
    };

    const startPurchase = async (e: SubmitEvent) => {
        e.preventDefault();
        setPurchasing(true);
        try {
            const res = await gqlRequest<{ purchaseGiftCard: { clientSecret: string } }>(
                PURCHASE_GIFT_CARD_MUTATION,
                {
                    input: {
                        amount: Number(purchase.amount),
                        recipientName: purchase.recipient.trim() || undefined,
                        recipientEmail: purchase.email.trim(),
                        note: purchase.note.trim() || undefined,
                    },
                },
            );
            setClientSecret(res.purchaseGiftCard.clientSecret);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't start the gift card purchase.");
        } finally {
            setPurchasing(false);
        }
    };

    const closePurchase = (open: boolean) => {
        setPurchaseOpen(open);
        if (!open) {
            // An unpaid card stays PENDING on the backend and simply never activates.
            setClientSecret(null);
            setPurchase(EMPTY_PURCHASE);
        }
    };

    const onPaid = async () => {
        const recipient = purchase.recipient.trim() || purchase.email.trim();
        closePurchase(false);
        toast.success(`Payment received. ${recipient} will get the gift card by email shortly.`);
        await load();
    };

    if (loading) {
        return (
            <div className="space-y-10">
                <PageIntro title="Gift Cards" subtitle="Share the Verdant Luxe ritual with someone you love."/>
                <p className="text-sm text-on-surface-variant">Loading gift cards…</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <PageIntro title="Gift Cards" subtitle="Share the Verdant Luxe ritual with someone you love."/>

            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl bg-primary p-7
                 text-primary-foreground">
                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                        Available Balance
                    </p>
                    <p className="mt-3 font-display
                 text-[clamp(2.5rem,6vw,4rem)] leading-none">
                        ${balance.toFixed(2)}
                    </p>
                    <p className="mt-3 text-sm text-primary-foreground/70">
                        Across {activeCards.length} active card{activeCards.length === 1 ? "" : "s"}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                            onClick={() => setRedeemOpen(true)}
                            className="bg-champagne-gold text-primary
                                            hover:bg-champagne-gold/90"
                        >
                            Redeem Gift Card
                        </Button>
                        <Button
                            onClick={() => setPurchaseOpen(true)}
                            variant="outline"
                            className="border-primary-foreground/40 bg-transparent
                                            text-primary-foreground
                                            hover:bg-primary-foreground/10
                                            hover:text-primary-foreground"
                        >
                            Purchase New
                        </Button>
                    </div>
                </div>
                <div className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-7">
                    <h3 className="font-display text-xl text-primary">A Considered Gesture</h3>
                    <p className="mt-3 text-sm leading-relaxed
                 text-on-surface-variant">
                        Beautifully presented, delivered instantly. Choose any amount from $50 to $1,000.
                    </p>
                    <button
                        onClick={() => setPurchaseOpen(true)}
                        className="mt-6 inline-flex items-center gap-2 text-xs
                                        font-semibold uppercase tracking-[0.18em]
                                        text-primary underline underline-offset-[6px]"
                    >
                        <Plus className="h-4 w-4"/> Send a Gift
                    </button>
                </div>
            </div>

            <div>
                <SectionTitle title="Active Gift Cards"/>
                {activeCards.length === 0 ? (
                    <EmptyBlock icon={Gift} title="No active cards" body="Redeem a gift card code to begin."/>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {activeCards.map((c) => (
                            <li key={c.id} className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="font-display text-xl text-primary">
                                        ${Number(c.balance).toFixed(2)}
                                    </p>
                                    <Badge className="bg-blush/40 text-primary hover:bg-blush/40">Active</Badge>
                                </div>
                                <p className="mt-3 font-mono text-xs uppercase
                 tracking-[0.18em] text-on-surface-variant">
                                    {c.code}
                                </p>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    {c.expiresAt ? `Expires ${formatDate(c.expiresAt, false)}` : "No expiry"}
                                    {" · "}of ${Number(c.initialAmount).toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {sent.length > 0 && (
                <div>
                    <SectionTitle title="Gifts You've Sent"/>
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {sent.map((c) => (
                            <li key={c.id} className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="font-display text-xl text-primary">
                                        ${Number(c.initialAmount).toFixed(2)}
                                    </p>
                                    <Badge variant="outline" className="border-blush/60 text-primary">
                                        {sentStatusLabel(c)}
                                    </Badge>
                                </div>
                                <p className="mt-3 truncate text-sm text-on-surface">
                                    To {c.recipientName || c.recipientEmail}
                                </p>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    {formatDate(c.createdAt)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <SectionTitle title="Transaction History"/>
                {tx.length === 0 ? (
                    <p className="rounded-2xl border border-dashed
                       border-blush/60 bg-surface-lowest p-8
                       text-center text-sm text-on-surface-variant">
                        No gift card activity yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border
                 border-blush/50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-blush/10 text-[10px] uppercase
                 tracking-[0.18em] text-on-surface-variant">
                            <tr>
                                {["Date", "Description", "Amount"].map((h) => (
                                    <th key={h} className="px-5 py-3">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {tx.map((t) => {
                                const amount = Number(t.amount);
                                return (
                                    <tr key={t.id} className="border-t border-blush/40">
                                        <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">
                                            {formatDate(t.createdAt)}
                                        </td>
                                        <td className="px-5 py-4">{t.description}</td>
                                        <td
                                            className={`whitespace-nowrap px-5 py-4 font-medium ${
                                                amount > 0 ? "text-emerald-700" : "text-on-surface"
                                            }`}
                                        >
                                            {amount === 0
                                                ? "—"
                                                : `${amount > 0 ? "+" : "-"}$${Math.abs(amount).toFixed(2)}`}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redeem Gift Card</DialogTitle>
                        <DialogDescription>Enter the code from your gift card.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={redeem} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="redeemCode">Code</Label>
                            <Input
                                id="redeemCode"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                                placeholder="VLX-XXXX-XXXX"
                                autoComplete="off"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRedeemOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={redeeming}>
                                {redeeming ? <Loader2 className="h-4 w-4 animate-spin"/> : "Redeem"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={purchaseOpen} onOpenChange={closePurchase}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Gift Card</DialogTitle>
                        <DialogDescription>
                            {clientSecret
                                ? `Pay $${Number(purchase.amount).toFixed(2)} to send this gift card.`
                                : "Delivered by email once payment is confirmed."}
                        </DialogDescription>
                    </DialogHeader>
                    {clientSecret ? (
                        stripePromise ? (
                            <Elements stripe={stripePromise} options={{clientSecret, appearance: {theme: "stripe"}}}>
                                <GiftCardPaymentForm
                                    amount={Number(purchase.amount)}
                                    onCancel={() => closePurchase(false)}
                                    onPaid={onPaid}
                                />
                            </Elements>
                        ) : (
                            <p className="text-sm text-destructive">
                                Payments aren&apos;t configured: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.
                            </p>
                        )
                    ) : (
                        <form onSubmit={startPurchase} className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label>Amount (USD)</Label>
                                <Select
                                    value={purchase.amount}
                                    onValueChange={(v) => setPurchase({...purchase, amount: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AMOUNTS.map((v) => (
                                            <SelectItem key={v} value={v}>
                                                ${v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="giftRecipient">Recipient Name</Label>
                                <Input
                                    id="giftRecipient"
                                    required
                                    value={purchase.recipient}
                                    onChange={(e) => setPurchase({...purchase, recipient: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="giftEmail">Recipient Email</Label>
                                <Input
                                    id="giftEmail"
                                    type="email"
                                    required
                                    value={purchase.email}
                                    onChange={(e) => setPurchase({...purchase, email: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="giftNote">Note (optional)</Label>
                                <Textarea
                                    id="giftNote"
                                    rows={3}
                                    value={purchase.note}
                                    onChange={(e) => setPurchase({...purchase, note: e.target.value})}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => closePurchase(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={purchasing}>
                                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin"/> : "Continue to Payment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// The Stripe webhook marks the card PAID and emails the code to the recipient; this form only
// reports what Stripe answered, like checkout's PaymentStep.
function GiftCardPaymentForm({amount, onCancel, onPaid}: {
    amount: number;
    onCancel: () => void;
    onPaid: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!stripe || !elements) return;
        setSubmitting(true);
        setError(null);

        const {error: stripeError, paymentIntent} = await stripe.confirmPayment({
            elements,
            confirmParams: {return_url: `${window.location.origin}/account`},
            redirect: "if_required",
        });

        if (stripeError) {
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
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <PaymentElement/>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!stripe || !elements || submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin"/> : `Pay $${amount.toFixed(2)}`}
                </Button>
            </DialogFooter>
        </form>
    );
}
