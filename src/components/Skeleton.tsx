export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`bg-zinc-800/60 animate-pulse rounded-xl ${className || ''}`} />
);

export const SkeletonCard = () => (
    <div className="bg-zinc-900 aspect-[5/2.5] md:aspect-[3/1] rounded-[2rem] border border-zinc-800/50 p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-3 w-32" />
        </div>
        <div className="mt-6 flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
    </div>
);
