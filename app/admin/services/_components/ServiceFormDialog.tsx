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
import {Switch} from "@/components/ui/switch";
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
import {isConcurrentModification} from "@/utils/graphqlClient";
import {CATEGORY_TO_BACKEND, type AdminService} from "@/app/admin/services/_components/types";

// Real ItemCatalog enum values (SKIN_CARE/HAIR_CARE/MAKE_UP) — the old mock
// used fictional service-type categories (Color/Cut/Treatment/Styling)
// that don't correspond to anything on the backend.
const CATEGORIES = Object.keys(CATEGORY_TO_BACKEND);

const MAX_IMAGES = 4;
const isNewImage = (src: string) => src.startsWith("data:");

interface Draft {
    name: string;
    subName: string;
    description: string;
    category: string;
    duration: number;
    price: number;
    stylistIds: string[];
    images: string[]; // saved image URLs plus newly picked ones as data: URLs (uploaded on save)
    primaryImage: number;
    active: boolean;
    homeService: boolean;
    featured: boolean;
    badges: string[]; // only badges[0] is sent — backend has a single `badge` field
    tags: string[];
    infos: string[];
}

const EMPTY: Draft = {
    name: "",
    subName: "",
    description: "",
    category: "Skincare",
    duration: 60,
    price: 0,
    stylistIds: [],
    images: [],
    primaryImage: 0,
    active: true,
    homeService: false,
    featured: false,
    badges: [],
    tags: [],
    infos: [],
};

function toDraft(s: AdminService): Draft {
    return {
        name: s.name,
        subName: s.subName,
        description: s.description,
        category: s.category,
        duration: s.duration,
        price: s.price,
        stylistIds: s.stylists.map((st) => st.id),
        images: s.images,
        primaryImage: 0,
        active: s.active,
        homeService: s.homeService,
        featured: s.featured,
        badges: s.badge ? [s.badge] : [],
        tags: s.tags,
        infos: s.info,
    };
}

interface BackendStylistOption {
    id: string;
    name: string;
}

const ADMIN_STYLIST_OPTIONS_QUERY = `
    query AdminStylistOptions {
        adminStylists(pageSize: 100) {
            items { id name }
        }
    }
`;

const CREATE_SERVICE_MUTATION = `
    mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) { id }
    }
`;

const UPDATE_SERVICE_MUTATION = `
    mutation UpdateService($input: UpdateServiceInput!) {
        updateService(input: $input) { id }
    }
`;

type Errors = Partial<Record<"name" | "subName" | "duration" | "price" | "description", string>>;

function validate(d: Draft): Errors {
    const errors: Errors = {};
    if (!d.name.trim()) errors.name = "Name is required.";
    else if (d.name.trim().length > 120) errors.name = "Name must be 120 characters or fewer.";
    if (!d.subName.trim()) errors.subName = "Tagline is required.";
    else if (d.subName.trim().length > 160) errors.subName = "Tagline must be 160 characters or fewer.";
    if (!Number.isInteger(d.duration) || d.duration <= 0) errors.duration = "Enter a whole number of minutes above 0.";
    else if (d.duration > 1440) errors.duration = "Duration can't exceed 24 hours (1440 min).";
    if (!Number.isFinite(d.price) || d.price <= 0) errors.price = "Price must be greater than 0.";
    if (d.description.length > 2000) errors.description = "Description must be 2000 characters or fewer.";
    return errors;
}

