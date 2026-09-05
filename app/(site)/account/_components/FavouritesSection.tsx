"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {toast} from "sonner";
import {Heart, Search, ShoppingCart, Trash2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {gqlRequest} from "@/utils/graphqlClient";
import {EmptyBlock, PageIntro, SectionTitle} from "@/app/(site)/account/_components/shared";

type FavKind = "Service" | "Product";

interface Fav {
    id: string;
    name: string;
    kind: FavKind;
    price: number;
    image: string;
    category: string;
}

interface BackendCatalogItem {
    __typename: "SalonService" | "Product";
    id: string;
    name: string;
    catalog: string;
    price: number;
    primaryImage: {url: string} | null;
}

const CATEGORY_LABELS: Record<string, string> = {
    SKIN_CARE: "Skincare",
    HAIR_CARE: "Haircare",
    MAKE_UP: "Makeup",
};

const FAVORITES_QUERY = `
    query MyFavourites {
        serviceFavorites(first: 50) {
            items {
                __typename
                id
                name
                catalog
                price
                ... on SalonService { primaryImage { url } }
            }
        }
        productFavorites(first: 50) {
            items {
                __typename
                id
                name
                catalog
                price
                ... on Product { primaryImage { url } }
            }
        }
    }
`;

const TOGGLE_FAVORITE_SERVICE_MUTATION = `
    mutation ToggleFavoriteService($targetId: ID!) {
        toggleFavoriteService(targetId: $targetId) { id }
    }
`;

const TOGGLE_FAVORITE_PRODUCT_MUTATION = `
    mutation ToggleFavoriteProduct($targetId: ID!) {
        toggleFavoriteProduct(targetId: $targetId) { id }
    }
`;

const ADD_TO_CART_MUTATION = `
    mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) { items { id } }
    }
`;

const FALLBACK_IMAGE = "https://picsum.photos/seed/favourite/600/450";

function toFav(item: BackendCatalogItem): Fav {
    return {
        id: item.id,
        name: item.name,
        kind: item.__typename === "SalonService" ? "Service" : "Product",
        price: item.price,
        image: item.primaryImage?.url ?? FALLBACK_IMAGE,
        category: CATEGORY_LABELS[item.catalog] ?? item.catalog,
    };
}

export function FavouritesSection() {
    const [favs, setFavs] = useState<Fav[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState<"all" | FavKind>("all");
    const [removeId, setRemoveId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{
            serviceFavorites: {items: BackendCatalogItem[]};
            productFavorites: {items: BackendCatalogItem[]};
        }>(FAVORITES_QUERY)
            .then((res) => {
                if (cancelled) return;
                setFavs([
                    ...res.serviceFavorites.items.map(toFav),
                    ...res.productFavorites.items.map(toFav),
                ]);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load favourites.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filtered = favs.filter(
        (f) =>
            (kind === "all" || f.kind === kind) &&
            (query === "" ||
                f.name.toLowerCase().includes(query.toLowerCase()) ||
                f.category.toLowerCase().includes(query.toLowerCase())),
    );
    const services = filtered.filter((f) => f.kind === "Service");
    const products = filtered.filter((f) => f.kind === "Product");

    const remove = () => {
        if (!removeId) return;
        const target = favs.find((f) => f.id === removeId);
        if (!target) return;

        const prevFavs = favs;
        setFavs((p) => p.filter((f) => f.id !== removeId));
        setRemoveId(null);

        const mutation = target.kind === "Service" ? TOGGLE_FAVORITE_SERVICE_MUTATION : TOGGLE_FAVORITE_PRODUCT_MUTATION;
        gqlRequest(mutation, {targetId: target.id})
            .then(() => toast.success("Removed from favourites."))
            .catch((err) => {
                setFavs(prevFavs);
                toast.error(err instanceof Error ? err.message : "Failed to remove favourite.");
            });
    };

    const addProductToCart = (f: Fav) => {
        gqlRequest(ADD_TO_CART_MUTATION, {
            input: {productId: f.id, quantity: 1, deliveryOption: "STANDARD"},
        })
            .then(() => toast.success(`${f.name} added to cart.`))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to add to cart."));
    };

    if (loading) {
        return (
            <div className="space-y-10">
                <PageIntro title="Favourites" subtitle="Your curated collection
                of beloved rituals and products."/>
                <p className="text-sm text-on-surface-variant">Loading favourites…</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <PageIntro title="Favourites" subtitle="Your curated
            collection of beloved rituals and products."/>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-45 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4
                 -translate-y-1/2 text-on-surface-variant"/>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search favourites"
                        className="w-full pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "Service", "Product"] as const).map((k) => (
                        <button
                            key={k}
                            onClick={() => setKind(k)}
                            className={`rounded-full border px-4 py-2 text-xs 
                            font-semibold uppercase tracking-[0.16em] 
                            transition-colors ${
                                kind === k
                                    ? "border-primary bg-primary " +
                                    "text-primary-foreground"
                                    : "border-blush/60 text-on-surface-variant " +
                                    "hover:text-primary"
                            }`}
                        >
                            {k === "all" ? "All" : `${k}s`}
                        </button>
                    ))}
                </div>
            </div>

            {favs.length === 0 ? (
                <EmptyBlock icon={Heart} title="No favourites yet"
                            body="Tap the heart on any service or product
                            to save it here." cta="Discover Services"/>
            ) : filtered.length === 0 ? (
                <EmptyBlock icon={Search} title="Nothing matches"
                            body="Try a different keyword or filter."/>
            ) : (
                <>
                    {services.length > 0 && (kind === "all" || kind === "Service") && (
                        <div>
                            <SectionTitle title="Saved Services"/>
                            <FavGrid
                                items={services}
                                onRemove={(id) => setRemoveId(id)}
                                actionLabel="Book Again"
                                onAction={(f) => toast.success(
                                    `Head over to book "${f.name}" again.`
                                )}
                            />
                        </div>
                    )}
                    {products.length > 0 && (kind === "all" || kind === "Product") && (
                        <div>
                            <SectionTitle title="Saved Products"/>
                            <FavGrid
                                items={products}
                                onRemove={(id) => setRemoveId(id)}
                                actionLabel="Add to Cart"
                                onAction={addProductToCart}
                                icon={ShoppingCart}
                            />
                        </div>
                    )}
                </>
            )}

            <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove from favourites?</AlertDialogTitle>
                        <AlertDialogDescription>You can always add it back later.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function FavGrid({
     items, onRemove, actionLabel, onAction, icon: Icon
}: {
    items: Fav[];
    onRemove: (id: string) => void;
    actionLabel: string;
    onAction: (f: Fav) => void;
    icon?: typeof ShoppingCart;
}) {
    return (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((f) => (
                <li key={f.id} className="group overflow-hidden
                    rounded-2xl border
                    border-blush/50 bg-surface-lowest">
                    <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                            src={f.image}
                            alt={f.name}
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                            className="object-cover transition-transform
                            duration-500 group-hover:scale-105"
                        />
                        <button
                            onClick={() => onRemove(f.id)}
                            aria-label="Remove"
                            className="absolute right-3 top-3 grid h-9 w-9
                                            place-items-center rounded-full bg-white/95
                                            text-soft-rose shadow hover:text-primary"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </button>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] uppercase tracking-[0.18em]
                            text-on-surface-variant">
                            {f.category} · {f.kind}
                        </p>
                        <h3 className="mt-2 font-display text-lg text-primary">{f.name}</h3>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm">${f.price.toFixed(2)}</p>
                            <Button size="sm" onClick={() => onAction(f)}>
                                {Icon && <Icon className="mr-1.5 h-3.5 w-3.5"/>}
                                {actionLabel}
                            </Button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}