import { useState, type FC } from 'react';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { GearHistoryView } from './GearHistoryView';
import Avatar from './ui/Avatar';
import { Modal } from './ui/Modal';

interface PlayerProfileModalProps {
    userId: number | null;
    onClose: () => void;
}

export const PlayerProfileModal: FC<PlayerProfileModalProps> = ({ userId, onClose }) => {
    const { profile, media, isLoading, error } = usePlayerProfile(userId);
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

    if (!userId) return null;

    const gearScore = profile?.profile?.gear_score || (profile?.profile 
        ? Math.max(profile.profile.attack || 0, profile.profile.awakening_attack || 0) + (profile.profile.defense || 0)
        : 0);

    const discordAccount = profile?.linked_accounts?.find(acc => acc.provider === 'discord');

    return (
        <Modal
            isOpen={!!userId}
            onClose={onClose}
            maxWidth="md"
            layer="secondary"
        >
            <div className="-mt-6 -mx-6 mb-6">
                <div className="h-24 bg-gradient-to-br from-violet-600/20 to-zinc-900 border-b border-white/[0.06]" />
            </div>

            <div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-medium text-zinc-500">Загрузка данных...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="text-zinc-400 font-medium text-sm">{error}</p>
                        <button 
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                ) : profile ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center -mt-12">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-zinc-900 shadow-2xl bg-zinc-800 mb-4">
                                <Avatar user={profile} size="xl" className="w-full h-full border-none rounded-none" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {profile.profile?.family_name || 'Участник'}
                            </h2>
                            {profile.profile?.global_name && (
                                <p className="text-xs text-zinc-500 mt-0.5">@{profile.profile.global_name}</p>
                            )}
                            {discordAccount && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Discord: {discordAccount.username}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Tab Buttons */}
                        <div className="flex justify-center">
                            <div className="inline-flex p-1 bg-zinc-950/60 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        activeTab === 'profile'
                                            ? 'text-white bg-violet-600/30 border border-violet-500/30 shadow-md'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    Обзор экипировки
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        activeTab === 'history'
                                            ? 'text-white bg-violet-600/30 border border-violet-500/30 shadow-md'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    История гира
                                </button>
                            </div>
                        </div>

                        {activeTab === 'history' ? (
                            <GearHistoryView userId={userId} isOwner={false} compact={true} />
                        ) : (
                            <>
                                {/* Gear Score Card */}
                                <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Gear Score</p>
                                                {profile.profile?.gear_source === 'garmoth' && (
                                                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[9px] font-bold uppercase tracking-wider">
                                                        Garmoth
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-3xl font-semibold tracking-tight text-violet-400 tabular-nums">{gearScore}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Class</p>
                                            <p className="text-sm font-bold text-zinc-200">{profile.profile?.char_class || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    {profile.profile?.gear_source === 'garmoth' && profile.profile?.garmoth_url && (
                                        <div className="mb-4">
                                            <a
                                                href={profile.profile.garmoth_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium underline underline-offset-4"
                                            >
                                                <span>Профиль Garmoth.com</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'AP', val: profile.profile?.attack || 0 },
                                            { label: 'AAP', val: profile.profile?.awakening_attack || 0 },
                                            { label: 'DP', val: profile.profile?.defense || 0 }
                                        ].map(s => (
                                            <div key={s.label} className="bg-zinc-900/60 border border-white/[0.04] rounded-lg py-2 text-center">
                                                <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-0.5">{s.label}</p>
                                                <p className="text-xs font-semibold text-zinc-300 tabular-nums">{s.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Media Section */}
                                {media && media.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Альбом Гира</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {media.map(m => (
                                                <div key={m.id} className="group relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-white/[0.04] hover:border-violet-500/30 transition-all">
                                                    <img src={m.url} alt={m.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-zinc-950/90 to-transparent">
                                                        <span className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest">{m.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all border border-white/[0.04]"
                        >
                            Закрыть
                        </button>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};
