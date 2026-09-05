import type { Metadata } from "next";
import { StylistDetailContent } from "@/app/admin/stylists/[id]/_components/StylistDetailContent";

export const metadata: Metadata = {
  title: "Stylist Profile — Admin — Verdant Salon",
};

export default function AdminStylistDetailPage() {
  return <StylistDetailContent />;
}
