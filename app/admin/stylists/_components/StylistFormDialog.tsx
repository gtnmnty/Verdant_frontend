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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {ImageUploader} from "@/app/admin/_components/ImageUploader";
import {gqlRequest} from "@/utils/graphqlClient";
import {STATUS_TO_BACKEND, type AdminStylist} from "@/app/admin/stylists/_components/types";

interface Draft {
    fullName: string;
    photo: string;
    bio: string;
    branchId: string;
    serviceIds: string[];
    status: string;
    email: string;
    phone: string;
}

const EMPTY: Draft = {
    fullName: "",
    photo: "",
    bio: "",
    branchId: "",
    serviceIds: [],
    status: "active",
    email: "",
    phone: "",
};

interface BranchOption {
    id: string;
    name: string;
}

interface ServiceOption {
    id: string;
    name: string;
    stylists: { id: string }[];
}

const FORM_OPTIONS_QUERY = `
    query StylistFormOptions {
        adminBranches(pageSize: 100) {
            items { id name }
        }
        adminServices(pageSize: 100) {
            items { id name stylists { id } }
        }
    }
`;

const CREATE_STYLIST_MUTATION = `
    mutation CreateStylist($input: CreateStylistInput!) {
        createStylist(input: $input) { id }
    }
`;

const UPDATE_STYLIST_MUTATION = `
    mutation UpdateStylist($id: ID!, $input: UpdateStylistInput!) {
        updateStylist(id: $id, input: $input) { id }
    }
`;

const UPDATE_STATUS_MUTATION = `
    mutation UpdateStylistStatusInForm($id: ID!, $status: StylistAccountStatus!) {
        updateStylistStatus(id: $id, status: $status) { id }
    }
`;

const ASSIGN_SERVICES_MUTATION = `
    mutation AssignStylistToServices($stylistId: ID!, $serviceIds: [ID!]!) {
        assignStylistToServices(stylistId: $stylistId, serviceIds: $serviceIds) { id }
    }
`;

