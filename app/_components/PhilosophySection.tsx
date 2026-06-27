import { Reveal } from "@/utils/Reveal";
import { SectionLabel } from "@/utils/SectionLabel";

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="py-[clamp(3rem,8vw,6rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <Reveal>
          <div className="overflow-hidden rounded-2xl aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
              alt="Close-up of refined makeup artistry"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1500ms] hover:scale-105"
            />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="space-y-6">
            <SectionLabel>Philosophy</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] text-stone-800">
              Elegance is the only beauty that never fades.
            </h2>
            <p className="italic text-stone-600 leading-relaxed border-l-2 border-rose-300 pl-4">
              We believe that true beauty resides in simplicity. Our approach is to
              refine, not replace — to enhance the natural grace that exists in every
              client.
            </p>
            <p className="text-stone-500 leading-relaxed">
              At Parfois, we don&apos;t just follow trends. We study your movement, your
              features, and your lifestyle to craft a signature aesthetic that is
              undeniably yours.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
