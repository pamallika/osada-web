import type { FC } from 'react';
import type { Squad, Event, Participant } from '../../api/events';
import { UserRow } from '../ui/UserRow';
import { cn } from '../../lib/utils';

export interface SquadCardBaseProps {
    squad: Squad;
    event: Event;
    user: any;
    isOfficer?: boolean;
    isAdmin: boolean;
    onJoin: (squadId: number | null) => void;
    onMoveUser?: (userId: number, squadId: number | null) => void;
    handleSquadAction: (squad: Squad, action: 'edit' | 'delete') => void;
    setViewingSquad: (squad: Squad) => void;
    setSelectedUserId: (userId: number) => void;
    dropTargetId: number | null;
    setDropTargetId: (id: number | null) => void;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    setNodeRef?: any;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
    isDragging?: boolean;
    isOverlay?: boolean;
}

export const SquadCardBase: FC<SquadCardBaseProps> = ({
    squad, event, user, isOfficer, isAdmin,
    onJoin, onMoveUser, handleSquadAction,
    setViewingSquad, setSelectedUserId,
    dropTargetId, setDropTargetId,
    openMenuId, setOpenMenuId,
    setNodeRef, style, attributes, listeners, isDragging, isOverlay
}) => {
    const isUnlimited = squad.limit === 0;
    const currentParticipants = squad.participants?.length || 0;
    const isFull = !isUnlimited && currentParticipants >= squad.limit;
    
    const amIInThisSquad = squad.participants?.some((p: Participant) => p.user_id === user?.id);
    const canJoin = !amIInThisSquad && !isFull && event.status === 'published';
    const canManageParticipants = isOfficer || isAdmin;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onDragOver={(e) => {
                if (!canManageParticipants || isOverlay) return;
                e.preventDefault();
                setDropTargetId(squad.id);
            }}
            onDragLeave={() => {
                if (isOverlay) return;
                setDropTargetId(null)
            }}
            onDrop={(e) => {
                if (!canManageParticipants || isOverlay) return;
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
                dropTargetId === squad.id && "border-white/40 ring-2 ring-white/10 bg-zinc-800/50 scale-[1.02]",
                isDragging && !isOverlay && "opacity-0",
                isOverlay && "shadow-2xl shadow-violet-900/50 ring-2 ring-violet-500/50 scale-[1.02] bg-zinc-800/90 cursor-grabbing opacity-90"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isAdmin && (
                        <div
                            {...attributes}
                            {...listeners}
                            className={cn(
                                "text-zinc-500 hover:text-white transition-colors",
                                isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
                            )}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <div className="min-w-0 cursor-pointer" onClick={() => !isOverlay && setViewingSquad(squad)}>
                        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 truncate">
                            {squad.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">
                            Слотов: {currentParticipants} / {isUnlimited ? '∞' : squad.limit}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    {isAdmin && !isOverlay && (
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
                    onClick={(e) => { e.stopPropagation(); !isOverlay && onJoin(squad.id); }}
                    className={cn("w-full py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-lg shadow-violet-900/30 mb-3", !isOverlay && "hover:bg-violet-500 transition-all active:scale-95")}
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
                    <UserRow
                        key={idx}
                        user={p}
                        size="xs"
                        draggable={canManageParticipants && !isOverlay}
                        onDragStart={(e) => {
                            if (!canManageParticipants || isOverlay) return;
                            e.dataTransfer.setData('userId', p.user_id.toString());
                            e.dataTransfer.effectAllowed = 'move';
                            e.stopPropagation();
                        }}
                        onClick={() => { if (!isOverlay) setSelectedUserId(p.user_id); }}
                        className={cn(
                            p.user_id === user?.id && "bg-violet-500/10 ring-1 ring-violet-500/20 text-violet-300"
                        )}
                    />
                ))}
                {currentParticipants === 0 && (
                    <div className="text-[10px] text-center text-zinc-600 font-medium py-3 bg-zinc-950/20 rounded-xl border border-dashed border-white/[0.03]">
                        Пусто
                    </div>
                )}
            </div>

            <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center justify-between cursor-pointer" onClick={() => !isOverlay && setViewingSquad(squad)}>
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest group-hover/card:text-zinc-400 transition-colors">
                    Состав
                </span>
                <span className="text-zinc-700 group-hover/card:text-violet-500 transition-transform group-hover/card:translate-x-0.5">→</span>
            </div>
        </div>
    );
};