export function StylistFormDialog({
    open,
    onOpenChange,
    stylist,
    onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stylist: AdminStylist | null;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<Draft>(EMPTY);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        gqlRequest<{ adminBranches: { items: BranchOption[] }; adminServices: { items: ServiceOption[] } }>(
            FORM_OPTIONS_QUERY,
        )
            .then((res) => {
                setBranches(res.adminBranches.items);
                setServiceOptions(res.adminServices.items);
                // AdminStylistsDto has no `services` field, so the currently
                // assigned services are derived by checking which services list
                // this stylist under their `stylists` array.
                if (stylist) {
                    const assigned = res.adminServices.items
                        .filter((sv) => sv.stylists.some((st) => st.id === stylist.id))
                        .map((sv) => sv.id);
                    setDraft({
                        fullName: stylist.fullName,
                        photo: stylist.photo,
                        bio: stylist.bio,
                        branchId: stylist.branchId ?? res.adminBranches.items[0]?.id ?? "",
                        serviceIds: assigned,
                        status: stylist.status,
                        email: stylist.email,
                        phone: stylist.phone,
                    });
                } else {
                    setDraft({...EMPTY, branchId: res.adminBranches.items[0]?.id ?? ""});
                }
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load form options."));
    }, [open, stylist]);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft((d) => ({...d, [key]: value}));

    const toggleService = (id: string) =>
        set(
            "serviceIds",
            draft.serviceIds.includes(id)
                ? draft.serviceIds.filter((s) => s !== id)
                : [...draft.serviceIds, id],
        );

    const handleSave = async () => {
        if (!draft.fullName.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!draft.branchId) {
            toast.error("Branch is required");
            return;
        }

        setSaving(true);
        try {
            let id = stylist?.id;
            if (stylist) {
                await gqlRequest(UPDATE_STYLIST_MUTATION, {
                    id: stylist.id,
                    input: {
                        name: draft.fullName,
                        email: draft.email || undefined,
                        phone: draft.phone || undefined,
                        bio: draft.bio || undefined,
                        avatarUrl: draft.photo || undefined,
                        branchId: draft.branchId,
                    },
                });
                if (draft.status !== stylist.status) {
                    await gqlRequest(UPDATE_STATUS_MUTATION, {id: stylist.id, status: STATUS_TO_BACKEND[draft.status]});
                }
            } else {
                const res = await gqlRequest<{ createStylist: { id: string } }>(CREATE_STYLIST_MUTATION, {
                    input: {
                        name: draft.fullName,
                        email: draft.email || undefined,
                        phone: draft.phone || undefined,
                        bio: draft.bio || undefined,
                        avatarUrl: draft.photo || undefined,
                        branchId: draft.branchId,
                        serviceIds: draft.serviceIds,
                    },
                });
                id = res.createStylist.id;
            }

            // For an existing stylist, service assignment is a separate mutation
            // (UpdateStylistInput has no serviceIds field). For a brand-new
            // stylist it's already set via createStylist above.
            if (stylist && id) {
                await gqlRequest(ASSIGN_SERVICES_MUTATION, {stylistId: id, serviceIds: draft.serviceIds});
            }

            toast.success("Saved");
            onOpenChange(false);
            onSaved();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save stylist.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{stylist ? "Edit Stylist" : "New Stylist"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div>
                        <Label>Profile Photo</Label>
                        <div className="mt-1.5">
                            <ImageUploader
                                images={draft.photo ? [draft.photo] : []}
                                onChange={(imgs) => set("photo", imgs[0] ?? "")}
                                max={1}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="st-name">Full Name</Label>
                            <Input id="st-name" value={draft.fullName}
                                   onChange={(e) =>
                                       set("fullName", e.target.value)}
                                   className="mt-1.5"/>
                        </div>
                        <div>
                            <Label htmlFor="st-email">Email</Label>
                            <Input id="st-email" value={draft.email}
                                   onChange={(e) =>
                                       set("email", e.target.value)}
                                   className="mt-1.5"/>
                        </div>
                        <div>
                            <Label htmlFor="st-phone">Phone</Label>
                            <Input id="st-phone" value={draft.phone}
                                   onChange={(e) =>
                                       set("phone", e.target.value)}
                                   className="mt-1.5"/>
                        </div>
                        <div>
                            <Label>Branch</Label>
                            <Select value={draft.branchId} onValueChange={(v) =>
                                set("branchId", v)}>
                                <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="st-bio">Bio</Label>
                        <Textarea id="st-bio" rows={3} value={draft.bio}
                                  onChange={(e) =>
                                      set("bio", e.target.value)}
                                  className="mt-1.5"/>
                    </div>
                    {/* "Specialties" and "Working Hours" had no backend field on
              Stylist at all (only bio/email/phone/status/avatarUrl/branch/
              services exist) — dropped. */}

                    <div>
                        <Label>Offered Services</Label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {serviceOptions.length === 0 ? (
                                <p className="text-xs text-admin-muted">No services available.</p>
                            ) : (
                                serviceOptions.map((sv) => {
                                    const on = draft.serviceIds.includes(sv.id);
                                    return (
                                        <button
                                            key={sv.id}
                                            type="button"
                                            onClick={() => toggleService(sv.id)}
                                            className={`rounded-full border px-3 py-1.5 
                                            text-xs font-medium transition-colors ${
                                                on
                                                    ? "border-admin-sidebar bg-admin-sidebar text-white"
                                                    : "border-admin-line text-admin-muted hover:text-admin-ink"
                                            }`}
                                        >
                                            {sv.name}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Status</Label>
                        <Select value={draft.status} onValueChange={(v) => set("status", v)}>
                            <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!draft.fullName.trim() || saving}>
                        {saving ? "Saving…" : stylist ? "Save Changes" : "Add Stylist"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
