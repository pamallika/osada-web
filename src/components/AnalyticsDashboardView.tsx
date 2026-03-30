import { FC, useState } from 'react';
import { useAnalyticsDashboard } from '../hooks/useDashboard';
import { 
    PieChart, Pie, Cell, 
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer 
} from 'recharts';
import { Skeleton } from './Skeleton';

const PERIODS = [7, 14, 30];

// Colors for charts aligned with SAGE design system
const COLORS = [
    '#6d28d9', // violet-700
    '#0f766e', // teal-700
    '#b45309', // amber-700
    '#4338ca', // indigo-700
    '#9f1239', // rose-800
    '#065f46', // emerald-800
    '#27272a'  // zinc-800
];

interface AnalyticsDashboardViewProps {
    isAdmin?: boolean;
}

export const AnalyticsDashboardView: FC<AnalyticsDashboardViewProps> = ({ isAdmin = false }) => {
    const [period, setPeriod] = useState(7);
    const { data, isLoading, error } = useAnalyticsDashboard(period);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Skeleton className="w-48 h-10 rounded-xl" />
                    <Skeleton className="w-48 h-10 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800/50 h-48 space-y-4">
                        <Skeleton className="w-32 h-3" />
                        <Skeleton className="w-24 h-12" />
                        <Skeleton className="w-full h-2" />
                    </div>
                    <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800/50 h-48 space-y-3">
                        <Skeleton className="w-32 h-3" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-[2rem]" />
                    <Skeleton className="h-80 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
             <div className="p-16 text-center bg-zinc-900 rounded-[3rem] border border-zinc-800/50 my-10 shadow-xl">
                <div className="w-16 h-16 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-900/30">
                    <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-zinc-100 font-black uppercase italic tracking-tighter text-xl">
                    Аналитика временно недоступна
                </h3>
                <p className="text-zinc-500 text-[10px] mt-2 uppercase font-bold tracking-widest max-w-[250px] mx-auto leading-relaxed">
                    {(error as Error)?.message || 'За этот период недостаточно данных для визуализации'}
                </p>
                <button 
                    onClick={() => setPeriod(7)}
                    className="mt-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border border-zinc-700/50"
                >
                    Сбросить до 7 дней
                </button>
            </div>
        );
    }

    const { activity, meta, hr } = data;

    // Parse HR data into recharts format
    const hrData = hr?.dynamics.dates.map((date, i) => ({
        date,
        joined: hr.dynamics.joined[i],
        left: hr.dynamics.left[i]
    })) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-12 safe-area-inset">
            {/* Header with Period Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Дашборд Управления</span>
                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter leading-none mt-1">Аналитика Гильдии</h2>
                </div>
                <div className="flex gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 w-fit shadow-inner">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                period === p ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/30' : 'text-zinc-600 hover:text-zinc-300'
                            }`}
                        >
                            {p} дней
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Rate Card */}
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group shadow-lg shadow-zinc-950/20 min-h-[180px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <span className="text-7xl font-black italic uppercase tracking-tighter text-zinc-100">FILL</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">Общая Активность</span>
                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-6xl font-black text-zinc-100 italic tracking-tighter leading-none">
                                {activity.fill_rate}%
                            </span>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic mb-1">
                                заполняемость
                            </span>
                        </div>
                        <div className="mt-6 w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800/30 p-[2px]">
                            <div 
                                className="bg-emerald-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                style={{ width: `${activity.fill_rate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Top Players Micro-Leaderboard */}
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-lg shadow-zinc-950/20 max-h-[180px] md:max-h-full">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic">Лидеры Активности</span>
                        <span className="text-[10px] font-black text-zinc-600 uppercase italic">top {activity.top_players.length}</span>
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {activity.top_players.length > 0 ? activity.top_players.map((player, idx) => (
                            <div key={player.id} className="flex items-center justify-between group/player">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black text-zinc-700 w-4 italic">{idx + 1}.</span>
                                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800/50 flex items-center justify-center overflow-hidden shadow-inner">
                                        {player.avatar ? (
                                            <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[11px] font-black text-zinc-800 uppercase italic">{player.name[0]}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-300 group-hover/player:text-amber-500 transition-colors truncate max-w-[120px]">{player.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-100 font-black italic text-xs">{player.confirmed_count}</span>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">siege</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-4 text-center opacity-40 italic text-zinc-500 text-[10px]">Нет данных об активности</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meta distribution (Pie) */}
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-lg shadow-zinc-950/20 min-h-[380px] flex flex-col">
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic mb-8 block">Популярность Классов</span>
                    <div className="flex-1 min-h-[250px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={meta.class_distribution}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="class"
                                >
                                    {meta.class_distribution.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            stroke="transparent"
                                            className="outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#d4d4d8', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend 
                                    align="center"
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    wrapperStyle={{ 
                                        fontSize: '9px', 
                                        fontWeight: 'black', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.1em', 
                                        paddingTop: '30px',
                                        color: '#71717a'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Dynamics (Area) - Admin feature */}
                {isAdmin && (
                    <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-lg shadow-zinc-950/20 min-h-[380px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] italic">Динамика Состава</span>
                            <span className="text-[8px] font-black text-zinc-700 uppercase p-1 px-2 border border-zinc-800 rounded-md">HR Access</span>
                        </div>
                        <div className="flex-1 min-h-[250px] w-full mt-auto">
                            {hrData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hrData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#3f3f46" 
                                            fontSize={9} 
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => val.split('-').slice(1).reverse().join('.')}
                                            dy={10}
                                        />
                                        <YAxis 
                                            stroke="#3f3f46" 
                                            fontSize={9} 
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '14px' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="joined" 
                                            stroke="#10b981" 
                                            fillOpacity={1} 
                                            fill="url(#colorJoined)" 
                                            name="ВСТУПИЛО" 
                                            strokeWidth={3} 
                                            animationDuration={1500}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="left" 
                                            stroke="#ef4444" 
                                            fillOpacity={1} 
                                            fill="url(#colorLeft)" 
                                            name="ВЫШЛО" 
                                            strokeWidth={3} 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                                     <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">📉</div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Недостаточно данных для графика</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
