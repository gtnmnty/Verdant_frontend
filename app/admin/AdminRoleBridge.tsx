"use client";

import {useEffect, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {RoleProvider} from "@/lib/admin/role-context";
import {useAdmin} from "@/lib/admin/store";
import {useAuth} from "@/context/AuthContext";
import {AdminDetailSkeleton} from "@/components/ui/skeleton";

export function AdminRoleBridge({children}: { children: ReactNode }) {
    const {stylists} = useAdmin();
    const {token, loading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && token === null) router.replace("/auth");
    }, [loading, token, router]);

    // A freshly loaded tab has no access token until the session restore finishes, and an anonymous request is
    // answered with 'You do not have permission'. Hold the admin pages back so none of them fire early.
    if (loading || token === null) {
        return <AdminDetailSkeleton/>;
    }

    return (
        <RoleProvider defaultStylistId={stylists[0]?.id ?? ""}>
            {children}
        </RoleProvider>
    );
}
