import React, { useState } from 'react';
import type { UserProfile, UserGearMedia } from '../api/types';

interface GearComparisonProps {
    currentProfile: UserProfile;
    currentMedia: UserGearMedia[];
    draftProfile: Partial<UserProfile> | null;
    draftMedia: UserGearMedia[];
}

export const GearComparison: React.FC<GearComparisonProps> = ({ 
    currentProfile, 
    currentMedia, 
    draftProfile, 
    draftMedia 
}) => {
    const [activeTab, setActiveTab] = useState<'current' | 'new'>('new');

    const hasDraft = !!draftProfile || draftMedia.length > 0;

    const StatsGrid = ({ profile, title }: { profile: Partial<UserProfile>, title: string }) => (
        <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">{title}</h4>
            <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">AP</div>
                    <div className="text-xl font-black text-zinc-100 italic">{profile.attack ?? 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">AAP</div>
                    <div className="text-xl font-black text-zinc-100 italic">{profile.awakening_attack ?? 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">DP</div>
                    <div className="text-xl font-black text-zinc-100 italic">{profile.defense ?? 0}</div>
                </div>
            </div>
            <div className="pt-4 border-t border-zinc-800/30 text-center">
                <div className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-1">GS</div>
                <div className="text-2xl font-black text-violet-400 italic">
                    {Math.max(profile.attack ?? 0, profile.awakening_attack ?? 0) + (profile.defense ?? 0)}
                </div>
            </div>
        </div>
    );

    const MediaGallery = ({ media }: { media: UserGearMedia[] }) => (
        <div className="grid grid-cols-2 gap-3">
            {media.length === 0 ? (
                <div className="col-span-2 py-8 text-center bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-800/50">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Нет скриншотов</span>
                </div>
            ) : (
                media.map(m => (
                    <div key={m.id} className="group relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/50">
                        <img src={m.url} alt={m.label || 'Gear'} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-900/80 backdrop-blur-md rounded text-[7px] font-black text-zinc-300 uppercase tracking-widest">
                            {m.label}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (!hasDraft) {
        return (
            <div className="space-y-8">
                <StatsGrid profile={currentProfile} title="Текущий билд" />
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Альбом скриншотов</h4>
                    <MediaGallery media={currentMedia} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Tabs for TMA/Mobile adaptation */}
            <div className="flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800/50">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                        activeTab === 'new' 
                            ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' 
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Новый билд
                </button>
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                        activeTab === 'current' 
                            ? 'bg-zinc-800 text-zinc-100' 
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Текущий билд
                </button>
            </div>

            <div className="animate-in slide-in-from-right-4 duration-300">
                {activeTab === 'new' ? (
                    <div className="space-y-8">
                        <StatsGrid 
                            profile={{
                                attack: draftProfile?.attack ?? currentProfile.attack,
                                awakening_attack: draftProfile?.awakening_attack ?? currentProfile.awakening_attack,
                                defense: draftProfile?.defense ?? currentProfile.defense,
                            }} 
                            title="Предлагаемые изменения" 
                        />
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Новые скриншоты</h4>
                            <MediaGallery media={draftMedia} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <StatsGrid profile={currentProfile} title="Текущий билд" />
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Текущий альбом</h4>
                            <MediaGallery media={currentMedia} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
