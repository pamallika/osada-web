import type { FC } from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/events';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { SquadBuilder } from '../components/SquadBuilder';
import { SquadSlotGrid } from '../components/SquadSlotGrid';
import { SystemStatusBlocks } from '../components/SystemStatusBlocks';
import { EventStatsBar } from '../components/EventStatsBar';
import { CreateEventModal } from '../components/CreateEventModal';
import { PublishEventModal } from '../components/PublishEventModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEventWebSockets } from '../hooks/useEventWebSockets';

const EventDetailsPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    const eventId = parseInt(id || '0');
    
    // Subscribe to real-time updates
    useEventWebSockets(eventId);
    const activeGuildMembership = user?.guild_memberships?.[0];
    const activeGuildId = activeGuildMembership?.guild.id;
    const userRole = activeGuildMembership?.role;
    const isOfficer = ['creator', 'admin', 'officer'].includes(userRole || '');

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
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin mb-4"></div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic animate-pulse">Загрузка данных события...</span>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center bg-zinc-900 p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Событие не найдено</h2>
                    <button 
                        onClick={handleBack}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-xs italic border border-zinc-700"
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
            alert(err.response?.data?.message || 'Ошибка при записи');
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
            alert(err.response?.data?.message || 'Ошибка');
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
            alert(err.response?.data?.message || 'Ошибка при перемещении');
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
            alert(err.response?.data?.message || 'Ошибка при архивации');
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
            alert('Ошибка при публикации события');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 font-sans p-4 md:p-10 select-none">
            <div className="max-w-7xl mx-auto">
                {/* Header Navigation */}
                <div className="mb-12">
                    <button 
                        onClick={handleBack}
                        className="w-11 h-11 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800/50 transition-all text-zinc-400 group mb-8"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2 flex-wrap">
                                <h1 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter italic uppercase">
                                    {event.name}
                                </h1>
                                
                                {isOfficer && !isArchived && (
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-violet-700 rounded-xl border border-zinc-800/50 text-zinc-500 hover:text-white transition-all shadow-sm"
                                        title="Редактировать детали"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}

                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                    isArchived 
                                    ? 'bg-zinc-900 text-zinc-600 border-zinc-800/50' 
                                    : event.status === 'published' 
                                        ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' 
                                        : 'bg-amber-900/20 text-amber-500 border-amber-800/50'
                                }`}>
                                    {event.status === 'draft' ? 'Черновик' : event.status === 'published' ? 'Активно' : event.status}
                                </span>
                            </div>
                            
                            <p className="text-zinc-500 text-lg md:text-xl font-bold uppercase tracking-tight italic">
                                {format(startDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            {!isArchived && isOfficer && (
                                <>
                                    {event.status === 'draft' && (
                                        <button
                                            onClick={() => setIsPublishModalOpen(true)}
                                            disabled={isProcessing}
                                            className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black h-14 px-8 rounded-2xl transition-all shadow-xl shadow-violet-900/20 uppercase tracking-widest text-[10px] italic flex items-center gap-3 active:scale-[0.98] border border-violet-600/50"
                                        >
                                            🚀 Опубликовать
                                        </button>
                                    )}
                                    <button
                                        onClick={handleArchive}
                                        disabled={isProcessing}
                                        className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 font-black h-14 px-8 rounded-2xl transition-all border border-zinc-800/50 uppercase tracking-widest text-[10px] italic active:scale-[0.98]"
                                    >
                                        В архив
                                    </button>
                                </>
                            )}
                            
                            {isArchived && (
                                <div className="bg-zinc-900 px-8 py-5 rounded-2xl border border-zinc-800/50 text-zinc-600 font-black uppercase tracking-widest text-[10px] italic">
                                    Событие в архиве
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <EventStatsBar event={event} />
                </div>

                {isOfficer && !isArchived && (
                    <div className="flex gap-2 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800/50 w-fit mb-10 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setViewMode('view')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                                viewMode === 'view' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Мониторинг
                        </button>
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                                viewMode === 'edit' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Конструктор
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-3 space-y-10">
                        {isOfficer && viewMode === 'edit' && !isArchived ? (
                            <SquadBuilder event={event} onUpdate={() => refetch()} />
                        ) : (
                            <div className="space-y-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-violet-700 rounded-full"></div>
                                    <h2 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">Состав отрядов</h2>
                                </div>
                                
                                <SquadSlotGrid 
                                    event={event} 
                                    onJoin={handleJoin} 
                                    onDecline={handleDecline}
                                    onKick={handleKick}
                                    isOfficer={isOfficer && !isArchived}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {event.description && (
                             <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <span className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100">INFO</span>
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-4 italic">Описание</h3>
                                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2 px-2">
                                <div className="w-1 h-5 bg-zinc-800 rounded-full"></div>
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Системные списки</h3>
                            </div>
                            <SystemStatusBlocks 
                                event={event} 
                                onKick={handleKick}
                                isOfficer={isOfficer && !isArchived}
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