function FieldError({message}: { message?: string }) {
    return message ? <p className="mt-1 text-xs text-admin-rose">{message}</p> : null;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: AdminService | null;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<Draft>(EMPTY);
    const [stylistOptions, setStylistOptions] = useState<BackendStylistOption[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDraft(service ? toDraft(service) : EMPTY);
            setErrors({});
            setSubmitError(null);
        }
    }, [open, service]);

    useEffect(() => {
        if (!open) return;
        gqlRequest<{ adminStylists: { items: BackendStylistOption[] } }>(ADMIN_STYLIST_OPTIONS_QUERY)
            .then((res) => setStylistOptions(res.adminStylists.items))
            .catch(() => { /* stylist picker is supplementary — fail quietly */
            });
    }, [open]);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
        setDraft((d) => ({...d, [key]: value}));
        if (key in errors) setErrors((e) => ({...e, [key]: undefined}));
    };

    // The uploader hands back the full list (it also covers removals), so replace rather than append.
    const changeImages = (urls: string[]) => {
        const next = urls.slice(0, MAX_IMAGES);
        set("images", next);
        set("primaryImage", Math.min(draft.primaryImage, Math.max(0, next.length - 1)));
    };

    // createService/updateService ignore image strings, so photos go through /api/services/{id}/images
    // (multipart -> Cloudinary -> media_images) after the service is saved: remove the ones the admin
    // dropped, upload the new ones, then mark the primary.
    const syncImages = async (serviceId: string) => {
        const base = `/api/services/${serviceId}/images`;
        const primarySrc = draft.images[draft.primaryImage] ?? draft.images[0];

        if (service) {
            for (let i = 0; i < service.images.length; i++) {
                if (!draft.images.includes(service.images[i])) {
                    await apiRequest(`${base}/${service.imageIds[i]}`, {method: "DELETE"});
                }
            }
        }

        for (const src of draft.images.filter(isNewImage)) {
            const blob = await (await fetch(src)).blob();
            const form = new FormData();
            form.append("files", new File([blob], `service.${blob.type.split("/")[1] || "jpg"}`, {type: blob.type}));
            form.append("isPrimary", String(src === primarySrc));
            await apiRequest(base, {method: "POST", body: form});
        }

        if (service && primarySrc && !isNewImage(primarySrc)) {
            const idx = service.images.indexOf(primarySrc);
            if (idx >= 0) await apiRequest(`${base}/${service.imageIds[idx]}/primary`, {method: "PATCH"});
        }
    };

    const toggleStylist = (id: string) => {
        set(
            "stylistIds",
            draft.stylistIds.includes(id)
                ? draft.stylistIds.filter((s) => s !== id)
                : [...draft.stylistIds, id],
        );
    };

    const handleSave = () => {
        const found = validate(draft);
        setErrors(found);
        setSubmitError(null);
        if (Object.keys(found).length > 0) return;

        const shared = {
            name: draft.name.trim(),
            subName: draft.subName.trim(),
            category: CATEGORY_TO_BACKEND[draft.category],
            price: draft.price,
            durationInMinutes: draft.duration,
            status: draft.active ? "ACTIVE" : "INACTIVE",
            description: draft.description.trim() || undefined,
            badge: draft.badges[0] || undefined,
            tags: draft.tags,
            info: draft.infos,
            images: [] as string[], // ignored by the backend; photos go through /api/services/{id}/images
            isHomeService: draft.homeService,
            isFeatured: draft.featured,
            stylistIds: draft.stylistIds,
        };

        setSaving(true);
        const request: Promise<unknown> = (service
            ? gqlRequest<{ updateService: { id: string } }>(UPDATE_SERVICE_MUTATION, {input: {id: service.id, ...shared}})
                .then((r) => r.updateService.id)
            : gqlRequest<{ createService: { id: string } }>(CREATE_SERVICE_MUTATION, {input: shared})
                .then((r) => r.createService.id)
        ).then(async (id) => {
            // The service itself is already saved here, so an image failure gets its own message and the
            // list still refreshes.
            try {
                await syncImages(id);
            } catch (err) {
                toast.error(
                    `Service saved, but its images failed: ${err instanceof Error ? err.message : "upload error"}`,
                );
            }
        });

        request
            .then(() => {
                toast.success(service ? "Service updated." : "Service created.");
                onOpenChange(false);
                onSaved();
            })
            .catch((err) => {
                // Only a successful save pops a toast; failures stay inline in the dialog.
                // A concurrent edit is the exception: its toast carries the "Reload" action.
                if (isConcurrentModification(err)) {
                    showSaveError(err, "Failed to save service.", () => {
                        onOpenChange(false);
                        onSaved();
                    });
                    return;
                }
                setSubmitError(err instanceof Error ? err.message : "Failed to save service.");
            })
            .finally(() => setSaving(false));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto p-6 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{service ? "Edit Service" : "New Service"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-5">
                    <div>
                        <Label>
                            Images ({draft.images.length}/{MAX_IMAGES})
                        </Label>
                        <div className="mt-1.5">
                            <ImageUploader
                                images={draft.images}
                                onChange={changeImages}
                                max={MAX_IMAGES}
                                primaryIndex={draft.primaryImage}
                                onPrimaryChange={(i) => set("primaryImage", i)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="sv-name">Name</Label>
                            <Input id="sv-name" value={draft.name}
                                   onChange={(e) =>
                                       set("name", e.target.value)}
                                   aria-invalid={!!errors.name}
                                   className="mt-1.5"/>
                            <FieldError message={errors.name}/>
                        </div>
                        <div>
                            <Label htmlFor="sv-subname">Tagline</Label>
                            <Input id="sv-subname" value={draft.subName}
                                   onChange={(e) =>
                                       set("subName", e.target.value)}
                                   aria-invalid={!!errors.subName}
                                   className="mt-1.5"/>
                            <FieldError message={errors.subName}/>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label>Category</Label>
                            <Select value={draft.category} onValueChange={(v) =>
                                set("category", v)}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="sv-duration">Duration (min)</Label>
                            <Input
                                id="sv-duration"
                                type="number"
                                value={draft.duration}
                                onChange={(e) =>
                                    set("duration", Number(e.target.value))}
                                aria-invalid={!!errors.duration}
                                className="mt-1.5"
                            />
                            <FieldError message={errors.duration}/>
                        </div>
                        <div>
                            <Label htmlFor="sv-price">Price ($)</Label>
                            <Input
                                id="sv-price"
                                type="number"
                                value={draft.price}
                                onChange={(e) =>
                                    set("price", Number(e.target.value))}
                                aria-invalid={!!errors.price}
                                className="mt-1.5"
                            />
                            <FieldError message={errors.price}/>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="sv-desc">Description</Label>
                        <Textarea id="sv-desc" rows={2} value={draft.description}
                                  onChange={(e) =>
                                      set("description", e.target.value)}
                                  aria-invalid={!!errors.description}
                                  className="mt-1.5"/>
                        <FieldError message={errors.description}/>
                    </div>

                    <div>
                        <Label>Assigned Stylists</Label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {stylistOptions.length === 0 ? (
                                <p className="text-xs text-admin-muted">No stylists available.</p>
                            ) : (
                                stylistOptions.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleStylist(s.id)}
                                        className={`rounded-full border px-3 py-1.5 
                                        text-xs font-medium transition-colors ${
                                            draft.stylistIds.includes(s.id)
                                                ? "border-admin-sidebar bg-admin-sidebar text-white"
                                                : "border-admin-line text-admin-muted hover:text-admin-ink"
                                        }`}
                                    >
                                        {s.name}
                                    </button>
                                ))
                            )}
                        </div>
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
                                placeholder="e.g. Signature"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Tags</Label>
                            <ChipInput
                                value={draft.tags}
                                onChange={(v) => set("tags", v)}
                                placeholder="e.g. color, glow"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">Quick Infos</Label>
                        <ChipInput
                            value={draft.infos}
                            onChange={(v) => set("infos", v)}
                            commitOnComma={false}
                            placeholder="Type a short sentence and press Enter, e.g. Includes gloss finish"
                        />
                    </div>

                    <div className="flex flex-wrap gap-6 rounded-lg
                         border border-admin-line p-4">
                        <label className="flex items-center gap-2.5 text-sm">
                            <Switch checked={draft.active} onCheckedChange={(v) =>
                                set("active", v)}/>
                            Active
                        </label>
                        <label className="flex items-center gap-2.5 text-sm">
                            <Switch checked={draft.homeService} onCheckedChange={(v) =>
                                set("homeService", v)}/>
                            Home Service Available
                        </label>
                    </div>

                    {submitError ? (
                        <p role="alert"
                           className="rounded-lg border border-admin-rose/40 bg-admin-rose/10 px-3 py-2 text-sm text-admin-rose">
                            {submitError}
                        </p>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : service ? "Save Changes" : "Create Service"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
