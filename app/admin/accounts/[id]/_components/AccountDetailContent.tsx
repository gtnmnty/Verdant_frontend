"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    DetailCard,
    DetailGrid,
    DetailHeader,
    FieldRow,
} from "@/app/admin/_components/Detail";
import {EmptyState} from "@/app/admin/_components/EmptyState";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {gqlRequest} from "@/utils/graphqlClient";
import {ROLE_PERMS, type Role} from "@/lib/admin/roles";
import {
    ROLE_FROM_BACKEND,
    STATUS_FROM_BACKEND,
    type AdminAccount,
} from "@/app/admin/accounts/_components/types";

interface BackendAccountDetail {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    address: {
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal: string;
        country: string | null
    } | null;
    avatarUrl: string | null;
    role: string;
    status: string;
    createdAt: string;
    resetLinkStatus: "PENDING" | "SENT" | "FAILED" | null;
    resetLinkStatusAt: string | null;
}

const ACCOUNT_DETAIL_QUERY = `
    query AccountDetail($id: ID!) {
        account(id: $id) {
            id
            fullName
            email
            phone
            address { line1 line2 city state postal country }
            avatarUrl
            role
            status
            createdAt
            resetLinkStatus
            resetLinkStatusAt
        }
    }
`;

interface BackendAuditEntry {
    id: string;
    actionType: string;
    title: string;
    detail: string | null;
    createdAt: string;
}

const ACCOUNT_AUDIT_QUERY = `
    query AccountAuditLog($id: ID!) {
        auditLogForEntity(entityType: ACCOUNT, entityId: $id, page: 0, size: 10) {
            content { id actionType title detail createdAt }
        }
    }
`;

const SUSPEND_ACCOUNTS_MUTATION = `
    mutation SuspendAccountDetail($ids: [ID!]!) {
        suspendAccounts(ids: $ids) { id status }
    }
`;

const RESTORE_ACCOUNT_MUTATION = `
    mutation RestoreAccountDetail($id: ID!, $input: UpdateAccountInput!) {
        updateAccount(id: $id, input: $input) { id status }
    }
`;

