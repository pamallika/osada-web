import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { CreateEventRequest, Event } from '../api/events';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={event ? 'Изменить событие' : 'Новое событие'}
            subtitle={event ? 'Отредактируйте параметры мероприятия' : 'Настройте параметры осады или события'}
            maxWidth="md"
        >
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
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="flex-[1.5]"
                    >
                        {!isLoading && (
                            <>
                                {event ? 'Обновить' : 'Создать событие'}
                                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
