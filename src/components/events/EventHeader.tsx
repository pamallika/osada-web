import { FC } from 'react';
import type { Event } from '../../api/events';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EventHeaderProps {
    event: Event;
    isOfficer: boolean;
    isAdmin: boolean;
    isArchived: boolean;
    isProcessing: boolean;
    onBack: () => void;
    onEdit: () => void;
    onPublish: () => void;
    onArchive: () => void;
}

export const EventHeader: FC<EventHeaderProps> = ({
    event,
    isOfficer,
    isAdmin,
    isArchived,
    isProcessing,
    onBack,
    onEdit,
    onPublish,
    onArchive,
}) => {
    const startDate = new Date(event.start_at);

    return (
        <div className="mb-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group font-medium"
            >
                <span className="transition-transform group-hover:-translate-x-0.5">←</span> К списку событий
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            {event.name}
                        </h1>
                        
                        {isOfficer && !isArchived && (
                            <button 
                                onClick={onEdit}
                                className="w-10 h-10 flex items-center justify-center bg-zinc-950/50 hover:bg-zinc-800 rounded-xl border border-white/5 text-zinc-500 hover:text-white transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        )}

                        {isArchived ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                                В архиве
                            </span>
                        ) : event.status === 'published' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                                Активно
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                                Черновик
                            </span>
                        )}
                    </div>
                    
                    <p className="text-sm text-zinc-500 tabular-nums font-medium">
                        {format(startDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isArchived && isOfficer && (
                        <>
                            {event.status === 'draft' && (
                                <button
                                    onClick={onPublish}
                                    disabled={isProcessing}
                                    className="bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Опубликовать
                                </button>
                            )}
                            <button
                                onClick={onArchive}
                                disabled={isProcessing}
                                className="bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-all active:scale-[0.98]"
                            >
                                В архив
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
