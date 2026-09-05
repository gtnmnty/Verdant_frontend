import type {Metadata} from "next";
import {Suspense} from "react";
import {BookingForm} from "@/app/(site)/book/_components/BookingForm";

export const metadata: Metadata = {
    title: "Book an Appointment — Verdant Luxe",
    description:
        "Reserve your ritual at Verdant Luxe. " +
        "A member of our concierge will contact you " +
        "shortly to finalize details.",
    openGraph: {
        title: "Book an Appointment — Verdant Luxe",
        description: "Reserve your ritual at Verdant Luxe.",
    },
};

export default function BookPage() {
    return (
        <div className="pb-16 w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
            <header className="text-center">
                <p className="text-xs font-semibold uppercase
                tracking-[0.24em] text-soft-rose">
                    Reserve Your Ritual
                </p>
                <h1 className="mt-3 font-display
                text-[clamp(2rem,5vw,3.5rem)] leading-tight
                tracking-tight text-primary">
                    Book an Appointment
                </h1>
                <p className="mx-auto mt-4 max-w-xl
                text-sm text-on-surface-variant">
                    A member of our concierge will
                    contact you shortly to
                    finalize details.
                </p>
            </header>

            <Suspense fallback={null}>
                <BookingForm/>
            </Suspense>
        </div>
    );
}
