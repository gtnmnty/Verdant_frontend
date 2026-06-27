import { Reveal } from "@/utils/Reveal";

const GALLERY = [
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=800&q=80",
];

export default function AtmosphereSection() {
  return (
    <section id="atmosphere" className="py-[clamp(3rem,8vw,6rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <Reveal>
          <div className="space-y-4">
            <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] text-stone-800">
              The Atmosphere
            </h2>
            <p className="text-stone-500 leading-relaxed text-sm">
              Step inside our sanctuary of style. Every detail of the Parfois boutique
              is curated to provide a calm, luxurious escape from the world outside.
            </p>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-stone-600 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-stone-400" /> @parfois.boutique
            </p>
          </div>
        </Reveal>
        {GALLERY.slice(0, 2).map((src, i) => (
          <Reveal key={src} delay={(i + 1) * 150}>
            <div className="overflow-hidden rounded-2xl aspect-[3/4]">
              <img
                src={src}
                alt="Boutique atmosphere"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-110"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
