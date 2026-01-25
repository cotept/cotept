"use client"

import { Skeleton } from "@repo/shared/components/skeleton"

export function MentorProfileSetupSkeleton() {
  return (
    <div className="bg-card space-y-4 rounded-2xl border p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="bg-muted/50 h-48 rounded-2xl" />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  )
}
