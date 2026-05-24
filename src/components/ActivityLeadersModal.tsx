import { FC } from 'react';
import type { DashboardAnalyticsData } from '../api/dashboard';
import Avatar from './ui/Avatar';

interface ActivityLeadersModalProps {
    data: DashboardAnalyticsData['activity']['top_players'];
    onClose: () => void;
}

export const ActivityLeadersModal: FC<ActivityLeadersModalProps> = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            <div 
                className="bg-zinc-950 w-full max-w-lg rounded-3xl border border-zinc-800/50 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-300 select-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
                    <div>
                        <h3 className="text-xl font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-3">
                            Лидеры активности
                            <span className="text-[10px] font-bold text-zinc-500 not-italic tracking-widest bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
                                {data.length}
                            </span>
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            Полный список за период
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                    {data.map((player, idx) => (
                        <div key={player.id} className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group">
                            <span className="w-6 text-right text-[11px] text-zinc-700 font-mono tabular-nums flex-shrink-0">{idx + 1}.</span>
                            <Avatar 
                                user={{ 
                                    avatar_url: player.avatar, 
                                    profile: { family_name: player.name } as any
                                }} 
                                size="sm"
                                className="w-8 h-8 ring-1 ring-white/10 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <span className="block font-semibold text-zinc-200 uppercase italic tracking-tight truncate group-hover:text-amber-400 transition-colors">
                                    {player.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 rounded-lg border border-white/5">
                                <span className="text-sm font-bold text-zinc-100 tabular-nums">{player.confirmed_count}</span>
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">ос.</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800/50 bg-zinc-900/30">
                    <button 
                        onClick={onClose}
                        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black rounded-xl border border-zinc-800/50 transition-all uppercase tracking-widest text-[10px] italic"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};
