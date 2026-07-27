import type { FC } from 'react';
import type { DashboardAnalyticsData } from '../api/dashboard';
import Avatar from './ui/Avatar';
import { Modal } from './ui/Modal';

interface ActivityLeadersModalProps {
    data: DashboardAnalyticsData['activity']['top_players'];
    onClose: () => void;
}

export const ActivityLeadersModal: FC<ActivityLeadersModalProps> = ({ data, onClose }) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Лидеры активности"
            subtitle="Полный список за период"
            badge={
                <span className="text-[10px] font-bold text-zinc-500 not-italic tracking-widest bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
                    {data.length}
                </span>
            }
            maxWidth="lg"
            footer={
                <button 
                    onClick={onClose}
                    className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black rounded-xl border border-zinc-800/50 transition-all uppercase tracking-widest text-[10px] italic"
                >
                    Закрыть
                </button>
            }
        >
            <div className="space-y-2">
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
        </Modal>
    );
};
