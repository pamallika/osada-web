import type { FC } from 'react';
import type { Squad, Participant } from '../api/events';
import { PlayerProfileModal } from './PlayerProfileModal';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getMediaUrl } from '../lib/utils';
import Avatar from './ui/Avatar';

interface SquadParticipantsModalProps {
    squad: Squad | null;
    title?: string;
    onClose: () => void;
    onKick?: (userId: number) => Promise<void>;
    isOfficer?: boolean;
}

export const SquadParticipantsModal: FC<SquadParticipantsModalProps> = ({ squad, title, onClose, onKick, isOfficer }) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { user: currentUser } = useAuthStore();

    if (!squad) return null;

    const participants = squad.participants || [];
    const displayTitle = title || squad.name;

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
                            {displayTitle}
                            <span className="text-[10px] font-bold text-zinc-500 not-italic tracking-widest bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
                                {participants.length}
                            </span>
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {squad.is_system ? 'Системный список' : 'Состав отряда'}
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

                {/* Participants List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {participants.length > 0 ? (
                        participants.map((p: Participant) => (
                            <div 
                                key={p.user_id}
                                className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group"
                            >
                                <div 
                                    onClick={() => setSelectedUserId(p.user_id)}
                                    className="flex-1 flex items-center gap-4 cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {(p as any).avatar_url ? (
                                            <img src={getMediaUrl((p as any).avatar_url)!} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-zinc-500 font-bold uppercase">
                                                {(p.family_name || p.global_name || '?').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-zinc-100 uppercase italic tracking-tight truncate group-hover:text-violet-400 transition-colors text-sm">
                                            {p.family_name || p.global_name || 'Участник'}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-tight truncate">
                                            {p.family_name && p.global_name ? `@${p.global_name} ` : (!p.family_name && !p.global_name ? 'No Discord ' : '')}
                                            {p.char_class && `• ${p.char_class}`}
                                        </span>
                                    </div>
                                </div>

                                {isOfficer && onKick && p.user_id !== currentUser?.id && (
                                    <button 
                                        onClick={() => onKick(p.user_id)}
                                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-900/10 text-rose-500 hover:bg-rose-800 hover:text-white transition-all border border-rose-800/30 shrink-0"
                                        title="В запас / Исключить"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Список пуст</p>
                        </div>
                    )}
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

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </div>
    );
};
