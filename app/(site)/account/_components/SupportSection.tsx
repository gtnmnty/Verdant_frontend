"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, LifeBuoy, MessageCircle, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyBlock, PageIntro, SectionTitle } from "@/app/(site)/account/_components/shared";
import {
  FAQS,
  INITIAL_TICKETS,
  ticketTone,
  type Ticket,
} from "@/app/(site)/account/_components/data";

export function SupportSection() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [form, setForm] = useState({
    name: "Elena Rodriguez",
    email: "elena.rodriguez@verdantluxe.com",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      toast.error("Please complete required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const t: Ticket = {
        id: `T-${Math.floor(2000 + Math.random() * 999)}`,
        subject: form.subject,
        status: "Open",
        date: "Today",
      };
      setTickets((p) => [t, ...p]);
      setForm({ ...form, subject: "", message: "" });
      setSubmitting(false);
      toast.success("Ticket submitted.");
    }, 700);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end
                 sm:justify-between">
        <PageIntro title="Support & FAQ" subtitle="We are here whenever you need us." />
        <Button asChild variant="outline" className="shrink-0 border-primary text-primary">
          <Link href="/help-support">
            Full Help Center <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div>
        <SectionTitle title="Frequently Asked" />
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
          <SectionTitle title="Contact Support" />
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-blush/50
                 bg-surface-lowest p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="grid gap-1.5">
              <Label>Message</Label>
              <Textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
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
            <Button onClick={() => toast.success("Live chat opening soon…")} className="mt-4 w-full">
              <MessageCircle className="mr-2 h-4 w-4" /> Start Live Chat
            </Button>
          </div>
          <div className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-6">
            <h3 className="font-display text-lg text-primary">Helpful Resources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {["Shipping & Delivery", "Returns & Refunds", "Booking Policy", "Privacy & Care"].map((r) => (
                <li key={r}>
                  <a href="#" className="inline-flex items-center gap-2
                 text-on-surface-variant hover:text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-champagne-gold" /> {r}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle title="Ticket History" />
        {tickets.length === 0 ? (
          <EmptyBlock icon={LifeBuoy} title="No tickets" body="Submitted requests will appear here." />
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
