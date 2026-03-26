import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { Squad } from '../api/events';

interface SquadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; limit: number }) => Promise<void>;
    squad?: Squad;
}

export const SquadFormModal: FC<SquadFormModalProps> = ({ isOpen, onClose, onSubmit, squad }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        limit: 10
    });

    useEffect(() => {
        if (squad) {
            setFormData({
                name: squad.name,
                limit: squad.limit
            });
        } else {
            setFormData({
                name: '',
                limit: 10
            });
        }
        setError(null);
    }, [squad, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при сохранении отряда');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div 
                className="bg-zinc-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-zinc-800/50 relative overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>
                
                <div className="text-center mb-10 relative">
                    <div className="w-16 h-16 bg-violet-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-violet-900/20 mb-6 border border-violet-500/20 rotate-3">
                        <span className="text-2xl -rotate-3">{squad ? '⚙️' : '➕'}</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic leading-none">
                        {squad ? 'Настройка' : 'Новый'} <span className="text-violet-500">Отряд</span>
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Siege Tactical Configuration</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 italic animate-pulse">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 italic">
                            Позывной / Название
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-950 border-2 border-zinc-800/50 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-violet-600 transition-all placeholder:text-zinc-800 shadow-inner uppercase italic"
                            placeholder="НАПР. ОТРЯД АЛЬФА"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 italic">
                            Лимит бойцов
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 0 })}
                            className="w-full bg-zinc-950 border-2 border-zinc-800/50 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-violet-600 transition-all shadow-inner uppercase italic"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black py-5 px-6 rounded-2xl transition-all uppercase tracking-widest text-[10px] italic border border-zinc-700/50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-5 px-10 rounded-2xl transition-all shadow-lg shadow-violet-900/40 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3 border border-violet-500/30"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{squad ? 'Сохранить' : 'Создать'}</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
