import type { Metadata } from "next";
import { AppointmentsContent } from "@/app/admin/appointments/_components/AppointmentsContent";

export const metadata: Metadata = {
  title: "Appointments — Admin — Verdant Luxe",
};

export default function AdminAppointmentsPage() {
  return <AppointmentsContent />;
}
