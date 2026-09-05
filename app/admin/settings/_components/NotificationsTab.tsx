"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";

const EVENTS = [
  { key: "booking_confirmed", label: "Booking confirmed", hint: "Sent when an appointment is confirmed." },
  { key: "booking_reminder", label: "Appointment reminder", hint: "Sent 24 hours before the visit." },
  { key: "order_shipped", label: "Order shipped", hint: "Sent when an order leaves the branch." },
  { key: "order_delivered", label: "Order delivered", hint: "Sent when a courier marks delivery complete." },
  { key: "review_request", label: "Review request", hint: "Sent 2 hours after a completed appointment." },
  { key: "low_stock", label: "Low stock alert (internal)", hint: "Notifies staff when inventory hits threshold." },
];

export function NotificationsTab() {
  const [channels, setChannels] = useState<Record<string, { email: boolean; sms: boolean }>>(
    Object.fromEntries(EVENTS.map((e) => [e.key, { email: true, sms: e.key === "booking_reminder" }])),
  );

  const toggle = (key: string, channel: "email" | "sms") =>
    setChannels((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } }));

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Automated notification rules"
        description="Choose which channels fire for each customer-facing event."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-admin-line text-left text-xs uppercase tracking-wide text-admin-muted">
                <th className="py-2 pr-4 font-semibold">Event</th>
                <th className="py-2 pr-4 font-semibold">Email</th>
                <th className="py-2 font-semibold">SMS</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e) => (
                <tr key={e.key} className="border-b border-admin-line/60 last:border-b-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{e.label}</p>
                    <p className="text-xs text-admin-muted">{e.hint}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <Switch checked={channels[e.key].email} onCheckedChange={() => toggle(e.key, "email")} />
                  </td>
                  <td className="py-3">
                    <Switch checked={channels[e.key].sms} onCheckedChange={() => toggle(e.key, "sms")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button
          className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
          onClick={() => toast.success("Notification rules saved")}
        >
          Save notification rules
        </Button>
      </div>
    </div>
  );
}
