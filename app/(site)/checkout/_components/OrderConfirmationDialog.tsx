"use client";

import {CheckCircle2} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";

interface OrderConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderNumber: string;
    email: string;
    showSavePrompt: boolean;
    hasRespondedToSavePrompt: boolean;
    onSaveInformation: () => void;
    onDismissSavePrompt: () => void;
    onViewOrder: () => void;
    onTrackOrder: () => void;
    onContinueShopping: () => void;
}

export function OrderConfirmationDialog({
    open,
    onOpenChange,
    orderNumber,
    email,
    showSavePrompt,
    hasRespondedToSavePrompt,
    onSaveInformation,
    onDismissSavePrompt,
    onViewOrder,
    onTrackOrder,
    onContinueShopping,
}: OrderConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader className="items-center text-center">
                    <div
                        className="grid h-14 w-14 place-items-center
                                        rounded-full bg-champagne-gold/15
                                        text-champagne-gold">
                        <CheckCircle2 className="h-7 w-7"/>
                    </div>
                    <DialogTitle className="mt-4 font-display text-2xl text-on-surface">
                        Order Has Been Placed
                    </DialogTitle>
                    <DialogDescription className="text-sm text-on-surface-variant">
                        Order #{orderNumber} · A confirmation has been sent to {email}.
                    </DialogDescription>
                </DialogHeader>

                {showSavePrompt && !hasRespondedToSavePrompt ? (
                    <>
                        <Separator className="my-2 bg-blush/40"/>
                        <div className="rounded-lg bg-surface-low p-4 text-center">
                            <p className="text-sm font-medium text-on-surface">
                                Would you like to save your information?
                            </p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                                Skip the form next time you check out.
                            </p>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row
                                 sm:justify-center">
                                <Button
                                    type="button"
                                    onClick={onSaveInformation}
                                    className="uppercase tracking-widest"
                                >
                                    Save Information
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onDismissSavePrompt}
                                    className="uppercase tracking-widest"
                                >
                                    Not Now
                                </Button>
                            </div>
                        </div>
                    </>
                ) : null}

                <Separator className="my-2 bg-blush/40"/>

                <div>
                    <p className="text-center text-[10px] font-semibold
                 uppercase tracking-[0.18em]
                 text-on-surface-variant">
                        What&apos;s Next
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                        <Button type="button" variant="outline" onClick={onViewOrder}>
                            View Order Details
                        </Button>
                        <Button type="button" variant="outline" onClick={onTrackOrder}>
                            Track Your Order
                        </Button>
                        <Button type="button" variant="ghost" onClick={onContinueShopping}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
