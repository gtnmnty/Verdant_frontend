import {NotebookText} from "lucide-react";

export function JournalEmptyState() {
    return (
        <div className="flex flex-col items-center
        rounded-xl bg-surface-low px-6 py-24 text-center">
            <div className="grid h-14 w-14 place-items-center
            rounded-full bg-surface-lowest text-primary">
                <NotebookText className="h-6 w-6"/>
            </div>
            <h2 className="mt-6 font-display text-2xl
            text-on-surface">
                No stories match your search
            </h2>
            <p className="mt-2 max-w-sm text-sm
            text-on-surface-variant">
                Try a different stylist, service,
                or product — or browse all client
                stories instead.
            </p>
        </div>
    );
}
