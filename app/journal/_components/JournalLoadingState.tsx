const SKELETON_HEIGHTS = [
    "h-64",
    "h-80",
    "h-56",
    "h-96",
    "h-72",
    "h-60",
    "h-88",
    "h-68",
];

export function JournalLoadingState() {
    return (
        <div
            className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4"
            aria-busy="true"
            aria-live="polite"
        >
            {SKELETON_HEIGHTS.map((height, i) => (
                <div
                    key={i}
                    className={`w-full animate-pulse break-inside-avoid rounded-2xl bg-surface-low ${height}`}
                />
            ))}
        </div>
    );
}
