"use client";

import {useState} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {Download, Truck, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {Order} from "@/app/(site)/orders/_components/data";
import {CancelOrderDialog} from "@/app/(site)/orders/[id]/_components/CancelOrderDialog";

interface OrderDetailsFooterProps {
    order: Order;
    // Server-computed (Order.cancellable): the customer's own, paid order that hasn't shipped.
    cancellable: boolean;
    cardRefund: number;
    walletRefund: number;
    onCancelled: () => void;
}

export function OrderDetailsFooter({order, cancellable, cardRefund, walletRefund, onCancelled}: OrderDetailsFooterProps) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const trackable = order.orderStatus !== "CANCELLED";

    return (
        <footer className="mt-8 flex flex-wrap items-center justify-end
                 gap-3 border-t border-blush/40 pt-6">
            {cancellable && (
                <Button variant="outline" className="border-primary text-primary"
                        onClick={() => setCancelOpen(true)}>
                    <XCircle className="mr-1.5 h-4 w-4"/> Cancel Order
                </Button>
            )}
            {trackable && (
                <Button asChild variant="outline" className="border-primary text-primary">
                    <Link href={`/tracking/${order.id}`}>
                        <Truck className="mr-1.5 h-4 w-4"/> Track Package
                    </Link>
                </Button>
            )}
            <Button onClick={() => toast.success(`Invoice ${order.orderCode}.pdf downloaded.`)}>
                <Download className="mr-1.5 h-4 w-4"/> Invoice
            </Button>

            {cancellable && (
                <CancelOrderDialog
                    open={cancelOpen}
                    onOpenChange={setCancelOpen}
                    orderId={order.id}
                    orderCode={order.orderCode}
                    cardRefund={cardRefund}
                    walletRefund={walletRefund}
                    onCancelled={onCancelled}
                />
            )}
        </footer>
    );
}
