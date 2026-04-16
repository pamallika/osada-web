import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/public';
import { Skeleton } from '../components/ui/Skeleton';
import Avatar from '../components/ui/Avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const PublicGuildProfilePage: FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');

    const { data: guild, isLoading: isGuildLoading, error: guildError } = useQuery({
        queryKey: ['public-guild', slug],
        queryFn: () => publicApi.getGuildProfile(slug!),
        enabled: !!slug,
        retry: false
    });

    const { data: members, isLoading: isMembersLoading } = useQuery({
        queryKey: ['public-guild-members', slug],
        queryFn: () => publicApi.getGuildMembers(slug!),
        enabled: !!slug && activeTab === 'members'
    });

    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['public-guild-history', slug],
        queryFn: () => publicApi.getGuildHistory(slug!),
        enabled: !!slug && activeTab === 'history'
    });

    if (guildError) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-rose-900/20 border border-rose-800/50 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight mb-2">Профиль скрыт или не найден</h1>
                <p className="text-zinc-500 text-sm max-w-sm mb-8">Возможно, гильдия не существует или владелец сделал её профиль приватным.</p>
                <button
                    onClick={() => navigate('/guilds')}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl border border-white/5 transition-all uppercase tracking-widest text-xs"
                >
                    Вернуться
                </button>
            </div>
        );
    }

    if (isGuildLoading || !guild) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-24 h-24 rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pt-20 animate-in fade-in duration-700">
            {/* Header */}
            <button onClick={() => navigate('/guilds')} className="text-zinc-500 hover:text-zinc-300 text-sm font-medium mb-8 flex items-center gap-2 transition-colors">
                ← Назад
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 bg-zinc-900/30 backdrop-blur-xl border border-white/[0.04] p-8 rounded-3xl">
                <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative">
                    {guild.logo_url ? (
                        <img src={guild.logo_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <span className="text-4xl font-black text-zinc-500">{guild.name[0]}</span>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none"></div>
                </div>

                <div className="text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-3">
                        Публичный профиль
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">{guild.name}</h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mt-4 text-sm font-medium">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Участников: <span className="text-white font-bold">{guild.members_count}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <span className="text-zinc-500">Глава:</span>
                            <span className="text-white font-bold">{guild.creator_family_name || 'Неизвестно'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 mt-10 mb-8">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-4 text-sm font-bold tracking-wide uppercase transition-colors relative ${activeTab === 'members' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Состав
                    {activeTab === 'members' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(139,92,246,0.5)]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-sm font-bold tracking-wide uppercase transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    История
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_8px_rgba(139,92,246,0.5)]"></div>}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'members' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isMembersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members?.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/[0.04] rounded-xl hover:bg-zinc-900/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar 
                                            user={{ 
                                                avatar_url: (m as any).avatar_url, 
                                                profile: { family_name: m.family_name, global_name: null, char_class: null, attack: 0, awakening_attack: 0, defense: 0, gear_score: 0 } 
                                            }} 
                                            size="md" 
                                            className="shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-zinc-200">{m.family_name || 'Скрыто'}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-medium mt-0.5">
                                                {m.joined_at ? `Вступил ${format(new Date(m.joined_at), 'd MMM yyyy', { locale: ru })}` : 'Дата неизвестна'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-zinc-400 tabular-nums">{m.days_in_guild}</span>
                                        <span className="text-[9px] text-zinc-600 block uppercase font-medium mt-0.5">дней</span>
                                    </div>
                                </div>
                            ))}
                            {members?.length === 0 && (
                                <div className="col-span-full py-10 text-center text-zinc-500 text-sm">
                                    Нет данных об участниках.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-zinc-900/20 border border-dashed border-white/10 rounded-2xl h-40 flex items-center justify-center mb-8">
                        {/* График заглушка */}
                        <div className="text-center">
                            <span className="text-2xl opacity-20">📈</span>
                            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-semibold">График численности</p>
                            <p className="text-zinc-600 text-[10px] mt-1">Визуализация в разработке</p>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Лог событий</h3>
                    {isHistoryLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {history?.map((event, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/[0.02] rounded-xl text-sm">
                                    <div className="flex items-center gap-3">
                                        {event.action === 'join' && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>}
                                        {event.action === 'leave' && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>}
                                        {event.action === 'kick' && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>}
                                        <Avatar 
                                            user={{ 
                                                avatar_url: (event as any).avatar_url, 
                                                profile: { family_name: event.family_name, global_name: null, char_class: null, attack: 0, awakening_attack: 0, defense: 0, gear_score: 0 } 
                                            }} 
                                            size="sm" 
                                            className="shrink-0"
                                        />
                                        <span className="font-semibold text-zinc-200">{event.family_name || 'Неизвестно'}</span>
                                        <span className="text-zinc-500">
                                            {event.action === 'join' && 'вступил(а) в гильдию'}
                                            {event.action === 'leave' && 'покинул(а) гильдию'}
                                            {event.action === 'kick' && 'был(а) исключен(а) из гильдии'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500 whitespace-nowrap tabular-nums">
                                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ru })}
                                    </div>
                                </div>
                            ))}
                            {history?.length === 0 && (
                                <div className="py-10 text-center text-zinc-500 text-sm">
                                    История пока пуста.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicGuildProfilePage;
