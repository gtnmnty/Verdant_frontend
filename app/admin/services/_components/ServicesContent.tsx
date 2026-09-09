"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { DataTable, type Column } from "@/app/admin/_components/DataTable";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { ServiceFormDialog } from "@/app/admin/services/_components/ServiceFormDialog";
import { gqlRequest } from "@/utils/graphqlClient";
import {
  CATEGORY_FROM_BACKEND,
  CATEGORY_TO_BACKEND,
  type AdminService,
} from "@/app/admin/services/_components/types";

interface BackendAdminServiceDto {
  id: string;
  name: string;
  subName: string;
  category: string;
  price: number;
  durationInMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  description: string | null;
  badge: string | null;
  tags: string[];
  info: string[];
  isHomeService: boolean;
  isFeatured: boolean;
  images: { url: string }[];
  stylists: { id: string; name: string; bio: string | null; avatarUrl: string | null }[];
  createdAt: string | null;
  updatedAt: string | null;
}

interface AdminServicePage {
  items: BackendAdminServiceDto[];
  totalItems: number;
}

const ADMIN_SERVICES_QUERY = `
    query AdminServices($category: String, $search: String, $status: CollectionStatus, $page: Int, $pageSize: Int) {
        adminServices(category: $category, search: $search, status: $status, page: $page, pageSize: $pageSize) {
            items {
                id
                name
                subName
                category
                price
                durationInMinutes
                status
                description
                badge
                tags
                info
                isHomeService
                isFeatured
                images { url }
                stylists { id name bio avatarUrl }
                createdAt
                updatedAt
            }
            totalItems
        }
    }
`;

const UPDATE_SERVICE_STATUS_MUTATION = `
    mutation UpdateServiceStatus($input: UpdateServiceInput!) {
        updateService(input: $input) { id status }
    }
`;

const CREATE_SERVICE_MUTATION = `
    mutation CreateServiceDuplicate($input: CreateServiceInput!) {
        createService(input: $input) { id }
    }
`;

const DELETE_SERVICE_MUTATION = `
    mutation DeleteService($id: ID!) {
        deleteService(id: $id) { id }
    }
`;

export function toAdminService(s: BackendAdminServiceDto): AdminService {
  return {
    id: s.id,
    name: s.name,
    subName: s.subName,
    description: s.description ?? "",
    category: CATEGORY_FROM_BACKEND[s.category] ?? s.category,
    duration: s.durationInMinutes,
    price: s.price,
    stylists: s.stylists.map((st) => ({
      id: st.id,
      fullName: st.name,
      bio: st.bio ?? "",
      photo: st.avatarUrl ?? "https://picsum.photos/seed/stylist-admin/100/100",
    })),
    image: s.images[0]?.url ?? "",
    active: s.status === "ACTIVE",
    homeService: s.isHomeService,
    featured: s.isFeatured,
    badge: s.badge,
    tags: s.tags,
    info: s.info,
    createdAt: s.createdAt ?? "",
    updatedAt: s.updatedAt ?? "",
  };
}

export function ServicesContent() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [deleting, setDeleting] = useState<AdminService | null>(null);

  const fetchServices = () => {
    setLoading(true);
    gqlRequest<{ adminServices: AdminServicePage }>(ADMIN_SERVICES_QUERY, {
      category: category === "all" ? undefined : CATEGORY_TO_BACKEND[category],
      search: search.trim() || undefined,
      page: 1,
      pageSize: 100,
    })
      .then((res) => setServices(res.adminServices.items.map(toAdminService)))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load services."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchServices, [search, category]);

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category))).sort(),
    [services],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: AdminService) => {
    setEditing(s);
    setFormOpen(true);
  };

  const toggleActive = (s: AdminService) => {
    gqlRequest(UPDATE_SERVICE_STATUS_MUTATION, {
      input: { id: s.id, status: s.active ? "INACTIVE" : "ACTIVE" },
    })
      .then(() => fetchServices())
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update status."));
  };

  // No dedicated "duplicate" endpoint — recreated client-side by re-sending
  // the source service's fields to createService.
  const duplicate = (s: AdminService) => {
    gqlRequest(CREATE_SERVICE_MUTATION, {
      input: {
        name: `${s.name} (Copy)`,
        subName: s.subName,
        category: Object.entries(CATEGORY_FROM_BACKEND).find(([, v]) => v === s.category)?.[0] ?? "SKIN_CARE",
        price: s.price,
        durationInMinutes: s.duration,
        status: "INACTIVE",
        description: s.description || undefined,
        badge: s.badge || undefined,
        tags: s.tags,
        info: s.info,
        images: s.image ? [s.image] : [],
        isHomeService: s.homeService,
        isFeatured: false,
        stylistIds: s.stylists.map((st) => st.id),
      },
    })
      .then(() => {
        toast.success("Service duplicated.");
        fetchServices();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to duplicate service."));
  };

  const confirmDelete = () => {
    if (!deleting) return;
    gqlRequest(DELETE_SERVICE_MUTATION, { id: deleting.id })
      .then(() => {
        toast.success("Service deleted.");
        setDeleting(null);
        fetchServices();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete service."));
  };

  const columns: Column<AdminService>[] = [
    {
      key: "name",
      header: "Service",
      sortable: true,
      sortValue: (s) => s.name,
      render: (s) => (
        <Link href={`/admin/services/${s.id}`} className="flex items-center gap-3 hover:underline">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-admin-cream">
            {s.image ? <Image src={s.image} alt="" fill sizes="40px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{s.name}</p>
            <p className="truncate text-xs text-admin-muted">{s.subName}</p>
          </div>
        </Link>
      ),
    },
    { key: "category", header: "Category", sortable: true, sortValue: (s) => s.category, render: (s) => s.category },
    {
      key: "duration",
      header: "Duration",
      sortable: true,
      sortValue: (s) => s.duration,
      render: (s) => `${s.duration} min`,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      sortValue: (s) => s.price,
      render: (s) => `$${s.price.toFixed(0)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <div className="flex items-center gap-2">
          <Switch checked={s.active} onCheckedChange={() => toggleActive(s)} />
          <StatusBadge status={s.active ? "active" : "inactive"} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the salon's service catalog."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 size-4" /> New Service
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="border-admin-line bg-admin-surface pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        rows={services}
        columns={columns}
        emptyTitle={loading ? "Loading…" : "No services found"}
        emptyDescription={loading ? "Fetching services from the server." : "Try a different search or add a new service."}
        rowActions={(s) => [
          { label: "Edit", onSelect: () => openEdit(s) },
          { label: "Duplicate", onSelect: () => duplicate(s) },
          { label: "Delete", onSelect: () => setDeleting(s), destructive: true },
        ]}
      />

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editing}
        onSaved={fetchServices}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this service?"
        description={`"${deleting?.name}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
