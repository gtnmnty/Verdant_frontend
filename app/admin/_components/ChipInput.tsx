"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ChipInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (chip: string) => onChange(value.filter((v) => v !== chip));

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-admin-line bg-admin-surface p-2">
      {value.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded-full bg-admin-sage px-2.5 py-1 text-xs font-medium text-admin-ink"
        >
          {chip}
          <button
            type="button"
            onClick={() => remove(chip)}
            aria-label={`Remove ${chip}`}
            className="rounded-full hover:bg-admin-sage-deep"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="h-7 min-w-[8rem] flex-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
