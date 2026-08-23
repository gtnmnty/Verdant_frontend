"use client";

import {useState, type SubmitEvent} from "react";
import Image from "next/image";
import {toast} from "sonner";

const BANNER_IMAGE =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1800&q=80";

export function StayInspired() {
    const [email, setEmail] = useState("");

    const onSubscribe = (e: SubmitEvent) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setEmail("");
        toast.success("You're on the list — stay inspired.");
    };

    return (
        <section
            className="relative isolate mt-[clamp(2.5rem,6vw,5rem)]
            mx-[-5vw] overflow-hidden rounded-[clamp(1rem,3vw,2rem)]
            sm:mx-[-6vw] lg:mx-[-10vw]">
            <div className="relative min-h-80">
                <Image
                    src={BANNER_IMAGE}
                    alt="Styling shears resting on a linen surface"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/55"/>
                <div className="relative flex flex-col items-center
                px-4 py-[clamp(2.5rem,7vw,5rem)] text-center">
                    <h2 className="font-display
                    text-[clamp(1.75rem,4.5vw,3rem)]
                    text-primary-foreground">
                        Stay Inspired
                    </h2>
                    <form
                        onSubmit={onSubscribe}
                        className="mt-6 flex w-full max-w-md
                        flex-col gap-2 sm:flex-row"
                    >
                        <label htmlFor="help-newsletter" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="help-newsletter"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="min-w-0 flex-1 rounded-full
                            border border-surface/40 bg-surface/95
                            px-4 py-3 text-sm text-on-surface outline-none
                            placeholder:text-on-surface-variant/70
                            focus:border-champagne-gold"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-surface
                            px-6 py-3 text-[10px] font-semibold
                            uppercase tracking-[0.22em] text-primary
                            transition-opacity hover:opacity-90"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
