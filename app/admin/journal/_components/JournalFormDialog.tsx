"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/app/admin/_components/ImageUploader";
import { SearchSelect, type SearchSelectOption } from "@/app/admin/_components/SearchSelect";
import { apiRequest } from "@/utils/apiClient";
import { gqlRequest } from "@/utils/graphqlClient";
import {
  CATEGORY_OPTIONS,
  type AdminJournalStory,
  type JournalCategoryValue,
  type JournalStatus,
} from "@/app/admin/journal/_components/types";

type ItemKind = "product" | "service";

interface Draft {
  clientName: string;
  quote: string;
  category: JournalCategoryValue;
  stylist: SearchSelectOption | null; // the story stores the stylist's name as plain text
  status: JournalStatus;
  resultImage: string; // existing URL or a data: URL for a newly picked file
  kind: ItemKind;
  item: SearchSelectOption | null; // the featured product or service (its primary image is shown on the story)
}

type FieldErrors = Partial<Record<"clientName" | "quote" | "stylist" | "item" | "resultImage", string>>;

const EMPTY: Draft = {
  clientName: "",
  quote: "",
  category: "COLOR",
  stylist: null,
  status: "DRAFT",
  resultImage: "",
  kind: "service",
  item: null,
};

interface ApiImage {
  url: string;
  isPrimary: boolean;
}

const SEARCH_QUERIES: Record<ItemKind, { query: string; key: "adminProducts" | "adminServices" }> = {
  product: {
    key: "adminProducts",
    query: `
      query JournalProductOptions($search: String) {
        adminProducts(search: $search, status: ACTIVE, page: 1, pageSize: 8) {
          items { id name images { url isPrimary } }
        }
      }`,
  },
  service: {
    key: "adminServices",
    query: `
      query JournalServiceOptions($search: String) {
        adminServices(search: $search, status: ACTIVE, page: 1, pageSize: 8) {
          items { id name images { url isPrimary } }
        }
      }`,
  },
};

const STYLIST_QUERY = `
  query JournalStylistOptions($search: String) {
    adminStylists(search: $search, status: ACTIVE, page: 1, pageSize: 8) {
      items { id name avatarUrl }
    }
  }
`;

const STATUS_MUTATION = `
  mutation SetJournalStatus($id: ID!, $status: JournalStoryStatus!) {
    setJournalStoryStatus(id: $id, status: $status) { id }
  }
`;

const isNewImage = (src: string) => src.startsWith("data:");

const primaryUrl = (images: ApiImage[]) => (images.find((i) => i.isPrimary) ?? images[0])?.url ?? null;

async function toFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `${name}.${blob.type.split("/")[1] || "jpg"}`, { type: blob.type });
}

function draftFromStory(story: AdminJournalStory): Draft {
  const product = story.products[0];
  return {
    clientName: story.clientName,
    quote: story.quote,
    category: story.category,
    stylist: story.stylist ? { id: story.stylist, name: story.stylist } : null,
    status: story.status,
    resultImage: story.resultImage.url,
    // A story featuring a product carries it in `products`; otherwise `service` names the service.
    kind: product ? "product" : "service",
    item: product
      ? { id: product.id, name: product.name, imageUrl: product.imageUrl }
      : { id: story.service, name: story.service, imageUrl: story.serviceImageUrl },
  };
}

