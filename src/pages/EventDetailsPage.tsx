import type { FC } from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/events';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { SquadSlotGrid } from '../components/SquadSlotGrid';
import { SystemStatusBlocks } from '../components/SystemStatusBlocks';
import { EventStatsBar } from '../components/EventStatsBar';
import { CreateEventModal } from '../components/CreateEventModal';
import { PublishEventModal } from '../components/PublishEventModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEventWebSockets } from '../hooks/useEventWebSockets';
import { useNotificationStore } from '../store/useNotificationStore';
import { Skeleton } from '../components/ui/Skeleton';

const EventDetailsPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const { addNotification } = useNotificationStore();

    const eventId = parseInt(id || '0');
    
    // Subscribe to real-time updates
    useEventWebSockets(eventId);
    const activeGuildMembership = user?.guild_memberships?.[0];
    const activeGuildId = activeGuildMembership?.guild.id;
    const userRole = activeGuildMembership?.role;
    const isOfficer = ['creator', 'admin', 'officer'].includes(userRole || '');
    const isAdmin = ['creator', 'admin'].includes(userRole || '');

    const { data: event, isLoading, error, refetch } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => eventsApi.getEvent(eventId),
        enabled: !!eventId,
    });

    const syncUser = async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (error) {
            console.error('Failed to sync user:', error);
        }
    };

    const handleBack = () => {
        syncUser();
        navigate('/events');
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-500">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <Skeleton className="h-[600px] rounded-3xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-64 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center bg-zinc-900/40 backdrop-blur-xl p-10 rounded-3xl border border-white/[0.06] shadow-2xl max-w-md">
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Событие не найдено</h2>
                    <button 
                        onClick={handleBack}
                        className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg"
                    >
                        Вернуться к списку
                    </button>
                </div>
            </div>
        );
    }

    const startDate = new Date(event.start_at);
    const isArchived = event.status === 'archived';
    
    const handleJoin = async (squadId: number | null) => {
        if (isArchived) return;
        setIsProcessing(true);
        try {
            await eventsApi.joinEvent(event.id, squadId);
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        if (isArchived) return;
        setIsProcessing(true);
        try {
            await eventsApi.declineEvent(event.id);
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKick = async (userId: number) => {
        if (isArchived) return;
        setIsProcessing(true);
        try {
            await eventsApi.moveParticipant(event.id, userId, null);
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm('Вы уверены, что хотите завершить событие? Это переведет его в архив.')) return;
        setIsProcessing(true);
        try {
            await eventsApi.archiveEvent(event.id);
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMoveUser = async (userId: number, squadId: number | null) => {
        setIsProcessing(true);
        try {
            await eventsApi.moveParticipant(event.id, userId, squadId);
            addNotification({ title: 'Перемещение', message: 'Участник успешно перемещен', type: 'success' });
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePublish = async (options: { platforms: string[], roles: string[] }) => {
        setIsProcessing(true);
        try {
            await eventsApi.publishEvent(event.id, options);
            setIsPublishModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to publish event:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddSquad = async (name: string, limit: number) => {
        setIsProcessing(true);
        try {
            await eventsApi.addSquad(event.id, { name, limit });
            addNotification({ title: 'Отряды', message: 'Отряд успешно создан', type: 'success' });
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateSquad = async (squadId: number, data: { name?: string, limit?: number }) => {
        setIsProcessing(true);
        const squad = event.squads?.find(s => s.id === squadId);
        if (!squad) return;

        try {
            await eventsApi.updateSquad(event.id, squadId, { 
                name: data.name ?? squad.name, 
                limit: data.limit ?? squad.limit 
            });
            addNotification({ title: 'Отряды', message: 'Изменения сохранены', type: 'success' });
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteSquad = async (squadId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот отряд?')) return;
        setIsProcessing(true);
        try {
            await eventsApi.deleteSquad(event.id, squadId);
            addNotification({ title: 'Отряды', message: 'Отряд удален', type: 'info' });
            refetch();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReorderSquads = async (ids: number[]) => {
        if (isArchived || !isAdmin) return;
        setIsProcessing(true);
        try {
            await eventsApi.reorderSquads(event.id, ids);
            refetch();
        } catch (err: any) {
            console.error(err);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-10 select-none animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group font-medium"
                    >
                        <span className="transition-transform group-hover:-translate-x-0.5">←</span> К списку событий
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                    {event.name}
                                </h1>
                                
                                {isOfficer && !isArchived && (
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-950/50 hover:bg-zinc-800 rounded-xl border border-white/5 text-zinc-500 hover:text-white transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}

                                {isArchived ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                                        В архиве
                                    </span>
                                ) : event.status === 'published' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                                        Активно
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                                        Черновик
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-sm text-zinc-500 tabular-nums font-medium">
                                {format(startDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isArchived && isOfficer && (
                                <>
                                    {event.status === 'draft' && (
                                        <button
                                            onClick={() => setIsPublishModalOpen(true)}
                                            disabled={isProcessing}
                                            className="bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xl transition-all active:scale-[0.98]"
                                        >
                                            Опубликовать
                                        </button>
                                    )}
                                    <button
                                        onClick={handleArchive}
                                        disabled={isProcessing}
                                        className="bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-all active:scale-[0.98]"
                                    >
                                        В архив
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <EventStatsBar event={event} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white tracking-tight">Состав отрядов</h2>
                            <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                        
                        <SquadSlotGrid 
                            event={event} 
                            onJoin={handleJoin} 
                            onKick={handleKick}
                            onDecline={handleDecline}
                            onMoveUser={handleMoveUser}
                            onAddSquad={handleAddSquad}
                            onUpdateSquad={handleUpdateSquad}
                            onDeleteSquad={handleDeleteSquad}
                            onReorderSquads={handleReorderSquads}
                            isOfficer={isOfficer && !isArchived}
                            isAdmin={isAdmin && !isArchived}
                        />
                    </div>

                    <div className="space-y-6">
                        {event.description && (
                            <div className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.06] shadow-xl">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-0.5 font-inter">Описание</h3>
                                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-inter">
                                    {event.description}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4 px-1">
                                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Системные списки</h3>
                                <div className="flex-1 h-px bg-white/[0.04]" />
                            </div>
                            <SystemStatusBlocks 
                                event={event} 
                                onKick={handleKick}
                                onDecline={handleDecline}
                                onMoveUser={handleMoveUser}
                                isOfficer={isOfficer && !isArchived}
                                isAdmin={isAdmin && !isArchived}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {activeGuildId && (
                <CreateEventModal 
                    guildId={activeGuildId}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => refetch()}
                    event={event}
                />
            )}

            <PublishEventModal 
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onPublish={handlePublish}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default EventDetailsPage;
