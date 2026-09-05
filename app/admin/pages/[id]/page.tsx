import type { Metadata } from "next";
import { PageDetailContent } from "@/app/admin/pages/[id]/_components/PageDetailContent";

export const metadata: Metadata = {
  title: "Page Details — Admin — Verdant Salon",
};

export default function AdminPageDetailPage() {
  return <PageDetailContent />;
}
