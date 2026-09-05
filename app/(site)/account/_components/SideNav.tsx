"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {useAuth} from "@/context/AuthContext";
import {
    Calendar,
    Gift,
    Heart,
    LifeBuoy,
    LogOut,
    ShoppingBag,
    Trash2,
    User,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {SectionId} from "@/app/(site)/account/_components/AccountContent";

type NavEntry =
    | { kind: "section"; id: SectionId; label: string; icon: typeof User }
    | { kind: "link"; href: string; label: string; icon: typeof User };

export const NAV: NavEntry[] = [
    {kind: "section", id: "profile", label: "Profile", icon: User},
    {kind: "link", href: "/appointments", label: "Appointments", icon: Calendar},
    {kind: "link", href: "/orders", label: "Orders", icon: ShoppingBag},
    {kind: "section", id: "gift-cards", label: "Gift Cards", icon: Gift},
    {kind: "section", id: "favourites", label: "Favourites", icon: Heart},
    {kind: "section", id: "support", label: "Support & FAQ", icon: LifeBuoy},
];

export function SideNav({
    active,
    onChange,
}: {
    active: SectionId;
    onChange: (s: SectionId) => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const {setToken} = useAuth();
    const router = useRouter();

    const signOut = () => {
        setToken(null);
        toast.success("Signed out.");
        router.push("/auth");
    };

    // No deleteAccount mutation exists on the backend yet — kept as a demo action.
    const deleteAccount = () => {
        setConfirmDelete(false);
        toast.success("Account deletion requested. This is a demo action.");
    };

    return (
        <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-on-surface-variant">
                Personal Space
            </p>
            <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col
                 lg:gap-1 lg:overflow-visible">
                {NAV.map((entry) => {
                    const {label, icon: Icon} = entry;
                    const isActive = entry.kind === "section" && active === entry.id;
                    const classes = `group flex shrink-0 items-center gap-3 
                    rounded-full border px-4 py-2.5 text-sm 
                    transition-colors lg:rounded-none 
                    lg:border-0 lg:border-l-2 
                    lg:px-3 lg:py-2.5 ${
                        isActive
                            ? "border-primary bg-primary text-primary-foreground " +
                            "lg:bg-transparent lg:text-primary lg:border-primary"
                            : "border-blush/60 text-on-surface-variant " +
                            "hover:text-primary " +
                            "lg:border-transparent"
                    }`;

                    if (entry.kind === "link") {
                        return (
                            <Link key={entry.href} href={entry.href} className={classes}>
                                <Icon className="h-4 w-4 shrink-0"/>
                                <span className="whitespace-nowrap">{label}</span>
                            </Link>
                        );
                    }
                    return (
                        <button key={entry.id} onClick={() => onChange(entry.id)} className={classes}>
                            <Icon className="h-4 w-4 shrink-0"/>
                            <span className="whitespace-nowrap">{label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="mt-6 hidden flex-col items-start gap-3 lg:flex">
                <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-xs font-semibold
                          uppercase tracking-[0.18em] text-soft-rose
                          hover:text-primary"
                >
                    <LogOut className="h-4 w-4"/> Sign Out
                </button>
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-xs font-semibold
                          uppercase tracking-[0.18em] text-rose-600
                          hover:text-rose-700"
                >
                    <Trash2 className="h-4 w-4"/> Delete Account
                </button>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your Verdant Luxe account and all
                            associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteAccount}
                            className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}