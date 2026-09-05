"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DetailHeader,
  DetailGrid,
  DetailCard,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { useAdmin } from "@/lib/admin/store";

export function PageDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pages } = useAdmin();

  const page = pages.find((p) => p.id === params.id);

  if (!page) {
    return (
      <EmptyState
        title="Page not found"
        description="It may have been removed. Return to the pages list."
        action={<Button onClick={() => router.push("/admin/pages")}>Back to Pages</Button>}
      />
    );
  }

  return (
    <div>
      <DetailHeader
        backHref="/admin/pages"
        backLabel="Back to Pages"
        title={page.title}
        subtitle={`/${page.slug}`}
        status={<StatusBadge status={page.status} />}
      />

      <DetailGrid>
        <DetailCard>
          <article className="prose prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed text-admin-ink">
            {page.content}
          </article>
        </DetailCard>

        <DetailCard title="SEO">
          <dl>
            <FieldRow label="Meta Title" value={page.metaTitle || "—"} />
            <FieldRow label="Meta Description" value={page.metaDescription || "—"} />
            <FieldRow label="Updated" value={page.updatedAt} />
          </dl>
        </DetailCard>
      </DetailGrid>
    </div>
  );
}
