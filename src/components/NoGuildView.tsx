import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuilds } from '../hooks/useGuilds';

export const NoGuildView: React.FC = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [guildName, setGuildName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const { createGuild, isLoading, error, setError } = useGuilds();

    const parseInviteSlug = (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        // Handle full URLs like https://sage.com/invite/my-guild
        try {
            if (trimmed.includes('/invite/')) {
                const parts = trimmed.split('/invite/');
                return parts[parts.length - 1].split(/[?#]/)[0];
            }
        } catch (e) {
            console.error('Failed to parse URL', e);
        }
        
        // Return as is if it's just a slug
        return trimmed;
    };

    const handleCreateGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guildName.trim()) return;
        const success = await createGuild(guildName);
        if (success) setIsCreateModalOpen(false);
    };

    const handleAcceptInvite = (e: React.FormEvent) => {
        e.preventDefault();
        const slug = parseInviteSlug(inviteCode);
        if (!slug) return;
        
        setIsInviteModalOpen(false);
        navigate(`/invite/${slug}`);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] select-none">
            <div className="w-32 h-32 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-6xl mb-10 shadow-2xl border border-zinc-800/50 relative group transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-violet-700/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">🛡️</span>
            </div>
            
            <h2 className="text-4xl font-black mb-4 text-zinc-100 uppercase italic tracking-tighter">ВЫ НЕ В ГИЛЬДИИ</h2>
            <p className="text-zinc-500 max-w-md mb-12 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                Для доступа к данным и управлению событиями <br /> необходимо вступить в гильдию или создать свою.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                <button
                    onClick={() => { setError(null); setIsCreateModalOpen(true); }}
                    className="flex-1 bg-violet-700 hover:bg-violet-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-violet-900/10 active:scale-95 uppercase tracking-widest text-[10px] italic"
                >
                    Создать гильдию
                </button>
                <button
                    onClick={() => { setError(null); setIsInviteModalOpen(true); }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black py-5 px-8 rounded-2xl border border-zinc-800 transition-all active:scale-95 uppercase tracking-widest text-[10px] italic"
                >
                    Ввести код
                </button>
            </div>

            {/* Create Guild Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 rounded-[2.5rem] p-10 max-w-md w-full border border-zinc-800/50 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-700/5 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-black mb-2 text-zinc-100 uppercase italic tracking-tight">НОВАЯ ГИЛЬДИЯ</h3>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">Введите название вашей гильдии</p>
                        
                        <form onSubmit={handleCreateGuild} className="space-y-6">
                            {error && (
                                <div className="bg-rose-900/20 border border-rose-800/50 text-rose-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                                    <span className="text-base">⚠️</span>
                                    {error}
                                </div>
                            )}
                            <input
                                autoFocus
                                type="text"
                                placeholder="НАЗВАНИЕ ГИЛЬДИИ"
                                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-black italic uppercase placeholder:text-zinc-700"
                                value={guildName}
                                onChange={(e) => setGuildName(e.target.value)}
                                required
                            />
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest italic hover:text-white transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-violet-700 text-white rounded-2xl font-black py-4 shadow-xl shadow-violet-900/10 disabled:opacity-50 uppercase text-[10px] tracking-widest italic"
                                >
                                    {isLoading ? '...' : 'ПОДТВЕРДИТЬ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 rounded-[2.5rem] p-10 max-w-md w-full border border-zinc-800/50 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-black mb-2 text-zinc-100 uppercase italic tracking-tight">ВСТУПЛЕНИЕ</h3>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">Введите код приглашения</p>
                        
                        <form onSubmit={handleAcceptInvite} className="space-y-6">
                            {error && (
                                <div className="bg-rose-900/20 border border-rose-800/50 text-rose-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                                    <span className="text-base">⚠️</span>
                                    {error}
                                </div>
                            )}
                            <input
                                autoFocus
                                type="text"
                                placeholder="КОД ИЛИ ССЫЛКА"
                                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-emerald-800 transition-all text-zinc-100 font-black italic uppercase placeholder:text-zinc-700"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                            />
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest italic hover:text-white transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-emerald-800 text-white rounded-2xl font-black py-4 shadow-xl shadow-emerald-900/10 disabled:opacity-50 uppercase text-[10px] tracking-widest italic"
                                >
                                    {isLoading ? '...' : 'ВСТУПИТЬ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
