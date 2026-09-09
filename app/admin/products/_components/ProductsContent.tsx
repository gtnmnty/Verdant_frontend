"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Download, Plus, RefreshCw, Search} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {DataTable, type Column} from "@/app/admin/_components/DataTable";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {ProductFormDialog} from "@/app/admin/products/_components/ProductFormDialog";
import {gqlRequest} from "@/utils/graphqlClient";
import type {AdminProduct} from "@/app/admin/products/_components/types";

export function PriceDisplay({
     price,
     salePrice,
     size = "sm",
 }: {
    price: number;
    salePrice?: number | null;
    size?: "sm" | "lg";
}) {
    const large = size === "lg";

    if (salePrice) {
        return (
            <div className={large ? "flex items-baseline gap-2" : "text-sm"}>
        <span
            className={
                large
                    ? "font-display text-3xl font-semibold text-admin-rose"
                    : "font-semibold text-admin-rose"
            }
        >
          ${salePrice}
        </span>
                <span
                    className={
                        large
                            ? "text-base text-admin-muted line-through"
                            : "ml-1 text-xs text-admin-muted line-through"
                    }
                >
          ${price}
        </span>
            </div>
        );
    }

    return (
        <span className={large ? "font-display text-3xl font-semibold" : "font-semibold"}>
      ${price}
    </span>
    );
}

interface BackendAdminProductDto {
    id: string;
    name: string;
    category: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    sku: string | null;
    images: { url: string }[];
    tags: string[];
    info: string[];
    badge: string | null;
    isFeatured: boolean;
    status: "ACTIVE" | "INACTIVE";
    stockQuantity: number;
    lowStockThreshold: number;
    reviewCount: number;
    averageRating: number;
    createdAt: string | null;
    updatedAt: string | null;
}

interface AdminProductPage {
    items: BackendAdminProductDto[];
    totalItems: number;
}

const ADMIN_PRODUCTS_QUERY = `
    query AdminProducts(
        $category: String, 
        $search: String, 
        $status: CollectionStatus, 
        $page: Int, 
        $pageSize: Int
    ) {
        adminProducts(
            category: $category, 
            search: $search, 
            status: $status, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                name
                category
                description
                price
                salePrice
                sku
                images { url }
                tags
                info
                badge
                isFeatured
                status
                stockQuantity
                lowStockThreshold
                reviewCount
                averageRating
                createdAt
                updatedAt
            }
            totalItems
        }
    }
`;

const UPDATE_PRODUCT_STATUS_MUTATION = `
    mutation UpdateProductStatus($input: UpdateProductInput!) {
        updateProduct(input: $input) { id status }
    }
`;

const DELETE_PRODUCT_MUTATION = `
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
    }
`;

const DELETE_PRODUCTS_MUTATION = `
    mutation DeleteProducts($ids: [ID!]!) {
        deleteProducts(ids: $ids) { id }
    }
`;

export function toAdminProduct(p: BackendAdminProductDto): AdminProduct {
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description ?? "",
        price: p.price,
        salePrice: p.salePrice,
        sku: p.sku ?? "",
        images: p.images.map((i) => i.url),
        tags: p.tags,
        info: p.info,
        badge: p.badge,
        isFeatured: p.isFeatured,
        status: p.status === "ACTIVE" ? "active" : "inactive",
        stock: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        reviewCount: p.reviewCount,
        averageRating: p.averageRating,
        createdAt: p.createdAt ?? "",
        updatedAt: p.updatedAt ?? "",
    };
}

