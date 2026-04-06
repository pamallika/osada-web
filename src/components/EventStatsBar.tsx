import type { FC } from 'react';
import type { Event } from '../api/events';
import { cn } from '../lib/utils';

interface EventStatsBarProps {
    event: Event;
}

export const EventStatsBar: FC<EventStatsBarProps> = ({ event }) => {
    const stats = event.stats || {
        total_confirmed: 0,
        total_declined: 0,
        total_pending: 0,
        total_slots: 0
    };

    const occupancyRate = stats.total_slots > 0 
        ? Math.round((stats.total_confirmed / stats.total_slots) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-xl px-5 py-4 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Участников</p>
                <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{stats.total_confirmed}</p>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-xl px-5 py-4 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Заполнено</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{occupancyRate}%</p>
                    <span className="text-[10px] text-zinc-500 font-medium tabular-nums">из {stats.total_slots}</span>
                </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-xl px-5 py-4 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Отказов</p>
                <p className={cn(
                    "text-3xl font-semibold tracking-tight tabular-nums",
                    stats.total_declined > 0 ? "text-rose-400" : "text-zinc-500"
                )}>
                    {stats.total_declined}
                </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-xl px-5 py-4 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Не опред.</p>
                <p className={cn(
                    "text-3xl font-semibold tracking-tight tabular-nums",
                    stats.total_pending > 0 ? "text-amber-400" : "text-zinc-500"
                )}>
                    {stats.total_pending}
                </p>
            </div>
        </div>
    );
};
