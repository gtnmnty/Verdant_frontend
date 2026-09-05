import type { Metadata } from "next";
import { ServiceDetailContent } from "@/app/admin/services/[id]/_components/ServiceDetailContent";

export const metadata: Metadata = {
  title: "Service Details — Admin — Verdant Salon",
};

export default function AdminServiceDetailPage() {
  return <ServiceDetailContent />;
}
