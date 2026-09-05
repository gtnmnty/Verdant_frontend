"use client";

import {toast} from "sonner";
import {Download, MessageCircle} from "lucide-react";
import {Button} from "@/components/ui/button";

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
