import type { FC } from 'react';
import { useState } from 'react';
import type { Event, EventUser, Participant, Squad } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { SquadParticipantsModal } from './SquadParticipantsModal';

interface SystemStatusBlocksProps {
    event: Event;
    onKick?: (userId: number) => Promise<void>;
    onDecline?: () => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    isOfficer?: boolean;
    isAdmin?: boolean;
}

export const SystemStatusBlocks: FC<SystemStatusBlocksProps> = ({ 
    event, onKick, onDecline, 
    isOfficer 
}) => {
    const { user } = useAuthStore();
    const [viewingSystemGroup, setViewingSystemGroup] = useState<{ squad: Squad, title: string } | null>(null);

    const isUserDeclined = event.declined_users?.some((u: EventUser) => u.id === user?.id);

    const mapUserToParticipant = (user: EventUser, status: 'confirmed' | 'declined' | 'unknown'): Participant => ({
        user_id: user.id,
        family_name: user.profile?.family_name || user.profile?.global_name || 'Участник',
        global_name: user.profile?.global_name || null,
        char_class: (user.profile as any)?.char_class || 'Unknown',
        status: status,
    });

    const pendingSquad: Squad = {
        id: -1, // Virtual ID
        name: 'Не определились',
        limit: 0,
        is_system: true,
        participants: (event.pending_users || []).map(u => mapUserToParticipant(u, 'unknown'))
    };

    const declinedSquad: Squad = {
        id: -2, // Virtual ID
        name: 'Пропустят',
        limit: 0,
        is_system: true,
        participants: (event.declined_users || []).map(u => mapUserToParticipant(u, 'declined'))
    };

    const renderBlock = (squad: Squad, title: string, colorClass: string, icon: React.ReactNode) => {
        const count = squad.participants?.length || 0;
        const isDeclinedBlock = squad.id === -2;

        return (
            <div 
                className={`bg-zinc-900 p-6 rounded-[2rem] border transition-all relative overflow-hidden group/sys ${
                    isDeclinedBlock && isUserDeclined ? 'ring-1 ring-rose-900/50 border-rose-800/50' : 'border-zinc-800/50 hover:border-zinc-700 shadow-lg shadow-zinc-950/20'
                }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    {icon}
                </div>
                
                <div className="flex justify-between items-start mb-6">
                    <div className="cursor-pointer flex-1" onClick={() => setViewingSystemGroup({ squad, title })}>
                        <h3 className={`text-lg font-black uppercase italic tracking-tight flex items-center gap-2 ${colorClass}`}>
                            {title}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            Участников: {count}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {isDeclinedBlock && !isUserDeclined && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
                                className="h-7 px-3 bg-rose-700 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest italic rounded-lg transition-all flex items-center justify-center border border-rose-600/50 shadow-lg shadow-rose-900/20"
                            >
                                Я не приду
                            </button>
                        )}
                        {isDeclinedBlock && isUserDeclined && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/20">
                                Пропускаю
                            </span>
                        )}
                        {!isDeclinedBlock && (
                            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-widest ${colorClass} bg-opacity-10 border-opacity-30`}>
                                System
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    {squad.participants?.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="flex items-center text-sm p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
                            <div className={`w-1 h-1 rounded-full mr-3 ${colorClass.replace('text-', 'bg-')}`}></div>
                            <div className="flex flex-col min-w-0">
                                <span className={`font-semibold text-xs uppercase tracking-tight truncate ${p.user_id === user?.id ? 'text-emerald-400 font-black' : 'text-zinc-100'}`}>
                                    {p.family_name}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {count > 3 && (
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center py-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 italic">
                            + еще {count - 3} участников
                        </div>
                    )}

                    {count === 0 && (
                        <div className="flex items-center text-[10px] p-2 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30 opacity-40">
                            <span className="text-zinc-600 font-bold uppercase tracking-widest italic mx-auto">Список пуст</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-zinc-400 transition-colors">
                        Подробнее
                    </span>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-violet-500 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 select-none">
            {renderBlock(
                pendingSquad, 
                'Не определились', 
                'text-amber-500', 
                <span className="text-4xl font-black italic uppercase tracking-tighter scale-110">WAIT</span>
            )}
            {renderBlock(
                declinedSquad, 
                'Пропустят', 
                'text-rose-500', 
                <span className="text-4xl font-black italic uppercase tracking-tighter scale-110">SKIP</span>
            )}

            <SquadParticipantsModal 
                squad={viewingSystemGroup?.squad || null} 
                title={viewingSystemGroup?.title}
                onClose={() => setViewingSystemGroup(null)} 
                onKick={(viewingSystemGroup?.squad?.id === -1 || viewingSystemGroup?.squad?.id === -2) ? undefined : onKick}
                isOfficer={isOfficer}
            />
        </div>
    );
};
