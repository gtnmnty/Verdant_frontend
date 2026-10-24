"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { SettingsCard } from "@/app/admin/settings/_components/SettingsCard";
import { gqlRequest } from "@/utils/graphqlClient";
import { apiRequest } from "@/utils/apiClient";
import { ConfirmEmailChangeDialog, isEmailChanged } from "@/components/account/ConfirmEmailChangeDialog";

interface Me {
  fullName: string;
  email: string;
  pendingEmail: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

const ME_QUERY = `
    query SettingsMe {
        me { fullName email pendingEmail phone avatarUrl }
    }
`;

const UPDATE_PROFILE_MUTATION = `
    mutation SettingsUpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) { id pendingEmail }
    }
`;

export function PersonalTab() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ old: "", n: "", c: "" });
  const [pwSaving, setPwSaving] = useState(false);
  // Email change: the saved address only switches after the emailed code is confirmed.
  const [savedEmail, setSavedEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [emailPassword, setEmailPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const emailChanging = !loading && isEmailChanged(savedEmail, profile.email);

  useEffect(() => {
    gqlRequest<{ me: Me }>(ME_QUERY)
      .then((res) => {
        setProfile({
          name: res.me.fullName,
          email: res.me.email,
          phone: res.me.phone ?? "",
          avatar: res.me.avatarUrl ?? "",
        });
        setSavedEmail(res.me.email);
        setPendingEmail(res.me.pendingEmail ?? null);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = () => {
    if (emailChanging && !emailPassword) {
      toast.error("Enter your current password to change your email");
      return;
    }
    setSaving(true);
    gqlRequest<{ updateProfile: { pendingEmail: string | null } }>(UPDATE_PROFILE_MUTATION, {
      input: {
        fullName: profile.name,
        email: profile.email,
        currentPassword: emailChanging ? emailPassword : undefined,
        phone: profile.phone || undefined,
      },
    })
      .then((res) => {
        setEmailPassword("");
        if (emailChanging && res.updateProfile.pendingEmail) {
          // Field goes back to the live address; the new one shows as pending below.
          setPendingEmail(res.updateProfile.pendingEmail);
          setProfile((p) => ({ ...p, email: savedEmail }));
          setConfirmOpen(true);
          toast.success("Profile saved. Check your new inbox for a verification code.");
        } else {
          toast.success("Profile saved");
        }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to save profile."))
      .finally(() => setSaving(false));
  };

  const updatePassword = () => {
    if (pw.n !== pw.c) {
      toast.error("Passwords don't match");
      return;
    }
    if (!pw.old || pw.n.length < 8) {
      toast.error("Enter your current password and a new one (min. 8 characters)");
      return;
    }
    setPwSaving(true);
    apiRequest<void>("/v1/users/change-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword: pw.old, newPassword: pw.n }),
    })
      .then(() => {
        toast.success("Password updated");
        setPw({ old: "", n: "", c: "" });
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update password."))
      .finally(() => setPwSaving(false));
  };

  return (
    <div className="space-y-5">
      <SettingsCard title="Profile information">
        {loading ? (
          <p className="text-sm text-admin-muted">Loading…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1.5"
              />
              {emailChanging && (
                <div className="mt-3">
                  <Label>Current password</Label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="mt-1.5 text-xs text-admin-muted">
                    Required to change your email. A code will be sent to the new address.
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Profile picture</Label>
              <div className="mt-1.5">
                <ImageUploader
                  images={profile.avatar ? [profile.avatar] : []}
                  onChange={(imgs) => setProfile({ ...profile, avatar: imgs[0] ?? "" })}
                  max={1}
                />
              </div>
            </div>
            {/* "Bio" had no backing field — `User` only has
                fullName/email/phone/shippingAddress/avatarUrl/
                savedPaymentMethod/createdAt/cart. Dropped. */}
          </div>
        )}
        {pendingEmail && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-admin-line p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-admin-muted">
              Pending email change to <span className="font-semibold text-foreground">{pendingEmail}</span>.
              Enter the code we sent there to finish.
            </p>
            <Button variant="outline" onClick={() => setConfirmOpen(true)} className="shrink-0 border-admin-line">
              <MailCheck className="size-4" /> Enter code
            </Button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button
            className="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
            onClick={saveProfile}
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save profile"}
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
          <Button variant="outline" onClick={updatePassword} disabled={pwSaving} className="border-admin-line">
            <KeyRound className="size-4" /> {pwSaving ? "Updating…" : "Update password"}
          </Button>
        </div>
      </SettingsCard>

      <ConfirmEmailChangeDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pendingEmail={pendingEmail ?? ""}
        submitClassName="bg-admin-sidebar text-white hover:bg-admin-sidebar/90"
        onConfirmed={(newEmail) => {
          setSavedEmail(newEmail);
          setProfile((p) => ({ ...p, email: newEmail }));
          setPendingEmail(null);
        }}
      />

      {/* "Security & notifications" (2FA, email/SMS/push toggles, digest
          frequency) had no backend field of any kind on `User` — dropped
          entirely rather than wiring switches to nothing. */}
    </div>
  );
}
