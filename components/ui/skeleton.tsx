import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/** Wraps a skeleton layout so screen readers announce a single "loading" status. */
function SkeletonRegion({
  label = "Loading",
  className,
  children,
}: {
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  )
}

/** Grid of image + title + price cards (collections, services). */
function CardGridSkeleton({ count = 6, label }: { count?: number; label?: string }) {
  return (
    <SkeletonRegion
      label={label}
      className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </SkeletonRegion>
  )
}

/** Vertical list of bordered rows with a thumbnail and two text lines (orders, cart, favourites...). */
function ListSkeleton({
  count = 3,
  label,
  className,
}: {
  count?: number
  label?: string
  className?: string
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border p-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-8 w-20 sm:block" />
        </div>
      ))}
    </SkeletonRegion>
  )
}

/** Review cards: name/date + stars on top, then a few text lines. */
function ReviewsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SkeletonRegion label="Loading reviews" className="mt-5 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </SkeletonRegion>
  )
}

/** Public detail page: image gallery on the left, info column on the right. */
function DetailSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonRegion
      label={label}
      className="mx-auto grid w-[min(92vw,1400px)] gap-10 py-10 lg:grid-cols-2"
    >
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </div>
    </SkeletonRegion>
  )
}

/** Admin detail pages: a title bar and two content panels. */
function AdminDetailSkeleton() {
  return (
    <SkeletonRegion label="Loading" className="space-y-6 py-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
    </SkeletonRegion>
  )
}

export {
  Skeleton,
  SkeletonRegion,
  CardGridSkeleton,
  ListSkeleton,
  ReviewsSkeleton,
  DetailSkeleton,
  AdminDetailSkeleton,
}
