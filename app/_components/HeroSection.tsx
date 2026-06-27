"use client";

import { smoothScrollTo } from "@/utils/smoothScrollTo";
import { SectionLabel } from "@/utils/SectionLabel";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#d9b3ae] -mx-[10vw]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center px-[10vw] py-[clamp(2rem,6vw,5rem)]">
        <div className="space-y-6 animate-[fadeIn_1s_ease-out]">
          <SectionLabel>The Parfois Boutique</SectionLabel>
          <h1 className="font-serif text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] text-stone-800 tracking-tight">
            Hair Is <em className="italic font-light">Our Craft</em>
          </h1>
          <p className="text-stone-600 text-[clamp(0.95rem,1.2vw,1.05rem)] max-w-md leading-relaxed">
            Experience the ultimate in boutique hair styling and luxe care. Our expert
            stylists create professional works of art designed to exceed your every
            expectation.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => smoothScrollTo("services")}
              className="group inline-flex items-center gap-2 rounded-full bg-stone-900 text-rose-50 px-6 py-3 text-sm font-medium tracking-wide transition-all hover:bg-stone-800 hover:scale-[1.03] hover:shadow-lg"
            >
              Book Your Experience
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => smoothScrollTo("services")}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/60 backdrop-blur px-6 py-3 text-sm font-medium text-stone-700 transition-all hover:bg-white hover:border-stone-400"
            >
              Explore Services
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="relative h-[clamp(18rem,45vw,32rem)] flex items-end justify-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-rose-300/30 blur-3xl translate-y-6"
          />
          <img
            src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=900&q=80"
            alt="Salon model with pink hair, side profile"
            className="relative z-10 h-full w-auto max-w-full object-cover rounded-[2rem] shadow-2xl animate-[float_6s_ease-in-out_infinite] transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  );
}
