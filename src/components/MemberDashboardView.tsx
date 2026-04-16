import { FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMemberDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { guildApi } from '../api/guilds';
import { EventCard } from './EventCard';
import { Skeleton } from './ui/Skeleton';
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
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'member'] });
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
            addNotification({ title: 'Ошибка', message: 'Ссылка должна быть от 3 до 32 символов', type: 'error' });
            return;
        }
        setIsSavingInvite(true);
        try {
            const updatedGuild = await guildApi.updateInviteSlug(editInviteSlug.toLowerCase());
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'member'] });
            if (user && user.guild_memberships) {
                const updatedMemberships = user.guild_memberships.map(m => {
                    if (m.guild.id === updatedGuild.id) {
                        return { ...m, guild: { ...m.guild, invite_slug: updatedGuild.invite_slug } };
                    }
                    return m;
                });
                setUser({ ...user, guild_memberships: updatedMemberships });
            }
            addNotification({ title: 'Успешно', message: 'Инвайт-ссылка обновлена', type: 'success' });
            setIsEditingInvite(false);
        } catch (err: any) {
            addNotification({ title: 'Ошибка', message: 'Не удалось обновить ссылку', type: 'error' });
        } finally {
            setIsSavingInvite(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="p-10 text-center bg-zinc-900 rounded-3xl border border-white/5 my-10">
                <p className="text-zinc-500 font-medium text-sm">
                    {(error as Error)?.message || 'Попробуйте обновить страницу'}
                </p>
            </div>
        );
    }

    const { stats, guild, next_event, open_events } = dashboard;
    const canManageGuild = user?.guild_memberships?.find(m => m.guild.id === guild?.id)?.role && ['creator', 'admin'].includes(user.guild_memberships.find(m => m.guild.id === guild?.id)!.role);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 select-none">
            {/* Guild Header */}
            <div className="flex items-center gap-4 mb-8">
                <div
                    className={`relative group ${canManageGuild ? 'cursor-pointer' : ''}`}
                    onClick={() => canManageGuild && fileInputRef.current?.click()}
                >
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 font-bold text-xl overflow-hidden relative ring-1 ring-white/10">
                        {guild?.logo_url ? (
                            <img src={guild.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{guild?.name?.[0] || 'S'}</span>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />

                        {canManageGuild && (
                            <div className="absolute inset-0 bg-violet-600/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                            </div>
                        )}

                        {isUploadingLogo && (
                            <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    {canManageGuild && <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />}
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">Гильдия</p>
                    <h2 className="text-xl font-bold tracking-tight text-white">{guild?.name || 'SAGE'}</h2>
                </div>
            </div>

            {/* Stats Triple Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Participation Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ring-1 ring-white/[0.04] hover:border-white/10 hover:bg-zinc-900/70 transition-all duration-500 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">Посещаемость</p>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">
                                {stats.sieges_attended}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2">Участий в событиях</p>
                </div>


                {/* Invite Link Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ring-1 ring-white/[0.04] hover:border-white/10 hover:bg-zinc-900/70 transition-all duration-500">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">Ссылка-приглашение</p>
                        <h3 className="text-lg font-bold tracking-tight text-white mt-1">Приглашение в гильдию</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-4 relative">
                        {isEditingInvite ? (
                            <div className="flex-1 flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={editInviteSlug}
                                    onChange={(e) => setEditInviteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                    className="flex-1 bg-zinc-950/60 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-violet-500/50 transition-all"
                                    placeholder="slug"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveInvite}
                                    disabled={isSavingInvite}
                                    className="px-3 bg-white text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-all"
                                >
                                    {isSavingInvite ? '...' : 'OK'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 bg-zinc-950/60 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-500 font-mono truncate">
                                    {guild?.invite_slug ? `...invite/${guild.invite_slug}` : 'Нет ссылки'}
                                </div>

                                {canManageGuild && (
                                    <button
                                        onClick={handleEditInvite}
                                        title="Изменить ссылку"
                                        className="p-2 bg-zinc-800/60 hover:bg-zinc-700 border border-white/8 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}

                                <button
                                    onClick={() => guild?.invite_slug && handleCopyInvite(guild.invite_slug)}
                                    className="px-3 py-2 bg-zinc-800/60 hover:bg-zinc-700 border border-white/8 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all whitespace-nowrap"
                                >
                                    {copySuccess ? '✓ Скопировано' : 'Копировать'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Privacy Setting Card (Only for Creators) */}
                {user?.guild_memberships?.find(m => m.guild.id === guild?.id)?.role === 'creator' && (
                    <div className="col-span-1 sm:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ring-1 ring-white/[0.04] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">Настройки приватности</p>
                            <h3 className="text-lg font-bold tracking-tight text-white mt-1">Публичный</h3>
                            <p className="text-xs text-zinc-500 mt-1">Отображать гильдию в глобальном списке</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await guildApi.updatePrivacy(!guild?.is_public);
                                    queryClient.invalidateQueries({ queryKey: ['memberDashboard'] });
                                    addNotification('Настройки приватности обновлены', 'success');
                                } catch (e) {
                                    console.error(e);
                                    addNotification('Ошибка обновления', 'error');
                                }
                            }}
                            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${guild?.is_public ? 'bg-violet-600' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${guild?.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                )}
            </div>

            {/* Recuitment Section */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl ring-1 ring-white/[0.04] p-8 overflow-hidden">
                <div className="flex items-center justify-between pl-2">
                    <h2 className="text-lg font-semibold text-white tracking-tight">Открытые Наборы</h2>
                </div>
                <div className="h-px w-full bg-white/[0.06] my-6" />

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
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/[0.06] flex items-center justify-center">
                            <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.744c0 5.051 3.11 9.38 7.543 11.173a11.95 11.95 0 0 0 4.914 0c4.433-1.793 7.543-6.122 7.543-11.173 0-1.308-.21-2.565-.598-3.743a11.959 11.959 0 0 1-7.652-3.804" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-400">Нет активных наборов</p>
                            <p className="text-xs text-zinc-600 mt-1 max-w-[220px]">Наборы в отряды появятся как только офицеры откроют запись на ближайшую осаду</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
