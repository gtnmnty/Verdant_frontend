"use client";

import React, {useEffect, useState, type SubmitEvent} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {Calendar as CalendarIcon, MapPin} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {gqlRequest} from "@/utils/graphqlClient";
import {useAuth} from "@/context/AuthContext";
import {TIME_SLOTS} from "@/app/(site)/services/[id]/_components/data";
import {SectionTitle} from "@/app/(site)/services/[id]/_components/shared";
import type {StylistData} from "@/app/(site)/services/[id]/_components/StylistsSection";

const BOOK_APPOINTMENT_MUTATION = `
    mutation BookAppointment($input: CreateAppointmentInput!) {
        bookAppointment(input: $input) {
            id
            appointmentCode
            scheduledAt
        }
    }
`;

// Public query: only branches that are currently open.
const BRANCHES_QUERY = `
    query BookingBranches {
        branches { id name }
    }
`;

interface BranchOption {
    id: string;
    name: string;
}

// Select value meaning "no preferred stylist" (the backend books the appointment unassigned).
const ANY_STYLIST = "any";

export function BookingForm({
    serviceId,
    serviceName,
    price,
    stylists,
    qty,
}: {
    serviceId: string;
    serviceName: string;
    price: number;
    stylists: StylistData[];
    qty: number;
}) {
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [branch, setBranch] = useState("");
    const [stylist, setStylist] = useState<string>(ANY_STYLIST);
    const [date, setDate] = useState("");
    const [time, setTime] = useState(TIME_SLOTS[0]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ branch?: string; date?: string; form?: string }>({});
    const {token, loading: authLoading} = useAuth();

    const totalPrice = price * qty;

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ branches: BranchOption[] }>(BRANCHES_QUERY)
            .then((res) => {
                if (cancelled) return;
                setBranches(res.branches);
                setBranch((current) => current || res.branches[0]?.id || "");
            })
            .catch(() => { if (!cancelled) setBranches([]); });
        return () => { cancelled = true; };
    }, []);

    // Only offer stylists who work at the chosen branch (stylists without a branch stay available everywhere).
    const branchStylists = stylists.filter((s) => !s.branchId || !branch || s.branchId === branch);

    const changeBranch = (id: string) => {
        setBranch(id);
        const stillValid = stylists.some((s) => s.id === stylist && (!s.branchId || s.branchId === id));
        if (!stillValid) setStylist(ANY_STYLIST);
    };

    const handleBook = (e: SubmitEvent) => {
        e.preventDefault();

        // Missing input is shown next to the field, not as a popup.
        const found: typeof errors = {};
        if (!branch) found.branch = "Please choose a branch.";
        if (!date) found.date = "Please choose a date.";
        else if (new Date(`${date}T${time}:00`).getTime() <= Date.now()) {
            found.date = "Please choose a date and time in the future.";
        }
        // The session restore may still be running after a refresh: wait for it instead of calling it "signed out".
        if (!authLoading && !token) found.form = "signin";
        setErrors(found);
        if (Object.keys(found).length > 0 || authLoading) return;

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

        setSubmitting(true);
        gqlRequest(BOOK_APPOINTMENT_MUTATION, {
            input: {
                serviceId,
                // Optional: left out, the appointment is booked unassigned.
                stylistId: stylist === ANY_STYLIST ? undefined : stylist,
                branchId: branch,
                // No in-salon/home-service picker in this form yet — defaults to in-salon.
                serviceType: "IN_SALON",
                scheduledAt,
                guests: qty,
            },
        })
            .then(() => {
                setErrors({});
                toast.success("Appointment confirmed", {
                    description: `${serviceName} · ${date} at ${time}`,
                });
                setDate("");
            })
            .catch((err) => {
                setErrors({form: err instanceof Error ? err.message : "Failed to book appointment."});
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <section
            id="booking"
            className="mt-[clamp(40px,6vw,80px)] rounded-2xl border
                      border-border bg-surface-lowest
                      p-[clamp(20px,3vw,40px)]"
        >
            <SectionTitle eyebrow="Reserve Your Ritual" title="Book Appointment"/>
            <form
                onSubmit={handleBook}
                className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2
                        lg:grid-cols-[1fr_1fr_1fr_auto]"
            >
                <Field label="Branch" icon={<MapPin className="h-3.5 w-3.5"/>}>
                    <Select
                        value={branch}
                        onValueChange={(v) => {
                            changeBranch(v);
                            setErrors((e) => ({...e, branch: undefined}));
                        }}
                        disabled={branches.length === 0}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={branches.length === 0 ? "No branches available" : undefined}/>
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError message={errors.branch}/>
                </Field>

                <Field label="Preferred Stylist (optional)">
                    <Select value={stylist} onValueChange={setStylist}>
                        <SelectTrigger className="w-full">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY_STYLIST}>Any available stylist</SelectItem>
                            {branchStylists.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Date" icon={<CalendarIcon className="h-3.5 w-3.5"/>}>
                    <Input
                        type="date"
                        value={date}
                        aria-invalid={!!errors.date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setErrors((er) => ({...er, date: undefined}));
                        }}
                    />
                    <FieldError message={errors.date}/>
                </Field>

                <Field label="Time">
                    <Select value={time} onValueChange={setTime}>
                        <SelectTrigger className="w-full">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {TIME_SLOTS.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <div className="md:col-span-2 lg:col-span-4">
                    {errors.form ? (
                        <p role="alert"
                           className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {errors.form === "signin" ? (
                                <>
                                    Please <Link href="/auth" className="font-semibold underline">sign in</Link> to
                                    book an appointment.
                                </>
                            ) : errors.form}
                        </p>
                    ) : null}
                    <div className="flex flex-col items-stretch justify-between
                         gap-4 border-t border-border pt-5 sm:flex-row
                         sm:items-center">
                        <div>
                            <p className="text-[10px] font-semibold uppercase
                                tracking-[0.2em] text-on-surface-variant">
                                Total
                            </p>
                            <p className="font-display text-2xl text-primary">
                                ${totalPrice.toLocaleString()}
                                <span className="ml-2 text-xs text-on-surface-variant">
                                  ({qty} {qty === 1 ? "guest" : "guests"})
                                </span>
                            </p>
                        </div>
                        <Button type="submit" disabled={submitting} size="lg" className="uppercase tracking-[0.18em]">
                            {submitting ? "Confirming…" : "Confirm Booking"}
                        </Button>
                    </div>
                </div>
            </form>
        </section>
    );
}

function Field({
   label,
   icon,
   children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label className="mb-2 flex items-center gap-1.5 text-[10px]
                 font-semibold uppercase tracking-[0.18em]
                 text-on-surface-variant">
                {icon} {label}
            </Label>
            {children}
        </div>
    );
}

function FieldError({message}: { message?: string }) {
    return message ? <p className="mt-1.5 text-xs text-destructive">{message}</p> : null;
}
