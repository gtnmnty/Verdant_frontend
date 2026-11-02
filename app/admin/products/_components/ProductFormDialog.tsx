"use client";

import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ChipInput} from "@/app/admin/_components/ChipInput";
import {ImageUploader} from "@/app/admin/_components/ImageUploader";
import {gqlRequest} from "@/utils/graphqlClient";
import {apiRequest} from "@/utils/apiClient";
import {showSaveError} from "@/lib/admin/save-error";
import type {AdminProduct} from "@/app/admin/products/_components/types";
import {PRODUCT_CATEGORIES} from "@/app/admin/products/_components/categories";

const MAX_IMAGES = 4;
const isNewImage = (src: string) => src.startsWith("data:");

interface Draft {
    name: string;
    category: string;
    description: string;
    price: number;
    salePrice?: number;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    badges: string[]; // only badges[0] is sent — backend has a single `badge` field
    tags: string[];
    info: string[]; // quick infos: short sentences
    images: string[]; // saved image URLs plus newly picked ones as data: URLs (uploaded on save)
    primaryImage: number;
    status: "active" | "inactive";
    featured: boolean;
}

const EMPTY: Draft = {
    name: "",
    category: PRODUCT_CATEGORIES[0].value,
    description: "",
    price: 0,
    sku: "",
    stock: 0,
    lowStockThreshold: 5,
    badges: [],
    tags: [],
    info: [],
    images: [],
    primaryImage: 0,
    status: "active",
    featured: false,
};

function toDraft(p: AdminProduct): Draft {
    return {
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? undefined,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        badges: p.badge ? [p.badge] : [],
        tags: p.tags,
        info: p.info,
        images: p.images,
        primaryImage: 0,
        status: p.status,
        featured: p.isFeatured,
    };
}

const CREATE_PRODUCT_MUTATION = `
    mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) { id }
    }
`;

const UPDATE_PRODUCT_MUTATION = `
    mutation UpdateProduct($input: UpdateProductInput!) {
        updateProduct(input: $input) { id }
    }
`;

