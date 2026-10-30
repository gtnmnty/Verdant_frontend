"use client";

import {useCallback, useEffect, useState, type SubmitEvent} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {ArrowRight, LifeBuoy, MessageCircle, Sparkles} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {gqlRequest} from "@/utils/graphqlClient";
import {EmptyBlock, PageIntro, SectionTitle} from "@/app/(site)/account/_components/shared";
import {
    FAQS,
    ticketTone,
    type Ticket,
} from "@/app/(site)/account/_components/data";

const STATUS_LABEL: Record<string, Ticket["status"]> = {
    OPEN: "Open",
    IN_REVIEW: "In Review",
    RESOLVED: "Resolved",
};

interface TicketSummary {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    createdAt: string;
}

const SUPPORT_QUERY = `
    query AccountSupport {
        me { fullName email }
        mySupportTickets(page: 1, pageSize: 10) {
            items { id ticketNumber subject status createdAt }
        }
    }
`;

const CREATE_TICKET_MUTATION = `
    mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
        createSupportTicket(input: $input) { id }
    }
`;

function toTicket(t: TicketSummary): Ticket {
    return {
        id: t.ticketNumber,
        subject: t.subject,
        status: STATUS_LABEL[t.status] ?? "Open",
        date: new Date(t.createdAt).toLocaleDateString("en-US", {month: "short", day: "2-digit", year: "numeric"}),
    };
}

export function SupportSection() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    // Prefilled from the signed-in profile (was a hard-coded placeholder person).
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const loadTickets = useCallback(async (prefillContact: boolean) => {
        try {
            const res = await gqlRequest<{
                me: { fullName: string; email: string };
                mySupportTickets: { items: TicketSummary[] };
            }>(SUPPORT_QUERY);
            setTickets(res.mySupportTickets.items.map(toTicket));
            if (prefillContact) {
                setForm((f) => ({...f, name: f.name || res.me.fullName, email: f.email || res.me.email}));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load your tickets.");
        }
    }, []);

    useEffect(() => {
        void loadTickets(true);
    }, [loadTickets]);

    const submit = async (e: SubmitEvent) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) {
            toast.error("Please complete required fields.");
            return;
        }
        setSubmitting(true);
        try {
            await gqlRequest(CREATE_TICKET_MUTATION, {
                input: {
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                    contactName: form.name.trim(),
                    contactEmail: form.email.trim(),
                },
            });
            setForm((f) => ({...f, subject: "", message: ""}));
            toast.success("Ticket submitted. Our team will get back to you by email.");
            await loadTickets(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to submit your ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end
                 sm:justify-between">
                <PageIntro title="Support & FAQ" subtitle="We are here whenever you need us."/>
                <Button asChild variant="outline" className="shrink-0 border-primary text-primary">
                    <Link href="/help-support">
                        Full Help Center <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>

            <div>
                <SectionTitle title="Frequently Asked"/>
                <Accordion type="single" collapsible className="rounded-2xl border border-blush/50
                 bg-surface-lowest px-5">
                    {FAQS.map((f, i) => (
                        <AccordionItem key={i} value={`f-${i}`}>
                            <AccordionTrigger className="text-left font-display text-base text-primary
                 hover:no-underline">
                                {f.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm leading-relaxed text-on-surface-variant">
                                {f.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div>
                    <SectionTitle title="Contact Support"/>
                    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blush/50
                    bg-surface-lowest p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label>Name</Label>
                                <Input value={form.name} onChange={(e) =>
                                    setForm({...form, name: e.target.value})}
                                       required/>
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({...form, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Subject</Label>
                            <Input value={form.subject}
                                   onChange={(e) =>
                                       setForm({...form, subject: e.target.value})}
                                   required/>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Message</Label>
                            <Textarea
                                rows={5}
                                value={form.message}
                                onChange={(e) =>
                                    setForm({...form, message: e.target.value})}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Sending…" : "Send Message"}
                        </Button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-blush/50
                    bg-surface-lowest p-6">
                        <h3 className="font-display text-lg text-primary">Live Chat</h3>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            Our concierge is available Mon – Sat, 9:00 AM to 6:00 PM EST.
                        </p>
                        <Button onClick={() =>
                            toast.success("Live chat opening soon…")} className="mt-4 w-full">
                            <MessageCircle className="mr-2 h-4 w-4"/> Start Live Chat
                        </Button>
                    </div>
                    <div className="rounded-2xl border border-blush/50
                    bg-surface-lowest p-6">
                        <h3 className="font-display text-lg text-primary">Helpful Resources</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            {["Shipping & Delivery", "Returns & Refunds",
                                "Booking Policy", "Privacy & Care"].map((r) => (
                                <li key={r}>
                                    <a href="#" className="inline-flex items-center gap-2
                                    text-on-surface-variant hover:text-primary">
                                        <Sparkles className="h-3.5 w-3.5 text-champagne-gold"/> {r}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div>
                <SectionTitle title="Ticket History"/>
                {tickets.length === 0 ? (
                    <EmptyBlock icon={LifeBuoy} title="No tickets" body="Submitted requests will appear here."/>
                ) : (
                    <div className="overflow-hidden rounded-2xl border
                    border-blush/50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-blush/10 text-[10px] uppercase
                            tracking-[0.18em] text-on-surface-variant">
                            <tr>
                                {["Ticket", "Subject", "Date", "Status"].map((h) => (
                                    <th key={h} className="px-5 py-3">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {tickets.map((t) => (
                                <tr key={t.id} className="border-t border-blush/40">
                                    <td className="px-5 py-4 font-mono text-xs">{t.id}</td>
                                    <td className="px-5 py-4">{t.subject}</td>
                                    <td className="px-5 py-4 text-on-surface-variant">{t.date}</td>
                                    <td className="px-5 py-4">
                                        <Badge variant="outline" className={ticketTone(t.status)}>
                                            {t.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
