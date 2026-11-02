"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Download, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

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
  images: { id: string; url: string }[];
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
                images { id url }
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


const DELETE_SERVICE_MUTATION = `
    mutation DeleteService($id: ID!) {
        deleteService(id: $id) { id }
    }
`;

const DELETE_SERVICES_MUTATION = `
    mutation DeleteServices($ids: [ID!]!) {
        deleteServices(ids: $ids) { id }
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
      photo: st.avatarUrl ?? "",
    })),
    image: s.images[0]?.url ?? "",
    images: s.images.map((i) => i.url),
    imageIds: s.images.map((i) => i.id),
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
  const router = useRouter();
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [deleting, setDeleting] = useState<AdminService | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null);

  const fetchServices = () => {
    setLoading(true);
    gqlRequest<{ adminServices: AdminServicePage }>(ADMIN_SERVICES_QUERY, {
      category: category === "all" ? undefined : CATEGORY_TO_BACKEND[category],
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status === "active" ? "ACTIVE" : "INACTIVE",
      page: 1,
      pageSize: 100,
    })
      .then((res) => setServices(res.adminServices.items.map(toAdminService)))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load services."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchServices, [search, category, status]);

  // Fixed list (not derived from the loaded rows) so the filter never collapses to the current selection.
  const categories = Object.keys(CATEGORY_TO_BACKEND);

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
      .then(() => {
        toast.success(s.active ? "Service set to inactive." : "Service set to active.");
        fetchServices();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update status."));
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

  const confirmBulkDelete = () => {
    if (!deletingIds) return;
    gqlRequest(DELETE_SERVICES_MUTATION, { ids: deletingIds })
      .then(() => {
        toast.success(`Deleted ${deletingIds.length} services`);
        setDeletingIds(null);
        fetchServices();
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete services."));
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
            {s.image ? (
              <Image src={s.image} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <ImagePlaceholder name={s.name} kind="service" compact />
            )}
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
      render: (s) => <StatusBadge status={s.active ? "active" : "inactive"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the salon's service catalog."
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 border-admin-line bg-admin-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchServices} className="border-admin-line">
          <RefreshCw className="size-4" />
        </Button>
        {/* No export endpoint on the backend — stays a demo toast. */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Exported CSV")}
          className="border-admin-line"
        >
          <Download className="size-4" /> Export
        </Button>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 size-4" /> New Service
        </Button>
      </div>

      <DataTable
        rows={services}
        columns={columns}
        emptyTitle={loading ? "Loading…" : "No services found"}
        emptyDescription={loading ? "Fetching services from the server." : "Try a different search or add a new service."}
        bulkActions={(ids, clear) => (
          <Button
            size="sm"
            variant="ghost"
            className="text-admin-rose"
            onClick={() => {
              setDeletingIds(ids);
              clear();
            }}
          >
            Delete selected
          </Button>
        )}
        rowActions={(s) => [
          { label: "View details", onSelect: () => router.push(`/admin/services/${s.id}`) },
          { label: "Edit", onSelect: () => openEdit(s) },
          {
            label: s.active ? "Set inactive" : "Set active",
            onSelect: () => toggleActive(s),
          },
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
      <ConfirmDialog
        open={!!deletingIds}
        onOpenChange={(o) => !o && setDeletingIds(null)}
        title={`Delete ${deletingIds?.length ?? 0} services?`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
