"use client";

import { useState } from "react";
import { Reveal } from "@/utils/Reveal";
import { SectionLabel } from "@/utils/SectionLabel";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("done"), 900);
  };

  return (
    <section
      id="cta"
      className="py-[clamp(3rem,8vw,6rem)] text-center max-w-2xl mx-auto"
    >
      <Reveal>
        <SectionLabel>Stay Connected</SectionLabel>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-stone-800 mt-3 mb-4">
          Join the Parfois circle.
        </h2>
        <p className="text-stone-500 mb-8">
          Receive seasonal editorials, early access to new treatments, and curated
          beauty rituals.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 min-w-0 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-700 transition"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-stone-900 text-rose-50 px-6 py-3 text-sm font-medium tracking-wide transition-all hover:bg-stone-800 hover:scale-[1.03] disabled:opacity-60"
          >
            {status === "loading"
              ? "Subscribing..."
              : status === "done"
              ? "✓ Welcome"
              : "Subscribe"}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
