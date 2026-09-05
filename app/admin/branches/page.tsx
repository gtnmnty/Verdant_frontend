import type { Metadata } from "next";
import { BranchesContent } from "@/app/admin/branches/_components/BranchesContent";

export const metadata: Metadata = {
  title: "Branches — Admin — Verdant Luxe",
};

export default function AdminBranchesPage() {
  return <BranchesContent />;
}
