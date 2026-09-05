import Link from "next/link";
import Image from "next/image";
import { INVENTORY_BANNER_IMAGE } from "@/app/admin/_components/data";

export function DashboardBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-admin-sidebar p-6 text-admin-sidebar-fg shadow-sm sm:p-8">
      <div className="absolute inset-0">
        <Image
          src={INVENTORY_BANNER_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-admin-sidebar via-admin-sidebar/70 to-transparent" />
      </div>
      <div className="relative max-w-md">
        <h3 className="font-display text-2xl text-white sm:text-3xl">
          Inventory Insights
        </h3>
        <p className="mt-2 text-sm opacity-90">
          Stock levels are 12% lower than usual.
        </p>
        <Link
          href="/admin/products"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-admin-ink hover:bg-admin-cream"
        >
          View Details
        </Link>
      </div>
    </section>
  );
}
