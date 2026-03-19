import React, { useEffect, useState } from 'react';
import { guildApi } from '../api/guilds';
import { PlayerProfileModal } from './PlayerProfileModal';

interface Member {
    id: number;
    role: string;
    status: string;
    user_id: number;
    user: {
        id: number;
        profile?: {
            family_name: string;
            global_name?: string | null;
            char_class: string | null;
        };
    };
}

interface GuildMembersListProps {
    currentUserId: number;
    currentUserRole: string;
}

export const GuildMembersList: React.FC<GuildMembersListProps> = ({ currentUserId, currentUserRole }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchMembers = async () => {
        try {
            const data = await guildApi.getMembers();
            setMembers(data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await guildApi.updateMemberRole(userId, newRole);
            setMembers(prev => prev.map(m => m.user.id === userId ? { ...m, role: newRole } : m));
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleKick = async (userId: number) => {
        if (!confirm('Вы уверены, что хотите исключить этого игрока?')) return;
        try {
            await guildApi.kickMember(userId);
            setMembers(prev => prev.filter(m => m.user.id !== userId));
            alert('Игрок исключен из гильдии');
        } catch (error) {
            console.error('Failed to kick member:', error);
        }
    };

    const canManage = (memberRole: string) => {
        if (currentUserRole === 'creator') return true;
        if (currentUserRole === 'admin' && ['officer', 'member'].includes(memberRole)) return true;
        if (currentUserRole === 'officer' && memberRole === 'member') return true;
        return false;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="w-8 h-8 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic animate-pulse">Загрузка состава</span>
        </div>
    );

    return (
        <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                        <th className="pb-4 px-4 font-black">Участник</th>
                        <th className="pb-4 px-4 font-black">Класс</th>
                        <th className="pb-4 px-4 font-black">Ранг</th>
                        <th className="pb-4 px-4 text-right font-black">Управление</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id} className="group transition-all">
                            <td 
                                onClick={() => setSelectedUserId(member.user.id)}
                                className="py-4 px-4 bg-zinc-950/50 rounded-l-2xl border-l border-y border-zinc-800/50 group-hover:border-violet-700/50 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col">
                                    <div className="font-semibold text-zinc-100 uppercase italic tracking-tight group-hover:text-violet-400 transition-colors">
                                        {member.user.profile?.family_name || member.user.profile?.global_name || 'Участник'}
                                    </div>
                                    {member.user.profile?.global_name && (
                                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-tight">@{member.user.profile.global_name}</div>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-4 bg-zinc-950/50 border-y border-zinc-800/50 group-hover:border-violet-700/50 transition-all text-xs font-bold text-zinc-400 uppercase italic">
                                {member.user.profile?.char_class || '-'}
                            </td>
                            <td className="py-4 px-4 bg-zinc-950/50 border-y border-zinc-800/50 group-hover:border-violet-700/50 transition-all">
                                {currentUserRole === 'creator' && member.user.id !== currentUserId ? (
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-[10px] font-black text-zinc-100 outline-none focus:border-violet-700 transition-all uppercase italic cursor-pointer appearance-none"
                                    >
                                        <option value="member">Member</option>
                                        <option value="officer">Officer</option>
                                        <option value="admin">Admin</option>
                                        <option value="creator">Creator</option>
                                    </select>
                                ) : (
                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border italic tracking-widest ${
                                        member.role === 'creator' ? 'bg-amber-900/20 text-amber-500 border-amber-800/50' :
                                        member.role === 'admin' ? 'bg-violet-900/20 text-violet-400 border-violet-800/50' :
                                        member.role === 'officer' ? 'bg-zinc-800 text-zinc-400 border-zinc-700/50' :
                                        'bg-zinc-950 text-zinc-600 border-zinc-800/50'
                                    }`}>
                                        {member.role}
                                    </span>
                                )}
                            </td>
                            <td className="py-4 px-4 bg-zinc-950/50 rounded-r-2xl border-r border-y border-zinc-800/50 group-hover:border-violet-700/50 transition-all text-right">
                                {canManage(member.role) && member.user.id !== currentUserId && (
                                    <button
                                        onClick={() => handleKick(member.user.id)}
                                        className="text-rose-800 hover:text-rose-100 hover:bg-rose-800 p-2 rounded-lg transition-all border border-rose-800/20"
                                        title="Исключить"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <PlayerProfileModal 
                userId={selectedUserId} 
                onClose={() => setSelectedUserId(null)} 
            />
        </div>
    );
};
