import { FC } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface GuildGearDistributionChartProps {
    gsDistribution?: { range: string; count: number }[];
}

const BAR_COLORS = ['#8b5cf6', '#3b82f6', '#0d9488', '#10b981'];

export const GuildGearDistributionChart: FC<GuildGearDistributionChartProps> = ({ gsDistribution = [] }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col min-h-[360px] select-none">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">Распределение GS</p>
                    <h3 className="text-xs font-semibold text-zinc-400 mt-0.5">Количество участников по диапазонам Gear Score</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                    Диапазоны
                </span>
            </div>

            <div className="flex-1 min-h-[220px] w-full">
                {gsDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gsDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-1">
                                                <p className="text-xs font-bold text-zinc-200">Диапазон: {d.range}</p>
                                                <p className="text-xs text-violet-400 font-semibold">{d.count} игрок(ов)</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50} animationDuration={1000}>
                                {gsDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 italic">
                        Нет данных о распределении
                    </div>
                )}
            </div>
        </div>
    );
};
