import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { CreateEventRequest, Event } from '../api/events';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';

interface CreateEventModalProps {
    guildId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    event?: Event;
}

export const CreateEventModal: FC<CreateEventModalProps> = ({ guildId, isOpen, onClose, onSuccess, event }) => {
    const navigate = useNavigate();
    const { isLoading, error, createEvent, updateEvent, setError } = useEvents();

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '20:00',
        description: ''
    });

    useEffect(() => {
        if (event && isOpen) {
            const dateObj = new Date(event.start_at);
            const date = dateObj.toISOString().split('T')[0];
            const time = dateObj.toTimeString().split(' ')[0].substring(0, 5);
            
            setFormData({
                name: event.name,
                date,
                time,
                description: event.description || ''
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                date: '',
                time: '20:00',
                description: ''
            });
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Create a local date object from the user's input
            const localDate = new Date(`${formData.date}T${formData.time}`);
            // Convert to ISO string (which is UTC by default)
            const start_at = localDate.toISOString();
            
            if (event) {
                await updateEvent(event.id, {
                    name: formData.name,
                    start_at,
                    description: formData.description
                });
                onSuccess?.();
                onClose();
            } else {
                const request: CreateEventRequest = {
                    guild_id: guildId,
                    name: formData.name,
                    start_at,
                    description: formData.description,
                    squads: [{ name: 'Основной', limit: 20 }]
                };

                const createdEvent = await createEvent(request);
                onSuccess?.();
                onClose();
                if (createdEvent) {
                    navigate(`/events/${createdEvent.id}`);
                }
            }
        } catch (err) {
            // Error is handled by the hook
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            ></div>

            <div 
                className="bg-zinc-900/80 backdrop-blur-2xl w-full max-w-md rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/60 p-8 relative overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button X */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 border border-white/5 transition-all z-10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                        <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        {event ? 'Изменить событие' : 'Новое событие'}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        {event ? 'Отредактируйте параметры мероприятия' : 'Настройте параметры осады или события'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium flex items-center gap-3">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Название события <span className="text-violet-500/50 ml-0.5">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            placeholder="Напр. Осада Т2"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                                Дата
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                                Время
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Дополнительные сведения
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                            placeholder="Описание события, анонс, инструкции..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white text-sm font-medium transition-all"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                            ) : (
                                <>
                                    {event ? 'Обновить' : 'Создать событие'}
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
