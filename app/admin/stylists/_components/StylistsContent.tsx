"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Plus, RefreshCw, Search} from "lucide-react";
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
import {StylistFormDialog} from "@/app/admin/stylists/_components/StylistFormDialog";
import {gqlRequest} from "@/utils/graphqlClient";
import {
    STATUS_FROM_BACKEND,
    STATUS_TO_BACKEND,
    type AdminStylist,
    type AdminStylistService,
} from "@/app/admin/stylists/_components/types";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

interface BackendAdminStylistsDto {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    bio: string | null;
    avatarUrl: string | null;
    branch: { id: string; name: string } | null;
    services: AdminStylistService[];
    createdAt: string;
}

interface AdminStylistsPage {
    items: BackendAdminStylistsDto[];
    totalItems: number;
}

const ADMIN_STYLISTS_QUERY = `
    query AdminStylists(
        $status: StylistAccountStatus,
        $search: String, 
        $sort: StylistSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        adminStylists(
            status: $status,
            search: $search, 
            sort: $sort, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                name
                email
                phone
                status
                bio
                avatarUrl
                branch { id name }
                services { id name price durationInMinutes }
                createdAt
            }
            totalItems
        }
    }
`;

const UPDATE_STATUS_MUTATION = `
    mutation UpdateStylistStatus($id: ID!, $status: StylistAccountStatus!) {
        updateStylistStatus(id: $id, status: $status) { id status }
    }
`;

const DELETE_STYLIST_MUTATION = `
    mutation DeleteStylist($id: ID!) {
        deleteStylist(id: $id) { id }
    }
`;

const DELETE_STYLISTS_MUTATION = `
    mutation DeleteStylists($ids: [ID!]!) {
        deleteStylists(ids: $ids) { id }
    }
`;

export function toAdminStylist(s: BackendAdminStylistsDto): AdminStylist {
    return {
        id: s.id,
        fullName: s.name,
        email: s.email,
        phone: s.phone ?? "",
        bio: s.bio ?? "",
        photo: s.avatarUrl ?? "",
        status: STATUS_FROM_BACKEND[s.status] ?? s.status.toLowerCase(),
        branchId: s.branch?.id ?? null,
        branchName: s.branch?.name ?? null,
        services: s.services ?? [],
        createdAt: s.createdAt,
    };
}

export function StylistsContent() {
    const router = useRouter();
    const [stylists, setStylists] = useState<AdminStylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminStylist | null>(null);
    const [deleting, setDeleting] = useState<AdminStylist | null>(null);
    const [deletingIds, setDeletingIds] = useState<string[] | null>(null);

    const fetchStylists = () => {
        setLoading(true);
        gqlRequest<{ adminStylists: AdminStylistsPage }>(ADMIN_STYLISTS_QUERY, {
            status: status === "all" ? undefined : STATUS_TO_BACKEND[status],
            search: search.trim() || undefined,
            page: 1,
            pageSize: 100,
        })
            .then((res) =>
                setStylists(res.adminStylists.items.map(toAdminStylist)))
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to load stylists."))
            .finally(() => setLoading(false));
    };

    useEffect(fetchStylists, [search, status]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (s: AdminStylist) => {
        setEditing(s);
        setFormOpen(true);
    };

    const toggleStatus = (s: AdminStylist) => {
        gqlRequest(UPDATE_STATUS_MUTATION, {
            id: s.id,
            status: s.status === "active" ? "INACTIVE" : "ACTIVE",
        })
            .then(() => {
                toast.success("Status updated");
                fetchStylists();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update status."));
    };

    const confirmDelete = () => {
        if (!deleting) return;
        gqlRequest(DELETE_STYLIST_MUTATION, {id: deleting.id})
            .then(() => {
                toast.success("Stylist deleted");
                setDeleting(null);
                fetchStylists();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to delete stylist."));
    };

    const confirmBulkDelete = () => {
        if (!deletingIds) return;
        gqlRequest(DELETE_STYLISTS_MUTATION, {ids: deletingIds})
            .then(() => {
                toast.success(`Deleted ${deletingIds.length} stylists`);
                setDeletingIds(null);
                fetchStylists();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to delete stylists."));
    };

    const columns: Column<AdminStylist>[] = [
        {
            key: "name",
            header: "Stylist",
            sortable: true,
            sortValue: (s) => s.fullName,
            render: (s) => (
                <Link href={`/admin/stylists/${s.id}`}
                      className="flex min-w-0 items-center gap-3 hover:underline">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full">
                        {s.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs
                            <img src={s.photo} alt="" className="size-full object-cover"/>
                        ) : (
                            <ImagePlaceholder name={s.fullName} kind="stylist" compact/>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{s.fullName}</p>
                        <p className="truncate text-xs text-admin-muted">{s.email}</p>
                    </div>
                </Link>
            ),
        },
        {
            key: "branch",
            header: "Branch",
            render: (s) => s.branchName ?? "—",
        },
        {
            key: "bio",
            header: "Bio",
            render: (s) =>
                <span className="line-clamp-1 max-w-50 text-sm text-admin-muted">{s.bio || "—"}</span>,
        },
        {key: "status", header: "Status", render: (s) => <StatusBadge status={s.status}/>},
    ];

    return (
        <div>
            <PageHeader
                title="Stylists"
                description="Manage your team of stylists
                             and their assigned services."
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-50 flex-1">
                    <Search
                        className="pointer-events-none absolute
                        left-3 top-1/2 size-4 -translate-y-1/2
                        text-admin-muted"/>
                    <Input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)}
                        placeholder="Search stylists…"
                        className="border-admin-line bg-admin-surface pl-9"
                    />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-36 border-admin-line bg-admin-surface">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchStylists} className="border-admin-line">
                    <RefreshCw className="size-4"/>
                </Button>
                <Button onClick={openCreate}>
                    <Plus className="mr-1.5 size-4"/> Add Stylist
                </Button>
            </div>

            <DataTable
                rows={stylists}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No stylists found"}
                emptyDescription={loading ?
                    "Fetching stylists from the server." :
                    "Try a different search or add a new stylist."}
                bulkActions={(ids, clear) => (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-admin-rose"
                        onClick={() => {
                            setDeletingIds(ids);
                            clear();
                        }}
                    >
                        Delete selected
                    </Button>
                )}
                rowActions={(s) => [
                    {label: "View Profile", onSelect: () =>
                            router.push(`/admin/stylists/${s.id}`)},
                    {label: "Edit", onSelect: () => openEdit(s)},
                    {
                        label: s.status === "active" ? "Set Inactive" : "Set Active",
                        onSelect: () => toggleStatus(s),
                    },
                    {label: "Delete", onSelect: () => setDeleting(s), destructive: true},
                ]}
            />

            <StylistFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                stylist={editing}
                onSaved={fetchStylists}
            />
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
                title="Delete this stylist?"
                description={`"${deleting?.fullName}" will be permanently removed.`}
                confirmLabel="Delete"
                destructive
                onConfirm={confirmDelete}
            />
            <ConfirmDialog
                open={!!deletingIds}
                onOpenChange={(o) => !o && setDeletingIds(null)}
                title={`Delete ${deletingIds?.length ?? 0} stylists?`}
                confirmLabel="Delete"
                destructive
                onConfirm={confirmBulkDelete}
            />
        </div>
    );
}
