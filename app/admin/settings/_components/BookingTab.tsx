"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChipInput } from "@/app/admin/_components/ChipInput";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";
import { DAYS } from "@/app/admin/settings/_components/data";

export function BookingTab() {
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [hours, setHours] = useState({ open: "09:00", close: "20:00" });
  const [holidays, setHolidays] = useState<string[]>(["2026-12-25", "2027-01-01"]);
  const [windowRange, setWindowRange] = useState({ min: 2, max: 60 });
  const [policy, setPolicy] = useState({ cancelHours: 24, rescheduleHours: 12, buffer: 15, cap: 60 });
  const [penalty, setPenalty] = useState(true);

  const toggleDay = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <div className="space-y-5">
      <SettingsCard title="Business hours & operating days">
        <SettingRow label="Opening time">
          <Input
            type="time"
            value={hours.open}
            onChange={(e) => setHours({ ...hours, open: e.target.value })}
            className="w-40"
          />
        </SettingRow>
        <SettingRow label="Closing time">
          <Input
            type="time"
            value={hours.close}
            onChange={(e) => setHours({ ...hours, close: e.target.value })}
            className="w-40"
          />
        </SettingRow>
        <SettingRow label="Operating days">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    on
                      ? "border-admin-sidebar bg-admin-sidebar text-white"
                      : "border-admin-line text-admin-muted hover:text-admin-ink"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </SettingRow>
        <SettingRow label="Holiday / blackout dates">
          <ChipInput value={holidays} onChange={setHolidays} placeholder="YYYY-MM-DD" />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Booking window">
        <SettingRow label="Minimum advance (hours)">
          <Input
            type="number"
            value={windowRange.min}
            onChange={(e) => setWindowRange({ ...windowRange, min: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Maximum advance (days)">
          <Input
            type="number"
            value={windowRange.max}
            onChange={(e) => setWindowRange({ ...windowRange, max: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Cancellation & rescheduling">
        <SettingRow label="Free cancel (hours before)">
          <Input
            type="number"
            value={policy.cancelHours}
            onChange={(e) => setPolicy({ ...policy, cancelHours: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Free reschedule (hours before)">
          <Input
            type="number"
            value={policy.rescheduleHours}
            onChange={(e) => setPolicy({ ...policy, rescheduleHours: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Auto-apply late penalty">
          <Switch checked={penalty} onCheckedChange={setPenalty} />
        </SettingRow>
        <SettingRow label="Default service buffer (min)">
          <Input
            type="number"
            value={policy.buffer}
            onChange={(e) => setPolicy({ ...policy, buffer: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Daily appointment capacity">
          <Input
            type="number"
            value={policy.cap}
            onChange={(e) => setPolicy({ ...policy, cap: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
      </SettingsCard>

      <div className="flex justify-end">
        <Button
          className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
          onClick={() => toast.success("Booking rules saved")}
        >
          Save booking rules
        </Button>
      </div>
    </div>
  );
}