export function ProductsContent() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminProduct | null>(null);
    const [deleting, setDeleting] = useState<AdminProduct | null>(null);
    const [deletingIds, setDeletingIds] = useState<string[] | null>(null);

    const fetchProducts = () => {
        setLoading(true);
        gqlRequest<{ adminProducts: AdminProductPage }>(ADMIN_PRODUCTS_QUERY, {
            category: category === "all" ? undefined : category,
            search: search.trim() || undefined,
            status: status === "all" ? undefined : status === "active" ? "ACTIVE" : "INACTIVE",
            page: 1,
            pageSize: 100,
        })
            .then((res) => setProducts(res.adminProducts.items.map(toAdminProduct)))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load products."))
            .finally(() => setLoading(false));
    };

    useEffect(fetchProducts, [search, category, status]);

    const categories = useMemo(
        () => Array.from(new Set(products.map((p) => p.category))).sort(),
        [products],
    );

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (p: AdminProduct) => {
        setEditing(p);
        setFormOpen(true);
    };

    const toggleStatus = (p: AdminProduct) => {
        const nextStatus = p.status === "active" ? "INACTIVE" : "ACTIVE";
        gqlRequest(UPDATE_PRODUCT_STATUS_MUTATION, {input: {id: p.id, status: nextStatus}})
            .then(() => {
                toast.success("Status updated.");
                fetchProducts();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update status."));
    };

    const confirmDelete = () => {
        if (!deleting) return;
        gqlRequest(DELETE_PRODUCT_MUTATION, {id: deleting.id})
            .then(() => {
                toast.success("Product deleted.");
                setDeleting(null);
                fetchProducts();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete product."));
    };

    const confirmBulkDelete = () => {
        if (!deletingIds) return;
        gqlRequest(DELETE_PRODUCTS_MUTATION, {ids: deletingIds})
            .then(() => {
                toast.success(`Deleted ${deletingIds.length} products`);
                setDeletingIds(null);
                fetchProducts();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete products."));
    };

    const columns: Column<AdminProduct>[] = [
        {
            key: "name",
            header: "Product",
            sortable: true,
            sortValue: (p) => p.name,
            render: (p) => (
                <Link
                    href={`/admin/products/${p.id}`}
                    className="flex min-w-0 items-center gap-3 hover:underline"
                >
                    {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element -- thumbnail sourced from arbitrary uploaded URLs
                        <img
                            src={p.images[0]}
                            alt=""
                            className="size-10 shrink-0 rounded-md object-cover"
                        />
                    ) : (
                        <div
                            className="grid size-10 shrink-0
                            place-items-center
                            rounded-md bg-admin-cream
                            text-xs text-admin-muted">
                            IMG
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-admin-muted">{p.category}</p>
                    </div>
                </Link>
            ),
        },
        {
            key: "sku",
            header: "SKU",
            render: (p) => <span className="font-mono text-xs">{p.sku}</span>,
        },
        {
            key: "category",
            header: "Category",
            sortable: true,
            sortValue: (p) => p.category,
            render: (p) => <span className="text-sm">{p.category}</span>,
        },
        {
            key: "price",
            header: "Price",
            sortable: true,
            sortValue: (p) => p.salePrice ?? p.price,
            render: (p) => <PriceDisplay price={p.price} salePrice={p.salePrice}/>,
        },
        {
            key: "stock",
            header: "Stock",
            sortable: true,
            sortValue: (p) => p.stock,
            render: (p) => (
                <span className={p.stock <= p.lowStockThreshold ? "font-semibold text-admin-rose" : ""}>
          {p.stock}
        </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (p) => <StatusBadge status={p.status}/>,
        },
    ];

    return (
        <div>
            <PageHeader
                title="Products"
                description="Manage retail inventory across all branches."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="mr-1.5 size-4"/> Add Product
                    </Button>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-50 flex-1">
                    <Search
                        className="pointer-events-none
                        absolute left-3 top-1/2 size-4
                        -translate-y-1/2 text-admin-muted"/>
                    <Input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)}
                        placeholder="Search products…"
                        className="border-admin-line bg-admin-surface pl-9"
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-44 border-admin-line bg-admin-surface">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-36 border-admin-line bg-admin-surface">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProducts}
                    className="border-admin-line"
                >
                    <RefreshCw className="size-4"/>
                </Button>
                {/* No export endpoint on the backend — stays a demo toast. */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast("Exported CSV")}
                    className="border-admin-line"
                >
                    <Download className="size-4"/> Export
                </Button>
            </div>

            <DataTable
                rows={products}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No products found"}
                emptyDescription={loading ?
                    "Fetching products from the server." :
                    "Try a different search or add a new product."}
                bulkActions={(ids, clear) => (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-admin-rose"
                        onClick={() => {
                            setDeletingIds(ids as string[]);
                            clear();
                        }}
                    >
                        Delete selected
                    </Button>
                )}
                rowActions={(p) => [
                    {label: "Edit", onSelect: () => openEdit(p)},
                    {
                        label: p.status === "active" ? "Set inactive" : "Set active",
                        onSelect: () => toggleStatus(p),
                    },
                    {label: "Delete", onSelect: () => setDeleting(p), destructive: true},
                ]}
            />

            <ProductFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                product={editing}
                onSaved={fetchProducts}
            />
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
                title="Delete this product?"
                description={`"${deleting?.name}" will be permanently removed from inventory.`}
                confirmLabel="Delete"
                destructive
                onConfirm={confirmDelete}
            />
            <ConfirmDialog
                open={!!deletingIds}
                onOpenChange={(o) => !o && setDeletingIds(null)}
                title={`Delete ${deletingIds?.length ?? 0} products?`}
                confirmLabel="Delete"
                destructive
                onConfirm={confirmBulkDelete}
            />
        </div>
    );
}
