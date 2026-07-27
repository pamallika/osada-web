import type { FC } from 'react';
import { useState } from 'react';
import type { Event, EventUser } from '../api/events';
import { PlayerProfileModal } from './PlayerProfileModal';
import { UserRow } from './ui/UserRow';

interface ParticipationListsProps {
    event: Event;
}

export const ParticipationLists: FC<ParticipationListsProps> = ({ event }) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const pendingUsers = event.pending_users || [];
    const declinedUsers = event.declined_users || [];

    if (pendingUsers.length === 0 && declinedUsers.length === 0) return null;

    return (
        <div className="space-y-6 select-none">
            {pendingUsers.length > 0 && (
                <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/50 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <span className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100">WAIT</span>
                    </div>
                    <div className="px-6 py-4 border-b border-zinc-800/30 flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 italic">
                            Ожидают ответа
                        </h3>
                        <span className="bg-violet-900/20 text-violet-400 text-[9px] font-black px-2 py-0.5 rounded border border-violet-800/50">
                            {pendingUsers.length}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                        {pendingUsers.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                size="sm"
                                onClick={() => setSelectedUserId(user.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {declinedUsers.length > 0 && (
                <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800/50 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <span className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100">OFF</span>
                    </div>
                    <div className="px-6 py-4 border-b border-zinc-800/30 flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-800 italic">
                            Пропустят
                        </h3>
                        <span className="bg-rose-900/10 text-rose-800 text-[9px] font-black px-2 py-0.5 rounded border border-rose-800/20">
                            {declinedUsers.length}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                        {declinedUsers.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                size="sm"
                                isLineThrough={true}
                                onClick={() => setSelectedUserId(user.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </div>
    );
};
