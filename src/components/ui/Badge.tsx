import React from 'react';
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-zinc-800 text-zinc-100 border border-zinc-700/50',
            success: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50',
            danger: 'bg-rose-900/50 text-rose-400 border border-rose-800/50',
            warning: 'bg-amber-900/50 text-amber-400 border border-amber-800/50',
            outline: 'bg-transparent text-zinc-300 border border-zinc-700',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';
