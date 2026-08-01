import { FC } from 'react';
import Avatar from './ui/Avatar';

interface GuildGearTopGrowthProps {
    topGrowth?: {
        user_id: number;
        family_name: string;
        current_gs: number;
        gs_delta: number;
        avatar: string | null;
    }[];
}

export const GuildGearTopGrowth: FC<GuildGearTopGrowthProps> = ({ topGrowth = [] }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col min-h-[360px] select-none">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">Лидеры роста</p>
                    <h3 className="text-xs font-semibold text-zinc-400 mt-0.5">Наибольший прирост гира (+GS) за период</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                    Топ прогресса
                </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar flex-1">
                {topGrowth.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 italic py-12">
                        Нет данных о приросте гира за этот период
                    </div>
                ) : (
                    topGrowth.map((player, idx) => (
                        <div
                            key={player.user_id}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-zinc-950/40 hover:bg-white/[0.03] border border-white/[0.04] transition-all group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-4 text-right text-xs text-zinc-600 font-bold tabular-nums shrink-0">
                                    {idx + 1}.
                                </span>
                                <Avatar
                                    user={{
                                        avatar_url: player.avatar,
                                        profile: { family_name: player.family_name } as any
                                    }}
                                    size="sm"
                                    className="w-8 h-8 ring-1 ring-white/10 shrink-0"
                                />
                                <div className="truncate">
                                    <p className="text-xs font-bold text-zinc-200 group-hover:text-violet-300 transition-colors truncate">
                                        {player.family_name}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-medium tabular-nums">
                                        Текущий GS: {player.current_gs}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold tabular-nums">
                                    +{player.gs_delta} GS
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
