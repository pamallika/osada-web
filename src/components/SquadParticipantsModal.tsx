import type { FC } from 'react';
import type { Event, Squad, Participant } from '../api/events';
import { PlayerProfileModal } from './PlayerProfileModal';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import Avatar from './ui/Avatar';
import { Modal } from './ui/Modal';
import { UserRow } from './ui/UserRow';

interface SquadParticipantsModalProps {
    squad: Squad | null;
    title?: string;
    onClose: () => void;
    onKick?: (userId: number) => Promise<void>;
    isOfficer?: boolean;
    event?: Event;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
}

export const SquadParticipantsModal: FC<SquadParticipantsModalProps> = ({ 
    squad, title, onClose, onKick, isOfficer, event, onMoveUser 
}) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { user: currentUser } = useAuthStore();

    if (!squad) return null;

    const participants = squad.participants || [];
    const displayTitle = title || squad.name;
    const availableSquads = (event?.squads || []).filter(s => !s.is_system);

    return (
        <>
            <Modal
                isOpen={!!squad}
                onClose={onClose}
                title={displayTitle}
                subtitle={squad.is_system ? 'Системный список' : 'Состав отряда'}
                badge={
                    <span className="text-[10px] font-bold text-zinc-500 not-italic tracking-widest bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
                        {participants.length}
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
                <div className="space-y-3">
                    {participants.length > 0 ? (
                        participants.map((p: Participant) => (
                            <UserRow
                                key={p.user_id}
                                user={p}
                                size="sm"
                                onClick={() => setSelectedUserId(p.user_id)}
                                action={
                                    <>
                                        {isOfficer && onMoveUser && (
                                            <select
                                                defaultValue=""
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!val) return;
                                                    const targetSquadId = val === 'pending' ? null : parseInt(val);
                                                    onMoveUser(p.user_id, targetSquadId);
                                                    e.target.value = "";
                                                }}
                                                className="bg-zinc-900 border border-zinc-700/60 hover:border-zinc-500 text-zinc-300 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer max-w-[140px] truncate"
                                            >
                                                <option value="" disabled>Переместить в...</option>
                                                {squad.id !== -1 && (
                                                    <option value="pending">Не определились</option>
                                                )}
                                                {availableSquads.map((s) => (
                                                    s.id !== squad.id && (
                                                        <option key={s.id} value={s.id.toString()}>
                                                            {s.name}
                                                        </option>
                                                    )
                                                ))}
                                            </select>
                                        )}

                                        {isOfficer && onKick && p.user_id !== currentUser?.id && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onKick(p.user_id); }}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-900/10 text-rose-500 hover:bg-rose-800 hover:text-white transition-all border border-rose-800/30 shrink-0"
                                                title="В запас / Исключить"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </>
                                }
                                className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700"
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Список пуст</p>
                        </div>
                    )}
                </div>
            </Modal>

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </>
    );
};
