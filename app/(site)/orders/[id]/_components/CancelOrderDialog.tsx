"use client";

import {useState} from "react";
import {Loader2} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {gqlRequest} from "@/utils/graphqlClient";

export const CANCEL_REASONS = [
    {value: "CHANGED_MIND", label: "Changed my mind"},
    {value: "WRONG_ADDRESS_OR_ITEM", label: "Wrong address or item"},
    {value: "FOUND_BETTER_PRICE", label: "Found a better price"},
    {value: "DELIVERY_TOO_SLOW", label: "Delivery is too slow"},
    {value: "OTHER", label: "Other"},
] as const;

type CancelReason = (typeof CANCEL_REASONS)[number]["value"];

const MAX_NOTE_LENGTH = 150;

const CANCEL_MY_ORDER_MUTATION = `
    mutation CancelMyOrder($id: ID!, $reason: OrderCancelReason!, $note: String) {
        cancelMyOrder(id: $id, reason: $reason, note: $note) {
            id
            orderStatus
        }
    }
`;

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    orderCode: string;
    // Part of the total that goes back to the card (total minus gift-card wallet money, which returns to the wallet).
    cardRefund: number;
    walletRefund: number;
    onCancelled: () => void;
}

export function CancelOrderDialog({
    open, onOpenChange, orderId, orderCode, cardRefund, walletRefund, onCancelled,
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState<CancelReason | "">("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean) {
        if (submitting) return;
        if (!next) {
            setReason("");
            setNote("");
        }
        onOpenChange(next);
    }

    function handleConfirm() {
        if (!reason) return;
        setSubmitting(true);
        gqlRequest(CANCEL_MY_ORDER_MUTATION, {
            id: orderId,
            reason,
            note: reason === "OTHER" && note.trim() ? note.trim() : undefined,
        })
            .then(() => {
                toast.success(`Order ${orderCode} cancelled.`);
                setReason("");
                setNote("");
                onOpenChange(false);
                onCancelled();
            })
            .catch((err) => {
                // A failed refund still leaves the order cancelled (the backend says so in the message),
                // so reload the order either way to show its real state.
                toast.error(err instanceof Error ? err.message : "Failed to cancel order.");
                onCancelled();
            })
            .finally(() => setSubmitting(false));
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel order {orderCode}?</DialogTitle>
                    <DialogDescription>
                        Tell us why you&rsquo;re cancelling. This can&rsquo;t be undone.
                    </DialogDescription>
                </DialogHeader>

                <fieldset className="space-y-2" disabled={submitting}>
                    <legend className="sr-only">Reason for cancelling</legend>
                    {CANCEL_REASONS.map((r) => (
                        <label key={r.value}
                               className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                            <input
                                type="radio"
                                name="cancel-reason"
                                value={r.value}
                                checked={reason === r.value}
                                onChange={() => setReason(r.value)}
                                className="accent-primary"
                            />
                            {r.label}
                        </label>
                    ))}
                </fieldset>

                {reason === "OTHER" && (
                    <div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
                            placeholder="Tell us more (optional)"
                            rows={3}
                            disabled={submitting}
                            className="w-full rounded-md border border-blush/60 bg-transparent p-2 text-sm
                                outline-none focus:border-primary"
                        />
                        <p className="text-right text-xs text-on-surface-variant">
                            {note.length}/{MAX_NOTE_LENGTH}
                        </p>
                    </div>
                )}

                {(cardRefund > 0 || walletRefund > 0) && (
                    <p className="rounded-md bg-blush/20 p-3 text-sm text-on-surface">
                        {cardRefund > 0 && <>You will be refunded <strong>${cardRefund.toFixed(2)}</strong> to your card. </>}
                        {walletRefund > 0 && <>${walletRefund.toFixed(2)} will return to your gift card balance.</>}
                    </p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
                        Keep order
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={!reason || submitting}>
                        {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/>}
                        Cancel order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
