import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {FAQ} from "@/app/(site)/collections/[id]/_components/data";
import {SectionTitle} from "@/app/(site)/collections/[id]/_components/shared";

export function FaqSection() {
    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="Need To Know" title="Frequently Asked"/>
            <Accordion type="single" collapsible className="mt-6">
                {FAQ.map((f, i) => (
                    <AccordionItem key={i} value={`f-${i}`}>
                        <AccordionTrigger>{f.q}</AccordionTrigger>
                        <AccordionContent>{f.a}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
