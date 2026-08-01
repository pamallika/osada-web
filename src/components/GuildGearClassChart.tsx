import { FC } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface GuildGearClassChartProps {
    classGear?: { class_name: string; avg_gs: number; count: number }[];
}

const CLASS_BAR_COLORS = [
    '#8b5cf6', '#0d9488', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#84cc16'
];

export const GuildGearClassChart: FC<GuildGearClassChartProps> = ({ classGear = [] }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col min-h-[360px] select-none">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Гир по классам</p>
                    <h3 className="text-xs font-semibold text-zinc-400 mt-0.5">Средний Gear Score в разрезе игровых классов</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    Классы
                </span>
            </div>

            <div className="flex-1 min-h-[220px] w-full">
                {classGear.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classGear} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="class_name"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                            />
                            <YAxis
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 10', 'dataMax + 10']}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-1">
                                                <p className="text-xs font-bold text-zinc-200">{d.class_name}</p>
                                                <p className="text-xs text-amber-400 font-semibold">Ср. GS: {d.avg_gs}</p>
                                                <p className="text-[10px] text-zinc-500">Игроков: {d.count}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="avg_gs" radius={[8, 8, 0, 0]} maxBarSize={45} animationDuration={1000}>
                                {classGear.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CLASS_BAR_COLORS[index % CLASS_BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 italic">
                        Нет данных по классам
                    </div>
                )}
            </div>
        </div>
    );
};
