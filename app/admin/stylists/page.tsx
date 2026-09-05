import type { Metadata } from "next";
import { StylistsContent } from "@/app/admin/stylists/_components/StylistsContent";

export const metadata: Metadata = {
  title: "Stylists — Admin — Verdant Salon",
};

export default function AdminStylistsPage() {
  return <StylistsContent />;
}
