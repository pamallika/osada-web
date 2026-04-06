import type { FC } from 'react';
import type { Event } from '../api/events';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EventCardProps {
    event: Event;
    onClick?: (event: Event) => void;
}

const statusLabels: Record<Event['status'], string> = {
    draft: 'Черновик',
    published: 'Активно',
    completed: 'Завершено',
    cancelled: 'Отменено',
    archived: 'Архив'
};

export const EventCard: FC<EventCardProps> = ({ event, onClick }) => {
    const startDate = new Date(event.start_at);
    const confirmedCount = event.stats?.total_confirmed || 0;
    const totalSlots = event.stats?.total_slots || 1;
    const progress = Math.min(100, (confirmedCount / totalSlots) * 100);
    
    return (
        <div 
            onClick={() => onClick?.(event)}
            className="group bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 hover:bg-zinc-900/70 transition-all duration-300 cursor-pointer shadow-lg"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Событие</span>
                {event.status === 'published' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                        Активно
                    </span>
                ) : event.status === 'draft' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                        Черновик
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                        {statusLabels[event.status]}
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-1 group-hover:text-white transition-colors">
                {event.name}
            </h3>
            <p className="text-sm text-zinc-500 mb-4 tabular-nums">
                {format(startDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Заполнено слотов</span>
                    <span className="text-xs font-semibold tabular-nums">
                        <span className="text-violet-400">{confirmedCount}</span>
                        <span className="text-zinc-600"> / {totalSlots === 1 ? '—' : totalSlots}</span>
                    </span>
                </div>
                <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-zinc-600 truncate max-w-[160px]">
                    {event.description || 'Без описания'}
                </span>
                <span className="text-xs text-violet-400 font-medium group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    Открыть <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
            </div>
        </div>
    );
};
