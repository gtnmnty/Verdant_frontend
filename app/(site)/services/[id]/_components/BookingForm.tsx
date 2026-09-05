"use client";

import React, {useState, type SubmitEvent} from "react";
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
import {BRANCHES, TIME_SLOTS} from "@/app/(site)/services/[id]/_components/data";
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

export function BookingForm({
    serviceId,
    serviceName,
    price,
    userId,
    stylists,
    qty,
}: {
    serviceId: string;
    serviceName: string;
    price: number;
    userId: string | null;
    stylists: StylistData[];
    qty: number;
}) {
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [stylist, setStylist] = useState<string>(stylists[0]?.id ?? "");
    const [date, setDate] = useState("");
    const [time, setTime] = useState(TIME_SLOTS[0]);
    const [submitting, setSubmitting] = useState(false);

    const totalPrice = price * qty;

    const handleBook = (e: SubmitEvent) => {
        e.preventDefault();
        if (!date) {
            toast.error("Please choose a date.");
            return;
        }
        if (!userId) {
            toast.error("Please sign in to book an appointment.");
            return;
        }
        if (!stylist) {
            toast.error("No stylist is available for this service yet.");
            return;
        }

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

        setSubmitting(true);
        gqlRequest(BOOK_APPOINTMENT_MUTATION, {
            input: {
                userId,
                serviceId,
                stylistId: stylist,
                // No in-salon/home-service picker in this form yet — defaults to in-salon.
                serviceType: "IN_SALON",
                scheduledAt,
                guests: qty,
            },
        })
            .then(() => {
                toast.success("Appointment confirmed", {
                    description: `${serviceName} · ${date} at ${time}`,
                });
                setDate("");
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to book appointment.");
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
                {/* No public branches endpoint yet — this stays a static list. */}
                <Field label="Branch" icon={<MapPin className="h-3.5 w-3.5"/>}>
                    <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="w-full">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {BRANCHES.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Preferred Stylist">
                    <Select value={stylist} onValueChange={setStylist} disabled={stylists.length === 0}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={stylists.length === 0 ? "No stylists available" : undefined}/>
                        </SelectTrigger>
                        <SelectContent>
                            {stylists.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Date" icon={<CalendarIcon className="h-3.5 w-3.5"/>}>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
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