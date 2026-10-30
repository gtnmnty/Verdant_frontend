import {NotebookText} from "lucide-react";

export function JournalEmptyState() {
    return (
        <div className="flex flex-col items-center
        rounded-[clamp(0.75rem,1.2vw,1rem)] bg-surface-low
        px-[clamp(1.25rem,4vw,3rem)] py-[clamp(3.5rem,10vw,7rem)] text-center">
            <div className="grid size-[clamp(3rem,calc(2.5rem+1.5vw),4rem)] place-items-center
            rounded-full bg-surface-lowest text-primary">
                <NotebookText className="size-[45%]"/>
            </div>
            <h2 className="mt-[clamp(1rem,2vw,1.75rem)] font-display text-fluid-2xl
            text-on-surface">
                No stories match your search
            </h2>
            <p className="mt-[0.5em] max-w-[clamp(18rem,30vw,26rem)] text-fluid-sm
            text-on-surface-variant">
                Try a different stylist, service,
                or product — or browse all client
                stories instead.
            </p>
        </div>
    );
}
