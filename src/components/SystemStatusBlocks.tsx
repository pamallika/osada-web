import type { FC } from 'react';
import { useState } from 'react';
import type { Event, EventUser, Participant, Squad } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { SquadParticipantsModal } from './SquadParticipantsModal';
import { cn } from '../lib/utils';
import { UserRow } from './ui/UserRow';

interface SystemStatusBlocksProps {
    event: Event;
    onKick?: (userId: number) => Promise<void>;
    onDecline?: () => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    isOfficer?: boolean;
    isAdmin?: boolean;
}

export const SystemStatusBlocks: FC<SystemStatusBlocksProps> = ({ 
    event, onKick, onDecline, onMoveUser, 
    isOfficer, isAdmin 
}) => {
    const { user } = useAuthStore();
    const [viewingSystemGroup, setViewingSystemGroup] = useState<{ squad: Squad, title: string } | null>(null);
    const [isPendingExpanded, setIsPendingExpanded] = useState(false);
    const [isPendingDropTarget, setIsPendingDropTarget] = useState(false);

    const canManage = isOfficer || isAdmin;
    const isUserDeclined = event.declined_users?.some((u: EventUser) => u.id === user?.id);

    const mapUserToParticipant = (user: EventUser, status: 'confirmed' | 'declined' | 'unknown'): Participant => ({
        user_id: user.id,
        family_name: user.profile?.family_name || user.profile?.global_name || 'Участник',
        global_name: user.profile?.global_name || null,
        char_class: (user.profile as any)?.char_class || 'Unknown',
        status: status,
    });

    const pendingSquad: Squad = {
        id: -1,
        name: 'Не определились',
        limit: 0,
        is_system: true,
        participants: (event.pending_users || []).map(u => mapUserToParticipant(u, 'unknown'))
    };

    const declinedSquad: Squad = {
        id: -2,
        name: 'Пропустят',
        limit: 0,
        is_system: true,
        participants: (event.declined_users || []).map(u => mapUserToParticipant(u, 'declined'))
    };

    const renderBlock = (squad: Squad, title: string, status: 'pending' | 'declined') => {
        const count = squad.participants?.length || 0;
        const isDeclined = status === 'declined';
        const isPending = status === 'pending';

        const displayedParticipants = isPending && isPendingExpanded 
            ? (squad.participants || []) 
            : (squad.participants?.slice(0, 3) || []);

        return (
            <div 
                onDragOver={(e) => {
                    if (!isPending || !canManage) return;
                    e.preventDefault();
                    setIsPendingDropTarget(true);
                }}
                onDragLeave={() => {
                    if (isPending) setIsPendingDropTarget(false);
                }}
                onDrop={(e) => {
                    if (!isPending || !canManage) return;
                    e.preventDefault();
                    setIsPendingDropTarget(false);
                    const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                    if (userId && onMoveUser) {
                        onMoveUser(userId, null);
                    }
                }}
                className={cn(
                    "bg-zinc-900/40 backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 relative group/sys overflow-hidden",
                    isDeclined && isUserDeclined ? "border-rose-500/40 ring-1 ring-rose-500/20 bg-rose-950/10" : "border-white/[0.06] hover:border-white/10",
                    isPending && isPendingDropTarget && "border-amber-400/50 ring-2 ring-amber-400/20 bg-amber-950/20 scale-[1.01]"
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="cursor-pointer" onClick={() => setViewingSystemGroup({ squad, title })}>
                        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            <span className={cn(
                                "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]",
                                isPending ? "bg-amber-400 shadow-amber-500/50 animate-pulse" : "bg-rose-500 shadow-rose-500/50"
                            )} />
                            {title}
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-medium mt-1">Участников: {count}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isDeclined && (
                            <>
                                {!isUserDeclined ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
                                        className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold transition-all hover:bg-rose-500/20"
                                    >
                                        Не приду
                                    </button>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
                                        Пропускаю
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "space-y-1 mb-4",
                    isPending && isPendingExpanded && "max-h-80 overflow-y-auto custom-scrollbar pr-1"
                )}>
                    {displayedParticipants.map((p, idx) => (
                        <UserRow
                            key={idx}
                            user={p}
                            size="xs"
                            isLineThrough={isDeclined}
                            draggable={isPending && canManage}
                            onDragStart={(e) => {
                                if (!isPending || !canManage) return;
                                e.dataTransfer.setData('userId', p.user_id.toString());
                                e.dataTransfer.effectAllowed = 'move';
                                e.stopPropagation();
                            }}
                            className="bg-white/[0.02]"
                        />
                    ))}
                    
                    {isPending && count > 3 && (
                        isPendingExpanded ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsPendingExpanded(false); }}
                                className="w-full text-center py-1.5 text-[9px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg border border-white/5 mt-2"
                            >
                                Свернуть
                            </button>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsPendingExpanded(true); }}
                                className="w-full text-center py-1.5 text-[9px] font-bold text-amber-400/80 hover:text-amber-300 uppercase tracking-widest transition-colors bg-amber-500/5 hover:bg-amber-500/10 rounded-lg border border-amber-500/10 mt-1"
                            >
                                Показать всех ({count})
                            </button>
                        )
                    )}

                    {!isPending && count > 3 && (
                        <button 
                            onClick={() => setViewingSystemGroup({ squad, title })}
                            className="w-full text-center py-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
                        >
                            + еще {count - 3}
                        </button>
                    )}

                    {count === 0 && (
                        <div className="text-[10px] text-center text-zinc-700 py-3 font-medium bg-zinc-950/20 rounded-xl border border-dashed border-white/[0.02]">
                            Список пуст
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between cursor-pointer" onClick={() => setViewingSystemGroup({ squad, title })}>
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Подробнее</span>
                    <span className="text-zinc-700 group-hover:text-violet-500 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 select-none">
            {renderBlock(pendingSquad, 'Не определились', 'pending')}
            {renderBlock(declinedSquad, 'Пропустят', 'declined')}

            <SquadParticipantsModal 
                squad={viewingSystemGroup?.squad || null} 
                title={viewingSystemGroup?.title}
                onClose={() => setViewingSystemGroup(null)} 
                isOfficer={isOfficer}
                event={event}
                onMoveUser={onMoveUser}
            />
        </div>
    );
};
