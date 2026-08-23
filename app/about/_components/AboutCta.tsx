import Link from "next/link";

export function AboutCta() {
    return (
        <section
            className="mx-[-5vw] bg-primary px-[5vw] py-[clamp(3rem,8vw,6rem)]
            text-center sm:mx-[-6vw] sm:px-[6vw] lg:mx-[-10vw] lg:px-[10vw]">
            <div className="mx-auto w-[min(90vw,1400px)]">
                <h2 className="font-display text-[clamp(1.75rem,4.5vw,3.25rem)]
                leading-tight text-primary-foreground">
                    Become part of
                    <br/>
                    the story.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-[clamp(12px,1vw,14px)]
                leading-relaxed text-primary-foreground/80">
                    Experience the transformation for yourself in our private ateliers.
                </p>
                <Link
                    href="/auth"
                    className="mt-8 inline-block border border-primary-foreground/60
                    px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.26em]
                    text-primary-foreground transition-colors
                    hover:bg-primary-foreground hover:text-primary"
                >
                    Book Your Consultation
                </Link>
            </div>
        </section>
    );
}
