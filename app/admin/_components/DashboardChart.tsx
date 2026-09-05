"use client";

import { useState } from "react";
import { REVENUE_SERIES, VOLUME_SERIES } from "@/app/admin/_components/data";

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <svg viewBox="0 0 600 220" className="h-48 w-full" preserveAspectRatio="none">
      <line x1="0" x2="600" y1="60" y2="60" stroke="#e5e2db" strokeDasharray="4 4" />
      <line x1="0" x2="600" y1="130" y2="130" stroke="#e5e2db" strokeDasharray="4 4" />
      {data.map((v, i) => {
        const w = 600 / data.length;
        const h = (v / max) * 180;
        return (
          <rect
            key={i}
            x={i * w + 6}
            y={200 - h}
            width={w - 12}
            height={h}
            rx={6}
            fill="#d5e0d5"
          />
        );
      })}
    </svg>
  );
}

export function DashboardChart() {
  const [chart, setChart] = useState<"revenue" | "volume">("revenue");

  return (
    <section className="rounded-2xl bg-admin-surface p-5 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-xl sm:text-2xl">Performance Analytics</h2>
          <p className="text-sm text-admin-muted">
            Total revenue growth over the last 30 days
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-full bg-admin-cream p-1">
          {(["revenue", "volume"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setChart(k)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                chart === k
                  ? "bg-admin-sidebar text-white"
                  : "text-admin-muted hover:text-admin-ink"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <BarChart data={chart === "revenue" ? REVENUE_SERIES : VOLUME_SERIES} />
      </div>
    </section>
  );
}
