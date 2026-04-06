import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg bg-zinc-800/50',
      'before:absolute before:inset-0 before:-translate-x-full',
      'before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent',
      'before:animate-[shimmer_1.5s_infinite]',
      className
    )} />
  );
}
