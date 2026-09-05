"use client";

import Image from "next/image";
import {Trash2} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {QuantityStepper} from "@/app/(site)/cart/_components/QuantityStepper";
import {
    DELIVERY_OPTION_LABELS,
    type CartProduct,
    type DeliveryOption,
} from "@/app/(site)/cart/_components/data";

interface CartItemRowProps {
    item: CartProduct;
    onToggleSelect: (id: string) => void;
    onQuantityChange: (id: string, quantity: number) => void;
    onDeliveryChange: (id: string, option: DeliveryOption) => void;
    onRemove: (id: string) => void;
}

const DELIVERY_OPTIONS = Object.keys(DELIVERY_OPTION_LABELS) as DeliveryOption[];

export function CartItemRow({
    item,
    onToggleSelect,
    onQuantityChange,
    onDeliveryChange,
    onRemove,
}: CartItemRowProps) {
    return (
        <li
            className={`flex flex-wrap items-start gap-3 
            border-b border-blush/40 py-6 last:border-b-0 
            sm:flex-nowrap sm:gap-4 ${
                item.selected ? "" : "opacity-60"
            }`}
        >
            <Checkbox
                checked={item.selected}
                onCheckedChange={() => onToggleSelect(item.id)}
                aria-label={`Select ${item.name}`}
                className="mt-1 shrink-0"
            />

            <div className="relative h-16 w-16 shrink-0 overflow-hidden
                 rounded-lg bg-surface-low sm:h-28 sm:w-28">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 64px, 112px"
                    className="object-cover"
                />
            </div>

            <div className="min-w-35 flex-1 basis-40">
                <div className="flex flex-wrap items-start justify-between
                 gap-x-3 gap-y-1">
                    <div className="min-w-0">
                        <h3 className="truncate font-display text-base
                 text-on-surface sm:text-lg">
                            {item.name}
                        </h3>
                        <p className="mt-1 text-[10px] font-semibold uppercase
                 tracking-[0.18em] text-soft-rose">
                            {item.category}
                        </p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-sm
                 font-medium text-on-surface sm:text-base">
                        ${item.price.toFixed(2)}
                    </p>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                    {item.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <QuantityStepper
                        quantity={item.quantity}
                        onChange={(quantity) => onQuantityChange(item.id, quantity)}
                    />

                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex items-center gap-1.5 text-xs
                            font-semibold uppercase tracking-widest
                            text-on-surface-variant transition-colors
                            hover:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5"/>
                        Remove
                    </button>

                    <Select
                        value={item.deliveryOption}
                        onValueChange={(value) => onDeliveryChange(item.id, value as DeliveryOption)}
                    >
                        <SelectTrigger className="h-8 w-auto min-w-0 gap-1.5 border-none
                                       bg-transparent px-0 text-xs font-medium
                                       uppercase tracking-[0.08em]
                                       text-on-surface-variant shadow-none
                                       hover:text-primary focus:ring-0
                                       focus:ring-offset-0">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent align="end">
                            {DELIVERY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {DELIVERY_OPTION_LABELS[option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </li>
    );
}
