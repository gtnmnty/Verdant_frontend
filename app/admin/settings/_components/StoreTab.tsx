"use client";

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
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";
import { useLocalSetting } from "@/app/admin/settings/_components/useLocalSetting";

const PAYMENT_METHODS = ["Credit Card", "PayPal", "Apple Pay", "Google Pay", "Cash on Delivery"];

interface StoreSettings {
  store: { name: string; tagline: string; email: string; phone: string; address: string; logo: string };
  currency: string;
  taxRate: number;
  taxInclusive: boolean;
  methods: string[];
  maintenance: boolean;
}

const DEFAULTS: StoreSettings = {
  store: {
    name: "Verdant Salon",
    tagline: "Premium hair & beauty studio",
    email: "hello@verdantsalon.com",
    phone: "+1 (212) 555-0100",
    address: "112 Greene Street, New York, NY",
    logo: "",
  },
  currency: "USD",
  taxRate: 8.875,
  taxInclusive: false,
  methods: ["Credit Card", "Apple Pay"],
  maintenance: false,
};

export function StoreTab() {
  // No backend model exists for store-wide settings — persisted to
  // localStorage for now so it survives a reload. See useLocalSetting.ts.
  const { value, setValue, loaded } = useLocalSetting<StoreSettings>("store", DEFAULTS);

  const toggleMethod = (m: string) =>
    setValue({
      ...value,
      methods: value.methods.includes(m)
        ? value.methods.filter((x) => x !== m)
        : [...value.methods, m],
    });

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <SettingsCard title="Store identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Store name</Label>
            <Input
              value={value.store.name}
              onChange={(e) => setValue({ ...value, store: { ...value.store, name: e.target.value } })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={value.store.tagline}
              onChange={(e) => setValue({ ...value, store: { ...value.store, tagline: e.target.value } })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Support email</Label>
            <Input
              value={value.store.email}
              onChange={(e) => setValue({ ...value, store: { ...value.store, email: e.target.value } })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Support phone</Label>
            <Input
              value={value.store.phone}
              onChange={(e) => setValue({ ...value, store: { ...value.store, phone: e.target.value } })}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Headquarters address</Label>
            <Textarea
              rows={2}
              value={value.store.address}
              onChange={(e) => setValue({ ...value, store: { ...value.store, address: e.target.value } })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1.5">
              <ImageUploader
                images={value.store.logo ? [value.store.logo] : []}
                onChange={(imgs) => setValue({ ...value, store: { ...value.store, logo: imgs[0] ?? "" } })}
                max={1}
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Currency & tax">
        <SettingRow label="Currency">
          <Select value={value.currency} onValueChange={(v) => setValue({ ...value, currency: v })}>
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
            value={value.taxRate}
            onChange={(e) => setValue({ ...value, taxRate: Number(e.target.value) })}
            className="w-32"
          />
        </SettingRow>
        <SettingRow label="Prices are tax-inclusive">
          <Switch checked={value.taxInclusive} onCheckedChange={(v) => setValue({ ...value, taxInclusive: v })} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Payment methods">
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => {
            const on = value.methods.includes(m);
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
          <Switch checked={value.maintenance} onCheckedChange={(v) => setValue({ ...value, maintenance: v })} />
        </SettingRow>
      </SettingsCard>

      <div className="flex justify-end">
        <Button
          className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
          onClick={() => toast.success("Store settings saved to this browser")}
        >
          Save store settings
        </Button>
      </div>
    </div>
  );
}
