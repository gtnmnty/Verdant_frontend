import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";

export function EmptyCart() {
    return (
        <div className="flex flex-col items-center rounded-xl
                 bg-surface-low px-6 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center
                 rounded-full bg-surface-lowest text-primary">
                <ShoppingBag className="h-6 w-6"/>
            </div>
            <h2 className="mt-6 font-display text-2xl text-on-surface">
                Your bag is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
                Discover the rituals and tools our stylists reach for. Your next
                favorite is a click away.
            </p>
            <Button asChild className="mt-6 uppercase tracking-[0.14em]">
                <Link href="/collections">Shop Collections</Link>
            </Button>
        </div>
    );
}
