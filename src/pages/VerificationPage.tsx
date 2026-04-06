import React, { useState, useMemo } from 'react';
import { useVerifications } from '../hooks/useVerifications';
import { GearComparison } from '../components/GearComparison';
import Avatar from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
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

    const filterLabels = { all: 'Все', pending: 'Ожидают', updated: 'Обновлены', verified: 'Одобрены' };

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
            case 'verified': 
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" /> Одобрен
                    </span>
                );
            case 'pending': 
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse" /> Ожидает
                    </span>
                );
            case 'updated': 
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)] animate-pulse" /> Обновлён
                    </span>
                );
            default: 
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-zinc-500 text-xs font-medium">
                        Не заполнен
                    </span>
                );
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500">
            <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Управление гильдией</p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-inter">Верификация состава</h1>
                <p className="text-sm text-zinc-500 mt-1 font-inter">Проверка и подтверждение экипировки участников</p>
            </div>

            {/* Filters */}
            <div className="inline-flex gap-1 mb-8 p-1 bg-zinc-900/40 backdrop-blur-md rounded-xl border border-white/[0.06]">
                {(['all', 'pending', 'updated', 'verified'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === f 
                                ? 'text-white bg-white/10 ring-1 ring-white/10 shadow-sm' 
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        {filterLabels[f]}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-xl mb-8 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                    {error}
                </div>
            )}

            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.04]">
                                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Участник</th>
                                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">Гир</th>
                                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Проверил</th>
                                <th className="px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-3.5 w-28" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredVerifications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 text-sm italic font-inter font-medium opacity-50">
                                        Нет заявок для отображения
                                    </td>
                                </tr>
                            ) : (
                                filteredVerifications.map(member => (
                                    <tr key={member.user?.id || member.id} className="hover:bg-white/[0.02] transition-colors duration-150 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar user={member.user} size="md" className="ring-1 ring-white/5" />
                                                <div>
                                                    <div className="text-zinc-200 font-medium text-sm">{member.user?.profile?.family_name || 'Неизвестный'}</div>
                                                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider">{member.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-semibold text-violet-400 tabular-nums">
                                                {member.user?.profile?.gear_score || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(member.verification_status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.verified_by ? (
                                                <div className="text-xs text-zinc-500 font-medium font-inter">
                                                    {member.verified_by.profile.family_name}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-700 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(member.verification_status === 'pending' || member.verification_status === 'updated') ? (
                                                <button
                                                    onClick={() => handleSelectUser(member.user?.id as number, member)}
                                                    className="px-4 py-2 bg-zinc-800/60 hover:bg-violet-600 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-all duration-200 border border-white/5 hover:border-violet-500/50 shadow-md"
                                                >
                                                    Проверить
                                                </button>
                                            ) : (
                                                <span className="text-zinc-700 text-xs pr-6">—</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-zinc-900/80 backdrop-blur-2xl w-full max-w-2xl rounded-3xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-white font-inter">
                                    Верификация: {selectedUser.profile.family_name}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-0.5 font-inter">Сравнение новых и текущих данных экипировки</p>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 border border-white/5 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <GearComparison 
                                currentMedia={selectedUser.media.filter(m => !m.is_draft)}
                                draftMedia={selectedUser.media.filter(m => m.is_draft)}
                            />
                        </div>

                        <div className="p-6 border-t border-white/[0.06] bg-zinc-950/30 grid grid-cols-2 gap-4 shrink-0">
                            <button
                                onClick={handleReject}
                                disabled={isLoading}
                                className="flex-1 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-sm font-semibold transition-all"
                            >
                                Отклонить
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isLoading}
                                className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
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
