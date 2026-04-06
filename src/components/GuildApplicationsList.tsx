import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import { Skeleton } from './ui/Skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getMediaUrl } from '../lib/utils';

export const GuildApplicationsList: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: applications, isLoading } = useQuery({
        queryKey: ['guild-applications'],
        queryFn: () => guildApi.getApplications(),
    });

    const approveMutation = useMutation({
        mutationFn: (applicationId: number) => guildApi.approveApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-applications'] });
            queryClient.invalidateQueries({ queryKey: ['guild-members'] });
            queryClient.invalidateQueries({ queryKey: ['guild-applications-count'] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (applicationId: number) => guildApi.rejectApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-applications'] });
            queryClient.invalidateQueries({ queryKey: ['guild-applications-count'] });
        },
    });

    if (isLoading) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-900/40 border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-xl ring-1 ring-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1 rounded-lg" />
                        <Skeleton className="h-9 flex-1 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 md:p-8 ring-1 ring-white/[0.04] shadow-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-inter">Входящие заявки</h2>
                <p className="text-sm text-zinc-500 mt-1 font-inter">Ожидают вашего решения</p>
            </div>

            {applications && applications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-all duration-300 group shadow-lg ring-1 ring-white/[0.02]">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {app.user?.profile?.avatar_url ? (
                                        <img src={getMediaUrl(app.user.profile.avatar_url)!} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-sm font-semibold text-zinc-400 capitalize">{app.user?.profile?.family_name?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-200 truncate">{app.user?.profile?.family_name || 'Неизвестный'}</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 font-medium tabular-nums">
                                        {format(new Date(app.created_at || app.joined_at || ''), 'd MMM, HH:mm', { locale: ru })}
                                    </p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.04]">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Класс</span>
                                    <span className="text-xs font-semibold text-zinc-400 ml-auto">{app.user?.profile?.char_class || '—'}</span>
                                </div>
                                {(app.user?.profile?.gs && app.user?.profile?.gs > 0) ? (
                                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-950/40 border border-white/[0.04]">
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Gear Score</span>
                                        <span className="text-xs font-semibold text-violet-400 ml-auto tabular-nums">{app.user.profile.gs}</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => rejectMutation.mutate(app.user?.id ?? app.user_id)}
                                    disabled={rejectMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-medium transition-all"
                                >
                                    Отклонить
                                </button>
                                <button
                                    onClick={() => approveMutation.mutate(app.user?.id ?? app.user_id)}
                                    disabled={approveMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-900/30"
                                >
                                    Принять
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/[0.06] flex items-center justify-center">
                        <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375m1.875-12h-9.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 4.5 21h9.75a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 14.25 3zM16.5 7.5l3 3m0 0l-3 3m3-3H12" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-400">Нет входящих заявок</p>
                        <p className="text-xs text-zinc-600 mt-1">Новые заявки появятся здесь автоматически</p>
                    </div>
                </div>
            )}
        </div>
    );
};
