import { FC, useState } from 'react';
import { useAnalyticsDashboard } from '../hooks/useDashboard';
import {
    PieChart, Pie, Cell,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Skeleton } from './ui/Skeleton';
import Avatar from './ui/Avatar';
import { ActivityLeadersModal } from './ActivityLeadersModal';
import { GuildGearOverviewCards } from './GuildGearOverviewCards';
import { GuildGearDistributionChart } from './GuildGearDistributionChart';
import { GuildGearGrowthChart } from './GuildGearGrowthChart';
import { GuildGearTopGrowth } from './GuildGearTopGrowth';
import { GuildGearClassChart } from './GuildGearClassChart';

const PERIODS = [7, 14, 30, 0];

const COLORS = [
    '#7c3aed', // violet-600
    '#0d9488', // teal-600
    '#d97706', // amber-600
    '#4f46e5', // indigo-600
    '#e11d48', // rose-600
    '#059669', // emerald-600
    '#27272a'  // zinc-800
];

interface AnalyticsDashboardViewProps {
    isAdmin?: boolean;
}

export const AnalyticsDashboardView: FC<AnalyticsDashboardViewProps> = ({ isAdmin = false }) => {
    const [period, setPeriod] = useState(7);
    const [showLeadersModal, setShowLeadersModal] = useState(false);
    const { data, isLoading, error } = useAnalyticsDashboard(period);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-40 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-56 rounded-2xl" />
                    <Skeleton className="h-56 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-16 text-center bg-zinc-900/40 rounded-3xl border border-white/5 my-10 backdrop-blur-xl">
                <h3 className="text-zinc-100 font-semibold text-xl">
                    Аналитика временно недоступна
                </h3>
                <p className="text-zinc-500 text-sm mt-2 max-w-[250px] mx-auto leading-relaxed">
                    {(error as Error)?.message || 'За этот период недостаточно данных для визуализации'}
                </p>
                <button
                    onClick={() => setPeriod(7)}
                    className="mt-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-2 rounded-xl text-xs font-medium transition-all"
                >
                    Сбросить до 7 дней
                </button>
            </div>
        );
    }

    const { activity, meta, hr } = data;

    const hrData = hr?.dynamics.dates.map((date, i) => ({
        date,
        joined: hr.dynamics.joined[i],
        left: hr.dynamics.left[i]
    })) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-1">Управление гильдией</p>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Аналитика гильдии</h1>
                </div>
                <div className="inline-flex p-1 bg-zinc-900/60 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'text-white bg-white/10 ring-1 ring-white/10 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {p === 0 ? 'Все время' : `${p} дней`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Rate Card */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-opacity pointer-events-none">
                        <span className="text-7xl font-bold tracking-tighter text-zinc-100">FILL</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">Общая заполняемость</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-semibold tracking-tight text-white tabular-nums">
                                {activity.fill_rate}%
                            </span>
                            <span className="text-sm text-zinc-500 ml-1">Активность</span>
                        </div>

                        <div className="mt-8">
                            <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${activity.fill_rate}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-zinc-600 uppercase font-semibold">0%</span>
                                <span className="text-[10px] text-zinc-500 font-semibold">{activity.fill_rate}% из 100%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Leaders */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                    <div
                        className="flex items-center justify-between mb-6 cursor-pointer group/title select-none"
                        onClick={() => setShowLeadersModal(true)}
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500 group-hover/title:text-amber-400 transition-colors">Лидеры активности</p>
                        <div className="flex items-center gap-1.5 text-zinc-600 group-hover/title:text-zinc-300 transition-all">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Топ 10</span>
                            <div className="w-5 h-5 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5 group-hover/title:bg-zinc-700 transition-colors">
                                <svg className="w-3.5 h-3.5 group-hover/title:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {activity.top_players.slice(0, 10).map((player, idx) => (
                            <div key={player.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group">
                                <span className="w-5 text-right text-[11px] text-zinc-700 font-mono tabular-nums flex-shrink-0">{idx + 1}.</span>
                                <Avatar
                                    user={{
                                        avatar_url: player.avatar,
                                        profile: { family_name: player.name } as any
                                    }}
                                    size="sm" // roughly 28px/w-7
                                    className="w-7 h-7 ring-1 ring-white/10"
                                />
                                <span className="flex-1 text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors truncate">{player.name}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-zinc-200 tabular-nums">{player.confirmed_count}</span>
                                    <span className="text-[10px] text-zinc-600">ос.</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View All Button Action */}
                    <div className="mt-6 pt-4 border-t border-white/[0.04]">
                        <button
                            onClick={() => setShowLeadersModal(true)}
                            className="w-full py-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all group/btn"
                        >
                            <svg className="w-4 h-4 text-amber-500/60 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            Показать всех
                        </button>
                    </div>
                </div>
            </div>

            {/* Блок аналитики экипировки гильдии (Guild Gear Analytics) */}
            {data.gear && (
                <div className="space-y-6 pt-4 border-t border-white/[0.06]">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Gear Score гильдии</h2>
                    </div>

                    <GuildGearOverviewCards averages={data.gear.averages} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GuildGearDistributionChart gsDistribution={data.gear.gs_distribution} />
                        <GuildGearGrowthChart growthTrend={data.gear.growth_trend} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GuildGearTopGrowth topGrowth={data.gear.top_growth} />
                        <GuildGearClassChart classGear={data.gear.class_gear} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Classes (Pie) */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 flex flex-col min-h-[400px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400 mb-8">Популярность классов</p>
                    <div className="flex-1 min-h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={meta.class_distribution}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={6}
                                    dataKey="count"
                                    nameKey="class"
                                >
                                    {meta.class_distribution.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(9,9,11,0.95)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-white/[0.04]">
                        {meta.class_distribution.map((c, i) => (
                            <div key={c.class} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[11px] text-zinc-400 truncate">{c.class}</span>
                                <span className="text-[11px] text-zinc-600 tabular-nums ml-auto">{Math.round((c.count / meta.class_distribution.reduce((a, b) => a + b.count, 0)) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamics (Area) */}
                {isAdmin && period !== 0 && (
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">Динамика состава</p>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-600 text-[9px] font-semibold uppercase tracking-wider border border-white/[0.05]">HR View</span>
                        </div>
                        <div className="flex-1 min-h-[260px] w-full mt-auto">
                            {hrData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hrData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => val.split('-').slice(1).reverse().join('.')}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(9,9,11,0.95)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}
                                            cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="joined"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorJoined)"
                                            name="Вступило"
                                            strokeWidth={2}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-3">
                                    <span className="text-xs text-zinc-500">Недостаточно данных для графика</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showLeadersModal && (
                <ActivityLeadersModal
                    data={activity.top_players}
                    onClose={() => setShowLeadersModal(false)}
                />
            )}
        </div>
    );
};
