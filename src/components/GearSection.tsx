import React, { useState, useRef } from 'react';
import { useGear } from '../hooks/useGear';
import { useAuthStore } from '../store/useAuthStore';

const GEAR_BLOCKS = [
    { label: 'crystal', title: 'Инкрустация', example: '/images/crystal.png' },
    { label: 'relic', title: 'Реликвии', example: '/images/relic.png' },
    { label: 'zakalk', title: 'Закалка', example: '/images/zakalk.png' },
    { label: 'gear', title: 'Гир', example: '/images/gear.png' }
];

export const GearSection = () => {
    const { user } = useAuthStore();
    const { 
        media, 
        isLoading, 
        isUploading, 
        error, 
        uploadMedia, 
        deleteMedia, 
        submitForVerification 
    } = useGear();

    const [lightbox, setLightbox] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedLabel) return;
        await uploadMedia(file, selectedLabel);
        setSelectedLabel(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getMediaForLabel = (label: string) => media.find(m => m.label === label);
    const allUploaded = GEAR_BLOCKS.every(block => getMediaForLabel(block.label));
    
    const membership = user?.guild_memberships?.[0];
    const status = membership?.verification_status || 'incomplete';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Верификация Гира</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Добавьте обязательные скриншоты</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${
                    status === 'verified' ? 'text-emerald-400 border-emerald-800/30 bg-emerald-950/20' : 
                    status === 'pending' || status === 'updated' ? 'text-amber-400 border-amber-800/30 bg-amber-950/20' : 
                    'text-zinc-500 border-zinc-800 bg-zinc-950/50'
                }`}>
                    {status === 'verified' ? 'Верифицирован' : status === 'pending' ? 'На проверке' : status === 'updated' ? 'Обновление' : 'Не подтвержден'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {GEAR_BLOCKS.map((block) => {
                    const uploaded = getMediaForLabel(block.label);
                    return (
                        <div key={block.label} className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-white uppercase italic tracking-wider opacity-80">{block.title}</span>
                                <button 
                                    onClick={() => setLightbox(block.example)}
                                    className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 hover:text-violet-400 uppercase tracking-widest transition-colors group/example"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    Посмотреть пример
                                </button>
                            </div>

                            <div className={`relative h-48 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
                                uploaded ? 'border-violet-700/50 bg-zinc-900 shadow-xl shadow-black/20' : 'border-zinc-800/50 border-dashed bg-zinc-950/30'
                            }`}>
                                {uploaded ? (
                                    <>
                                        <img src={uploaded.url} alt="" className="w-full h-full object-cover opacity-60" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity">
                                            <div className="flex gap-2">
                                                <button onClick={() => setLightbox(uploaded.url)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 backdrop-blur-md transition-all">
                                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                </button>
                                                <button onClick={() => deleteMedia(uploaded.id)} className="p-3 bg-rose-500/20 hover:bg-rose-500/40 rounded-2xl border border-rose-500/20 backdrop-blur-md transition-all">
                                                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                        <button 
                                            onClick={() => { setSelectedLabel(block.label); fileInputRef.current?.click(); }}
                                            className="px-6 py-3 bg-violet-700/10 hover:bg-violet-700/20 border border-violet-700/30 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
                                        >
                                            <svg className="w-3.5 h-3.5 group-hover/btn:translate-y-[-1px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Загрузить скриншот
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={submitForVerification}
                disabled={isLoading || !allUploaded}
                className="w-full py-5 bg-violet-700 hover:bg-violet-600 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-violet-900/20 flex items-center justify-center gap-3"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Подать на верификацию
                    </>
                )}
            </button>

            {/* Lightbox */}
            {lightbox && (
                <div 
                    className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 animate-in fade-in duration-300"
                    onClick={() => setLightbox(null)}
                >
                    <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
                    <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
    );
};
