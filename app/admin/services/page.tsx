import type { Metadata } from "next";
import { ServicesContent } from "@/app/admin/services/_components/ServicesContent";

export const metadata: Metadata = {
  title: "Services — Admin — Verdant Salon",
};

export default function AdminServicesPage() {
  return <ServicesContent />;
}
