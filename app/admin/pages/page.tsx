import type { Metadata } from "next";
import { PagesContent } from "@/app/admin/pages/_components/PagesContent";

export const metadata: Metadata = {
  title: "Pages — Admin — Verdant Salon",
};

export default function AdminPagesPage() {
  return <PagesContent />;
}
