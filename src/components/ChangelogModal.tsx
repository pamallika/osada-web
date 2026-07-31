import type { FC } from 'react';
import { useChangelog } from '../hooks/useChangelog';
import type { ChangelogItem } from '../constants/changelog';

export const ChangelogModal: FC = () => {
    const { isOpen, changelog, markAsSeen } = useChangelog();

    if (!isOpen || !changelog) return null;

    const renderTypeBadge = (type: ChangelogItem['type']) => {
        switch (type) {
            case 'feature':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md">
                        Новое
                    </span>
                );
            case 'improvement':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                        Улучшение
                    </span>
                );
            case 'fix':
                return (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md">
                        Фикс
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none">
            {/* Modal Container */}
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden max-w-md w-full max-h-[85vh] flex flex-col relative animate-scaleUp">
                
                {/* Header with ambient glow */}
                <div className="relative bg-gradient-to-br from-violet-900/40 via-zinc-900 to-indigo-900/30 p-6 border-b border-zinc-800/60 shrink-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-violet-600/30 border border-violet-500/40 text-violet-300 text-[11px] font-bold rounded-full tracking-wide">
                                {changelog.badge || `Версия ${changelog.version}`}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                                {changelog.date}
                            </span>
                        </div>

                        {/* Close button (min 44x44px touch area) */}
                        <button
                            onClick={markAsSeen}
                            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors rounded-xl hover:bg-zinc-800/50"
                            aria-label="Закрыть"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <h2 className="text-xl font-black text-zinc-100 tracking-tight">
                        {changelog.title}
                    </h2>

                    {changelog.description && (
                        <p className="text-xs text-zinc-300/80 mt-1 leading-relaxed">
                            {changelog.description}
                        </p>
                    )}
                </div>

                {/* Body - Change list */}
                <div className="overflow-y-auto p-5 space-y-4 flex-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {changelog.changes.map((item) => (
                        <div
                            key={item.id}
                            className="p-3.5 bg-zinc-950/60 border border-zinc-800/50 rounded-xl flex items-start gap-3 hover:border-zinc-700/60 transition-all"
                        >
                            {item.icon && (
                                <div className="w-9 h-9 shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-lg shadow-sm">
                                    {item.icon}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-sm font-bold text-zinc-100 leading-snug">
                                        {item.title}
                                    </span>
                                    {renderTypeBadge(item.type)}
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Action Button */}
                <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0">
                    <button
                        onClick={markAsSeen}
                        className="w-full min-h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] select-none text-sm tracking-wide flex items-center justify-center gap-2"
                    >
                        <span>Понятно, спасибо!</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
