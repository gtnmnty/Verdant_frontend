import type { Metadata } from "next";
import { ServiceDetailContent } from "@/app/(site)/services/[id]/_components/ServiceDetailContent";

export const metadata: Metadata = {
  title: "Service Details — Verdant Luxe",
  description: "Book a Verdant Luxe signature service tailored to you.",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
      <ServiceDetailContent id={id} />
    </div>
  );
}
