import React, { useState, useRef, useEffect } from 'react';
import { cn } from './Button';

export interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        'absolute z-50 mt-2 min-w-[200px] rounded-xl border border-zinc-800/50 bg-zinc-900 shadow-lg shadow-black/50 py-1 focus:outline-none',
                        align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
                        className
                    )}
                >
                    {/* Inject setIsOpen(false) to children if they are valid elements */}
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                                // @ts-ignore
                                onClick: (e: any) => {
                                    if (child.props.onClick) {
                                        child.props.onClick(e);
                                    }
                                    setIsOpen(false);
                                }
                            });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'danger';
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
            danger: 'text-rose-500 hover:bg-rose-900/20 hover:text-rose-400',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'block px-4 py-2.5 text-sm cursor-pointer select-none transition-colors first:rounded-t-lg last:rounded-b-lg',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

DropdownItem.displayName = 'DropdownItem';
