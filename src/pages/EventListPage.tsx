import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Event } from '../api/events';
import { eventsApi } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';

const EventListPage: FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [filter, setFilter] = useState<'active' | 'drafts' | 'archive'>('active');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsCreateModalOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const activeGuildId = user?.guild_memberships?.[0]?.guild.id;
    const userRole = user?.guild_memberships?.[0]?.role;
    
    const canCreateEvent = ['creator', 'admin', 'officer'].includes(userRole || '');

    const { data: events = [], isLoading, refetch } = useQuery({
        queryKey: ['events', activeGuildId],
        queryFn: () => eventsApi.getEvents(activeGuildId!),
        enabled: !!activeGuildId,
    });

    const filteredEvents = events.filter((event: Event) => {
        if (filter === 'active') return ['published', 'completed'].includes(event.status);
        if (filter === 'drafts') return event.status === 'draft';
        if (filter === 'archive') return event.status === 'archived';
        return true;
    });

    const handleEventClick = (event: Event) => {
        navigate(`/events/${event.id}`);
    };

    if (!activeGuildId) {
        return (
            <div className="p-4 md:p-10 flex items-center justify-center min-h-[60vh]">
                <div className="text-center bg-zinc-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/[0.06] shadow-2xl max-w-md">
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Гильдия не найдена</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">Пожалуйста, вступите в гильдию или создайте свою для доступа к событиям.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 select-none animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-1">Управление событиями</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">События</h1>
                    </div>
                    
                    {canCreateEvent && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Создать событие
                        </button>
                    )}
                </div>

                {/* Filters / Tabs */}
                <div className="inline-flex p-1 bg-zinc-900/40 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1 mb-10 overflow-x-auto no-scrollbar shadow-inner">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filter === 'active' ? 'text-white bg-white/10 ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Активные
                    </button>
                    {canCreateEvent && (
                        <button
                            onClick={() => setFilter('drafts')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                filter === 'drafts' ? 'text-white bg-white/10 ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Черновики
                        </button>
                    )}
                    <button
                        onClick={() => setFilter('archive')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filter === 'archive' ? 'text-white bg-white/10 ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Архив
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredEvents.map((event: Event) => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                                onClick={handleEventClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/[0.06] flex items-center justify-center">
                            <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-zinc-400">Событий не найдено</h3>
                            <p className="text-xs text-zinc-600 mt-1">Попробуйте изменить фильтр или создать новое событие</p>
                        </div>
                    </div>
                )}

                <CreateEventModal 
                    guildId={activeGuildId}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => refetch()}
                />
            </div>
        </div>
    );
};

export default EventListPage;
