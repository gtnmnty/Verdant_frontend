import type { Metadata } from "next";
import { AccountsContent } from "@/app/admin/accounts/_components/AccountsContent";

export const metadata: Metadata = {
  title: "Accounts — Admin — Verdant Luxe",
};

export default function AdminAccountsPage() {
  return <AccountsContent />;
}
