import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';

interface GuildMembersTabProps {
    currentUserId: number;
    currentUserRole: 'creator' | 'admin' | 'officer' | 'member';
}

export const GuildMembersTab: React.FC<GuildMembersTabProps> = ({ currentUserId, currentUserRole }) => {
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const { data: members, isLoading } = useQuery({
        queryKey: ['guild-members'],
        queryFn: () => guildApi.getMembers(),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) => 
            guildApi.updateMemberRole(userId, role),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['guild-members'] });
            if (variables.userId === currentUserId) {
                authApi.getMe().then(user => {
                    setUser(user);
                    queryClient.invalidateQueries({ queryKey: ['auth-me'] });
                });
            }
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Ошибка обновления роли');
        }
    });

    const kickMutation = useMutation({
        mutationFn: (userId: number) => guildApi.kickMember(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-members'] });
            alert('Участник исключен');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Ошибка при исключении');
        }
    });

    const canManage = (memberRole: string, memberId: number) => {
        if (memberId === currentUserId) return false;
        if (currentUserRole === 'creator') return true;
        if (currentUserRole === 'admin') {
            return !['creator', 'admin'].includes(memberRole);
        }
        return false;
    };

    const roles = ['member', 'officer', 'admin'];
    if (currentUserRole === 'creator') roles.push('creator');

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic animate-pulse">Загрузка состава</span>
        </div>
    );

    return (
        <div className="w-full">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic px-4">
                            <th className="pb-4 px-6">Участник</th>
                            <th className="pb-4 px-6">Класс</th>
                            <th className="pb-4 px-6">Ранг</th>
                            <th className="pb-4 px-6 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members?.map((member, index) => (
                            <tr key={member.id || member.user_id || index} className="group/row">
                                <td 
                                    className="py-5 px-6 bg-zinc-950/40 rounded-l-[1.5rem] border-l border-y border-zinc-800/40 group-hover/row:border-violet-700/40 group-hover/row:bg-zinc-900/60 transition-all cursor-pointer shadow-sm"
                                    onClick={() => member.user?.id && setSelectedUserId(member.user.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xs italic ${member.user?.id === currentUserId ? 'text-emerald-400 border-emerald-900/50' : 'text-zinc-500'}`}>
                                                {member.user?.profile?.family_name?.charAt(0) || '?'}
                                            </div>
                                            {member.user?.id === currentUserId && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`font-black uppercase italic tracking-tight truncate ${member.user?.id === currentUserId ? 'text-emerald-400' : 'text-zinc-100 group-hover/row:text-violet-400 transition-colors'}`}>
                                                {member.user?.profile?.family_name || 'Участник'}
                                            </span>
                                            {member.user?.profile?.global_name && (
                                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest truncate">@{member.user.profile.global_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="py-5 px-6 bg-zinc-950/40 border-y border-zinc-800/40 group-hover/row:border-violet-700/40 group-hover/row:bg-zinc-900/60 transition-all">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-lg border border-zinc-800/50 italic">
                                        {member.user?.profile?.char_class || '—'}
                                    </span>
                                </td>

                                <td className="py-5 px-6 bg-zinc-950/40 border-y border-zinc-800/40 group-hover/row:border-violet-700/40 group-hover/row:bg-zinc-900/60 transition-all">
                                    {member.user?.id && canManage(member.role, member.user.id) ? (
                                        <div className="relative inline-block w-32">
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateRoleMutation.mutate({ userId: member.user!.id, role: e.target.value })}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-black text-zinc-100 outline-none focus:border-violet-700 transition-all uppercase italic cursor-pointer appearance-none shadow-inner"
                                            >
                                                <option value="member">Member</option>
                                                <option value="officer">Officer</option>
                                                {currentUserRole === 'creator' && <option value="admin">Admin</option>}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <svg className="w-3 h-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-xl border italic tracking-[0.15em] shadow-sm ${
                                            member.role === 'creator' ? 'bg-amber-900/20 text-amber-500 border-amber-800/50' :
                                            member.role === 'admin' ? 'bg-violet-900/20 text-violet-400 border-violet-800/50' :
                                            member.role === 'officer' ? 'bg-zinc-800 text-zinc-400 border-zinc-700/50' :
                                            'bg-zinc-950 text-zinc-600 border-zinc-800/50'
                                        }`}>
                                            {member.role}
                                        </span>
                                    )}
                                </td>

                                <td className="py-5 px-6 bg-zinc-950/40 rounded-r-[1.5rem] border-r border-y border-zinc-800/40 group-hover/row:border-violet-700/40 group-hover/row:bg-zinc-900/60 transition-all text-right">
                                    {member.user?.id && canManage(member.role, member.user.id) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm(`Исключить игрока ${member.user?.profile?.family_name}?`)) kickMutation.mutate(member.user!.id);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-rose-950/20 hover:bg-rose-700 text-rose-700 hover:text-white rounded-xl border border-rose-900/30 transition-all group/kick active:scale-95 shadow-lg shadow-rose-900/5"
                                            title="Исключить"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                    {member.user?.id === currentUserId && (
                                        <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest italic pr-2">Это вы</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </div>
    );
};
