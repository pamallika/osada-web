import { FC, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface GuildGearGrowthChartProps {
    growthTrend?: { dates: string[]; avg_gs: number[] };
}

export const GuildGearGrowthChart: FC<GuildGearGrowthChartProps> = ({ growthTrend }) => {
    const chartData = useMemo(() => {
        if (!growthTrend || !growthTrend.dates || growthTrend.dates.length === 0) return [];
        return growthTrend.dates.map((date, index) => {
            const dateObj = new Date(date);
            const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                : date;
            return {
                date: formattedDate,
                fullDate: date,
                avgGs: growthTrend.avg_gs[index] || 0
            };
        });
    }, [growthTrend]);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col min-h-[360px] select-none">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Динамика гирскора</p>
                    <h3 className="text-xs font-semibold text-zinc-400 mt-0.5">Изменение среднего GS гильдии во времени</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Рост гильдии
                </span>
            </div>

            <div className="flex-1 min-h-[220px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="guildGsTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-1">
                                                <p className="text-[10px] text-zinc-500 font-semibold uppercase">{d.fullDate}</p>
                                                <p className="text-xs font-bold text-emerald-400">Ср. GS: {d.avgGs}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="avgGs"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#guildGsTrend)"
                                name="Средний GS"
                                strokeWidth={2.5}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 italic">
                        Недостаточно данных для графика динамики
                    </div>
                )}
            </div>
        </div>
    );
};
