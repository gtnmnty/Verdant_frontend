"use client";

import {useEffect, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {gqlRequest} from "@/utils/graphqlClient";

// Step 2 of a self-service email change: the code mailed to the new address.
export const CONFIRM_EMAIL_CHANGE_MUTATION = `
    mutation ConfirmEmailChange($code: String!) {
        confirmEmailChange(code: $code) {
            id
            email
            pendingEmail
        }
    }
`;

// True when the typed email really differs from the saved one.
// Mirrors the backend, which ignores case and surrounding spaces.
export function isEmailChanged(current: string, typed: string) {
    return typed.trim().toLowerCase() !== current.trim().toLowerCase();
}

interface ConfirmEmailChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pendingEmail: string;
    // Called with the new address once the backend has swapped it in.
    onConfirmed: (newEmail: string) => void;
    // Lets the admin settings page keep its own button colours.
    submitClassName?: string;
}

export function ConfirmEmailChangeDialog({
    open,
    onOpenChange,
    pendingEmail,
    onConfirmed,
    submitClassName,
}: ConfirmEmailChangeDialogProps) {
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Start empty each time the dialog opens, so an old attempt isn't resubmitted.
    useEffect(() => {
        if (open) setCode("");
    }, [open]);

    const submit = async (e: SubmitEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await gqlRequest<{ confirmEmailChange: { email: string } }>(
                CONFIRM_EMAIL_CHANGE_MUTATION,
                {code},
            );
            onConfirmed(res.confirmEmailChange.email);
            onOpenChange(false);
            toast.success("Your email address has been updated.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to confirm your email.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Your New Email</DialogTitle>
                    <DialogDescription>
                        We sent a 6-digit code to <span className="font-semibold">{pendingEmail}</span>.
                        Your current email stays active until you enter it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="email-change-code">Verification Code</Label>
                        <Input
                            id="email-change-code"
                            value={code}
                            // Digits only, capped at the code length.
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="000000"
                            className="text-center text-lg tracking-[0.4em]"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            The code expires in 15 minutes. If it doesn&apos;t arrive, change your email
                            again to get a new one.
                        </p>
                    </div>
                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Later
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || code.length !== 6}
                            className={submitClassName}
                        >
                            {submitting ? "Confirming…" : "Confirm Email"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
