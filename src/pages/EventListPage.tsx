import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Event } from '../api/events';
import { eventsApi } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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
                <div className="text-center bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl max-w-md">
                    <h2 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter mb-4">ГИЛЬДИЯ НЕ НАЙДЕНА</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Пожалуйста, вступите в гильдию или создайте свою для доступа к событиям.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 font-sans select-none animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 bg-violet-700 rounded-full"></div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Задачи события</span>
                        </div>
                        <h1 className="text-5xl font-black text-zinc-100 tracking-tighter italic uppercase">События</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">Оперативное управление</p>
                    </div>
                    
                    {canCreateEvent && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-violet-700 hover:bg-violet-600 text-white font-black py-4 px-8 rounded-xl transition-all shadow-xl shadow-violet-900/10 uppercase tracking-widest text-[10px] italic flex items-center gap-3 active:scale-[0.98]"
                        >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            Создать событие
                        </button>
                    )}
                </div>

                {/* Filters / Tabs */}
                <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800/50 w-fit mb-10 overflow-x-auto no-scrollbar shadow-inner">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                            filter === 'active' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                        }`}
                    >
                        Активные
                    </button>
                    {canCreateEvent && (
                        <button
                            onClick={() => setFilter('drafts')}
                            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                                filter === 'drafts' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                            }`}
                        >
                            Черновики
                        </button>
                    )}
                    <button
                        onClick={() => setFilter('archive')}
                        className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                            filter === 'archive' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                        }`}
                    >
                        Архив
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-12 h-12 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic animate-pulse">Синхронизация данных...</span>
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
                    <div className="bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-zinc-800/50 py-32 text-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-zinc-800/50">
                                <span className="text-3xl opacity-30">📅</span>
                            </div>
                            <h3 className="text-2xl font-black text-zinc-100/30 uppercase italic tracking-tighter">Событий не найдено</h3>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-2">Попробуйте изменить фильтр или создать новое событие</p>
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
