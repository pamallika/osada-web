import type { FC } from 'react';
import { useState } from 'react';
import type { Event, EventUser } from '../api/events';
import { PlayerProfileModal } from './PlayerProfileModal';
import Avatar from './ui/Avatar';

interface ParticipationListsProps {
    event: Event;
}

export const ParticipationLists: FC<ParticipationListsProps> = ({ event }) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const pendingUsers = event.pending_users || [];
    const declinedUsers = event.declined_users || [];

    if (pendingUsers.length === 0 && declinedUsers.length === 0) return null;

    const getUserDisplayName = (user: EventUser) => {
        return user.profile?.family_name || user.profile?.global_name || 'Участник';
    };

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
                            <div 
                                key={user.id} 
                                onClick={() => setSelectedUserId(user.id)}
                                className="flex items-center gap-3 group/u cursor-pointer p-2 rounded-xl hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-800/50"
                            >
                                <Avatar user={user as any} size="sm" className="group-hover/u:border-violet-700/50" />
                                <div className="flex flex-col min-w-0">
                                    <div className="text-xs font-bold text-zinc-100 uppercase tracking-tight group-hover/u:text-violet-400 transition-colors truncate">
                                        {getUserDisplayName(user)}
                                    </div>
                                    {user.profile?.family_name && user.profile?.global_name && (
                                        <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest italic leading-none truncate">
                                            @{user.profile.global_name}
                                        </div>
                                    )}
                                </div>
                            </div>
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
                            <div 
                                key={user.id} 
                                onClick={() => setSelectedUserId(user.id)}
                                className="flex items-center gap-3 group/u opacity-60 cursor-pointer p-2 rounded-xl hover:opacity-100 hover:bg-zinc-800/30 transition-all border border-transparent hover:border-zinc-800/50"
                            >
                                <Avatar user={user as any} size="sm" className="grayscale-[0.5] group-hover/u:grayscale-0" />
                                <div className="flex flex-col min-w-0">
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-tight group-hover/u:text-rose-400 transition-colors line-through decoration-rose-900/50 truncate flex items-center gap-1.5">
                                        {getUserDisplayName(user)}
                                        {user.profile?.verification_status === 'verified' && (
                                            <svg className="w-2.5 h-2.5 text-emerald-500 shadow-emerald-500/50" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    {user.profile?.family_name && user.profile?.global_name && (
                                        <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest italic leading-none truncate">
                                            @{user.profile.global_name}
                                        </div>
                                    )}
                                </div>
                            </div>
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
