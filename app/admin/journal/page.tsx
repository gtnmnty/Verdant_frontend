import type { Metadata } from "next";
import { JournalAdminContent } from "@/app/admin/journal/_components/JournalAdminContent";

export const metadata: Metadata = {
  title: "Journal — Admin — Verdant Salon",
};

export default function AdminJournalPage() {
  return <JournalAdminContent />;
}
