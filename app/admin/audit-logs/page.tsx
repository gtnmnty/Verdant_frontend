import type { Metadata } from "next";
import { AuditLogsContent } from "@/app/admin/audit-logs/_components/AuditLogsContent";

export const metadata: Metadata = {
  title: "Audit Logs — Admin — Verdant Luxe",
  description: "Chronological record of key system actions across the salon.",
};

export default function AdminAuditLogsPage() {
  return <AuditLogsContent />;
}
