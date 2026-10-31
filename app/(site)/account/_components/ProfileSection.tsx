"use client";

import {useRouter} from "next/navigation";
import React, {useEffect, useRef, useState, type SubmitEvent} from "react";
import Link from "next/link";
import Image from "next/image";
import {toast} from "sonner";
import {Camera, ChevronRight, KeyRound, MailCheck, Pencil} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {SectionCard, SectionTitle} from "@/app/(site)/account/_components/shared";
import {formatDateTime} from "@/app/(site)/appointments/_components/data";
import {
    STATUS_LABELS as ORDER_STATUS_LABELS,
    formatDate as formatOrderDate,
    type Order,
} from "@/app/(site)/orders/_components/data";
import { gqlRequest } from "@/utils/graphqlClient";
import { apiRequest } from "@/utils/apiClient";
import { MY_ORDERS_QUERY } from "@/app/(site)/orders/_components/query";
import {
    FIELD_KEYS,
    PROFILE_ME_QUERY,
    ProfileData,
    UPCOMING_APPOINTMENT_QUERY,
    UpcomingAppointment,
    UPDATE_PROFILE_MUTATION
} from "@/app/(site)/account/_components/query";
import {ConfirmEmailChangeDialog, isEmailChanged} from "@/components/account/ConfirmEmailChangeDialog";
import {useAuth} from "@/context/AuthContext";

