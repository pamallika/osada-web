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
    published: 'Активен',
    completed: 'Завершен',
    cancelled: 'Отменен',
    archived: 'Архив'
};

const statusColors: Record<Event['status'], string> = {
    draft: 'bg-amber-900/20 text-amber-500 border-amber-800/50',
    published: 'bg-emerald-900/20 text-emerald-500 border-emerald-800/50',
    completed: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50',
    cancelled: 'bg-rose-900/20 text-rose-500 border-rose-800/50',
    archived: 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50'
};

export const EventCard: FC<EventCardProps> = ({ event, onClick }) => {
    const startDate = new Date(event.start_at);
    
    return (
        <div 
            onClick={() => onClick?.(event)}
            className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group cursor-pointer transition-all hover:border-violet-700/50 active:scale-[0.98] select-none"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Событие</span>
                        <h3 className="text-2xl font-black mt-1 text-zinc-100 uppercase italic tracking-tighter group-hover:text-violet-400 transition-colors">
                            {event.name}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {format(startDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusColors[event.status]}`}>
                        {statusLabels[event.status]}
                    </span>
                </div>

                {event.stats && (
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">Заполнено мест</span>
                            <span className="text-zinc-100">
                                {event.stats.total_confirmed} <span className="text-zinc-500">/</span> {event.stats.total_slots}
                            </span>
                        </div>
                        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800/30">
                            <div 
                                className="bg-violet-700 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (event.stats.total_confirmed / (event.stats.total_slots || 1)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex items-center gap-3">
                    <div className="bg-zinc-950/50 text-zinc-400 py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest italic border border-zinc-800/50 truncate max-w-[200px]">
                        {event.description || 'Без описания'}
                    </div>
                    <div className="flex-1"></div>
                    <div className="w-8 h-8 rounded-lg bg-violet-700/20 border border-violet-700/30 flex items-center justify-center text-violet-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
