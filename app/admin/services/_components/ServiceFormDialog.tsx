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
import {CATEGORY_TO_BACKEND, type AdminService} from "@/app/admin/services/_components/types";

// Real ItemCatalog enum values (SKIN_CARE/HAIR_CARE/MAKE_UP) — the old mock
// used fictional service-type categories (Color/Cut/Treatment/Styling)
// that don't correspond to anything on the backend.
const CATEGORIES = Object.keys(CATEGORY_TO_BACKEND);

interface Draft {
    name: string;
    subName: string;
    description: string;
    category: string;
    duration: number;
    price: number;
    stylistIds: string[];
    image: string;
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
    image: "",
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
        image: s.image,
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

    useEffect(() => {
        if (open) setDraft(service ? toDraft(service) : EMPTY);
    }, [open, service]);

    useEffect(() => {
        if (!open) return;
        gqlRequest<{ adminStylists: { items: BackendStylistOption[] } }>(ADMIN_STYLIST_OPTIONS_QUERY)
            .then((res) => setStylistOptions(res.adminStylists.items))
            .catch(() => { /* stylist picker is supplementary — fail quietly */
            });
    }, [open]);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft((d) => ({...d, [key]: value}));

    const toggleStylist = (id: string) => {
        set(
            "stylistIds",
            draft.stylistIds.includes(id)
                ? draft.stylistIds.filter((s) => s !== id)
                : [...draft.stylistIds, id],
        );
    };

    const handleSave = () => {
        if (!draft.name.trim()) return;

        const shared = {
            name: draft.name,
            subName: draft.subName,
            category: CATEGORY_TO_BACKEND[draft.category],
            price: draft.price,
            durationInMinutes: draft.duration,
            status: draft.active ? "ACTIVE" : "INACTIVE",
            description: draft.description || undefined,
            badge: draft.badges[0] || undefined,
            tags: draft.tags,
            info: draft.infos,
            images: draft.image ? [draft.image] : [],
            isHomeService: draft.homeService,
            isFeatured: draft.featured,
            stylistIds: draft.stylistIds,
        };

        setSaving(true);
        const request = service
            ? gqlRequest(UPDATE_SERVICE_MUTATION, {input: {id: service.id, ...shared}})
            : gqlRequest(CREATE_SERVICE_MUTATION, {input: shared});

        request
            .then(() => {
                toast.success(service ? "Service updated." : "Service created.");
                onOpenChange(false);
                onSaved();
            })
            .catch((err) => '' +
                toast.error(err instanceof Error ? err.message : "Failed to save service."))
            .finally(() => setSaving(false));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{service ? "Edit Service" : "New Service"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div>
                        <Label>Cover Image</Label>
                        <div className="mt-1.5">
                            <ImageUploader
                                images={draft.image ? [draft.image] : []}
                                onChange={(imgs) => set("image", imgs[0] ?? "")}
                                max={1}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="sv-name">Name</Label>
                            <Input id="sv-name" value={draft.name}
                                   onChange={(e) =>
                                       set("name", e.target.value)}
                                   className="mt-1.5"/>
                        </div>
                        <div>
                            <Label htmlFor="sv-subname">Tagline</Label>
                            <Input id="sv-subname" value={draft.subName}
                                   onChange={(e) =>
                                       set("subName", e.target.value)} className="mt-1.5"/>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label>Category</Label>
                            <Select value={draft.category} onValueChange={(v) =>
                                set("category", v)}>
                                <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
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
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="sv-price">Price ($)</Label>
                            <Input
                                id="sv-price"
                                type="number"
                                value={draft.price}
                                onChange={(e) =>
                                    set("price", Number(e.target.value))}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="sv-desc">Description</Label>
                        <Textarea id="sv-desc" rows={2} value={draft.description}
                                  onChange={(e) =>
                                      set("description", e.target.value)} className="mt-1.5"/>
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

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label className="mb-2 block">
                                Badge
                                {/* Backend only stores a single badge string — only the
                    first chip entered here is saved. */}
                            </Label>
                            <ChipInput value={draft.badges.slice(0, 1)} onChange={(v) =>
                                set("badges", v.slice(-1))}
                                       placeholder="Signature…"/>
                        </div>
                        <div>
                            <Label className="mb-2 block">Tags</Label>
                            <ChipInput value={draft.tags} onChange={(v) =>
                                set("tags", v)} placeholder="color…"/>
                        </div>
                        <div>
                            <Label className="mb-2 block">Quick Infos</Label>
                            <ChipInput value={draft.infos} onChange={(v) =>
                                set("infos", v)}
                                       placeholder="Includes gloss…"/>
                        </div>
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
                        <label className="flex items-center gap-2.5 text-sm">
                            <Switch checked={draft.featured} onCheckedChange={(v) =>
                                set("featured", v)}/>
                            Featured
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!draft.name.trim() || saving}>
                        {saving ? "Saving…" : service ? "Save Changes" : "Create Service"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
