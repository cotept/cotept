"use client"

import { Skeleton } from "@repo/shared/components/skeleton"

export function MentorProfileSetupSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
      <Skeleton className="h-4 w-32 bg-zinc-800/70" />
      <Skeleton className="h-4 w-48 bg-zinc-800/70" />
      <Skeleton className="h-48 rounded-2xl bg-zinc-900/60" />
      <Skeleton className="h-10 rounded-lg bg-zinc-800/70" />
    </div>
  )
}