export function ProductFormDialog({
      open,
      onOpenChange,
      product,
      onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: AdminProduct | null;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<Draft>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setDraft(product ? toDraft(product) : EMPTY);
    }, [open, product]);

    const set =
        <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft((d) => ({...d, [key]: value}));

    const addImages = (urls: string[]) => {
        const next = [...draft.images, ...urls].slice(0, MAX_IMAGES);
        set("images", next);
    };

    const removeImage = (index: number) => {
        const next = draft.images.filter((_, i) => i !== index);
        set("images", next);
        set("primaryImage", Math.min(draft.primaryImage, Math.max(0, next.length - 1)));
    };

    // createProduct/updateProduct don't take image files, so images go through
    // /api/products/{id}/images (multipart -> Cloudinary -> media_images) after the product is saved:
    // remove the ones the admin dropped, upload the new ones, then mark the primary.
    const syncImages = async (productId: string) => {
        const base = `/api/products/${productId}/images`;
        const primarySrc = draft.images[draft.primaryImage] ?? draft.images[0];

        if (product) {
            for (let i = 0; i < product.images.length; i++) {
                if (!draft.images.includes(product.images[i])) {
                    await apiRequest(`${base}/${product.imageIds[i]}`, {method: "DELETE"});
                }
            }
        }

        for (const src of draft.images.filter(isNewImage)) {
            const blob = await (await fetch(src)).blob();
            const form = new FormData();
            form.append("files", new File([blob], `product.${blob.type.split("/")[1] || "jpg"}`, {type: blob.type}));
            form.append("isPrimary", String(src === primarySrc));
            await apiRequest(base, {method: "POST", body: form});
        }

        if (product && primarySrc && !isNewImage(primarySrc)) {
            const idx = product.images.indexOf(primarySrc);
            if (idx >= 0) await apiRequest(`${base}/${product.imageIds[idx]}/primary`, {method: "PATCH"});
        }
    };

    const handleSave = () => {
        if (!draft.name.trim()) return;
        if (!draft.sku.trim() && !product) {
            toast.error("SKU is required for a new product.");
            return;
        }

        const shared = {
            name: draft.name,
            category: draft.category,
            description: draft.description || undefined,
            price: draft.price,
            salePrice: draft.salePrice,
            badge: draft.badges[0] || undefined,
            tags: draft.tags,
            info: draft.info,
            stockQuantity: draft.stock,
            lowStockThreshold: draft.lowStockThreshold,
            isFeatured: draft.featured,
            status: draft.status === "active" ? "ACTIVE" : "INACTIVE",
        };

        // M-15: on edit, send stockQuantity only if the admin changed it. Orders keep moving stock while
        // this dialog is open, so re-sending the number loaded when it opened would undo those sales.
        // Leaving it out lets the backend keep the live value (Product is @DynamicUpdate).
        // undefined is dropped from the JSON body, so the field is simply absent.
        const updateInput = draft.stock !== product?.stock ? shared : {...shared, stockQuantity: undefined};

        setSaving(true);
        const request: Promise<unknown> = (product
            ? gqlRequest<{ updateProduct: { id: string } }>(UPDATE_PRODUCT_MUTATION, {input: {id: product.id, ...updateInput}})
                .then((r) => r.updateProduct.id)
            : gqlRequest<{ createProduct: { id: string } }>(CREATE_PRODUCT_MUTATION, {input: {...shared, sku: draft.sku}})
                .then((r) => r.createProduct.id)
        ).then(async (id) => {
            // The product itself is already saved here, so an image failure gets its own message and the
            // list still refreshes (the dialog closes and the product shows without the failed images).
            try {
                await syncImages(id);
            } catch (err) {
                toast.error(
                    `Product saved, but its images failed: ${err instanceof Error ? err.message : "upload error"}`,
                );
            }
        });

        request
            .then(() => {
                toast.success(product ? "Product updated." : "Product created.");
                onOpenChange(false);
                onSaved();
            })
            .catch((err) =>
                showSaveError(err, "Failed to save product.", () => {
                    onOpenChange(false);
                    onSaved();
                }))
            .finally(() => setSaving(false));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto p-6 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-5">
                    <div>
                        <Label>
                            Images ({draft.images.length}/{MAX_IMAGES})
                        </Label>
                        <div className="mt-1.5">
                            <ImageUploader
                                images={draft.images}
                                onChange={addImages}
                                max={MAX_IMAGES}
                            />
                        </div>
                        {draft.images.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {draft.images.map((src, i) => (
                                    <div
                                        key={i}
                                        className={`group relative overflow-hidden rounded-lg border-2 ${
                                            i === draft.primaryImage ? "border-admin-sidebar" : "border-admin-line"
                                        }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs */}
                                        <img src={src} alt="" className="size-24 object-cover"/>
                                        <div
                                            className="absolute inset-x-0 bottom-0 flex items-center
                                            justify-between
                                            bg-black/60 px-2 py-1
                                            text-[10px] text-white">
                                            <button
                                                type="button"
                                                onClick={() => set("primaryImage", i)}
                                                className="hover:underline"
                                            >
                                                {i === draft.primaryImage ? "Primary" : "Set primary"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="hover:text-admin-rose"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="p-name">Name</Label>
                            <Input
                                id="p-name"
                                value={draft.name}
                                onChange={(e) =>
                                    set("name", e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="p-sku">SKU</Label>
                            <Input
                                id="p-sku"
                                value={draft.sku}
                                disabled={!!product}
                                onChange={(e) =>
                                    set("sku", e.target.value)}
                                className="mt-1.5"
                            />
                            {product ? (
                                <p className="mt-1 text-[11px] text-admin-muted">SKU can not be changed after
                                    creation.</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Category</Label>
                            <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                                <SelectTrigger className="mt-1.5 w-full">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {PRODUCT_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={draft.status}
                                onValueChange={(v: "active" | "inactive") => set("status", v)}
                            >
                                <SelectTrigger className="mt-1.5 w-full">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                            <Label htmlFor="p-price">Price ($)</Label>
                            <Input
                                id="p-price"
                                type="number"
                                value={draft.price}
                                onChange={(e) =>
                                    set("price", Number(e.target.value))}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="p-sale-price">Sale price ($)</Label>
                            <Input
                                id="p-sale-price"
                                type="number"
                                value={draft.salePrice ?? ""}
                                onChange={(e) =>
                                    set("salePrice", e.target.value ? Number(e.target.value) : undefined)
                                }
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="p-stock">Stock</Label>
                            <Input
                                id="p-stock"
                                type="number"
                                value={draft.stock}
                                onChange={(e) =>
                                    set("stock", Number(e.target.value))}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="p-low-stock">Low stock at</Label>
                            <Input
                                id="p-low-stock"
                                type="number"
                                value={draft.lowStockThreshold}
                                onChange={(e) =>
                                    set("lowStockThreshold", Number(e.target.value))}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="p-desc">Description</Label>
                        <Textarea
                            id="p-desc"
                            rows={2}
                            value={draft.description}
                            onChange={(e) =>
                                set("description", e.target.value)}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-2 block">
                                Badge
                                {/* Backend only stores a single badge string — only the
                    first chip entered here is saved. */}
                            </Label>
                            <ChipInput
                                value={draft.badges.slice(0, 1)}
                                onChange={(v) => set("badges", v.slice(-1))}
                                placeholder="e.g. Best Seller"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Tags</Label>
                            <ChipInput
                                value={draft.tags}
                                onChange={(v) => set("tags", v)}
                                placeholder="e.g. repair, hydration"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">Quick Infos</Label>
                        <ChipInput
                            value={draft.info}
                            onChange={(v) => set("info", v)}
                            commitOnComma={false}
                            placeholder="Type a short sentence and press Enter, e.g. Suitable for sensitive skin"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!draft.name.trim() || saving}>
                        {saving ? "Saving…" : product ? "Save Changes" : "Create Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
