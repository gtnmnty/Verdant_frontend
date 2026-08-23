"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TermsDialog({children}: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Terms &amp; Conditions</DialogTitle>
                    <DialogDescription>
                        Please review how Verdant Luxe handles your membership.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant">
                    <p>
                        By creating a Verdant Luxe account you agree to receive booking
                        confirmations, order updates, and occasional editorial content by
                        email. You can unsubscribe from marketing messages at any time.
                    </p>
                    <p>
                        Appointments cancelled with less than 24 hours&rsquo; notice may
                        be subject to a fee. Gift cards and promotional credits are
                        non-transferable and have no cash value.
                    </p>
                    <p>
                        We respect your privacy — your personal information is never sold
                        to third parties and is only used to deliver and improve your
                        Verdant Luxe experience.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
