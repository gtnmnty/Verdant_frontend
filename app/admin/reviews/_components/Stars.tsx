import { Star } from "lucide-react";

export function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < value ? "fill-admin-amber text-admin-amber" : "text-admin-line"
          }`}
        />
      ))}
    </div>
  );
}
