import type { FC } from 'react';
import { useState } from 'react';
import type { Event, EventUser, Participant, Squad } from '../api/events';
import { SquadParticipantsModal } from './SquadParticipantsModal';

interface SystemStatusBlocksProps {
    event: Event;
    onKick?: (userId: number) => Promise<void>;
    isOfficer?: boolean;
}

export const SystemStatusBlocks: FC<SystemStatusBlocksProps> = ({ event, onKick, isOfficer }) => {
    const [viewingSystemGroup, setViewingSystemGroup] = useState<{ squad: Squad, title: string } | null>(null);

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

        return (
            <div 
                onClick={() => setViewingSystemGroup({ squad, title })}
                className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    {icon}
                </div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className={`text-lg font-black uppercase italic tracking-tight flex items-center gap-2 ${colorClass}`}>
                            {title}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            Участников: {count}
                        </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-widest ${colorClass} bg-opacity-10 border-opacity-30`}>
                        System
                    </span>
                </div>

                <div className="space-y-2 mb-6">
                    {squad.participants?.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="flex items-center text-sm p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
                            <div className={`w-1 h-1 rounded-full mr-3 ${colorClass.replace('text-', 'bg-')}`}></div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs uppercase tracking-tight text-zinc-100 truncate">
                                    {p.family_name}
                                </span>
                                {p.global_name && p.family_name !== p.global_name && (
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest truncate">
                                        @{p.global_name}
                                    </span>
                                )}
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
                'text-amber-600', 
                <span className="text-4xl font-black italic uppercase tracking-tighter">WAIT</span>
            )}
            {renderBlock(
                declinedSquad, 
                'Пропустят', 
                'text-rose-800', 
                <span className="text-4xl font-black italic uppercase tracking-tighter">LIST</span>
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
