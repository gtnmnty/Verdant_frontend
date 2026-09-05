import type { Metadata } from "next";
import { AccountDetailContent } from "@/app/admin/accounts/[id]/_components/AccountDetailContent";

export const metadata: Metadata = {
  title: "Account Details — Admin — Verdant Luxe",
};

export default function AdminAccountDetailPage() {
  return <AccountDetailContent />;
}
