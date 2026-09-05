"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {gqlRequest} from "@/utils/graphqlClient";
import {CartItemRow} from "@/app/(site)/cart/_components/CartItemRow";
import {CartSummary} from "@/app/(site)/cart/_components/CartSummary";
import {RecommendedProducts} from "@/app/(site)/cart/_components/RecommendedProducts";
import {EmptyCart} from "@/app/(site)/cart/_components/EmptyCart";
import {
    BASE_SHIPPING_FEE,
    DELIVERY_OPTION_FEES,
    FREE_SHIPPING_THRESHOLD,
    GIFT_PACKAGING_FEE,
    RECOMMENDED_PRODUCTS,
    TAX_RATE,
    type CartProduct,
    type DeliveryOption,
    type RecommendedProduct,
} from "@/app/(site)/cart/_components/data";

// --- backend <-> frontend delivery option mapping ---
// Backend enum (common.graphql): STANDARD | EXPRESS | SAME_DAY
const DELIVERY_TO_BACKEND: Record<DeliveryOption, string> = {
    standard: "STANDARD",
    express: "EXPRESS",
    "next-day": "SAME_DAY",
};

const DELIVERY_FROM_BACKEND: Record<string, DeliveryOption> = {
    STANDARD: "standard",
    EXPRESS: "express",
    SAME_DAY: "next-day",
};

const ITEM_CATALOG_LABELS: Record<string, string> = {
    SKIN_CARE: "Skin Care",
    HAIR_CARE: "Hair Care",
    MAKE_UP: "Make Up",
};

interface BackendProductSummary {
    id: string;
    name: string | null;
    itemCatalog: string | null;
    price: number;
    salePrice: number | null;
    image: string | null;
    isFavorite: boolean;
}

interface BackendCartItem {
    id: string;
    product: BackendProductSummary;
    quantity: number;
    deliveryOption: string;
}

interface BackendCart {
    items: BackendCartItem[];
    totalItems: number;
    subtotal: number;
}

const CART_FIELDS = `
    items {
        id
        quantity
        deliveryOption
        product {
            id
            name
            itemCatalog
            price
            salePrice
            image
            isFavorite
        }
    }
    totalItems
    subtotal
`;

const MY_CART_QUERY = `
    query MyCart {
        myCart {
            ${CART_FIELDS}
        }
    }
`;

const ADD_TO_CART_MUTATION = `
    mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) {
            ${CART_FIELDS}
        }
    }
`;

const UPDATE_QUANTITY_MUTATION = `
    mutation UpdateCartItemQuantity($input: UpdateQuantityInput!) {
        updateCartItemQuantity(input: $input) {
            ${CART_FIELDS}
        }
    }
`;

const UPDATE_DELIVERY_MUTATION = `
    mutation UpdateCartItemDeliveryOption($input: UpdateDeliveryOptionInput!) {
        updateCartItemDeliveryOption(input: $input) {
            ${CART_FIELDS}
        }
    }
`;

const REMOVE_ITEMS_MUTATION = `
    mutation RemoveCartItems($input: RemoveCartItemsInput!) {
        removeCartItems(input: $input) {
            ${CART_FIELDS}
        }
    }
`;

// `selected` is a frontend-only concept (used to scope checkout) — the
// backend cart doesn't track it, so new/refetched items default to selected.
function toCartProduct(item: BackendCartItem, previouslySelected: Record<string, boolean>): CartProduct {
    const price = item.product.salePrice ?? item.product.price;
    return {
        id: item.id,
        name: item.product.name ?? "Untitled product",
        category: item.product.itemCatalog ? ITEM_CATALOG_LABELS[item.product.itemCatalog] ?? item.product.itemCatalog : "",
        description: "",
        price,
        image: item.product.image ?? "https://picsum.photos/seed/placeholder/400/400",
        quantity: item.quantity,
        deliveryOption: DELIVERY_FROM_BACKEND[item.deliveryOption] ?? "standard",
        selected: previouslySelected[item.id] ?? true,
    };
}

