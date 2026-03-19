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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            <div 
                className="bg-zinc-900 p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-xl border border-zinc-800/50 relative overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-8 relative">
                    <div className="w-16 h-16 bg-violet-700/20 border border-violet-700/30 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <span className="text-2xl text-violet-400">{event ? '📝' : '⚔️'}</span>
                    </div>
                    <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase italic">
                        {event ? 'Правка События' : 'Новое Событие'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                        Управление мероприятием
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    {error && (
                        <div className="bg-rose-900/20 border border-rose-800/50 text-rose-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                            <span className="text-base">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                            Название события
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all placeholder:text-zinc-700"
                            placeholder="Напр. Сбор на босса"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                                Дата
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                                Время
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                            Дополнительные сведения
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all placeholder:text-zinc-700 resize-none"
                            placeholder="Описание события..."
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black py-4 px-6 rounded-xl transition-all uppercase tracking-widest text-[10px] italic border border-zinc-700/50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-4 px-10 rounded-xl transition-all uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (event ? 'Обновить данные' : 'Создать событие')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
