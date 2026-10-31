"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Download, Loader2, MessageCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {gqlRequest} from "@/utils/graphqlClient";
import type {TrackItem} from "@/app/(site)/tracking/[id]/_components/data";

const ADD_TO_CART_MUTATION = `
    mutation TrackingBuyAgain($input: AddToCartInput!) {
        addToCart(input: $input) { totalItems }
    }
`;

// Contact Concierge and Download Invoice have no backend counterpart yet (no
// support-ticket endpoint, no invoice/PDF generation) and stay as toasts.
// Buy Again re-adds every item with its original quantity and delivery option.
export function TrackingActions({items}: { items: TrackItem[] }) {
    const router = useRouter();
    const [adding, setAdding] = useState(false);

    const buyAgain = async () => {
        const available = items.filter((i) => i.productId);
        if (available.length === 0) {
            toast.error("These items are no longer available.");
            return;
        }

        setAdding(true);
        const failed: string[] = [];
        // One at a time: two lines with the same product + delivery option merge into one cart row,
        // and parallel adds could race on that merge.
        for (const item of available) {
            try {
                await gqlRequest(ADD_TO_CART_MUTATION, {
                    input: {productId: item.productId, quantity: item.qty, deliveryOption: item.deliveryOption},
                });
            } catch (err) {
                failed.push(`${item.name}: ${err instanceof Error ? err.message : "failed"}`);
            }
        }
        setAdding(false);

        const unavailable = items.length - available.length;
        const added = available.length - failed.length;
        if (added > 0) {
            toast.success(`${added} item${added === 1 ? "" : "s"} added to cart.`, {
                action: {label: "View cart", onClick: () => router.push("/cart")},
            });
        }
        if (failed.length > 0) {
            toast.error(`Couldn't add ${failed.length} item${failed.length === 1 ? "" : "s"}.`, {
                description: failed.join("\n"),
            });
        }
        if (unavailable > 0) {
            toast.warning(`${unavailable} item${unavailable === 1 ? " is" : "s are"} no longer available.`);
        }
    };

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
            <Button onClick={buyAgain} disabled={adding}>
                {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Buy Again
            </Button>
        </section>
    );
}
