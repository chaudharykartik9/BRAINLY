import React from 'react';

interface SkeletonProps {
  /** Controls size/shape/color — e.g. "h-64 rounded-2xl bg-slate-200/60". */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div role="status" aria-label="Loading" className={`animate-pulse ${className}`} />
);

interface CardGridSkeletonProps {
  count?: number;
  className?: string;
}

/** The recurring "grid of placeholder cards" loading state for content lists. */
export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 6, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className="h-64 rounded-2xl bg-slate-200/60" />
    ))}
  </div>
);
