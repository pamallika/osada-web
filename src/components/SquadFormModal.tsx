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
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div 
                className="bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-700/50 relative overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <div className="text-center mb-8 relative">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 border border-indigo-400/20">
                        <span className="text-2xl">{squad ? '📝' : '➕'}</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                        {squad ? 'Правка Отряда' : 'Новый Отряд'}
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Настройка тактического подразделения</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                            <span className="text-base">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Позывной / Название
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 shadow-inner"
                            placeholder="Напр. Первый отряд"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Лимит бойцов
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                            className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-5 px-6 rounded-2xl transition-all uppercase tracking-widest text-[10px] italic border border-slate-600/50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (squad ? 'Обновить' : 'Добавить')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
