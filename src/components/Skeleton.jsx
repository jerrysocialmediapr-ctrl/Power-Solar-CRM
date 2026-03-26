import React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/50", className)}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  );
}

export function ProgressBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
