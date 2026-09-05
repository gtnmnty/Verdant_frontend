import Link from "next/link";
import { ArrowRight, Plus, ShoppingCart, UserPlus } from "lucide-react";

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <Link
        href="/admin/appointments"
        className="group flex flex-col justify-between rounded-2xl bg-admin-sidebar p-5 text-admin-sidebar-fg shadow-sm"
      >
        <div className="grid size-10 place-items-center rounded-full border border-white/30">
          <Plus className="size-5" />
        </div>
        <div className="mt-6">
          <h3 className="font-display text-xl text-white">New Appointment</h3>
          <p className="mt-1 text-sm opacity-80">Quick schedule a client</p>
        </div>
        <ArrowRight className="mt-4 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      <div className="grid grid-cols-1 gap-3">
        <Link
          href="/admin/products"
          className="flex items-center gap-3 rounded-2xl bg-admin-sage/60 p-4 hover:bg-admin-sage"
        >
          <div className="grid size-10 place-items-center rounded-full bg-admin-surface">
            <ShoppingCart className="size-5 text-admin-ink" />
          </div>
          <span className="font-display text-lg">Add Product</span>
        </Link>
        <Link
          href="/admin/accounts"
          className="flex items-center gap-3 rounded-2xl bg-admin-sage/60 p-4 hover:bg-admin-sage"
        >
          <div className="grid size-10 place-items-center rounded-full bg-admin-surface">
            <UserPlus className="size-5 text-admin-ink" />
          </div>
          <span className="font-display text-lg">New Client</span>
        </Link>
      </div>
    </div>
  );
}
