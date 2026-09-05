import type { Metadata } from "next";
import { BranchDetailContent } from "@/app/admin/branches/[id]/_components/BranchDetailContent";

export const metadata: Metadata = {
  title: "Branch Details — Admin — Verdant Luxe",
};

export default function AdminBranchDetailPage() {
  return <BranchDetailContent />;
}
