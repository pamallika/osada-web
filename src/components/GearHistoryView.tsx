import { FC, useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { useGearHistory } from '../hooks/useGearHistory';
import { useAuthStore } from '../store/useAuthStore';
import { Skeleton } from './ui/Skeleton';
import { Modal } from './ui/Modal';
import { toast } from './Toaster';
import { cn } from '../lib/utils';

interface GearHistoryViewProps {
    userId?: number | null;
    isOwner?: boolean;
    compact?: boolean;
    refreshKey?: number;
}

type AnalyticsTab = 'general' | 'chart' | 'history';
type MetricMode = 'gs' | 'ap' | 'dp';

export const GearHistoryView: FC<GearHistoryViewProps> = ({
    userId,
    isOwner = !userId,
    compact = false,
    refreshKey
}) => {
    const { user } = useAuthStore();
    const { history, isLoading, error, deleteSnapshot } = useGearHistory(userId, refreshKey);
    const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('general');
    const [metricMode, setMetricMode] = useState<MetricMode>('gs');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sort chronologically ascending for chart
    const chartData = useMemo(() => {
        return [...history]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(item => {
                const dateObj = new Date(item.created_at);
                const formattedDate = dateObj.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short'
                });
                const fullDate = dateObj.toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return {
                    id: item.id,
                    date: formattedDate,
                    fullDate,
                    gs: item.gear_score,
                    attack: item.attack,
                    awakening: item.awakening_attack,
                    defense: item.defense,
                    source: item.source
                };
            });
    }, [history]);

    // Stats calculations
    const stats = useMemo(() => {
        if (history.length === 0) return null;
        const newest = history[0]; // DESC sorted from API
        const oldest = history[history.length - 1];

        const currentGs = newest.gear_score;
        const initialGs = oldest.gear_score;
        const deltaGs = currentGs - initialGs;

        return {
            currentGs,
            initialGs,
            deltaGs,
            count: history.length,
            currentAttack: newest.attack,
            currentAwakening: newest.awakening_attack,
            currentDefense: newest.defense
        };
    }, [history]);

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const success = await deleteSnapshot(deletingId);
        setIsDeleting(false);
        setDeletingId(null);
        if (success) {
            toast.success('Запись удалена из истории');
        } else {
            toast.error('Не удалось удалить запись');
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Current gear score fallback if no history
    const fallbackGs = user?.profile?.gear_score || (user?.profile
        ? Math.max(user.profile.attack || 0, user.profile.awakening_attack || 0) + (user.profile.defense || 0)
        : 0);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-48 rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                <p className="text-rose-400 font-semibold text-sm">Не удалось загрузить данные аналитики</p>
                <p className="text-rose-400/70 text-xs">{error}</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6 select-none animate-in fade-in duration-500", compact && "space-y-4")}>
            {/* Analytics Sub-tabs Navigation */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="inline-flex p-1 bg-zinc-950/60 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                    {[
                        { id: 'general', label: 'Общее' },
                        { id: 'chart', label: 'График' },
                        { id: 'history', label: 'История' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setAnalyticsTab(tab.id as AnalyticsTab)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                analyticsTab === tab.id
                                    ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-md"
                                    : "text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline-block">
                    Аналитика гира
                </span>
            </div>

            {/* TAB 1: ОБЩЕЕ */}
            {analyticsTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* 3 Info Cards in 1 Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3.5 shadow-inner">
                            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Текущий GS</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl sm:text-2xl font-bold text-violet-400 tabular-nums">
                                    {stats ? stats.currentGs : fallbackGs}
                                </span>
                                {stats && stats.deltaGs !== 0 && (
                                    <span className={cn(
                                        "text-xs font-semibold tabular-nums",
                                        stats.deltaGs > 0 ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {stats.deltaGs > 0 ? `+${stats.deltaGs}` : stats.deltaGs}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3.5 shadow-inner">
                            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Стартовый GS</span>
                            <span className="text-xl sm:text-2xl font-bold text-zinc-400 tabular-nums">
                                {stats ? stats.initialGs : fallbackGs}
                            </span>
                        </div>

                        <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-3.5 shadow-inner">
                            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Обновлений</span>
                            <span className="text-xl sm:text-2xl font-bold text-zinc-200 tabular-nums">
                                {stats ? stats.count : 0}
                            </span>
                        </div>
                    </div>

                    {/* Visual GEAR SCORE Block */}
                    <div className="bg-zinc-950/60 border border-white/[0.06] rounded-2xl p-6 shadow-inner space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Визуализация Gear Score</p>
                                <h4 className="text-xs font-semibold text-zinc-300 mt-0.5">Текущие показатели экипировки</h4>
                            </div>
                            <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-xs font-bold uppercase tracking-wider">
                                GS: {stats ? stats.currentGs : fallbackGs}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl py-3 text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">AP</p>
                                <p className="text-base font-bold text-zinc-100 tabular-nums">
                                    {stats ? stats.currentAttack : (user?.profile?.attack || 0)}
                                </p>
                            </div>
                            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl py-3 text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">AAP</p>
                                <p className="text-base font-bold text-zinc-100 tabular-nums">
                                    {stats ? stats.currentAwakening : (user?.profile?.awakening_attack || 0)}
                                </p>
                            </div>
                            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl py-3 text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">DP</p>
                                <p className="text-base font-bold text-zinc-100 tabular-nums">
                                    {stats ? stats.currentDefense : (user?.profile?.defense || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ГРАФИК (БЕЗ ПИКОВОГО GS) */}
            {analyticsTab === 'chart' && (
                <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl p-5 md:p-6 backdrop-blur-xl animate-in fade-in duration-300">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-xs">
                            Недостаточно данных для построения графика прогресса.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">График прогресса</h3>
                                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Динамика параметров во времени</p>
                                </div>

                                {/* Metric Select Buttons */}
                                <div className="inline-flex p-1 bg-zinc-900/60 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1 self-start sm:self-auto">
                                    {[
                                        { key: 'gs', label: 'Gear Score' },
                                        { key: 'ap', label: 'AP / AAP' },
                                        { key: 'dp', label: 'DP' }
                                    ].map(m => (
                                        <button
                                            key={m.key}
                                            onClick={() => setMetricMode(m.key as MetricMode)}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                                                metricMode === m.key
                                                    ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-md"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                            )}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Area Chart Container */}
                            <div className="h-60 sm:h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorGs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAap" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorDp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                                            domain={['dataMin - 10', 'dataMax + 10']}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload;
                                                    return (
                                                        <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-1.5">
                                                            <p className="text-[10px] text-zinc-500 font-semibold uppercase">{d.fullDate}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[9px] font-bold uppercase">
                                                                    {d.source === 'garmoth' ? 'Garmoth' : 'Ручной'}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1 border-t border-white/5">
                                                                <span className="text-violet-400 font-bold">GS: {d.gs}</span>
                                                                <span className="text-teal-400 font-semibold">AP: {d.attack}</span>
                                                                <span className="text-blue-400 font-semibold">AAP: {d.awakening}</span>
                                                                <span className="text-amber-400 font-semibold">DP: {d.defense}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {metricMode === 'gs' && (
                                            <Area
                                                type="monotone"
                                                dataKey="gs"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorGs)"
                                                name="Gear Score"
                                                strokeWidth={2.5}
                                                animationDuration={1000}
                                            />
                                        )}
                                        {metricMode === 'ap' && (
                                            <>
                                                <Area
                                                    type="monotone"
                                                    dataKey="attack"
                                                    stroke="#0d9488"
                                                    fillOpacity={1}
                                                    fill="url(#colorAp)"
                                                    name="AP"
                                                    strokeWidth={2}
                                                    animationDuration={1000}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="awakening"
                                                    stroke="#3b82f6"
                                                    fillOpacity={1}
                                                    fill="url(#colorAap)"
                                                    name="AAP"
                                                    strokeWidth={2}
                                                    animationDuration={1000}
                                                />
                                            </>
                                        )}
                                        {metricMode === 'dp' && (
                                            <Area
                                                type="monotone"
                                                dataKey="defense"
                                                stroke="#f59e0b"
                                                fillOpacity={1}
                                                fill="url(#colorDp)"
                                                name="DP"
                                                strokeWidth={2.5}
                                                animationDuration={1000}
                                            />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* TAB 3: ИСТОРИЯ */}
            {analyticsTab === 'history' && (
                <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
                    <div className="p-4 md:p-5 border-b border-white/[0.06] flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">История обновлений</h3>
                            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Журнал сохраненных изменений</p>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-xs">
                            История обновлений пуста.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.04] bg-zinc-900/40">
                                        <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Дата</th>
                                        <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Источник</th>
                                        <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">GS</th>
                                        <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">AP / AAP</th>
                                        <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">DP</th>
                                        {isOwner && (
                                            <th className="px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Действие</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-3.5 text-xs text-zinc-300 font-medium whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                                                    item.source === 'garmoth'
                                                        ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
                                                        : "bg-zinc-800/60 border-white/5 text-zinc-400"
                                                )}>
                                                    {item.source === 'garmoth' ? 'Garmoth' : 'Ручной'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-sm font-bold text-violet-400 tabular-nums">
                                                    {item.gear_score}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-xs text-zinc-300 tabular-nums font-medium">
                                                {item.attack} / {item.awakening_attack}
                                            </td>
                                            <td className="px-5 py-3.5 text-center text-xs text-zinc-300 tabular-nums font-medium">
                                                {item.defense}
                                            </td>
                                            {isOwner && (
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => setDeletingId(item.id)}
                                                        className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-zinc-900/60 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 transition-all duration-200 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px]"
                                                        title="Удалить"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Удаление записи из истории"
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        Вы действительно хотите удалить эту запись из истории экипировки? Это действие нельзя отменить.
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={() => setDeletingId(null)}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                            {isDeleting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Удалить'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
