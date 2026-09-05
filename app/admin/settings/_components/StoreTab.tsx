"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";

const PAYMENT_METHODS = ["Credit Card", "PayPal", "Apple Pay", "Google Pay", "Cash on Delivery"];

export function StoreTab() {
  const [store, setStore] = useState({
    name: "Verdant Salon",
    tagline: "Premium hair & beauty studio",
    email: "hello@verdantsalon.com",
    phone: "+1 (212) 555-0100",
    address: "112 Greene Street, New York, NY",
  });
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(8.875);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [methods, setMethods] = useState<string[]>(["Credit Card", "Apple Pay"]);
  const [maintenance, setMaintenance] = useState(false);

  const toggleMethod = (m: string) =>
    setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <div className="space-y-5">
      <SettingsCard title="Store identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Store name</Label>
            <Input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={store.tagline} onChange={(e) => setStore({ ...store, tagline: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Support email</Label>
            <Input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Support phone</Label>
            <Input value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Headquarters address</Label>
            <Textarea rows={2} value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Logo</Label>
            <Input type="file" className="mt-1.5" />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Currency & tax">
        <SettingRow label="Currency">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="PHP">PHP (₱)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Tax rate (%)">
          <Input
            type="number"
            step="0.001"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Prices are tax-inclusive">
          <Switch checked={taxInclusive} onCheckedChange={setTaxInclusive} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Payment methods">
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => {
            const on = methods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMethod(m)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "border-admin-sidebar bg-admin-sidebar text-white"
                    : "border-admin-line text-admin-muted hover:text-admin-ink"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard title="Maintenance mode" description="Temporarily disable public checkout and booking.">
        <SettingRow label="Enable maintenance mode" hint="Storefront browsing stays on; checkout/booking pause.">
          <Switch checked={maintenance} onCheckedChange={setMaintenance} />
        </SettingRow>
      </SettingsCard>

      <div className="flex justify-end">
        <Button
          className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
          onClick={() => toast.success("Store settings saved")}
        >
          Save store settings
        </Button>
      </div>
    </div>
  );
}
