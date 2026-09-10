"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChipInput } from "@/app/admin/_components/ChipInput";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";
import { DAYS } from "@/app/admin/settings/_components/data";
import { useLocalSetting } from "@/app/admin/settings/_components/useLocalSetting";

interface BookingSettings {
  days: string[];
  hours: { open: string; close: string };
  holidays: string[];
  windowRange: { min: number; max: number };
  policy: { cancelHours: number; rescheduleHours: number; buffer: number; cap: number };
  penalty: boolean;
}

const DEFAULTS: BookingSettings = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  hours: { open: "09:00", close: "20:00" },
  holidays: ["2026-12-25", "2027-01-01"],
  windowRange: { min: 2, max: 60 },
  policy: { cancelHours: 24, rescheduleHours: 12, buffer: 15, cap: 60 },
  penalty: true,
};

export function BookingTab() {
  // No backend model exists for global booking policy — persisted to
  // localStorage for now so it survives a reload. See useLocalSetting.ts.
  const { value, setValue, loaded } = useLocalSetting<BookingSettings>("booking", DEFAULTS);

  const toggleDay = (d: string) =>
    setValue({
      ...value,
      days: value.days.includes(d) ? value.days.filter((x) => x !== d) : [...value.days, d],
    });

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <SettingsCard title="Business hours & operating days">
        <SettingRow label="Opening time">
          <Input
            type="time"
            value={value.hours.open}
            onChange={(e) => setValue({ ...value, hours: { ...value.hours, open: e.target.value } })}
            className="w-40"
          />
        </SettingRow>
        <SettingRow label="Closing time">
          <Input
            type="time"
            value={value.hours.close}
            onChange={(e) => setValue({ ...value, hours: { ...value.hours, close: e.target.value } })}
            className="w-40"
          />
        </SettingRow>
        <SettingRow label="Operating days">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = value.days.includes(d);
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
          <ChipInput
            value={value.holidays}
            onChange={(v) => setValue({ ...value, holidays: v })}
            placeholder="YYYY-MM-DD"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Booking window">
        <SettingRow label="Minimum advance (hours)">
          <Input
            type="number"
            value={value.windowRange.min}
            onChange={(e) => setValue({ ...value, windowRange: { ...value.windowRange, min: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Maximum advance (days)">
          <Input
            type="number"
            value={value.windowRange.max}
            onChange={(e) => setValue({ ...value, windowRange: { ...value.windowRange, max: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Cancellation & rescheduling">
        <SettingRow label="Free cancel (hours before)">
          <Input
            type="number"
            value={value.policy.cancelHours}
            onChange={(e) => setValue({ ...value, policy: { ...value.policy, cancelHours: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Free reschedule (hours before)">
          <Input
            type="number"
            value={value.policy.rescheduleHours}
            onChange={(e) => setValue({ ...value, policy: { ...value.policy, rescheduleHours: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Auto-apply late penalty">
          <Switch checked={value.penalty} onCheckedChange={(v) => setValue({ ...value, penalty: v })} />
        </SettingRow>
        <SettingRow label="Default service buffer (min)">
          <Input
            type="number"
            value={value.policy.buffer}
            onChange={(e) => setValue({ ...value, policy: { ...value.policy, buffer: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Daily appointment capacity">
          <Input
            type="number"
            value={value.policy.cap}
            onChange={(e) => setValue({ ...value, policy: { ...value.policy, cap: Number(e.target.value) } })}
            className="w-32"
          />
        </SettingRow>
      </SettingsCard>

      <div className="flex justify-end">
        <Button
          className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
          onClick={() => toast.success("Booking rules saved to this browser")}
        >
          Save booking rules
        </Button>
      </div>
    </div>
  );
}
