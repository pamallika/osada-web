import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Skeleton } from './ui/Skeleton';
import Avatar from './ui/Avatar';

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

    if (isLoading) return (
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04]">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20 hidden sm:block" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
            ))}
        </div>
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'creator':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-semibold uppercase tracking-wider">Creator</span>;
            case 'admin':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/25 text-violet-300 text-[9px] font-semibold uppercase tracking-wider">Admin</span>;
            case 'officer':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[9px] font-semibold uppercase tracking-wider">Officer</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800/80 border border-white/[0.06] text-zinc-400 text-[9px] font-medium uppercase tracking-wider">Member</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">Состав гильдии</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Live</span>
                </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                                <th className="py-4 px-6 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Участник</th>
                                <th className="py-4 px-6 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Класс</th>
                                <th className="py-4 px-6 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Ранг</th>
                                <th className="py-4 px-6 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {members?.map((member) => (
                                <tr key={member.id} className="hover:bg-white/[0.025] transition-colors duration-150 group">
                                    <td className="py-4 px-6" onClick={() => member.user?.id && setSelectedUserId(member.user.id)}>
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <Avatar 
                                                user={member.user} 
                                                size="md" 
                                                className="ring-1 ring-white/10 group-hover:ring-violet-500/30 transition-colors" 
                                            />
                                            <div>
                                                <div className="text-zinc-200 font-medium">{member.user?.profile?.family_name || 'Участник'}</div>
                                                <div className="text-xs text-zinc-600">@{member.user?.profile?.global_name || 'unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-400 capitalize">
                                        {member.user?.profile?.char_class || '—'}
                                    </td>
                                    <td className="py-4 px-6">
                                        {canManage(member.role, member.user?.id || 0) ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => member.user && updateRoleMutation.mutate({ userId: member.user.id, role: e.target.value })}
                                                className="bg-zinc-900 border border-white/[0.08] rounded-lg text-zinc-300 text-xs px-2 py-1.5 cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                                            >
                                                <option value="member">Member</option>
                                                <option value="officer">Officer</option>
                                                {currentUserRole === 'creator' && <option value="admin">Admin</option>}
                                            </select>
                                        ) : (
                                            getRoleBadge(member.role)
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canManage(member.role, member.user?.id || 0) && (
                                                <button
                                                    onClick={() => {
                                                        if(confirm(`Исключить игрока ${member.user?.profile?.family_name}?`)) kickMutation.mutate(member.user!.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all duration-200"
                                                    title="Удалить"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </div>
    );
};
