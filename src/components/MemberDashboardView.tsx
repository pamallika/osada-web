import { FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMemberDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { guildApi } from '../api/guilds';
import { EventCard } from './EventCard';
import { Skeleton, SkeletonCard } from './Skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const MemberDashboardView: FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const { data: dashboard, isLoading, error } = useMemberDashboard();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isEditingInvite, setIsEditingInvite] = useState(false);
    const [editInviteSlug, setEditInviteSlug] = useState('');
    const [isSavingInvite, setIsSavingInvite] = useState(false);

    const handleCopyInvite = (slug: string) => {
        const fullUrl = `${window.location.origin}/invite/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleEditInvite = () => {
        setEditInviteSlug(dashboard?.guild?.invite_slug || '');
        setIsEditingInvite(true);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addNotification({ title: 'Ошибка', message: 'Разрешены только изображения', type: 'error' });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            addNotification({ title: 'Ошибка', message: 'Максимальный размер - 2MB', type: 'error' });
            return;
        }

        setIsUploadingLogo(true);
        try {
            const updatedGuildData = await guildApi.uploadLogo(file);
            
            // Refetch dashboard
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'member'] });
            
            // Update auth store (so header logo updates too)
            if (user && user.guild_memberships) {
                const updatedMemberships = user.guild_memberships.map(m => {
                    if (m.guild.id === updatedGuildData.id) {
                        return { ...m, guild: { ...m.guild, logo_url: updatedGuildData.logo_url } };
                    }
                    return m;
                });
                setUser({ ...user, guild_memberships: updatedMemberships });
            }

            addNotification({ title: 'Успешно', message: 'Логотип гильдии обновлен', type: 'success' });
        } catch (err) {
            addNotification({ title: 'Ошибка', message: 'Не удалось загрузить логотип', type: 'error' });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSaveInvite = async () => {
        if (!editInviteSlug || editInviteSlug.length < 3 || editInviteSlug.length > 32) {
            addNotification({
                title: 'Ошибка валидации',
                message: 'Ссылка должна быть от 3 до 32 символов',
                type: 'error'
            });
            return;
        }

        const validSlug = /^[a-z0-9_-]+$/i.test(editInviteSlug);
        if (!validSlug) {
            addNotification({
                title: 'Ошибка валидации',
                message: 'Только латиница, цифры, тире и подчеркивание',
                type: 'error'
            });
            return;
        }

        setIsSavingInvite(true);
        try {
            const updatedGuild = await guildApi.updateInviteSlug(editInviteSlug.toLowerCase());

            // Update dashboard
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'member'] });

            // Update global store
            if (user && user.guild_memberships) {
                const updatedMemberships = user.guild_memberships.map(m => {
                    if (m.guild.id === updatedGuild.id) {
                        return { ...m, guild: { ...m.guild, invite_slug: updatedGuild.invite_slug } };
                    }
                    return m;
                });
                setUser({ ...user, guild_memberships: updatedMemberships });
            }

            addNotification({
                title: 'Успешно',
                message: 'Инвайт-ссылка обновлена',
                type: 'success'
            });
            setIsEditingInvite(false);
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 422) {
                addNotification({
                    title: 'Ошибка',
                    message: 'Такая ссылка уже используется другой гильдией',
                    type: 'error'
                });
            } else if (status === 403) {
                addNotification({
                    title: 'Доступ запрещен',
                    message: 'У вас нет прав для изменения ссылки',
                    type: 'error'
                });
                setIsEditingInvite(false);
            } else {
                addNotification({
                    title: 'Ошибка',
                    message: 'Не удалось обновить ссылку',
                    type: 'error'
                });
            }
        } finally {
            setIsSavingInvite(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-3 rounded-lg" />
                        <Skeleton className="w-48 h-8 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="space-y-4">
                    <Skeleton className="w-32 h-6 rounded-lg ml-2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-64 rounded-[2rem]" />
                        <Skeleton className="h-64 rounded-[2rem]" />
                        <Skeleton className="h-64 rounded-[2rem]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="p-10 text-center bg-zinc-900 rounded-[2rem] border border-zinc-800/50 my-10">
                <span className="text-rose-500 font-black uppercase tracking-widest italic text-xs">
                    Ошибка загрузки данных
                </span>
                <p className="text-zinc-500 text-[10px] mt-2 uppercase font-bold tracking-widest">
                    {(error as Error)?.message || 'Попробуйте обновить страницу'}
                </p>
            </div>
        );
    }

    const { stats, guild, next_event, open_events } = dashboard;
    const canManageGuild = user?.guild_memberships?.find(m => m.guild.id === guild?.id)?.role && ['creator', 'admin'].includes(user.guild_memberships.find(m => m.guild.id === guild?.id)!.role);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none pb-12 safe-area-inset">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div 
                        className={`relative group ${canManageGuild ? 'cursor-pointer' : ''}`}
                        onClick={() => canManageGuild && fileInputRef.current?.click()}
                    >
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-500 font-black italic text-xl shadow-inner overflow-hidden relative">
                            {guild?.logo_url ? (
                                <img
                                    src={guild.logo_url}
                                    alt={guild.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <span className="uppercase">{guild?.name?.[0] || 'S'}</span>
                            )}

                            {canManageGuild && (
                                <div className="absolute inset-0 bg-violet-700/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                </div>
                            )}

                            {isUploadingLogo && (
                                <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        
                        {canManageGuild && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                        )}
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Гильдия</span>
                        <h1 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter leading-tight">
                            {guild?.name || 'SAGE'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group shadow-lg shadow-zinc-950/20 min-h-[160px]">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <span className="text-7xl font-black italic uppercase tracking-tighter text-zinc-100">STATS</span>
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Участие в Событиях</span>
                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-6xl font-black text-zinc-100 italic tracking-tighter leading-none">
                                {stats.sieges_attended}
                            </span>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic mb-1">
                                посещенных осад
                            </span>
                        </div>
                        <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-6">
                            Статистика за текущий сезон
                        </p>
                    </div>
                </div>

                {/* Upcoming Event */}
                {next_event ? (
                    <div
                        onClick={() => navigate(`/events/${next_event.id}`)}
                        className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group cursor-pointer transition-all hover:border-violet-700/50 shadow-lg shadow-zinc-950/20 active:scale-[0.98] min-h-[160px]"
                    >
                        <div className="absolute top-4 right-6">
                            <div className="flex items-center gap-1.5 bg-emerald-900/20 border border-emerald-800/30 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Вы записаны</span>
                            </div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Ближайшее Событие</span>
                                <h2 className="text-3xl font-black mt-2 text-zinc-100 uppercase italic tracking-tighter group-hover:text-violet-400 transition-colors leading-tight">
                                    {next_event.name}
                                </h2>
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest italic">
                                        {format(new Date(next_event.start_at), 'd MMMM, HH:mm', { locale: ru })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <span className="bg-zinc-800/50 text-zinc-400 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic border border-zinc-700/30 group-hover:border-violet-700/30 group-hover:text-violet-300 transition-all inline-block hover:bg-zinc-800">
                                    Открыть детали →
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/30 border-dashed flex flex-col items-center justify-center text-center opacity-60 min-h-[160px]">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Активных записей нет</span>
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-2 leading-relaxed">Выберите событие из списка ниже,<br />чтобы подать заявку</p>
                    </div>
                )}

                {/* Invite Card */}
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group shadow-lg shadow-zinc-950/20 min-h-[160px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <span className="text-7xl font-black italic uppercase tracking-tighter text-zinc-100">INVITE</span>
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Пригласительная Ссылка</span>
                            <h2 className="text-xl font-black mt-2 text-zinc-100 uppercase italic tracking-tighter leading-tight">
                                Вступить в {guild?.name || 'Гильдию'}
                            </h2>
                        </div>
                        {user?.guild_memberships?.find(m => m.guild.id === guild?.id)?.role === 'creator' && !isEditingInvite && (
                            <button
                                onClick={handleEditInvite}
                                className="p-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 rounded-lg border border-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                                title="Изменить ссылку"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2 relative z-10">
                        {isEditingInvite ? (
                            <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={editInviteSlug}
                                        onChange={(e) => setEditInviteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        className="w-full bg-zinc-950/80 border border-violet-900/50 p-3 rounded-xl text-zinc-100 font-mono text-xs focus:border-violet-700 focus:ring-1 focus:ring-violet-700 transition-all outline-none"
                                        placeholder="Введите slug..."
                                        autoFocus
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-zinc-600 tracking-widest">SLUG</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveInvite}
                                        disabled={isSavingInvite}
                                        className="flex-1 bg-violet-700 hover:bg-violet-600 disabled:bg-violet-900/40 text-white text-[10px] font-black uppercase tracking-widest italic py-3 rounded-xl transition-all shadow-lg shadow-violet-900/20 flex items-center justify-center gap-2"
                                    >
                                        {isSavingInvite ? (
                                            <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Сохранить'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsEditingInvite(false)}
                                        disabled={isSavingInvite}
                                        className="px-6 bg-zinc-950 hover:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest italic py-3 rounded-xl border border-zinc-800 transition-all"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between group/input">
                                <span className="text-zinc-400 font-mono text-xs truncate max-w-[150px]">
                                    {guild?.invite_slug ? `.../invite/${guild.invite_slug}` : 'Нет ссылки'}
                                </span>
                                <button
                                    onClick={() => {
                                        if (guild?.invite_slug) {
                                            handleCopyInvite(guild.invite_slug);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors active:scale-95 ${copySuccess
                                            ? 'bg-emerald-900/20 text-emerald-400 hover:text-emerald-300'
                                            : 'bg-violet-900/20 text-violet-400 hover:text-violet-300'
                                        }`}
                                >
                                    {copySuccess ? 'Скопировано ✓' : 'Копировать'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Open Events List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pl-2">
                    <h2 className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">Открытые Наборы</h2>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800/50 shadow-sm">
                        {open_events.length} доступно
                    </span>
                </div>

                {open_events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {open_events.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onClick={() => navigate(`/events/${event.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-16 bg-zinc-900/40 rounded-[3rem] border border-zinc-800/50 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center opacity-30 grayscale text-2xl">
                            ⚔️
                        </div>
                        <div>
                            <h3 className="text-zinc-400 font-black uppercase italic tracking-tighter">Нет доступных осад</h3>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1 max-w-[200px] leading-relaxed">
                                Все текущие события уже укомплектованы или еще не опубликованы
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};