"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SearchSelectOption {
  id: string;
  name: string;
  imageUrl?: string | null;
}

// A text input that doubles as a select: typing searches (via `fetchOptions`), clicking a result picks it.
// While closed it shows the picked option's name; opening it clears the box so the admin can search.
export function SearchSelect({
  value,
  onChange,
  fetchOptions,
  placeholder = "Search…",
  invalid = false,
  ariaLabel,
}: {
  value: SearchSelectOption | null;
  onChange: (option: SearchSelectOption) => void;
  fetchOptions: (query: string) => Promise<SearchSelectOption[]>;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      fetchOptions(query.trim())
        .then((res) => !cancelled && setOptions(res))
        .catch(() => !cancelled && setOptions([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query, fetchOptions]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = (option: SearchSelectOption) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
      <Input
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        value={open ? query : (value?.name ?? "")}
        placeholder={value && open ? value.name : placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="pl-9 pr-9"
      />
      <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-admin-line bg-admin-surface shadow-md"
        >
          {options.map((o) => (
            <li key={o.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value?.id === o.id}
                onClick={() => pick(o)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-admin-cream"
              >
                {o.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URLs
                  <img src={o.imageUrl} alt="" className="size-7 shrink-0 rounded object-cover" />
                ) : (
                  <span className="size-7 shrink-0 rounded bg-admin-cream" />
                )}
                <span className="truncate">{o.name}</span>
              </button>
            </li>
          ))}
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-admin-muted">{loading ? "Searching…" : "No results"}</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
