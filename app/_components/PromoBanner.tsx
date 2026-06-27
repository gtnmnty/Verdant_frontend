"use client";

import { Reveal } from "@/utils/Reveal";
import { SectionLabel } from "@/utils/SectionLabel";
import { smoothScrollTo } from "@/utils/smoothScrollTo";

export default function PromoBanner() {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[clamp(1rem,3vw,2rem)] bg-stone-900 text-rose-50 px-[clamp(1.5rem,5vw,4rem)] py-[clamp(2.5rem,6vw,5rem)] my-10">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-3">
            <SectionLabel>Limited Offer</SectionLabel>
            <h3 className="font-serif text-[clamp(1.75rem,4vw,3rem)] leading-tight">
              Enjoy 20% off your first signature treatment.
            </h3>
            <p className="text-rose-100/80 text-sm max-w-md">
              A complimentary consultation is included with every booking made this
              season.
            </p>
          </div>
          <button
            onClick={() => smoothScrollTo("cta")}
            className="rounded-full bg-rose-50 text-stone-900 px-6 py-3 text-sm font-medium tracking-wide transition-all hover:bg-white hover:scale-[1.03]"
          >
            Claim Offer →
          </button>
        </div>
      </section>
    </Reveal>
  );
}
