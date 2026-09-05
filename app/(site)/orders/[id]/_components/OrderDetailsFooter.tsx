"use client";

import Link from "next/link";
import {toast} from "sonner";
import {Download, Truck} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {Order} from "@/app/(site)/orders/_components/data";

export function OrderDetailsFooter({order}: { order: Order }) {
    const trackable = order.orderStatus === "IN_TRANSIT" || order.orderStatus === "PROCESSING"

    return (
        <footer className="mt-8 flex flex-wrap items-center justify-end
                 gap-3 border-t border-blush/40 pt-6">
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
        </footer>
    );
}
