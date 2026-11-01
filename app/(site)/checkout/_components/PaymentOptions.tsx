"use client";

import {CreditCard, Gift, Tag, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";

interface PaymentOptionsProps {
    // Total after the promo discount and shipping, before the gift card.
    total: number;
    discount: number;
    // Spendable gift-card balance (myWalletBalance).
    walletBalance: number;
    useWallet: boolean;
    onUseWalletChange: (use: boolean) => void;
    walletApplied: number;
    promoCode: string;
    promoApplied: boolean;
    promoChecking: boolean;
    promoError: string | null;
    onPromoCodeChange: (value: string) => void;
    onApplyPromoCode: () => void;
    onRemovePromoCode: () => void;
    // What is left for the card once the promo and gift card have been taken off.
    amountDue: number;
    // Once the checkout is saved its promo and gift card are fixed.
    locked: boolean;
}

// The three ways to pay, in the order they are applied: promo code lowers the total, the gift card pays what
// it can of that, and the card pays the rest. Any one, two or all three can be used.
export function PaymentOptions({
    total,
    discount,
    walletBalance,
    useWallet,
    onUseWalletChange,
    walletApplied,
    promoCode,
    promoApplied,
    promoChecking,
    promoError,
    onPromoCodeChange,
    onApplyPromoCode,
    onRemovePromoCode,
    amountDue,
    locked,
}: PaymentOptionsProps) {
    const hasWallet = walletBalance > 0;

    return (
        <div className="rounded-lg border border-blush/40 p-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                Payment
            </h3>
            <p className="mt-2 text-xs text-on-surface-variant">
                Use a promo code, your gift card balance, your card, or all three. The card pays whatever is left.
            </p>

            <div className="mt-4 divide-y divide-blush/40">
                <div className="flex items-start gap-3 pb-4">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-on-surface">Promo code</span>
                            {promoApplied ? (
                                <span className="text-sm font-medium text-champagne-gold">
                                    −${discount.toFixed(2)}
                                </span>
                            ) : null}
                        </div>

                        {promoApplied ? (
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                                <span>
                                    <span className="font-semibold uppercase tracking-wide text-on-surface">
                                        {promoCode.trim().toUpperCase()}
                                    </span>{" "}
                                    applied
                                </span>
                                {!locked ? (
                                    <button
                                        type="button"
                                        onClick={onRemovePromoCode}
                                        className="flex items-center gap-1 font-semibold uppercase tracking-widest
                                            text-primary underline underline-offset-4 hover:opacity-75"
                                    >
                                        <X className="h-3 w-3"/> Remove
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="mt-2 flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <Input
                                        value={promoCode}
                                        onChange={(e) => onPromoCodeChange(e.target.value)}
                                        placeholder="Enter code"
                                        disabled={locked}
                                        className="bg-surface-lowest"
                                    />
                                    {promoError ? (
                                        <p className="mt-1 text-xs text-destructive">{promoError}</p>
                                    ) : null}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onApplyPromoCode}
                                    disabled={locked || promoChecking || promoCode.trim().length === 0}
                                >
                                    {promoChecking ? "Checking…" : "Apply"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <label
                    className={`flex items-start gap-3 py-4 ${hasWallet && !locked ? "cursor-pointer" : "opacity-60"}`}
                >
                    <Gift className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-on-surface">Gift card balance</span>
                            {walletApplied > 0 ? (
                                <span className="text-sm font-medium text-champagne-gold">
                                    −${walletApplied.toFixed(2)}
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">
                            {hasWallet
                                ? `$${walletBalance.toFixed(2)} available`
                                : "No gift card balance on your account"}
                        </p>
                    </div>
                    <Checkbox
                        checked={useWallet && hasWallet}
                        disabled={!hasWallet || locked}
                        onCheckedChange={(checked: boolean | "indeterminate") => onUseWalletChange(checked === true)}
                        className="mt-0.5"
                        aria-label="Use my gift card balance"
                    />
                </label>

                <div className="flex items-start gap-3 pt-4">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-on-surface">Card</span>
                            <span className="text-sm font-medium text-on-surface">${amountDue.toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">
                            {amountDue > 0
                                ? "Charged securely with Stripe on the next step."
                                : "Not needed. Your gift card balance covers the full amount."}
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-4 bg-blush/40"/>
            <PaymentBreakdown total={total} walletApplied={walletApplied} amountDue={amountDue}/>
        </div>
    );
}

// Total -> gift card -> what the card is charged. Also shown above the Stripe form.
export function PaymentBreakdown({total, walletApplied, amountDue}: {
    total: number;
    walletApplied: number;
    amountDue: number;
}) {
    return (
        <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
                <dt className="text-on-surface-variant">Order total</dt>
                <dd className="text-on-surface">${total.toFixed(2)}</dd>
            </div>
            {walletApplied > 0 ? (
                <div className="flex items-center justify-between">
                    <dt className="text-champagne-gold">Gift card balance</dt>
                    <dd className="text-champagne-gold">−${walletApplied.toFixed(2)}</dd>
                </div>
            ) : null}
            <div className="flex items-center justify-between">
                <dt className="font-medium text-on-surface">{amountDue > 0 ? "Charged to card" : "Due now"}</dt>
                <dd className="font-display text-lg text-primary">${amountDue.toFixed(2)}</dd>
            </div>
        </dl>
    );
}
