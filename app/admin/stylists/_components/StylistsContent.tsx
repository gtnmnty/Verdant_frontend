"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Plus, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {DataTable, type Column} from "@/app/admin/_components/DataTable";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {StylistFormDialog} from "@/app/admin/stylists/_components/StylistFormDialog";
import {gqlRequest} from "@/utils/graphqlClient";
import {
    STATUS_FROM_BACKEND,
    type AdminStylist,
} from "@/app/admin/stylists/_components/types";

interface BackendAdminStylistsDto {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    bio: string | null;
    avatarUrl: string | null;
    branch: { id: string; name: string } | null;
    createdAt: string;
}

interface AdminStylistsPage {
    items: BackendAdminStylistsDto[];
    totalItems: number;
}

const ADMIN_STYLISTS_QUERY = `
    query AdminStylists(
        $search: String, 
        $sort: StylistSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        adminStylists(
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

const FALLBACK_AVATAR = "https://picsum.photos/seed/stylist-admin/100/100";

export function toAdminStylist(s: BackendAdminStylistsDto): AdminStylist {
    return {
        id: s.id,
        fullName: s.name,
        email: s.email,
        phone: s.phone ?? "",
        bio: s.bio ?? "",
        photo: s.avatarUrl ?? FALLBACK_AVATAR,
        status: STATUS_FROM_BACKEND[s.status] ?? s.status.toLowerCase(),
        branchId: s.branch?.id ?? null,
        branchName: s.branch?.name ?? null,
        createdAt: s.createdAt,
    };
}

export function StylistsContent() {
    const router = useRouter();
    const [stylists, setStylists] = useState<AdminStylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminStylist | null>(null);
    const [deleting, setDeleting] = useState<AdminStylist | null>(null);

    const fetchStylists = () => {
        setLoading(true);
        gqlRequest<{ adminStylists: AdminStylistsPage }>(ADMIN_STYLISTS_QUERY, {
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

    useEffect(fetchStylists, [search]);

    const filtered = useMemo(() => stylists, [stylists]);

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

    const columns: Column<AdminStylist>[] = [
        {
            key: "name",
            header: "Stylist",
            sortable: true,
            sortValue: (s) => s.fullName,
            render: (s) => (
                <Link href={`/admin/stylists/${s.id}`}
                      className="flex min-w-0 items-center gap-3 hover:underline">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs */}
                    <img src={s.photo} alt="" className="size-10 shrink-0 rounded-full"/>
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
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="mr-1.5 size-4"/> Add Stylist
                    </Button>
                }
            />

            <div className="mb-4">
                <div className="relative max-w-sm">
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
            </div>

            <DataTable
                rows={filtered}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No stylists found"}
                emptyDescription={loading ?
                    "Fetching stylists from the server." :
                    "Try a different search or add a new stylist."}
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
        </div>
    );
}
