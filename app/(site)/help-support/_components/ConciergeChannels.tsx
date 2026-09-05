"use client";

import {toast} from "sonner";
import {Mail, MessageSquare, Phone} from "lucide-react";

export function ConciergeChannels() {
    return (
        <section className="mt-[clamp(3rem,7vw,6rem)] text-center">
            <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.25rem)] text-primary">
                Direct Concierge Channels
            </h2>
            <p className="mx-auto mt-3 max-w-md
            text-[clamp(12px,1vw,14px)] leading-relaxed
            text-on-surface-variant">
                Prefer a personal conversation? Our team is available through the
                following avenues.
            </p>

            <div
                className="mt-[clamp(2rem,4vw,3.5rem)]
                grid gap-6 rounded-2xl border border-blush/40
                sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-blush/40">
                <div className="min-w-0 px-4 py-8">
                    <Mail className="mx-auto h-6 w-6 text-primary"/>
                    <h3 className="mt-5 text-[10px] font-semibold uppercase
                    tracking-[0.24em] text-on-surface-variant">
                        Email Enquiries
                    </h3>
                    <p className="mx-auto mt-3 max-w-[16rem]
                    text-[clamp(12px,1vw,14px)]
                    leading-relaxed text-on-surface-variant">
                        For detailed service requests and press inquiries.
                    </p>
                    <a
                        href="mailto:concierge@verdantluxe.com"
                        className="mt-5 inline-block
                        text-[clamp(12px,1vw,14px)]
                        text-primary hover:opacity-70"
                    >
                        concierge@verdantluxe.com
                    </a>
                </div>

                <div className="min-w-0 px-4 py-8">
                    <Phone className="mx-auto h-6 w-6 text-primary"/>
                    <h3 className="mt-5 text-[10px]
                    font-semibold uppercase tracking-[0.24em]
                    text-on-surface-variant">
                        Voice Assistance
                    </h3>
                    <p className="mx-auto mt-3 max-w-[16rem]
                    text-[clamp(12px,1vw,14px)]
                    leading-relaxed text-on-surface-variant">
                        Available Mon–Fri, 9am to 8pm EST for immediate help.
                    </p>
                    <a
                        href="tel:+18005893724"
                        className="mt-5 inline-block
                        text-[clamp(12px,1vw,14px)]
                        text-primary hover:opacity-70"
                    >
                        +1 800 LUXE VERDANT
                    </a>
                </div>

                <div className="min-w-0 px-4 py-8">
                    <MessageSquare className="mx-auto h-6 w-6 text-primary"/>
                    <h3 className="mt-5 text-[10px]
                    font-semibold uppercase tracking-[0.24em]
                    text-on-surface-variant">
                        Live Concierge
                    </h3>
                    <p className="mx-auto mt-3 max-w-[16rem]
                    text-[clamp(12px,1vw,14px)] leading-relaxed
                    text-on-surface-variant">
                        Instant digital messaging for quick styling or booking
                        adjustments.
                    </p>
                    <button
                        type="button"
                        onClick={() => toast.success(
                            "A concierge will be with you shortly…"
                        )}
                        className="mt-5 rounded-full bg-primary
                        px-6 py-2.5 text-[10px] font-semibold
                        uppercase tracking-[0.22em]
                        text-primary-foreground
                        transition-opacity
                        hover:opacity-90"
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        </section>
    );
}
