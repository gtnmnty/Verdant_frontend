import type { Metadata } from "next";
import { AppointmentDetailContent } from "@/app/admin/appointments/[id]/_components/AppointmentDetailContent";

export const metadata: Metadata = {
  title: "Appointment Details — Admin — Verdant Luxe",
};

export default function AdminAppointmentDetailPage() {
  return <AppointmentDetailContent />;
}
