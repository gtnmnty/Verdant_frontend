import Image from "next/image";
import Link from "next/link";
import {ArrowLeft} from "@/app/auth/_components/ui/Icons";

export function AuthShell({children}: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-5xl py-[clamp(2rem,6vw,4rem)]">
            <Link
                href="/"
                className="mb-6 inline-flex items-center
        gap-2 text-xs font-semibold uppercase
        tracking-[0.18em] text-on-surface-variant
        transition-colors hover:text-primary"
            >
                <ArrowLeft className="h-3.5 w-3.5"/>
                Back to Verdant Luxe
            </Link>

            <div className="grid grid-cols-1 overflow-hidden
                      rounded-[2rem] border border-blush/40
                      bg-surface-lowest shadow-xl
                      lg:grid-cols-2">
                {/* Visual side */}
                <div className="relative hidden min-h-[28rem] lg:block">
                    <Image
                        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                        alt="Verdant Luxe boutique interior"
                        fill
                        sizes="50vw"
                        className="object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-t
                        from-stone-900/80 via-stone-900/20 to-transparent"/>
                    <div className="absolute inset-x-0 bottom-0 p-10">
                        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-rose-100/80">
                            The Verdant Luxe Boutique
                        </p>
                        <p className="mt-3 font-display text-2xl leading-snug text-rose-50">
                            Elegance is the only beauty that never fades.
                        </p>
                    </div>
                </div>

                {/* Form side */}
                <div className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-14">
                    <div className="w-full max-w-sm">{children}</div>
                </div>
            </div>
        </div>
    );
}