export function JournalFormDialog({
  open,
  onOpenChange,
  story,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: AdminJournalStory | null; // null = create
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitError(null);
    setDraft(story ? draftFromStory(story) : EMPTY);
  }, [open, story]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const fetchOptions = useCallback(
    async (q: string): Promise<SearchSelectOption[]> => {
      const { key, query } = SEARCH_QUERIES[draft.kind];
      const res = await gqlRequest<Record<string, { items: { id: string; name: string; images: ApiImage[] }[] }>>(
        query,
        { search: q || undefined },
      );
      return res[key].items.map((i) => ({ id: i.id, name: i.name, imageUrl: primaryUrl(i.images) }));
    },
    [draft.kind],
  );

  const fetchStylists = useCallback(async (q: string): Promise<SearchSelectOption[]> => {
    const res = await gqlRequest<{
      adminStylists: { items: { id: string; name: string; avatarUrl: string | null }[] };
    }>(STYLIST_QUERY, { search: q || undefined });
    return res.adminStylists.items.map((i) => ({ id: i.id, name: i.name, imageUrl: i.avatarUrl }));
  }, []);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!draft.clientName.trim()) next.clientName = "Client name is required.";
    if (!draft.quote.trim()) next.quote = "Quote is required.";
    if (draft.kind === "service" && !draft.stylist) next.stylist = "Select a stylist.";
    if (!draft.item) next.item = `Select a ${draft.kind}.`;
    if (!draft.resultImage) next.resultImage = "A result image is required.";
    return next;
  };

  const handleSave = async () => {
    setSubmitError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const item = draft.item!;

    setSaving(true);
    try {
      const form = new FormData();
      form.append("clientName", draft.clientName.trim());
      form.append("quote", draft.quote.trim());
      form.append("category", draft.category);
      // Only services have a stylist; an empty value also clears it when a story switches to a product.
      form.append("stylist", draft.kind === "service" && draft.stylist ? draft.stylist.name : "");
      // The story's `service` text is the featured item's name either way; a product is also linked so its
      // primary image and "add to bag" button show up. An empty productIds value clears the link on update.
      form.append("service", item.name);
      form.append("productIds", draft.kind === "product" ? item.id : "");
      if (isNewImage(draft.resultImage)) form.append("resultImage", await toFile(draft.resultImage, "result"));

      if (story) {
        await apiRequest(`/api/journal/${story.id}`, { method: "PUT", body: form });
        if (draft.status !== story.status) {
          await gqlRequest(STATUS_MUTATION, { id: story.id, status: draft.status });
        }
      } else {
        form.append("status", draft.status);
        await apiRequest("/api/journal", { method: "POST", body: form });
      }
      toast.success("Saved");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save the testimonial. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {story ? "Edit" : "New"} testimonial
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="journal-client">Client name</Label>
            <Input
              id="journal-client"
              value={draft.clientName}
              maxLength={80}
              placeholder="Sophia M."
              aria-invalid={!!errors.clientName || undefined}
              onChange={(e) => set("clientName", e.target.value)}
            />
            <FieldError message={errors.clientName} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={draft.category} onValueChange={(v) => set("category", v as JournalCategoryValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="journal-quote">Quote</Label>
            <Textarea
              id="journal-quote"
              value={draft.quote}
              rows={3}
              aria-invalid={!!errors.quote || undefined}
              onChange={(e) => set("quote", e.target.value)}
            />
            <FieldError message={errors.quote} />
          </div>

          <div className="sm:col-span-2">
            <Label>Featured</Label>
            <div className="mt-1 flex gap-2" role="radiogroup" aria-label="Featured item type">
              {(["service", "product"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={draft.kind === k}
                  onClick={() => {
                    if (draft.kind === k) return;
                    setDraft((d) => ({ ...d, kind: k, item: null }));
                    setErrors((e) => ({ ...e, item: undefined }));
                  }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${
                    draft.kind === k
                      ? "border-admin-sidebar bg-admin-sidebar text-white"
                      : "border-admin-line bg-admin-surface text-admin-muted hover:text-admin-ink"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <SearchSelect
                key={draft.kind}
                ariaLabel={`Search ${draft.kind}`}
                value={draft.item}
                onChange={(o) => set("item", o)}
                fetchOptions={fetchOptions}
                placeholder={`Search or select a ${draft.kind}`}
                invalid={!!errors.item}
              />
              <FieldError message={errors.item} />
            </div>
            {draft.item ? (
              <div className="mt-2 flex items-center gap-3 rounded-md border border-admin-line p-2">
                {draft.item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URLs
                  <img src={draft.item.imageUrl} alt="" className="size-12 rounded-md object-cover" />
                ) : (
                  <div className="size-12 rounded-md bg-admin-cream" />
                )}
                <p className="text-xs text-admin-muted">
                  <span className="font-medium text-admin-ink">{draft.item.name}</span>
                  <br />
                  Its primary image is shown on the testimonial automatically.
                </p>
              </div>
            ) : null}
          </div>

          {draft.kind === "service" ? (
            <div className="sm:col-span-2">
              <Label>Stylist</Label>
              <SearchSelect
                ariaLabel="Search stylist"
                value={draft.stylist}
                onChange={(o) => set("stylist", o)}
                fetchOptions={fetchStylists}
                placeholder="Search or select a stylist"
                invalid={!!errors.stylist}
              />
              <FieldError message={errors.stylist} />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <Label>Result image</Label>
            <ImageUploader
              images={draft.resultImage ? [draft.resultImage] : []}
              onChange={(next) => set("resultImage", next[0] ?? "")}
              max={1}
            />
            <FieldError message={errors.resultImage} />
          </div>

          <div className="sm:col-span-2">
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => set("status", v as JournalStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft (hidden from clients)</SelectItem>
                <SelectItem value="PUBLISHED">Published (visible on /journal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {submitError ? (
          <p role="alert" className="rounded-md border border-admin-rose/40 bg-admin-rose/10 px-3 py-2 text-sm text-admin-rose">
            {submitError}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button className="bg-admin-sidebar text-white" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-admin-rose">
      {message}
    </p>
  ) : null;
}
