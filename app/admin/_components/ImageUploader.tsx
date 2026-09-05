"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  max = 4,
  primaryIndex,
  onPrimaryChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  max?: number;
  primaryIndex?: number;
  onPrimaryChange?: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = max - images.length;
    const picked = Array.from(files).slice(0, room);
    const dataUrls = await Promise.all(picked.map(readAsDataUrl));
    onChange([...images, ...dataUrls]);
  };

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (onPrimaryChange && primaryIndex !== undefined && idx <= primaryIndex) {
      onPrimaryChange(Math.max(0, primaryIndex - 1));
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-lg border border-admin-line bg-admin-cream"
          >
            <Image src={src} alt={`Image ${i + 1}`} fill sizes="150px" className="object-cover" />
            <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
              {onPrimaryChange ? (
                <button
                  type="button"
                  onClick={() => onPrimaryChange(i)}
                  aria-label="Set as primary image"
                  className={`grid size-6 place-items-center rounded-full ${
                    primaryIndex === i ? "bg-admin-amber text-admin-ink" : "bg-white/90 text-admin-muted"
                  }`}
                >
                  <Star className={`size-3.5 ${primaryIndex === i ? "fill-current" : ""}`} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="grid size-6 place-items-center rounded-full bg-white/90 text-admin-rose"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {primaryIndex === i ? (
              <span className="absolute bottom-1 left-1 rounded-full bg-admin-amber px-1.5 py-0.5 text-[9px] font-semibold text-admin-ink">
                Primary
              </span>
            ) : null}
          </div>
        ))}

        {images.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-admin-line text-admin-muted hover:border-admin-sage-deep hover:text-admin-ink"
          >
            <ImagePlus className="size-5" />
            <span className="text-xs">Add Image</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={images.length >= max}
        className="mt-3 border-admin-line"
      >
        Upload Images ({images.length}/{max})
      </Button>
    </div>
  );
}
