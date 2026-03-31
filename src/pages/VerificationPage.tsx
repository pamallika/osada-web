import React, { useState, useMemo } from 'react';
import { useVerifications } from '../hooks/useVerifications';
import { GearComparison } from '../components/GearComparison';
import Avatar from '../components/ui/Avatar';
import type { UserProfile, UserGearMedia, GuildMembership } from '../api/types';

export default function VerificationPage() {
    const { verifications, isLoading, error, getVerificationDetails, approve, reject } = useVerifications();
    const [filter, setFilter] = useState<'all' | 'pending' | 'updated' | 'verified'>('all');
    const [selectedUser, setSelectedUser] = useState<{
        userId: number;
        membership: GuildMembership;
        profile: UserProfile;
        media: UserGearMedia[];
    } | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const filteredVerifications = useMemo(() => {
        if (filter === 'all') return verifications;
        return verifications.filter(v => v.verification_status === filter);
    }, [verifications, filter]);

    const handleSelectUser = async (userId: number, membership: GuildMembership) => {
        setIsDetailLoading(true);
        const details = await getVerificationDetails(userId);
        if (details) {
            setSelectedUser({
                userId,
                membership: details.membership,
                profile: details.profile,
                media: details.media
            });
        }
        setIsDetailLoading(false);
    };

    const handleApprove = async () => {
        if (!selectedUser) return;
        const success = await approve(selectedUser.userId);
        if (success) setSelectedUser(null);
    };

    const handleReject = async () => {
        if (!selectedUser) return;
        const success = await reject(selectedUser.userId);
        if (success) setSelectedUser(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className="px-2 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-800/30 rounded text-[8px] font-black uppercase tracking-widest italic">Одобрен</span>;
            case 'pending': return <span className="px-2 py-1 bg-amber-950/20 text-amber-400 border border-amber-800/30 rounded text-[8px] font-black uppercase tracking-widest italic">Ожидает проверки</span>;
            case 'updated': return <span className="px-2 py-1 bg-violet-950/20 text-violet-400 border border-violet-800/30 rounded text-[8px] font-black uppercase tracking-widest italic">Обновлен</span>;
            default: return <span className="px-2 py-1 bg-zinc-950/50 text-zinc-500 border border-zinc-800/50 rounded text-[8px] font-black uppercase tracking-widest italic">Не заполнен</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500">
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 bg-violet-700 rounded-full"></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Управление Гильдией</span>
                </div>
                <h1 className="text-4xl font-black text-zinc-100 tracking-tighter italic uppercase">Верификация Состава</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">Проверка и подтверждение экипировки участников</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-8 p-1 bg-zinc-900 border border-zinc-800/50 rounded-2xl w-fit">
                {(['all', 'pending', 'updated', 'verified'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                            filter === f 
                                ? 'bg-violet-700 text-white' 
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {f === 'all' ? 'Все' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-xl mb-8 bg-rose-900/20 text-rose-400 border border-rose-800/30 font-black text-[10px] uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="bg-zinc-900 rounded-[2rem] border border-zinc-800/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800/50">
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Участник</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic text-center">Гир</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Статус</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Проверил</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/30">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <div className="w-8 h-8 border-2 border-violet-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredVerifications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
                                        Нет заявок для отображения
                                    </td>
                                </tr>
                            ) : (
                                filteredVerifications.map(member => (
                                    <tr key={member.user?.id || member.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar user={member.user} size="md" className="group-hover:border-violet-700/50 transition-colors" />
                                                <div>
                                                    <div className="text-zinc-100 font-black uppercase italic tracking-tight">{member.user?.profile?.family_name || 'Unknown'}</div>
                                                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Role: {member.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800/50">
                                                <span className="text-[10px] font-black text-violet-400 italic">
                                                    {member.user?.profile?.gear_score || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(member.verification_status)}
                                        </td>
                                        <td className="px-6 py-5">
                                            {member.verified_by ? (
                                                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">
                                                    {member.verified_by.profile.family_name}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {(member.verification_status === 'pending' || member.verification_status === 'updated') ? (
                                                <button
                                                    onClick={() => handleSelectUser(member.user?.id as number, member)}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-violet-700 text-zinc-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all border border-zinc-700 hover:border-violet-600 shadow-lg shadow-black/20"
                                                >
                                                    Проверить
                                                </button>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic pr-6">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comparison Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">
                                    Проверка: {selectedUser.profile.family_name}
                                </h3>
                                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1 italic">Сравнение альбомов скриншотов</p>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-500 rounded-2xl border border-zinc-800 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <GearComparison 
                                currentMedia={selectedUser.media.filter(m => !m.is_draft)}
                                draftMedia={selectedUser.media.filter(m => m.is_draft)}
                            />
                        </div>

                        <div className="p-8 border-t border-zinc-800/50 bg-zinc-950/30 grid grid-cols-2 gap-4">
                            <button
                                onClick={handleReject}
                                disabled={isLoading}
                                className="w-full bg-rose-900/10 hover:bg-rose-900/20 text-rose-500 font-black py-4 rounded-2xl transition-all border border-rose-900/30 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                            >
                                Отклонить
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isLoading}
                                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/30 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                            >
                                Утвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
