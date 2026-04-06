import type { FC } from 'react';
import { useState } from 'react';
import type { Squad, Event, Participant } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { SquadParticipantsModal } from './SquadParticipantsModal';
import { SquadFormModal } from './SquadFormModal';
import { cn, getMediaUrl } from '../lib/utils';

interface SquadSlotGridProps {
    event: Event;
    onJoin: (squadId: number | null) => Promise<void>;
    onKick?: (userId: number) => Promise<void>;
    onDecline?: () => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    onAddSquad?: (name: string, limit: number) => Promise<void>;
    onUpdateSquad?: (squadId: number, data: { name?: string, limit?: number }) => Promise<void>;
    onDeleteSquad?: (squadId: number) => Promise<void>;
    isOfficer?: boolean;
    isAdmin?: boolean;
}

export const SquadSlotGrid: FC<SquadSlotGridProps> = ({
    event, onJoin, onKick, onMoveUser,
    onAddSquad, onUpdateSquad, onDeleteSquad,
    isOfficer, isAdmin
}) => {
    const { user } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [viewingSquad, setViewingSquad] = useState<Squad | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
    const [editingSquad, setEditingSquad] = useState<Squad | null>(null);

    // Sort squads: standard squads first
    const regularSquads = event.squads?.filter(s => !s.is_system) || [];

    const isUserInSquad = (squad: Squad) => {
        return squad.participants?.some((p: Participant) => p.user_id === user?.id);
    };

    const handleSquadAction = (squad: Squad, action: 'edit' | 'delete') => {
        setOpenMenuId(null);
        if (action === 'edit') {
            setEditingSquad(squad);
            setIsSquadModalOpen(true);
        } else if (action === 'delete') {
            onDeleteSquad?.(squad.id);
        }
    };

    const handleSquadModalSubmit = async (data: { name: string; limit: number }) => {
        if (editingSquad) {
            await onUpdateSquad?.(editingSquad.id, data);
        } else {
            await onAddSquad?.(data.name, data.limit);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 select-none">
            {regularSquads.map((squad: Squad) => {
                const isUnlimited = squad.limit === 0;
                const currentParticipants = squad.participants?.length || 0;
                const isFull = !isUnlimited && currentParticipants >= squad.limit;
                const amIInThisSquad = isUserInSquad(squad);
                const canJoin = !amIInThisSquad && !isFull && event.status === 'published';

                return (
                    <div
                        key={squad.id}
                        onDragOver={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setDropTargetId(squad.id);
                        }}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setDropTargetId(null);
                            const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                            if (userId && onMoveUser) {
                                onMoveUser(userId, squad.id);
                            }
                        }}
                        className={cn(
                            "bg-zinc-900/40 backdrop-blur-xl border rounded-2xl p-4 flex flex-col transition-all duration-300 relative group/card shadow-lg min-h-[180px]",
                            amIInThisSquad
                                ? "border-violet-500/40 ring-1 ring-violet-500/20 bg-violet-950/10"
                                : "border-white/[0.06] hover:border-white/10",
                            dropTargetId === squad.id && "border-white/40 ring-2 ring-white/10 bg-zinc-800/50 scale-[1.02]"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="min-w-0 cursor-pointer flex-1" onClick={() => setViewingSquad(squad)}>
                                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 truncate">
                                    {squad.name}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                    Слотов: {currentParticipants} / {isUnlimited ? '∞' : squad.limit}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {isAdmin && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === squad.id ? null : squad.id);
                                            }}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all outline-none"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>

                                        {openMenuId === squad.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                                <button onClick={() => handleSquadAction(squad, 'edit')} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">Настроить</button>
                                                <div className="h-px bg-white/5 mx-2 my-1"></div>
                                                <button onClick={() => handleSquadAction(squad, 'delete')} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-900/20 transition-colors">Удалить</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {canJoin ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onJoin(squad.id); }}
                                className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-lg shadow-violet-900/30 mb-3 active:scale-95"
                            >
                                Вступить
                            </button>
                        ) : amIInThisSquad ? (
                            <div className="w-full py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium text-center mb-3">
                                В отряде
                            </div>
                        ) : null}

                        <div className="space-y-1 flex-1 mb-4">
                            {squad.participants?.map((p: Participant, idx: number) => (
                                <div
                                    key={idx}
                                    draggable={isAdmin}
                                    onDragStart={(e) => {
                                        if (!isAdmin) return;
                                        e.dataTransfer.setData('userId', p.user_id.toString());
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedUserId(p.user_id); }}
                                    className={cn(
                                        "text-xs py-1 px-2 rounded-md transition-all cursor-pointer flex items-center justify-between group/p",
                                        p.user_id === user?.id
                                            ? "text-violet-300 bg-violet-500/10 ring-1 ring-violet-500/20"
                                            : "text-zinc-400 hover:text-zinc-300 hover:bg-white/[0.03]",
                                        isAdmin && "cursor-grab active:cursor-grabbing"
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        {/* Мини-аватарка */}
                                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center">
                                            {(p as any).avatar_url ? (
                                                <img src={getMediaUrl((p as any).avatar_url)!} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <span className="text-[8px] text-zinc-500 font-bold">
                                                    {(p.family_name || p.global_name || 'У').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="truncate text-zinc-300 group-hover/p:text-white transition-colors">{p.family_name || p.global_name || 'Участник'}</span>
                                        {p.verification_status === 'verified' && (
                                            <svg className="w-2.5 h-2.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    {p.char_class && (
                                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950/50 border border-white/[0.03]">
                                            {p.char_class}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {currentParticipants === 0 && (
                                <div className="text-[10px] text-center text-zinc-600 font-medium py-3 bg-zinc-950/20 rounded-xl border border-dashed border-white/[0.03]">
                                    Пусто
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center justify-between cursor-pointer" onClick={() => setViewingSquad(squad)}>
                            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest group-hover/card:text-zinc-400 transition-colors">
                                Состав
                            </span>
                            <span className="text-zinc-700 group-hover/card:text-violet-500 transition-transform group-hover/card:translate-x-0.5">→</span>
                        </div>
                    </div>
                );
            })}

            {/* Кнопка создания отряда (Plus Card) */}
            {isAdmin && (
                <button
                    onClick={() => {
                        setEditingSquad(null);
                        setIsSquadModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 min-h-[120px] w-full rounded-2xl border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 text-zinc-600 hover:text-violet-400 transition-all duration-300 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-zinc-800/50 group-hover:bg-violet-500/10 border border-white/[0.06] group-hover:border-violet-500/20 flex items-center justify-center transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-xs font-semibold">Добавить отряд</span>
                </button>
            )}

            <PlayerProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            <SquadParticipantsModal squad={viewingSquad} onClose={() => setViewingSquad(null)} onKick={onKick} isOfficer={isOfficer} />

            <SquadFormModal
                isOpen={isSquadModalOpen}
                onClose={() => setIsSquadModalOpen(false)}
                onSubmit={handleSquadModalSubmit}
                squad={editingSquad || undefined}
            />
        </div>
    );
};
