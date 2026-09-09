"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";
import {toast} from "sonner";
import {Pencil, Star, Trash2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {
    DetailHeader,
    DetailGrid,
    DetailCard,
    FieldRow,
} from "@/app/admin/_components/Detail";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {EmptyState} from "@/app/admin/_components/EmptyState";
import {ProductFormDialog} from "@/app/admin/products/_components/ProductFormDialog";
import {PriceDisplay, toAdminProduct} from "@/app/admin/products/_components/ProductsContent";
import {gqlRequest} from "@/utils/graphqlClient";
import type {AdminProduct} from "@/app/admin/products/_components/types";

const ADMIN_PRODUCT_DETAIL_QUERY = `
    query AdminProductDetail($id: ID!) {
        adminProductDetail(id: $id) {
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
    }
`;

const UPDATE_PRODUCT_STATUS_MUTATION = `
    mutation ToggleProductStatus($input: UpdateProductInput!) {
        updateProduct(input: $input) { id status }
    }
`;

const DELETE_PRODUCT_MUTATION = `
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
    }
`;

export function ProductDetailContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<AdminProduct | null | undefined>(undefined);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const fetchProduct = () => {
        gqlRequest<{ adminProductDetail: Parameters<typeof toAdminProduct>[0] | null }>(
            ADMIN_PRODUCT_DETAIL_QUERY,
            {id: params.id},
        )
            .then((res) =>
                setProduct(res.adminProductDetail ? toAdminProduct(res.adminProductDetail) : null))
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to load product.");
                setProduct(null);
            });
    };

    useEffect(fetchProduct, [params.id]);

    if (product === undefined) {
        return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
    }

    if (!product) {
        return (
            <EmptyState
                title="Product not found"
                description="It may have been removed. Return to the products list."
                action={
                    <Button onClick={() => router.push("/admin/products")}>
                        Back to Products
                    </Button>
                }
            />
        );
    }

    const toggleStatus = () => {
        gqlRequest(UPDATE_PRODUCT_STATUS_MUTATION, {
            input: {id: product.id, status: product.status === "active" ? "INACTIVE" : "ACTIVE"},
        })
            .then(() => fetchProduct())
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update status."));
    };

    const handleDelete = () => {
        gqlRequest(DELETE_PRODUCT_MUTATION, {id: product.id})
            .then(() => {
                toast.success("Product deleted.");
                router.push("/admin/products");
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to delete product."));
    };

    return (
        <div>
            <DetailHeader
                backHref="/admin/products"
                backLabel="Back to Products"
                title={product.name}
                subtitle={product.sku}
                status={<StatusBadge status={product.status}/>}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setEditOpen(true)}
                            className="border-admin-line"
                        >
                            <Pencil className="mr-1.5 size-4"/> Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(true)}
                            className="border-admin-line text-admin-rose
                            hover:text-admin-rose"
                        >
                            <Trash2 className="mr-1.5 size-4"/> Delete
                        </Button>
                    </>
                }
            />

            <DetailGrid>
                <div className="space-y-4">
                    <DetailCard>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {product.images.length > 0 ? (
                                product.images.map((src, i) => (
                                    <div
                                        key={i}
                                        className={`relative aspect-square overflow-hidden 
                                                    rounded-xl bg-admin-cream ${
                                            i === 0 ? "ring-2 ring-admin-sidebar" : ""
                                        }`}
                                    >
                                        <Image
                                            src={src}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 45vw, 200px"
                                            className="object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="relative aspect-square overflow-hidden
                                    rounded-xl bg-admin-cream sm:col-span-2"/>
                            )}
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-admin-muted">
                            {product.description}
                        </p>

                        {product.badge || product.tags.length ? (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {product.badge ? (
                                    <Badge className="bg-admin-amber/25
                                           text-admin-ink
                                           hover:bg-admin-amber/25">
                                        {product.badge}
                                    </Badge>
                                ) : null}
                                {product.tags.map((t) => (
                                    <Badge
                                        key={t}
                                        variant="outline"
                                        className="border-admin-line text-admin-muted"
                                    >
                                        #{t}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}

                        {product.info.length > 0 ? (
                            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                                {product.info.map((i) => (
                                    <li key={i} className="text-sm text-admin-muted">
                                        ✦ {i}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </DetailCard>

                    <DetailCard title="Rating">
                        <div className="flex items-center gap-2">
                            <Star className="size-4 fill-admin-amber text-admin-amber"/>
                            <span className="text-sm font-medium">
                {product.averageRating.toFixed(1)}
              </span>
                            <span className="text-sm text-admin-muted">
                ({product.reviewCount} reviews)
              </span>
                        </div>
                    </DetailCard>
                </div>

                <div className="space-y-4">
                    <DetailCard title="Pricing">
                        <PriceDisplay price={product.price} salePrice={product.salePrice} size="lg"/>
                    </DetailCard>

                    <DetailCard title="Details">
                        <dl>
                            <FieldRow label="Category" value={product.category}/>
                            <FieldRow label="SKU" value={product.sku}/>
                            <FieldRow
                                label="Stock"
                                value={`${product.stock} (low at ${product.lowStockThreshold})`}
                            />
                            <FieldRow label="Featured" value={product.isFeatured ? "Yes" : "No"}/>
                            <FieldRow
                                label="Created"
                                value={product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                            />
                            <FieldRow
                                label="Updated"
                                value={product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—"}
                            />
                        </dl>
                    </DetailCard>

                    <DetailCard title="Visibility">
                        <label className="flex items-center justify-between">
                            <span className="text-sm">Active on storefront</span>
                            <Switch
                                checked={product.status === "active"}
                                onCheckedChange={toggleStatus}
                            />
                        </label>
                    </DetailCard>
                </div>
            </DetailGrid>

            <ProductFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                product={product}
                onSaved={fetchProduct}
            />
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this product?"
                description={`"${product.name}" will be permanently removed from inventory.`}
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </div>
    );
}
