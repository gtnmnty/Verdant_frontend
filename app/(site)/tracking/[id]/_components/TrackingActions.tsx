"use client";

import {toast} from "sonner";
import {Download, MessageCircle} from "lucide-react";
import {Button} from "@/components/ui/button";

// None of these actions have a backend counterpart yet (no support-ticket
// concierge endpoint, no invoice/PDF generation, and "Buy Again" would need
// a way to re-add every order item to the cart in one call) — all three
// stay as frontend-only toasts for now.
export function TrackingActions() {
    return (
        <section className="mt-10 flex flex-wrap justify-end gap-3">
            <Button
                variant="outline"
                onClick={() => toast.success("A concierge will reach out shortly.")}
                className="border-primary text-primary hover:bg-primary
                        hover:text-primary-foreground"
            >
                <MessageCircle className="mr-2 h-4 w-4"/> Contact Concierge
            </Button>
            <Button
                onClick={() => toast.success("Invoice downloaded.")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary
                        hover:text-primary-foreground"
            >
                <Download className="mr-2 h-4 w-4"/> Download Invoice
            </Button>
            <Button onClick={() => toast.success("Items re-added to cart.")}>
                Buy Again
            </Button>
        </section>
    );
}