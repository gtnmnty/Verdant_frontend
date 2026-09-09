"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Plus, Search} from "lucide-react";
import {toast} from "sonner";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {DataTable, type Column} from "@/app/admin/_components/DataTable";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {AccountFormDialog, EMPTY_ACCOUNT} from "@/app/admin/accounts/_components/AccountFormDialog";
import {useRole} from "@/lib/admin/role-context";
import {gqlRequest} from "@/utils/graphqlClient";
import {
    ROLE_FROM_BACKEND,
    ROLE_TO_BACKEND,
    STATUS_FROM_BACKEND,
    type AdminAccount,
} from "@/app/admin/accounts/_components/types";

interface BackendAccount {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
}

interface AccountPage {
    content: BackendAccount[];
    totalElements: number;
}

const ACCOUNTS_QUERY = `
    query AdminAccounts($filter: AccountFilterInput, $page: Int!, $pageSize: Int!) {
        accounts(filter: $filter, page: $page, pageSize: $pageSize) {
            content {
                id
                fullName
                email
                phone
                avatarUrl
                role
                status
            }
            totalElements
        }
    }
`;

const SUSPEND_ACCOUNTS_MUTATION = `
    mutation SuspendAccounts($ids: [ID!]!) {
        suspendAccounts(ids: $ids) { id status }
    }
`;

const RESTORE_ACCOUNT_MUTATION = `
    mutation RestoreAccount($id: ID!, $input: UpdateAccountInput!) {
        updateAccount(id: $id, input: $input) { id status }
    }
`;

const SEND_PASSWORD_RESET_MUTATION = `
    mutation SendPasswordReset($id: ID!) {
        sendPasswordReset(id: $id)
    }
`;

const DELETE_ACCOUNTS_MUTATION = `
    mutation DeleteAccounts($ids: [ID!]!) {
        deleteAccounts(ids: $ids)
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/account-admin/100/100";

function toAdminAccount(a: BackendAccount): AdminAccount {
    return {
        id: a.id,
        name: a.fullName,
        email: a.email,
        phone: a.phone ?? "",
        avatar: a.avatarUrl ?? FALLBACK_AVATAR,
        role: ROLE_FROM_BACKEND[a.role] ?? a.role.toLowerCase(),
        status: STATUS_FROM_BACKEND[a.status] ?? a.status.toLowerCase(),
        address: {line1: "", line2: "", city: "", state: "", postal: "", country: ""},
        createdAt: "",
    };
}

export function AccountsContent() {
    const {perms} = useRole();
    const canTouch = (a: AdminAccount) =>
        perms.caps.manageManagers || a.role !== "manager";
    const router = useRouter();

    const [accounts, setAccounts] = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [editing, setEditing] = useState<AdminAccount | null>(null);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchAccounts = () => {
        setLoading(true);
        gqlRequest<{ accounts: AccountPage }>(ACCOUNTS_QUERY, {
            filter: {
                search: q.trim() || undefined,
                role: roleFilter === "all" ? undefined : ROLE_TO_BACKEND[roleFilter],
            },
            page: 1,
            pageSize: 100,
        })
            .then((res) => setAccounts(res.accounts.content.map(toAdminAccount)))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load accounts."))
            .finally(() => setLoading(false));
    };

    useEffect(fetchAccounts, [q, roleFilter]);

    const filtered = useMemo(() => accounts, [accounts]);

    const toggleSuspend = (a: AdminAccount) => {
        const request = a.status === "active"
            ? gqlRequest(SUSPEND_ACCOUNTS_MUTATION, {ids: [a.id]})
            : gqlRequest(RESTORE_ACCOUNT_MUTATION, {id: a.id, input: {status: "ACTIVE"}});

        request
            .then(() => {
                toast.success("Updated");
                fetchAccounts();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update account."));
    };

    const resetPassword = (a: AdminAccount) => {
        gqlRequest(SEND_PASSWORD_RESET_MUTATION, {id: a.id})
            .then(() => toast.success("Reset link sent"))
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to send reset link."));
    };

    const columns: Column<AdminAccount>[] = [
        {
            key: "name",
            header: "User",
            sortable: true,
            sortValue: (a) => a.name,
            render: (a) => (
                <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs */}
                    <img src={a.avatar} alt="" className="size-9 shrink-0 rounded-full"/>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{a.name}</p>
                        <p className="truncate text-xs text-admin-muted">{a.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "role",
            header: "Role",
            render: (a) => <span className="text-sm capitalize">{a.role}</span>,
        },
        {
            key: "phone",
            header: "Phone",
            render: (a) => <span className="text-xs">{a.phone || "—"}</span>,
        },
        {
            key: "status",
            header: "Status",
            render: (a) => <StatusBadge status={a.status}/>,
        },
    ];

    return (
        <>
            <PageHeader
                title="Accounts"
                actions={
                    <>
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute
                                left-3 top-1/2 size-4
                                -translate-y-1/2 text-admin-muted"/>
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search"
                                className="h-9 w-48 rounded-full
                                border-admin-line bg-admin-surface
                                pl-9 sm:w-64"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-9 w-36 rounded-full border-admin-line bg-admin-surface">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="stylist">Stylist</SelectItem>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            className="rounded-full bg-admin-sidebar text-white"
                            onClick={() => {
                                setEditing({...EMPTY_ACCOUNT});
                                setOpen(true);
                            }}
                        >
                            <Plus className="size-4"/> Add Account
                        </Button>
                    </>
                }
            />

            <DataTable
                rows={filtered}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No accounts found"}
                emptyDescription={loading ?
                    "Fetching accounts from the server." : "Try a different search or role filter."}
                rowActions={(row) => {
                    const base = [
                        {
                            label: "View profile",
                            onSelect: (r: AdminAccount) => router.push(`/admin/accounts/${r.id}`),
                        },
                    ];
                    if (!canTouch(row)) return base;
                    return [
                        ...base,
                        {
                            label: "Edit",
                            onSelect: (r: AdminAccount) => {
                                setEditing({...r});
                                setOpen(true);
                            },
                        },
                        {label: "Reset password", onSelect: () => resetPassword(row)},
                        {
                            label: row.status === "active" ? "Suspend" : "Restore",
                            onSelect: (r: AdminAccount) => toggleSuspend(r),
                        },
                        {label: "Delete", destructive: true, onSelect: (r: AdminAccount) => setDeleteId(r.id)},
                    ];
                }}
            />

            <AccountFormDialog
                open={open}
                onOpenChange={setOpen}
                editing={editing}
                onEditingChange={setEditing}
                onSaved={fetchAccounts}
            />

            <ConfirmDialog
                open={Boolean(deleteId)}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete account?"
                destructive
                confirmLabel="Delete"
                onConfirm={() => {
                    if (!deleteId) return;
                    gqlRequest(DELETE_ACCOUNTS_MUTATION, {ids: [deleteId]})
                        .then(() => {
                            toast.success("Deleted");
                            setDeleteId(null);
                            fetchAccounts();
                        })
                        .catch((err) =>
                            toast.error(err instanceof Error ? err.message : "Failed to delete account."));
                }}
            />
        </>
    );
}