const SEND_PASSWORD_RESET_MUTATION = `
    mutation SendPasswordResetDetail($id: ID!) {
        sendPasswordReset(id: $id)
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/account-admin/100/100";

function toAdminAccount(a: BackendAccountDetail): AdminAccount {
    return {
        id: a.id,
        name: a.fullName,
        email: a.email,
        phone: a.phone ?? "",
        avatar: a.avatarUrl ?? FALLBACK_AVATAR,
        role: ROLE_FROM_BACKEND[a.role] ?? a.role.toLowerCase(),
        status: STATUS_FROM_BACKEND[a.status] ?? a.status.toLowerCase(),
        address: {
            line1: a.address?.line1 ?? "",
            line2: a.address?.line2 ?? "",
            city: a.address?.city ?? "",
            state: a.address?.state ?? "",
            postal: a.address?.postal ?? "",
            country: a.address?.country ?? "",
        },
        createdAt: a.createdAt,
    };
}

function formatAddress(addr: AdminAccount["address"]): string {
    return [addr.line1, addr.city, addr.state, addr.postal].filter(Boolean).join(", ") || "—";
}

const INTERNAL_ROLES: Role[] = ["manager", "admin", "receptionist", "stylist"];

// Last reset / set-password link: PENDING until the background send finishes, then SENT or FAILED.
// SENT means the mail server accepted it, not that it reached the inbox.
function ResetLinkStatusText({status, at}: { status: string | null; at: string | null }) {
    if (!status) return <span>Not sent</span>;
    const when = at ? ` · ${new Date(at).toLocaleString()}` : "";
    if (status === "FAILED") {
        return <span className="font-semibold text-red-600">Failed to send{when} — press Reset password to retry</span>;
    }
    if (status === "PENDING") return <span>Sending…{when}</span>;
    return <span>Sent{when}</span>;
}

export function AccountDetailContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [account, setAccount] = useState<AdminAccount | null | undefined>(undefined);
    const [audit, setAudit] = useState<BackendAuditEntry[]>([]);
    // Delivery of the last reset / set-password link (H-9). Kept beside the account, not inside AdminAccount.
    const [resetLink, setResetLink] = useState<{ status: string | null; at: string | null }>({status: null, at: null});

    const fetchAccount = () => {
        gqlRequest<{ account: BackendAccountDetail }>(ACCOUNT_DETAIL_QUERY, {id: params.id})
            .then((res) => {
                setAccount(toAdminAccount(res.account));
                setResetLink({status: res.account.resetLinkStatus, at: res.account.resetLinkStatusAt});
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to load account.");
                setAccount(null);
            });
    };

    useEffect(fetchAccount, [params.id]);

    useEffect(() => {
        gqlRequest<{ auditLogForEntity: { content: BackendAuditEntry[] } }>(ACCOUNT_AUDIT_QUERY, {id: params.id})
            .then((res) => setAudit(res.auditLogForEntity.content))
            .catch(() => { /* audit trail is supplementary — fail quietly */
            });
    }, [params.id]);

    if (account === undefined) {
        return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
    }

    if (!account) {
        return (
            <EmptyState
                title="Account not found"
                description="It may have been removed. Return to the accounts list."
                action={
                    <Button onClick={() => router.push("/admin/accounts")}>
                        Back to Accounts
                    </Button>
                }
            />
        );
    }

    const suspend = () => {
        const request = account.status === "active"
            ? gqlRequest(SUSPEND_ACCOUNTS_MUTATION, {ids: [account.id]})
            : gqlRequest(RESTORE_ACCOUNT_MUTATION, {id: account.id, input: {status: "ACTIVE"}});

        request
            .then(() => {
                toast.success("Status updated");
                fetchAccount();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to update status."));
    };

    const resetPassword = () => {
        gqlRequest(SEND_PASSWORD_RESET_MUTATION, {id: account.id})
            .then(() => {
                toast.success("Reset link issued");
                // The email is sent in the background; refetch shows PENDING, then SENT or FAILED.
                fetchAccount();
                window.setTimeout(fetchAccount, 4000);
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to send reset link."));
    };

    const roleCaps = INTERNAL_ROLES.includes(account.role as Role)
        ? ROLE_PERMS[account.role as Role]
        : null;

    return (
        <>
            <DetailHeader
                backHref="/admin/accounts"
                backLabel="Back to Accounts"
                title={account.name}
                actions={
                    <>
                        <Button variant="outline" onClick={resetPassword}>
                            Reset password
                        </Button>
                        <Button variant="outline" onClick={suspend}>
                            {account.status === "active" ? "Suspend" : "Restore"}
                        </Button>
                    </>
                }
            />
            <DetailGrid>
                <div className="space-y-5">
                    <DetailCard>
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs */}
                            <img src={account.avatar} alt="" className="size-20 rounded-2xl"/>
                            <div>
                                <StatusBadge status={account.status}/>
                                <h2 className="mt-2 font-display text-2xl">{account.name}</h2>
                                <p className="text-sm text-admin-muted">{account.email}</p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-admin-muted">
                                    {account.role}
                                </p>
                            </div>
                        </div>
                    </DetailCard>

                    <DetailCard title="Profile">
                        <dl>
                            <FieldRow label="Email" value={account.email}/>
                            <FieldRow label="Contact number" value={account.phone || "—"}/>
                            <FieldRow label="Address" value={formatAddress(account.address)}/>
                            <FieldRow label="Role" value={<span className="capitalize">{account.role}</span>}/>
                            <FieldRow label="Status" value={<StatusBadge status={account.status}/>}/>
                            <FieldRow
                                label="Created"
                                value={account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "—"}
                            />
                            <FieldRow label="Reset link" value={<ResetLinkStatusText {...resetLink}/>}/>
                        </dl>
                    </DetailCard>

                    <DetailCard title="Audit log">
                        {audit.length === 0 ? (
                            <p className="text-sm text-admin-muted">No activity recorded.</p>
                        ) : (
                            <ul className="space-y-4">
                                {audit.map((row) => (
                                    <li key={row.id} className="flex gap-3">
                                        <span className="mt-1 h-12 w-1 shrink-0 rounded-full bg-admin-sidebar"/>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">{row.title}</p>
                                            {row.detail ? (
                                                <p className="truncate text-sm text-admin-muted">{row.detail}</p>
                                            ) : null}
                                            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-admin-muted">
                                                {new Date(row.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailCard>
                </div>

                <DetailCard title="Capabilities (by role)">
                    {!roleCaps ? (
                        <p className="text-sm text-admin-muted">
                            No admin capability map for the &quot;{account.role}&quot; role.
                        </p>
                    ) : (
                        <ul className="flex flex-wrap gap-2">
                            {Object.entries(roleCaps.caps)
                                .filter(([, v]) => v)
                                .map(([cap]) => (
                                    <li key={cap} className="rounded-full bg-admin-cream px-3 py-1 text-xs capitalize">
                                        {cap.replace(/([A-Z])/g, " $1").trim()}
                                    </li>
                                ))}
                        </ul>
                    )}
                </DetailCard>
            </DetailGrid>
        </>
    );
}