export function ProfileSection() {
    const router = useRouter();
    const [data, setData] = useState<ProfileData>({
        fullName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postal: "",
        country: "",
    });
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(data);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [upcoming, setUpcoming] = useState<UpcomingAppointment | null>(null);
    const [memberSince, setMemberSince] = useState("2024");
    // Email change: the new address waits here until its emailed code is confirmed.
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {loading: authLoading} = useAuth();

    // Flow Step 1: Fetch user profile and recent orders from backend on mount
    useEffect(() => {
        if(authLoading) return;
        let cancelled = false;

        // Fetch authenticated user profile
        gqlRequest<{
            me: {
                id: string;
                fullName: string;
                email: string;
                pendingEmail: string | null;
                phone: string | null;
                avatarUrl: string | null;
                createdAt: string;
                shippingAddress: {
                    line1: string;
                    city: string;
                    state: string;
                    postal: string;
                    country: string;
                } | null;
            };
        }>(PROFILE_ME_QUERY)
            .then((res) => {
                if (cancelled || !res?.me) return;
                const me = res.me;
                const profile: ProfileData = {
                    fullName: me.fullName ?? "",
                    email: me.email ?? "",
                    phone: me.phone ?? "",
                    street: me.shippingAddress?.line1 ?? "",
                    city: me.shippingAddress?.city ?? "",
                    state: me.shippingAddress?.state ?? "",
                    postal: me.shippingAddress?.postal ?? "",
                    country: me.shippingAddress?.country ?? "",
                };
                setData(profile);
                setDraft(profile);
                setPendingEmail(me.pendingEmail ?? null);
                if (me.avatarUrl) setAvatarUrl(me.avatarUrl);
                if (me.createdAt) {
                    setMemberSince(new Date(me.createdAt).getFullYear().toString());
                }
            })
            .catch((err) => {
                // Used to be swallowed, which left the page blank with no hint that loading failed.
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load your profile.");
            });

        // Fetch recent 3 customer orders
        gqlRequest<{ myOrders: { items: Order[] } }>(MY_ORDERS_QUERY, {
            page: 1,
            pageSize: 3,
        })
            .then((res) => {
                if (cancelled || !res?.myOrders) return;
                setRecentOrders(res.myOrders.items ?? []);
            })
            .catch(() => {
                // Orders loading failed
            });

        gqlRequest<{ myAppointments: { items: UpcomingAppointment[] } }>(UPCOMING_APPOINTMENT_QUERY)
            .then((res) => {
                if (!cancelled) setUpcoming(res.myAppointments.items[0] ?? null);
            })
            .catch(() => {
                if (!cancelled) setUpcoming(null);
            });

        return () => { cancelled = true; };
    }, [authLoading]);

    const openEdit = () => {
        setDraft(data);
        setCurrentPassword("");
        setEditing(true);
    };

    // The backend asks for the current password only when the email actually changes.
    const emailChanging = isEmailChanged(data.email, draft.email);

    // Phone and address are optional. The address is all-or-nothing on the backend (AddressInput):
    // once any part is filled in, street/city/state/postal become required; country defaults to US.
    const hasAddress = ADDRESS_KEYS.some((k) => draft[k].trim() !== "");
    const isRequired = (k: keyof ProfileData) =>
        k === "fullName" || k === "email" || (hasAddress && k !== "country" && ADDRESS_KEYS.includes(k));

    // Flow Step 2: Persist edited profile details to database via GraphQL mutation
    const save = async (e: SubmitEvent) => {
        e.preventDefault();
        try {
            const res = await gqlRequest<{ updateProfile: { pendingEmail: string | null } }>(UPDATE_PROFILE_MUTATION, {
                input: {
                    fullName: draft.fullName,
                    email: draft.email,
                    currentPassword: emailChanging ? currentPassword : undefined,
                    phone: draft.phone.trim(),
                    // Omitted (left unchanged) when the address fields are empty.
                    shippingAddress: hasAddress ? {
                        line1: draft.street.trim(),
                        city: draft.city.trim(),
                        state: draft.state.trim(),
                        postal: draft.postal.trim(),
                        country: draft.country.trim().toUpperCase() || undefined,
                    } : undefined,
                },
            });
            // The saved email doesn't change yet: it only switches once the code is confirmed.
            setData({...draft, email: data.email});
            setEditing(false);
            setCurrentPassword("");
            if (emailChanging && res.updateProfile.pendingEmail) {
                setPendingEmail(res.updateProfile.pendingEmail);
                setConfirmOpen(true);
                toast.success("Profile updated. Check your new inbox for a verification code.");
            } else {
                toast.success("Profile updated.");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update profile.");
        }
    };

    // Flow Step 3: Upload avatar image to Cloudinary via backend multipart endpoint
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Instant optimistic preview
        const localPreview = URL.createObjectURL(file);
        setAvatarUrl(localPreview);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiRequest<{ avatarUrl: string }>("/v1/users/avatar", {
                method: "POST",
                body: formData,
            });
            if (res?.avatarUrl) {
                setAvatarUrl(res.avatarUrl);
            }
            toast.success("Profile photo updated.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
        }
    };

    return (
        <div className="space-y-10">
            {/* Avatar */}
            <SectionCard>
                <div className="flex flex-col items-center gap-4 text-center
                 sm:flex-row sm:text-left">
                    <Avatar className="h-24 w-24 border border-blush/60 shadow-sm">
                        <AvatarImage src={avatarUrl ?? undefined} alt={data.fullName}/>
                        <AvatarFallback className="font-display text-2xl text-primary">
                            {data.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-[10px] font-semibold uppercase
                        tracking-[0.22em] text-soft-rose">
                            Profile Photo
                        </p>
                        <h3 className="mt-1 font-display text-xl text-primary">{data.fullName}</h3>
                        <div className="mt-3 flex flex-wrap justify-center gap-3
                             sm:justify-start">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onAvatarChange}
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="border-primary text-primary hover:bg-primary
                                                hover:text-primary-foreground"
                            >
                                <Camera className="mr-2 h-4 w-4"/> Upload / Update Photo
                            </Button>
                            <Button asChild variant="ghost">
                                <Link href="/change-password">
                                    <KeyRound className="mr-2 h-4 w-4"/> Change Password
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* Personal info */}
            <SectionCard>
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase
                        tracking-[0.22em] text-soft-rose">
                        Member Since {memberSince}
                    </p>
                    <div
                        className="grid grid-cols-[minmax(0,1fr)_auto]
                                        items-center gap-4 sm:flex sm:items-end
                                        sm:justify-between">
                        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)]
                            leading-tight tracking-tight text-primary">
                            Personal Information
                        </h2>
                        <Button
                            variant="outline"
                            onClick={openEdit}
                            className="shrink-0 border-primary text-primary
                                            hover:bg-primary
                                            hover:text-primary-foreground"
                        >
                            <Pencil className="mr-2 h-4 w-4"/> Edit Details
                        </Button>
                    </div>
                </div>
                <div className="my-6 h-px bg-blush/50"/>
                <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                    <Field label="Full Name" value={data.fullName || "—"}/>
                    <Field label="Phone Number" value={data.phone || "—"}/>
                    <Field label="Email Address" value={data.email || "—"}/>
                    <Field
                        label="Shipping Address"
                        value={
                            [data.street, data.city, data.state, data.postal, data.country]
                                .filter(Boolean)
                                .join(", ") || "—"
                        }
                    />
                </dl>
                {pendingEmail && (
                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border
                         border-blush/60 bg-blush/20 p-5 sm:flex-row sm:items-center
                         sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase
                                tracking-[0.18em] text-soft-rose">
                                Pending Email Change
                            </p>
                            <p className="mt-1 truncate text-sm text-on-surface">
                                Confirm <span className="font-semibold">{pendingEmail}</span> with
                                the code we emailed to it.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(true)}
                            className="shrink-0 border-primary text-primary hover:bg-primary
                                            hover:text-primary-foreground"
                        >
                            <MailCheck className="mr-2 h-4 w-4"/> Enter Code
                        </Button>
                    </div>
                )}
            </SectionCard>

            {/* Upcoming appointment preview */}
            <div>
                <SectionTitle
                    title="Upcoming Appointment"
                    action={{label: "View All", onClick: () => router.push("/appointments")}}
                />
                {!upcoming ? (
                    <p className="rounded-2xl border border-dashed
                       border-blush/60 bg-surface-lowest p-8
                       text-center text-sm text-on-surface-variant">
                        No upcoming appointments.
                    </p>
                ) : (
                    <Link
                        href="/appointments"
                        className="block rounded-2xl border border-blush/50
                                        bg-surface-lowest p-5 transition-colors
                                        hover:border-primary/40 sm:p-7"
                    >
                        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                            <div className="relative aspect-square w-full overflow-hidden
                                 rounded-xl">
                                <Image src="https://picsum.photos/seed/appointment-profile/400/400" alt={upcoming.serviceName} fill sizes="200px"
                                       className="object-cover"/>
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-blush/40 text-primary hover:bg-blush/40">Upcoming</Badge>
                                    <span className="text-xs uppercase tracking-[0.18em]
                                          text-on-surface-variant">
                                        #{upcoming.appointmentCode || upcoming.id}
                                    </span>
                                </div>
                                <h3 className="mt-3 font-display
                                    text-[clamp(1.35rem,2.4vw,1.85rem)]
                                    text-primary">
                                    {upcoming.serviceName}
                                </h3>
                                <p className="mt-3 text-sm text-on-surface-variant">
                                    {formatDateTime(upcoming.scheduledAt)}
                                </p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Recent orders preview */}
            <div>
                <SectionTitle
                    title="Recent Orders"
                    action={{label: "View All", onClick: () => router.push("/orders")}}
                />
                {recentOrders.length === 0 ? (
                    <p className="rounded-2xl border border-dashed
                       border-blush/60 bg-surface-lowest p-8
                       text-center text-sm text-on-surface-variant">
                        No recent orders found.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {recentOrders.map((o) => (
                            <li key={o.id}>
                                <Link
                                    href={`/orders/${o.id}`}
                                    className="grid grid-cols-[64px_minmax(0,1fr)_auto]
                                                    items-center gap-4 rounded-2xl border
                                                    border-blush/50 bg-surface-lowest p-4
                                                    transition-colors hover:border-primary/40
                                                    sm:grid-cols-[80px_minmax(0,1fr)_auto_auto_auto]"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden
                                         rounded-lg">
                                        <Image
                                            src={o.items[0]?.productImage || "https://picsum.photos/seed/order/80/80"}
                                            alt={o.items[0]?.productName || "Product"}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase
                                            tracking-[0.16em] text-on-surface-variant">
                                            Order #{o.orderCode || o.id} — {formatOrderDate(o.createdAt)}
                                        </p>
                                        <p className="mt-1 truncate font-display text-base text-primary">
                                            {o.items[0]?.productName || "Order"}
                                        </p>
                                    </div>
                                    <div className="hidden text-right sm:block">
                                        <p className="text-[10px] uppercase tracking-[0.14em]
                                            text-on-surface-variant">Total</p>
                                        <p className="text-sm">${o.total.toFixed(2)}</p>
                                    </div>
                                    <div className="hidden text-right sm:block">
                                        <p className="text-[10px] uppercase tracking-[0.14em]
                                            text-on-surface-variant">Status</p>
                                        <p className={`text-sm ${ORDER_STATUS_LABELS[o.orderStatus]?.chip ?? ""}`}>
                                            {ORDER_STATUS_LABELS[o.orderStatus]?.label ?? o.orderStatus}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-on-surface-variant"/>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Loyalty */}
            <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl bg-primary p-7
                 text-primary-foreground">
                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                        Verdant Luxe Status
                    </p>
                    <h3 className="mt-3 font-display
                 text-[clamp(1.3rem,2.4vw,1.85rem)]
                 leading-snug">
                        You are 250 points away from Gold Membership.
                    </h3>
                    <div className="mt-6">
                        <Progress value={75} className="h-1.5
                        bg-white/10 [&>div]:bg-champagne-gold"/>
                        <p className="mt-2 text-right text-xs
                        text-champagne-gold">750 / 1000</p>
                    </div>
                </div>
                <div className="rounded-2xl bg-blush/30 p-7">
                    <h3 className="font-display text-xl text-primary">Exclusive Invite: Autumn Preview</h3>
                    <button
                        onClick={() => toast.success("Invitation opened.")}
                        className="mt-8 inline-flex items-center text-sm
                                        font-semibold text-primary underline-offset-4
                                        hover:underline"
                    >
                        View Invitation
                    </button>
                </div>
            </div>

            {/* Edit dialog */}
            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your personal details below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={save} className="grid gap-4">
                        {FIELD_KEYS.map(([k, label]) => (
                            <div key={k} className="grid gap-1.5">
                                <Label htmlFor={k}>
                                    {label}
                                    {!isRequired(k) && (
                                        <span className="ml-1 font-normal text-on-surface-variant">(optional)</span>
                                    )}
                                </Label>
                                <Input
                                    id={k}
                                    type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                                    value={draft[k]}
                                    onChange={(e) =>
                                        setDraft({...draft, [k]: e.target.value})}
                                    placeholder={k === "country" ? "2-letter code, e.g. US" : undefined}
                                    maxLength={k === "country" ? 2 : undefined}
                                    required={isRequired(k)}
                                />
                            </div>
                        ))}
                        {emailChanging && (
                            <div className="grid gap-1.5 rounded-xl border border-blush/60
                                 bg-blush/20 p-4">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-on-surface-variant">
                                    Required to change your email. We&apos;ll send a code to the
                                    new address, and your current email stays active until you
                                    confirm it.
                                </p>
                            </div>
                        )}
                        <DialogFooter className="mt-2">
                            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmEmailChangeDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                pendingEmail={pendingEmail ?? ""}
                onConfirmed={(newEmail) => {
                    setData((prev) => ({...prev, email: newEmail}));
                    setPendingEmail(null);
                }}
            />
        </div>
    );
}

const ADDRESS_KEYS: (keyof ProfileData)[] = ["street", "city", "state", "postal", "country"];

function Field({label, value}: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-[10px] font-semibold uppercase
                 tracking-[0.18em] text-on-surface-variant">
                {label}
            </dt>
            <dd className="mt-1
            whitespace-pre-line
            text-on-surface">{value}</dd>
        </div>
    );
}
