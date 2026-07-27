import React from 'react';
import { cn } from './Button'; // Reusing cn utility

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-zinc-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        'flex min-h-[44px] w-full rounded-lg border bg-zinc-900 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500',
                        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50',
                        error ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-800/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-sm text-rose-500 ml-1">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
