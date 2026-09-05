import type { Metadata } from "next";
import { SettingsContent } from "@/app/admin/settings/_components/SettingsContent";

export const metadata: Metadata = {
  title: "Settings — Admin — Verdant Salon",
};

export default function AdminSettingsPage() {
  return <SettingsContent />;
}
