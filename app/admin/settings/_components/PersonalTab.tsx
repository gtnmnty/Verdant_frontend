"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SettingsCard, SettingRow } from "@/app/admin/settings/_components/SettingsCard";

export function PersonalTab() {
  const [profile, setProfile] = useState({
    name: "Elena Vance",
    email: "elena@verdantsalon.com",
    phone: "+1 (212) 555-0199",
    bio: "Salon manager.",
  });
  const [pw, setPw] = useState({ old: "", n: "", c: "" });
  const [twoFA, setTwoFA] = useState(true);
  const [notif, setNotif] = useState({ email: true, sms: false, push: true, digest: "daily" });

  const updatePassword = () => {
    if (pw.n !== pw.c) {
      toast.error("Passwords don't match");
      return;
    }
    toast.success("Password updated");
    setPw({ old: "", n: "", c: "" });
  };

  return (
    <div className="space-y-5">
      <SettingsCard title="Profile information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Profile picture</Label>
            <Input type="file" className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Bio</Label>
            <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90" onClick={() => toast.success("Profile saved")}>
            Save profile
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Change password">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Current</Label>
            <Input type="password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>New</Label>
            <Input type="password" value={pw.n} onChange={(e) => setPw({ ...pw, n: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Confirm</Label>
            <Input type="password" value={pw.c} onChange={(e) => setPw({ ...pw, c: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={updatePassword} className="border-admin-line">
            <KeyRound className="size-4" /> Update password
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Security & notifications">
        <SettingRow label="Two-factor authentication" hint="Extra verification code at sign-in">
          <Switch checked={twoFA} onCheckedChange={setTwoFA} />
        </SettingRow>
        <SettingRow label="Email notifications">
          <Switch checked={notif.email} onCheckedChange={(v) => setNotif({ ...notif, email: v })} />
        </SettingRow>
        <SettingRow label="SMS notifications">
          <Switch checked={notif.sms} onCheckedChange={(v) => setNotif({ ...notif, sms: v })} />
        </SettingRow>
        <SettingRow label="Push notifications">
          <Switch checked={notif.push} onCheckedChange={(v) => setNotif({ ...notif, push: v })} />
        </SettingRow>
        <SettingRow label="Digest frequency">
          <Select value={notif.digest} onValueChange={(v) => setNotif({ ...notif, digest: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>
    </div>
  );
}
