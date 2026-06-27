"use client";

import { useState } from "react";
import { Reveal } from "@/utils/Reveal";
import { SectionLabel } from "@/utils/SectionLabel";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: "volume",
    name: "Absolute Volume",
    category: "Haircare",
    description: "Volumizing shampoo for normal to fine hair types.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "serum",
    name: "Cinnabari Serum",
    category: "Botanicals",
    description: "Revitalizing blood-tree extract for deep nourishment.",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "satin",
    name: "Mauve Satin",
    category: "Lip Studio",
    description: "High-pigment matte finish with a creamy texture.",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CollectionSection() {
  const [active, setActive] = useState<string>(PRODUCTS[0].id);

  return (
    <section
      id="collection"
      className="bg-stone-50 -mx-[clamp(1rem,4vw,3rem)] px-[clamp(1rem,4vw,3rem)] py-[clamp(3rem,8vw,6rem)] rounded-[clamp(1rem,3vw,2rem)]"
    >
      <div className="text-center mb-12 space-y-3">
        <SectionLabel>The Shop</SectionLabel>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-stone-800">
          Luxe Collection
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            <article
              onMouseEnter={() => setActive(p.id)}
              className={`bg-white rounded-2xl p-5 transition-all duration-500 ${
                active === p.id ? "shadow-xl -translate-y-1" : "shadow-sm"
              }`}
            >
              <div className="overflow-hidden rounded-xl aspect-square mb-6 bg-stone-100">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[0.65rem] tracking-[0.3em] uppercase text-rose-400">
                  {p.category}
                </p>
                <h3 className="font-serif text-lg text-stone-800">{p.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed pb-3">
                  {p.description}
                </p>
                <button className="text-[0.7rem] tracking-[0.3em] uppercase text-stone-700 border-b border-stone-300 pb-1 transition-colors hover:border-stone-700">
                  Shop Now
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
