import { FC } from 'react';

interface GuildGearOverviewCardsProps {
    averages?: {
        avg_gs: number;
        avg_attack: number;
        avg_awakening_attack: number;
        avg_defense: number;
    };
}

export const GuildGearOverviewCards: FC<GuildGearOverviewCardsProps> = ({ averages }) => {
    const stats = averages || {
        avg_gs: 0,
        avg_attack: 0,
        avg_awakening_attack: 0,
        avg_defense: 0
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.04] transition-opacity pointer-events-none">
                    <span className="text-5xl font-bold tracking-tighter text-zinc-100">GS</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-2">Средний GS</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-violet-400 tabular-nums">
                        {stats.avg_gs}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">GS</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Общий показатель состава</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.04] transition-opacity pointer-events-none">
                    <span className="text-5xl font-bold tracking-tighter text-zinc-100">AP</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400 mb-2">Ср. Атака (AP)</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-teal-400 tabular-nums">
                        {stats.avg_attack}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">AP</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Основная стойка</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.04] transition-opacity pointer-events-none">
                    <span className="text-5xl font-bold tracking-tighter text-zinc-100">AAP</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Ср. Пробужд. (AAP)</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 tabular-nums">
                        {stats.avg_awakening_attack}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">AAP</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Пробужденная стойка</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.04] transition-opacity pointer-events-none">
                    <span className="text-5xl font-bold tracking-tighter text-zinc-100">DP</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">Ср. Защита (DP)</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tabular-nums">
                        {stats.avg_defense}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">DP</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Показатель защиты</p>
            </div>
        </div>
    );
};
