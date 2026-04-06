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
        if (squad && isOpen) {
            setFormData({
                name: squad.name,
                limit: squad.limit
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                limit: 10
            });
        }
        setError(null);

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [squad, isOpen, onClose]);

    if (!isOpen) return null;

    const setLimit = (updater: (prev: number) => number) => {
        setFormData(prev => ({ ...prev, limit: updater(prev.limit) }));
    };

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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            ></div>

            <div 
                className="bg-zinc-900/80 backdrop-blur-2xl w-full max-w-sm rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/60 p-8 relative overflow-hidden animate-in zoom-in-95 duration-200"
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
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        {squad ? 'Настройка отряда' : 'Новый отряд'}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        {squad ? 'Измените параметры группы' : 'Создайте тактическую группу для осады'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            Позывной / Название <span className="text-violet-500/50 ml-0.5">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            placeholder="Напр. Отряд Альфа"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Лимит бойцов <span className="text-rose-400/50 ml-0.5">*</span>
                        </label>
                        <div className="flex items-center bg-zinc-900/60 border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
                            <button
                                type="button"
                                onClick={() => setLimit(l => Math.max(1, l - 1))}
                                className="px-4 py-3 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors text-lg font-light"
                            >−</button>
                            <input
                                type="number"
                                value={formData.limit}
                                min={1} max={50}
                                onChange={e => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) setLimit(() => val);
                                }}
                                className="flex-1 bg-transparent text-center text-sm font-semibold text-zinc-200 focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                type="button"
                                onClick={() => setLimit(l => Math.min(50, l + 1))}
                                className="px-4 py-3 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors text-lg font-light"
                            >+</button>
                        </div>
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
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                            ) : (
                                <>
                                    {squad ? 'Обновить' : 'Создать'}
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
