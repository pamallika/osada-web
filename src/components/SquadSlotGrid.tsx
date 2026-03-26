import type { FC } from 'react';
import { useState } from 'react';
import type { Squad, Event, Participant, EventUser } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { SquadParticipantsModal } from './SquadParticipantsModal';

interface SquadSlotGridProps {
    event: Event;
    onJoin: (squadId: number | null) => Promise<void>;
    onDecline?: () => Promise<void>;
    onKick?: (userId: number) => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    isOfficer?: boolean;
    isDrafting?: boolean;
}

export const SquadSlotGrid: FC<SquadSlotGridProps> = ({ event, onJoin, onDecline, onKick, onMoveUser, isOfficer, isDrafting }) => {
    const { user } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [viewingSquad, setViewingSquad] = useState<Squad | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);
    
    // Sort squads: system (Reserve) first, then others
    const sortedSquads = [...(event.squads || [])].sort((a: Squad, b: Squad) => {
        if (a.is_system && !b.is_system) return -1;
        if (!a.is_system && b.is_system) return 1;
        return a.id - b.id;
    });

    const isUserInSquad = (squad: Squad) => {
        return squad.participants?.some((p: Participant) => p.user_id === user?.id);
    };

    const isUserDeclined = event.declined_users?.some((u: EventUser) => u.id === user?.id);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 select-none">
            {sortedSquads.map((squad: Squad) => {
                const isUnlimited = squad.limit === 0;
                const isFull = !isUnlimited && (squad.participants?.length || 0) >= squad.limit;
                const amIInThisSquad = isUserInSquad(squad);
                const canJoin = !amIInThisSquad && !isFull && event.status === 'published';

                return (
                    <div 
                        key={squad.id}
                        onClick={() => setViewingSquad(squad)}
                        onDragOver={(e) => {
                            if (!isDrafting) return;
                            e.preventDefault();
                            setDropTargetId(squad.id);
                        }}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => {
                            if (!isDrafting) return;
                            e.preventDefault();
                            setDropTargetId(null);
                            const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                            if (userId && onMoveUser) {
                                onMoveUser(userId, squad.id);
                            }
                        }}
                        className={`bg-zinc-900 p-6 rounded-[2rem] border transition-all cursor-pointer group/card ${
                            amIInThisSquad 
                            ? 'ring-1 ring-violet-700 border-violet-700/50 bg-violet-900/5 shadow-lg shadow-violet-900/10' 
                            : 'border-zinc-800/50 hover:border-zinc-700'
                        } ${
                            isFull && !amIInThisSquad ? 'opacity-80' : ''
                        } ${
                            dropTargetId === squad.id ? 'border-amber-500 bg-amber-900/10 scale-[1.02] shadow-xl shadow-amber-900/20' : ''
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="min-w-0">
                                <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-2 truncate">
                                    {squad.name}
                                    {squad.is_system && (
                                        <span className="bg-zinc-800 text-[8px] px-2 py-0.5 rounded text-zinc-400 not-italic tracking-widest uppercase border border-zinc-700/50 shrink-0">Запас</span>
                                    )}
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    Слотов: {squad.participants?.length || 0} / {isUnlimited ? '∞' : squad.limit}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {amIInThisSquad && (
                                    <span className="bg-emerald-900/20 text-emerald-400 text-[8px] px-2 py-1 rounded border border-emerald-800/50 font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10">
                                        В отряде
                                    </span>
                                )}
                                {canJoin && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onJoin(squad.id);
                                        }}
                                        className="h-8 px-4 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest italic rounded-lg border border-violet-600/50 shadow-lg shadow-violet-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Вступить</span>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            {squad.participants?.slice(0, 5).map((p: Participant, idx: number) => (
                                <div 
                                    key={idx} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUserId(p.user_id);
                                    }}
                                    className="flex items-center text-sm p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/30 group/p cursor-pointer hover:border-violet-700/50 transition-all"
                                >
                                    <div className={`w-1 h-1 rounded-full mr-3 ${
                                        p.user_id === user?.id ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-700'
                                    }`}></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-semibold text-xs uppercase tracking-tight truncate ${p.user_id === user?.id ? 'text-emerald-400' : 'text-zinc-100 group-hover/p:text-violet-400 transition-colors'}`}>
                                            {p.family_name || p.global_name || 'Участник'}
                                        </span>
                                        {p.family_name && p.global_name && (
                                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest truncate">
                                                @{p.global_name}
                                            </span>
                                        )}
                                    </div>
                                    {p.char_class && (
                                        <span className="ml-auto text-[8px] text-zinc-500 font-black uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/50 shrink-0">
                                            {p.char_class}
                                        </span>
                                    )}
                                </div>
                            ))}
                            
                            {squad.participants && squad.participants.length > 5 && (
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center py-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 italic">
                                    + еще {squad.participants.length - 5} участников
                                </div>
                            )}

                            {squad.participants?.length === 0 && (
                                <div className="flex items-center text-[10px] p-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 opacity-40">
                                    <span className="text-zinc-600 font-bold uppercase tracking-widest italic mx-auto">Отряд пуст</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover/card:text-zinc-400 transition-colors">
                                Посмотреть состав
                            </span>
                            <svg className="w-4 h-4 text-zinc-600 group-hover/card:text-violet-500 transition-all group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                );
            })}

            {/* Блок ПРОПУСТЯТ (Off-duty) */}
            <div 
                onClick={() => setViewingSquad({
                    id: -2,
                    name: 'Пропустят',
                    limit: 0,
                    is_system: true,
                    participants: (event.declined_users || []).map(u => ({
                        user_id: u.id,
                        family_name: u.profile?.family_name || u.profile?.global_name || 'Участник',
                        global_name: u.profile?.global_name || null,
                        char_class: (u.profile as any)?.char_class || 'Unknown',
                        status: 'declined',
                    }))
                })}
                onDragOver={(e) => {
                    if (!isDrafting) return;
                    e.preventDefault();
                    setDropTargetId(-2);
                }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(e) => {
                    if (!isDrafting) return;
                    e.preventDefault();
                    setDropTargetId(null);
                    const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                    if (userId && onMoveUser) {
                        onMoveUser(userId, null); // Move to declined
                    }
                }}
                className={`bg-zinc-900 p-6 rounded-[2rem] border transition-all cursor-pointer group/card ${
                    isUserDeclined 
                    ? 'ring-1 ring-rose-800 border-rose-800/50 bg-rose-900/5 shadow-lg shadow-rose-900/10' 
                    : 'border-zinc-800/50 hover:border-zinc-700 bg-rose-900/5'
                } ${
                    dropTargetId === -2 ? 'border-amber-500 bg-amber-900/10 scale-[1.02] shadow-xl shadow-amber-900/20' : ''
                }`}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0">
                        <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-2 truncate">
                            Пропустят
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            Участников: {event.declined_users?.length || 0}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {isUserDeclined ? (
                            <span className="bg-rose-900/20 text-rose-400 text-[8px] px-2 py-1 rounded border border-rose-700/50 font-black uppercase tracking-widest shadow-lg shadow-rose-900/10">
                                Отсутствую
                            </span>
                        ) : (
                            event.status === 'published' && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDecline?.();
                                    }}
                                    className="h-8 px-4 bg-rose-900 hover:bg-rose-800 text-rose-100 text-[10px] font-black uppercase tracking-widest italic rounded-lg border border-rose-800/50 shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Пропущу</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    {event.declined_users?.slice(0, 5).map((u: EventUser, idx: number) => (
                        <div key={idx} className="flex items-center text-sm p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
                            <div className={`w-1 h-1 rounded-full mr-3 ${
                                u.id === user?.id ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-zinc-700'
                            }`}></div>
                            <span className={`font-bold text-xs uppercase tracking-tight truncate ${u.id === user?.id ? 'text-rose-400' : 'text-zinc-500'}`}>
                                {u.profile?.family_name || u.profile?.global_name || 'Участник'}
                            </span>
                        </div>
                    ))}
                    
                    {event.declined_users && event.declined_users.length > 5 && (
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center py-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 italic">
                            + еще {event.declined_users.length - 5} участников
                        </div>
                    )}
                    
                    {(event.declined_users?.length || 0) === 0 && (
                        <div className="flex items-center text-[10px] p-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 opacity-40">
                            <span className="text-zinc-600 font-bold uppercase tracking-widest italic mx-auto">Все участвуют</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-rose-800/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest italic group-hover/card:text-rose-600 transition-colors">
                        Список отсутствующих
                    </span>
                    <svg className="w-4 h-4 text-rose-900 group-hover:text-rose-600 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />

            <SquadParticipantsModal 
                squad={viewingSquad} 
                onClose={() => setViewingSquad(null)} 
                onKick={(viewingSquad?.id === -2 || viewingSquad?.is_system) ? undefined : onKick}
                isOfficer={isOfficer}
            />
        </div>
    );
};
