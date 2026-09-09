"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {toast} from "sonner";
import {Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DetailHeader,
    DetailGrid,
    DetailCard,
    FieldRow,
} from "@/app/admin/_components/Detail";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {EmptyState} from "@/app/admin/_components/EmptyState";
import {StylistFormDialog} from "@/app/admin/stylists/_components/StylistFormDialog";
import {toAdminStylist} from "@/app/admin/stylists/_components/StylistsContent";
import {gqlRequest} from "@/utils/graphqlClient";
import type {AdminStylist} from "@/app/admin/stylists/_components/types";

const ADMIN_STYLIST_DETAIL_QUERY = `
    query AdminStylistDetail($id: ID!) {
        adminStylist(id: $id) {
            id
            name
            email
            phone
            status
            bio
            avatarUrl
            branch { id name }
            createdAt
        }
    }
`;

interface OfferedService {
    id: string;
    name: string;
    price: number;
    durationInMinutes: number;
}

const STYLIST_SERVICES_QUERY = `
    query StylistOfferedServices {
        adminServices(pageSize: 100) {
            items { id name price durationInMinutes stylists { id } }
        }
    }
`;

const UPDATE_STATUS_MUTATION = `
    mutation ToggleStylistStatus($id: ID!, $status: StylistAccountStatus!) {
        updateStylistStatus(id: $id, status: $status) { id status }
    }
`;

const DELETE_STYLIST_MUTATION = `
    mutation DeleteStylistDetail($id: ID!) {
        deleteStylist(id: $id) { id }
    }
`;

export function StylistDetailContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [stylist, setStylist] = useState<AdminStylist | null | undefined>(undefined);
    const [offered, setOffered] = useState<OfferedService[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const fetchStylist = () => {
        gqlRequest<{ adminStylist: Parameters<typeof toAdminStylist>[0] | null }>(
            ADMIN_STYLIST_DETAIL_QUERY,
            {id: params.id},
        )
            .then((res) =>
                setStylist(res.adminStylist ? toAdminStylist(res.adminStylist) : null))
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to load stylist.");
                setStylist(null);
            });
    };

    useEffect(fetchStylist, [params.id]);

    useEffect(() => {
        // AdminStylistsDto has no `services` field — derived by checking which
        // services list this stylist under their `stylists` array.
        gqlRequest<{ adminServices: { items: (OfferedService & { stylists: { id: string }[] })[] } }>(
            STYLIST_SERVICES_QUERY,
        )
            .then((res) => {
                setOffered(res.adminServices.items.filter((sv) =>
                    sv.stylists.some((st) => st.id === params.id)));
            })
            .catch(() => { /* supplementary — fail quietly */
            });
    }, [params.id]);

    if (stylist === undefined) {
        return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
    }

    if (!stylist) {
        return (
            <EmptyState
                title="Stylist not found"
                description="They may have been removed. Return to the stylists list."
                action={<Button onClick={() => router.push("/admin/stylists")}>Back to Stylists</Button>}
            />
        );
    }

    const toggleStatus = () => {
        gqlRequest(UPDATE_STATUS_MUTATION, {
            id: stylist.id,
            status: stylist.status === "active" ? "INACTIVE" : "ACTIVE",
        })
            .then(() => fetchStylist())
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update status."));
    };

    const handleDelete = () => {
        gqlRequest(DELETE_STYLIST_MUTATION, {id: stylist.id})
            .then(() => {
                toast.success("Stylist deleted");
                router.push("/admin/stylists");
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to delete stylist."));
    };

    return (
        <div>
            <DetailHeader
                backHref="/admin/stylists"
                backLabel="Back to Stylists"
                title={stylist.fullName}
                subtitle={stylist.branchName ?? undefined}
                status={<StatusBadge status={stylist.status}/>}
                actions={
                    <>
                        <Button variant="outline" onClick={() =>
                            setEditOpen(true)} className="border-admin-line">
                            <Pencil className="mr-1.5 size-4"/> Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(true)}
                            className="border-admin-line text-admin-rose hover:text-admin-rose"
                        >
                            <Trash2 className="mr-1.5 size-4"/> Delete
                        </Button>
                    </>
                }
            />

            <DetailGrid>
                <div className="space-y-4">
                    <DetailCard>
                        <div className="flex flex-wrap items-start gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs */}
                            <img src={stylist.photo} alt="" className="size-24 rounded-2xl"/>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm leading-relaxed
                                    text-admin-muted">{stylist.bio || "No bio yet."}
                                </p>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="Offered Services">
                        {offered.length === 0 ? (
                            <p className="text-sm text-admin-muted">No services assigned yet.</p>
                        ) : (
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {offered.map((sv) => (
                                    <li key={sv.id} className="rounded-lg border border-admin-line p-3">
                                        <p className="font-medium">{sv.name}</p>
                                        <p className="text-xs text-admin-muted">{sv.durationInMinutes} min ·
                                            ${sv.price}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailCard>
                </div>

                <div className="space-y-4">
                    <DetailCard title="Contact">
                        <dl>
                            <FieldRow label="Email" value={stylist.email}/>
                            <FieldRow label="Phone" value={stylist.phone || "—"}/>
                            <FieldRow label="Branch" value={stylist.branchName ?? "—"}/>
                            <FieldRow
                                label="Joined"
                                value={stylist.createdAt ? new Date(stylist.createdAt).toLocaleDateString() : "—"}
                            />
                        </dl>
                    </DetailCard>

                    <DetailCard title="Visibility">
                        <label className="flex items-center justify-between">
                            <span className="text-sm">Active</span>
                            <Button variant="ghost" size="sm" onClick={toggleStatus}>
                                {stylist.status === "active" ? "Set Inactive" : "Set Active"}
                            </Button>
                        </label>
                    </DetailCard>

                    {/* "Upcoming Appointments" was fabricated from the mock admin
              store — dropped until the admin appointments route is
              connected and there's a real per-stylist appointments query
              to pull from. */}
                </div>
            </DetailGrid>

            <StylistFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                stylist={stylist}
                onSaved={fetchStylist}
            />
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this stylist?"
                description={`"${stylist.fullName}" will be permanently removed.`}
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </div>
    );
}
