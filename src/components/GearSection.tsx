import React, { useState, useRef } from 'react';
import { useGear } from '../hooks/useGear';
import { useAuthStore } from '../store/useAuthStore';

const LABELS = ['Экипировка', 'Инкрустация', 'Световые камни', 'Артефакты', 'Прочее'];

export const GearSection = () => {
    const { user } = useAuthStore();
    const { 
        media, 
        profile, 
        isLoading, 
        isUploading, 
        error, 
        success, 
        uploadMedia, 
        deleteMedia, 
        submitForVerification 
    } = useGear();

    const [selectedLabel, setSelectedLabel] = useState(LABELS[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const success = await uploadMedia(file, selectedLabel);
        if (success && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const membership = user?.guild_memberships?.[0]; // Taking first guild for simplicity as per current TMA logic
    const status = membership?.verification_status || 'incomplete';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30';
            case 'pending':
            case 'updated': return 'text-amber-400 bg-amber-950/20 border-amber-800/30';
            default: return 'text-zinc-500 bg-zinc-950/50 border-zinc-800/50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'verified': return 'Верифицирован';
            case 'pending': return 'На проверке';
            case 'updated': return 'Обновление';
            default: return 'Не подтвержден';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Экипировка (Альбом)</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Загрузите скриншоты для верификации состава</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-wider bg-rose-900/20 text-rose-400 border border-rose-800/30">
                    <span className="text-base">⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-wider bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">
                    <span className="text-base">✅</span>
                    {success}
                </div>
            )}

            {/* Stats Comparison if updated */}
            {(profile?.draft_attack || profile?.draft_awakening_attack || profile?.draft_defense) && (
                <div className="bg-amber-900/10 border border-amber-800/20 rounded-2xl p-6">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 italic">Ожидает подтверждения (изменения):</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">AP</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 line-through text-xs italic">{profile.attack}</span>
                                <span className="text-amber-400 font-extrabold text-sm italic">→ {profile.draft_attack ?? profile.attack}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">AAP</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 line-through text-xs italic">{profile.awakening_attack}</span>
                                <span className="text-amber-400 font-extrabold text-sm italic">→ {profile.draft_awakening_attack ?? profile.awakening_attack}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">DP</span>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 line-through text-xs italic">{profile.defense}</span>
                                <span className="text-amber-400 font-extrabold text-sm italic">→ {profile.draft_defense ?? profile.defense}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800/50">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Тип скриншота</label>
                    <div className="flex flex-wrap gap-2">
                        {LABELS.map(label => (
                            <button
                                key={label}
                                onClick={() => setSelectedLabel(label)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    selectedLabel === label 
                                        ? 'bg-violet-700 border-violet-600 text-white shadow-lg shadow-violet-900/20' 
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-violet-700/50 hover:bg-violet-700/5 transition-all group relative overflow-hidden"
                    >
                        {isUploading ? (
                            <div className="w-8 h-8 border-2 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-violet-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-zinc-300">Нажмите для загрузки</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </button>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center italic">Разрешены форматы PNG, JPG. Макс. размер 5MB.</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Мой Альбом</label>
                    <div className="grid grid-cols-2 gap-4">
                        {media.length === 0 ? (
                            <div className="col-span-2 h-32 bg-zinc-950/30 border border-zinc-800/50 rounded-3xl flex items-center justify-center border-dashed">
                                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Альбом пуст</span>
                            </div>
                        ) : (
                            media.map(m => (
                                <div key={m.id} className="group relative aspect-video bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden">
                                    <img src={m.url} alt={m.label || 'Gear'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    <div className="absolute bottom-2 left-3">
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest drop-shadow-md italic">{m.label}</span>
                                        {m.is_draft && (
                                            <div className="mt-1 px-1.5 py-0.5 bg-amber-500 text-[7px] font-black text-white rounded uppercase tracking-widest w-fit">Draft</div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => deleteMedia(m.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-950/80 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-900 border border-rose-800/30"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-800/50">
                <button
                    onClick={submitForVerification}
                    disabled={isLoading || status === 'pending' || media.length === 0}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-30 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {status === 'pending' || status === 'updated' ? 'Заявка на проверке' : 'Отправить на проверку'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
