import type { FC } from 'react';
import { usePlayerProfile } from '../hooks/usePlayerProfile';

interface PlayerProfileModalProps {
    userId: number | null;
    onClose: () => void;
}

export const PlayerProfileModal: FC<PlayerProfileModalProps> = ({ userId, onClose }) => {
    const { profile, isLoading, error } = usePlayerProfile(userId);

    if (!userId) return null;

    const gearScore = profile?.profile?.gear_score || (profile?.profile 
        ? Math.max(profile.profile.attack || 0, profile.profile.awakening_attack || 0) + (profile.profile.defense || 0)
        : 0);

    const discordAccount = profile?.linked_accounts?.find(acc => acc.provider === 'discord');

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            <div 
                className="bg-zinc-950 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-zinc-800/50 relative overflow-hidden animate-in fade-in zoom-in duration-300 select-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - 44x44px hit area */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors z-[160]"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic animate-pulse">Загрузка данных...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs italic">{error}</p>
                        <button 
                            onClick={onClose}
                            className="mt-6 text-violet-400 font-black uppercase text-[10px] tracking-widest hover:text-violet-300 transition-colors h-11 px-6 bg-zinc-900 border border-zinc-800/50 rounded-xl"
                        >
                            Закрыть
                        </button>
                    </div>
                ) : profile ? (
                    <div className="relative">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 bg-zinc-900 rounded-full mb-6 flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-800/50 relative shadow-xl">
                                {profile?.linked_accounts?.find(acc => acc.avatar)?.avatar ? (
                                    <img src={profile.linked_accounts.find(acc => acc.avatar)!.avatar!} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black uppercase italic">
                                        {(profile.profile?.family_name || profile.profile?.global_name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter text-center">
                                {profile.profile?.family_name || profile.profile?.global_name || 'Участник'}
                            </h2>
                            {profile.profile?.global_name && (
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.1em] mt-1">
                                    @{profile.profile.global_name}
                                </p>
                            )}
                            {discordAccount && (
                                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800/50 rounded-lg text-zinc-400">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{discordAccount.username}</span>
                                </div>
                            )}
                        </div>

                        {/* Stats Section */}
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800/50 shadow-xl mb-8">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest italic block mb-1">Level / Class</span>
                                    <div className="text-xl font-black italic tracking-tighter text-zinc-100 uppercase">
                                        {profile.profile?.level && <span className="text-violet-500 mr-2">{profile.profile.level}</span>}
                                        {profile.profile?.char_class || 'Unknown'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest italic block mb-1">Gear Score</span>
                                    <div className="text-3xl font-black italic tracking-tighter text-violet-400 leading-none">{gearScore}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/30 text-center">
                                    <div className="text-zinc-500 text-[7px] font-black uppercase tracking-widest mb-1 leading-none">AP</div>
                                    <div className="font-black text-sm italic text-zinc-100">{profile.profile?.attack || 0}</div>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/30 text-center">
                                    <div className="text-zinc-500 text-[7px] font-black uppercase tracking-widest mb-1 leading-none">AAP</div>
                                    <div className="font-black text-sm italic text-zinc-100">{profile.profile?.awakening_attack || 0}</div>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/30 text-center">
                                    <div className="text-zinc-500 text-[7px] font-black uppercase tracking-widest mb-1 leading-none">DP</div>
                                    <div className="font-black text-sm italic text-zinc-100">{profile.profile?.defense || 0}</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black h-11 rounded-xl transition-all uppercase tracking-widest text-[10px] italic border border-zinc-800/50"
                        >
                            Закрыть
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
