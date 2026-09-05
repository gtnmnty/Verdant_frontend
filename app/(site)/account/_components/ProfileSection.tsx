"use client";

import {useRouter} from "next/navigation";
import React, {useRef, useState, type SubmitEvent} from "react";
import Link from "next/link";
import Image from "next/image";
import {toast} from "sonner";
import {Camera, ChevronRight, KeyRound, Pencil} from "lucide-react";
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
import {SEED as APPT_SEED, formatDateTime} from "@/app/(site)/appointments/_components/data";
import {
    ORDERS,
    STATUS_LABELS as ORDER_STATUS_LABELS,
    formatDate as formatOrderDate,
} from "@/app/(site)/orders/_components/data";

interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    country: string;
}

const FIELD_KEYS = [
    ["fullName", "Full Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["street", "Street"],
    ["city", "City"],
    ["country", "Country"],
] as const;

export function ProfileSection() {
    const router = useRouter();
    const [data, setData] = useState<ProfileData>({
        fullName: "Elena Rodriguez",
        email: "elena.rodriguez@verdantluxe.com",
        phone: "+33 (0) 6 12 34 56 78",
        street: "Rue du Faubourg Saint-Honoré",
        city: "75008 Paris",
        country: "France",
    });
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(data);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openEdit = () => {
        setDraft(data);
        setEditing(true);
    };
    const save = (e: SubmitEvent) => {
        e.preventDefault();
        setData(draft);
        setEditing(false);
        toast.success("Profile updated.");
    };

    const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarUrl(reader.result as string);
            toast.success("Photo updated.");
        };
        reader.readAsDataURL(file);
    };

    const upcoming = APPT_SEED.find((a) => a.status === "upcoming");
    const recentOrders = ORDERS.slice(0, 3);

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
                        Member Since 2022
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
                    <Field label="Full Name" value={data.fullName}/>
                    <Field label="Phone Number" value={data.phone}/>
                    <Field label="Email Address" value={data.email}/>
                    <Field label="Shipping Address" value={`${data.street}\n${data.city}, ${data.country}`}/>
                </dl>
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
                                <Image src={upcoming.image} alt={upcoming.service} fill sizes="200px"
                                       className="object-cover"/>
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-blush/40 text-primary hover:bg-blush/40">Upcoming</Badge>
                                    <span className="text-xs uppercase tracking-[0.18em]
                 text-on-surface-variant">
                                        #{upcoming.id}
                                    </span>
                                </div>
                                <h3 className="mt-3 font-display
                 text-[clamp(1.35rem,2.4vw,1.85rem)]
                 text-primary">
                                    {upcoming.service}
                                </h3>
                                <p className="mt-1 text-sm text-on-surface-variant">with {upcoming.stylist}</p>
                                <p className="mt-3 text-sm text-on-surface-variant">
                                    {formatDateTime(upcoming.date)}
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
                                    <Image src={o.items[0].image} alt="" fill sizes="80px" className="object-cover"/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.16em] text-on-surface-variant">
                                        Order #{o.id} — {formatOrderDate(o.date)}
                                    </p>
                                    <p className="mt-1 truncate font-display text-base text-primary">
                                        {o.items[0].name}
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
                                    <p className={`text-sm ${ORDER_STATUS_LABELS[o.status].chip}`}>
                                        {ORDER_STATUS_LABELS[o.status].label}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-on-surface-variant"/>
                            </Link>
                        </li>
                    ))}
                </ul>
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
                                <Label htmlFor={k}>{label}</Label>
                                <Input
                                    id={k}
                                    value={draft[k]}
                                    onChange={(e) => setDraft({...draft, [k]: e.target.value})}
                                    required
                                />
                            </div>
                        ))}
                        <DialogFooter className="mt-2">
                            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
