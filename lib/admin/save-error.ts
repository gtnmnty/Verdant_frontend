import {toast} from "sonner";
import {isConcurrentModification} from "@/utils/graphqlClient";

// Shows why an admin save failed. A CONCURRENT_MODIFICATION (someone else saved this record after the dialog
// loaded it) gets a "Reload" action that refetches the record, because retrying the same save can never work:
// it still carries the old version.
export function showSaveError(err: unknown, fallback: string, reload: () => void) {
    if (isConcurrentModification(err)) {
        toast.error("Someone else changed this record while you were editing it.", {
            description: "Reload to see their changes, then make your edit again.",
            action: {label: "Reload", onClick: reload},
            duration: 15000,
        });
        return;
    }
    toast.error(err instanceof Error ? err.message : fallback);
}