export function CartContent() {
    const router = useRouter();
    const [items, setItems] = useState<CartProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [giftPackaging, setGiftPackaging] = useState(false);

    function applyCart(cart: BackendCart, prevItems: CartProduct[] = items) {
        const previouslySelected = Object.fromEntries(prevItems.map((i) => [i.id, i.selected]));
        setItems(cart.items.map((item) => toCartProduct(item, previouslySelected)));
    }

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ myCart: BackendCart }>(MY_CART_QUERY)
            .then((res) => {
                if (cancelled) return;
                applyCart(res.myCart, []);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load your bag.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);

    const allSelected = items.length > 0 && selectedItems.length === items.length;
    const someSelected = selectedItems.length > 0 && !allSelected;

    const subtotal = useMemo(
        () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [selectedItems],
    );

    // The fastest delivery option chosen among selected items drives the fee.
    const deliverySurcharge = useMemo(
        () =>
            selectedItems.reduce(
                (max, item) => Math.max(max, DELIVERY_OPTION_FEES[item.deliveryOption]),
                0,
            ),
        [selectedItems],
    );

    const shipping =
        selectedItems.length === 0
            ? 0
            : deliverySurcharge + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE);

    const tax = subtotal * TAX_RATE;
    const giftFee = giftPackaging ? GIFT_PACKAGING_FEE : 0;
    const total = subtotal + shipping + tax + giftFee;

    function toggleSelectAll() {
        const nextValue = !allSelected;
        setItems((prev) => prev.map((item) => ({...item, selected: nextValue})));
    }

    function toggleItemSelect(id: string) {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? {...item, selected: !item.selected} : item)),
        );
    }

    function updateQuantity(id: string, quantity: number) {
        const prevItems = items;
        setItems((prev) => prev.map((item) => (item.id === id ? {...item, quantity} : item)));

        gqlRequest<{ updateCartItemQuantity: BackendCart }>(UPDATE_QUANTITY_MUTATION, {
            input: {cartItemId: id, quantity},
        })
            .then((res) => applyCart(res.updateCartItemQuantity, prevItems))
            .catch((err) => {
                setItems(prevItems);
                toast.error(err instanceof Error ? err.message : "Failed to update quantity.");
            });
    }

    function updateDelivery(id: string, deliveryOption: DeliveryOption) {
        const prevItems = items;
        setItems((prev) =>
            prev.map((item) => (item.id === id ? {...item, deliveryOption} : item)),
        );

        gqlRequest<{ updateCartItemDeliveryOption: BackendCart }>(UPDATE_DELIVERY_MUTATION, {
            input: {cartItemId: id, deliveryOption: DELIVERY_TO_BACKEND[deliveryOption]},
        })
            .then((res) => applyCart(res.updateCartItemDeliveryOption, prevItems))
            .catch((err) => {
                setItems(prevItems);
                toast.error(err instanceof Error ? err.message : "Failed to update delivery option.");
            });
    }

    function removeItem(id: string) {
        const prevItems = items;
        const removed = items.find((item) => item.id === id);
        setItems((prev) => prev.filter((item) => item.id !== id));

        gqlRequest<{ removeCartItems: BackendCart }>(REMOVE_ITEMS_MUTATION, {
            input: {cartItemIds: [id]},
        })
            .then((res) => {
                applyCart(res.removeCartItems, prevItems.filter((item) => item.id !== id));
                if (removed) toast.success(`${removed.name} removed from your bag.`);
            })
            .catch((err) => {
                setItems(prevItems);
                toast.error(err instanceof Error ? err.message : "Failed to remove item.");
            });
    }

    function addRecommendedToCart(product: RecommendedProduct) {
        const prevItems = items;

        gqlRequest<{ addToCart: BackendCart }>(ADD_TO_CART_MUTATION, {
            input: {productId: product.id, quantity: 1, deliveryOption: "STANDARD"},
        })
            .then((res) => {
                applyCart(res.addToCart, prevItems);
                toast.success(`${product.name} added to your bag.`);
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to add item to bag.");
            });
    }

    function handleCheckout() {
        if (selectedItems.length === 0) return;
        // Hand the selected cart item ids to the checkout flow.
        sessionStorage.setItem(
            "verdant-luxe-checkout-items",
            JSON.stringify(selectedItems.map((item) => item.id)),
        );
        router.push("/checkout");
    }

    return (
        <div className="mx-auto w-[min(92vw,1400px)] pb-24">
            <div className="max-w-2xl">
                <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)]
                 leading-tight text-primary">
                    Your Shopping Bag
                </h1>
                <p className="mt-3 text-sm text-on-surface-variant sm:text-base">
                    Refined selections for your boutique ritual. Review your items
                    before proceeding to secure checkout.
                </p>
            </div>

            {loading ? (
                <p className="mt-10 text-center text-sm text-on-surface-variant py-12">
                    Loading your bag…
                </p>
            ) : items.length === 0 ? (
                <div className="mt-10">
                    <EmptyCart/>
                </div>
            ) : (
                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]
                 lg:items-start lg:gap-10">
                    <div className="min-w-0">
                        <div
                            className="flex flex-wrap items-center justify-between
                            gap-3 border-b border-blush/40 pb-4">
                            <label
                                className="flex items-center gap-2.5 text-xs
                                font-semibold uppercase tracking-[0.14em]
                                text-on-surface-variant">
                                <Checkbox
                                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label={allSelected ? "Deselect all items" : "Select all items"}
                                />
                                {allSelected ? "Deselect All" : "Select All"}
                            </label>
                            <span className="text-xs text-on-surface-variant">
                                {selectedItems.length} of {items.length} selected
                            </span>
                        </div>

                        <ul>
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onToggleSelect={toggleItemSelect}
                                    onQuantityChange={updateQuantity}
                                    onDeliveryChange={updateDelivery}
                                    onRemove={removeItem}
                                />
                            ))}
                        </ul>

                        <div
                            className="mt-6 flex flex-col gap-3 rounded-xl
                                            bg-surface-low p-5 sm:flex-row
                                            sm:items-center sm:justify-between">
                            <p className="text-sm text-on-surface-variant">
                                {selectedItems.length > 0
                                    ? `${selectedItems.length} item${
                                        selectedItems.length > 1 ? "s" : ""
                                    } selected · $${subtotal.toFixed(2)}`
                                    : "Select items above to check out."}
                            </p>
                            <Button
                                type="button"
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                                variant="outline"
                                className="border-primary uppercase tracking-[0.14em]
                                                text-primary hover:bg-primary
                                                hover:text-primary-foreground"
                            >
                                Checkout Selected
                            </Button>
                        </div>
                    </div>

                    <CartSummary
                        subtotal={subtotal}
                        shipping={shipping}
                        tax={tax}
                        giftPackaging={giftPackaging}
                        giftPackagingFee={GIFT_PACKAGING_FEE}
                        total={total}
                        selectedCount={selectedItems.length}
                        onGiftPackagingChange={setGiftPackaging}
                        onCheckout={handleCheckout}
                    />
                </div>
            )}

            <RecommendedProducts products={RECOMMENDED_PRODUCTS} onAddToCart={addRecommendedToCart}/>
        </div>
    );
}
