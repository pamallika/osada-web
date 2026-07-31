import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: string;
    badge?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
    layer?: 'primary' | 'secondary';
    alignTop?: boolean;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
};

export const Modal: FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    badge,
    maxWidth = 'lg',
    layer = 'primary',
    alignTop = false,
    children,
    footer,
    className
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const zIndexClass = layer === 'secondary' ? 'z-[120]' : 'z-[100]';

    return (
        <div className={cn("fixed inset-0 flex justify-center p-4 select-none", alignTop ? "items-start pt-6 sm:pt-10 md:pt-14" : "items-center", zIndexClass)}>
            <div 
                className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-200"
                onClick={onClose}
            />

            <div 
                className={cn(
                    "relative w-full bg-zinc-950 border border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200",
                    maxWidthMap[maxWidth],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || subtitle || badge) && (
                    <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
                        <div>
                            {title && (
                                <h3 className="text-xl font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-3">
                                    {title}
                                    {badge}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="p-6 border-t border-zinc-800/50 bg-zinc-900/40 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
